/**
 * Search Criteria Badges
 * Muestra los criterios de búsqueda como badges
 */

'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { PROPERTY_TYPE_OPTIONS } from '@/types/tenant';
import type { SearchCriteria } from '@/types/tenant';

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
        <Badge variant="secondary">
          Presupuesto: {formatCurrency(criteria.budgetMin || 0)} - {formatCurrency(criteria.budgetMax || 999999)}
        </Badge>
      )}

      {/* Property Types */}
      {criteria.propertyTypes && criteria.propertyTypes.length > 0 && (
        criteria.propertyTypes.map((type) => {
          const typeOption = PROPERTY_TYPE_OPTIONS.find((opt) => opt.value === type);
          return (
            <Badge key={type} variant="secondary">
              {typeOption?.icon} {typeOption?.label || type}
            </Badge>
          );
        })
      )}

      {/* Locations */}
      {criteria.locations && criteria.locations.length > 0 && (
        criteria.locations.slice(0, 3).map((location) => (
          <Badge key={location} variant="secondary">
            {location}
          </Badge>
        ))
      )}

      {criteria.locations && criteria.locations.length > 3 && (
        <Badge variant="secondary">
          +{criteria.locations.length - 3} más
        </Badge>
      )}

      {/* Bedrooms */}
      {criteria.bedrooms && (
        <Badge variant="secondary">
          {criteria.bedrooms.min || 0} - {criteria.bedrooms.max || '+'} habitaciones
        </Badge>
      )}

      {/* Bathrooms */}
      {criteria.bathrooms && (
        <Badge variant="secondary">
          {criteria.bathrooms.min || 0} - {criteria.bathrooms.max || '+'} baños
        </Badge>
      )}

      {/* Amenities */}
      {criteria.amenities && criteria.amenities.length > 0 && (
        <Badge variant="secondary">
          {criteria.amenities.length} comodidades
        </Badge>
      )}
    </div>
  );
}
