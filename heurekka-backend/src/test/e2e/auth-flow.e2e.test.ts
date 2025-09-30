/**
 * End-to-End Tests for Authentication Flows
 *
 * These tests simulate real user journeys from signup through profile creation
 * and various authentication scenarios.
 */

import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { appRouter } from '@/routers';
import type { Context } from '@/server';
import {
  mockUsers,
  mockSessions,
  validSignupInputs,
  validTenantProfileInput,
  validLandlordProfileInputs,
  mockTenantProfiles,
  mockLandlordProfiles
} from '../fixtures/authFixtures';

// Mock all services
vi.mock('@/services/auth.service');
vi.mock('@/services/tenant-profile.service');
vi.mock('@/services/landlord-profile.service');

describe('E2E: Complete User Authentication Flows', () => {
  let publicContext: Context;
  let authenticatedContext: Context;

  beforeAll(() => {
    // Setup test database connection if needed
    console.log('Setting up E2E test environment');
  });

  afterAll(() => {
    // Cleanup test database
    console.log('Tearing down E2E test environment');
  });

  beforeEach(() => {
    vi.clearAllMocks();

    // Public context (unauthenticated)
    publicContext = {
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

    // Authenticated context
    authenticatedContext = {
      req: {
        headers: { authorization: 'Bearer valid-token' },
        ip: '192.168.1.1'
      },
      res: {},
      auth: {
        isAuthenticated: true,
        user: mockUsers.tenant,
        token: 'valid-token'
      }
    } as any;
  });

  describe('Flow 1: Tenant Signup → Profile Creation → Login', () => {
    it('should complete full tenant onboarding flow', async () => {
      // Step 1: User signs up as tenant
      const signupInput = validSignupInputs.tenant;

      // Mock signup response
      const { getAuthService } = await import('@/services/auth.service');
      const mockAuthService = vi.mocked(getAuthService)();
      mockAuthService.signup.mockResolvedValue({
        user: {
          id: 'new-user-123',
          email: signupInput.email,
          phone: signupInput.phone,
          emailVerified: false,
          phoneVerified: false
        },
        session: mockSessions.valid,
        profiles: {
          hasTenantProfile: false,
          hasLandlordProfile: false
        }
      });

      const caller = appRouter.createCaller(publicContext);
      const signupResult = await caller.auth.signup(signupInput);

      expect(signupResult.success).toBe(true);
      expect(signupResult.data.user.email).toBe(signupInput.email);
      expect(signupResult.data.profiles.hasTenantProfile).toBe(false);

      // Step 2: User creates tenant profile (now authenticated)
      const authContextAfterSignup = {
        ...publicContext,
        auth: {
          isAuthenticated: true,
          user: { id: 'new-user-123', email: signupInput.email },
          token: mockSessions.valid.accessToken
        }
      } as any;

      const { getTenantProfileService } = await import('@/services/tenant-profile.service');
      const mockTenantService = vi.mocked(getTenantProfileService)();
      mockTenantService.createTenantProfile.mockResolvedValue({
        ...mockTenantProfiles.complete,
        id: 'new-tenant-profile',
        userId: 'new-user-123',
        fullName: validTenantProfileInput.fullName
      } as any);

      const tenantCaller = appRouter.createCaller(authContextAfterSignup);
      const profileResult = await tenantCaller.tenantProfile.create(validTenantProfileInput);

      expect(profileResult.success).toBe(true);
      expect(profileResult.data.userId).toBe('new-user-123');
      expect(profileResult.data.fullName).toBe(validTenantProfileInput.fullName);

      // Step 3: User logs out
      mockAuthService.logout.mockResolvedValue(undefined);
      const logoutResult = await tenantCaller.auth.logout();

      expect(logoutResult.success).toBe(true);

      // Step 4: User logs back in
      mockAuthService.login.mockResolvedValue({
        user: {
          id: 'new-user-123',
          email: signupInput.email,
          emailVerified: false,
          phoneVerified: false
        },
        session: mockSessions.valid,
        profiles: {
          hasTenantProfile: true,
          hasLandlordProfile: false
        }
      });

      const loginResult = await caller.auth.login({
        email: signupInput.email,
        password: signupInput.password
      });

      expect(loginResult.success).toBe(true);
      expect(loginResult.data.profiles.hasTenantProfile).toBe(true);

      // Step 5: Verify profile exists
      mockTenantService.getTenantProfileByUserId.mockResolvedValue({
        ...mockTenantProfiles.complete,
        userId: 'new-user-123'
      } as any);

      const authContextAfterLogin = {
        ...publicContext,
        auth: {
          isAuthenticated: true,
          user: { id: 'new-user-123', email: signupInput.email },
          token: mockSessions.valid.accessToken
        }
      } as any;

      const loggedInCaller = appRouter.createCaller(authContextAfterLogin);
      const getCurrentUserResult = await loggedInCaller.auth.getCurrentUser();

      expect(getCurrentUserResult.success).toBe(true);
      expect(getCurrentUserResult.data.hasTenantProfile).toBe(true);
      expect(getCurrentUserResult.data.tenantProfile).toBeDefined();
    });
  });

  describe('Flow 2: Password Reset Flow', () => {
    it('should complete password reset flow', async () => {
      const userEmail = 'tenant@example.com';

      // Step 1: User requests password reset
      const { getAuthService } = await import('@/services/auth.service');
      const mockAuthService = vi.mocked(getAuthService)();
      mockAuthService.requestPasswordReset.mockResolvedValue({
        success: true,
        message: 'Si el correo existe, recibirás instrucciones para restablecer tu contraseña'
      });

      const caller = appRouter.createCaller(publicContext);
      const resetRequestResult = await caller.auth.requestPasswordReset({ email: userEmail });

      expect(resetRequestResult.success).toBe(true);
      expect(resetRequestResult.message).toContain('Si el correo existe');

      // Step 2: User receives email and uses reset token to update password
      const newPassword = 'NewSecurePassword123';
      mockAuthService.updatePassword.mockResolvedValue({ success: true });

      const updateResult = await caller.auth.updatePassword({
        newPassword,
        token: 'valid-reset-token'
      });

      expect(updateResult.success).toBe(true);
      expect(updateResult.message).toBe('Contraseña actualizada exitosamente');

      // Step 3: User logs in with new password
      mockAuthService.login.mockResolvedValue({
        user: mockUsers.tenant,
        session: mockSessions.valid,
        profiles: {
          hasTenantProfile: true,
          hasLandlordProfile: false
        }
      });

      const loginResult = await caller.auth.login({
        email: userEmail,
        password: newPassword
      });

      expect(loginResult.success).toBe(true);
      expect(loginResult.data.user.email).toBe(userEmail);
    });

    it('should handle expired reset token', async () => {
      const { getAuthService } = await import('@/services/auth.service');
      const mockAuthService = vi.mocked(getAuthService)();

      mockAuthService.updatePassword.mockRejectedValue({
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired reset token'
      });

      const caller = appRouter.createCaller(publicContext);

      await expect(caller.auth.updatePassword({
        newPassword: 'NewPassword123',
        token: 'expired-token'
      })).rejects.toMatchObject({
        code: 'UNAUTHORIZED'
      });
    });
  });

  describe('Flow 3: Context Upgrade (Tenant → Landlord)', () => {
    it('should allow user to create landlord profile after having tenant profile', async () => {
      // Start with authenticated tenant
      const { getTenantProfileService } = await import('@/services/tenant-profile.service');
      const { getLandlordProfileService } = await import('@/services/landlord-profile.service');

      const mockTenantService = vi.mocked(getTenantProfileService)();
      const mockLandlordService = vi.mocked(getLandlordProfileService)();

      // User already has tenant profile
      mockTenantService.getTenantProfileByUserId.mockResolvedValue(mockTenantProfiles.complete as any);
      mockLandlordService.getLandlordProfileByUserId.mockResolvedValue(null);

      const caller = appRouter.createCaller(authenticatedContext);

      // Step 1: Check current profile status
      const beforeUpgrade = await caller.auth.getCurrentUser();
      expect(beforeUpgrade.data.hasTenantProfile).toBe(true);
      expect(beforeUpgrade.data.hasLandlordProfile).toBe(false);

      // Step 2: Create landlord profile
      mockLandlordService.createLandlordProfile.mockResolvedValue({
        ...mockLandlordProfiles.individualOwner,
        userId: mockUsers.tenant.id
      } as any);

      const landlordProfileResult = await caller.landlordProfile.create(
        validLandlordProfileInputs.individualOwner
      );

      expect(landlordProfileResult.success).toBe(true);
      expect(landlordProfileResult.data.landlordType).toBe('individual_owner');

      // Step 3: Verify user now has both profiles
      mockLandlordService.getLandlordProfileByUserId.mockResolvedValue({
        ...mockLandlordProfiles.individualOwner,
        userId: mockUsers.tenant.id
      } as any);

      const afterUpgrade = await caller.auth.getCurrentUser();
      expect(afterUpgrade.data.hasTenantProfile).toBe(true);
      expect(afterUpgrade.data.hasLandlordProfile).toBe(true);

      // Step 4: Check profile completion for both
      const completionStatus = await caller.auth.checkProfileCompletion();
      expect(completionStatus.data.hasTenantProfile).toBe(true);
      expect(completionStatus.data.hasLandlordProfile).toBe(true);
      expect(completionStatus.data.overallCompletion).toBeGreaterThan(0);
    });
  });

  describe('Flow 4: Google OAuth Authentication', () => {
    it('should authenticate user with Google and create profile', async () => {
      const { getAuthService } = await import('@/services/auth.service');
      const { getTenantProfileService } = await import('@/services/tenant-profile.service');

      const mockAuthService = vi.mocked(getAuthService)();
      const mockTenantService = vi.mocked(getTenantProfileService)();

      // Step 1: User authenticates with Google
      mockAuthService.googleAuth.mockResolvedValue({
        user: {
          id: 'google-user-123',
          email: 'google@example.com',
          emailVerified: true,
          phoneVerified: false
        },
        session: mockSessions.valid,
        profiles: {
          hasTenantProfile: false,
          hasLandlordProfile: false
        }
      });

      const caller = appRouter.createCaller(publicContext);
      const googleAuthResult = await caller.auth.googleAuth({
        idToken: 'valid-google-token',
        intent: 'tenant'
      });

      expect(googleAuthResult.success).toBe(true);
      expect(googleAuthResult.data.user.emailVerified).toBe(true);

      // Step 2: Create tenant profile for Google user
      const authContextAfterGoogle = {
        ...publicContext,
        auth: {
          isAuthenticated: true,
          user: { id: 'google-user-123', email: 'google@example.com' },
          token: mockSessions.valid.accessToken
        }
      } as any;

      mockTenantService.createTenantProfile.mockResolvedValue({
        ...mockTenantProfiles.complete,
        userId: 'google-user-123'
      } as any);

      const googleCaller = appRouter.createCaller(authContextAfterGoogle);
      const profileResult = await googleCaller.tenantProfile.create(validTenantProfileInput);

      expect(profileResult.success).toBe(true);
      expect(profileResult.data.userId).toBe('google-user-123');
    });
  });

  describe('Flow 5: Session Refresh Flow', () => {
    it('should refresh expired session and continue operations', async () => {
      const { getAuthService } = await import('@/services/auth.service');
      const mockAuthService = vi.mocked(getAuthService)();

      // Step 1: User's access token expires
      const expiredContext = {
        ...publicContext,
        auth: {
          isAuthenticated: false, // Token expired
          user: null,
          token: mockSessions.expired.accessToken
        }
      } as any;

      // Step 2: Refresh session with refresh token
      mockAuthService.refreshSession.mockResolvedValue({
        user: mockUsers.tenant,
        session: {
          accessToken: 'new-access-token',
          refreshToken: 'new-refresh-token',
          expiresAt: Date.now() + 3600000
        },
        profiles: {
          hasTenantProfile: true,
          hasLandlordProfile: false
        }
      });

      const caller = appRouter.createCaller(expiredContext);
      const refreshResult = await caller.auth.refreshSession({
        refreshToken: mockSessions.expired.refreshToken
      });

      expect(refreshResult.success).toBe(true);
      expect(refreshResult.data.session.accessToken).toBe('new-access-token');

      // Step 3: Continue with new token
      const { getTenantProfileService } = await import('@/services/tenant-profile.service');
      const mockTenantService = vi.mocked(getTenantProfileService)();

      mockTenantService.getTenantProfileByUserId.mockResolvedValue(mockTenantProfiles.complete as any);

      const newContext = {
        ...publicContext,
        auth: {
          isAuthenticated: true,
          user: mockUsers.tenant,
          token: 'new-access-token'
        }
      } as any;

      const newCaller = appRouter.createCaller(newContext);
      const profileResult = await newCaller.tenantProfile.getCurrent();

      expect(profileResult.success).toBe(true);
    });

    it('should require re-login when refresh token also expires', async () => {
      const { getAuthService } = await import('@/services/auth.service');
      const mockAuthService = vi.mocked(getAuthService)();

      mockAuthService.refreshSession.mockRejectedValue({
        code: 'UNAUTHORIZED',
        message: 'Session expired. Please login again.'
      });

      const caller = appRouter.createCaller(publicContext);

      await expect(caller.auth.refreshSession({
        refreshToken: 'double-expired-token'
      })).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
        message: 'Session expired. Please login again.'
      });
    });
  });

  describe('Flow 6: Profile Completion Tracking', () => {
    it('should track profile completion as user adds information', async () => {
      const { getTenantProfileService } = await import('@/services/tenant-profile.service');
      const mockTenantService = vi.mocked(getTenantProfileService)();

      const caller = appRouter.createCaller(authenticatedContext);

      // Step 1: Minimal profile (30% complete)
      mockTenantService.createTenantProfile.mockResolvedValue({
        ...mockTenantProfiles.partial,
        userId: mockUsers.tenant.id
      } as any);

      const initialProfile = await caller.tenantProfile.create({
        fullName: 'Test User',
        phone: '9999-9999'
      });

      expect(initialProfile.data.profileCompletionPercentage).toBe(30);

      // Step 2: Add more information (60% complete)
      mockTenantService.getTenantProfileByUserId.mockResolvedValue({
        ...mockTenantProfiles.partial,
        userId: mockUsers.tenant.id
      } as any);

      mockTenantService.updateTenantProfile.mockResolvedValue({
        ...mockTenantProfiles.partial,
        occupation: 'Engineer',
        budgetMin: 10000,
        budgetMax: 20000,
        profileCompletionPercentage: 60,
        userId: mockUsers.tenant.id
      } as any);

      const updateResult1 = await caller.tenantProfile.update({
        occupation: 'Engineer',
        budgetMin: 10000,
        budgetMax: 20000
      });

      expect(updateResult1.data.profileCompletionPercentage).toBe(60);

      // Step 3: Complete profile (100%)
      mockTenantService.getTenantProfileByUserId.mockResolvedValue({
        ...mockTenantProfiles.partial,
        occupation: 'Engineer',
        budgetMin: 10000,
        budgetMax: 20000,
        userId: mockUsers.tenant.id
      } as any);

      mockTenantService.updateTenantProfile.mockResolvedValue({
        ...mockTenantProfiles.complete,
        userId: mockUsers.tenant.id
      } as any);

      const updateResult2 = await caller.tenantProfile.update({
        moveDate: '2024-12-01',
        occupants: '2 adults',
        preferredAreas: ['Lomas del Guijarro'],
        hasReferences: true
      });

      expect(updateResult2.data.profileCompletionPercentage).toBe(100);
    });
  });
});