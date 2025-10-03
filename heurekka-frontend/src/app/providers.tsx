'use client';

import React, { useEffect } from 'react';
import { TRPCProvider } from '@/lib/trpc/react';
import { useAuthStore } from '@/lib/stores/auth';
import { Toaster } from 'sonner';

/**
 * Auth Initializer Component
 * Initializes the auth store when the app starts
 */
function AuthInitializer({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return <>{children}</>;
}

/**
 * Root Providers Component
 * Wraps the entire application with necessary providers
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TRPCProvider>
      <AuthInitializer>
        {children}
        <Toaster
          position="top-right"
          expand={false}
          richColors
          closeButton
        />
      </AuthInitializer>
    </TRPCProvider>
  );
}