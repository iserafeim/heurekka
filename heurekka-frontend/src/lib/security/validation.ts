/**
 * Security validation utilities
 * Input validation and sanitization functions to prevent security vulnerabilities
 */

/**
 * Validates and sanitizes price input
 * @param value - Raw price input as string
 * @returns Safe numeric value within reasonable bounds
 */
export const validatePrice = (value: string): number => {
  // Convert to number
  const num = Number(value);
  
  // Check for invalid numbers
  if (isNaN(num) || num < 0) return 0;
  
  // Set reasonable upper bound (10 million HNL)
  if (num > 10000000) return 10000000;
  
  // Return floored integer value
  return Math.floor(num);
};

/**
 * Validates Honduras phone number format
 * @param phone - Phone number string to validate
 * @returns true if valid Honduras phone number format
 */
export const validatePhoneNumber = (phone: string): boolean => {
  if (!phone || typeof phone !== 'string') return false;
  
  // Remove common formatting characters
  const cleanPhone = phone.replace(/[-\s().+]/g, '');
  
  // Honduras phone number patterns:
  // Pattern 1: +504XXXXXXXX (12 chars total)
  // Pattern 2: 504XXXXXXXX (11 chars total)  
  // Pattern 3: XXXXXXXX (8 chars, local format)
  // Must start with 2-9 after country code (no 0 or 1)
  
  // Check for international format with +504
  if (cleanPhone.startsWith('504')) {
    const localPart = cleanPhone.substring(3);
    return localPart.length === 8 && /^[2-9]\d{7}$/.test(localPart);
  }
  
  // Check for local 8-digit format
  if (cleanPhone.length === 8) {
    return /^[2-9]\d{7}$/.test(cleanPhone);
  }
  
  return false;
};

/**
 * Sanitizes search query input
 * @param query - Raw search query
 * @returns Sanitized search query
 */
export const sanitizeSearchQuery = (query: string): string => {
  if (!query || typeof query !== 'string') return '';
  
  return query
    .trim()
    .substring(0, 100) // Limit length to prevent DoS
    .replace(/[<>\"'&]/g, '') // Remove dangerous HTML characters
    .replace(/[^\p{L}\p{N}\s\-.,]/gu, ''); // Only allow letters, numbers, spaces, hyphens, periods, commas
};

/**
 * Validates and sanitizes URL input
 * @param url - URL string to validate
 * @returns Safe URL or null if invalid
 */
export const validateUrl = (url: string): string | null => {
  if (!url || typeof url !== 'string') return null;
  
  try {
    const parsedUrl = new URL(url);
    
    // Only allow HTTPS URLs for security
    if (parsedUrl.protocol !== 'https:') return null;
    
    // Whitelist allowed domains for images and external links
    const allowedDomains = [
      'images.unsplash.com',
      'cdn.heurekka.com',
      'storage.googleapis.com',
      'res.cloudinary.com',
      'wa.me', // WhatsApp links
      'api.mapbox.com' // Mapbox tiles
    ];
    
    // Check if domain is allowed
    const isAllowedDomain = allowedDomains.some(domain => 
      parsedUrl.hostname === domain || parsedUrl.hostname.endsWith('.' + domain)
    );
    
    if (!isAllowedDomain) return null;
    
    return parsedUrl.toString();
  } catch {
    return null;
  }
};

/**
 * Validates coordinates for map data
 * @param lat - Latitude value
 * @param lng - Longitude value
 * @returns true if coordinates are valid
 */
export const validateCoordinates = (lat: number, lng: number): boolean => {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
};

/**
 * Validates property ID format
 * @param id - Property ID to validate
 * @returns true if valid UUID format
 */
export const validatePropertyId = (id: string): boolean => {
  if (!id || typeof id !== 'string') return false;
  
  // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

/**
 * Sanitizes text content for display
 * @param text - Raw text content
 * @returns Sanitized text safe for display
 */
export const sanitizeText = (text: string): string => {
  if (!text || typeof text !== 'string') return '';
  
  return text
    .trim()
    .substring(0, 1000) // Reasonable length limit
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/&/g, '&amp;') // Escape ampersands
    .replace(/"/g, '&quot;') // Escape quotes
    .replace(/'/g, '&#x27;'); // Escape single quotes
};

/**
 * Validates numeric input with bounds
 * @param value - Numeric input
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @returns Validated number within bounds
 */
export const validateNumber = (value: number, min: number = 0, max: number = Number.MAX_SAFE_INTEGER): number => {
  if (typeof value !== 'number' || isNaN(value)) return min;
  return Math.max(min, Math.min(max, Math.floor(value)));
};

/**
 * Rate limiting checker (simple in-memory implementation)
 */
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  
  /**
   * Check if request is within rate limit
   * @param key - Unique identifier for the rate limit (e.g., IP, user ID)
   * @param limit - Maximum requests allowed
   * @param windowMs - Time window in milliseconds
   * @returns true if request is allowed
   */
  isAllowed(key: string, limit: number = 100, windowMs: number = 60000): boolean {
    const now = Date.now();
    const userRequests = this.requests.get(key) || [];
    
    // Remove requests outside the window
    const validRequests = userRequests.filter(time => now - time < windowMs);
    
    // Check if under limit
    if (validRequests.length >= limit) {
      return false;
    }
    
    // Add current request
    validRequests.push(now);
    this.requests.set(key, validRequests);
    
    return true;
  }
  
  /**
   * Clear old entries to prevent memory leaks
   */
  cleanup(): void {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    
    for (const [key, requests] of this.requests) {
      const validRequests = requests.filter(time => now - time < oneHour);
      if (validRequests.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, validRequests);
      }
    }
  }
}

export const rateLimiter = new RateLimiter();

// Cleanup rate limiter every hour
if (typeof window !== 'undefined') {
  setInterval(() => rateLimiter.cleanup(), 60 * 60 * 1000);
}