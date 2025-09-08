/**
 * Supabase Client Configuration
 * Provides secure Supabase client instances
 */

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

// Create a singleton Supabase client for browser use
export const createClient = () => {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};

// Export a default client instance
export const supabase = createClient();