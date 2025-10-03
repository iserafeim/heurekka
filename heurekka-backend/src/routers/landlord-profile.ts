import { z } from 'zod';
import { router, protectedProcedure } from '../lib/trpc';
import { getLandlordProfileService } from '../services/landlord-profile.service';
import { getLandlordVerificationService } from '../services/landlord-verification.service';
import { getLandlordBadgesService } from '../services/landlord-badges.service';
import { getStorageService } from '../services/storage.service';
import { TRPCError } from '@trpc/server';

// Initialize services
const landlordProfileService = getLandlordProfileService();
const verificationService = getLandlordVerificationService();
const badgesService = getLandlordBadgesService();
const storageService = getStorageService();

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
   * Get landlord properties count (DEPRECATED - use getPortfolioStats instead)
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

        const stats = await landlordProfileService.getPortfolioStats(profile.id);

        return {
          success: true,
          data: {
            totalProperties: stats.totalProperties,
            activeProperties: stats.activeProperties,
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
    }),

  // ============= ONBOARDING ENDPOINTS =============

  /**
   * Save onboarding progress
   */
  saveOnboardingProgress: protectedProcedure
    .input(
      z.object({
        step: z.number().min(0).max(10),
        formData: z.record(z.any()),
        skippedSteps: z.array(z.string()).optional()
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        if (!ctx.auth.isAuthenticated || !ctx.auth.user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Usuario no autenticado'
          });
        }

        const result = await landlordProfileService.saveOnboardingProgress(
          ctx.auth.user.id,
          input.step,
          input.formData as any,
          input.skippedSteps
        );

        return {
          success: true,
          data: result,
          message: 'Progreso guardado exitosamente'
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Error saving onboarding progress:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al guardar el progreso'
        });
      }
    }),

  /**
   * Get onboarding progress
   */
  getOnboardingProgress: protectedProcedure.query(async ({ ctx }) => {
    try {
      if (!ctx.auth.isAuthenticated || !ctx.auth.user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Usuario no autenticado'
        });
      }

      const progress = await landlordProfileService.getOnboardingProgress(ctx.auth.user.id);

      return {
        success: true,
        data: progress
      };
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error al obtener el progreso'
      });
    }
  }),

  /**
   * Complete onboarding
   */
  completeOnboarding: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      if (!ctx.auth.isAuthenticated || !ctx.auth.user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Usuario no autenticado'
        });
      }

      const result = await landlordProfileService.completeOnboarding(ctx.auth.user.id);

      // Check and award initial badges
      console.log('[CompleteOnboarding] Fetching profile to award badges...');
      const profile = await landlordProfileService.getLandlordProfileByUserId(ctx.auth.user.id);

      if (profile) {
        console.log('[CompleteOnboarding] Profile found, calling checkAndAwardBadges for:', profile.id);
        const awardedBadges = await badgesService.checkAndAwardBadges(profile.id);
        console.log('[CompleteOnboarding] Badges awarded:', awardedBadges.length);
      } else {
        console.log('[CompleteOnboarding] No profile found, skipping badge check');
      }

      return {
        success: true,
        data: result,
        message: '¡Bienvenido! Tu perfil ha sido creado exitosamente'
      };
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      console.error('Error completing onboarding:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error al completar el onboarding'
      });
    }
  }),

  // ============= PHOTO UPLOAD ENDPOINTS =============

  /**
   * Upload profile photo (base64)
   */
  uploadProfilePhoto: protectedProcedure
    .input(
      z.object({
        base64Image: z.string(),
        fileName: z.string()
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        if (!ctx.auth.isAuthenticated || !ctx.auth.user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Usuario no autenticado'
          });
        }

        // Validate and decode base64
        const { buffer, mimeType } = storageService.validateAndDecodeBase64Image(
          input.base64Image
        );

        // Upload to storage
        const { url, path } = await storageService.uploadProfilePhoto(
          ctx.auth.user.id,
          buffer,
          mimeType,
          input.fileName
        );

        // Update profile with photo URL
        const profile = await landlordProfileService.updateProfilePhoto(ctx.auth.user.id, url);

        return {
          success: true,
          data: {
            url,
            path,
            profile
          },
          message: 'Foto de perfil actualizada exitosamente'
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Error uploading profile photo:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al subir la foto de perfil'
        });
      }
    }),

  // ============= VERIFICATION ENDPOINTS =============

  /**
   * Request phone verification
   */
  requestPhoneVerification: protectedProcedure
    .input(
      z.object({
        phoneNumber: z.string().regex(/^[0-9]{4}-[0-9]{4}$/, 'Formato de teléfono inválido')
      })
    )
    .mutation(async ({ ctx, input }) => {
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

        const result = await verificationService.requestPhoneVerification(
          profile.id,
          input.phoneNumber
        );

        return {
          success: result.success,
          data: result,
          message: result.success
            ? 'Código de verificación enviado'
            : 'Debe esperar antes de solicitar un nuevo código'
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Error requesting phone verification:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al solicitar verificación telefónica'
        });
      }
    }),

  /**
   * Verify phone code
   */
  verifyPhone: protectedProcedure
    .input(
      z.object({
        code: z.string().length(6, 'El código debe tener 6 dígitos')
      })
    )
    .mutation(async ({ ctx, input }) => {
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

        const result = await verificationService.verifyPhone(profile.id, input.code);

        // Award phone verification badge
        if (result.verified) {
          await badgesService.checkAndAwardBadges(profile.id);
        }

        return {
          success: true,
          data: result,
          message: '¡Teléfono verificado exitosamente!'
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Error verifying phone:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al verificar el teléfono'
        });
      }
    }),

  /**
   * Request email verification
   */
  requestEmailVerification: protectedProcedure
    .input(
      z.object({
        email: z.string().email('Email inválido')
      })
    )
    .mutation(async ({ ctx, input }) => {
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

        const result = await verificationService.requestEmailVerification(profile.id, input.email);

        return {
          success: true,
          data: { sent: true },
          message: 'Email de verificación enviado'
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Error requesting email verification:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al solicitar verificación de email'
        });
      }
    }),

  /**
   * Verify email token
   */
  verifyEmail: protectedProcedure
    .input(
      z.object({
        token: z.string()
      })
    )
    .mutation(async ({ ctx, input }) => {
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

        const result = await verificationService.verifyEmail(profile.id, input.token);

        // Award email verification badge
        if (result.verified) {
          await badgesService.checkAndAwardBadges(profile.id);
        }

        return {
          success: true,
          data: result,
          message: '¡Email verificado exitosamente!'
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Error verifying email:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al verificar el email'
        });
      }
    }),

  /**
   * Get verification status
   */
  getVerificationStatus: protectedProcedure.query(async ({ ctx }) => {
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

      const status = await verificationService.getVerificationStatus(profile.id);

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
        message: 'Error al obtener estado de verificación'
      });
    }
  }),

  // ============= PORTFOLIO STATS ENDPOINTS =============

  /**
   * Get portfolio statistics
   */
  getPortfolioStats: protectedProcedure.query(async ({ ctx }) => {
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

      const stats = await landlordProfileService.getPortfolioStats(profile.id);

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
        message: 'Error al obtener estadísticas del portfolio'
      });
    }
  }),

  // ============= BADGES ENDPOINTS =============

  /**
   * Get landlord badges
   */
  getBadges: protectedProcedure.query(async ({ ctx }) => {
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

      const badges = await badgesService.getBadges(profile.id);

      return {
        success: true,
        data: badges
      };
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error al obtener badges'
      });
    }
  }),

  /**
   * Get available badges (earned and unearned)
   */
  getAvailableBadges: protectedProcedure.query(async ({ ctx }) => {
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

      const badges = await badgesService.getAvailableBadges(profile.id);

      return {
        success: true,
        data: badges
      };
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error al obtener badges disponibles'
      });
    }
  }),

  /**
   * DEBUG ENDPOINT - Verify onboarding data was saved correctly
   * TODO: Remove this endpoint after verification
   */
  debugVerifyOnboarding: protectedProcedure.query(async ({ ctx }) => {
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

      // Get portfolio stats
      const portfolioStats = await landlordProfileService.getPortfolioStats(profile.id);

      // Get badges
      const badges = await badgesService.getBadges(profile.id);

      return {
        success: true,
        data: {
          profile: {
            id: profile.id,
            user_id: profile.userId,
            landlord_type: profile.landlordType,
            full_name: profile.fullName,
            company_name: profile.companyName,
            profile_completion_percentage: profile.profileCompletionPercentage,
            is_verified: profile.isVerified,
            created_at: profile.createdAt
          },
          portfolio_stats: portfolioStats ? {
            id: portfolioStats.id,
            landlord_id: portfolioStats.landlordId,
            total_properties: portfolioStats.totalProperties,
            active_properties: portfolioStats.activeProperties,
            rented_properties: portfolioStats.rentedProperties,
            total_views: portfolioStats.totalViews,
            total_inquiries: portfolioStats.totalInquiries,
            conversion_rate: portfolioStats.conversionRate,
            last_calculated_at: portfolioStats.lastCalculatedAt
          } : null,
          badges: badges.map(badge => ({
            id: badge.id,
            badge_name: badge.badgeName,
            earned_at: badge.earnedAt,
            is_active: badge.isActive
          }))
        }
      };
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error al verificar datos de onboarding'
      });
    }
  })
});