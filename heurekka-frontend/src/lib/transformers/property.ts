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
    const validImages = images
      .filter(img => img.url !== null)
      .map(img => img.url as string);

    // If no images, provide a placeholder
    if (validImages.length === 0) {
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

  // Build address string
  const buildAddressString = (address: BackendProperty['address']): string => {
    const parts = [];
    if (address.street) parts.push(address.street);
    if (address.neighborhood) parts.push(address.neighborhood);
    if (address.city) parts.push(address.city);
    return parts.join(', ') || 'Dirección no disponible';
  };

  return {
    id: backendProperty.id,
    address: buildAddressString(backendProperty.address),
    neighborhood: backendProperty.address.neighborhood || 'Sin especificar',
    city: backendProperty.address.city || 'Tegucigalpa',
    price: typeof backendProperty.price.amount === 'string'
      ? parseFloat(backendProperty.price.amount)
      : backendProperty.price.amount,
    bedrooms: backendProperty.bedrooms,
    bathrooms: typeof backendProperty.bathrooms === 'string'
      ? parseFloat(backendProperty.bathrooms)
      : backendProperty.bathrooms,
    area: backendProperty.size.value || 0,
    propertyType: getPropertyType(backendProperty.type),
    images: transformImages(backendProperty.images),
    description: backendProperty.description,
    amenities: backendProperty.amenities.map(amenity =>
      // Transform amenity keys to Spanish display names
      amenity.replace(/_/g, ' ').toLowerCase()
    ),
    coordinates: {
      lat: backendProperty.coordinates.lat || 14.0723, // Default to Tegucigalpa center
      lng: backendProperty.coordinates.lng || -87.1921
    },
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
  return {
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
      propertyTypes: frontendFilters.propertyTypes?.map((type: PropertyType) => type.toLowerCase()),
      amenities: frontendFilters.amenities
    },
    page: 1,
    limit: frontendFilters.limit || 20,
    sortBy: transformSortOption(frontendFilters.sortBy)
  };
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