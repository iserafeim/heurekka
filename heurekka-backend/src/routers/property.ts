import { z } from 'zod';
import { initTRPC, TRPCError } from '@trpc/server';
import type { Context } from '../server';
import { PropertyService } from '../services/property.service';
import { CacheService } from '../services/cache.service';

const t = initTRPC.context<Context>().create();

// Input validation schemas
const coordinatesSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

const mapBoundsSchema = z.object({
  north: z.number().min(-90).max(90),
  south: z.number().min(-90).max(90),
  east: z.number().min(-180).max(180),
  west: z.number().min(-180).max(180),
});

const searchFiltersSchema = z.object({
  location: z.string().optional(),
  bounds: mapBoundsSchema.optional(),
  coordinates: coordinatesSchema.optional(),
  priceMin: z.number().min(0).default(0),
  priceMax: z.number().max(1000000).default(100000),
  bedrooms: z.array(z.number()).default([]),
  propertyTypes: z.array(z.enum(['apartment', 'house', 'room', 'office'])).default([]),
  amenities: z.array(z.string()).default([]),
  sortBy: z.enum(['relevancia', 'precio_asc', 'precio_desc', 'reciente', 'distance']).default('relevancia'),
  radiusKm: z.number().min(1).max(50).default(5),
  cursor: z.string().optional(),
  limit: z.number().min(1).max(50).default(24),
});

const propertyIdSchema = z.object({
  id: z.string().uuid(),
});

const toggleFavoriteSchema = z.object({
  propertyId: z.string().uuid(),
  userId: z.string().optional(), // Optional for now, will be required when auth is implemented
});

const autocompleteSchema = z.object({
  query: z.string().min(2).max(100),
  limit: z.number().min(1).max(20).default(10),
  location: coordinatesSchema.optional(),
});

const clusteringSchema = z.object({
  bounds: mapBoundsSchema,
  zoom: z.number().min(1).max(20),
  filters: searchFiltersSchema.omit({ bounds: true, cursor: true, limit: true }).optional(),
});

const mapPropertiesSchema = z.object({
  bounds: mapBoundsSchema,
  filters: searchFiltersSchema.omit({ bounds: true, cursor: true }).optional(),
  limit: z.number().min(1).max(1000).default(100),
});

const similarPropertiesSchema = z.object({
  propertyId: z.string().uuid(),
  limit: z.number().min(1).max(20).default(6),
});

const trackViewSchema = z.object({
  propertyId: z.string().uuid(),
  source: z.enum(['lista', 'mapa', 'modal', 'detalle']).default('lista'),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
});

const trackContactSchema = z.object({
  propertyId: z.string().uuid(),
  source: z.enum(['modal', 'detalle', 'lista']).default('modal'),
  contactMethod: z.enum(['whatsapp', 'phone', 'email']).default('whatsapp'),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  phoneNumber: z.string().optional(),
  success: z.boolean().default(true),
  errorMessage: z.string().optional(),
});

export const propertyRouter = t.router({
  // Main search procedure with infinite scroll
  search: t.procedure
    .input(searchFiltersSchema)
    .query(async ({ input, ctx }) => {
      const propertyService = new PropertyService();
      const cacheService = new CacheService();
      
      // Create cache key from input parameters
      const cacheKey = `property:search:${JSON.stringify(input)}`;
      
      try {
        // Check cache first
        const cached = await cacheService.get(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
        
        // Execute search
        const results = await propertyService.searchProperties(input);
        
        // Cache for 5 minutes
        await cacheService.set(cacheKey, JSON.stringify(results), 300);
        
        return results;
      } catch (error) {
        console.error('Error in property search:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to search properties',
        });
      }
    }),

  // Get property details by ID
  getById: t.procedure
    .input(propertyIdSchema)
    .query(async ({ input }) => {
      const propertyService = new PropertyService();
      
      try {
        const property = await propertyService.getPropertyById(input.id);
        
        if (!property) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Propiedad no encontrada',
          });
        }
        
        return property;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        
        console.error('Error getting property by ID:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al obtener la propiedad',
        });
      }
    }),

  // Get properties within map bounds for map view
  getByBounds: t.procedure
    .input(mapPropertiesSchema)
    .query(async ({ input }) => {
      const propertyService = new PropertyService();
      const cacheService = new CacheService();
      
      // Create cache key
      const cacheKey = `property:bounds:${JSON.stringify(input)}`;
      
      try {
        // Check cache first (shorter cache for map data)
        const cached = await cacheService.get(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
        
        const properties = await propertyService.getPropertiesInBounds(
          input.bounds,
          input.filters || {},
          input.limit
        );
        
        const result = {
          properties,
          total: properties.length,
          bounds: input.bounds,
        };
        
        // Cache for 3 minutes (map data changes more frequently)
        await cacheService.set(cacheKey, JSON.stringify(result), 180);
        
        return result;
      } catch (error) {
        console.error('Error getting properties by bounds:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al obtener propiedades en el área',
        });
      }
    }),

  // Get clustered properties for map view
  getClusters: t.procedure
    .input(clusteringSchema)
    .query(async ({ input }) => {
      const propertyService = new PropertyService();
      const cacheService = new CacheService();
      
      // Create cache key
      const cacheKey = `property:clusters:${JSON.stringify(input)}`;
      
      try {
        // Check cache first
        const cached = await cacheService.get(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
        
        const clusters = await propertyService.clusterProperties(
          input.bounds,
          input.zoom,
          input.filters || {}
        );
        
        // Cache for 5 minutes
        await cacheService.set(cacheKey, JSON.stringify(clusters), 300);
        
        return clusters;
      } catch (error) {
        console.error('Error getting property clusters:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al obtener clusters de propiedades',
        });
      }
    }),

  // Search nearby properties by coordinates
  searchNearby: t.procedure
    .input(z.object({
      coordinates: coordinatesSchema,
      radiusKm: z.number().min(1).max(50).default(5),
      filters: searchFiltersSchema.omit({ coordinates: true, bounds: true }).optional(),
    }))
    .query(async ({ input }) => {
      const propertyService = new PropertyService();
      
      try {
        const properties = await propertyService.searchPropertiesNearby(
          input.coordinates.lat,
          input.coordinates.lng,
          input.radiusKm,
          input.filters || {}
        );
        
        return {
          properties,
          total: properties.length,
          center: input.coordinates,
          radiusKm: input.radiusKm,
        };
      } catch (error) {
        console.error('Error searching nearby properties:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al buscar propiedades cercanas',
        });
      }
    }),

  // Get autocomplete suggestions
  autocomplete: t.procedure
    .input(autocompleteSchema)
    .query(async ({ input }) => {
      const propertyService = new PropertyService();
      const cacheService = new CacheService();
      
      // Create cache key
      const cacheKey = `property:autocomplete:${input.query}:${input.limit}`;
      
      try {
        // Check cache first (autocomplete can be cached longer)
        const cached = await cacheService.get(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
        
        const suggestions = await propertyService.getAutocompleteSuggestions(
          input.query,
          input.location,
          input.limit
        );
        
        // Cache for 1 hour
        await cacheService.set(cacheKey, JSON.stringify(suggestions), 3600);
        
        return suggestions;
      } catch (error) {
        console.error('Error getting autocomplete suggestions:', error);
        // Return empty array on error to not break the search experience
        return [];
      }
    }),

  // Get similar properties
  getSimilar: t.procedure
    .input(similarPropertiesSchema)
    .query(async ({ input }) => {
      const propertyService = new PropertyService();
      
      try {
        const similarProperties = await propertyService.getSimilarProperties(
          input.propertyId,
          input.limit
        );
        
        return similarProperties;
      } catch (error) {
        console.error('Error getting similar properties:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al obtener propiedades similares',
        });
      }
    }),

  // Toggle favorite property
  toggleFavorite: t.procedure
    .input(toggleFavoriteSchema)
    .mutation(async ({ input }) => {
      const propertyService = new PropertyService();
      
      try {
        const result = await propertyService.toggleFavorite(
          input.userId || 'anonymous',
          input.propertyId
        );
        
        return result;
      } catch (error) {
        console.error('Error toggling favorite:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al marcar como favorito',
        });
      }
    }),

  // Track property view
  trackView: t.procedure
    .input(trackViewSchema)
    .mutation(async ({ input, ctx }) => {
      const propertyService = new PropertyService();
      
      try {
        await propertyService.trackPropertyView({
          propertyId: input.propertyId,
          source: input.source,
          userId: input.userId,
          sessionId: input.sessionId,
          ipAddress: ctx.req.ip,
          userAgent: ctx.req.get('user-agent'),
          referrer: ctx.req.get('referer'),
        });
        
        return { success: true };
      } catch (error) {
        console.error('Error tracking property view:', error);
        // Don't throw error for analytics - just log and continue
        return { success: false };
      }
    }),

  // Track property contact
  trackContact: t.procedure
    .input(trackContactSchema)
    .mutation(async ({ input, ctx }) => {
      const propertyService = new PropertyService();
      
      try {
        await propertyService.trackPropertyContact({
          propertyId: input.propertyId,
          source: input.source,
          contactMethod: input.contactMethod,
          userId: input.userId,
          sessionId: input.sessionId,
          phoneNumber: input.phoneNumber,
          success: input.success,
          errorMessage: input.errorMessage,
          ipAddress: ctx.req.ip,
          userAgent: ctx.req.get('user-agent'),
        });
        
        return { success: true };
      } catch (error) {
        console.error('Error tracking property contact:', error);
        // Don't throw error for analytics - just log and continue
        return { success: false };
      }
    }),

  // Get search facets for filtering UI
  getSearchFacets: t.procedure
    .input(z.object({
      bounds: mapBoundsSchema.optional(),
      baseFilters: searchFiltersSchema.omit({ cursor: true, limit: true }).optional(),
    }))
    .query(async ({ input }) => {
      const propertyService = new PropertyService();
      const cacheService = new CacheService();
      
      // Create cache key
      const cacheKey = `property:facets:${JSON.stringify(input)}`;
      
      try {
        // Check cache first
        const cached = await cacheService.get(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
        
        const facets = await propertyService.getSearchFacets(
          input.bounds,
          input.baseFilters || {}
        );
        
        // Cache for 10 minutes
        await cacheService.set(cacheKey, JSON.stringify(facets), 600);
        
        return facets;
      } catch (error) {
        console.error('Error getting search facets:', error);
        // Return empty facets on error
        return {
          neighborhoods: [],
          priceRanges: [],
          propertyTypes: [],
          amenities: [],
        };
      }
    }),
});

export type PropertyRouter = typeof propertyRouter;