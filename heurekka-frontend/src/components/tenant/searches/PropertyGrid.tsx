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
        // Transform backend MatchedProperty format to PropertyCard Property format
        // Backend returns: { priceAmount, type, areaSqm, address: {neighborhood, city, street}, landlordId }

        const price = property.priceAmount || property.price || 0;
        const propertyType = property.type || property.propertyType || 'apartment';

        // Extract neighborhood from address object or fallback to other sources
        const neighborhood = (
          property.address?.neighborhood?.trim() ||
          property.location?.trim() ||
          property.neighborhood?.trim() ||
          ''
        );

        const city = property.address?.city?.trim() || property.city || 'Tegucigalpa';
        const street = property.address?.street?.trim() || property.address || '';
        const area = property.areaSqm || property.area || 0;

        // Transform to Property format for PropertyCard
        const normalizedProperty = {
          id: property.id,
          address: street,
          neighborhood,
          city,
          price,
          bedrooms: property.bedrooms || 0,
          bathrooms: typeof property.bathrooms === 'string'
            ? parseFloat(property.bathrooms)
            : property.bathrooms || 0,
          area,
          propertyType,
          images: Array.isArray(property.images)
            ? property.images.map((img: any) => typeof img === 'string' ? img : img?.url || '')
            : [],
          description: property.description || property.title || '',
          amenities: property.amenities || [],
          coordinates: property.coordinates || { lat: 0, lng: 0 },
          landlord: {
            id: property.landlordId || property.landlord?.id || '',
            name: property.landlord?.name || 'Propietario',
          },
          listing: {
            listedDate: property.createdAt || new Date().toISOString(),
            status: 'active',
            daysOnMarket: 0,
          },
          stats: {
            views: 0,
            favorites: 0,
            inquiries: 0,
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
