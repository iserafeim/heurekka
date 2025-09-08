import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { validateTRPCResponse } from '../utils/testHelpers';
import {
  FeaturedPropertiesInputSchema,
  PropertySearchInputSchema,
  SearchSuggestionsInputSchema,
  AnalyticsEventSchema,
  SavePropertySchema,
  CreateSearchProfileSchema
} from '@/schemas/homepage';

describe('Homepage Router - Schema Integration Tests', () => {
  describe('Input validation integration', () => {
    it('should validate getFeaturedProperties input correctly', () => {
      // Valid input
      const validInput = { limit: 6, location: { lat: 14.0723, lng: -87.1921, source: 'gps' as const } };
      const result = FeaturedPropertiesInputSchema.safeParse(validInput);
      expect(result.success).toBe(true);

      // Invalid input - limit too high
      const invalidInput = { limit: 25 };
      const invalidResult = FeaturedPropertiesInputSchema.safeParse(invalidInput);
      expect(invalidResult.success).toBe(false);
    });

    it('should validate searchProperties input correctly', () => {
      // Valid input with all fields
      const validInput = {
        query: 'apartment',
        location: { lat: 14.0723, lng: -87.1921, source: 'manual' as const },
        filters: {
          priceMin: 1000,
          priceMax: 5000,
          propertyTypes: ['apartment' as const, 'house' as const],
          bedrooms: [2, 3],
          bathrooms: [1, 2],
          amenities: ['parking', 'security']
        },
        page: 1,
        limit: 20,
        sortBy: 'relevance' as const
      };

      const result = PropertySearchInputSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
        expect(result.data.sortBy).toBe('relevance');
      }

      // Invalid input - invalid sort option
      const invalidInput = { sortBy: 'invalid_sort' };
      const invalidResult = PropertySearchInputSchema.safeParse(invalidInput);
      expect(invalidResult.success).toBe(false);
    });

    it('should validate getSearchSuggestions input correctly', () => {
      // Valid input
      const validInput = {
        query: 'apartment',
        location: { lat: 14.0723, lng: -87.1921, source: 'gps' as const },
        limit: 5
      };

      const result = SearchSuggestionsInputSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(5);
      }

      // Test default limit
      const inputWithoutLimit = { query: 'apartment' };
      const defaultResult = SearchSuggestionsInputSchema.safeParse(inputWithoutLimit);
      expect(defaultResult.success).toBe(true);
      if (defaultResult.success) {
        expect(defaultResult.data.limit).toBe(5);
      }

      // Invalid input - query too long
      const invalidInput = { query: 'a'.repeat(201) };
      const invalidResult = SearchSuggestionsInputSchema.safeParse(invalidInput);
      expect(invalidResult.success).toBe(false);
    });

    it('should validate trackEvent input correctly', () => {
      // Valid analytics event
      const validEvent = {
        name: 'property_view',
        properties: {
          propertyId: 'prop-123',
          propertyType: 'apartment',
          viewSource: 'search_results',
          metadata: { count: 1, active: true }
        },
        timestamp: Date.now(),
        sessionId: 'session-123',
        userId: 'user-456'
      };

      const result = AnalyticsEventSchema.safeParse(validEvent);
      expect(result.success).toBe(true);

      // Invalid event - empty name
      const invalidEvent = { ...validEvent, name: '' };
      const invalidResult = AnalyticsEventSchema.safeParse(invalidEvent);
      expect(invalidResult.success).toBe(false);

      // Invalid event - session ID too long
      const longSessionEvent = { ...validEvent, sessionId: 'a'.repeat(101) };
      const longSessionResult = AnalyticsEventSchema.safeParse(longSessionEvent);
      expect(longSessionResult.success).toBe(false);
    });

    it('should validate saveProperty input correctly', () => {
      // Valid UUID
      const validInput = { propertyId: '123e4567-e89b-12d3-a456-426614174000' };
      const result = SavePropertySchema.safeParse(validInput);
      expect(result.success).toBe(true);

      // Invalid UUID
      const invalidInput = { propertyId: 'not-a-uuid' };
      const invalidResult = SavePropertySchema.safeParse(invalidInput);
      expect(invalidResult.success).toBe(false);
    });

    it('should validate createSearchProfile input correctly', () => {
      // Valid search profile
      const validProfile = {
        name: 'My Dream Apartment',
        query: {
          text: 'apartment in tegucigalpa',
          location: { lat: 14.0723, lng: -87.1921, source: 'manual' as const },
          filters: {
            priceMin: 1000,
            priceMax: 3000,
            propertyTypes: ['apartment' as const]
          },
          timestamp: Date.now()
        },
        notifications: {
          email: true,
          push: false,
          whatsapp: true,
          frequency: 'daily' as const
        }
      };

      const result = CreateSearchProfileSchema.safeParse(validProfile);
      expect(result.success).toBe(true);

      // Invalid profile - name too short
      const invalidProfile = { ...validProfile, name: 'A' };
      const invalidResult = CreateSearchProfileSchema.safeParse(invalidProfile);
      expect(invalidResult.success).toBe(false);
    });
  });

  describe('Response structure validation', () => {
    it('should validate typical success response structure', () => {
      const successResponse = {
        success: true,
        data: [],
        cached: false,
        timestamp: '2024-09-08T10:00:00Z'
      };

      validateTRPCResponse(successResponse);
      expect(successResponse.success).toBe(true);
      expect(successResponse.data).toBeDefined();
    });

    it('should validate error response structure', () => {
      const errorResponse = {
        success: false,
        error: 'Service temporarily unavailable',
        timestamp: '2024-09-08T10:00:00Z'
      };

      validateTRPCResponse(errorResponse);
      expect(errorResponse.success).toBe(false);
      expect(errorResponse.error).toBeDefined();
    });

    it('should validate pagination response structure', () => {
      const paginationResponse = {
        properties: [],
        total: 150,
        page: 1,
        limit: 20,
        facets: {
          neighborhoods: [],
          priceRanges: [],
          propertyTypes: []
        }
      };

      expect(paginationResponse).toHaveProperty('properties');
      expect(paginationResponse).toHaveProperty('total');
      expect(paginationResponse).toHaveProperty('page');
      expect(paginationResponse).toHaveProperty('limit');
      expect(Array.isArray(paginationResponse.properties)).toBe(true);
      expect(typeof paginationResponse.total).toBe('number');
      expect(typeof paginationResponse.page).toBe('number');
      expect(typeof paginationResponse.limit).toBe('number');
    });
  });

  describe('Data transformation and validation', () => {
    it('should handle coordinate precision correctly', () => {
      const location = {
        lat: 14.07234567890123456789,
        lng: -87.19212345678901234567,
        source: 'gps' as const
      };

      const result = FeaturedPropertiesInputSchema.safeParse({ location, limit: 6 });
      expect(result.success).toBe(true);
      
      if (result.success) {
        // Coordinates should be preserved with their precision
        expect(result.data.location!.lat).toBe(14.07234567890123456789);
        expect(result.data.location!.lng).toBe(-87.19212345678901234567);
      }
    });

    it('should handle special characters in search queries', () => {
      const queries = [
        "apartment with 'quotes'",
        'apartment with "double quotes"',
        'apartment & house',
        'apartment @ location',
        'apartment #123',
        'apartment $500',
        'apartment 50% off',
        'apartamento en español',
        'apartment with émojis 🏠',
      ];

      queries.forEach(query => {
        const result = SearchSuggestionsInputSchema.safeParse({ query });
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.query).toBe(query);
        }
      });
    });

    it('should handle edge cases in numeric filters', () => {
      const edgeCases = [
        { priceMin: 0, priceMax: 0 },
        { priceMin: 1, priceMax: Number.MAX_SAFE_INTEGER },
        { bedrooms: [0] },
        { bathrooms: [10] },
      ];

      edgeCases.forEach(filters => {
        const result = PropertySearchInputSchema.safeParse({ filters });
        expect(result.success).toBe(true);
      });
    });

    it('should handle complex nested analytics properties', () => {
      const complexEvent = {
        name: 'complex_user_interaction',
        properties: {
          user: {
            id: 'user-123',
            segment: 'premium',
            preferences: {
              location: { city: 'Tegucigalpa', neighborhood: 'Lomas del Guijarro' },
              priceRange: { min: 2000, max: 5000 },
              amenities: ['parking', 'security', 'gym'],
              contactMethods: ['email', 'whatsapp']
            }
          },
          interaction: {
            type: 'property_view',
            duration: 45.5,
            interactions: ['scroll', 'click', 'zoom'],
            context: {
              searchQuery: 'luxury apartment',
              resultsCount: 25,
              position: 3
            }
          },
          session: {
            startTime: '2024-09-08T10:00:00Z',
            pageViews: 5,
            searchQueries: 3,
            propertiesSaved: 1
          }
        },
        timestamp: Date.now(),
        sessionId: 'session-123'
      };

      const result = AnalyticsEventSchema.safeParse(complexEvent);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data.properties.user.id).toBe('user-123');
        expect(result.data.properties.interaction.type).toBe('property_view');
        expect(result.data.properties.session.pageViews).toBe(5);
      }
    });
  });

  describe('Error message validation', () => {
    it('should provide helpful error messages for validation failures', () => {
      // Test invalid limit
      const invalidLimit = FeaturedPropertiesInputSchema.safeParse({ limit: 25 });
      expect(invalidLimit.success).toBe(false);
      if (!invalidLimit.success) {
        expect(invalidLimit.error.issues.length).toBeGreaterThan(0);
        expect(invalidLimit.error.issues[0].path).toContain('limit');
      }

      // Test invalid coordinates
      const invalidCoords = FeaturedPropertiesInputSchema.safeParse({
        limit: 6,
        location: { lat: 95, lng: 185, source: 'gps' }
      });
      expect(invalidCoords.success).toBe(false);
      if (!invalidCoords.success) {
        const errors = invalidCoords.error.issues;
        expect(errors.some(e => e.path.includes('lat'))).toBe(true);
        expect(errors.some(e => e.path.includes('lng'))).toBe(true);
      }

      // Test invalid property types
      const invalidTypes = PropertySearchInputSchema.safeParse({
        filters: { propertyTypes: ['invalid_type'] }
      });
      expect(invalidTypes.success).toBe(false);
      if (!invalidTypes.success) {
        expect(invalidTypes.error.issues.some(e => 
          e.path.includes('propertyTypes')
        )).toBe(true);
      }
    });
  });

  describe('Performance considerations', () => {
    it('should validate large input objects efficiently', () => {
      const largeFilters = {
        amenities: Array.from({ length: 50 }, (_, i) => `amenity-${i}`),
        propertyTypes: ['apartment', 'house', 'room', 'commercial'],
        bedrooms: Array.from({ length: 10 }, (_, i) => i),
        bathrooms: Array.from({ length: 5 }, (_, i) => i + 1)
      };

      const start = Date.now();
      const result = PropertySearchInputSchema.safeParse({ filters: largeFilters });
      const duration = Date.now() - start;

      expect(result.success).toBe(true);
      expect(duration).toBeLessThan(100); // Should validate quickly
    });

    it('should handle rapid successive validations', () => {
      const inputs = Array.from({ length: 100 }, (_, i) => ({
        query: `search query ${i}`,
        limit: (i % 20) + 1
      }));

      const start = Date.now();
      const results = inputs.map(input => 
        SearchSuggestionsInputSchema.safeParse(input)
      );
      const duration = Date.now() - start;

      expect(results.every(r => r.success)).toBe(true);
      expect(duration).toBeLessThan(500); // Should handle many validations quickly
    });
  });

  describe('Backwards compatibility', () => {
    it('should handle missing optional fields gracefully', () => {
      // Test with minimal required fields only
      const minimalEvent = {
        name: 'minimal_event',
        properties: {},
        timestamp: Date.now(),
        sessionId: 'session-123'
        // userId is optional and omitted
      };

      const result = AnalyticsEventSchema.safeParse(minimalEvent);
      expect(result.success).toBe(true);

      // Test with empty filters
      const minimalSearch = {};
      const searchResult = PropertySearchInputSchema.safeParse(minimalSearch);
      expect(searchResult.success).toBe(true);
      if (searchResult.success) {
        expect(searchResult.data.page).toBe(1);
        expect(searchResult.data.limit).toBe(20);
        expect(searchResult.data.sortBy).toBe('relevance');
      }
    });

    it('should maintain consistent defaults across schema versions', () => {
      const defaultValues = {
        featuredProperties: FeaturedPropertiesInputSchema.parse({}),
        searchSuggestions: SearchSuggestionsInputSchema.parse({ query: 'test' }),
        propertySearch: PropertySearchInputSchema.parse({})
      };

      expect(defaultValues.featuredProperties.limit).toBe(6);
      expect(defaultValues.searchSuggestions.limit).toBe(5);
      expect(defaultValues.propertySearch.page).toBe(1);
      expect(defaultValues.propertySearch.limit).toBe(20);
      expect(defaultValues.propertySearch.sortBy).toBe('relevance');
    });
  });
});