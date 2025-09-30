/**
 * Email Validation Utility
 * Provides robust email validation using zod
 */

import { z } from 'zod';

// Email schema using zod for robust validation
const emailSchema = z.string().email('Ingresa un correo electrónico válido');

/**
 * Validates email address format
 * @param email - Email address to validate
 * @returns Validation result
 */
export function validateEmail(email: string): { isValid: boolean; error: string | null } {
  if (!email || typeof email !== 'string') {
    return {
      isValid: false,
      error: 'El correo electrónico es requerido',
    };
  }

  // Trim whitespace
  const trimmedEmail = email.trim();

  if (!trimmedEmail) {
    return {
      isValid: false,
      error: 'El correo electrónico es requerido',
    };
  }

  // Use zod for validation
  const result = emailSchema.safeParse(trimmedEmail);

  if (!result.success) {
    return {
      isValid: false,
      error: result.error.errors[0]?.message || 'Ingresa un correo electrónico válido',
    };
  }

  // Additional custom validations
  // Check for obviously fake emails
  const lowerEmail = trimmedEmail.toLowerCase();
  const fakeDomains = ['test.com', 'example.com', 'fake.com', 'temp.com'];
  const domain = lowerEmail.split('@')[1];

  if (domain && fakeDomains.includes(domain)) {
    return {
      isValid: false,
      error: 'Por favor usa un correo electrónico válido',
    };
  }

  return {
    isValid: true,
    error: null,
  };
}

/**
 * Sanitizes email address by trimming and lowercasing
 * @param email - Email to sanitize
 * @returns Sanitized email
 */
export function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase();
}