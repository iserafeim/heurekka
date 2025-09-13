/**
 * Property Discovery Types
 * Based on the backend tRPC property router schema
 */

// Core property types
export interface Property {
  id: string;
  address: string;
  neighborhood: string;
  city: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  propertyType: PropertyType;
  images: string[];
  description: string;
  amenities: string[];
  coordinates: {
    lat: number;
    lng: number;
  };
  contactPhone?: string; // Only available for authenticated users
  landlord: {
    id: string;
    name: string;
    phone?: string; // Only available for authenticated users
  };
  listing: {
    listedDate: string;
    status: ListingStatus;
    daysOnMarket: number;
  };
  stats: {
    views: number;
    favorites: number;
    inquiries: number;
  };
  isFavorite?: boolean;
  isNew?: boolean;
  isFeatured?: boolean;
}

export interface PropertyDetails extends Property {
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

// Search and filter types
export interface SearchFilters {
  location?: string;
  bounds?: MapBounds;
  coordinates?: Coordinates;
  priceMin: number;
  priceMax: number;
  bedrooms: number[];
  propertyTypes: PropertyType[];
  amenities: string[];
  sortBy: SortOption;
  radiusKm: number;
  cursor?: string;
  limit: number;
}

export interface SearchResponse {
  properties: Property[];
  total: number;
  hasMore: boolean;
  nextCursor?: string;
  facets?: SearchFacets;
}

export interface SearchFacets {
  neighborhoods: { name: string; count: number }[];
  priceRanges: { min: number; max: number; count: number }[];
  propertyTypes: { type: PropertyType; count: number }[];
  amenities: { name: string; count: number }[];
}

// Map types
export interface Coordinates {
  lat: number;
  lng: number;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface MapMarker {
  id: string;
  coordinates: Coordinates;
  price: number;
  propertyType: PropertyType;
  clusterId?: string;
}

export interface MapCluster {
  id: string;
  coordinates: Coordinates;
  count: number;
  bounds: MapBounds;
  avgPrice: number;
}

// Additional types
export interface FloorPlan {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
}

export interface TaxInformation {
  annualTax: number;
  lastAssessment: string;
  taxRate: number;
}

export interface HOAInformation {
  monthlyFee: number;
  amenities: string[];
  contact: string;
}

export interface School {
  id: string;
  name: string;
  type: 'elementary' | 'middle' | 'high';
  rating: number;
  distance: number;
}

export interface CrimeStats {
  safetyScore: number;
  crimeRate: number;
  lastUpdated: string;
}

export interface PriceHistory {
  date: string;
  price: number;
  event: 'listed' | 'price_change' | 'sold';
}

// Enums
export enum PropertyType {
  APARTMENT = 'apartment',
  HOUSE = 'house',
  ROOM = 'room',
  OFFICE = 'office'
}

export enum ListingStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  SOLD = 'sold',
  OFF_MARKET = 'off_market'
}

export enum SortOption {
  RELEVANCE = 'relevancia',
  PRICE_LOW = 'precio_asc',
  PRICE_HIGH = 'precio_desc',
  NEWEST = 'reciente',
  DISTANCE = 'distance'
}

export enum ViewMode {
  LIST = 'list',
  SPLIT = 'split',
  MAP = 'map'
}

// UI State types
export interface PropertyDiscoveryState {
  filters: SearchFilters;
  viewMode: ViewMode;
  splitRatio: { cards: number; map: number };
  hoveredPropertyId: string | null;
  selectedPropertyId: string | null;
  modalPropertyId: string | null;
  loading: boolean;
  error: string | null;
}

// Hook types
export interface UsePropertySearchResult {
  properties: Property[];
  total: number;
  hasMore: boolean;
  loading: boolean;
  error: string | null;
  search: (filters: SearchFilters) => Promise<void>;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

export interface UseFavoritesResult {
  favorites: Set<string>;
  toggleFavorite: (propertyId: string) => Promise<void>;
  isFavorite: (propertyId: string) => boolean;
  loading: boolean;
}

export interface UsePropertyModalResult {
  isOpen: boolean;
  propertyId: string | null;
  property: PropertyDetails | null;
  loading: boolean;
  error: string | null;
  openModal: (propertyId: string) => void;
  closeModal: () => void;
}

// Component props types
export interface PropertyCardProps {
  property: Property;
  isFavorite: boolean;
  onFavorite: (id: string) => void;
  onHover: (id: string | null) => void;
  onClick: (property: Property) => void;
  className?: string;
}

export interface MapPanelProps {
  properties: Property[];
  center?: Coordinates;
  zoom?: number;
  bounds?: MapBounds;
  hoveredPropertyId?: string | null;
  onMarkerClick: (property: Property) => void;
  onMarkerHover: (propertyId: string | null) => void;
  onBoundsChange: (bounds: MapBounds) => void;
  className?: string;
}

export interface FilterBarProps {
  filters: SearchFilters;
  onFiltersChange: (filters: Partial<SearchFilters>) => void;
  resultCount: number;
  loading?: boolean;
  facets?: SearchFacets;
  className?: string;
}

// Spanish interface text
export const SPANISH_TEXT = {
  search: {
    placeholder: 'Buscar vecindario, ciudad o código postal',
    button: 'Buscar',
    results: 'propiedades encontradas',
    noResults: 'No se encontraron propiedades',
    loading: 'Buscando propiedades...',
    error: 'Error al buscar propiedades'
  },
  filters: {
    price: 'Precio',
    bedrooms: 'Habitaciones',
    propertyType: 'Tipo de propiedad',
    amenities: 'Amenidades',
    sortBy: 'Ordenar por',
    moreFilters: 'Más filtros',
    clearFilters: 'Limpiar filtros',
    apply: 'Aplicar',
    cancel: 'Cancelar'
  },
  property: {
    bedrooms: 'habitaciones',
    bathrooms: 'baños',
    sqft: 'm²',
    listed: 'Publicado',
    favorite: 'Favorito',
    contact: 'Contactar',
    viewDetails: 'Ver detalles',
    whatsapp: 'Contactar por WhatsApp',
    phone: 'Llamar',
    email: 'Enviar email'
  },
  modal: {
    close: 'Cerrar',
    gallery: 'Galería',
    description: 'Descripción',
    amenities: 'Amenidades',
    location: 'Ubicación',
    contact: 'Contactar por WhatsApp',
    similarProperties: 'Propiedades similares'
  },
  map: {
    zoomIn: 'Acercar',
    zoomOut: 'Alejar',
    resetView: 'Restablecer vista',
    fullscreen: 'Pantalla completa',
    properties: 'propiedades'
  },
  views: {
    list: 'Lista',
    split: 'Dividida',
    map: 'Mapa'
  }
} as const;