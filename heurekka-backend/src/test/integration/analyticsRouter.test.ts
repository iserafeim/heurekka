import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { analyticsRouter } from '../../routers/analytics';
import { AnalyticsService } from '../../services/analytics.service';
import type { Context } from '../../server';

// Mock the services
vi.mock('../../services/analytics.service');
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

describe('Analytics Router Integration Tests', () => {
  let mockContext: Context;
  let mockAnalyticsService: any;

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

    // Setup mock analytics service
    mockAnalyticsService = {
      trackEvent: vi.fn(),
      trackPropertyView: vi.fn(),
      trackWhatsAppContact: vi.fn(),
      trackSearch: vi.fn(),
      trackFavorite: vi.fn(),
      trackMapInteraction: vi.fn(),
      getAnalytics: vi.fn(),
      getPropertyAnalytics: vi.fn(),
      getSearchAnalytics: vi.fn(),
      getConversionFunnel: vi.fn(),
      getRealTimeAnalytics: vi.fn(),
    };

    vi.mocked(AnalyticsService).mockImplementation(() => mockAnalyticsService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('trackEvent mutation', () => {
    const validEventInput = {
      eventName: 'button_click',
      properties: {
        buttonId: 'search-button',
        page: 'homepage'
      },
      sessionId: 'session-123',
      userId: 'user-456'
    };

    it('should track event successfully', async () => {
      mockAnalyticsService.trackEvent.mockResolvedValue(undefined);

      const caller = analyticsRouter.createCaller(mockContext);
      const result = await caller.trackEvent(validEventInput);

      expect(result).toEqual({ success: true });
      expect(mockAnalyticsService.trackEvent).toHaveBeenCalledWith({
        name: 'button_click',
        properties: {
          ...validEventInput.properties,
          ip_address: '192.168.1.1',
          user_agent: 'Mozilla/5.0 Test',
          referer: 'https://test.heurekka.com',
        },
        sessionId: 'session-123',
        userId: 'user-456',
        timestamp: expect.any(String)
      });
    });

    it('should validate event name length', async () => {
      const invalidInput = {
        eventName: '', // Invalid: empty string
        properties: {}
      };

      const caller = analyticsRouter.createCaller(mockContext);
      await expect(caller.trackEvent(invalidInput)).rejects.toThrow();
    });

    it('should handle tracking errors gracefully', async () => {
      mockAnalyticsService.trackEvent.mockRejectedValue(new Error('Tracking failed'));

      const caller = analyticsRouter.createCaller(mockContext);
      const result = await caller.trackEvent(validEventInput);

      expect(result).toEqual({ 
        success: false, 
        error: 'Failed to track event' 
      });
    });
  });

  describe('trackPropertyView mutation', () => {
    const validViewInput = {
      propertyId: '123e4567-e89b-12d3-a456-426614174000',
      source: 'lista' as const,
      userId: 'user-123',
      sessionId: 'session-456',
      searchQuery: 'apartamento centro',
      searchFilters: { priceMax: 20000 }
    };

    it('should track property view successfully', async () => {
      mockAnalyticsService.trackPropertyView.mockResolvedValue(undefined);

      const caller = analyticsRouter.createCaller(mockContext);
      const result = await caller.trackPropertyView(validViewInput);

      expect(result).toEqual({ success: true });
      expect(mockAnalyticsService.trackPropertyView).toHaveBeenCalledWith({
        propertyId: validViewInput.propertyId,
        source: 'lista',
        userId: 'user-123',
        sessionId: 'session-456',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0 Test',
        referrer: 'https://test.heurekka.com',
        searchQuery: 'apartamento centro',
        searchFilters: { priceMax: 20000 }
      });
    });

    it('should validate property ID format', async () => {
      const invalidInput = {
        ...validViewInput,
        propertyId: 'invalid-uuid'
      };

      const caller = analyticsRouter.createCaller(mockContext);
      await expect(caller.trackPropertyView(invalidInput)).rejects.toThrow();
    });

    it('should handle tracking errors gracefully', async () => {
      mockAnalyticsService.trackPropertyView.mockRejectedValue(new Error('Tracking failed'));

      const caller = analyticsRouter.createCaller(mockContext);
      const result = await caller.trackPropertyView(validViewInput);

      expect(result).toEqual({ 
        success: false, 
        error: 'Failed to track property view' 
      });
    });
  });

  describe('getAnalytics query', () => {
    const validAnalyticsInput = {
      startDate: '2024-01-01T00:00:00.000Z',
      endDate: '2024-01-31T23:59:59.999Z',
      eventType: 'property_view',
      limit: 100,
      offset: 0
    };

    const mockAnalyticsData = [
      {
        id: 'event-1',
        event_name: 'property_view',
        timestamp: '2024-01-15T10:30:00Z',
        properties: { property_id: 'prop-1' }
      }
    ];

    it('should get analytics data successfully', async () => {
      mockAnalyticsService.getAnalytics.mockResolvedValue(mockAnalyticsData);

      const caller = analyticsRouter.createCaller(mockContext);
      const result = await caller.getAnalytics(validAnalyticsInput);

      expect(result).toEqual(mockAnalyticsData);
      expect(mockAnalyticsService.getAnalytics).toHaveBeenCalledWith({
        startDate: new Date('2024-01-01T00:00:00.000Z'),
        endDate: new Date('2024-01-31T23:59:59.999Z'),
        propertyId: undefined,
        userId: undefined,
        eventType: 'property_view',
        limit: 100,
        offset: 0
      });
    });

    it('should validate date format', async () => {
      const invalidInput = {
        ...validAnalyticsInput,
        startDate: 'invalid-date'
      };

      const caller = analyticsRouter.createCaller(mockContext);
      await expect(caller.getAnalytics(invalidInput)).rejects.toThrow();
    });

    it('should validate limit range', async () => {
      const invalidInput = {
        ...validAnalyticsInput,
        limit: 2000 // Invalid: > 1000
      };

      const caller = analyticsRouter.createCaller(mockContext);
      await expect(caller.getAnalytics(invalidInput)).rejects.toThrow();
    });
  });

  describe('getPropertyAnalytics query', () => {
    const validPropertyAnalyticsInput = {
      propertyId: '123e4567-e89b-12d3-a456-426614174000',
      days: 30
    };

    const mockPropertyAnalytics = {
      propertyId: '123e4567-e89b-12d3-a456-426614174000',
      views: { total: 45, bySource: { lista: 30, mapa: 15 } },
      contacts: { total: 3, successful: 3 },
      favorites: { total: 8 }
    };

    it('should get property analytics successfully', async () => {
      mockAnalyticsService.getPropertyAnalytics.mockResolvedValue(mockPropertyAnalytics);

      const caller = analyticsRouter.createCaller(mockContext);
      const result = await caller.getPropertyAnalytics(validPropertyAnalyticsInput);

      expect(result).toEqual(mockPropertyAnalytics);
      expect(mockAnalyticsService.getPropertyAnalytics).toHaveBeenCalledWith(
        '123e4567-e89b-12d3-a456-426614174000',
        30
      );
    });

    it('should use default days when not provided', async () => {
      const inputWithoutDays = {
        propertyId: '123e4567-e89b-12d3-a456-426614174000'
      };

      mockAnalyticsService.getPropertyAnalytics.mockResolvedValue(mockPropertyAnalytics);

      const caller = analyticsRouter.createCaller(mockContext);
      await caller.getPropertyAnalytics(inputWithoutDays);

      expect(mockAnalyticsService.getPropertyAnalytics).toHaveBeenCalledWith(
        '123e4567-e89b-12d3-a456-426614174000',
        30 // default
      );
    });
  });

  describe('getRealTimeAnalytics query', () => {
    const mockRealTimeData = {
      timestamp: '2024-01-15T14:30:00Z',
      lastHour: {
        views: 12,
        searches: 8,
        contacts: 2
      },
      trends: {
        avgResultsPerSearch: '5.2',
        contactSuccessRate: '85.5'
      }
    };

    it('should get real-time analytics successfully', async () => {
      mockAnalyticsService.getRealTimeAnalytics.mockResolvedValue(mockRealTimeData);

      const caller = analyticsRouter.createCaller(mockContext);
      const result = await caller.getRealTimeAnalytics();

      expect(result).toEqual(mockRealTimeData);
      expect(mockAnalyticsService.getRealTimeAnalytics).toHaveBeenCalled();
    });

    it('should handle service errors', async () => {
      mockAnalyticsService.getRealTimeAnalytics.mockRejectedValue(new Error('Service error'));

      const caller = analyticsRouter.createCaller(mockContext);
      
      await expect(caller.getRealTimeAnalytics()).rejects.toThrow('Failed to get real-time analytics');
    });
  });
});