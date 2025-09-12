---
title: Property Discovery - Implementation Guide
description: Developer handoff documentation for implementing property discovery
feature: property-discovery
last-updated: 2025-01-04
version: 1.0.0
related-files: 
  - ./screen-states.md
  - ./interactions.md
  - ./accessibility.md
  - ../../design-system/style-guide.md
status: approved
---

# Property Discovery - Implementation Guide

## Overview
Complete technical implementation guide for developers building the property discovery feature, including search functionality, map integration, and performance optimization.

## Table of Contents
1. [Component Architecture](#component-architecture)
2. [State Management](#state-management)
3. [API Integration](#api-integration)
4. [Data Models](#data-models)
5. [Map Implementation](#map-implementation)
6. [Performance Optimization](#performance-optimization)
7. [Testing Strategy](#testing-strategy)
8. [Deployment Checklist](#deployment-checklist)

## Component Architecture

### Component Hierarchy
```typescript
// Main component structure with split-view architecture
PropertyDiscovery/
├── PropertySearch.tsx              // Main container with split view
├── components/
│   ├── Navigation/
│   │   ├── NavBar.tsx             // With integrated search
│   │   ├── SearchBar.tsx          // Spanish autocomplete
│   │   └── UserActions.tsx
│   ├── FilterBar/
│   │   ├── HorizontalFilters.tsx  // Horizontal filter bar
│   │   ├── PriceDropdown.tsx
│   │   ├── RoomsSelector.tsx
│   │   ├── PropertyTypeFilter.tsx
│   │   └── AdvancedFiltersModal.tsx
│   ├── SplitView/
│   │   ├── SplitContainer.tsx     // 70/30 layout manager
│   │   ├── PropertyCardsPanel.tsx // Left panel (70%)
│   │   ├── MapPanel.tsx           // Right panel (30%)
│   │   └── ViewToggle.tsx         // List/Split/Map toggle
│   ├── PropertyCard/
│   │   ├── PropertyCard.tsx        // Clickable card, no contact button
│   │   ├── PropertyImage.tsx
│   │   ├── PropertyActions.tsx     // Only favorite button
│   │   └── PropertyBadges.tsx
│   ├── MapComponents/
│   │   ├── MapInstance.tsx        // Mapbox GL wrapper
│   │   ├── PropertyMarker.tsx
│   │   ├── MarkerCluster.tsx
│   │   ├── PropertyTooltip.tsx    // Hover tooltip
│   │   └── MapControls.tsx
│   ├── PropertyModal/
│   │   ├── PropertyDetailModal.tsx  // Main modal component
│   │   ├── ModalGallery.tsx        // Photo gallery in modal
│   │   ├── ModalInfo.tsx           // Property details panel
│   │   ├── WhatsAppCTA.tsx         // Contact button in modal
│   │   └── ModalAnimations.tsx     // Animation controllers
│   └── Comparison/
│       ├── ComparisonBar.tsx
│       ├── ComparisonTable.tsx
│       └── ComparisonActions.tsx
├── hooks/
│   ├── usePropertySearch.ts
│   ├── useSplitViewSync.ts        // Sync cards and map
│   ├── useMapInteraction.ts
│   ├── useInfiniteScroll.ts
│   ├── useFavorites.ts
│   ├── usePropertyModal.ts        // Modal state management
│   ├── useWhatsAppContact.ts      // Contact from modal only
│   └── useViewToggle.ts
├── services/
│   ├── propertyAPI.ts
│   ├── geocodingService.ts
│   ├── imageService.ts
│   └── analyticsService.ts
└── utils/
    ├── formatters.ts
    ├── validators.ts
    ├── constants.ts
    └── helpers.ts
```

### Core Components Implementation

#### PropertySearch Component
```typescript
interface PropertySearchProps {
  initialFilters?: SearchFilters;
  onPropertySelect?: (property: Property) => void;
  viewMode?: 'list' | 'split' | 'map';  // Split view is default
  locale?: 'es' | 'en';  // Spanish primary
}

const PropertySearch: React.FC<PropertySearchProps> = ({
  initialFilters,
  onPropertySelect,
  viewMode = 'split',  // Default to split view
  locale = 'es'
}) => {
  const [filters, setFilters] = useState<SearchFilters>(
    initialFilters || defaultFilters
  );
  const [view, setView] = useState<ViewMode>(viewMode);
  const [splitRatio, setSplitRatio] = useState({ cards: 70, map: 30 });
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  
  // Custom hooks for split-view functionality
  const { search, results, error } = usePropertySearch(filters);
  const { favorites, toggleFavorite } = useFavorites();
  const { syncCardWithMap, syncMapWithCard } = useSplitViewSync();
  const { openModal, closeModal, modalState } = usePropertyModal();
  const { initiateWhatsApp } = useWhatsAppContact();
  const { currentView, transitionToView } = useViewToggle(view);
  
  // Infinite scroll
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
      fetchMoreProperties(page + 1);
    }
  }, [loading, hasMore, page]);
  
  useInfiniteScroll(loadMore, { threshold: 200 });
  
  // Search effect
  useEffect(() => {
    const searchProperties = async () => {
      setLoading(true);
      try {
        const results = await search(filters, page);
        if (page === 1) {
          setProperties(results);
        } else {
          setProperties(prev => [...prev, ...results]);
        }
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setLoading(false);
      }
    };
    
    searchProperties();
  }, [filters, page]);
  
  return (
    <div className="property-search">
      <NavBar>
        <SearchBar 
          onSearch={handleSearch}
          initialLocation={filters.location}
          placeholder="Buscar vecindario, ciudad o código postal"
          locale={locale}
        />
      </NavBar>
      
      <HorizontalFilterBar
        filters={filters}
        onChange={setFilters}
        resultCount={results.total}
        locale={locale}
      />
      
      <div className="split-view-container">
        {view === 'split' ? (
          <SplitContainer ratio={splitRatio}>
            <PropertyCardsPanel
              properties={properties}
              loading={loading}
              favorites={favorites}
              onFavorite={toggleFavorite}
              onPropertyHover={syncCardWithMap}
              onPropertyClick={openModal}  // Opens modal instead of navigation
              locale={locale}
            />
            <MapPanel
              properties={properties}
              center={mapCenter}
              onMarkerClick={syncMapWithCard}
              onBoundsChange={handleMapBoundsChange}
              onMarkerHover={showPropertyTooltip}
            />
          </SplitContainer>
        ) : view === 'list' ? (
          <FullListView
            properties={properties}
            loading={loading}
            onPropertyClick={onPropertySelect}
          />
        ) : (
          <FullMapView
            properties={properties}
            center={mapCenter}
            onMarkerClick={handlePropertyClick}
          />
        )}
        
        <ViewToggle
          currentView={view}
          onViewChange={transitionToView}
          position="top-right"
        />
        
        {loading && <LoadingIndicator />}
        {error && <ErrorMessage error={error} onRetry={retry} />}
      </div>
    </div>
  );
};
```

#### Property Detail Modal Component
```typescript
interface PropertyModalProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
  onWhatsApp: (property: Property) => void;
  locale: 'es' | 'en';
}

const PropertyDetailModal: React.FC<PropertyModalProps> = ({
  property,
  isOpen,
  onClose,
  onWhatsApp,
  locale = 'es'
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isGalleryFullscreen, setGalleryFullscreen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Focus trap for accessibility
  useFocusTrap(modalRef, isOpen);
  
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch(e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          navigateGallery(-1);
          break;
        case 'ArrowRight':
          navigateGallery(1);
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeImageIndex]);
  
  const navigateGallery = (direction: number) => {
    const newIndex = activeImageIndex + direction;
    if (newIndex >= 0 && newIndex < property.images.length) {
      setActiveImageIndex(newIndex);
    }
  };
  
  const handleWhatsAppClick = () => {
    // Track conversion with full context
    trackEvent('whatsapp_contact_from_modal', {
      property_id: property.id,
      price: property.price,
      location: property.neighborhood,
      time_in_modal: getTimeInModal(),
      images_viewed: activeImageIndex + 1
    });
    
    // Generate rich WhatsApp message
    const message = locale === 'es' 
      ? `Hola! Vi esta propiedad en Heurekka:
        
        📍 ${property.address}
        💰 L.${property.price}/mes
        🏠 ${property.type}
        🛏️ ${property.bedrooms} habitaciones
        🚿 ${property.bathrooms} baños
        📐 ${property.area} m²
        
        ¿Podría darme más información?`
      : `Hi! I saw this property on Heurekka...`;
    
    window.open(
      `https://wa.me/${property.contactPhone}?text=${encodeURIComponent(message)}`,
      '_blank'
    );
  };
  
  if (!isOpen) return null;
  
  return (
    <div 
      className="property-modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="property-detail-modal" ref={modalRef}>
        <div className="modal-header">
          <h2 id="modal-title">{property.address}</h2>
          <button 
            className="modal-close"
            onClick={onClose}
            aria-label={locale === 'es' ? 'Cerrar' : 'Close'}
          >
            <CloseIcon />
          </button>
        </div>
        
        <div className="modal-body">
          {/* Gallery Section */}
          <section className="modal-gallery">
            <div className="gallery-main">
              <img 
                src={property.images[activeImageIndex]}
                alt={`${property.type} - Image ${activeImageIndex + 1}`}
              />
              
              <div className="gallery-nav">
                <button 
                  onClick={() => navigateGallery(-1)}
                  disabled={activeImageIndex === 0}
                  aria-label={locale === 'es' ? 'Imagen anterior' : 'Previous image'}
                >
                  <ChevronLeftIcon />
                </button>
                <button 
                  onClick={() => navigateGallery(1)}
                  disabled={activeImageIndex === property.images.length - 1}
                  aria-label={locale === 'es' ? 'Siguiente imagen' : 'Next image'}
                >
                  <ChevronRightIcon />
                </button>
              </div>
              
              <div className="image-counter">
                {activeImageIndex + 1} / {property.images.length}
              </div>
            </div>
            
            <div className="gallery-thumbnails">
              {property.images.map((image, index) => (
                <button
                  key={index}
                  className={`gallery-thumbnail ${index === activeImageIndex ? 'active' : ''}`}
                  onClick={() => setActiveImageIndex(index)}
                  aria-label={`View image ${index + 1}`}
                >
                  <img src={image} alt="" />
                </button>
              ))}
            </div>
          </section>
          
          {/* Information Section */}
          <section className="modal-info">
            <div className="modal-info-content">
              <div className="property-price-block">
                <p className="modal-price">L.{property.price}/mes</p>
                <p className="modal-type">{property.type}</p>
                <p className="modal-location">
                  <LocationIcon /> {property.neighborhood}, {property.city}
                </p>
              </div>
              
              <div className="property-specs-grid">
                <div className="spec-block">
                  <span className="spec-value">{property.bedrooms}</span>
                  <span className="spec-label">
                    {locale === 'es' ? 'Habitaciones' : 'Bedrooms'}
                  </span>
                </div>
                <div className="spec-block">
                  <span className="spec-value">{property.bathrooms}</span>
                  <span className="spec-label">
                    {locale === 'es' ? 'Baños' : 'Bathrooms'}
                  </span>
                </div>
                <div className="spec-block">
                  <span className="spec-value">{property.area}</span>
                  <span className="spec-label">m²</span>
                </div>
              </div>
              
              <div className="amenities-section">
                <h3 className="section-title">
                  {locale === 'es' ? 'Amenidades' : 'Amenities'}
                </h3>
                <div className="amenities-list">
                  {property.amenities.map((amenity, index) => (
                    <div key={index} className="amenity-item">
                      <CheckIcon className="amenity-icon" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="description-section">
                <h3 className="section-title">
                  {locale === 'es' ? 'Descripción' : 'Description'}
                </h3>
                <p className="description-text">{property.description}</p>
              </div>
              
              <div className="location-section">
                <h3 className="section-title">
                  {locale === 'es' ? 'Ubicación' : 'Location'}
                </h3>
                <div className="mini-map">
                  <MiniMap 
                    lat={property.coordinates.lat}
                    lng={property.coordinates.lng}
                    marker={true}
                  />
                </div>
              </div>
            </div>
            
            {/* WhatsApp CTA */}
            <div className="modal-contact-section">
              <button 
                className="whatsapp-cta-button"
                onClick={handleWhatsAppClick}
              >
                <WhatsAppIcon className="whatsapp-icon" />
                <span>
                  {locale === 'es' 
                    ? 'Contactar por WhatsApp' 
                    : 'Contact via WhatsApp'}
                </span>
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
```

#### Enhanced PropertyCard Component (No Contact Button)
```typescript
interface PropertyCardProps {
  property: Property;
  isFavorite: boolean;
  onFavorite: (id: string) => void;
  onHover: (id: string | null) => void;  // Sync with map
  onClick: (property: Property) => void;  // Opens modal
  locale: 'es' | 'en';
}

const PropertyCard: React.FC<PropertyCardProps> = memo(({
  property,
  isFavorite,
  onFavorite,
  onHover,
  onWhatsApp,
  onClick,
  locale
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);
  
  // Intersection observer for lazy loading
  const cardRef = useRef<HTMLDivElement>(null);
  const isVisible = useIntersectionObserver(cardRef, { threshold: 0.1 });
  
  return (
    <article 
      ref={cardRef}
      className="property-card"
      onClick={() => onClick(property)}
      onMouseEnter={() => onHover(property.id)}
      onMouseLeave={() => onHover(null)}
      role="article"
      aria-label={`Propiedad: ${property.address}`}
      data-property-id={property.id}
    >
      <div className="property-image-container">
        {isVisible && (
          <PropertyImage
            src={property.images[0]}
            alt={property.description}
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
          />
        )}
        
        {!imageLoaded && <ImageSkeleton />}
        
        <div className="property-badges">
          {property.isNew && (
            <span className="badge badge-new">
              {locale === 'es' ? 'Nuevo' : 'New'}
            </span>
          )}
          {property.isFeatured && (
            <span className="badge badge-featured">
              {locale === 'es' ? 'Destacado' : 'Featured'}
            </span>
          )}
        </div>
        
        <div className="property-actions">
          <button
            className={`favorite-button ${isFavorite ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onFavorite(property.id);
            }}
            aria-label={`${isFavorite ? 'Remove from' : 'Add to'} favorites`}
          >
            <HeartIcon filled={isFavorite} />
          </button>
          {/* No quick view - entire card is clickable for modal */}
        </div>
      </div>
      
      <div className="property-details">
        <h3 className="property-price">
          {formatCurrency(property.price)}
        </h3>
        
        <address className="property-address">
          {property.address}
        </address>
        
        <div className="property-specs">
          <span className="spec">
            <BedIcon /> {property.bedrooms} {locale === 'es' ? 'hab' : 'beds'}
          </span>
          <span className="spec">
            <BathIcon /> {property.bathrooms} {locale === 'es' ? 'baños' : 'baths'}
          </span>
          <span className="spec">
            <AreaIcon /> {property.sqft} m²
          </span>
        </div>
        
        {/* No contact button - moved to modal */}
        <div className="property-footer">
          <span className="listing-date">
            {locale === 'es' ? 'Publicado' : 'Listed'} {formatRelativeTime(property.listedDate, locale)}
          </span>
          <span className="click-hint">
            {locale === 'es' ? 'Click para ver detalles' : 'Click for details'}
          </span>
        </div>
      </div>
    </article>
  );
});
```

## State Management

### Global State Structure
```typescript
// Redux/Context state structure for split-view
interface AppState {
  search: {
    filters: SearchFilters;
    results: {
      properties: Property[];
      total: number;
      page: number;
      hasMore: boolean;
    };
    loading: boolean;
    error: string | null;
    viewMode: 'list' | 'split' | 'map';  // Split is default
  };
  splitView: {
    hoveredCardId: string | null;
    hoveredMarkerId: string | null;
    syncEnabled: boolean;
    ratio: { cards: number; map: number };
  };
  map: {
    center: LatLng;
    zoom: number;
    bounds: MapBounds;
    markers: MapMarker[];
    selectedMarker: string | null;
    hoveredMarker: string | null;  // For tooltip display
    clusteringEnabled: boolean;
    visibleProperties: string[];  // IDs visible in current bounds
  };
  user: {
    id: string;
    favorites: string[];
    savedSearches: SavedSearch[];
    viewedProperties: string[];
  };
  comparison: {
    properties: Property[];
    isOpen: boolean;
  };
}

// Actions
const searchActions = {
  SET_FILTERS: 'search/setFilters',
  SET_RESULTS: 'search/setResults',
  APPEND_RESULTS: 'search/appendResults',
  SET_LOADING: 'search/setLoading',
  SET_ERROR: 'search/setError',
  SET_VIEW_MODE: 'search/setViewMode',
  CLEAR_SEARCH: 'search/clear'
};

const splitViewActions = {
  SYNC_CARD_HOVER: 'splitView/syncCardHover',
  SYNC_MAP_HOVER: 'splitView/syncMapHover',
  UPDATE_RATIO: 'splitView/updateRatio',
  TOGGLE_SYNC: 'splitView/toggleSync'
};
```

### Local Component State
```typescript
// Search filters state management
const useSearchFilters = (initialFilters?: Partial<SearchFilters>) => {
  const [filters, setFilters] = useState<SearchFilters>({
    location: '',
    priceMin: 0,
    priceMax: 0,
    propertyTypes: [],
    bedrooms: { min: 0, max: null },
    bathrooms: { min: 0, max: null },
    sqftMin: 0,
    sqftMax: 0,
    amenities: [],
    keywords: '',
    sortBy: 'relevance',
    ...initialFilters
  });
  
  const updateFilter = useCallback(<K extends keyof SearchFilters>(
    key: K,
    value: SearchFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);
  
  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);
  
  const applyFilters = useCallback(() => {
    // Trigger search with current filters
    searchProperties(filters);
  }, [filters]);
  
  return {
    filters,
    updateFilter,
    resetFilters,
    applyFilters
  };
};
```

## API Integration

### Property Search API
```typescript
class PropertyAPI {
  private baseURL = process.env.REACT_APP_API_URL;
  private locale: 'es' | 'en' = 'es';  // Spanish primary
  
  // Search properties with Spanish support
  async searchProperties(
    filters: SearchFilters,
    page = 1,
    limit = 24,
    locale = 'es'
  ): Promise<SearchResponse> {
    const params = this.buildSearchParams(filters, page, limit);
    
    const response = await fetch(`${this.baseURL}/properties/search?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    
    if (!response.ok) {
      throw new APIError(response.status, await response.text());
    }
    
    return response.json();
  }
  
  // Get property details
  async getProperty(id: string): Promise<PropertyDetails> {
    const response = await fetch(`${this.baseURL}/properties/${id}`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    
    return response.json();
  }
  
  // Geocoding service with Honduras focus
  async geocodeAddress(address: string): Promise<GeocodingResult> {
    const response = await fetch(`${this.baseURL}/geocode`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept-Language': 'es-HN'  // Honduras Spanish
      },
      body: JSON.stringify({ 
        address,
        country: 'HN',  // Honduras
        locale: 'es'
      })
    });
    
    return response.json();
  }
  
  // Get properties within bounds
  async getPropertiesInBounds(bounds: MapBounds): Promise<Property[]> {
    const response = await fetch(`${this.baseURL}/properties/bounds`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bounds)
    });
    
    return response.json();
  }
  
  // Toggle favorite
  async toggleFavorite(propertyId: string): Promise<void> {
    await fetch(`${this.baseURL}/favorites/${propertyId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
  }
  
  private buildSearchParams(
    filters: SearchFilters,
    page: number,
    limit: number
  ): URLSearchParams {
    const params = new URLSearchParams();
    
    if (filters.location) params.append('location', filters.location);
    if (filters.priceMin) params.append('priceMin', String(filters.priceMin));
    if (filters.priceMax) params.append('priceMax', String(filters.priceMax));
    if (filters.propertyTypes.length) {
      params.append('types', filters.propertyTypes.join(','));
    }
    
    params.append('page', String(page));
    params.append('limit', String(limit));
    params.append('sort', filters.sortBy);
    
    return params;
  }
}
```

## Data Models

### TypeScript Interfaces
```typescript
// Core data models
interface Property {
  id: string;
  address: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  lotSize: number;
  yearBuilt: number;
  propertyType: PropertyType;
  images: string[];
  description: string;
  features: string[];
  location: {
    lat: number;
    lng: number;
    neighborhood: string;
    city: string;
    department: string;  // Honduras uses departments
    zipCode: string;
    country: 'HN';
  };
  contact: {
    phone: string;
    whatsapp: string;  // WhatsApp number
    preferredContact: 'whatsapp' | 'phone' | 'email';
  };
  listing: {
    agent: Agent;
    agency: Agency;
    listedDate: Date;
    status: ListingStatus;
    daysOnMarket: number;
  };
  stats: {
    views: number;
    favorites: number;
    inquiries: number;
  };
}

interface PropertyDetails extends Property {
  virtualTourUrl?: string;
  floorPlans: FloorPlan[];
  documents: Document[];
  taxInfo: TaxInformation;
  hoaInfo?: HOAInformation;
  schools: School[];
  walkScore: number;
  transitScore: number;
  crimeRate: CrimeStats;
  priceHistory: PriceHistory[];
  similarProperties: Property[];
}

interface SearchFilters {
  location: string;
  bounds?: MapBounds;
  priceMin: number;
  priceMax: number;
  propertyTypes: PropertyType[];
  bedrooms: RangeFilter;
  bathrooms: RangeFilter;
  sqftMin: number;
  sqftMax: number;
  lotSizeMin?: number;
  yearBuiltMin?: number;
  amenities: string[];
  keywords: string;
  sortBy: SortOption;
  includesSold?: boolean;
  openHouseOnly?: boolean;
  reducedPrice?: boolean;
  foreclosure?: boolean;
}

// Enums
enum PropertyType {
  SINGLE_FAMILY = 'single_family',
  CONDO = 'condo',
  TOWNHOUSE = 'townhouse',
  MULTI_FAMILY = 'multi_family',
  APARTMENT = 'apartment',
  LAND = 'land',
  COMMERCIAL = 'commercial'
}

enum ListingStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  SOLD = 'sold',
  OFF_MARKET = 'off_market'
}

enum SortOption {
  RELEVANCE = 'relevance',
  PRICE_LOW = 'price_asc',
  PRICE_HIGH = 'price_desc',
  NEWEST = 'date_desc',
  SQFT = 'sqft_desc',
  LOT_SIZE = 'lot_desc'
}
```

## Map Implementation

### Map Component
```typescript
import mapboxgl from 'mapbox-gl';

interface MapProps {
  properties: Property[];
  center?: LatLng;
  zoom?: number;
  onMarkerClick: (property: Property) => void;
  onBoundsChange: (bounds: MapBounds) => void;
}

const PropertyMap: React.FC<MapProps> = ({
  properties,
  center = { lat: 37.7749, lng: -122.4194 },
  zoom = 12,
  onMarkerClick,
  onBoundsChange
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  
  // Initialize map
  useEffect(() => {
    if (!map.current && mapContainer.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [center.lng, center.lat],
        zoom: zoom
      });
      
      // Add controls
      map.current.addControl(new mapboxgl.NavigationControl());
      map.current.addControl(new mapboxgl.GeolocateControl());
      
      // Add draw control for area selection
      const draw = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
          polygon: true,
          trash: true
        }
      });
      map.current.addControl(draw);
      
      // Listen for bounds change
      map.current.on('moveend', () => {
        if (map.current) {
          const bounds = map.current.getBounds();
          onBoundsChange({
            north: bounds.getNorth(),
            south: bounds.getSouth(),
            east: bounds.getEast(),
            west: bounds.getWest()
          });
        }
      });
    }
  }, []);
  
  // Update markers
  useEffect(() => {
    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];
    
    // Add new markers
    properties.forEach(property => {
      const el = createMarkerElement(property);
      
      const marker = new mapboxgl.Marker(el)
        .setLngLat([property.location.lng, property.location.lat])
        .setPopup(createPopup(property))
        .addTo(map.current!);
      
      el.addEventListener('click', () => onMarkerClick(property));
      
      markers.current.push(marker);
    });
    
    // Cluster markers if too many
    if (properties.length > 50) {
      setupClustering(map.current!, properties);
    }
  }, [properties]);
  
  const createMarkerElement = (property: Property): HTMLElement => {
    const el = document.createElement('div');
    el.className = 'map-marker';
    el.innerHTML = `
      <div class="marker-price">
        ${formatCurrency(property.price, true)}
      </div>
    `;
    return el;
  };
  
  const createPopup = (property: Property): mapboxgl.Popup => {
    return new mapboxgl.Popup({ offset: 25 }).setHTML(`
      <div class="map-popup">
        <img src="${property.images[0]}" alt="${property.address}" />
        <h3>${formatCurrency(property.price)}</h3>
        <p>${property.address}</p>
        <p>${property.bedrooms} bed • ${property.bathrooms} bath • ${property.sqft} sqft</p>
      </div>
    `);
  };
  
  return (
    <div className="map-container">
      <div ref={mapContainer} className="map-instance" />
      
      <div className="map-overlay">
        <MapLegend />
        <MapSearch onSearch={handleMapSearch} />
      </div>
    </div>
  );
};
```

## Performance Optimization

### Image Optimization
```typescript
// Progressive image loading
const ProgressiveImage: React.FC<{
  src: string;
  placeholder: string;
  alt: string;
}> = ({ src, placeholder, alt }) => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [imageRef, setImageRef] = useState<HTMLImageElement>();
  
  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setImageSrc(src);
      setImageRef(img);
    };
  }, [src]);
  
  return (
    <img
      src={imageSrc}
      alt={alt}
      loading="lazy"
      className={`progressive-image ${imageSrc === src ? 'loaded' : ''}`}
    />
  );
};

// Image service with caching
class ImageService {
  private cache = new Map<string, string>();
  
  async getOptimizedImage(
    url: string,
    width: number,
    quality = 80
  ): Promise<string> {
    const cacheKey = `${url}-${width}-${quality}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }
    
    const optimizedUrl = `${process.env.REACT_APP_IMAGE_CDN}/optimize?url=${encodeURIComponent(url)}&w=${width}&q=${quality}`;
    
    this.cache.set(cacheKey, optimizedUrl);
    return optimizedUrl;
  }
  
  preloadImages(urls: string[]): void {
    urls.forEach(url => {
      const img = new Image();
      img.src = url;
    });
  }
}
```

### Virtual Scrolling
```typescript
import { VariableSizeList } from 'react-window';

const VirtualPropertyList: React.FC<{
  properties: Property[];
}> = ({ properties }) => {
  const listRef = useRef<VariableSizeList>(null);
  
  const getItemSize = (index: number) => {
    // Calculate dynamic height based on content
    return 380; // Base card height
  };
  
  const Row = ({ index, style }: { index: number; style: any }) => (
    <div style={style}>
      <PropertyCard property={properties[index]} />
    </div>
  );
  
  return (
    <AutoSizer>
      {({ height, width }) => (
        <VariableSizeList
          ref={listRef}
          height={height}
          itemCount={properties.length}
          itemSize={getItemSize}
          width={width}
          overscanCount={3}
        >
          {Row}
        </VariableSizeList>
      )}
    </AutoSizer>
  );
};
```

### Search Debouncing
```typescript
// Debounced search hook
const useDebouncedSearch = (delay = 500) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [searchTerm, delay]);
  
  return { searchTerm, setSearchTerm, debouncedTerm };
};

// Usage in component
const SearchBar: React.FC = () => {
  const { searchTerm, setSearchTerm, debouncedTerm } = useDebouncedSearch();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  useEffect(() => {
    if (debouncedTerm) {
      fetchSuggestions(debouncedTerm).then(setSuggestions);
    }
  }, [debouncedTerm]);
  
  return (
    <input
      type="text"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Search by location..."
    />
  );
};
```

## Testing Strategy

### Unit Tests
```typescript
// Component testing
describe('PropertyCard', () => {
  it('should render property information correctly', () => {
    const property = mockProperty();
    const { getByText, getByAltText } = render(
      <PropertyCard property={property} />
    );
    
    expect(getByText(property.address)).toBeInTheDocument();
    expect(getByText(`$${property.price.toLocaleString()}`)).toBeInTheDocument();
    expect(getByAltText(property.description)).toBeInTheDocument();
  });
  
  it('should toggle favorite on click', async () => {
    const onFavorite = jest.fn();
    const { getByLabelText } = render(
      <PropertyCard 
        property={mockProperty()}
        onFavorite={onFavorite}
      />
    );
    
    const favoriteButton = getByLabelText(/add to favorites/i);
    fireEvent.click(favoriteButton);
    
    expect(onFavorite).toHaveBeenCalledWith(mockProperty().id);
  });
});

// Hook testing
describe('usePropertySearch', () => {
  it('should fetch properties with filters', async () => {
    const { result } = renderHook(() => usePropertySearch());
    
    act(() => {
      result.current.search({ location: 'San Francisco' });
    });
    
    await waitFor(() => {
      expect(result.current.results).toHaveLength(24);
      expect(result.current.loading).toBe(false);
    });
  });
});
```

### Integration Tests
```typescript
// API integration testing
describe('Property Search Integration', () => {
  it('should search and display properties', async () => {
    const { getByPlaceholderText, getByText, findAllByRole } = render(
      <PropertySearch />
    );
    
    const searchInput = getByPlaceholderText(/search by location/i);
    fireEvent.change(searchInput, { target: { value: 'San Francisco' } });
    
    const searchButton = getByText(/search/i);
    fireEvent.click(searchButton);
    
    const properties = await findAllByRole('article');
    expect(properties).toHaveLength(24);
  });
  
  it('should filter properties correctly', async () => {
    const { getByLabelText, findAllByRole } = render(<PropertySearch />);
    
    const minPrice = getByLabelText(/minimum price/i);
    fireEvent.change(minPrice, { target: { value: '500000' } });
    
    const applyButton = getByLabelText(/apply filters/i);
    fireEvent.click(applyButton);
    
    const properties = await findAllByRole('article');
    properties.forEach(property => {
      const price = parseInt(property.querySelector('.price')?.textContent || '0');
      expect(price).toBeGreaterThanOrEqual(500000);
    });
  });
});
```

### E2E Tests
```typescript
// Cypress E2E tests
describe('Property Discovery E2E', () => {
  it('should complete property search and view details', () => {
    cy.visit('/properties');
    
    // Search for properties
    cy.get('[data-testid="location-search"]').type('San Francisco');
    cy.get('[data-testid="search-button"]').click();
    
    // Apply filters
    cy.get('[data-testid="filter-button"]').click();
    cy.get('[data-testid="price-min"]').type('500000');
    cy.get('[data-testid="price-max"]').type('1000000');
    cy.get('[data-testid="property-type-condo"]').check();
    cy.get('[data-testid="apply-filters"]').click();
    
    // Verify results
    cy.get('[data-testid="property-card"]').should('have.length.at.least', 1);
    
    // View property details
    cy.get('[data-testid="property-card"]').first().click();
    cy.url().should('include', '/properties/');
    cy.get('[data-testid="property-title"]').should('be.visible');
    
    // Add to favorites
    cy.get('[data-testid="favorite-button"]').click();
    cy.get('[data-testid="favorite-button"]').should('have.class', 'active');
    
    // Contact agent
    cy.get('[data-testid="contact-form"]').within(() => {
      cy.get('input[name="name"]').type('John Doe');
      cy.get('input[name="email"]').type('john@example.com');
      cy.get('textarea[name="message"]').type('I am interested in this property');
      cy.get('button[type="submit"]').click();
    });
    
    // Verify success message
    cy.get('[data-testid="success-message"]').should('be.visible');
  });
});
```

## Deployment Checklist

### Pre-deployment
- [ ] All unit tests passing (>90% coverage)
- [ ] Integration tests passing
- [ ] E2E tests passing
- [ ] Performance metrics met
- [ ] Accessibility audit passed
- [ ] Security review completed
- [ ] API rate limiting configured
- [ ] Image CDN configured

### Performance Targets
- [ ] Initial load < 3s
- [ ] Time to Interactive < 5s
- [ ] First Contentful Paint < 1.5s
- [ ] Image optimization in place
- [ ] Lazy loading implemented
- [ ] Code splitting configured
- [ ] Service worker caching

### Monitoring Setup
- [ ] Error tracking (Sentry)
- [ ] Analytics (Google Analytics / Mixpanel)
- [ ] Performance monitoring (Web Vitals)
- [ ] API monitoring
- [ ] User session recording
- [ ] A/B testing framework

### Production Configuration
```javascript
// Environment variables
REACT_APP_API_URL=https://api.heurekka.com
REACT_APP_MAP_API_KEY=your_mapbox_key
REACT_APP_IMAGE_CDN=https://images.heurekka.com
REACT_APP_ANALYTICS_ID=UA-XXXXXXXXX
REACT_APP_SENTRY_DSN=https://sentry.io/dsn

// Performance budgets
{
  "bundles": [
    {
      "name": "main",
      "maxSize": "250kb"
    },
    {
      "name": "vendor",
      "maxSize": "400kb"
    }
  ],
  "metrics": {
    "FCP": 1500,
    "TTI": 5000,
    "CLS": 0.1
  }
}
```

## Related Documentation
- [User Journey](design-documentation/features/property-discovery/user-journey.md)
- [Screen States](design-documentation/features/property-discovery/screen-states.md)
- [Interactions](design-documentation/features/property-discovery/interactions.md)
- [Accessibility](design-documentation/features/property-discovery/accessibility.md)
- [Design System](design-documentation/design-system/style-guide.md)