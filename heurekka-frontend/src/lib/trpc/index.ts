/**
 * tRPC client exports
 * 
 * This file centralizes all tRPC-related exports for easy importing
 * across the application.
 */

// React Query integration (for client components)
export { trpc, TRPCProvider } from './react';

// Vanilla client (for server components and utilities)
export { vanillaTrpcClient } from './client';

// Type exports
export type { AppRouter } from '../../../../heurekka-backend/src/server';

// Utility functions for tRPC operations
export const trpcUtils = {
  /**
   * Check if an error is a tRPC error with specific code
   */
  isTRPCErrorWithCode: (error: unknown, code: string): boolean => {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === code
    );
  },

  /**
   * Extract error message from tRPC error
   */
  getErrorMessage: (error: unknown): string => {
    if (typeof error === 'object' && error !== null) {
      if ('message' in error && typeof error.message === 'string') {
        return error.message;
      }
      if ('data' in error && typeof error.data === 'object' && error.data !== null) {
        if ('message' in error.data && typeof error.data.message === 'string') {
          return error.data.message;
        }
      }
    }
    return 'An unexpected error occurred';
  },

  /**
   * Check if error is a network error
   */
  isNetworkError: (error: unknown): boolean => {
    if (typeof error === 'object' && error !== null) {
      return 'code' in error && error.code === 'NETWORK_ERROR';
    }
    return false;
  },
};