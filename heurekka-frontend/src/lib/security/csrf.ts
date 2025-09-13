/**
 * CSRF Protection Utility
 * Cross-Site Request Forgery protection for state-changing operations
 */

/**
 * Generates a cryptographically secure CSRF token
 * @returns Random CSRF token string
 */
export const generateCSRFToken = (): string => {
  // Use crypto.randomUUID() if available (modern browsers)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback for older browsers
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
  
  // Final fallback (not cryptographically secure, but better than nothing)
  return Date.now().toString(36) + Math.random().toString(36);
};

/**
 * Stores CSRF token in session storage
 * @param token - CSRF token to store
 */
export const storeCSRFToken = (token: string): void => {
  if (typeof window !== 'undefined' && sessionStorage) {
    sessionStorage.setItem('csrf-token', token);
  }
};

/**
 * Retrieves CSRF token from session storage
 * @returns Stored CSRF token or null if not found
 */
export const getCSRFToken = (): string | null => {
  if (typeof window !== 'undefined' && sessionStorage) {
    return sessionStorage.getItem('csrf-token');
  }
  return null;
};

/**
 * Validates CSRF token against stored token
 * @param token - Token to validate
 * @returns true if token is valid
 */
export const validateCSRFToken = (token: string): boolean => {
  if (!token || typeof token !== 'string') {
    return false;
  }
  
  const storedToken = getCSRFToken();
  if (!storedToken) {
    return false;
  }
  
  // Constant-time comparison to prevent timing attacks
  if (token.length !== storedToken.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < token.length; i++) {
    result |= token.charCodeAt(i) ^ storedToken.charCodeAt(i);
  }
  
  return result === 0;
};

/**
 * Initializes CSRF protection by generating and storing a token
 * @returns Generated CSRF token
 */
export const initCSRFProtection = (): string => {
  const token = generateCSRFToken();
  storeCSRFToken(token);
  return token;
};

/**
 * Removes CSRF token from storage
 */
export const clearCSRFToken = (): void => {
  if (typeof window !== 'undefined' && sessionStorage) {
    sessionStorage.removeItem('csrf-token');
  }
};

/**
 * CSRF-protected fetch wrapper
 * Automatically includes CSRF token in requests
 */
export const csrfFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const token = getCSRFToken();
  
  if (!token) {
    throw new Error('CSRF token not found. Initialize CSRF protection first.');
  }
  
  // Add CSRF token to headers
  const headers = new Headers(options.headers);
  headers.set('X-CSRF-Token', token);
  
  // Merge with original options
  const csrfOptions: RequestInit = {
    ...options,
    headers
  };
  
  return fetch(url, csrfOptions);
};

// Initialize CSRF protection on page load
if (typeof window !== 'undefined') {
  // Only initialize if no token exists
  if (!getCSRFToken()) {
    initCSRFProtection();
  }
}