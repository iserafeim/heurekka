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
import { Shield } from 'lucide-react';
import { validatePassword } from '@/lib/validation/password';
import { validateEmail, sanitizeEmail } from '@/lib/validation/email';
import { getCSRFToken } from '@/lib/security/csrf';
import DOMPurify from 'isomorphic-dompurify';
import { secureAuth } from '@/lib/auth/secure-auth';

export interface LandlordAuthFlowProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type AuthStep = 'login' | 'signup';

/**
 * Landlord Authentication Flow Component
 *
 * Authentication flow for landlord users:
 * 1. Login/Signup
 * 2. Redirect to Dashboard
 */
export function LandlordAuthFlow({
  isOpen,
  onClose,
  onSuccess
}: LandlordAuthFlowProps) {
  const router = useRouter();
  const [step, setStep] = useState<AuthStep>('signup');
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
        intent: 'landlord'
      });

      if (result.success && result.data) {
        // Backend created the user, now sign in to get the session
        console.log('[LandlordAuth] Backend signup successful, signing in to establish session...');
        const { error: signInError } = await signIn(sanitizedEmail, password);

        if (signInError) {
          console.error('[LandlordAuth] Sign in failed after signup:', signInError);
          setErrors({
            general: 'Error al iniciar sesión. Por favor, intenta nuevamente.'
          });
          return;
        }

        // Wait for access token to be available with retries
        console.log('[LandlordAuth] Waiting for access token to be available...');
        let tokenAvailable = false;
        for (let i = 0; i < 10; i++) {
          await new Promise(resolve => setTimeout(resolve, 500));
          const token = await secureAuth.getAccessToken();
          console.log(`[LandlordAuth] Token check attempt ${i + 1}:`, token ? 'Token found' : 'No token');

          if (token) {
            tokenAvailable = true;
            console.log('[LandlordAuth] Access token confirmed available');
            break;
          }
        }

        if (!tokenAvailable) {
          console.error('[LandlordAuth] Access token not available after signup');
          setErrors({
            general: 'Error al establecer la sesión. Por favor, intenta de nuevo.'
          });
          return;
        }

        // CRITICAL: Do NOT close modal or call onSuccess until AFTER redirect
        // After signup, always redirect to onboarding (new users don't have profiles yet)
        console.log('[LandlordAuth] ✅ Signup successful, redirecting to landlord onboarding...');
        console.log('[LandlordAuth] 🚀 REDIRECTING NOW...');

        // Use window.location.href for immediate redirect to prevent middleware interception
        window.location.href = '/landlord/onboarding/welcome';
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
        await signIn(sanitizedEmail, password);

        // Wait for access token to be available with retries
        console.log('[LandlordAuth] Waiting for access token to be available...');
        let tokenAvailable = false;
        for (let i = 0; i < 10; i++) {
          await new Promise(resolve => setTimeout(resolve, 500));
          const token = await secureAuth.getAccessToken();
          console.log(`[LandlordAuth] Token check attempt ${i + 1}:`, token ? 'Token found' : 'No token');

          if (token) {
            tokenAvailable = true;
            console.log('[LandlordAuth] Access token confirmed available');
            break;
          }
        }

        if (!tokenAvailable) {
          console.error('[LandlordAuth] Access token not available after login');
          setErrors({
            general: 'Error al establecer la sesión. Por favor, intenta de nuevo.'
          });
          return;
        }

        // CRITICAL: Do NOT close modal or call onSuccess until AFTER redirect
        // Check if user has a complete landlord profile
        console.log('[LandlordAuth] ✅ Login successful, checking landlord profile...');

        try {
          const token = await secureAuth.getAccessToken();
          const backendUrl = process.env.NEXT_PUBLIC_TRPC_URL || 'http://localhost:3001/trpc';

          const landlordProfile = await fetch(`${backendUrl}/landlordProfile.getCurrent?batch=1&input=%7B%7D`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          }).then(async (res) => {
            if (!res.ok) {
              console.log('[LandlordAuth] Landlord profile not found or error:', res.status);
              return null;
            }
            const data = await res.json();
            // tRPC batch response is an array, extract first element
            const result = Array.isArray(data) ? data[0] : data;
            console.log('[LandlordAuth] Landlord profile response:', result);

            // Check for tRPC errors
            if (result?.error) {
              console.log('[LandlordAuth] Landlord profile error:', result.error?.json?.message);
              return null;
            }

            // Extract data from tRPC response format: result.data.json
            return result?.result?.data?.json || null;
          }).catch((e) => {
            console.log('[LandlordAuth] Landlord profile query error:', e.message);
            return null;
          });

          // Check if profile exists by looking for key identifying fields
          // Landlord profile exists if we got a profile object back with id, city, or propertyLocation
          const hasLandlordProfile = !!(landlordProfile && (landlordProfile.id || landlordProfile.city || landlordProfile.propertyLocation));

          if (hasLandlordProfile) {
            // Profile exists, go to unified dashboard
            console.log('[LandlordAuth] Profile exists, redirecting to dashboard');
            console.log('[LandlordAuth] 🚀 REDIRECTING NOW...');
            window.location.href = '/dashboard?tab=leads';
            // Do NOT close modal or do anything after this
            return;
          } else {
            // No profile found, go to onboarding
            console.log('[LandlordAuth] No profile found, redirecting to onboarding');
            console.log('[LandlordAuth] 🚀 REDIRECTING NOW...');
            window.location.href = '/landlord/onboarding/welcome';
            // Do NOT close modal or do anything after this
            return;
          }
        } catch (error) {
          console.error('[LandlordAuth] Error checking profile:', error);
          console.log('[LandlordAuth] 🚀 REDIRECTING NOW (error fallback)...');
          // On error, go to onboarding to be safe
          window.location.href = '/landlord/onboarding/welcome';
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
    } catch (error) {
      setErrors({
        general: 'Error de conexión. Verifica tu internet e intenta nuevamente.'
      });
    }
  };

  const isLoading = signupMutation.isLoading || loginMutation.isLoading;

  return (
    <AuthModal isOpen={isOpen} onClose={onClose} intent="landlord">
      {step === 'signup' && (
        <>
          <AuthModalHeader
            title="Publica tu Propiedad y Recibe Inquilinos Calificados"
          />

          {/* Value Props */}
          <div className="mb-6 rounded-lg bg-blue-50 border border-blue-100 p-4 space-y-2">
            {[
              'Inquilinos verificados',
              'Perfil completo',
              'WhatsApp directo',
              'Dashboard de leads'
            ].map((benefit, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-blue-900">
                <svg className="h-4 w-4 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>{benefit}</span>
              </div>
            ))}
          </div>

          {/* Platform Stats */}
          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { value: '10,000+', label: 'Inquilinos activos' },
              { value: '500+', label: 'Propiedades alquiladas' },
              { value: '48hr', label: 'Promedio para alquilar' },
              { value: '95%', label: 'Satisfacción' }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-lg font-bold text-primary">{stat.value}</div>
                <div className="text-xs text-neutral-600">{stat.label}</div>
              </div>
            ))}
          </div>

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
              label="Correo Electrónico Empresarial"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              required
              placeholder="propietario@email.com"
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

            <Button
              type="submit"
              size="lg"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              loading={isLoading}
              loadingText="Creando cuenta..."
            >
              Crear Cuenta Empresarial →
            </Button>
          </form>

          <AuthModalFooter>
            <div className="flex items-center justify-center gap-2 mb-4">
              <Shield className="h-4 w-4 text-neutral-500" />
              <span className="text-xs">Tus datos están seguros</span>
            </div>
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
              <a href="/terminos-anunciantes" className="underline hover:text-neutral-700">
                Términos para Anunciantes
              </a>
            </p>
          </AuthModalFooter>
        </>
      )}

      {step === 'login' && (
        <>
          <AuthModalHeader
            title="Iniciar Sesión"
            subtitle="Accede a tu cuenta de anunciante"
          />

          <GoogleAuthButton
            onClick={handleGoogleAuth}
            loading={isLoading}
            text="Continuar con Google"
          />

          <AuthDivider />

          <form onSubmit={handleEmailLogin} className="space-y-4">
            {errors.general && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
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
                  id="remember-landlord"
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-neutral-300 rounded"
                />
                <label htmlFor="remember-landlord" className="ml-2 text-neutral-700">
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