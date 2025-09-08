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
// SECURITY: Import security middleware
import {
  authenticateRequest,
  sanitizeSearchQuery,
  sanitizeInput,
  validateUUID,
  validateCoordinates,
  hashIP,
  hashUserAgent,
  sanitizeError
} from '../middleware/security';

const t = initTRPC.context<Context>().create();

// ============================================
// SECURITY: Secure Procedures
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

// Authenticated procedure with JWT validation
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

export const homepageRouter = t.router({
  // Get featured properties for homepage - SECURED
  getFeaturedProperties: publicProcedure
    .input(FeaturedPropertiesInputSchema)
    .query(async ({ input, ctx }) => {
      try {
        const { limit, location } = input;
        
        // SECURITY: Validate location coordinates
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

  // Search properties with filters - SECURED
  searchProperties: publicProcedure
    .input(PropertySearchInputSchema)
    .query(async ({ input, ctx }) => {
      try {
        // SECURITY: Sanitize search query
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
        
        // SECURITY: Validate location coordinates
        if (input.location && !validateCoordinates(input.location.lat, input.location.lng)) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Invalid location coordinates'
          });
        }
        
        // SECURITY: Validate and sanitize filters
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

  // Get search suggestions for autocomplete - SECURED
  getSearchSuggestions: publicProcedure
    .input(SearchSuggestionsInputSchema)
    .query(async ({ input, ctx }) => {
      try {
        const { query, location, limit } = input;
        
        // SECURITY: Sanitize query
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
        
        // SECURITY: Validate location
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

  // Get homepage data (combined endpoint for initial page load) - SECURED
  getHomepageData: publicProcedure
    .input(z.object({
      location: z.object({
        lat: z.number().min(-90).max(90),
        lng: z.number().min(-180).max(180)
      }).optional()
    }).optional())
    .query(async ({ input, ctx }) => {
      try {
        // SECURITY: Validate location coordinates
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

  // Track analytics events - SECURITY FIX: Remove PII exposure (now public for basic analytics)
  trackEvent: publicProcedure
    .input(AnalyticsEventSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        // SECURITY: Hash sensitive data instead of storing raw PII
        const hashIP = (ip: string): string => {
          if (!process.env.IP_SALT) {
            return 'unknown'; // Fallback if salt not configured
          }
          const crypto = require('crypto');
          return crypto.createHash('sha256')
            .update(ip + process.env.IP_SALT)
            .digest('hex')
            .substring(0, 16);
        };

        const hashUserAgent = (ua: string): string => {
          const crypto = require('crypto');
          return crypto.createHash('sha256')
            .update(ua)
            .digest('hex')
            .substring(0, 16);
        };

        // Add anonymized context to the event
        const eventWithContext = {
          ...input,
          properties: {
            ...input.properties,
            // Hash sensitive data to protect user privacy
            userAgentHash: ctx.req.headers['user-agent'] 
              ? hashUserAgent(ctx.req.headers['user-agent']) 
              : undefined,
            ipHash: (ctx.req.ip || ctx.req.connection.remoteAddress) 
              ? hashIP(ctx.req.ip || ctx.req.connection.remoteAddress || '') 
              : undefined,
            // Extract only domain from referer for privacy
            refererDomain: ctx.req.headers.referer 
              ? new URL(ctx.req.headers.referer).hostname 
              : undefined
          }
        };

        // Remove any remaining PII fields that might have been passed in
        if ('ip' in eventWithContext.properties) delete eventWithContext.properties.ip;
        if ('userAgent' in eventWithContext.properties) delete eventWithContext.properties.userAgent;
        if ('email' in eventWithContext.properties) delete eventWithContext.properties.email;
        if ('phone' in eventWithContext.properties) delete eventWithContext.properties.phone;

        // Track the event (fire and forget)
        supabaseService.trackAnalyticsEvent(eventWithContext).catch(error => {
          console.error('Analytics tracking error:', error);
        });

        return {
          success: true,
          message: 'Event tracked successfully'
        };
      } catch (error) {
        console.error('Error in trackEvent:', error);
        // Don't throw here - analytics failures shouldn't break user experience
        return {
          success: false,
          message: 'Analytics temporarily unavailable'
        };
      }
    }),

  // Save/unsave property - SECURED (requires JWT authentication)
  saveProperty: authenticatedProcedure
    .input(SavePropertySchema)
    .mutation(async ({ input, ctx }) => {
      try {
        // SECURITY: Validate property ID
        if (!validateUUID(input.propertyId)) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Invalid property ID'
          });
        }

        // Use authenticated user ID from JWT token
        await supabaseService.saveProperty(ctx.user.userId, input.propertyId);

        // Increment property view count (non-blocking)
        cacheService.incrementPropertyView(input.propertyId).catch(error => {
          console.error('View tracking error:', error);
        });

        return {
          success: true,
          message: 'Property saved successfully'
        };
      } catch (error) {
        throw sanitizeError(error);
      }
    }),

  // Create search profile - SECURED (requires JWT authentication)
  createSearchProfile: authenticatedProcedure
    .input(CreateSearchProfileSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        // SECURITY: Sanitize profile name
        input.name = sanitizeInput(input.name);
        
        // Validate name length
        if (input.name.length < 2 || input.name.length > 100) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Profile name must be between 2 and 100 characters'
          });
        }

        // SECURITY: Sanitize search query
        if (input.query.text) {
          input.query.text = sanitizeSearchQuery(input.query.text);
        }

        // Create profile with authenticated user
        const profileData = {
          ...input,
          id: `profile_${ctx.user.userId}_${Date.now()}`,
          userId: ctx.user.userId,
          createdAt: new Date().toISOString(),
          lastUsed: new Date().toISOString()
        };

        // Store profile (in production this would go to database)
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
          message: 'Search profile created successfully'
        };
      } catch (error) {
        throw sanitizeError(error);
      }
    }),

  // Get popular searches for quick suggestions - SECURED
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

  // Health check endpoint - SECURED (no sensitive information leaked)
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