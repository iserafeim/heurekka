import { describe, it, expect } from 'vitest';
import {
  LocationSchema,
  SearchFiltersSchema,
  SearchQuerySchema,
  SearchSuggestionsInputSchema,
  PropertySearchInputSchema,
  FeaturedPropertiesInputSchema,
  AnalyticsEventSchema,
  CreateSearchProfileSchema,
  SavePropertySchema,
  validateSearchQuery,
  validateSearchSuggestions,
  validatePropertySearch,
  validateFeaturedProperties,
  validateAnalyticsEvent
} from '@/schemas/homepage';
import { 
  mockLocation, 
  validSearchFilters, 
  validSearchQuery, 
  validAnalyticsEvent, 
  validSearchProfile 
} from '../fixtures/propertyFixtures';

describe('Homepage Schemas', () => {
  describe('LocationSchema', () => {
    it('should validate valid location', () => {
      const result = LocationSchema.safeParse(mockLocation);
      expect(result.success).toBe(true);
    });

    it('should reject invalid latitude', () => {
      const invalidLocation = { ...mockLocation, lat: 95 };
      const result = LocationSchema.safeParse(invalidLocation);
      expect(result.success).toBe(false);
    });

    it('should reject invalid longitude', () => {
      const invalidLocation = { ...mockLocation, lng: 185 };
      const result = LocationSchema.safeParse(invalidLocation);
      expect(result.success).toBe(false);
    });

    it('should validate location without optional accuracy', () => {
      const { accuracy, ...locationWithoutAccuracy } = mockLocation;
      const result = LocationSchema.safeParse(locationWithoutAccuracy);
      expect(result.success).toBe(true);
    });

    it('should reject invalid source', () => {
      const invalidLocation = { ...mockLocation, source: 'invalid' };
      const result = LocationSchema.safeParse(invalidLocation);
      expect(result.success).toBe(false);
    });
  });

  describe('SearchFiltersSchema', () => {
    it('should validate valid filters', () => {
      const result = SearchFiltersSchema.safeParse(validSearchFilters);
      expect(result.success).toBe(true);
    });

    it('should validate empty filters', () => {
      const result = SearchFiltersSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should reject negative price values', () => {
      const invalidFilters = { ...validSearchFilters, priceMin: -1000 };
      const result = SearchFiltersSchema.safeParse(invalidFilters);
      expect(result.success).toBe(false);
    });

    it('should reject invalid property types', () => {
      const invalidFilters = { ...validSearchFilters, propertyTypes: ['invalid-type'] };
      const result = SearchFiltersSchema.safeParse(invalidFilters);
      expect(result.success).toBe(false);
    });

    it('should reject bedroom count over limit', () => {
      const invalidFilters = { ...validSearchFilters, bedrooms: [15] };
      const result = SearchFiltersSchema.safeParse(invalidFilters);
      expect(result.success).toBe(false);
    });

    it('should reject bathroom count over limit', () => {
      const invalidFilters = { ...validSearchFilters, bathrooms: [15] };
      const result = SearchFiltersSchema.safeParse(invalidFilters);
      expect(result.success).toBe(false);
    });

    it('should validate boolean flags', () => {
      const filters = {
        petFriendly: true,
        furnished: false,
        parking: true
      };
      const result = SearchFiltersSchema.safeParse(filters);
      expect(result.success).toBe(true);
    });
  });

  describe('SearchQuerySchema', () => {
    it('should validate valid search query', () => {
      const result = SearchQuerySchema.safeParse(validSearchQuery);
      expect(result.success).toBe(true);
    });

    it('should reject empty search text', () => {
      const invalidQuery = { ...validSearchQuery, text: '' };
      const result = SearchQuerySchema.safeParse(invalidQuery);
      expect(result.success).toBe(false);
    });

    it('should reject search text over 500 characters', () => {
      const longText = 'a'.repeat(501);
      const invalidQuery = { ...validSearchQuery, text: longText };
      const result = SearchQuerySchema.safeParse(invalidQuery);
      expect(result.success).toBe(false);
    });

    it('should validate query without optional fields', () => {
      const minimalQuery = {
        text: 'apartment',
        timestamp: Date.now()
      };
      const result = SearchQuerySchema.safeParse(minimalQuery);
      expect(result.success).toBe(true);
    });

    it('should reject missing timestamp', () => {
      const { timestamp, ...queryWithoutTimestamp } = validSearchQuery;
      const result = SearchQuerySchema.safeParse(queryWithoutTimestamp);
      expect(result.success).toBe(false);
    });
  });

  describe('SearchSuggestionsInputSchema', () => {
    it('should validate valid suggestions input', () => {
      const input = {
        query: 'apartment',
        location: mockLocation,
        limit: 5
      };
      const result = SearchSuggestionsInputSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should use default limit', () => {
      const input = { query: 'apartment' };
      const result = SearchSuggestionsInputSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(5);
      }
    });

    it('should reject empty query', () => {
      const input = { query: '' };
      const result = SearchSuggestionsInputSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should reject query over 200 characters', () => {
      const input = { query: 'a'.repeat(201) };
      const result = SearchSuggestionsInputSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should reject limit over 20', () => {
      const input = { query: 'apartment', limit: 25 };
      const result = SearchSuggestionsInputSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should reject limit under 1', () => {
      const input = { query: 'apartment', limit: 0 };
      const result = SearchSuggestionsInputSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe('PropertySearchInputSchema', () => {
    it('should validate complete search input', () => {
      const input = {
        query: 'apartment',
        location: mockLocation,
        filters: validSearchFilters,
        page: 1,
        limit: 20,
        sortBy: 'relevance' as const
      };
      const result = PropertySearchInputSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should use default values', () => {
      const input = {};
      const result = PropertySearchInputSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
        expect(result.data.sortBy).toBe('relevance');
      }
    });

    it('should reject invalid sort option', () => {
      const input = { sortBy: 'invalid-sort' };
      const result = PropertySearchInputSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should reject page under 1', () => {
      const input = { page: 0 };
      const result = PropertySearchInputSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should reject limit over 50', () => {
      const input = { limit: 51 };
      const result = PropertySearchInputSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should validate all sort options', () => {
      const sortOptions = ['relevance', 'price_asc', 'price_desc', 'date_desc', 'distance'];
      sortOptions.forEach(sortBy => {
        const input = { sortBy };
        const result = PropertySearchInputSchema.safeParse(input);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('FeaturedPropertiesInputSchema', () => {
    it('should validate with default limit', () => {
      const input = {};
      const result = FeaturedPropertiesInputSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(6);
      }
    });

    it('should validate with custom limit and location', () => {
      const input = { limit: 10, location: mockLocation };
      const result = FeaturedPropertiesInputSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should reject limit over 20', () => {
      const input = { limit: 25 };
      const result = FeaturedPropertiesInputSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should reject limit under 1', () => {
      const input = { limit: 0 };
      const result = FeaturedPropertiesInputSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe('AnalyticsEventSchema', () => {
    it('should validate valid analytics event', () => {
      const result = AnalyticsEventSchema.safeParse(validAnalyticsEvent);
      expect(result.success).toBe(true);
    });

    it('should reject empty event name', () => {
      const invalidEvent = { ...validAnalyticsEvent, name: '' };
      const result = AnalyticsEventSchema.safeParse(invalidEvent);
      expect(result.success).toBe(false);
    });

    it('should reject event name over 100 characters', () => {
      const invalidEvent = { ...validAnalyticsEvent, name: 'a'.repeat(101) };
      const result = AnalyticsEventSchema.safeParse(invalidEvent);
      expect(result.success).toBe(false);
    });

    it('should reject empty session ID', () => {
      const invalidEvent = { ...validAnalyticsEvent, sessionId: '' };
      const result = AnalyticsEventSchema.safeParse(invalidEvent);
      expect(result.success).toBe(false);
    });

    it('should reject session ID over 100 characters', () => {
      const invalidEvent = { ...validAnalyticsEvent, sessionId: 'a'.repeat(101) };
      const result = AnalyticsEventSchema.safeParse(invalidEvent);
      expect(result.success).toBe(false);
    });

    it('should validate without optional userId', () => {
      const { userId, ...eventWithoutUserId } = validAnalyticsEvent;
      const result = AnalyticsEventSchema.safeParse(eventWithoutUserId);
      expect(result.success).toBe(true);
    });

    it('should validate various property types', () => {
      const event = {
        ...validAnalyticsEvent,
        properties: {
          stringProp: 'test',
          numberProp: 123,
          booleanProp: true,
          objectProp: { nested: 'value' },
          arrayProp: [1, 2, 3]
        }
      };
      const result = AnalyticsEventSchema.safeParse(event);
      expect(result.success).toBe(true);
    });
  });

  describe('CreateSearchProfileSchema', () => {
    it('should validate valid search profile', () => {
      const result = CreateSearchProfileSchema.safeParse(validSearchProfile);
      expect(result.success).toBe(true);
    });

    it('should reject name under 2 characters', () => {
      const invalidProfile = { ...validSearchProfile, name: 'A' };
      const result = CreateSearchProfileSchema.safeParse(invalidProfile);
      expect(result.success).toBe(false);
    });

    it('should reject name over 100 characters', () => {
      const invalidProfile = { ...validSearchProfile, name: 'A'.repeat(101) };
      const result = CreateSearchProfileSchema.safeParse(invalidProfile);
      expect(result.success).toBe(false);
    });

    it('should validate all notification frequency options', () => {
      const frequencies = ['instant', 'daily', 'weekly'];
      frequencies.forEach(frequency => {
        const profile = {
          ...validSearchProfile,
          notifications: {
            ...validSearchProfile.notifications,
            frequency
          }
        };
        const result = CreateSearchProfileSchema.safeParse(profile);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid notification frequency', () => {
      const invalidProfile = {
        ...validSearchProfile,
        notifications: {
          ...validSearchProfile.notifications,
          frequency: 'invalid'
        }
      };
      const result = CreateSearchProfileSchema.safeParse(invalidProfile);
      expect(result.success).toBe(false);
    });
  });

  describe('SavePropertySchema', () => {
    it('should validate valid UUID', () => {
      const input = { propertyId: '123e4567-e89b-12d3-a456-426614174000' };
      const result = SavePropertySchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should reject invalid UUID format', () => {
      const input = { propertyId: 'invalid-uuid' };
      const result = SavePropertySchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should reject empty string', () => {
      const input = { propertyId: '' };
      const result = SavePropertySchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe('Validation Helper Functions', () => {
    describe('validateSearchQuery', () => {
      it('should return parsed query for valid input', () => {
        const result = validateSearchQuery(validSearchQuery);
        expect(result).toEqual(validSearchQuery);
      });

      it('should throw error for invalid input', () => {
        const invalidQuery = { ...validSearchQuery, text: '' };
        expect(() => validateSearchQuery(invalidQuery)).toThrow('Invalid search parameters');
      });
    });

    describe('validateSearchSuggestions', () => {
      it('should return parsed input for valid data', () => {
        const input = { query: 'apartment', limit: 5 };
        const result = validateSearchSuggestions(input);
        expect(result.query).toBe('apartment');
        expect(result.limit).toBe(5);
      });

      it('should throw error for invalid input', () => {
        const invalidInput = { query: '' };
        expect(() => validateSearchSuggestions(invalidInput)).toThrow('Invalid search suggestions parameters');
      });
    });

    describe('validatePropertySearch', () => {
      it('should return parsed input with defaults', () => {
        const result = validatePropertySearch({});
        expect(result.page).toBe(1);
        expect(result.limit).toBe(20);
        expect(result.sortBy).toBe('relevance');
      });

      it('should throw error for invalid input', () => {
        const invalidInput = { page: 0 };
        expect(() => validatePropertySearch(invalidInput)).toThrow('Invalid property search parameters');
      });
    });

    describe('validateFeaturedProperties', () => {
      it('should return parsed input with defaults', () => {
        const result = validateFeaturedProperties({});
        expect(result.limit).toBe(6);
      });

      it('should throw error for invalid input', () => {
        const invalidInput = { limit: 0 };
        expect(() => validateFeaturedProperties(invalidInput)).toThrow('Invalid featured properties parameters');
      });
    });

    describe('validateAnalyticsEvent', () => {
      it('should return parsed event for valid input', () => {
        const result = validateAnalyticsEvent(validAnalyticsEvent);
        expect(result).toEqual(validAnalyticsEvent);
      });

      it('should throw error for invalid input', () => {
        const invalidEvent = { ...validAnalyticsEvent, name: '' };
        expect(() => validateAnalyticsEvent(invalidEvent)).toThrow('Invalid analytics event');
      });
    });
  });
});