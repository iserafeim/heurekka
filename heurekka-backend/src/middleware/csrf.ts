import { Request, Response, NextFunction } from 'express';
import { TRPCError } from '@trpc/server';
import { generateCsrfToken, hashToken, verifyToken } from '../utils/crypto.util';
import { getAuditLogger } from '../utils/audit-logger.util';

/**
 * CSRF Protection Middleware
 * Implements double-submit cookie pattern for CSRF protection
 *
 * Security: Protects against Cross-Site Request Forgery attacks
 */

const CSRF_TOKEN_HEADER = 'x-csrf-token';
const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_TOKEN_EXPIRY = 3600000; // 1 hour

// Store CSRF tokens in memory (in production, use Redis)
const csrfTokenStore = new Map<string, { hash: string; expiresAt: number }>();

/**
 * Generate and set CSRF token
 */
export function generateCsrfMiddleware(req: Request, res: Response, next: NextFunction): void {
  try {
    // Generate new CSRF token
    const token = generateCsrfToken();
    const tokenHash = hashToken(token);
    const expiresAt = Date.now() + CSRF_TOKEN_EXPIRY;

    // Store hash in memory
    csrfTokenStore.set(token, { hash: tokenHash, expiresAt });

    // Set cookie (HttpOnly, Secure, SameSite)
    res.cookie(CSRF_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: CSRF_TOKEN_EXPIRY,
      path: '/'
    });

    // Also send in response header for SPA
    res.setHeader('X-CSRF-Token', token);

    next();
  } catch (error) {
    console.error('CSRF token generation error:', error);
    next();
  }
}

/**
 * Verify CSRF token
 */
export function verifyCsrfMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Skip CSRF check for GET, HEAD, OPTIONS (safe methods)
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  try {
    // Get token from header
    const headerToken = req.headers[CSRF_TOKEN_HEADER] as string;

    // Get token from cookie
    const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];

    // Both must be present and match
    if (!headerToken || !cookieToken) {
      const auditLogger = getAuditLogger();
      auditLogger.logCsrfViolation(
        req.ip || 'unknown',
        req.path,
        req.headers['user-agent']
      );

      res.status(403).json({
        error: 'CSRF token missing',
        message: 'Solicitud no válida. Por favor recarga la página.'
      });
      return;
    }

    // Tokens must match (double-submit pattern)
    if (headerToken !== cookieToken) {
      const auditLogger = getAuditLogger();
      auditLogger.logCsrfViolation(
        req.ip || 'unknown',
        req.path,
        req.headers['user-agent']
      );

      res.status(403).json({
        error: 'CSRF token mismatch',
        message: 'Solicitud no válida. Por favor recarga la página.'
      });
      return;
    }

    // Verify token exists in store and hasn't expired
    const storedToken = csrfTokenStore.get(cookieToken);
    if (!storedToken || storedToken.expiresAt < Date.now()) {
      res.status(403).json({
        error: 'CSRF token expired',
        message: 'Token expirado. Por favor recarga la página.'
      });
      return;
    }

    // All checks passed
    next();
  } catch (error) {
    console.error('CSRF verification error:', error);
    res.status(500).json({
      error: 'CSRF verification failed',
      message: 'Error al verificar la solicitud.'
    });
  }
}

/**
 * Cleanup expired CSRF tokens periodically
 */
export function cleanupExpiredCsrfTokens(): void {
  const now = Date.now();
  for (const [token, data] of csrfTokenStore.entries()) {
    if (data.expiresAt < now) {
      csrfTokenStore.delete(token);
    }
  }
}

// Run cleanup every 10 minutes
setInterval(cleanupExpiredCsrfTokens, 600000);

/**
 * Helper for tRPC context to verify CSRF
 */
export function verifyCsrfToken(req: Request): void {
  // Skip for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return;
  }

  const headerToken = req.headers[CSRF_TOKEN_HEADER] as string;
  const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];

  if (!headerToken || !cookieToken || headerToken !== cookieToken) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Token CSRF inválido o faltante'
    });
  }

  const storedToken = csrfTokenStore.get(cookieToken);
  if (!storedToken || storedToken.expiresAt < Date.now()) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Token CSRF expirado'
    });
  }
}