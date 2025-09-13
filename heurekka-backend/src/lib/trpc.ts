import { initTRPC } from '@trpc/server';
import { ZodError } from 'zod';
import superjson from 'superjson';
import type { Context } from '../server';
import { requireAuth, requireRole, requireLandlord } from '../middleware/auth';

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

// Base router and procedure
export const router = t.router;
export const procedure = t.procedure;

// Authenticated procedure - requires valid JWT token
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  const user = requireAuth(ctx.auth);
  return next({
    ctx: {
      ...ctx,
      user, // Add authenticated user to context
    },
  });
});

// Admin procedure - requires admin role
export const adminProcedure = t.procedure.use(({ ctx, next }) => {
  const user = requireRole(ctx.auth, ['admin', 'super_admin']);
  return next({
    ctx: {
      ...ctx,
      user,
    },
  });
});

// Landlord procedure - requires landlord account
export const landlordProcedure = t.procedure.use(async ({ ctx, next }) => {
  const user = await requireLandlord(ctx.auth);
  return next({
    ctx: {
      ...ctx,
      user,
    },
  });
});

// Public procedure with optional auth - user can be null
export const publicProcedure = t.procedure.use(({ ctx, next }) => {
  return next({
    ctx: {
      ...ctx,
      user: ctx.auth.user || null, // User is optional
    },
  });
});