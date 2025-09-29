import { useState, useCallback } from 'react';
import { SearchFilters, Property, UsePropertySearchResult, PropertyType } from '@/types/property';
import { trpc } from '@/lib/trpc';
import { transformBackendProperties, transformSearchFilters } from '@/lib/transformers/property';

/**
 * Hook for property search functionality
 * Uses tRPC with fallback to mock data
 */
export function usePropertySearch(): UsePropertySearchResult {
  const [properties, setProperties] = useState<Property[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<SearchFilters | null>(null);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get tRPC utils at the top level of the hook
  const utils = trpc.useUtils();

  // Fallback mock data for development when API is unavailable
  const getMockProperties = (): Property[] => [
    {
      id: '1',
      address: 'Colonia Palmira, Tegucigalpa',
      neighborhood: 'Palmira',
      city: 'Tegucigalpa',
      price: 15000,
      bedrooms: 2,
      bathrooms: 2,
      area: 85,
      propertyType: PropertyType.APARTMENT,
      coordinates: {
        lat: 14.0723,
        lng: -87.1921
      },
      description: 'Moderno apartamento de 2 habitaciones con excelente ubicación',
      images: ['https://picsum.photos/400/300?random=1'],
      amenities: ['parking', 'security', 'gym'],
      landlord: {
        id: 'landlord1',
        name: 'María García',
        phone: '+50498765432'
      },
      listing: {
        listedDate: new Date().toISOString(),
        status: 'active' as any,
        daysOnMarket: 15
      },
      stats: {
        views: 120,
        favorites: 8,
        inquiries: 5
      }
    },
    {
      id: '2',
      address: 'Residencial El Trapiche, Tegucigalpa',
      neighborhood: 'El Trapiche',
      city: 'Tegucigalpa',
      price: 25000,
      bedrooms: 3,
      bathrooms: 3,
      area: 150,
      propertyType: PropertyType.HOUSE,
      coordinates: {
        lat: 14.0850,
        lng: -87.1950
      },
      description: 'Hermosa casa de 3 habitaciones con jardín y piscina',
      images: ['https://picsum.photos/400/300?random=2'],
      amenities: ['pool', 'garden', 'parking', 'security'],
      landlord: {
        id: 'landlord2',
        name: 'Carlos Hernández',
        phone: '+50497654321'
      },
      listing: {
        listedDate: new Date().toISOString(),
        status: 'active' as any,
        daysOnMarket: 8
      },
      stats: {
        views: 95,
        favorites: 6,
        inquiries: 3
      }
    }
  ];

  // Main search function with real tRPC integration
  const search = useCallback(async (filters: SearchFilters): Promise<void> => {
    const searchFilters = {
      ...filters,
      cursor: undefined // Reset cursor for new search
    };

    setCurrentFilters(searchFilters);
    setLoading(true);
    setError(null);

    try {
      // Transform frontend filters to backend format
      const backendFilters = transformSearchFilters(searchFilters);

      // Use tRPC utils for imperative queries in React components
      console.log('🚀 Sending to backend:', JSON.stringify(backendFilters, null, 2));
      const response = await utils.homepage.searchProperties.fetch(backendFilters);
      console.log('📥 Backend response:', response);

      if (response.success && response.data) {
        console.log('📊 Backend returned properties count:', response.data.properties?.length);
        console.log('📊 Full backend response data:', response.data);
        console.log('📊 Properties details:');
        response.data.properties?.forEach((p, index) => {
          console.log(`  Property ${index + 1}:`, {
            id: p.id,
            title: p.title,
            bedrooms: p.bedrooms,
            bathrooms: p.bathrooms,
            type: p.type,
            address: p.address,
            images: p.images || [],
            price: p.price
          });
        });

        // Transform backend properties to frontend format
        const transformedProperties = transformBackendProperties(response.data.properties || []);

        console.log('🏠 usePropertySearch - Setting properties from backend, count:', transformedProperties.length);
        setProperties(transformedProperties);
        setTotal(response.data.total || transformedProperties.length);
        // Calculate hasMore based on total properties vs current page
        const hasMoreResults = (response.data.total || 0) > (response.data.properties?.length || 0);
        setHasMore(hasMoreResults);
        setCursor(hasMoreResults ? `page-${(response.data.page || 1) + 1}` : undefined);
      } else {
        console.warn('Search API returned no data');
        // Fallback to mock data
        const mockProperties = getMockProperties();
        console.log('🏠 usePropertySearch - Setting properties from mock fallback, count:', mockProperties.length);
        setProperties(mockProperties);
        setTotal(mockProperties.length);
        setHasMore(false);
        setCursor(undefined);
      }
    } catch (error) {
      console.error('Property search error:', error);
      setError('Error al buscar propiedades. Intentando con datos de ejemplo...');

      // Fallback to mock data for development
      const mockProperties = getMockProperties();
      console.log('🏠 usePropertySearch - Setting properties from error fallback, count:', mockProperties.length);
      setProperties(mockProperties);
      setTotal(mockProperties.length);
      setHasMore(false);
      setCursor(undefined);
    } finally {
      setLoading(false);
    }
  }, [utils]);

  // Load more function for infinite scroll
  const loadMore = useCallback(async (): Promise<void> => {
    if (!currentFilters || !hasMore || !cursor) return;

    try {
      // Since we're using mock data, no more results to load
      setHasMore(false);
    } catch (error) {
      console.warn('Load more error:', error);
      setHasMore(false);
    }
  }, [currentFilters, hasMore, cursor]);

  // Refresh current search
  const refresh = useCallback(async (): Promise<void> => {
    if (!currentFilters) return;
    
    await search(currentFilters);
  }, [currentFilters, search]);

  return {
    properties,
    total,
    hasMore,
    loading,
    error,
    search,
    loadMore,
    refresh
  };
}