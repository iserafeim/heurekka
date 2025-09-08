/**
 * Supabase client exports
 * 
 * Centralized exports for Supabase functionality
 */

export { 
  supabase, 
  auth, 
  storage, 
  realtime,
  type SupabaseClient,
  type SupabaseUser,
  type Property,
  type Database
} from './client';

// Re-export Supabase types that might be useful
export type { Session, User } from '@supabase/supabase-js';