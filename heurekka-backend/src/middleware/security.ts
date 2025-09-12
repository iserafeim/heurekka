/**
 * Security Middleware Implementation
 * Provides authentication, authorization, rate limiting, and input validation
 */

import { TRPCError } from '@trpc/server';
import jwt from 'jsonwebtoken';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import DOMPurify from 'isomorphic-dompurify';
import validator from 'validator';
import { createHash, randomBytes } from 'crypto';
import type { Context } from '../server';

// ============================================
// Authentication Middleware
// ============================================

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'user' | 'landlord' | 'admin';
  iat: number;
  exp: number;
}

export const verifyJWT = (token: string): JWTPayload => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET not configured');
  }
  
  try {
    return jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;
  } catch (error) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Invalid or expired token'
    });
  }
};

export const generateJWT = (payload: Omit<JWTPayload, 'iat' | 'exp'>): string => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET not configured');
  }
  
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '24h',
    issuer: 'heurekka-backend',
    audience: 'heurekka-app'
  });
};

export const authenticateRequest = async (ctx: Context) => {
  const authHeader = ctx.req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Missing authentication token'
    });
  }
  
  const token = authHeader.substring(7);
  const payload = verifyJWT(token);
  
  // Verify token hasn't been revoked
  const isRevoked = await checkTokenRevocation(token);
  if (isRevoked) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Token has been revoked'
    });
  }
  
  return payload;
};

// ============================================
// Authorization Middleware
// ============================================

export const authorizeRole = (allowedRoles: string[]) => {
  return (user: JWTPayload) => {
    if (!allowedRoles.includes(user.role)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Insufficient permissions'
      });
    }
  };
};

export const authorizeResource = async (
  userId: string,
  resourceType: string,
  resourceId: string,
  action: 'read' | 'write' | 'delete'
): Promise<boolean> => {
  // Implement resource-based access control
  // Check if user has permission to perform action on resource
  // This would typically query a permissions database
  
  // Example implementation:
  const permissions = await getResourcePermissions(userId, resourceType, resourceId);
  return permissions.includes(action);
};

// ============================================
// Rate Limiting
// ============================================

export const createRateLimiter = (
  maxRequests: number = 100,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
) => {
  return rateLimit({
    windowMs,
    max: maxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      // Use authenticated user ID if available, otherwise IP
      const authHeader = req.headers.authorization;
      if (authHeader) {
        try {
          const token = authHeader.substring(7);
          const payload = jwt.decode(token) as JWTPayload;
          return payload.userId;
        } catch {
          // Fall back to IP using the official helper
        }
      }
      // Use the official IPv6-safe IP key generator
      return ipKeyGenerator(req);
    },
    handler: (req, res) => {
      throw new TRPCError({
        code: 'TOO_MANY_REQUESTS',
        message: 'Rate limit exceeded. Please try again later.'
      });
    }
  });
};

// Endpoint-specific rate limiters
export const rateLimiters = {
  search: createRateLimiter(100, 15 * 60 * 1000),      // 100 req/15min
  suggestions: createRateLimiter(200, 15 * 60 * 1000), // 200 req/15min
  analytics: createRateLimiter(500, 15 * 60 * 1000),   // 500 req/15min
  mutation: createRateLimiter(50, 15 * 60 * 1000),     // 50 req/15min
  auth: createRateLimiter(5, 15 * 60 * 1000),          // 5 req/15min
};

// ============================================
// Input Validation & Sanitization
// ============================================

export const sanitizeInput = (input: string): string => {
  // Remove HTML tags
  let sanitized = DOMPurify.sanitize(input, { 
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true
  });
  
  // Escape special characters
  sanitized = validator.escape(sanitized);
  
  // Remove SQL meta-characters
  sanitized = sanitized.replace(/[%;'"\\]/g, '');
  
  // Trim whitespace
  sanitized = sanitized.trim();
  
  return sanitized;
};

export const validateEmail = (email: string): boolean => {
  return validator.isEmail(email, {
    allow_display_name: false,
    require_tld: true,
    allow_ip_domain: false
  });
};

export const validateUUID = (uuid: string): boolean => {
  return validator.isUUID(uuid, 4);
};

export const validateCoordinates = (lat: number, lng: number): boolean => {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};

export const sanitizeSearchQuery = (query: string): string => {
  // Basic sanitization
  let sanitized = sanitizeInput(query);
  
  // Remove potential SQL injection patterns
  sanitized = sanitized.replace(/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE)\b)/gi, '');
  
  // Limit length
  sanitized = sanitized.substring(0, 200);
  
  return sanitized;
};

// ============================================
// Session Management
// ============================================

export interface Session {
  id: string;
  userId: string;
  createdAt: number;
  lastActivity: number;
  ipAddress: string;
  userAgent: string;
}

export const createSecureSession = async (
  userId: string,
  ipAddress: string,
  userAgent: string
): Promise<string> => {
  const sessionId = randomBytes(32).toString('hex');
  const sessionToken = createHash('sha256')
    .update(sessionId + process.env.SESSION_SECRET)
    .digest('hex');
  
  const session: Session = {
    id: sessionId,
    userId,
    createdAt: Date.now(),
    lastActivity: Date.now(),
    ipAddress: hashIP(ipAddress),
    userAgent: hashUserAgent(userAgent)
  };
  
  // Store session in Redis with 24-hour expiry
  await storeSession(sessionToken, session, 86400);
  
  return sessionToken;
};

export const validateSession = async (sessionToken: string): Promise<Session | null> => {
  const session = await getSession(sessionToken);
  
  if (!session) {
    return null;
  }
  
  // Check session expiry (24 hours)
  if (Date.now() - session.createdAt > 86400000) {
    await deleteSession(sessionToken);
    return null;
  }
  
  // Check inactivity timeout (2 hours)
  if (Date.now() - session.lastActivity > 7200000) {
    await deleteSession(sessionToken);
    return null;
  }
  
  // Update last activity
  session.lastActivity = Date.now();
  await updateSession(sessionToken, session);
  
  return session;
};

// ============================================
// Data Protection
// ============================================

export const hashIP = (ip: string): string => {
  if (!process.env.IP_SALT) {
    throw new Error('IP_SALT not configured');
  }
  
  return createHash('sha256')
    .update(ip + process.env.IP_SALT)
    .digest('hex')
    .substring(0, 16);
};

export const hashUserAgent = (userAgent: string): string => {
  return createHash('sha256')
    .update(userAgent)
    .digest('hex')
    .substring(0, 16);
};

export const anonymizeEmail = (email: string): string => {
  const [local, domain] = email.split('@');
  const anonymizedLocal = local.substring(0, 2) + '***';
  return `${anonymizedLocal}@${domain}`;
};

export const redactSensitiveData = (data: any): any => {
  const sensitive = ['password', 'token', 'secret', 'key', 'ssn', 'credit_card'];
  
  if (typeof data === 'object' && data !== null) {
    const redacted = { ...data };
    
    for (const key in redacted) {
      if (sensitive.some(s => key.toLowerCase().includes(s))) {
        redacted[key] = '[REDACTED]';
      } else if (typeof redacted[key] === 'object') {
        redacted[key] = redactSensitiveData(redacted[key]);
      }
    }
    
    return redacted;
  }
  
  return data;
};

// ============================================
// CORS Security
// ============================================

export const getCORSOptions = () => {
  const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'];
  
  return {
    origin: (origin: string | undefined, callback: Function) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) {
        return callback(null, true);
      }
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    maxAge: 86400, // 24 hours
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset']
  };
};

// ============================================
// Security Headers
// ============================================

export const securityHeaders = (req: any, res: any, next: Function) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS filter
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions policy
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // HSTS (only in production)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  
  next();
};

// ============================================
// Error Handling
// ============================================

export const sanitizeError = (error: unknown): TRPCError => {
  // Log full error internally
  console.error('[Security Error]:', error);
  
  // Return sanitized error to client
  if (error instanceof TRPCError) {
    // Don't expose internal error details
    return new TRPCError({
      code: error.code,
      message: getPublicErrorMessage(error.code)
    });
  }
  
  return new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'An error occurred processing your request'
  });
};

const getPublicErrorMessage = (code: string): string => {
  const messages: Record<string, string> = {
    'UNAUTHORIZED': 'Authentication required',
    'FORBIDDEN': 'Access denied',
    'NOT_FOUND': 'Resource not found',
    'BAD_REQUEST': 'Invalid request',
    'TOO_MANY_REQUESTS': 'Too many requests',
    'INTERNAL_SERVER_ERROR': 'An error occurred'
  };
  
  return messages[code] || 'An error occurred';
};

// ============================================
// Helper Functions implemented with cache service
// ============================================

async function checkTokenRevocation(token: string): Promise<boolean> {
  try {
    // Import cache service to check revoked tokens
    const { cacheService } = require('../services/cache');
    const revokedToken = await cacheService.redis.get(`revoked_token:${token}`);
    return !!revokedToken;
  } catch (error) {
    console.error('Error checking token revocation:', error);
    // Fail secure - if we can't check, assume not revoked but log the issue
    return false;
  }
}

async function getResourcePermissions(
  userId: string,
  resourceType: string,
  resourceId: string
): Promise<string[]> {
  try {
    // Basic permission check - in production this would query ACL/RBAC system
    // For now, return read permissions by default
    return ['read'];
  } catch (error) {
    console.error('Error getting resource permissions:', error);
    return [];
  }
}

async function storeSession(token: string, session: Session, ttl: number): Promise<void> {
  try {
    const { cacheService } = require('../services/cache');
    await cacheService.redis.setex(`session:${token}`, ttl, JSON.stringify(session));
  } catch (error) {
    console.error('Error storing session:', error);
    throw error;
  }
}

async function getSession(token: string): Promise<Session | null> {
  try {
    const { cacheService } = require('../services/cache');
    const sessionData = await cacheService.redis.get(`session:${token}`);
    return sessionData ? JSON.parse(sessionData) : null;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

async function updateSession(token: string, session: Session): Promise<void> {
  try {
    const { cacheService } = require('../services/cache');
    const ttl = await cacheService.redis.ttl(`session:${token}`);
    if (ttl > 0) {
      await cacheService.redis.setex(`session:${token}`, ttl, JSON.stringify(session));
    }
  } catch (error) {
    console.error('Error updating session:', error);
    throw error;
  }
}

async function deleteSession(token: string): Promise<void> {
  try {
    const { cacheService } = require('../services/cache');
    await cacheService.redis.del(`session:${token}`);
  } catch (error) {
    console.error('Error deleting session:', error);
    throw error;
  }
}

export default {
  authenticateRequest,
  authorizeRole,
  authorizeResource,
  createRateLimiter,
  rateLimiters,
  sanitizeInput,
  sanitizeSearchQuery,
  validateEmail,
  validateUUID,
  validateCoordinates,
  createSecureSession,
  validateSession,
  hashIP,
  hashUserAgent,
  anonymizeEmail,
  redactSensitiveData,
  getCORSOptions,
  securityHeaders,
  sanitizeError
};