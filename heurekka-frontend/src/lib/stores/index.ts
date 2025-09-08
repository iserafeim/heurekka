/**
 * Centralized store exports
 */

export { useAuthStore } from './auth';
export { usePropertyStore, type PropertyFilters, type SearchState } from './property';

// Store utilities
export const storeUtils = {
  /**
   * Clear all persisted stores
   */
  clearAllStores: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('heurekka-auth-store');
      localStorage.removeItem('heurekka-property-store');
    }
  },

  /**
   * Export store data for debugging
   */
  exportStoreData: () => {
    if (typeof window === 'undefined') return null;
    
    return {
      auth: localStorage.getItem('heurekka-auth-store'),
      property: localStorage.getItem('heurekka-property-store'),
    };
  },
};