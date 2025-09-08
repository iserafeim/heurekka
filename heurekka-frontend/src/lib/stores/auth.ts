import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { User } from '@supabase/supabase-js';
import { supabase, auth } from '@/lib/supabase';

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
            const { data, error } = await auth.signInWithPassword(email, password);
            
            if (error) {
              set({ isLoading: false }, false, 'auth/signIn/error');
              return { error };
            }

            set({ 
              user: data.user, 
              isAuthenticated: true, 
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
            const { data, error } = await auth.signUp(email, password, metadata);
            
            if (error) {
              set({ isLoading: false }, false, 'auth/signUp/error');
              return { error };
            }

            // Note: User might not be immediately available due to email confirmation
            set({ 
              user: data.user, 
              isAuthenticated: !!data.user, 
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
            const { error } = await auth.signInWithGoogle();
            
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
            const { error } = await auth.signInWithMagicLink(email);
            
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
            await auth.signOut();
            
            set({ 
              user: null, 
              isAuthenticated: false, 
              isLoading: false 
            }, false, 'auth/signOut/success');
          } catch (error) {
            console.error('Sign out error:', error);
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
            const { session } = await auth.getSession();
            
            set({ 
              user: session?.user ?? null, 
              isAuthenticated: !!session?.user,
              isLoading: false 
            }, false, 'auth/initialize/complete');

            // Listen for auth changes
            supabase.auth.onAuthStateChange((event, session) => {
              console.log('Auth state changed:', event, session?.user?.id);
              
              set({ 
                user: session?.user ?? null, 
                isAuthenticated: !!session?.user,
                isLoading: false 
              }, false, `auth/stateChange/${event}`);
            });
          } catch (error) {
            console.error('Auth initialization error:', error);
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