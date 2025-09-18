import Redis from 'ioredis';
import type { CacheConfig, MapBounds } from '../types/property';

export class CacheService {
  private redis: Redis;
  
  // Cache TTL configuration (in seconds)
  private readonly TTL_CONFIG: CacheConfig = {
    searchResults: 300,    // 5 minutes
    propertyDetail: 3600,  // 1 hour
    mapBounds: 180,        // 3 minutes
    autocomplete: 86400,   // 24 hours
    facets: 600,           // 10 minutes
    clusters: 300,         // 5 minutes
  };

  // Cache key prefixes
  private readonly CACHE_KEYS = {
    PROPERTY_SEARCH: 'heurekka:property:search:',
    PROPERTY_DETAIL: 'heurekka:property:detail:',
    MAP_BOUNDS: 'heurekka:property:bounds:',
    AUTOCOMPLETE: 'heurekka:autocomplete:',
    FACETS: 'heurekka:property:facets:',
    CLUSTERS: 'heurekka:property:clusters:',
    USER_FAVORITES: 'heurekka:user:favorites:',
    PROPERTY_VIEWS: 'heurekka:property:views:',
  };

  constructor() {
    const redisUrl = process.env.REDIS_URL;
    const redisHost = process.env.REDIS_HOST || 'localhost';
    const redisPort = parseInt(process.env.REDIS_PORT || '6379');
    const redisPassword = process.env.REDIS_PASSWORD;
    const redisUsername = process.env.REDIS_USERNAME;
    const redisTls = process.env.REDIS_TLS === 'true';

    if (redisUrl) {
      this.redis = new Redis(redisUrl, {
        retryDelayOnFailover: 100,
        enableReadyCheck: false,
        maxRetriesPerRequest: 1,
        // Security configurations
        lazyConnect: true,
        connectTimeout: 10000,
        commandTimeout: 5000,
        // TLS configuration if enabled
        tls: redisTls ? {} : undefined,
      });
    } else {
      this.redis = new Redis({
        host: redisHost,
        port: redisPort,
        password: redisPassword,
        username: redisUsername, // Redis 6+ ACL support
        retryDelayOnFailover: 100,
        enableReadyCheck: false,
        maxRetriesPerRequest: 1,
        // Security configurations
        lazyConnect: true,
        connectTimeout: 10000,
        commandTimeout: 5000,
        // TLS configuration if enabled
        tls: redisTls ? {} : undefined,
      });
    }

    this.redis.on('error', (error) => {
      console.error('Redis connection error:', error);
    });

    this.redis.on('connect', () => {
      console.log('✅ Redis connected successfully');
    });
  }

  /**
   * Generic get method with key validation
   */
  async get(key: string): Promise<string | null> {
    try {
      // Validate cache key for security
      if (!this.isValidCacheKey(key)) {
        console.warn('Invalid cache key attempted:', key);
        return null;
      }
      
      return await this.redis.get(key);
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  /**
   * Generic set method with key validation and size limits
   */
  async set(key: string, value: string, ttlSeconds?: number): Promise<boolean> {
    try {
      // Validate cache key for security
      if (!this.isValidCacheKey(key)) {
        console.warn('Invalid cache key attempted:', key);
        return false;
      }
      
      // Limit value size to prevent memory issues (max 1MB)
      if (value.length > 1024 * 1024) {
        console.warn('Cache value too large, skipping:', key, 'size:', value.length);
        return false;
      }
      
      if (ttlSeconds) {
        await this.redis.setex(key, ttlSeconds, value);
      } else {
        await this.redis.set(key, value);
      }
      return true;
    } catch (error) {
      console.error('Redis set error:', error);
      return false;
    }
  }

  /**
   * Cache search results
   */
  async cacheSearchResults(
    filters: any,
    results: any,
    ttl?: number
  ): Promise<void> {
    try {
      const key = this.CACHE_KEYS.PROPERTY_SEARCH + this.hashFilters(filters);
      const value = JSON.stringify(results);
      await this.set(key, value, ttl || this.TTL_CONFIG.searchResults);
    } catch (error) {
      console.error('Error caching search results:', error);
    }
  }

  /**
   * Get cached search results
   */
  async getCachedSearchResults(filters: any): Promise<any | null> {
    try {
      const key = this.CACHE_KEYS.PROPERTY_SEARCH + this.hashFilters(filters);
      const cached = await this.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Error getting cached search results:', error);
      return null;
    }
  }

  /**
   * Cache property details
   */
  async cachePropertyDetail(
    propertyId: string,
    property: any,
    ttl?: number
  ): Promise<void> {
    try {
      const key = this.CACHE_KEYS.PROPERTY_DETAIL + propertyId;
      const value = JSON.stringify(property);
      await this.set(key, value, ttl || this.TTL_CONFIG.propertyDetail);
    } catch (error) {
      console.error('Error caching property detail:', error);
    }
  }

  /**
   * Get cached property details
   */
  async getCachedPropertyDetail(propertyId: string): Promise<any | null> {
    try {
      const key = this.CACHE_KEYS.PROPERTY_DETAIL + propertyId;
      const cached = await this.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Error getting cached property detail:', error);
      return null;
    }
  }

  /**
   * Cache map bounds data
   */
  async cacheMapBounds(
    bounds: MapBounds,
    properties: any[],
    ttl?: number
  ): Promise<void> {
    try {
      const key = this.CACHE_KEYS.MAP_BOUNDS + this.hashBounds(bounds);
      
      // Store only essential data for map markers to reduce memory usage
      const mapData = properties.map(p => ({
        id: p.id,
        coordinates: p.coordinates,
        price: p.price.amount,
        bedrooms: p.bedrooms,
        type: p.type,
        title: p.title,
        images: p.images.length > 0 ? [p.images[0]] : [], // Only primary image for map
      }));
      
      const value = JSON.stringify({
        properties: mapData,
        bounds,
        timestamp: Date.now(),
      });
      
      await this.set(key, value, ttl || this.TTL_CONFIG.mapBounds);
    } catch (error) {
      console.error('Error caching map bounds:', error);
    }
  }

  /**
   * Get cached map bounds data
   */
  async getCachedMapBounds(bounds: MapBounds): Promise<any | null> {
    try {
      const key = this.CACHE_KEYS.MAP_BOUNDS + this.hashBounds(bounds);
      const cached = await this.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Error getting cached map bounds:', error);
      return null;
    }
  }

  /**
   * Cache autocomplete suggestions
   */
  async cacheAutocompleteSuggestions(
    query: string,
    suggestions: any[],
    ttl?: number
  ): Promise<void> {
    try {
      const key = this.CACHE_KEYS.AUTOCOMPLETE + query.toLowerCase().trim();
      const value = JSON.stringify(suggestions);
      await this.set(key, value, ttl || this.TTL_CONFIG.autocomplete);
    } catch (error) {
      console.error('Error caching autocomplete suggestions:', error);
    }
  }

  /**
   * Get cached autocomplete suggestions
   */
  async getCachedAutocompleteSuggestions(query: string): Promise<any[] | null> {
    try {
      const key = this.CACHE_KEYS.AUTOCOMPLETE + query.toLowerCase().trim();
      const cached = await this.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Error getting cached autocomplete suggestions:', error);
      return null;
    }
  }

  /**
   * Cache property clusters
   */
  async cachePropertyClusters(
    bounds: MapBounds,
    zoom: number,
    filters: any,
    clusters: any[],
    ttl?: number
  ): Promise<void> {
    try {
      const key = this.CACHE_KEYS.CLUSTERS + this.hashClusterParams(bounds, zoom, filters);
      const value = JSON.stringify({
        clusters,
        bounds,
        zoom,
        timestamp: Date.now(),
      });
      await this.set(key, value, ttl || this.TTL_CONFIG.clusters);
    } catch (error) {
      console.error('Error caching property clusters:', error);
    }
  }

  /**
   * Get cached property clusters
   */
  async getCachedPropertyClusters(
    bounds: MapBounds,
    zoom: number,
    filters: any
  ): Promise<any | null> {
    try {
      const key = this.CACHE_KEYS.CLUSTERS + this.hashClusterParams(bounds, zoom, filters);
      const cached = await this.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Error getting cached property clusters:', error);
      return null;
    }
  }

  /**
   * Cache search facets
   */
  async cacheSearchFacets(
    bounds: MapBounds | undefined,
    filters: any,
    facets: any,
    ttl?: number
  ): Promise<void> {
    try {
      const key = this.CACHE_KEYS.FACETS + this.hashFacetParams(bounds, filters);
      const value = JSON.stringify(facets);
      await this.set(key, value, ttl || this.TTL_CONFIG.facets);
    } catch (error) {
      console.error('Error caching search facets:', error);
    }
  }

  /**
   * Get cached search facets
   */
  async getCachedSearchFacets(
    bounds: MapBounds | undefined,
    filters: any
  ): Promise<any | null> {
    try {
      const key = this.CACHE_KEYS.FACETS + this.hashFacetParams(bounds, filters);
      const cached = await this.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Error getting cached search facets:', error);
      return null;
    }
  }

  /**
   * Invalidate all caches related to a property
   */
  async invalidatePropertyCache(propertyId: string): Promise<void> {
    try {
      const patterns = [
        `${this.CACHE_KEYS.PROPERTY_DETAIL}${propertyId}`,
        `${this.CACHE_KEYS.PROPERTY_SEARCH}*`,
        `${this.CACHE_KEYS.MAP_BOUNDS}*`,
        `${this.CACHE_KEYS.CLUSTERS}*`,
        `${this.CACHE_KEYS.FACETS}*`,
      ];

      for (const pattern of patterns) {
        const keys = await this.redis.keys(pattern);
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
      }
    } catch (error) {
      console.error('Error invalidating property cache:', error);
    }
  }

  /**
   * Invalidate all search result caches
   */
  async invalidateSearchResults(): Promise<void> {
    try {
      console.log('🧹 Invalidating all search result caches...');
      const patterns = [
        `${this.CACHE_KEYS.PROPERTY_SEARCH}*`,
        `${this.CACHE_KEYS.MAP_BOUNDS}*`,
        `${this.CACHE_KEYS.CLUSTERS}*`,
        `${this.CACHE_KEYS.FACETS}*`,
      ];

      let totalDeleted = 0;
      for (const pattern of patterns) {
        const keys = await this.redis.keys(pattern);
        if (keys.length > 0) {
          await this.redis.del(...keys);
          totalDeleted += keys.length;
          console.log(`🧹 Deleted ${keys.length} keys matching ${pattern}`);
        }
      }
      console.log(`🧹 Total cache keys deleted: ${totalDeleted}`);
    } catch (error) {
      console.error('Error invalidating search results cache:', error);
      throw error;
    }
  }

  /**
   * Cache user favorites (session-based)
   */
  async cacheUserFavorites(userId: string, favorites: string[]): Promise<void> {
    try {
      const key = this.CACHE_KEYS.USER_FAVORITES + userId;
      const value = JSON.stringify(favorites);
      await this.set(key, value, 3600); // 1 hour for user session data
    } catch (error) {
      console.error('Error caching user favorites:', error);
    }
  }

  /**
   * Get cached user favorites
   */
  async getCachedUserFavorites(userId: string): Promise<string[] | null> {
    try {
      const key = this.CACHE_KEYS.USER_FAVORITES + userId;
      const cached = await this.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Error getting cached user favorites:', error);
      return null;
    }
  }

  /**
   * Warm up cache with popular searches
   */
  async warmupCache(): Promise<void> {
    try {
      console.log('🔥 Starting cache warmup...');
      
      // Popular search queries to pre-cache
      const popularSearches = [
        { location: 'Tegucigalpa', priceMax: 15000, bedrooms: [2] },
        { location: 'Lomas del Guijarro', priceMax: 20000 },
        { propertyTypes: ['apartment'], priceMax: 12000 },
        { propertyTypes: ['house'], bedrooms: [3, 4] },
      ];

      // Pre-cache popular autocomplete queries
      const popularQueries = [
        'Lomas del Guijarro',
        'Los Próceres',
        'Colonia Palmira',
        'apartamento',
        'casa',
      ];

      // Warm up autocomplete cache
      for (const query of popularQueries) {
        // This would trigger the actual autocomplete service to populate cache
        // For now, we just set up the cache keys
        const key = this.CACHE_KEYS.AUTOCOMPLETE + query.toLowerCase();
        await this.set(key, JSON.stringify([]), this.TTL_CONFIG.autocomplete);
      }
      
      console.log('✅ Cache warmup completed');
    } catch (error) {
      console.error('Error during cache warmup:', error);
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<any> {
    try {
      const info = await this.redis.info('memory');
      const keyspace = await this.redis.info('keyspace');
      
      // Count keys by prefix
      const prefixes = Object.values(this.CACHE_KEYS);
      const stats: any = {
        memory: this.parseRedisInfo(info),
        keyspace: this.parseRedisInfo(keyspace),
        keysByType: {},
      };

      for (const prefix of prefixes) {
        const keys = await this.redis.keys(prefix + '*');
        const type = prefix.split(':')[2] || 'unknown';
        stats.keysByType[type] = keys.length;
      }

      return stats;
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return {};
    }
  }

  /**
   * Health check for cache service
   */
  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; details?: any }> {
    try {
      const ping = await this.redis.ping();
      if (ping === 'PONG') {
        const info = await this.redis.info('server');
        return {
          status: 'healthy',
          details: {
            connected: true,
            redis_version: this.parseRedisInfo(info).redis_version,
          },
        };
      } else {
        return { status: 'unhealthy', details: { error: 'Ping failed' } };
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  }

  /**
   * Clean expired keys and optimize cache
   */
  async optimizeCache(): Promise<void> {
    try {
      // Redis handles expiration automatically, but we can do some cleanup
      const allKeys = await this.redis.keys('heurekka:*');
      console.log(`Cache optimization: ${allKeys.length} keys found`);
      
      // Could implement logic to remove least recently used items if needed
    } catch (error) {
      console.error('Error optimizing cache:', error);
    }
  }

  /**
   * Disconnect from Redis
   */
  async disconnect(): Promise<void> {
    try {
      await this.redis.quit();
      console.log('Redis connection closed');
    } catch (error) {
      console.error('Error disconnecting from Redis:', error);
    }
  }

  // Private utility methods

  private hashFilters(filters: any): string {
    // Create deterministic hash for filter combination
    const sorted = this.sortObject(filters);
    const str = JSON.stringify(sorted);
    return this.simpleHash(str);
  }

  private hashBounds(bounds: MapBounds): string {
    // Round coordinates to reduce cache key variations
    const rounded = {
      north: Math.round(bounds.north * 1000) / 1000,
      south: Math.round(bounds.south * 1000) / 1000,
      east: Math.round(bounds.east * 1000) / 1000,
      west: Math.round(bounds.west * 1000) / 1000,
    };
    return this.simpleHash(JSON.stringify(rounded));
  }

  private hashClusterParams(bounds: MapBounds, zoom: number, filters: any): string {
    const params = {
      bounds: this.hashBounds(bounds),
      zoom: Math.floor(zoom), // Round zoom to integer
      filters: this.hashFilters(filters),
    };
    return this.simpleHash(JSON.stringify(params));
  }

  private hashFacetParams(bounds: MapBounds | undefined, filters: any): string {
    const params = {
      bounds: bounds ? this.hashBounds(bounds) : null,
      filters: this.hashFilters(filters),
    };
    return this.simpleHash(JSON.stringify(params));
  }

  private sortObject(obj: any): any {
    if (obj === null || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(this.sortObject.bind(this)).sort();
    
    return Object.keys(obj)
      .sort()
      .reduce((sorted: any, key) => {
        sorted[key] = this.sortObject(obj[key]);
        return sorted;
      }, {});
  }

  private simpleHash(str: string): string {
    // Simple hash function for cache keys
    let hash = 0;
    if (str.length === 0) return hash.toString();
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(36);
  }

  private parseRedisInfo(info: string): any {
    const result: any = {};
    const lines = info.split('\r\n');
    
    for (const line of lines) {
      if (line.includes(':')) {
        const [key, value] = line.split(':');
        result[key] = isNaN(Number(value)) ? value : Number(value);
      }
    }
    
    return result;
  }

  /**
   * Validate cache key for security - prevent injection and ensure proper format
   */
  private isValidCacheKey(key: string): boolean {
    // Key must start with our namespace
    if (!key.startsWith('heurekka:')) {
      return false;
    }
    
    // Key must be reasonable length (max 250 chars)
    if (key.length > 250) {
      return false;
    }
    
    // Key must only contain safe characters
    const validKeyPattern = /^[a-zA-Z0-9:_\-\.]+$/;
    if (!validKeyPattern.test(key)) {
      return false;
    }
    
    // Key must be one of our defined prefixes
    const validPrefixes = Object.values(this.CACHE_KEYS);
    return validPrefixes.some(prefix => key.startsWith(prefix));
  }

  /**
   * Create secure user-specific cache key
   */
  private createUserCacheKey(baseKey: string, userId?: string, isAuthenticated: boolean = false): string {
    const userType = isAuthenticated ? 'auth' : 'anon';
    const userIdentifier = userId ? this.hashUserId(userId) : 'anonymous';
    return `${baseKey}${userType}:${userIdentifier}:`;
  }

  /**
   * Hash user ID for privacy in cache keys
   */
  private hashUserId(userId: string): string {
    // Create a non-reversible hash of user ID for cache keys
    return this.simpleHash(userId + process.env.CACHE_SALT || 'heurekka_default_salt');
  }
}

// Singleton instance
let cacheServiceInstance: CacheService | null = null;

export const getCacheService = (): CacheService => {
  if (!cacheServiceInstance) {
    cacheServiceInstance = new CacheService();
  }
  return cacheServiceInstance;
};

// For backward compatibility
export { getCacheService as cacheService };