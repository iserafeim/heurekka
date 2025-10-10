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
      {properties.map((property: any) => {
        // Normalize property data for PropertyCard
        // Handle multiple data formats:
        // 1. Backend MatchedProperty: { priceAmount, type, areaSqm, landlordId, etc. }
        // 2. FavoriteProperty: { price, propertyType, location, etc. }
        // 3. Homepage Property: { price: {amount, currency}, type, etc. }

        const price = property.priceAmount || property.price || 0;
        const propertyType = property.type || property.propertyType || 'apartment';
        const neighborhood = property.address?.neighborhood || property.location || property.neighborhood || '';

        const area = property.areaSqm || property.area || 0;

        const normalizedProperty = {
          id: property.id,
          title: property.title,
          price: typeof price === 'number' ? price : price?.amount || 0,
          propertyType,
          neighborhood,
          city: property.address?.city || 'Tegucigalpa',
          address: typeof property.address === 'string' ? property.address : property.address?.street || '',
          bedrooms: property.bedrooms || 0,
          bathrooms: typeof property.bathrooms === 'string'
            ? parseFloat(property.bathrooms)
            : property.bathrooms || 0,
          area,
          size: {
            value: area,
            unit: 'm2'
          },
          images: property.images || [],
          amenities: property.amenities || [],
          coordinates: { lat: 0, lng: 0 },
          description: property.description || '',
          landlord: {
            id: property.landlordId || property.landlord?.id || '',
            name: property.landlord?.name || 'Propietario',
          },
          listing: {
            listedDate: property.createdAt || new Date().toISOString(),
          },
          stats: {
            views: 0,
            favorites: 0,
          },
        };

        return (
          <PropertyCard
            key={property.id}
            property={normalizedProperty}
            isFavorite={favoritePropertyIds.includes(property.id)}
            onFavorite={onFavorite ? () => onFavorite(property.id) : undefined}
          />
        );
      })}
    </div>
  );
}
