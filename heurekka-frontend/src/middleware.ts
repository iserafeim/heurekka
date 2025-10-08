/**
 * Next.js Middleware for Security and Request Validation
 * Handles rate limiting, CSP, security headers, and auth protection
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limit configuration
const RATE_LIMITS = {
  '/api/auth/login': { requests: 5, windowMs: 15 * 60 * 1000 }, // 5 requests per 15 minutes
  '/api/auth/register': { requests: 3, windowMs: 60 * 60 * 1000 }, // 3 requests per hour
  '/api/contact': { requests: 10, windowMs: 60 * 60 * 1000 }, // 10 requests per hour
  '/api/search': { requests: 100, windowMs: 60 * 60 * 1000 }, // 100 requests per hour
  default: { requests: 1000, windowMs: 60 * 60 * 1000 }, // Default limit
};

/**
 * Rate limiting function
 */
function rateLimit(request: NextRequest): { allowed: boolean; remaining: number } {
  const ip = request.headers.get('X-Forwarded-For') || request.headers.get('X-Real-IP') || '127.0.0.1';
  const path = request.nextUrl.pathname;
  
  // Find matching rate limit rule
  const rateLimit = Object.entries(RATE_LIMITS).find(([pattern]) => 
    path.startsWith(pattern)
  )?.[1] || RATE_LIMITS.default;
  
  const key = `${ip}:${path}`;
  const now = Date.now();
  const windowStart = now - rateLimit.windowMs;
  
  // Get or create rate limit entry
  const current = rateLimitStore.get(key) || { count: 0, resetTime: now + rateLimit.windowMs };
  
  // Reset if window expired
  if (now > current.resetTime) {
    current.count = 0;
    current.resetTime = now + rateLimit.windowMs;
  }
  
  // Check if limit exceeded
  if (current.count >= rateLimit.requests) {
    rateLimitStore.set(key, current);
    return { allowed: false, remaining: 0 };
  }
  
  // Increment counter
  current.count++;
  rateLimitStore.set(key, current);
  
  return { allowed: true, remaining: rateLimit.requests - current.count };
}

/**
 * Clean up expired rate limit entries
 */
function cleanupRateLimitStore() {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Security headers
 */
function addSecurityHeaders(response: NextResponse): NextResponse {
  // CSP headers (already in next.config.ts but backup here)
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  
  // Remove server info
  response.headers.delete('X-Powered-By');
  
  return response;
}

/**
 * Protect tenant routes - check authentication and profile existence
 */
async function protectTenantRoutes(request: NextRequest): Promise<NextResponse | null> {
  const { pathname } = request.nextUrl;

  // Only protect /tenant/* routes
  if (!pathname.startsWith('/tenant')) {
    return null;
  }

  // Create a Supabase client configured to use cookies
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase environment variables not configured');
    return null; // Allow access if not configured (development mode)
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  try {
    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Not authenticated - redirect to login
    if (!session) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Skip profile check for the profile completion route itself
    if (pathname === '/tenant/profile/complete') {
      return response;
    }

    // Check if user has a tenant profile
    const { data: profile, error } = await supabase
      .from('tenant_profiles')
      .select('id')
      .eq('user_id', session.user.id)
      .single();

    // No profile found - redirect to profile completion
    if (error || !profile) {
      const completeUrl = new URL('/tenant/profile/complete', request.url);
      return NextResponse.redirect(completeUrl);
    }

    return response;
  } catch (error) {
    console.error('Error in tenant route protection:', error);
    // On error, allow access but log the issue
    return null;
  }
}

/**
 * Validate request for suspicious patterns
 */
function validateRequest(request: NextRequest): { valid: boolean; reason?: string } {
  const userAgent = request.headers.get('user-agent') || '';
  const referer = request.headers.get('referer') || '';
  const contentType = request.headers.get('content-type') || '';
  
  // Block common bot patterns
  const suspiciousBots = [
    'sqlmap',
    'nmap',
    'nikto',
    'dirb',
    'gobuster',
    'burpsuite',
    'masscan'
  ];
  
  if (suspiciousBots.some(bot => userAgent.toLowerCase().includes(bot))) {
    return { valid: false, reason: 'Suspicious user agent' };
  }
  
  // Validate content type for POST/PUT requests
  if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
    if (contentType && !['application/json', 'application/x-www-form-urlencoded', 'multipart/form-data'].some(type => contentType.includes(type))) {
      return { valid: false, reason: 'Invalid content type' };
    }
  }
  
  // Basic SQL injection check in URL
  const url = request.url.toLowerCase();
  const sqlKeywords = ['union', 'select', 'insert', 'delete', 'drop', 'create', 'alter', '--', ';--', '/*', '*/'];
  if (sqlKeywords.some(keyword => url.includes(keyword))) {
    return { valid: false, reason: 'Suspicious URL parameters' };
  }
  
  return { valid: true };
}

export async function middleware(request: NextRequest) {
  try {
    // Clean up rate limit store periodically
    if (Math.random() < 0.001) { // 0.1% chance
      cleanupRateLimitStore();
    }

    // Validate request
    const validation = validateRequest(request);
    if (!validation.valid) {
      console.warn(`Blocked suspicious request: ${validation.reason}`, {
        ip: request.headers.get('X-Forwarded-For') || '127.0.0.1',
        url: request.url,
        userAgent: request.headers.get('user-agent'),
      });

      return new NextResponse('Request blocked', { status: 403 });
    }

    // Protect tenant routes (authentication and profile check)
    const tenantProtection = await protectTenantRoutes(request);
    if (tenantProtection) {
      return addSecurityHeaders(tenantProtection);
    }

    // Apply rate limiting to API routes
    if (request.nextUrl.pathname.startsWith('/api/')) {
      const rateLimitResult = rateLimit(request);

      if (!rateLimitResult.allowed) {
        return new NextResponse(
          JSON.stringify({
            error: 'Demasiadas solicitudes',
            message: 'Has excedido el límite de solicitudes. Inténtalo más tarde.'
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': '900', // 15 minutes
              'X-RateLimit-Remaining': '0',
            },
          }
        );
      }

      const response = NextResponse.next();
      response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
      return addSecurityHeaders(response);
    }

    // For auth callback routes, add extra security
    if (request.nextUrl.pathname.startsWith('/auth/callback')) {
      const response = NextResponse.next();
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
      return addSecurityHeaders(response);
    }

    // Add security headers to all responses
    return addSecurityHeaders(NextResponse.next());

  } catch (error) {
    console.error('Middleware error:', error);
    // Don't block requests on middleware errors
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};