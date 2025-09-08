# Homepage/Landing Feature - Backend Implementation

## Overview

This document outlines the complete backend implementation for the HEUREKKA homepage/landing page feature. The implementation provides robust, scalable APIs for property search, featured properties, search suggestions, and analytics tracking.

## Architecture

### Technology Stack
- **API Framework**: tRPC with Express.js
- **Database**: PostgreSQL with PostGIS (via Supabase)
- **Caching**: Redis with ioredis client
- **Search Engine**: Custom search engine with Elasticsearch-style features
- **WebSockets**: Socket.IO for real-time updates
- **Validation**: Zod schemas
- **TypeScript**: Full type safety

### Project Structure

```
src/
├── types/
│   └── homepage.ts              # TypeScript interfaces and types
├── schemas/
│   └── homepage.ts              # Zod validation schemas
├── services/
│   ├── supabase.ts              # Database service layer
│   ├── cache.ts                 # Redis caching service
│   └── searchEngine.ts          # Search and suggestions engine
├── routers/
│   ├── homepage.ts              # Homepage-specific tRPC procedures
│   └── index.ts                 # Main application router
├── migrations/
│   └── 001_homepage_landing_schema.sql # Database schema
└── server.ts                    # Main server configuration
```

## API Endpoints

### Homepage Router (`/trpc/homepage`)

#### 1. `getFeaturedProperties`
- **Type**: Query
- **Purpose**: Get featured properties for homepage display
- **Input**: `{ limit: number, location?: { lat, lng } }`
- **Output**: Array of featured properties with landlord and image data
- **Caching**: 10-minute cache with location-based keys
- **Features**:
  - Distance-based sorting when location provided
  - Automatic cache invalidation
  - Rich property data with landlord information

#### 2. `searchProperties`
- **Type**: Query  
- **Purpose**: Search properties with filters and pagination
- **Input**: `{ query?, location?, filters?, page, limit, sortBy }`
- **Output**: Paginated search results with facets
- **Features**:
  - Full-text search with PostGIS integration
  - Rate limiting (100 requests per 15 minutes)
  - Advanced filtering (price, type, bedrooms, etc.)
  - Multiple sorting options (relevance, price, date, distance)
  - Search result caching

#### 3. `getSearchSuggestions`
- **Type**: Query
- **Purpose**: Provide autocomplete suggestions for search
- **Input**: `{ query: string, location?, limit }`
- **Output**: Array of suggestions with metadata
- **Features**:
  - Location-based suggestions
  - Popular search integration
  - Property type and feature suggestions
  - Intelligent ranking and deduplication
  - Aggressive caching (30 minutes)

#### 4. `getHomepageData`
- **Type**: Query
- **Purpose**: Get combined data for homepage initial load
- **Input**: `{ location? }`
- **Output**: Combined data (featured properties, popular searches, metrics)
- **Features**:
  - Single endpoint for initial page load
  - 15-minute cache
  - Parallel data fetching for performance

#### 5. `trackEvent`
- **Type**: Mutation
- **Purpose**: Track analytics events
- **Input**: `{ name, properties, sessionId, userId? }`
- **Output**: Success confirmation
- **Features**:
  - Fire-and-forget analytics
  - Automatic request context addition
  - Non-blocking for user experience

#### 6. `saveProperty`
- **Type**: Mutation
- **Purpose**: Save/unsave properties for users
- **Input**: `{ propertyId }`
- **Output**: Success confirmation
- **Features**:
  - Session-based user identification
  - Automatic save count increment
  - View tracking integration

#### 7. `createSearchProfile`
- **Type**: Mutation
- **Purpose**: Create reusable search profiles
- **Input**: `{ name, query, notifications }`
- **Output**: Created profile data
- **Features**:
  - Session-based storage
  - Analytics event tracking
  - 7-day cache expiry

## Data Models

### Property Type
```typescript
interface Property {
  id: string;
  title: string;
  description: string;
  type: 'apartment' | 'house' | 'room' | 'commercial';
  address: AddressObject;
  coordinates: { lat: number; lng: number };
  price: { amount: number; currency: string; period: string };
  size: { value: number; unit: string };
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  images: PropertyImage[];
  availableFrom: Date;
  landlord: LandlordInfo;
  // ... metadata fields
}
```

### Search Query Type
```typescript
interface SearchQuery {
  text: string;
  location?: Location;
  filters?: SearchFilters;
  timestamp: number;
}
```

## Database Schema

### Core Tables
- **properties**: Main property data with PostGIS location
- **property_images**: Property photos with ordering
- **landlords**: Property owner information
- **neighborhoods**: Predefined areas with geocoding
- **search_analytics**: Popular search tracking
- **analytics_events**: General event tracking
- **saved_properties**: User favorites (session-based)

### Key Features
- **PostGIS Integration**: Efficient location-based queries
- **Full-text Search**: PostgreSQL text search with custom vectors
- **Optimized Indexes**: Performance-focused indexing strategy
- **Automatic Triggers**: Search vector updates, metrics calculation

## Caching Strategy

### Redis Implementation
- **Featured Properties**: 10-minute cache, location-aware keys
- **Search Results**: 5-minute cache with query hashing
- **Suggestions**: 30-minute cache for performance
- **Homepage Data**: 15-minute cache for combined data
- **Popular Searches**: 1-hour cache with background updates

### Cache Keys
- `featured:{limit}_{locationHash}` - Featured properties
- `search:{searchHash}` - Search results  
- `suggestions:{query}:{locationHash?}` - Search suggestions
- `homepage:data` - Combined homepage data

## Performance Optimizations

### Database Level
- Strategic indexing for common queries
- PostGIS spatial indexes for location queries
- Full-text search indexes
- Query optimization with prepared statements

### Application Level
- Multi-level caching (Redis + in-memory)
- Connection pooling
- Async/await patterns for non-blocking operations
- Background processing for analytics

### API Level
- Rate limiting to prevent abuse
- Response compression
- Optimistic caching strategies
- Batched database queries

## Search Engine

### Features
- **Multi-source Suggestions**: Location + Popular + Property features
- **Intelligent Ranking**: Score-based suggestion ordering
- **Deduplication**: Prevents duplicate suggestions
- **Fallback Handling**: Graceful degradation on errors
- **Analytics Integration**: Tracks search patterns

### Suggestion Types
- **Location**: Neighborhoods, landmarks, areas
- **Property**: Types, features, amenities
- **Popular**: Most searched terms
- **Recent**: User-specific recent searches (client-side)

## Analytics & Monitoring

### Event Tracking
- **Search Events**: Query, location, filters, results count
- **Property Interactions**: Views, saves, contact attempts  
- **User Journey**: Page views, session duration, conversion funnel
- **Performance Metrics**: Response times, cache hit rates

### Health Monitoring
- Service health checks (`/health`)
- Cache connectivity monitoring
- Database connection validation
- Real-time status reporting

## Security & Validation

### Input Validation
- Zod schemas for all inputs
- SQL injection prevention
- XSS protection via helmet
- Rate limiting per IP/session

### Data Protection
- No sensitive data in logs
- Session-based user identification
- Sanitized error messages
- CORS configuration

## Development Setup

### Environment Variables
```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/db
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key

# Redis  
REDIS_URL=redis://localhost:6379

# Application
PORT=3001
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
```

### Migration Setup
1. Ensure PostgreSQL with PostGIS is running
2. Run the migration: `001_homepage_landing_schema.sql`
3. Verify tables and sample data creation
4. Start Redis server
5. Run `npm run dev` to start the development server

### API Testing
- Health check: `GET http://localhost:3001/health`
- API docs: `GET http://localhost:3001/docs`
- tRPC playground: Use tRPC client to test procedures
- WebSocket: Connect to `ws://localhost:3001` for real-time features

## Integration Points

### Frontend Integration
- Use the exported `AppRouter` type for full type safety
- Connect via tRPC client to `/trpc` endpoint
- Implement WebSocket connection for real-time updates
- Handle loading states and error scenarios

### Mobile Considerations
- All endpoints optimized for mobile latency
- Compressed responses
- Efficient pagination
- Offline-friendly caching strategies

## Scalability Considerations

### Horizontal Scaling
- Stateless server design
- Redis for shared session storage
- Database connection pooling
- Load balancer compatible

### Performance Targets
- API response time: <200ms (cached), <500ms (uncached)
- Search suggestions: <100ms
- Featured properties: <150ms
- 95th percentile response times under load

## Future Enhancements

### Phase 2 Features
- Elasticsearch integration for advanced search
- Real-time property updates via WebSocket
- Advanced analytics dashboard
- Machine learning recommendations
- Image optimization service
- Push notification system

## Error Handling

### Graceful Degradation
- Cache failures don't break functionality
- Database timeouts return cached data
- Analytics failures are silent
- Search suggestions fallback to defaults

### Error Types
- `INTERNAL_SERVER_ERROR`: Service unavailable
- `TOO_MANY_REQUESTS`: Rate limit exceeded
- `UNAUTHORIZED`: Authentication required
- `BAD_REQUEST`: Invalid input data

## Monitoring & Observability

### Metrics to Track
- Request volume and latency
- Cache hit/miss rates
- Database query performance
- Search suggestion accuracy
- User engagement rates

### Logging Strategy
- Structured JSON logs
- Request/response correlation IDs
- Performance timing logs
- Error tracking with stack traces
- User journey logging

---

## Implementation Complete ✅

The homepage/landing backend implementation is complete and production-ready, featuring:

- ✅ Full tRPC API with type safety
- ✅ PostgreSQL database with PostGIS
- ✅ Redis caching layer
- ✅ Advanced search engine
- ✅ Analytics tracking
- ✅ WebSocket support
- ✅ Comprehensive error handling
- ✅ Performance optimizations
- ✅ Security measures
- ✅ Database migrations
- ✅ Health monitoring

The implementation follows best practices for scalability, performance, and maintainability while providing all functionality required by the homepage/landing feature specifications.