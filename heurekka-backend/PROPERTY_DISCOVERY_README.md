# Property Discovery Backend Implementation

This document outlines the complete backend implementation for the HEUREKKA property discovery feature.

## 🚀 Features Implemented

### Core Functionality
- ✅ Property search with advanced filtering
- ✅ Geospatial search using PostGIS
- ✅ Map clustering for performance
- ✅ Infinite scroll pagination
- ✅ Real-time property views tracking
- ✅ Favorites system
- ✅ WhatsApp integration for contacts
- ✅ Comprehensive analytics
- ✅ Redis caching for optimization

### Technology Stack
- **Backend**: Node.js with Express and tRPC
- **Database**: Supabase (PostgreSQL) with PostGIS extension
- **Cache**: Redis with optimized cache strategies
- **Integration**: WhatsApp Business API
- **Search**: PostGIS spatial queries with text search
- **Analytics**: Custom analytics service with real-time tracking

## 📊 Database Schema

### Core Tables
- `properties` - Main property information
- `property_locations` - PostGIS-enabled location data
- `property_images` - Property image management
- `property_favorites` - User favorites tracking
- `property_views` - View analytics
- `property_contact_events` - WhatsApp contact tracking
- `landlords` - Property owner information
- `neighborhoods` - Geographic areas with boundaries

### PostGIS Functions
- `search_properties_nearby()` - Radius-based property search
- `cluster_properties_by_zoom()` - Dynamic map clustering
- `get_properties_in_bounds()` - Map bounds filtering

## 🔌 API Endpoints

### Property Routes (`/trpc/property.*`)

#### Search & Discovery
```typescript
// Main property search with filters
property.search({
  location?: string,
  bounds?: MapBounds,
  coordinates?: Coordinates,
  priceMin: number,
  priceMax: number,
  bedrooms: number[],
  propertyTypes: ('apartment' | 'house' | 'room' | 'office')[],
  amenities: string[],
  sortBy: 'relevancia' | 'precio_asc' | 'precio_desc' | 'reciente' | 'distance',
  radiusKm?: number,
  cursor?: string,
  limit: number
})

// Get property by ID
property.getById({ id: string })

// Get properties in map bounds
property.getByBounds({
  bounds: MapBounds,
  filters?: SearchFilters,
  limit?: number
})

// Get clustered properties for map
property.getClusters({
  bounds: MapBounds,
  zoom: number,
  filters?: SearchFilters
})

// Search nearby properties
property.searchNearby({
  coordinates: Coordinates,
  radiusKm?: number,
  filters?: SearchFilters
})
```

#### Discovery Features
```typescript
// Autocomplete suggestions
property.autocomplete({
  query: string,
  limit?: number,
  location?: Coordinates
})

// Similar properties
property.getSimilar({
  propertyId: string,
  limit?: number
})

// Search facets for filtering UI
property.getSearchFacets({
  bounds?: MapBounds,
  baseFilters?: SearchFilters
})
```

#### User Actions
```typescript
// Toggle favorite
property.toggleFavorite({
  propertyId: string,
  userId?: string
})

// Track property view
property.trackView({
  propertyId: string,
  source: 'lista' | 'mapa' | 'modal' | 'detalle',
  userId?: string,
  sessionId?: string
})

// Track contact attempt
property.trackContact({
  propertyId: string,
  source: 'modal' | 'detalle' | 'lista',
  contactMethod: 'whatsapp' | 'phone' | 'email',
  userId?: string,
  sessionId?: string,
  phoneNumber?: string,
  success: boolean
})
```

### Analytics Routes (`/trpc/analytics.*`)

#### Event Tracking
```typescript
// Generic event tracking
analytics.trackEvent({
  eventName: string,
  properties: Record<string, any>,
  sessionId?: string,
  userId?: string
})

// Property view tracking
analytics.trackPropertyView({
  propertyId: string,
  source: 'lista' | 'mapa' | 'modal' | 'detalle',
  userId?: string,
  sessionId?: string,
  searchQuery?: string,
  searchFilters?: any
})

// WhatsApp contact tracking
analytics.trackWhatsAppContact({
  propertyId: string,
  source: string,
  contactMethod: 'whatsapp' | 'phone' | 'email',
  userId?: string,
  sessionId?: string,
  phoneNumber?: string,
  success: boolean
})

// Search event tracking
analytics.trackSearch({
  query?: string,
  filters: any,
  location?: Coordinates,
  bounds?: MapBounds,
  resultsCount: number,
  searchDuration: number,
  noResults: boolean,
  clickedResults: string[]
})

// Map interaction tracking
analytics.trackMapInteraction({
  eventType: 'zoom_in' | 'zoom_out' | 'pan' | 'marker_click' | 'cluster_click',
  mapData: {
    zoom: number,
    center: Coordinates,
    bounds?: MapBounds
  },
  propertyId?: string,
  clusterId?: number
})
```

#### Analytics Dashboards
```typescript
// Get analytics data
analytics.getAnalytics({
  startDate: string,
  endDate: string,
  propertyId?: string,
  userId?: string,
  eventType?: string,
  limit?: number,
  offset?: number
})

// Property-specific analytics
analytics.getPropertyAnalytics({
  propertyId: string,
  days?: number
})

// Search analytics
analytics.getSearchAnalytics({
  days?: number,
  limit?: number
})

// Conversion funnel
analytics.getConversionFunnel({
  startDate: string,
  endDate: string,
  propertyId?: string
})

// Real-time analytics
analytics.getRealTimeAnalytics()
```

## 🗺️ PostGIS Spatial Features

### Coordinate System
- **SRID**: 4326 (WGS84)
- **Format**: POINT(longitude latitude)
- **Storage**: Both geometry and geography types for optimal performance

### Spatial Queries
```sql
-- Search within radius (5km default)
SELECT * FROM search_properties_nearby(14.0650, -87.1715, 5, '{"price_max": 15000}');

-- Cluster properties by zoom level
SELECT * FROM cluster_properties_by_zoom(
  '{"north": 14.2, "south": 14.0, "east": -87.0, "west": -87.3}', 
  12, 
  '{"bedrooms": [2,3]}'
);

-- Properties within map bounds
SELECT * FROM get_properties_in_bounds(
  '{"north": 14.2, "south": 14.0, "east": -87.0, "west": -87.3}',
  '{"price_min": 8000}',
  100
);
```

### Performance Optimizations
- Spatial indexes on coordinates
- Geography vs geometry types for different use cases
- Optimized clustering algorithms
- Efficient bounding box queries

## 📈 Caching Strategy

### Cache Layers
1. **Search Results**: 5 minutes TTL
2. **Property Details**: 1 hour TTL
3. **Map Bounds**: 3 minutes TTL
4. **Autocomplete**: 24 hours TTL
5. **Property Clusters**: 5 minutes TTL
6. **User Favorites**: 1 minute TTL

### Cache Keys Structure
```
heurekka:property:search:[hash]
heurekka:property:detail:[propertyId]
heurekka:property:bounds:[boundsHash]
heurekka:autocomplete:[query]
heurekka:property:clusters:[paramsHash]
heurekka:user:favorites:[userId]
```

### Cache Invalidation
- Property updates invalidate related caches
- Geographic region-based invalidation
- Time-based expiration with stale-while-revalidate pattern

## 📱 WhatsApp Integration

### Message Generation
- Property details formatting
- User profile inclusion
- Honduras-specific phone number formatting
- Message templates for consistency

### Contact Tracking
- Success/failure rates
- Message delivery confirmation
- Response time analytics
- Lead quality scoring

### Features
```typescript
// Generate inquiry message
const message = whatsappService.generatePropertyInquiryMessage(property, userProfile);

// Create WhatsApp link
const link = whatsappService.generateWhatsAppLink(phone, message);

// Send via Business API (if configured)
const result = await whatsappService.sendMessage(phone, message);

// Validate phone numbers
const validation = whatsappService.validatePhoneNumber(phone);
```

## 📊 Sample Data

The system includes comprehensive sample data:

### Properties (10 total)
- **Lomas del Guijarro**: 2 luxury properties (L.18,000 - L.35,000)
- **Los Próceres**: 2 family/executive properties (L.15,000 - L.25,000)
- **Colonia Palmira**: 2 affordable properties (L.8,000 - L.12,000)
- **Other Areas**: 4 diverse properties (room, office, mountain view, luxury house)

### Geographic Coverage
- Tegucigalpa city center
- Upscale neighborhoods (Lomas del Guijarro, Las Colinas)
- Family areas (Los Próceres)
- Student areas (Colonia Kennedy)
- Affordable zones (Colonia Palmira)

### Property Types
- Apartments (6)
- Houses (3)
- Room (1)
- Office (1)

## 🔧 Environment Variables

### Required
```bash
# Database
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key

# Cache
REDIS_URL=your_redis_url
# OR
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_password

# WhatsApp (optional)
WHATSAPP_API_URL=https://graph.facebook.com/v17.0
WHATSAPP_API_TOKEN=your_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_id
WHATSAPP_BUSINESS_ACCOUNT_ID=your_account_id

# Application
NEXT_PUBLIC_APP_URL=https://heurekka.com
NODE_ENV=production
PORT=3001
```

## 🚀 Deployment

### Health Checks
- `/health` - Complete system health
- Individual service health checks
- Database connectivity
- Cache connectivity
- WhatsApp API status

### Monitoring
- Real-time analytics
- Performance metrics
- Error tracking
- Cache hit rates
- API response times

### Scaling Considerations
- PostGIS spatial indexing for large datasets
- Redis clustering for cache scaling
- Database read replicas for search queries
- CDN integration for property images

## 🔮 Future Enhancements

### Planned Features
1. **Elasticsearch Integration** - Advanced text search
2. **Machine Learning** - Property recommendations
3. **Virtual Tours** - 360° property viewing
4. **Advanced Filters** - School districts, commute times
5. **Mobile App** - React Native implementation
6. **Multi-city Support** - Expand beyond Tegucigalpa
7. **Payment Integration** - Online rent payments
8. **Tenant Verification** - Background checks

### Performance Optimizations
1. **Database Partitioning** - By geographic regions
2. **Edge Caching** - Global CDN deployment
3. **Query Optimization** - Advanced PostGIS queries
4. **Batch Processing** - Analytics aggregation
5. **Real-time Updates** - WebSocket property updates

---

## 📞 Support

For technical support or questions about the property discovery backend:

- **Architecture Questions**: Refer to `/project-documentation/architecture-output.md`
- **Product Requirements**: See `/project-documentation/product-manager-output.md`
- **API Documentation**: Check `/docs` endpoint when server is running
- **Health Status**: Monitor `/health` endpoint

---

*This backend implementation provides a robust, scalable foundation for the HEUREKKA property discovery feature, optimized for the Honduras market with Spanish localization and WhatsApp integration.*