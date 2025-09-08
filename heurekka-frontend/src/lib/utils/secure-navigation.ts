/**
 * Secure Navigation Utilities
 * Provides safe URL handling and redirect validation
 */

import { secureURL } from '@/lib/validation/security';

// Allowed domains for redirects
const ALLOWED_REDIRECT_DOMAINS = [
  'localhost:3000',
  'localhost:3001',
  'heurekka.com',
  'www.heurekka.com',
  // Add your production domains here
];

// Allowed external domains for specific integrations
const ALLOWED_EXTERNAL_DOMAINS = [
  'maps.google.com',
  'www.google.com',
  'api.whatsapp.com',
  'wa.me',
  'supabase.co',
  'accounts.google.com',
];

/**
 * Validate if a URL is safe for redirection
 */
export function validateRedirectURL(url: string, allowExternal: boolean = false): {
  valid: boolean;
  url?: string;
  error?: string;
} {
  try {
    // Basic validation
    if (!url || typeof url !== 'string') {
      return { valid: false, error: 'URL inválida' };
    }

    // Remove potential XSS vectors
    if (url.includes('<') || url.includes('>') || url.includes('javascript:') || url.includes('data:')) {
      return { valid: false, error: 'URL contiene contenido peligroso' };
    }

    // Handle relative URLs (make them safe)
    if (url.startsWith('/')) {
      // Relative URL - safe by default but validate path
      if (url.includes('..') || url.includes('//')) {
        return { valid: false, error: 'Ruta relativa no válida' };
      }
      return { valid: true, url };
    }

    // Parse absolute URL
    const parsedURL = new URL(url);

    // Only allow http/https
    if (!['http:', 'https:'].includes(parsedURL.protocol)) {
      return { valid: false, error: 'Protocolo no permitido' };
    }

    // Check if domain is allowed
    const domain = parsedURL.hostname.toLowerCase();
    
    if (allowExternal) {
      const isAllowedExternal = ALLOWED_EXTERNAL_DOMAINS.some(allowedDomain => 
        domain === allowedDomain || domain.endsWith(`.${allowedDomain}`)
      );
      
      if (isAllowedExternal) {
        return { valid: true, url };
      }
    }

    // Check internal domains
    const isAllowedInternal = ALLOWED_REDIRECT_DOMAINS.some(allowedDomain =>
      domain === allowedDomain || domain.endsWith(`.${allowedDomain}`)
    );

    if (isAllowedInternal) {
      return { valid: true, url };
    }

    return { valid: false, error: 'Dominio no permitido' };

  } catch (error) {
    return { valid: false, error: 'URL malformada' };
  }
}

/**
 * Create a safe redirect URL with validation
 */
export function createSafeRedirect(path: string, fallback: string = '/'): string {
  const validation = validateRedirectURL(path);
  
  if (validation.valid && validation.url) {
    return validation.url;
  }
  
  console.warn('Unsafe redirect blocked:', path, validation.error);
  return fallback;
}

/**
 * Safe external link opener with security attributes
 */
export function openExternalLink(url: string): boolean {
  const validation = validateRedirectURL(url, true);
  
  if (!validation.valid) {
    console.warn('External link blocked:', url, validation.error);
    return false;
  }

  try {
    const newWindow = window.open(
      validation.url,
      '_blank',
      'noopener,noreferrer,nofollow'
    );

    // Clear window.opener reference for security
    if (newWindow) {
      newWindow.opener = null;
    }

    return true;
  } catch (error) {
    console.error('Failed to open external link:', error);
    return false;
  }
}

/**
 * Secure WhatsApp link generator
 */
export function createWhatsAppLink(phoneNumber: string, message?: string): string {
  // Remove all non-digits from phone number
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  
  // Validate Honduras phone format
  if (!cleanPhone.match(/^504[2-9]\d{7}$/)) {
    console.warn('Invalid WhatsApp phone number:', phoneNumber);
    return '#';
  }

  let whatsappURL = `https://wa.me/${cleanPhone}`;
  
  if (message) {
    // Sanitize and encode the message
    const sanitizedMessage = encodeURIComponent(
      message.replace(/<[^>]*>/g, '').trim().substring(0, 500)
    );
    whatsappURL += `?text=${sanitizedMessage}`;
  }

  return whatsappURL;
}

/**
 * Safe Google Maps link generator
 */
export function createMapsLink(
  latitude: number, 
  longitude: number, 
  address?: string
): string {
  // Validate coordinates
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    console.warn('Invalid coordinates for maps link');
    return '#';
  }

  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    console.warn('Coordinates out of valid range');
    return '#';
  }

  let mapsURL = `https://maps.google.com/?q=${latitude},${longitude}`;
  
  if (address) {
    // Sanitize address
    const sanitizedAddress = encodeURIComponent(
      address.replace(/<[^>]*>/g, '').trim().substring(0, 200)
    );
    mapsURL += `&query=${sanitizedAddress}`;
  }

  return mapsURL;
}

/**
 * Authentication redirect helper
 */
export function createAuthRedirect(returnTo?: string): string {
  if (!returnTo) {
    return '/';
  }

  // Validate the return URL
  const validation = validateRedirectURL(returnTo);
  
  if (!validation.valid || !validation.url) {
    console.warn('Invalid auth redirect, using fallback:', returnTo);
    return '/';
  }

  // Don't redirect to auth pages to prevent loops
  const authPaths = ['/login', '/register', '/auth/', '/logout'];
  if (authPaths.some(path => validation.url!.includes(path))) {
    return '/';
  }

  return validation.url;
}

/**
 * Navigation guard for protected routes
 */
export function validateProtectedRoute(pathname: string, isAuthenticated: boolean): {
  allowed: boolean;
  redirect?: string;
} {
  // Define protected routes
  const protectedRoutes = [
    '/dashboard',
    '/profile',
    '/mis-propiedades',
    '/favoritos',
    '/configuracion'
  ];

  // Define public-only routes (redirect if authenticated)
  const publicOnlyRoutes = [
    '/login',
    '/register'
  ];

  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      return {
        allowed: false,
        redirect: `/login?returnTo=${encodeURIComponent(pathname)}`
      };
    }
  }

  if (publicOnlyRoutes.some(route => pathname.startsWith(route))) {
    if (isAuthenticated) {
      return {
        allowed: false,
        redirect: '/dashboard'
      };
    }
  }

  return { allowed: true };
}

/**
 * Sanitize search parameters for URLs
 */
export function sanitizeSearchParams(params: Record<string, any>): URLSearchParams {
  const sanitized = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value != null && value !== '') {
      // Sanitize key and value
      const cleanKey = key.replace(/[<>]/g, '').trim();
      const cleanValue = String(value).replace(/[<>]/g, '').trim();
      
      if (cleanKey && cleanValue) {
        sanitized.set(cleanKey, cleanValue);
      }
    }
  });

  return sanitized;
}

// Export validation utilities
export const navigationUtils = {
  validateRedirectURL,
  createSafeRedirect,
  openExternalLink,
  createWhatsAppLink,
  createMapsLink,
  createAuthRedirect,
  validateProtectedRoute,
  sanitizeSearchParams,
};