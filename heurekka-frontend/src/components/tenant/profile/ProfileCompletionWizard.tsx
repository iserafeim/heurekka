/**
 * Profile Completion Wizard
 * Wizard de 3 pasos para completar el perfil de tenant
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateTenantProfile, useUpdateTenantProfile } from '@/hooks/tenant/useTenantProfile';
import { toast } from 'sonner';
import type { ProfileCompletionFormData } from '@/types/tenant';
import { PROPERTY_TYPE_OPTIONS, TEGUCIGALPA_AREAS } from '@/types/tenant';
import { trpc } from '@/lib/trpc/client';

// Schemas de validación por paso
const step1Schema = z.object({
  fullName: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  phone: z.string().regex(/^\d{4}-\d{4}$/, 'Formato: 9999-9999'),
});

const step2Schema = z.object({
  budgetMin: z.number().min(0, 'El presupuesto mínimo debe ser mayor a 0'),
  budgetMax: z.number().min(0, 'El presupuesto máximo debe ser mayor a 0'),
  moveDate: z.string().min(1, 'Selecciona cuándo deseas mudarte'),
  preferredAreas: z.array(z.string()).min(1, 'Selecciona al menos una zona'),
  propertyTypes: z.array(z.string()).min(1, 'Selecciona al menos un tipo de propiedad'),
  hasPets: z.boolean(),
  petDetails: z.string().max(200).optional(),
  desiredBedrooms: z.array(z.number()),
  desiredBathrooms: z.array(z.number()).min(1, 'Selecciona al menos un número de baños'),
  desiredParkingSpaces: z.array(z.number()).min(1, 'Selecciona al menos un número de parqueos'),
}).refine((data) => data.budgetMax >= data.budgetMin, {
  message: 'El presupuesto máximo debe ser mayor o igual al mínimo',
  path: ['budgetMax'],
}).refine((data) => !data.hasPets || (data.hasPets && data.petDetails && data.petDetails.trim().length > 0), {
  message: 'Describe tus mascotas',
  path: ['petDetails'],
}).refine((data) => data.propertyTypes.includes('room') || data.desiredBedrooms.length >= 1, {
  message: 'Selecciona al menos un número de habitaciones',
  path: ['desiredBedrooms'],
});

const step3Schema = z.object({
  messageToLandlords: z.string().max(500).optional(),
});

interface ProfileCompletionWizardProps {
  onComplete?: () => void;
  onCancel?: () => void;
}

export function ProfileCompletionWizard({
  onComplete,
  onCancel,
}: ProfileCompletionWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<ProfileCompletionFormData>>({});
  const router = useRouter();

  const createProfile = useCreateTenantProfile();
  const updateProfile = useUpdateTenantProfile();
  const trackContactMutation = trpc.property.trackContact.useMutation();

  const steps = [
    {
      number: 1,
      title: 'Información Personal',
      subtitle: 'Solo te tomará 2 minutos y podrás contactar propiedades más rápido'
    },
    {
      number: 2,
      title: 'Preferencias de Búsqueda',
      subtitle: 'Ayúdanos a encontrar la propiedad perfecta para ti'
    },
    {
      number: 3,
      title: 'Detalles Opcionales',
      subtitle: 'Esta información ayuda a los propietarios a conocerte mejor'
    },
  ];

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepComplete = (stepData: any) => {
    setFormData({ ...formData, ...stepData });

    if (currentStep < 3) {
      handleNext();
    } else {
      handleFinalSubmit({ ...formData, ...stepData });
    }
  };

  const handleFinalSubmit = async (data: any) => {
    try {
      // Flatten nested data structure for backend
      const flattenedData = {
        ...data.personalInfo,
        ...data.searchPreferences,
        ...data.optionalInfo,
      };

      await createProfile.mutateAsync(flattenedData);
      toast.success('¡Perfil completado exitosamente!');

      // Check if there's a pending contact from WhatsApp button click
      const pendingContactStr = localStorage.getItem('pendingContact');
      if (pendingContactStr) {
        try {
          const pendingContact = JSON.parse(pendingContactStr);
          const { propertyId, landlordPhone, timestamp } = pendingContact;

          // Check if the pending contact is recent (within 1 hour)
          const isRecent = Date.now() - timestamp < 60 * 60 * 1000;

          if (isRecent && propertyId) {
            // Call trackContact mutation to create the lead
            await trackContactMutation.mutateAsync({
              propertyId,
              source: 'modal',
              contactMethod: 'whatsapp',
              success: true,
            });

            // Clear the pending contact
            localStorage.removeItem('pendingContact');

            // Open WhatsApp with landlord's phone number
            if (landlordPhone) {
              const cleanPhone = landlordPhone.replace(/[^0-9]/g, '');
              const whatsappUrl = `https://wa.me/${cleanPhone}`;
              window.open(whatsappUrl, '_blank');
              toast.success('Lead creado. Abriendo WhatsApp...');
            }
          } else {
            // Expired or invalid, just clear it
            localStorage.removeItem('pendingContact');
          }
        } catch (contactError) {
          console.error('Error creating lead or opening WhatsApp:', contactError);
          // Don't show error to user, just log it
          // Clear the pending contact anyway
          localStorage.removeItem('pendingContact');
        }
      }

      onComplete?.();
      router.push('/tenant/dashboard');
    } catch (error) {
      toast.error('Error al crear el perfil');
      console.error(error);
    }
  };

  const currentStepData = steps.find(s => s.number === currentStep);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {currentStepData?.title}
          </h1>
          <p className="text-gray-600">
            {currentStepData?.subtitle}
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className={`
                h-1.5 rounded-full transition-all duration-300
                ${
                  index === currentStep - 1
                    ? 'bg-blue-600 w-12' // Active: longer and blue
                    : index < currentStep - 1
                    ? 'bg-blue-400 w-8' // Completed: medium blue
                    : 'bg-gray-300 w-8' // Pending: gray
                }
              `}
              aria-label={`Paso ${index + 1}${index === currentStep - 1 ? ' (actual)' : index < currentStep - 1 ? ' (completado)' : ''}`}
            />
          ))}
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6 md:p-8">
        {currentStep === 1 && (
          <Step1PersonalInfo onNext={handleStepComplete} initialData={formData} />
        )}
        {currentStep === 2 && (
          <Step2SearchPreferences onNext={handleStepComplete} onBack={handleBack} initialData={formData} />
        )}
        {currentStep === 3 && (
          <Step3OptionalDetails onNext={handleStepComplete} onBack={handleBack} onSkip={() => handleFinalSubmit(formData)} initialData={formData} />
        )}
        </div>

        {/* Cancel Button */}
        {onCancel && (
          <div className="text-center">
            <button
              onClick={onCancel}
              className="text-sm text-gray-600 hover:text-blue-600 transition-colors font-medium"
            >
              Completar Después
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Step 1: Personal Info
function Step1PersonalInfo({ onNext, initialData }: any) {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(step1Schema),
    defaultValues: initialData?.personalInfo || {},
  });

  const formatPhoneNumber = (value: string) => {
    // Remove all non-numeric characters
    const numbers = value.replace(/\D/g, '');

    // Limit to 8 digits
    const limited = numbers.slice(0, 8);

    // Add hyphen after 4 digits
    if (limited.length > 4) {
      return `${limited.slice(0, 4)}-${limited.slice(4)}`;
    }

    return limited;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setValue('phone', formatted);
    e.target.value = formatted;
  };

  return (
    <form onSubmit={handleSubmit((data) => onNext({ personalInfo: data }))} className="space-y-6">
      <div className="space-y-6">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
            Nombre Completo <span className="text-red-500">*</span>
          </label>
          <Input
            id="fullName"
            {...register('fullName')}
            placeholder="Juan Pérez"
            className={`h-12 ${errors.fullName ? 'border-red-500' : ''}`}
          />
          {errors.fullName && (
            <p className="text-xs text-red-600 mt-2">{errors.fullName.message as string}</p>
          )}
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            Teléfono <span className="text-red-500">*</span>
          </label>
          <Input
            id="phone"
            {...register('phone')}
            onChange={handlePhoneChange}
            placeholder="9999-9999"
            className={`h-12 ${errors.phone ? 'border-red-500' : ''}`}
            maxLength={9}
          />
          {errors.phone && (
            <p className="text-xs text-red-600 mt-2">{errors.phone.message as string}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          className="
            bg-blue-600 hover:bg-blue-700 active:bg-blue-800
            text-white px-8 py-3 h-12
            rounded-xl font-semibold
            shadow-md hover:shadow-lg active:shadow-sm
            transform hover:-translate-y-0.5 active:translate-y-0
            transition-all duration-200
            flex items-center justify-center gap-2
          "
        >
          Continuar
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}

// Step 2: Search Preferences
function Step2SearchPreferences({ onNext, onBack, initialData }: any) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(step2Schema),
    defaultValues: initialData?.searchPreferences || {
      budgetMin: 5000,
      budgetMax: 15000,
      moveDate: '',
      preferredAreas: [],
      propertyTypes: [],
      hasPets: false,
      petDetails: '',
      desiredBedrooms: [],
      desiredBathrooms: [],
      desiredParkingSpaces: [],
    },
  });

  const budgetMin = watch('budgetMin') || 5000;
  const budgetMax = watch('budgetMax') || 15000;
  const selectedAreas = watch('preferredAreas') || [];
  const selectedTypes = watch('propertyTypes') || [];
  const hasPets = watch('hasPets');
  const desiredBedrooms = watch('desiredBedrooms') || [];
  const desiredBathrooms = watch('desiredBathrooms') || [];
  const desiredParkingSpaces = watch('desiredParkingSpaces') || [];

  const handleMoveDateChange = (value: string) => {
    setValue('moveDate', value);
  };

  const handleBudgetChange = (values: number[]) => {
    setValue('budgetMin', values[0]);
    setValue('budgetMax', values[1]);
  };

  const toggleArea = (area: string) => {
    const current = selectedAreas;
    const updated = current.includes(area)
      ? current.filter((a: string) => a !== area)
      : [...current, area];
    setValue('preferredAreas', updated);
  };

  const togglePropertyType = (type: string) => {
    const current = selectedTypes;
    const updated = current.includes(type)
      ? current.filter((t: string) => t !== type)
      : [...current, type];
    setValue('propertyTypes', updated);
  };

  const toggleBedroom = (count: number) => {
    const current = desiredBedrooms;
    const updated = current.includes(count)
      ? current.filter((n: number) => n !== count)
      : [...current, count];
    setValue('desiredBedrooms', updated);
  };

  const toggleBathroom = (count: number) => {
    const current = desiredBathrooms;
    const updated = current.includes(count)
      ? current.filter((n: number) => n !== count)
      : [...current, count];
    setValue('desiredBathrooms', updated);
  };

  const toggleParkingSpace = (count: number) => {
    const current = desiredParkingSpaces;
    const updated = current.includes(count)
      ? current.filter((n: number) => n !== count)
      : [...current, count];
    setValue('desiredParkingSpaces', updated);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-HN', {
      style: 'currency',
      currency: 'HNL',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <form onSubmit={handleSubmit((data) => onNext({ searchPreferences: data }))} className="space-y-6">
      <div className="space-y-6">
        {/* Budget Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Presupuesto Mensual <span className="text-red-500">*</span>
          </label>
          <div className="space-y-4">
            {/* Budget Display Cards */}
            <div className="grid grid-cols-2 gap-3 mb-2">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <span className="text-xs text-gray-700 block mb-1">Mínimo</span>
                <span className="text-lg text-gray-900">
                  {formatCurrency(budgetMin)}
                </span>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <span className="text-xs text-gray-700 block mb-1">Máximo</span>
                <span className="text-lg text-gray-900">
                  {formatCurrency(budgetMax)}
                </span>
              </div>
            </div>

            <Slider
              min={1000}
              max={50000}
              step={500}
              value={[budgetMin, budgetMax]}
              onValueChange={handleBudgetChange}
              className="w-full"
            />

            {/* Range Labels */}
            <div className="flex justify-between text-xs text-gray-700">
              <span>L 1,000</span>
              <span>L 50,000</span>
            </div>

            {/* Hidden inputs for form validation */}
            <input type="hidden" {...register('budgetMin', { valueAsNumber: true })} />
            <input type="hidden" {...register('budgetMax', { valueAsNumber: true })} />
          </div>
          {errors.budgetMax && (
            <p className="text-sm text-red-600 mt-2">{errors.budgetMax.message as string}</p>
          )}
        </div>

        {/* Move Date */}
        <div>
          <label htmlFor="moveDate" className="block text-sm font-medium text-gray-700 mb-1">
            ¿Cuándo deseas mudarte? <span className="text-red-500">*</span>
          </label>
          <Select onValueChange={handleMoveDateChange}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona el periodo aproximado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Menos de 1 mes">Menos de 1 mes</SelectItem>
              <SelectItem value="1-3 meses">1-3 meses</SelectItem>
              <SelectItem value="3-6 meses">3-6 meses</SelectItem>
              <SelectItem value="Más de 6 meses">Más de 6 meses</SelectItem>
              <SelectItem value="Flexible">Flexible</SelectItem>
            </SelectContent>
          </Select>
          <input type="hidden" {...register('moveDate')} />
          {errors.moveDate && (
            <p className="text-sm text-red-600 mt-1">{errors.moveDate.message as string}</p>
          )}
        </div>

        {/* Preferred Areas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Zonas Preferidas <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
            {TEGUCIGALPA_AREAS.map((area) => (
              <button
                key={area}
                type="button"
                onClick={() => toggleArea(area)}
                className={`
                  px-4 py-3 rounded-lg text-sm text-left transition-all
                  min-h-[48px] flex items-center
                  ${
                    selectedAreas.includes(area)
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
                  }
                `}
              >
                {area}
              </button>
            ))}
          </div>
          <input type="hidden" {...register('preferredAreas')} />
          {errors.preferredAreas && (
            <p className="text-sm text-red-600 mt-2">{errors.preferredAreas.message as string}</p>
          )}
          <p className="text-xs text-gray-500 mt-2">
            Seleccionadas: {selectedAreas.length}
          </p>
        </div>

        {/* Property Types */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Tipos de Propiedad <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {PROPERTY_TYPE_OPTIONS.filter(t => ['apartment', 'house', 'room'].includes(t.value)).map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => togglePropertyType(type.value)}
                className={`
                  relative p-4 rounded-xl border-2 text-left transition-all duration-200
                  hover:shadow-md active:scale-[0.98]
                  min-h-[100px] flex flex-col
                  ${
                    selectedTypes.includes(type.value)
                      ? 'border-blue-600 bg-blue-50 shadow-md shadow-blue-600/10'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }
                `}
              >
                {/* Checkmark indicator */}
                {selectedTypes.includes(type.value) && (
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                )}

                <span className="text-3xl mb-2">{type.icon}</span>
                <span className={`text-sm font-semibold ${
                  selectedTypes.includes(type.value) ? 'text-blue-700' : 'text-gray-700'
                }`}>
                  {type.label}
                </span>
              </button>
            ))}
          </div>
          <input type="hidden" {...register('propertyTypes')} />
          {errors.propertyTypes && (
            <p className="text-sm text-red-600 mt-2">{errors.propertyTypes.message as string}</p>
          )}
        </div>

        {/* Has Pets */}
        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
          <Switch
            id="hasPets"
            checked={hasPets}
            onCheckedChange={(checked) => setValue('hasPets', checked)}
          />
          <div className="flex-1">
            <label htmlFor="hasPets" className="block text-sm font-medium text-gray-700 cursor-pointer">
              Tengo mascotas
            </label>
            <p className="text-xs text-gray-600 mt-1">
              Activa esta opción si tienes o planeas tener mascotas
            </p>
          </div>
        </div>

        {/* Pet Details (conditional) */}
        {hasPets && (
          <div className="ml-4 pl-4 border-l-2 border-blue-600">
            <label htmlFor="petDetails" className="block text-sm font-medium text-gray-700 mb-2">
              Detalles sobre tus mascotas <span className="text-red-500">*</span>
            </label>
            <Textarea
              id="petDetails"
              {...register('petDetails')}
              placeholder="Ej: 1 perro pequeño, bien entrenado y tranquilo"
              rows={3}
              className={errors.petDetails ? 'border-red-500' : ''}
            />
            {errors.petDetails && (
              <p className="text-xs text-red-600 mt-2">{errors.petDetails.message as string}</p>
            )}
            <p className="text-xs text-gray-500 mt-2">
              Describe tus mascotas: tipo, cantidad, tamaño, temperamento
            </p>
          </div>
        )}

        {/* Desired Bedrooms (only if NOT looking for a room) */}
        {!selectedTypes.includes('room') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Número de Habitaciones <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => toggleBedroom(count)}
                  className={`
                    px-4 py-3 rounded-lg border-2 text-center transition-all
                    min-h-[48px] flex items-center justify-center
                    font-semibold
                    ${
                      desiredBedrooms.includes(count)
                        ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                    }
                  `}
                >
                  {count === 5 ? '5+' : count}
                </button>
              ))}
            </div>
            <input type="hidden" {...register('desiredBedrooms')} />
            {errors.desiredBedrooms && (
              <p className="text-sm text-red-600 mt-2">{errors.desiredBedrooms.message as string}</p>
            )}
            <p className="text-xs text-gray-500 mt-2">
              Puedes seleccionar múltiples opciones
            </p>
          </div>
        )}

        {/* Desired Bathrooms */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Número de Baños <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => toggleBathroom(count)}
                className={`
                  px-4 py-3 rounded-lg border-2 text-center transition-all
                  min-h-[48px] flex items-center justify-center
                  font-semibold
                  ${
                    desiredBathrooms.includes(count)
                      ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                  }
                `}
              >
                {count === 4 ? '4+' : count}
              </button>
            ))}
          </div>
          <input type="hidden" {...register('desiredBathrooms')} />
          {errors.desiredBathrooms && (
            <p className="text-sm text-red-600 mt-2">{errors.desiredBathrooms.message as string}</p>
          )}
          <p className="text-xs text-gray-500 mt-2">
            Puedes seleccionar múltiples opciones
          </p>
        </div>

        {/* Desired Parking Spaces */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Número de Parqueos <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[0, 1, 2, 3].map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => toggleParkingSpace(count)}
                className={`
                  px-4 py-3 rounded-lg border-2 text-center transition-all
                  min-h-[48px] flex items-center justify-center
                  font-semibold
                  ${
                    desiredParkingSpaces.includes(count)
                      ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                  }
                `}
              >
                {count === 3 ? '3+' : count}
              </button>
            ))}
          </div>
          <input type="hidden" {...register('desiredParkingSpaces')} />
          {errors.desiredParkingSpaces && (
            <p className="text-sm text-red-600 mt-2">{errors.desiredParkingSpaces.message as string}</p>
          )}
          <p className="text-xs text-gray-500 mt-2">
            Puedes seleccionar múltiples opciones
          </p>
        </div>
      </div>

      <div className="flex justify-between pt-4 gap-3">
        <Button
          type="button"
          onClick={onBack}
          variant="outline"
          className="
            border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50
            px-6 py-3 h-12
            rounded-xl font-semibold
            transition-all duration-200
            flex items-center gap-2
          "
        >
          <ArrowLeft className="h-4 w-4" />
          Atrás
        </Button>
        <Button
          type="submit"
          className="
            bg-blue-600 hover:bg-blue-700 active:bg-blue-800
            text-white px-8 py-3 h-12
            rounded-xl font-semibold
            shadow-md hover:shadow-lg active:shadow-sm
            transform hover:-translate-y-0.5 active:translate-y-0
            transition-all duration-200
            flex items-center justify-center gap-2
          "
        >
          Continuar
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}

// Step 3: Optional Details
function Step3OptionalDetails({ onNext, onBack, onSkip, initialData }: any) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(step3Schema),
    defaultValues: initialData?.optionalInfo || {
      messageToLandlords: '',
    },
  });

  return (
    <form onSubmit={handleSubmit((data) => onNext({ optionalInfo: data }))} className="space-y-6">
      <div className="space-y-6">
        {/* Message to Landlords */}
        <div>
          <label htmlFor="messageToLandlords" className="block text-sm font-medium text-gray-700 mb-1">
            Mensaje para propietarios (Opcional)
          </label>
          <Textarea
            id="messageToLandlords"
            {...register('messageToLandlords')}
            placeholder="Cuéntale a los propietarios sobre ti, tu estilo de vida y qué tipo de inquilino eres..."
            rows={6}
            className="resize-none"
          />
          {errors.messageToLandlords && (
            <p className="text-sm text-red-600 mt-1">{errors.messageToLandlords.message as string}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Una breve presentación personal que los propietarios verán en tu perfil
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between pt-4 gap-3">
        <Button
          type="button"
          onClick={onBack}
          variant="outline"
          className="
            border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50
            px-6 py-3 h-12
            rounded-xl font-semibold
            transition-all duration-200
            flex items-center justify-center gap-2
          "
        >
          <ArrowLeft className="h-4 w-4" />
          Atrás
        </Button>
        <div className="flex gap-2">
          <Button
            type="button"
            onClick={onSkip}
            variant="ghost"
            className="
              hover:bg-gray-100
              px-4 py-3 h-12
              rounded-xl font-medium
              transition-all duration-200
            "
          >
            Omitir
          </Button>
          <Button
            type="submit"
            className="
              bg-gradient-to-r from-green-600 to-emerald-600
              hover:from-green-700 hover:to-emerald-700
              text-white px-8 py-3 h-12
              rounded-xl font-semibold
              shadow-lg shadow-green-600/30 hover:shadow-xl hover:shadow-green-600/40
              transform hover:-translate-y-0.5 hover:scale-105
              active:translate-y-0 active:scale-100
              transition-all duration-300
              flex items-center justify-center gap-2
            "
          >
            <Check className="h-5 w-5" />
            Completar Perfil
          </Button>
        </div>
      </div>
    </form>
  );
}
