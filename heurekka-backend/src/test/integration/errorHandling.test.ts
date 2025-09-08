import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { initTRPC, TRPCError } from '@trpc/server';
import { homepageRouter } from '@/routers/homepage';
import { createMockContext } from '../utils/testHelpers';
import {
  createMockSupabaseService,
  createMockCacheService,
  createMockSearchEngine,
  createRateLimitedCacheService,
  createErrorMockService
} from '../mocks/serviceMocks';

// Mock services with different error scenarios
const createErrorServices = () => ({
  supabaseDown: {
    ...createMockSupabaseService(),
    getFeaturedProperties: vi.fn().mockRejectedValue(new Error('Database connection failed')),
    searchProperties: vi.fn().mockRejectedValue(new Error('Query timeout')),
    getHomepageData: vi.fn().mockRejectedValue(new Error('Service unavailable')),
    trackAnalyticsEvent: vi.fn().mockRejectedValue(new Error('Analytics service down')),
    saveProperty: vi.fn().mockRejectedValue(new Error('Unable to save property'))
  },
  cacheDown: {
    ...createMockCacheService(),
    getFeaturedProperties: vi.fn().mockRejectedValue(new Error('Redis connection lost')),
    getHomepageData: vi.fn().mockRejectedValue(new Error('Cache unavailable')),
    setFeaturedProperties: vi.fn().mockRejectedValue(new Error('Cache write failed')),
    isRateLimited: vi.fn().mockRejectedValue(new Error('Rate limiter down'))
  },
  searchEngineDown: {
    ...createMockSearchEngine(),
    searchProperties: vi.fn().mockRejectedValue(new Error('Elasticsearch connection failed')),
    getSuggestions: vi.fn().mockRejectedValue(new Error('Search index corrupted')),
    healthCheck: vi.fn().mockRejectedValue(new Error('Health check failed'))
  }
});

describe('Error Handling and Edge Cases', () => {
  let createCaller: any;
  let errorServices: ReturnType<typeof createErrorServices>;

  beforeEach(() => {
    vi.clearAllMocks();
    errorServices = createErrorServices();
    
    const t = initTRPC.context<any>().create();
    createCaller = t.createCallerFactory(homepageRouter);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Database Connection Failures', () => {
    beforeEach(() => {
      vi.doMock('@/services/supabase', () => ({
        supabaseService: errorServices.supabaseDown
      }));
      vi.doMock('@/services/cache', () => ({
        cacheService: createMockCacheService()
      }));
      vi.doMock('@/services/searchEngine', () => ({
        searchEngine: createMockSearchEngine()
      }));
    });

    it('should handle database failures in getFeaturedProperties', async () => {
      const caller = createCaller(createMockContext());

      await expect(caller.getFeaturedProperties({ limit: 6 })).rejects.toThrow(TRPCError);
      expect(console.error).toHaveBeenCalledWith(
        'Error in getFeaturedProperties:',
        expect.objectContaining({ message: 'Database connection failed' })
      );
    });

    it('should handle database failures in getHomepageData', async () => {
      const caller = createCaller(createMockContext());

      await expect(caller.getHomepageData({})).rejects.toThrow(
        expect.objectContaining({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to load homepage data'
        })
      );
    });

    it('should handle analytics failures gracefully without breaking main flow', async () => {
      const caller = createCaller(createMockContext());
      const result = await caller.trackEvent({
        name: 'test_event',
        properties: { test: true },
        timestamp: Date.now(),
        sessionId: 'session-123'
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe('Analytics temporarily unavailable');
      expect(console.error).toHaveBeenCalledWith(
        'Error in trackEvent:',
        expect.any(Error)
      );
    });

    it('should handle property save failures', async () => {
      const context = createMockContext({
        req: {
          headers: { 'x-session-id': 'valid-session' }
        }
      });
      
      const caller = createCaller(context);

      await expect(caller.saveProperty({ 
        propertyId: '123e4567-e89b-12d3-a456-426614174000' 
      })).rejects.toThrow(
        expect.objectContaining({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to save property'
        })
      );
    });
  });

  describe('Cache Service Failures', () => {
    beforeEach(() => {
      vi.doMock('@/services/supabase', () => ({
        supabaseService: createMockSupabaseService()
      }));
      vi.doMock('@/services/cache', () => ({
        cacheService: errorServices.cacheDown
      }));
      vi.doMock('@/services/searchEngine', () => ({
        searchEngine: createMockSearchEngine()
      }));
    });

    it('should fallback to database when cache fails in getFeaturedProperties', async () => {
      const mockSupabase = createMockSupabaseService();
      vi.doMock('@/services/supabase', () => ({
        supabaseService: mockSupabase
      }));

      const caller = createCaller(createMockContext());
      
      // Should not throw, should fallback to database
      await expect(caller.getFeaturedProperties({ limit: 6 })).resolves.not.toThrow();
      expect(mockSupabase.getFeaturedProperties).toHaveBeenCalled();
    });

    it('should handle rate limiting service failures by allowing requests', async () => {
      const mockSearchEngine = createMockSearchEngine();
      vi.doMock('@/services/searchEngine', () => ({
        searchEngine: mockSearchEngine
      }));

      const caller = createCaller(createMockContext());
      
      // Should allow request when rate limiter fails (fail open)
      await expect(caller.searchProperties({
        query: 'apartment'
      })).resolves.not.toThrow();
      
      expect(mockSearchEngine.searchProperties).toHaveBeenCalled();
    });

    it('should handle cache write failures gracefully', async () => {
      const caller = createCaller(createMockContext());
      
      // Cache write failure shouldn't affect the main response
      const result = await caller.getFeaturedProperties({ limit: 6 });
      expect(result.success).toBe(true);
      expect(console.error).toHaveBeenCalledWith(
        'Redis connection lost',
        expect.any(Error)
      );
    });
  });

  describe('Search Engine Failures', () => {
    beforeEach(() => {
      vi.doMock('@/services/supabase', () => ({
        supabaseService: createMockSupabaseService()
      }));
      vi.doMock('@/services/cache', () => ({
        cacheService: createMockCacheService()
      }));
      vi.doMock('@/services/searchEngine', () => ({
        searchEngine: errorServices.searchEngineDown
      }));
    });

    it('should handle search engine failures in searchProperties', async () => {
      const caller = createCaller(createMockContext());

      await expect(caller.searchProperties({
        query: 'apartment'
      })).rejects.toThrow(
        expect.objectContaining({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Search service temporarily unavailable'
        })
      );
    });

    it('should return empty suggestions gracefully when search engine fails', async () => {
      const caller = createCaller(createMockContext());
      const result = await caller.getSearchSuggestions({ query: 'apartment' });

      expect(result.success).toBe(false);
      expect(result.data).toEqual([]);
      expect(result.error).toBe('Suggestions temporarily unavailable');
    });
  });

  describe('Rate Limiting Edge Cases', () => {
    it('should handle missing client IP gracefully', async () => {
      const mockCache = createRateLimitedCacheService();
      vi.doMock('@/services/cache', () => ({
        cacheService: mockCache
      }));

      const context = createMockContext({
        req: { ip: undefined, connection: { remoteAddress: undefined } }
      });

      const caller = createCaller(context);

      await expect(caller.searchProperties({
        query: 'apartment'
      })).rejects.toThrow(
        expect.objectContaining({
          code: 'TOO_MANY_REQUESTS'
        })
      );

      expect(mockCache.isRateLimited).toHaveBeenCalledWith('search:unknown', 100, 900);
    });

    it('should use connection.remoteAddress when req.ip is unavailable', async () => {
      const mockCache = createMockCacheService();
      vi.doMock('@/services/cache', () => ({
        cacheService: mockCache
      }));

      const context = createMockContext({
        req: { ip: undefined, connection: { remoteAddress: '192.168.1.100' } }
      });

      const caller = createCaller(context);
      await caller.searchProperties({ query: 'apartment' });

      expect(mockCache.isRateLimited).toHaveBeenCalledWith('search:192.168.1.100', 100, 900);
    });

    it('should handle rate limit check failures by allowing requests (fail open)', async () => {
      const mockCache = {
        ...createMockCacheService(),
        isRateLimited: vi.fn().mockRejectedValue(new Error('Rate limit service down'))
      };

      const mockSearchEngine = createMockSearchEngine();

      vi.doMock('@/services/cache', () => ({
        cacheService: mockCache
      }));
      vi.doMock('@/services/searchEngine', () => ({
        searchEngine: mockSearchEngine
      }));

      const caller = createCaller(createMockContext());
      
      // Should allow request when rate limiter fails
      await expect(caller.searchProperties({
        query: 'apartment'
      })).resolves.not.toThrow();
      
      expect(mockSearchEngine.searchProperties).toHaveBeenCalled();
    });
  });

  describe('Input Validation Edge Cases', () => {
    let caller: any;

    beforeEach(() => {
      caller = createCaller(createMockContext());
    });

    describe('String Input Validation', () => {
      it('should handle extremely long search queries', async () => {
        const veryLongQuery = 'apartment '.repeat(1000); // Very long but under limit
        
        await expect(caller.searchProperties({
          query: veryLongQuery.slice(0, 500) // Still valid
        })).resolves.not.toThrow();
      });

      it('should reject null and undefined for required string fields', async () => {
        await expect(caller.getSearchSuggestions({ 
          query: null as any 
        })).rejects.toThrow(TRPCError);

        await expect(caller.getSearchSuggestions({ 
          query: undefined as any 
        })).rejects.toThrow(TRPCError);
      });

      it('should handle special characters in search queries', async () => {
        const specialCharQuery = "apartment with 'special' & \"characters\" @#$%";
        
        await expect(caller.searchProperties({
          query: specialCharQuery
        })).resolves.not.toThrow();
      });

      it('should handle unicode characters in search queries', async () => {
        const unicodeQuery = "apartamento en Tegucigalpa 🏠 with émojis";
        
        await expect(caller.searchProperties({
          query: unicodeQuery
        })).resolves.not.toThrow();
      });
    });

    describe('Numeric Input Validation', () => {
      it('should handle edge values for coordinates', async () => {
        // Test boundary values for latitude/longitude
        const edgeLocation = {
          lat: 90, // Max latitude
          lng: 180, // Max longitude
          source: 'manual' as const
        };

        await expect(caller.getFeaturedProperties({
          limit: 6,
          location: edgeLocation
        })).resolves.not.toThrow();
      });

      it('should reject invalid coordinate values', async () => {
        const invalidLocation = {
          lat: 91, // Over max latitude
          lng: -181, // Under min longitude
          source: 'manual' as const
        };

        await expect(caller.getFeaturedProperties({
          limit: 6,
          location: invalidLocation
        })).rejects.toThrow(TRPCError);
      });

      it('should handle floating point precision in coordinates', async () => {
        const preciseLocation = {
          lat: 14.07234567890123456789,
          lng: -87.19212345678901234567,
          source: 'gps' as const
        };

        await expect(caller.getFeaturedProperties({
          limit: 6,
          location: preciseLocation
        })).resolves.not.toThrow();
      });

      it('should handle zero values in filters', async () => {
        const zeroFilters = {
          priceMin: 0,
          priceMax: 0,
          bedrooms: [0],
          bathrooms: [0]
        };

        await expect(caller.searchProperties({
          filters: zeroFilters
        })).resolves.not.toThrow();
      });

      it('should handle very large numbers in price filters', async () => {
        const largeNumberFilters = {
          priceMin: Number.MAX_SAFE_INTEGER - 1,
          priceMax: Number.MAX_SAFE_INTEGER
        };

        await expect(caller.searchProperties({
          filters: largeNumberFilters
        })).resolves.not.toThrow();
      });
    });

    describe('Array Input Validation', () => {
      it('should handle empty arrays in filters', async () => {
        const emptyArrayFilters = {
          propertyTypes: [],
          bedrooms: [],
          bathrooms: [],
          amenities: []
        };

        await expect(caller.searchProperties({
          filters: emptyArrayFilters
        })).resolves.not.toThrow();
      });

      it('should handle arrays with duplicate values', async () => {
        const duplicateFilters = {
          propertyTypes: ['apartment', 'apartment', 'house'],
          bedrooms: [2, 2, 3, 3],
          amenities: ['parking', 'parking', 'security']
        };

        await expect(caller.searchProperties({
          filters: duplicateFilters
        })).resolves.not.toThrow();
      });

      it('should validate array element types', async () => {
        const invalidArrayFilters = {
          propertyTypes: ['apartment', 123] as any, // Invalid type in array
        };

        await expect(caller.searchProperties({
          filters: invalidArrayFilters
        })).rejects.toThrow(TRPCError);
      });
    });

    describe('Object Input Validation', () => {
      it('should handle deeply nested object structures', async () => {
        const complexEvent = {
          name: 'complex_event',
          properties: {
            user: {
              id: 'user-123',
              preferences: {
                location: { city: 'Tegucigalpa' },
                search: { 
                  filters: { priceRange: [1000, 5000] },
                  history: ['apartment', 'house']
                }
              }
            }
          },
          timestamp: Date.now(),
          sessionId: 'session-123'
        };

        await expect(caller.trackEvent(complexEvent)).resolves.not.toThrow();
      });

      it('should handle null values in optional object fields', async () => {
        const eventWithNulls = {
          name: 'test_event',
          properties: {
            value: null,
            metadata: { count: null }
          },
          timestamp: Date.now(),
          sessionId: 'session-123',
          userId: null
        };

        await expect(caller.trackEvent(eventWithNulls)).resolves.not.toThrow();
      });
    });
  });

  describe('Concurrent Request Handling', () => {
    it('should handle multiple concurrent requests to the same endpoint', async () => {
      const caller = createCaller(createMockContext());
      
      const promises = Array.from({ length: 10 }, () =>
        caller.getFeaturedProperties({ limit: 6 })
      );

      const results = await Promise.allSettled(promises);
      
      // All requests should succeed
      results.forEach(result => {
        expect(result.status).toBe('fulfilled');
        if (result.status === 'fulfilled') {
          expect(result.value.success).toBe(true);
        }
      });
    });

    it('should handle race conditions in cache operations', async () => {
      const mockCache = createMockCacheService();
      let cacheHitCount = 0;
      
      mockCache.getFeaturedProperties.mockImplementation(async () => {
        // Simulate race condition
        await new Promise(resolve => setTimeout(resolve, Math.random() * 10));
        cacheHitCount++;
        return cacheHitCount === 1 ? null : mockProperties.slice(0, 6);
      });

      vi.doMock('@/services/cache', () => ({
        cacheService: mockCache
      }));

      const caller = createCaller(createMockContext());
      
      const promises = Array.from({ length: 5 }, () =>
        caller.getFeaturedProperties({ limit: 6 })
      );

      const results = await Promise.allSettled(promises);
      
      // All should succeed despite race conditions
      results.forEach(result => {
        expect(result.status).toBe('fulfilled');
      });
    });
  });

  describe('Memory and Resource Management', () => {
    it('should handle large response payloads gracefully', async () => {
      const largePropertyList = Array.from({ length: 1000 }, (_, i) => ({
        ...mockProperties[0],
        id: `property-${i}`,
        title: `Property ${i} with a very long description that contains many details about the property including amenities, location information, and other metadata that makes the response quite large`
      }));

      const mockSupabase = createMockSupabaseService();
      mockSupabase.getFeaturedProperties.mockResolvedValue(largePropertyList);

      vi.doMock('@/services/supabase', () => ({
        supabaseService: mockSupabase
      }));

      const caller = createCaller(createMockContext());
      
      const result = await caller.getFeaturedProperties({ limit: 20 });
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should handle requests with large filter objects', async () => {
      const largeFilters = {
        amenities: Array.from({ length: 100 }, (_, i) => `amenity-${i}`),
        propertyTypes: ['apartment', 'house', 'room', 'commercial'],
        bedrooms: Array.from({ length: 20 }, (_, i) => i),
        bathrooms: Array.from({ length: 10 }, (_, i) => i)
      };

      const caller = createCaller(createMockContext());
      
      await expect(caller.searchProperties({
        filters: largeFilters
      })).resolves.not.toThrow();
    });
  });

  describe('Timeout Handling', () => {
    it('should handle database query timeouts', async () => {
      const slowSupabase = {
        ...createMockSupabaseService(),
        getFeaturedProperties: vi.fn().mockImplementation(() => 
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Query timeout')), 100)
          )
        )
      };

      vi.doMock('@/services/supabase', () => ({
        supabaseService: slowSupabase
      }));

      const caller = createCaller(createMockContext());
      
      await expect(caller.getFeaturedProperties({ limit: 6 })).rejects.toThrow(
        expect.objectContaining({
          code: 'INTERNAL_SERVER_ERROR'
        })
      );
    });

    it('should handle cache operation timeouts', async () => {
      const slowCache = {
        ...createMockCacheService(),
        getFeaturedProperties: vi.fn().mockImplementation(() =>
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Cache timeout')), 100)
          )
        )
      };

      vi.doMock('@/services/cache', () => ({
        cacheService: slowCache
      }));

      const caller = createCaller(createMockContext());
      
      // Should fallback to database when cache times out
      await expect(caller.getFeaturedProperties({ limit: 6 })).resolves.not.toThrow();
    });
  });
});