/**
 * Security validation utilities and schemas
 * Provides secure input validation and sanitization
 */

import { z } from 'zod';

// Base string validation with security checks
export const secureString = (maxLength: number = 1000) => 
  z.string()
    .max(maxLength, `Máximo ${maxLength} caracteres`)
    .refine(
      (val) => !/<script|javascript:|data:|vbscript:/i.test(val),
      'Contenido no permitido detectado'
    )
    .refine(
      (val) => !val.includes('\x00'), // Null byte check
      'Caracteres no válidos detectados'
    );

// Email validation
export const secureEmail = z.string()
  .email('Formato de email inválido')
  .max(254, 'Email demasiado largo')
  .toLowerCase()
  .refine(
    (val) => !/<|>|script|javascript/i.test(val),
    'Email contiene caracteres no permitidos'
  );

// Password validation
export const securePassword = z.string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .max(128, 'La contraseña no puede exceder 128 caracteres')
  .refine(
    (val) => /[A-Z]/.test(val),
    'La contraseña debe contener al menos una letra mayúscula'
  )
  .refine(
    (val) => /[a-z]/.test(val),
    'La contraseña debe contener al menos una letra minúscula'
  )
  .refine(
    (val) => /[0-9]/.test(val),
    'La contraseña debe contener al menos un número'
  )
  .refine(
    (val) => /[!@#$%^&*(),.?":{}|<>]/.test(val),
    'La contraseña debe contener al menos un carácter especial'
  );

// Phone number validation (Honduras format)
export const securePhone = z.string()
  .regex(/^\+504[2-9]\d{7}$/, 'Número de teléfono inválido (+504XXXXXXXX)')
  .refine(
    (val) => !/<|>|script|javascript/i.test(val),
    'Número contiene caracteres no permitidos'
  );

// Search query validation
export const secureSearchQuery = z.string()
  .max(200, 'Búsqueda demasiado larga')
  .refine(
    (val) => !/<script|javascript:|data:|vbscript:/i.test(val),
    'Términos de búsqueda no permitidos'
  )
  .refine(
    (val) => val.trim().length > 0,
    'La búsqueda no puede estar vacía'
  )
  .transform((val) => val.trim());

// URL validation for safe redirects
export const secureURL = z.string()
  .url('URL inválida')
  .refine(
    (val) => {
      try {
        const url = new URL(val);
        // Only allow http/https
        return ['http:', 'https:'].includes(url.protocol);
      } catch {
        return false;
      }
    },
    'Protocolo de URL no permitido'
  )
  .refine(
    (val) => !val.includes('javascript:') && !val.includes('data:'),
    'URL contiene contenido no permitido'
  );

// Property price validation
export const securePrice = z.number()
  .positive('El precio debe ser positivo')
  .max(1000000, 'El precio excede el límite máximo')
  .refine(
    (val) => Number.isFinite(val),
    'Precio inválido'
  );

// Location coordinates validation
export const secureCoordinates = z.object({
  lat: z.number()
    .min(-90, 'Latitud inválida')
    .max(90, 'Latitud inválida')
    .refine(val => Number.isFinite(val), 'Latitud debe ser un número válido'),
  lng: z.number()
    .min(-180, 'Longitud inválida')
    .max(180, 'Longitud inválida')
    .refine(val => Number.isFinite(val), 'Longitud debe ser un número válido'),
});

// Authentication schemas
export const loginSchema = z.object({
  email: secureEmail,
  password: z.string().min(1, 'La contraseña es requerida'),
});

export const registerSchema = z.object({
  email: secureEmail,
  password: securePassword,
  confirmPassword: z.string(),
  firstName: secureString(50),
  lastName: secureString(50),
  phone: securePhone.optional(),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  }
);

// Property search schema
export const propertySearchSchema = z.object({
  query: secureSearchQuery.optional(),
  location: secureCoordinates.optional(),
  minPrice: securePrice.optional(),
  maxPrice: securePrice.optional(),
  bedrooms: z.number().min(0).max(10).optional(),
  bathrooms: z.number().min(0).max(10).optional(),
  propertyType: z.enum(['casa', 'apartamento', 'oficina', 'terreno']).optional(),
  page: z.number().min(1).max(100).default(1),
  limit: z.number().min(1).max(50).default(20),
});

// Contact form schema
export const contactFormSchema = z.object({
  name: secureString(100),
  email: secureEmail,
  phone: securePhone.optional(),
  message: secureString(2000),
  propertyId: z.string().uuid().optional(),
});

// File upload validation
export const fileUploadSchema = z.object({
  name: z.string().max(255, 'Nombre de archivo demasiado largo'),
  size: z.number().max(10 * 1024 * 1024, 'Archivo demasiado grande (máximo 10MB)'),
  type: z.enum([
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'application/pdf'
  ]).refine(
    (value) => ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'].includes(value),
    'Tipo de archivo no permitido'
  ),
});

// Rate limiting validation
export const rateLimitSchema = z.object({
  ip: z.string().regex(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/, 'Dirección IP inválida'),
  action: z.enum(['login', 'register', 'search', 'contact', 'upload']),
  timestamp: z.date(),
});

/**
 * Sanitize HTML content to prevent XSS
 * Note: In production, use a proper HTML sanitization library like DOMPurify
 */
export const sanitizeHTML = (input: string): string => {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Validate and sanitize user input
 */
export const validateAndSanitize = <T>(
  schema: z.ZodSchema<T>,
  input: unknown
): { success: true; data: T } | { success: false; errors: string[] } => {
  try {
    const result = schema.safeParse(input);
    
    if (result.success) {
      return { success: true, data: result.data };
    }
    
    const errors = result.error.issues.map((err: any) => err.message);
    return { success: false, errors };
  } catch (error) {
    console.error('Validation error:', error);
    return { success: false, errors: ['Error de validación interno'] };
  }
};

/**
 * Check for common SQL injection patterns
 */
export const checkSQLInjection = (input: string): boolean => {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i,
    /(\'|\"|;|--|\/\*|\*\/)/,
    /(\bOR\b.*=.*\b(TRUE|FALSE)\b)/i,
    /(\bAND\b.*=.*\b(TRUE|FALSE)\b)/i,
  ];
  
  return sqlPatterns.some(pattern => pattern.test(input));
};

// Export all schemas for easy access
export const schemas = {
  secureString,
  secureEmail,
  securePassword,
  securePhone,
  secureSearchQuery,
  secureURL,
  securePrice,
  secureCoordinates,
  loginSchema,
  registerSchema,
  propertySearchSchema,
  contactFormSchema,
  fileUploadSchema,
  rateLimitSchema,
};