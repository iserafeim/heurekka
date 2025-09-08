import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SupabaseService } from '@/services/supabase';
import { mockProperties, mockHomepageData, mockSuggestions, mockSearchResults, mockLocation, validAnalyticsEvent } from '../fixtures/propertyFixtures';

// Mock Supabase client
const createMockSupabaseClient = () => ({
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  range: vi.fn().mockReturnThis(),
  gte: vi.fn().mockReturnThis(),
  lte: vi.fn().mockReturnThis(),
  in: vi.fn().mockReturnThis(),
  contains: vi.fn().mockReturnThis(),
  textSearch: vi.fn().mockReturnThis(),
  ilike: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  upsert: vi.fn().mockReturnThis(),
  single: vi.fn().mockReturnThis(),
  rpc: vi.fn().mockReturnThis(),
});

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => createMockSupabaseClient())
}));

describe('SupabaseService', () => {
  let supabaseService: any;
  let mockClient: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock environment variables
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_KEY = 'test-service-key';
    
    supabaseService = new SupabaseService();
    mockClient = supabaseService.client;
  });

  afterEach(() => {
    vi.resetAllMocks();
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_KEY;
  });

  describe('constructor', () => {
    it('should throw error when SUPABASE_URL is missing', () => {
      delete process.env.SUPABASE_URL;
      
      expect(() => new SupabaseService()).toThrow('Missing Supabase configuration');
    });

    it('should throw error when SUPABASE_SERVICE_KEY is missing', () => {
      delete process.env.SUPABASE_SERVICE_KEY;
      
      expect(() => new SupabaseService()).toThrow('Missing Supabase configuration');
    });

    it('should create client with correct configuration', () => {
      const { createClient } = require('@supabase/supabase-js');
      
      new SupabaseService();
      
      expect(createClient).toHaveBeenCalledWith(
        'https://test.supabase.co',
        'test-service-key',
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      );
    });
  });

  describe('getFeaturedProperties', () => {
    beforeEach(() => {
      mockClient.from.mockReturnValue(mockClient);
      mockClient.select.mockReturnValue(mockClient);
      mockClient.eq.mockReturnValue(mockClient);
      mockClient.order.mockReturnValue(mockClient);
      mockClient.limit.mockReturnValue(mockClient);
    });

    it('should fetch featured properties successfully', async () => {
      const mockData = [
        { id: '1', title: 'Test Property', featured: true, status: 'active' }
      ];
      mockClient.eq.mockResolvedValue({ data: mockData, error: null });

      const result = await supabaseService.getFeaturedProperties(6);

      expect(mockClient.from).toHaveBeenCalledWith('properties');
      expect(mockClient.eq).toHaveBeenCalledWith('status', 'active');
      expect(mockClient.eq).toHaveBeenCalledWith('featured', true);
      expect(mockClient.limit).toHaveBeenCalledWith(6);
      expect(result).toBeDefined();
    });

    it('should apply location-based ordering when user location provided', async () => {
      const mockData = [{ id: '1', title: 'Test Property' }];
      mockClient.order.mockResolvedValue({ data: mockData, error: null });

      await supabaseService.getFeaturedProperties(6, mockLocation);

      expect(mockClient.order).toHaveBeenCalledWith(
        `location <-> point(${mockLocation.lng},${mockLocation.lat})`
      );
    });

    it('should handle database errors', async () => {
      const mockError = new Error('Database connection failed');
      mockClient.limit.mockResolvedValue({ data: null, error: mockError });

      await expect(supabaseService.getFeaturedProperties(6)).rejects.toThrow(
        'Failed to fetch featured properties'
      );

      expect(console.error).toHaveBeenCalledWith('Error fetching featured properties:', mockError);
    });

    it('should return empty array when no data', async () => {
      mockClient.limit.mockResolvedValue({ data: null, error: null });

      const result = await supabaseService.getFeaturedProperties(6);

      expect(result).toEqual([]);
    });

    it('should use default limit when not specified', async () => {
      mockClient.limit.mockResolvedValue({ data: [], error: null });

      await supabaseService.getFeaturedProperties();

      expect(mockClient.limit).toHaveBeenCalledWith(6);
    });
  });

  describe('searchProperties', () => {
    beforeEach(() => {
      mockClient.from.mockReturnValue(mockClient);
      mockClient.select.mockReturnValue(mockClient);
      mockClient.eq.mockReturnValue(mockClient);
      mockClient.textSearch.mockReturnValue(mockClient);
      mockClient.gte.mockReturnValue(mockClient);
      mockClient.lte.mockReturnValue(mockClient);
      mockClient.in.mockReturnValue(mockClient);
      mockClient.contains.mockReturnValue(mockClient);
      mockClient.order.mockReturnValue(mockClient);
      mockClient.range.mockReturnValue(mockClient);

      // Mock getSearchFacets method
      vi.spyOn(supabaseService, 'getSearchFacets').mockResolvedValue({
        neighborhoods: [],
        priceRanges: [],
        propertyTypes: []
      });
    });

    it('should search properties with text query', async () => {
      const mockData = [{ id: '1', title: 'Test Property' }];
      mockClient.range.mockResolvedValue({ data: mockData, error: null, count: 1 });

      const searchParams = {
        query: 'apartment',
        page: 1,
        limit: 20
      };

      const result = await supabaseService.searchProperties(searchParams);

      expect(mockClient.textSearch).toHaveBeenCalledWith('search_vector', 'apartment');
      expect(result.properties).toBeDefined();
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });

    it('should apply price filters', async () => {
      mockClient.range.mockResolvedValue({ data: [], error: null, count: 0 });

      const searchParams = {
        filters: {
          priceMin: 1000,
          priceMax: 5000
        }
      };

      await supabaseService.searchProperties(searchParams);

      expect(mockClient.gte).toHaveBeenCalledWith('price_amount', 1000);
      expect(mockClient.lte).toHaveBeenCalledWith('price_amount', 5000);
    });

    it('should apply property type filters', async () => {
      mockClient.range.mockResolvedValue({ data: [], error: null, count: 0 });

      const searchParams = {
        filters: {
          propertyTypes: ['apartment', 'house']
        }
      };

      await supabaseService.searchProperties(searchParams);

      expect(mockClient.in).toHaveBeenCalledWith('type', ['apartment', 'house']);
    });

    it('should apply bedroom and bathroom filters', async () => {
      mockClient.range.mockResolvedValue({ data: [], error: null, count: 0 });

      const searchParams = {
        filters: {
          bedrooms: [2, 3],
          bathrooms: [1, 2]
        }
      };

      await supabaseService.searchProperties(searchParams);

      expect(mockClient.in).toHaveBeenCalledWith('bedrooms', [2, 3]);
      expect(mockClient.in).toHaveBeenCalledWith('bathrooms', [1, 2]);
    });

    it('should apply amenities filter', async () => {
      mockClient.range.mockResolvedValue({ data: [], error: null, count: 0 });

      const searchParams = {
        filters: {
          amenities: ['parking', 'pool']
        }
      };

      await supabaseService.searchProperties(searchParams);

      expect(mockClient.contains).toHaveBeenCalledWith('amenities', ['parking', 'pool']);
    });

    it('should apply different sorting options', async () => {
      mockClient.range.mockResolvedValue({ data: [], error: null, count: 0 });

      // Test price ascending
      await supabaseService.searchProperties({ sortBy: 'price_asc' });
      expect(mockClient.order).toHaveBeenCalledWith('price_amount', { ascending: true });

      // Test price descending
      await supabaseService.searchProperties({ sortBy: 'price_desc' });
      expect(mockClient.order).toHaveBeenCalledWith('price_amount', { ascending: false });

      // Test date descending
      await supabaseService.searchProperties({ sortBy: 'date_desc' });
      expect(mockClient.order).toHaveBeenCalledWith('created_at', { ascending: false });

      // Test distance sorting with location
      await supabaseService.searchProperties({ 
        sortBy: 'distance', 
        location: mockLocation 
      });
      expect(console.log).toHaveBeenCalledWith(
        `Distance sorting requested for location: ${mockLocation.lat}, ${mockLocation.lng}`
      );
    });

    it('should apply pagination correctly', async () => {
      mockClient.range.mockResolvedValue({ data: [], error: null, count: 0 });

      const searchParams = {
        page: 2,
        limit: 10
      };

      await supabaseService.searchProperties(searchParams);

      expect(mockClient.range).toHaveBeenCalledWith(10, 19); // offset 10, end 19
    });

    it('should handle database errors', async () => {
      const mockError = new Error('Search failed');
      mockClient.range.mockResolvedValue({ data: null, error: mockError, count: null });

      await expect(supabaseService.searchProperties({})).rejects.toThrow(
        'Failed to search properties'
      );

      expect(console.error).toHaveBeenCalledWith('Error searching properties:', mockError);
    });

    it('should use default values for optional parameters', async () => {
      mockClient.range.mockResolvedValue({ data: [], error: null, count: 0 });

      const result = await supabaseService.searchProperties({});

      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(mockClient.range).toHaveBeenCalledWith(0, 19);
    });

    it('should log location filtering when location provided', async () => {
      mockClient.range.mockResolvedValue({ data: [], error: null, count: 0 });

      await supabaseService.searchProperties({ location: mockLocation });

      expect(console.log).toHaveBeenCalledWith(
        `Filtering by location: ${mockLocation.lat}, ${mockLocation.lng} with radius 25km`
      );
    });
  });

  describe('getSearchSuggestions', () => {
    beforeEach(() => {
      mockClient.from.mockReturnValue(mockClient);
      mockClient.select.mockReturnValue(mockClient);
      mockClient.ilike.mockReturnValue(mockClient);
      mockClient.limit.mockReturnValue(mockClient);
      mockClient.order.mockReturnValue(mockClient);
    });

    it('should fetch neighborhood and popular search suggestions', async () => {
      const mockNeighborhoods = [
        { id: '1', name: 'Lomas del Guijarro', property_count: 45 }
      ];
      const mockPopularSearches = [
        { query: 'apartment tegucigalpa', search_count: 100 }
      ];

      mockClient.limit
        .mockResolvedValueOnce({ data: mockNeighborhoods, error: null })
        .mockResolvedValueOnce({ data: mockPopularSearches, error: null });

      const result = await supabaseService.getSearchSuggestions('apartment', mockLocation, 5);

      expect(mockClient.ilike).toHaveBeenCalledWith('name', '%apartment%');
      expect(mockClient.ilike).toHaveBeenCalledWith('query', '%apartment%');
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle empty query results', async () => {
      mockClient.limit
        .mockResolvedValueOnce({ data: null, error: null })
        .mockResolvedValueOnce({ data: null, error: null });

      const result = await supabaseService.getSearchSuggestions('nonexistent', undefined, 5);

      expect(result).toEqual([]);
    });

    it('should use default limit when not specified', async () => {
      mockClient.limit
        .mockResolvedValueOnce({ data: [], error: null })
        .mockResolvedValueOnce({ data: [], error: null });

      await supabaseService.getSearchSuggestions('apartment');

      expect(mockClient.limit).toHaveBeenCalledWith(3); // Math.ceil(5/2)
      expect(mockClient.limit).toHaveBeenCalledWith(2); // Math.floor(5/2)
    });

    it('should return empty array on database errors', async () => {
      const mockError = new Error('Database error');
      mockClient.limit.mockRejectedValue(mockError);

      const result = await supabaseService.getSearchSuggestions('apartment');

      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalledWith('Database error in getSearchSuggestions:', mockError);
    });

    it('should limit results to requested amount', async () => {
      const manyNeighborhoods = Array.from({ length: 10 }, (_, i) => ({
        id: i.toString(),
        name: `Neighborhood ${i}`,
        property_count: 10
      }));
      
      mockClient.limit
        .mockResolvedValueOnce({ data: manyNeighborhoods, error: null })
        .mockResolvedValueOnce({ data: [], error: null });

      const result = await supabaseService.getSearchSuggestions('test', undefined, 5);

      expect(result.length).toBeLessThanOrEqual(5);
    });
  });

  describe('getHomepageData', () => {
    it('should fetch all homepage data in parallel', async () => {
      vi.spyOn(supabaseService, 'getFeaturedProperties').mockResolvedValue(mockProperties);
      vi.spyOn(supabaseService, 'getPopularSearches').mockResolvedValue(['apartment', 'house']);
      vi.spyOn(supabaseService, 'getRecentListings').mockResolvedValue(mockProperties);
      vi.spyOn(supabaseService, 'getPopularNeighborhoods').mockResolvedValue([
        { name: 'Lomas del Guijarro', count: 45 }
      ]);
      vi.spyOn(supabaseService, 'getSearchMetrics').mockResolvedValue({
        totalProperties: 1250,
        averageResponseTime: 25,
        successfulMatches: 892
      });

      const result = await supabaseService.getHomepageData();

      expect(result.featuredProperties).toEqual(mockProperties);
      expect(result.popularSearches).toEqual(['apartment', 'house']);
      expect(result.recentListings).toEqual(mockProperties);
      expect(result.neighborhoods).toEqual([{ name: 'Lomas del Guijarro', count: 45 }]);
      expect(result.searchMetrics).toEqual({
        totalProperties: 1250,
        averageResponseTime: 25,
        successfulMatches: 892
      });
    });

    it('should handle errors and rethrow them', async () => {
      vi.spyOn(supabaseService, 'getFeaturedProperties').mockRejectedValue(new Error('Database error'));

      await expect(supabaseService.getHomepageData()).rejects.toThrow('Database error');
      expect(console.error).toHaveBeenCalledWith('Database error in getHomepageData:', expect.any(Error));
    });
  });

  describe('trackAnalyticsEvent', () => {
    beforeEach(() => {
      mockClient.from.mockReturnValue(mockClient);
      mockClient.insert.mockReturnValue(mockClient);
    });

    it('should insert analytics event successfully', async () => {
      mockClient.insert.mockResolvedValue({ error: null });

      await supabaseService.trackAnalyticsEvent(validAnalyticsEvent);

      expect(mockClient.from).toHaveBeenCalledWith('analytics_events');
      expect(mockClient.insert).toHaveBeenCalledWith({
        event_name: validAnalyticsEvent.name,
        event_properties: validAnalyticsEvent.properties,
        timestamp: new Date(validAnalyticsEvent.timestamp).toISOString(),
        session_id: validAnalyticsEvent.sessionId,
        user_id: validAnalyticsEvent.userId
      });
    });

    it('should handle database errors gracefully without throwing', async () => {
      const mockError = new Error('Insert failed');
      mockClient.insert.mockRejectedValue(mockError);

      await expect(supabaseService.trackAnalyticsEvent(validAnalyticsEvent)).resolves.not.toThrow();
      expect(console.error).toHaveBeenCalledWith('Error tracking analytics event:', mockError);
    });
  });

  describe('saveProperty', () => {
    beforeEach(() => {
      mockClient.from.mockReturnValue(mockClient);
      mockClient.upsert.mockReturnValue(mockClient);
      mockClient.rpc.mockReturnValue(mockClient);
    });

    it('should save property successfully', async () => {
      mockClient.upsert.mockResolvedValue({ error: null });
      mockClient.rpc.mockResolvedValue({ error: null });

      await supabaseService.saveProperty('user-123', 'prop-456');

      expect(mockClient.from).toHaveBeenCalledWith('saved_properties');
      expect(mockClient.upsert).toHaveBeenCalledWith({
        user_id: 'user-123',
        property_id: 'prop-456',
        saved_at: expect.any(String)
      }, {
        onConflict: 'user_id,property_id'
      });
      expect(mockClient.rpc).toHaveBeenCalledWith('increment_property_save_count', { 
        property_id: 'prop-456' 
      });
    });

    it('should handle upsert errors', async () => {
      const mockError = new Error('Upsert failed');
      mockClient.upsert.mockResolvedValue({ error: mockError });

      await expect(supabaseService.saveProperty('user-123', 'prop-456')).rejects.toThrow(
        'Failed to save property'
      );
      expect(console.error).toHaveBeenCalledWith('Error saving property:', mockError);
    });

    it('should handle RPC call errors', async () => {
      mockClient.upsert.mockResolvedValue({ error: null });
      mockClient.rpc.mockRejectedValue(new Error('RPC failed'));

      await expect(supabaseService.saveProperty('user-123', 'prop-456')).rejects.toThrow();
      expect(console.error).toHaveBeenCalledWith('Error saving property:', expect.any(Error));
    });
  });

  describe('private helper methods', () => {
    describe('transformPropertyData', () => {
      it('should transform raw database data to Property type', () => {
        const rawData = {
          id: 'prop-123',
          title: 'Test Property',
          description: 'Test description',
          type: 'apartment',
          address: { street: 'Test St', city: 'Test City' },
          location: { coordinates: [-87.1921, 14.0723] },
          price_amount: 25000,
          price_currency: 'HNL',
          price_period: 'month',
          size_value: 120,
          size_unit: 'm2',
          bedrooms: 2,
          bathrooms: 2,
          amenities: ['parking', 'security'],
          property_images: [{
            id: 'img-1',
            url: 'https://example.com/image.jpg',
            thumbnail_url: 'https://example.com/thumb.jpg',
            width: 800,
            height: 600,
            order: 1
          }],
          virtual_tour_url: 'https://example.com/tour',
          video_url: 'https://example.com/video.mp4',
          available_from: '2024-10-01',
          minimum_stay: 6,
          maximum_stay: 24,
          created_at: '2024-09-01T10:00:00Z',
          updated_at: '2024-09-07T15:30:00Z',
          view_count: 45,
          save_count: 8,
          response_time: 30,
          verification_status: 'verified',
          landlords: {
            id: 'landlord-123',
            name: 'John Doe',
            photo_url: 'https://example.com/john.jpg',
            rating: 4.8,
            response_rate: 95,
            whatsapp_enabled: true
          }
        };

        const transformed = supabaseService.transformPropertyData(rawData);

        expect(transformed.id).toBe('prop-123');
        expect(transformed.title).toBe('Test Property');
        expect(transformed.coordinates.lat).toBe(14.0723);
        expect(transformed.coordinates.lng).toBe(-87.1921);
        expect(transformed.price.amount).toBe(25000);
        expect(transformed.price.currency).toBe('HNL');
        expect(transformed.images).toHaveLength(1);
        expect(transformed.images[0].alt).toBe('Test Property');
        expect(transformed.landlord.name).toBe('John Doe');
        expect(transformed.availableFrom).toBeInstanceOf(Date);
        expect(transformed.createdAt).toBeInstanceOf(Date);
      });

      it('should handle missing optional fields with defaults', () => {
        const minimalRawData = {
          id: 'prop-123',
          title: 'Minimal Property',
          description: 'Test',
          type: 'apartment',
          bedrooms: 1,
          bathrooms: 1,
          available_from: '2024-10-01',
          created_at: '2024-09-01T10:00:00Z',
          updated_at: '2024-09-07T15:30:00Z'
        };

        const transformed = supabaseService.transformPropertyData(minimalRawData);

        expect(transformed.price.currency).toBe('HNL');
        expect(transformed.size.unit).toBe('m2');
        expect(transformed.amenities).toEqual([]);
        expect(transformed.images).toEqual([]);
        expect(transformed.viewCount).toBe(0);
        expect(transformed.saveCount).toBe(0);
        expect(transformed.responseTime).toBe(60);
        expect(transformed.verificationStatus).toBe('pending');
        expect(transformed.landlord.name).toBe('Property Owner');
        expect(transformed.landlord.rating).toBe(4.5);
        expect(transformed.landlord.responseRate).toBe(85);
        expect(transformed.landlord.whatsappEnabled).toBe(true);
      });
    });
  });
});