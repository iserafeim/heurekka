import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AnalyticsService } from '../../services/analytics.service';
import type { PropertyViewEvent, PropertyContactEvent } from '../../types/property';

// Mock the supabase service entirely

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

describe('AnalyticsService', () => {
  let analyticsService: AnalyticsService;
  let mockClient: any;

  beforeEach(async () => {
    analyticsService = new AnalyticsService();
    vi.clearAllMocks();
    
    // Get the mocked service
    const { supabaseService } = await import('../../services/supabase');
    mockClient = supabaseService.instance.client;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('trackEvent', () => {
    it('should track generic analytics event successfully', async () => {
      const mockInsertQuery = {
        insert: vi.fn().mockResolvedValue({
          data: { id: 'event-1' },
          error: null
        })
      };

      mockClient.from.mockReturnValue(mockInsertQuery);

      const event = {
        name: 'custom_event',
        properties: {
          category: 'user_action',
          value: 'button_click',
          ip_address: '192.168.1.1',
          user_agent: 'Mozilla/5.0'
        },
        sessionId: 'session-123',
        userId: 'user-456',
        timestamp: '2024-01-15T10:30:00Z'
      };

      await analyticsService.trackEvent(event);

      expect(mockInsertQuery.insert).toHaveBeenCalledWith({
        event_name: 'custom_event',
        event_properties: event.properties,
        session_id: 'session-123',
        user_id: 'user-456',
        timestamp: '2024-01-15T10:30:00Z',
        ip_address: '192.168.1.1',
        user_agent: 'Mozilla/5.0',
      });
    });

    it('should handle tracking errors gracefully', async () => {
      const mockInsertQuery = {
        insert: vi.fn().mockRejectedValue(new Error('Database error'))
      };

      mockClient.from.mockReturnValue(mockInsertQuery);

      const event = {
        name: 'failing_event',
        properties: {},
        timestamp: '2024-01-15T10:30:00Z'
      };

      // Should not throw error
      await expect(analyticsService.trackEvent(event)).resolves.toBeUndefined();
    });
  });

  describe('trackPropertyView', () => {
    it('should track property view with all tracking mechanisms', async () => {
      const mockViewInsertQuery = {
        insert: vi.fn().mockResolvedValue({
          data: { id: 'view-1' },
          error: null
        })
      };

      const mockEventInsertQuery = {
        insert: vi.fn().mockResolvedValue({
          data: { id: 'event-1' },
          error: null
        })
      };

      mockClient.from
        .mockReturnValueOnce(mockViewInsertQuery)
        .mockReturnValueOnce(mockEventInsertQuery);

      mockClient.rpc.mockResolvedValue({ error: null });

      const viewEvent: PropertyViewEvent & { searchQuery?: string; searchFilters?: any } = {
        propertyId: '123e4567-e89b-12d3-a456-426614174000',
        source: 'lista',
        userId: 'user-123',
        sessionId: 'session-456',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        referrer: 'https://google.com',
        searchQuery: 'apartamento Tegucigalpa',
        searchFilters: { priceMax: 20000, bedrooms: [2] }
      };

      await analyticsService.trackPropertyView(viewEvent);

      // Verify property_views table insert
      expect(mockViewInsertQuery.insert).toHaveBeenCalledWith({
        property_id: viewEvent.propertyId,
        user_id: viewEvent.userId,
        session_id: viewEvent.sessionId,
        ip_address: viewEvent.ipAddress,
        user_agent: viewEvent.userAgent,
        referrer: viewEvent.referrer,
        source: viewEvent.source,
      });

      // Verify analytics_events table insert
      expect(mockEventInsertQuery.insert).toHaveBeenCalledWith({
        event_name: 'property_view',
        event_properties: {
          property_id: viewEvent.propertyId,
          source: viewEvent.source,
          search_query: viewEvent.searchQuery,
          search_filters: viewEvent.searchFilters,
          ip_address: viewEvent.ipAddress,
          user_agent: viewEvent.userAgent,
          referrer: viewEvent.referrer,
        },
        session_id: viewEvent.sessionId,
        user_id: viewEvent.userId,
        timestamp: expect.any(String),
        ip_address: viewEvent.ipAddress,
        user_agent: viewEvent.userAgent,
      });

      // Verify view count increment
      expect(mockClient.rpc).toHaveBeenCalledWith('increment_property_view_count', {
        p_property_id: viewEvent.propertyId
      });
    });

    it('should handle view tracking errors gracefully', async () => {
      const mockInsertQuery = {
        insert: vi.fn().mockRejectedValue(new Error('Insert failed'))
      };

      mockClient.from.mockReturnValue(mockInsertQuery);

      const viewEvent: PropertyViewEvent = {
        propertyId: '123e4567-e89b-12d3-a456-426614174000',
        source: 'lista'
      };

      // Should not throw error
      await expect(analyticsService.trackPropertyView(viewEvent))
        .resolves.toBeUndefined();
    });
  });

  describe('trackWhatsAppContact', () => {
    it('should track successful WhatsApp contact', async () => {
      const mockContactInsertQuery = {
        insert: vi.fn().mockResolvedValue({
          data: { id: 'contact-1' },
          error: null
        })
      };

      const mockEventInsertQuery = {
        insert: vi.fn().mockResolvedValue({
          data: { id: 'event-1' },
          error: null
        })
      };

      mockClient.from
        .mockReturnValueOnce(mockContactInsertQuery)
        .mockReturnValueOnce(mockEventInsertQuery);

      mockClient.rpc.mockResolvedValue({ error: null });

      const contactEvent = {
        propertyId: '123e4567-e89b-12d3-a456-426614174000',
        source: 'modal',
        contactMethod: 'whatsapp',
        userId: 'user-123',
        sessionId: 'session-456',
        phoneNumber: '+50499887766',
        messageGenerated: true,
        success: true,
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0'
      };

      await analyticsService.trackWhatsAppContact(contactEvent);

      // Verify property_contact_events table insert
      expect(mockContactInsertQuery.insert).toHaveBeenCalledWith({
        property_id: contactEvent.propertyId,
        user_id: contactEvent.userId,
        session_id: contactEvent.sessionId,
        contact_method: contactEvent.contactMethod,
        phone_number: contactEvent.phoneNumber,
        success: contactEvent.success,
        error_message: contactEvent.errorMessage,
      });

      // Verify analytics_events table insert
      expect(mockEventInsertQuery.insert).toHaveBeenCalledWith({
        event_name: 'whatsapp_contact',
        event_properties: {
          property_id: contactEvent.propertyId,
          source: contactEvent.source,
          contact_method: contactEvent.contactMethod,
          phone_number: contactEvent.phoneNumber,
          message_generated: contactEvent.messageGenerated,
          success: contactEvent.success,
          error_message: contactEvent.errorMessage,
          ip_address: contactEvent.ipAddress,
          user_agent: contactEvent.userAgent,
        },
        session_id: contactEvent.sessionId,
        user_id: contactEvent.userId,
        timestamp: expect.any(String),
        ip_address: contactEvent.ipAddress,
        user_agent: contactEvent.userAgent,
      });

      // Verify contact count increment for successful contact
      expect(mockClient.rpc).toHaveBeenCalledWith('increment_property_contact_count', {
        p_property_id: contactEvent.propertyId
      });
    });

    it('should not increment count for failed WhatsApp contact', async () => {
      const mockInsertQuery = {
        insert: vi.fn().mockResolvedValue({
          data: { id: 'contact-1' },
          error: null
        })
      };

      mockClient.from.mockReturnValue(mockInsertQuery);
      mockClient.rpc.mockResolvedValue({ error: null });

      const contactEvent = {
        propertyId: '123e4567-e89b-12d3-a456-426614174000',
        source: 'modal',
        contactMethod: 'whatsapp',
        messageGenerated: false,
        success: false,
        errorMessage: 'WhatsApp API unavailable',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0'
      };

      await analyticsService.trackWhatsAppContact(contactEvent);

      // Should not increment contact count
      expect(mockClient.rpc).not.toHaveBeenCalledWith('increment_property_contact_count',
        expect.any(Object));
    });
  });

  describe('trackSearch', () => {
    it('should track search event with all metadata', async () => {
      const mockSearchInsertQuery = {
        insert: vi.fn().mockResolvedValue({
          data: { id: 'search-1' },
          error: null
        })
      };

      const mockEventInsertQuery = {
        insert: vi.fn().mockResolvedValue({
          data: { id: 'event-1' },
          error: null
        })
      };

      mockClient.from
        .mockReturnValueOnce(mockSearchInsertQuery)
        .mockReturnValueOnce(mockEventInsertQuery);

      const searchEvent = {
        query: 'apartamento centro',
        filters: {
          priceMin: 10000,
          priceMax: 20000,
          bedrooms: [2, 3],
          propertyTypes: ['apartment']
        },
        location: { lat: 14.0723, lng: -87.2072 },
        bounds: {
          north: 14.1723,
          south: 13.9723,
          east: -87.1072,
          west: -87.3072
        },
        resultsCount: 15,
        searchDuration: 245,
        userId: 'user-123',
        sessionId: 'session-456',
        noResults: false,
        clickedResults: ['prop-1', 'prop-2'],
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0'
      };

      await analyticsService.trackSearch(searchEvent);

      // Verify search_analytics table insert
      expect(mockSearchInsertQuery.insert).toHaveBeenCalledWith({
        session_id: searchEvent.sessionId,
        user_id: searchEvent.userId,
        search_query: searchEvent.query,
        search_filters: searchEvent.filters,
        results_count: searchEvent.resultsCount,
        clicked_results: searchEvent.clickedResults,
        search_duration: searchEvent.searchDuration,
        no_results: searchEvent.noResults,
      });

      // Verify analytics_events table insert
      expect(mockEventInsertQuery.insert).toHaveBeenCalledWith({
        event_name: 'property_search',
        event_properties: {
          query: searchEvent.query,
          filters: searchEvent.filters,
          location: searchEvent.location,
          bounds: searchEvent.bounds,
          results_count: searchEvent.resultsCount,
          search_duration: searchEvent.searchDuration,
          no_results: searchEvent.noResults,
          clicked_results_count: 2,
          ip_address: searchEvent.ipAddress,
          user_agent: searchEvent.userAgent,
        },
        session_id: searchEvent.sessionId,
        user_id: searchEvent.userId,
        timestamp: expect.any(String),
        ip_address: searchEvent.ipAddress,
        user_agent: searchEvent.userAgent,
      });
    });

    it('should handle search tracking errors', async () => {
      const mockInsertQuery = {
        insert: vi.fn().mockRejectedValue(new Error('Insert failed'))
      };

      mockClient.from.mockReturnValue(mockInsertQuery);

      const searchEvent = {
        query: 'test query',
        filters: {},
        resultsCount: 0,
        searchDuration: 100,
        noResults: true,
        clickedResults: [],
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0'
      };

      // Should not throw error
      await expect(analyticsService.trackSearch(searchEvent))
        .resolves.toBeUndefined();
    });
  });

  describe('trackFavorite', () => {
    it('should track favorite add action', async () => {
      const mockInsertQuery = {
        insert: vi.fn().mockResolvedValue({
          data: { id: 'event-1' },
          error: null
        })
      };

      mockClient.from.mockReturnValue(mockInsertQuery);

      const favoriteEvent = {
        propertyId: '123e4567-e89b-12d3-a456-426614174000',
        action: 'add' as const,
        userId: 'user-123',
        sessionId: 'session-456',
        source: 'lista',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0'
      };

      await analyticsService.trackFavorite(favoriteEvent);

      expect(mockInsertQuery.insert).toHaveBeenCalledWith({
        event_name: 'property_favorite',
        event_properties: {
          property_id: favoriteEvent.propertyId,
          action: 'add',
          source: favoriteEvent.source,
          ip_address: favoriteEvent.ipAddress,
          user_agent: favoriteEvent.userAgent,
        },
        session_id: favoriteEvent.sessionId,
        user_id: favoriteEvent.userId,
        timestamp: expect.any(String),
        ip_address: favoriteEvent.ipAddress,
        user_agent: favoriteEvent.userAgent,
      });
    });

    it('should track favorite remove action', async () => {
      const mockInsertQuery = {
        insert: vi.fn().mockResolvedValue({
          data: { id: 'event-1' },
          error: null
        })
      };

      mockClient.from.mockReturnValue(mockInsertQuery);

      const favoriteEvent = {
        propertyId: '123e4567-e89b-12d3-a456-426614174000',
        action: 'remove' as const,
        userId: 'user-123',
        sessionId: 'session-456',
        source: 'modal',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0'
      };

      await analyticsService.trackFavorite(favoriteEvent);

      expect(mockInsertQuery.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          event_properties: expect.objectContaining({
            action: 'remove'
          })
        })
      );
    });
  });

  describe('trackMapInteraction', () => {
    it('should track zoom interaction', async () => {
      const mockInsertQuery = {
        insert: vi.fn().mockResolvedValue({
          data: { id: 'event-1' },
          error: null
        })
      };

      mockClient.from.mockReturnValue(mockInsertQuery);

      const mapEvent = {
        eventType: 'zoom_in',
        mapData: {
          zoom: 15,
          center: { lat: 14.0723, lng: -87.2072 },
          bounds: {
            north: 14.1723,
            south: 13.9723,
            east: -87.1072,
            west: -87.3072
          }
        },
        userId: 'user-123',
        sessionId: 'session-456',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0'
      };

      await analyticsService.trackMapInteraction(mapEvent);

      expect(mockInsertQuery.insert).toHaveBeenCalledWith({
        event_name: 'map_interaction',
        event_properties: {
          event_type: 'zoom_in',
          map_data: mapEvent.mapData,
          property_id: undefined,
          cluster_id: undefined,
          zoom_level: 15,
          center_lat: 14.0723,
          center_lng: -87.2072,
          ip_address: mapEvent.ipAddress,
          user_agent: mapEvent.userAgent,
        },
        session_id: mapEvent.sessionId,
        user_id: mapEvent.userId,
        timestamp: expect.any(String),
        ip_address: mapEvent.ipAddress,
        user_agent: mapEvent.userAgent,
      });
    });

    it('should track marker click with property ID', async () => {
      const mockInsertQuery = {
        insert: vi.fn().mockResolvedValue({
          data: { id: 'event-1' },
          error: null
        })
      };

      mockClient.from.mockReturnValue(mockInsertQuery);

      const mapEvent = {
        eventType: 'marker_click',
        mapData: {
          zoom: 16,
          center: { lat: 14.0723, lng: -87.2072 }
        },
        propertyId: '123e4567-e89b-12d3-a456-426614174000',
        userId: 'user-123',
        sessionId: 'session-456',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0'
      };

      await analyticsService.trackMapInteraction(mapEvent);

      expect(mockInsertQuery.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          event_properties: expect.objectContaining({
            event_type: 'marker_click',
            property_id: '123e4567-e89b-12d3-a456-426614174000'
          })
        })
      );
    });

    it('should track cluster click with cluster ID', async () => {
      const mockInsertQuery = {
        insert: vi.fn().mockResolvedValue({
          data: { id: 'event-1' },
          error: null
        })
      };

      mockClient.from.mockReturnValue(mockInsertQuery);

      const mapEvent = {
        eventType: 'cluster_click',
        mapData: {
          zoom: 12,
          center: { lat: 14.0723, lng: -87.2072 }
        },
        clusterId: 5,
        userId: 'user-123',
        sessionId: 'session-456',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0'
      };

      await analyticsService.trackMapInteraction(mapEvent);

      expect(mockInsertQuery.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          event_properties: expect.objectContaining({
            event_type: 'cluster_click',
            cluster_id: 5
          })
        })
      );
    });
  });

  describe('getAnalytics', () => {
    const mockAnalyticsOptions = {
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-31'),
      limit: 50,
      offset: 0
    };

    it('should get analytics with basic filters', async () => {
      const mockAnalyticsData = [
        {
          id: 'event-1',
          event_name: 'property_view',
          event_properties: { property_id: 'prop-1' },
          timestamp: '2024-01-15T10:30:00Z',
          user_id: 'user-123',
          session_id: 'session-456'
        }
      ];

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({
          data: mockAnalyticsData,
          error: null
        })
      };

      mockClient.from.mockReturnValue(mockQuery);

      const result = await analyticsService.getAnalytics(mockAnalyticsOptions);

      expect(mockQuery.select).toHaveBeenCalledWith('*');
      expect(mockQuery.gte).toHaveBeenCalledWith('timestamp', '2024-01-01T00:00:00.000Z');
      expect(mockQuery.lte).toHaveBeenCalledWith('timestamp', '2024-01-31T00:00:00.000Z');
      expect(mockQuery.order).toHaveBeenCalledWith('timestamp', { ascending: false });
      expect(mockQuery.range).toHaveBeenCalledWith(0, 49);
      expect(result).toEqual(mockAnalyticsData);
    });

    it('should filter by event type', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({
          data: [],
          error: null
        })
      };

      mockClient.from.mockReturnValue(mockQuery);

      await analyticsService.getAnalytics({
        ...mockAnalyticsOptions,
        eventType: 'property_view'
      });

      expect(mockQuery.eq).toHaveBeenCalledWith('event_name', 'property_view');
    });

    it('should filter by user ID', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({
          data: [],
          error: null
        })
      };

      mockClient.from.mockReturnValue(mockQuery);

      await analyticsService.getAnalytics({
        ...mockAnalyticsOptions,
        userId: 'user-123'
      });

      expect(mockQuery.eq).toHaveBeenCalledWith('user_id', 'user-123');
    });

    it('should filter by property ID', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        contains: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({
          data: [],
          error: null
        })
      };

      mockClient.from.mockReturnValue(mockQuery);

      await analyticsService.getAnalytics({
        ...mockAnalyticsOptions,
        propertyId: 'prop-123'
      });

      expect(mockQuery.contains).toHaveBeenCalledWith('event_properties', { property_id: 'prop-123' });
    });

    it('should handle analytics query errors', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Query failed', code: 'DATABASE_ERROR' }
        })
      };

      mockClient.from.mockReturnValue(mockQuery);

      await expect(analyticsService.getAnalytics(mockAnalyticsOptions))
        .rejects.toThrow();
    });
  });

  describe('getPropertyAnalytics', () => {
    const propertyId = '123e4567-e89b-12d3-a456-426614174000';

    it('should get comprehensive property analytics', async () => {
      // Mock data for different queries
      const mockViews = [
        { id: 1, property_id: propertyId, source: 'lista', viewed_at: '2024-01-15T10:30:00Z' },
        { id: 2, property_id: propertyId, source: 'mapa', viewed_at: '2024-01-16T14:20:00Z' }
      ];

      const mockContacts = [
        { id: 1, property_id: propertyId, contact_method: 'whatsapp', success: true, created_at: '2024-01-15T11:00:00Z' }
      ];

      const mockFavorites = [
        { id: 1, property_id: propertyId, created_at: '2024-01-15T12:00:00Z' }
      ];

      const mockSearches = [
        { id: 1, clicked_results: [propertyId], created_at: '2024-01-15T09:00:00Z' }
      ];

      const mockQueries = [
        { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), gte: vi.fn().mockResolvedValue({ data: mockViews, error: null }) },
        { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), gte: vi.fn().mockResolvedValue({ data: mockContacts, error: null }) },
        { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), gte: vi.fn().mockResolvedValue({ data: mockFavorites, error: null }) },
        { select: vi.fn().mockReturnThis(), contains: vi.fn().mockReturnThis(), gte: vi.fn().mockResolvedValue({ data: mockSearches, error: null }) }
      ];

      mockClient.from
        .mockReturnValueOnce(mockQueries[0])
        .mockReturnValueOnce(mockQueries[1])
        .mockReturnValueOnce(mockQueries[2])
        .mockReturnValueOnce(mockQueries[3]);

      const result = await analyticsService.getPropertyAnalytics(propertyId, 30);

      expect(result).toMatchObject({
        propertyId,
        period: {
          days: 30,
          startDate: expect.any(Date),
          endDate: expect.any(Date)
        },
        views: {
          total: 2,
          bySource: { lista: 1, mapa: 1 },
          byDay: expect.any(Object)
        },
        contacts: {
          total: 1,
          successful: 1,
          byMethod: { whatsapp: 1 },
          byDay: expect.any(Object)
        },
        favorites: {
          total: 1,
          byDay: expect.any(Object)
        },
        searchAppearances: {
          total: 1,
          byDay: expect.any(Object)
        },
        conversionRate: {
          viewToContact: '50.00',
          viewToFavorite: '50.00'
        }
      });
    });

    it('should handle zero data gracefully', async () => {
      const mockQueries = [
        { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), gte: vi.fn().mockResolvedValue({ data: [], error: null }) },
        { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), gte: vi.fn().mockResolvedValue({ data: [], error: null }) },
        { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), gte: vi.fn().mockResolvedValue({ data: [], error: null }) },
        { select: vi.fn().mockReturnThis(), contains: vi.fn().mockReturnThis(), gte: vi.fn().mockResolvedValue({ data: [], error: null }) }
      ];

      mockClient.from
        .mockReturnValueOnce(mockQueries[0])
        .mockReturnValueOnce(mockQueries[1])
        .mockReturnValueOnce(mockQueries[2])
        .mockReturnValueOnce(mockQueries[3]);

      const result = await analyticsService.getPropertyAnalytics(propertyId, 7);

      expect(result.views.total).toBe(0);
      expect(result.contacts.total).toBe(0);
      expect(result.favorites.total).toBe(0);
      expect(result.conversionRate.viewToContact).toBe('0.00');
    });
  });

  describe('getSearchAnalytics', () => {
    it('should get search analytics with insights', async () => {
      const mockSearchData = [
        {
          id: 1,
          search_query: 'apartamento',
          search_filters: { priceMax: 20000 },
          no_results: false,
          search_duration: 250,
          created_at: '2024-01-15T10:30:00Z'
        },
        {
          id: 2,
          search_query: 'casa',
          search_filters: { bedrooms: [3] },
          no_results: true,
          search_duration: 180,
          created_at: '2024-01-15T11:30:00Z'
        },
        {
          id: 3,
          search_query: 'apartamento',
          search_filters: { priceMax: 15000 },
          no_results: false,
          search_duration: 320,
          created_at: '2024-01-15T12:30:00Z'
        }
      ];

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({
          data: mockSearchData,
          error: null
        })
      };

      mockClient.from.mockReturnValue(mockQuery);

      const result = await analyticsService.getSearchAnalytics(7, 10);

      expect(result).toMatchObject({
        period: expect.any(Object),
        totalSearches: 3,
        uniqueQueries: 2,
        noResultsCount: 1,
        noResultsRate: '33.33',
        avgSearchDuration: 250,
        topQueries: [
          { query: 'apartamento', count: 2 },
          { query: 'casa', count: 1 }
        ],
        searchesByDay: expect.any(Object),
        popularFilters: expect.any(Object)
      });
    });

    it('should handle empty search data', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({
          data: [],
          error: null
        })
      };

      mockClient.from.mockReturnValue(mockQuery);

      const result = await analyticsService.getSearchAnalytics(7, 10);

      expect(result.totalSearches).toBe(0);
      expect(result.uniqueQueries).toBe(0);
      expect(result.topQueries).toEqual([]);
      expect(result.noResultsRate).toBe('NaN'); // Division by zero
    });
  });

  describe('getConversionFunnel', () => {
    it('should calculate conversion funnel correctly', async () => {
      const options = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31')
      };

      // Mock data for funnel calculations
      const mockSearches = [
        { session_id: 'session-1' },
        { session_id: 'session-2' },
        { session_id: 'session-3' }
      ];

      const mockViews = [
        { session_id: 'session-1', property_id: 'prop-1' },
        { session_id: 'session-2', property_id: 'prop-2' }
      ];

      const mockContacts = [
        { session_id: 'session-1', property_id: 'prop-1' }
      ];

      const mockFavorites = [
        { user_id: 'user-1', property_id: 'prop-2' }
      ];

      const mockQueries = [
        { select: vi.fn().mockReturnThis(), gte: vi.fn().mockReturnThis(), lte: vi.fn().mockReturnThis(), modify: vi.fn().mockReturnThis() },
        { select: vi.fn().mockReturnThis(), gte: vi.fn().mockReturnThis(), lte: vi.fn().mockReturnThis(), modify: vi.fn().mockReturnThis() },
        { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), gte: vi.fn().mockReturnThis(), lte: vi.fn().mockReturnThis(), modify: vi.fn().mockReturnThis() },
        { select: vi.fn().mockReturnThis(), gte: vi.fn().mockReturnThis(), lte: vi.fn().mockReturnThis(), modify: vi.fn().mockReturnThis() }
      ];

      mockQueries[0].modify.mockResolvedValue({ data: mockSearches, error: null });
      mockQueries[1].modify.mockResolvedValue({ data: mockViews, error: null });
      mockQueries[2].modify.mockResolvedValue({ data: mockContacts, error: null });
      mockQueries[3].modify.mockResolvedValue({ data: mockFavorites, error: null });

      mockClient.from
        .mockReturnValueOnce(mockQueries[0])
        .mockReturnValueOnce(mockQueries[1])
        .mockReturnValueOnce(mockQueries[2])
        .mockReturnValueOnce(mockQueries[3]);

      const result = await analyticsService.getConversionFunnel(options);

      expect(result).toMatchObject({
        period: options,
        funnel: [
          { stage: 'Search', count: 3, percentage: 100 },
          { stage: 'View Property', count: 2, percentage: '66.67' },
          { stage: 'Contact/Favorite', count: 2, percentage: '100.00' },
          { stage: 'WhatsApp Contact', count: 1, percentage: '50.00' }
        ],
        dropoffPoints: {
          searchToView: 1,
          viewToAction: 0
        }
      });
    });

    it('should handle funnel errors', async () => {
      const options = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31')
      };

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        modify: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Query failed' }
        })
      };

      mockClient.from.mockReturnValue(mockQuery);

      await expect(analyticsService.getConversionFunnel(options))
        .rejects.toThrow();
    });
  });

  describe('getRealTimeAnalytics', () => {
    it('should get real-time analytics data', async () => {
      const mockViews = [{ property_id: 'prop-1', viewed_at: new Date().toISOString() }];
      const mockSearches = [{ search_query: 'test', results_count: 5, created_at: new Date().toISOString() }];
      const mockContacts = [
        { property_id: 'prop-1', contact_method: 'whatsapp', success: true, created_at: new Date().toISOString() },
        { property_id: 'prop-2', contact_method: 'phone', success: false, created_at: new Date().toISOString() }
      ];

      const mockQueries = [
        { select: vi.fn().mockReturnThis(), gte: vi.fn().mockResolvedValue({ data: mockViews, error: null }) },
        { select: vi.fn().mockReturnThis(), gte: vi.fn().mockResolvedValue({ data: mockSearches, error: null }) },
        { select: vi.fn().mockReturnThis(), gte: vi.fn().mockResolvedValue({ data: mockContacts, error: null }) }
      ];

      mockClient.from
        .mockReturnValueOnce(mockQueries[0])
        .mockReturnValueOnce(mockQueries[1])
        .mockReturnValueOnce(mockQueries[2]);

      const result = await analyticsService.getRealTimeAnalytics();

      expect(result).toMatchObject({
        timestamp: expect.any(String),
        lastHour: {
          views: 1,
          searches: 1,
          contacts: 1,
          contactAttempts: 2
        },
        trends: {
          avgResultsPerSearch: '5.0',
          contactSuccessRate: '50.0'
        }
      });
    });

    it('should handle real-time analytics errors', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        gte: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Real-time query failed' }
        })
      };

      mockClient.from.mockReturnValue(mockQuery);

      await expect(analyticsService.getRealTimeAnalytics())
        .rejects.toThrow();
    });
  });

  describe('helper methods', () => {
    it('should group data by field correctly', async () => {
      const testData = [
        { source: 'lista', id: 1 },
        { source: 'mapa', id: 2 },
        { source: 'lista', id: 3 },
        { source: 'modal', id: 4 },
        { source: 'lista', id: 5 }
      ];

      // Access the private method through analytics service instance
      const service = new AnalyticsService();
      const result = (service as any).groupByField(testData, 'source');

      expect(result).toEqual({
        lista: 3,
        mapa: 1,
        modal: 1
      });
    });

    it('should group data by day correctly', async () => {
      const testData = [
        { created_at: '2024-01-15T10:30:00Z', id: 1 },
        { created_at: '2024-01-15T14:20:00Z', id: 2 },
        { created_at: '2024-01-16T09:15:00Z', id: 3 }
      ];

      const service = new AnalyticsService();
      const result = (service as any).groupByDay(testData, 'created_at');

      expect(result).toEqual({
        '2024-01-15': 2,
        '2024-01-16': 1
      });
    });

    it('should get query frequency correctly', async () => {
      const testSearches = [
        { search_query: 'apartamento' },
        { search_query: 'APARTAMENTO' }, // Should be normalized
        { search_query: 'casa' },
        { search_query: 'apartamento ' }, // Should handle whitespace
        { search_query: null } // Should handle null values
      ];

      const service = new AnalyticsService();
      const result = (service as any).getQueryFrequency(testSearches, 10);

      expect(result).toEqual([
        { query: 'apartamento', count: 3 },
        { query: 'casa', count: 1 }
      ]);
    });

    it('should analyze popular filters correctly', async () => {
      const testSearches = [
        {
          search_filters: {
            propertyTypes: ['apartment', 'house'],
            priceMin: 10000,
            priceMax: 20000,
            bedrooms: [2, 3]
          }
        },
        {
          search_filters: {
            propertyTypes: ['apartment'],
            priceMin: 5000,
            priceMax: 15000,
            bedrooms: [2]
          }
        }
      ];

      const service = new AnalyticsService();
      const result = (service as any).analyzePopularFilters(testSearches);

      expect(result.propertyTypes.apartment).toBe(2);
      expect(result.propertyTypes.house).toBe(1);
      expect(result.bedrooms['2']).toBe(2);
      expect(result.bedrooms['3']).toBe(1);
      expect(result.priceRanges['10000-20000']).toBe(1);
    });
  });
});