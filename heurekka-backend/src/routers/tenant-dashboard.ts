import { z } from 'zod';
import { router, protectedProcedure } from '../lib/trpc';
import { getTenantDashboardService } from '../services/tenant-dashboard.service';
import { TRPCError } from '@trpc/server';

// Initialize service
const dashboardService = getTenantDashboardService();

/**
 * Tenant Dashboard router
 */
export const tenantDashboardRouter = router({
  /**
   * Get complete dashboard data
   * Returns profile, stats, saved searches, favorites, and conversations
   */
  getData: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        if (!ctx.auth.isAuthenticated || !ctx.auth.user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Usuario no autenticado'
          });
        }

        const dashboardData = await dashboardService.getDashboardData(ctx.auth.user.id);

        // Update last active timestamp
        await dashboardService.updateLastActive(ctx.auth.user.id);

        return {
          success: true,
          data: dashboardData
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Error getting dashboard data:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al cargar el dashboard'
        });
      }
    }),

  /**
   * Get quick stats only (for dashboard header)
   */
  getStats: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        if (!ctx.auth.isAuthenticated || !ctx.auth.user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Usuario no autenticado'
          });
        }

        const stats = await dashboardService.getQuickStats(ctx.auth.user.id);

        return {
          success: true,
          data: stats
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al obtener estadísticas'
        });
      }
    }),

  /**
   * Get conversations/contact history
   */
  getConversations: protectedProcedure
    .input(z.object({
      limit: z.number().int().min(1).max(100).optional().default(20)
    }))
    .query(async ({ ctx, input }) => {
      try {
        if (!ctx.auth.isAuthenticated || !ctx.auth.user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Usuario no autenticado'
          });
        }

        const conversations = await dashboardService.getConversations(
          ctx.auth.user.id,
          input.limit
        );

        return {
          success: true,
          data: conversations
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al obtener conversaciones'
        });
      }
    }),

  /**
   * Get recently viewed properties
   */
  getRecentlyViewed: protectedProcedure
    .input(z.object({
      limit: z.number().int().min(1).max(50).optional().default(10)
    }))
    .query(async ({ ctx, input }) => {
      try {
        if (!ctx.auth.isAuthenticated || !ctx.auth.user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Usuario no autenticado'
          });
        }

        const recentlyViewed = await dashboardService.getRecentlyViewed(
          ctx.auth.user.id,
          input.limit
        );

        return {
          success: true,
          data: recentlyViewed
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al obtener propiedades vistas'
        });
      }
    })
});
