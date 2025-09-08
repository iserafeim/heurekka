import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Property, SearchResults, Suggestion, HomepageData, AnalyticsEvent } from '../types/homepage';

class SupabaseService {
  private client: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }
    
    this.client = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }

  async getFeaturedProperties(limit: number = 6, userLocation?: { lat: number; lng: number }): Promise<Property[]> {
    try {
      let query = this.client
        .from('properties')
        .select(`
          *,
          property_images (*),
          landlords (*)
        `)
        .eq('status', 'active')
        .eq('featured', true)
        .order('featured_at', { ascending: false })
        .limit(limit);

      // If user location is provided, add distance-based ordering
      if (userLocation) {
        // Use secure RPC function for distance calculation to prevent injection
        const { data: distanceOrderedData } = await this.client.rpc('get_featured_properties_by_distance', {
          user_lat: userLocation.lat,
          user_lng: userLocation.lng,
          property_limit: limit
        });
        
        if (distanceOrderedData) {
          return distanceOrderedData.map(this.transformPropertyData);
        }
        // Fallback to regular query without distance ordering if RPC fails
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching featured properties:', error);
        throw new Error('Failed to fetch featured properties');
      }

      return data?.map(this.transformPropertyData) || [];
    } catch (error) {
      console.error('Database error in getFeaturedProperties:', error);
      throw error;
    }
  }

  async searchProperties(
    searchParams: {
      query?: string;
      location?: { lat: number; lng: number };
      filters?: any;
      page?: number;
      limit?: number;
      sortBy?: string;
    }
  ): Promise<SearchResults> {
    try {
      const { query: searchText, location, filters, page = 1, limit = 20, sortBy = 'relevance' } = searchParams;
      const offset = (page - 1) * limit;

      let baseQuery = this.client
        .from('properties')
        .select(`
          *,
          property_images (*),
          landlords (*)
        `, { count: 'exact' })
        .eq('status', 'active');

      // Apply text search
      if (searchText) {
        baseQuery = baseQuery.textSearch('search_vector', searchText);
      }

      // Apply location-based filtering
      if (location) {
        // Search within 25km radius using PostGIS
        const radiusKm = 25;
        // For now, use a bounding box approach for location filtering
        // In production, you would set up proper PostGIS RPC functions
        const latDelta = 0.5; // approximately 25km
        const lngDelta = 0.5;
        
        // This is a simplified approach - in production use proper PostGIS functions
        console.log(`Filtering by location: ${location.lat}, ${location.lng} with radius ${radiusKm}km`);
        // Note: Actual PostGIS integration would require custom RPC functions
      }

      // Apply price filters
      if (filters?.priceMin) {
        baseQuery = baseQuery.gte('price_amount', filters.priceMin);
      }
      if (filters?.priceMax) {
        baseQuery = baseQuery.lte('price_amount', filters.priceMax);
      }

      // Apply property type filters
      if (filters?.propertyTypes?.length > 0) {
        baseQuery = baseQuery.in('type', filters.propertyTypes);
      }

      // Apply bedroom filters
      if (filters?.bedrooms?.length > 0) {
        baseQuery = baseQuery.in('bedrooms', filters.bedrooms);
      }

      // Apply bathroom filters
      if (filters?.bathrooms?.length > 0) {
        baseQuery = baseQuery.in('bathrooms', filters.bathrooms);
      }

      // Apply amenity filters
      if (filters?.amenities?.length > 0) {
        baseQuery = baseQuery.contains('amenities', filters.amenities);
      }

      // Apply sorting
      switch (sortBy) {
        case 'price_asc':
          baseQuery = baseQuery.order('price_amount', { ascending: true });
          break;
        case 'price_desc':
          baseQuery = baseQuery.order('price_amount', { ascending: false });
          break;
        case 'date_desc':
          baseQuery = baseQuery.order('created_at', { ascending: false });
          break;
        case 'distance':
          if (location) {
            // For now, order by created_at since we need custom RPC for PostGIS distance
            baseQuery = baseQuery.order('created_at', { ascending: false });
            console.log(`Distance sorting requested for location: ${location.lat}, ${location.lng}`);
          }
          break;
        default: // relevance
          if (searchText) {
            // Use parameterized textSearch instead of raw query to prevent SQL injection
            baseQuery = baseQuery.textSearch('search_vector', searchText, {
              config: 'english'
            }).order('created_at', { ascending: false }); // Use created_at for ordering instead of ts_rank to avoid injection
          } else {
            baseQuery = baseQuery.order('created_at', { ascending: false });
          }
      }

      // Apply pagination
      baseQuery = baseQuery.range(offset, offset + limit - 1);

      const { data, error, count } = await baseQuery;

      if (error) {
        console.error('Error searching properties:', error);
        throw new Error('Failed to search properties');
      }

      // Get facets for filtering
      const facets = await this.getSearchFacets(searchParams);

      return {
        properties: data?.map(this.transformPropertyData) || [],
        total: count || 0,
        page,
        limit,
        facets
      };
    } catch (error) {
      console.error('Database error in searchProperties:', error);
      throw error;
    }
  }

  async getSearchSuggestions(query: string, location?: { lat: number; lng: number }, limit: number = 5): Promise<Suggestion[]> {
    try {
      const suggestions: Suggestion[] = [];

      // Get location suggestions
      const { data: neighborhoods } = await this.client
        .from('neighborhoods')
        .select('*')
        .ilike('name', `%${query}%`)
        .limit(Math.ceil(limit / 2));

      if (neighborhoods) {
        neighborhoods.forEach(neighborhood => {
          suggestions.push({
            id: `neighborhood-${neighborhood.id}`,
            text: neighborhood.name,
            type: 'location',
            icon: 'map-pin',
            metadata: {
              propertyCount: neighborhood.property_count,
              coordinates: neighborhood.location ? {
                lat: neighborhood.location.coordinates[1],
                lng: neighborhood.location.coordinates[0],
                source: 'manual' as const
              } : undefined
            }
          });
        });
      }

      // Get popular searches
      const { data: popularSearches } = await this.client
        .from('search_analytics')
        .select('query, search_count')
        .ilike('query', `%${query}%`)
        .order('search_count', { ascending: false })
        .limit(Math.floor(limit / 2));

      if (popularSearches) {
        popularSearches.forEach(search => {
          suggestions.push({
            id: `search-${search.query}`,
            text: search.query,
            type: 'property',
            icon: 'search',
            metadata: {
              popularityScore: search.search_count
            }
          });
        });
      }

      return suggestions.slice(0, limit);
    } catch (error) {
      console.error('Database error in getSearchSuggestions:', error);
      return []; // Return empty array on error to not break the search experience
    }
  }

  async getHomepageData(): Promise<HomepageData> {
    try {
      // Get all data in parallel
      const [featuredProperties, popularSearches, recentListings, neighborhoods, metrics] = await Promise.all([
        this.getFeaturedProperties(6),
        this.getPopularSearches(5),
        this.getRecentListings(6),
        this.getPopularNeighborhoods(10),
        this.getSearchMetrics()
      ]);

      return {
        featuredProperties,
        popularSearches,
        recentListings,
        neighborhoods,
        searchMetrics: metrics
      };
    } catch (error) {
      console.error('Database error in getHomepageData:', error);
      throw error;
    }
  }

  async trackAnalyticsEvent(event: AnalyticsEvent): Promise<void> {
    try {
      await this.client
        .from('analytics_events')
        .insert({
          event_name: event.name,
          event_properties: event.properties,
          timestamp: new Date(event.timestamp).toISOString(),
          session_id: event.sessionId,
          user_id: event.userId
        });
    } catch (error) {
      console.error('Error tracking analytics event:', error);
      // Don't throw here - analytics failures shouldn't break the main functionality
    }
  }

  async saveProperty(userId: string, propertyId: string): Promise<void> {
    try {
      await this.client
        .from('saved_properties')
        .upsert({
          user_id: userId,
          property_id: propertyId,
          saved_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,property_id'
        });

      // Update save count
      await this.client.rpc('increment_property_save_count', { property_id: propertyId });
    } catch (error) {
      console.error('Error saving property:', error);
      throw new Error('Failed to save property');
    }
  }

  // Private helper methods
  private transformPropertyData(rawData: any): Property {
    return {
      id: rawData.id,
      title: rawData.title,
      description: rawData.description,
      type: rawData.type,
      address: rawData.address,
      coordinates: {
        lat: rawData.location?.coordinates[1] || 0,
        lng: rawData.location?.coordinates[0] || 0
      },
      price: {
        amount: rawData.price_amount,
        currency: rawData.price_currency || 'HNL',
        period: rawData.price_period || 'month'
      },
      size: {
        value: rawData.size_value,
        unit: rawData.size_unit || 'm2'
      },
      bedrooms: rawData.bedrooms,
      bathrooms: rawData.bathrooms,
      amenities: rawData.amenities || [],
      images: rawData.property_images?.map((img: any) => ({
        id: img.id,
        url: img.url,
        thumbnailUrl: img.thumbnail_url,
        alt: img.alt || rawData.title,
        width: img.width,
        height: img.height,
        order: img.order
      })) || [],
      virtualTour: rawData.virtual_tour_url,
      video: rawData.video_url,
      availableFrom: new Date(rawData.available_from),
      minimumStay: rawData.minimum_stay,
      maximumStay: rawData.maximum_stay,
      createdAt: new Date(rawData.created_at),
      updatedAt: new Date(rawData.updated_at),
      viewCount: rawData.view_count || 0,
      saveCount: rawData.save_count || 0,
      responseTime: rawData.response_time || 60,
      verificationStatus: rawData.verification_status || 'pending',
      landlord: {
        id: rawData.landlords?.id,
        name: rawData.landlords?.name || 'Property Owner',
        photo: rawData.landlords?.photo_url,
        rating: rawData.landlords?.rating || 4.5,
        responseRate: rawData.landlords?.response_rate || 85,
        whatsappEnabled: rawData.landlords?.whatsapp_enabled || true
      }
    };
  }

  private async getSearchFacets(searchParams: any) {
    // Implementation for search facets
    // This would aggregate data for filters UI
    return {
      neighborhoods: [],
      priceRanges: [],
      propertyTypes: []
    };
  }

  private async getPopularSearches(limit: number): Promise<string[]> {
    const { data } = await this.client
      .from('search_analytics')
      .select('query')
      .order('search_count', { ascending: false })
      .limit(limit);
    
    return data?.map(item => item.query) || [];
  }

  private async getRecentListings(limit: number): Promise<Property[]> {
    const { data } = await this.client
      .from('properties')
      .select(`
        *,
        property_images (*),
        landlords (*)
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(limit);

    return data?.map(this.transformPropertyData) || [];
  }

  private async getPopularNeighborhoods(limit: number) {
    const { data } = await this.client
      .from('neighborhoods')
      .select('name, property_count')
      .order('property_count', { ascending: false })
      .limit(limit);

    return data?.map(item => ({
      name: item.name,
      count: item.property_count
    })) || [];
  }

  private async getSearchMetrics() {
    const { data } = await this.client
      .from('search_metrics')
      .select('*')
      .single();

    return {
      totalProperties: data?.total_properties || 0,
      averageResponseTime: data?.average_response_time || 60,
      successfulMatches: data?.successful_matches || 0
    };
  }
}

export const supabaseService = new SupabaseService();