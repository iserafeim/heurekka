import { createTRPCNext } from '@trpc/next';
import { createTRPCClient, httpBatchLink, wsLink, splitLink, loggerLink } from '@trpc/client';
import { createWSClient } from '@trpc/client';
import superjson from 'superjson';
import type { AppRouter } from '../../../../heurekka-backend/src/server';

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
 * Get WebSocket URL for real-time subscriptions
 */
function getWsUrl() {
  if (typeof window !== 'undefined') {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';
    return wsUrl.replace(/^http/, 'ws');
  }
  return process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';
}

/**
 * Create WebSocket client for subscriptions
 */
function createWSClientInstance() {
  return createWSClient({
    url: getWsUrl(),
    connectionParams: () => {
      // Add authentication headers if needed
      return {};
    },
    retryDelayMs: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * tRPC client configuration with React Query integration
 */
export const trpc = createTRPCNext<AppRouter>({
  config({ ctx }) {
    const wsClient = typeof window !== 'undefined' ? createWSClientInstance() : null;
    
    return {
      /**
       * Data transformer for serialization
       */
      transformer: superjson,
      
      /**
       * Links configuration
       */
      links: [
        // Logger link for development
        ...(process.env.NEXT_PUBLIC_ENABLE_DEBUG === 'true'
          ? [
              loggerLink({
                enabled: (opts) =>
                  process.env.NODE_ENV === 'development' ||
                  (opts.direction === 'down' && opts.result instanceof Error),
              }),
            ]
          : []),
        
        // Split link for HTTP and WebSocket
        splitLink({
          condition(op) {
            // Use WebSocket for subscriptions
            return op.type === 'subscription';
          },
          true: wsClient 
            ? wsLink({
                client: wsClient,
              })
            : httpBatchLink({
                url: getBaseUrl(),
                headers() {
                  return {};
                },
              }),
          false: httpBatchLink({
            url: getBaseUrl(),
            headers() {
              const headers: Record<string, string> = {};
              
              // Add authentication headers
              if (typeof window !== 'undefined') {
                const token = localStorage.getItem('auth_token');
                if (token) {
                  headers.Authorization = `Bearer ${token}`;
                }
              }
              
              return headers;
            },
          }),
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
            retry: (failureCount, error) => {
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
  ssr: false, // We'll enable this later when we have SSR requirements
});

/**
 * Vanilla tRPC client (without React Query)
 * Useful for server-side operations or when React Query is not available
 */
export const vanillaTrpcClient = createTRPCClient<AppRouter>({
  transformer: superjson,
  links: [
    httpBatchLink({
      url: getBaseUrl(),
      headers: {
        'Content-Type': 'application/json',
      },
    }),
  ],
});

/**
 * Type exports for convenience
 */
export type TRPCClient = typeof trpc;
export type { AppRouter };