import { useState, useCallback } from 'react';
import { PropertyDetails, UsePropertyModalResult, PropertyType } from '@/types/property';
import { propertyService } from '@/lib/api/propertyService';

/**
 * Hook for managing property detail modal state
 * Handles modal open/close and property data loading with API integration and fallback
 */
export function usePropertyModal(): UsePropertyModalResult {
  const [isOpen, setIsOpen] = useState(false);
  const [propertyId, setPropertyId] = useState<string | null>(null);
  const [property, setProperty] = useState<PropertyDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock property details fallback
  const getMockPropertyDetails = (id: string): PropertyDetails => ({
    id,
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
    description: 'Moderno apartamento de 2 habitaciones con excelente ubicación en una de las mejores zonas de Tegucigalpa. Cuenta con acabados de primera calidad, cocina equipada, y una vista espectacular de la ciudad.',
    images: [
      'https://picsum.photos/600/400?random=10',
      'https://picsum.photos/600/400?random=11',
      'https://picsum.photos/600/400?random=12',
      'https://picsum.photos/600/400?random=13'
    ],
    amenities: ['parking', 'security', 'gym', 'pool'],
    landlord: {
      id: 'landlord1',
      name: 'María García',
      phone: '+50498765432'
    },
    listing: {
      listedDate: new Date().toISOString(),
      status: 'active' as any,
      daysOnMarket: 10
    },
    stats: {
      views: 150,
      favorites: 12,
      inquiries: 8
    },
    floorPlans: [],
    documents: [],
    taxInfo: {
      lastAssessment: new Date().toISOString(),
      taxRate: 0.05,
      annualTax: 6000
    },
    schools: [],
    walkScore: 85,
    transitScore: 70,
    crimeRate: {
      safetyScore: 8.5,
      crimeRate: 2.3,
      lastUpdated: new Date().toISOString()
    },
    priceHistory: [{
      date: new Date().toISOString(),
      price: 15000,
      event: 'listed' as any
    }],
    similarProperties: []
  });

  // Open modal and load property details with API integration and fallback
  const openModal = useCallback(async (id: string) => {
    try {
      setPropertyId(id);
      setIsOpen(true);
      setLoading(true);
      setError(null);
      setProperty(null);

      try {
        // Try to load from backend API first
        const propertyDetails = await propertyService.getPropertyDetails(id);
        setProperty(propertyDetails);
        
      } catch (apiError) {
        console.warn('API call failed, using mock data:', apiError);
        
        // Fallback to mock data
        await new Promise(resolve => setTimeout(resolve, 600));
        const mockPropertyDetails = getMockPropertyDetails(id);
        setProperty(mockPropertyDetails);
      }
      
    } catch (err) {
      console.error('Error loading property details:', err);
      setError('Error al cargar los detalles de la propiedad. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Close modal and reset state
  const closeModal = useCallback(() => {
    setIsOpen(false);
    setPropertyId(null);
    setProperty(null);
    setLoading(false);
    setError(null);
  }, []);

  return {
    isOpen,
    propertyId,
    property,
    loading,
    error,
    openModal,
    closeModal
  };
}