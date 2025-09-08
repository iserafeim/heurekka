import { vi } from 'vitest';
import type { Property, HomepageData, Suggestion, AnalyticsEvent, Location } from '@/types/homepage';
import { mockProperties, mockHomepageData, mockSuggestions, mockSearchResults } from '../fixtures/propertyFixtures';

// Mock Supabase Service
export const createMockSupabaseService = () => ({
  getFeaturedProperties: vi.fn().mockResolvedValue(mockProperties.slice(0, 6)),
  getHomepageData: vi.fn().mockResolvedValue(mockHomepageData),
  trackAnalyticsEvent: vi.fn().mockResolvedValue({ success: true }),
  saveProperty: vi.fn().mockResolvedValue({ success: true }),
  healthCheck: vi.fn().mockResolvedValue({ status: 'healthy', timestamp: new Date().toISOString() })
});

// Mock Cache Service
export const createMockCacheService = () => ({
  getFeaturedProperties: vi.fn().mockResolvedValue(null),
  setFeaturedProperties: vi.fn().mockResolvedValue(true),
  getHomepageData: vi.fn().mockResolvedValue(null),
  setHomepageData: vi.fn().mockResolvedValue(true),
  getPopularSearches: vi.fn().mockResolvedValue(null),
  setPopularSearches: vi.fn().mockResolvedValue(true),
  isRateLimited: vi.fn().mockResolvedValue(false),
  setUserSession: vi.fn().mockResolvedValue(true),
  getUserSession: vi.fn().mockResolvedValue(null),
  incrementPropertyView: vi.fn().mockResolvedValue(1),
  generateLocationHash: vi.fn().mockImplementation((location: Location) => 
    `${location.lat.toFixed(4)}_${location.lng.toFixed(4)}`
  ),
  healthCheck: vi.fn().mockResolvedValue({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    redis: { connected: true, latency: 1 }
  })
});

// Mock Search Engine
export const createMockSearchEngine = () => ({
  searchProperties: vi.fn().mockResolvedValue(mockSearchResults),
  getSuggestions: vi.fn().mockResolvedValue(mockSuggestions),
  indexProperty: vi.fn().mockResolvedValue({ success: true }),
  removeProperty: vi.fn().mockResolvedValue({ success: true }),
  healthCheck: vi.fn().mockResolvedValue({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    elasticsearch: { cluster_name: 'test', status: 'green' }
  })
});

// Mock Redis Client
export const createMockRedisClient = () => ({
  get: vi.fn().mockResolvedValue(null),
  set: vi.fn().mockResolvedValue('OK'),
  setex: vi.fn().mockResolvedValue('OK'),
  del: vi.fn().mockResolvedValue(1),
  exists: vi.fn().mockResolvedValue(0),
  incr: vi.fn().mockResolvedValue(1),
  expire: vi.fn().mockResolvedValue(1),
  ttl: vi.fn().mockResolvedValue(300),
  ping: vi.fn().mockResolvedValue('PONG'),
  disconnect: vi.fn().mockResolvedValue(undefined),
  connect: vi.fn().mockResolvedValue(undefined),
  isReady: true,
  status: 'ready'
});

// Mock Elasticsearch Client
export const createMockElasticsearchClient = () => ({
  search: vi.fn().mockResolvedValue({
    hits: {
      total: { value: mockSearchResults.total },
      hits: mockSearchResults.properties.map(prop => ({
        _source: prop,
        _score: 1.0
      }))
    },
    aggregations: {
      neighborhoods: {
        buckets: mockSearchResults.facets.neighborhoods.map(n => ({
          key: n.name,
          doc_count: n.count
        }))
      }
    }
  }),
  index: vi.fn().mockResolvedValue({ _id: 'test-id', result: 'created' }),
  delete: vi.fn().mockResolvedValue({ _id: 'test-id', result: 'deleted' }),
  cluster: {
    health: vi.fn().mockResolvedValue({
      cluster_name: 'test',
      status: 'green',
      timed_out: false
    })
  },
  ping: vi.fn().mockResolvedValue(true)
});

// Helper to create mock implementations with error scenarios
export const createErrorMockService = (methodName: string, errorMessage: string) => {
  const errorFn = vi.fn().mockRejectedValue(new Error(errorMessage));
  return {
    [methodName]: errorFn
  };
};

// Helper to create rate-limited cache service
export const createRateLimitedCacheService = () => ({
  ...createMockCacheService(),
  isRateLimited: vi.fn().mockResolvedValue(true)
});

// Helper to create cache service with cached data
export const createCachedDataService = () => ({
  ...createMockCacheService(),
  getFeaturedProperties: vi.fn().mockResolvedValue(mockProperties.slice(0, 6)),
  getHomepageData: vi.fn().mockResolvedValue(mockHomepageData),
  getPopularSearches: vi.fn().mockResolvedValue([
    'apartment tegucigalpa',
    'house colonia palmira',
    'furnished apartment'
  ])
});