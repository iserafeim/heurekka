import type { Property, SearchResults, HomepageData, Suggestion, Location } from '@/types/homepage';

export const mockLocation: Location = {
  lat: 14.0723,
  lng: -87.1921,
  accuracy: 100,
  source: 'gps'
};

export const mockTegucigalpaLocation: Location = {
  lat: 14.0723,
  lng: -87.1921,
  accuracy: 50,
  source: 'manual'
};

export const mockProperty: Property = {
  id: 'prop-123',
  title: 'Modern Apartment in Lomas del Guijarro',
  description: 'Beautiful 2-bedroom apartment with mountain views and modern amenities in the prestigious Lomas del Guijarro neighborhood.',
  type: 'apartment',
  address: {
    street: 'Calle Principal 123',
    neighborhood: 'Lomas del Guijarro',
    city: 'Tegucigalpa',
    state: 'Francisco Morazán',
    country: 'Honduras',
    postalCode: '11101'
  },
  coordinates: {
    lat: 14.0723,
    lng: -87.1921
  },
  price: {
    amount: 25000,
    currency: 'HNL',
    period: 'month'
  },
  size: {
    value: 120,
    unit: 'm2'
  },
  bedrooms: 2,
  bathrooms: 2,
  amenities: ['parking', 'security', 'gym', 'pool', 'wifi'],
  images: [
    {
      id: 'img-1',
      url: 'https://example.com/image1.jpg',
      thumbnailUrl: 'https://example.com/thumb1.jpg',
      alt: 'Living room view',
      width: 1200,
      height: 800,
      order: 1
    }
  ],
  virtualTour: 'https://example.com/tour',
  availableFrom: new Date('2024-10-01'),
  minimumStay: 6,
  maximumStay: 24,
  createdAt: new Date('2024-09-01'),
  updatedAt: new Date('2024-09-07'),
  viewCount: 45,
  saveCount: 8,
  responseTime: 30,
  verificationStatus: 'verified',
  landlord: {
    id: 'landlord-123',
    name: 'María González',
    photo: 'https://example.com/maria.jpg',
    rating: 4.8,
    responseRate: 95,
    whatsappEnabled: true
  }
};

export const mockProperties: Property[] = [
  mockProperty,
  {
    ...mockProperty,
    id: 'prop-456',
    title: 'Cozy House in Colonia Palmira',
    type: 'house',
    address: {
      ...mockProperty.address,
      neighborhood: 'Colonia Palmira',
      street: 'Avenida Los Próceres 456'
    },
    price: {
      amount: 35000,
      currency: 'HNL',
      period: 'month'
    },
    bedrooms: 3,
    bathrooms: 2,
    landlord: {
      ...mockProperty.landlord,
      id: 'landlord-456',
      name: 'Carlos Herrera'
    }
  },
  {
    ...mockProperty,
    id: 'prop-789',
    title: 'Studio Apartment Downtown',
    type: 'apartment',
    address: {
      ...mockProperty.address,
      neighborhood: 'Centro',
      street: 'Calle Peatonal 789'
    },
    price: {
      amount: 15000,
      currency: 'HNL',
      period: 'month'
    },
    bedrooms: 0,
    bathrooms: 1,
    size: {
      value: 45,
      unit: 'm2'
    }
  }
];

export const mockSearchResults: SearchResults = {
  properties: mockProperties,
  total: 150,
  page: 1,
  limit: 20,
  facets: {
    neighborhoods: [
      { name: 'Lomas del Guijarro', count: 45 },
      { name: 'Colonia Palmira', count: 32 },
      { name: 'Centro', count: 28 }
    ],
    priceRanges: [
      { range: '10000-20000', count: 40 },
      { range: '20000-30000', count: 60 },
      { range: '30000+', count: 50 }
    ],
    propertyTypes: [
      { type: 'apartment', count: 89 },
      { type: 'house', count: 45 },
      { type: 'room', count: 16 }
    ]
  }
};

export const mockSuggestions: Suggestion[] = [
  {
    id: 'suggestion-1',
    text: 'Lomas del Guijarro',
    type: 'location',
    icon: 'location',
    metadata: {
      propertyCount: 45,
      coordinates: mockTegucigalpaLocation,
      popularityScore: 0.9
    },
    score: 0.95
  },
  {
    id: 'suggestion-2',
    text: 'Modern Apartment in Lomas del Guijarro',
    type: 'property',
    icon: 'home',
    metadata: {
      propertyCount: 1,
      popularityScore: 0.8
    },
    score: 0.85
  },
  {
    id: 'suggestion-3',
    text: '2 bedroom apartment',
    type: 'recent',
    icon: 'history',
    metadata: {
      propertyCount: 25,
      popularityScore: 0.7
    },
    score: 0.75
  }
];

export const mockHomepageData: HomepageData = {
  featuredProperties: mockProperties.slice(0, 6),
  popularSearches: [
    'apartment tegucigalpa',
    'house colonia palmira',
    'furnished apartment',
    '2 bedroom apartment',
    'parking included'
  ],
  recentListings: mockProperties.slice(0, 8),
  neighborhoods: [
    { name: 'Lomas del Guijarro', count: 45 },
    { name: 'Colonia Palmira', count: 32 },
    { name: 'Centro', count: 28 },
    { name: 'Comayagüela', count: 22 }
  ],
  searchMetrics: {
    totalProperties: 1250,
    averageResponseTime: 25,
    successfulMatches: 892
  }
};

export const validSearchFilters = {
  priceMin: 10000,
  priceMax: 50000,
  propertyTypes: ['apartment' as const, 'house' as const],
  bedrooms: [2, 3],
  bathrooms: [1, 2],
  amenities: ['parking', 'security'],
  availableFrom: new Date('2024-10-01'),
  petFriendly: true,
  furnished: false,
  parking: true
};

export const validSearchQuery = {
  text: 'apartment in tegucigalpa',
  location: mockTegucigalpaLocation,
  filters: validSearchFilters,
  timestamp: Date.now()
};

export const validAnalyticsEvent = {
  name: 'property_view',
  properties: {
    propertyId: 'prop-123',
    propertyType: 'apartment',
    viewSource: 'search_results'
  },
  timestamp: Date.now(),
  sessionId: 'session-123',
  userId: 'user-456'
};

export const validSearchProfile = {
  name: 'My Dream Apartment',
  query: validSearchQuery,
  notifications: {
    email: true,
    push: false,
    whatsapp: true,
    frequency: 'daily' as const
  }
};