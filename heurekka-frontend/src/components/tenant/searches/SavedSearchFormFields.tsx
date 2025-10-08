/**
 * Saved Search Form Fields
 * Componente reutilizable para crear y editar búsquedas guardadas
 */

'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PROPERTY_TYPE_OPTIONS, TEGUCIGALPA_AREAS } from '@/types/tenant';
import type { SavedSearchFormData } from '@/types/tenant';

const savedSearchSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  propertyTypes: z.array(z.string()).min(1, 'Selecciona al menos un tipo'),
  locations: z.array(z.string()).min(1, 'Selecciona al menos una zona'),
  budgetMin: z.number().min(0, 'El presupuesto mínimo debe ser mayor a 0'),
  budgetMax: z.number().min(0, 'El presupuesto máximo debe ser mayor a 0'),
  notificationEnabled: z.boolean().default(true),
}).refine((data) => data.budgetMax >= data.budgetMin, {
  message: 'El presupuesto máximo debe ser mayor o igual al mínimo',
  path: ['budgetMax'],
});

export interface SavedSearchFormFieldsProps {
  defaultValues?: Partial<SavedSearchFormData>;
  onSubmit: (data: SavedSearchFormData) => Promise<void>;
  submitLabel: string;
  isLoading?: boolean;
  onCancel?: () => void;
}

export function SavedSearchFormFields({
  defaultValues,
  onSubmit,
  submitLabel,
  isLoading = false,
  onCancel,
}: SavedSearchFormFieldsProps) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(savedSearchSchema),
    defaultValues: defaultValues || {
      name: '',
      propertyTypes: [],
      locations: [],
      budgetMin: 5000,
      budgetMax: 15000,
      notificationEnabled: true,
    },
  });

  const selectedPropertyTypes = watch('propertyTypes') || [];
  const selectedLocations = watch('locations') || [];

  const togglePropertyType = (type: string) => {
    const current = selectedPropertyTypes;
    const updated = current.includes(type)
      ? current.filter((t: string) => t !== type)
      : [...current, type];
    setValue('propertyTypes', updated);
  };

  const toggleLocation = (location: string) => {
    const current = selectedLocations;
    const updated = current.includes(location)
      ? current.filter((l: string) => l !== location)
      : [...current, location];
    setValue('locations', updated);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Name */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nombre de la Búsqueda <span className="text-red-500">*</span>
        </label>
        <Input
          {...register('name')}
          placeholder="Ej: Apartamentos en Lomas"
          className={errors.name ? 'border-red-500' : ''}
        />
        {errors.name && (
          <p className="text-sm text-red-600 mt-1">{errors.name.message as string}</p>
        )}
      </div>

      {/* Property Types */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Tipos de Propiedad <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {PROPERTY_TYPE_OPTIONS.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => togglePropertyType(type.value)}
              className={`
                p-4 rounded-lg border-2 text-left transition-all
                ${
                  selectedPropertyTypes.includes(type.value)
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
        {errors.propertyTypes && (
          <p className="text-sm text-red-600 mt-2">{errors.propertyTypes.message as string}</p>
        )}
      </div>

      {/* Budget */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Presupuesto Mensual <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Mínimo</label>
            <Input
              type="number"
              {...register('budgetMin', { valueAsNumber: true })}
              placeholder="5,000"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Máximo</label>
            <Input
              type="number"
              {...register('budgetMax', { valueAsNumber: true })}
              placeholder="15,000"
            />
          </div>
        </div>
        {errors.budgetMax && (
          <p className="text-sm text-red-600 mt-2">{errors.budgetMax.message as string}</p>
        )}
      </div>

      {/* Locations */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Zonas <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
          {TEGUCIGALPA_AREAS.map((area) => (
            <button
              key={area}
              type="button"
              onClick={() => toggleLocation(area)}
              className={`
                px-3 py-2 rounded-md text-sm text-left transition-all
                ${
                  selectedLocations.includes(area)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              {area}
            </button>
          ))}
        </div>
        {errors.locations && (
          <p className="text-sm text-red-600 mt-2">{errors.locations.message as string}</p>
        )}
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            {...register('notificationEnabled')}
            className="w-5 h-5 text-blue-600 rounded"
          />
          <div>
            <span className="text-sm font-medium text-gray-900">
              Recibir notificaciones
            </span>
            <p className="text-xs text-gray-600">
              Te avisaremos cuando haya nuevas propiedades que coincidan
            </p>
          </div>
        </label>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        {onCancel && (
          <Button
            type="button"
            onClick={onCancel}
            variant="outline"
            className="flex-1"
            disabled={isLoading}
          >
            Cancelar
          </Button>
        )}
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? 'Procesando...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
