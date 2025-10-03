'use client';

/**
 * RealEstateAgentForm Component
 * Formulario para agentes inmobiliarios
 */

import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { realEstateAgentSchema, type RealEstateAgentInput } from '@/schemas/landlord/realEstateAgent.schema';
import { FormField } from './FormField';
import { Input } from '@/components/ui/input';
import { PhoneInput } from '@/components/ui/phone-input';
import { cn } from '@/lib/utils';
import {
  HONDURAS_CITIES,
  YEARS_EXPERIENCE_OPTIONS,
  SPECIALIZATIONS_OPTIONS,
  AGENT_TYPE_OPTIONS,
} from '@/types/landlord';

interface RealEstateAgentFormProps {
  onSubmit: (data: RealEstateAgentInput) => void;
  defaultValues?: Partial<RealEstateAgentInput>;
  onChange?: (data: Partial<RealEstateAgentInput>) => void;
}

export function RealEstateAgentForm({
  onSubmit,
  defaultValues,
  onChange,
}: RealEstateAgentFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<RealEstateAgentInput>({
    resolver: zodResolver(realEstateAgentSchema),
    defaultValues: defaultValues || {
      professionalName: '',
      phone: '',
      whatsappNumber: '',
      agentType: 'independent',
      companyName: '',
      yearsOfExperience: '1-3',
      licenseNumber: '',
      specializations: [],
      coverageAreas: [],
      propertiesManaged: '1-5',
      credentialsUrl: '',
      facebook: '',
      instagram: '',
      professionalBio: '',
    },
    mode: 'onChange',
  });

  const formValues = watch();
  const agentType = watch('agentType');
  const [selectedCoverageAreas, setSelectedCoverageAreas] = useState<string[]>(defaultValues?.coverageAreas || []);

  // Auto-save con debounce local
  useEffect(() => {
    if (!onChange) return;

    const timeoutId = setTimeout(() => {
      onChange(formValues);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [formValues]); // NO incluir onChange en dependencias

  const toggleCoverageArea = (city: string) => {
    const newAreas = selectedCoverageAreas.includes(city)
      ? selectedCoverageAreas.filter(c => c !== city)
      : [...selectedCoverageAreas, city];

    setSelectedCoverageAreas(newAreas);
    setValue('coverageAreas', newAreas, { shouldValidate: true });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      {/* Nombre Profesional */}
      <FormField
        label="Nombre Profesional"
        required
        error={errors.professionalName?.message}
      >
        <Input
          {...register('professionalName')}
          placeholder="Lic. María González"
          className={cn(errors.professionalName && 'border-red-300')}
        />
      </FormField>

      {/* Tipo de Agente */}
      <FormField
        label="Tipo de Agente"
        required
        error={errors.agentType?.message}
      >
        <div className="flex gap-3">
          {AGENT_TYPE_OPTIONS.map(option => (
            <label
              key={option.value}
              className={cn(
                'flex-1 cursor-pointer rounded-lg border-2 transition-all p-4 text-center',
                'hover:border-blue-300',
                agentType === option.value
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200'
              )}
            >
              <input
                type="radio"
                {...register('agentType')}
                value={option.value}
                className="sr-only"
              />
              <span className={cn(
                'font-medium',
                agentType === option.value ? 'text-blue-700' : 'text-gray-700'
              )}>
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </FormField>

      {/* Nombre de Empresa (condicional) */}
      {agentType === 'agency_agent' && (
        <FormField
          label="Nombre de la Empresa"
          error={errors.companyName?.message}
        >
          <Input
            {...register('companyName')}
            placeholder="Century 21 Honduras"
            className={cn(errors.companyName && 'border-red-300')}
          />
        </FormField>
      )}

      {/* Teléfono */}
      <FormField
        label="Teléfono de Contacto"
        required
        error={errors.phone?.message}
      >
        <PhoneInput
          value={watch('phone')}
          onChange={(value) => setValue('phone', value, { shouldValidate: true })}
          className={cn(errors.phone && 'border-red-300')}
        />
      </FormField>

      {/* WhatsApp */}
      <FormField
        label="WhatsApp Profesional"
        required
        error={errors.whatsappNumber?.message}
      >
        <PhoneInput
          value={watch('whatsappNumber')}
          onChange={(value) => setValue('whatsappNumber', value, { shouldValidate: true })}
          className={cn(errors.whatsappNumber && 'border-red-300')}
        />
      </FormField>

      {/* Años de Experiencia */}
      <FormField
        label="Años de Experiencia"
        required
        error={errors.yearsOfExperience?.message}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {YEARS_EXPERIENCE_OPTIONS.map(option => (
            <label
              key={option.value}
              className={cn(
                'cursor-pointer rounded-lg border-2 transition-all p-3 text-center',
                'hover:border-blue-300',
                formValues.yearsOfExperience === option.value
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200'
              )}
            >
              <input
                type="radio"
                {...register('yearsOfExperience')}
                value={option.value}
                className="sr-only"
              />
              <span className={cn(
                'text-sm font-medium',
                formValues.yearsOfExperience === option.value
                  ? 'text-blue-700'
                  : 'text-gray-700'
              )}>
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </FormField>

      {/* Número de Licencia */}
      <FormField
        label="Número de Licencia AHCI"
        error={errors.licenseNumber?.message}
        helperText="Formato: AHCI-12345"
      >
        <Input
          {...register('licenseNumber')}
          placeholder="AHCI-12345"
          className={cn(errors.licenseNumber && 'border-red-300')}
        />
      </FormField>

      {/* Especializaciones */}
      <FormField
        label="Especializaciones"
        required
        error={errors.specializations?.message}
        helperText="Selecciona al menos una especialización"
      >
        <Controller
          name="specializations"
          control={control}
          render={({ field }) => (
            <div className="flex flex-col gap-2">
              {SPECIALIZATIONS_OPTIONS.map(option => (
                <label
                  key={option.value}
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={field.value?.includes(option.value as any)}
                    onChange={(e) => {
                      const newValue = e.target.checked
                        ? [...(field.value || []), option.value]
                        : (field.value || []).filter((v: string) => v !== option.value);
                      field.onChange(newValue);
                    }}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="font-medium">{option.label}</span>
                </label>
              ))}
            </div>
          )}
        />
      </FormField>

      {/* Zonas de Cobertura */}
      <FormField
        label="Zonas de Cobertura"
        required
        error={errors.coverageAreas?.message}
        helperText="Selecciona entre 1 y 10 ciudades"
      >
        <div className="max-h-60 overflow-y-auto border rounded-lg p-3 space-y-2">
          {HONDURAS_CITIES.map(city => (
            <label
              key={city}
              className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedCoverageAreas.includes(city)}
                onChange={() => toggleCoverageArea(city)}
                disabled={
                  !selectedCoverageAreas.includes(city) &&
                  selectedCoverageAreas.length >= 10
                }
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm">{city}</span>
            </label>
          ))}
        </div>
        {selectedCoverageAreas.length > 0 && (
          <p className="text-xs text-gray-500 mt-2">
            {selectedCoverageAreas.length} de 10 ciudades seleccionadas
          </p>
        )}
      </FormField>

      {/* Propiedades en Gestión */}
      <FormField
        label="Propiedades en Gestión"
        required
        error={errors.propertiesManaged?.message}
      >
        <select
          {...register('propertiesManaged')}
          className={cn(
            'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
            errors.propertiesManaged ? 'border-red-300' : 'border-gray-300'
          )}
        >
          <option value="1-5">1-5 propiedades</option>
          <option value="6-10">6-10 propiedades</option>
          <option value="11-20">11-20 propiedades</option>
          <option value="20+">Más de 20</option>
        </select>
      </FormField>

      {/* Bio Profesional */}
      <FormField
        label="Biografía Profesional"
        error={errors.professionalBio?.message}
        helperText="Describe tu experiencia y enfoque (máximo 300 caracteres)"
      >
        <textarea
          {...register('professionalBio')}
          rows={4}
          maxLength={300}
          placeholder="Ej: Especializado en propiedades residenciales premium en Tegucigalpa. 5 años de experiencia ayudando a familias a encontrar su hogar ideal."
          className={cn(
            'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none',
            errors.professionalBio ? 'border-red-300' : 'border-gray-300'
          )}
        />
        <p className="text-xs text-gray-500 text-right">
          {formValues.professionalBio?.length || 0}/300
        </p>
      </FormField>

      {/* Hidden submit */}
      <button type="submit" className="hidden">
        Continuar
      </button>
    </form>
  );
}
