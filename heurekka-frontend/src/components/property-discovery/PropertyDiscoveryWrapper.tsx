'use client';

import React from 'react';
import { PropertyDiscovery } from './PropertyDiscovery';
import { SearchFilters, ViewMode } from '@/types/property';

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
  return (
    <PropertyDiscovery 
      initialFilters={initialFilters}
      initialViewMode={initialViewMode}
      locale={locale}
    />
  );
}