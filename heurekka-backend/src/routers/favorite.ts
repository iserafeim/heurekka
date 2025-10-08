import { z } from 'zod';
import { router, protectedProcedure } from '../lib/trpc';
import { getFavoriteService } from '../services/favorite.service';
import { TRPCError } from '@trpc/server';

// Initialize service
const favoriteService = getFavoriteService();

/**
 * Favorite router
 */
export const favoriteRouter = router({
  /**
   * Add property to favorites
   */
  add: protectedProcedure
    .input(z.object({
      propertyId: z.string().uuid('ID de propiedad inválido')
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        if (!ctx.auth.isAuthenticated || !ctx.auth.user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Usuario no autenticado'
          });
        }

        const favorite = await favoriteService.addFavorite(
          ctx.auth.user.id,
          input.propertyId
        );

        return {
          success: true,
          data: favorite,
          message: 'Propiedad agregada a favoritos'
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al agregar a favoritos'
        });
      }
    }),

  /**
   * Remove property from favorites
   */
  remove: protectedProcedure
    .input(z.object({
      propertyId: z.string().uuid('ID de propiedad inválido')
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        if (!ctx.auth.isAuthenticated || !ctx.auth.user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Usuario no autenticado'
          });
        }

        await favoriteService.removeFavorite(
          ctx.auth.user.id,
          input.propertyId
        );

        return {
          success: true,
          message: 'Propiedad quitada de favoritos'
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al quitar de favoritos'
        });
      }
    }),

  /**
   * Get all favorites for current user
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

        const favorites = await favoriteService.getUserFavorites(ctx.auth.user.id);

        return {
          success: true,
          data: favorites
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al obtener favoritos'
        });
      }
    }),

  /**
   * Check if property is favorited
   */
  isFavorite: protectedProcedure
    .input(z.object({
      propertyId: z.string().uuid()
    }))
    .query(async ({ ctx, input }) => {
      try {
        if (!ctx.auth.isAuthenticated || !ctx.auth.user) {
          return {
            success: true,
            data: { isFavorite: false }
          };
        }

        const isFavorite = await favoriteService.isFavorite(
          ctx.auth.user.id,
          input.propertyId
        );

        return {
          success: true,
          data: { isFavorite }
        };
      } catch (error) {
        return {
          success: true,
          data: { isFavorite: false }
        };
      }
    }),

  /**
   * Toggle favorite status (add or remove)
   */
  toggle: protectedProcedure
    .input(z.object({
      propertyId: z.string().uuid()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        if (!ctx.auth.isAuthenticated || !ctx.auth.user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Usuario no autenticado'
          });
        }

        const isFavorite = await favoriteService.isFavorite(
          ctx.auth.user.id,
          input.propertyId
        );

        if (isFavorite) {
          await favoriteService.removeFavorite(ctx.auth.user.id, input.propertyId);
          return {
            success: true,
            data: { isFavorite: false },
            message: 'Quitado de favoritos'
          };
        } else {
          const favorite = await favoriteService.addFavorite(
            ctx.auth.user.id,
            input.propertyId
          );
          return {
            success: true,
            data: { isFavorite: true, favorite },
            message: 'Agregado a favoritos'
          };
        }
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al cambiar favorito'
        });
      }
    }),

  /**
   * Get favorites summary
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

        const summary = await favoriteService.getFavoritesSummary(ctx.auth.user.id);

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
          message: 'Error al obtener resumen'
        });
      }
    })
});
