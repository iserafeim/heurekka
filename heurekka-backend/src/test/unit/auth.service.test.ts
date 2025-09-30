import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TRPCError } from '@trpc/server';
import { AuthService } from '@/services/auth.service';
import type { SignupInput, LoginInput, GoogleAuthInput, ResetPasswordInput, UpdatePasswordInput } from '@/services/auth.service';

// Mock Supabase client
const mockSupabaseAuth = {
  signUp: vi.fn(),
  signInWithPassword: vi.fn(),
  signInWithIdToken: vi.fn(),
  signOut: vi.fn(),
  refreshSession: vi.fn(),
  getUser: vi.fn(),
  getSession: vi.fn(),
  resetPasswordForEmail: vi.fn(),
  updateUser: vi.fn(),
  resend: vi.fn(),
  admin: {
    signOut: vi.fn(),
    updateUserById: vi.fn()
  }
};

const mockSupabaseFrom = vi.fn().mockReturnThis();
const mockSupabaseSelect = vi.fn().mockReturnThis();
const mockSupabaseEq = vi.fn().mockReturnThis();
const mockSupabaseUpdate = vi.fn().mockReturnThis();
const mockSupabaseSingle = vi.fn();

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: mockSupabaseAuth,
    from: mockSupabaseFrom,
    raw: vi.fn((value) => value)
  }))
}));

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup environment variables
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_ANON_KEY = 'test-anon-key';
    process.env.SUPABASE_SERVICE_KEY = 'test-service-key';
    process.env.FRONTEND_URL = 'https://test.frontend.com';

    // Setup default mock responses
    mockSupabaseFrom.mockReturnValue({
      select: mockSupabaseSelect,
      update: mockSupabaseUpdate
    });
    mockSupabaseSelect.mockReturnValue({
      eq: mockSupabaseEq
    });
    mockSupabaseEq.mockReturnValue({
      single: mockSupabaseSingle
    });
    mockSupabaseUpdate.mockReturnValue({
      eq: mockSupabaseEq
    });

    authService = new AuthService();
  });

  afterEach(() => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_ANON_KEY;
    delete process.env.SUPABASE_SERVICE_KEY;
    delete process.env.FRONTEND_URL;
  });

  describe('constructor', () => {
    it('should throw error when SUPABASE_URL is missing', () => {
      delete process.env.SUPABASE_URL;
      expect(() => new AuthService()).toThrow('Missing Supabase configuration for authentication service');
    });

    it('should throw error when SUPABASE_ANON_KEY is missing', () => {
      delete process.env.SUPABASE_ANON_KEY;
      expect(() => new AuthService()).toThrow('Missing Supabase configuration for authentication service');
    });

    it('should throw error when SUPABASE_SERVICE_KEY is missing', () => {
      delete process.env.SUPABASE_SERVICE_KEY;
      expect(() => new AuthService()).toThrow('Missing Supabase configuration for authentication service');
    });

    it('should initialize successfully with all required environment variables', () => {
      expect(() => new AuthService()).not.toThrow();
    });
  });

  describe('signup', () => {
    const validSignupInput: SignupInput = {
      email: 'test@example.com',
      password: 'Password123',
      fullName: 'Test User',
      phone: '9999-9999',
      intent: 'tenant'
    };

    beforeEach(() => {
      mockSupabaseSingle.mockResolvedValue({
        data: { has_tenant_profile: false, has_landlord_profile: false },
        error: null
      });
    });

    it('should create user successfully with valid input', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        phone: '9999-9999',
        email_confirmed_at: null,
        phone_confirmed_at: null
      };
      const mockSession = {
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        expires_at: Date.now() + 3600000
      };

      mockSupabaseAuth.signUp.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null
      });

      const result = await authService.signup(validSignupInput);

      expect(mockSupabaseAuth.signUp).toHaveBeenCalledWith({
        email: validSignupInput.email,
        password: validSignupInput.password,
        options: {
          data: {
            full_name: validSignupInput.fullName,
            phone: validSignupInput.phone,
            intent: validSignupInput.intent
          }
        }
      });

      expect(result.user.id).toBe('user-123');
      expect(result.user.email).toBe('test@example.com');
      expect(result.user.emailVerified).toBe(false);
      expect(result.session.accessToken).toBe('access-token');
      expect(result.profiles.hasTenantProfile).toBe(false);
      expect(result.profiles.hasLandlordProfile).toBe(false);
    });

    it('should validate email format', async () => {
      const invalidInput = { ...validSignupInput, email: 'invalid-email' };

      await expect(authService.signup(invalidInput)).rejects.toThrow(TRPCError);
      await expect(authService.signup(invalidInput)).rejects.toMatchObject({
        code: 'BAD_REQUEST',
        message: 'Correo electrónico inválido'
      });
    });

    it('should validate password length', async () => {
      const invalidInput = { ...validSignupInput, password: 'short' };

      await expect(authService.signup(invalidInput)).rejects.toThrow(TRPCError);
      await expect(authService.signup(invalidInput)).rejects.toMatchObject({
        code: 'BAD_REQUEST',
        message: 'La contraseña debe tener al menos 8 caracteres'
      });
    });

    it('should validate password complexity', async () => {
      const noUppercase = { ...validSignupInput, password: 'password123' };
      await expect(authService.signup(noUppercase)).rejects.toMatchObject({
        code: 'BAD_REQUEST',
        message: 'La contraseña debe incluir mayúsculas, minúsculas y números'
      });

      const noLowercase = { ...validSignupInput, password: 'PASSWORD123' };
      await expect(authService.signup(noLowercase)).rejects.toMatchObject({
        code: 'BAD_REQUEST',
        message: 'La contraseña debe incluir mayúsculas, minúsculas y números'
      });

      const noNumber = { ...validSignupInput, password: 'PasswordABC' };
      await expect(authService.signup(noNumber)).rejects.toMatchObject({
        code: 'BAD_REQUEST',
        message: 'La contraseña debe incluir mayúsculas, minúsculas y números'
      });
    });

    it('should handle duplicate email error', async () => {
      mockSupabaseAuth.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'User already registered', name: 'AuthError', status: 400 }
      });

      await expect(authService.signup(validSignupInput)).rejects.toMatchObject({
        code: 'CONFLICT',
        message: 'Ya existe una cuenta con este correo electrónico'
      });
    });

    it('should handle Supabase auth errors', async () => {
      mockSupabaseAuth.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Unknown error', name: 'AuthError', status: 500 }
      });

      await expect(authService.signup(validSignupInput)).rejects.toThrow(TRPCError);
    });

    it('should handle missing user or session in response', async () => {
      mockSupabaseAuth.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error: null
      });

      await expect(authService.signup(validSignupInput)).rejects.toMatchObject({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create user account'
      });
    });

    it('should check user profiles after signup', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        email_confirmed_at: null
      };
      const mockSession = {
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        expires_at: Date.now() + 3600000
      };

      mockSupabaseAuth.signUp.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null
      });

      mockSupabaseSingle.mockResolvedValue({
        data: { has_tenant_profile: true, has_landlord_profile: false },
        error: null
      });

      const result = await authService.signup(validSignupInput);

      expect(result.profiles.hasTenantProfile).toBe(true);
      expect(result.profiles.hasLandlordProfile).toBe(false);
    });
  });

  describe('login', () => {
    const validLoginInput: LoginInput = {
      email: 'test@example.com',
      password: 'Password123'
    };

    beforeEach(() => {
      mockSupabaseSingle.mockResolvedValue({
        data: { has_tenant_profile: false, has_landlord_profile: false },
        error: null
      });
    });

    it('should login user successfully with valid credentials', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        email_confirmed_at: '2024-01-01',
        phone_confirmed_at: null
      };
      const mockSession = {
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        expires_at: Date.now() + 3600000
      };

      mockSupabaseAuth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null
      });

      const result = await authService.login(validLoginInput);

      expect(mockSupabaseAuth.signInWithPassword).toHaveBeenCalledWith({
        email: validLoginInput.email,
        password: validLoginInput.password
      });

      expect(result.user.id).toBe('user-123');
      expect(result.user.emailVerified).toBe(true);
      expect(result.session.accessToken).toBe('access-token');
    });

    it('should validate email format on login', async () => {
      const invalidInput = { ...validLoginInput, email: 'invalid-email' };

      await expect(authService.login(invalidInput)).rejects.toMatchObject({
        code: 'BAD_REQUEST',
        message: 'Correo electrónico inválido'
      });
    });

    it('should handle invalid credentials error', async () => {
      mockSupabaseAuth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials', name: 'AuthError', status: 400 }
      });

      await expect(authService.login(validLoginInput)).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
        message: 'Correo o contraseña incorrectos'
      });
    });

    it('should handle email not confirmed error', async () => {
      mockSupabaseAuth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Email not confirmed', name: 'AuthError', status: 400 }
      });

      await expect(authService.login(validLoginInput)).rejects.toMatchObject({
        code: 'FORBIDDEN',
        message: 'Por favor verifica tu correo electrónico antes de iniciar sesión'
      });
    });

    it('should update last login timestamp', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        email_confirmed_at: '2024-01-01'
      };
      const mockSession = {
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        expires_at: Date.now() + 3600000
      };

      mockSupabaseAuth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null
      });

      await authService.login(validLoginInput);

      expect(mockSupabaseUpdate).toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should logout user successfully', async () => {
      mockSupabaseAuth.admin.signOut.mockResolvedValue({ error: null });

      await authService.logout('test-token');

      expect(mockSupabaseAuth.admin.signOut).toHaveBeenCalledWith('test-token');
    });

    it('should not throw error on logout failure', async () => {
      mockSupabaseAuth.admin.signOut.mockResolvedValue({
        error: { message: 'Logout failed', name: 'AuthError', status: 400 }
      });

      await expect(authService.logout('test-token')).resolves.not.toThrow();
    });
  });

  describe('refreshSession', () => {
    it('should refresh session successfully', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        email_confirmed_at: '2024-01-01'
      };
      const mockSession = {
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
        expires_at: Date.now() + 3600000
      };

      mockSupabaseAuth.refreshSession.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null
      });

      mockSupabaseSingle.mockResolvedValue({
        data: { has_tenant_profile: false, has_landlord_profile: false },
        error: null
      });

      const result = await authService.refreshSession('old-refresh-token');

      expect(mockSupabaseAuth.refreshSession).toHaveBeenCalledWith({
        refresh_token: 'old-refresh-token'
      });

      expect(result.session.accessToken).toBe('new-access-token');
      expect(result.session.refreshToken).toBe('new-refresh-token');
    });

    it('should handle expired refresh token', async () => {
      mockSupabaseAuth.refreshSession.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Token expired', name: 'AuthError', status: 401 }
      });

      await expect(authService.refreshSession('expired-token')).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
        message: 'Session expired. Please login again.'
      });
    });

    it('should handle missing session or user', async () => {
      mockSupabaseAuth.refreshSession.mockResolvedValue({
        data: { user: null, session: null },
        error: null
      });

      await expect(authService.refreshSession('test-token')).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
        message: 'Session expired. Please login again.'
      });
    });
  });

  describe('verifySession', () => {
    it('should verify valid session', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        phone: '9999-9999'
      };

      mockSupabaseAuth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      const result = await authService.verifySession('valid-token');

      expect(result.userId).toBe('user-123');
      expect(result.email).toBe('test@example.com');
      expect(result.isAuthenticated).toBe(true);
      expect(result.expiresAt).toBeInstanceOf(Date);
    });

    it('should handle invalid token', async () => {
      mockSupabaseAuth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid token', name: 'AuthError', status: 401 }
      });

      await expect(authService.verifySession('invalid-token')).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired session'
      });
    });

    it('should handle missing user', async () => {
      mockSupabaseAuth.getUser.mockResolvedValue({
        data: { user: null },
        error: null
      });

      await expect(authService.verifySession('test-token')).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired session'
      });
    });
  });

  describe('requestPasswordReset', () => {
    const validResetInput: ResetPasswordInput = {
      email: 'test@example.com'
    };

    it('should send password reset email successfully', async () => {
      mockSupabaseAuth.resetPasswordForEmail.mockResolvedValue({ error: null });

      const result = await authService.requestPasswordReset(validResetInput);

      expect(mockSupabaseAuth.resetPasswordForEmail).toHaveBeenCalledWith(
        validResetInput.email,
        { redirectTo: 'https://test.frontend.com/reset-password' }
      );

      expect(result.success).toBe(true);
      expect(result.message).toContain('Si el correo existe');
    });

    it('should validate email format', async () => {
      const invalidInput = { email: 'invalid-email' };

      const result = await authService.requestPasswordReset(invalidInput);

      // Should still return success to not reveal if email exists
      expect(result.success).toBe(true);
    });

    it('should not reveal if email exists on error', async () => {
      mockSupabaseAuth.resetPasswordForEmail.mockResolvedValue({
        error: { message: 'User not found', name: 'AuthError', status: 404 }
      });

      const result = await authService.requestPasswordReset(validResetInput);

      expect(result.success).toBe(true);
      expect(result.message).toContain('Si el correo existe');
    });

    it('should handle exceptions gracefully', async () => {
      mockSupabaseAuth.resetPasswordForEmail.mockRejectedValue(new Error('Network error'));

      const result = await authService.requestPasswordReset(validResetInput);

      expect(result.success).toBe(true);
      expect(result.message).toContain('Si el correo existe');
    });
  });

  describe('updatePassword', () => {
    const validUpdateInput: UpdatePasswordInput = {
      newPassword: 'NewPassword123',
      token: 'reset-token'
    };

    it('should update password successfully', async () => {
      mockSupabaseAuth.updateUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null
      });

      const result = await authService.updatePassword(validUpdateInput);

      expect(mockSupabaseAuth.updateUser).toHaveBeenCalledWith({
        password: validUpdateInput.newPassword
      });

      expect(result.success).toBe(true);
    });

    it('should validate new password length', async () => {
      const invalidInput = { ...validUpdateInput, newPassword: 'short' };

      await expect(authService.updatePassword(invalidInput)).rejects.toMatchObject({
        code: 'BAD_REQUEST',
        message: 'La contraseña debe tener al menos 8 caracteres'
      });
    });

    it('should validate new password complexity', async () => {
      const invalidInput = { ...validUpdateInput, newPassword: 'password123' };

      await expect(authService.updatePassword(invalidInput)).rejects.toMatchObject({
        code: 'BAD_REQUEST',
        message: 'La contraseña debe incluir mayúsculas, minúsculas y números'
      });
    });

    it('should handle update error', async () => {
      mockSupabaseAuth.updateUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid token', name: 'AuthError', status: 401 }
      });

      await expect(authService.updatePassword(validUpdateInput)).rejects.toThrow(TRPCError);
    });
  });

  describe('sendEmailVerification', () => {
    it('should send verification email successfully', async () => {
      mockSupabaseAuth.resend.mockResolvedValue({ error: null });

      const result = await authService.sendEmailVerification('test@example.com');

      expect(mockSupabaseAuth.resend).toHaveBeenCalledWith({
        type: 'signup',
        email: 'test@example.com'
      });

      expect(result.success).toBe(true);
    });

    it('should handle errors gracefully', async () => {
      mockSupabaseAuth.resend.mockResolvedValue({
        error: { message: 'Rate limit exceeded', name: 'AuthError', status: 429 }
      });

      const result = await authService.sendEmailVerification('test@example.com');

      expect(result.success).toBe(true);
    });

    it('should handle exceptions gracefully', async () => {
      mockSupabaseAuth.resend.mockRejectedValue(new Error('Network error'));

      const result = await authService.sendEmailVerification('test@example.com');

      expect(result.success).toBe(true);
    });
  });

  describe('googleAuth', () => {
    const validGoogleInput: GoogleAuthInput = {
      idToken: 'google-id-token',
      intent: 'tenant'
    };

    beforeEach(() => {
      mockSupabaseSingle.mockResolvedValue({
        data: { has_tenant_profile: false, has_landlord_profile: false },
        error: null
      });
    });

    it('should authenticate with Google successfully', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@gmail.com',
        email_confirmed_at: '2024-01-01',
        user_metadata: {}
      };
      const mockSession = {
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        expires_at: Date.now() + 3600000
      };

      mockSupabaseAuth.signInWithIdToken.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null
      });

      mockSupabaseAuth.admin.updateUserById.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      const result = await authService.googleAuth(validGoogleInput);

      expect(mockSupabaseAuth.signInWithIdToken).toHaveBeenCalledWith({
        provider: 'google',
        token: validGoogleInput.idToken
      });

      expect(result.user.id).toBe('user-123');
      expect(result.user.emailVerified).toBe(true);
      expect(result.session.accessToken).toBe('access-token');
    });

    it('should update user metadata with intent', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@gmail.com',
        email_confirmed_at: '2024-01-01',
        user_metadata: { name: 'Test User' }
      };
      const mockSession = {
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        expires_at: Date.now() + 3600000
      };

      mockSupabaseAuth.signInWithIdToken.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null
      });

      mockSupabaseAuth.admin.updateUserById.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      await authService.googleAuth(validGoogleInput);

      expect(mockSupabaseAuth.admin.updateUserById).toHaveBeenCalledWith(
        'user-123',
        {
          user_metadata: {
            name: 'Test User',
            intent: 'tenant'
          }
        }
      );
    });

    it('should handle invalid Google token', async () => {
      mockSupabaseAuth.signInWithIdToken.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid token', name: 'AuthError', status: 401 }
      });

      await expect(authService.googleAuth(validGoogleInput)).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
        message: 'Google authentication failed'
      });
    });

    it('should handle missing user or session', async () => {
      mockSupabaseAuth.signInWithIdToken.mockResolvedValue({
        data: { user: null, session: null },
        error: null
      });

      await expect(authService.googleAuth(validGoogleInput)).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
        message: 'Google authentication failed'
      });
    });
  });

  describe('healthCheck', () => {
    it('should return healthy status when auth service is operational', async () => {
      mockSupabaseAuth.getSession.mockResolvedValue({
        data: { session: null },
        error: null
      });

      const result = await authService.healthCheck();

      expect(result.status).toBe('healthy');
      expect(result.message).toBe('Auth service operational');
    });

    it('should return unhealthy status on connection failure', async () => {
      mockSupabaseAuth.getSession.mockResolvedValue({
        data: { session: null },
        error: { message: 'Connection failed', name: 'AuthError', status: 500 }
      });

      const result = await authService.healthCheck();

      expect(result.status).toBe('unhealthy');
      expect(result.message).toBe('Auth service connection failed');
    });

    it('should return unhealthy status on exception', async () => {
      mockSupabaseAuth.getSession.mockRejectedValue(new Error('Network error'));

      const result = await authService.healthCheck();

      expect(result.status).toBe('unhealthy');
      expect(result.message).toBe('Auth service unavailable');
    });
  });
});