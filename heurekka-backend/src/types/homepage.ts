// Homepage/Landing Page Types
// Types for property search, suggestions, and featured properties

export interface Property {
  id: string;
  title: string;
  description: string;
  type: 'apartment' | 'house' | 'room' | 'commercial';
  
  // Location
  address: {
    street: string;
    neighborhood: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  coordinates: {
    lat: number;
    lng: number;
  };
  
  // Details
  price: {
    amount: number;
    currency: 'HNL' | 'USD';
    period: 'month' | 'day' | 'week';
  };
  size: {
    value: number;
    unit: 'm2' | 'ft2';
  };
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  
  // Media
  images: PropertyImage[];
  virtualTour?: string;
  video?: string;
  
  // Availability
  availableFrom: Date;
  minimumStay?: number;
  maximumStay?: number;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  viewCount: number;
  saveCount: number;
  responseTime: number; // minutes
  verificationStatus: 'verified' | 'pending' | 'unverified';
  
  // Landlord
  landlord: {
    id: string;
    name: string;
    photo?: string;
    rating: number;
    responseRate: number;
    whatsappEnabled: boolean;
  };
}

export interface PropertyImage {
  id: string;
  url: string;
  thumbnailUrl: string;
  alt: string;
  width: number;
  height: number;
  order: number;
}

export interface SearchQuery {
  text: string;
  location?: Location;
  filters?: SearchFilters;
  timestamp: number;
}

export interface SearchFilters {
  priceMin?: number;
  priceMax?: number;
  propertyTypes?: string[];
  bedrooms?: number[];
  bathrooms?: number[];
  amenities?: string[];
  availableFrom?: Date;
  petFriendly?: boolean;
  furnished?: boolean;
  parking?: boolean;
}

export interface Location {
  lat: number;
  lng: number;
  accuracy?: number;
  source: 'gps' | 'ip' | 'manual';
}

export interface Suggestion {
  id: string;
  text: string;
  type: 'location' | 'property' | 'landmark' | 'recent';
  icon: string;
  metadata?: {
    propertyCount?: number;
    coordinates?: Location;
    popularityScore?: number;
    weight?: number;
  };
  score?: number;
}

export interface SearchProfile {
  id?: string;
  name: string;
  query: SearchQuery;
  notifications: {
    email: boolean;
    push: boolean;
    whatsapp: boolean;
    frequency: 'instant' | 'daily' | 'weekly';
  };
  createdAt?: Date;
  lastUsed?: Date;
}

export interface AnalyticsEvent {
  name: string;
  properties: Record<string, any>;
  timestamp: number;
  sessionId: string;
  userId?: string;
}

export interface SearchResults {
  properties: Property[];
  total: number;
  page: number;
  limit: number;
  facets: {
    neighborhoods: { name: string; count: number }[];
    priceRanges: { range: string; count: number }[];
    propertyTypes: { type: string; count: number }[];
  };
}

export interface HomepageData {
  featuredProperties: Property[];
  popularSearches: string[];
  recentListings: Property[];
  neighborhoods: { name: string; count: number }[];
  searchMetrics: {
    totalProperties: number;
    averageResponseTime: number;
    successfulMatches: number;
  };
}