'use client';

/**
 * IndividualOwnerForm Component
 * Formulario para propietarios individuales
 */

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { individualOwnerSchema, type IndividualOwnerInput } from '@/schemas/landlord/individualOwner.schema';
import { FormField } from './FormField';
import { Input } from '@/components/ui/input';
import { PhoneInput } from '@/components/ui/phone-input';
import { cn } from '@/lib/utils';
import { HONDURAS_CITIES, PROPERTY_COUNT_OPTIONS } from '@/types/landlord';

interface IndividualOwnerFormProps {
  onSubmit: (data: IndividualOwnerInput) => void;
  defaultValues?: Partial<IndividualOwnerInput>;
  onChange?: (data: Partial<IndividualOwnerInput>) => void;
}

export function IndividualOwnerForm({
  onSubmit,
  defaultValues,
  onChange,
}: IndividualOwnerFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<IndividualOwnerInput>({
    resolver: zodResolver(individualOwnerSchema),
    defaultValues: defaultValues || {
      fullName: '',
      phone: '',
      whatsappNumber: '',
      primaryLocation: '',
      propertyCountRange: undefined,
      rentingReason: '',
    },
    mode: 'onChange',
  });

  // Auto-save en cada cambio con debounce local
  const formValues = watch();
  useEffect(() => {
    if (!onChange) return;

    const timeoutId = setTimeout(() => {
      onChange(formValues);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [formValues]); // NO incluir onChange en dependencias

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      {/* Nombre Completo */}
      <FormField
        label="Nombre Completo"
        required
        error={errors.fullName?.message}
      >
        <Input
          {...register('fullName')}
          placeholder="Juan Pérez"
          className={cn(errors.fullName && 'border-red-300')}
        />
      </FormField>

      {/* Teléfono */}
      <FormField
        label="Teléfono de Contacto"
        required
        error={errors.phone?.message}
        helperText="Formato: 9999-9999"
      >
        <PhoneInput
          value={watch('phone')}
          onChange={(value) => setValue('phone', value, { shouldValidate: true })}
          className={cn(errors.phone && 'border-red-300')}
        />
      </FormField>

      {/* WhatsApp (Opcional) */}
      <FormField
        label="WhatsApp de Contacto"
        error={errors.whatsappNumber?.message}
        helperText="Los inquilinos prefieren WhatsApp para contacto"
      >
        <PhoneInput
          value={watch('whatsappNumber')}
          onChange={(value) => setValue('whatsappNumber', value, { shouldValidate: true })}
          className={cn(errors.whatsappNumber && 'border-red-300')}
        />
      </FormField>

      {/* Ubicación Principal */}
      <FormField
        label="Ubicación Principal"
        required
        error={errors.primaryLocation?.message}
      >
        <select
          {...register('primaryLocation')}
          className={cn(
            'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
            errors.primaryLocation ? 'border-red-300' : 'border-gray-300'
          )}
        >
          <option value="">Selecciona una ciudad</option>
          {HONDURAS_CITIES.map(city => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </FormField>

      {/* Número de Propiedades */}
      <FormField
        label="¿Cuántas propiedades tienes?"
        error={errors.propertyCountRange?.message}
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {PROPERTY_COUNT_OPTIONS.map(option => (
            <label
              key={option.value}
              className={cn(
                'cursor-pointer rounded-lg border-2 transition-all p-3 sm:p-4 text-center',
                'hover:border-blue-300',
                formValues.propertyCountRange === option.value
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200'
              )}
            >
              <input
                type="radio"
                {...register('propertyCountRange')}
                value={option.value}
                className="sr-only"
              />
              <span className={cn(
                'text-base sm:text-lg font-semibold',
                formValues.propertyCountRange === option.value
                  ? 'text-blue-700'
                  : 'text-gray-700'
              )}>
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </FormField>

      {/* Razón de Renta (Opcional) */}
      <FormField
        label="¿Por qué rentas tu propiedad?"
        error={errors.rentingReason?.message}
        helperText="Opcional - Ayuda a entender mejor tus necesidades"
      >
        <select
          {...register('rentingReason')}
          className={cn(
            'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
            errors.rentingReason ? 'border-red-300' : 'border-gray-300'
          )}
        >
          <option value="">Selecciona una razón</option>
          <option value="ingreso_adicional">Ingreso adicional</option>
          <option value="propiedad_heredada">Propiedad heredada</option>
          <option value="inversion">Inversión</option>
          <option value="viaje_reubicacion">Viaje o reubicación</option>
          <option value="otra">Otra</option>
        </select>
      </FormField>

      {/* Submit button (hidden - el padre maneja la navegación) */}
      <button type="submit" className="hidden">
        Continuar
      </button>
    </form>
  );
}
