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
import { httpBatchLink } from '@trpc/client';
import superjson from 'superjson';
import { validatePassword } from '@/lib/validation/password';
import { validateEmail, sanitizeEmail } from '@/lib/validation/email';
import { getCSRFToken } from '@/lib/security/csrf';
import DOMPurify from 'isomorphic-dompurify';
import { secureAuth } from '@/lib/auth/secure-auth';
import { Home, Building2 } from 'lucide-react';

export interface UniversalAuthFlowProps {
  isOpen: boolean;
  onClose: () => void;
  initialStep?: 'login' | 'signup' | 'select-type';
  onSuccess?: () => void;
}

type AuthStep = 'login' | 'signup' | 'select-type';
type UserType = 'tenant' | 'landlord' | null;

/**
 * Universal Authentication Flow Component
 *
 * A unified authentication flow for both tenants and landlords:
 * 1. Login: Universal login for all users
 * 2. Signup: User selects type (tenant/landlord) then creates account
 * 3. Post-auth: Automatic redirect based on user's profile(s)
 */
export function UniversalAuthFlow({
  isOpen,
  onClose,
  initialStep = 'login',
  onSuccess
}: UniversalAuthFlowProps) {
  const router = useRouter();
  const [step, setStep] = useState<AuthStep>(initialStep);
  const [userType, setUserType] = useState<UserType>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [passwordValidation, setPasswordValidation] = useState(validatePassword(''));

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

  /**
   * Check user profiles and redirect to appropriate dashboard
   */
  const handlePostAuthRedirect = async () => {
    try {
      const token = await secureAuth.getAccessToken();

      console.log('[UniversalAuth] Checking user profiles for redirect...');
      console.log('[UniversalAuth] 🔑 Token available:', token ? 'YES' : 'NO');

      if (!token) {
        console.error('[UniversalAuth] No token available, cannot check profiles');
        // Fallback based on userType
        if (userType === 'landlord') {
          window.location.href = '/landlord/onboarding/welcome';
        } else {
          window.location.href = '/tenant/profile/complete';
        }
        return;
      }

      // Use tRPC client directly with the token
      const backendUrl = process.env.NEXT_PUBLIC_TRPC_URL || 'http://localhost:3001/trpc';

      // Create a temporary tRPC client with auth header
      const { createTRPCProxyClient } = await import('@trpc/client');
      const { httpBatchLink } = await import('@trpc/client');

      const tempClient = createTRPCProxyClient<any>({
        transformer: superjson,
        links: [
          httpBatchLink({
            url: backendUrl,
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }),
        ],
      });

      // Check both profiles in parallel using tRPC client
      const [tenantProfileResult, landlordProfileResult] = await Promise.allSettled([
        tempClient.tenantProfile.getCurrent.query().then((res: any) => {
          console.log('[UniversalAuth] ✅ Tenant profile raw response:', res);
          // tRPC wraps responses in { success, data } format
          const profile = res?.data || res;
          console.log('[UniversalAuth] 🔍 Tenant profile extracted:', profile);
          return profile;
        }).catch((e: any) => {
          console.log('[UniversalAuth] ❌ Tenant profile error:', e.message, e);
          // If NOT_FOUND error, return null (user doesn't have tenant profile)
          if (e.message?.includes('NOT_FOUND') || e.message?.includes('no encontrado')) {
            return null;
          }
          return null;
        }),

        tempClient.landlordProfile.getCurrent.query().then((res: any) => {
          console.log('[UniversalAuth] ✅ Landlord profile raw response:', res);
          // tRPC wraps responses in { success, data } format
          const profile = res?.data || res;
          console.log('[UniversalAuth] 🔍 Landlord profile extracted:', profile);
          return profile;
        }).catch((e: any) => {
          console.log('[UniversalAuth] ❌ Landlord profile error:', e.message, e);
          // If NOT_FOUND error, return null (user doesn't have landlord profile)
          if (e.message?.includes('NOT_FOUND') || e.message?.includes('no encontrado')) {
            return null;
          }
          return null;
        })
      ]);

      const tenantProfile = tenantProfileResult.status === 'fulfilled' ? tenantProfileResult.value : null;
      const landlordProfile = landlordProfileResult.status === 'fulfilled' ? landlordProfileResult.value : null;

      const hasTenantProfile = !!tenantProfile?.fullName;
      const hasLandlordProfile = !!(landlordProfile && (landlordProfile.city || landlordProfile.propertyLocation || landlordProfile.userId));

      console.log('[UniversalAuth] Profile check:', { hasTenantProfile, hasLandlordProfile });
      console.log('[UniversalAuth] 🔍 Tenant profile object:', JSON.stringify(tenantProfile, null, 2));
      console.log('[UniversalAuth] 🔍 Landlord profile object:', JSON.stringify(landlordProfile, null, 2));

      // Priority: Landlord > Tenant > Onboarding
      if (hasLandlordProfile) {
        console.log('[UniversalAuth] → Redirecting to landlord dashboard');
        window.location.href = '/dashboard?tab=leads';
      } else if (hasTenantProfile) {
        console.log('[UniversalAuth] → Redirecting to tenant dashboard');
        window.location.href = '/dashboard?tab=saved-searches';
      } else {
        // No profile found - redirect based on signup intent or default to tenant
        console.log('[UniversalAuth] → No profile, redirecting to onboarding');
        if (userType === 'landlord') {
          window.location.href = '/landlord/onboarding/welcome';
        } else {
          window.location.href = '/tenant/profile/complete';
        }
      }
    } catch (error) {
      console.error('[UniversalAuth] Error checking profiles:', error);
      // Fallback: redirect based on user type or default
      if (userType === 'landlord') {
        window.location.href = '/landlord/onboarding/welcome';
      } else {
        window.location.href = '/tenant/profile/complete';
      }
    }
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!userType) {
      setErrors({ general: 'Por favor selecciona si eres inquilino o arrendador' });
      return;
    }

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
        intent: userType
      });

      if (result.success && result.data) {
        console.log('[UniversalAuth] Signup successful, signing in...');
        const { error: signInError } = await signIn(sanitizedEmail, password);

        if (signInError) {
          console.error('[UniversalAuth] Sign in failed after signup:', signInError);
          setErrors({
            general: 'Error al iniciar sesión. Por favor, intenta nuevamente.'
          });
          return;
        }

        // Wait for access token
        console.log('[UniversalAuth] Waiting for access token...');
        let tokenAvailable = false;
        for (let i = 0; i < 10; i++) {
          await new Promise(resolve => setTimeout(resolve, 500));
          const token = await secureAuth.getAccessToken();
          if (token) {
            tokenAvailable = true;
            console.log('[UniversalAuth] Token confirmed');
            break;
          }
        }

        if (!tokenAvailable) {
          console.error('[UniversalAuth] Token not available');
          setErrors({
            general: 'Error al establecer la sesión. Por favor, intenta de nuevo.'
          });
          return;
        }

        console.log('[UniversalAuth] ✅ Signup complete, redirecting...');
        await handlePostAuthRedirect();
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

    const sanitizedEmail = sanitizeEmail(email);

    try {
      const result = await loginMutation.mutateAsync({
        email: sanitizedEmail,
        password
      });

      if (result.success && result.data) {
        console.log('[UniversalAuth] Login successful, signing in...');
        const { error: signInError } = await signIn(sanitizedEmail, password);

        if (signInError) {
          console.error('[UniversalAuth] Sign in failed:', signInError);
          setErrors({
            general: 'Error al iniciar sesión. Por favor, intenta nuevamente.'
          });
          return;
        }

        // Wait for access token
        console.log('[UniversalAuth] Waiting for access token...');
        let tokenAvailable = false;
        for (let i = 0; i < 10; i++) {
          await new Promise(resolve => setTimeout(resolve, 500));
          const token = await secureAuth.getAccessToken();
          if (token) {
            tokenAvailable = true;
            console.log('[UniversalAuth] Token confirmed');
            break;
          }
        }

        if (!tokenAvailable) {
          console.error('[UniversalAuth] Token not available');
          setErrors({
            general: 'Error al establecer la sesión. Por favor, intenta de nuevo.'
          });
          return;
        }

        console.log('[UniversalAuth] ✅ Login complete, redirecting...');
        await handlePostAuthRedirect();
      }
    } catch (error: any) {
      setErrors({
        general: 'Credenciales inválidas. Por favor, intenta de nuevo.'
      });
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('OAuth error:', error?.name);
        }
        setErrors({
          general: 'No se pudo conectar con Google. Por favor intenta de nuevo.'
        });
      }
    } catch (error) {
      setErrors({
        general: 'Error de conexión. Verifica tu internet e intenta nuevamente.'
      });
    }
  };

  const isLoading = signupMutation.isLoading || loginMutation.isLoading;

  return (
    <AuthModal isOpen={isOpen} onClose={onClose} intent="tenant">
      {/* Step 1: Select User Type (for signup) */}
      {step === 'select-type' && (
        <>
          <AuthModalHeader
            title="¿Qué estás buscando?"
            subtitle="Selecciona el tipo de cuenta que deseas crear"
          />

          <div className="space-y-4">
            {/* Tenant Option */}
            <button
              onClick={() => {
                setUserType('tenant');
                setStep('signup');
              }}
              className="w-full p-6 rounded-lg border-2 border-neutral-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-blue-100 group-hover:bg-blue-200 transition-colors">
                  <Home className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-1">
                    Soy Inquilino
                  </h3>
                  <p className="text-sm text-neutral-600">
                    Busco un lugar para alquilar
                  </p>
                </div>
              </div>
            </button>

            {/* Landlord Option */}
            <button
              onClick={() => {
                setUserType('landlord');
                setStep('signup');
              }}
              className="w-full p-6 rounded-lg border-2 border-neutral-200 hover:border-green-500 hover:bg-green-50 transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-green-100 group-hover:bg-green-200 transition-colors">
                  <Building2 className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-1">
                    Soy Arrendador
                  </h3>
                  <p className="text-sm text-neutral-600">
                    Quiero publicar mi propiedad
                  </p>
                </div>
              </div>
            </button>
          </div>

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
          </AuthModalFooter>
        </>
      )}

      {/* Step 2: Signup Form */}
      {step === 'signup' && (
        <>
          <AuthModalHeader
            title="Crear Cuenta"
            subtitle={userType === 'tenant' ? 'Encuentra tu hogar ideal' : 'Publica tu propiedad'}
          />

          <GoogleAuthButton
            onClick={handleGoogleAuth}
            loading={isLoading}
            text="Registrarse con Google"
          />

          <AuthDivider />

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

              {password && (
                <div className="mt-3">
                  <PasswordStrengthIndicator
                    validation={passwordValidation}
                    showRequirements={true}
                  />
                </div>
              )}
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
            <button
              type="button"
              onClick={() => {
                setUserType(null);
                setStep('select-type');
              }}
              className="text-sm text-neutral-600 hover:text-neutral-900"
            >
              ← Cambiar tipo de cuenta
            </button>
            <p className="mt-2">
              ¿Ya tienes cuenta?{' '}
              <button
                type="button"
                onClick={() => setStep('login')}
                className="text-primary hover:underline font-medium"
              >
                Iniciar Sesión
              </button>
            </p>
          </AuthModalFooter>
        </>
      )}

      {/* Step 3: Login Form */}
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

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-neutral-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 text-neutral-700">
                  Recordarme
                </label>
              </div>
              <a href="/recuperar-contrasena" className="text-primary hover:underline">
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
                onClick={() => setStep('select-type')}
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
