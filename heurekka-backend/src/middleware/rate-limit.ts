import rateLimit from 'express-rate-limit';
import { getAuditLogger } from '../utils/audit-logger.util';

/**
 * Rate Limiting Middleware
 * Protects against brute force attacks and DoS
 *
 * Security: Implements progressive delays and account lockout
 */

/**
 * Strict rate limiter for authentication endpoints
 * 5 requests per 15 minutes per IP
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: {
    error: 'Too many authentication attempts',
    message: 'Demasiados intentos. Por favor espera 15 minutos e intenta nuevamente.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  handler: (req, res) => {
    const auditLogger = getAuditLogger();
    auditLogger.logRateLimitExceeded(
      req.ip || 'unknown',
      req.path,
      req.headers['user-agent'] as string
    );

    res.status(429).json({
      error: 'Too many requests',
      message: 'Demasiados intentos. Por favor espera 15 minutos e intenta nuevamente.',
      retryAfter: Math.ceil((req.rateLimit?.resetTime?.getTime() || Date.now()) / 1000)
    });
  }
});

/**
 * Very strict rate limiter for password reset
 * 3 requests per hour per IP
 */
export const passwordResetRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 requests per hour
  message: {
    error: 'Too many password reset attempts',
    message: 'Demasiados intentos de restablecimiento. Por favor espera 1 hora.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  handler: (req, res) => {
    const auditLogger = getAuditLogger();
    auditLogger.logRateLimitExceeded(
      req.ip || 'unknown',
      req.path,
      req.headers['user-agent'] as string
    );

    res.status(429).json({
      error: 'Too many password reset requests',
      message: 'Demasiados intentos de restablecimiento. Por favor espera 1 hora.',
      retryAfter: Math.ceil((req.rateLimit?.resetTime?.getTime() || Date.now()) / 1000)
    });
  }
});

/**
 * Moderate rate limiter for general API endpoints
 * 100 requests per 15 minutes per IP
 */
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    error: 'Too many requests',
    message: 'Demasiadas solicitudes. Por favor espera unos minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  handler: (req, res) => {
    const auditLogger = getAuditLogger();
    auditLogger.logRateLimitExceeded(
      req.ip || 'unknown',
      req.path,
      req.headers['user-agent'] as string
    );

    res.status(429).json({
      error: 'Too many requests',
      message: 'Demasiadas solicitudes. Por favor espera unos minutos.',
      retryAfter: Math.ceil((req.rateLimit?.resetTime?.getTime() || Date.now()) / 1000)
    });
  }
});

/**
 * Email verification rate limiter
 * 5 requests per hour per IP
 */
export const emailVerificationRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 requests per hour
  message: {
    error: 'Too many verification requests',
    message: 'Demasiados intentos de verificación. Por favor espera 1 hora.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const auditLogger = getAuditLogger();
    auditLogger.logRateLimitExceeded(
      req.ip || 'unknown',
      req.path,
      req.headers['user-agent'] as string
    );

    res.status(429).json({
      error: 'Too many verification requests',
      message: 'Demasiados intentos de verificación. Por favor espera 1 hora.',
      retryAfter: Math.ceil((req.rateLimit?.resetTime?.getTime() || Date.now()) / 1000)
    });
  }
});

/**
 * Create custom rate limiter with specified options
 */
export function createRateLimiter(options: {
  windowMs: number;
  max: number;
  message: string;
}) {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    message: {
      error: 'Too many requests',
      message: options.message
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      const auditLogger = getAuditLogger();
      auditLogger.logRateLimitExceeded(
        req.ip || 'unknown',
        req.path,
        req.headers['user-agent'] as string
      );

      res.status(429).json({
        error: 'Too many requests',
        message: options.message,
        retryAfter: Math.ceil((req.rateLimit?.resetTime?.getTime() || Date.now()) / 1000)
      });
    }
  });
}