import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { homepageRouter } from './homepage';
import { propertyRouter } from './property';
import { analyticsRouter } from './analytics';
import type { Context } from '../server';

const t = initTRPC.context<Context>().create();

// Main application router that combines all feature routers
export const appRouter = t.router({
  // Homepage/Landing feature routes
  homepage: homepageRouter,
  
  // Property Discovery feature routes
  property: propertyRouter,
  
  // Analytics and tracking routes
  analytics: analyticsRouter,
  
  // Health check for the entire API
  health: t.procedure
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
          'analytics-tracking'
        ]
      };
    }),

  // Basic hello endpoint for testing
  hello: t.procedure
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