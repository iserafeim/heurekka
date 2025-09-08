/**
 * Secure Authentication Utilities
 * Implements secure token handling without localStorage exposure
 */

'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { Session, User } from '@supabase/supabase-js';

interface AuthResponse {
  user: User | null;
  session: Session | null;
  error: any;
}

class SecureAuthManager {
  private supabase = (() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    // Check if we have valid Supabase configuration
    if (!supabaseUrl || !supabaseAnonKey || 
        supabaseUrl === 'your-supabase-url' || 
        supabaseAnonKey === 'your-supabase-anon-key') {
      console.warn('⚠️ Supabase not configured - using mock authentication');
      return null;
    }
    
    try {
      return createBrowserClient(supabaseUrl, supabaseAnonKey);
    } catch (error) {
      console.error('Failed to create Supabase client:', error);
      return null;
    }
  })();

  /**
   * Get current session (server-side managed cookies)
   */
  async getSession(): Promise<{ session: Session | null; error: any }> {
    if (!this.supabase) {
      return { session: null, error: 'Supabase not configured' };
    }
    
    try {
      const { data, error } = await this.supabase.auth.getSession();
      return { session: data.session, error };
    } catch (error) {
      console.error('Failed to get session:', error);
      return { session: null, error };
    }
  }

  /**
   * Sign in with email and password
   */
  async signInWithPassword(email: string, password: string): Promise<AuthResponse> {
    if (!this.supabase) {
      return { user: null, session: null, error: 'Supabase not configured' };
    }
    
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { user: null, session: null, error };
      }

      return {
        user: data.user,
        session: data.session,
        error: null,
      };
    } catch (error) {
      console.error('Sign in failed:', error);
      return { user: null, session: null, error };
    }
  }

  /**
   * Sign up new user
   */
  async signUp(
    email: string,
    password: string,
    metadata?: Record<string, any>
  ): Promise<AuthResponse> {
    if (!this.supabase) {
      return { user: null, session: null, error: 'Supabase not configured' };
    }
    
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) {
        return { user: null, session: null, error };
      }

      return {
        user: data.user,
        session: data.session,
        error: null,
      };
    } catch (error) {
      console.error('Sign up failed:', error);
      return { user: null, session: null, error };
    }
  }

  /**
   * Sign in with Google OAuth
   */
  async signInWithGoogle(): Promise<{ error: any }> {
    if (!this.supabase) {
      return { error: 'Supabase not configured' };
    }
    
    try {
      const { error } = await this.supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      return { error };
    } catch (error) {
      console.error('Google sign in failed:', error);
      return { error };
    }
  }

  /**
   * Sign in with magic link
   */
  async signInWithMagicLink(email: string): Promise<{ error: any }> {
    if (!this.supabase) {
      return { error: 'Supabase not configured' };
    }
    
    try {
      const { error } = await this.supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      return { error };
    } catch (error) {
      console.error('Magic link failed:', error);
      return { error };
    }
  }

  /**
   * Sign out user (clears httpOnly cookies)
   */
  async signOut(): Promise<{ error: any }> {
    if (!this.supabase) {
      return { error: 'Supabase not configured' };
    }
    
    try {
      const { error } = await this.supabase.auth.signOut();
      return { error };
    } catch (error) {
      console.error('Sign out failed:', error);
      return { error };
    }
  }

  /**
   * Get access token for API calls (server-side managed)
   */
  async getAccessToken(): Promise<string | null> {
    if (!this.supabase) {
      return null;
    }
    
    try {
      const { data } = await this.supabase.auth.getSession();
      return data.session?.access_token || null;
    } catch (error) {
      console.error('Failed to get access token:', error);
      return null;
    }
  }

  /**
   * Listen for auth state changes
   */
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    if (!this.supabase) {
      // Return a no-op unsubscribe function
      return { data: { subscription: null }, error: null };
    }
    
    return this.supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
  }

  /**
   * Refresh session if needed
   */
  async refreshSession(): Promise<{ session: Session | null; error: any }> {
    if (!this.supabase) {
      return { session: null, error: 'Supabase not configured' };
    }
    
    try {
      const { data, error } = await this.supabase.auth.refreshSession();
      return { session: data.session, error };
    } catch (error) {
      console.error('Failed to refresh session:', error);
      return { session: null, error };
    }
  }
}

export const secureAuth = new SecureAuthManager();