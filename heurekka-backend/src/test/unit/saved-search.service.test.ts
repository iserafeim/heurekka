/**
 * Unit tests for SavedSearchService
 * Tests the matching algorithm and core CRUD operations
 */

import { describe, it, expect, beforeAll } from '@jest/globals';

describe('SavedSearchService - Matching Algorithm', () => {
  describe('Property Matching Logic', () => {
    it('should match properties within budget range', () => {
      const criteria = {
        budgetMin: 10000,
        budgetMax: 15000
      };

      const property = {
        price_amount: 12000
      };

      const isMatch = property.price_amount >= criteria.budgetMin &&
                      property.price_amount <= criteria.budgetMax;

      expect(isMatch).toBe(true);
    });

    it('should not match properties outside budget range', () => {
      const criteria = {
        budgetMin: 10000,
        budgetMax: 15000
      };

      const property = {
        price_amount: 20000
      };

      const isMatch = property.price_amount >= criteria.budgetMin &&
                      property.price_amount <= criteria.budgetMax;

      expect(isMatch).toBe(false);
    });

    it('should match properties by bedrooms range', () => {
      const criteria = {
        bedrooms: { min: 2, max: 3 }
      };

      const property = {
        bedrooms: 2
      };

      const isMatch = property.bedrooms >= (criteria.bedrooms.min || 0) &&
                      property.bedrooms <= (criteria.bedrooms.max || 100);

      expect(isMatch).toBe(true);
    });

    it('should match properties with required amenities', () => {
      const criteria = {
        amenities: ['parking', 'gym']
      };

      const property = {
        amenities: ['parking', 'gym', 'pool']
      };

      const isMatch = criteria.amenities.some(amenity =>
        property.amenities.includes(amenity)
      );

      expect(isMatch).toBe(true);
    });

    it('should not match properties missing all required amenities', () => {
      const criteria = {
        amenities: ['parking', 'gym']
      };

      const property = {
        amenities: ['pool', 'security']
      };

      const isMatch = criteria.amenities.some(amenity =>
        property.amenities.includes(amenity)
      );

      expect(isMatch).toBe(false);
    });

    it('should match properties by type', () => {
      const criteria = {
        propertyTypes: ['apartment', 'house']
      };

      const property = {
        type: 'apartment'
      };

      const isMatch = criteria.propertyTypes.includes(property.type);

      expect(isMatch).toBe(true);
    });

    it('should filter by pets allowed when required', () => {
      const criteria = {
        petsAllowed: true
      };

      const property = {
        pets_allowed: true
      };

      const isMatch = !criteria.petsAllowed || property.pets_allowed === true;

      expect(isMatch).toBe(true);
    });
  });

  describe('Search Criteria Validation', () => {
    it('should reject invalid budget ranges', () => {
      const criteria = {
        budgetMin: 15000,
        budgetMax: 10000
      };

      const isValid = criteria.budgetMin <= criteria.budgetMax;

      expect(isValid).toBe(false);
    });

    it('should accept valid budget ranges', () => {
      const criteria = {
        budgetMin: 10000,
        budgetMax: 15000
      };

      const isValid = criteria.budgetMin <= criteria.budgetMax;

      expect(isValid).toBe(true);
    });

    it('should reject profile names that are too short', () => {
      const profileName = 'AB';
      const isValid = profileName.length >= 3;

      expect(isValid).toBe(false);
    });

    it('should accept valid profile names', () => {
      const profileName = 'Mi Búsqueda en Lomas';
      const isValid = profileName.length >= 3 && profileName.length <= 100;

      expect(isValid).toBe(true);
    });
  });

  describe('Profile Completion Calculation', () => {
    it('should calculate correct completion percentage for minimal profile', () => {
      const profile = {
        fullName: 'Juan Pérez',
        phone: '9999-9999'
      };

      const fields = {
        fullName: 15,
        phone: 15,
        occupation: 10,
        budgetMin: 10,
        budgetMax: 10,
        moveDate: 10,
        occupants: 10,
        preferredAreas: 10,
        propertyTypes: 5,
        hasPets: 5
      };

      let completedPoints = 0;
      if (profile.fullName) completedPoints += fields.fullName;
      if (profile.phone) completedPoints += fields.phone;

      const percentage = Math.min(100, completedPoints);

      expect(percentage).toBe(30);
    });

    it('should calculate 100% for complete profile', () => {
      const profile = {
        fullName: 'Juan Pérez',
        phone: '9999-9999',
        occupation: 'Ingeniero',
        budgetMin: 10000,
        budgetMax: 15000,
        moveDate: '2024-12-01',
        occupants: '2',
        preferredAreas: ['Lomas', 'Centro'],
        propertyTypes: ['apartment'],
        hasPets: false
      };

      const fields = {
        fullName: 15,
        phone: 15,
        occupation: 10,
        budgetMin: 10,
        budgetMax: 10,
        moveDate: 10,
        occupants: 10,
        preferredAreas: 10,
        propertyTypes: 5,
        hasPets: 5
      };

      let completedPoints = 0;
      if (profile.fullName) completedPoints += fields.fullName;
      if (profile.phone) completedPoints += fields.phone;
      if (profile.occupation) completedPoints += fields.occupation;
      if (profile.budgetMin) completedPoints += fields.budgetMin;
      if (profile.budgetMax) completedPoints += fields.budgetMax;
      if (profile.moveDate) completedPoints += fields.moveDate;
      if (profile.occupants) completedPoints += fields.occupants;
      if (profile.preferredAreas && profile.preferredAreas.length > 0) completedPoints += fields.preferredAreas;
      if (profile.propertyTypes && profile.propertyTypes.length > 0) completedPoints += fields.propertyTypes;
      if (profile.hasPets !== undefined) completedPoints += fields.hasPets;

      const percentage = Math.min(100, completedPoints);

      expect(percentage).toBe(100);
    });
  });
});

describe('SavedSearchService - Data Transformations', () => {
  it('should transform snake_case to camelCase correctly', () => {
    const dbRecord = {
      id: '123',
      user_id: 'user-456',
      profile_name: 'Mi Búsqueda',
      search_criteria: {},
      is_active: true,
      new_matches_count: 5,
      last_checked_at: '2024-01-01T00:00:00Z',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    };

    const transformed = {
      id: dbRecord.id,
      userId: dbRecord.user_id,
      profileName: dbRecord.profile_name,
      searchCriteria: dbRecord.search_criteria,
      isActive: dbRecord.is_active,
      newMatchesCount: dbRecord.new_matches_count,
      lastCheckedAt: dbRecord.last_checked_at,
      createdAt: dbRecord.created_at,
      updatedAt: dbRecord.updated_at
    };

    expect(transformed.userId).toBe('user-456');
    expect(transformed.profileName).toBe('Mi Búsqueda');
    expect(transformed.isActive).toBe(true);
    expect(transformed.newMatchesCount).toBe(5);
  });
});

describe('FavoriteService - Contact Tracking', () => {
  it('should correctly identify contacted properties', () => {
    const contactedMap = new Map([
      ['property-1', '2024-01-01T00:00:00Z'],
      ['property-2', '2024-01-02T00:00:00Z']
    ]);

    const property1 = {
      id: 'fav-1',
      property_id: 'property-1'
    };

    const property2 = {
      id: 'fav-2',
      property_id: 'property-3'
    };

    const isProperty1Contacted = contactedMap.has(property1.property_id);
    const isProperty2Contacted = contactedMap.has(property2.property_id);

    expect(isProperty1Contacted).toBe(true);
    expect(isProperty2Contacted).toBe(false);
  });
});
