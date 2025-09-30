import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { authRouter } from '@/routers/auth';
import { getAuthService } from '@/services/auth.service';
import { getTenantProfileService } from '@/services/tenant-profile.service';
import { getLandlordProfileService } from '@/services/landlord-profile.service';
import type { Context } from '@/server';
import { TRPCError } from '@trpc/server';

// Mock services
vi.mock('@/services/auth.service');
vi.mock('@/services/tenant-profile.service');
vi.mock('@/services/landlord-profile.service');

describe('Auth Router Integration Tests', () => {
  let mockContext: Context;
  let mockAuthService: any;
  let mockTenantProfileService: any;
  let mockLandlordProfileService: any;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    phone: '9999-9999',
    emailVerified: true,
    phoneVerified: false
  };

  const mockSession = {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    expiresAt: Date.now() + 3600000
  };

  const mockAuthResponse = {
    user: mockUser,
    session: mockSession,
    profiles: {
      hasTenantProfile: false,
      hasLandlordProfile: false
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup public context (no auth)
    mockContext = {
      req: {
        headers: {},
        ip: '192.168.1.1'
      },
      res: {},
      auth: {
        isAuthenticated: false,
        user: null,
        token: null
      }
    } as any;

    // Setup mock services
    mockAuthService = {
      signup: vi.fn(),
      login: vi.fn(),
      logout: vi.fn(),
      refreshSession: vi.fn(),
      verifySession: vi.fn(),
      requestPasswordReset: vi.fn(),
      updatePassword: vi.fn(),
      sendEmailVerification: vi.fn(),
      googleAuth: vi.fn(),
      healthCheck: vi.fn()
    };

    mockTenantProfileService = {
      getTenantProfileByUserId: vi.fn(),
      createTenantProfile: vi.fn(),
      updateTenantProfile: vi.fn(),
      deleteTenantProfile: vi.fn()
    };

    mockLandlordProfileService = {
      getLandlordProfileByUserId: vi.fn(),
      createLandlordProfile: vi.fn(),
      updateLandlordProfile: vi.fn(),
      deleteLandlordProfile: vi.fn()
    };

    vi.mocked(getAuthService).mockReturnValue(mockAuthService);
    vi.mocked(getTenantProfileService).mockReturnValue(mockTenantProfileService);
    vi.mocked(getLandlordProfileService).mockReturnValue(mockLandlordProfileService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('signup mutation', () => {
    const validSignupInput = {
      email: 'test@example.com',
      password: 'Password123',
      fullName: 'Test User',
      phone: '9999-9999',
      intent: 'tenant' as const
    };

    it('should create user account successfully', async () => {
      mockAuthService.signup.mockResolvedValue(mockAuthResponse);

      const caller = authRouter.createCaller(mockContext);
      const result = await caller.signup(validSignupInput);

      expect(mockAuthService.signup).toHaveBeenCalledWith(validSignupInput);
      expect(result.success).toBe(true);
      expect(result.data.user.id).toBe('user-123');
      expect(result.message).toBe('Cuenta creada exitosamente');
    });

    it('should validate email format', async () => {
      const invalidInput = { ...validSignupInput, email: 'invalid-email' };

      const caller = authRouter.createCaller(mockContext);
      await expect(caller.signup(invalidInput)).rejects.toThrow();
    });

    it('should validate password length', async () => {
      const invalidInput = { ...validSignupInput, password: 'short' };

      const caller = authRouter.createCaller(mockContext);
      await expect(caller.signup(invalidInput)).rejects.toThrow();
    });

    it('should validate Honduras phone format', async () => {
      const invalidInput = { ...validSignupInput, phone: '12345678' };

      const caller = authRouter.createCaller(mockContext);
      await expect(caller.signup(invalidInput)).rejects.toThrow();
    });

    it('should handle duplicate email error', async () => {
      mockAuthService.signup.mockRejectedValue(
        new TRPCError({
          code: 'CONFLICT',
          message: 'Ya existe una cuenta con este correo electrónico'
        })
      );

      const caller = authRouter.createCaller(mockContext);
      await expect(caller.signup(validSignupInput)).rejects.toMatchObject({
        code: 'CONFLICT',
        message: 'Ya existe una cuenta con este correo electrónico'
      });
    });

    it('should handle service errors gracefully', async () => {
      mockAuthService.signup.mockRejectedValue(new Error('Unexpected error'));

      const caller = authRouter.createCaller(mockContext);
      await expect(caller.signup(validSignupInput)).rejects.toMatchObject({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error al crear la cuenta'
      });
    });
  });

  describe('login mutation', () => {
    const validLoginInput = {
      email: 'test@example.com',
      password: 'Password123'
    };

    it('should login user successfully', async () => {
      mockAuthService.login.mockResolvedValue(mockAuthResponse);

      const caller = authRouter.createCaller(mockContext);
      const result = await caller.login(validLoginInput);

      expect(mockAuthService.login).toHaveBeenCalledWith(validLoginInput);
      expect(result.success).toBe(true);
      expect(result.data.session.accessToken).toBe('mock-access-token');
      expect(result.message).toBe('Inicio de sesión exitoso');
    });

    it('should validate email format', async () => {
      const invalidInput = { ...validLoginInput, email: 'invalid' };

      const caller = authRouter.createCaller(mockContext);
      await expect(caller.login(invalidInput)).rejects.toThrow();
    });

    it('should require password', async () => {
      const invalidInput = { ...validLoginInput, password: '' };

      const caller = authRouter.createCaller(mockContext);
      await expect(caller.login(invalidInput)).rejects.toThrow();
    });

    it('should handle invalid credentials', async () => {
      mockAuthService.login.mockRejectedValue(
        new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Correo o contraseña incorrectos'
        })
      );

      const caller = authRouter.createCaller(mockContext);
      await expect(caller.login(validLoginInput)).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
        message: 'Correo o contraseña incorrectos'
      });
    });

    it('should handle unverified email error', async () => {
      mockAuthService.login.mockRejectedValue(
        new TRPCError({
          code: 'FORBIDDEN',
          message: 'Por favor verifica tu correo electrónico antes de iniciar sesión'
        })
      );

      const caller = authRouter.createCaller(mockContext);
      await expect(caller.login(validLoginInput)).rejects.toMatchObject({
        code: 'FORBIDDEN'
      });
    });
  });

  describe('logout mutation', () => {
    it('should logout authenticated user', async () => {
      const authContext = {
        ...mockContext,
        auth: {
          isAuthenticated: true,
          user: mockUser,
          token: 'valid-token'
        }
      } as any;

      mockAuthService.logout.mockResolvedValue(undefined);

      const caller = authRouter.createCaller(authContext);
      const result = await caller.logout();

      expect(mockAuthService.logout).toHaveBeenCalledWith('valid-token');
      expect(result.success).toBe(true);
      expect(result.message).toBe('Sesión cerrada exitosamente');
    });

    it('should handle logout without token', async () => {
      const authContext = {
        ...mockContext,
        auth: {
          isAuthenticated: true,
          user: mockUser,
          token: null
        }
      } as any;

      const caller = authRouter.createCaller(authContext);
      const result = await caller.logout();

      expect(result.success).toBe(true);
    });

    it('should always return success even on error', async () => {
      const authContext = {
        ...mockContext,
        auth: {
          isAuthenticated: true,
          user: mockUser,
          token: 'valid-token'
        }
      } as any;

      mockAuthService.logout.mockRejectedValue(new Error('Logout failed'));

      const caller = authRouter.createCaller(authContext);
      const result = await caller.logout();

      expect(result.success).toBe(true);
    });
  });

  describe('refreshSession mutation', () => {
    const validRefreshInput = {
      refreshToken: 'valid-refresh-token'
    };

    it('should refresh session successfully', async () => {
      const newAuthResponse = {
        ...mockAuthResponse,
        session: {
          accessToken: 'new-access-token',
          refreshToken: 'new-refresh-token',
          expiresAt: Date.now() + 3600000
        }
      };

      mockAuthService.refreshSession.mockResolvedValue(newAuthResponse);

      const caller = authRouter.createCaller(mockContext);
      const result = await caller.refreshSession(validRefreshInput);

      expect(mockAuthService.refreshSession).toHaveBeenCalledWith('valid-refresh-token');
      expect(result.success).toBe(true);
      expect(result.data.session.accessToken).toBe('new-access-token');
      expect(result.message).toBe('Sesión actualizada');
    });

    it('should validate refresh token is provided', async () => {
      const invalidInput = { refreshToken: '' };

      const caller = authRouter.createCaller(mockContext);
      await expect(caller.refreshSession(invalidInput)).rejects.toThrow();
    });

    it('should handle expired refresh token', async () => {
      mockAuthService.refreshSession.mockRejectedValue(
        new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Session expired. Please login again.'
        })
      );

      const caller = authRouter.createCaller(mockContext);
      await expect(caller.refreshSession(validRefreshInput)).rejects.toMatchObject({
        code: 'UNAUTHORIZED'
      });
    });

    it('should handle service errors', async () => {
      mockAuthService.refreshSession.mockRejectedValue(new Error('Network error'));

      const caller = authRouter.createCaller(mockContext);
      await expect(caller.refreshSession(validRefreshInput)).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
        message: 'No se pudo actualizar la sesión'
      });
    });
  });

  describe('googleAuth mutation', () => {
    const validGoogleInput = {
      idToken: 'valid-google-token',
      intent: 'tenant' as const
    };

    it('should authenticate with Google successfully', async () => {
      mockAuthService.googleAuth.mockResolvedValue(mockAuthResponse);

      const caller = authRouter.createCaller(mockContext);
      const result = await caller.googleAuth(validGoogleInput);

      expect(mockAuthService.googleAuth).toHaveBeenCalledWith(validGoogleInput);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Autenticación con Google exitosa');
    });

    it('should validate Google token is provided', async () => {
      const invalidInput = { idToken: '', intent: 'tenant' as const };

      const caller = authRouter.createCaller(mockContext);
      await expect(caller.googleAuth(invalidInput)).rejects.toThrow();
    });

    it('should handle invalid Google token', async () => {
      mockAuthService.googleAuth.mockRejectedValue(
        new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Google authentication failed'
        })
      );

      const caller = authRouter.createCaller(mockContext);
      await expect(caller.googleAuth(validGoogleInput)).rejects.toMatchObject({
        code: 'UNAUTHORIZED'
      });
    });

    it('should work without intent', async () => {
      const inputWithoutIntent = { idToken: 'valid-google-token' };
      mockAuthService.googleAuth.mockResolvedValue(mockAuthResponse);

      const caller = authRouter.createCaller(mockContext);
      const result = await caller.googleAuth(inputWithoutIntent);

      expect(result.success).toBe(true);
    });
  });

  describe('requestPasswordReset mutation', () => {
    const validResetInput = {
      email: 'test@example.com'
    };

    it('should send password reset email', async () => {
      mockAuthService.requestPasswordReset.mockResolvedValue({
        success: true,
        message: 'Si el correo existe, recibirás instrucciones para restablecer tu contraseña'
      });

      const caller = authRouter.createCaller(mockContext);
      const result = await caller.requestPasswordReset(validResetInput);

      expect(mockAuthService.requestPasswordReset).toHaveBeenCalledWith(validResetInput);
      expect(result.success).toBe(true);
      expect(result.message).toContain('Si el correo existe');
    });

    it('should validate email format', async () => {
      const invalidInput = { email: 'invalid-email' };

      const caller = authRouter.createCaller(mockContext);
      await expect(caller.requestPasswordReset(invalidInput)).rejects.toThrow();
    });

    it('should always return success (security)', async () => {
      mockAuthService.requestPasswordReset.mockRejectedValue(new Error('User not found'));

      const caller = authRouter.createCaller(mockContext);
      const result = await caller.requestPasswordReset(validResetInput);

      expect(result.success).toBe(true);
      expect(result.message).toContain('Si el correo existe');
    });
  });

  describe('updatePassword mutation', () => {
    const validUpdateInput = {
      newPassword: 'NewPassword123',
      token: 'reset-token'
    };

    it('should update password successfully', async () => {
      mockAuthService.updatePassword.mockResolvedValue({ success: true });

      const caller = authRouter.createCaller(mockContext);
      const result = await caller.updatePassword(validUpdateInput);

      expect(mockAuthService.updatePassword).toHaveBeenCalledWith(validUpdateInput);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Contraseña actualizada exitosamente');
    });

    it('should validate new password length', async () => {
      const invalidInput = { ...validUpdateInput, newPassword: 'short' };

      const caller = authRouter.createCaller(mockContext);
      await expect(caller.updatePassword(invalidInput)).rejects.toThrow();
    });

    it('should validate token is provided', async () => {
      const invalidInput = { ...validUpdateInput, token: '' };

      const caller = authRouter.createCaller(mockContext);
      await expect(caller.updatePassword(invalidInput)).rejects.toThrow();
    });

    it('should handle invalid or expired token', async () => {
      mockAuthService.updatePassword.mockRejectedValue(
        new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid or expired reset token'
        })
      );

      const caller = authRouter.createCaller(mockContext);
      await expect(caller.updatePassword(validUpdateInput)).rejects.toMatchObject({
        code: 'UNAUTHORIZED'
      });
    });
  });

  describe('sendEmailVerification mutation', () => {
    const validInput = {
      email: 'test@example.com'
    };

    it('should send verification email', async () => {
      const authContext = {
        ...mockContext,
        auth: {
          isAuthenticated: true,
          user: mockUser,
          token: 'valid-token'
        }
      } as any;

      mockAuthService.sendEmailVerification.mockResolvedValue({ success: true });

      const caller = authRouter.createCaller(authContext);
      const result = await caller.sendEmailVerification(validInput);

      expect(mockAuthService.sendEmailVerification).toHaveBeenCalledWith(validInput.email);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Correo de verificación enviado');
    });

    it('should always return success even on error', async () => {
      const authContext = {
        ...mockContext,
        auth: {
          isAuthenticated: true,
          user: mockUser,
          token: 'valid-token'
        }
      } as any;

      mockAuthService.sendEmailVerification.mockRejectedValue(new Error('Email service error'));

      const caller = authRouter.createCaller(authContext);
      const result = await caller.sendEmailVerification(validInput);

      expect(result.success).toBe(true);
    });
  });

  describe('verifySession query', () => {
    it('should verify valid session', async () => {
      const authContext = {
        ...mockContext,
        auth: {
          isAuthenticated: true,
          user: mockUser,
          token: 'valid-token'
        }
      } as any;

      const mockSessionInfo = {
        userId: 'user-123',
        email: 'test@example.com',
        isAuthenticated: true,
        expiresAt: new Date(Date.now() + 3600000)
      };

      mockAuthService.verifySession.mockResolvedValue(mockSessionInfo);

      const caller = authRouter.createCaller(authContext);
      const result = await caller.verifySession();

      expect(mockAuthService.verifySession).toHaveBeenCalledWith('valid-token');
      expect(result.success).toBe(true);
      expect(result.data.userId).toBe('user-123');
    });

    it('should reject unauthenticated request', async () => {
      const caller = authRouter.createCaller(mockContext);
      await expect(caller.verifySession()).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
        message: 'Sesión inválida'
      });
    });

    it('should handle invalid token', async () => {
      const authContext = {
        ...mockContext,
        auth: {
          isAuthenticated: true,
          user: mockUser,
          token: 'invalid-token'
        }
      } as any;

      mockAuthService.verifySession.mockRejectedValue(
        new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid or expired session'
        })
      );

      const caller = authRouter.createCaller(authContext);
      await expect(caller.verifySession()).rejects.toMatchObject({
        code: 'UNAUTHORIZED'
      });
    });
  });

  describe('getCurrentUser query', () => {
    it('should return user with profiles', async () => {
      const authContext = {
        ...mockContext,
        auth: {
          isAuthenticated: true,
          user: mockUser,
          token: 'valid-token'
        }
      } as any;

      const mockTenantProfile = {
        id: 'tenant-profile-123',
        userId: 'user-123',
        fullName: 'Test User',
        phone: '9999-9999',
        profileCompletionPercentage: 85
      };

      const mockLandlordProfile = {
        id: 'landlord-profile-123',
        userId: 'user-123',
        landlordType: 'individual_owner',
        profileCompletionPercentage: 70
      };

      mockTenantProfileService.getTenantProfileByUserId.mockResolvedValue(mockTenantProfile);
      mockLandlordProfileService.getLandlordProfileByUserId.mockResolvedValue(mockLandlordProfile);

      const caller = authRouter.createCaller(authContext);
      const result = await caller.getCurrentUser();

      expect(result.success).toBe(true);
      expect(result.data.user.id).toBe('user-123');
      expect(result.data.hasTenantProfile).toBe(true);
      expect(result.data.hasLandlordProfile).toBe(true);
      expect(result.data.tenantProfile).toEqual(mockTenantProfile);
      expect(result.data.landlordProfile).toEqual(mockLandlordProfile);
    });

    it('should handle user without profiles', async () => {
      const authContext = {
        ...mockContext,
        auth: {
          isAuthenticated: true,
          user: mockUser,
          token: 'valid-token'
        }
      } as any;

      mockTenantProfileService.getTenantProfileByUserId.mockResolvedValue(null);
      mockLandlordProfileService.getLandlordProfileByUserId.mockResolvedValue(null);

      const caller = authRouter.createCaller(authContext);
      const result = await caller.getCurrentUser();

      expect(result.success).toBe(true);
      expect(result.data.hasTenantProfile).toBe(false);
      expect(result.data.hasLandlordProfile).toBe(false);
    });

    it('should reject unauthenticated request', async () => {
      const caller = authRouter.createCaller(mockContext);
      await expect(caller.getCurrentUser()).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
        message: 'Usuario no autenticado'
      });
    });
  });

  describe('checkProfileCompletion query', () => {
    it('should return profile completion status', async () => {
      const authContext = {
        ...mockContext,
        auth: {
          isAuthenticated: true,
          user: mockUser,
          token: 'valid-token'
        }
      } as any;

      const mockTenantProfile = {
        id: 'tenant-profile-123',
        userId: 'user-123',
        profileCompletionPercentage: 85
      };

      mockTenantProfileService.getTenantProfileByUserId.mockResolvedValue(mockTenantProfile);
      mockLandlordProfileService.getLandlordProfileByUserId.mockResolvedValue(null);

      const caller = authRouter.createCaller(authContext);
      const result = await caller.checkProfileCompletion();

      expect(result.success).toBe(true);
      expect(result.data.hasTenantProfile).toBe(true);
      expect(result.data.hasLandlordProfile).toBe(false);
      expect(result.data.tenantProfileCompletion).toBe(85);
      expect(result.data.landlordProfileCompletion).toBe(0);
      expect(result.data.overallCompletion).toBe(85);
    });

    it('should calculate average completion for both profiles', async () => {
      const authContext = {
        ...mockContext,
        auth: {
          isAuthenticated: true,
          user: mockUser,
          token: 'valid-token'
        }
      } as any;

      const mockTenantProfile = {
        id: 'tenant-profile-123',
        profileCompletionPercentage: 80
      };

      const mockLandlordProfile = {
        id: 'landlord-profile-123',
        profileCompletionPercentage: 60
      };

      mockTenantProfileService.getTenantProfileByUserId.mockResolvedValue(mockTenantProfile);
      mockLandlordProfileService.getLandlordProfileByUserId.mockResolvedValue(mockLandlordProfile);

      const caller = authRouter.createCaller(authContext);
      const result = await caller.checkProfileCompletion();

      expect(result.data.overallCompletion).toBe(70); // (80 + 60) / 2
    });

    it('should return 0 when no profiles exist', async () => {
      const authContext = {
        ...mockContext,
        auth: {
          isAuthenticated: true,
          user: mockUser,
          token: 'valid-token'
        }
      } as any;

      mockTenantProfileService.getTenantProfileByUserId.mockResolvedValue(null);
      mockLandlordProfileService.getLandlordProfileByUserId.mockResolvedValue(null);

      const caller = authRouter.createCaller(authContext);
      const result = await caller.checkProfileCompletion();

      expect(result.data.overallCompletion).toBe(0);
    });

    it('should reject unauthenticated request', async () => {
      const caller = authRouter.createCaller(mockContext);
      await expect(caller.checkProfileCompletion()).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
        message: 'Usuario no autenticado'
      });
    });
  });
});