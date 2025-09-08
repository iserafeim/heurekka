# Heurekka Frontend - Local Development Setup

This guide will help you set up the Heurekka frontend for local development work.

## Prerequisites

- Node.js 18+ installed
- Docker and Docker Compose (for containerized development)
- Git
- Access to the backend services (optional for standalone frontend development)

## Quick Start

### 1. Clone and Install

```bash
# Navigate to the frontend directory
cd heurekka-frontend

# Install dependencies
npm install
```

### 2. Environment Configuration

```bash
# Copy the example environment file
cp .env.example .env.local

# Edit .env.local with your configuration
nano .env.local
```

### 3. Start Development Server

#### Option A: Standalone Frontend (Default)
```bash
# Start the Next.js development server
npm run dev
```

#### Option B: Full Stack Development
```bash
# Start backend services first, then frontend
npm run full-dev
```

#### Option C: Containerized Development
```bash
# Start everything with Docker
npm run docker:dev
```

The frontend will be available at: http://localhost:3000

## Environment Configuration

### Required Environment Variables

Copy `.env.example` to `.env.local` and configure these essential variables:

```bash
# Backend API (Required for full functionality)
NEXT_PUBLIC_TRPC_URL=http://localhost:3001/trpc
NEXT_PUBLIC_WS_URL=ws://localhost:3001

# Supabase (Required for authentication and data)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Maps (Required for location features)
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your-mapbox-token
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-key
```

### Optional Environment Variables

```bash
# Feature Flags
NEXT_PUBLIC_ENABLE_PWA=true
NEXT_PUBLIC_ENABLE_DEBUG=true
NEXT_PUBLIC_ENABLE_REACT_QUERY_DEVTOOLS=true

# External Services
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-oauth-client-id

# Analytics (Disabled in development)
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=
NEXT_PUBLIC_MIXPANEL_TOKEN=
```

## Development Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Next.js development server with hot reloading |
| `npm run build` | Build the application for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint issues automatically |
| `npm run type-check` | Run TypeScript type checking |
| `npm run analyze` | Analyze bundle size |
| `npm run clean` | Clean build artifacts and cache |

### Full Stack Scripts

| Script | Description |
|--------|-------------|
| `npm run backend:up` | Start backend services with Docker |
| `npm run backend:down` | Stop backend services |
| `npm run full-dev` | Start backend + frontend together |

### Docker Scripts

| Script | Description |
|--------|-------------|
| `npm run docker:dev` | Start containerized development environment |
| `npm run docker:down` | Stop containerized environment |

## Architecture Overview

The frontend is built with:

- **Next.js 15** with App Router
- **TypeScript** for type safety
- **TailwindCSS** for styling
- **tRPC** for type-safe API calls
- **React Query** for server state management
- **Zustand** for client state management
- **Supabase** for authentication and realtime features

### Key Directories

```
src/
├── app/                    # Next.js App Router pages and layouts
│   ├── api/               # API routes
│   ├── providers.tsx      # Global providers
│   └── layout.tsx         # Root layout
├── lib/                   # Utility libraries
│   ├── trpc/             # tRPC client configuration
│   ├── supabase/         # Supabase client and utilities
│   ├── stores/           # Zustand state stores
│   └── utils.ts          # Utility functions
└── components/           # React components (to be created)
```

## Development Workflow

### 1. Backend Connection

If working with the full stack:

```bash
# Start the backend services first
npm run backend:up

# Then start the frontend
npm run dev
```

The frontend will connect to:
- **tRPC API**: http://localhost:3001/trpc
- **WebSocket**: ws://localhost:3001
- **Health Check**: http://localhost:3001/health

### 2. Standalone Development

For UI-only development without backend:

```bash
# Just start the frontend
npm run dev
```

Mock data and offline functionality will be used.

### 3. Docker Development

For a fully containerized environment:

```bash
# Start everything with Docker
npm run docker:dev

# View logs
docker-compose -f docker-compose.dev.yml logs -f frontend

# Stop services
npm run docker:down
```

## State Management

### Authentication State (Zustand)

```typescript
import { useAuthStore } from '@/lib/stores/auth';

const { user, isAuthenticated, signIn, signOut } = useAuthStore();
```

### Property Search State (Zustand)

```typescript
import { usePropertyStore } from '@/lib/stores/property';

const { 
  searchState, 
  setQuery, 
  setFilters, 
  favoriteIds, 
  toggleFavorite 
} = usePropertyStore();
```

### Server State (React Query via tRPC)

```typescript
import { trpc } from '@/lib/trpc';

// Query example
const { data: properties, isLoading } = trpc.homepage.getFeaturedProperties.useQuery({
  limit: 10
});

// Mutation example
const createProperty = trpc.property.create.useMutation();
```

## API Integration

The frontend integrates with multiple services:

### tRPC Backend API

All backend communication uses type-safe tRPC:

```typescript
// Available routes (from backend)
trpc.homepage.getFeaturedProperties.useQuery()
trpc.homepage.searchProperties.useQuery()
trpc.homepage.getSearchSuggestions.useQuery()
trpc.homepage.trackEvent.useMutation()
```

### Supabase Integration

Direct integration for authentication and realtime features:

```typescript
import { supabase, auth } from '@/lib/supabase';

// Authentication
await auth.signInWithPassword(email, password);
await auth.signInWithGoogle();
await auth.signOut();

// Realtime subscriptions
realtime.subscribeToProperties((payload) => {
  console.log('Property updated:', payload);
});
```

## Debugging and Development Tools

### React Query Devtools

Enabled automatically in development when `NEXT_PUBLIC_ENABLE_REACT_QUERY_DEVTOOLS=true`:

- View query cache
- Inspect mutations
- Debug server state

### Browser Developer Tools

The app includes helpful console logging:

- tRPC queries and mutations
- Authentication state changes
- WebSocket connection status
- Store state updates (with Redux DevTools)

### Bundle Analysis

```bash
npm run analyze
```

Opens webpack bundle analyzer to inspect:
- Bundle size
- Code splitting
- Dependency analysis

## Troubleshooting

### Common Issues

#### 1. Backend Connection Failed

```
Error: fetch failed (connection refused)
```

**Solution**: Ensure backend is running:
```bash
npm run backend:up
# or
cd ../heurekka-backend && docker-compose up -d
```

#### 2. Supabase Connection Issues

```
Error: Missing Supabase environment variables
```

**Solution**: Check `.env.local` file has correct Supabase configuration.

#### 3. TypeScript Errors

```bash
# Check for type errors
npm run type-check

# Common fixes
rm -rf .next node_modules/.cache
npm install
```

#### 4. Hot Reloading Not Working

**Solution**: Check if port 3000 is available or configure different port:
```bash
PORT=3001 npm run dev
```

### Development Mode Features

- **Hot Module Replacement**: Instant updates without losing state
- **Error Overlay**: Full-screen error display with stack traces
- **Source Maps**: Original TypeScript source in browser debugger
- **React DevTools**: Component inspection and profiling

## Next Steps

After setup is complete, you can:

1. **Start building components** in the `src/components` directory
2. **Add new pages** in the `src/app` directory
3. **Extend API integration** by adding new tRPC queries/mutations
4. **Implement authentication flows** using the configured auth store
5. **Build property search UI** using the property store

## Production Considerations

This development setup includes production-ready configurations:

- **SEO optimization** with proper metadata
- **Performance monitoring** with Web Vitals
- **Security headers** configured
- **PWA support** ready to enable
- **Bundle optimization** with code splitting

The app is ready for deployment to Vercel or any other Next.js-compatible platform.