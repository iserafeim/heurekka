import { createTRPCNext } from '@trpc/next';
import { httpBatchLink, loggerLink } from '@trpc/client';
import superjson from 'superjson';

// Import the actual AppRouter type from the backend
import type { AppRouter } from '../../../../heurekka-backend/src/routers/index';

// Re-export for use in other files
export type { AppRouter };

/**
 * Get the base URL for the tRPC API
 */
function getBaseUrl() {
  if (typeof window !== 'undefined') {
    // Browser should use relative URL
    return process.env.NEXT_PUBLIC_TRPC_URL || 'http://localhost:3001/trpc';
  }
  
  // SSR should use full URL
  return process.env.NEXT_PUBLIC_TRPC_URL || 'http://localhost:3001/trpc';
}

/**
 * tRPC client configuration with React Query integration
 */
export const trpc = createTRPCNext<AppRouter>({
  config() {
    return {
      transformer: superjson,
      links: [
        // Logger link for development
        loggerLink({
          enabled: (opts) =>
            process.env.NODE_ENV === 'development' ||
            (opts.direction === 'down' && opts.result instanceof Error),
        }),
        
        httpBatchLink({
          url: getBaseUrl(),
          async headers() {
            const headers: Record<string, string> = {};
            
            // Add authentication headers using secure token retrieval
            if (typeof window !== 'undefined') {
              try {
                const { secureAuth } = await import('@/lib/auth/secure-auth');
                const token = await secureAuth.getAccessToken();
                if (token) {
                  headers.Authorization = `Bearer ${token}`;
                }
              } catch (error) {
                console.warn('Failed to get access token for tRPC request:', error);
              }
            }
            
            return headers;
          },
        }),
      ],
      
      /**
       * React Query client configuration
       */
      queryClientConfig: {
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            cacheTime: 5 * 60 * 1000, // 5 minutes
            retry: (failureCount, error: any) => {
              // Don't retry on 4xx errors
              if (error && typeof error === 'object' && 'status' in error) {
                const status = error.status as number;
                if (status >= 400 && status < 500) {
                  return false;
                }
              }
              return failureCount < 3;
            },
            refetchOnWindowFocus: false,
            refetchOnReconnect: 'always',
          },
          mutations: {
            retry: false,
          },
        },
      },
    };
  },
  
  /**
   * Server-Side Rendering configuration
   */
  ssr: false,
});

/**
 * Type exports for convenience
 */
export type TRPCClient = typeof trpc;