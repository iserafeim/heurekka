// Property Discovery Types

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

export interface PropertyImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
  order: number;
  width?: number;
  height?: number;
}

export interface PropertyLandlord {
  id: string;
  name: string;
  phone: string;
  rating: number;
  verified: boolean;
  responseRate?: number;
  photo?: string;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  type: 'apartment' | 'house' | 'room' | 'office';
  address: string;
  neighborhood: string;
  coordinates: Coordinates;
  price: {
    amount: number;
    currency: string;
    period: string;
  };
  bedrooms: number;
  bathrooms: number;
  areaSqm?: number;
  amenities: string[];
  images: PropertyImage[];
  
  // Additional details (for property detail view)
  floor?: number;
  totalFloors?: number;
  yearBuilt?: number;
  parkingSpaces?: number;
  utilitiesIncluded?: boolean;
  depositMonths?: number;
  minimumStayMonths?: number;
  maximumOccupants?: number;
  petsAllowed?: boolean;
  petRestrictions?: string;
  
  // Media
  videoTourUrl?: string;
  virtualTourUrl?: string;
  
  // Stats
  viewCount: number;
  favoriteCount: number;
  contactCount: number;
  
  // Contact
  contactPhone: string;
  landlord: PropertyLandlord;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  
  // Computed fields (for search results)
  distance?: number; // In kilometers
  relevanceScore?: number;
}

export interface SearchFilters {
  location?: string;
  bounds?: MapBounds;
  coordinates?: Coordinates;
  priceMin: number;
  priceMax: number;
  bedrooms: number[];
  propertyTypes: ('apartment' | 'house' | 'room' | 'office')[];
  amenities: string[];
  sortBy: 'relevancia' | 'precio_asc' | 'precio_desc' | 'reciente' | 'distance';
  radiusKm?: number;
  cursor?: string;
  limit: number;
}

export interface SearchResults {
  properties: Property[];
  total: number;
  facets: SearchFacets;
  nextCursor: string | null;
}

export interface SearchFacets {
  neighborhoods: Array<{
    name: string;
    count: number;
  }>;
  priceRanges: Array<{
    range: string;
    count: number;
  }>;
  propertyTypes: Array<{
    type: string;
    count: number;
  }>;
  amenities: Array<{
    name: string;
    count: number;
  }>;
}

export interface PropertyCluster {
  id: number;
  coordinates: Coordinates;
  count: number;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  propertyIds: string[];
}

export interface AutocompleteSuggestion {
  id: string;
  text: string;
  type: 'location' | 'property' | 'filter';
  icon: string;
  subtitle?: string;
  metadata?: {
    propertyCount?: number;
    coordinates?: Coordinates;
    type?: string;
    filterType?: string;
    filterValue?: string;
  };
}

// Analytics and Tracking Types

export interface PropertyViewEvent {
  propertyId: string;
  source: 'lista' | 'mapa' | 'modal' | 'detalle';
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
}

export interface PropertyContactEvent {
  propertyId: string;
  source: 'modal' | 'detalle' | 'lista';
  contactMethod: 'whatsapp' | 'phone' | 'email';
  userId?: string;
  sessionId?: string;
  phoneNumber?: string;
  success: boolean;
  errorMessage?: string;
  ipAddress?: string;
  userAgent?: string;
}

// Cache-related types

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export interface CacheConfig {
  searchResults: number; // 5 minutes
  propertyDetail: number; // 1 hour  
  mapBounds: number; // 3 minutes
  autocomplete: number; // 24 hours
  facets: number; // 10 minutes
  clusters: number; // 5 minutes
}

// WhatsApp Integration Types

export interface WhatsAppMessage {
  to: string;
  template: string;
  language: string;
  parameters: WhatsAppMessageParameter[];
}

export interface WhatsAppMessageParameter {
  type: 'text' | 'currency' | 'date_time';
  text?: string;
  currency?: {
    fallback_value: string;
    code: string;
    amount_1000: number;
  };
  date_time?: {
    fallback_value: string;
  };
}

export interface WhatsAppContactInfo {
  propertyId: string;
  propertyTitle: string;
  propertyPrice: number;
  propertyAddress: string;
  propertyBedrooms: number;
  propertyBathrooms: number;
  propertyArea?: number;
  landlordPhone: string;
  userProfile?: {
    name?: string;
    phone?: string;
    email?: string;
    budget?: {
      min: number;
      max: number;
    };
    moveDate?: string;
    preferences?: string[];
  };
}

// Map clustering types

export interface ClusteringOptions {
  radius: number;
  maxZoom: number;
  minPoints: number;
  gridSize?: number;
}

export interface MapCluster {
  id: string;
  coordinates: Coordinates;
  properties: Property[];
  bounds: MapBounds;
  zoom: number;
}

// Error types

export interface PropertyServiceError extends Error {
  code: 'NOT_FOUND' | 'VALIDATION_ERROR' | 'DATABASE_ERROR' | 'CACHE_ERROR' | 'EXTERNAL_API_ERROR';
  details?: any;
}

// Utility types for API responses

export type ApiResponse<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
};

export type PaginatedResponse<T> = ApiResponse<{
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}>;

// Export all types for easy importing
export type {
  SearchFilters as PropertySearchFilters,
  SearchResults as PropertySearchResults,
  Property as PropertyData,
  PropertyCluster as MapPropertyCluster,
  AutocompleteSuggestion as PropertyAutocompleteSuggestion,
};