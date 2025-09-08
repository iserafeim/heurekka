import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CacheService } from '@/services/cache';
import { createMockRedisClient } from '../mocks/serviceMocks';
import { mockProperties, mockHomepageData, mockSuggestions, mockSearchResults, mockLocation } from '../fixtures/propertyFixtures';

// Mock Redis
vi.mock('ioredis', () => {
  return {
    default: vi.fn().mockImplementation(() => createMockRedisClient())
  };
});

describe('CacheService', () => {
  let cacheService: any;
  let mockRedis: any;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    
    // Create new cache service instance
    cacheService = new CacheService();
    mockRedis = cacheService.redis;
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Featured Properties Cache', () => {
    describe('getFeaturedProperties', () => {
      it('should return null when no cached data exists', async () => {
        mockRedis.get.mockResolvedValue(null);

        const result = await cacheService.getFeaturedProperties('test-key');

        expect(result).toBeNull();
        expect(mockRedis.get).toHaveBeenCalledWith('featured:test-key');
      });

      it('should return parsed properties when cached data exists', async () => {
        const cachedData = JSON.stringify(mockProperties);
        mockRedis.get.mockResolvedValue(cachedData);

        const result = await cacheService.getFeaturedProperties('test-key');

        expect(result).toEqual(mockProperties);
        expect(mockRedis.get).toHaveBeenCalledWith('featured:test-key');
      });

      it('should return null and log error on Redis failure', async () => {
        mockRedis.get.mockRejectedValue(new Error('Redis error'));

        const result = await cacheService.getFeaturedProperties('test-key');

        expect(result).toBeNull();
        expect(console.error).toHaveBeenCalledWith('Error getting featured properties from cache:', expect.any(Error));
      });
    });

    describe('setFeaturedProperties', () => {
      it('should cache properties with correct TTL', async () => {
        mockRedis.setex.mockResolvedValue('OK');

        await cacheService.setFeaturedProperties('test-key', mockProperties);

        expect(mockRedis.setex).toHaveBeenCalledWith(
          'featured:test-key',
          600, // TTL.FEATURED_PROPERTIES
          JSON.stringify(mockProperties)
        );
      });

      it('should handle Redis errors gracefully', async () => {
        mockRedis.setex.mockRejectedValue(new Error('Redis error'));

        await expect(cacheService.setFeaturedProperties('test-key', mockProperties)).resolves.not.toThrow();
        expect(console.error).toHaveBeenCalledWith('Error caching featured properties:', expect.any(Error));
      });
    });
  });

  describe('Search Results Cache', () => {
    describe('getSearchResults', () => {
      it('should return null when no cached data exists', async () => {
        mockRedis.get.mockResolvedValue(null);

        const result = await cacheService.getSearchResults('search-hash');

        expect(result).toBeNull();
        expect(mockRedis.get).toHaveBeenCalledWith('search:search-hash');
      });

      it('should return parsed search results when cached data exists', async () => {
        const cachedData = JSON.stringify(mockSearchResults);
        mockRedis.get.mockResolvedValue(cachedData);

        const result = await cacheService.getSearchResults('search-hash');

        expect(result).toEqual(mockSearchResults);
        expect(mockRedis.get).toHaveBeenCalledWith('search:search-hash');
      });

      it('should return null on Redis error', async () => {
        mockRedis.get.mockRejectedValue(new Error('Redis error'));

        const result = await cacheService.getSearchResults('search-hash');

        expect(result).toBeNull();
        expect(console.error).toHaveBeenCalledWith('Error getting search results from cache:', expect.any(Error));
      });
    });

    describe('setSearchResults', () => {
      it('should cache search results with correct TTL', async () => {
        mockRedis.setex.mockResolvedValue('OK');

        await cacheService.setSearchResults('search-hash', mockSearchResults);

        expect(mockRedis.setex).toHaveBeenCalledWith(
          'search:search-hash',
          300, // TTL.SEARCH_RESULTS
          JSON.stringify(mockSearchResults)
        );
      });

      it('should handle Redis errors gracefully', async () => {
        mockRedis.setex.mockRejectedValue(new Error('Redis error'));

        await expect(cacheService.setSearchResults('search-hash', mockSearchResults)).resolves.not.toThrow();
        expect(console.error).toHaveBeenCalledWith('Error caching search results:', expect.any(Error));
      });
    });
  });

  describe('Suggestions Cache', () => {
    describe('getSuggestions', () => {
      it('should return null when no cached data exists', async () => {
        mockRedis.get.mockResolvedValue(null);

        const result = await cacheService.getSuggestions('apartment');

        expect(result).toBeNull();
        expect(mockRedis.get).toHaveBeenCalledWith('suggestions:apartment');
      });

      it('should return cached suggestions with location hash', async () => {
        const cachedData = JSON.stringify(mockSuggestions);
        mockRedis.get.mockResolvedValue(cachedData);

        const result = await cacheService.getSuggestions('apartment', 'location-hash');

        expect(result).toEqual(mockSuggestions);
        expect(mockRedis.get).toHaveBeenCalledWith('suggestions:apartment:location-hash');
      });

      it('should return null on Redis error', async () => {
        mockRedis.get.mockRejectedValue(new Error('Redis error'));

        const result = await cacheService.getSuggestions('apartment');

        expect(result).toBeNull();
        expect(console.error).toHaveBeenCalledWith('Error getting suggestions from cache:', expect.any(Error));
      });
    });

    describe('setSuggestions', () => {
      it('should cache suggestions without location hash', async () => {
        mockRedis.setex.mockResolvedValue('OK');

        await cacheService.setSuggestions('apartment', mockSuggestions);

        expect(mockRedis.setex).toHaveBeenCalledWith(
          'suggestions:apartment',
          1800, // TTL.SUGGESTIONS
          JSON.stringify(mockSuggestions)
        );
      });

      it('should cache suggestions with location hash', async () => {
        mockRedis.setex.mockResolvedValue('OK');

        await cacheService.setSuggestions('apartment', mockSuggestions, 'location-hash');

        expect(mockRedis.setex).toHaveBeenCalledWith(
          'suggestions:apartment:location-hash',
          1800, // TTL.SUGGESTIONS
          JSON.stringify(mockSuggestions)
        );
      });

      it('should handle Redis errors gracefully', async () => {
        mockRedis.setex.mockRejectedValue(new Error('Redis error'));

        await expect(cacheService.setSuggestions('apartment', mockSuggestions)).resolves.not.toThrow();
        expect(console.error).toHaveBeenCalledWith('Error caching suggestions:', expect.any(Error));
      });
    });
  });

  describe('Homepage Data Cache', () => {
    describe('getHomepageData', () => {
      it('should return null when no cached data exists', async () => {
        mockRedis.get.mockResolvedValue(null);

        const result = await cacheService.getHomepageData();

        expect(result).toBeNull();
        expect(mockRedis.get).toHaveBeenCalledWith('homepage:data');
      });

      it('should return parsed homepage data when cached', async () => {
        const cachedData = JSON.stringify(mockHomepageData);
        mockRedis.get.mockResolvedValue(cachedData);

        const result = await cacheService.getHomepageData();

        expect(result).toEqual(mockHomepageData);
        expect(mockRedis.get).toHaveBeenCalledWith('homepage:data');
      });

      it('should return null on Redis error', async () => {
        mockRedis.get.mockRejectedValue(new Error('Redis error'));

        const result = await cacheService.getHomepageData();

        expect(result).toBeNull();
        expect(console.error).toHaveBeenCalledWith('Error getting homepage data from cache:', expect.any(Error));
      });
    });

    describe('setHomepageData', () => {
      it('should cache homepage data with correct TTL', async () => {
        mockRedis.setex.mockResolvedValue('OK');

        await cacheService.setHomepageData(mockHomepageData);

        expect(mockRedis.setex).toHaveBeenCalledWith(
          'homepage:data',
          900, // TTL.HOMEPAGE_DATA
          JSON.stringify(mockHomepageData)
        );
      });

      it('should handle Redis errors gracefully', async () => {
        mockRedis.setex.mockRejectedValue(new Error('Redis error'));

        await expect(cacheService.setHomepageData(mockHomepageData)).resolves.not.toThrow();
        expect(console.error).toHaveBeenCalledWith('Error caching homepage data:', expect.any(Error));
      });
    });
  });

  describe('Popular Searches Cache', () => {
    const popularSearches = ['apartment', 'house', 'room'];

    describe('getPopularSearches', () => {
      it('should return null when no cached data exists', async () => {
        mockRedis.get.mockResolvedValue(null);

        const result = await cacheService.getPopularSearches();

        expect(result).toBeNull();
        expect(mockRedis.get).toHaveBeenCalledWith('popular:searches');
      });

      it('should return parsed popular searches when cached', async () => {
        const cachedData = JSON.stringify(popularSearches);
        mockRedis.get.mockResolvedValue(cachedData);

        const result = await cacheService.getPopularSearches();

        expect(result).toEqual(popularSearches);
        expect(mockRedis.get).toHaveBeenCalledWith('popular:searches');
      });

      it('should return null on Redis error', async () => {
        mockRedis.get.mockRejectedValue(new Error('Redis error'));

        const result = await cacheService.getPopularSearches();

        expect(result).toBeNull();
        expect(console.error).toHaveBeenCalledWith('Error getting popular searches from cache:', expect.any(Error));
      });
    });

    describe('setPopularSearches', () => {
      it('should cache popular searches with correct TTL', async () => {
        mockRedis.setex.mockResolvedValue('OK');

        await cacheService.setPopularSearches(popularSearches);

        expect(mockRedis.setex).toHaveBeenCalledWith(
          'popular:searches',
          3600, // TTL.POPULAR_SEARCHES
          JSON.stringify(popularSearches)
        );
      });

      it('should handle Redis errors gracefully', async () => {
        mockRedis.setex.mockRejectedValue(new Error('Redis error'));

        await expect(cacheService.setPopularSearches(popularSearches)).resolves.not.toThrow();
        expect(console.error).toHaveBeenCalledWith('Error caching popular searches:', expect.any(Error));
      });
    });
  });

  describe('Analytics and Metrics', () => {
    describe('incrementSearchCount', () => {
      it('should increment search count and set expiry', async () => {
        mockRedis.incr.mockResolvedValue(1);
        mockRedis.expire.mockResolvedValue(1);

        await cacheService.incrementSearchCount('apartment');

        expect(mockRedis.incr).toHaveBeenCalledWith('analytics:search_count:apartment');
        expect(mockRedis.expire).toHaveBeenCalledWith('analytics:search_count:apartment', 604800); // 7 days
      });

      it('should handle Redis errors gracefully', async () => {
        mockRedis.incr.mockRejectedValue(new Error('Redis error'));

        await expect(cacheService.incrementSearchCount('apartment')).resolves.not.toThrow();
        expect(console.error).toHaveBeenCalledWith('Error incrementing search count:', expect.any(Error));
      });
    });

    describe('getSearchCount', () => {
      it('should return search count when exists', async () => {
        mockRedis.get.mockResolvedValue('5');

        const result = await cacheService.getSearchCount('apartment');

        expect(result).toBe(5);
        expect(mockRedis.get).toHaveBeenCalledWith('analytics:search_count:apartment');
      });

      it('should return 0 when no count exists', async () => {
        mockRedis.get.mockResolvedValue(null);

        const result = await cacheService.getSearchCount('apartment');

        expect(result).toBe(0);
      });

      it('should return 0 on Redis error', async () => {
        mockRedis.get.mockRejectedValue(new Error('Redis error'));

        const result = await cacheService.getSearchCount('apartment');

        expect(result).toBe(0);
        expect(console.error).toHaveBeenCalledWith('Error getting search count:', expect.any(Error));
      });
    });

    describe('incrementPropertyView', () => {
      it('should increment property view count and set expiry', async () => {
        mockRedis.incr.mockResolvedValue(1);
        mockRedis.expire.mockResolvedValue(1);

        await cacheService.incrementPropertyView('prop-123');

        expect(mockRedis.incr).toHaveBeenCalledWith('analytics:property_views:prop-123');
        expect(mockRedis.expire).toHaveBeenCalledWith('analytics:property_views:prop-123', 2592000); // 30 days
      });

      it('should handle Redis errors gracefully', async () => {
        mockRedis.incr.mockRejectedValue(new Error('Redis error'));

        await expect(cacheService.incrementPropertyView('prop-123')).resolves.not.toThrow();
        expect(console.error).toHaveBeenCalledWith('Error incrementing property view:', expect.any(Error));
      });
    });
  });

  describe('Rate Limiting', () => {
    describe('isRateLimited', () => {
      it('should return false for first request and set expiry', async () => {
        mockRedis.incr.mockResolvedValue(1);
        mockRedis.expire.mockResolvedValue(1);

        const result = await cacheService.isRateLimited('user-123');

        expect(result).toBe(false);
        expect(mockRedis.incr).toHaveBeenCalledWith('rate_limit:user-123');
        expect(mockRedis.expire).toHaveBeenCalledWith('rate_limit:user-123', 900); // default window
      });

      it('should return false when under limit', async () => {
        mockRedis.incr.mockResolvedValue(50);

        const result = await cacheService.isRateLimited('user-123');

        expect(result).toBe(false);
      });

      it('should return true when over limit', async () => {
        mockRedis.incr.mockResolvedValue(101);

        const result = await cacheService.isRateLimited('user-123');

        expect(result).toBe(true);
      });

      it('should use custom limits', async () => {
        mockRedis.incr.mockResolvedValue(6);

        const result = await cacheService.isRateLimited('user-123', 5, 60);

        expect(result).toBe(true);
        expect(mockRedis.expire).toHaveBeenCalledWith('rate_limit:user-123', 60);
      });

      it('should return false on Redis error (fail open)', async () => {
        mockRedis.incr.mockRejectedValue(new Error('Redis error'));

        const result = await cacheService.isRateLimited('user-123');

        expect(result).toBe(false);
        expect(console.error).toHaveBeenCalledWith('Error checking rate limit:', expect.any(Error));
      });
    });
  });

  describe('Session Management', () => {
    describe('setUserSession', () => {
      it('should set user session with default TTL', async () => {
        mockRedis.setex.mockResolvedValue('OK');
        const sessionData = { userId: 'user-123', preferences: {} };

        await cacheService.setUserSession('session-456', sessionData);

        expect(mockRedis.setex).toHaveBeenCalledWith(
          'session:session-456',
          3600, // default TTL
          JSON.stringify(sessionData)
        );
      });

      it('should set user session with custom TTL', async () => {
        mockRedis.setex.mockResolvedValue('OK');
        const sessionData = { userId: 'user-123', preferences: {} };

        await cacheService.setUserSession('session-456', sessionData, 7200);

        expect(mockRedis.setex).toHaveBeenCalledWith(
          'session:session-456',
          7200,
          JSON.stringify(sessionData)
        );
      });

      it('should handle Redis errors gracefully', async () => {
        mockRedis.setex.mockRejectedValue(new Error('Redis error'));

        await expect(cacheService.setUserSession('session-456', {})).resolves.not.toThrow();
        expect(console.error).toHaveBeenCalledWith('Error setting user session:', expect.any(Error));
      });
    });

    describe('getUserSession', () => {
      it('should return null when no session exists', async () => {
        mockRedis.get.mockResolvedValue(null);

        const result = await cacheService.getUserSession('session-456');

        expect(result).toBeNull();
        expect(mockRedis.get).toHaveBeenCalledWith('session:session-456');
      });

      it('should return parsed session data when exists', async () => {
        const sessionData = { userId: 'user-123', preferences: {} };
        mockRedis.get.mockResolvedValue(JSON.stringify(sessionData));

        const result = await cacheService.getUserSession('session-456');

        expect(result).toEqual(sessionData);
        expect(mockRedis.get).toHaveBeenCalledWith('session:session-456');
      });

      it('should return null on Redis error', async () => {
        mockRedis.get.mockRejectedValue(new Error('Redis error'));

        const result = await cacheService.getUserSession('session-456');

        expect(result).toBeNull();
        expect(console.error).toHaveBeenCalledWith('Error getting user session:', expect.any(Error));
      });
    });
  });

  describe('Utility Methods', () => {
    describe('generateSearchHash', () => {
      it('should generate consistent hash for same parameters', () => {
        const searchParams = {
          query: 'apartment',
          location: { lat: 14.0723, lng: -87.1921 },
          filters: { priceMin: 1000 },
          sortBy: 'relevance',
          page: 1,
          limit: 20
        };

        const hash1 = cacheService.generateSearchHash(searchParams);
        const hash2 = cacheService.generateSearchHash(searchParams);

        expect(hash1).toBe(hash2);
        expect(typeof hash1).toBe('string');
        expect(hash1.length).toBeLessThanOrEqual(32);
      });

      it('should generate different hashes for different parameters', () => {
        const params1 = { query: 'apartment', sortBy: 'relevance' };
        const params2 = { query: 'house', sortBy: 'relevance' };

        const hash1 = cacheService.generateSearchHash(params1);
        const hash2 = cacheService.generateSearchHash(params2);

        expect(hash1).not.toBe(hash2);
      });

      it('should handle missing parameters with defaults', () => {
        const emptyParams = {};
        const hash = cacheService.generateSearchHash(emptyParams);

        expect(typeof hash).toBe('string');
        expect(hash.length).toBeLessThanOrEqual(32);
      });
    });

    describe('generateLocationHash', () => {
      it('should generate consistent hash for same location', () => {
        const location = { lat: 14.0723, lng: -87.1921 };

        const hash1 = cacheService.generateLocationHash(location);
        const hash2 = cacheService.generateLocationHash(location);

        expect(hash1).toBe(hash2);
        expect(hash1).toBe('14.072_-87.192');
      });

      it('should round coordinates to 3 decimal places', () => {
        const location = { lat: 14.072345, lng: -87.192156 };
        const hash = cacheService.generateLocationHash(location);

        expect(hash).toBe('14.072_-87.192');
      });
    });
  });

  describe('Health Check', () => {
    it('should return healthy status with latency on success', async () => {
      mockRedis.ping.mockResolvedValue('PONG');

      const result = await cacheService.healthCheck();

      expect(result.status).toBe('healthy');
      expect(result.latency).toBeDefined();
      expect(typeof result.latency).toBe('number');
      expect(mockRedis.ping).toHaveBeenCalled();
    });

    it('should return unhealthy status on Redis error', async () => {
      mockRedis.ping.mockRejectedValue(new Error('Redis connection failed'));

      const result = await cacheService.healthCheck();

      expect(result.status).toBe('unhealthy');
      expect(result.latency).toBeUndefined();
      expect(console.error).toHaveBeenCalledWith('Redis health check failed:', expect.any(Error));
    });
  });

  describe('Cache Invalidation', () => {
    describe('invalidatePattern', () => {
      it('should delete keys matching pattern', async () => {
        const keys = ['heurekka:featured:key1', 'heurekka:featured:key2'];
        mockRedis.keys.mockResolvedValue(keys);
        mockRedis.del.mockResolvedValue(2);

        await cacheService.invalidatePattern('heurekka:featured:*');

        expect(mockRedis.keys).toHaveBeenCalledWith('heurekka:featured:*');
        expect(mockRedis.del).toHaveBeenCalledWith(...keys);
      });

      it('should handle no matching keys', async () => {
        mockRedis.keys.mockResolvedValue([]);

        await cacheService.invalidatePattern('nonexistent:*');

        expect(mockRedis.keys).toHaveBeenCalledWith('nonexistent:*');
        expect(mockRedis.del).not.toHaveBeenCalled();
      });

      it('should handle Redis errors gracefully', async () => {
        mockRedis.keys.mockRejectedValue(new Error('Redis error'));

        await expect(cacheService.invalidatePattern('test:*')).resolves.not.toThrow();
        expect(console.error).toHaveBeenCalledWith('Error invalidating cache pattern:', expect.any(Error));
      });
    });

    describe('invalidateFeaturedProperties', () => {
      it('should call invalidatePattern with correct pattern', async () => {
        const spy = vi.spyOn(cacheService, 'invalidatePattern').mockResolvedValue();

        await cacheService.invalidateFeaturedProperties();

        expect(spy).toHaveBeenCalledWith('heurekka:featured:*');
      });
    });

    describe('invalidateHomepageData', () => {
      it('should delete homepage data key', async () => {
        mockRedis.del.mockResolvedValue(1);

        await cacheService.invalidateHomepageData();

        expect(mockRedis.del).toHaveBeenCalledWith('heurekka:homepage:data');
      });
    });
  });

  describe('Cleanup', () => {
    describe('disconnect', () => {
      it('should quit Redis connection', async () => {
        mockRedis.quit.mockResolvedValue('OK');

        await cacheService.disconnect();

        expect(mockRedis.quit).toHaveBeenCalled();
      });

      it('should handle disconnect errors gracefully', async () => {
        mockRedis.quit.mockRejectedValue(new Error('Disconnect failed'));

        await expect(cacheService.disconnect()).resolves.not.toThrow();
        expect(console.error).toHaveBeenCalledWith('Error disconnecting from Redis:', expect.any(Error));
      });
    });
  });
});