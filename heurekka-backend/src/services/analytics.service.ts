import { supabaseService } from './supabase';
import type {
  PropertyViewEvent,
  PropertyContactEvent,
  MapBounds,
  Coordinates,
} from '../types/property';

interface AnalyticsEvent {
  name: string;
  properties: Record<string, any>;
  sessionId?: string;
  userId?: string;
  timestamp: string;
}

interface SearchEvent {
  query?: string;
  filters: Record<string, any>;
  location?: Coordinates;
  bounds?: MapBounds;
  resultsCount: number;
  searchDuration: number;
  userId?: string;
  sessionId?: string;
  noResults: boolean;
  clickedResults: string[];
  ipAddress?: string;
  userAgent?: string;
}

interface FavoriteEvent {
  propertyId: string;
  action: 'add' | 'remove';
  userId?: string;
  sessionId?: string;
  source: string;
  ipAddress?: string;
  userAgent?: string;
}

interface MapInteractionEvent {
  eventType: string;
  mapData: {
    zoom: number;
    center: Coordinates;
    bounds?: MapBounds;
  };
  propertyId?: string;
  clusterId?: number;
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
}

interface WhatsAppContactEvent {
  propertyId: string;
  source: string;
  contactMethod: string;
  userId?: string;
  sessionId?: string;
  phoneNumber?: string;
  messageGenerated: boolean;
  success: boolean;
  errorMessage?: string;
  ipAddress?: string;
  userAgent?: string;
}

export class AnalyticsService {

  /**
   * Track generic analytics event
   */
  async trackEvent(event: AnalyticsEvent): Promise<void> {
    try {
      await supabaseService.instance.client
        .from('analytics_events')
        .insert({
          event_name: event.name,
          event_properties: event.properties,
          session_id: event.sessionId,
          user_id: event.userId,
          timestamp: event.timestamp,
          ip_address: event.properties.ip_address,
          user_agent: event.properties.user_agent,
        });
    } catch (error) {
      console.error('Error tracking analytics event:', error);
      // Don't throw - analytics failures shouldn't break the app
    }
  }

  /**
   * Track property view event
   */
  async trackPropertyView(event: PropertyViewEvent & {
    searchQuery?: string;
    searchFilters?: any;
  }): Promise<void> {
    try {
      // Insert into property_views table
      await supabaseService.instance.client
        .from('property_views')
        .insert({
          property_id: event.propertyId,
          user_id: event.userId || null,
          session_id: event.sessionId || null,
          ip_address: event.ipAddress,
          user_agent: event.userAgent,
          referrer: event.referrer,
          source: event.source,
        });

      // Also track as generic analytics event
      await this.trackEvent({
        name: 'property_view',
        properties: {
          property_id: event.propertyId,
          source: event.source,
          search_query: event.searchQuery,
          search_filters: event.searchFilters,
          ip_address: event.ipAddress,
          user_agent: event.userAgent,
          referrer: event.referrer,
        },
        sessionId: event.sessionId,
        userId: event.userId,
        timestamp: new Date().toISOString(),
      });

      // Increment property view count
      await supabaseService.instance.client
        .rpc('increment_property_view_count', { p_property_id: event.propertyId });

    } catch (error) {
      console.error('Error tracking property view:', error);
    }
  }

  /**
   * Track WhatsApp contact event
   */
  async trackWhatsAppContact(event: WhatsAppContactEvent): Promise<void> {
    try {
      // Insert into property_contact_events table
      await supabaseService.instance.client
        .from('property_contact_events')
        .insert({
          property_id: event.propertyId,
          user_id: event.userId || null,
          session_id: event.sessionId || null,
          contact_method: event.contactMethod,
          phone_number: event.phoneNumber,
          success: event.success,
          error_message: event.errorMessage,
        });

      // Track as generic analytics event
      await this.trackEvent({
        name: 'whatsapp_contact',
        properties: {
          property_id: event.propertyId,
          source: event.source,
          contact_method: event.contactMethod,
          phone_number: event.phoneNumber,
          message_generated: event.messageGenerated,
          success: event.success,
          error_message: event.errorMessage,
          ip_address: event.ipAddress,
          user_agent: event.userAgent,
        },
        sessionId: event.sessionId,
        userId: event.userId,
        timestamp: new Date().toISOString(),
      });

      // Increment contact count if successful
      if (event.success) {
        await supabaseService.instance.client
          .rpc('increment_property_contact_count', { p_property_id: event.propertyId });
      }

    } catch (error) {
      console.error('Error tracking WhatsApp contact:', error);
    }
  }

  /**
   * Track search event
   */
  async trackSearch(event: SearchEvent): Promise<void> {
    try {
      // Insert into search_analytics table
      await supabaseService.instance.client
        .from('search_analytics')
        .insert({
          session_id: event.sessionId,
          user_id: event.userId,
          search_query: event.query,
          search_filters: event.filters,
          results_count: event.resultsCount,
          clicked_results: event.clickedResults,
          search_duration: event.searchDuration,
          no_results: event.noResults,
        });

      // Track as generic analytics event
      await this.trackEvent({
        name: 'property_search',
        properties: {
          query: event.query,
          filters: event.filters,
          location: event.location,
          bounds: event.bounds,
          results_count: event.resultsCount,
          search_duration: event.searchDuration,
          no_results: event.noResults,
          clicked_results_count: event.clickedResults.length,
          ip_address: event.ipAddress,
          user_agent: event.userAgent,
        },
        sessionId: event.sessionId,
        userId: event.userId,
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      console.error('Error tracking search:', error);
    }
  }

  /**
   * Track favorite action
   */
  async trackFavorite(event: FavoriteEvent): Promise<void> {
    try {
      await this.trackEvent({
        name: 'property_favorite',
        properties: {
          property_id: event.propertyId,
          action: event.action,
          source: event.source,
          ip_address: event.ipAddress,
          user_agent: event.userAgent,
        },
        sessionId: event.sessionId,
        userId: event.userId,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error tracking favorite:', error);
    }
  }

  /**
   * Track map interaction
   */
  async trackMapInteraction(event: MapInteractionEvent): Promise<void> {
    try {
      await this.trackEvent({
        name: 'map_interaction',
        properties: {
          event_type: event.eventType,
          map_data: event.mapData,
          property_id: event.propertyId,
          cluster_id: event.clusterId,
          zoom_level: event.mapData.zoom,
          center_lat: event.mapData.center.lat,
          center_lng: event.mapData.center.lng,
          ip_address: event.ipAddress,
          user_agent: event.userAgent,
        },
        sessionId: event.sessionId,
        userId: event.userId,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error tracking map interaction:', error);
    }
  }

  /**
   * Get analytics data for dashboards
   */
  async getAnalytics(options: {
    startDate: Date;
    endDate: Date;
    propertyId?: string;
    userId?: string;
    eventType?: string;
    limit: number;
    offset: number;
  }): Promise<any[]> {
    try {
      let query = supabaseService.instance.client
        .from('analytics_events')
        .select('*')
        .gte('timestamp', options.startDate.toISOString())
        .lte('timestamp', options.endDate.toISOString())
        .order('timestamp', { ascending: false })
        .range(options.offset, options.offset + options.limit - 1);

      if (options.eventType) {
        query = query.eq('event_name', options.eventType);
      }

      if (options.userId) {
        query = query.eq('user_id', options.userId);
      }

      if (options.propertyId) {
        query = query.contains('event_properties', { property_id: options.propertyId });
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data || [];

    } catch (error) {
      console.error('Error getting analytics:', error);
      throw error;
    }
  }

  /**
   * Get property-specific analytics
   */
  async getPropertyAnalytics(propertyId: string, days: number): Promise<any> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const [views, contacts, favorites, searches] = await Promise.all([
        // Property views
        supabaseService.instance.client
          .from('property_views')
          .select('*')
          .eq('property_id', propertyId)
          .gte('viewed_at', startDate.toISOString()),

        // Contact events
        supabaseService.instance.client
          .from('property_contact_events')
          .select('*')
          .eq('property_id', propertyId)
          .gte('created_at', startDate.toISOString()),

        // Favorites
        supabaseService.instance.client
          .from('property_favorites')
          .select('*')
          .eq('property_id', propertyId)
          .gte('created_at', startDate.toISOString()),

        // Search appearances
        supabaseService.instance.client
          .from('search_analytics')
          .select('*')
          .contains('clicked_results', [propertyId])
          .gte('created_at', startDate.toISOString()),
      ]);

      return {
        propertyId,
        period: { days, startDate, endDate: new Date() },
        views: {
          total: views.data?.length || 0,
          bySource: this.groupByField(views.data || [], 'source'),
          byDay: this.groupByDay(views.data || [], 'viewed_at'),
        },
        contacts: {
          total: contacts.data?.length || 0,
          successful: contacts.data?.filter(c => c.success).length || 0,
          byMethod: this.groupByField(contacts.data || [], 'contact_method'),
          byDay: this.groupByDay(contacts.data || [], 'created_at'),
        },
        favorites: {
          total: favorites.data?.length || 0,
          byDay: this.groupByDay(favorites.data || [], 'created_at'),
        },
        searchAppearances: {
          total: searches.data?.length || 0,
          byDay: this.groupByDay(searches.data || [], 'created_at'),
        },
        conversionRate: {
          viewToContact: contacts.data?.length && views.data?.length
            ? ((contacts.data.length / views.data.length) * 100).toFixed(2)
            : '0.00',
          viewToFavorite: favorites.data?.length && views.data?.length
            ? ((favorites.data.length / views.data.length) * 100).toFixed(2)
            : '0.00',
        },
      };

    } catch (error) {
      console.error('Error getting property analytics:', error);
      throw error;
    }
  }

  /**
   * Get search analytics
   */
  async getSearchAnalytics(days: number, limit: number): Promise<any> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data: searches, error } = await supabaseService.instance.client
        .from('search_analytics')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(1000); // Get raw data first

      if (error) {
        throw error;
      }

      const searchData = searches || [];

      // Analyze search patterns
      const queryFrequency = this.getQueryFrequency(searchData, limit);
      const noResultsQueries = searchData.filter(s => s.no_results);
      const avgSearchDuration = searchData.reduce((sum, s) => sum + (s.search_duration || 0), 0) / searchData.length;

      return {
        period: { days, startDate, endDate: new Date() },
        totalSearches: searchData.length,
        uniqueQueries: new Set(searchData.map(s => s.search_query).filter(Boolean)).size,
        noResultsCount: noResultsQueries.length,
        noResultsRate: ((noResultsQueries.length / searchData.length) * 100).toFixed(2),
        avgSearchDuration: Math.round(avgSearchDuration),
        topQueries: queryFrequency,
        searchesByDay: this.groupByDay(searchData, 'created_at'),
        popularFilters: this.analyzePopularFilters(searchData),
      };

    } catch (error) {
      console.error('Error getting search analytics:', error);
      throw error;
    }
  }

  /**
   * Get conversion funnel data
   */
  async getConversionFunnel(options: {
    startDate: Date;
    endDate: Date;
    propertyId?: string;
  }): Promise<any> {
    try {
      const { startDate, endDate, propertyId } = options;

      // Get funnel data
      const [searches, views, contacts, favorites] = await Promise.all([
        // Searches
        supabaseService.instance.client
          .from('search_analytics')
          .select('session_id')
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString()),

        // Property views
        supabaseService.instance.client
          .from('property_views')
          .select('session_id, property_id')
          .gte('viewed_at', startDate.toISOString())
          .lte('viewed_at', endDate.toISOString())
          .modify(query => propertyId ? query.eq('property_id', propertyId) : query),

        // Contacts
        supabaseService.instance.client
          .from('property_contact_events')
          .select('session_id, property_id')
          .eq('success', true)
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString())
          .modify(query => propertyId ? query.eq('property_id', propertyId) : query),

        // Favorites
        supabaseService.instance.client
          .from('property_favorites')
          .select('user_id, property_id')
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString())
          .modify(query => propertyId ? query.eq('property_id', propertyId) : query),
      ]);

      const uniqueSearchSessions = new Set((searches.data || []).map(s => s.session_id).filter(Boolean)).size;
      const uniqueViewSessions = new Set((views.data || []).map(v => v.session_id).filter(Boolean)).size;
      const uniqueContactSessions = new Set((contacts.data || []).map(c => c.session_id).filter(Boolean)).size;
      const uniqueFavorites = favorites.data?.length || 0;

      return {
        period: { startDate, endDate },
        propertyId,
        funnel: [
          {
            stage: 'Search',
            count: uniqueSearchSessions,
            percentage: 100,
          },
          {
            stage: 'View Property',
            count: uniqueViewSessions,
            percentage: uniqueSearchSessions ? ((uniqueViewSessions / uniqueSearchSessions) * 100).toFixed(2) : 0,
          },
          {
            stage: 'Contact/Favorite',
            count: uniqueContactSessions + uniqueFavorites,
            percentage: uniqueViewSessions ? (((uniqueContactSessions + uniqueFavorites) / uniqueViewSessions) * 100).toFixed(2) : 0,
          },
          {
            stage: 'WhatsApp Contact',
            count: uniqueContactSessions,
            percentage: uniqueViewSessions ? ((uniqueContactSessions / uniqueViewSessions) * 100).toFixed(2) : 0,
          },
        ],
        dropoffPoints: {
          searchToView: uniqueSearchSessions - uniqueViewSessions,
          viewToAction: uniqueViewSessions - (uniqueContactSessions + uniqueFavorites),
        },
      };

    } catch (error) {
      console.error('Error getting conversion funnel:', error);
      throw error;
    }
  }

  /**
   * Get real-time analytics
   */
  async getRealTimeAnalytics(): Promise<any> {
    try {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      const [recentViews, recentSearches, recentContacts] = await Promise.all([
        // Recent views
        supabaseService.instance.client
          .from('property_views')
          .select('property_id, viewed_at')
          .gte('viewed_at', oneHourAgo.toISOString()),

        // Recent searches
        supabaseService.instance.client
          .from('search_analytics')
          .select('search_query, results_count, created_at')
          .gte('created_at', oneHourAgo.toISOString()),

        // Recent contacts
        supabaseService.instance.client
          .from('property_contact_events')
          .select('property_id, contact_method, success, created_at')
          .gte('created_at', oneHourAgo.toISOString()),
      ]);

      return {
        timestamp: now.toISOString(),
        lastHour: {
          views: recentViews.data?.length || 0,
          searches: recentSearches.data?.length || 0,
          contacts: recentContacts.data?.filter(c => c.success).length || 0,
          contactAttempts: recentContacts.data?.length || 0,
        },
        trends: {
          avgResultsPerSearch: recentSearches.data?.length
            ? (recentSearches.data.reduce((sum, s) => sum + (s.results_count || 0), 0) / recentSearches.data.length).toFixed(1)
            : '0',
          contactSuccessRate: recentContacts.data?.length
            ? ((recentContacts.data.filter(c => c.success).length / recentContacts.data.length) * 100).toFixed(1)
            : '0',
        },
      };

    } catch (error) {
      console.error('Error getting real-time analytics:', error);
      throw error;
    }
  }

  // Helper methods for data analysis

  private groupByField(data: any[], field: string): Record<string, number> {
    return data.reduce((acc, item) => {
      const key = item[field] || 'unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }

  private groupByDay(data: any[], dateField: string): Record<string, number> {
    return data.reduce((acc, item) => {
      const date = new Date(item[dateField]);
      const day = date.toISOString().split('T')[0];
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {});
  }

  private getQueryFrequency(searches: any[], limit: number): Array<{ query: string; count: number }> {
    const frequency = searches.reduce((acc, search) => {
      const query = search.search_query?.toLowerCase().trim();
      if (query) {
        acc[query] = (acc[query] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(frequency)
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  private analyzePopularFilters(searches: any[]): Record<string, any> {
    const filterAnalysis: Record<string, Record<string, number>> = {
      propertyTypes: {},
      priceRanges: {},
      bedrooms: {},
    };

    searches.forEach(search => {
      const filters = search.search_filters || {};
      
      // Property types
      if (filters.propertyTypes?.length) {
        filters.propertyTypes.forEach((type: string) => {
          filterAnalysis.propertyTypes[type] = (filterAnalysis.propertyTypes[type] || 0) + 1;
        });
      }
      
      // Price ranges
      if (filters.priceMin || filters.priceMax) {
        const range = `${filters.priceMin || 0}-${filters.priceMax || 100000}`;
        filterAnalysis.priceRanges[range] = (filterAnalysis.priceRanges[range] || 0) + 1;
      }
      
      // Bedrooms
      if (filters.bedrooms?.length) {
        filters.bedrooms.forEach((bed: number) => {
          filterAnalysis.bedrooms[bed] = (filterAnalysis.bedrooms[bed] || 0) + 1;
        });
      }
    });

    return filterAnalysis;
  }
}