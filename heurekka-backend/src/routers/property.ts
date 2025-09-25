import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import type { Context } from '../server';
import { PropertyService } from '../services/property.service';
import { CacheService } from '../services/cache.service';
import { router, publicProcedure, protectedProcedure, landlordProcedure } from '../lib/trpc';
import { createSupabaseContext } from '../middleware/auth';

// Data filtering function to hide sensitive information from unauthenticated users
function filterSensitiveData(results: any): any {
  if (results.properties && Array.isArray(results.properties)) {
    results.properties = results.properties.map((property: any) => ({
      ...property,
      // Hide exact contact information
      contactPhone: undefined,
      landlord: {
        ...property.landlord,
        phone: undefined, // Hide landlord phone
      },
      // Hide exact address, show only neighborhood
      address: property.neighborhood ? `${property.neighborhood}, Tegucigalpa` : 'Tegucigalpa',
      // Limit image details
      images: property.images?.slice(0, 3) || [], // Show max 3 images for anonymous users
    }));
  }
  return results;
}

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
}).refine((bounds) => {
  // Ensure north is greater than south and the bounds make sense
  return bounds.north > bounds.south && bounds.east > bounds.west;
}, {
  message: "Invalid map bounds: north must be greater than south, east must be greater than west"
}).refine((bounds) => {
  // Prevent excessively large bounding boxes (max 10 degrees in any direction)
  const latRange = bounds.north - bounds.south;
  const lngRange = bounds.east - bounds.west;
  return latRange <= 10 && lngRange <= 10;
}, {
  message: "Map bounds too large: maximum allowed range is 10 degrees in any direction"
});

const searchFiltersSchema = z.object({
  location: z.string().max(200).optional(), // Limit location string length
  bounds: mapBoundsSchema.optional(),
  coordinates: coordinatesSchema.optional(),
  priceMin: z.number().min(0).max(1000000).default(0),
  priceMax: z.number().min(0).max(1000000).default(100000),
  bedrooms: z.array(z.number().min(0).max(20)).max(10).default([]), // Limit bedrooms array
  propertyTypes: z.array(z.enum(['apartment', 'house', 'room', 'office'])).max(10).default([]),
  amenities: z.array(z.string().max(100)).max(20).default([]), // Limit amenities
  sortBy: z.enum(['relevancia', 'precio_asc', 'precio_desc', 'reciente', 'distance']).default('relevancia'),
  radiusKm: z.number().min(0.1).max(50).default(5), // Minimum radius validation
  cursor: z.string().max(100).optional(), // Limit cursor length
  limit: z.number().min(1).max(50).default(24),
}).refine((filters) => {
  // Ensure priceMin <= priceMax
  return filters.priceMin <= filters.priceMax;
}, {
  message: "Price minimum cannot be greater than price maximum"
});

const propertyIdSchema = z.object({
  id: z.string().uuid(),
});

const toggleFavoriteSchema = z.object({
  propertyId: z.string().uuid(),
  userId: z.string().optional(), // Optional for now, will be required when auth is implemented
});

const autocompleteSchema = z.object({
  query: z.string().min(2).max(100).regex(/^[a-zA-Z0-9\s\-\.áéíóúñüÁÉÍÓÚÑÜ]+$/, "Invalid characters in search query"),
  limit: z.number().min(1).max(20).default(10),
  location: coordinatesSchema.optional(),
});

const clusteringSchema = z.object({
  bounds: mapBoundsSchema,
  zoom: z.number().min(1).max(20),
  filters: z.object({
    location: z.string().max(200).optional(),
    coordinates: coordinatesSchema.optional(),
    priceMin: z.number().min(0).max(1000000).default(0),
    priceMax: z.number().min(0).max(1000000).default(100000),
    bedrooms: z.array(z.number().min(0).max(20)).max(10).default([]),
    propertyTypes: z.array(z.enum(['apartment', 'house', 'room', 'office'])).max(10).default([]),
    amenities: z.array(z.string().max(100)).max(20).default([]),
    sortBy: z.enum(['relevancia', 'precio_asc', 'precio_desc', 'reciente', 'distance']).default('relevancia'),
    radiusKm: z.number().min(0.1).max(50).default(5),
  }).optional(),
});

const mapPropertiesSchema = z.object({
  bounds: mapBoundsSchema,
  filters: z.object({
    location: z.string().max(200).optional(),
    coordinates: coordinatesSchema.optional(),
    priceMin: z.number().min(0).max(1000000).default(0),
    priceMax: z.number().min(0).max(1000000).default(100000),
    bedrooms: z.array(z.number().min(0).max(20)).max(10).default([]),
    propertyTypes: z.array(z.enum(['apartment', 'house', 'room', 'office'])).max(10).default([]),
    amenities: z.array(z.string().max(100)).max(20).default([]),
    sortBy: z.enum(['relevancia', 'precio_asc', 'precio_desc', 'reciente', 'distance']).default('relevancia'),
    radiusKm: z.number().min(0.1).max(50).default(5),
    limit: z.number().min(1).max(50).default(24),
  }).optional(),
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

export const propertyRouter = router({
  // Main search procedure with infinite scroll (public with optional auth)
  search: publicProcedure
    .input(searchFiltersSchema)
    .query(async ({ input, ctx }) => {
      const propertyService = new PropertyService();
      const cacheService = new CacheService();
      
      // Create secure cache key (include user status for different caching)
      const userType = ctx.user ? 'authenticated' : 'anonymous';
      const cacheKey = `property:search:${userType}:${JSON.stringify(input)}`;
      
      try {
        // Check cache first
        const cached = await cacheService.get(cacheKey);
        if (cached) {
          const results = JSON.parse(cached);
          // Apply data filtering based on authentication status
          return ctx.user ? results : filterSensitiveData(results);
        }
        
        // Execute search with user context
        const results = await propertyService.searchProperties(input, {
          userId: ctx.user?.id,
          isAuthenticated: !!ctx.user
        });
        
        // Cache authenticated and anonymous results separately
        await cacheService.set(cacheKey, JSON.stringify(results), 300);
        
        // Filter sensitive data for unauthenticated users
        return ctx.user ? results : filterSensitiveData(results);
      } catch (error) {
        console.error('Error in property search:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al buscar propiedades. Por favor, intenta de nuevo.',
        });
      }
    }),

  // Get property details by ID (public with data filtering)
  getById: publicProcedure
    .input(propertyIdSchema)
    .query(async ({ input, ctx }) => {
      const { supabaseService } = await import('../services/supabase');

      try {
        // Use the same service as search to ensure consistency
        const searchResults = await supabaseService.searchProperties({
          query: '',
          filters: {
            propertyId: input.id // Filter by specific property ID
          },
          page: 1,
          limit: 1
        });

        const property = searchResults.properties.length > 0 ? searchResults.properties[0] : null;
        
        if (!property) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Propiedad no encontrada',
          });
        }
        
        // Filter sensitive data for unauthenticated users
        if (!ctx.user) {
          return {
            ...property,
            contactPhone: undefined,
            landlord: {
              ...property.landlord,
              phone: undefined,
            },
            // Keep the original address format to preserve coordinate lookup
            // Only modify the address display if it doesn't have coordinates or if it's truly sensitive
            address: property.coordinates && property.coordinates.lat !== 0 && property.coordinates.lng !== 0
              ? property.address // Preserve original address if coordinates exist
              : property.neighborhood ? `${property.neighborhood}, Tegucigalpa` : 'Tegucigalpa',
          };
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

  // Get properties within map bounds for map view (public with filtering)
  getByBounds: publicProcedure
    .input(mapPropertiesSchema)
    .query(async ({ input, ctx }) => {
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

  // Get clustered properties for map view (public)
  getClusters: publicProcedure
    .input(clusteringSchema)
    .query(async ({ input, ctx }) => {
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

  // Search nearby properties by coordinates (public with filtering)
  searchNearby: publicProcedure
    .input(z.object({
      coordinates: coordinatesSchema,
      radiusKm: z.number().min(0.1).max(50).default(5),
      filters: z.object({
        location: z.string().max(200).optional(),
        priceMin: z.number().min(0).max(1000000).default(0),
        priceMax: z.number().min(0).max(1000000).default(100000),
        bedrooms: z.array(z.number().min(0).max(20)).max(10).default([]),
        propertyTypes: z.array(z.enum(['apartment', 'house', 'room', 'office'])).max(10).default([]),
        amenities: z.array(z.string().max(100)).max(20).default([]),
        sortBy: z.enum(['relevancia', 'precio_asc', 'precio_desc', 'reciente', 'distance']).default('relevancia'),
        radiusKm: z.number().min(0.1).max(50).default(5),
        cursor: z.string().max(100).optional(),
        limit: z.number().min(1).max(50).default(24),
      }).optional(),
    }))
    .query(async ({ input, ctx }) => {
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

  // Get autocomplete suggestions (public)
  autocomplete: publicProcedure
    .input(autocompleteSchema)
    .query(async ({ input, ctx }) => {
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

  // Get similar properties (public with filtering)
  getSimilar: publicProcedure
    .input(similarPropertiesSchema)
    .query(async ({ input, ctx }) => {
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

  // Toggle favorite property (requires authentication)
  toggleFavorite: protectedProcedure
    .input(z.object({ propertyId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const propertyService = new PropertyService();
      
      try {
        const result = await propertyService.toggleFavorite(
          ctx.user.id, // Use authenticated user ID
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

  // Track property view (public - analytics)
  trackView: publicProcedure
    .input(z.object({
      propertyId: z.string().uuid(),
      source: z.enum(['lista', 'mapa', 'modal', 'detalle']).default('lista'),
    }))
    .mutation(async ({ input, ctx }) => {
      const propertyService = new PropertyService();
      
      try {
        await propertyService.trackPropertyView({
          propertyId: input.propertyId,
          source: input.source,
          userId: ctx.user?.id,
          sessionId: ctx.req.headers['x-session-id'] as string,
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

  // Track property contact (protected - requires authentication)
  trackContact: protectedProcedure
    .input(z.object({
      propertyId: z.string().uuid(),
      source: z.enum(['modal', 'detalle', 'lista']).default('modal'),
      contactMethod: z.enum(['whatsapp', 'phone', 'email']).default('whatsapp'),
      phoneNumber: z.string().max(20).optional(),
      success: z.boolean().default(true),
      errorMessage: z.string().max(500).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const propertyService = new PropertyService();
      
      try {
        await propertyService.trackPropertyContact({
          propertyId: input.propertyId,
          source: input.source,
          contactMethod: input.contactMethod,
          userId: ctx.user.id, // Use authenticated user ID
          sessionId: ctx.req.headers['x-session-id'] as string,
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

  // Get search facets for filtering UI (public)
  getSearchFacets: publicProcedure
    .input(z.object({
      bounds: mapBoundsSchema.optional(),
      baseFilters: z.object({
        location: z.string().max(200).optional(),
        bounds: mapBoundsSchema.optional(),
        coordinates: coordinatesSchema.optional(),
        priceMin: z.number().min(0).max(1000000).default(0),
        priceMax: z.number().min(0).max(1000000).default(100000),
        bedrooms: z.array(z.number().min(0).max(20)).max(10).default([]),
        propertyTypes: z.array(z.enum(['apartment', 'house', 'room', 'office'])).max(10).default([]),
        amenities: z.array(z.string().max(100)).max(20).default([]),
        sortBy: z.enum(['relevancia', 'precio_asc', 'precio_desc', 'reciente', 'distance']).default('relevancia'),
        radiusKm: z.number().min(0.1).max(50).default(5),
      }).optional(),
    }))
    .query(async ({ input, ctx }) => {
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