import { z } from 'zod';
import { initTRPC, TRPCError } from '@trpc/server';
import type { Context } from '../server';
import { AnalyticsService } from '../services/analytics.service';

const t = initTRPC.context<Context>().create();

// Input validation schemas
const trackEventSchema = z.object({
  eventName: z.string().min(1).max(100),
  properties: z.record(z.any()).default({}),
  sessionId: z.string().optional(),
  userId: z.string().optional(),
  timestamp: z.string().datetime().optional(),
});

const trackPropertyViewSchema = z.object({
  propertyId: z.string().uuid(),
  source: z.enum(['lista', 'mapa', 'modal', 'detalle', 'similar']).default('lista'),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  referrer: z.string().optional(),
  searchQuery: z.string().optional(),
  searchFilters: z.record(z.any()).optional(),
});

const trackWhatsAppContactSchema = z.object({
  propertyId: z.string().uuid(),
  source: z.enum(['modal', 'detalle', 'lista', 'similar']).default('modal'),
  contactMethod: z.enum(['whatsapp', 'phone', 'email']).default('whatsapp'),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  phoneNumber: z.string().optional(),
  messageGenerated: z.boolean().default(true),
  success: z.boolean().default(true),
  errorMessage: z.string().optional(),
});

const trackSearchSchema = z.object({
  query: z.string().optional(),
  filters: z.record(z.any()).default({}),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
  }).optional(),
  bounds: z.object({
    north: z.number(),
    south: z.number(),
    east: z.number(),
    west: z.number(),
  }).optional(),
  resultsCount: z.number().min(0),
  searchDuration: z.number().min(0), // in milliseconds
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  noResults: z.boolean().default(false),
  clickedResults: z.array(z.string().uuid()).default([]),
});

const trackFavoriteSchema = z.object({
  propertyId: z.string().uuid(),
  action: z.enum(['add', 'remove']),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  source: z.enum(['lista', 'mapa', 'modal', 'detalle']).default('lista'),
});

const trackMapInteractionSchema = z.object({
  eventType: z.enum([
    'zoom_in', 'zoom_out', 'pan', 'marker_click', 'cluster_click', 
    'bounds_change', 'fullscreen_toggle', 'layer_change'
  ]),
  mapData: z.object({
    zoom: z.number().min(1).max(20),
    center: z.object({ lat: z.number(), lng: z.number() }),
    bounds: z.object({
      north: z.number(),
      south: z.number(),
      east: z.number(),
      west: z.number(),
    }).optional(),
  }),
  propertyId: z.string().uuid().optional(), // for marker clicks
  clusterId: z.number().optional(), // for cluster clicks
  userId: z.string().optional(),
  sessionId: z.string().optional(),
});

const getAnalyticsSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  propertyId: z.string().uuid().optional(),
  userId: z.string().optional(),
  eventType: z.enum([
    'property_view', 'whatsapp_contact', 'search', 'favorite', 'map_interaction'
  ]).optional(),
  limit: z.number().min(1).max(1000).default(100),
  offset: z.number().min(0).default(0),
});

export const analyticsRouter = t.router({
  // Generic event tracking
  trackEvent: t.procedure
    .input(trackEventSchema)
    .mutation(async ({ input, ctx }) => {
      const analyticsService = new AnalyticsService();
      
      try {
        await analyticsService.trackEvent({
          name: input.eventName,
          properties: {
            ...input.properties,
            ip_address: ctx.req.ip,
            user_agent: ctx.req.get('user-agent'),
            referer: ctx.req.get('referer'),
          },
          sessionId: input.sessionId,
          userId: input.userId,
          timestamp: input.timestamp || new Date().toISOString(),
        });
        
        return { success: true };
      } catch (error) {
        console.error('Error tracking event:', error);
        // Don't throw error for analytics - just log and continue
        return { success: false, error: 'Failed to track event' };
      }
    }),

  // Track property views
  trackPropertyView: t.procedure
    .input(trackPropertyViewSchema)
    .mutation(async ({ input, ctx }) => {
      const analyticsService = new AnalyticsService();
      
      try {
        await analyticsService.trackPropertyView({
          propertyId: input.propertyId,
          source: input.source,
          userId: input.userId,
          sessionId: input.sessionId,
          ipAddress: ctx.req.ip,
          userAgent: ctx.req.get('user-agent'),
          referrer: input.referrer || ctx.req.get('referer'),
          searchQuery: input.searchQuery,
          searchFilters: input.searchFilters,
        });
        
        return { success: true };
      } catch (error) {
        console.error('Error tracking property view:', error);
        return { success: false, error: 'Failed to track property view' };
      }
    }),

  // Track WhatsApp contact events
  trackWhatsAppContact: t.procedure
    .input(trackWhatsAppContactSchema)
    .mutation(async ({ input, ctx }) => {
      const analyticsService = new AnalyticsService();
      
      try {
        await analyticsService.trackWhatsAppContact({
          propertyId: input.propertyId,
          source: input.source,
          contactMethod: input.contactMethod,
          userId: input.userId,
          sessionId: input.sessionId,
          phoneNumber: input.phoneNumber,
          messageGenerated: input.messageGenerated,
          success: input.success,
          errorMessage: input.errorMessage,
          ipAddress: ctx.req.ip,
          userAgent: ctx.req.get('user-agent'),
        });
        
        return { success: true };
      } catch (error) {
        console.error('Error tracking WhatsApp contact:', error);
        return { success: false, error: 'Failed to track WhatsApp contact' };
      }
    }),

  // Track search events
  trackSearch: t.procedure
    .input(trackSearchSchema)
    .mutation(async ({ input, ctx }) => {
      const analyticsService = new AnalyticsService();
      
      try {
        await analyticsService.trackSearch({
          query: input.query,
          filters: input.filters,
          location: input.location,
          bounds: input.bounds,
          resultsCount: input.resultsCount,
          searchDuration: input.searchDuration,
          userId: input.userId,
          sessionId: input.sessionId,
          noResults: input.noResults,
          clickedResults: input.clickedResults,
          ipAddress: ctx.req.ip,
          userAgent: ctx.req.get('user-agent'),
        });
        
        return { success: true };
      } catch (error) {
        console.error('Error tracking search:', error);
        return { success: false, error: 'Failed to track search' };
      }
    }),

  // Track favorite actions
  trackFavorite: t.procedure
    .input(trackFavoriteSchema)
    .mutation(async ({ input, ctx }) => {
      const analyticsService = new AnalyticsService();
      
      try {
        await analyticsService.trackFavorite({
          propertyId: input.propertyId,
          action: input.action,
          userId: input.userId,
          sessionId: input.sessionId,
          source: input.source,
          ipAddress: ctx.req.ip,
          userAgent: ctx.req.get('user-agent'),
        });
        
        return { success: true };
      } catch (error) {
        console.error('Error tracking favorite:', error);
        return { success: false, error: 'Failed to track favorite' };
      }
    }),

  // Track map interactions
  trackMapInteraction: t.procedure
    .input(trackMapInteractionSchema)
    .mutation(async ({ input, ctx }) => {
      const analyticsService = new AnalyticsService();
      
      try {
        await analyticsService.trackMapInteraction({
          eventType: input.eventType,
          mapData: input.mapData,
          propertyId: input.propertyId,
          clusterId: input.clusterId,
          userId: input.userId,
          sessionId: input.sessionId,
          ipAddress: ctx.req.ip,
          userAgent: ctx.req.get('user-agent'),
        });
        
        return { success: true };
      } catch (error) {
        console.error('Error tracking map interaction:', error);
        return { success: false, error: 'Failed to track map interaction' };
      }
    }),

  // Get analytics data (for dashboards)
  getAnalytics: t.procedure
    .input(getAnalyticsSchema)
    .query(async ({ input }) => {
      const analyticsService = new AnalyticsService();
      
      try {
        const analytics = await analyticsService.getAnalytics({
          startDate: new Date(input.startDate),
          endDate: new Date(input.endDate),
          propertyId: input.propertyId,
          userId: input.userId,
          eventType: input.eventType,
          limit: input.limit,
          offset: input.offset,
        });
        
        return analytics;
      } catch (error) {
        console.error('Error getting analytics:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get analytics data',
        });
      }
    }),

  // Get property analytics summary
  getPropertyAnalytics: t.procedure
    .input(z.object({
      propertyId: z.string().uuid(),
      days: z.number().min(1).max(365).default(30),
    }))
    .query(async ({ input }) => {
      const analyticsService = new AnalyticsService();
      
      try {
        const analytics = await analyticsService.getPropertyAnalytics(
          input.propertyId,
          input.days
        );
        
        return analytics;
      } catch (error) {
        console.error('Error getting property analytics:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get property analytics',
        });
      }
    }),

  // Get search analytics (popular queries, etc.)
  getSearchAnalytics: t.procedure
    .input(z.object({
      days: z.number().min(1).max(90).default(7),
      limit: z.number().min(1).max(100).default(20),
    }))
    .query(async ({ input }) => {
      const analyticsService = new AnalyticsService();
      
      try {
        const analytics = await analyticsService.getSearchAnalytics(
          input.days,
          input.limit
        );
        
        return analytics;
      } catch (error) {
        console.error('Error getting search analytics:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get search analytics',
        });
      }
    }),

  // Get conversion funnel data
  getConversionFunnel: t.procedure
    .input(z.object({
      startDate: z.string().datetime(),
      endDate: z.string().datetime(),
      propertyId: z.string().uuid().optional(),
    }))
    .query(async ({ input }) => {
      const analyticsService = new AnalyticsService();
      
      try {
        const funnel = await analyticsService.getConversionFunnel({
          startDate: new Date(input.startDate),
          endDate: new Date(input.endDate),
          propertyId: input.propertyId,
        });
        
        return funnel;
      } catch (error) {
        console.error('Error getting conversion funnel:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get conversion funnel',
        });
      }
    }),

  // Get real-time analytics
  getRealTimeAnalytics: t.procedure
    .query(async () => {
      const analyticsService = new AnalyticsService();
      
      try {
        const realtime = await analyticsService.getRealTimeAnalytics();
        return realtime;
      } catch (error) {
        console.error('Error getting real-time analytics:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get real-time analytics',
        });
      }
    }),
});

export type AnalyticsRouter = typeof analyticsRouter;