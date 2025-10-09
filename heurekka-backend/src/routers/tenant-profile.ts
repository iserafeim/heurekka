import { z } from 'zod';
import { router, protectedProcedure } from '../lib/trpc';
import { getTenantProfileService } from '../services/tenant-profile.service';
import { TRPCError } from '@trpc/server';

// Initialize service
const tenantProfileService = getTenantProfileService();

// Validation schemas
const createTenantProfileSchema = z.object({
  fullName: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  phone: z.string().regex(/^[0-9]{4}-[0-9]{4}$/, 'Formato de teléfono inválido: 9999-9999'),
  occupation: z.string().max(100).optional(),
  budgetMin: z.number().int().min(1000, 'Presupuesto mínimo debe ser al menos L.1,000').optional(),
  budgetMax: z.number().int().min(1000, 'Presupuesto máximo debe ser al menos L.1,000').optional(),
  moveDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido: YYYY-MM-DD').optional(),
  occupants: z.string().max(50).optional(),
  preferredAreas: z.array(z.string()).max(10, 'Máximo 10 zonas preferidas').optional(),
  propertyTypes: z.array(z.enum(['apartment', 'house', 'room'])).optional(),
  hasPets: z.boolean().optional(),
  petDetails: z.string().max(200).optional(),
  hasReferences: z.boolean().optional(),
  messageToLandlords: z.string().max(500, 'El mensaje no puede exceder 500 caracteres').optional(),
  desiredBedrooms: z.array(z.number().int().min(1).max(10)).optional(),
  desiredBathrooms: z.array(z.number().int().min(1).max(10)).optional(),
  desiredParkingSpaces: z.array(z.number().int().min(0).max(10)).optional()
}).refine(
  (data) => {
    if (data.budgetMin && data.budgetMax) {
      return data.budgetMax >= data.budgetMin;
    }
    return true;
  },
  {
    message: 'El presupuesto máximo debe ser mayor o igual al mínimo',
    path: ['budgetMax']
  }
);

const updateTenantProfileSchema = z.object({
  fullName: z.string().min(3).optional(),
  phone: z.string().regex(/^[0-9]{4}-[0-9]{4}$/).optional(),
  occupation: z.string().max(100).optional(),
  profilePhotoUrl: z.string().url().optional(),
  budgetMin: z.number().int().min(1000).optional(),
  budgetMax: z.number().int().min(1000).optional(),
  moveDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido: YYYY-MM-DD').optional(),
  occupants: z.string().max(50).optional(),
  preferredAreas: z.array(z.string()).max(10).optional(),
  propertyTypes: z.array(z.enum(['apartment', 'house', 'room'])).optional(),
  hasPets: z.boolean().optional(),
  petDetails: z.string().max(200).optional(),
  hasReferences: z.boolean().optional(),
  messageToLandlords: z.string().max(500).optional(),
  desiredBedrooms: z.array(z.number().int().min(1).max(10)).optional(),
  desiredBathrooms: z.array(z.number().int().min(1).max(10)).optional(),
  desiredParkingSpaces: z.array(z.number().int().min(0).max(10)).optional()
}).refine(
  (data) => {
    if (data.budgetMin && data.budgetMax) {
      return data.budgetMax >= data.budgetMin;
    }
    return true;
  },
  {
    message: 'El presupuesto máximo debe ser mayor o igual al mínimo',
    path: ['budgetMax']
  }
);

/**
 * Tenant Profile router
 */
export const tenantProfileRouter = router({
  /**
   * Create tenant profile
   */
  create: protectedProcedure
    .input(createTenantProfileSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        if (!ctx.auth.isAuthenticated || !ctx.auth.user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Usuario no autenticado'
          });
        }

        const profile = await tenantProfileService.createTenantProfile(ctx.auth.user.id, input);

        return {
          success: true,
          data: profile,
          message: 'Perfil de inquilino creado exitosamente'
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al crear el perfil de inquilino'
        });
      }
    }),

  /**
   * Get current user's tenant profile
   */
  getCurrent: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        if (!ctx.auth.isAuthenticated || !ctx.auth.user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Usuario no autenticado'
          });
        }

        const profile = await tenantProfileService.getTenantProfileByUserId(ctx.auth.user.id);

        if (!profile) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Perfil de inquilino no encontrado'
          });
        }

        return {
          success: true,
          data: profile
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al obtener el perfil'
        });
      }
    }),

  /**
   * Update tenant profile
   */
  update: protectedProcedure
    .input(updateTenantProfileSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        if (!ctx.auth.isAuthenticated || !ctx.auth.user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Usuario no autenticado'
          });
        }

        const profile = await tenantProfileService.updateTenantProfile(ctx.auth.user.id, input);

        return {
          success: true,
          data: profile,
          message: 'Perfil actualizado exitosamente'
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al actualizar el perfil'
        });
      }
    }),

  /**
   * Delete tenant profile
   */
  delete: protectedProcedure
    .mutation(async ({ ctx }) => {
      try {
        if (!ctx.auth.isAuthenticated || !ctx.auth.user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Usuario no autenticado'
          });
        }

        await tenantProfileService.deleteTenantProfile(ctx.auth.user.id);

        return {
          success: true,
          message: 'Perfil eliminado exitosamente'
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al eliminar el perfil'
        });
      }
    }),

  /**
   * Check if user has tenant profile
   */
  exists: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        if (!ctx.auth.isAuthenticated || !ctx.auth.user) {
          return {
            success: true,
            data: { exists: false }
          };
        }

        const profile = await tenantProfileService.getTenantProfileByUserId(ctx.auth.user.id);

        return {
          success: true,
          data: {
            exists: !!profile,
            profileId: profile?.id,
            completionPercentage: profile?.profileCompletionPercentage || 0
          }
        };
      } catch (error) {
        return {
          success: true,
          data: { exists: false }
        };
      }
    }),

  /**
   * Get profile completion status with detailed breakdown
   */
  getCompletionStatus: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        if (!ctx.auth.isAuthenticated || !ctx.auth.user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Usuario no autenticado'
          });
        }

        const status = await tenantProfileService.getProfileCompletionStatus(ctx.auth.user.id);

        return {
          success: true,
          data: status
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al obtener el estado del perfil'
        });
      }
    }),

  /**
   * Check if user can contact properties
   */
  canContact: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        if (!ctx.auth.isAuthenticated || !ctx.auth.user) {
          return {
            success: true,
            data: {
              canContact: false,
              reason: 'Usuario no autenticado'
            }
          };
        }

        const result = await tenantProfileService.canContactProperties(ctx.auth.user.id);

        return {
          success: true,
          data: result
        };
      } catch (error) {
        return {
          success: true,
          data: {
            canContact: false,
            reason: 'Error al verificar el perfil'
          }
        };
      }
    })
});