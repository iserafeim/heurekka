import { useState, useEffect, useCallback } from 'react';
import { Property } from '@/types/property';
import { trpc } from '@/lib/trpc';
import { transformBackendProperties } from '@/lib/transformers/property';

/**
 * Hook for fetching featured properties for homepage
 */
export function useFeaturedProperties(limit: number = 6) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fallback mock data for development
  const getMockFeaturedProperties = (): Property[] => [
    {
      id: 'featured-1',
      address: 'Lomas del Guijarro, Tegucigalpa',
      neighborhood: 'Lomas del Guijarro',
      city: 'Tegucigalpa',
      price: 35000,
      bedrooms: 3,
      bathrooms: 3,
      area: 180,
      propertyType: 'apartment' as any,
      coordinates: { lat: 14.0850, lng: -87.1950 },
      description: 'Penthouse de lujo con vista panorámica',
      images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'],
      amenities: ['aire acondicionado', 'seguridad 24h', 'gimnasio', 'piscina', 'parqueo'],
      landlord: {
        id: 'landlord-featured-1',
        name: 'Property Owner',
        phone: '+504 9999-0000'
      },
      listing: {
        listedDate: new Date().toISOString(),
        status: 'active' as any,
        daysOnMarket: 5
      },
      stats: {
        views: 250,
        favorites: 18,
        inquiries: 12
      },
      isFeatured: true,
      isNew: true
    }
  ];

  const fetchFeaturedProperties = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Make tRPC call to get featured properties
      const response = await trpc.homepage.getFeaturedProperties.fetch({ limit });

      if (response.success && response.data) {
        // Transform backend properties to frontend format
        const transformedProperties = transformBackendProperties(response.data);
        setProperties(transformedProperties);
      } else {
        console.warn('Featured properties API returned no data');
        // Fallback to mock data
        setProperties(getMockFeaturedProperties());
      }
    } catch (error) {
      console.error('Featured properties error:', error);
      setError('Error al cargar propiedades destacadas');

      // Fallback to mock data for development
      setProperties(getMockFeaturedProperties());
    } finally {
      setLoading(false);
    }
  }, [limit]);

  // Fetch featured properties on mount
  useEffect(() => {
    fetchFeaturedProperties();
  }, [fetchFeaturedProperties]);

  return {
    properties,
    loading,
    error,
    refresh: fetchFeaturedProperties
  };
}