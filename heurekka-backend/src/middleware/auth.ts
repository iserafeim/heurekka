import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import { TRPCError } from '@trpc/server';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase configuration for authentication');
}

// Create Supabase client for authentication verification
const supabaseAuth = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export interface AuthenticatedUser {
  id: string;
  email?: string;
  role?: string;
  aud?: string;
  app_metadata?: Record<string, any>;
  user_metadata?: Record<string, any>;
}

export interface AuthContext {
  user: AuthenticatedUser | null;
  isAuthenticated: boolean;
  token: string | null;
}

/**
 * Extract and verify JWT token from request headers
 */
export async function extractAuthContext(req: Request): Promise<AuthContext> {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      user: null,
      isAuthenticated: false,
      token: null
    };
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix

  try {
    // Verify the JWT token with Supabase
    const { data: { user }, error } = await supabaseAuth.auth.getUser(token);
    
    if (error || !user) {
      console.warn('Invalid or expired token:', error?.message);
      return {
        user: null,
        isAuthenticated: false,
        token: null
      };
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        aud: user.aud,
        app_metadata: user.app_metadata,
        user_metadata: user.user_metadata
      },
      isAuthenticated: true,
      token
    };
  } catch (error) {
    console.error('Error verifying token:', error);
    return {
      user: null,
      isAuthenticated: false,
      token: null
    };
  }
}

/**
 * Express middleware to add auth context to request
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  // Auth context will be extracted in tRPC context creation
  // This middleware just ensures the headers are properly formatted
  next();
}

/**
 * Helper function to require authentication in tRPC procedures
 */
export function requireAuth(auth: AuthContext) {
  if (!auth.isAuthenticated || !auth.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Authentication required. Please log in to access this resource.',
    });
  }
  return auth.user;
}

/**
 * Helper function to require specific role
 */
export function requireRole(auth: AuthContext, allowedRoles: string[]) {
  const user = requireAuth(auth);
  
  if (!user.role || !allowedRoles.includes(user.role)) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Insufficient permissions. This action requires elevated privileges.',
    });
  }
  
  return user;
}

/**
 * Helper function to check if user is landlord
 */
export async function requireLandlord(auth: AuthContext): Promise<AuthenticatedUser & { landlordId: string }> {
  const user = requireAuth(auth);
  
  try {
    // Check if user has an associated landlord record
    const { data: landlord, error } = await supabaseAuth
      .from('landlords')
      .select('id, verification_status')
      .eq('user_id', user.id)
      .single();
    
    if (error || !landlord) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Landlord account required. Please register as a landlord to access this resource.',
      });
    }
    
    return {
      ...user,
      landlordId: landlord.id
    };
  } catch (error) {
    if (error instanceof TRPCError) {
      throw error;
    }
    
    console.error('Error checking landlord status:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to verify landlord status',
    });
  }
}

/**
 * Create RLS context for Supabase queries
 * This ensures that Supabase RLS policies can access the authenticated user
 */
export function createSupabaseContext(auth: AuthContext) {
  if (!auth.isAuthenticated || !auth.token) {
    // Return client without authentication for public access
    return createClient(supabaseUrl!, supabaseKey!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }

  // Return client with user's JWT token for RLS
  return createClient(supabaseUrl!, process.env.SUPABASE_ANON_KEY!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    global: {
      headers: {
        authorization: `Bearer ${auth.token}`
      }
    }
  });
}