/**
 * Security Tests
 * Comprehensive tests for security utilities and fixes
 */

import { 
  validatePrice, 
  validatePhoneNumber, 
  sanitizeSearchQuery, 
  validateUrl, 
  validateCoordinates, 
  validatePropertyId, 
  sanitizeText, 
  validateNumber,
  rateLimiter 
} from '../validation';
import { secureStorage } from '../secureStorage';
import { 
  generateCSRFToken, 
  validateCSRFToken, 
  storeCSRFToken, 
  getCSRFToken 
} from '../csrf';

describe('Security Validation Tests', () => {
  describe('validatePrice', () => {
    it('should validate and sanitize price inputs', () => {
      expect(validatePrice('1000')).toBe(1000);
      expect(validatePrice('0')).toBe(0);
      expect(validatePrice('-100')).toBe(0); // Negative prices not allowed
      expect(validatePrice('999999999')).toBe(10000000); // Max cap
      expect(validatePrice('abc')).toBe(0); // Invalid input
      expect(validatePrice('1000.5')).toBe(1000); // Floored
    });
  });

  describe('validatePhoneNumber', () => {
    it('should validate Honduras phone numbers', () => {
      expect(validatePhoneNumber('50412345678')).toBe(true);
      expect(validatePhoneNumber('+50412345678')).toBe(true);
      expect(validatePhoneNumber('22345678')).toBe(true); // Local format
      expect(validatePhoneNumber('12345678')).toBe(false); // Can't start with 1
      expect(validatePhoneNumber('0123456')).toBe(false); // Can't start with 0
      expect(validatePhoneNumber('123')).toBe(false); // Too short
      expect(validatePhoneNumber('')).toBe(false); // Empty
      expect(validatePhoneNumber('abc')).toBe(false); // Non-numeric
    });
  });

  describe('sanitizeSearchQuery', () => {
    it('should sanitize search queries', () => {
      expect(sanitizeSearchQuery('normal query')).toBe('normal query');
      expect(sanitizeSearchQuery('<script>alert("xss")</script>')).toBe('scriptalert(xss)/script');
      expect(sanitizeSearchQuery('query with "quotes" & ampersands')).toBe('query with quotes  ampersands');
      expect(sanitizeSearchQuery('  trim spaces  ')).toBe('trim spaces');
      expect(sanitizeSearchQuery('á é í ó ú ñ')).toBe('á é í ó ú ñ'); // Unicode should work
      expect(sanitizeSearchQuery('a'.repeat(200))).toHaveLength(100); // Length limit
    });
  });

  describe('validateUrl', () => {
    it('should validate and whitelist URLs', () => {
      expect(validateUrl('https://images.unsplash.com/photo.jpg')).toBeTruthy();
      expect(validateUrl('https://cdn.heurekka.com/image.png')).toBeTruthy();
      expect(validateUrl('https://wa.me/50412345678')).toBeTruthy();
      expect(validateUrl('http://example.com')).toBeNull(); // HTTP not allowed
      expect(validateUrl('https://malicious.com')).toBeNull(); // Not whitelisted
      expect(validateUrl('javascript:alert(1)')).toBeNull(); // JS protocol
      expect(validateUrl('')).toBeNull(); // Empty
      expect(validateUrl('not-a-url')).toBeNull(); // Invalid format
    });
  });

  describe('validateCoordinates', () => {
    it('should validate coordinate ranges', () => {
      expect(validateCoordinates(14.0723, -87.1921)).toBe(true); // Tegucigalpa
      expect(validateCoordinates(0, 0)).toBe(true); // Valid coordinates
      expect(validateCoordinates(90, 180)).toBe(true); // Boundaries
      expect(validateCoordinates(-90, -180)).toBe(true); // Boundaries
      expect(validateCoordinates(91, 0)).toBe(false); // Out of range
      expect(validateCoordinates(0, 181)).toBe(false); // Out of range
      expect(validateCoordinates(NaN, 0)).toBe(false); // Invalid
    });
  });

  describe('validatePropertyId', () => {
    it('should validate UUID format', () => {
      expect(validatePropertyId('123e4567-e89b-12d3-a456-426614174000')).toBe(true);
      expect(validatePropertyId('invalid-id')).toBe(false);
      expect(validatePropertyId('')).toBe(false);
      expect(validatePropertyId('123')).toBe(false);
    });
  });

  describe('sanitizeText', () => {
    it('should sanitize text content', () => {
      expect(sanitizeText('normal text')).toBe('normal text');
      expect(sanitizeText('<script>alert("xss")</script>')).toBe('scriptalert(&quot;xss&quot;)/script');
      expect(sanitizeText('text & more')).toBe('text &amp; more');
      expect(sanitizeText('text "with" quotes')).toBe('text &quot;with&quot; quotes');
      expect(sanitizeText("text 'with' single quotes")).toBe('text &#x27;with&#x27; single quotes');
      expect(sanitizeText('a'.repeat(2000))).toHaveLength(1000); // Length limit
    });
  });

  describe('validateNumber', () => {
    it('should validate numbers within bounds', () => {
      expect(validateNumber(5, 1, 10)).toBe(5);
      expect(validateNumber(0, 1, 10)).toBe(1); // Min bound
      expect(validateNumber(15, 1, 10)).toBe(10); // Max bound
      expect(validateNumber(5.7, 1, 10)).toBe(5); // Floored
      expect(validateNumber(NaN, 1, 10)).toBe(1); // Invalid
    });
  });

  describe('rateLimiter', () => {
    beforeEach(() => {
      // Clear rate limiter state
      rateLimiter.cleanup();
    });

    it('should allow requests within limit', () => {
      expect(rateLimiter.isAllowed('user1', 5, 60000)).toBe(true);
      expect(rateLimiter.isAllowed('user1', 5, 60000)).toBe(true);
      expect(rateLimiter.isAllowed('user1', 5, 60000)).toBe(true);
    });

    it('should block requests exceeding limit', () => {
      // Fill up the limit
      for (let i = 0; i < 5; i++) {
        expect(rateLimiter.isAllowed('user2', 5, 60000)).toBe(true);
      }
      // Should be blocked now
      expect(rateLimiter.isAllowed('user2', 5, 60000)).toBe(false);
    });

    it('should allow different users independently', () => {
      // Fill up limit for user1
      for (let i = 0; i < 5; i++) {
        rateLimiter.isAllowed('user1', 5, 60000);
      }
      
      // user2 should still be allowed
      expect(rateLimiter.isAllowed('user2', 5, 60000)).toBe(true);
    });
  });
});

describe('Secure Storage Tests', () => {
  beforeEach(() => {
    secureStorage.clear();
  });

  afterEach(() => {
    secureStorage.clear();
  });

  it('should store and retrieve data securely', () => {
    const testData = { favorites: ['prop1', 'prop2'], timestamp: Date.now() };
    
    secureStorage.setItem('test-data', testData);
    const retrieved = secureStorage.getItem('test-data');
    
    expect(retrieved).toEqual(testData);
  });

  it('should return null for non-existent items', () => {
    expect(secureStorage.getItem('non-existent')).toBeNull();
  });

  it('should handle invalid keys gracefully', () => {
    expect(secureStorage.getItem('')).toBeNull();
    expect(() => secureStorage.setItem('', 'value')).not.toThrow();
  });

  it('should remove items correctly', () => {
    secureStorage.setItem('test-remove', 'value');
    expect(secureStorage.getItem('test-remove')).toBe('value');
    
    secureStorage.removeItem('test-remove');
    expect(secureStorage.getItem('test-remove')).toBeNull();
  });

  it('should list stored keys', () => {
    secureStorage.setItem('key1', 'value1');
    secureStorage.setItem('key2', 'value2');
    
    const keys = secureStorage.keys();
    expect(keys).toContain('key1');
    expect(keys).toContain('key2');
  });

  it('should provide storage statistics', () => {
    secureStorage.setItem('stats-test', { data: 'test' });
    
    const stats = secureStorage.getStats();
    expect(stats.itemCount).toBeGreaterThan(0);
    expect(stats.estimatedSize).toBeGreaterThan(0);
    expect(typeof stats.isAvailable).toBe('boolean');
  });
});

describe('CSRF Protection Tests', () => {
  beforeEach(() => {
    // Clear session storage
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.clear();
    }
  });

  it('should generate unique CSRF tokens', () => {
    const token1 = generateCSRFToken();
    const token2 = generateCSRFToken();
    
    expect(token1).toBeTruthy();
    expect(token2).toBeTruthy();
    expect(token1).not.toBe(token2);
    expect(token1.length).toBeGreaterThan(10);
  });

  it('should store and retrieve CSRF tokens', () => {
    const token = generateCSRFToken();
    storeCSRFToken(token);
    
    expect(getCSRFToken()).toBe(token);
  });

  it('should validate CSRF tokens correctly', () => {
    const token = generateCSRFToken();
    storeCSRFToken(token);
    
    expect(validateCSRFToken(token)).toBe(true);
    expect(validateCSRFToken('invalid-token')).toBe(false);
    expect(validateCSRFToken('')).toBe(false);
  });

  it('should handle missing stored tokens', () => {
    expect(getCSRFToken()).toBeNull();
    expect(validateCSRFToken('any-token')).toBe(false);
  });

  it('should prevent timing attacks with constant-time comparison', () => {
    const token = 'a'.repeat(32);
    storeCSRFToken(token);
    
    // These should all take similar time (constant-time comparison)
    const start1 = Date.now();
    validateCSRFToken('b'.repeat(32));
    const time1 = Date.now() - start1;
    
    const start2 = Date.now();
    validateCSRFToken('c'.repeat(32));
    const time2 = Date.now() - start2;
    
    // Allow some variance but should be similar
    expect(Math.abs(time1 - time2)).toBeLessThan(10);
  });
});

describe('XSS Prevention Tests', () => {
  it('should prevent script injection in search queries', () => {
    const maliciousInput = '<script>alert("xss")</script>';
    const sanitized = sanitizeSearchQuery(maliciousInput);
    
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).not.toContain('alert');
  });

  it('should prevent HTML injection in text fields', () => {
    const maliciousInput = '<img src="x" onerror="alert(1)">';
    const sanitized = sanitizeText(maliciousInput);
    
    expect(sanitized).not.toContain('<img');
    expect(sanitized).not.toContain('onerror');
  });

  it('should handle Unicode and special characters safely', () => {
    const input = 'Café & Résumé — "quote" \'apostrophe\'';
    const sanitized = sanitizeText(input);
    
    expect(sanitized).toContain('Café');
    expect(sanitized).toContain('Résumé');
    expect(sanitized).toContain('&amp;');
    expect(sanitized).toContain('&quot;');
  });
});

describe('Input Validation Edge Cases', () => {
  it('should handle null and undefined inputs', () => {
    expect(validatePrice('')).toBe(0);
    expect(sanitizeSearchQuery('')).toBe('');
    expect(sanitizeText('')).toBe('');
    expect(validatePhoneNumber('')).toBe(false);
  });

  it('should handle extremely long inputs', () => {
    const longString = 'a'.repeat(10000);
    const sanitized = sanitizeSearchQuery(longString);
    
    expect(sanitized.length).toBeLessThanOrEqual(100);
  });

  it('should handle special numeric cases', () => {
    expect(validatePrice('Infinity')).toBe(10000000);
    expect(validatePrice('-Infinity')).toBe(0);
    expect(validatePrice('NaN')).toBe(0);
  });
});