# HEUREKKA - Technical Architecture Blueprint
## Long-term Rental Marketplace System Architecture

---

## Executive Summary

### Architecture Overview
HEUREKKA is designed as a modern, scalable rental marketplace using a decoupled architecture with Next.js frontend, tRPC API layer, Supabase backend, and Redis-powered job processing. The system prioritizes mobile performance, real-time lead qualification, and seamless WhatsApp integration for the Honduras market.

### Technology Stack Summary
- **Frontend**: Next.js 14+ (App Router), TypeScript, TailwindCSS, shadcn/ui
- **API Layer**: tRPC with Next.js API routes
- **Backend**: Supabase (PostgreSQL + PostGIS), Edge Functions
- **Job Queue**: Redis + RQ on Railway
- **Storage**: Supabase Storage with CDN
- **Deployment**: Vercel (frontend) + Railway (workers) + Supabase Cloud

### System Component Overview
1. **Web Application**: Progressive Web App with offline capabilities
2. **API Gateway**: tRPC for type-safe client-server communication
3. **Database Layer**: PostgreSQL with PostGIS for geospatial queries
4. **Authentication**: Supabase Auth with Magic Links + Google OAuth
5. **Job Processing**: Redis queue for async operations
6. **Storage**: Distributed file storage with image optimization
7. **External Integrations**: WhatsApp Business API, Google Maps

### Critical Technical Constraints
- Mobile-first design (90% mobile traffic)
- 3G network optimization (<3s page load)
- WhatsApp API rate limits (1000 messages/day initially)
- Honduras internet infrastructure considerations
- Spanish/English localization requirements

---

## System Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                         │
├─────────────────────────────────────────────────────────────┤
│  Next.js PWA │ Mobile Web │ Desktop Web │ WhatsApp Client  │
└──────┬───────────────────────────────────────────┬──────────┘
       │                                           │
       ▼                                           ▼
┌──────────────────────────────┐      ┌─────────────────────┐
│      API GATEWAY             │      │  EXTERNAL SERVICES  │
├──────────────────────────────┤      ├─────────────────────┤
│  tRPC Router                 │◄────►│  WhatsApp API       │
│  Next.js API Routes          │      │  Google Maps API    │
│  Rate Limiting               │      │  Google OAuth       │
│  Request Validation          │      │  SendGrid Email     │
└──────┬───────────────────────┘      └─────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│                    BUSINESS LOGIC LAYER                   │
├────────────────────────────────────────────────────────────┤
│  Auth Service │ Property Service │ Lead Service │ Search  │
│  User Service │ Messaging Service│ Analytics   │ Matching │
└──────┬────────────────────────────────────────────────────┘
       │
       ├────────────────┬──────────────────┐
       ▼                ▼                  ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  DATABASE    │ │   STORAGE    │ │  JOB QUEUE   │
├──────────────┤ ├──────────────┤ ├──────────────┤
│  PostgreSQL  │ │  Supabase    │ │  Redis + RQ  │
│  PostGIS     │ │  Storage     │ │  Workers     │
│  RLS Policies│ │  CDN         │ │  Railway     │
└──────────────┘ └──────────────┘ └──────────────┘
```

### Component Responsibilities

#### Frontend Application
- **Progressive Web App**: Service workers for offline browsing
- **State Management**: Zustand for UI state, TanStack Query for server state
- **Real-time Updates**: Supabase Realtime subscriptions for leads
- **Map Integration**: Lazy-loaded Mapbox/Google Maps components
- **Form Handling**: React Hook Form with Zod validation

#### API Gateway (tRPC)
- **Type Safety**: End-to-end TypeScript type sharing
- **Request Routing**: Organized procedure definitions
- **Authentication**: JWT verification middleware
- **Rate Limiting**: Per-user and per-IP limits
- **Error Handling**: Standardized error responses

#### Business Logic Services
- **Modular Services**: Separated by domain concerns
- **Transaction Management**: Database transaction handling
- **Business Rules**: Lead qualification, matching algorithms
- **Caching Strategy**: Redis for frequently accessed data

#### Data Persistence
- **PostgreSQL**: ACID compliance for critical data
- **PostGIS**: Efficient geospatial queries
- **Row Level Security**: User-based data isolation
- **Migrations**: Version-controlled schema changes

---

## Technology Stack Architecture

### Frontend Architecture

#### Framework and Core Libraries
```typescript
// Next.js 14+ App Router Configuration
- Framework: Next.js 14.2+
- Routing: App Router with parallel routes
- Rendering: SSR for SEO pages, CSR for interactive components
- Language: TypeScript 5.3+
- Styling: TailwindCSS 3.4+ with custom design system
- Components: shadcn/ui with custom theme
```

#### State Management Architecture
```typescript
// Client State (Zustand)
- UI State: Modals, filters, map viewport
- User Preferences: Saved searches, favorites
- Offline Queue: Pending actions for sync

// Server State (TanStack Query)
- Data Fetching: Properties, leads, user profiles
- Caching: 5-minute stale time for listings
- Optimistic Updates: Instant UI feedback
- Background Refetch: Keep data fresh
```

#### Performance Optimizations
- **Code Splitting**: Route-based with dynamic imports
- **Image Optimization**: Next/Image with blur placeholders
- **Bundle Size**: Tree shaking, component lazy loading
- **PWA Features**: Offline support, install prompt
- **Font Loading**: Variable fonts with font-display: swap

### Backend Architecture

#### API Design (tRPC)
```typescript
// Router Structure
appRouter
├── auth
│   ├── register
│   ├── login
│   └── logout
├── properties
│   ├── list
│   ├── get
│   ├── create
│   ├── update
│   └── delete
├── leads
│   ├── generate
│   ├── qualify
│   └── track
├── search
│   ├── properties
│   ├── profiles
│   └── suggestions
└── messaging
    ├── whatsapp
    └── notifications
```

#### Database Architecture (Supabase)
```sql
-- Core Schema Design
schemas
├── public (user-facing data)
├── auth (Supabase Auth)
├── storage (file metadata)
└── analytics (event tracking)

-- Extensions
- postgis (geospatial)
- pg_cron (scheduled jobs)
- uuid-ossp (UUID generation)
```

#### Background Job Architecture
```python
# Redis Queue Configuration
- Queue Priorities:
  - high: WhatsApp messages, lead notifications
  - normal: Email notifications, image processing
  - low: Analytics, cleanup tasks

# Worker Processes
- Lead Processor: Qualification and matching
- Image Processor: Resize, optimize, generate thumbnails
- Notification Worker: Email and WhatsApp delivery
- Analytics Worker: Event aggregation
```

### Infrastructure Architecture

#### Development Environment
```yaml
# Docker Compose Services
services:
  frontend:
    - Next.js with hot reload
    - Port: 3000
  
  supabase:
    - Local Supabase instance
    - PostgreSQL + PostGIS
    - Port: 54321
  
  redis:
    - Redis for queues/cache
    - Port: 6379
  
  worker:
    - Python RQ workers
    - Auto-reload on changes
```

#### Production Deployment
```yaml
# Multi-Service Deployment
vercel:
  - Next.js frontend
  - Edge functions
  - Global CDN

railway:
  - Redis instance
  - Python workers
  - Monitoring dashboard

supabase:
  - Managed PostgreSQL
  - Realtime subscriptions
  - Storage with CDN
```

---

## Component Design and Relationships

### Core System Components

#### 1. User Management Component
```typescript
interface UserComponent {
  services: {
    authentication: AuthService;
    profile: ProfileService;
    preferences: PreferencesService;
  };
  
  models: {
    User: BaseUser;
    TenantProfile: SearchProfile;
    LandlordProfile: PropertyOwner;
  };
  
  repositories: {
    userRepo: SupabaseRepository<User>;
    profileRepo: SupabaseRepository<Profile>;
  };
}
```

#### 2. Property Management Component
```typescript
interface PropertyComponent {
  services: {
    listing: ListingService;
    search: SearchService;
    geocoding: GeocodingService;
  };
  
  models: {
    Property: PropertyListing;
    Location: GeoLocation;
    Amenities: PropertyAmenities;
  };
  
  repositories: {
    propertyRepo: PropertyRepository;
    geoRepo: PostGISRepository;
  };
}
```

#### 3. Lead Management Component
```typescript
interface LeadComponent {
  services: {
    generation: LeadGenerationService;
    qualification: QualificationService;
    tracking: LeadTrackingService;
  };
  
  models: {
    Lead: QualifiedLead;
    Conversation: LeadConversation;
    Status: LeadStatus;
  };
  
  repositories: {
    leadRepo: LeadRepository;
    conversationRepo: ConversationRepository;
  };
}
```

#### 4. Messaging Component
```typescript
interface MessagingComponent {
  services: {
    whatsapp: WhatsAppService;
    notification: NotificationService;
    template: TemplateService;
  };
  
  models: {
    Message: BaseMessage;
    Template: MessageTemplate;
    Queue: MessageQueue;
  };
  
  integrations: {
    whatsappAPI: WhatsAppBusinessAPI;
    sendgrid: EmailService;
  };
}
```

### Component Interaction Patterns

#### Service Layer Communication
```typescript
// Cross-Service Communication via Events
EventBus
├── property.created → notification.send
├── lead.qualified → whatsapp.notify
├── user.registered → email.welcome
└── search.saved → matching.process
```

#### Data Flow Architecture
```typescript
// Request Flow
Client Request
  → tRPC Procedure
    → Validation (Zod)
      → Authentication Check
        → Business Logic Service
          → Database/Cache Query
            → Response Transformation
              → Client Response
```

---

## API Contracts and Endpoints

### Authentication Endpoints

#### Register User
```typescript
// POST /api/trpc/auth.register
interface RegisterInput {
  email: string;
  password?: string; // Optional for magic link
  userType: 'tenant' | 'landlord';
  profile: {
    firstName: string;
    lastName: string;
    phone: string; // +504 format
    preferredLanguage: 'es' | 'en';
  };
}

interface RegisterOutput {
  user: {
    id: string;
    email: string;
    profile: UserProfile;
  };
  session: {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
  };
}
```

#### Login
```typescript
// POST /api/trpc/auth.login
interface LoginInput {
  method: 'magic-link' | 'google' | 'password';
  email?: string;
  password?: string;
  googleToken?: string;
}

interface LoginOutput {
  user: User;
  session: Session;
  requiresProfileCompletion: boolean;
}
```

### Property Endpoints

#### List Properties
```typescript
// GET /api/trpc/properties.list
interface ListPropertiesInput {
  filters: {
    priceMin?: number;
    priceMax?: number;
    bedrooms?: number[];
    bathrooms?: number[];
    propertyType?: PropertyType[];
    amenities?: string[];
    location?: {
      lat: number;
      lng: number;
      radiusKm: number;
    };
    neighborhoods?: string[];
  };
  pagination: {
    page: number;
    limit: number; // Max 50
  };
  sort?: {
    field: 'price' | 'createdAt' | 'distance';
    order: 'asc' | 'desc';
  };
}

interface ListPropertiesOutput {
  properties: Property[];
  totalCount: number;
  hasMore: boolean;
  aggregations: {
    priceRange: { min: number; max: number };
    availableAmenities: string[];
  };
}
```

#### Create Property
```typescript
// POST /api/trpc/properties.create
interface CreatePropertyInput {
  basic: {
    title: string;
    description: string; // Min 50, max 2000 chars
    propertyType: 'apartment' | 'house' | 'room';
    price: number; // L.3000 - L.100000
    currency: 'HNL';
  };
  details: {
    bedrooms: number;
    bathrooms: number;
    area?: number; // Square meters
    floor?: number;
    totalFloors?: number;
    yearBuilt?: number;
    parkingSpaces?: number;
  };
  location: {
    address: string;
    neighborhood: string;
    city: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  amenities: string[];
  availability: {
    availableFrom: Date;
    minimumStay?: number; // Months
    petsAllowed?: boolean;
  };
  images: {
    url: string;
    order: number;
    caption?: string;
  }[];
}

interface CreatePropertyOutput {
  property: Property;
  status: 'draft' | 'pending_review' | 'active';
  listingUrl: string;
}
```

### Lead Management Endpoints

#### Generate Lead
```typescript
// POST /api/trpc/leads.generate
interface GenerateLeadInput {
  propertyId: string;
  tenantProfile: {
    budget: {
      min: number;
      max: number;
    };
    moveDate: Date;
    occupants: number;
    employment: string;
    requirements?: string;
  };
  contactMethod: 'whatsapp' | 'platform';
  message?: string;
}

interface GenerateLeadOutput {
  lead: {
    id: string;
    status: 'new';
    qualificationScore: number; // 0-100
    propertyMatch: boolean;
  };
  whatsappUrl?: string; // Pre-filled WhatsApp link
  landlordNotified: boolean;
}
```

#### Track Lead Status
```typescript
// PUT /api/trpc/leads.updateStatus
interface UpdateLeadStatusInput {
  leadId: string;
  status: 'new' | 'contacted' | 'viewing_scheduled' | 'application' | 'closed';
  notes?: string;
  nextAction?: {
    type: 'follow_up' | 'viewing' | 'documents';
    scheduledFor?: Date;
  };
}

interface UpdateLeadStatusOutput {
  lead: Lead;
  timeline: LeadEvent[];
  notifications: {
    tenant: boolean;
    landlord: boolean;
  };
}
```

### Search Profile Endpoints

#### Create Search Profile
```typescript
// POST /api/trpc/searchProfiles.create
interface CreateSearchProfileInput {
  budget: {
    min: number;
    max: number;
  };
  preferences: {
    propertyTypes: PropertyType[];
    bedrooms: { min: number; max?: number };
    bathrooms: { min: number; max?: number };
    neighborhoods: string[];
    mustHave: string[]; // Required amenities
    niceToHave: string[]; // Optional amenities
  };
  timeline: {
    moveDate: Date;
    urgency: 'immediate' | 'flexible' | 'planning';
  };
  about: {
    occupants: number;
    pets?: { type: string; count: number };
    employment: string;
    guarantor?: boolean;
  };
}

interface CreateSearchProfileOutput {
  profile: SearchProfile;
  matchingProperties: number;
  savedSearchId: string;
}
```

### Messaging Endpoints

#### Send WhatsApp Message
```typescript
// POST /api/trpc/messaging.sendWhatsApp
interface SendWhatsAppInput {
  recipient: {
    phone: string; // +504 format
    name: string;
  };
  template: 'lead_notification' | 'viewing_reminder' | 'custom';
  variables?: Record<string, string>;
  customMessage?: string;
}

interface SendWhatsAppOutput {
  messageId: string;
  status: 'queued' | 'sent' | 'failed';
  deliveryTime?: Date;
  error?: string;
}
```

---

## Data Models and Database Schema

### Core Database Schema

#### Users and Authentication
```sql
-- users table (managed by Supabase Auth)
CREATE TABLE auth.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  encrypted_password VARCHAR(255),
  email_confirmed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('tenant', 'landlord', 'both')),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) UNIQUE,
  phone_verified BOOLEAN DEFAULT FALSE,
  preferred_language VARCHAR(2) DEFAULT 'es',
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- tenant_profiles table
CREATE TABLE public.tenant_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  budget_min DECIMAL(10,2) NOT NULL CHECK (budget_min >= 3000),
  budget_max DECIMAL(10,2) NOT NULL CHECK (budget_max <= 100000),
  move_date DATE NOT NULL,
  occupants INTEGER NOT NULL DEFAULT 1,
  has_pets BOOLEAN DEFAULT FALSE,
  pet_details JSONB,
  employment_type VARCHAR(50),
  employer VARCHAR(200),
  has_guarantor BOOLEAN DEFAULT FALSE,
  preferred_neighborhoods TEXT[],
  search_radius_km INTEGER DEFAULT 5,
  requirements TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT budget_check CHECK (budget_max >= budget_min)
);

-- landlord_profiles table
CREATE TABLE public.landlord_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_name VARCHAR(200),
  business_type VARCHAR(50) CHECK (business_type IN ('individual', 'agency', 'developer')),
  verification_status VARCHAR(20) DEFAULT 'pending',
  verification_documents JSONB,
  response_time_minutes INTEGER,
  total_properties INTEGER DEFAULT 0,
  active_properties INTEGER DEFAULT 0,
  rating DECIMAL(3,2),
  rating_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Properties and Listings
```sql
-- properties table
CREATE TABLE public.properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  landlord_id UUID NOT NULL REFERENCES public.landlord_profiles(id),
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(250) UNIQUE NOT NULL,
  description TEXT NOT NULL CHECK (LENGTH(description) >= 50),
  property_type VARCHAR(20) NOT NULL CHECK (property_type IN ('apartment', 'house', 'room', 'office')),
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'rented')),
  
  -- Pricing
  price DECIMAL(10,2) NOT NULL CHECK (price BETWEEN 3000 AND 100000),
  currency VARCHAR(3) DEFAULT 'HNL',
  utilities_included BOOLEAN DEFAULT FALSE,
  
  -- Details
  bedrooms INTEGER NOT NULL,
  bathrooms DECIMAL(3,1) NOT NULL,
  area_sqm INTEGER,
  floor INTEGER,
  total_floors INTEGER,
  year_built INTEGER,
  parking_spaces INTEGER DEFAULT 0,
  
  -- Availability
  available_from DATE NOT NULL,
  minimum_stay_months INTEGER DEFAULT 12,
  maximum_occupants INTEGER,
  pets_allowed BOOLEAN DEFAULT FALSE,
  pet_restrictions TEXT,
  
  -- Metadata
  view_count INTEGER DEFAULT 0,
  contact_count INTEGER DEFAULT 0,
  favorite_count INTEGER DEFAULT 0,
  last_updated TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- SEO
  meta_description TEXT,
  
  -- Indexing
  search_vector tsvector,
  
  CONSTRAINT valid_price CHECK (price > 0),
  CONSTRAINT valid_bedrooms CHECK (bedrooms >= 0),
  CONSTRAINT valid_bathrooms CHECK (bathrooms >= 0)
);

-- Create search vector trigger
CREATE TRIGGER update_property_search_vector
BEFORE INSERT OR UPDATE ON properties
FOR EACH ROW
EXECUTE FUNCTION tsvector_update_trigger(
  search_vector, 'pg_catalog.spanish',
  title, description
);

-- property_locations table (PostGIS)
CREATE TABLE public.property_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  neighborhood VARCHAR(100) NOT NULL,
  city VARCHAR(100) DEFAULT 'Tegucigalpa',
  state VARCHAR(100) DEFAULT 'Francisco Morazán',
  country VARCHAR(2) DEFAULT 'HN',
  postal_code VARCHAR(10),
  coordinates GEOGRAPHY(POINT, 4326) NOT NULL,
  formatted_address TEXT,
  place_id VARCHAR(100), -- Google Places ID
  is_exact_location BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create spatial index
CREATE INDEX idx_property_locations_coordinates 
ON property_locations USING GIST(coordinates);

-- property_amenities table
CREATE TABLE public.property_amenities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  amenity_id UUID NOT NULL REFERENCES public.amenities(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(property_id, amenity_id)
);

-- amenities table (master list)
CREATE TABLE public.amenities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50),
  name_es VARCHAR(100) NOT NULL,
  name_en VARCHAR(100) NOT NULL,
  is_premium BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(category, name)
);

-- property_images table
CREATE TABLE public.property_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT,
  order_index INTEGER NOT NULL,
  width INTEGER,
  height INTEGER,
  size_bytes INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(property_id, order_index)
);
```

#### Lead Management
```sql
-- leads table
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES public.properties(id),
  tenant_id UUID NOT NULL REFERENCES public.tenant_profiles(id),
  landlord_id UUID NOT NULL REFERENCES public.landlord_profiles(id),
  
  -- Status tracking
  status VARCHAR(20) DEFAULT 'new' CHECK (status IN (
    'new', 'contacted', 'qualified', 'viewing_scheduled', 
    'application', 'approved', 'rejected', 'closed'
  )),
  
  -- Qualification
  qualification_score INTEGER CHECK (qualification_score BETWEEN 0 AND 100),
  budget_match BOOLEAN,
  timeline_match BOOLEAN,
  requirements_match JSONB,
  
  -- Communication
  initial_message TEXT,
  contact_method VARCHAR(20) CHECK (contact_method IN ('whatsapp', 'platform', 'email')),
  first_contact_at TIMESTAMP,
  last_contact_at TIMESTAMP,
  
  -- Tracking
  source VARCHAR(50),
  utm_campaign VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- lead_events table (timeline)
CREATE TABLE public.lead_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  actor_id UUID REFERENCES public.profiles(id),
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- lead_conversations table
CREATE TABLE public.lead_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  sender_id UUID NOT NULL REFERENCES public.profiles(id),
  sender_type VARCHAR(20) CHECK (sender_type IN ('tenant', 'landlord', 'system')),
  channel VARCHAR(20) CHECK (channel IN ('platform', 'whatsapp', 'email')),
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Search and Matching
```sql
-- saved_searches table
CREATE TABLE public.saved_searches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenant_profiles(id) ON DELETE CASCADE,
  name VARCHAR(100),
  filters JSONB NOT NULL,
  notification_frequency VARCHAR(20) CHECK (notification_frequency IN ('instant', 'daily', 'weekly', 'none')),
  last_notified_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- property_views table
CREATE TABLE public.property_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES public.profiles(id),
  session_id VARCHAR(100),
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  view_duration_seconds INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- favorites table
CREATE TABLE public.favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, property_id)
);

-- tenant_lookings table (reverse marketplace)
CREATE TABLE public.tenant_lookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenant_profiles(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMP NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
  view_count INTEGER DEFAULT 0,
  response_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Database Indexes and Performance
```sql
-- Performance indexes
CREATE INDEX idx_properties_status_price ON properties(status, price);
CREATE INDEX idx_properties_bedrooms_bathrooms ON properties(bedrooms, bathrooms) WHERE status = 'active';
CREATE INDEX idx_properties_landlord ON properties(landlord_id) WHERE status = 'active';
CREATE INDEX idx_properties_created ON properties(created_at DESC);

CREATE INDEX idx_leads_property ON leads(property_id);
CREATE INDEX idx_leads_tenant ON leads(tenant_id);
CREATE INDEX idx_leads_landlord_status ON leads(landlord_id, status);
CREATE INDEX idx_leads_created ON leads(created_at DESC);

CREATE INDEX idx_property_views_property_date ON property_views(property_id, created_at DESC);
CREATE INDEX idx_favorites_user ON favorites(user_id);

-- Full text search index
CREATE INDEX idx_properties_search ON properties USING GIN(search_vector);
```

### Row Level Security Policies
```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Profile policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Property policies
CREATE POLICY "Anyone can view active properties" ON properties
  FOR SELECT USING (status = 'active');

CREATE POLICY "Landlords can manage own properties" ON properties
  FOR ALL USING (
    landlord_id IN (
      SELECT id FROM landlord_profiles WHERE user_id = auth.uid()
    )
  );

-- Lead policies
CREATE POLICY "Tenants can view own leads" ON leads
  FOR SELECT USING (
    tenant_id IN (
      SELECT id FROM tenant_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Landlords can view property leads" ON leads
  FOR SELECT USING (
    landlord_id IN (
      SELECT id FROM landlord_profiles WHERE user_id = auth.uid()
    )
  );
```

---

## Infrastructure and Deployment Architecture

### Environment Configuration

#### Development Environment
```yaml
# docker-compose.yml
version: '3.8'

services:
  frontend:
    build: 
      context: ./frontend
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    environment:
      - NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
    depends_on:
      - supabase

  supabase:
    image: supabase/postgres:14.1.0.89
    ports:
      - "54321:54321"
      - "54322:5432"
    environment:
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=postgres
    volumes:
      - supabase_data:/var/lib/postgresql/data
      - ./supabase/migrations:/docker-entrypoint-initdb.d

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  worker:
    build:
      context: ./worker
      dockerfile: Dockerfile.dev
    volumes:
      - ./worker:/app
    environment:
      - REDIS_URL=redis://redis:6379
      - SUPABASE_URL=http://supabase:54321
      - SUPABASE_SERVICE_KEY=${SUPABASE_SERVICE_KEY}
    depends_on:
      - redis
      - supabase

volumes:
  supabase_data:
  redis_data:
```

#### Production Deployment

##### Vercel Configuration (Frontend)
```json
// vercel.json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "regions": ["iad1"],
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase_url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase_anon_key",
    "NEXT_PUBLIC_MAPBOX_TOKEN": "@mapbox_token",
    "WHATSAPP_API_KEY": "@whatsapp_api_key"
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, must-revalidate"
        }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

##### Railway Configuration (Workers)
```yaml
# railway.yml
services:
  redis:
    image: redis:7-alpine
    volumes:
      - redis:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]

  worker-high:
    build: ./worker
    environment:
      QUEUE_PRIORITY: high
      WORKER_COUNT: 2
    depends_on:
      - redis

  worker-normal:
    build: ./worker
    environment:
      QUEUE_PRIORITY: normal
      WORKER_COUNT: 3
    depends_on:
      - redis

  worker-low:
    build: ./worker
    environment:
      QUEUE_PRIORITY: low
      WORKER_COUNT: 1
    depends_on:
      - redis

volumes:
  redis:
```

##### Supabase Cloud Configuration
```sql
-- Production database configuration
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS uuid-ossp;

-- Configure connection pooling
ALTER SYSTEM SET max_connections = 200;
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';

-- Configure PostGIS
ALTER SYSTEM SET postgis.gdal_enabled_drivers = 'ENABLE_ALL';

-- Backup configuration
SELECT cron.schedule(
  'backup-daily',
  '0 2 * * *',
  $$SELECT pg_dump_to_storage('daily-backup')$$
);
```

### CI/CD Pipeline

#### GitHub Actions Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run type checking
        run: npm run type-check
      
      - name: Run linting
        run: npm run lint
      
      - name: Run tests
        run: npm run test
      
      - name: Build application
        run: npm run build

  deploy-frontend:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'

  deploy-workers:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Railway
        uses: railwayapp/deploy-action@v1
        with:
          railway-token: ${{ secrets.RAILWAY_TOKEN }}
          service: worker

  migrate-database:
    needs: [deploy-frontend, deploy-workers]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run Supabase migrations
        run: |
          npx supabase db push --db-url ${{ secrets.SUPABASE_DB_URL }}
```

### Monitoring and Observability

#### Application Monitoring Stack
```typescript
// monitoring.config.ts
export const monitoring = {
  // Error tracking
  sentry: {
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1,
    profilesSampleRate: 0.1,
  },
  
  // Analytics
  analytics: {
    googleAnalytics: {
      measurementId: process.env.GA_MEASUREMENT_ID,
    },
    mixpanel: {
      token: process.env.MIXPANEL_TOKEN,
      trackAutomaticEvents: true,
    },
  },
  
  // Performance monitoring
  webVitals: {
    enabled: true,
    reportHandler: (metric) => {
      // Send to analytics endpoint
      fetch('/api/analytics/vitals', {
        method: 'POST',
        body: JSON.stringify(metric),
      });
    },
  },
  
  // Custom metrics
  metrics: {
    leadGeneration: ['time_to_first_contact', 'qualification_score'],
    propertyPerformance: ['view_count', 'contact_rate', 'favorite_rate'],
    userEngagement: ['session_duration', 'pages_per_session', 'return_rate'],
  },
};
```

---

## Security Architecture

### Authentication and Authorization

#### Multi-Layer Security Model
```typescript
// Authentication flow
interface AuthenticationLayers {
  layer1: 'Supabase Auth'; // Primary authentication
  layer2: 'JWT Verification'; // Token validation
  layer3: 'RLS Policies'; // Database-level security
  layer4: 'Application Guards'; // Business logic validation
}

// Authorization matrix
const authorizationMatrix = {
  tenant: {
    properties: ['read'],
    own_profile: ['read', 'write'],
    leads: ['create', 'read:own'],
    messages: ['send', 'read:own'],
  },
  landlord: {
    properties: ['create', 'read', 'update:own', 'delete:own'],
    leads: ['read:property', 'update:property'],
    analytics: ['read:own'],
    messages: ['send', 'read:related'],
  },
  admin: {
    all: ['create', 'read', 'update', 'delete'],
  },
};
```

#### Security Headers Configuration
```typescript
// security-headers.ts
export const securityHeaders = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.supabase.co",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https://*.supabase.co https://maps.googleapis.com",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.whatsapp.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '),
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self)',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
};
```

#### API Rate Limiting
```typescript
// rate-limiting.ts
export const rateLimits = {
  global: {
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute
  },
  auth: {
    register: { windowMs: 60 * 60 * 1000, max: 5 }, // 5 per hour
    login: { windowMs: 15 * 60 * 1000, max: 10 }, // 10 per 15 minutes
    passwordReset: { windowMs: 60 * 60 * 1000, max: 3 }, // 3 per hour
  },
  api: {
    properties: { windowMs: 60 * 1000, max: 60 }, // 60 per minute
    leads: { windowMs: 60 * 1000, max: 30 }, // 30 per minute
    messages: { windowMs: 60 * 1000, max: 20 }, // 20 per minute
  },
};
```

### Data Security

#### Encryption Strategy
```typescript
// encryption.config.ts
export const encryptionConfig = {
  // At rest
  database: {
    method: 'AES-256',
    fields: ['phone', 'email', 'address'],
  },
  
  // In transit
  transport: {
    protocol: 'TLS 1.3',
    cipherSuites: ['TLS_AES_256_GCM_SHA384'],
  },
  
  // File storage
  storage: {
    encryption: 'AES-256-GCM',
    signedUrls: true,
    expiryTime: 3600, // 1 hour
  },
  
  // Sensitive data handling
  pii: {
    masking: true,
    tokenization: ['payment_methods'],
    retention: '2_years',
  },
};
```

#### Input Validation and Sanitization
```typescript
// validation.schemas.ts
import { z } from 'zod';

export const validationSchemas = {
  // User input validation
  userRegistration: z.object({
    email: z.string().email().toLowerCase(),
    password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
    phone: z.string().regex(/^\+504\s?\d{4}-?\d{4}$/),
  }),
  
  // Property listing validation
  propertyListing: z.object({
    title: z.string().min(10).max(200).transform(sanitizeHtml),
    description: z.string().min(50).max(2000).transform(sanitizeHtml),
    price: z.number().min(3000).max(100000),
    images: z.array(z.string().url()).max(15),
  }),
  
  // Message validation
  message: z.object({
    content: z.string().max(1000).transform(sanitizeHtml),
    recipientPhone: z.string().regex(/^\+504\s?\d{4}-?\d{4}$/),
  }),
};

// XSS prevention
function sanitizeHtml(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br'],
    ALLOWED_ATTR: [],
  });
}
```

---

## Development and Deployment Workflow

### Development Workflow

#### Branch Strategy
```yaml
# Git branching model
main:
  - Production-ready code
  - Protected branch
  - Requires PR approval

develop:
  - Integration branch
  - Daily merges from feature branches

feature/*:
  - Individual features
  - Naming: feature/JIRA-123-description

hotfix/*:
  - Production fixes
  - Direct merge to main and develop
```

#### Development Process
```bash
# 1. Feature development
git checkout -b feature/HEUR-123-property-search
npm run dev

# 2. Testing
npm run test:unit
npm run test:integration
npm run test:e2e

# 3. Code quality
npm run lint
npm run type-check
npm run format

# 4. Commit with conventional commits
git commit -m "feat(properties): add advanced search filters"

# 5. Push and create PR
git push origin feature/HEUR-123-property-search
```

### Testing Strategy

#### Test Pyramid
```typescript
// Test distribution
const testStrategy = {
  unit: {
    coverage: 80,
    tools: ['vitest', '@testing-library/react'],
    focus: ['Components', 'Utilities', 'Hooks'],
  },
  integration: {
    coverage: 60,
    tools: ['vitest', 'msw'],
    focus: ['API routes', 'Database queries', 'Services'],
  },
  e2e: {
    coverage: 40,
    tools: ['playwright'],
    focus: ['Critical user flows', 'Payment flows', 'Authentication'],
  },
};

// Example test structure
describe('PropertyService', () => {
  describe('listProperties', () => {
    it('should return filtered properties', async () => {
      const filters = { priceMax: 15000, bedrooms: [2, 3] };
      const result = await propertyService.listProperties(filters);
      
      expect(result.properties).toHaveLength(10);
      expect(result.properties[0].price).toBeLessThanOrEqual(15000);
    });
    
    it('should handle geospatial queries', async () => {
      const location = { lat: 14.0650, lng: -87.1715, radiusKm: 5 };
      const result = await propertyService.searchByLocation(location);
      
      expect(result.properties).toBeInstanceOf(Array);
      expect(result.properties[0].distance).toBeLessThanOrEqual(5);
    });
  });
});
```

### Deployment Process

#### Automated Deployment Pipeline
```mermaid
graph LR
    A[Git Push] --> B[GitHub Actions]
    B --> C{Tests Pass?}
    C -->|Yes| D[Build]
    C -->|No| E[Notify Developer]
    D --> F{Branch?}
    F -->|main| G[Deploy to Production]
    F -->|develop| H[Deploy to Staging]
    G --> I[Run Smoke Tests]
    H --> J[Run Integration Tests]
    I --> K[Monitor Metrics]
    J --> L[QA Review]
```

#### Deployment Checklist
```yaml
pre-deployment:
  - [ ] All tests passing
  - [ ] Code review approved
  - [ ] Database migrations reviewed
  - [ ] Environment variables configured
  - [ ] Security scan completed

deployment:
  - [ ] Deploy frontend to Vercel
  - [ ] Deploy workers to Railway
  - [ ] Run database migrations
  - [ ] Update Redis cache
  - [ ] Verify health checks

post-deployment:
  - [ ] Run smoke tests
  - [ ] Monitor error rates
  - [ ] Check performance metrics
  - [ ] Verify critical flows
  - [ ] Update documentation
```

### Rollback Strategy
```bash
# Immediate rollback procedure
#!/bin/bash

# 1. Revert frontend
vercel rollback heurekka-production --yes

# 2. Revert workers
railway rollback worker --environment production

# 3. Revert database (if needed)
supabase db rollback --version previous

# 4. Clear cache
redis-cli FLUSHDB

# 5. Notify team
curl -X POST $SLACK_WEBHOOK -d '{"text":"Production rollback completed"}'
```

---

## For Backend Engineers

### API Implementation Guide

#### tRPC Router Setup
```typescript
// src/server/api/root.ts
import { createTRPCRouter } from './trpc';
import { authRouter } from './routers/auth';
import { propertyRouter } from './routers/property';
import { leadRouter } from './routers/lead';
import { searchRouter } from './routers/search';
import { messagingRouter } from './routers/messaging';

export const appRouter = createTRPCRouter({
  auth: authRouter,
  property: propertyRouter,
  lead: leadRouter,
  search: searchRouter,
  messaging: messagingRouter,
});

export type AppRouter = typeof appRouter;
```

#### Service Layer Implementation
```typescript
// src/server/services/property.service.ts
export class PropertyService {
  constructor(
    private db: SupabaseClient,
    private cache: RedisClient,
  ) {}

  async listProperties(filters: PropertyFilters, pagination: Pagination) {
    const cacheKey = `properties:${JSON.stringify({ filters, pagination })}`;
    
    // Check cache
    const cached = await this.cache.get(cacheKey);
    if (cached) return JSON.parse(cached);
    
    // Build query
    let query = this.db
      .from('properties')
      .select(`
        *,
        property_locations(*),
        property_images(*),
        property_amenities(amenities(*))
      `)
      .eq('status', 'active');
    
    // Apply filters
    if (filters.priceMin) query = query.gte('price', filters.priceMin);
    if (filters.priceMax) query = query.lte('price', filters.priceMax);
    if (filters.bedrooms?.length) query = query.in('bedrooms', filters.bedrooms);
    
    // Geospatial filter
    if (filters.location) {
      const { lat, lng, radiusKm } = filters.location;
      query = query.rpc('nearby_properties', {
        lat,
        lng,
        radius_km: radiusKm,
      });
    }
    
    // Pagination
    const { page, limit } = pagination;
    query = query.range((page - 1) * limit, page * limit - 1);
    
    const { data, error, count } = await query;
    if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
    
    const result = {
      properties: data,
      totalCount: count,
      hasMore: count > page * limit,
    };
    
    // Cache for 5 minutes
    await this.cache.setex(cacheKey, 300, JSON.stringify(result));
    
    return result;
  }
}
```

#### Background Job Implementation
```python
# worker/jobs/lead_processor.py
from rq import Queue
from redis import Redis
from supabase import create_client
import os

redis_conn = Redis.from_url(os.environ['REDIS_URL'])
q = Queue(connection=redis_conn)

class LeadProcessor:
    def __init__(self):
        self.supabase = create_client(
            os.environ['SUPABASE_URL'],
            os.environ['SUPABASE_SERVICE_KEY']
        )
    
    def process_lead(self, lead_id: str):
        """Process and qualify a new lead"""
        # Fetch lead data
        lead = self.supabase.table('leads').select('*').eq('id', lead_id).single().execute()
        
        # Calculate qualification score
        score = self.calculate_qualification_score(lead.data)
        
        # Update lead with score
        self.supabase.table('leads').update({
            'qualification_score': score,
            'status': 'qualified' if score >= 70 else 'needs_review'
        }).eq('id', lead_id).execute()
        
        # Trigger notifications
        if score >= 70:
            q.enqueue('send_landlord_notification', lead_id, priority='high')
    
    def calculate_qualification_score(self, lead_data):
        """Calculate lead qualification score"""
        score = 0
        
        # Budget match (40 points)
        if lead_data['budget_match']:
            score += 40
        
        # Timeline match (30 points)
        if lead_data['timeline_match']:
            score += 30
        
        # Profile completeness (20 points)
        profile_fields = ['employment_type', 'has_guarantor', 'phone_verified']
        completed = sum(1 for field in profile_fields if lead_data.get(field))
        score += (completed / len(profile_fields)) * 20
        
        # Previous interactions (10 points)
        if lead_data.get('previous_rental_count', 0) > 0:
            score += 10
        
        return min(score, 100)

# Register job
def process_new_lead(lead_id: str):
    processor = LeadProcessor()
    processor.process_lead(lead_id)
```

---

## For Frontend Engineers

### Component Architecture

#### Folder Structure
```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth layout group
│   ├── (main)/            # Main app layout
│   ├── api/               # API routes
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── features/         # Feature-specific components
│   └── layouts/          # Layout components
├── lib/                  # Utilities
│   ├── api/             # tRPC client
│   ├── hooks/           # Custom hooks
│   ├── stores/          # Zustand stores
│   └── utils/           # Helper functions
└── styles/              # Global styles
```

#### State Management Pattern
```typescript
// src/lib/stores/property.store.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface PropertyStore {
  // State
  filters: PropertyFilters;
  viewMode: 'list' | 'map';
  selectedProperty: Property | null;
  favorites: string[];
  
  // Actions
  setFilters: (filters: Partial<PropertyFilters>) => void;
  toggleViewMode: () => void;
  selectProperty: (property: Property | null) => void;
  toggleFavorite: (propertyId: string) => void;
  resetFilters: () => void;
}

export const usePropertyStore = create<PropertyStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        filters: {
          priceMin: 3000,
          priceMax: 100000,
          bedrooms: [],
          bathrooms: [],
        },
        viewMode: 'list',
        selectedProperty: null,
        favorites: [],
        
        // Actions
        setFilters: (filters) =>
          set((state) => ({
            filters: { ...state.filters, ...filters },
          })),
        
        toggleViewMode: () =>
          set((state) => ({
            viewMode: state.viewMode === 'list' ? 'map' : 'list',
          })),
        
        selectProperty: (property) =>
          set({ selectedProperty: property }),
        
        toggleFavorite: (propertyId) =>
          set((state) => ({
            favorites: state.favorites.includes(propertyId)
              ? state.favorites.filter((id) => id !== propertyId)
              : [...state.favorites, propertyId],
          })),
        
        resetFilters: () =>
          set({
            filters: {
              priceMin: 3000,
              priceMax: 100000,
              bedrooms: [],
              bathrooms: [],
            },
          }),
      }),
      {
        name: 'property-storage',
        partialize: (state) => ({ favorites: state.favorites }),
      }
    )
  )
);
```

#### API Integration Pattern
```typescript
// src/lib/api/property.api.ts
import { api } from './client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useProperties(filters: PropertyFilters) {
  return useQuery({
    queryKey: ['properties', filters],
    queryFn: () => api.property.list.query({ filters }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useCreateProperty() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.property.create.mutate,
    onSuccess: (data) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      
      // Optimistically update specific queries
      queryClient.setQueryData(['property', data.property.id], data.property);
    },
    onError: (error) => {
      toast.error('Failed to create property');
      console.error('Create property error:', error);
    },
  });
}

export function usePropertySubscription(propertyId: string) {
  useEffect(() => {
    const channel = supabase
      .channel(`property:${propertyId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'properties',
        filter: `id=eq.${propertyId}`,
      }, (payload) => {
        queryClient.setQueryData(['property', propertyId], payload.new);
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [propertyId]);
}
```

#### Component Implementation Example
```typescript
// src/components/features/property/PropertyCard.tsx
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, MapPin, Bed, Bath } from 'lucide-react';
import { usePropertyStore } from '@/lib/stores/property.store';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface PropertyCardProps {
  property: Property;
  variant?: 'default' | 'compact';
}

export function PropertyCard({ property, variant = 'default' }: PropertyCardProps) {
  const { favorites, toggleFavorite, selectProperty } = usePropertyStore();
  const isFavorite = favorites.includes(property.id);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        className="group cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => selectProperty(property)}
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={property.images[0]?.url || '/placeholder.jpg'}
            alt={property.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={false}
          />
          
          <button
            className="absolute top-2 right-2 p-2 bg-white/80 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(property.id);
            }}
          >
            <Heart
              className={`w-5 h-5 ${
                isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'
              }`}
            />
          </button>
          
          <Badge className="absolute top-2 left-2">
            L. {property.price.toLocaleString()}
          </Badge>
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-lg line-clamp-1">
            {property.title}
          </h3>
          
          <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
            <MapPin className="w-4 h-4" />
            {property.location.neighborhood}
          </div>
          
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1">
              <Bed className="w-4 h-4 text-gray-500" />
              <span className="text-sm">{property.bedrooms}</span>
            </div>
            <div className="flex items-center gap-1">
              <Bath className="w-4 h-4 text-gray-500" />
              <span className="text-sm">{property.bathrooms}</span>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
```

---

## For QA Engineers

### Testing Strategy

#### Test Coverage Requirements
```yaml
test_coverage:
  unit_tests:
    target: 80%
    focus:
      - Business logic
      - Utility functions
      - Component behavior
      - Form validation
  
  integration_tests:
    target: 60%
    focus:
      - API endpoints
      - Database operations
      - Authentication flows
      - External services
  
  e2e_tests:
    target: 40%
    focus:
      - Critical user journeys
      - Property search and contact
      - Registration and profile creation
      - Lead generation flow
```

#### Test Data Management
```typescript
// tests/fixtures/test-data.ts
export const testData = {
  users: {
    tenant: {
      email: 'test.tenant@example.com',
      password: 'Test123!@#',
      profile: {
        firstName: 'Juan',
        lastName: 'Pérez',
        phone: '+504 9999-9999',
      },
    },
    landlord: {
      email: 'test.landlord@example.com',
      password: 'Test123!@#',
      profile: {
        firstName: 'Ana',
        lastName: 'García',
        phone: '+504 8888-8888',
      },
    },
  },
  
  properties: {
    apartment: {
      title: 'Modern 2BR Apartment in Lomas del Guijarro',
      price: 15000,
      bedrooms: 2,
      bathrooms: 2,
      location: {
        neighborhood: 'Lomas del Guijarro',
        coordinates: { lat: 14.0902, lng: -87.1894 },
      },
    },
  },
  
  leads: {
    qualified: {
      qualificationScore: 85,
      budgetMatch: true,
      timelineMatch: true,
    },
  },
};
```

#### E2E Test Scenarios
```typescript
// tests/e2e/property-search.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Property Search Flow', () => {
  test('should search and contact property owner', async ({ page }) => {
    // 1. Navigate to homepage
    await page.goto('/');
    
    // 2. Enter search location
    await page.fill('[data-testid="search-input"]', 'Tegucigalpa');
    await page.click('[data-testid="search-button"]');
    
    // 3. Apply filters
    await page.click('[data-testid="filter-button"]');
    await page.fill('[data-testid="price-max"]', '20000');
    await page.click('[data-testid="bedrooms-2"]');
    await page.click('[data-testid="apply-filters"]');
    
    // 4. Verify results
    await expect(page.locator('[data-testid="property-card"]')).toHaveCount(10);
    
    // 5. Click on property
    await page.click('[data-testid="property-card"]:first-child');
    
    // 6. Click contact
    await page.click('[data-testid="contact-button"]');
    
    // 7. Complete profile if needed
    if (await page.isVisible('[data-testid="profile-modal"]')) {
      await page.fill('[data-testid="budget-min"]', '12000');
      await page.fill('[data-testid="budget-max"]', '18000');
      await page.fill('[data-testid="move-date"]', '2025-10-01');
      await page.click('[data-testid="save-profile"]');
    }
    
    // 8. Verify WhatsApp redirect
    await expect(page).toHaveURL(/wa\.me/);
  });
});
```

### Performance Testing Requirements
```yaml
performance_requirements:
  page_load:
    target: < 3s on 3G
    critical_pages:
      - homepage
      - property_list
      - property_detail
  
  api_response:
    p95: < 500ms
    p99: < 1000ms
    endpoints:
      - /api/properties
      - /api/leads
      - /api/auth
  
  concurrent_users:
    target: 1000
    scenarios:
      - browsing: 60%
      - searching: 30%
      - contacting: 10%
```

---

## For Security Analysts

### Security Checklist

#### Application Security
```yaml
application_security:
  authentication:
    - [ ] OAuth 2.0 implementation
    - [ ] JWT token rotation
    - [ ] Session management
    - [ ] Password complexity rules
    - [ ] Account lockout policy
    - [ ] MFA optional for landlords
  
  authorization:
    - [ ] Role-based access control
    - [ ] Resource-level permissions
    - [ ] API scope validation
    - [ ] RLS policies enforced
  
  data_protection:
    - [ ] PII encryption at rest
    - [ ] TLS 1.3 for transit
    - [ ] Secure cookies (HttpOnly, Secure, SameSite)
    - [ ] Data masking in logs
    - [ ] Secure file upload validation
  
  input_validation:
    - [ ] XSS prevention
    - [ ] SQL injection prevention
    - [ ] CSRF protection
    - [ ] File type validation
    - [ ] Size limits enforced
```

#### Infrastructure Security
```yaml
infrastructure_security:
  network:
    - [ ] WAF configuration
    - [ ] DDoS protection
    - [ ] Rate limiting
    - [ ] IP allowlisting for admin
  
  monitoring:
    - [ ] Security event logging
    - [ ] Anomaly detection
    - [ ] Failed login tracking
    - [ ] Audit trail
  
  compliance:
    - [ ] GDPR compliance
    - [ ] Data retention policies
    - [ ] Right to deletion
    - [ ] Privacy policy
```

### Vulnerability Management
```typescript
// security/vulnerability-scanner.ts
export const securityScans = {
  dependencies: {
    tool: 'npm audit',
    frequency: 'on_commit',
    severity: ['critical', 'high'],
  },
  
  sast: {
    tool: 'semgrep',
    rules: ['owasp-top-10', 'security-audit'],
    frequency: 'daily',
  },
  
  secrets: {
    tool: 'gitleaks',
    frequency: 'pre_commit',
    patterns: ['api_key', 'secret', 'token', 'password'],
  },
  
  penetration: {
    tool: 'OWASP ZAP',
    frequency: 'weekly',
    targets: ['production', 'staging'],
  },
};
```

---

## Appendix: Technical Decisions and Rationale

### Technology Selection Justification

#### Frontend: Next.js 14+ with App Router
- **Server-side rendering** for SEO critical pages (property listings)
- **Progressive enhancement** for 3G network optimization
- **Built-in image optimization** for property photos
- **Edge runtime** support for global performance

#### Backend: Supabase + tRPC
- **Managed infrastructure** reduces operational overhead
- **Built-in auth** with social login support
- **Real-time subscriptions** for lead notifications
- **Row-level security** for multi-tenant isolation
- **Type safety** with tRPC eliminates API contract bugs

#### Database: PostgreSQL with PostGIS
- **ACID compliance** for financial data integrity
- **Geospatial queries** for location-based search
- **Full-text search** for property descriptions
- **JSON support** for flexible schemas

#### Job Queue: Redis + RQ
- **Reliable processing** for WhatsApp messages
- **Priority queues** for time-sensitive notifications
- **Simple Python integration** for data processing
- **Horizontal scaling** with multiple workers

### Scaling Considerations

#### Phase 1 (0-10K users)
- Single region deployment
- 2 worker instances
- Basic caching strategy
- Manual monitoring

#### Phase 2 (10K-50K users)
- Multi-region CDN
- 5-10 worker instances
- Redis cluster for caching
- APM tools integration

#### Phase 3 (50K+ users)
- Database read replicas
- Microservices extraction
- Event-driven architecture
- Auto-scaling policies

---

*This technical architecture document serves as the blueprint for HEUREKKA's implementation. All technical decisions should align with the product requirements and be validated through iterative development and testing.*

## Document Version
- **Version**: 1.0.0
- **Date**: September 4, 2025
- **Author**: System Architecture Team
- **Status**: Ready for Implementation
- **Review Cycle**: Sprint boundaries