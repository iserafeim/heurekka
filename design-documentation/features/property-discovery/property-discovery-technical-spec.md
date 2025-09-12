# Property Discovery - Technical Implementation Specification
## Feature Implementation Blueprint for HEUREKKA

---

## Executive Summary

This document provides the comprehensive technical specification for implementing the Property Discovery feature, following HEUREKKA's established architecture patterns. The feature implements a sophisticated 70/30 split-view search interface with real-time map synchronization, optimized for Honduras market with Spanish localization and WhatsApp integration preparation.

### Key Technical Decisions
- **Split-View Architecture**: 70% property cards, 30% fixed map panel with real-time synchronization
- **Map Service**: Mapbox GL JS (following established architecture) for clustering and Honduras customization
- **Performance First**: Virtual scrolling, image lazy loading, map clustering for 10,000+ properties
- **Mobile Optimization**: Progressive enhancement for 3G networks, <3s initial load
- **Spanish Primary**: All user-facing text in Spanish, Honduras-specific geocoding
- **WhatsApp Ready**: Message format preparation for future API integration

---

## Map Service Decision: Mapbox GL JS

### Why Mapbox GL JS (Following Established Architecture)

Based on HEUREKKA's architecture blueprint (`project-documentation/architecture-output.md`), **Mapbox GL JS** is the chosen map service for the following technical reasons:

#### Performance Requirements
- **High-Volume Clustering**: Native support for clustering 10,000+ properties efficiently
- **3G Network Optimization**: Vector tiles load faster than raster tiles on slow connections
- **Mobile Performance**: GPU-accelerated rendering for smooth interactions on mobile devices

#### Honduras Market Optimization
- **Custom Styling**: Ability to create Honduras-specific map styles highlighting neighborhoods
- **Geocoding Integration**: Better support for Central American address formats
- **Offline Capabilities**: Vector tiles can be cached for offline browsing

#### Cost Efficiency
- **Predictable Pricing**: More cost-effective than Google Maps for high-volume property searches
- **No API Key Restrictions**: Better rate limits for production usage

#### Technical Integration
- **PostGIS Compatibility**: Seamless integration with Supabase PostGIS for geospatial queries
- **Clustering Library**: Works well with Supercluster for property aggregation
- **Real-time Updates**: Efficient marker updates for split-view synchronization

**Google Maps API Usage**: Limited to geocoding services and Google OAuth integration, not for main map display.

---

## 1. Next.js Component Architecture

### 1.1 Directory Structure
```
app/
├── (main)/
│   ├── propiedades/                    # Property Discovery main route
│   │   ├── page.tsx                    # Main search page with split view
│   │   ├── layout.tsx                  # Layout with persistent filters
│   │   └── loading.tsx                 # Loading skeleton
│   └── api/
│       └── trpc/
│           └── [trpc]/
│               └── route.ts            # tRPC endpoint
│
components/
├── property-discovery/
│   ├── PropertyDiscoveryContainer.tsx  # Main container component
│   ├── split-view/
│   │   ├── SplitViewManager.tsx       # 70/30 layout controller
│   │   ├── PropertyCardsPanel.tsx     # Left panel (scrollable)
│   │   └── MapPanel.tsx               # Right panel (fixed)
│   ├── property-card/
│   │   ├── PropertyCard.tsx           # Individual property card
│   │   ├── PropertyCardSkeleton.tsx   # Loading skeleton
│   │   └── PropertyCardImage.tsx      # Optimized image component
│   ├── property-modal/
│   │   ├── PropertyDetailModal.tsx    # Full detail modal
│   │   ├── ModalGallery.tsx          # Image gallery section
│   │   ├── ModalInfo.tsx             # Property info section
│   │   └── WhatsAppCTA.tsx           # Contact button
│   ├── filters/
│   │   ├── FilterBar.tsx             # Horizontal filter bar
│   │   ├── PriceFilter.tsx           # Price range dropdown
│   │   ├── BedroomFilter.tsx         # Bedroom selector
│   │   ├── PropertyTypeFilter.tsx    # Type selector
│   │   └── AdvancedFiltersModal.tsx  # Advanced filters
│   └── map/
│       ├── MapboxMap.tsx             # Mapbox GL wrapper
│       ├── PropertyMarker.tsx        # Custom property pins
│       ├── MarkerCluster.tsx         # Clustering logic
│       └── PropertyTooltip.tsx       # Hover tooltips
```

### 1.2 Main Container Component
```typescript
// components/property-discovery/PropertyDiscoveryContainer.tsx
'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/lib/trpc/client';
import { usePropertyStore } from '@/stores/property-store';
import { useSplitViewSync } from '@/hooks/useSplitViewSync';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { SplitViewManager } from './split-view/SplitViewManager';
import { FilterBar } from './filters/FilterBar';
import { PropertyDetailModal } from './property-modal/PropertyDetailModal';
import type { Property, SearchFilters, MapBounds } from '@/types/property';

export function PropertyDiscoveryContainer() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // State Management
  const [filters, setFilters] = useState<SearchFilters>({
    location: searchParams.get('ubicacion') || '',
    priceMin: Number(searchParams.get('precio_min')) || 0,
    priceMax: Number(searchParams.get('precio_max')) || 100000,
    bedrooms: searchParams.get('habitaciones')?.split(',').map(Number) || [],
    propertyTypes: searchParams.get('tipo')?.split(',') || [],
    amenities: searchParams.get('amenidades')?.split(',') || [],
    sortBy: (searchParams.get('ordenar') as any) || 'relevancia',
  });
  
  const [mapBounds, setMapBounds] = useState<MapBounds | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [hoveredPropertyId, setHoveredPropertyId] = useState<string | null>(null);
  
  // tRPC Queries with infinite loading
  const {
    data: searchResults,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = api.property.search.useInfiniteQuery(
    {
      ...filters,
      bounds: mapBounds,
      limit: 24, // 3 full rows + 3 partial for split view
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    }
  );
  
  // Flatten paginated results
  const properties = searchResults?.pages.flatMap(page => page.properties) || [];
  
  // Split-view synchronization
  const { syncCardWithMap, syncMapWithCard } = useSplitViewSync({
    onCardHover: (propertyId) => setHoveredPropertyId(propertyId),
    onMapHover: (propertyId) => {
      // Scroll card into view when map marker is hovered
      const element = document.querySelector(`[data-property-id="${propertyId}"]`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    },
  });
  
  // Infinite scroll for property cards
  const loadMoreRef = useInfiniteScroll(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, { threshold: 200 });
  
  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.location) params.set('ubicacion', filters.location);
    if (filters.priceMin) params.set('precio_min', String(filters.priceMin));
    if (filters.priceMax) params.set('precio_max', String(filters.priceMax));
    if (filters.bedrooms.length) params.set('habitaciones', filters.bedrooms.join(','));
    if (filters.propertyTypes.length) params.set('tipo', filters.propertyTypes.join(','));
    if (filters.sortBy !== 'relevancia') params.set('ordenar', filters.sortBy);
    
    router.replace(`/propiedades?${params.toString()}`, { scroll: false });
  }, [filters]);
  
  // Handle property selection (opens modal)
  const handlePropertyClick = useCallback((property: Property) => {
    setSelectedProperty(property);
    
    // Track view event
    api.analytics.trackPropertyView.mutate({
      propertyId: property.id,
      source: 'lista',
    });
  }, []);
  
  // Handle WhatsApp contact
  const handleWhatsAppContact = useCallback(async (property: Property) => {
    // Track conversion
    await api.analytics.trackWhatsAppContact.mutate({
      propertyId: property.id,
      source: 'modal',
    });
    
    // Generate WhatsApp message
    const message = `¡Hola! Vi esta propiedad en HEUREKKA:
    
📍 ${property.address}
💰 L.${property.price.toLocaleString()}/mes
🏠 ${property.propertyType}
🛏️ ${property.bedrooms} habitaciones
🚿 ${property.bathrooms} baños
📐 ${property.areaSqm} m²

¿Podría darme más información?

Ref: ${property.id}`;
    
    // Open WhatsApp (for now just prepare URL, later will integrate API)
    const whatsappUrl = `https://wa.me/${property.contactPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  }, []);
  
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Filter Bar - Sticky */}
      <FilterBar
        filters={filters}
        onFiltersChange={setFilters}
        resultCount={searchResults?.pages[0]?.total || 0}
        className="sticky top-16 z-20 bg-white border-b shadow-sm"
      />
      
      {/* Split View Container */}
      <SplitViewManager
        properties={properties}
        loading={isLoading}
        error={error}
        hoveredPropertyId={hoveredPropertyId}
        onPropertyHover={syncCardWithMap}
        onPropertyClick={handlePropertyClick}
        onMapBoundsChange={setMapBounds}
        onMarkerHover={syncMapWithCard}
        loadMoreRef={loadMoreRef}
        hasMore={hasNextPage}
        isFetchingMore={isFetchingNextPage}
      />
      
      {/* Property Detail Modal */}
      {selectedProperty && (
        <PropertyDetailModal
          property={selectedProperty}
          isOpen={!!selectedProperty}
          onClose={() => setSelectedProperty(null)}
          onWhatsApp={handleWhatsAppContact}
        />
      )}
    </div>
  );
}
```

### 1.3 Split View Implementation
```typescript
// components/property-discovery/split-view/SplitViewManager.tsx
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { PropertyCardsPanel } from './PropertyCardsPanel';
import { MapPanel } from './MapPanel';
import { cn } from '@/lib/utils';

interface SplitViewManagerProps {
  properties: Property[];
  loading: boolean;
  error: any;
  hoveredPropertyId: string | null;
  onPropertyHover: (id: string | null) => void;
  onPropertyClick: (property: Property) => void;
  onMapBoundsChange: (bounds: MapBounds) => void;
  onMarkerHover: (id: string | null) => void;
  loadMoreRef: React.RefObject<HTMLDivElement>;
  hasMore: boolean;
  isFetchingMore: boolean;
}

export function SplitViewManager(props: SplitViewManagerProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');
  
  // Mobile: Full screen list or map toggle
  if (isMobile) {
    return <MobileView {...props} />;
  }
  
  // Desktop/Tablet: Split view with responsive ratios
  const splitRatio = isTablet ? { cards: 60, map: 40 } : { cards: 70, map: 30 };
  
  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Property Cards Panel - Scrollable */}
      <div 
        className={cn(
          "flex-shrink-0 overflow-y-auto overflow-x-hidden",
          "bg-gray-50 border-r border-gray-200"
        )}
        style={{ width: `${splitRatio.cards}%` }}
      >
        <PropertyCardsPanel
          properties={props.properties}
          loading={props.loading}
          error={props.error}
          hoveredPropertyId={props.hoveredPropertyId}
          onPropertyHover={props.onPropertyHover}
          onPropertyClick={props.onPropertyClick}
          loadMoreRef={props.loadMoreRef}
          hasMore={props.hasMore}
          isFetchingMore={props.isFetchingMore}
        />
      </div>
      
      {/* Map Panel - Fixed/Sticky */}
      <div 
        className="flex-1 sticky top-0 h-full"
        style={{ width: `${splitRatio.map}%` }}
      >
        <MapPanel
          properties={props.properties}
          hoveredPropertyId={props.hoveredPropertyId}
          onMarkerHover={props.onMarkerHover}
          onBoundsChange={props.onMapBoundsChange}
        />
      </div>
    </div>
  );
}
```

---

## 2. tRPC API Procedures

### 2.1 Property Router Definition
```typescript
// server/api/routers/property.ts
import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { PropertyService } from '@/server/services/property.service';
import { SearchService } from '@/server/services/search.service';
import { CacheService } from '@/server/services/cache.service';

const searchFilterSchema = z.object({
  location: z.string().optional(),
  bounds: z.object({
    north: z.number(),
    south: z.number(),
    east: z.number(),
    west: z.number(),
  }).optional(),
  priceMin: z.number().min(0).default(0),
  priceMax: z.number().max(1000000).default(100000),
  bedrooms: z.array(z.number()).default([]),
  propertyTypes: z.array(z.enum(['apartment', 'house', 'room', 'office'])).default([]),
  amenities: z.array(z.string()).default([]),
  sortBy: z.enum(['relevancia', 'precio_asc', 'precio_desc', 'reciente']).default('relevancia'),
  cursor: z.string().optional(),
  limit: z.number().min(1).max(50).default(24),
});

export const propertyRouter = router({
  // Main search procedure with infinite scroll
  search: publicProcedure
    .input(searchFilterSchema)
    .query(async ({ input, ctx }) => {
      const cacheKey = `property:search:${JSON.stringify(input)}`;
      
      // Check Redis cache first
      const cached = await ctx.redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
      
      // Execute search
      const propertyService = new PropertyService(ctx.supabase);
      const searchService = new SearchService(ctx.elasticsearch);
      
      // Use Elasticsearch for text search, PostGIS for geo queries
      let propertyIds: string[] = [];
      
      if (input.location || input.bounds) {
        // Geo-based search using PostGIS
        propertyIds = await propertyService.searchByLocation({
          location: input.location,
          bounds: input.bounds,
          radiusKm: 5, // Default 5km radius
        });
      }
      
      // Apply filters and get results
      const results = await propertyService.searchProperties({
        ...input,
        propertyIds: propertyIds.length > 0 ? propertyIds : undefined,
      });
      
      // Cache for 5 minutes
      await ctx.redis.setex(cacheKey, 300, JSON.stringify(results));
      
      return {
        properties: results.properties,
        total: results.total,
        nextCursor: results.nextCursor,
      };
    }),
  
  // Get property details
  getById: publicProcedure
    .input(z.object({
      id: z.string().uuid(),
    }))
    .query(async ({ input, ctx }) => {
      const propertyService = new PropertyService(ctx.supabase);
      
      const property = await propertyService.getPropertyById(input.id);
      if (!property) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Propiedad no encontrada',
        });
      }
      
      // Increment view count
      await propertyService.incrementViewCount(input.id);
      
      return property;
    }),
  
  // Get properties within map bounds
  getByBounds: publicProcedure
    .input(z.object({
      north: z.number(),
      south: z.number(),
      east: z.number(),
      west: z.number(),
      filters: searchFilterSchema.optional(),
    }))
    .query(async ({ input, ctx }) => {
      const propertyService = new PropertyService(ctx.supabase);
      
      // Use PostGIS for efficient spatial queries
      const properties = await propertyService.getPropertiesInBounds(
        input,
        input.filters
      );
      
      // Cluster if too many properties
      if (properties.length > 100) {
        return await propertyService.clusterProperties(properties, input);
      }
      
      return properties;
    }),
  
  // Toggle favorite
  toggleFavorite: protectedProcedure
    .input(z.object({
      propertyId: z.string().uuid(),
    }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;
      const propertyService = new PropertyService(ctx.supabase);
      
      const isFavorite = await propertyService.toggleFavorite(
        userId,
        input.propertyId
      );
      
      return { isFavorite };
    }),
  
  // Get autocomplete suggestions
  autocomplete: publicProcedure
    .input(z.object({
      query: z.string().min(2),
      limit: z.number().default(10),
    }))
    .query(async ({ input, ctx }) => {
      const searchService = new SearchService(ctx.elasticsearch);
      
      // Search neighborhoods, cities, and landmarks
      const suggestions = await searchService.getAutocompleteSuggestions({
        query: input.query,
        indices: ['neighborhoods', 'cities', 'landmarks'],
        limit: input.limit,
        country: 'HN', // Honduras
        locale: 'es',
      });
      
      return suggestions;
    }),
  
  // Get similar properties
  getSimilar: publicProcedure
    .input(z.object({
      propertyId: z.string().uuid(),
      limit: z.number().default(6),
    }))
    .query(async ({ input, ctx }) => {
      const propertyService = new PropertyService(ctx.supabase);
      const searchService = new SearchService(ctx.elasticsearch);
      
      // Get base property
      const property = await propertyService.getPropertyById(input.propertyId);
      
      // Find similar using Elasticsearch
      const similar = await searchService.findSimilarProperties({
        baseProperty: property,
        limit: input.limit,
        boost: {
          price: 2.0,
          bedrooms: 1.5,
          location: 3.0,
          amenities: 1.0,
        },
      });
      
      return similar;
    }),
});
```

### 2.2 Search Service Implementation
```typescript
// server/services/search.service.ts
import { Client } from '@elastic/elasticsearch';
import type { Property, SearchCriteria } from '@/types/property';

export class SearchService {
  constructor(private client: Client) {}
  
  async searchProperties(criteria: SearchCriteria) {
    const query = this.buildElasticsearchQuery(criteria);
    
    const response = await this.client.search({
      index: 'properties',
      body: {
        query,
        aggs: this.buildAggregations(),
        highlight: {
          fields: {
            title: {},
            description: {},
          },
        },
        sort: this.buildSort(criteria.sortBy),
        from: criteria.offset || 0,
        size: criteria.limit || 24,
      },
    });
    
    return {
      properties: response.hits.hits.map(hit => ({
        ...hit._source,
        id: hit._id,
        highlights: hit.highlight,
        score: hit._score,
      })),
      total: response.hits.total.value,
      aggregations: response.aggregations,
    };
  }
  
  private buildElasticsearchQuery(criteria: SearchCriteria) {
    const must = [];
    const should = [];
    const filter = [];
    
    // Text search
    if (criteria.query) {
      must.push({
        multi_match: {
          query: criteria.query,
          fields: ['title^3', 'description', 'neighborhood^2', 'amenities'],
          type: 'best_fields',
          analyzer: 'spanish',
        },
      });
    }
    
    // Price range
    if (criteria.priceMin || criteria.priceMax) {
      filter.push({
        range: {
          price: {
            gte: criteria.priceMin || 0,
            lte: criteria.priceMax || 1000000,
          },
        },
      });
    }
    
    // Bedrooms
    if (criteria.bedrooms?.length) {
      filter.push({
        terms: { bedrooms: criteria.bedrooms },
      });
    }
    
    // Property types
    if (criteria.propertyTypes?.length) {
      filter.push({
        terms: { propertyType: criteria.propertyTypes },
      });
    }
    
    // Geo distance
    if (criteria.location?.coordinates) {
      filter.push({
        geo_distance: {
          distance: `${criteria.radiusKm || 5}km`,
          coordinates: {
            lat: criteria.location.coordinates.lat,
            lon: criteria.location.coordinates.lng,
          },
        },
      });
    }
    
    // Amenities boost
    if (criteria.amenities?.length) {
      should.push({
        terms: {
          amenities: criteria.amenities,
          boost: 2.0,
        },
      });
    }
    
    return {
      bool: {
        must,
        should,
        filter,
        minimum_should_match: should.length > 0 ? 1 : 0,
      },
    };
  }
  
  private buildSort(sortBy: string) {
    switch (sortBy) {
      case 'precio_asc':
        return [{ price: 'asc' }];
      case 'precio_desc':
        return [{ price: 'desc' }];
      case 'reciente':
        return [{ createdAt: 'desc' }];
      default:
        return ['_score', { createdAt: 'desc' }];
    }
  }
  
  private buildAggregations() {
    return {
      price_ranges: {
        range: {
          field: 'price',
          ranges: [
            { to: 5000 },
            { from: 5000, to: 10000 },
            { from: 10000, to: 15000 },
            { from: 15000, to: 20000 },
            { from: 20000 },
          ],
        },
      },
      neighborhoods: {
        terms: {
          field: 'neighborhood.keyword',
          size: 20,
        },
      },
      property_types: {
        terms: {
          field: 'propertyType',
        },
      },
      amenities: {
        terms: {
          field: 'amenities.keyword',
          size: 30,
        },
      },
    };
  }
}
```

---

## 3. Supabase Database Schema

### 3.1 Properties Tables with PostGIS
```sql
-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- Main properties table
CREATE TABLE public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  landlord_id UUID NOT NULL REFERENCES public.profiles(id),
  
  -- Basic Information
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(250) UNIQUE NOT NULL,
  description TEXT NOT NULL CHECK (LENGTH(description) >= 50),
  property_type property_type_enum NOT NULL,
  status property_status_enum DEFAULT 'draft',
  
  -- Pricing
  price DECIMAL(10,2) NOT NULL CHECK (price BETWEEN 3000 AND 100000),
  currency VARCHAR(3) DEFAULT 'HNL',
  utilities_included BOOLEAN DEFAULT FALSE,
  deposit_months INTEGER DEFAULT 2,
  
  -- Property Details  
  bedrooms INTEGER NOT NULL CHECK (bedrooms >= 0),
  bathrooms DECIMAL(3,1) NOT NULL CHECK (bathrooms >= 0),
  area_sqm INTEGER CHECK (area_sqm > 0),
  floor INTEGER,
  total_floors INTEGER,
  year_built INTEGER,
  parking_spaces INTEGER DEFAULT 0,
  
  -- Availability
  available_from DATE NOT NULL DEFAULT CURRENT_DATE,
  minimum_stay_months INTEGER DEFAULT 12,
  maximum_occupants INTEGER,
  pets_allowed BOOLEAN DEFAULT FALSE,
  pet_restrictions TEXT,
  
  -- Location (separate table for PostGIS)
  location_id UUID REFERENCES public.property_locations(id),
  
  -- Features & Amenities (JSONB for flexibility)
  amenities TEXT[] DEFAULT '{}',
  features JSONB DEFAULT '{}',
  nearby_places JSONB DEFAULT '{}',
  
  -- Media
  images JSONB DEFAULT '[]', -- Array of image objects with URLs
  video_tour_url TEXT,
  virtual_tour_url TEXT,
  
  -- Contact
  contact_phone VARCHAR(20),
  contact_whatsapp VARCHAR(20),
  contact_email VARCHAR(255),
  preferred_contact_method contact_method_enum DEFAULT 'whatsapp',
  
  -- Stats
  view_count INTEGER DEFAULT 0,
  favorite_count INTEGER DEFAULT 0,
  contact_count INTEGER DEFAULT 0,
  
  -- SEO & Search
  meta_title VARCHAR(255),
  meta_description TEXT,
  search_vector tsvector,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  
  -- Indexes will be created below
  CONSTRAINT valid_price CHECK (price > 0),
  CONSTRAINT valid_dates CHECK (available_from >= CURRENT_DATE)
);

-- Property locations table with PostGIS
CREATE TABLE public.property_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID UNIQUE REFERENCES public.properties(id) ON DELETE CASCADE,
  
  -- Address components
  street_address TEXT NOT NULL,
  neighborhood VARCHAR(100) NOT NULL,
  city VARCHAR(100) DEFAULT 'Tegucigalpa',
  department VARCHAR(100) DEFAULT 'Francisco Morazán',
  country VARCHAR(2) DEFAULT 'HN',
  postal_code VARCHAR(10),
  
  -- PostGIS geography point
  coordinates GEOGRAPHY(POINT, 4326) NOT NULL,
  
  -- Geocoding metadata
  formatted_address TEXT,
  place_id VARCHAR(255), -- Google/Mapbox place ID
  geocoding_accuracy geocoding_accuracy_enum DEFAULT 'approximate',
  is_exact_location BOOLEAN DEFAULT FALSE,
  
  -- Neighborhood boundaries (for area searches)
  neighborhood_boundary GEOGRAPHY(POLYGON, 4326),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create spatial indexes for performance
CREATE INDEX idx_property_locations_coordinates 
ON property_locations USING GIST(coordinates);

CREATE INDEX idx_property_locations_neighborhood 
ON property_locations(neighborhood);

CREATE INDEX idx_property_locations_city 
ON property_locations(city);

-- Full-text search index
CREATE INDEX idx_properties_search_vector 
ON properties USING GIN(search_vector);

-- Create search vector trigger
CREATE OR REPLACE FUNCTION update_property_search_vector() 
RETURNS trigger AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('spanish', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('spanish', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('spanish', COALESCE(array_to_string(NEW.amenities, ' '), '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_property_search_vector
BEFORE INSERT OR UPDATE ON properties
FOR EACH ROW
EXECUTE FUNCTION update_property_search_vector();

-- Property search function with PostGIS
CREATE OR REPLACE FUNCTION search_properties_nearby(
  p_lat DOUBLE PRECISION,
  p_lng DOUBLE PRECISION,
  p_radius_km INTEGER DEFAULT 5,
  p_filters JSONB DEFAULT '{}'
)
RETURNS TABLE (
  property_id UUID,
  title VARCHAR,
  price DECIMAL,
  bedrooms INTEGER,
  bathrooms DECIMAL,
  area_sqm INTEGER,
  distance_km DOUBLE PRECISION,
  address TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  amenities TEXT[],
  images JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id AS property_id,
    p.title,
    p.price,
    p.bedrooms,
    p.bathrooms,
    p.area_sqm,
    ST_Distance(
      pl.coordinates::geography,
      ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography
    ) / 1000 AS distance_km,
    pl.formatted_address AS address,
    ST_Y(pl.coordinates::geometry) AS lat,
    ST_X(pl.coordinates::geometry) AS lng,
    p.amenities,
    p.images
  FROM properties p
  INNER JOIN property_locations pl ON p.location_id = pl.id
  WHERE 
    p.status = 'active'
    AND ST_DWithin(
      pl.coordinates::geography,
      ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography,
      p_radius_km * 1000
    )
    AND (
      p_filters->>'price_min' IS NULL 
      OR p.price >= (p_filters->>'price_min')::DECIMAL
    )
    AND (
      p_filters->>'price_max' IS NULL 
      OR p.price <= (p_filters->>'price_max')::DECIMAL
    )
    AND (
      p_filters->>'bedrooms' IS NULL 
      OR p.bedrooms = ANY((p_filters->>'bedrooms')::INTEGER[])
    )
  ORDER BY distance_km ASC
  LIMIT COALESCE((p_filters->>'limit')::INTEGER, 50);
END;
$$ LANGUAGE plpgsql;

-- Favorites table
CREATE TABLE public.property_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, property_id)
);

CREATE INDEX idx_property_favorites_user 
ON property_favorites(user_id);

CREATE INDEX idx_property_favorites_property 
ON property_favorites(property_id);

-- Property views tracking
CREATE TABLE public.property_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  session_id VARCHAR(255),
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_property_views_property 
ON property_views(property_id);

CREATE INDEX idx_property_views_user 
ON property_views(user_id) WHERE user_id IS NOT NULL;

CREATE INDEX idx_property_views_date 
ON property_views(viewed_at);

-- RLS Policies
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_views ENABLE ROW LEVEL SECURITY;

-- Public can view active properties
CREATE POLICY "Public can view active properties" 
ON properties FOR SELECT
USING (status = 'active');

-- Landlords can manage their own properties
CREATE POLICY "Landlords can manage own properties" 
ON properties FOR ALL
USING (auth.uid() = landlord_id);

-- Public can view property locations for active properties
CREATE POLICY "Public can view active property locations" 
ON property_locations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM properties 
    WHERE properties.id = property_locations.property_id 
    AND properties.status = 'active'
  )
);

-- Users can manage their own favorites
CREATE POLICY "Users can manage own favorites" 
ON property_favorites FOR ALL
USING (auth.uid() = user_id);

-- Anyone can create property views
CREATE POLICY "Anyone can create property views" 
ON property_views FOR INSERT
WITH CHECK (true);
```

---

## 4. Redis Caching Strategy

### 4.1 Cache Configuration
```typescript
// server/services/cache.service.ts
import { Redis } from 'ioredis';

export class CacheService {
  private redis: Redis;
  
  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: 0,
      keyPrefix: 'heurekka:',
    });
  }
  
  // Cache patterns for Property Discovery
  private readonly CACHE_KEYS = {
    PROPERTY_SEARCH: 'property:search:',
    PROPERTY_DETAIL: 'property:detail:',
    MAP_BOUNDS: 'property:bounds:',
    AUTOCOMPLETE: 'autocomplete:',
    AGGREGATIONS: 'property:aggs:',
    USER_FAVORITES: 'user:favorites:',
  };
  
  private readonly CACHE_TTL = {
    SEARCH_RESULTS: 300, // 5 minutes
    PROPERTY_DETAIL: 3600, // 1 hour
    MAP_BOUNDS: 180, // 3 minutes
    AUTOCOMPLETE: 86400, // 24 hours
    AGGREGATIONS: 600, // 10 minutes
    USER_FAVORITES: 60, // 1 minute
  };
  
  async cacheSearchResults(
    filters: any,
    results: any,
    ttl?: number
  ): Promise<void> {
    const key = this.CACHE_KEYS.PROPERTY_SEARCH + this.hashFilters(filters);
    await this.redis.setex(
      key,
      ttl || this.CACHE_TTL.SEARCH_RESULTS,
      JSON.stringify(results)
    );
  }
  
  async getCachedSearchResults(filters: any): Promise<any | null> {
    const key = this.CACHE_KEYS.PROPERTY_SEARCH + this.hashFilters(filters);
    const cached = await this.redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }
  
  async cacheMapBounds(
    bounds: MapBounds,
    properties: Property[]
  ): Promise<void> {
    const key = this.CACHE_KEYS.MAP_BOUNDS + this.hashBounds(bounds);
    
    // Store only essential data for map markers
    const mapData = properties.map(p => ({
      id: p.id,
      lat: p.location.coordinates.lat,
      lng: p.location.coordinates.lng,
      price: p.price,
      bedrooms: p.bedrooms,
      propertyType: p.propertyType,
    }));
    
    await this.redis.setex(
      key,
      this.CACHE_TTL.MAP_BOUNDS,
      JSON.stringify(mapData)
    );
  }
  
  async invalidatePropertyCache(propertyId: string): Promise<void> {
    // Invalidate all caches related to this property
    const pattern = `heurekka:*${propertyId}*`;
    const keys = await this.redis.keys(pattern);
    
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
  
  async warmupCache(): Promise<void> {
    // Pre-cache popular searches and locations
    const popularSearches = [
      { city: 'Tegucigalpa', priceMax: 15000 },
      { city: 'San Pedro Sula', priceMax: 12000 },
      { neighborhood: 'Lomas del Guijarro' },
      { neighborhood: 'Los Próceres' },
    ];
    
    for (const search of popularSearches) {
      // Trigger search to populate cache
      await this.cacheSearchResults(search, await this.searchProperties(search));
    }
  }
  
  private hashFilters(filters: any): string {
    // Create deterministic hash for filter combination
    const sorted = JSON.stringify(this.sortObject(filters));
    return require('crypto').createHash('md5').update(sorted).digest('hex');
  }
  
  private hashBounds(bounds: MapBounds): string {
    // Round coordinates to reduce cache keys
    const rounded = {
      north: Math.round(bounds.north * 1000) / 1000,
      south: Math.round(bounds.south * 1000) / 1000,
      east: Math.round(bounds.east * 1000) / 1000,
      west: Math.round(bounds.west * 1000) / 1000,
    };
    return this.hashFilters(rounded);
  }
  
  private sortObject(obj: any): any {
    if (obj === null || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(this.sortObject);
    
    return Object.keys(obj)
      .sort()
      .reduce((sorted: any, key) => {
        sorted[key] = this.sortObject(obj[key]);
        return sorted;
      }, {});
  }
}
```

---

## 5. PostGIS Geolocation Search

### 5.1 Spatial Query Functions
```sql
-- Function for property clustering at different zoom levels
CREATE OR REPLACE FUNCTION cluster_properties_by_zoom(
  p_bounds JSONB,
  p_zoom INTEGER
)
RETURNS TABLE (
  cluster_id INTEGER,
  centroid_lat DOUBLE PRECISION,
  centroid_lng DOUBLE PRECISION,
  property_count INTEGER,
  avg_price DECIMAL,
  property_ids UUID[]
) AS $$
DECLARE
  v_grid_size DOUBLE PRECISION;
BEGIN
  -- Determine grid size based on zoom level
  v_grid_size := CASE
    WHEN p_zoom < 10 THEN 0.1    -- ~11km grid
    WHEN p_zoom < 12 THEN 0.05   -- ~5.5km grid
    WHEN p_zoom < 14 THEN 0.02   -- ~2.2km grid
    WHEN p_zoom < 16 THEN 0.01   -- ~1.1km grid
    ELSE 0.005                    -- ~550m grid
  END;
  
  RETURN QUERY
  WITH bounded_properties AS (
    SELECT 
      p.id,
      p.price,
      pl.coordinates
    FROM properties p
    INNER JOIN property_locations pl ON p.location_id = pl.id
    WHERE 
      p.status = 'active'
      AND ST_Within(
        pl.coordinates::geometry,
        ST_MakeEnvelope(
          (p_bounds->>'west')::DOUBLE PRECISION,
          (p_bounds->>'south')::DOUBLE PRECISION,
          (p_bounds->>'east')::DOUBLE PRECISION,
          (p_bounds->>'north')::DOUBLE PRECISION,
          4326
        )
      )
  ),
  clusters AS (
    SELECT 
      FLOOR(ST_X(coordinates::geometry) / v_grid_size) * v_grid_size + v_grid_size/2 AS cluster_lng,
      FLOOR(ST_Y(coordinates::geometry) / v_grid_size) * v_grid_size + v_grid_size/2 AS cluster_lat,
      ARRAY_AGG(id) AS property_ids,
      AVG(price) AS avg_price,
      COUNT(*) AS property_count
    FROM bounded_properties
    GROUP BY cluster_lng, cluster_lat
  )
  SELECT 
    ROW_NUMBER() OVER () AS cluster_id,
    cluster_lat AS centroid_lat,
    cluster_lng AS centroid_lng,
    property_count,
    avg_price,
    property_ids
  FROM clusters
  WHERE property_count >= CASE
    WHEN p_zoom < 12 THEN 5  -- Require 5+ properties for clustering at low zoom
    WHEN p_zoom < 14 THEN 3  -- Require 3+ properties for clustering at medium zoom
    ELSE 2                    -- Require 2+ properties for clustering at high zoom
  END;
END;
$$ LANGUAGE plpgsql;

-- Function for neighborhood-based search
CREATE OR REPLACE FUNCTION search_properties_by_neighborhood(
  p_neighborhood VARCHAR,
  p_filters JSONB DEFAULT '{}'
)
RETURNS TABLE (
  property_id UUID,
  title VARCHAR,
  price DECIMAL,
  distance_to_center DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  WITH neighborhood_center AS (
    SELECT 
      ST_Centroid(ST_Union(pl.coordinates::geometry)) AS center
    FROM property_locations pl
    WHERE LOWER(pl.neighborhood) = LOWER(p_neighborhood)
  )
  SELECT 
    p.id AS property_id,
    p.title,
    p.price,
    ST_Distance(
      pl.coordinates::geography,
      nc.center::geography
    ) / 1000 AS distance_to_center
  FROM properties p
  INNER JOIN property_locations pl ON p.location_id = pl.id
  CROSS JOIN neighborhood_center nc
  WHERE 
    p.status = 'active'
    AND LOWER(pl.neighborhood) = LOWER(p_neighborhood)
    AND (
      p_filters->>'price_min' IS NULL 
      OR p.price >= (p_filters->>'price_min')::DECIMAL
    )
    AND (
      p_filters->>'price_max' IS NULL 
      OR p.price <= (p_filters->>'price_max')::DECIMAL
    )
  ORDER BY distance_to_center ASC;
END;
$$ LANGUAGE plpgsql;
```

---

## 6. Component State Management (Zustand)

### 6.1 Property Store
```typescript
// stores/property-store.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface PropertyState {
  // Search state
  filters: SearchFilters;
  searchResults: Property[];
  totalResults: number;
  currentPage: number;
  hasMore: boolean;
  
  // Map state
  mapBounds: MapBounds | null;
  mapCenter: { lat: number; lng: number };
  mapZoom: number;
  hoveredPropertyId: string | null;
  selectedPropertyId: string | null;
  
  // UI state
  viewMode: 'list' | 'split' | 'map';
  splitRatio: { cards: number; map: number };
  isFilterModalOpen: boolean;
  
  // User state
  favorites: string[];
  recentSearches: string[];
  viewedProperties: string[];
  
  // Actions
  setFilters: (filters: Partial<SearchFilters>) => void;
  setSearchResults: (results: Property[], total: number) => void;
  appendSearchResults: (results: Property[]) => void;
  setMapBounds: (bounds: MapBounds) => void;
  setHoveredProperty: (id: string | null) => void;
  setSelectedProperty: (id: string | null) => void;
  setViewMode: (mode: 'list' | 'split' | 'map') => void;
  toggleFavorite: (propertyId: string) => void;
  addRecentSearch: (search: string) => void;
  markPropertyViewed: (propertyId: string) => void;
  resetFilters: () => void;
}

const defaultFilters: SearchFilters = {
  location: '',
  priceMin: 0,
  priceMax: 100000,
  bedrooms: [],
  propertyTypes: [],
  amenities: [],
  sortBy: 'relevancia',
};

export const usePropertyStore = create<PropertyState>()(
  devtools(
    persist(
      immer((set) => ({
        // Initial state
        filters: defaultFilters,
        searchResults: [],
        totalResults: 0,
        currentPage: 1,
        hasMore: true,
        
        mapBounds: null,
        mapCenter: { lat: 14.0650, lng: -87.1715 }, // Tegucigalpa
        mapZoom: 12,
        hoveredPropertyId: null,
        selectedPropertyId: null,
        
        viewMode: 'split',
        splitRatio: { cards: 70, map: 30 },
        isFilterModalOpen: false,
        
        favorites: [],
        recentSearches: [],
        viewedProperties: [],
        
        // Actions
        setFilters: (newFilters) =>
          set((state) => {
            state.filters = { ...state.filters, ...newFilters };
            state.currentPage = 1; // Reset pagination on filter change
          }),
        
        setSearchResults: (results, total) =>
          set((state) => {
            state.searchResults = results;
            state.totalResults = total;
            state.hasMore = results.length < total;
          }),
        
        appendSearchResults: (results) =>
          set((state) => {
            state.searchResults.push(...results);
            state.currentPage += 1;
            state.hasMore = state.searchResults.length < state.totalResults;
          }),
        
        setMapBounds: (bounds) =>
          set((state) => {
            state.mapBounds = bounds;
          }),
        
        setHoveredProperty: (id) =>
          set((state) => {
            state.hoveredPropertyId = id;
          }),
        
        setSelectedProperty: (id) =>
          set((state) => {
            state.selectedPropertyId = id;
            if (id) {
              state.markPropertyViewed(id);
            }
          }),
        
        setViewMode: (mode) =>
          set((state) => {
            state.viewMode = mode;
            // Adjust split ratio for different screen sizes
            if (mode === 'split') {
              const isTablet = window.innerWidth < 1024;
              state.splitRatio = isTablet 
                ? { cards: 60, map: 40 }
                : { cards: 70, map: 30 };
            }
          }),
        
        toggleFavorite: (propertyId) =>
          set((state) => {
            const index = state.favorites.indexOf(propertyId);
            if (index === -1) {
              state.favorites.push(propertyId);
            } else {
              state.favorites.splice(index, 1);
            }
          }),
        
        addRecentSearch: (search) =>
          set((state) => {
            // Remove if exists and add to front
            state.recentSearches = state.recentSearches.filter(s => s !== search);
            state.recentSearches.unshift(search);
            // Keep only last 10 searches
            state.recentSearches = state.recentSearches.slice(0, 10);
          }),
        
        markPropertyViewed: (propertyId) =>
          set((state) => {
            if (!state.viewedProperties.includes(propertyId)) {
              state.viewedProperties.push(propertyId);
            }
          }),
        
        resetFilters: () =>
          set((state) => {
            state.filters = defaultFilters;
            state.currentPage = 1;
          }),
      })),
      {
        name: 'property-discovery-store',
        partialize: (state) => ({
          favorites: state.favorites,
          recentSearches: state.recentSearches,
          viewedProperties: state.viewedProperties,
          viewMode: state.viewMode,
        }),
      }
    )
  )
);
```

---

## 7. Performance Optimizations

### 7.1 Image Optimization Service
```typescript
// services/image-optimization.service.ts
export class ImageOptimizationService {
  private readonly CDN_BASE = process.env.NEXT_PUBLIC_CDN_URL;
  
  // Generate responsive image URLs
  getResponsiveImageSet(
    originalUrl: string,
    sizes: { width: number; quality?: number }[]
  ): string {
    return sizes
      .map(({ width, quality = 80 }) => {
        const optimizedUrl = this.getOptimizedUrl(originalUrl, width, quality);
        return `${optimizedUrl} ${width}w`;
      })
      .join(', ');
  }
  
  getOptimizedUrl(
    url: string,
    width: number,
    quality: number = 80,
    format: 'auto' | 'webp' | 'jpg' = 'auto'
  ): string {
    // Using Cloudinary-style transformations
    const transformations = [
      `w_${width}`,
      `q_${quality}`,
      `f_${format}`,
      'c_fill',
      'g_auto',
    ].join(',');
    
    return `${this.CDN_BASE}/image/upload/${transformations}/${url}`;
  }
  
  // Preload critical images
  preloadImages(urls: string[]): void {
    urls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = this.getOptimizedUrl(url, 800);
      document.head.appendChild(link);
    });
  }
}

// Component usage
export function OptimizedPropertyImage({ 
  src, 
  alt,
  sizes = '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw'
}: Props) {
  const imageService = new ImageOptimizationService();
  
  const srcSet = imageService.getResponsiveImageSet(src, [
    { width: 400, quality: 70 },
    { width: 800, quality: 80 },
    { width: 1200, quality: 85 },
  ]);
  
  return (
    <img
      src={imageService.getOptimizedUrl(src, 800)}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      loading="lazy"
      decoding="async"
      className="w-full h-full object-cover"
    />
  );
}
```

### 7.2 Map Clustering Performance
```typescript
// services/map-clustering.service.ts
import Supercluster from 'supercluster';

export class MapClusteringService {
  private index: Supercluster;
  
  constructor() {
    this.index = new Supercluster({
      radius: 60,
      maxZoom: 16,
      minPoints: 2,
    });
  }
  
  async clusterProperties(
    properties: Property[],
    bounds: MapBounds,
    zoom: number
  ): Promise<(Supercluster.ClusterFeature | Supercluster.PointFeature)[]> {
    // Convert properties to GeoJSON features
    const points: Supercluster.PointFeature[] = properties.map(p => ({
      type: 'Feature',
      properties: {
        id: p.id,
        price: p.price,
        bedrooms: p.bedrooms,
        propertyType: p.propertyType,
      },
      geometry: {
        type: 'Point',
        coordinates: [p.location.coordinates.lng, p.location.coordinates.lat],
      },
    }));
    
    // Load points into index
    this.index.load(points);
    
    // Get clusters for current viewport
    const clusters = this.index.getClusters(
      [bounds.west, bounds.south, bounds.east, bounds.north],
      zoom
    );
    
    return clusters;
  }
  
  getClusterExpansionZoom(clusterId: number): number {
    return this.index.getClusterExpansionZoom(clusterId);
  }
  
  getClusterChildren(clusterId: number): Supercluster.PointFeature[] {
    return this.index.getChildren(clusterId);
  }
}
```

### 7.3 Virtual Scrolling Implementation
```typescript
// components/property-discovery/VirtualPropertyList.tsx
import { VirtuosoGrid } from '@virtuoso/react';

export function VirtualPropertyList({ 
  properties,
  onPropertyClick,
  onPropertyHover,
}: Props) {
  const ItemContainer = ({ children, ...props }: any) => (
    <div
      {...props}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6"
    >
      {children}
    </div>
  );
  
  const PropertyItem = ({ index }: { index: number }) => {
    const property = properties[index];
    if (!property) return null;
    
    return (
      <PropertyCard
        property={property}
        onClick={() => onPropertyClick(property)}
        onHover={() => onPropertyHover(property.id)}
      />
    );
  };
  
  return (
    <VirtuosoGrid
      totalCount={properties.length}
      components={{
        Item: PropertyItem,
        List: ItemContainer,
      }}
      overscan={3}
      endReached={() => {
        // Load more properties
      }}
    />
  );
}
```

---

## 8. Mobile-First Responsive Design

### 8.1 Responsive Hooks
```typescript
// hooks/useResponsive.ts
export function useResponsive() {
  const [device, setDevice] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  
  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setDevice('mobile');
      } else if (width < 1024) {
        setDevice('tablet');
      } else {
        setDevice('desktop');
      }
    };
    
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);
  
  return {
    device,
    isMobile: device === 'mobile',
    isTablet: device === 'tablet',
    isDesktop: device === 'desktop',
  };
}
```

### 8.2 Mobile View Implementation
```typescript
// components/property-discovery/MobileView.tsx
export function MobileView({ properties, onPropertyClick }: Props) {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  
  return (
    <div className="h-full flex flex-col">
      {viewMode === 'list' ? (
        <div className="flex-1 overflow-y-auto">
          {properties.map(property => (
            <MobilePropertyCard
              key={property.id}
              property={property}
              onClick={() => onPropertyClick(property)}
            />
          ))}
        </div>
      ) : (
        <div className="flex-1">
          <MapView
            properties={properties}
            onMarkerClick={onPropertyClick}
          />
        </div>
      )}
      
      {/* Floating Map Toggle Button */}
      <button
        className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full p-4 shadow-lg z-50"
        onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
      >
        {viewMode === 'list' ? '🗺️ Mapa' : '📑 Lista'}
      </button>
    </div>
  );
}
```

---

## 9. WhatsApp Integration Preparation

### 9.1 WhatsApp Message Service
```typescript
// services/whatsapp.service.ts
export class WhatsAppService {
  // Generate formatted message for property inquiry
  generatePropertyInquiryMessage(
    property: Property,
    user?: UserProfile
  ): string {
    const lines = [
      '¡Hola! Vi esta propiedad en HEUREKKA y me interesa:',
      '',
      `📍 *${property.address}*`,
      `💰 *L.${property.price.toLocaleString('es-HN')}/mes*`,
      `🏠 ${this.getPropertyTypeLabel(property.propertyType)}`,
      `🛏️ ${property.bedrooms} ${property.bedrooms === 1 ? 'habitación' : 'habitaciones'}`,
      `🚿 ${property.bathrooms} ${property.bathrooms === 1 ? 'baño' : 'baños'}`,
      `📐 ${property.areaSqm} m²`,
    ];
    
    if (property.amenities?.length) {
      lines.push('', '✨ *Amenidades:*');
      property.amenities.slice(0, 5).forEach(amenity => {
        lines.push(`• ${amenity}`);
      });
    }
    
    if (user) {
      lines.push(
        '',
        '*Mi información:*',
        `👤 ${user.name}`,
        `📱 ${user.phone}`,
        `📧 ${user.email}`
      );
      
      if (user.moveDate) {
        lines.push(`📅 Fecha de mudanza: ${this.formatDate(user.moveDate)}`);
      }
      
      if (user.budget) {
        lines.push(`💵 Presupuesto: L.${user.budget.min}-${user.budget.max}`);
      }
    }
    
    lines.push(
      '',
      '¿Podríamos coordinar una visita?',
      '',
      `🔗 Ver más: ${this.getPropertyUrl(property.id)}`,
      `📌 Ref: ${property.id.slice(0, 8)}`
    );
    
    return lines.join('\n');
  }
  
  // Generate WhatsApp deep link
  generateWhatsAppLink(
    phoneNumber: string,
    message: string
  ): string {
    // Format Honduras phone number
    const formattedPhone = this.formatHondurasPhone(phoneNumber);
    const encodedMessage = encodeURIComponent(message);
    
    return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
  }
  
  private formatHondurasPhone(phone: string): string {
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Add country code if not present
    if (!cleaned.startsWith('504')) {
      return `504${cleaned}`;
    }
    
    return cleaned;
  }
  
  private getPropertyTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      apartment: 'Apartamento',
      house: 'Casa',
      room: 'Habitación',
      office: 'Oficina',
    };
    return labels[type] || type;
  }
  
  private formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('es-HN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }
  
  private getPropertyUrl(propertyId: string): string {
    return `${process.env.NEXT_PUBLIC_APP_URL}/propiedades/${propertyId}`;
  }
}
```

---

## 10. Testing Strategy

### 10.1 Component Tests
```typescript
// __tests__/property-discovery.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PropertyDiscoveryContainer } from '@/components/property-discovery';

describe('PropertyDiscoveryContainer', () => {
  it('should render split view by default on desktop', () => {
    render(<PropertyDiscoveryContainer />);
    
    expect(screen.getByTestId('property-cards-panel')).toBeInTheDocument();
    expect(screen.getByTestId('map-panel')).toBeInTheDocument();
  });
  
  it('should sync hover state between cards and map', async () => {
    const { getByTestId } = render(<PropertyDiscoveryContainer />);
    
    const propertyCard = getByTestId('property-card-1');
    fireEvent.mouseEnter(propertyCard);
    
    await waitFor(() => {
      const mapMarker = getByTestId('map-marker-1');
      expect(mapMarker).toHaveClass('highlighted');
    });
  });
  
  it('should open modal on property click', async () => {
    const { getByTestId } = render(<PropertyDiscoveryContainer />);
    
    const propertyCard = getByTestId('property-card-1');
    fireEvent.click(propertyCard);
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Contactar por WhatsApp')).toBeInTheDocument();
    });
  });
  
  it('should load more properties on scroll', async () => {
    const { container } = render(<PropertyDiscoveryContainer />);
    
    const scrollContainer = container.querySelector('.property-cards-panel');
    
    // Simulate scroll to bottom
    fireEvent.scroll(scrollContainer!, { 
      target: { scrollTop: 1000 } 
    });
    
    await waitFor(() => {
      expect(screen.getAllByTestId(/property-card/)).toHaveLength(48); // 2 pages
    });
  });
});
```

### 10.2 Integration Tests
```typescript
// __tests__/integration/property-search.test.ts
import { createMockRouter } from '@/test-utils/mock-router';

describe('Property Search Integration', () => {
  it('should search properties with filters', async () => {
    const router = createMockRouter();
    
    // Apply filters
    await user.selectOptions(screen.getByLabelText('Habitaciones'), '2');
    await user.type(screen.getByLabelText('Precio máximo'), '15000');
    await user.click(screen.getByText('Aplicar filtros'));
    
    // Verify API call
    await waitFor(() => {
      expect(mockApi.property.search).toHaveBeenCalledWith({
        bedrooms: [2],
        priceMax: 15000,
      });
    });
    
    // Verify URL update
    expect(router.replace).toHaveBeenCalledWith(
      '/propiedades?habitaciones=2&precio_max=15000'
    );
  });
});
```

---

## 11. Deployment Configuration

### 11.1 Environment Variables
```bash
# .env.production
NEXT_PUBLIC_APP_URL=https://heurekka.com
NEXT_PUBLIC_API_URL=https://api.heurekka.com
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_MAPBOX_TOKEN=your-mapbox-token
NEXT_PUBLIC_CDN_URL=https://cdn.heurekka.com

# Server-only
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
ELASTICSEARCH_URL=https://...
WHATSAPP_API_KEY=your-api-key
WHATSAPP_PHONE_ID=your-phone-id
```

### 11.2 Performance Monitoring
```typescript
// lib/monitoring.ts
export function trackPropertyDiscoveryMetrics() {
  // Core Web Vitals
  if (typeof window !== 'undefined') {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(sendToAnalytics);
      getFID(sendToAnalytics);
      getFCP(sendToAnalytics);
      getLCP(sendToAnalytics);
      getTTFB(sendToAnalytics);
    });
  }
  
  // Custom metrics
  performance.mark('property-discovery-start');
  
  // Track search performance
  const searchObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.name.includes('property-search')) {
        sendToAnalytics({
          name: 'property-search-duration',
          value: entry.duration,
        });
      }
    }
  });
  
  searchObserver.observe({ entryTypes: ['measure'] });
}
```

---

## Implementation Checklist

### Phase 1: Foundation (Week 1)
- [ ] Set up Next.js 14 app directory structure
- [ ] Configure tRPC with property router
- [ ] Create Supabase database schema with PostGIS
- [ ] Set up Redis for caching
- [ ] Implement basic property search API

### Phase 2: Core Features (Week 2)
- [ ] Build split-view layout components
- [ ] Implement property cards with virtual scrolling
- [ ] Integrate Mapbox with clustering
- [ ] Create property detail modal
- [ ] Add filter bar with dropdowns

### Phase 3: Advanced Features (Week 3)
- [ ] Implement real-time map-card synchronization
- [ ] Add infinite scroll with pagination
- [ ] Create autocomplete search
- [ ] Build advanced filters modal
- [ ] Add favorites functionality

### Phase 4: Optimization (Week 4)
- [ ] Optimize image loading with CDN
- [ ] Implement Redis caching strategy
- [ ] Add performance monitoring
- [ ] Mobile responsiveness testing
- [ ] WhatsApp message formatting

### Phase 5: Testing & Launch
- [ ] Unit tests (>80% coverage)
- [ ] Integration tests
- [ ] E2E tests with Playwright
- [ ] Performance testing (3G network)
- [ ] Security review
- [ ] Production deployment

---

## Performance Targets

### Core Web Vitals
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1
- **TTFB (Time to First Byte)**: < 600ms

### Custom Metrics
- **Initial Property Load**: < 2s
- **Filter Application**: < 500ms
- **Map Clustering**: < 200ms for 10,000 properties
- **Image Load**: < 1s per image
- **Search Autocomplete**: < 300ms

### Mobile Performance (3G)
- **Initial Load**: < 3s
- **Interactive Time**: < 5s
- **Data Usage**: < 2MB per session

---

*This technical specification provides the complete blueprint for implementing the Property Discovery feature. All implementation should follow these patterns and integrate with the existing HEUREKKA architecture.*

## Document Version
- **Version**: 1.0.0
- **Date**: December 2024
- **Status**: Ready for Implementation
- **Review**: Required before development start