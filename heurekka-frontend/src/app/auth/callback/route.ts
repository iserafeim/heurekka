/**
 * Auth Callback Route
 * Handles Supabase authentication callbacks securely
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createAuthRedirect, validateRedirectURL } from '@/lib/utils/secure-navigation';
import { logSecurityEvent } from '@/lib/utils/error-handler';

export async function GET(request: NextRequest) {
  try {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const returnTo = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    // Handle auth errors
    if (error) {
      console.warn('Auth callback error:', error, errorDescription);
      
      logSecurityEvent('auth_callback_error', {
        ip: request.headers.get('X-Forwarded-For') || '127.0.0.1',
        userAgent: request.headers.get('user-agent') || undefined,
        severity: 'medium',
      });

      const errorUrl = new URL('/login', origin);
      errorUrl.searchParams.set('error', 'auth_failed');
      errorUrl.searchParams.set('message', 'Error de autenticación');
      
      return NextResponse.redirect(errorUrl);
    }

    // Validate auth code
    if (!code) {
      console.warn('Auth callback missing code parameter');
      
      const errorUrl = new URL('/login', origin);
      errorUrl.searchParams.set('error', 'invalid_request');
      
      return NextResponse.redirect(errorUrl);
    }

    // Create response for cookie handling
    const response = NextResponse.next();

    // Create Supabase client with cookie handling
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            request.cookies.set({ name, value, ...options });
            response.cookies.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            request.cookies.set({ name, value: '', ...options });
            response.cookies.set({ name, value: '', ...options });
          },
        },
      }
    );

    // Exchange code for session
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error('Failed to exchange code for session:', exchangeError);
      
      logSecurityEvent('auth_exchange_failed', {
        ip: request.headers.get('X-Forwarded-For') || '127.0.0.1',
        userAgent: request.headers.get('user-agent') || undefined,
        severity: 'high',
      });

      const errorUrl = new URL('/login', origin);
      errorUrl.searchParams.set('error', 'session_failed');
      
      return NextResponse.redirect(errorUrl, { headers: response.headers });
    }

    if (!data.session || !data.user) {
      console.warn('No session or user after code exchange');
      
      const errorUrl = new URL('/login', origin);
      errorUrl.searchParams.set('error', 'session_invalid');
      
      return NextResponse.redirect(errorUrl, { headers: response.headers });
    }

    // Log successful authentication
    logSecurityEvent('auth_success', {
      ip: request.headers.get('X-Forwarded-For') || '127.0.0.1',
      userAgent: request.headers.get('user-agent') || undefined,
      userId: data.user.id,
      severity: 'low',
    });

    // Determine redirect URL
    let redirectUrl: string;

    if (returnTo) {
      // Validate return URL
      const validation = validateRedirectURL(decodeURIComponent(returnTo));
      redirectUrl = validation.valid && validation.url ? validation.url : '/dashboard';
    } else {
      redirectUrl = '/dashboard';
    }

    // Ensure absolute URL
    if (!redirectUrl.startsWith('http')) {
      redirectUrl = new URL(redirectUrl, origin).toString();
    }

    console.log('Auth callback successful, redirecting to:', redirectUrl);

    return NextResponse.redirect(redirectUrl, {
      headers: response.headers,
    });

  } catch (error) {
    console.error('Auth callback error:', error);

    logSecurityEvent('auth_callback_exception', {
      ip: request.headers.get('X-Forwarded-For') || '127.0.0.1',
      userAgent: request.headers.get('user-agent') || undefined,
      severity: 'critical',
    });

    // Fallback redirect
    const errorUrl = new URL('/login', request.url);
    errorUrl.searchParams.set('error', 'unexpected_error');
    
    return NextResponse.redirect(errorUrl);
  }
}