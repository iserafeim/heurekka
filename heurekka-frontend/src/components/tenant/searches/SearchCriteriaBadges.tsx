/**
 * Search Criteria Badges
 * Muestra los criterios de búsqueda como badges con categorización visual
 */

'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { PROPERTY_TYPE_OPTIONS } from '@/types/tenant';
import type { SearchCriteria } from '@/types/tenant';
import { MapPin, Home, Bed, Bath, Sparkles } from 'lucide-react';

interface SearchCriteriaBadgesProps {
  criteria: SearchCriteria;
}

export function SearchCriteriaBadges({ criteria }: SearchCriteriaBadgesProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-HN', {
      style: 'currency',
      currency: 'HNL',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {/* Budget */}
      {(criteria.budgetMin || criteria.budgetMax) && (
        <Badge
          variant="secondary"
          className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 transition-colors duration-200 px-3 py-1.5 text-sm font-semibold"
        >
          💰 Presupuesto: {formatCurrency(criteria.budgetMin || 0)} - {formatCurrency(criteria.budgetMax || 999999)}
        </Badge>
      )}

      {/* Property Types */}
      {criteria.propertyTypes && criteria.propertyTypes.length > 0 && (
        criteria.propertyTypes.map((type) => {
          const typeOption = PROPERTY_TYPE_OPTIONS.find((opt) => opt.value === type);
          return (
            <Badge
              key={type}
              variant="secondary"
              className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 transition-colors duration-200 px-3 py-1.5 text-sm font-semibold"
            >
              {typeOption?.icon} {typeOption?.label || type}
            </Badge>
          );
        })
      )}

      {/* Locations */}
      {criteria.locations && criteria.locations.length > 0 && (
        <>
          {criteria.locations.slice(0, 3).map((location) => (
            <Badge
              key={location}
              variant="secondary"
              className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 transition-colors duration-200 px-3 py-1.5 text-sm font-semibold inline-flex items-center gap-1.5"
            >
              <MapPin className="h-3.5 w-3.5" />
              {location}
            </Badge>
          ))}

          {criteria.locations.length > 3 && (
            <Badge
              variant="secondary"
              className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 transition-colors duration-200 px-3 py-1.5 text-sm font-semibold"
              title={criteria.locations.slice(3).join(', ')}
            >
              +{criteria.locations.length - 3} ubicaciones más
            </Badge>
          )}
        </>
      )}

      {/* Bedrooms */}
      {criteria.bedrooms && (
        <Badge
          variant="secondary"
          className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 transition-colors duration-200 px-3 py-1.5 text-sm font-semibold inline-flex items-center gap-1.5"
        >
          <Bed className="h-3.5 w-3.5" />
          {criteria.bedrooms.min || 0} - {criteria.bedrooms.max || '+'} habitaciones
        </Badge>
      )}

      {/* Bathrooms */}
      {criteria.bathrooms && (
        <Badge
          variant="secondary"
          className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 transition-colors duration-200 px-3 py-1.5 text-sm font-semibold inline-flex items-center gap-1.5"
        >
          <Bath className="h-3.5 w-3.5" />
          {criteria.bathrooms.min || 0} - {criteria.bathrooms.max || '+'} baños
        </Badge>
      )}

      {/* Amenities */}
      {criteria.amenities && criteria.amenities.length > 0 && (
        <Badge
          variant="secondary"
          className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 transition-colors duration-200 px-3 py-1.5 text-sm font-semibold inline-flex items-center gap-1.5"
          title={criteria.amenities.join(', ')}
        >
          <Sparkles className="h-3.5 w-3.5" />
          {criteria.amenities.length} {criteria.amenities.length === 1 ? 'comodidad' : 'comodidades'}
        </Badge>
      )}
    </div>
  );
}
