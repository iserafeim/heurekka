'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthModal, AuthModalHeader, AuthModalFooter, AuthDivider } from './AuthModal';
import { FormInput } from './FormInput';
import { GoogleAuthButton } from './GoogleAuthButton';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/stores/auth';
import { trpc } from '@/lib/trpc/client';
import { validatePassword } from '@/lib/validation/password';
import { validateEmail, sanitizeEmail } from '@/lib/validation/email';
import { getCSRFToken } from '@/lib/security/csrf';
import DOMPurify from 'isomorphic-dompurify';
import { secureAuth } from '@/lib/auth/secure-auth';

export interface TenantAuthFlowProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId?: string;
  propertyDetails?: {
    title: string;
    price: number;
    location: string;
    landlordPhone: string;
  };
  onSuccess?: () => void;
}

type AuthStep = 'login' | 'signup';

/**
 * Tenant Authentication Flow Component
 *
 * Authentication flow for tenant users:
 * 1. Login/Signup
 * 2. Redirect to property or dashboard
 */
export function TenantAuthFlow({
  isOpen,
  onClose,
  propertyId,
  propertyDetails,
  onSuccess
}: TenantAuthFlowProps) {
  const router = useRouter();
  const [step, setStep] = useState<AuthStep>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [passwordValidation, setPasswordValidation] = useState(validatePassword(''));
  const [rememberMe, setRememberMe] = useState(false);

  const { signIn, signUp, signInWithGoogle } = useAuthStore();

  // Mutations with CSRF token
  const csrfToken = getCSRFToken();
  const signupMutation = trpc.auth.signup.useMutation({
    context: {
      headers: {
        'X-CSRF-Token': csrfToken || '',
      },
    },
  });
  const loginMutation = trpc.auth.login.useMutation({
    context: {
      headers: {
        'X-CSRF-Token': csrfToken || '',
      },
    },
  });

  // Handle password change with validation
  const handlePasswordChange = (newPassword: string) => {
    setPassword(newPassword);
    setPasswordValidation(validatePassword(newPassword));
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Sanitize and validate email
    const sanitizedEmail = sanitizeEmail(email);
    const emailValidation = validateEmail(sanitizedEmail);

    // Validate password
    const passValidation = validatePassword(password);

    // Collect errors
    const newErrors: Record<string, string> = {};
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.error || 'Email inválido';
    }
    if (!passValidation.isValid) {
      newErrors.password = passValidation.error || 'Contraseña inválida';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const result = await signupMutation.mutateAsync({
        email: sanitizedEmail,
        password: DOMPurify.sanitize(password),
        intent: 'tenant'
      });

      if (result.success && result.data) {
        // Backend created the user, now sign in to get the session
        console.log('[TenantAuth] Backend signup successful, signing in to establish session...');
        const { error: signInError } = await signIn(sanitizedEmail, password);

        if (signInError) {
          console.error('[TenantAuth] Sign in failed after signup:', signInError);
          setErrors({
            general: 'Error al iniciar sesión. Por favor, intenta nuevamente.'
          });
          return;
        }

        // Wait for access token to be available with retries
        console.log('[TenantAuth] Waiting for access token to be available...');
        let tokenAvailable = false;
        for (let i = 0; i < 10; i++) {
          await new Promise(resolve => setTimeout(resolve, 500));
          const token = await secureAuth.getAccessToken();
          console.log(`[TenantAuth] Token check attempt ${i + 1}:`, token ? 'Token found' : 'No token');

          if (token) {
            tokenAvailable = true;
            console.log('[TenantAuth] Access token confirmed available');
            break;
          }
        }

        if (!tokenAvailable) {
          console.error('[TenantAuth] Access token not available after signup');
          setErrors({
            general: 'Error al establecer la sesión. Por favor, intenta de nuevo.'
          });
          return;
        }

        // CRITICAL: Do NOT close modal or call onSuccess until AFTER redirect
        // New tenant users always go to profile completion
        console.log('[TenantAuth] ✅ Signup successful, redirecting to profile completion...');
        console.log('[TenantAuth] 🚀 REDIRECTING NOW...');
        window.location.href = '/tenant/profile/complete';
        // Do NOT close modal or do anything after this
        return;
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Error al crear la cuenta. Por favor, intenta nuevamente.';
      setErrors({
        general: DOMPurify.sanitize(errorMessage)
      });
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Sanitize email
    const sanitizedEmail = sanitizeEmail(email);

    try {
      const result = await loginMutation.mutateAsync({
        email: sanitizedEmail,
        password
      });

      if (result.success && result.data) {
        console.log('[TenantAuth] Backend login successful, signing in to establish session...');
        const { error: signInError } = await signIn(sanitizedEmail, password);

        if (signInError) {
          console.error('[TenantAuth] Sign in failed after login:', signInError);
          setErrors({
            general: 'Error al iniciar sesión. Por favor, intenta nuevamente.'
          });
          return;
        }

        // Wait for access token to be available with retries
        console.log('[TenantAuth] Waiting for access token to be available...');
        let tokenAvailable = false;
        for (let i = 0; i < 10; i++) {
          await new Promise(resolve => setTimeout(resolve, 500));
          const token = await secureAuth.getAccessToken();
          console.log(`[TenantAuth] Token check attempt ${i + 1}:`, token ? 'Token found' : 'No token');

          if (token) {
            tokenAvailable = true;
            console.log('[TenantAuth] Access token confirmed available');
            break;
          }
        }

        if (!tokenAvailable) {
          console.error('[TenantAuth] Access token not available after login');
          setErrors({
            general: 'Error al establecer la sesión. Por favor, intenta de nuevo.'
          });
          return;
        }

        // CRITICAL: Do NOT close modal or call onSuccess until AFTER redirect
        // Check BOTH tenant AND landlord profiles - this modal can be used by both types of users
        try {
          console.log('[TenantAuth] Checking user profiles (both tenant and landlord)...');

          const token = await secureAuth.getAccessToken();
          const backendUrl = process.env.NEXT_PUBLIC_TRPC_URL || 'http://localhost:3001/trpc';

          // Check both profiles in parallel using direct fetch to tRPC backend
          const [tenantProfileResult, landlordProfileResult] = await Promise.allSettled([
            fetch(`${backendUrl}/tenantProfile.getCurrent?batch=1&input=%7B%7D`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
            }).then(async (res) => {
              if (!res.ok) {
                console.log('[TenantAuth] Tenant profile not found or error:', res.status);
                return null;
              }
              const data = await res.json();
              // tRPC batch response is an array, extract first element
              const result = Array.isArray(data) ? data[0] : data;
              console.log('[TenantAuth] Tenant profile response:', result);

              // Check for tRPC errors
              if (result?.error) {
                console.log('[TenantAuth] Tenant profile error:', result.error?.json?.message);
                return null;
              }

              // Extract data from tRPC response format: result.data.json
              return result?.result?.data?.json || null;
            }).catch((e) => {
              console.log('[TenantAuth] Tenant profile query error:', e.message);
              return null;
            }),

            fetch(`${backendUrl}/landlordProfile.getCurrent?batch=1&input=%7B%7D`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
            }).then(async (res) => {
              if (!res.ok) {
                console.log('[TenantAuth] Landlord profile not found or error:', res.status);
                return null;
              }
              const data = await res.json();
              // tRPC batch response is an array, extract first element
              const result = Array.isArray(data) ? data[0] : data;
              console.log('[TenantAuth] Landlord profile response:', result);

              // Check for tRPC errors
              if (result?.error) {
                console.log('[TenantAuth] Landlord profile error:', result.error?.json?.message);
                return null;
              }

              // Extract data from tRPC response format: result.data.json
              return result?.result?.data?.json || null;
            }).catch((e) => {
              console.log('[TenantAuth] Landlord profile query error:', e.message);
              return null;
            })
          ]);

          const tenantProfile = tenantProfileResult.status === 'fulfilled' ? tenantProfileResult.value : null;
          const landlordProfile = landlordProfileResult.status === 'fulfilled' ? landlordProfileResult.value : null;

          // DEBUGGING: Log the actual profile objects to see their structure
          console.log('[TenantAuth] 🔍 DEBUG - Tenant profile object:', JSON.stringify(tenantProfile, null, 2));
          console.log('[TenantAuth] 🔍 DEBUG - Landlord profile object:', JSON.stringify(landlordProfile, null, 2));

          // Check if profiles exist by looking for key identifying fields
          const hasTenantProfile = !!tenantProfile?.fullName;
          // Landlord profile exists if we got a profile object back (even if some fields are null)
          // We check for city OR propertyLocation OR userId as indicators of a real profile
          const hasLandlordProfile = !!(landlordProfile && (landlordProfile.city || landlordProfile.propertyLocation || landlordProfile.userId));

          console.log('[TenantAuth] 🔍 DEBUG - Checking landlordProfile fields:', {
            hasProfile: !!landlordProfile,
            city: landlordProfile?.city,
            propertyLocation: landlordProfile?.propertyLocation,
            userId: landlordProfile?.userId,
            hasLandlordProfile
          });

          console.log('[TenantAuth] Profile check results:', {
            hasTenantProfile,
            hasLandlordProfile,
            tenantProfile: tenantProfile ? 'exists' : 'null',
            landlordProfile: landlordProfile ? 'exists' : 'null'
          });

          // If user is a landlord (with or without tenant profile), redirect to landlord dashboard
          if (hasLandlordProfile) {
            console.log('[TenantAuth] User is landlord, redirecting to landlord dashboard');
            console.log('[TenantAuth] 🚀 REDIRECTING NOW...');
            window.location.href = '/dashboard?tab=leads';
            // Do NOT close modal or do anything after this
            return;
          }

          // If user is tenant-only
          if (hasTenantProfile) {
            console.log('[TenantAuth] User is tenant, redirecting to tenant dashboard');
            console.log('[TenantAuth] 🚀 REDIRECTING NOW...');
            window.location.href = '/dashboard?tab=saved-searches';
            // Do NOT close modal or do anything after this
            return;
          }

          // No profile found, redirect to tenant profile completion
          console.log('[TenantAuth] No profile found, redirecting to profile completion');
          console.log('[TenantAuth] 🚀 REDIRECTING NOW...');
          window.location.href = '/tenant/profile/complete';
          // Do NOT close modal or do anything after this
          return;
        } catch (error) {
          console.error('[TenantAuth] Error checking profile:', error);
          console.log('[TenantAuth] 🚀 REDIRECTING NOW (error fallback)...');
          // On error, assume profile needs completion
          window.location.href = '/tenant/profile/complete';
          // Do NOT close modal or do anything after this
          return;
        }
      }
    } catch (error: any) {
      // Generic error message to prevent information leakage
      setErrors({
        general: 'Credenciales inválidas. Por favor, intenta de nuevo.'
      });
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        // Log error for monitoring (without sensitive data)
        if (process.env.NODE_ENV === 'development') {
          console.error('OAuth error type:', error?.name);
        }

        setErrors({
          general: 'No se pudo conectar con Google. Por favor intenta de nuevo.'
        });
      }
      // OAuth redirect will handle the rest
      // After callback, check for tenant profile
    } catch (error) {
      setErrors({
        general: 'Error de conexión. Verifica tu internet e intenta nuevamente.'
      });
    }
  };

  const isLoading = signupMutation.isLoading || loginMutation.isLoading;

  return (
    <AuthModal
      isOpen={isOpen}
      onClose={onClose}
      intent="tenant"
      propertyId={propertyId}
    >
      {step === 'signup' && (
        <>
          <AuthModalHeader
            title="Crea tu Cuenta para Contactar al Propietario"
            subtitle="Tu perfil te permite contactar múltiples propiedades sin repetir tu información"
          />

          {/* Property Context Card (if available) */}
          {propertyDetails && (
            <div className="mb-6 rounded-lg border border-neutral-200 p-4 bg-neutral-50">
              <p className="text-sm font-medium text-neutral-900 mb-1">
                {propertyDetails.title}
              </p>
              <p className="text-sm text-neutral-600">
                L.{propertyDetails.price.toLocaleString()}/mes • {propertyDetails.location}
              </p>
            </div>
          )}

          {/* Benefits List */}
          <div className="mb-6 space-y-2">
            {[
              'Un perfil para todas las propiedades',
              'Mensajes personalizados automáticos',
              'Historial de contactos',
              'Alertas de propiedades'
            ].map((benefit, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-neutral-600">
                <svg className="h-4 w-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>{benefit}</span>
              </div>
            ))}
          </div>

          {/* Google OAuth */}
          <GoogleAuthButton
            onClick={handleGoogleAuth}
            loading={isLoading}
          />

          <AuthDivider />

          {/* Email/Password Form */}
          <form onSubmit={handleEmailSignup} className="space-y-4">
            {errors.general && (
              <div
                role="alert"
                aria-live="assertive"
                className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600"
              >
                {errors.general}
              </div>
            )}

            <FormInput
              label="Correo Electrónico"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              required
              placeholder="tu@email.com"
              autoComplete="email"
            />

            <div>
              <FormInput
                label="Contraseña"
                type="password"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                error={errors.password}
                required
                showPasswordToggle
                placeholder="Mínimo 12 caracteres"
                autoComplete="new-password"
              />

              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-3">
                  <PasswordStrengthIndicator
                    validation={passwordValidation}
                    showRequirements={true}
                  />
                </div>
              )}
            </div>

            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-primary focus:ring-primary border-neutral-300 rounded"
                aria-label="Recordar sesión"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-neutral-700">
                Recordarme
              </label>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              loading={isLoading}
              loadingText="Creando cuenta..."
            >
              Crear Cuenta →
            </Button>
          </form>

          <AuthModalFooter>
            <p>
              ¿Ya tienes cuenta?{' '}
              <button
                type="button"
                onClick={() => setStep('login')}
                className="text-primary hover:underline font-medium"
              >
                Iniciar Sesión
              </button>
            </p>
            <p className="mt-4 text-xs text-neutral-500">
              Al continuar, aceptas los{' '}
              <a href="/terminos" className="underline hover:text-neutral-700">
                Términos
              </a>{' '}
              y{' '}
              <a href="/privacidad" className="underline hover:text-neutral-700">
                Privacidad
              </a>
            </p>
          </AuthModalFooter>
        </>
      )}

      {step === 'login' && (
        <>
          <AuthModalHeader
            title="Iniciar Sesión"
            subtitle="Bienvenido de vuelta"
          />

          <GoogleAuthButton
            onClick={handleGoogleAuth}
            loading={isLoading}
            text="Continuar con Google"
          />

          <AuthDivider />

          <form onSubmit={handleEmailLogin} className="space-y-4">
            {errors.general && (
              <div
                role="alert"
                aria-live="assertive"
                className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600"
              >
                {errors.general}
              </div>
            )}

            <FormInput
              label="Correo Electrónico"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              required
              placeholder="tu@email.com"
              autoComplete="email"
            />

            <FormInput
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              required
              showPasswordToggle
              autoComplete="current-password"
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me-login"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-primary focus:ring-primary border-neutral-300 rounded"
                  aria-label="Recordar sesión"
                />
                <label htmlFor="remember-me-login" className="ml-2 block text-sm text-neutral-700">
                  Recordarme
                </label>
              </div>
              <a href="/recuperar-contrasena" className="text-sm text-primary hover:underline">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              loading={isLoading}
              loadingText="Iniciando sesión..."
            >
              Iniciar Sesión
            </Button>
          </form>

          <AuthModalFooter>
            <p>
              ¿No tienes cuenta?{' '}
              <button
                type="button"
                onClick={() => setStep('signup')}
                className="text-primary hover:underline font-medium"
              >
                Crear Cuenta
              </button>
            </p>
          </AuthModalFooter>
        </>
      )}

    </AuthModal>
  );
}

