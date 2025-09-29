'use client';

import React, { useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { PropertyDiscovery } from './PropertyDiscovery';
import { SearchFilters, ViewMode, SortOption } from '@/types/property';

interface PropertyDiscoveryWrapperProps {
  initialFilters: SearchFilters;
  initialViewMode: ViewMode;
  locale: string;
}

/**
 * Client-side wrapper for PropertyDiscovery component
 * This allows the main page to remain a server component while
 * providing client-side functionality for the property discovery feature
 */
export function PropertyDiscoveryWrapper({
  initialFilters,
  initialViewMode,
  locale
}: PropertyDiscoveryWrapperProps) {
  const searchParams = useSearchParams();

  // Parse search parameters from URL and merge with initial filters
  const filtersFromUrl = useMemo(() => {
    const urlFilters: Partial<SearchFilters> = { ...initialFilters };

    // Get search query
    const query = searchParams.get('q');
    if (query) {
      urlFilters.location = query;
    }

    // Get location coordinates
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    if (lat && lng) {
      urlFilters.coordinates = {
        lat: parseFloat(lat),
        lng: parseFloat(lng)
      };
    }

    // Get price filters
    const priceMin = searchParams.get('priceMin');
    const priceMax = searchParams.get('priceMax');
    if (priceMin) {
      urlFilters.priceMin = parseInt(priceMin, 10);
    }
    if (priceMax) {
      urlFilters.priceMax = parseInt(priceMax, 10);
    }

    // Get property types
    const types = searchParams.get('types');
    if (types) {
      urlFilters.propertyTypes = types.split(',');
    }

    // Get bedrooms
    const bedrooms = searchParams.get('bedrooms');
    if (bedrooms) {
      urlFilters.bedrooms = bedrooms.split(',').map(b => parseInt(b, 10));
    }

    return urlFilters as SearchFilters;
  }, [searchParams, initialFilters]);

  return (
    <PropertyDiscovery
      initialFilters={filtersFromUrl}
      initialViewMode={initialViewMode}
      locale={locale}
    />
  );
}