# User Requested Tech Stack Documentation

The user's preferred tech stack is below.  
You are permitted to expand upon it with new tools, but you can't replace any of these without first getting explicit permission.

For anything not explicitly outlined, always prefer built-in or standard Next.js/Supabase solutions.

---

## Frontend

### Core
- Next.js 14+ with App Router
- TypeScript
- TailwindCSS for styling
- shadcn/ui for components

### Data Flow & State
- Zustand for client state
- TanStack Query for server state
- React Hook Form + Zod for forms
- Supabase JS Client

### UI & Interactivity
- Framer Motion for animations
- React Hook Form for forms
- Responsive design (mobile-first)

### Testing
- Vitest for unit testing
- React Testing Library
- Playwright for E2E

---

## Backend

### Core API
- Next.js API routes + tRPC
- Supabase PostgreSQL with PostGIS
- Supabase Edge Functions for background jobs

### Authentication & Security
- Supabase Auth (Magic Links + Google OAuth)
- Row Level Security (RLS) policies
- JWT with automatic refresh

---

## Database

### Core
- Supabase PostgreSQL
- PostGIS extension for geospatial queries
- Supabase CLI for migrations

### Security
- Row Level Security policies
- Auth context in queries
- Custom indexes for filtering

---

## Storage & Media

### Images
- Supabase Storage
- Image optimization API
- Progressive upload for mobile

### Access Control
- RLS policies for file access
- Signed URLs for private content
- Global CDN included

---

## Background Jobs

### Queue System
- Redis + RQ for job processing
- Separate worker processes
- Job priorities (high: payments, normal: notifications, low: cleanup)

### Use Cases
- Bulk image processing and thumbnails
- Batch notifications to matching users
- Property data synchronization
- Email/WhatsApp notification queues
- Database cleanup tasks

### Scaling Strategy
- Multiple worker instances on Railway
- Queue monitoring with RQ dashboard
- Dead letter queues for failed jobs

---

## Infrastructure

### Development
- Docker Compose with Python + PostgreSQL + Redis
- FastAPI with auto-reload
- Supabase local instance
- Redis container for job queues

### Deployment
- Railway for Python backend + Redis
- Vercel for Next.js frontend
- Supabase cloud for production database
- Separate worker processes on Railway