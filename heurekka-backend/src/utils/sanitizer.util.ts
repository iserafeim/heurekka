import DOMPurify from 'isomorphic-dompurify';
import validator from 'validator';

/**
 * Input Sanitization Utility
 * Prevents XSS attacks by sanitizing user input
 *
 * Security: Protects against stored and reflected XSS
 */

/**
 * Sanitize HTML content - removes all scripts and dangerous tags
 */
export function sanitizeHtml(input: string): string {
  if (!input) return '';

  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true // Keep text content
  });
}

/**
 * Sanitize text input - allows basic formatting
 */
export function sanitizeText(input: string): string {
  if (!input) return '';

  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true
  });
}

/**
 * Sanitize email - validates and normalizes email address
 */
export function sanitizeEmail(email: string): string {
  if (!email) return '';

  const normalized = validator.normalizeEmail(email.trim().toLowerCase(), {
    all_lowercase: true,
    gmail_remove_dots: false,
    gmail_remove_subaddress: false,
    outlookdotcom_remove_subaddress: false,
    yahoo_remove_subaddress: false,
    icloud_remove_subaddress: false
  });

  return normalized || email.trim().toLowerCase();
}

/**
 * Sanitize phone number - removes non-numeric characters
 */
export function sanitizePhone(phone: string): string {
  if (!phone) return '';

  // Remove all non-numeric characters except + and -
  return phone.replace(/[^0-9+-]/g, '');
}

/**
 * Sanitize URL - validates and encodes
 */
export function sanitizeUrl(url: string): string {
  if (!url) return '';

  // Check if URL is valid
  if (!validator.isURL(url, {
    protocols: ['http', 'https'],
    require_protocol: true,
    require_valid_protocol: true
  })) {
    return '';
  }

  return validator.trim(url);
}

/**
 * Sanitize JSON data - removes dangerous content
 */
export function sanitizeJson(data: any): any {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === 'string') {
    return sanitizeHtml(data);
  }

  if (Array.isArray(data)) {
    return data.map(item => sanitizeJson(item));
  }

  if (typeof data === 'object') {
    const sanitized: any = {};
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        // Sanitize key name
        const sanitizedKey = sanitizeHtml(key);
        // Sanitize value recursively
        sanitized[sanitizedKey] = sanitizeJson(data[key]);
      }
    }
    return sanitized;
  }

  return data;
}

/**
 * Sanitize file name - removes dangerous characters
 */
export function sanitizeFileName(fileName: string): string {
  if (!fileName) return '';

  // Remove path traversal attempts
  let sanitized = fileName.replace(/\.\./g, '');

  // Remove special characters except dots, dashes, and underscores
  sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, '_');

  // Limit length
  if (sanitized.length > 255) {
    sanitized = sanitized.substring(0, 255);
  }

  return sanitized;
}

/**
 * Escape SQL special characters (additional layer beyond parameterized queries)
 */
export function escapeSql(input: string): string {
  if (!input) return '';

  return input.replace(/'/g, "''");
}

/**
 * Sanitize search query - removes potentially dangerous characters
 */
export function sanitizeSearchQuery(query: string): string {
  if (!query) return '';

  // Remove SQL injection attempts
  let sanitized = query.replace(/['";\\]/g, '');

  // Remove command injection attempts
  sanitized = sanitized.replace(/[`$(){}[\]|&;<>]/g, '');

  // Trim and limit length
  sanitized = validator.trim(sanitized);

  if (sanitized.length > 500) {
    sanitized = sanitized.substring(0, 500);
  }

  return sanitized;
}

/**
 * Validate and sanitize Honduras phone number
 */
export function validateHondurasPhone(phone: string): { valid: boolean; sanitized: string; error?: string } {
  if (!phone) {
    return { valid: false, sanitized: '', error: 'Número de teléfono requerido' };
  }

  // Remove whitespace and format characters
  const cleaned = phone.replace(/[\s\-()]/g, '');

  // Honduras phone pattern: +504 followed by 8 digits starting with 2, 3, or 9
  // Or just 8 digits starting with 2, 3, or 9
  const hondurasPattern = /^(\+504)?[239]\d{7}$/;

  if (!hondurasPattern.test(cleaned)) {
    return {
      valid: false,
      sanitized: cleaned,
      error: 'Formato de teléfono inválido. Debe ser un número hondureño válido (ej: +504 9999-9999 o 9999-9999)'
    };
  }

  // Format as XXXX-XXXX for storage
  const digits = cleaned.replace(/^\+504/, '');
  const formatted = `${digits.slice(0, 4)}-${digits.slice(4)}`;

  return {
    valid: true,
    sanitized: formatted
  };
}

/**
 * Sanitize all string fields in an object
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = { ...obj };

  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitizeHtml(sanitized[key] as string) as any;
    } else if (Array.isArray(sanitized[key])) {
      sanitized[key] = sanitized[key].map((item: any) =>
        typeof item === 'string' ? sanitizeHtml(item) : item
      ) as any;
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeObject(sanitized[key]) as any;
    }
  }

  return sanitized;
}

/**
 * Check for common password patterns (weak passwords)
 */
export function isWeakPassword(password: string): { weak: boolean; reason?: string } {
  const commonPasswords = [
    'password', '12345678', 'qwerty', 'abc123', 'password123',
    'admin', 'letmein', 'welcome', 'monkey', '1234567890',
    'Password1', 'Password123', 'Admin123'
  ];

  // Check against common passwords
  if (commonPasswords.includes(password.toLowerCase())) {
    return { weak: true, reason: 'Contraseña demasiado común' };
  }

  // Check for sequential characters
  if (/(?:012|123|234|345|456|567|678|789|890|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i.test(password)) {
    return { weak: true, reason: 'La contraseña contiene secuencias obvias' };
  }

  // Check for repeated characters
  if (/(.)\1{3,}/.test(password)) {
    return { weak: true, reason: 'La contraseña contiene demasiados caracteres repetidos' };
  }

  return { weak: false };
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): {
  valid: boolean;
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  // Length check
  if (password.length >= 12) {
    score += 2;
  } else if (password.length >= 10) {
    score += 1;
    feedback.push('Considera usar una contraseña más larga');
  } else {
    feedback.push('La contraseña debe tener al menos 12 caracteres');
    return { valid: false, score: 0, feedback };
  }

  // Character variety
  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Agrega letras minúsculas');

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Agrega letras mayúsculas');

  if (/[0-9]/.test(password)) score += 1;
  else feedback.push('Agrega números');

  if (/[^a-zA-Z0-9]/.test(password)) {
    score += 2;
  } else {
    feedback.push('Agrega caracteres especiales (!@#$%^&*)');
  }

  // Check for weak patterns
  const weakCheck = isWeakPassword(password);
  if (weakCheck.weak) {
    feedback.push(weakCheck.reason!);
    return { valid: false, score: Math.max(0, score - 3), feedback };
  }

  // Valid if score >= 5 (minimum requirements met)
  const valid = score >= 5;

  if (!valid) {
    feedback.push('La contraseña no cumple con los requisitos mínimos de seguridad');
  }

  return { valid, score, feedback };
}