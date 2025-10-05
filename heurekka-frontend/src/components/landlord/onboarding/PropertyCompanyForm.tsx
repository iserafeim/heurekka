'use client';

/**
 * PropertyCompanyForm Component
 * Formulario para empresas de gestión de propiedades
 */

import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { propertyCompanySchema, type PropertyCompanyInput } from '@/schemas/landlord/propertyCompany.schema';
import { FormField } from './FormField';
import { Input } from '@/components/ui/input';
import { PhoneInput } from '@/components/ui/phone-input';
import { cn } from '@/lib/utils';
import {
  HONDURAS_CITIES,
  PORTFOLIO_SIZE_OPTIONS,
  PROPERTY_TYPES_OPTIONS,
} from '@/types/landlord';

interface PropertyCompanyFormProps {
  onSubmit: (data: PropertyCompanyInput) => void;
  defaultValues?: Partial<PropertyCompanyInput>;
  onChange?: (data: Partial<PropertyCompanyInput>) => void;
}

export function PropertyCompanyForm({
  onSubmit,
  defaultValues,
  onChange,
}: PropertyCompanyFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<PropertyCompanyInput>({
    resolver: zodResolver(propertyCompanySchema),
    defaultValues: defaultValues || {
      companyName: '',
      foundedYear: undefined,
      primaryPhone: '',
      whatsappBusiness: '',
      contactEmail: '',
      website: '',
      officeAddress: '',
      city: '',
      operatingAreas: [],
      portfolioSize: '1-10',
      propertyTypes: [],
      companyLogoUrl: '',
      licenseDocumentUrl: '',
      companyDescription: '',
    },
    mode: 'onChange',
  });

  const formValues = watch();
  const [selectedOperatingAreas, setSelectedOperatingAreas] = useState<string[]>(
    defaultValues?.operatingAreas || []
  );

  // Auto-save con debounce local
  useEffect(() => {
    if (!onChange) return;

    const timeoutId = setTimeout(() => {
      onChange(formValues);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [formValues]); // NO incluir onChange en dependencias

  const toggleOperatingArea = (city: string) => {
    const newAreas = selectedOperatingAreas.includes(city)
      ? selectedOperatingAreas.filter(c => c !== city)
      : [...selectedOperatingAreas, city];

    setSelectedOperatingAreas(newAreas);
    setValue('operatingAreas', newAreas, { shouldValidate: true });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      {/* Nombre de la Empresa */}
      <FormField
        label="Nombre Legal de la Empresa"
        required
        error={errors.companyName?.message}
      >
        <Input
          {...register('companyName')}
          placeholder="Inversiones ABC S.A."
          className={cn(errors.companyName && 'border-red-300')}
        />
      </FormField>

      {/* Año de Fundación */}
      <FormField
        label="Año de Fundación"
        error={errors.foundedYear?.message}
      >
        <Input
          type="number"
          {...register('foundedYear', { valueAsNumber: true })}
          placeholder={new Date().getFullYear().toString()}
          min={1900}
          max={new Date().getFullYear()}
          className={cn(errors.foundedYear && 'border-red-300')}
        />
      </FormField>

      {/* Teléfono Principal */}
      <FormField
        label="Teléfono Principal"
        required
        error={errors.primaryPhone?.message}
      >
        <PhoneInput
          value={watch('primaryPhone')}
          onChange={(value) => setValue('primaryPhone', value, { shouldValidate: true })}
          className={cn(errors.primaryPhone && 'border-red-300')}
        />
      </FormField>

      {/* WhatsApp Business */}
      <FormField
        label="WhatsApp Business"
        required
        error={errors.whatsappBusiness?.message}
      >
        <PhoneInput
          value={watch('whatsappBusiness')}
          onChange={(value) => setValue('whatsappBusiness', value, { shouldValidate: true })}
          className={cn(errors.whatsappBusiness && 'border-red-300')}
        />
      </FormField>

      {/* Email de Contacto */}
      <FormField
        label="Email de Contacto"
        error={errors.contactEmail?.message}
      >
        <Input
          type="email"
          {...register('contactEmail')}
          placeholder="contacto@abcproperty.com"
          className={cn(errors.contactEmail && 'border-red-300')}
        />
      </FormField>

      {/* Sitio Web */}
      <FormField
        label="Sitio Web"
        error={errors.website?.message}
      >
        <Input
          type="url"
          {...register('website')}
          placeholder="https://www.abcproperty.com"
          className={cn(errors.website && 'border-red-300')}
        />
      </FormField>

      {/* Dirección de Oficina */}
      <FormField
        label="Dirección de la Oficina Principal"
        required
        error={errors.officeAddress?.message}
      >
        <Input
          {...register('officeAddress')}
          placeholder="Blvd. Morazán, Torre 1, Piso 5"
          className={cn(errors.officeAddress && 'border-red-300')}
        />
      </FormField>

      {/* Ciudad */}
      <FormField
        label="Ciudad"
        required
        error={errors.city?.message}
      >
        <select
          {...register('city')}
          className={cn(
            'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
            errors.city ? 'border-red-300' : 'border-gray-300'
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

      {/* Zonas de Operación */}
      <FormField
        label="Zonas de Operación"
        required
        error={errors.operatingAreas?.message}
        helperText="Selecciona entre 1 y 20 ciudades"
      >
        <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-lg p-3 space-y-2">
          {HONDURAS_CITIES.map(city => (
            <label
              key={city}
              className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedOperatingAreas.includes(city)}
                onChange={() => toggleOperatingArea(city)}
                disabled={
                  !selectedOperatingAreas.includes(city) &&
                  selectedOperatingAreas.length >= 20
                }
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm">{city}</span>
            </label>
          ))}
        </div>
        {selectedOperatingAreas.length > 0 && (
          <p className="text-xs text-gray-500 mt-2">
            {selectedOperatingAreas.length} de 20 ciudades seleccionadas
          </p>
        )}
      </FormField>

      {/* Tamaño del Portfolio */}
      <FormField
        label="Tamaño del Portfolio"
        required
        error={errors.portfolioSize?.message}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {PORTFOLIO_SIZE_OPTIONS.map(option => (
            <label
              key={option.value}
              className={cn(
                'cursor-pointer rounded-lg border-2 transition-all p-3 text-center',
                'hover:border-blue-300',
                formValues.portfolioSize === option.value
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200'
              )}
            >
              <input
                type="radio"
                {...register('portfolioSize')}
                value={option.value}
                className="sr-only"
              />
              <span className={cn(
                'text-sm font-medium',
                formValues.portfolioSize === option.value
                  ? 'text-blue-700'
                  : 'text-gray-700'
              )}>
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </FormField>

      {/* Tipos de Propiedad */}
      <FormField
        label="Tipos de Propiedad que Gestionan"
        required
        error={errors.propertyTypes?.message}
      >
        <Controller
          name="propertyTypes"
          control={control}
          render={({ field }) => (
            <div className="grid grid-cols-2 gap-3">
              {PROPERTY_TYPES_OPTIONS.map(option => (
                <label
                  key={option.value}
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-300 hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={(field.value || []).includes(option.value as any)}
                    onChange={(e) => {
                      const currentValue = field.value || [];
                      const newValue = e.target.checked
                        ? [...currentValue, option.value]
                        : currentValue.filter((v: string) => v !== option.value);
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

      {/* Descripción de la Empresa */}
      <FormField
        label="Descripción de la Empresa"
        error={errors.companyDescription?.message}
        helperText="Describe los servicios y enfoque de tu empresa (máximo 500 caracteres)"
      >
        <textarea
          {...register('companyDescription')}
          rows={4}
          maxLength={500}
          placeholder="Empresa líder en gestión de propiedades con más de 15 años de experiencia..."
          className={cn(
            'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none',
            errors.companyDescription ? 'border-red-300' : 'border-gray-300'
          )}
        />
        <p className="text-xs text-gray-500 text-right">
          {formValues.companyDescription?.length || 0}/500
        </p>
      </FormField>

      {/* Hidden submit */}
      <button type="submit" className="hidden">
        Continuar
      </button>
    </form>
  );
}
