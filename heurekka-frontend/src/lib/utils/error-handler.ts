/**
 * Secure Error Handler
 * Provides safe error handling without exposing sensitive information
 */

export interface SafeError {
  message: string;
  code?: string;
  statusCode: number;
}

export class SecurityError extends Error {
  statusCode: number;
  code?: string;

  constructor(message: string, statusCode: number = 403, code?: string) {
    super(message);
    this.name = 'SecurityError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

export class ValidationError extends Error {
  errors: string[];
  statusCode: number;

  constructor(message: string, errors: string[] = [], statusCode: number = 400) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
    this.statusCode = statusCode;
  }
}

/**
 * Safe error messages for production
 */
const SAFE_ERROR_MESSAGES: Record<string, string> = {
  // Authentication errors
  auth_invalid_credentials: 'Credenciales inválidas',
  auth_user_not_found: 'Usuario no encontrado',
  auth_account_locked: 'Cuenta bloqueada temporalmente',
  auth_session_expired: 'Sesión expirada',
  auth_insufficient_permissions: 'Permisos insuficientes',

  // Validation errors
  validation_failed: 'Datos inválidos',
  validation_email_invalid: 'Formato de email inválido',
  validation_password_weak: 'Contraseña no cumple requisitos de seguridad',
  validation_phone_invalid: 'Número de teléfono inválido',

  // Rate limiting
  rate_limit_exceeded: 'Demasiadas solicitudes. Inténtalo más tarde',
  rate_limit_auth: 'Demasiados intentos de inicio de sesión',

  // Security violations
  security_suspicious_activity: 'Actividad sospechosa detectada',
  security_blocked_request: 'Solicitud bloqueada por seguridad',
  security_invalid_token: 'Token de seguridad inválido',

  // Generic errors
  internal_error: 'Error interno del servidor',
  service_unavailable: 'Servicio temporalmente no disponible',
  not_found: 'Recurso no encontrado',
  forbidden: 'Acceso denegado',
};

/**
 * Convert any error to a safe error response
 */
export function createSafeError(error: unknown, fallbackMessage?: string): SafeError {
  // Handle custom security and validation errors
  if (error instanceof SecurityError) {
    return {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
    };
  }

  if (error instanceof ValidationError) {
    return {
      message: error.errors.length > 0 ? error.errors[0] : error.message,
      statusCode: error.statusCode,
    };
  }

  // Handle known error types
  if (error instanceof Error) {
    // Check for known error codes/messages
    const errorCode = (error as any).code;
    if (errorCode && SAFE_ERROR_MESSAGES[errorCode]) {
      return {
        message: SAFE_ERROR_MESSAGES[errorCode],
        code: errorCode,
        statusCode: 400,
      };
    }

    // Handle Supabase auth errors safely
    if (error.message.includes('Invalid login credentials')) {
      return {
        message: 'Credenciales inválidas',
        statusCode: 401,
      };
    }

    if (error.message.includes('Email not confirmed')) {
      return {
        message: 'Email no confirmado. Revisa tu bandeja de entrada',
        statusCode: 400,
      };
    }

    if (error.message.includes('Password should be at least')) {
      return {
        message: 'La contraseña debe tener al menos 6 caracteres',
        statusCode: 400,
      };
    }

    if (error.message.includes('User already registered')) {
      return {
        message: 'Email ya registrado',
        statusCode: 409,
      };
    }
  }

  // Default safe error
  return {
    message: fallbackMessage || 'Error interno del servidor',
    statusCode: 500,
  };
}

/**
 * Log security events safely (without exposing sensitive data)
 */
export function logSecurityEvent(
  event: string,
  details: {
    ip?: string;
    userAgent?: string;
    userId?: string;
    path?: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
  }
) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    severity: details.severity || 'medium',
    ip: details.ip ? details.ip.replace(/\d+$/, 'xxx') : undefined, // Mask last octet
    userAgent: details.userAgent ? details.userAgent.substring(0, 100) : undefined,
    userId: details.userId,
    path: details.path,
  };

  // In production, send to proper logging service
  console.warn('Security Event:', logEntry);
}

/**
 * Handle API route errors safely
 */
export function handleAPIError(error: unknown, request?: {
  ip?: string;
  userAgent?: string;
  path?: string;
}) {
  const safeError = createSafeError(error);

  // Log security-relevant errors
  if (safeError.statusCode === 403 || safeError.statusCode === 401) {
    logSecurityEvent('access_denied', {
      ip: request?.ip,
      userAgent: request?.userAgent,
      path: request?.path,
      severity: 'medium',
    });
  }

  if (safeError.statusCode === 429) {
    logSecurityEvent('rate_limit_hit', {
      ip: request?.ip,
      userAgent: request?.userAgent,
      path: request?.path,
      severity: 'high',
    });
  }

  return new Response(
    JSON.stringify({
      error: safeError.message,
      code: safeError.code,
    }),
    {
      status: safeError.statusCode,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}

/**
 * Client-side error handler
 */
export function handleClientError(error: unknown, context?: string): string {
  const safeError = createSafeError(error);

  // Log client errors (but don't expose to user)
  console.error(`Client error${context ? ` in ${context}` : ''}:`, error);

  return safeError.message;
}

/**
 * Form validation error formatter
 */
export function formatValidationErrors(errors: Record<string, string[]>): string[] {
  return Object.values(errors).flat().filter(Boolean);
}

/**
 * Check if error is network-related
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.name === 'NetworkError' ||
           error.message.includes('fetch') ||
           error.message.includes('network') ||
           error.message.includes('NETWORK_ERROR');
  }
  return false;
}

/**
 * Retry wrapper for network operations
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  backoff: number = 1000
): Promise<T> {
  let lastError: unknown;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      // Don't retry on non-network errors
      if (!isNetworkError(error)) {
        throw error;
      }

      // Don't retry on last attempt
      if (i === maxRetries - 1) {
        throw error;
      }

      // Exponential backoff
      await new Promise(resolve => 
        setTimeout(resolve, backoff * Math.pow(2, i))
      );
    }
  }

  throw lastError;
}