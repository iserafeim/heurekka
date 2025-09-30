import { z } from 'zod';
import { router, protectedProcedure } from '../lib/trpc';
import { getLandlordProfileService } from '../services/landlord-profile.service';
import { TRPCError } from '@trpc/server';

// Initialize service
const landlordProfileService = getLandlordProfileService();

// Base schemas for different landlord types
const individualOwnerSchema = z.object({
  landlordType: z.literal('individual_owner'),
  fullName: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  phone: z.string().regex(/^[0-9]{4}-[0-9]{4}$/, 'Formato de teléfono inválido: 9999-9999'),
  whatsappNumber: z.string().regex(/^[0-9]{4}-[0-9]{4}$/, 'Formato de WhatsApp inválido'),
  propertyCountRange: z.enum(['1', '2-5', '6-10', '10+']).optional(),
  propertyLocation: z.string().max(200).optional(),
  rentalReason: z.enum(['investment', 'temporary_move', 'inherited', 'other']).optional()
});

const realEstateAgentSchema = z.object({
  landlordType: z.literal('real_estate_agent'),
  fullName: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  phone: z.string().regex(/^[0-9]{4}-[0-9]{4}$/, 'Formato de teléfono inválido'),
  whatsappNumber: z.string().regex(/^[0-9]{4}-[0-9]{4}$/, 'Formato de WhatsApp inválido'),
  agentType: z.enum(['independent', 'company_agent']),
  companyName: z.string().max(200).optional(),
  yearsExperience: z.enum(['0-2', '3-5', '5-10', '10+']),
  licenseNumber: z.string().regex(/^AHCI-[0-9]{5}$/, 'Formato de licencia inválido: AHCI-12345').optional(),
  specializations: z.array(z.enum(['residential', 'commercial', 'industrial'])).min(1, 'Seleccione al menos una especialización'),
  coverageAreas: z.array(z.string()).min(1, 'Debe especificar al menos una zona de cobertura').max(10),
  propertiesInManagement: z.enum(['1-5', '5-10', '10-20', '20+']),
  credentialsUrl: z.string().url().optional(),
  socialFacebook: z.string().max(200).optional(),
  socialInstagram: z.string().max(200).optional(),
  professionalBio: z.string().max(300).optional()
});

const propertyCompanySchema = z.object({
  landlordType: z.literal('property_company'),
  companyName: z.string().min(3, 'El nombre de la empresa debe tener al menos 3 caracteres'),
  companyRtn: z.string().regex(/^[0-9]{14}$/, 'RTN debe tener 14 dígitos'),
  companyType: z.enum(['real_estate', 'construction', 'management', 'development']),
  foundedYear: z.number().int().min(1900).max(new Date().getFullYear()).optional(),
  mainPhone: z.string().regex(/^[0-9]{4}-[0-9]{4}$/, 'Formato de teléfono inválido'),
  whatsappBusiness: z.string().regex(/^[0-9]{4}-[0-9]{4}$/, 'Formato de WhatsApp inválido'),
  contactEmail: z.string().email().optional(),
  website: z.string().url().optional(),
  officeAddress: z.string().min(10, 'La dirección debe tener al menos 10 caracteres'),
  city: z.string().min(3, 'La ciudad es requerida'),
  operationZones: z.array(z.string()).min(1, 'Debe especificar al menos una zona de operación').max(20),
  portfolioSize: z.enum(['1-10', '10-50', '50-100', '100+']),
  portfolioTypes: z.array(z.enum(['residential', 'commercial', 'industrial', 'land'])).min(1),
  priceRangeMin: z.number().int().min(1000).optional(),
  priceRangeMax: z.number().int().min(1000).optional(),
  companyLogoUrl: z.string().url().optional(),
  licenseDocumentUrl: z.string().url().optional(),
  companyDescription: z.string().max(500).optional()
}).refine(
  (data) => {
    if (data.priceRangeMin && data.priceRangeMax) {
      return data.priceRangeMax >= data.priceRangeMin;
    }
    return true;
  },
  {
    message: 'El rango de precio máximo debe ser mayor o igual al mínimo',
    path: ['priceRangeMax']
  }
);

// Union type for create landlord profile
const createLandlordProfileSchema = z.union([
  individualOwnerSchema,
  realEstateAgentSchema,
  propertyCompanySchema
]);

// Update schema allows partial updates
const updateLandlordProfileSchema = z.object({
  fullName: z.string().min(3).optional(),
  phone: z.string().regex(/^[0-9]{4}-[0-9]{4}$/).optional(),
  whatsappNumber: z.string().regex(/^[0-9]{4}-[0-9]{4}$/).optional(),
  companyName: z.string().min(3).optional(),
  companyRtn: z.string().regex(/^[0-9]{14}$/).optional(),
  agentType: z.enum(['independent', 'company_agent']).optional(),
  yearsExperience: z.string().optional(),
  specializations: z.array(z.string()).optional(),
  coverageAreas: z.array(z.string()).optional(),
  operationZones: z.array(z.string()).optional(),
  professionalBio: z.string().max(300).optional(),
  companyDescription: z.string().max(500).optional(),
  contactEmail: z.string().email().optional(),
  website: z.string().url().optional()
});

/**
 * Landlord Profile router
 */
export const landlordProfileRouter = router({
  /**
   * Create landlord profile
   */
  create: protectedProcedure
    .input(createLandlordProfileSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        if (!ctx.auth.isAuthenticated || !ctx.auth.user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Usuario no autenticado'
          });
        }

        const profile = await landlordProfileService.createLandlordProfile(ctx.auth.user.id, input as any);

        return {
          success: true,
          data: profile,
          message: 'Perfil de arrendador creado exitosamente'
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Error creating landlord profile:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al crear el perfil de arrendador'
        });
      }
    }),

  /**
   * Get current user's landlord profile
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

        const profile = await landlordProfileService.getLandlordProfileByUserId(ctx.auth.user.id);

        if (!profile) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Perfil de arrendador no encontrado'
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
   * Update landlord profile
   */
  update: protectedProcedure
    .input(updateLandlordProfileSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        if (!ctx.auth.isAuthenticated || !ctx.auth.user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Usuario no autenticado'
          });
        }

        const profile = await landlordProfileService.updateLandlordProfile(ctx.auth.user.id, input as any);

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
   * Delete landlord profile
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

        await landlordProfileService.deleteLandlordProfile(ctx.auth.user.id);

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
   * Check if user has landlord profile
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

        const profile = await landlordProfileService.getLandlordProfileByUserId(ctx.auth.user.id);

        return {
          success: true,
          data: {
            exists: !!profile,
            profileId: profile?.id,
            landlordType: profile?.landlordType,
            completionPercentage: profile?.profileCompletionPercentage || 0,
            verificationStatus: profile?.verificationStatus
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
   * Get landlord properties count
   */
  getPropertiesCount: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        if (!ctx.auth.isAuthenticated || !ctx.auth.user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Usuario no autenticado'
          });
        }

        const profile = await landlordProfileService.getLandlordProfileByUserId(ctx.auth.user.id);

        if (!profile) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Perfil de arrendador no encontrado'
          });
        }

        // TODO: Query actual properties count from properties table
        // For now, return 0
        return {
          success: true,
          data: {
            totalProperties: 0,
            activeProperties: 0,
            pendingProperties: 0
          }
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al obtener el conteo de propiedades'
        });
      }
    })
});