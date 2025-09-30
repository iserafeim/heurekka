'use client';

import React, { useState } from 'react';
import { ArrowLeft, Calendar, MapPin, Home, Users, DogIcon, Check } from 'lucide-react';
import { FormInput } from './FormInput';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc/client';
import { cn } from '@/lib/utils';
import { AuthModalHeader } from './AuthModal';

export interface TenantProfileFormProps {
  onBack: () => void;
  onComplete: () => void;
  propertyDetails?: {
    title: string;
    price: number;
    location: string;
    landlordPhone: string;
  };
}

interface TenantProfileData {
  fullName: string;
  phone: string;
  occupation: string;
  budgetMin: number;
  budgetMax: number;
  moveDate: string;
  occupants: string;
  preferredAreas: string[];
  propertyTypes: ('apartment' | 'house' | 'room')[];
  hasPets: boolean;
  petDetails: string;
  hasReferences: boolean;
  messageToLandlords: string;
}

/**
 * Tenant Profile Creation Form
 *
 * Multi-section form for creating tenant profile:
 * - Personal Information
 * - Search Preferences
 * - Additional Information
 */
export function TenantProfileForm({
  onBack,
  onComplete,
  propertyDetails
}: TenantProfileFormProps) {
  const [formData, setFormData] = useState<Partial<TenantProfileData>>({
    propertyTypes: ['apartment'],
    hasPets: false,
    hasReferences: false,
    preferredAreas: []
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newArea, setNewArea] = useState('');

  const createProfileMutation = trpc.tenantProfile.create.useMutation();

  const updateField = <K extends keyof TenantProfileData>(
    field: K,
    value: TenantProfileData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const togglePropertyType = (type: 'apartment' | 'house' | 'room') => {
    const current = formData.propertyTypes || [];
    if (current.includes(type)) {
      updateField('propertyTypes', current.filter((t) => t !== type));
    } else {
      updateField('propertyTypes', [...current, type]);
    }
  };

  const addArea = () => {
    if (newArea.trim() && (formData.preferredAreas?.length || 0) < 5) {
      updateField('preferredAreas', [...(formData.preferredAreas || []), newArea.trim()]);
      setNewArea('');
    }
  };

  const removeArea = (index: number) => {
    updateField(
      'preferredAreas',
      formData.preferredAreas?.filter((_, i) => i !== index) || []
    );
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName || formData.fullName.length < 3) {
      newErrors.fullName = 'El nombre debe tener al menos 3 caracteres';
    }

    if (!formData.phone || !/^[0-9]{4}-[0-9]{4}$/.test(formData.phone)) {
      newErrors.phone = 'Formato inválido (ej: 9999-9999)';
    }

    if (formData.budgetMin && formData.budgetMax && formData.budgetMin > formData.budgetMax) {
      newErrors.budgetMax = 'El máximo debe ser mayor al mínimo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const result = await createProfileMutation.mutateAsync({
        fullName: formData.fullName!,
        phone: formData.phone!,
        occupation: formData.occupation,
        budgetMin: formData.budgetMin,
        budgetMax: formData.budgetMax,
        moveDate: formData.moveDate,
        occupants: formData.occupants,
        preferredAreas: formData.preferredAreas,
        propertyTypes: formData.propertyTypes,
        hasPets: formData.hasPets,
        petDetails: formData.petDetails,
        hasReferences: formData.hasReferences,
        messageToLandlords: formData.messageToLandlords
      });

      if (result.success) {
        // Profile created successfully
        // Generate WhatsApp message and redirect
        onComplete();
      }
    } catch (error: any) {
      setErrors({
        general: error.message || 'Error al crear el perfil'
      });
    }
  };

  const isLoading = createProfileMutation.isLoading;

  return (
    <>
      {/* Header with back button */}
      <div className="flex items-center mb-6">
        <button
          type="button"
          onClick={onBack}
          className="mr-4 p-2 rounded-lg hover:bg-neutral-100 transition-colors"
          aria-label="Volver"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <AuthModalHeader
            title="Completa tu Perfil de Inquilino"
            subtitle="Este perfil se compartirá con los propietarios"
            className="mb-0 text-left"
          />
        </div>
      </div>

      {/* Progress indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-neutral-600 mb-2">
          <span>Paso 2 de 2</span>
          <span>Casi listo</span>
        </div>
        <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
          <div className="h-full bg-primary w-full transition-all duration-300" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {errors.general && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
            {errors.general}
          </div>
        )}

        {/* Personal Information */}
        <section>
          <h3 className="text-lg font-semibold text-neutral-900 mb-4 uppercase text-xs tracking-wider">
            Información Personal
          </h3>

          <div className="space-y-4">
            <FormInput
              label="Nombre Completo"
              value={formData.fullName || ''}
              onChange={(e) => updateField('fullName', e.target.value)}
              error={errors.fullName}
              required
              placeholder="María García"
            />

            <FormInput
              label="Teléfono"
              type="tel"
              value={formData.phone || ''}
              onChange={(e) => {
                // Auto-format phone number
                let value = e.target.value.replace(/\D/g, '');
                if (value.length > 4) {
                  value = value.slice(0, 4) + '-' + value.slice(4, 8);
                }
                updateField('phone', value);
              }}
              error={errors.phone}
              required
              placeholder="9999-9999"
              helperText="Formato: 9999-9999"
            />

            <FormInput
              label="Ocupación"
              value={formData.occupation || ''}
              onChange={(e) => updateField('occupation', e.target.value)}
              placeholder="Ingeniera en Sistemas"
            />
          </div>
        </section>

        {/* Search Preferences */}
        <section>
          <h3 className="text-lg font-semibold text-neutral-900 mb-4 uppercase text-xs tracking-wider">
            Preferencias de Búsqueda
          </h3>

          <div className="space-y-4">
            {/* Budget Range */}
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Presupuesto Mínimo"
                type="number"
                value={formData.budgetMin || ''}
                onChange={(e) => updateField('budgetMin', parseInt(e.target.value) || 0)}
                placeholder="10,000"
                helperText="Lempiras/mes"
              />

              <FormInput
                label="Presupuesto Máximo"
                type="number"
                value={formData.budgetMax || ''}
                onChange={(e) => updateField('budgetMax', parseInt(e.target.value) || 0)}
                error={errors.budgetMax}
                required
                placeholder="20,000"
                helperText="Lempiras/mes"
              />
            </div>

            {/* Move Date */}
            <FormInput
              label="Fecha de Mudanza"
              type="date"
              value={formData.moveDate || ''}
              onChange={(e) => updateField('moveDate', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />

            {/* Occupants */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Número de Ocupantes
              </label>
              <select
                value={formData.occupants || ''}
                onChange={(e) => updateField('occupants', e.target.value)}
                className="flex h-12 w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                <option value="">Seleccionar...</option>
                <option value="1 adulto">1 adulto</option>
                <option value="2 adultos">2 adultos</option>
                <option value="3+ adultos">3+ adultos</option>
                <option value="Familia con niños">Familia con niños</option>
                <option value="Estudiantes">Estudiantes</option>
              </select>
            </div>

            {/* Preferred Areas */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Zonas Preferidas
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newArea}
                  onChange={(e) => setNewArea(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addArea();
                    }
                  }}
                  placeholder="Agregar zona..."
                  className="flex h-12 flex-1 rounded-lg border border-neutral-300 bg-white px-4 py-3 text-base"
                  disabled={(formData.preferredAreas?.length || 0) >= 5}
                />
                <Button
                  type="button"
                  onClick={addArea}
                  variant="secondary"
                  disabled={(formData.preferredAreas?.length || 0) >= 5}
                >
                  Agregar
                </Button>
              </div>
              {formData.preferredAreas && formData.preferredAreas.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.preferredAreas.map((area, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm"
                    >
                      {area}
                      <button
                        type="button"
                        onClick={() => removeArea(index)}
                        className="hover:text-primary-dark"
                        aria-label={`Remover ${area}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <p className="mt-1 text-sm text-neutral-500">
                Máximo 5 zonas
              </p>
            </div>

            {/* Property Types */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-3">
                Tipo de Propiedad
              </label>
              <div className="space-y-2">
                {[
                  { value: 'apartment', label: 'Apartamento' },
                  { value: 'house', label: 'Casa' },
                  { value: 'room', label: 'Habitación' }
                ].map((type) => (
                  <label
                    key={type.value}
                    className="flex items-center gap-3 p-3 rounded-lg border border-neutral-200 hover:bg-neutral-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={formData.propertyTypes?.includes(type.value as any)}
                      onChange={() => togglePropertyType(type.value as any)}
                      className="h-5 w-5 text-primary focus:ring-primary border-neutral-300 rounded"
                    />
                    <span className="text-base text-neutral-900">{type.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Additional Information */}
        <section>
          <h3 className="text-lg font-semibold text-neutral-900 mb-4 uppercase text-xs tracking-wider">
            Información Adicional
          </h3>

          <div className="space-y-4">
            {/* Pets */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-3">
                Mascotas
              </label>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 rounded-lg border border-neutral-200 hover:bg-neutral-50 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    checked={!formData.hasPets}
                    onChange={() => updateField('hasPets', false)}
                    className="h-5 w-5 text-primary focus:ring-primary border-neutral-300"
                  />
                  <span className="text-base text-neutral-900">No tengo mascotas</span>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-lg border border-neutral-200 hover:bg-neutral-50 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    checked={formData.hasPets === true}
                    onChange={() => updateField('hasPets', true)}
                    className="h-5 w-5 text-primary focus:ring-primary border-neutral-300"
                  />
                  <span className="text-base text-neutral-900">Sí, tengo mascotas</span>
                </label>

                {formData.hasPets && (
                  <div className="ml-8">
                    <FormInput
                      label="Detalles de las mascotas"
                      value={formData.petDetails || ''}
                      onChange={(e) => updateField('petDetails', e.target.value)}
                      placeholder="1 perro pequeño"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* References */}
            <label className="flex items-start gap-3 p-3 rounded-lg border border-neutral-200 hover:bg-neutral-50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={formData.hasReferences}
                onChange={(e) => updateField('hasReferences', e.target.checked)}
                className="mt-0.5 h-5 w-5 text-primary focus:ring-primary border-neutral-300 rounded"
              />
              <div>
                <span className="text-base text-neutral-900 block">
                  Puedo proporcionar referencias
                </span>
                <span className="text-sm text-neutral-500">
                  Esto aumenta tus posibilidades de ser contactado
                </span>
              </div>
            </label>

            {/* Message to Landlords */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Mensaje para propietarios (opcional)
              </label>
              <textarea
                value={formData.messageToLandlords || ''}
                onChange={(e) => updateField('messageToLandlords', e.target.value)}
                placeholder="Soy una persona responsable, busco un lugar tranquilo..."
                rows={4}
                maxLength={200}
                className="flex w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-base resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              />
              <p className="mt-1 text-sm text-neutral-500 text-right">
                {formData.messageToLandlords?.length || 0}/200 caracteres
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="pt-6 border-t border-neutral-200">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            loading={isLoading}
            loadingText="Creando perfil..."
          >
            Crear Perfil y Contactar
          </Button>

          <p className="mt-4 text-center text-sm text-neutral-600">
            Al crear tu perfil, este se compartirá con los propietarios que contactes
          </p>
        </div>
      </form>
    </>
  );
}