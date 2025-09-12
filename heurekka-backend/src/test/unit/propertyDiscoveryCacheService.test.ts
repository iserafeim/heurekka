import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CacheService } from '../../services/cache.service';
import type { MapBounds, Property } from '../../types/property';

// Mock Redis
const mockRedis = {
  get: vi.fn(),
  set: vi.fn(),
  setex: vi.fn(),
  keys: vi.fn(),
  del: vi.fn(),
  info: vi.fn(),
  ping: vi.fn(),
  quit: vi.fn(),
  on: vi.fn(),
};

vi.mock('ioredis', () => {
  return {
    default: vi.fn().mockImplementation(() => mockRedis)
  };
});

describe('Property Discovery CacheService', () => {
  let cacheService: CacheService;

  beforeEach(() => {
    vi.clearAllMocks();
    cacheService = new CacheService();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('basic operations', () => {
    it('should get value from Redis', async () => {
      const testKey = 'test:key';
      const testValue = 'test-value';
      mockRedis.get.mockResolvedValue(testValue);

      const result = await cacheService.get(testKey);

      expect(mockRedis.get).toHaveBeenCalledWith(testKey);
      expect(result).toBe(testValue);
    });

    it('should handle get errors gracefully', async () => {
      const testKey = 'test:key';
      mockRedis.get.mockRejectedValue(new Error('Redis connection failed'));

      const result = await cacheService.get(testKey);

      expect(result).toBeNull();
    });

    it('should set value with TTL', async () => {
      const testKey = 'test:key';
      const testValue = 'test-value';
      const ttl = 300;

      mockRedis.setex.mockResolvedValue('OK');

      const result = await cacheService.set(testKey, testValue, ttl);

      expect(mockRedis.setex).toHaveBeenCalledWith(testKey, ttl, testValue);
      expect(result).toBe(true);
    });

    it('should set value without TTL', async () => {
      const testKey = 'test:key';
      const testValue = 'test-value';

      mockRedis.set.mockResolvedValue('OK');

      const result = await cacheService.set(testKey, testValue);

      expect(mockRedis.set).toHaveBeenCalledWith(testKey, testValue);
      expect(result).toBe(true);
    });

    it('should handle set errors gracefully', async () => {
      const testKey = 'test:key';
      const testValue = 'test-value';

      mockRedis.setex.mockRejectedValue(new Error('Redis write failed'));

      const result = await cacheService.set(testKey, testValue, 300);

      expect(result).toBe(false);
    });
  });

  describe('property search caching', () => {
    const mockFilters = {
      location: 'Tegucigalpa',
      priceMin: 5000,
      priceMax: 20000,
      bedrooms: [2, 3],
      propertyTypes: ['apartment'],
      sortBy: 'precio_asc'
    };

    const mockResults = {
      properties: [
        {
          id: '123',
          title: 'Test Property',
          price: { amount: 15000 }
        }
      ],
      total: 1,
      nextCursor: null
    };

    it('should cache search results', async () => {
      mockRedis.setex.mockResolvedValue('OK');

      await cacheService.cacheSearchResults(mockFilters, mockResults);

      expect(mockRedis.setex).toHaveBeenCalledWith(
        expect.stringContaining('heurekka:property:search:'),
        300, // default TTL
        JSON.stringify(mockResults)
      );
    });

    it('should get cached search results', async () => {
      mockRedis.get.mockResolvedValue(JSON.stringify(mockResults));

      const result = await cacheService.getCachedSearchResults(mockFilters);

      expect(result).toEqual(mockResults);
    });

    it('should return null when no cached search results', async () => {
      mockRedis.get.mockResolvedValue(null);

      const result = await cacheService.getCachedSearchResults(mockFilters);

      expect(result).toBeNull();
    });
  });

  describe('property detail caching', () => {
    const propertyId = '123e4567-e89b-12d3-a456-426614174000';
    const mockProperty = {
      id: propertyId,
      title: 'Test Property',
      price: { amount: 15000 },
      bedrooms: 2,
      coordinates: { lat: 14.0723, lng: -87.2072 }
    };

    it('should cache property detail', async () => {
      mockRedis.setex.mockResolvedValue('OK');

      await cacheService.cachePropertyDetail(propertyId, mockProperty);

      expect(mockRedis.setex).toHaveBeenCalledWith(
        `heurekka:property:detail:${propertyId}`,
        3600, // default TTL
        JSON.stringify(mockProperty)
      );
    });

    it('should get cached property detail', async () => {
      mockRedis.get.mockResolvedValue(JSON.stringify(mockProperty));

      const result = await cacheService.getCachedPropertyDetail(propertyId);

      expect(result).toEqual(mockProperty);
    });
  });

  describe('map bounds caching', () => {
    const mockBounds: MapBounds = {
      north: 14.1723,
      south: 13.9723,
      east: -87.1072,
      west: -87.3072
    };

    const mockProperties: Property[] = [
      {
        id: '123',
        title: 'Test Property',
        description: '',
        type: 'apartment',
        address: 'Test Address',
        neighborhood: 'Test Area',
        coordinates: { lat: 14.0723, lng: -87.2072 },
        price: { amount: 15000, currency: 'HNL', period: 'month' },
        bedrooms: 2,
        bathrooms: 2,
        amenities: [],
        images: [
          { id: 'img1', url: 'test.jpg', alt: 'test', isPrimary: true, order: 1 },
          { id: 'img2', url: 'test2.jpg', alt: 'test2', isPrimary: false, order: 2 }
        ],
        viewCount: 0,
        favoriteCount: 0,
        contactCount: 0,
        contactPhone: '',
        landlord: {
          id: 'landlord1',
          name: 'Test Landlord',
          phone: '+50499887766',
          rating: 4.5,
          verified: true
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    it('should cache map bounds data with optimized structure', async () => {
      mockRedis.setex.mockResolvedValue('OK');

      await cacheService.cacheMapBounds(mockBounds, mockProperties);

      expect(mockRedis.setex).toHaveBeenCalledWith(
        expect.stringContaining('heurekka:property:bounds:'),
        180, // default TTL
        expect.stringContaining('"properties"')
      );

      // Verify the cached data structure is optimized (only essential fields)
      const cachedData = JSON.parse(mockRedis.setex.mock.calls[0][2]);
      expect(cachedData.properties[0]).toMatchObject({
        id: '123',
        coordinates: { lat: 14.0723, lng: -87.2072 },
        price: 15000,
        bedrooms: 2,
        type: 'apartment',
        title: 'Test Property',
        images: [{ id: 'img1', url: 'test.jpg', alt: 'test', isPrimary: true, order: 1 }] // Only primary image
      });
      expect(cachedData.bounds).toEqual(mockBounds);
      expect(cachedData.timestamp).toBeTypeOf('number');
    });

    it('should get cached map bounds data', async () => {
      const cachedData = {
        properties: [{
          id: '123',
          coordinates: { lat: 14.0723, lng: -87.2072 },
          price: 15000
        }],
        bounds: mockBounds,
        timestamp: Date.now()
      };

      mockRedis.get.mockResolvedValue(JSON.stringify(cachedData));

      const result = await cacheService.getCachedMapBounds(mockBounds);

      expect(result).toEqual(cachedData);
    });
  });

  describe('property clusters caching', () => {
    const mockBounds: MapBounds = {
      north: 14.1723,
      south: 13.9723,
      east: -87.1072,
      west: -87.3072
    };

    const zoom = 12;
    const filters = { priceMax: 20000 };
    const mockClusters = [
      {
        id: 1,
        coordinates: { lat: 14.0723, lng: -87.2072 },
        count: 5,
        avgPrice: 15000
      }
    ];

    it('should cache property clusters', async () => {
      mockRedis.setex.mockResolvedValue('OK');

      await cacheService.cachePropertyClusters(mockBounds, zoom, filters, mockClusters);

      expect(mockRedis.setex).toHaveBeenCalledWith(
        expect.stringContaining('heurekka:property:clusters:'),
        300, // default TTL
        expect.stringContaining('"clusters"')
      );

      // Verify cached data structure
      const cachedData = JSON.parse(mockRedis.setex.mock.calls[0][2]);
      expect(cachedData).toMatchObject({
        clusters: mockClusters,
        bounds: mockBounds,
        zoom,
        timestamp: expect.any(Number)
      });
    });

    it('should get cached property clusters', async () => {
      const cachedData = {
        clusters: mockClusters,
        bounds: mockBounds,
        zoom,
        timestamp: Date.now()
      };

      mockRedis.get.mockResolvedValue(JSON.stringify(cachedData));

      const result = await cacheService.getCachedPropertyClusters(mockBounds, zoom, filters);

      expect(result).toEqual(cachedData);
    });
  });

  describe('autocomplete suggestions caching', () => {
    const testQuery = 'Lomas del Guijarro';
    const mockSuggestions = [
      {
        id: 'suggestion-1',
        text: 'Lomas del Guijarro',
        type: 'location',
        icon: 'map-pin',
        subtitle: '25 propiedades'
      }
    ];

    it('should cache autocomplete suggestions', async () => {
      mockRedis.setex.mockResolvedValue('OK');

      await cacheService.cacheAutocompleteSuggestions(testQuery, mockSuggestions);

      expect(mockRedis.setex).toHaveBeenCalledWith(
        `heurekka:autocomplete:${testQuery.toLowerCase().trim()}`,
        86400, // default TTL (24 hours)
        JSON.stringify(mockSuggestions)
      );
    });

    it('should normalize query keys for consistent caching', async () => {
      mockRedis.setex.mockResolvedValue('OK');

      await cacheService.cacheAutocompleteSuggestions('  LOMAS DEL GUIJARRO  ', mockSuggestions);

      expect(mockRedis.setex).toHaveBeenCalledWith(
        'heurekka:autocomplete:lomas del guijarro',
        86400,
        JSON.stringify(mockSuggestions)
      );
    });

    it('should get cached autocomplete suggestions', async () => {
      mockRedis.get.mockResolvedValue(JSON.stringify(mockSuggestions));

      const result = await cacheService.getCachedAutocompleteSuggestions(testQuery);

      expect(result).toEqual(mockSuggestions);
    });
  });

  describe('cache invalidation', () => {
    const propertyId = '123e4567-e89b-12d3-a456-426614174000';

    it('should invalidate all property-related caches', async () => {
      mockRedis.keys
        .mockResolvedValueOnce([`heurekka:property:detail:${propertyId}`])
        .mockResolvedValueOnce(['heurekka:property:search:hash1', 'heurekka:property:search:hash2'])
        .mockResolvedValueOnce(['heurekka:property:bounds:hash1'])
        .mockResolvedValueOnce(['heurekka:property:clusters:hash1'])
        .mockResolvedValueOnce(['heurekka:property:facets:hash1']);

      mockRedis.del.mockResolvedValue(1);

      await cacheService.invalidatePropertyCache(propertyId);

      expect(mockRedis.keys).toHaveBeenCalledTimes(5);
      expect(mockRedis.del).toHaveBeenCalledTimes(5);
    });

    it('should handle invalidation when no keys exist', async () => {
      mockRedis.keys.mockResolvedValue([]);

      // Should not throw error
      await expect(cacheService.invalidatePropertyCache(propertyId))
        .resolves.toBeUndefined();

      expect(mockRedis.del).not.toHaveBeenCalled();
    });

    it('should handle invalidation errors gracefully', async () => {
      mockRedis.keys.mockRejectedValue(new Error('Keys lookup failed'));

      // Should not throw error
      await expect(cacheService.invalidatePropertyCache(propertyId))
        .resolves.toBeUndefined();
    });
  });

  describe('health check', () => {
    it('should return healthy status when Redis is responsive', async () => {
      mockRedis.ping.mockResolvedValue('PONG');
      mockRedis.info.mockResolvedValue('redis_version:7.0.0');

      const result = await cacheService.healthCheck();

      expect(result).toEqual({
        status: 'healthy',
        details: {
          connected: true,
          redis_version: '7.0.0'
        }
      });
    });

    it('should return unhealthy status when ping fails', async () => {
      mockRedis.ping.mockResolvedValue('NOT_PONG');

      const result = await cacheService.healthCheck();

      expect(result).toEqual({
        status: 'unhealthy',
        details: { error: 'Ping failed' }
      });
    });

    it('should handle health check errors', async () => {
      mockRedis.ping.mockRejectedValue(new Error('Connection failed'));

      const result = await cacheService.healthCheck();

      expect(result).toEqual({
        status: 'unhealthy',
        details: { error: 'Connection failed' }
      });
    });
  });

  describe('cache warmup', () => {
    it('should warm up cache with popular searches', async () => {
      mockRedis.setex.mockResolvedValue('OK');

      await cacheService.warmupCache();

      // Should set up cache keys for popular queries
      expect(mockRedis.setex).toHaveBeenCalledWith(
        'heurekka:autocomplete:lomas del guijarro',
        86400,
        JSON.stringify([])
      );

      expect(mockRedis.setex).toHaveBeenCalledWith(
        'heurekka:autocomplete:apartamento',
        86400,
        JSON.stringify([])
      );
    });

    it('should handle warmup errors gracefully', async () => {
      mockRedis.setex.mockRejectedValue(new Error('Warmup failed'));

      // Should not throw error
      await expect(cacheService.warmupCache()).resolves.toBeUndefined();
    });
  });
});