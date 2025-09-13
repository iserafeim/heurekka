#!/usr/bin/env node

/**
 * Security Verification Script
 * Tests all security implementations to ensure they work correctly
 */

// Mock browser environment for Node.js
global.crypto = require('crypto').webcrypto || {
  randomUUID: () => require('crypto').randomUUID(),
  getRandomValues: (array) => require('crypto').getRandomValues(array)
};

global.window = { 
  location: { hostname: 'localhost' } 
};

global.sessionStorage = {
  store: {},
  getItem: function(key) { return this.store[key] || null; },
  setItem: function(key, value) { this.store[key] = value; },
  removeItem: function(key) { delete this.store[key]; },
  clear: function() { this.store = {}; }
};

global.localStorage = {
  store: {},
  getItem: function(key) { return this.store[key] || null; },
  setItem: function(key, value) { this.store[key] = value; },
  removeItem: function(key) { delete this.store[key]; },
  clear: function() { this.store = {}; }
};

console.log('🔒 Security Verification Script Starting...\n');

let tests = 0;
let passed = 0;
let failed = 0;

function test(description, fn) {
  tests++;
  try {
    fn();
    console.log(`✅ ${description}`);
    passed++;
  } catch (error) {
    console.log(`❌ ${description}: ${error.message}`);
    failed++;
  }
}

function assertEqual(actual, expected, message = '') {
  if (actual !== expected) {
    throw new Error(`Expected ${expected}, got ${actual}. ${message}`);
  }
}

function assertTrue(condition, message = '') {
  if (!condition) {
    throw new Error(`Expected true, got false. ${message}`);
  }
}

function assertFalse(condition, message = '') {
  if (condition) {
    throw new Error(`Expected false, got true. ${message}`);
  }
}

// Import and test validation functions
try {
  const { 
    validatePrice, 
    validatePhoneNumber, 
    sanitizeSearchQuery, 
    validateUrl, 
    sanitizeText,
    validatePropertyId,
    validateNumber
  } = require('../src/lib/security/validation.ts');

  console.log('📝 Testing Input Validation...');
  
  test('validatePrice handles valid prices', () => {
    assertEqual(validatePrice('1000'), 1000);
    assertEqual(validatePrice('0'), 0);
  });

  test('validatePrice rejects negative prices', () => {
    assertEqual(validatePrice('-100'), 0);
  });

  test('validatePrice caps maximum prices', () => {
    assertEqual(validatePrice('999999999'), 10000000);
  });

  test('validatePrice handles invalid input', () => {
    assertEqual(validatePrice('abc'), 0);
    assertEqual(validatePrice(''), 0);
  });

  test('validatePhoneNumber accepts valid Honduras numbers', () => {
    assertTrue(validatePhoneNumber('50412345678'));
    assertTrue(validatePhoneNumber('+50412345678'));
    assertTrue(validatePhoneNumber('22345678'));
  });

  test('validatePhoneNumber rejects invalid numbers', () => {
    assertFalse(validatePhoneNumber('12345678')); // Can't start with 1
    assertFalse(validatePhoneNumber('abc'));
    assertFalse(validatePhoneNumber(''));
  });

  test('sanitizeSearchQuery removes dangerous characters', () => {
    const result = sanitizeSearchQuery('<script>alert("xss")</script>');
    assertFalse(result.includes('<script>'));
    assertFalse(result.includes('alert'));
  });

  test('sanitizeSearchQuery trims whitespace', () => {
    assertEqual(sanitizeSearchQuery('  test  '), 'test');
  });

  test('sanitizeSearchQuery limits length', () => {
    const longString = 'a'.repeat(200);
    const result = sanitizeSearchQuery(longString);
    assertEqual(result.length, 100);
  });

  test('validateUrl accepts whitelisted domains', () => {
    assertTrue(validateUrl('https://images.unsplash.com/photo.jpg') !== null);
    assertTrue(validateUrl('https://wa.me/50412345678') !== null);
  });

  test('validateUrl rejects non-HTTPS URLs', () => {
    assertEqual(validateUrl('http://example.com'), null);
  });

  test('validateUrl rejects non-whitelisted domains', () => {
    assertEqual(validateUrl('https://malicious.com'), null);
  });

  test('sanitizeText escapes HTML entities', () => {
    const result = sanitizeText('text & more "quotes"');
    assertTrue(result.includes('&amp;'));
    assertTrue(result.includes('&quot;'));
  });

  test('validatePropertyId accepts valid UUIDs', () => {
    assertTrue(validatePropertyId('123e4567-e89b-12d3-a456-426614174000'));
  });

  test('validatePropertyId rejects invalid IDs', () => {
    assertFalse(validatePropertyId('invalid-id'));
    assertFalse(validatePropertyId(''));
  });

  test('validateNumber enforces bounds', () => {
    assertEqual(validateNumber(5, 1, 10), 5);
    assertEqual(validateNumber(0, 1, 10), 1); // Min bound
    assertEqual(validateNumber(15, 1, 10), 10); // Max bound
  });

  console.log('\n🔐 Testing Secure Storage...');

  const { secureStorage } = require('../src/lib/security/secureStorage.ts');

  test('secureStorage stores and retrieves data', () => {
    const testData = { test: 'value', number: 123 };
    secureStorage.setItem('test-key', testData);
    const retrieved = secureStorage.getItem('test-key');
    assertEqual(JSON.stringify(retrieved), JSON.stringify(testData));
  });

  test('secureStorage returns null for non-existent keys', () => {
    assertEqual(secureStorage.getItem('non-existent'), null);
  });

  test('secureStorage removes items correctly', () => {
    secureStorage.setItem('remove-test', 'value');
    secureStorage.removeItem('remove-test');
    assertEqual(secureStorage.getItem('remove-test'), null);
  });

  test('secureStorage lists keys correctly', () => {
    secureStorage.setItem('key1', 'value1');
    secureStorage.setItem('key2', 'value2');
    const keys = secureStorage.keys();
    assertTrue(keys.includes('key1'));
    assertTrue(keys.includes('key2'));
  });

  test('secureStorage provides statistics', () => {
    const stats = secureStorage.getStats();
    assertTrue(typeof stats.itemCount === 'number');
    assertTrue(typeof stats.estimatedSize === 'number');
    assertTrue(typeof stats.isAvailable === 'boolean');
  });

  console.log('\n🛡️ Testing CSRF Protection...');

  const { 
    generateCSRFToken, 
    validateCSRFToken, 
    storeCSRFToken, 
    getCSRFToken 
  } = require('../src/lib/security/csrf.ts');

  test('generateCSRFToken creates unique tokens', () => {
    const token1 = generateCSRFToken();
    const token2 = generateCSRFToken();
    assertTrue(token1.length > 10);
    assertTrue(token2.length > 10);
    assertTrue(token1 !== token2);
  });

  test('CSRF token storage and retrieval works', () => {
    const token = generateCSRFToken();
    storeCSRFToken(token);
    assertEqual(getCSRFToken(), token);
  });

  test('CSRF token validation works correctly', () => {
    const token = generateCSRFToken();
    storeCSRFToken(token);
    assertTrue(validateCSRFToken(token));
    assertFalse(validateCSRFToken('invalid-token'));
    assertFalse(validateCSRFToken(''));
  });

  test('CSRF validation handles missing tokens', () => {
    sessionStorage.clear();
    assertFalse(validateCSRFToken('any-token'));
  });

} catch (error) {
  console.log(`❌ Error loading security modules: ${error.message}`);
  failed++;
}

console.log('\n🔍 Testing XSS Prevention...');

test('XSS prevention in search queries', () => {
  try {
    const { sanitizeSearchQuery } = require('../src/lib/security/validation.ts');
    const maliciousInput = '<script>alert("xss")</script>';
    const sanitized = sanitizeSearchQuery(maliciousInput);
    assertFalse(sanitized.includes('<script>'));
    assertFalse(sanitized.includes('alert'));
  } catch (e) {
    throw new Error('XSS prevention test failed');
  }
});

test('HTML injection prevention in text fields', () => {
  try {
    const { sanitizeText } = require('../src/lib/security/validation.ts');
    const maliciousInput = '<img src="x" onerror="alert(1)">';
    const sanitized = sanitizeText(maliciousInput);
    assertFalse(sanitized.includes('<img'));
    assertFalse(sanitized.includes('onerror'));
  } catch (e) {
    throw new Error('HTML injection prevention test failed');
  }
});

console.log('\n📊 Security Verification Results:');
console.log(`Tests run: ${tests}`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);

if (failed === 0) {
  console.log('\n🎉 All security tests passed! The application is secure.');
  process.exit(0);
} else {
  console.log(`\n⚠️  ${failed} security tests failed. Please review the issues above.`);
  process.exit(1);
}