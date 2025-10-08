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

// Schemas de validación por paso
const step1Schema = z.object({
  fullName: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  phone: z.string().regex(/^\d{4}-\d{4}$/, 'Formato: 9999-9999'),
});

const step2Schema = z.object({
  budgetMin: z.number().min(0, 'El presupuesto mínimo debe ser mayor a 0'),
  budgetMax: z.number().min(0, 'El presupuesto máximo debe ser mayor a 0'),
  moveDate: z.string().optional(),
  preferredAreas: z.array(z.string()).min(1, 'Selecciona al menos una zona'),
  propertyTypes: z.array(z.string()).min(1, 'Selecciona al menos un tipo de propiedad'),
}).refine((data) => data.budgetMax >= data.budgetMin, {
  message: 'El presupuesto máximo debe ser mayor o igual al mínimo',
  path: ['budgetMax'],
});

const step3Schema = z.object({
  occupation: z.string().optional(),
  occupants: z.string().optional(),
  hasPets: z.boolean().default(false),
  petDetails: z.string().optional(),
  hasReferences: z.boolean().default(false),
  messageToLandlords: z.string().optional(),
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

  const steps = [
    { number: 1, title: 'Información Personal', description: 'Datos de contacto' },
    { number: 2, title: 'Preferencias de Búsqueda', description: 'Presupuesto y zonas' },
    { number: 3, title: 'Detalles Opcionales', description: 'Mejora tu perfil' },
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
      onComplete?.();
      router.push('/tenant/dashboard');
    } catch (error) {
      toast.error('Error al crear el perfil');
      console.error(error);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              <div className="flex flex-col items-center">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold
                    transition-all duration-200
                    ${
                      step.number < currentStep
                        ? 'bg-green-600 text-white'
                        : step.number === currentStep
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }
                  `}
                >
                  {step.number < currentStep ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    step.number
                  )}
                </div>
                <div className="mt-2 text-center">
                  <p className="text-sm font-medium text-gray-900">{step.title}</p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`
                    flex-1 h-1 mx-4 rounded-full
                    ${step.number < currentStep ? 'bg-green-600' : 'bg-gray-200'}
                  `}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
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
        <div className="mt-4 text-center">
          <button
            onClick={onCancel}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Completar Después
          </button>
        </div>
      )}
    </div>
  );
}

// Step 1: Personal Info
function Step1PersonalInfo({ onNext, initialData }: any) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(step1Schema),
    defaultValues: initialData?.personalInfo || {},
  });

  return (
    <form onSubmit={handleSubmit((data) => onNext({ personalInfo: data }))} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Información Personal
        </h3>

        <div className="space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre Completo <span className="text-red-500">*</span>
            </label>
            <Input
              id="fullName"
              {...register('fullName')}
              placeholder="Juan Pérez"
              className={errors.fullName ? 'border-red-500' : ''}
            />
            {errors.fullName && (
              <p className="text-sm text-red-600 mt-1">{errors.fullName.message as string}</p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono <span className="text-red-500">*</span>
            </label>
            <Input
              id="phone"
              {...register('phone')}
              placeholder="9999-9999"
              className={errors.phone ? 'border-red-500' : ''}
            />
            {errors.phone && (
              <p className="text-sm text-red-600 mt-1">{errors.phone.message as string}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" className="flex items-center gap-2">
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
    },
  });

  const budgetMin = watch('budgetMin') || 5000;
  const budgetMax = watch('budgetMax') || 15000;
  const selectedAreas = watch('preferredAreas') || [];
  const selectedTypes = watch('propertyTypes') || [];

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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-HN', {
      style: 'currency',
      currency: 'HNL',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <form onSubmit={handleSubmit((data) => onNext({ searchPreferences: data }))} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Preferencias de Búsqueda
        </h3>

        <div className="space-y-6">
          {/* Budget Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Presupuesto Mensual <span className="text-red-500">*</span>
            </label>
            <div className="space-y-4">
              <div className="flex justify-between text-sm text-gray-600">
                <span>{formatCurrency(budgetMin)}</span>
                <span>{formatCurrency(budgetMax)}</span>
              </div>
              <Slider
                min={1000}
                max={50000}
                step={500}
                value={[budgetMin, budgetMax]}
                onValueChange={handleBudgetChange}
                className="w-full"
              />
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
              Fecha de Mudanza (Opcional)
            </label>
            <Input
              id="moveDate"
              type="date"
              {...register('moveDate')}
              min={new Date().toISOString().split('T')[0]}
            />
            <p className="text-xs text-gray-500 mt-1">
              ¿Cuándo te gustaría mudarte?
            </p>
          </div>

          {/* Preferred Areas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Zonas Preferidas <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
              {TEGUCIGALPA_AREAS.map((area) => (
                <button
                  key={area}
                  type="button"
                  onClick={() => toggleArea(area)}
                  className={`
                    px-3 py-2 rounded-md text-sm text-left transition-all
                    ${
                      selectedAreas.includes(area)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                    p-4 rounded-lg border-2 text-left transition-all
                    ${
                      selectedTypes.includes(type.value)
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <span className="text-2xl mb-2 block">{type.icon}</span>
                  <span className="text-sm font-medium text-gray-900">{type.label}</span>
                </button>
              ))}
            </div>
            <input type="hidden" {...register('propertyTypes')} />
            {errors.propertyTypes && (
              <p className="text-sm text-red-600 mt-2">{errors.propertyTypes.message as string}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button type="button" onClick={onBack} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Atrás
        </Button>
        <Button type="submit">
          Continuar
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </form>
  );
}

// Step 3: Optional Details
function Step3OptionalDetails({ onNext, onBack, onSkip, initialData }: any) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(step3Schema),
    defaultValues: initialData?.optionalInfo || {
      occupation: '',
      occupants: '',
      hasPets: false,
      petDetails: '',
      hasReferences: false,
      messageToLandlords: '',
    },
  });

  const hasPets = watch('hasPets');

  return (
    <form onSubmit={handleSubmit((data) => onNext({ optionalInfo: data }))} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Información Opcional
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Esta información ayuda a los propietarios a conocerte mejor
        </p>

        <div className="space-y-6">
          {/* Occupation */}
          <div>
            <label htmlFor="occupation" className="block text-sm font-medium text-gray-700 mb-1">
              Ocupación
            </label>
            <Input
              id="occupation"
              {...register('occupation')}
              placeholder="Ej: Ingeniero, Estudiante, Médico"
            />
            <p className="text-xs text-gray-500 mt-1">
              Tu profesión u ocupación actual
            </p>
          </div>

          {/* Occupants */}
          <div>
            <label htmlFor="occupants" className="block text-sm font-medium text-gray-700 mb-1">
              Número de Ocupantes
            </label>
            <Select
              onValueChange={(value) => setValue('occupants', value)}
              defaultValue={initialData?.optionalInfo?.occupants || ''}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el número de personas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Solo yo</SelectItem>
                <SelectItem value="2">2 personas</SelectItem>
                <SelectItem value="3-4">3-4 personas</SelectItem>
                <SelectItem value="5+">5 o más personas</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              ¿Cuántas personas vivirán en la propiedad?
            </p>
          </div>

          {/* Has Pets */}
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
            <Switch
              id="hasPets"
              checked={hasPets}
              onCheckedChange={(checked) => setValue('hasPets', checked)}
            />
            <div className="flex-1">
              <label htmlFor="hasPets" className="block text-sm font-medium text-gray-900 cursor-pointer">
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
              <label htmlFor="petDetails" className="block text-sm font-medium text-gray-700 mb-1">
                Detalles sobre tus mascotas
              </label>
              <Textarea
                id="petDetails"
                {...register('petDetails')}
                placeholder="Ej: 1 perro pequeño, bien entrenado y tranquilo"
                rows={3}
              />
              <p className="text-xs text-gray-500 mt-1">
                Describe tus mascotas: tipo, cantidad, tamaño, temperamento
              </p>
            </div>
          )}

          {/* Has References */}
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
            <Switch
              id="hasReferences"
              {...register('hasReferences')}
            />
            <div className="flex-1">
              <label htmlFor="hasReferences" className="block text-sm font-medium text-gray-900 cursor-pointer">
                Tengo referencias de arrendadores anteriores
              </label>
              <p className="text-xs text-gray-600 mt-1">
                Esto puede mejorar tus probabilidades de aprobación
              </p>
            </div>
          </div>

          {/* Message to Landlords */}
          <div>
            <label htmlFor="messageToLandlords" className="block text-sm font-medium text-gray-700 mb-1">
              Mensaje para propietarios (Opcional)
            </label>
            <Textarea
              id="messageToLandlords"
              {...register('messageToLandlords')}
              placeholder="Cuéntale a los propietarios sobre ti, tu estilo de vida y qué tipo de inquilino eres..."
              rows={4}
            />
            <p className="text-xs text-gray-500 mt-1">
              Una breve presentación personal que los propietarios verán en tu perfil
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button type="button" onClick={onBack} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Atrás
        </Button>
        <div className="flex gap-2">
          <Button type="button" onClick={onSkip} variant="ghost">
            Omitir
          </Button>
          <Button type="submit" className="bg-green-600 hover:bg-green-700">
            Completar Perfil
            <Check className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </form>
  );
}
