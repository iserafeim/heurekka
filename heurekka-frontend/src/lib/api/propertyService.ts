/**
 * Property API Service
 * Direct API calls to backend property endpoints
 */

import { httpClient, type ApiError } from './httpClient';
import type { Property, PropertyDetails, SearchFilters } from '@/types/property';

interface SearchResponse {
  properties: Property[];
  total: number;
  hasMore: boolean;
  cursor?: string;
}

interface PropertyResponse {
  property: PropertyDetails;
}

export class PropertyService {
  /**
   * Search properties with filters
   */
  async searchProperties(filters: SearchFilters): Promise<SearchResponse> {
    try {
      const params: Record<string, any> = {};
      
      // Convert filters to query parameters
      if (filters.location) params.location = filters.location;
      if (filters.coordinates?.lat) params.lat = filters.coordinates.lat;
      if (filters.coordinates?.lng) params.lng = filters.coordinates.lng;
      if (filters.radiusKm) params.radius = filters.radiusKm;
      if (filters.priceMin) params.priceMin = filters.priceMin;
      if (filters.priceMax) params.priceMax = filters.priceMax;
      if (filters.bedrooms?.length) params.bedrooms = filters.bedrooms.join(',');
      if (filters.propertyTypes?.length) params.propertyTypes = filters.propertyTypes.join(',');
      if (filters.amenities?.length) params.amenities = filters.amenities.join(',');
      if (filters.sortBy) params.sortBy = filters.sortBy;
      if (filters.limit) params.limit = filters.limit;
      if (filters.cursor) params.cursor = filters.cursor;

      const response = await httpClient.get<SearchResponse>('/properties/search', params);
      return response;
    } catch (error) {
      console.error('Property search error:', {
        message: error instanceof Error ? error.message : (error as any)?.message || 'Unknown error',
        status: (error as any)?.status,
        code: (error as any)?.code,
        error: error
      });
      throw new Error('Error al buscar propiedades. Por favor, intenta de nuevo.');
    }
  }

  /**
   * Get property details by ID
   */
  async getPropertyDetails(propertyId: string): Promise<PropertyDetails> {
    try {
      if (!propertyId || typeof propertyId !== 'string') {
        throw new Error('ID de propiedad inválido');
      }

      const response = await httpClient.get<PropertyResponse>(`/properties/${propertyId}`);
      return response.property;
    } catch (error) {
      console.error('Property details error:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        error: error
      });
      throw new Error('Error al cargar los detalles de la propiedad. Por favor, intenta de nuevo.');
    }
  }

  /**
   * Get featured properties
   */
  async getFeaturedProperties(limit: number = 10): Promise<Property[]> {
    try {
      const response = await httpClient.get<{ properties: Property[] }>('/properties/featured', { limit });
      return response.properties;
    } catch (error) {
      console.error('Featured properties error:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        error: error
      });
      throw new Error('Error al cargar propiedades destacadas. Por favor, intenta de nuevo.');
    }
  }

  /**
   * Get properties near location
   */
  async getNearbyProperties(lat: number, lng: number, radius: number = 5): Promise<Property[]> {
    try {
      const response = await httpClient.get<{ properties: Property[] }>('/properties/nearby', {
        lat,
        lng,
        radius
      });
      return response.properties;
    } catch (error) {
      console.error('Nearby properties error:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        error: error
      });
      throw new Error('Error al cargar propiedades cercanas. Por favor, intenta de nuevo.');
    }
  }
}

export const propertyService = new PropertyService();