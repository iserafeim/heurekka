/**
 * Property Data Transformation Layer
 * Converts backend API responses to frontend-compatible property types
 */

import { Property, PropertyType, ListingStatus } from '@/types/property';

// Backend API response types (matching the actual tRPC response)
interface BackendProperty {
  id: string;
  title: string;
  description: string;
  type: string;
  address: {
    street?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  coordinates: {
    lat: number;
    lng: number;
  };
  price: {
    amount: number | string;
    currency: string;
    period: string;
  };
  size: {
    value: number | null;
    unit: string;
  };
  bedrooms: number;
  bathrooms: number | string;
  amenities: string[];
  images: Array<{
    id: string;
    url: string | null;
    thumbnailUrl: string | null;
    alt: string | null;
    width: number | null;
    height: number | null;
    order: number | null;
  }>;
  virtualTour?: string | null;
  video?: string | null;
  availableFrom: string;
  minimumStay?: number | null;
  maximumStay?: number | null;
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  saveCount: number;
  responseTime: number;
  verificationStatus: string;
  landlord: {
    id: string;
    name: string;
    photo?: string | null | undefined;
    rating: number | string;
    responseRate: number;
    whatsappEnabled: boolean;
  };
  featured?: boolean;
  featuredAt?: string | null;
}

/**
 * Normalize Spanish accents and special characters for address matching
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD') // Decompose accented characters
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritical marks
    .replace(/[ñ]/g, 'n') // Replace ñ with n
    .trim();
}

/**
 * Get coordinates from address for known Honduras locations
 */
function getCoordinatesFromProperty(backendProperty: BackendProperty): { lat: number; lng: number } {
  // If coordinates exist and are not (0,0), use them
  if (backendProperty.coordinates?.lat && backendProperty.coordinates?.lng &&
      backendProperty.coordinates.lat !== 0 && backendProperty.coordinates.lng !== 0) {
    return {
      lat: backendProperty.coordinates.lat,
      lng: backendProperty.coordinates.lng
    };
  }

  // Extract address components for lookup - avoid duplication
  const address = typeof backendProperty.address === 'string' ? backendProperty.address : '';

  // Only use neighborhood/city if address doesn't already contain them
  const neighborhood = typeof backendProperty.address === 'object' ? backendProperty.address?.neighborhood : backendProperty.neighborhood;
  const city = typeof backendProperty.address === 'object' ? backendProperty.address?.city : backendProperty.city;

  // Use address if it's complete, otherwise build from parts
  const fullAddress = address || [neighborhood, city].filter(Boolean).join(', ');
  const normalizedAddress = normalizeText(fullAddress);

  console.log('🔍 Coordinate lookup in transformer:', {
    original: fullAddress,
    normalized: normalizedAddress,
    backendCoords: backendProperty.coordinates
  });

  // Known coordinates for Honduras locations (normalized keys)
  const knownLocations: Record<string, { lat: number; lng: number }> = {
    // Tegucigalpa areas - multiple variations
    'boulevard morazan': { lat: 14.0910, lng: -87.2063 },
    'blvd morazan': { lat: 14.0910, lng: -87.2063 },
    'morazan': { lat: 14.0910, lng: -87.2063 },
    'san carlos': { lat: 14.0850, lng: -87.1950 },
    'colonia palmira': { lat: 14.0823, lng: -87.1921 },
    'palmira': { lat: 14.0823, lng: -87.1921 },
    'colonia tepeyac': { lat: 14.1056, lng: -87.1989 },
    'tepeyac': { lat: 14.1056, lng: -87.1989 },
    'centro historico': { lat: 14.0723, lng: -87.1921 },
    'comayaguela': { lat: 14.0610, lng: -87.1921 },
    'residencial las mercedes': { lat: 14.1100, lng: -87.1800 },
    'las mercedes': { lat: 14.1100, lng: -87.1800 },
    'colonia kennedy': { lat: 14.0950, lng: -87.1750 },
    'kennedy': { lat: 14.0950, lng: -87.1750 },

    // San Pedro Sula areas
    'barrio rio de piedras': { lat: 15.5077, lng: -88.0251 },
    'rio de piedras': { lat: 15.5077, lng: -88.0251 },
    'colonia trejo': { lat: 15.5200, lng: -88.0300 },
    'trejo': { lat: 15.5200, lng: -88.0300 },

    // General city fallbacks
    'tegucigalpa': { lat: 14.0723, lng: -87.1921 },
    'san pedro sula': { lat: 15.5041, lng: -88.0250 }
  };

  // Try to find a match for the specific address
  for (const [key, coords] of Object.entries(knownLocations)) {
    if (normalizedAddress.includes(key)) {
      console.log(`✅ Found address match! "${key}" -> coordinates:`, coords);
      return coords;
    }
  }

  // Default fallback to Tegucigalpa center
  console.warn(`❌ No coordinates found for address: "${fullAddress}" (normalized: "${normalizedAddress}"), using Tegucigalpa center`);
  return { lat: 14.0723, lng: -87.1921 };
}

/**
 * Transform backend property response to frontend Property type
 */
export function transformBackendProperty(backendProperty: BackendProperty): Property {
  // Convert property type
  const getPropertyType = (type: string): PropertyType => {
    switch (type.toLowerCase()) {
      case 'apartment':
        return PropertyType.APARTMENT;
      case 'house':
        return PropertyType.HOUSE;
      case 'room':
        return PropertyType.ROOM;
      case 'office':
      case 'commercial':
        return PropertyType.OFFICE;
      default:
        return PropertyType.APARTMENT;
    }
  };

  // Get primary image or placeholder
  const getPrimaryImage = (images: BackendProperty['images']): string => {
    const primaryImage = images.find(img => img.url !== null)?.url;
    return primaryImage || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80';
  };

  // Transform images array
  const transformImages = (images: BackendProperty['images']): string[] => {
    console.log('🖼️ Raw images from backend:', images);

    const validImages = images
      .filter(img => img.url !== null)
      .map(img => img.url as string);

    console.log('🖼️ Valid images after filtering:', validImages);

    // If no images, provide a placeholder
    if (validImages.length === 0) {
      console.log('🖼️ No valid images found, using placeholder');
      return ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'];
    }

    return validImages;
  };

  // Calculate days on market
  const getDaysOnMarket = (createdAt: string): number => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Build address string - handle both object and string formats
  const buildAddressString = (address: BackendProperty['address'] | string): string => {
    // If address is already a string, use it directly
    if (typeof address === 'string') {
      return address || 'Dirección no disponible';
    }

    // If address is an object, build from parts
    const parts = [];
    if (address?.street) parts.push(address.street);
    if (address?.neighborhood) parts.push(address.neighborhood);
    if (address?.city) parts.push(address.city);
    return parts.join(', ') || 'Dirección no disponible';
  };

  return {
    id: backendProperty.id,
    address: buildAddressString(backendProperty.address),
    neighborhood: (typeof backendProperty.address === 'object' ? backendProperty.address?.neighborhood : backendProperty.neighborhood) || 'Sin especificar',
    city: (typeof backendProperty.address === 'object' ? backendProperty.address?.city : backendProperty.city) || 'Tegucigalpa',
    price: typeof backendProperty.price.amount === 'string'
      ? parseFloat(backendProperty.price.amount)
      : backendProperty.price.amount,
    bedrooms: backendProperty.bedrooms,
    bathrooms: typeof backendProperty.bathrooms === 'string'
      ? parseFloat(backendProperty.bathrooms)
      : backendProperty.bathrooms,
    area: backendProperty.area_sqm || backendProperty.areaSqm || backendProperty.area || backendProperty.size?.value || 0,
    propertyType: getPropertyType(backendProperty.type),
    images: transformImages(backendProperty.images),
    description: backendProperty.description,
    amenities: backendProperty.amenities.map(amenity =>
      // Transform amenity keys to Spanish display names
      amenity.replace(/_/g, ' ').toLowerCase()
    ),
    coordinates: getCoordinatesFromProperty(backendProperty),
    landlord: {
      id: backendProperty.landlord.id,
      name: backendProperty.landlord.name,
      phone: backendProperty.landlord.whatsappEnabled ? '+504 9999-0000' : undefined // Will be available for authenticated users
    },
    listing: {
      listedDate: backendProperty.createdAt,
      status: ListingStatus.ACTIVE, // Backend uses 'available'/'active' - map to ACTIVE
      daysOnMarket: getDaysOnMarket(backendProperty.createdAt)
    },
    stats: {
      views: backendProperty.viewCount,
      favorites: backendProperty.saveCount,
      inquiries: Math.floor(backendProperty.viewCount * 0.1) // Estimate based on views
    },
    isFavorite: false, // Will be determined by favorites service
    isNew: getDaysOnMarket(backendProperty.createdAt) <= 7,
    isFeatured: backendProperty.featured || false
  };
}

/**
 * Transform array of backend properties to frontend properties
 */
export function transformBackendProperties(backendProperties: BackendProperty[]): Property[] {
  return backendProperties.map(transformBackendProperty);
}

/**
 * Transform frontend search filters to backend API format
 */
export function transformSearchFilters(frontendFilters: any) {
  const backendFilters = {
    query: frontendFilters.location || undefined,
    location: frontendFilters.coordinates ? {
      lat: frontendFilters.coordinates.lat,
      lng: frontendFilters.coordinates.lng,
      source: 'manual' as const,
      accuracy: 100
    } : undefined,
    filters: {
      priceMin: frontendFilters.priceMin,
      priceMax: frontendFilters.priceMax,
      bedrooms: frontendFilters.bedrooms,
      bathrooms: frontendFilters.bathrooms, // Added missing bathrooms filter
      propertyTypes: frontendFilters.propertyTypes?.map((type: PropertyType) => type.toLowerCase()),
      amenities: frontendFilters.amenities
    },
    page: 1,
    limit: frontendFilters.limit || 20,
    sortBy: transformSortOption(frontendFilters.sortBy)
  };

  console.log('🔄 Frontend filters:', JSON.stringify(frontendFilters, null, 2));
  console.log('🔄 Transformed to backend:', JSON.stringify(backendFilters, null, 2));
  console.log('🔄 Backend filters.bedrooms:', backendFilters.filters.bedrooms);
  console.log('🔄 Backend filters.bathrooms:', backendFilters.filters.bathrooms);

  return backendFilters;
}

/**
 * Transform frontend sort option to backend format
 */
function transformSortOption(frontendSort: string | undefined): string {
  if (!frontendSort) return 'relevance';

  switch (frontendSort) {
    case 'precio_asc':
      return 'price_asc';
    case 'precio_desc':
      return 'price_desc';
    case 'reciente':
      return 'date_desc';
    case 'distance':
      return 'distance';
    default:
      return 'relevance';
  }
}