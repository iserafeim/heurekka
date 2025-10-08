import { z } from 'zod';
import { homepageRouter } from './homepage';
import { propertyRouter } from './property';
import { analyticsRouter } from './analytics';
import { authRouter } from './auth';
import { tenantProfileRouter } from './tenant-profile';
import { landlordProfileRouter } from './landlord-profile';
import { savedSearchRouter } from './saved-search';
import { favoriteRouter } from './favorite';
import { tenantDashboardRouter } from './tenant-dashboard';
import type { Context } from '../server';
import { router, publicProcedure, protectedProcedure } from '../lib/trpc';

// Re-export for use in other routers
export { router, publicProcedure, protectedProcedure };

// Main application router that combines all feature routers
export const appRouter = router({
  // Homepage/Landing feature routes
  homepage: homepageRouter,

  // Property Discovery feature routes
  property: propertyRouter,

  // Analytics and tracking routes
  analytics: analyticsRouter,

  // Authentication routes
  auth: authRouter,

  // Tenant profile routes
  tenantProfile: tenantProfileRouter,

  // Landlord profile routes
  landlordProfile: landlordProfileRouter,

  // Saved searches routes
  savedSearch: savedSearchRouter,

  // Favorites routes
  favorite: favoriteRouter,

  // Tenant dashboard routes
  tenantDashboard: tenantDashboardRouter,

  // Health check for the entire API
  health: publicProcedure
    .query(() => {
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'heurekka-backend',
        version: '1.0.0',
        features: [
          'homepage-landing',
          'property-discovery',
          'property-search',
          'map-clustering',
          'whatsapp-integration',
          'analytics-tracking',
          'user-authentication',
          'tenant-profiles',
          'landlord-profiles',
          'saved-searches',
          'favorites-management',
          'tenant-dashboard'
        ]
      };
    }),

  // Basic hello endpoint for testing
  hello: publicProcedure
    .input(z.object({ name: z.string().optional() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.name || 'World'}! Welcome to Heurekka Backend API.`,
        timestamp: new Date().toISOString(),
      };
    }),
});

// Export the router type for use in frontend
export type AppRouter = typeof appRouter;