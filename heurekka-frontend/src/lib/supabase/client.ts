import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file and ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.'
  );
}

/**
 * Supabase client for browser use
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Configure auth settings
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce', // Use PKCE flow for better security
  },
  realtime: {
    // Configure realtime settings for property updates
    params: {
      eventsPerSecond: 10,
    },
  },
  global: {
    headers: {
      'x-application': 'heurekka-frontend',
    },
  },
});

/**
 * Database type definitions will be generated here
 * For now, we'll use a generic Database type
 */
export interface Database {
  public: {
    Tables: {
      properties: {
        Row: {
          id: string;
          title: string;
          description: string;
          price: number;
          currency: string;
          location: {
            lat: number;
            lng: number;
            address: string;
            city: string;
            country: string;
          };
          images: string[];
          features: string[];
          property_type: 'apartment' | 'house' | 'condo' | 'studio' | 'room';
          bedrooms: number;
          bathrooms: number;
          area_sqm: number;
          available_from: string;
          created_at: string;
          updated_at: string;
          landlord_id: string;
          status: 'active' | 'rented' | 'draft' | 'archived';
        };
        Insert: Omit<Database['public']['Tables']['properties']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['properties']['Insert']>;
      };
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          phone: string | null;
          user_type: 'tenant' | 'landlord';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
    };
  };
}

/**
 * Typed Supabase client
 */
export type SupabaseClient = typeof supabase;
export type SupabaseUser = Database['public']['Tables']['users']['Row'];
export type Property = Database['public']['Tables']['properties']['Row'];

/**
 * Auth utilities
 */
export const auth = {
  /**
   * Sign in with email and password
   */
  signInWithPassword: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  /**
   * Sign up with email and password
   */
  signUp: async (email: string, password: string, metadata?: Record<string, any>) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });
    return { data, error };
  },

  /**
   * Sign in with Google OAuth
   */
  signInWithGoogle: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { data, error };
  },

  /**
   * Send magic link
   */
  signInWithMagicLink: async (email: string) => {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { data, error };
  },

  /**
   * Sign out
   */
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  /**
   * Get current session
   */
  getSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    return { session, error };
  },

  /**
   * Get current user
   */
  getUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },
};

/**
 * Storage utilities for property images
 */
export const storage = {
  /**
   * Upload property image
   */
  uploadPropertyImage: async (file: File, propertyId: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${propertyId}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('property-images')
      .upload(fileName, file);

    if (error) return { data: null, error };

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('property-images')
      .getPublicUrl(fileName);

    return {
      data: {
        path: fileName,
        publicUrl: publicUrlData.publicUrl,
      },
      error: null,
    };
  },

  /**
   * Delete property image
   */
  deletePropertyImage: async (path: string) => {
    const { data, error } = await supabase.storage
      .from('property-images')
      .remove([path]);

    return { data, error };
  },

  /**
   * Get public URL for image
   */
  getImageUrl: (path: string) => {
    return supabase.storage
      .from('property-images')
      .getPublicUrl(path).data.publicUrl;
  },
};

/**
 * Realtime subscriptions for property updates
 */
export const realtime = {
  /**
   * Subscribe to property changes
   */
  subscribeToProperties: (callback: (payload: any) => void) => {
    return supabase
      .channel('properties')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'properties',
        },
        callback
      )
      .subscribe();
  },

  /**
   * Subscribe to specific property
   */
  subscribeToProperty: (propertyId: string, callback: (payload: any) => void) => {
    return supabase
      .channel(`property:${propertyId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'properties',
          filter: `id=eq.${propertyId}`,
        },
        callback
      )
      .subscribe();
  },
};