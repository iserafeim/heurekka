import { z } from 'zod';
import { router, protectedProcedure } from '../lib/trpc';
import { getSavedSearchService } from '../services/saved-search.service';
import { TRPCError } from '@trpc/server';

// Initialize service
const savedSearchService = getSavedSearchService();

// Validation schemas
const searchCriteriaSchema = z.object({
  propertyTypes: z.array(z.string()).optional(),
  locations: z.array(z.string()).optional(),
  budgetMin: z.number().int().positive().optional(),
  budgetMax: z.number().int().positive().optional(),
  bedrooms: z.object({
    min: z.number().int().min(0).optional(),
    max: z.number().int().min(0).optional()
  }).optional(),
  bathrooms: z.object({
    min: z.number().min(0).optional(),
    max: z.number().min(0).optional()
  }).optional(),
  amenities: z.array(z.string()).optional(),
  areaMin: z.number().int().positive().optional(),
  areaMax: z.number().int().positive().optional(),
  petsAllowed: z.boolean().optional(),
  furnished: z.boolean().optional()
});

const createSavedSearchSchema = z.object({
  profileName: z.string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  searchCriteria: searchCriteriaSchema,
  isActive: z.boolean().optional()
});

const updateSavedSearchSchema = z.object({
  profileName: z.string().min(3).max(100).optional(),
  searchCriteria: searchCriteriaSchema.optional(),
  isActive: z.boolean().optional()
});

/**
 * Saved Search router
 */
export const savedSearchRouter = router({
  /**
   * Create a new saved search
   */
  create: protectedProcedure
    .input(createSavedSearchSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        if (!ctx.auth.isAuthenticated || !ctx.auth.user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Usuario no autenticado'
          });
        }

        const savedSearch = await savedSearchService.createSavedSearch(
          ctx.auth.user.id,
          input
        );

        return {
          success: true,
          data: savedSearch,
          message: 'Búsqueda guardada exitosamente'
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al guardar la búsqueda'
        });
      }
    }),

  /**
   * Get all saved searches for current user
   */
  list: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        if (!ctx.auth.isAuthenticated || !ctx.auth.user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Usuario no autenticado'
          });
        }

        const searches = await savedSearchService.getUserSavedSearches(ctx.auth.user.id);

        return {
          success: true,
          data: searches
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al obtener las búsquedas guardadas'
        });
      }
    }),

  /**
   * Get a single saved search by ID
   */
  getById: protectedProcedure
    .input(z.object({
      searchId: z.string().uuid('ID de búsqueda inválido')
    }))
    .query(async ({ ctx, input }) => {
      try {
        if (!ctx.auth.isAuthenticated || !ctx.auth.user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Usuario no autenticado'
          });
        }

        const search = await savedSearchService.getSavedSearchById(
          ctx.auth.user.id,
          input.searchId
        );

        if (!search) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Búsqueda guardada no encontrada'
          });
        }

        return {
          success: true,
          data: search
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al obtener la búsqueda'
        });
      }
    }),

  /**
   * Update a saved search
   */
  update: protectedProcedure
    .input(z.object({
      searchId: z.string().uuid(),
      data: updateSavedSearchSchema
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        if (!ctx.auth.isAuthenticated || !ctx.auth.user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Usuario no autenticado'
          });
        }

        const updatedSearch = await savedSearchService.updateSavedSearch(
          ctx.auth.user.id,
          input.searchId,
          input.data
        );

        return {
          success: true,
          data: updatedSearch,
          message: 'Búsqueda actualizada exitosamente'
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al actualizar la búsqueda'
        });
      }
    }),

  /**
   * Delete a saved search
   */
  delete: protectedProcedure
    .input(z.object({
      searchId: z.string().uuid()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        if (!ctx.auth.isAuthenticated || !ctx.auth.user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Usuario no autenticado'
          });
        }

        await savedSearchService.deleteSavedSearch(
          ctx.auth.user.id,
          input.searchId
        );

        return {
          success: true,
          message: 'Búsqueda eliminada exitosamente'
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al eliminar la búsqueda'
        });
      }
    }),

  /**
   * Toggle active status of a saved search
   */
  toggleStatus: protectedProcedure
    .input(z.object({
      searchId: z.string().uuid()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        if (!ctx.auth.isAuthenticated || !ctx.auth.user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Usuario no autenticado'
          });
        }

        const updatedSearch = await savedSearchService.toggleSavedSearchStatus(
          ctx.auth.user.id,
          input.searchId
        );

        return {
          success: true,
          data: updatedSearch,
          message: `Búsqueda ${updatedSearch.isActive ? 'activada' : 'desactivada'}`
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al cambiar el estado'
        });
      }
    }),

  /**
   * Execute a saved search and get matching properties
   */
  execute: protectedProcedure
    .input(z.object({
      searchId: z.string().uuid()
    }))
    .query(async ({ ctx, input }) => {
      try {
        if (!ctx.auth.isAuthenticated || !ctx.auth.user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Usuario no autenticado'
          });
        }

        const properties = await savedSearchService.executeSearch(
          ctx.auth.user.id,
          input.searchId
        );

        return {
          success: true,
          data: {
            properties,
            count: properties.length
          }
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al ejecutar la búsqueda'
        });
      }
    }),

  /**
   * Get summary of saved searches
   */
  summary: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        if (!ctx.auth.isAuthenticated || !ctx.auth.user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Usuario no autenticado'
          });
        }

        const summary = await savedSearchService.getSavedSearchesSummary(ctx.auth.user.id);

        return {
          success: true,
          data: summary
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al obtener el resumen'
        });
      }
    })
});
