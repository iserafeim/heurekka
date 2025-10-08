/**
 * Property Grid
 * Grid responsive de property cards
 */

'use client';

import React from 'react';
import { PropertyCard } from '@/components/ui/property-card';
import type { FavoriteProperty } from '@/types/tenant';

interface PropertyGridProps {
  properties: FavoriteProperty[];
  onFavorite?: (propertyId: string) => void;
  favoritePropertyIds?: string[];
}

export function PropertyGrid({ properties, onFavorite, favoritePropertyIds = [] }: PropertyGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((property) => (
        <PropertyCard
          key={property.id}
          property={{
            id: property.id,
            title: property.title,
            price: property.price,
            location: property.location,
            bedrooms: property.bedrooms,
            bathrooms: property.bathrooms,
            area: 0, // No tenemos este dato en FavoriteProperty
            images: property.images || [],
            type: property.propertyType,
            amenities: [],
          }}
          isFavorite={favoritePropertyIds.includes(property.id)}
          onToggleFavorite={onFavorite ? () => onFavorite(property.id) : undefined}
        />
      ))}
    </div>
  );
}
