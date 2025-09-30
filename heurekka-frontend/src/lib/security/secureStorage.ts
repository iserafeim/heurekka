/**
 * Secure Storage Utility
 * SECURITY NOTE: Client-side encryption is fundamentally insecure as keys
 * are visible in client code. This utility should ONLY be used for non-sensitive
 * data. For authentication tokens and sensitive data, rely on:
 * 1. HttpOnly cookies (managed by backend)
 * 2. Server-side sessions
 * 3. Supabase's built-in secure storage
 *
 * This utility uses obfuscation (not true encryption) to deter casual inspection,
 * but offers NO real security against determined attackers.
 */

/**
 * Simple obfuscation (NOT encryption) for non-sensitive data
 * DO NOT use this for passwords, tokens, or sensitive user data
 */

/**
 * Simple Base64 encoding for obfuscation (NOT security)
 * @param data - Data to obfuscate
 * @returns Obfuscated string
 */
const obfuscate = (data: string): string => {
  try {
    if (typeof window === 'undefined') return data;
    return btoa(encodeURIComponent(data));
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Obfuscation failed:', error);
    }
    return data; // Return unobfuscated as fallback
  }
};

/**
 * Simple Base64 decoding for deobfuscation (NOT security)
 * @param obfuscatedData - Obfuscated string to deobfuscate
 * @returns Deobfuscated string or null if failed
 */
const deobfuscate = (obfuscatedData: string): string | null => {
  try {
    if (!obfuscatedData || typeof obfuscatedData !== 'string' || obfuscatedData.trim() === '') {
      return null;
    }

    if (typeof window === 'undefined') return obfuscatedData;

    return decodeURIComponent(atob(obfuscatedData));
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Deobfuscation failed:', error);
    }
    return null;
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
 * Drop-in replacement for localStorage with basic obfuscation
 * WARNING: Do NOT store sensitive data here. Use HttpOnly cookies instead.
 */
export const secureStorage = {
  /**
   * Stores obfuscated data in localStorage
   * @param key - Storage key
   * @param value - Value to store (will be JSON stringified)
   */
  setItem: <T>(key: string, value: T): void => {
    if (!isBrowser()) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('secureStorage.setItem called in non-browser environment');
      }
      return;
    }

    try {
      // Validate key
      if (!key || typeof key !== 'string' || key.trim() === '') {
        throw new Error('Invalid storage key');
      }

      // Validate value - prevent null/undefined values that could cause issues
      if (value === null || value === undefined) {
        secureStorage.removeItem(key);
        return;
      }

      // Serialize value
      const serializedValue = JSON.stringify(value);

      // Obfuscate (NOT encrypt) and store
      const obfuscatedValue = obfuscate(serializedValue);

      localStorage.setItem(`obf_${key}`, obfuscatedValue);

      // Store a timestamp for data expiration
      localStorage.setItem(`obf_${key}_ts`, Date.now().toString());

    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error storing obfuscated data:', error);
      }
    }
  },

  /**
   * Retrieves and deobfuscates data from localStorage
   * @param key - Storage key
   * @returns Deobfuscated and parsed value or null if not found/invalid
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

      // Get obfuscated data
      const obfuscatedValue = localStorage.getItem(`obf_${key}`);
      if (!obfuscatedValue) {
        return null;
      }

      // Check if data has expired (24 hours)
      const timestamp = localStorage.getItem(`obf_${key}_ts`);
      if (timestamp) {
        const age = Date.now() - parseInt(timestamp);
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours

        if (age > maxAge) {
          // Data expired, clean up
          secureStorage.removeItem(key);
          return null;
        }
      }

      // Deobfuscate and parse
      const deobfuscatedValue = deobfuscate(obfuscatedValue);
      if (deobfuscatedValue === null) {
        // Clean up corrupted data
        secureStorage.removeItem(key);
        return null;
      }

      try {
        return JSON.parse(deobfuscatedValue) as T;
      } catch (parseError) {
        secureStorage.removeItem(key);
        return null;
      }

    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error retrieving obfuscated data:', error);
      }
      secureStorage.removeItem(key);
      return null;
    }
  },

  /**
   * Removes obfuscated data from localStorage
   * @param key - Storage key
   */
  removeItem: (key: string): void => {
    if (!isBrowser()) {
      return;
    }

    try {
      localStorage.removeItem(`obf_${key}`);
      localStorage.removeItem(`obf_${key}_ts`);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error removing obfuscated data:', error);
      }
    }
  },

  /**
   * Clears all obfuscated storage data
   */
  clear: (): void => {
    if (!isBrowser()) {
      return;
    }

    try {
      // Find all obfuscated storage keys
      const keysToRemove: string[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('obf_')) {
          keysToRemove.push(key);
        }
      }

      // Remove all obfuscated storage items
      keysToRemove.forEach(key => localStorage.removeItem(key));

    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error clearing obfuscated storage:', error);
      }
    }
  },

  /**
   * Gets all obfuscated storage keys
   * @returns Array of storage keys (without 'obf_' prefix)
   */
  keys: (): string[] => {
    if (!isBrowser()) {
      return [];
    }

    try {
      const keys: string[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('obf_') && !key.endsWith('_ts')) {
          keys.push(key.replace('obf_', ''));
        }
      }

      return keys;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error getting obfuscated storage keys:', error);
      }
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
  },

};

/**
 * Migrate from old secure_ prefix to new obf_ prefix
 * Clean up any legacy encrypted data
 */
if (isBrowser()) {
  try {
    // Clean up old secure_ prefixed items (legacy encryption)
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('secure_')) {
        keysToRemove.push(key);
      }
    }

    if (keysToRemove.length > 0) {
      keysToRemove.forEach(key => localStorage.removeItem(key));
      if (process.env.NODE_ENV === 'development') {
        console.log(`Cleaned up ${keysToRemove.length} legacy encrypted storage items`);
      }
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error during legacy storage cleanup:', error);
    }
  }
}

export default secureStorage;