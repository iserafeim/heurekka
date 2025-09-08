'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';
import { useState } from 'react';
import superjson from 'superjson';
import type { AppRouter } from './client';

/**
 * Create tRPC React hooks
 */
export const trpc = createTRPCReact<AppRouter>();

/**
 * Get the base URL for the tRPC API
 */
function getBaseUrl() {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_TRPC_URL || 'http://localhost:3001/trpc';
  }
  return process.env.NEXT_PUBLIC_TRPC_URL || 'http://localhost:3001/trpc';
}

/**
 * tRPC Provider component
 * Wraps the app with tRPC and React Query providers
 */
export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            gcTime: 5 * 60 * 1000, // 5 minutes (renamed from cacheTime)
            retry: (failureCount, error: any) => {
              // Don't retry on client errors (4xx)
              if (error?.status >= 400 && error?.status < 500) {
                return false;
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
      })
  );

  const [trpcClient] = useState(() =>
    trpc.createClient({
      transformer: superjson,
      links: [
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
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}