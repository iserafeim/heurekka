import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SearchEngine } from '@/services/searchEngine';
import { createMockCacheService, createMockSupabaseService } from '../mocks/serviceMocks';
import { mockSuggestions, mockSearchResults, mockLocation, mockTegucigalpaLocation } from '../fixtures/propertyFixtures';

// Mock the services
vi.mock('@/services/cache', () => ({
  cacheService: createMockCacheService()
}));

vi.mock('@/services/supabase', () => ({
  supabaseService: createMockSupabaseService()
}));

describe('SearchEngine', () => {
  let searchEngine: any;
  let mockCacheService: any;
  let mockSupabaseService: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Import services after mocking
    const { cacheService } = await import('@/services/cache');
    const { supabaseService } = await import('@/services/supabase');
    
    mockCacheService = cacheService;
    mockSupabaseService = supabaseService;
    
    // Create new search engine instance
    searchEngine = new SearchEngine();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('initialize', () => {
    it('should initialize successfully', async () => {
      mockCacheService.getPopularSearches.mockResolvedValue(['apartment', 'house']);

      await searchEngine.initialize();

      expect(console.log).toHaveBeenCalledWith('✅ Search engine initialized successfully');
    });

    it('should handle initialization errors gracefully', async () => {
      mockCacheService.getPopularSearches.mockRejectedValue(new Error('Cache error'));

      await searchEngine.initialize();

      expect(console.error).toHaveBeenCalledWith('❌ Failed to initialize search engine:', expect.any(Error));
    });
  });

  describe('getSuggestions', () => {
    describe('with short query', () => {
      it('should return default suggestions for query less than 2 characters', async () => {
        const result = await searchEngine.getSuggestions('a', mockLocation, 5);

        expect(result).toHaveLength(5);
        expect(result[0]).toMatchObject({
          text: 'Apartments in Tegucigalpa',
          type: 'property'
        });
      });

      it('should return default suggestions for empty query', async () => {
        const result = await searchEngine.getSuggestions('', mockLocation, 3);

        expect(result).toHaveLength(3);
        expect(result).toEqual(expect.arrayContaining([
          expect.objectContaining({ type: 'property' })
        ]));
      });
    });

    describe('with cached results', () => {
      it('should return cached suggestions when available', async () => {
        mockCacheService.getSuggestions.mockResolvedValue(mockSuggestions);

        const result = await searchEngine.getSuggestions('apartment', mockLocation, 5);

        expect(result).toEqual(mockSuggestions.slice(0, 5));
        expect(mockCacheService.getSuggestions).toHaveBeenCalledWith(
          'apartment',
          expect.any(String)
        );
      });

      it('should slice cached results to requested limit', async () => {
        const longSuggestionsList = [...mockSuggestions, ...mockSuggestions];
        mockCacheService.getSuggestions.mockResolvedValue(longSuggestionsList);

        const result = await searchEngine.getSuggestions('apartment', mockLocation, 3);

        expect(result).toHaveLength(3);
      });
    });

    describe('without cached results', () => {
      beforeEach(() => {
        mockCacheService.getSuggestions.mockResolvedValue(null);
        mockSupabaseService.getSearchSuggestions.mockResolvedValue(mockSuggestions);
      });

      it('should fetch and combine suggestions from multiple sources', async () => {
        const result = await searchEngine.getSuggestions('apartment', mockLocation, 8);

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
        expect(mockSupabaseService.getSearchSuggestions).toHaveBeenCalled();
        expect(mockCacheService.setSuggestions).toHaveBeenCalled();
      });

      it('should handle property type matches', async () => {
        const result = await searchEngine.getSuggestions('apartment', undefined, 5);

        const apartmentSuggestion = result.find(s => s.text.includes('Apartment'));
        expect(apartmentSuggestion).toBeDefined();
      });

      it('should handle feature matches', async () => {
        const result = await searchEngine.getSuggestions('parking', undefined, 5);

        const parkingSuggestion = result.find(s => s.text.toLowerCase().includes('parking'));
        expect(parkingSuggestion).toBeDefined();
      });

      it('should deduplicate suggestions', async () => {
        // Mock multiple sources returning similar suggestions
        mockSupabaseService.getSearchSuggestions.mockResolvedValue([
          { id: '1', text: 'apartment', type: 'property', icon: 'home' },
          { id: '2', text: 'Apartment', type: 'property', icon: 'home' }
        ]);

        const result = await searchEngine.getSuggestions('apartment', undefined, 10);

        const apartmentSuggestions = result.filter(s => 
          s.text.toLowerCase().includes('apartment')
        );
        
        // Should have unique suggestions even if similar text
        const uniqueTexts = new Set(apartmentSuggestions.map(s => s.text.toLowerCase()));
        expect(apartmentSuggestions.length).toBeGreaterThanOrEqual(uniqueTexts.size);
      });

      it('should cache the results after fetching', async () => {
        await searchEngine.getSuggestions('apartment', mockLocation, 5);

        expect(mockCacheService.setSuggestions).toHaveBeenCalledWith(
          'apartment',
          expect.any(Array),
          expect.any(String)
        );
      });
    });

    describe('error handling', () => {
      it('should return fallback suggestions on error', async () => {
        mockCacheService.getSuggestions.mockResolvedValue(null);
        mockSupabaseService.getSearchSuggestions.mockRejectedValue(new Error('Service error'));

        const result = await searchEngine.getSuggestions('apartment', mockLocation, 5);

        expect(result).toBeDefined();
        expect(result.length).toBeGreaterThan(0);
        expect(result[0].text).toContain('apartment');
        expect(console.error).toHaveBeenCalledWith('Error getting suggestions:', expect.any(Error));
      });
    });
  });

  describe('searchProperties', () => {
    const searchParams = {
      query: 'apartment',
      location: mockTegucigalpaLocation,
      filters: { priceMin: 1000, priceMax: 5000 },
      page: 1,
      limit: 20,
      sortBy: 'relevance'
    };

    describe('with cached results', () => {
      it('should return cached search results when available', async () => {
        mockCacheService.getSearchResults.mockResolvedValue(mockSearchResults);

        const result = await searchEngine.searchProperties(searchParams);

        expect(result).toEqual(mockSearchResults);
        expect(mockCacheService.getSearchResults).toHaveBeenCalled();
        expect(mockSupabaseService.searchProperties).not.toHaveBeenCalled();
      });
    });

    describe('without cached results', () => {
      beforeEach(() => {
        mockCacheService.getSearchResults.mockResolvedValue(null);
        mockSupabaseService.searchProperties.mockResolvedValue(mockSearchResults);
      });

      it('should perform search and return results', async () => {
        const result = await searchEngine.searchProperties(searchParams);

        expect(result).toEqual(mockSearchResults);
        expect(mockSupabaseService.searchProperties).toHaveBeenCalledWith(searchParams);
      });

      it('should track search analytics when query is provided', async () => {
        await searchEngine.searchProperties(searchParams);

        expect(mockCacheService.incrementSearchCount).toHaveBeenCalledWith('apartment');
        expect(mockSupabaseService.trackAnalyticsEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'property_search',
            properties: expect.objectContaining({
              query: 'apartment',
              hasLocation: true
            })
          })
        );
      });

      it('should not track analytics when no query provided', async () => {
        const paramsWithoutQuery = { ...searchParams };
        delete paramsWithoutQuery.query;

        await searchEngine.searchProperties(paramsWithoutQuery);

        expect(mockCacheService.incrementSearchCount).not.toHaveBeenCalled();
      });

      it('should cache results when properties are found', async () => {
        await searchEngine.searchProperties(searchParams);

        expect(mockCacheService.setSearchResults).toHaveBeenCalledWith(
          expect.any(String),
          mockSearchResults
        );
      });

      it('should not cache results when no properties found', async () => {
        const emptyResults = { ...mockSearchResults, properties: [] };
        mockSupabaseService.searchProperties.mockResolvedValue(emptyResults);

        await searchEngine.searchProperties(searchParams);

        expect(mockCacheService.setSearchResults).not.toHaveBeenCalled();
      });
    });

    describe('error handling', () => {
      it('should throw error when search service fails', async () => {
        mockCacheService.getSearchResults.mockResolvedValue(null);
        mockSupabaseService.searchProperties.mockRejectedValue(new Error('Database error'));

        await expect(searchEngine.searchProperties(searchParams)).rejects.toThrow(
          'Search service temporarily unavailable'
        );

        expect(console.error).toHaveBeenCalledWith('Error searching properties:', expect.any(Error));
      });
    });
  });

  describe('suggestion ranking and filtering', () => {
    it('should rank suggestions with exact matches higher', () => {
      const suggestions = [
        { id: '1', text: 'apartment rental', type: 'property', icon: 'home', metadata: { weight: 0.5 } },
        { id: '2', text: 'apartment', type: 'property', icon: 'home', metadata: { weight: 0.5 } }
      ];

      const ranked = searchEngine.rankSuggestions(suggestions, 'apartment');

      expect(ranked[0].text).toBe('apartment'); // Exact match should be first
      expect(ranked[0].score).toBeGreaterThan(ranked[1].score);
    });

    it('should boost suggestions that start with query', () => {
      const suggestions = [
        { id: '1', text: 'modern apartment', type: 'property', icon: 'home', metadata: { weight: 0.5 } },
        { id: '2', text: 'apartment modern', type: 'property', icon: 'home', metadata: { weight: 0.5 } }
      ];

      const ranked = searchEngine.rankSuggestions(suggestions, 'apartment');

      expect(ranked[0].text).toBe('apartment modern'); // Starts-with match should be first
    });

    it('should boost location suggestions when user location is provided', () => {
      const suggestions = [
        { id: '1', text: 'apartment', type: 'property', icon: 'home', metadata: { weight: 0.5 } },
        { id: '2', text: 'tegucigalpa', type: 'location', icon: 'map', metadata: { weight: 0.5 } }
      ];

      const ranked = searchEngine.rankSuggestions(suggestions, 'teg', mockLocation);

      const locationSuggestion = ranked.find(s => s.type === 'location');
      const propertySuggestion = ranked.find(s => s.type === 'property');

      expect(locationSuggestion?.score).toBeGreaterThan(propertySuggestion?.score || 0);
    });

    it('should boost suggestions with higher popularity scores', () => {
      const suggestions = [
        { id: '1', text: 'apartment', type: 'property', icon: 'home', metadata: { weight: 0.5, popularityScore: 50 } },
        { id: '2', text: 'apartment rental', type: 'property', icon: 'home', metadata: { weight: 0.5, popularityScore: 100 } }
      ];

      const ranked = searchEngine.rankSuggestions(suggestions, 'apartment');

      expect(ranked[0].metadata?.popularityScore).toBe(100);
    });
  });

  describe('popular searches management', () => {
    it('should update popular searches when cache is empty', async () => {
      mockCacheService.getPopularSearches.mockResolvedValue(null);

      await searchEngine.updatePopularSearches();

      expect(mockCacheService.setPopularSearches).toHaveBeenCalledWith(
        expect.arrayContaining([
          'apartment tegucigalpa',
          'house colonia palmira'
        ])
      );
    });

    it('should use cached popular searches when available', async () => {
      const cachedSearches = ['apartment', 'house', 'room'];
      mockCacheService.getPopularSearches.mockResolvedValue(cachedSearches);

      await searchEngine.updatePopularSearches();

      expect(searchEngine.popularSearches).toEqual(cachedSearches);
    });

    it('should handle errors gracefully when updating popular searches', async () => {
      mockCacheService.getPopularSearches.mockRejectedValue(new Error('Cache error'));

      await searchEngine.updatePopularSearches();

      expect(console.error).toHaveBeenCalledWith('Error updating popular searches:', expect.any(Error));
    });
  });

  describe('analytics tracking', () => {
    it('should track search analytics with location', async () => {
      await searchEngine.trackSearch('apartment', mockLocation);

      expect(mockCacheService.incrementSearchCount).toHaveBeenCalledWith('apartment');
      expect(mockSupabaseService.trackAnalyticsEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'property_search',
          properties: {
            query: 'apartment',
            hasLocation: true,
            location: `${mockLocation.lat},${mockLocation.lng}`
          }
        })
      );
    });

    it('should track search analytics without location', async () => {
      await searchEngine.trackSearch('apartment');

      expect(mockSupabaseService.trackAnalyticsEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          properties: {
            query: 'apartment',
            hasLocation: false,
            location: null
          }
        })
      );
    });

    it('should handle tracking errors gracefully', async () => {
      mockCacheService.incrementSearchCount.mockRejectedValue(new Error('Cache error'));

      await searchEngine.trackSearch('apartment');

      expect(console.error).toHaveBeenCalledWith('Error tracking search:', expect.any(Error));
    });

    it('should handle analytics event errors gracefully', async () => {
      mockSupabaseService.trackAnalyticsEvent.mockRejectedValue(new Error('Analytics error'));

      await searchEngine.trackSearch('apartment');

      // Should not throw, error is caught internally
      expect(console.error).toHaveBeenCalledWith('Error tracking search event:', expect.any(Error));
    });
  });

  describe('health check', () => {
    it('should return healthy status when cache is healthy', async () => {
      mockCacheService.healthCheck.mockResolvedValue({ status: 'healthy', latency: 5 });

      const result = await searchEngine.healthCheck();

      expect(result.status).toBe('healthy');
      expect(result.details).toMatchObject({
        cache: { status: 'healthy', latency: 5 },
        popularSearches: expect.any(Number),
        lastUpdate: expect.any(String)
      });
    });

    it('should return degraded status when cache is unhealthy', async () => {
      mockCacheService.healthCheck.mockResolvedValue({ status: 'unhealthy' });

      const result = await searchEngine.healthCheck();

      expect(result.status).toBe('degraded');
      expect(result.details.cache.status).toBe('unhealthy');
    });

    it('should return unhealthy status on error', async () => {
      mockCacheService.healthCheck.mockRejectedValue(new Error('Health check failed'));

      const result = await searchEngine.healthCheck();

      expect(result.status).toBe('unhealthy');
      expect(result.details.error).toBe('Health check failed');
    });
  });

  describe('fallback and default suggestions', () => {
    it('should provide default suggestions', () => {
      const suggestions = searchEngine.getDefaultSuggestions(undefined, 3);

      expect(suggestions).toHaveLength(3);
      expect(suggestions[0]).toMatchObject({
        text: 'Apartments in Tegucigalpa',
        type: 'property'
      });
    });

    it('should provide fallback suggestions with original query', () => {
      const suggestions = searchEngine.getFallbackSuggestions('test query', undefined, 2);

      expect(suggestions[0]).toMatchObject({
        text: 'Search "test query"',
        type: 'property',
        icon: 'search'
      });
      expect(suggestions).toHaveLength(2);
    });
  });

  describe('configuration and limits', () => {
    it('should respect maxSuggestions configuration', async () => {
      mockCacheService.getSuggestions.mockResolvedValue(null);
      
      // Test with different limits
      const result1 = await searchEngine.getSuggestions('apartment', undefined, 3);
      const result2 = await searchEngine.getSuggestions('apartment', undefined, 8);

      expect(result1.length).toBeLessThanOrEqual(3);
      expect(result2.length).toBeLessThanOrEqual(8);
    });

    it('should use default limit when not specified', async () => {
      mockCacheService.getSuggestions.mockResolvedValue(null);
      
      const result = await searchEngine.getSuggestions('apartment');

      expect(result.length).toBeLessThanOrEqual(8); // Default maxSuggestions
    });
  });
});