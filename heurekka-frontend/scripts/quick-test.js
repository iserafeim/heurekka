#!/usr/bin/env node

// Test the specific validation functions that are failing

// Mock environment
global.crypto = require('crypto').webcrypto || {
  randomUUID: () => require('crypto').randomUUID()
};

try {
  const { validatePhoneNumber, sanitizeSearchQuery, validatePropertyId } = require('../src/lib/security/validation.ts');
  
  console.log('Testing validatePhoneNumber:');
  console.log('50412345678:', validatePhoneNumber('50412345678'));
  console.log('+50412345678:', validatePhoneNumber('+50412345678'));
  console.log('22345678:', validatePhoneNumber('22345678'));
  
  console.log('\nTesting sanitizeSearchQuery:');
  const malicious = '<script>alert("xss")</script>';
  const sanitized = sanitizeSearchQuery(malicious);
  console.log('Original:', malicious);
  console.log('Sanitized:', sanitized);
  console.log('Contains <script>:', sanitized.includes('<script>'));
  console.log('Contains alert:', sanitized.includes('alert'));
  
  console.log('\nTesting validatePropertyId:');
  const uuid = '123e4567-e89b-12d3-a456-426614174000';
  console.log('UUID:', uuid);
  console.log('Valid:', validatePropertyId(uuid));
  
} catch (error) {
  console.error('Error:', error.message);
}