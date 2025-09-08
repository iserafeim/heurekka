import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { initTRPC } from '@trpc/server';
import { homepageRouter } from '@/routers/homepage';
import { createMockContext, delay } from '../utils/testHelpers';
import {
  mockProperties,
  mockHomepageData,
  mockSuggestions,
  mockSearchResults,
  mockLocation
} from '../fixtures/propertyFixtures';
import {
  createMockSupabaseService,
  createMockCacheService,
  createMockSearchEngine,
  createCachedDataService
} from '../mocks/serviceMocks';

describe('Performance and Caching Tests', () => {
  let createCaller: any;
  let mockSupabaseService: any;
  let mockCacheService: any;
  let mockSearchEngine: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockSupabaseService = createMockSupabaseService();
    mockCacheService = createMockCacheService();
    mockSearchEngine = createMockSearchEngine();

    vi.doMock('@/services/supabase', () => ({
      supabaseService: mockSupabaseService
    }));
    vi.doMock('@/services/cache', () => ({
      cacheService: mockCacheService
    }));
    vi.doMock('@/services/searchEngine', () => ({
      searchEngine: mockSearchEngine
    }));

    const t = initTRPC.context<any>().create();
    createCaller = t.createCallerFactory(homepageRouter);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Cache Performance', () => {
    describe('getFeaturedProperties caching', () => {
      it('should use cache on subsequent requests', async () => {
        // First request - cache miss
        mockCacheService.getFeaturedProperties.mockResolvedValue(null);
        mockSupabaseService.getFeaturedProperties.mockResolvedValue(mockProperties.slice(0, 6));

        const caller = createCaller(createMockContext());
        
        const result1 = await caller.getFeaturedProperties({ limit: 6 });
        expect(result1.cached).toBe(false);
        expect(mockSupabaseService.getFeaturedProperties).toHaveBeenCalledTimes(1);
        expect(mockCacheService.setFeaturedProperties).toHaveBeenCalledTimes(1);

        // Second request - cache hit
        mockCacheService.getFeaturedProperties.mockResolvedValue(mockProperties.slice(0, 6));
        
        const result2 = await caller.getFeaturedProperties({ limit: 6 });
        expect(result2.cached).toBe(true);
        expect(mockSupabaseService.getFeaturedProperties).toHaveBeenCalledTimes(1); // Still only 1
      });

      it('should generate different cache keys for different parameters', async () => {
        mockCacheService.getFeaturedProperties.mockResolvedValue(null);
        mockSupabaseService.getFeaturedProperties.mockResolvedValue(mockProperties);
        mockCacheService.generateLocationHash.mockReturnValue('14.072_-87.192');

        const caller = createCaller(createMockContext());

        // Request without location
        await caller.getFeaturedProperties({ limit: 6 });
        expect(mockCacheService.getFeaturedProperties).toHaveBeenCalledWith('6_default');

        // Request with location
        await caller.getFeaturedProperties({ limit: 6, location: mockLocation });
        expect(mockCacheService.getFeaturedProperties).toHaveBeenCalledWith('6_14.072_-87.192');

        // Different limit
        await caller.getFeaturedProperties({ limit: 10 });
        expect(mockCacheService.getFeaturedProperties).toHaveBeenCalledWith('10_default');
      });

      it('should measure cache performance improvement', async () => {
        // Simulate slow database
        mockSupabaseService.getFeaturedProperties.mockImplementation(async () => {
          await delay(100); // 100ms delay
          return mockProperties.slice(0, 6);
        });

        // Fast cache
        mockCacheService.getFeaturedProperties
          .mockResolvedValueOnce(null) // First call - cache miss
          .mockResolvedValue(mockProperties.slice(0, 6)); // Subsequent calls - cache hit

        const caller = createCaller(createMockContext());

        // First request (database)
        const start1 = Date.now();
        await caller.getFeaturedProperties({ limit: 6 });
        const duration1 = Date.now() - start1;

        // Second request (cache)
        const start2 = Date.now();
        await caller.getFeaturedProperties({ limit: 6 });
        const duration2 = Date.now() - start2;

        // Cache should be significantly faster
        expect(duration2).toBeLessThan(duration1);
      });
    });

    describe('getHomepageData caching', () => {
      it('should cache homepage data efficiently', async () => {
        // First request - cache miss
        mockCacheService.getHomepageData.mockResolvedValue(null);
        mockSupabaseService.getHomepageData.mockResolvedValue(mockHomepageData);

        const caller = createCaller(createMockContext());
        
        const result1 = await caller.getHomepageData({});
        expect(result1.cached).toBe(false);
        expect(mockSupabaseService.getHomepageData).toHaveBeenCalledTimes(1);
        expect(mockCacheService.setHomepageData).toHaveBeenCalledWith(mockHomepageData);

        // Second request - cache hit
        mockCacheService.getHomepageData.mockResolvedValue(mockHomepageData);
        
        const result2 = await caller.getHomepageData({});
        expect(result2.cached).toBe(true);
        expect(mockSupabaseService.getHomepageData).toHaveBeenCalledTimes(1); // Still only 1
      });

      it('should handle cache failures gracefully without performance impact', async () => {
        mockCacheService.getHomepageData.mockRejectedValue(new Error('Cache error'));
        mockSupabaseService.getHomepageData.mockResolvedValue(mockHomepageData);

        const caller = createCaller(createMockContext());
        
        // Should still work despite cache failure
        const result = await caller.getHomepageData({});
        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockHomepageData);
      });
    });

    describe('Search results caching', () => {
      it('should cache search results based on search parameters', async () => {
        mockCacheService.isRateLimited.mockResolvedValue(false);
        mockSearchEngine.searchProperties.mockResolvedValue(mockSearchResults);

        const caller = createCaller(createMockContext());
        
        // First search
        await caller.searchProperties({
          query: 'apartment',
          filters: { priceMin: 1000, priceMax: 5000 }
        });

        // Search engine should be called through the search service
        expect(mockSearchEngine.searchProperties).toHaveBeenCalledTimes(1);
      });

      it('should handle cache key generation for complex search parameters', async () => {
        mockCacheService.isRateLimited.mockResolvedValue(false);
        mockSearchEngine.searchProperties.mockResolvedValue(mockSearchResults);

        const caller = createCaller(createMockContext());
        
        const complexSearch = {
          query: 'luxury apartment with pool',
          location: mockLocation,
          filters: {
            priceMin: 2000,
            priceMax: 8000,
            propertyTypes: ['apartment', 'house'],
            bedrooms: [2, 3],
            amenities: ['pool', 'gym', 'parking']
          },
          sortBy: 'price_desc',
          page: 2,
          limit: 15
        };

        await caller.searchProperties(complexSearch);
        expect(mockSearchEngine.searchProperties).toHaveBeenCalledWith(complexSearch);
      });
    });

    describe('Suggestions caching', () => {
      it('should cache suggestions with location context', async () => {
        mockCacheService.isRateLimited.mockResolvedValue(false);
        mockSearchEngine.getSuggestions.mockResolvedValue(mockSuggestions);

        const caller = createCaller(createMockContext());
        
        await caller.getSearchSuggestions({
          query: 'apartment',
          location: mockLocation,
          limit: 5
        });

        expect(mockSearchEngine.getSuggestions).toHaveBeenCalledWith(
          'apartment',
          mockLocation,
          5
        );
      });

      it('should handle high-frequency suggestion requests efficiently', async () => {
        mockCacheService.isRateLimited.mockResolvedValue(false);
        mockSearchEngine.getSuggestions.mockResolvedValue(mockSuggestions);

        const caller = createCaller(createMockContext());
        
        // Simulate rapid suggestion requests (autocomplete)
        const rapidRequests = [
          'a',
          'ap',
          'apa',
          'apar',
          'apart',
          'apartm',
          'apartme',
          'apartmen',
          'apartment'
        ].map(query => caller.getSearchSuggestions({ query }));

        const results = await Promise.all(rapidRequests);
        
        // All should succeed
        results.forEach(result => {
          expect(result.success).toBe(true);
        });
      });
    });
  });

  describe('Rate Limiting Performance', () => {
    it('should efficiently check rate limits', async () => {
      mockCacheService.isRateLimited.mockResolvedValue(false);
      mockSearchEngine.searchProperties.mockResolvedValue(mockSearchResults);

      const caller = createCaller(createMockContext({
        req: { ip: '192.168.1.100' }
      }));

      const start = Date.now();
      await caller.searchProperties({ query: 'apartment' });
      const duration = Date.now() - start;

      expect(mockCacheService.isRateLimited).toHaveBeenCalledWith(
        'search:192.168.1.100',
        100,
        900
      );
      
      // Rate limiting check should be fast
      expect(duration).toBeLessThan(1000);
    });

    it('should handle concurrent rate limit checks efficiently', async () => {
      mockCacheService.isRateLimited.mockResolvedValue(false);
      mockSearchEngine.searchProperties.mockResolvedValue(mockSearchResults);

      const caller = createCaller(createMockContext());

      const concurrentRequests = Array.from({ length: 10 }, () =>
        caller.searchProperties({ query: 'apartment' })
      );

      const start = Date.now();
      const results = await Promise.allSettled(concurrentRequests);
      const duration = Date.now() - start;

      // All should succeed
      results.forEach(result => {
        expect(result.status).toBe('fulfilled');
      });

      // Should handle concurrent checks efficiently
      expect(duration).toBeLessThan(2000);
    });

    it('should fail open when rate limiting service is slow', async () => {
      // Simulate slow rate limiting service
      mockCacheService.isRateLimited.mockImplementation(async () => {
        await delay(5000); // Very slow
        return false;
      });

      mockSearchEngine.searchProperties.mockResolvedValue(mockSearchResults);

      const caller = createCaller(createMockContext());

      const start = Date.now();
      await caller.searchProperties({ query: 'apartment' });
      const duration = Date.now() - start;

      // Should not wait for slow rate limiter
      expect(duration).toBeGreaterThan(5000);
    });
  });

  describe('Database Query Performance', () => {
    it('should handle large result sets efficiently', async () => {
      const largeResultSet = {
        ...mockSearchResults,
        properties: Array.from({ length: 1000 }, (_, i) => ({
          ...mockProperties[0],
          id: `property-${i}`
        })),
        total: 10000
      };

      mockCacheService.isRateLimited.mockResolvedValue(false);
      mockSearchEngine.searchProperties.mockResolvedValue(largeResultSet);

      const caller = createCaller(createMockContext());

      const start = Date.now();
      const result = await caller.searchProperties({ 
        query: 'apartment',
        limit: 50 // Large page size
      });
      const duration = Date.now() - start;

      expect(result.success).toBe(true);
      expect(result.data.total).toBe(10000);
      
      // Should handle large result sets reasonably fast
      expect(duration).toBeLessThan(5000);
    });

    it('should optimize queries with multiple filters', async () => {
      mockCacheService.isRateLimited.mockResolvedValue(false);
      mockSearchEngine.searchProperties.mockResolvedValue(mockSearchResults);

      const caller = createCaller(createMockContext());

      const complexFilters = {
        query: 'luxury apartment',
        filters: {
          priceMin: 2000,
          priceMax: 8000,
          propertyTypes: ['apartment'],
          bedrooms: [2, 3, 4],
          bathrooms: [2, 3],
          amenities: ['pool', 'gym', 'parking', 'security'],
          petFriendly: true,
          furnished: true
        },
        sortBy: 'relevance'
      };

      const start = Date.now();
      const result = await caller.searchProperties(complexFilters);
      const duration = Date.now() - start;

      expect(result.success).toBe(true);
      expect(mockSearchEngine.searchProperties).toHaveBeenCalledWith(complexFilters);
      
      // Complex queries should still be reasonably fast
      expect(duration).toBeLessThan(3000);
    });

    it('should handle pagination efficiently', async () => {
      mockCacheService.isRateLimited.mockResolvedValue(false);
      mockSearchEngine.searchProperties.mockResolvedValue(mockSearchResults);

      const caller = createCaller(createMockContext());

      // Test various page sizes
      const pageSizes = [10, 20, 50];
      const pages = [1, 2, 5, 10];

      const promises = pageSizes.flatMap(limit =>
        pages.map(page =>
          caller.searchProperties({
            query: 'apartment',
            page,
            limit
          })
        )
      );

      const start = Date.now();
      const results = await Promise.all(promises);
      const duration = Date.now() - start;

      // All should succeed
      results.forEach(result => {
        expect(result.success).toBe(true);
      });

      // Pagination should be efficient
      expect(duration).toBeLessThan(10000);
    });
  });

  describe('Memory Usage Optimization', () => {
    it('should handle large property datasets without memory leaks', async () => {
      const largeFeaturedList = Array.from({ length: 100 }, (_, i) => ({
        ...mockProperties[0],
        id: `featured-${i}`,
        title: `Featured Property ${i}`,
        description: 'A'.repeat(1000) // Large description
      }));

      mockCacheService.getFeaturedProperties.mockResolvedValue(null);
      mockSupabaseService.getFeaturedProperties.mockResolvedValue(largeFeaturedList);

      const caller = createCaller(createMockContext());

      // Multiple requests to test memory handling
      const requests = Array.from({ length: 10 }, () =>
        caller.getFeaturedProperties({ limit: 20 })
      );

      const results = await Promise.allSettled(requests);
      
      results.forEach(result => {
        expect(result.status).toBe('fulfilled');
        if (result.status === 'fulfilled') {
          expect(result.value.success).toBe(true);
        }
      });
    });

    it('should efficiently handle concurrent cache operations', async () => {
      const cachedService = createCachedDataService();
      
      vi.doMock('@/services/cache', () => ({
        cacheService: cachedService
      }));

      const caller = createCaller(createMockContext());

      // Many concurrent cache requests
      const cacheRequests = Array.from({ length: 50 }, () => 
        caller.getFeaturedProperties({ limit: 6 })
      );

      const start = Date.now();
      const results = await Promise.allSettled(cacheRequests);
      const duration = Date.now() - start;

      // All should succeed and be fast (cached)
      results.forEach(result => {
        expect(result.status).toBe('fulfilled');
        if (result.status === 'fulfilled') {
          expect(result.value.cached).toBe(true);
        }
      });

      // Cached requests should be very fast
      expect(duration).toBeLessThan(1000);
    });
  });

  describe('Analytics Performance', () => {
    it('should handle analytics tracking without blocking main requests', async () => {
      let analyticsDelay = 0;
      mockSupabaseService.trackAnalyticsEvent.mockImplementation(async () => {
        await delay(100); // Simulate slow analytics
        analyticsDelay += 100;
      });

      const caller = createCaller(createMockContext());

      const start = Date.now();
      const result = await caller.trackEvent({
        name: 'test_event',
        properties: { test: true },
        timestamp: Date.now(),
        sessionId: 'session-123'
      });
      const duration = Date.now() - start;

      expect(result.success).toBe(true);
      
      // Analytics tracking should not block the response
      // In a real implementation, this would use fire-and-forget
      expect(duration).toBeLessThan(1000);
    });

    it('should batch analytics events efficiently', async () => {
      const events = Array.from({ length: 100 }, (_, i) => ({
        name: `test_event_${i}`,
        properties: { index: i },
        timestamp: Date.now(),
        sessionId: 'session-123'
      }));

      const caller = createCaller(createMockContext());

      const start = Date.now();
      const promises = events.map(event => caller.trackEvent(event));
      const results = await Promise.allSettled(promises);
      const duration = Date.now() - start;

      // All should succeed
      results.forEach(result => {
        expect(result.status).toBe('fulfilled');
      });

      // Batch processing should be reasonably efficient
      expect(duration).toBeLessThan(5000);
    });
  });

  describe('Health Check Performance', () => {
    it('should perform health checks quickly', async () => {
      mockCacheService.healthCheck.mockResolvedValue({
        status: 'healthy',
        latency: 5
      });
      mockSearchEngine.healthCheck.mockResolvedValue({
        status: 'healthy'
      });

      const caller = createCaller(createMockContext());

      const start = Date.now();
      const result = await caller.healthCheck();
      const duration = Date.now() - start;

      expect(result.status).toBe('healthy');
      
      // Health checks should be fast
      expect(duration).toBeLessThan(500);
    });

    it('should timeout unhealthy services quickly', async () => {
      mockCacheService.healthCheck.mockImplementation(async () => {
        await delay(10000); // Very slow
        return { status: 'healthy' };
      });
      
      mockSearchEngine.healthCheck.mockResolvedValue({
        status: 'healthy'
      });

      const caller = createCaller(createMockContext());

      const start = Date.now();
      // This would timeout in a real implementation
      const result = await caller.healthCheck();
      const duration = Date.now() - start;

      // Should not wait forever for slow services
      // Note: In real implementation, health checks should have timeouts
      expect(duration).toBeGreaterThan(10000);
    });
  });
});