import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { createTRPCMsw } from 'msw-trpc';
import { initTRPC, TRPCError } from '@trpc/server';
import { homepageRouter } from '@/routers/homepage';
import { 
  createMockContext, 
  validateTRPCResponse, 
  validatePagination,
  generateTestId 
} from '../utils/testHelpers';
import {
  mockProperties,
  mockHomepageData,
  mockSuggestions,
  mockSearchResults,
  mockLocation,
  validAnalyticsEvent,
  validSearchProfile,
  validSearchFilters
} from '../fixtures/propertyFixtures';
import {
  createMockSupabaseService,
  createMockCacheService,
  createMockSearchEngine,
  createRateLimitedCacheService,
  createCachedDataService
} from '../mocks/serviceMocks';

// Mock all services
vi.mock('@/services/supabase', () => ({
  supabaseService: createMockSupabaseService()
}));

vi.mock('@/services/cache', () => ({
  cacheService: createMockCacheService()
}));

vi.mock('@/services/searchEngine', () => ({
  searchEngine: createMockSearchEngine()
}));

describe('Homepage Router Integration Tests', () => {
  let mockSupabaseService: any;
  let mockCacheService: any;
  let mockSearchEngine: any;
  let router: typeof homepageRouter;
  let createCaller: any;

  beforeAll(async () => {
    // Import services after mocking
    const { supabaseService } = await import('@/services/supabase');
    const { cacheService } = await import('@/services/cache');
    const { searchEngine } = await import('@/services/searchEngine');
    
    mockSupabaseService = supabaseService;
    mockCacheService = cacheService;
    mockSearchEngine = searchEngine;
    
    // Create tRPC test client
    const t = initTRPC.context<any>().create();
    createCaller = t.createCallerFactory(homepageRouter);
  });

  beforeEach(() => {
    vi.clearAllMocks();
    router = homepageRouter;
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('getFeaturedProperties', () => {
    it('should return cached featured properties when available', async () => {
      mockCacheService.getFeaturedProperties.mockResolvedValue(mockProperties.slice(0, 6));
      
      const caller = createCaller(createMockContext());
      const result = await caller.getFeaturedProperties({ limit: 6 });

      validateTRPCResponse(result);
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(6);
      expect(result.cached).toBe(true);
      expect(mockSupabaseService.getFeaturedProperties).not.toHaveBeenCalled();
    });

    it('should fetch from database when cache is empty', async () => {
      mockCacheService.getFeaturedProperties.mockResolvedValue(null);
      mockSupabaseService.getFeaturedProperties.mockResolvedValue(mockProperties.slice(0, 6));

      const caller = createCaller(createMockContext());
      const result = await caller.getFeaturedProperties({ limit: 6 });

      validateTRPCResponse(result);
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(6);
      expect(result.cached).toBe(false);
      expect(mockSupabaseService.getFeaturedProperties).toHaveBeenCalledWith(6, undefined);
      expect(mockCacheService.setFeaturedProperties).toHaveBeenCalled();
    });

    it('should handle location-aware caching', async () => {
      mockCacheService.getFeaturedProperties.mockResolvedValue(null);
      mockSupabaseService.getFeaturedProperties.mockResolvedValue(mockProperties);
      mockCacheService.generateLocationHash.mockReturnValue('14.072_-87.192');

      const caller = createCaller(createMockContext());
      const result = await caller.getFeaturedProperties({ 
        limit: 4, 
        location: mockLocation 
      });

      expect(mockCacheService.getFeaturedProperties).toHaveBeenCalledWith('4_14.072_-87.192');
      expect(mockSupabaseService.getFeaturedProperties).toHaveBeenCalledWith(4, mockLocation);
      expect(result.success).toBe(true);
    });

    it('should handle database errors', async () => {
      mockCacheService.getFeaturedProperties.mockResolvedValue(null);
      mockSupabaseService.getFeaturedProperties.mockRejectedValue(new Error('Database error'));

      const caller = createCaller(createMockContext());
      
      await expect(caller.getFeaturedProperties({ limit: 6 })).rejects.toThrow(TRPCError);
      expect(console.error).toHaveBeenCalledWith('Error in getFeaturedProperties:', expect.any(Error));
    });

    it('should validate input parameters', async () => {
      const caller = createCaller(createMockContext());

      // Test invalid limit (over 20)
      await expect(caller.getFeaturedProperties({ limit: 25 })).rejects.toThrow(TRPCError);
      
      // Test invalid limit (under 1)
      await expect(caller.getFeaturedProperties({ limit: 0 })).rejects.toThrow(TRPCError);
    });

    it('should use default limit when not provided', async () => {
      mockCacheService.getFeaturedProperties.mockResolvedValue(null);
      mockSupabaseService.getFeaturedProperties.mockResolvedValue(mockProperties.slice(0, 6));

      const caller = createCaller(createMockContext());
      const result = await caller.getFeaturedProperties({});

      expect(mockSupabaseService.getFeaturedProperties).toHaveBeenCalledWith(6, undefined);
      expect(result.success).toBe(true);
    });
  });

  describe('searchProperties', () => {
    it('should perform property search successfully', async () => {
      mockCacheService.isRateLimited.mockResolvedValue(false);
      mockSearchEngine.searchProperties.mockResolvedValue(mockSearchResults);

      const caller = createCaller(createMockContext());
      const result = await caller.searchProperties({
        query: 'apartment',
        location: mockLocation,
        filters: validSearchFilters,
        page: 1,
        limit: 20,
        sortBy: 'relevance'
      });

      validateTRPCResponse(result);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockSearchResults);
      expect(result.timestamp).toBeDefined();
      expect(mockSearchEngine.searchProperties).toHaveBeenCalled();
    });

    it('should enforce rate limiting', async () => {
      mockCacheService.isRateLimited.mockResolvedValue(true);

      const caller = createCaller(createMockContext());
      
      await expect(caller.searchProperties({
        query: 'apartment'
      })).rejects.toThrow(TRPCError);
    });

    it('should check rate limiting with client IP', async () => {
      mockCacheService.isRateLimited.mockResolvedValue(false);
      mockSearchEngine.searchProperties.mockResolvedValue(mockSearchResults);

      const context = createMockContext({
        req: { ip: '192.168.1.100' }
      });

      const caller = createCaller(context);
      await caller.searchProperties({ query: 'apartment' });

      expect(mockCacheService.isRateLimited).toHaveBeenCalledWith('search:192.168.1.100', 100, 900);
    });

    it('should handle search engine errors', async () => {
      mockCacheService.isRateLimited.mockResolvedValue(false);
      mockSearchEngine.searchProperties.mockRejectedValue(new Error('Search engine error'));

      const caller = createCaller(createMockContext());
      
      await expect(caller.searchProperties({
        query: 'apartment'
      })).rejects.toThrow('Search service temporarily unavailable');
    });

    it('should validate all sort options', async () => {
      mockCacheService.isRateLimited.mockResolvedValue(false);
      mockSearchEngine.searchProperties.mockResolvedValue(mockSearchResults);

      const caller = createCaller(createMockContext());
      const sortOptions = ['relevance', 'price_asc', 'price_desc', 'date_desc', 'distance'];

      for (const sortBy of sortOptions) {
        const result = await caller.searchProperties({ sortBy });
        expect(result.success).toBe(true);
      }
    });

    it('should validate pagination parameters', async () => {
      const caller = createCaller(createMockContext());

      // Test invalid page (under 1)
      await expect(caller.searchProperties({ page: 0 })).rejects.toThrow(TRPCError);
      
      // Test invalid limit (over 50)
      await expect(caller.searchProperties({ limit: 51 })).rejects.toThrow(TRPCError);
    });

    it('should use fallback IP when none provided', async () => {
      mockCacheService.isRateLimited.mockResolvedValue(false);
      mockSearchEngine.searchProperties.mockResolvedValue(mockSearchResults);

      const context = createMockContext({
        req: { 
          ip: undefined, 
          connection: { remoteAddress: undefined } 
        }
      });

      const caller = createCaller(context);
      await caller.searchProperties({ query: 'apartment' });

      expect(mockCacheService.isRateLimited).toHaveBeenCalledWith('search:unknown', 100, 900);
    });
  });

  describe('getSearchSuggestions', () => {
    it('should return search suggestions successfully', async () => {
      mockCacheService.isRateLimited.mockResolvedValue(false);
      mockSearchEngine.getSuggestions.mockResolvedValue(mockSuggestions);

      const caller = createCaller(createMockContext());
      const result = await caller.getSearchSuggestions({
        query: 'apartment',
        location: mockLocation,
        limit: 5
      });

      validateTRPCResponse(result);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockSuggestions);
      expect(result.query).toBe('apartment');
      expect(result.timestamp).toBeDefined();
      expect(mockSearchEngine.getSuggestions).toHaveBeenCalledWith('apartment', mockLocation, 5);
    });

    it('should enforce rate limiting for suggestions', async () => {
      mockCacheService.isRateLimited.mockResolvedValue(true);

      const caller = createCaller(createMockContext());
      
      await expect(caller.getSearchSuggestions({
        query: 'apartment'
      })).rejects.toThrow('Rate limit exceeded');
    });

    it('should use more lenient rate limits for suggestions', async () => {
      mockCacheService.isRateLimited.mockResolvedValue(false);
      mockSearchEngine.getSuggestions.mockResolvedValue(mockSuggestions);

      const caller = createCaller(createMockContext());
      await caller.getSearchSuggestions({ query: 'apartment' });

      expect(mockCacheService.isRateLimited).toHaveBeenCalledWith('suggestions:127.0.0.1', 200, 900);
    });

    it('should return graceful error response on search engine failure', async () => {
      mockCacheService.isRateLimited.mockResolvedValue(false);
      mockSearchEngine.getSuggestions.mockRejectedValue(new Error('Search engine error'));

      const caller = createCaller(createMockContext());
      const result = await caller.getSearchSuggestions({ query: 'apartment' });

      expect(result.success).toBe(false);
      expect(result.data).toEqual([]);
      expect(result.error).toBe('Suggestions temporarily unavailable');
    });

    it('should validate query length constraints', async () => {
      const caller = createCaller(createMockContext());

      // Test empty query
      await expect(caller.getSearchSuggestions({ query: '' })).rejects.toThrow(TRPCError);
      
      // Test query too long (over 200 chars)
      const longQuery = 'a'.repeat(201);
      await expect(caller.getSearchSuggestions({ query: longQuery })).rejects.toThrow(TRPCError);
    });

    it('should validate limit constraints', async () => {
      const caller = createCaller(createMockContext());

      // Test limit over 20
      await expect(caller.getSearchSuggestions({ 
        query: 'apartment', 
        limit: 25 
      })).rejects.toThrow(TRPCError);
      
      // Test limit under 1
      await expect(caller.getSearchSuggestions({ 
        query: 'apartment', 
        limit: 0 
      })).rejects.toThrow(TRPCError);
    });

    it('should use default limit when not provided', async () => {
      mockCacheService.isRateLimited.mockResolvedValue(false);
      mockSearchEngine.getSuggestions.mockResolvedValue(mockSuggestions);

      const caller = createCaller(createMockContext());
      await caller.getSearchSuggestions({ query: 'apartment' });

      expect(mockSearchEngine.getSuggestions).toHaveBeenCalledWith('apartment', undefined, 5);
    });
  });

  describe('getHomepageData', () => {
    it('should return cached homepage data when available', async () => {
      mockCacheService.getHomepageData.mockResolvedValue(mockHomepageData);

      const caller = createCaller(createMockContext());
      const result = await caller.getHomepageData({});

      validateTRPCResponse(result);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockHomepageData);
      expect(result.cached).toBe(true);
      expect(result.timestamp).toBeDefined();
      expect(mockSupabaseService.getHomepageData).not.toHaveBeenCalled();
    });

    it('should fetch from database when cache is empty', async () => {
      mockCacheService.getHomepageData.mockResolvedValue(null);
      mockSupabaseService.getHomepageData.mockResolvedValue(mockHomepageData);

      const caller = createCaller(createMockContext());
      const result = await caller.getHomepageData({});

      validateTRPCResponse(result);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockHomepageData);
      expect(result.cached).toBe(false);
      expect(result.timestamp).toBeDefined();
      expect(mockSupabaseService.getHomepageData).toHaveBeenCalled();
      expect(mockCacheService.setHomepageData).toHaveBeenCalledWith(mockHomepageData);
    });

    it('should handle database errors', async () => {
      mockCacheService.getHomepageData.mockResolvedValue(null);
      mockSupabaseService.getHomepageData.mockRejectedValue(new Error('Database error'));

      const caller = createCaller(createMockContext());
      
      await expect(caller.getHomepageData({})).rejects.toThrow('Failed to load homepage data');
      expect(console.error).toHaveBeenCalledWith('Error in getHomepageData:', expect.any(Error));
    });

    it('should accept optional location parameter', async () => {
      mockCacheService.getHomepageData.mockResolvedValue(mockHomepageData);

      const caller = createCaller(createMockContext());
      const result = await caller.getHomepageData({
        location: { lat: 14.0723, lng: -87.1921 }
      });

      expect(result.success).toBe(true);
    });

    it('should handle undefined input gracefully', async () => {
      mockCacheService.getHomepageData.mockResolvedValue(mockHomepageData);

      const caller = createCaller(createMockContext());
      const result = await caller.getHomepageData();

      expect(result.success).toBe(true);
    });
  });

  describe('trackEvent', () => {
    it('should track analytics event successfully', async () => {
      mockSupabaseService.trackAnalyticsEvent.mockResolvedValue();

      const caller = createCaller(createMockContext());
      const result = await caller.trackEvent(validAnalyticsEvent);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Event tracked successfully');
      expect(mockSupabaseService.trackAnalyticsEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          ...validAnalyticsEvent,
          properties: expect.objectContaining({
            ...validAnalyticsEvent.properties,
            userAgent: 'test-agent',
            ip: '127.0.0.1'
          })
        })
      );
    });

    it('should add request context to event', async () => {
      mockSupabaseService.trackAnalyticsEvent.mockResolvedValue();

      const context = createMockContext({
        req: {
          headers: {
            'user-agent': 'Mozilla/5.0',
            'referer': 'https://example.com'
          },
          ip: '192.168.1.50'
        }
      });

      const caller = createCaller(context);
      await caller.trackEvent(validAnalyticsEvent);

      expect(mockSupabaseService.trackAnalyticsEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          properties: expect.objectContaining({
            userAgent: 'Mozilla/5.0',
            ip: '192.168.1.50',
            referer: 'https://example.com'
          })
        })
      );
    });

    it('should handle analytics failures gracefully', async () => {
      mockSupabaseService.trackAnalyticsEvent.mockRejectedValue(new Error('Analytics error'));

      const caller = createCaller(createMockContext());
      const result = await caller.trackEvent(validAnalyticsEvent);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Analytics temporarily unavailable');
      expect(console.error).toHaveBeenCalledWith('Error in trackEvent:', expect.any(Error));
    });

    it('should validate event name constraints', async () => {
      const caller = createCaller(createMockContext());

      // Test empty event name
      const invalidEvent = { ...validAnalyticsEvent, name: '' };
      await expect(caller.trackEvent(invalidEvent)).rejects.toThrow(TRPCError);
      
      // Test event name too long (over 100 chars)
      const longNameEvent = { ...validAnalyticsEvent, name: 'a'.repeat(101) };
      await expect(caller.trackEvent(longNameEvent)).rejects.toThrow(TRPCError);
    });

    it('should validate session ID constraints', async () => {
      const caller = createCaller(createMockContext());

      // Test empty session ID
      const invalidEvent = { ...validAnalyticsEvent, sessionId: '' };
      await expect(caller.trackEvent(invalidEvent)).rejects.toThrow(TRPCError);
      
      // Test session ID too long (over 100 chars)
      const longSessionEvent = { ...validAnalyticsEvent, sessionId: 'a'.repeat(101) };
      await expect(caller.trackEvent(longSessionEvent)).rejects.toThrow(TRPCError);
    });
  });

  describe('saveProperty', () => {
    it('should save property successfully with valid session', async () => {
      mockSupabaseService.saveProperty.mockResolvedValue();
      mockCacheService.incrementPropertyView.mockResolvedValue(1);

      const context = createMockContext({
        req: {
          headers: {
            'x-session-id': 'valid-session-123'
          }
        }
      });

      const caller = createCaller(context);
      const result = await caller.saveProperty({ 
        propertyId: '123e4567-e89b-12d3-a456-426614174000' 
      });

      expect(result.success).toBe(true);
      expect(result.message).toBe('Property saved successfully');
      expect(mockSupabaseService.saveProperty).toHaveBeenCalledWith(
        'valid-session-123',
        '123e4567-e89b-12d3-a456-426614174000'
      );
      expect(mockCacheService.incrementPropertyView).toHaveBeenCalledWith(
        '123e4567-e89b-12d3-a456-426614174000'
      );
    });

    it('should require authentication', async () => {
      const context = createMockContext({
        req: { headers: {} }
      });

      const caller = createCaller(context);
      
      await expect(caller.saveProperty({ 
        propertyId: '123e4567-e89b-12d3-a456-426614174000' 
      })).rejects.toThrow('Authentication required to save properties');
    });

    it('should reject anonymous sessions', async () => {
      const context = createMockContext({
        req: {
          headers: {
            'x-session-id': 'anonymous'
          }
        }
      });

      const caller = createCaller(context);
      
      await expect(caller.saveProperty({ 
        propertyId: '123e4567-e89b-12d3-a456-426614174000' 
      })).rejects.toThrow('Authentication required to save properties');
    });

    it('should handle database errors', async () => {
      mockSupabaseService.saveProperty.mockRejectedValue(new Error('Database error'));

      const context = createMockContext({
        req: {
          headers: {
            'x-session-id': 'valid-session-123'
          }
        }
      });

      const caller = createCaller(context);
      
      await expect(caller.saveProperty({ 
        propertyId: '123e4567-e89b-12d3-a456-426614174000' 
      })).rejects.toThrow('Failed to save property');
    });

    it('should validate UUID format', async () => {
      const context = createMockContext({
        req: {
          headers: {
            'x-session-id': 'valid-session-123'
          }
        }
      });

      const caller = createCaller(context);
      
      await expect(caller.saveProperty({ 
        propertyId: 'invalid-uuid' 
      })).rejects.toThrow(TRPCError);
    });
  });

  describe('createSearchProfile', () => {
    it('should create search profile successfully with valid session', async () => {
      mockCacheService.setUserSession.mockResolvedValue(true);
      mockSupabaseService.trackAnalyticsEvent.mockResolvedValue();

      const context = createMockContext({
        req: {
          headers: {
            'x-session-id': 'valid-session-123'
          }
        }
      });

      const caller = createCaller(context);
      const result = await caller.createSearchProfile(validSearchProfile);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.id).toContain('profile_valid-session-123');
      expect(result.data.name).toBe(validSearchProfile.name);
      expect(result.message).toBe('Search profile created successfully');
      expect(mockCacheService.setUserSession).toHaveBeenCalled();
      expect(mockSupabaseService.trackAnalyticsEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'search_profile_created',
          sessionId: 'valid-session-123'
        })
      );
    });

    it('should require authentication', async () => {
      const context = createMockContext({
        req: { headers: {} }
      });

      const caller = createCaller(context);
      
      await expect(caller.createSearchProfile(validSearchProfile)).rejects.toThrow(
        'Authentication required to create search profiles'
      );
    });

    it('should reject anonymous sessions', async () => {
      const context = createMockContext({
        req: {
          headers: {
            'x-session-id': 'anonymous'
          }
        }
      });

      const caller = createCaller(context);
      
      await expect(caller.createSearchProfile(validSearchProfile)).rejects.toThrow(
        'Authentication required to create search profiles'
      );
    });

    it('should validate profile name constraints', async () => {
      const context = createMockContext({
        req: {
          headers: {
            'x-session-id': 'valid-session-123'
          }
        }
      });

      const caller = createCaller(context);

      // Test name too short
      const shortNameProfile = { ...validSearchProfile, name: 'A' };
      await expect(caller.createSearchProfile(shortNameProfile)).rejects.toThrow(TRPCError);
      
      // Test name too long
      const longNameProfile = { ...validSearchProfile, name: 'A'.repeat(101) };
      await expect(caller.createSearchProfile(longNameProfile)).rejects.toThrow(TRPCError);
    });

    it('should cache profile for 7 days', async () => {
      mockCacheService.setUserSession.mockResolvedValue(true);

      const context = createMockContext({
        req: {
          headers: {
            'x-session-id': 'valid-session-123'
          }
        }
      });

      const caller = createCaller(context);
      await caller.createSearchProfile(validSearchProfile);

      expect(mockCacheService.setUserSession).toHaveBeenCalledWith(
        'profile:valid-session-123',
        expect.any(Object),
        86400 * 7 // 7 days
      );
    });

    it('should track analytics event with profile metadata', async () => {
      mockCacheService.setUserSession.mockResolvedValue(true);
      mockSupabaseService.trackAnalyticsEvent.mockResolvedValue();

      const context = createMockContext({
        req: {
          headers: {
            'x-session-id': 'valid-session-123'
          }
        }
      });

      const caller = createCaller(context);
      await caller.createSearchProfile(validSearchProfile);

      expect(mockSupabaseService.trackAnalyticsEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          properties: {
            profileName: validSearchProfile.name,
            hasLocation: true,
            hasFilters: true
          }
        })
      );
    });

    it('should handle cache errors', async () => {
      mockCacheService.setUserSession.mockRejectedValue(new Error('Cache error'));

      const context = createMockContext({
        req: {
          headers: {
            'x-session-id': 'valid-session-123'
          }
        }
      });

      const caller = createCaller(context);
      
      await expect(caller.createSearchProfile(validSearchProfile)).rejects.toThrow(
        'Failed to create search profile'
      );
    });
  });

  describe('getPopularSearches', () => {
    it('should return cached popular searches when available', async () => {
      const popularSearches = ['apartment', 'house', 'room'];
      mockCacheService.getPopularSearches.mockResolvedValue(popularSearches);

      const caller = createCaller(createMockContext());
      const result = await caller.getPopularSearches({ limit: 3 });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(popularSearches);
      expect(result.cached).toBe(true);
    });

    it('should return fallback searches and cache them when none cached', async () => {
      mockCacheService.getPopularSearches.mockResolvedValue(null);
      mockCacheService.setPopularSearches.mockResolvedValue();

      const caller = createCaller(createMockContext());
      const result = await caller.getPopularSearches({ limit: 5 });

      expect(result.success).toBe(true);
      expect(result.data).toContain('apartment tegucigalpa');
      expect(result.data).toContain('house colonia palmira');
      expect(result.cached).toBe(false);
      expect(mockCacheService.setPopularSearches).toHaveBeenCalled();
    });

    it('should respect limit parameter', async () => {
      const manySearches = Array.from({ length: 15 }, (_, i) => `search ${i}`);
      mockCacheService.getPopularSearches.mockResolvedValue(manySearches);

      const caller = createCaller(createMockContext());
      const result = await caller.getPopularSearches({ limit: 5 });

      expect(result.data).toHaveLength(5);
    });

    it('should use default limit when not provided', async () => {
      const popularSearches = Array.from({ length: 15 }, (_, i) => `search ${i}`);
      mockCacheService.getPopularSearches.mockResolvedValue(popularSearches);

      const caller = createCaller(createMockContext());
      const result = await caller.getPopularSearches();

      expect(result.data).toHaveLength(10); // Default limit
    });

    it('should handle errors gracefully', async () => {
      mockCacheService.getPopularSearches.mockRejectedValue(new Error('Cache error'));

      const caller = createCaller(createMockContext());
      const result = await caller.getPopularSearches();

      expect(result.success).toBe(false);
      expect(result.data).toEqual([]);
      expect(result.error).toBe('Failed to fetch popular searches');
    });
  });

  describe('healthCheck', () => {
    it('should return healthy status when all services are healthy', async () => {
      mockCacheService.healthCheck.mockResolvedValue({ status: 'healthy', latency: 5 });
      mockSearchEngine.healthCheck.mockResolvedValue({ status: 'healthy' });

      const caller = createCaller(createMockContext());
      const result = await caller.healthCheck();

      expect(result.status).toBe('healthy');
      expect(result.timestamp).toBeDefined();
      expect(result.services.cache.status).toBe('healthy');
      expect(result.services.searchEngine.status).toBe('healthy');
    });

    it('should return degraded status when some services are unhealthy', async () => {
      mockCacheService.healthCheck.mockResolvedValue({ status: 'unhealthy' });
      mockSearchEngine.healthCheck.mockResolvedValue({ status: 'healthy' });

      const caller = createCaller(createMockContext());
      const result = await caller.healthCheck();

      expect(result.status).toBe('degraded');
      expect(result.services.cache.status).toBe('unhealthy');
      expect(result.services.searchEngine.status).toBe('healthy');
    });

    it('should return unhealthy status on errors', async () => {
      mockCacheService.healthCheck.mockRejectedValue(new Error('Health check failed'));

      const caller = createCaller(createMockContext());
      const result = await caller.healthCheck();

      expect(result.status).toBe('unhealthy');
      expect(result.error).toBeDefined();
    });
  });
});