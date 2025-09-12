import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PropertyService } from '../../services/property.service';
import type { 
  SearchFilters, 
  MapBounds, 
  PropertyViewEvent, 
  PropertyContactEvent,
  Property
} from '../../types/property';

// Mock Supabase client
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(),
    rpc: vi.fn()
  })),
  SupabaseClient: class SupabaseClient {}
}));

// Mock the supabase service
vi.mock('../../services/supabase.ts', () => ({
  supabaseService: {
    instance: {
      client: {
        from: vi.fn(),
        rpc: vi.fn(),
      }
    }
  }
}));

describe('PropertyService', () => {
  let propertyService: PropertyService;
  let mockSupabaseClient: any;

  beforeEach(async () => {
    propertyService = new PropertyService();
    // Reset all mocks before each test
    vi.clearAllMocks();
    
    // Get reference to mocked Supabase client
    const { supabaseService } = await vi.importMock('../../services/supabase.ts') as any;
    mockSupabaseClient = supabaseService.instance.client;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('searchProperties', () => {
    const mockFilters: SearchFilters = {
      location: 'Lomas del Guijarro',
      priceMin: 5000,
      priceMax: 20000,
      bedrooms: [2, 3],
      propertyTypes: ['apartment'],
      amenities: ['parking', 'gym'],
      sortBy: 'precio_asc',
      radiusKm: 5,
      limit: 24,
    };

    const mockPropertyData = [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Apartamento en Lomas del Guijarro',
        description: 'Moderno apartamento con vista a la ciudad',
        type: 'apartment',
        price_amount: 15000,
        currency: 'HNL',
        bedrooms: 2,
        bathrooms: 2,
        area_sqm: 85,
        amenities: ['parking', 'gym', 'pool'],
        view_count: 45,
        favorite_count: 8,
        contact_count: 3,
        contact_whatsapp: '+50499887766',
        created_at: '2024-01-15T10:30:00Z',
        updated_at: '2024-01-20T15:45:00Z',
        property_locations: [{
          street_address: 'Col. Lomas del Guijarro Sur',
          neighborhood: 'Lomas del Guijarro',
          city: 'Tegucigalpa',
          formatted_address: 'Col. Lomas del Guijarro Sur, Tegucigalpa, Honduras',
          coordinates: {
            coordinates: [-87.2072, 14.0723]
          }
        }],
        property_images: [{
          id: 'img-1',
          image_url: 'https://example.com/image1.jpg',
          alt_text: 'Vista frontal del apartamento',
          is_primary: true,
          display_order: 1
        }],
        landlords: {
          id: 'landlord-1',
          business_name: 'Inmobiliaria Central',
          whatsapp_number: '+50499887766',
          rating: 4.5,
          verification_status: 'verified'
        }
      }
    ];

    it('should search properties with basic filters', async () => {
      // Setup mocks
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        contains: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
      };

      mockSupabaseClient.from.mockReturnValue(mockQuery);
      mockQuery.select.mockResolvedValue({
        data: mockPropertyData,
        error: null,
        count: 1
      });

      const result = await propertyService.searchProperties(mockFilters);

      expect(result).toBeDefined();
      expect(result.properties).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.properties[0].id).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(result.properties[0].title).toBe('Apartamento en Lomas del Guijarro');
      expect(result.properties[0].price.amount).toBe(15000);
      expect(result.properties[0].coordinates.lat).toBe(14.0723);
      expect(result.properties[0].coordinates.lng).toBe(-87.2072);
    });

    it('should handle search with coordinates and radius', async () => {
      const filtersWithCoords: SearchFilters = {
        ...mockFilters,
        coordinates: { lat: 14.0723, lng: -87.2072 },
        radiusKm: 10
      };

      mockSupabaseClient.rpc.mockResolvedValue({
        data: mockPropertyData.map(p => ({
          property_id: p.id,
          title: p.title,
          price: p.price_amount,
          bedrooms: p.bedrooms,
          bathrooms: p.bathrooms,
          area_sqm: p.area_sqm,
          amenities: p.amenities,
          lat: 14.0723,
          lng: -87.2072,
          distance_km: 2.5,
          address: p.property_locations[0].formatted_address,
          images: []
        })),
        error: null
      });

      const result = await propertyService.searchProperties(filtersWithCoords);

      expect(mockSupabaseClient.rpc).toHaveBeenCalledWith('search_properties_nearby', {
        p_lat: 14.0723,
        p_lng: -87.2072,
        p_radius_km: 10,
        p_filters: {
          price_min: 5000,
          price_max: 20000,
          bedrooms: [2, 3],
          property_types: ['apartment'],
          limit: 24
        }
      });

      expect(result.properties).toHaveLength(1);
      expect(result.properties[0].distance).toBe(2.5);
    });

    it('should handle sorting options correctly', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        contains: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
      };

      mockSupabaseClient.from.mockReturnValue(mockQuery);
      mockQuery.select.mockResolvedValue({ data: [], error: null, count: 0 });

      // Test different sorting options
      const sortOptions = ['precio_asc', 'precio_desc', 'reciente', 'relevancia'] as const;

      for (const sortBy of sortOptions) {
        await propertyService.searchProperties({ ...mockFilters, sortBy });
        
        if (sortBy === 'precio_asc') {
          expect(mockQuery.order).toHaveBeenCalledWith('price_amount', { ascending: true });
        } else if (sortBy === 'precio_desc') {
          expect(mockQuery.order).toHaveBeenCalledWith('price_amount', { ascending: false });
        } else if (sortBy === 'reciente') {
          expect(mockQuery.order).toHaveBeenCalledWith('created_at', { ascending: false });
        }
      }
    });

    it('should handle search errors gracefully', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        contains: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
      };

      mockSupabaseClient.from.mockReturnValue(mockQuery);
      mockQuery.select.mockResolvedValue({
        data: null,
        error: { message: 'Database connection failed', code: 'CONNECTION_ERROR' },
        count: null
      });

      await expect(propertyService.searchProperties(mockFilters))
        .rejects.toThrow('Failed to search properties');
    });

    it('should handle pagination correctly', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        contains: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
      };

      mockSupabaseClient.from.mockReturnValue(mockQuery);
      mockQuery.select.mockResolvedValue({ data: mockPropertyData, error: null, count: 1 });

      const filtersWithCursor: SearchFilters = {
        ...mockFilters,
        cursor: '24',
        limit: 12
      };

      await propertyService.searchProperties(filtersWithCursor);

      expect(mockQuery.range).toHaveBeenCalledWith(24, 35); // 24 + 12 - 1
    });
  });

  describe('getPropertyById', () => {
    const propertyId = '123e4567-e89b-12d3-a456-426614174000';
    const mockDetailedPropertyData = {
      id: propertyId,
      title: 'Apartamento en Lomas del Guijarro',
      description: 'Apartamento moderno completamente equipado',
      type: 'apartment',
      price_amount: 15000,
      currency: 'HNL',
      bedrooms: 2,
      bathrooms: 2,
      area_sqm: 85,
      amenities: ['parking', 'gym', 'pool'],
      view_count: 45,
      favorite_count: 8,
      contact_count: 3,
      contact_whatsapp: '+50499887766',
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-01-20T15:45:00Z',
      floor: 5,
      total_floors: 12,
      year_built: 2020,
      parking_spaces: 1,
      utilities_included: true,
      deposit_months: 2,
      minimum_stay_months: 12,
      maximum_occupants: 4,
      pets_allowed: false,
      video_tour_url: 'https://example.com/tour.mp4',
      property_locations: {
        street_address: 'Col. Lomas del Guijarro Sur',
        neighborhood: 'Lomas del Guijarro',
        city: 'Tegucigalpa',
        formatted_address: 'Col. Lomas del Guijarro Sur, Tegucigalpa, Honduras',
        coordinates: {
          coordinates: [-87.2072, 14.0723]
        }
      },
      property_images: [{
        id: 'img-1',
        image_url: 'https://example.com/image1.jpg',
        alt_text: 'Vista frontal del apartamento',
        is_primary: true,
        display_order: 1
      }],
      landlords: {
        id: 'landlord-1',
        business_name: 'Inmobiliaria Central',
        whatsapp_number: '+50499887766',
        rating: 4.5,
        verification_status: 'verified'
      }
    };

    it('should get property by ID successfully', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockDetailedPropertyData,
          error: null
        })
      };

      mockSupabaseClient.from.mockReturnValue(mockQuery);
      mockSupabaseClient.rpc = vi.fn().mockResolvedValue({ error: null });

      const result = await propertyService.getPropertyById(propertyId);

      expect(result).toBeDefined();
      expect(result?.id).toBe(propertyId);
      expect(result?.title).toBe('Apartamento en Lomas del Guijarro');
      expect(result?.floor).toBe(5);
      expect(result?.utilitiesIncluded).toBe(true);
      expect(result?.petsAllowed).toBe(false);
      expect(mockSupabaseClient.rpc).toHaveBeenCalledWith('increment_property_view_count', {
        p_property_id: propertyId
      });
    });

    it('should return null for non-existent property', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116', message: 'No rows found' }
        })
      };

      mockSupabaseClient.from.mockReturnValue(mockQuery);

      const result = await propertyService.getPropertyById('non-existent-id');

      expect(result).toBeNull();
    });

    it('should handle database errors', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { code: 'CONNECTION_ERROR', message: 'Database unavailable' }
        })
      };

      mockSupabaseClient.from.mockReturnValue(mockQuery);

      await expect(propertyService.getPropertyById(propertyId))
        .rejects.toThrow('Failed to get property');
    });
  });

  describe('getPropertiesInBounds', () => {
    const mockBounds: MapBounds = {
      north: 14.1723,
      south: 13.9723,
      east: -87.1072,
      west: -87.3072
    };

    const mockBoundsData = [
      {
        property_id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Apartamento Centro',
        property_type: 'apartment',
        neighborhood: 'Centro',
        lat: 14.0723,
        lng: -87.2072,
        price_amount: 12000,
        bedrooms: 2,
        bathrooms: 2,
        area_sqm: 75,
        view_count: 30,
        favorite_count: 5,
        contact_whatsapp: '+50499887766',
        landlord_name: 'Juan Pérez',
        images: []
      }
    ];

    it('should get properties within bounds successfully', async () => {
      mockSupabaseClient.rpc.mockResolvedValue({
        data: mockBoundsData,
        error: null
      });

      const result = await propertyService.getPropertiesInBounds(mockBounds);

      expect(mockSupabaseClient.rpc).toHaveBeenCalledWith('get_properties_in_bounds', {
        p_bounds: mockBounds,
        p_filters: {
          price_min: undefined,
          price_max: undefined,
          bedrooms: null,
          property_types: null,
        },
        p_limit: 100
      });

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(result[0].coordinates.lat).toBe(14.0723);
      expect(result[0].coordinates.lng).toBe(-87.2072);
    });

    it('should apply filters when getting properties in bounds', async () => {
      const filters = {
        priceMin: 10000,
        priceMax: 20000,
        bedrooms: [2, 3],
        propertyTypes: ['apartment' as const]
      };

      mockSupabaseClient.rpc.mockResolvedValue({ data: [], error: null });

      await propertyService.getPropertiesInBounds(mockBounds, filters, 50);

      expect(mockSupabaseClient.rpc).toHaveBeenCalledWith('get_properties_in_bounds', {
        p_bounds: mockBounds,
        p_filters: {
          price_min: 10000,
          price_max: 20000,
          bedrooms: [2, 3],
          property_types: ['apartment'],
        },
        p_limit: 50
      });
    });

    it('should handle PostGIS function errors', async () => {
      mockSupabaseClient.rpc.mockResolvedValue({
        data: null,
        error: { message: 'PostGIS function failed', code: 'FUNCTION_ERROR' }
      });

      await expect(propertyService.getPropertiesInBounds(mockBounds))
        .rejects.toThrow('Failed to get properties in bounds');
    });
  });

  describe('clusterProperties', () => {
    const mockBounds: MapBounds = {
      north: 14.1723,
      south: 13.9723,
      east: -87.1072,
      west: -87.3072
    };

    const mockClusterData = [
      {
        cluster_id: 1,
        centroid_lat: 14.0723,
        centroid_lng: -87.2072,
        property_count: 5,
        avg_price: 15000,
        min_price: 12000,
        max_price: 18000,
        property_ids: ['id1', 'id2', 'id3', 'id4', 'id5']
      }
    ];

    it('should cluster properties by zoom level', async () => {
      mockSupabaseClient.rpc.mockResolvedValue({
        data: mockClusterData,
        error: null
      });

      const result = await propertyService.clusterProperties(mockBounds, 12);

      expect(mockSupabaseClient.rpc).toHaveBeenCalledWith('cluster_properties_by_zoom', {
        p_bounds: mockBounds,
        p_zoom: 12,
        p_filters: {
          price_min: undefined,
          price_max: undefined,
          bedrooms: null,
          property_types: null,
        }
      });

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
      expect(result[0].count).toBe(5);
      expect(result[0].avgPrice).toBe(15000);
      expect(result[0].coordinates.lat).toBe(14.0723);
    });

    it('should handle clustering errors', async () => {
      mockSupabaseClient.rpc.mockResolvedValue({
        data: null,
        error: { message: 'Clustering failed', code: 'CLUSTERING_ERROR' }
      });

      await expect(propertyService.clusterProperties(mockBounds, 12))
        .rejects.toThrow('Failed to cluster properties');
    });
  });

  describe('getAutocompleteSuggestions', () => {
    it('should get neighborhood suggestions', async () => {
      const mockNeighborhoods = [
        { id: 1, name: 'Lomas del Guijarro', properties_count: 45 },
        { id: 2, name: 'Los Próceres', properties_count: 32 }
      ];

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        ilike: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({
          data: mockNeighborhoods,
          error: null
        })
      };

      mockSupabaseClient.from.mockReturnValue(mockQuery);

      const result = await propertyService.getAutocompleteSuggestions('Lomas');

      expect(result).toHaveLength(2);
      expect(result[0].text).toBe('Lomas del Guijarro');
      expect(result[0].type).toBe('location');
      expect(result[0].metadata?.propertyCount).toBe(45);
    });

    it('should include property type suggestions for longer queries', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        ilike: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: [], error: null })
      };

      mockSupabaseClient.from.mockReturnValue(mockQuery);

      const result = await propertyService.getAutocompleteSuggestions('apartamento');

      expect(result.some(s => s.text === 'Apartamentos')).toBe(true);
      expect(result.some(s => s.type === 'filter')).toBe(true);
    });

    it('should handle autocomplete errors gracefully', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        ilike: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' }
        })
      };

      mockSupabaseClient.from.mockReturnValue(mockQuery);

      const result = await propertyService.getAutocompleteSuggestions('test');

      expect(result).toEqual([]);
    });
  });

  describe('getSimilarProperties', () => {
    const propertyId = '123e4567-e89b-12d3-a456-426614174000';

    it('should get similar properties based on criteria', async () => {
      // Mock the base property
      const baseProperty: Property = {
        id: propertyId,
        title: 'Base Property',
        description: 'Test property',
        type: 'apartment',
        address: 'Test Address',
        neighborhood: 'Test Neighborhood',
        coordinates: { lat: 14.0723, lng: -87.2072 },
        price: { amount: 15000, currency: 'HNL', period: 'month' },
        bedrooms: 2,
        bathrooms: 2,
        areaSqm: 85,
        amenities: [],
        images: [],
        viewCount: 0,
        favoriteCount: 0,
        contactCount: 0,
        contactPhone: '',
        landlord: {
          id: '',
          name: '',
          phone: '',
          rating: 0,
          verified: false
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Mock getPropertyById to return base property
      vi.spyOn(propertyService, 'getPropertyById').mockResolvedValue(baseProperty);

      const mockSimilarData = [
        {
          id: 'similar-1',
          title: 'Similar Property',
          price_amount: 14000,
          bedrooms: 2,
          bathrooms: 2,
          area_sqm: 80,
          type: 'apartment',
          property_locations: [{ neighborhood: 'Test Area', coordinates: { coordinates: [-87.2, 14.07] } }],
          property_images: [],
          landlords: { business_name: 'Test Landlord' }
        }
      ];

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        neq: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({
          data: mockSimilarData,
          error: null
        })
      };

      mockSupabaseClient.from.mockReturnValue(mockQuery);

      const result = await propertyService.getSimilarProperties(propertyId);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('similar-1');
      expect(mockQuery.eq).toHaveBeenCalledWith('type', 'apartment');
      expect(mockQuery.neq).toHaveBeenCalledWith('id', propertyId);
    });

    it('should return empty array if base property not found', async () => {
      vi.spyOn(propertyService, 'getPropertyById').mockResolvedValue(null);

      const result = await propertyService.getSimilarProperties('non-existent');

      expect(result).toEqual([]);
    });
  });

  describe('toggleFavorite', () => {
    const userId = 'user-123';
    const propertyId = '123e4567-e89b-12d3-a456-426614174000';

    it('should add favorite when not already favorited', async () => {
      // Mock checking existing favorite (not found)
      const mockSelectQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116' }
        })
      };

      // Mock insert operation
      const mockInsertQuery = {
        insert: vi.fn().mockResolvedValue({
          data: { id: 'fav-1' },
          error: null
        })
      };

      mockSupabaseClient.from
        .mockReturnValueOnce(mockSelectQuery)
        .mockReturnValueOnce(mockInsertQuery);

      mockSupabaseClient.rpc.mockResolvedValue({ error: null });

      const result = await propertyService.toggleFavorite(userId, propertyId);

      expect(result.isFavorite).toBe(true);
      expect(mockSupabaseClient.rpc).toHaveBeenCalledWith('increment_property_favorite_count', {
        p_property_id: propertyId
      });
    });

    it('should remove favorite when already favorited', async () => {
      // Mock checking existing favorite (found)
      const mockSelectQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 'existing-fav' },
          error: null
        })
      };

      // Mock delete operation
      const mockDeleteQuery = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({
          data: null,
          error: null
        })
      };

      mockSupabaseClient.from
        .mockReturnValueOnce(mockSelectQuery)
        .mockReturnValueOnce(mockDeleteQuery);

      mockSupabaseClient.rpc.mockResolvedValue({ error: null });

      const result = await propertyService.toggleFavorite(userId, propertyId);

      expect(result.isFavorite).toBe(false);
      expect(mockSupabaseClient.rpc).toHaveBeenCalledWith('decrement_property_favorite_count', {
        p_property_id: propertyId
      });
    });
  });

  describe('trackPropertyView', () => {
    it('should track property view event', async () => {
      const mockInsertQuery = {
        insert: vi.fn().mockResolvedValue({
          data: { id: 'view-1' },
          error: null
        })
      };

      mockSupabaseClient.from.mockReturnValue(mockInsertQuery);
      mockSupabaseClient.rpc.mockResolvedValue({ error: null });

      const viewEvent: PropertyViewEvent = {
        propertyId: '123e4567-e89b-12d3-a456-426614174000',
        source: 'lista',
        userId: 'user-123',
        sessionId: 'session-456',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        referrer: 'https://google.com'
      };

      await propertyService.trackPropertyView(viewEvent);

      expect(mockInsertQuery.insert).toHaveBeenCalledWith({
        property_id: viewEvent.propertyId,
        user_id: viewEvent.userId,
        session_id: viewEvent.sessionId,
        ip_address: viewEvent.ipAddress,
        user_agent: viewEvent.userAgent,
        referrer: viewEvent.referrer,
        source: viewEvent.source,
      });

      expect(mockSupabaseClient.rpc).toHaveBeenCalledWith('increment_property_view_count', {
        p_property_id: viewEvent.propertyId
      });
    });

    it('should handle tracking errors gracefully', async () => {
      const mockInsertQuery = {
        insert: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Insert failed' }
        })
      };

      mockSupabaseClient.from.mockReturnValue(mockInsertQuery);

      const viewEvent: PropertyViewEvent = {
        propertyId: '123e4567-e89b-12d3-a456-426614174000',
        source: 'lista'
      };

      // Should not throw error
      await expect(propertyService.trackPropertyView(viewEvent))
        .resolves.toBeUndefined();
    });
  });

  describe('trackPropertyContact', () => {
    it('should track successful contact event', async () => {
      const mockInsertQuery = {
        insert: vi.fn().mockResolvedValue({
          data: { id: 'contact-1' },
          error: null
        })
      };

      mockSupabaseClient.from.mockReturnValue(mockInsertQuery);
      mockSupabaseClient.rpc.mockResolvedValue({ error: null });

      const contactEvent: PropertyContactEvent = {
        propertyId: '123e4567-e89b-12d3-a456-426614174000',
        source: 'modal',
        contactMethod: 'whatsapp',
        userId: 'user-123',
        sessionId: 'session-456',
        phoneNumber: '+50499887766',
        success: true,
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0'
      };

      await propertyService.trackPropertyContact(contactEvent);

      expect(mockInsertQuery.insert).toHaveBeenCalledWith({
        property_id: contactEvent.propertyId,
        user_id: contactEvent.userId,
        session_id: contactEvent.sessionId,
        contact_method: contactEvent.contactMethod,
        phone_number: contactEvent.phoneNumber,
        success: contactEvent.success,
        error_message: contactEvent.errorMessage,
      });

      expect(mockSupabaseClient.rpc).toHaveBeenCalledWith('increment_property_contact_count', {
        p_property_id: contactEvent.propertyId
      });
    });

    it('should not increment contact count for failed contacts', async () => {
      const mockInsertQuery = {
        insert: vi.fn().mockResolvedValue({
          data: { id: 'contact-1' },
          error: null
        })
      };

      mockSupabaseClient.from.mockReturnValue(mockInsertQuery);
      mockSupabaseClient.rpc.mockResolvedValue({ error: null });

      const contactEvent: PropertyContactEvent = {
        propertyId: '123e4567-e89b-12d3-a456-426614174000',
        source: 'modal',
        contactMethod: 'whatsapp',
        success: false,
        errorMessage: 'WhatsApp API unavailable'
      };

      await propertyService.trackPropertyContact(contactEvent);

      expect(mockSupabaseClient.rpc).not.toHaveBeenCalledWith('increment_property_contact_count', 
        expect.any(Object));
    });
  });

  describe('getSearchFacets', () => {
    it('should return default facets structure', async () => {
      const result = await propertyService.getSearchFacets();

      expect(result).toHaveProperty('neighborhoods');
      expect(result).toHaveProperty('priceRanges');
      expect(result).toHaveProperty('propertyTypes');
      expect(result).toHaveProperty('amenities');
      expect(result.priceRanges).toHaveLength(5);
      expect(result.propertyTypes).toHaveLength(4);
    });

    it('should handle facet errors gracefully', async () => {
      // Mock error scenario by overriding the method
      const originalGetSearchFacets = propertyService.getSearchFacets;
      propertyService.getSearchFacets = vi.fn().mockRejectedValue(new Error('Facet error'));

      const result = await propertyService.getSearchFacets();

      expect(result).toEqual({
        neighborhoods: [],
        priceRanges: [],
        propertyTypes: [],
        amenities: [],
      });

      // Restore original method
      propertyService.getSearchFacets = originalGetSearchFacets;
    });
  });
});