import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';

/**
 * Security Headers Middleware
 * Implements comprehensive security headers for production deployment
 *
 * Security: Protects against XSS, clickjacking, MIME sniffing, and other attacks
 */

/**
 * Enhanced Helmet configuration with strict security
 */
export const helmetConfig = helmet({
  // Content Security Policy - prevents XSS attacks
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // TODO: Remove unsafe-inline in production with nonces
      styleSrc: ["'self'", "'unsafe-inline'"], // TODO: Remove unsafe-inline in production with nonces
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", process.env.SUPABASE_URL || ''].filter(Boolean),
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : undefined
    }
  },

  // HTTP Strict Transport Security - forces HTTPS
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },

  // X-Frame-Options - prevents clickjacking
  frameguard: {
    action: 'deny'
  },

  // X-Content-Type-Options - prevents MIME sniffing
  noSniff: true,

  // X-XSS-Protection - enables XSS filter in older browsers
  xssFilter: true,

  // Referrer-Policy - controls referer header
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin'
  },

  // Cross-Origin-Embedder-Policy
  crossOriginEmbedderPolicy: false, // Disabled for tRPC compatibility

  // Cross-Origin-Opener-Policy
  crossOriginOpenerPolicy: {
    policy: 'same-origin'
  },

  // Cross-Origin-Resource-Policy
  crossOriginResourcePolicy: {
    policy: 'same-origin'
  },

  // Remove X-Powered-By header
  hidePoweredBy: true,

  // DNS Prefetch Control
  dnsPrefetchControl: {
    allow: false
  },

  // IE No Open
  ieNoOpen: true,

  // Permissions Policy (formerly Feature Policy)
  permittedCrossDomainPolicies: {
    permittedPolicies: 'none'
  }
});

/**
 * Additional custom security headers
 */
export function additionalSecurityHeaders(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Permissions Policy - restricts browser features
  res.setHeader(
    'Permissions-Policy',
    [
      'geolocation=(self)',
      'camera=()',
      'microphone=()',
      'payment=()',
      'usb=()',
      'magnetometer=()',
      'gyroscope=()',
      'accelerometer=()',
      'ambient-light-sensor=()',
      'autoplay=()',
      'encrypted-media=()',
      'fullscreen=(self)',
      'picture-in-picture=()'
    ].join(', ')
  );

  // X-Permitted-Cross-Domain-Policies
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');

  // Clear-Site-Data header (for logout)
  if (req.path === '/auth/logout') {
    res.setHeader('Clear-Site-Data', '"cache", "cookies", "storage"');
  }

  // Expect-CT header (Certificate Transparency)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Expect-CT', 'max-age=86400, enforce');
  }

  // X-Robots-Tag - prevent indexing of API
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');

  // Cache control for security-sensitive endpoints
  if (req.path.startsWith('/auth') || req.path.startsWith('/trpc')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }

  next();
}

/**
 * CORS configuration
 */
export function getCORSOptions() {
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000')
    .split(',')
    .map(origin => origin.trim());

  return {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (like mobile apps or Postman)
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        callback(new Error('CORS policy violation: Origin not allowed'), false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'X-CSRF-Token',
      'Accept',
      'Origin'
    ],
    exposedHeaders: ['X-CSRF-Token', 'X-RateLimit-Limit', 'X-RateLimit-Remaining'],
    maxAge: 86400, // 24 hours
    optionsSuccessStatus: 200
  };
}

/**
 * Force HTTPS in production
 */
export function forceHTTPS(req: Request, res: Response, next: NextFunction): void {
  if (process.env.NODE_ENV === 'production' && !req.secure && req.get('x-forwarded-proto') !== 'https') {
    return res.redirect(301, `https://${req.get('host')}${req.url}`);
  }
  next();
}

/**
 * Security information endpoint (for monitoring)
 */
export function securityInfo(req: Request, res: Response): void {
  res.json({
    security: {
      hsts: true,
      csp: true,
      xssProtection: true,
      noSniff: true,
      frameOptions: 'DENY',
      referrerPolicy: 'strict-origin-when-cross-origin',
      httpsOnly: process.env.NODE_ENV === 'production'
    },
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
}