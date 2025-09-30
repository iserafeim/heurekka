import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { User, Session } from '@supabase/supabase-js';
import { secureAuth } from '@/lib/auth/secure-auth';

interface AuthStore {
  // State
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signUp: (email: string, password: string, metadata?: Record<string, any>) => Promise<{ error?: any }>;
  signInWithGoogle: () => Promise<{ error?: any }>;
  signInWithMagicLink: (email: string) => Promise<{ error?: any }>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        user: null,
        isLoading: true,
        isAuthenticated: false,

        // Actions
        setUser: (user) => 
          set(
            { 
              user, 
              isAuthenticated: !!user,
              isLoading: false 
            },
            false,
            'auth/setUser'
          ),

        setLoading: (isLoading) => 
          set({ isLoading }, false, 'auth/setLoading'),

        signIn: async (email, password) => {
          set({ isLoading: true }, false, 'auth/signIn/start');
          
          try {
            const { user, session, error } = await secureAuth.signInWithPassword(email, password);
            
            if (error) {
              set({ isLoading: false }, false, 'auth/signIn/error');
              return { error };
            }

            set({ 
              user, 
              isAuthenticated: !!user, 
              isLoading: false 
            }, false, 'auth/signIn/success');
            
            return { error: null };
          } catch (error) {
            set({ isLoading: false }, false, 'auth/signIn/error');
            return { error };
          }
        },

        signUp: async (email, password, metadata) => {
          set({ isLoading: true }, false, 'auth/signUp/start');
          
          try {
            const { user, session, error } = await secureAuth.signUp(email, password, metadata);
            
            if (error) {
              set({ isLoading: false }, false, 'auth/signUp/error');
              return { error };
            }

            // Note: User might not be immediately available due to email confirmation
            set({ 
              user, 
              isAuthenticated: !!user, 
              isLoading: false 
            }, false, 'auth/signUp/success');
            
            return { error: null };
          } catch (error) {
            set({ isLoading: false }, false, 'auth/signUp/error');
            return { error };
          }
        },

        signInWithGoogle: async () => {
          set({ isLoading: true }, false, 'auth/signInWithGoogle/start');
          
          try {
            const { error } = await secureAuth.signInWithGoogle();
            
            if (error) {
              set({ isLoading: false }, false, 'auth/signInWithGoogle/error');
              return { error };
            }

            // OAuth redirect will handle the rest
            return { error: null };
          } catch (error) {
            set({ isLoading: false }, false, 'auth/signInWithGoogle/error');
            return { error };
          }
        },

        signInWithMagicLink: async (email) => {
          set({ isLoading: true }, false, 'auth/signInWithMagicLink/start');
          
          try {
            const { error } = await secureAuth.signInWithMagicLink(email);
            
            set({ isLoading: false }, false, 'auth/signInWithMagicLink/complete');
            
            if (error) {
              return { error };
            }

            return { error: null };
          } catch (error) {
            set({ isLoading: false }, false, 'auth/signInWithMagicLink/error');
            return { error };
          }
        },

        signOut: async () => {
          set({ isLoading: true }, false, 'auth/signOut/start');

          try {
            const { error } = await secureAuth.signOut();

            set({
              user: null,
              isAuthenticated: false,
              isLoading: false
            }, false, 'auth/signOut/success');

            if (error && process.env.NODE_ENV === 'development') {
              // Only log in development, without sensitive data
              console.warn('Sign out encountered an issue');
            }
          } catch (error) {
            if (process.env.NODE_ENV === 'development') {
              console.error('Sign out error occurred');
            }
            // Even if there's an error, clear the local state
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false
            }, false, 'auth/signOut/error');
          }
        },

        initialize: async () => {
          set({ isLoading: true }, false, 'auth/initialize/start');

          try {
            const { session, error } = await secureAuth.getSession();

            set({
              user: session?.user ?? null,
              isAuthenticated: !!session?.user,
              isLoading: false
            }, false, 'auth/initialize/complete');

            // Listen for auth changes with secure manager
            secureAuth.onAuthStateChange((event, session) => {
              if (process.env.NODE_ENV === 'development') {
                // Only log event type in development, no user data
                console.log('Auth state changed:', event);
              }

              set({
                user: session?.user ?? null,
                isAuthenticated: !!session?.user,
                isLoading: false
              }, false, `auth/stateChange/${event}`);
            });
          } catch (error) {
            if (process.env.NODE_ENV === 'development') {
              console.error('Auth initialization encountered an error');
            }
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false
            }, false, 'auth/initialize/error');
          }
        },
      }),
      {
        name: 'heurekka-auth-store',
        // Only persist non-sensitive data
        partialize: (state) => ({
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    {
      name: 'auth-store',
    }
  )
);