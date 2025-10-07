import { createClient, SupabaseClient, AuthError } from '@supabase/supabase-js';
import { TRPCError } from '@trpc/server';
import { encrypt, decrypt, generateTimedToken, hashToken, verifyToken } from '../utils/crypto.util';
import { getAuditLogger, AuditEventType } from '../utils/audit-logger.util';
import { sanitizeEmail, sanitizePhone, sanitizeHtml, validatePasswordStrength, validateHondurasPhone } from '../utils/sanitizer.util';

// Types for authentication
export interface SignupInput {
  email: string;
  password: string;
  fullName?: string;
  phone?: string;
  intent?: 'tenant' | 'landlord';
}

export interface RequestContext {
  ipAddress?: string;
  userAgent?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface GoogleAuthInput {
  idToken: string;
  intent?: 'tenant' | 'landlord';
}

export interface PhoneAuthInput {
  phone: string;
  otp?: string;
}

export interface ResetPasswordInput {
  email: string;
}

export interface UpdatePasswordInput {
  newPassword: string;
  token: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email?: string;
    phone?: string;
    emailVerified: boolean;
    phoneVerified: boolean;
  };
  session: {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
  };
  profiles: {
    hasTenantProfile: boolean;
    hasLandlordProfile: boolean;
  };
}

export interface SessionInfo {
  userId: string;
  email?: string;
  phone?: string;
  isAuthenticated: boolean;
  expiresAt: Date;
}

class AuthService {
  private supabase: SupabaseClient;
  private supabaseAdmin: SupabaseClient;
  private auditLogger;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration for authentication service');
    }

    // Client for user-facing operations
    this.supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: false
      }
    });

    // Admin client for privileged operations (use sparingly, only when RLS needs to be bypassed)
    this.supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Initialize audit logger
    this.auditLogger = getAuditLogger();

    console.log('✅ Auth service initialized with security hardening');
  }

  /**
   * Sign up a new user with email and password
   * Security: Input sanitization, strong password validation, audit logging
   */
  async signup(input: SignupInput, context?: RequestContext): Promise<AuthResponse> {
    try {
      // Sanitize inputs
      const sanitizedEmail = sanitizeEmail(input.email);
      const sanitizedFullName = input.fullName ? sanitizeHtml(input.fullName) : undefined;

      // Validate phone if provided
      let sanitizedPhone = input.phone;
      if (input.phone) {
        const phoneValidation = validateHondurasPhone(input.phone);
        if (!phoneValidation.valid) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: phoneValidation.error || 'Número de teléfono inválido'
          });
        }
        sanitizedPhone = phoneValidation.sanitized;
      }

      // Validate email
      this.validateEmail(sanitizedEmail);

      // Enhanced password validation
      const passwordValidation = validatePasswordStrength(input.password);
      if (!passwordValidation.valid) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Contraseña débil: ${passwordValidation.feedback.join(', ')}`
        });
      }

      // First, check if user already exists
      const { data: existingUsers } = await this.supabaseAdmin.auth.admin.listUsers();
      const userExists = existingUsers?.users?.some(u => u.email === sanitizedEmail);

      if (userExists) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Ya existe una cuenta con este correo electrónico'
        });
      }

      // Create user with admin API and auto-confirm email
      const { data: newUser, error: createError } = await this.supabaseAdmin.auth.admin.createUser({
        email: sanitizedEmail,
        password: input.password,
        email_confirm: true, // Auto-confirm email, no verification needed
        user_metadata: {
          full_name: sanitizedFullName,
          phone: sanitizedPhone,
          intent: input.intent || 'tenant'
        }
      });

      if (createError || !newUser.user) {
        // Log failed signup attempt
        await this.auditLogger.log({
          event_type: AuditEventType.SIGNUP,
          user_id: null,
          ip_address: context?.ipAddress,
          user_agent: context?.userAgent,
          success: false,
          error_message: createError?.message || 'Failed to create user',
          metadata: { email: sanitizedEmail },
          severity: 'medium'
        });
        throw this.handleAuthError(createError);
      }

      // Log successful signup
      await this.auditLogger.logSignup(
        newUser.user.id,
        sanitizedEmail,
        context?.ipAddress,
        context?.userAgent
      );

      // Ensure user_accounts record exists before sign in
      // This prevents race conditions with the database trigger
      const { error: userAccountError } = await this.supabaseAdmin
        .from('user_accounts')
        .upsert({
          user_id: newUser.user.id,
          auth_methods: input.password ? ['email'] : ['google']
        }, {
          onConflict: 'user_id',
          ignoreDuplicates: true
        });

      if (userAccountError) {
        console.error('Error creating user_accounts record:', userAccountError);
        // Don't fail signup if this fails, the trigger should handle it
      }

      // Sign in the user immediately to get session
      const { data: signInData, error: signInError } = await this.supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password: input.password
      });

      if (signInError || !signInData.session) {
        console.error('SignIn error details:', {
          error: signInError,
          errorMessage: signInError?.message,
          errorStatus: signInError?.status,
          hasSession: !!signInData?.session,
          userId: newUser.user.id
        });
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Usuario creado pero error al iniciar sesión: ${signInError?.message || 'Sin sesión'}`
        });
      }

      // Sync login data to user_accounts
      await this.syncLoginData(newUser.user.id);

      // Check existing profiles
      const profiles = await this.checkUserProfiles(newUser.user.id);

      return {
        user: {
          id: newUser.user.id,
          email: newUser.user.email,
          phone: newUser.user.phone,
          emailVerified: true,
          phoneVerified: false
        },
        session: {
          accessToken: signInData.session.access_token,
          refreshToken: signInData.session.refresh_token,
          expiresAt: signInData.session.expires_at || 0
        },
        profiles
      };
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      console.error('Signup error:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error al crear la cuenta. Por favor intenta nuevamente.'
      });
    }
  }

  /**
   * Login user with email and password
   * Security: Account lockout protection, brute force prevention, audit logging
   */
  async login(input: LoginInput, context?: RequestContext): Promise<AuthResponse> {
    const sanitizedEmail = sanitizeEmail(input.email);

    try {
      this.validateEmail(sanitizedEmail);

      // Check if account is locked
      const { data: isLocked } = await this.supabaseAdmin.rpc('is_account_locked', {
        user_email: sanitizedEmail
      });

      if (isLocked) {
        await this.auditLogger.log({
          event_type: AuditEventType.LOGIN_FAILURE,
          user_id: null,
          ip_address: context?.ipAddress,
          user_agent: context?.userAgent,
          success: false,
          error_message: 'Account locked',
          metadata: { email: sanitizedEmail },
          severity: 'high'
        });

        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Cuenta bloqueada temporalmente por múltiples intentos fallidos. Por favor intenta en 30 minutos.'
        });
      }

      // Track login attempt
      await this.trackLoginAttempt(sanitizedEmail, context?.ipAddress || 'unknown', false, context?.userAgent);

      // Attempt login
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password: input.password
      });

      if (error) {
        // Increment failed login attempts
        await this.supabaseAdmin.rpc('increment_failed_login', {
          user_email: sanitizedEmail
        });

        // Log failed login
        await this.auditLogger.logLoginFailure(
          sanitizedEmail,
          context?.ipAddress,
          context?.userAgent,
          'Invalid credentials'
        );

        throw this.handleAuthError(error);
      }

      if (!data.user || !data.session) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Credenciales inválidas'
        });
      }

      // Reset failed login attempts on successful login
      await this.supabaseAdmin.rpc('reset_failed_login', {
        user_email: sanitizedEmail
      });

      // Track successful login attempt
      await this.trackLoginAttempt(sanitizedEmail, context?.ipAddress || 'unknown', true, context?.userAgent);

      // Log successful login
      await this.auditLogger.logLoginSuccess(
        data.user.id,
        data.session.access_token.substring(0, 20), // Log only partial token
        context?.ipAddress,
        context?.userAgent
      );

      // Sync login data to user_accounts
      await this.syncLoginData(data.user.id);

      // Check existing profiles
      const profiles = await this.checkUserProfiles(data.user.id);

      return {
        user: {
          id: data.user.id,
          email: data.user.email,
          phone: data.user.phone,
          emailVerified: !!data.user.email_confirmed_at,
          phoneVerified: !!data.user.phone_confirmed_at
        },
        session: {
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
          expiresAt: data.session.expires_at || 0
        },
        profiles
      };
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      console.error('Login error details logged server-side');
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error al iniciar sesión. Por favor intenta nuevamente.'
      });
    }
  }

  /**
   * Track login attempt for security monitoring
   */
  private async trackLoginAttempt(
    email: string,
    ipAddress: string,
    success: boolean,
    userAgent?: string
  ): Promise<void> {
    try {
      await this.supabaseAdmin
        .from('login_attempts')
        .insert({
          email,
          ip_address: ipAddress,
          success,
          user_agent: userAgent,
          attempt_time: new Date().toISOString()
        });

      // Check for brute force patterns (more than 10 failed attempts in 5 minutes from same IP)
      if (!success) {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

        const { data: recentAttempts, error } = await this.supabaseAdmin
          .from('login_attempts')
          .select('id')
          .eq('ip_address', ipAddress)
          .eq('success', false)
          .gte('attempt_time', fiveMinutesAgo);

        if (!error && recentAttempts && recentAttempts.length >= 10) {
          await this.auditLogger.logBruteForceAttempt(
            email,
            ipAddress,
            recentAttempts.length
          );
        }
      }
    } catch (error) {
      console.error('Error tracking login attempt:', error);
      // Don't throw - this is non-critical
    }
  }

  /**
   * Logout user
   */
  async logout(token: string): Promise<void> {
    try {
      const { error } = await this.supabase.auth.admin.signOut(token);

      if (error) {
        console.error('Logout error:', error);
        // Don't throw error on logout - best effort
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Don't throw error on logout - best effort
    }
  }

  /**
   * Refresh session token
   */
  async refreshSession(refreshToken: string): Promise<AuthResponse> {
    try {
      const { data, error } = await this.supabase.auth.refreshSession({
        refresh_token: refreshToken
      });

      if (error || !data.session || !data.user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Session expired. Please login again.'
        });
      }

      const profiles = await this.checkUserProfiles(data.user.id);

      return {
        user: {
          id: data.user.id,
          email: data.user.email,
          phone: data.user.phone,
          emailVerified: !!data.user.email_confirmed_at,
          phoneVerified: !!data.user.phone_confirmed_at
        },
        session: {
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
          expiresAt: data.session.expires_at || 0
        },
        profiles
      };
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Failed to refresh session'
      });
    }
  }

  /**
   * Verify user session
   */
  async verifySession(token: string): Promise<SessionInfo> {
    try {
      const { data: { user }, error } = await this.supabase.auth.getUser(token);

      if (error || !user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid or expired session'
        });
      }

      return {
        userId: user.id,
        email: user.email,
        phone: user.phone,
        isAuthenticated: true,
        expiresAt: new Date(Date.now() + 3600000) // 1 hour from now
      };
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Session verification failed'
      });
    }
  }

  /**
   * Send password reset email
   * Security: Rate limiting handled at router level, secure token generation, audit logging
   */
  async requestPasswordReset(
    input: ResetPasswordInput,
    context?: RequestContext
  ): Promise<{ success: boolean; message: string }> {
    const sanitizedEmail = sanitizeEmail(input.email);

    try {
      this.validateEmail(sanitizedEmail);

      // Check for abuse (rate limiting is also at router level)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { data: recentAttempts } = await this.supabaseAdmin
        .from('password_reset_attempts')
        .select('id')
        .eq('email', sanitizedEmail)
        .gte('attempt_time', oneHourAgo);

      if (recentAttempts && recentAttempts.length >= 3) {
        // Log suspicious activity
        await this.auditLogger.logSuspiciousActivity(
          null,
          'Too many password reset attempts',
          context?.ipAddress,
          { email: sanitizedEmail, attempts: recentAttempts.length }
        );
      }

      // Generate secure reset token
      const { token, expiresAt } = generateTimedToken(3600000); // 1 hour expiry
      const tokenHash = hashToken(token);

      // Store reset token attempt
      await this.supabaseAdmin
        .from('password_reset_attempts')
        .insert({
          email: sanitizedEmail,
          ip_address: context?.ipAddress,
          token_hash: tokenHash,
          expires_at: expiresAt.toISOString(),
          used: false
        });

      // Log password reset request
      await this.auditLogger.logPasswordResetRequest(
        sanitizedEmail,
        context?.ipAddress,
        context?.userAgent
      );

      // Send reset email via Supabase (they handle token generation)
      const { error } = await this.supabase.auth.resetPasswordForEmail(sanitizedEmail, {
        redirectTo: `${process.env.FRONTEND_URL}/reset-password`
      });

      if (error) {
        console.error('Password reset error details logged server-side');
        // Don't reveal if email exists - always return success message
      }

      // Always return same message to prevent email enumeration
      return {
        success: true,
        message: 'Si el correo existe, recibirás instrucciones para restablecer tu contraseña'
      };
    } catch (error) {
      console.error('Password reset error details logged server-side');
      // Always return same message to prevent information disclosure
      return {
        success: true,
        message: 'Si el correo existe, recibirás instrucciones para restablecer tu contraseña'
      };
    }
  }

  /**
   * Update password with reset token
   */
  async updatePassword(input: UpdatePasswordInput): Promise<{ success: boolean }> {
    try {
      this.validatePassword(input.newPassword);

      const { error } = await this.supabase.auth.updateUser({
        password: input.newPassword
      });

      if (error) {
        throw this.handleAuthError(error);
      }

      return { success: true };
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update password'
      });
    }
  }

  /**
   * Send email verification
   */
  async sendEmailVerification(email: string): Promise<{ success: boolean }> {
    try {
      const { error } = await this.supabase.auth.resend({
        type: 'signup',
        email: email
      });

      if (error) {
        console.error('Email verification error:', error);
      }

      return { success: true };
    } catch (error) {
      console.error('Email verification error:', error);
      return { success: true }; // Don't reveal errors
    }
  }

  /**
   * Verify email with OTP code
   * Security: Rate limited, audit logging
   */
  async verifyEmailOTP(email: string, token: string): Promise<AuthResponse> {
    try {
      // Verify the OTP token
      const { data, error } = await this.supabase.auth.verifyOtp({
        email,
        token,
        type: 'signup'
      });

      if (error || !data.user || !data.session) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Código de verificación inválido o expirado'
        });
      }

      // Ensure user_accounts record exists (for OTP signup)
      const { error: userAccountError } = await this.supabaseAdmin
        .from('user_accounts')
        .upsert({
          user_id: data.user.id,
          auth_methods: ['email']
        }, {
          onConflict: 'user_id',
          ignoreDuplicates: true
        });

      if (userAccountError) {
        console.error('Error creating user_accounts record for OTP user:', userAccountError);
      }

      // Log successful verification
      await this.auditLogger.log({
        event_type: AuditEventType.EMAIL_VERIFIED,
        user_id: data.user.id,
        success: true,
        metadata: { email },
        severity: 'low'
      });

      // Sync login data to user_accounts
      await this.syncLoginData(data.user.id);

      // Check existing profiles
      const profiles = await this.checkUserProfiles(data.user.id);

      return {
        user: {
          id: data.user.id,
          email: data.user.email,
          phone: data.user.phone,
          emailVerified: true,
          phoneVerified: !!data.user.phone_confirmed_at
        },
        session: {
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
          expiresAt: data.session.expires_at || 0
        },
        profiles
      };
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      console.error('OTP verification error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error al verificar el código'
      });
    }
  }

  /**
   * Google OAuth authentication
   */
  async googleAuth(input: GoogleAuthInput): Promise<AuthResponse> {
    try {
      // Verify Google ID token and create/login user
      const { data, error } = await this.supabase.auth.signInWithIdToken({
        provider: 'google',
        token: input.idToken
      });

      if (error || !data.user || !data.session) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Google authentication failed'
        });
      }

      // Ensure user_accounts record exists (for new Google users)
      const { error: userAccountError } = await this.supabaseAdmin
        .from('user_accounts')
        .upsert({
          user_id: data.user.id,
          auth_methods: ['google']
        }, {
          onConflict: 'user_id',
          ignoreDuplicates: true
        });

      if (userAccountError) {
        console.error('Error creating user_accounts record for Google user:', userAccountError);
      }

      // Update user metadata with intent if provided
      if (input.intent) {
        await this.supabaseAdmin.auth.admin.updateUserById(data.user.id, {
          user_metadata: {
            ...data.user.user_metadata,
            intent: input.intent
          }
        });
      }

      // Sync login data to user_accounts
      await this.syncLoginData(data.user.id);

      const profiles = await this.checkUserProfiles(data.user.id);

      return {
        user: {
          id: data.user.id,
          email: data.user.email,
          phone: data.user.phone,
          emailVerified: true, // Google users have verified emails
          phoneVerified: !!data.user.phone_confirmed_at
        },
        session: {
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
          expiresAt: data.session.expires_at || 0
        },
        profiles
      };
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      console.error('Google auth error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Google authentication failed'
      });
    }
  }

  /**
   * Sync login data to user_accounts after successful sign in
   */
  private async syncLoginData(userId: string): Promise<void> {
    try {
      // Get current login_count
      const { data: userAccount } = await this.supabaseAdmin
        .from('user_accounts')
        .select('login_count')
        .eq('user_id', userId)
        .single();

      const currentCount = userAccount?.login_count || 0;
      const now = new Date().toISOString();

      // Update with incremented count
      await this.supabaseAdmin
        .from('user_accounts')
        .update({
          last_login_at: now,
          login_count: currentCount + 1,
          last_active_at: now
        })
        .eq('user_id', userId);
    } catch (error) {
      // Don't fail the login if this fails, just log it
      console.error('Error syncing login data:', error);
    }
  }

  /**
   * Check if user has tenant and/or landlord profiles
   */
  private async checkUserProfiles(userId: string): Promise<{ hasTenantProfile: boolean; hasLandlordProfile: boolean }> {
    try {
      const { data: userAccount } = await this.supabaseAdmin
        .from('user_accounts')
        .select('has_tenant_profile, has_landlord_profile')
        .eq('user_id', userId)
        .single();

      return {
        hasTenantProfile: userAccount?.has_tenant_profile || false,
        hasLandlordProfile: userAccount?.has_landlord_profile || false
      };
    } catch (error) {
      console.error('Error checking user profiles:', error);
      return {
        hasTenantProfile: false,
        hasLandlordProfile: false
      };
    }
  }

  /**
   * Update last login timestamp
   * Security: Uses RPC function to avoid SQL injection vulnerability
   */
  private async updateLastLogin(userId: string): Promise<void> {
    try {
      // Use RPC function for safe increment
      const { error } = await this.supabaseAdmin.rpc('update_last_login', {
        target_user_id: userId
      });

      if (error) {
        console.error('Error updating last login (non-critical)');
      }
    } catch (error) {
      console.error('Error updating last login (non-critical)');
      // Don't throw - this is not critical
    }
  }

  /**
   * Validate email format
   */
  private validateEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Correo electrónico inválido'
      });
    }
  }

  /**
   * Validate password strength
   * Security: Enhanced to require 12 characters minimum with strong validation
   */
  private validatePassword(password: string): void {
    // Minimum length check (increased to 12 from 8)
    if (password.length < 12) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'La contraseña debe tener al menos 12 caracteres'
      });
    }

    // Check for at least one uppercase, one lowercase, one number, and one special character
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[^a-zA-Z0-9]/.test(password);

    const missing: string[] = [];
    if (!hasUpperCase) missing.push('mayúsculas');
    if (!hasLowerCase) missing.push('minúsculas');
    if (!hasNumber) missing.push('números');
    if (!hasSpecialChar) missing.push('caracteres especiales');

    if (missing.length > 0) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: `La contraseña debe incluir: ${missing.join(', ')}`
      });
    }

    // Check for weak passwords
    const weakCheck = isWeakPassword(password);
    if (weakCheck.weak) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: weakCheck.reason || 'Contraseña demasiado débil'
      });
    }
  }

  /**
   * Handle Supabase auth errors
   * Security: Generic error messages to users, detailed logging server-side only
   */
  private handleAuthError(error: AuthError): TRPCError {
    // Log detailed error server-side only (not exposed to client)
    console.error('Auth error details:', error);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error status:', error.status);

    // Map common Supabase errors to user-friendly, non-revealing messages
    switch (error.message) {
      case 'User already registered':
        return new TRPCError({
          code: 'CONFLICT',
          message: 'Ya existe una cuenta con este correo electrónico'
        });
      case 'Invalid login credentials':
        return new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Correo o contraseña incorrectos'
        });
      case 'Email not confirmed':
        return new TRPCError({
          code: 'FORBIDDEN',
          message: 'Por favor verifica tu correo electrónico antes de iniciar sesión'
        });
      case 'Email rate limit exceeded':
        return new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: 'Demasiados intentos. Por favor espera unos minutos.'
        });
      default:
        // Generic message to prevent information disclosure
        return new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error de autenticación. Por favor intenta nuevamente.'
        });
    }
  }

  /**
   * Health check for auth service
   */
  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; message: string }> {
    try {
      // Try to query auth service
      const { error } = await this.supabase.auth.getSession();

      if (error) {
        return { status: 'unhealthy', message: 'Auth service connection failed' };
      }

      return { status: 'healthy', message: 'Auth service operational' };
    } catch (error) {
      return { status: 'unhealthy', message: 'Auth service unavailable' };
    }
  }
}

// Export singleton instance
let authServiceInstance: AuthService | null = null;

export function getAuthService(): AuthService {
  if (!authServiceInstance) {
    authServiceInstance = new AuthService();
  }
  return authServiceInstance;
}

export default AuthService;