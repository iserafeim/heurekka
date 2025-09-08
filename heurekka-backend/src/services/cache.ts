import Redis from 'ioredis';
import type { Property, SearchResults, Suggestion, HomepageData } from '../types/homepage';

class CacheService {
  private redis: Redis;
  private readonly TTL = {
    FEATURED_PROPERTIES: 600, // 10 minutes
    SEARCH_RESULTS: 300,      // 5 minutes
    SUGGESTIONS: 1800,        // 30 minutes
    HOMEPAGE_DATA: 900,       // 15 minutes
    POPULAR_SEARCHES: 3600,   // 1 hour
  };

  constructor() {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    this.redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      keyPrefix: 'heurekka:',
    });

    this.redis.on('error', (error) => {
      console.error('Redis connection error:', error);
    });

    this.redis.on('connect', () => {
      console.log('✅ Redis connected successfully');
    });
  }

  // Featured Properties Cache
  async getFeaturedProperties(key: string): Promise<Property[] | null> {
    try {
      const cached = await this.redis.get(`featured:${key}`);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Error getting featured properties from cache:', error);
      return null;
    }
  }

  async setFeaturedProperties(key: string, properties: Property[]): Promise<void> {
    try {
      await this.redis.setex(
        `featured:${key}`,
        this.TTL.FEATURED_PROPERTIES,
        JSON.stringify(properties)
      );
    } catch (error) {
      console.error('Error caching featured properties:', error);
    }
  }

  // Search Results Cache
  async getSearchResults(searchHash: string): Promise<SearchResults | null> {
    try {
      const cached = await this.redis.get(`search:${searchHash}`);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Error getting search results from cache:', error);
      return null;
    }
  }

  async setSearchResults(searchHash: string, results: SearchResults): Promise<void> {
    try {
      await this.redis.setex(
        `search:${searchHash}`,
        this.TTL.SEARCH_RESULTS,
        JSON.stringify(results)
      );
    } catch (error) {
      console.error('Error caching search results:', error);
    }
  }

  // Search Suggestions Cache
  async getSuggestions(query: string, locationHash?: string): Promise<Suggestion[] | null> {
    try {
      const key = `suggestions:${query}${locationHash ? `:${locationHash}` : ''}`;
      const cached = await this.redis.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Error getting suggestions from cache:', error);
      return null;
    }
  }

  async setSuggestions(query: string, suggestions: Suggestion[], locationHash?: string): Promise<void> {
    try {
      const key = `suggestions:${query}${locationHash ? `:${locationHash}` : ''}`;
      await this.redis.setex(
        key,
        this.TTL.SUGGESTIONS,
        JSON.stringify(suggestions)
      );
    } catch (error) {
      console.error('Error caching suggestions:', error);
    }
  }

  // Homepage Data Cache
  async getHomepageData(): Promise<HomepageData | null> {
    try {
      const cached = await this.redis.get('homepage:data');
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Error getting homepage data from cache:', error);
      return null;
    }
  }

  async setHomepageData(data: HomepageData): Promise<void> {
    try {
      await this.redis.setex(
        'homepage:data',
        this.TTL.HOMEPAGE_DATA,
        JSON.stringify(data)
      );
    } catch (error) {
      console.error('Error caching homepage data:', error);
    }
  }

  // Popular Searches Cache
  async getPopularSearches(): Promise<string[] | null> {
    try {
      const cached = await this.redis.get('popular:searches');
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Error getting popular searches from cache:', error);
      return null;
    }
  }

  async setPopularSearches(searches: string[]): Promise<void> {
    try {
      await this.redis.setex(
        'popular:searches',
        this.TTL.POPULAR_SEARCHES,
        JSON.stringify(searches)
      );
    } catch (error) {
      console.error('Error caching popular searches:', error);
    }
  }

  // Analytics and Metrics
  async incrementSearchCount(query: string): Promise<void> {
    try {
      const key = `analytics:search_count:${query}`;
      await this.redis.incr(key);
      // Set expiry for cleanup
      await this.redis.expire(key, 86400 * 7); // 7 days
    } catch (error) {
      console.error('Error incrementing search count:', error);
    }
  }

  async getSearchCount(query: string): Promise<number> {
    try {
      const count = await this.redis.get(`analytics:search_count:${query}`);
      return count ? parseInt(count, 10) : 0;
    } catch (error) {
      console.error('Error getting search count:', error);
      return 0;
    }
  }

  // Property View Tracking
  async incrementPropertyView(propertyId: string): Promise<void> {
    try {
      const key = `analytics:property_views:${propertyId}`;
      await this.redis.incr(key);
      await this.redis.expire(key, 86400 * 30); // 30 days
    } catch (error) {
      console.error('Error incrementing property view:', error);
    }
  }

  // Rate Limiting
  async isRateLimited(identifier: string, maxRequests: number = 100, windowSeconds: number = 900): Promise<boolean> {
    try {
      const key = `rate_limit:${identifier}`;
      const current = await this.redis.incr(key);
      
      if (current === 1) {
        await this.redis.expire(key, windowSeconds);
      }
      
      return current > maxRequests;
    } catch (error) {
      console.error('Error checking rate limit:', error);
      return false; // Fail open - don't block on cache errors
    }
  }

  // Session Management
  async setUserSession(sessionId: string, data: any, ttlSeconds: number = 3600): Promise<void> {
    try {
      await this.redis.setex(
        `session:${sessionId}`,
        ttlSeconds,
        JSON.stringify(data)
      );
    } catch (error) {
      console.error('Error setting user session:', error);
    }
  }

  async getUserSession(sessionId: string): Promise<any | null> {
    try {
      const cached = await this.redis.get(`session:${sessionId}`);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Error getting user session:', error);
      return null;
    }
  }

  // Cache Invalidation - SECURITY FIX: Use scan instead of keys to prevent injection
  async invalidatePattern(pattern: string): Promise<void> {
    try {
      // Validate pattern to prevent Redis injection
      if (!/^[a-zA-Z0-9:_-]+\*?$/.test(pattern)) {
        throw new Error('Invalid cache pattern: only alphanumeric, colons, underscores, hyphens, and single asterisk allowed');
      }
      
      // Use scan instead of keys for security and performance
      const stream = this.redis.scanStream({
        match: `heurekka:${pattern}`,
        count: 100
      });
      
      const keys: string[] = [];
      
      return new Promise((resolve, reject) => {
        stream.on('data', (batchKeys: string[]) => {
          if (batchKeys.length > 0) {
            keys.push(...batchKeys);
          }
        });
        
        stream.on('end', async () => {
          try {
            if (keys.length > 0) {
              // Use unlink for async deletion (more performant than del)
              await this.redis.unlink(...keys);
            }
            resolve();
          } catch (error) {
            reject(error);
          }
        });
        
        stream.on('error', (error) => {
          reject(error);
        });
      });
    } catch (error) {
      console.error('Error invalidating cache pattern:', error);
      throw error;
    }
  }

  async invalidateFeaturedProperties(): Promise<void> {
    await this.invalidatePattern('heurekka:featured:*');
  }

  async invalidateHomepageData(): Promise<void> {
    await this.redis.del('heurekka:homepage:data');
  }

  // Health Check
  async healthCheck(): Promise<{ status: string; latency?: number }> {
    try {
      const start = Date.now();
      await this.redis.ping();
      const latency = Date.now() - start;
      
      return { status: 'healthy', latency };
    } catch (error) {
      console.error('Redis health check failed:', error);
      return { status: 'unhealthy' };
    }
  }

  // Utility Methods
  generateSearchHash(searchParams: any): string {
    // Create a consistent hash for search parameters
    const normalized = {
      query: searchParams.query || '',
      location: searchParams.location ? 
        `${Math.round(searchParams.location.lat * 1000) / 1000},${Math.round(searchParams.location.lng * 1000) / 1000}` : 
        null,
      filters: searchParams.filters || {},
      sortBy: searchParams.sortBy || 'relevance',
      page: searchParams.page || 1,
      limit: searchParams.limit || 20
    };

    return Buffer.from(JSON.stringify(normalized)).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 32);
  }

  generateLocationHash(location: { lat: number; lng: number }): string {
    return `${Math.round(location.lat * 1000) / 1000}_${Math.round(location.lng * 1000) / 1000}`;
  }

  // Cleanup
  async disconnect(): Promise<void> {
    try {
      await this.redis.quit();
    } catch (error) {
      console.error('Error disconnecting from Redis:', error);
    }
  }
}

export const cacheService = new CacheService();