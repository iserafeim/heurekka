import React, { Suspense } from 'react';
import { PropertyDiscoveryWrapper } from '@/components/property-discovery/PropertyDiscoveryWrapper';
import { SearchFilters, ViewMode, PropertyType, SortOption } from '@/types/property';

// Default filters for the search
const defaultFilters: SearchFilters = {
  location: '',
  priceMin: 0,
  priceMax: 100000,
  bedrooms: [],
  propertyTypes: [],
  amenities: [],
  sortBy: SortOption.RELEVANCE,
  radiusKm: 5,
  limit: 24
};

// Loading component for Suspense
const PropertyDiscoveryLoading = () => (
  <div className="min-h-screen bg-gray-50">
    <div className="animate-pulse">
      {/* Header skeleton */}
      <div className="h-16 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          <div className="h-8 w-32 bg-gray-200 rounded"></div>
          <div className="h-10 w-96 bg-gray-200 rounded-lg"></div>
          <div className="h-8 w-24 bg-gray-200 rounded"></div>
        </div>
      </div>
      
      {/* Filter bar skeleton */}
      <div className="h-16 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center gap-4">
          <div className="h-10 w-32 bg-gray-200 rounded-lg"></div>
          <div className="h-10 w-40 bg-gray-200 rounded-lg"></div>
          <div className="h-10 w-36 bg-gray-200 rounded-lg"></div>
          <div className="h-10 w-44 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
      
      {/* Split view skeleton */}
      <div className="flex h-[calc(100vh-128px)]">
        {/* Cards panel skeleton */}
        <div className="w-[70%] p-6 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4 space-y-3">
                  <div className="h-6 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="flex gap-4">
                    <div className="h-4 w-16 bg-gray-200 rounded"></div>
                    <div className="h-4 w-16 bg-gray-200 rounded"></div>
                    <div className="h-4 w-16 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Map panel skeleton */}
        <div className="w-[30%] bg-gray-300 relative">
          <div className="absolute inset-4 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    </div>
  </div>
);

/**
 * Properties search page
 * Main page for property discovery feature with split-view architecture
 */
export default function PropertiesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<PropertyDiscoveryLoading />}>
        <PropertyDiscoveryWrapper 
          initialFilters={defaultFilters}
          initialViewMode={ViewMode.SPLIT}
          locale="es"
        />
      </Suspense>
    </div>
  );
}

// Metadata for the page
export const metadata = {
  title: 'Propiedades - Heurekka',
  description: 'Busca y encuentra propiedades en alquiler en Tegucigalpa, Honduras. Explora departamentos, casas y oficinas con Heurekka.',
  keywords: 'propiedades, alquiler, departamentos, casas, Tegucigalpa, Honduras, inmobiliaria',
  openGraph: {
    title: 'Buscar Propiedades - Heurekka',
    description: 'Encuentra tu próximo hogar u oficina en Tegucigalpa. Miles de propiedades disponibles.',
    type: 'website',
    locale: 'es_HN',
  }
};