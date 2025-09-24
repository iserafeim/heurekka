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
   * Transform backend property data to ensure frontend compatibility
   */
  private transformPropertyDetails(property: any): any {
    // Process images and add fallbacks if needed
    let processedImages = [];

    if (property.images && property.images.length > 0) {
      // Transform backend images to string URLs
      processedImages = property.images.map((img: any) => {
        if (typeof img === 'string') {
          return img; // Already a string URL
        }
        // Extract URL from image object
        if (typeof img === 'object' && img.url) {
          return img.url;
        }
        return null; // Invalid image data
      }).filter((url: string | null) => url && typeof url === 'string' && url.trim() !== '');
    }

    // If no valid images, add placeholder images based on property type
    if (processedImages.length === 0) {
      const propertyType = property.propertyType || property.type || 'apartment';
      const typeText = propertyType === 'apartment' ? 'Apartamento' :
                     propertyType === 'house' ? 'Casa' :
                     propertyType === 'room' ? 'Habitación' : 'Propiedad';

      processedImages = [
        `https://picsum.photos/600/400?random=1`,
        `https://picsum.photos/600/400?random=2`,
        `https://picsum.photos/600/400?random=3`
      ];
    }

    return {
      ...property,
      images: processedImages,
      // Ensure required fields exist
      area: property.area || property.areaSqm || property.area_sqm || property.size?.value || 0,
      city: property.city || 'Tegucigalpa',
      propertyType: property.propertyType || property.type || 'apartment',
      // Ensure price is a number
      price: typeof property.price === 'object' ? property.price.amount : property.price,
      // Ensure coordinates exist
      coordinates: property.coordinates || { lat: 0, lng: 0 },
      // Ensure amenities is an array
      amenities: Array.isArray(property.amenities) ? property.amenities : [],
    };
  }
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

      console.log('Fetching property details for ID:', propertyId);

      // Call TRPC endpoint via HTTP GET (for queries)
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
      const input = encodeURIComponent(JSON.stringify({"0": {"json": {"id": propertyId}}}));
      const url = `${baseUrl}/trpc/property.getById?batch=1&input=${input}`;

      console.log('Calling TRPC endpoint:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Response not OK:', response.status, response.statusText, 'URL:', url);
        const errorText = await response.text();
        console.error('Error response body:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('TRPC Response:', data);

      // Extract the property from TRPC batch response format
      // TRPC batch returns an array, we need the first element
      const result = Array.isArray(data) ? data[0] : data;

      // Check for TRPC errors
      if (result?.error) {
        console.error('TRPC Error:', result.error);
        throw new Error(result.error?.json?.message || 'Error en la respuesta del servidor');
      }

      const property = result?.result?.data?.json;

      if (!property) {
        console.warn('No property found in response');
        throw new Error('Propiedad no encontrada');
      }

      console.log('Property details retrieved:', property);
      console.log('Original images:', property.images);

      // Transform backend data to ensure frontend compatibility
      const transformedProperty = this.transformPropertyDetails(property);
      console.log('Transformed images:', transformedProperty.images);
      return transformedProperty as PropertyDetails;
    } catch (error) {
      console.error('Property details error:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        error: error,
        propertyId: propertyId
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