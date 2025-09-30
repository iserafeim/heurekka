import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../lib/trpc';
import { getAuthService } from '../services/auth.service';
import { getTenantProfileService } from '../services/tenant-profile.service';
import { getLandlordProfileService } from '../services/landlord-profile.service';
import { TRPCError } from '@trpc/server';

// Initialize services
const authService = getAuthService();
const tenantProfileService = getTenantProfileService();
const landlordProfileService = getLandlordProfileService();

// Validation schemas with enhanced security
const signupSchema = z.object({
  email: z.string().email('Correo electrónico inválido').max(255, 'Correo demasiado largo'),
  password: z.string()
    .min(12, 'La contraseña debe tener al menos 12 caracteres')
    .max(128, 'La contraseña es demasiado larga')
    .regex(/[A-Z]/, 'La contraseña debe incluir al menos una mayúscula')
    .regex(/[a-z]/, 'La contraseña debe incluir al menos una minúscula')
    .regex(/[0-9]/, 'La contraseña debe incluir al menos un número')
    .regex(/[^a-zA-Z0-9]/, 'La contraseña debe incluir al menos un carácter especial'),
  fullName: z.string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre es demasiado largo')
    .optional(),
  phone: z.string()
    .regex(/^(\+504)?[239]\d{3}-?\d{4}$/, 'Formato de teléfono hondureño inválido (ej: 9999-9999)')
    .optional(),
  intent: z.enum(['tenant', 'landlord']).optional()
});

const loginSchema = z.object({
  email: z.string().email('Correo electrónico inválido').max(255, 'Correo demasiado largo'),
  password: z.string().min(1, 'La contraseña es requerida').max(128, 'Contraseña demasiado larga')
});

const googleAuthSchema = z.object({
  idToken: z.string().min(1, 'Token de Google requerido').max(2048, 'Token inválido'),
  intent: z.enum(['tenant', 'landlord']).optional()
});

const refreshSessionSchema = z.object({
  refreshToken: z.string().min(1, 'Token de actualización requerido').max(1024, 'Token inválido')
});

const resetPasswordSchema = z.object({
  email: z.string().email('Correo electrónico inválido').max(255, 'Correo demasiado largo')
});

const updatePasswordSchema = z.object({
  newPassword: z.string()
    .min(12, 'La contraseña debe tener al menos 12 caracteres')
    .max(128, 'La contraseña es demasiado larga')
    .regex(/[A-Z]/, 'La contraseña debe incluir al menos una mayúscula')
    .regex(/[a-z]/, 'La contraseña debe incluir al menos una minúscula')
    .regex(/[0-9]/, 'La contraseña debe incluir al menos un número')
    .regex(/[^a-zA-Z0-9]/, 'La contraseña debe incluir al menos un carácter especial'),
  token: z.string().min(1, 'Token requerido').max(1024, 'Token inválido')
});

const verifyEmailSchema = z.object({
  email: z.string().email('Correo electrónico inválido').max(255, 'Correo demasiado largo')
});

/**
 * Authentication router
 */
export const authRouter = router({
  /**
   * Signup mutation - Create new user account
   * Security: Rate limited, input validation, audit logging
   */
  signup: publicProcedure
    .input(signupSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await authService.signup(
          {
            email: input.email,
            password: input.password,
            fullName: input.fullName,
            phone: input.phone,
            intent: input.intent
          },
          {
            ipAddress: ctx.req?.ip,
            userAgent: ctx.req?.headers['user-agent'] as string
          }
        );

        return {
          success: true,
          data: response,
          message: 'Cuenta creada exitosamente'
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Router signup error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al crear la cuenta. Por favor intenta nuevamente.'
        });
      }
    }),

  /**
   * Login mutation - Authenticate user
   * Security: Rate limited, account lockout protection, audit logging
   */
  login: publicProcedure
    .input(loginSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await authService.login(
          {
            email: input.email,
            password: input.password
          },
          {
            ipAddress: ctx.req?.ip,
            userAgent: ctx.req?.headers['user-agent'] as string
          }
        );

        return {
          success: true,
          data: response,
          message: 'Inicio de sesión exitoso'
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al iniciar sesión. Por favor intenta nuevamente.'
        });
      }
    }),

  /**
   * Logout mutation - End user session
   */
  logout: protectedProcedure
    .mutation(async ({ ctx }) => {
      try {
        if (ctx.auth.token) {
          await authService.logout(ctx.auth.token);
        }

        return {
          success: true,
          message: 'Sesión cerrada exitosamente'
        };
      } catch (error) {
        // Logout should always succeed from client perspective
        return {
          success: true,
          message: 'Sesión cerrada'
        };
      }
    }),

  /**
   * Refresh session mutation - Get new access token
   */
  refreshSession: publicProcedure
    .input(refreshSessionSchema)
    .mutation(async ({ input }) => {
      try {
        const response = await authService.refreshSession(input.refreshToken);

        return {
          success: true,
          data: response,
          message: 'Sesión actualizada'
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'No se pudo actualizar la sesión'
        });
      }
    }),

  /**
   * Google OAuth authentication
   */
  googleAuth: publicProcedure
    .input(googleAuthSchema)
    .mutation(async ({ input }) => {
      try {
        const response = await authService.googleAuth({
          idToken: input.idToken,
          intent: input.intent
        });

        return {
          success: true,
          data: response,
          message: 'Autenticación con Google exitosa'
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al autenticar con Google'
        });
      }
    }),

  /**
   * Request password reset
   * Security: Rate limited (3 per hour), prevents email enumeration
   */
  requestPasswordReset: publicProcedure
    .input(resetPasswordSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await authService.requestPasswordReset(
          {
            email: input.email
          },
          {
            ipAddress: ctx.req?.ip,
            userAgent: ctx.req?.headers['user-agent'] as string
          }
        );

        return {
          success: true,
          message: response.message
        };
      } catch (error) {
        // Always return success to prevent email enumeration
        return {
          success: true,
          message: 'Si el correo existe, recibirás instrucciones para restablecer tu contraseña'
        };
      }
    }),

  /**
   * Update password with reset token
   */
  updatePassword: publicProcedure
    .input(updatePasswordSchema)
    .mutation(async ({ input }) => {
      try {
        await authService.updatePassword({
          newPassword: input.newPassword,
          token: input.token
        });

        return {
          success: true,
          message: 'Contraseña actualizada exitosamente'
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al actualizar la contraseña'
        });
      }
    }),

  /**
   * Send email verification
   */
  sendEmailVerification: protectedProcedure
    .input(verifyEmailSchema)
    .mutation(async ({ input }) => {
      try {
        await authService.sendEmailVerification(input.email);

        return {
          success: true,
          message: 'Correo de verificación enviado'
        };
      } catch (error) {
        return {
          success: true,
          message: 'Correo de verificación enviado'
        };
      }
    }),

  /**
   * Verify email with OTP code
   */
  verifyEmailOTP: publicProcedure
    .input(z.object({
      email: z.string().email('Correo electrónico inválido').max(255, 'Correo demasiado largo'),
      token: z.string().length(6, 'El código debe tener 6 dígitos').regex(/^\d+$/, 'El código debe contener solo números')
    }))
    .mutation(async ({ input }) => {
      try {
        const response = await authService.verifyEmailOTP(input.email, input.token);

        return {
          success: true,
          data: response,
          message: 'Email verificado exitosamente'
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al verificar el código'
        });
      }
    }),

  /**
   * Verify session - Check if user is authenticated
   */
  verifySession: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        if (!ctx.auth.isAuthenticated || !ctx.auth.token) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Sesión inválida'
          });
        }

        const sessionInfo = await authService.verifySession(ctx.auth.token);

        return {
          success: true,
          data: sessionInfo
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Error al verificar la sesión'
        });
      }
    }),

  /**
   * Get current user info with profiles
   */
  getCurrentUser: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        if (!ctx.auth.isAuthenticated || !ctx.auth.user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Usuario no autenticado'
          });
        }

        // Get tenant profile if exists
        const tenantProfile = await tenantProfileService.getTenantProfileByUserId(ctx.auth.user.id);

        // Get landlord profile if exists
        const landlordProfile = await landlordProfileService.getLandlordProfileByUserId(ctx.auth.user.id);

        return {
          success: true,
          data: {
            user: ctx.auth.user,
            tenantProfile,
            landlordProfile,
            hasTenantProfile: !!tenantProfile,
            hasLandlordProfile: !!landlordProfile
          }
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al obtener información del usuario'
        });
      }
    }),

  /**
   * Check profile completion status
   */
  checkProfileCompletion: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        if (!ctx.auth.isAuthenticated || !ctx.auth.user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Usuario no autenticado'
          });
        }

        const tenantProfile = await tenantProfileService.getTenantProfileByUserId(ctx.auth.user.id);
        const landlordProfile = await landlordProfileService.getLandlordProfileByUserId(ctx.auth.user.id);

        return {
          success: true,
          data: {
            hasTenantProfile: !!tenantProfile,
            hasLandlordProfile: !!landlordProfile,
            tenantProfileCompletion: tenantProfile?.profileCompletionPercentage || 0,
            landlordProfileCompletion: landlordProfile?.profileCompletionPercentage || 0,
            overallCompletion:
              tenantProfile && landlordProfile
                ? Math.round((tenantProfile.profileCompletionPercentage + landlordProfile.profileCompletionPercentage) / 2)
                : tenantProfile
                  ? tenantProfile.profileCompletionPercentage
                  : landlordProfile
                    ? landlordProfile.profileCompletionPercentage
                    : 0
          }
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al verificar el estado del perfil'
        });
      }
    })
});