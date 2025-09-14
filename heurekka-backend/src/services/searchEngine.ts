import { supabaseService } from './supabase';
import { cacheService } from './cache';
import type { Suggestion, SearchResults, Location } from '../types/homepage';

interface SearchEngineConfig {
  maxSuggestions: number;
  cacheEnabled: boolean;
  popularSearchesWeight: number;
  locationSearchesWeight: number;
}

class SearchEngine {
  private config: SearchEngineConfig;
  private popularSearches: string[] = [];
  private lastUpdate: number = 0;
  private updateInterval: number = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.config = {
      maxSuggestions: 8,
      cacheEnabled: true,
      popularSearchesWeight: 0.7,
      locationSearchesWeight: 0.9
    };
  }

  async initialize(): Promise<void> {
    try {
      await this.updatePopularSearches();
      console.log('✅ Search engine initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize search engine:', error);
    }
  }

  async getSuggestions(query: string, location?: Location, limit?: number): Promise<Suggestion[]> {
    const maxSuggestions = limit || this.config.maxSuggestions;
    const normalizedQuery = query.toLowerCase().trim();

    if (normalizedQuery.length < 2) {
      return this.getDefaultSuggestions(location, maxSuggestions);
    }

    // Check cache first
    if (this.config.cacheEnabled) {
      const locationHash = location ? cacheService.generateLocationHash(location) : undefined;
      const cached = await cacheService.getSuggestions(normalizedQuery, locationHash);
      if (cached) {
        return cached.slice(0, maxSuggestions);
      }
    }

    try {
      // Get suggestions from multiple sources
      const [
        locationSuggestions,
        propertySuggestions,
        popularSuggestions,
        recentSuggestions
      ] = await Promise.all([
        this.getLocationSuggestions(normalizedQuery, location),
        this.getPropertySuggestions(normalizedQuery, location),
        this.getPopularSuggestions(normalizedQuery),
        this.getRecentSuggestions(normalizedQuery)
      ]);

      // Merge and rank suggestions
      const allSuggestions = [
        ...locationSuggestions,
        ...propertySuggestions,
        ...popularSuggestions,
        ...recentSuggestions
      ];

      const rankedSuggestions = this.rankSuggestions(allSuggestions, normalizedQuery, location);
      const finalSuggestions = this.deduplicateSuggestions(rankedSuggestions).slice(0, maxSuggestions);

      // Cache the results
      if (this.config.cacheEnabled) {
        const locationHash = location ? cacheService.generateLocationHash(location) : undefined;
        await cacheService.setSuggestions(normalizedQuery, finalSuggestions, locationHash);
      }

      return finalSuggestions;

    } catch (error) {
      console.error('Error getting suggestions:', error);
      return this.getFallbackSuggestions(normalizedQuery, location, maxSuggestions);
    }
  }

  async searchProperties(searchParams: {
    query?: string;
    location?: Location;
    filters?: any;
    page?: number;
    limit?: number;
    sortBy?: string;
  }): Promise<SearchResults> {
    // Generate search hash for caching
    const searchHash = cacheService.generateSearchHash(searchParams);

    // Check cache first
    if (this.config.cacheEnabled) {
      const cached = await cacheService.getSearchResults(searchHash);
      if (cached) {
        return cached;
      }
    }

    try {
      console.log('🚀 SearchEngine.searchProperties called with:', searchParams);

      // Track search analytics
      if (searchParams.query) {
        console.log('📈 Tracking search analytics...');
        await this.trackSearch(searchParams.query, searchParams.location);
      }

      console.log('🔍 Calling supabaseService.searchProperties...');
      // Perform the search
      const results = await supabaseService.searchProperties(searchParams);
      console.log('✅ Got results from supabaseService:', { propertiesCount: results.properties.length });

      // Cache the results
      if (this.config.cacheEnabled && results.properties.length > 0) {
        await cacheService.setSearchResults(searchHash, results);
      }

      return results;

    } catch (error) {
      console.error('Error searching properties:', error);
      throw new Error('Search service temporarily unavailable');
    }
  }

  private async getLocationSuggestions(query: string, userLocation?: Location): Promise<Suggestion[]> {
    try {
      // This would integrate with a geocoding service or local database
      const suggestions = await supabaseService.getSearchSuggestions(query, userLocation, 3);
      
      return suggestions
        .filter(s => s.type === 'location')
        .map(s => ({
          ...s,
          metadata: {
            ...s.metadata,
            weight: this.config.locationSearchesWeight
          }
        }));
    } catch (error) {
      console.error('Error getting location suggestions:', error);
      return [];
    }
  }

  private async getPropertySuggestions(query: string, userLocation?: Location): Promise<Suggestion[]> {
    try {
      // Search for property types, features, etc.
      const propertyTypes = ['apartment', 'house', 'room', 'commercial'];
      const features = ['parking', 'furnished', 'pet-friendly', 'pool', 'gym', 'security'];
      
      const matchingTypes = propertyTypes.filter(type => 
        type.toLowerCase().includes(query) || query.includes(type.toLowerCase())
      );
      
      const matchingFeatures = features.filter(feature => 
        feature.toLowerCase().includes(query) || query.includes(feature.toLowerCase())
      );

      const suggestions: Suggestion[] = [];

      // Add property type suggestions
      matchingTypes.forEach(type => {
        suggestions.push({
          id: `property-type-${type}`,
          text: `${type.charAt(0).toUpperCase() + type.slice(1)} rentals`,
          type: 'property',
          icon: 'home',
          metadata: { weight: 0.8 }
        });
      });

      // Add feature suggestions
      matchingFeatures.forEach(feature => {
        suggestions.push({
          id: `feature-${feature}`,
          text: `${feature.charAt(0).toUpperCase() + feature.slice(1)} properties`,
          type: 'property',
          icon: 'star',
          metadata: { weight: 0.6 }
        });
      });

      return suggestions;
    } catch (error) {
      console.error('Error getting property suggestions:', error);
      return [];
    }
  }

  private async getPopularSuggestions(query: string): Promise<Suggestion[]> {
    try {
      // Check if we need to update popular searches
      if (Date.now() - this.lastUpdate > this.updateInterval) {
        await this.updatePopularSearches();
      }

      const matchingSearches = this.popularSearches.filter(search =>
        search.toLowerCase().includes(query) || query.includes(search.toLowerCase())
      );

      return matchingSearches.slice(0, 3).map((search, index) => ({
        id: `popular-${search}`,
        text: search,
        type: 'property',
        icon: 'trending-up',
        metadata: { 
          popularityScore: 100 - (index * 10),
          weight: this.config.popularSearchesWeight
        }
      }));
    } catch (error) {
      console.error('Error getting popular suggestions:', error);
      return [];
    }
  }

  private getRecentSuggestions(query: string): Suggestion[] {
    // This would typically come from user's session or local storage
    // For now, return empty array as this is handled client-side
    return [];
  }

  private getDefaultSuggestions(location?: Location, limit: number = 5): Suggestion[] {
    const defaultSuggestions: Suggestion[] = [
      {
        id: 'default-apartment',
        text: 'Apartments in Tegucigalpa',
        type: 'property',
        icon: 'building',
        metadata: { weight: 1.0 }
      },
      {
        id: 'default-house',
        text: 'Houses for rent',
        type: 'property',
        icon: 'home',
        metadata: { weight: 0.9 }
      },
      {
        id: 'default-furnished',
        text: 'Furnished properties',
        type: 'property',
        icon: 'star',
        metadata: { weight: 0.8 }
      },
      {
        id: 'default-colonia',
        text: 'Colonia Palmira',
        type: 'location',
        icon: 'map-pin',
        metadata: { weight: 0.9 }
      },
      {
        id: 'default-lomas',
        text: 'Lomas del Guijarro',
        type: 'location',
        icon: 'map-pin',
        metadata: { weight: 0.8 }
      }
    ];

    return defaultSuggestions.slice(0, limit);
  }

  private getFallbackSuggestions(query: string, location?: Location, limit: number = 3): Suggestion[] {
    return [
      {
        id: `fallback-${query}`,
        text: `Search "${query}"`,
        type: 'property',
        icon: 'search',
        metadata: { weight: 0.5 }
      },
      ...this.getDefaultSuggestions(location, limit - 1)
    ];
  }

  private rankSuggestions(suggestions: Suggestion[], query: string, location?: Location): Suggestion[] {
    return suggestions
      .map(suggestion => {
        let score = suggestion.metadata?.weight || 0.5;
        
        // Boost exact matches
        if (suggestion.text.toLowerCase() === query) {
          score += 0.5;
        }
        
        // Boost starts-with matches
        if (suggestion.text.toLowerCase().startsWith(query)) {
          score += 0.3;
        }
        
        // Boost location suggestions if user location is available
        if (location && suggestion.type === 'location') {
          score += 0.2;
        }
        
        // Boost popular suggestions
        if (suggestion.metadata?.popularityScore) {
          score += (suggestion.metadata.popularityScore / 1000);
        }

        return { ...suggestion, score };
      })
      .sort((a, b) => (b.score || 0) - (a.score || 0));
  }

  private deduplicateSuggestions(suggestions: Suggestion[]): Suggestion[] {
    const seen = new Set<string>();
    return suggestions.filter(suggestion => {
      const key = suggestion.text.toLowerCase().trim();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  private async updatePopularSearches(): Promise<void> {
    try {
      // Get popular searches from cache first
      const cached = await cacheService.getPopularSearches();
      if (cached) {
        this.popularSearches = cached;
        this.lastUpdate = Date.now();
        return;
      }

      // Fetch from database if not cached
      // This would be implemented based on your analytics tracking
      const popular = [
        'apartment tegucigalpa',
        'house colonia palmira',
        'furnished apartment',
        '2 bedroom apartment',
        'parking included',
        'pet friendly',
        'lomas del guijarro',
        'centro tegucigalpa'
      ];

      this.popularSearches = popular;
      this.lastUpdate = Date.now();

      // Cache the results
      await cacheService.setPopularSearches(popular);
    } catch (error) {
      console.error('Error updating popular searches:', error);
    }
  }

  private async trackSearch(query: string, location?: Location): Promise<void> {
    try {
      // Increment search count in cache
      await cacheService.incrementSearchCount(query);

      // Track in analytics (fire and forget)
      supabaseService.trackAnalyticsEvent({
        name: 'property_search',
        properties: {
          query,
          hasLocation: !!location,
          location: location ? `${location.lat},${location.lng}` : null
        },
        timestamp: Date.now(),
        sessionId: `search-${Date.now()}`, // This would come from request context
      }).catch(error => {
        console.error('Error tracking search event:', error);
      });
    } catch (error) {
      console.error('Error tracking search:', error);
    }
  }

  // Health check
  async healthCheck(): Promise<{ status: string; details?: any }> {
    try {
      const [cacheHealth] = await Promise.all([
        cacheService.healthCheck()
      ]);

      return {
        status: cacheHealth.status === 'healthy' ? 'healthy' : 'degraded',
        details: {
          cache: cacheHealth,
          popularSearches: this.popularSearches.length,
          lastUpdate: new Date(this.lastUpdate).toISOString()
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: { error: error instanceof Error ? error.message : String(error) }
      };
    }
  }
}

export const searchEngine = new SearchEngine();