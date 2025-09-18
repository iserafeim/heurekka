/**
 * Secure Storage Utility
 * Provides encrypted storage for sensitive data in localStorage
 * Prevents sensitive data exposure and GDPR compliance issues
 */

import CryptoJS from 'crypto-js';

// Configuration
const ENCRYPTION_CONFIG = {
  algorithm: 'AES',
  mode: CryptoJS.mode.CBC,
  padding: CryptoJS.pad.Pkcs7,
  keySize: 256 / 32, // 256 bits
  ivSize: 128 / 32   // 128 bits
} as const;

// Get encryption key from environment or generate a session key
const getEncryptionKey = (): string => {
  // Try to get from environment first (for production)
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_ENCRYPTION_KEY) {
    return process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
  }
  
  // For development/fallback, generate or use session key
  const sessionKeyName = '__heurekka_session_key__';
  let sessionKey = '';
  
  if (typeof window !== 'undefined') {
    sessionKey = sessionStorage.getItem(sessionKeyName) || '';
    
    if (!sessionKey) {
      // Generate a new session key
      sessionKey = CryptoJS.lib.WordArray.random(256/8).toString();
      sessionStorage.setItem(sessionKeyName, sessionKey);
    }
  }
  
  return sessionKey || 'fallback-key-for-ssr';
};

/**
 * Encrypts data using AES encryption
 * @param data - Data to encrypt
 * @returns Encrypted string
 */
const encrypt = (data: string): string => {
  try {
    const key = CryptoJS.enc.Utf8.parse(getEncryptionKey());
    const iv = CryptoJS.lib.WordArray.random(ENCRYPTION_CONFIG.ivSize * 4);
    
    const encrypted = CryptoJS.AES.encrypt(data, key, {
      iv: iv,
      mode: ENCRYPTION_CONFIG.mode,
      padding: ENCRYPTION_CONFIG.padding
    });
    
    // Combine IV and encrypted data
    const combined = iv.concat(encrypted.ciphertext);
    return CryptoJS.enc.Base64.stringify(combined);
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt data');
  }
};

/**
 * Decrypts data using AES decryption
 * @param encryptedData - Encrypted string to decrypt
 * @returns Decrypted string
 */
const decrypt = (encryptedData: string): string => {
  try {
    const key = CryptoJS.enc.Utf8.parse(getEncryptionKey());
    const combined = CryptoJS.enc.Base64.parse(encryptedData);
    
    // Extract IV and encrypted data
    const iv = CryptoJS.lib.WordArray.create(
      combined.words.slice(0, ENCRYPTION_CONFIG.ivSize),
      ENCRYPTION_CONFIG.ivSize * 4
    );
    
    const encrypted = CryptoJS.lib.WordArray.create(
      combined.words.slice(ENCRYPTION_CONFIG.ivSize),
      combined.sigBytes - (ENCRYPTION_CONFIG.ivSize * 4)
    );
    
    const decrypted = CryptoJS.AES.decrypt(
      CryptoJS.enc.Base64.stringify(encrypted),
      key,
      {
        iv: iv,
        mode: ENCRYPTION_CONFIG.mode,
        padding: ENCRYPTION_CONFIG.padding
      }
    );
    
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt data');
  }
};

/**
 * Validates that we're in a browser environment
 */
const isBrowser = (): boolean => {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
};

/**
 * Secure Storage Interface
 * Drop-in replacement for localStorage with encryption
 */
export const secureStorage = {
  /**
   * Stores encrypted data in localStorage
   * @param key - Storage key
   * @param value - Value to store (will be JSON stringified)
   */
  setItem: <T>(key: string, value: T): void => {
    if (!isBrowser()) {
      console.warn('secureStorage.setItem called in non-browser environment');
      return;
    }
    
    try {
      // Validate key
      if (!key || typeof key !== 'string') {
        throw new Error('Invalid storage key');
      }
      
      // Serialize value
      const serializedValue = JSON.stringify(value);
      
      // Encrypt and store
      const encryptedValue = encrypt(serializedValue);
      localStorage.setItem(`secure_${key}`, encryptedValue);
      
      // Store a timestamp for data expiration
      localStorage.setItem(`secure_${key}_timestamp`, Date.now().toString());
      
    } catch (error) {
      console.error('Error storing encrypted data:', error);
      // Fallback to unencrypted storage for critical data (not recommended for sensitive data)
      // localStorage.setItem(key, JSON.stringify(value));
    }
  },

  /**
   * Retrieves and decrypts data from localStorage
   * @param key - Storage key
   * @returns Decrypted and parsed value or null if not found/invalid
   */
  getItem: <T>(key: string): T | null => {
    if (!isBrowser()) {
      return null;
    }
    
    try {
      // Validate key
      if (!key || typeof key !== 'string') {
        return null;
      }
      
      // Get encrypted data
      const encryptedValue = localStorage.getItem(`secure_${key}`);
      if (!encryptedValue) {
        return null;
      }
      
      // Check if data has expired (24 hours)
      const timestamp = localStorage.getItem(`secure_${key}_timestamp`);
      if (timestamp) {
        const age = Date.now() - parseInt(timestamp);
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours
        
        if (age > maxAge) {
          // Data expired, clean up
          secureStorage.removeItem(key);
          return null;
        }
      }
      
      // Decrypt and parse
      const decryptedValue = decrypt(encryptedValue);

      // Validate decrypted value before parsing
      if (!decryptedValue || decryptedValue.trim() === '') {
        console.warn('Decrypted value is empty, cleaning up corrupted data');
        secureStorage.removeItem(key);
        return null;
      }

      return JSON.parse(decryptedValue) as T;

    } catch (error) {
      console.error('Error retrieving encrypted data:', error);
      // Clean up corrupted data when decryption fails
      console.warn('Cleaning up corrupted encrypted data for key:', key);
      secureStorage.removeItem(key);
      return null;
    }
  },

  /**
   * Removes encrypted data from localStorage
   * @param key - Storage key
   */
  removeItem: (key: string): void => {
    if (!isBrowser()) {
      return;
    }
    
    try {
      localStorage.removeItem(`secure_${key}`);
      localStorage.removeItem(`secure_${key}_timestamp`);
    } catch (error) {
      console.error('Error removing encrypted data:', error);
    }
  },

  /**
   * Clears all secure storage data
   */
  clear: (): void => {
    if (!isBrowser()) {
      return;
    }
    
    try {
      // Find all secure storage keys
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('secure_')) {
          keysToRemove.push(key);
        }
      }
      
      // Remove all secure storage items
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
    } catch (error) {
      console.error('Error clearing secure storage:', error);
    }
  },

  /**
   * Gets all secure storage keys
   * @returns Array of storage keys (without 'secure_' prefix)
   */
  keys: (): string[] => {
    if (!isBrowser()) {
      return [];
    }
    
    try {
      const keys: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('secure_') && !key.endsWith('_timestamp')) {
          keys.push(key.replace('secure_', ''));
        }
      }
      
      return keys;
    } catch (error) {
      console.error('Error getting secure storage keys:', error);
      return [];
    }
  },

  /**
   * Checks if secure storage is available and working
   * @returns true if secure storage is functional
   */
  isAvailable: (): boolean => {
    if (!isBrowser()) {
      return false;
    }
    
    try {
      // Test encryption/decryption
      const testKey = '__secure_storage_test__';
      const testValue = { test: true, timestamp: Date.now() };
      
      secureStorage.setItem(testKey, testValue);
      const retrieved = secureStorage.getItem(testKey);
      secureStorage.removeItem(testKey);
      
      return retrieved !== null && 
             typeof retrieved === 'object' && 
             'test' in retrieved && 
             retrieved.test === true;
             
    } catch (error) {
      console.error('Secure storage is not available:', error);
      return false;
    }
  },

  /**
   * Gets storage statistics
   * @returns Object with storage usage information
   */
  getStats: () => {
    if (!isBrowser()) {
      return { itemCount: 0, estimatedSize: 0, isAvailable: false };
    }
    
    const keys = secureStorage.keys();
    let estimatedSize = 0;
    
    keys.forEach(key => {
      const encrypted = localStorage.getItem(`secure_${key}`);
      if (encrypted) {
        estimatedSize += encrypted.length * 2; // Rough estimate (UTF-16)
      }
    });
    
    return {
      itemCount: keys.length,
      estimatedSize,
      isAvailable: secureStorage.isAvailable()
    };
  }
};

/**
 * Initialize secure storage and perform cleanup on load
 */
if (isBrowser()) {
  // Cleanup expired data on page load
  setTimeout(() => {
    const keys = secureStorage.keys();
    keys.forEach(key => {
      // This will automatically clean up expired items
      secureStorage.getItem(key);
    });
  }, 1000);
}

export default secureStorage;