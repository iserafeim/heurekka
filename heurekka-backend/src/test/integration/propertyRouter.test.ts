import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { propertyRouter } from '../../routers/property';
import { PropertyService } from '../../services/property.service';
import { CacheService } from '../../services/cache.service';
import type { Context } from '../../server';

// Mock the services
vi.mock('../../services/property.service');
vi.mock('../../services/cache.service');
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

describe('Property Router Integration Tests', () => {
  let mockContext: Context;
  let mockPropertyService: any;
  let mockCacheService: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mock context
    mockContext = {
      req: {
        ip: '192.168.1.1',
        get: vi.fn((header: string) => {
          if (header === 'user-agent') return 'Mozilla/5.0 Test';
          if (header === 'referer') return 'https://test.heurekka.com';
          return undefined;
        })
      },
      res: {},
    } as any;

    // Setup mock services
    mockPropertyService = {
      searchProperties: vi.fn(),
      getPropertyById: vi.fn(),
      getPropertiesInBounds: vi.fn(),
      clusterProperties: vi.fn(),
      searchPropertiesNearby: vi.fn(),
      getAutocompleteSuggestions: vi.fn(),
      getSimilarProperties: vi.fn(),
      toggleFavorite: vi.fn(),
      trackPropertyView: vi.fn(),
      trackPropertyContact: vi.fn(),
      getSearchFacets: vi.fn(),
    };

    mockCacheService = {
      get: vi.fn(),
      set: vi.fn(),
    };

    vi.mocked(PropertyService).mockImplementation(() => mockPropertyService);
    vi.mocked(CacheService).mockImplementation(() => mockCacheService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('search endpoint', () => {
    const validSearchInput = {
      location: 'Tegucigalpa',
      priceMin: 5000,
      priceMax: 20000,
      bedrooms: [2, 3],
      propertyTypes: ['apartment' as const],
      amenities: ['parking', 'gym'],
      sortBy: 'precio_asc' as const,
      limit: 24,
    };

    const mockSearchResults = {
      properties: [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          title: 'Apartamento en Lomas del Guijarro',
          price: { amount: 15000, currency: 'HNL', period: 'month' },
          bedrooms: 2,
          bathrooms: 2,
          coordinates: { lat: 14.0723, lng: -87.2072 }
        }
      ],
      total: 1,
      facets: {
        neighborhoods: [],
        priceRanges: [],
        propertyTypes: [],
        amenities: []
      },
      nextCursor: null
    };

    it('should search properties with valid filters', async () => {
      mockCacheService.get.mockResolvedValue(null); // Cache miss
      mockPropertyService.searchProperties.mockResolvedValue(mockSearchResults);

      const caller = propertyRouter.createCaller(mockContext);
      const result = await caller.search(validSearchInput);

      expect(result).toEqual(mockSearchResults);
      expect(mockPropertyService.searchProperties).toHaveBeenCalledWith(validSearchInput);
      expect(mockCacheService.set).toHaveBeenCalled();
    });

    it('should return cached results when available', async () => {
      const cachedResults = JSON.stringify(mockSearchResults);
      mockCacheService.get.mockResolvedValue(cachedResults);

      const caller = propertyRouter.createCaller(mockContext);
      const result = await caller.search(validSearchInput);

      expect(result).toEqual(mockSearchResults);
      expect(mockPropertyService.searchProperties).not.toHaveBeenCalled();
    });

    it('should validate input parameters', async () => {
      const invalidInput = {
        priceMin: -100, // Invalid: negative price
        priceMax: 2000000, // Invalid: exceeds max
        bedrooms: ['invalid'] as any, // Invalid: not numbers
        limit: 100, // Invalid: exceeds max
      };

      const caller = propertyRouter.createCaller(mockContext);

      await expect(caller.search(invalidInput)).rejects.toThrow();
    });

    it('should handle search service errors', async () => {
      mockCacheService.get.mockResolvedValue(null);
      mockPropertyService.searchProperties.mockRejectedValue(new Error('Database error'));

      const caller = propertyRouter.createCaller(mockContext);

      await expect(caller.search(validSearchInput)).rejects.toThrow('Failed to search properties');
    });

    it('should apply default values for optional parameters', async () => {
      const minimalInput = {};
      mockCacheService.get.mockResolvedValue(null);
      mockPropertyService.searchProperties.mockResolvedValue(mockSearchResults);

      const caller = propertyRouter.createCaller(mockContext);
      await caller.search(minimalInput);

      expect(mockPropertyService.searchProperties).toHaveBeenCalledWith(
        expect.objectContaining({
          priceMin: 0,
          priceMax: 100000,
          bedrooms: [],
          propertyTypes: [],
          amenities: [],
          sortBy: 'relevancia',
          limit: 24
        })
      );
    });

    it('should handle coordinates and radius search', async () => {
      const searchWithCoordinates = {
        ...validSearchInput,
        coordinates: { lat: 14.0723, lng: -87.2072 },
        radiusKm: 10
      };

      mockCacheService.get.mockResolvedValue(null);
      mockPropertyService.searchProperties.mockResolvedValue(mockSearchResults);

      const caller = propertyRouter.createCaller(mockContext);
      await caller.search(searchWithCoordinates);

      expect(mockPropertyService.searchProperties).toHaveBeenCalledWith(searchWithCoordinates);
    });
  });

  describe('getById endpoint', () => {
    const validPropertyId = '123e4567-e89b-12d3-a456-426614174000';
    const mockProperty = {
      id: validPropertyId,
      title: 'Test Property',
      description: 'Test Description',
      type: 'apartment',
      address: 'Test Address',
      price: { amount: 15000, currency: 'HNL', period: 'month' },
      bedrooms: 2,
      bathrooms: 2,
      coordinates: { lat: 14.0723, lng: -87.2072 }
    };

    it('should get property by valid ID', async () => {
      mockPropertyService.getPropertyById.mockResolvedValue(mockProperty);

      const caller = propertyRouter.createCaller(mockContext);
      const result = await caller.getById({ id: validPropertyId });

      expect(result).toEqual(mockProperty);
      expect(mockPropertyService.getPropertyById).toHaveBeenCalledWith(validPropertyId);
    });

    it('should throw NOT_FOUND for non-existent property', async () => {
      mockPropertyService.getPropertyById.mockResolvedValue(null);

      const caller = propertyRouter.createCaller(mockContext);

      await expect(caller.getById({ id: validPropertyId })).rejects.toMatchObject({
        code: 'NOT_FOUND',
        message: 'Propiedad no encontrada'
      });
    });

    it('should validate property ID format', async () => {
      const invalidId = 'invalid-uuid-format';

      const caller = propertyRouter.createCaller(mockContext);

      await expect(caller.getById({ id: invalidId })).rejects.toThrow();
    });

    it('should handle service errors', async () => {
      mockPropertyService.getPropertyById.mockRejectedValue(new Error('Database error'));

      const caller = propertyRouter.createCaller(mockContext);

      await expect(caller.getById({ id: validPropertyId })).rejects.toThrow('Error al obtener la propiedad');
    });
  });

  describe('getByBounds endpoint', () => {
    const validBounds = {
      north: 14.1723,
      south: 13.9723,
      east: -87.1072,
      west: -87.3072
    };

    const mockBoundsProperties = [
      {
        id: '123',
        title: 'Property in bounds',
        coordinates: { lat: 14.0723, lng: -87.2072 },
        price: { amount: 12000, currency: 'HNL', period: 'month' }
      }
    ];

    it('should get properties within valid bounds', async () => {
      mockCacheService.get.mockResolvedValue(null);
      mockPropertyService.getPropertiesInBounds.mockResolvedValue(mockBoundsProperties);

      const caller = propertyRouter.createCaller(mockContext);
      const result = await caller.getByBounds({ bounds: validBounds });

      expect(result).toEqual({
        properties: mockBoundsProperties,
        total: 1,
        bounds: validBounds
      });

      expect(mockPropertyService.getPropertiesInBounds).toHaveBeenCalledWith(
        validBounds,
        {},
        100
      );
    });

    it('should apply filters when provided', async () => {
      const input = {
        bounds: validBounds,
        filters: {
          priceMin: 10000,
          priceMax: 20000,
          bedrooms: [2, 3],
          propertyTypes: ['apartment' as const]
        },
        limit: 50
      };

      mockCacheService.get.mockResolvedValue(null);
      mockPropertyService.getPropertiesInBounds.mockResolvedValue(mockBoundsProperties);

      const caller = propertyRouter.createCaller(mockContext);
      await caller.getByBounds(input);

      expect(mockPropertyService.getPropertiesInBounds).toHaveBeenCalledWith(
        validBounds,
        input.filters,
        50
      );
    });

    it('should validate bounds coordinates', async () => {
      const invalidBounds = {
        north: 91, // Invalid: > 90
        south: -91, // Invalid: < -90
        east: 181, // Invalid: > 180
        west: -181 // Invalid: < -180
      };

      const caller = propertyRouter.createCaller(mockContext);

      await expect(caller.getByBounds({ bounds: invalidBounds })).rejects.toThrow();
    });

    it('should return cached results when available', async () => {
      const cachedResult = {
        properties: mockBoundsProperties,
        total: 1,
        bounds: validBounds
      };
      mockCacheService.get.mockResolvedValue(JSON.stringify(cachedResult));

      const caller = propertyRouter.createCaller(mockContext);
      const result = await caller.getByBounds({ bounds: validBounds });

      expect(result).toEqual(cachedResult);
      expect(mockPropertyService.getPropertiesInBounds).not.toHaveBeenCalled();
    });
  });

  describe('getClusters endpoint', () => {
    const validClusterInput = {
      bounds: {
        north: 14.1723,
        south: 13.9723,
        east: -87.1072,
        west: -87.3072
      },
      zoom: 12,
      filters: {
        priceMax: 20000,
        propertyTypes: ['apartment' as const]
      }
    };

    const mockClusters = [
      {
        id: 1,
        coordinates: { lat: 14.0723, lng: -87.2072 },
        count: 5,
        avgPrice: 15000,
        minPrice: 12000,
        maxPrice: 18000,
        propertyIds: ['prop1', 'prop2', 'prop3']
      }
    ];

    it('should get property clusters', async () => {
      mockCacheService.get.mockResolvedValue(null);
      mockPropertyService.clusterProperties.mockResolvedValue(mockClusters);

      const caller = propertyRouter.createCaller(mockContext);
      const result = await caller.getClusters(validClusterInput);

      expect(result).toEqual(mockClusters);
      expect(mockPropertyService.clusterProperties).toHaveBeenCalledWith(
        validClusterInput.bounds,
        validClusterInput.zoom,
        validClusterInput.filters
      );
    });

    it('should validate zoom level', async () => {
      const invalidInput = {
        ...validClusterInput,
        zoom: 25 // Invalid: > 20
      };

      const caller = propertyRouter.createCaller(mockContext);

      await expect(caller.getClusters(invalidInput)).rejects.toThrow();
    });

    it('should handle clustering without filters', async () => {
      const inputWithoutFilters = {
        bounds: validClusterInput.bounds,
        zoom: 12
      };

      mockCacheService.get.mockResolvedValue(null);
      mockPropertyService.clusterProperties.mockResolvedValue(mockClusters);

      const caller = propertyRouter.createCaller(mockContext);
      await caller.getClusters(inputWithoutFilters);

      expect(mockPropertyService.clusterProperties).toHaveBeenCalledWith(
        validClusterInput.bounds,
        12,
        {}
      );
    });

    it('should return cached clusters when available', async () => {
      mockCacheService.get.mockResolvedValue(JSON.stringify(mockClusters));

      const caller = propertyRouter.createCaller(mockContext);
      const result = await caller.getClusters(validClusterInput);

      expect(result).toEqual(mockClusters);
      expect(mockPropertyService.clusterProperties).not.toHaveBeenCalled();
    });
  });

  describe('searchNearby endpoint', () => {
    const validNearbyInput = {
      coordinates: { lat: 14.0723, lng: -87.2072 },
      radiusKm: 5,
      filters: {
        priceMax: 20000,
        bedrooms: [2, 3]
      }
    };

    const mockNearbyProperties = [
      {
        id: '123',
        title: 'Nearby Property',
        coordinates: { lat: 14.0723, lng: -87.2072 },
        distance: 2.5
      }
    ];

    it('should search nearby properties', async () => {
      mockPropertyService.searchPropertiesNearby.mockResolvedValue(mockNearbyProperties);

      const caller = propertyRouter.createCaller(mockContext);
      const result = await caller.searchNearby(validNearbyInput);

      expect(result).toEqual({
        properties: mockNearbyProperties,
        total: 1,
        center: validNearbyInput.coordinates,
        radiusKm: 5
      });

      expect(mockPropertyService.searchPropertiesNearby).toHaveBeenCalledWith(
        14.0723,
        -87.2072,
        5,
        validNearbyInput.filters
      );
    });

    it('should validate coordinates', async () => {
      const invalidInput = {
        coordinates: { lat: 91, lng: 181 }, // Invalid coordinates
        radiusKm: 5
      };

      const caller = propertyRouter.createCaller(mockContext);

      await expect(caller.searchNearby(invalidInput)).rejects.toThrow();
    });

    it('should validate radius range', async () => {
      const invalidInput = {
        coordinates: { lat: 14.0723, lng: -87.2072 },
        radiusKm: 100 // Invalid: > 50
      };

      const caller = propertyRouter.createCaller(mockContext);

      await expect(caller.searchNearby(invalidInput)).rejects.toThrow();
    });

    it('should use default radius when not provided', async () => {
      const inputWithoutRadius = {
        coordinates: { lat: 14.0723, lng: -87.2072 }
      };

      mockPropertyService.searchPropertiesNearby.mockResolvedValue(mockNearbyProperties);

      const caller = propertyRouter.createCaller(mockContext);
      await caller.searchNearby(inputWithoutRadius);

      expect(mockPropertyService.searchPropertiesNearby).toHaveBeenCalledWith(
        14.0723,
        -87.2072,
        5, // default radius
        {}
      );
    });
  });

  describe('autocomplete endpoint', () => {
    const validAutocompleteInput = {
      query: 'Lomas',
      limit: 10,
      location: { lat: 14.0723, lng: -87.2072 }
    };

    const mockSuggestions = [
      {
        id: 'suggestion-1',
        text: 'Lomas del Guijarro',
        type: 'location',
        icon: 'map-pin',
        subtitle: '25 propiedades'
      }
    ];

    it('should get autocomplete suggestions', async () => {
      mockCacheService.get.mockResolvedValue(null);
      mockPropertyService.getAutocompleteSuggestions.mockResolvedValue(mockSuggestions);

      const caller = propertyRouter.createCaller(mockContext);
      const result = await caller.autocomplete(validAutocompleteInput);

      expect(result).toEqual(mockSuggestions);
      expect(mockPropertyService.getAutocompleteSuggestions).toHaveBeenCalledWith(
        'Lomas',
        { lat: 14.0723, lng: -87.2072 },
        10
      );
    });

    it('should validate query length', async () => {
      const invalidInput = {
        query: 'a' // Invalid: < 2 characters
      };

      const caller = propertyRouter.createCaller(mockContext);

      await expect(caller.autocomplete(invalidInput)).rejects.toThrow();
    });

    it('should return empty array on service error', async () => {
      mockCacheService.get.mockResolvedValue(null);
      mockPropertyService.getAutocompleteSuggestions.mockRejectedValue(new Error('Service error'));

      const caller = propertyRouter.createCaller(mockContext);
      const result = await caller.autocomplete(validAutocompleteInput);

      expect(result).toEqual([]);
    });

    it('should use cached suggestions when available', async () => {
      mockCacheService.get.mockResolvedValue(JSON.stringify(mockSuggestions));

      const caller = propertyRouter.createCaller(mockContext);
      const result = await caller.autocomplete(validAutocompleteInput);

      expect(result).toEqual(mockSuggestions);
      expect(mockPropertyService.getAutocompleteSuggestions).not.toHaveBeenCalled();
    });
  });

  describe('getSimilar endpoint', () => {
    const validSimilarInput = {
      propertyId: '123e4567-e89b-12d3-a456-426614174000',
      limit: 6
    };

    const mockSimilarProperties = [
      {
        id: 'similar-1',
        title: 'Similar Property',
        type: 'apartment',
        price: { amount: 14000, currency: 'HNL', period: 'month' },
        bedrooms: 2
      }
    ];

    it('should get similar properties', async () => {
      mockPropertyService.getSimilarProperties.mockResolvedValue(mockSimilarProperties);

      const caller = propertyRouter.createCaller(mockContext);
      const result = await caller.getSimilar(validSimilarInput);

      expect(result).toEqual(mockSimilarProperties);
      expect(mockPropertyService.getSimilarProperties).toHaveBeenCalledWith(
        validSimilarInput.propertyId,
        6
      );
    });

    it('should validate property ID format', async () => {
      const invalidInput = {
        propertyId: 'invalid-uuid',
        limit: 6
      };

      const caller = propertyRouter.createCaller(mockContext);

      await expect(caller.getSimilar(invalidInput)).rejects.toThrow();
    });

    it('should validate limit range', async () => {
      const invalidInput = {
        propertyId: '123e4567-e89b-12d3-a456-426614174000',
        limit: 25 // Invalid: > 20
      };

      const caller = propertyRouter.createCaller(mockContext);

      await expect(caller.getSimilar(invalidInput)).rejects.toThrow();
    });

    it('should use default limit when not provided', async () => {
      const inputWithoutLimit = {
        propertyId: '123e4567-e89b-12d3-a456-426614174000'
      };

      mockPropertyService.getSimilarProperties.mockResolvedValue(mockSimilarProperties);

      const caller = propertyRouter.createCaller(mockContext);
      await caller.getSimilar(inputWithoutLimit);

      expect(mockPropertyService.getSimilarProperties).toHaveBeenCalledWith(
        inputWithoutLimit.propertyId,
        6 // default limit
      );
    });
  });

  describe('toggleFavorite mutation', () => {
    const validToggleFavoriteInput = {
      propertyId: '123e4567-e89b-12d3-a456-426614174000',
      userId: 'user-123'
    };

    it('should toggle favorite successfully', async () => {
      const mockResult = { isFavorite: true };
      mockPropertyService.toggleFavorite.mockResolvedValue(mockResult);

      const caller = propertyRouter.createCaller(mockContext);
      const result = await caller.toggleFavorite(validToggleFavoriteInput);

      expect(result).toEqual(mockResult);
      expect(mockPropertyService.toggleFavorite).toHaveBeenCalledWith(
        'user-123',
        validToggleFavoriteInput.propertyId
      );
    });

    it('should handle anonymous user', async () => {
      const inputWithoutUserId = {
        propertyId: '123e4567-e89b-12d3-a456-426614174000'
      };

      const mockResult = { isFavorite: false };
      mockPropertyService.toggleFavorite.mockResolvedValue(mockResult);

      const caller = propertyRouter.createCaller(mockContext);
      await caller.toggleFavorite(inputWithoutUserId);

      expect(mockPropertyService.toggleFavorite).toHaveBeenCalledWith(
        'anonymous',
        inputWithoutUserId.propertyId
      );
    });

    it('should validate property ID format', async () => {
      const invalidInput = {
        propertyId: 'invalid-uuid',
        userId: 'user-123'
      };

      const caller = propertyRouter.createCaller(mockContext);

      await expect(caller.toggleFavorite(invalidInput)).rejects.toThrow();
    });

    it('should handle service errors', async () => {
      mockPropertyService.toggleFavorite.mockRejectedValue(new Error('Database error'));

      const caller = propertyRouter.createCaller(mockContext);

      await expect(caller.toggleFavorite(validToggleFavoriteInput)).rejects.toThrow('Error al marcar como favorito');
    });
  });

  describe('trackView mutation', () => {
    const validTrackViewInput = {
      propertyId: '123e4567-e89b-12d3-a456-426614174000',
      source: 'lista' as const,
      userId: 'user-123',
      sessionId: 'session-456'
    };

    it('should track property view', async () => {
      mockPropertyService.trackPropertyView.mockResolvedValue(undefined);

      const caller = propertyRouter.createCaller(mockContext);
      const result = await caller.trackView(validTrackViewInput);

      expect(result).toEqual({ success: true });
      expect(mockPropertyService.trackPropertyView).toHaveBeenCalledWith({
        propertyId: validTrackViewInput.propertyId,
        source: 'lista',
        userId: 'user-123',
        sessionId: 'session-456',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0 Test',
        referrer: 'https://test.heurekka.com'
      });
    });

    it('should validate source enum', async () => {
      const invalidInput = {
        ...validTrackViewInput,
        source: 'invalid-source' as any
      };

      const caller = propertyRouter.createCaller(mockContext);

      await expect(caller.trackView(invalidInput)).rejects.toThrow();
    });

    it('should handle tracking errors gracefully', async () => {
      mockPropertyService.trackPropertyView.mockRejectedValue(new Error('Tracking error'));

      const caller = propertyRouter.createCaller(mockContext);
      const result = await caller.trackView(validTrackViewInput);

      expect(result).toEqual({ success: false });
    });

    it('should use default source when not provided', async () => {
      const inputWithoutSource = {
        propertyId: '123e4567-e89b-12d3-a456-426614174000'
      };

      mockPropertyService.trackPropertyView.mockResolvedValue(undefined);

      const caller = propertyRouter.createCaller(mockContext);
      await caller.trackView(inputWithoutSource);

      expect(mockPropertyService.trackPropertyView).toHaveBeenCalledWith(
        expect.objectContaining({
          source: 'lista' // default value
        })
      );
    });
  });

  describe('trackContact mutation', () => {
    const validTrackContactInput = {
      propertyId: '123e4567-e89b-12d3-a456-426614174000',
      source: 'modal' as const,
      contactMethod: 'whatsapp' as const,
      phoneNumber: '+50499887766',
      success: true
    };

    it('should track property contact', async () => {
      mockPropertyService.trackPropertyContact.mockResolvedValue(undefined);

      const caller = propertyRouter.createCaller(mockContext);
      const result = await caller.trackContact(validTrackContactInput);

      expect(result).toEqual({ success: true });
      expect(mockPropertyService.trackPropertyContact).toHaveBeenCalledWith({
        propertyId: validTrackContactInput.propertyId,
        source: 'modal',
        contactMethod: 'whatsapp',
        userId: undefined,
        sessionId: undefined,
        phoneNumber: '+50499887766',
        success: true,
        errorMessage: undefined,
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0 Test'
      });
    });

    it('should validate contact method enum', async () => {
      const invalidInput = {
        ...validTrackContactInput,
        contactMethod: 'invalid-method' as any
      };

      const caller = propertyRouter.createCaller(mockContext);

      await expect(caller.trackContact(invalidInput)).rejects.toThrow();
    });

    it('should handle failed contact attempts', async () => {
      const failedContactInput = {
        ...validTrackContactInput,
        success: false,
        errorMessage: 'WhatsApp API unavailable'
      };

      mockPropertyService.trackPropertyContact.mockResolvedValue(undefined);

      const caller = propertyRouter.createCaller(mockContext);
      const result = await caller.trackContact(failedContactInput);

      expect(result).toEqual({ success: true });
      expect(mockPropertyService.trackPropertyContact).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          errorMessage: 'WhatsApp API unavailable'
        })
      );
    });

    it('should handle tracking errors gracefully', async () => {
      mockPropertyService.trackPropertyContact.mockRejectedValue(new Error('Tracking error'));

      const caller = propertyRouter.createCaller(mockContext);
      const result = await caller.trackContact(validTrackContactInput);

      expect(result).toEqual({ success: false });
    });
  });

  describe('getSearchFacets endpoint', () => {
    const validFacetsInput = {
      bounds: {
        north: 14.1723,
        south: 13.9723,
        east: -87.1072,
        west: -87.3072
      },
      baseFilters: {
        priceMin: 10000,
        propertyTypes: ['apartment' as const]
      }
    };

    const mockFacets = {
      neighborhoods: [
        { name: 'Centro', count: 10 },
        { name: 'Lomas del Guijarro', count: 25 }
      ],
      priceRanges: [
        { range: '0-5000', count: 5 },
        { range: '5000-10000', count: 15 }
      ],
      propertyTypes: [
        { type: 'apartment', count: 30 },
        { type: 'house', count: 10 }
      ],
      amenities: [
        { name: 'parking', count: 20 },
        { name: 'gym', count: 8 }
      ]
    };

    it('should get search facets', async () => {
      mockCacheService.get.mockResolvedValue(null);
      mockPropertyService.getSearchFacets.mockResolvedValue(mockFacets);

      const caller = propertyRouter.createCaller(mockContext);
      const result = await caller.getSearchFacets(validFacetsInput);

      expect(result).toEqual(mockFacets);
      expect(mockPropertyService.getSearchFacets).toHaveBeenCalledWith(
        validFacetsInput.bounds,
        validFacetsInput.baseFilters
      );
    });

    it('should handle facets without bounds', async () => {
      const inputWithoutBounds = {
        baseFilters: { priceMax: 20000 }
      };

      mockCacheService.get.mockResolvedValue(null);
      mockPropertyService.getSearchFacets.mockResolvedValue(mockFacets);

      const caller = propertyRouter.createCaller(mockContext);
      await caller.getSearchFacets(inputWithoutBounds);

      expect(mockPropertyService.getSearchFacets).toHaveBeenCalledWith(
        undefined,
        inputWithoutBounds.baseFilters
      );
    });

    it('should return empty facets on service error', async () => {
      mockCacheService.get.mockResolvedValue(null);
      mockPropertyService.getSearchFacets.mockRejectedValue(new Error('Facets error'));

      const caller = propertyRouter.createCaller(mockContext);
      const result = await caller.getSearchFacets(validFacetsInput);

      expect(result).toEqual({
        neighborhoods: [],
        priceRanges: [],
        propertyTypes: [],
        amenities: []
      });
    });

    it('should use cached facets when available', async () => {
      mockCacheService.get.mockResolvedValue(JSON.stringify(mockFacets));

      const caller = propertyRouter.createCaller(mockContext);
      const result = await caller.getSearchFacets(validFacetsInput);

      expect(result).toEqual(mockFacets);
      expect(mockPropertyService.getSearchFacets).not.toHaveBeenCalled();
    });

    it('should handle empty input', async () => {
      const emptyInput = {};

      mockCacheService.get.mockResolvedValue(null);
      mockPropertyService.getSearchFacets.mockResolvedValue(mockFacets);

      const caller = propertyRouter.createCaller(mockContext);
      await caller.getSearchFacets(emptyInput);

      expect(mockPropertyService.getSearchFacets).toHaveBeenCalledWith(
        undefined,
        {}
      );
    });
  });
});