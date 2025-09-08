/**
 * Secure Homepage Router Implementation
 * This file demonstrates how to implement the homepage router with proper security measures
 */

import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import { supabaseService } from '../services/supabase';
import { searchEngine } from '../services/searchEngine';
import { cacheService } from '../services/cache';
import {
  SearchSuggestionsInputSchema,
  PropertySearchInputSchema,
  FeaturedPropertiesInputSchema,
  AnalyticsEventSchema,
  SavePropertySchema,
  CreateSearchProfileSchema,
} from '../schemas/homepage';
import type { Context } from '../server';
import {
  authenticateRequest,
  authorizeRole,
  sanitizeSearchQuery,
  sanitizeInput,
  validateUUID,
  hashIP,
  hashUserAgent,
  sanitizeError,
  rateLimiters
} from '../middleware/security';

const t = initTRPC.context<Context>().create();

// ============================================
// Secure Procedures
// ============================================

// Public procedure with rate limiting
const publicProcedure = t.procedure.use(async ({ ctx, next }) => {
  // Apply rate limiting based on IP
  const clientIP = ctx.req.ip || ctx.req.connection.remoteAddress || 'unknown';
  const isLimited = await cacheService.isRateLimited(`public:${clientIP}`, 100, 900);
  
  if (isLimited) {
    throw new TRPCError({
      code: 'TOO_MANY_REQUESTS',
      message: 'Rate limit exceeded'
    });
  }
  
  return next({ ctx });
});

// Authenticated procedure
const authenticatedProcedure = t.procedure.use(async ({ ctx, next }) => {
  try {
    const user = await authenticateRequest(ctx);
    
    // Check rate limit for authenticated user
    const isLimited = await cacheService.isRateLimited(`auth:${user.userId}`, 200, 900);
    
    if (isLimited) {
      throw new TRPCError({
        code: 'TOO_MANY_REQUESTS',
        message: 'Rate limit exceeded'
      });
    }
    
    return next({
      ctx: {
        ...ctx,
        user
      }
    });
  } catch (error) {
    throw sanitizeError(error);
  }
});

// Admin procedure
const adminProcedure = authenticatedProcedure.use(async ({ ctx, next }) => {
  authorizeRole(['admin'])(ctx.user);
  return next({ ctx });
});

export const secureHomepageRouter = t.router({
  // ============================================
  // Public Endpoints (with rate limiting)
  // ============================================
  
  getFeaturedProperties: publicProcedure
    .input(FeaturedPropertiesInputSchema)
    .query(async ({ input, ctx }) => {
      try {
        const { limit, location } = input;
        
        // Validate location if provided
        if (location && !validateCoordinates(location.lat, location.lng)) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Invalid location coordinates'
          });
        }
        
        // Generate secure cache key
        const cacheKey = location 
          ? `featured:${limit}_${cacheService.generateLocationHash(location)}`
          : `featured:${limit}_default`;

        // Try cache first
        const cached = await cacheService.getFeaturedProperties(cacheKey);
        if (cached) {
          return {
            success: true,
            data: cached,
            cached: true
          };
        }

        // Fetch from database with timeout
        const properties = await Promise.race([
          supabaseService.getFeaturedProperties(limit, location),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Database timeout')), 5000)
          )
        ]);
        
        // Cache the results
        await cacheService.setFeaturedProperties(cacheKey, properties);

        return {
          success: true,
          data: properties,
          cached: false
        };
      } catch (error) {
        throw sanitizeError(error);
      }
    }),

  searchProperties: publicProcedure
    .input(PropertySearchInputSchema)
    .query(async ({ input, ctx }) => {
      try {
        // Sanitize search query
        if (input.query) {
          input.query = sanitizeSearchQuery(input.query);
          
          // Validate query length
          if (input.query.length < 2 || input.query.length > 200) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Search query must be between 2 and 200 characters'
            });
          }
        }
        
        // Validate location
        if (input.location && !validateCoordinates(input.location.lat, input.location.lng)) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Invalid location coordinates'
          });
        }
        
        // Validate filters
        if (input.filters) {
          // Validate price range
          if (input.filters.priceMin && input.filters.priceMax) {
            if (input.filters.priceMin > input.filters.priceMax) {
              throw new TRPCError({
                code: 'BAD_REQUEST',
                message: 'Invalid price range'
              });
            }
          }
          
          // Sanitize amenities
          if (input.filters.amenities) {
            input.filters.amenities = input.filters.amenities.map(a => sanitizeInput(a));
          }
        }

        // Perform search with timeout
        const results = await Promise.race([
          searchEngine.searchProperties(input),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Search timeout')), 10000)
          )
        ]);

        return {
          success: true,
          data: results,
          timestamp: new Date().toISOString()
        };
      } catch (error) {
        throw sanitizeError(error);
      }
    }),

  getSearchSuggestions: publicProcedure
    .input(SearchSuggestionsInputSchema)
    .query(async ({ input, ctx }) => {
      try {
        const { query, location, limit } = input;
        
        // Sanitize query
        const sanitizedQuery = sanitizeSearchQuery(query);
        
        // Validate query length
        if (sanitizedQuery.length < 1 || sanitizedQuery.length > 100) {
          return {
            success: false,
            data: [],
            query: sanitizedQuery,
            error: 'Invalid query length'
          };
        }
        
        // Validate location
        if (location && !validateCoordinates(location.lat, location.lng)) {
          return {
            success: false,
            data: [],
            query: sanitizedQuery,
            error: 'Invalid location'
          };
        }

        // Get suggestions with timeout
        const suggestions = await Promise.race([
          searchEngine.getSuggestions(sanitizedQuery, location, limit),
          new Promise<any[]>((resolve) => 
            setTimeout(() => resolve([]), 3000) // Return empty on timeout
          )
        ]);

        return {
          success: true,
          data: suggestions,
          query: sanitizedQuery,
          timestamp: new Date().toISOString()
        };
      } catch (error) {
        // Don't break UI on suggestion errors
        console.error('Suggestion error:', error);
        return {
          success: false,
          data: [],
          query: input.query,
          error: 'Suggestions temporarily unavailable'
        };
      }
    }),

  getHomepageData: publicProcedure
    .input(z.object({
      location: z.object({
        lat: z.number().min(-90).max(90),
        lng: z.number().min(-180).max(180)
      }).optional()
    }).optional())
    .query(async ({ input, ctx }) => {
      try {
        // Validate location
        if (input?.location && !validateCoordinates(input.location.lat, input.location.lng)) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Invalid location coordinates'
          });
        }
        
        // Try cache first
        const cached = await cacheService.getHomepageData();
        if (cached) {
          return {
            success: true,
            data: cached,
            cached: true,
            timestamp: new Date().toISOString()
          };
        }

        // Fetch with timeout
        const homepageData = await Promise.race([
          supabaseService.getHomepageData(),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Database timeout')), 8000)
          )
        ]);
        
        // Cache the results
        await cacheService.setHomepageData(homepageData);

        return {
          success: true,
          data: homepageData,
          cached: false,
          timestamp: new Date().toISOString()
        };
      } catch (error) {
        throw sanitizeError(error);
      }
    }),

  getPopularSearches: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(20).default(10)
    }).optional())
    .query(async ({ input }) => {
      try {
        const limit = input?.limit || 10;
        
        // Get from cache
        const cached = await cacheService.getPopularSearches();
        if (cached) {
          return {
            success: true,
            data: cached.slice(0, limit),
            cached: true
          };
        }

        // Return safe defaults
        const defaultSearches = [
          'apartment tegucigalpa',
          'house colonia palmira',
          'furnished apartment',
          '2 bedroom apartment',
          'parking included'
        ];

        await cacheService.setPopularSearches(defaultSearches);

        return {
          success: true,
          data: defaultSearches.slice(0, limit),
          cached: false
        };
      } catch (error) {
        // Don't fail on popular searches error
        return {
          success: false,
          data: [],
          error: 'Popular searches unavailable'
        };
      }
    }),

  // ============================================
  // Authenticated Endpoints
  // ============================================

  trackEvent: authenticatedProcedure
    .input(AnalyticsEventSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        // Sanitize and anonymize event properties
        const eventWithContext = {
          ...input,
          properties: {
            ...input.properties,
            // Hash sensitive data
            userAgentHash: ctx.req.headers['user-agent'] 
              ? hashUserAgent(ctx.req.headers['user-agent']) 
              : undefined,
            ipHash: ctx.req.ip ? hashIP(ctx.req.ip) : undefined,
            // Extract only domain from referer
            refererDomain: ctx.req.headers.referer 
              ? new URL(ctx.req.headers.referer).hostname 
              : undefined,
            // Add user context
            userId: ctx.user.userId
          }
        };

        // Remove any PII from properties
        if ('ip' in eventWithContext.properties) delete eventWithContext.properties.ip;
        if ('userAgent' in eventWithContext.properties) delete eventWithContext.properties.userAgent;
        if ('email' in eventWithContext.properties) delete eventWithContext.properties.email;

        // Track event (non-blocking)
        supabaseService.trackAnalyticsEvent(eventWithContext).catch(error => {
          console.error('Analytics tracking error:', error);
        });

        return {
          success: true,
          message: 'Event tracked'
        };
      } catch (error) {
        // Don't fail on analytics errors
        console.error('Analytics error:', error);
        return {
          success: false,
          message: 'Analytics unavailable'
        };
      }
    }),

  saveProperty: authenticatedProcedure
    .input(SavePropertySchema)
    .mutation(async ({ input, ctx }) => {
      try {
        // Validate property ID
        if (!validateUUID(input.propertyId)) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Invalid property ID'
          });
        }

        // Check if user can save this property (e.g., not their own listing)
        const canSave = await authorizePropertyAction(
          ctx.user.userId,
          input.propertyId,
          'save'
        );

        if (!canSave) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Cannot save this property'
          });
        }

        // Save property
        await supabaseService.saveProperty(ctx.user.userId, input.propertyId);

        // Track view (non-blocking)
        cacheService.incrementPropertyView(input.propertyId).catch(error => {
          console.error('View tracking error:', error);
        });

        return {
          success: true,
          message: 'Property saved'
        };
      } catch (error) {
        throw sanitizeError(error);
      }
    }),

  createSearchProfile: authenticatedProcedure
    .input(CreateSearchProfileSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        // Sanitize profile name
        input.name = sanitizeInput(input.name);
        
        // Validate name length
        if (input.name.length < 2 || input.name.length > 100) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Profile name must be between 2 and 100 characters'
          });
        }

        // Sanitize search query
        if (input.query.text) {
          input.query.text = sanitizeSearchQuery(input.query.text);
        }

        // Create profile
        const profileData = {
          ...input,
          id: `profile_${ctx.user.userId}_${Date.now()}`,
          userId: ctx.user.userId,
          createdAt: new Date().toISOString(),
          lastUsed: new Date().toISOString()
        };

        // Store profile (would go to database in production)
        await cacheService.setUserSession(
          `profile:${ctx.user.userId}:${profileData.id}`,
          profileData,
          86400 * 30 // 30 days
        );

        // Track profile creation (non-blocking)
        supabaseService.trackAnalyticsEvent({
          name: 'search_profile_created',
          properties: {
            profileName: input.name,
            hasLocation: !!input.query.location,
            hasFilters: !!input.query.filters && Object.keys(input.query.filters).length > 0,
            userId: ctx.user.userId
          },
          timestamp: Date.now(),
          sessionId: ctx.user.userId,
        }).catch(error => {
          console.error('Analytics error:', error);
        });

        return {
          success: true,
          data: profileData,
          message: 'Search profile created'
        };
      } catch (error) {
        throw sanitizeError(error);
      }
    }),

  // ============================================
  // Health Check (Public)
  // ============================================

  healthCheck: t.procedure
    .query(async () => {
      try {
        const [cacheHealth, searchEngineHealth] = await Promise.all([
          cacheService.healthCheck(),
          searchEngine.healthCheck()
        ]);

        const overallStatus = 
          cacheHealth.status === 'healthy' && 
          searchEngineHealth.status === 'healthy' 
            ? 'healthy' 
            : 'degraded';

        return {
          status: overallStatus,
          timestamp: new Date().toISOString(),
          services: {
            cache: cacheHealth,
            searchEngine: searchEngineHealth
          }
        };
      } catch (error) {
        return {
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          error: 'Service health check failed'
        };
      }
    })
});

// ============================================
// Helper Functions
// ============================================

async function authorizePropertyAction(
  userId: string,
  propertyId: string,
  action: string
): Promise<boolean> {
  // Check if user can perform action on property
  // This would query the database to check:
  // - Property exists
  // - User is not the owner (can't save own property)
  // - Property is active
  // etc.
  
  // Placeholder implementation
  return true;
}

async function validateCoordinates(lat: number, lng: number): Promise<boolean> {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}