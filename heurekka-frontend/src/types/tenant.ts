/**
 * Tenant Profile Type Definitions
 * Tipos y constantes para el perfil de inquilino
 */

// ============================================================================
// CORE TYPES
// ============================================================================

export interface TenantProfile {
  id: string;
  userId: string;
  personalInfo: PersonalInfo;
  searchPreferences: SearchPreferences;
  profileCompletion: ProfileCompletion;
  canContact: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PersonalInfo {
  fullName: string;
  phone: string;
  email?: string;
}

export interface SearchPreferences {
  budgetMin: number;
  budgetMax: number;
  moveInDate?: Date;
  preferredAreas: string[];
  propertyTypes: PropertyType[];
  bedrooms?: {
    min?: number;
    max?: number;
  };
  bathrooms?: {
    min?: number;
    max?: number;
  };
  amenities?: string[];
  occupants?: OccupantInfo;
  pets?: PetInfo;
}

export interface OccupantInfo {
  adults: number;
  children: number;
}

export interface PetInfo {
  hasPets: boolean;
  petType?: 'dog' | 'cat' | 'other';
  petCount?: number;
  petDetails?: string;
}

export interface ProfileCompletion {
  percentage: number;
  missingFields: string[];
  nextSteps: string[];
}

// ============================================================================
// SAVED SEARCHES
// ============================================================================

export interface SavedSearch {
  id: string;
  userId: string;
  name: string;
  criteria: SearchCriteria;
  isActive: boolean;
  notificationEnabled: boolean;
  matchCount?: number;
  newMatchCount?: number;
  lastExecutedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchCriteria {
  propertyTypes?: PropertyType[];
  locations?: string[];
  budgetMin?: number;
  budgetMax?: number;
  bedrooms?: {
    min?: number;
    max?: number;
  };
  bathrooms?: {
    min?: number;
    max?: number;
  };
  amenities?: string[];
}

// ============================================================================
// FAVORITES
// ============================================================================

export interface Favorite {
  id: string;
  userId: string;
  propertyId: string;
  property?: FavoriteProperty;
  isContacted: boolean;
  notes?: string;
  createdAt: Date;
}

export interface FavoriteProperty {
  id: string;
  title: string;
  description?: string;
  price: number;
  location: string;
  propertyType: PropertyType;
  bedrooms?: number;
  bathrooms?: number;
  images?: string[];
  isAvailable: boolean;
}

// ============================================================================
// DASHBOARD DATA
// ============================================================================

export interface TenantDashboard {
  profile: TenantProfile;
  stats: DashboardStats;
  savedSearches: SavedSearch[];
  favorites: Favorite[];
  conversations: ConversationSummary[];
  recentlyViewed: FavoriteProperty[];
}

export interface DashboardStats {
  savedSearchesCount: number;
  favoritesCount: number;
  conversationsCount: number;
  newMatches: number;
}

export interface ConversationSummary {
  id: string;
  propertyId: string;
  propertyTitle: string;
  landlordName: string;
  lastMessageAt: Date;
  unreadCount: number;
  status: 'active' | 'archived';
}

// ============================================================================
// FORM DATA TYPES
// ============================================================================

export interface ProfileCompletionFormData {
  step: 1 | 2 | 3;
  personalInfo?: {
    fullName: string;
    phone: string;
  };
  searchPreferences?: {
    budgetMin: number;
    budgetMax: number;
    moveInDate?: string;
    preferredAreas: string[];
    propertyTypes: PropertyType[];
  };
  optionalInfo?: {
    bedrooms?: {
      min?: number;
      max?: number;
    };
    bathrooms?: {
      min?: number;
      max?: number;
    };
    occupants?: OccupantInfo;
    pets?: PetInfo;
  };
}

export interface SavedSearchFormData {
  name: string;
  propertyTypes: PropertyType[];
  locations: string[];
  budgetMin: number;
  budgetMax: number;
  bedrooms?: {
    min?: number;
    max?: number;
  };
  bathrooms?: {
    min?: number;
    max?: number;
  };
  amenities?: string[];
  notificationEnabled: boolean;
}

// ============================================================================
// ENUMS AND CONSTANTS
// ============================================================================

export type PropertyType =
  | 'apartment'
  | 'house'
  | 'studio'
  | 'room'
  | 'commercial';

export const PROPERTY_TYPE_OPTIONS = [
  { value: 'apartment' as const, label: 'Apartamento', icon: '🏢' },
  { value: 'house' as const, label: 'Casa', icon: '🏠' },
  { value: 'studio' as const, label: 'Estudio', icon: '🏘️' },
  { value: 'room' as const, label: 'Habitación', icon: '🚪' },
  { value: 'commercial' as const, label: 'Comercial', icon: '🏪' },
] as const;

export const BUDGET_RANGES = [
  { min: 0, max: 5000, label: 'Menos de L.5,000' },
  { min: 5000, max: 10000, label: 'L.5,000 - L.10,000' },
  { min: 10000, max: 15000, label: 'L.10,000 - L.15,000' },
  { min: 15000, max: 20000, label: 'L.15,000 - L.20,000' },
  { min: 20000, max: 30000, label: 'L.20,000 - L.30,000' },
  { min: 30000, max: 999999, label: 'Más de L.30,000' },
] as const;

export const BEDROOM_OPTIONS = [
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4' },
  { value: 5, label: '5+' },
] as const;

export const BATHROOM_OPTIONS = [
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4+' },
] as const;

export const AMENITIES_OPTIONS = [
  { value: 'parking', label: 'Estacionamiento', icon: '🚗' },
  { value: 'furnished', label: 'Amueblado', icon: '🛋️' },
  { value: 'laundry', label: 'Lavandería', icon: '🧺' },
  { value: 'ac', label: 'Aire Acondicionado', icon: '❄️' },
  { value: 'pool', label: 'Piscina', icon: '🏊' },
  { value: 'gym', label: 'Gimnasio', icon: '💪' },
  { value: 'security', label: 'Seguridad 24/7', icon: '🔒' },
  { value: 'elevator', label: 'Elevador', icon: '🛗' },
  { value: 'balcony', label: 'Balcón', icon: '🌅' },
  { value: 'garden', label: 'Jardín', icon: '🌳' },
  { value: 'pets_allowed', label: 'Se Permiten Mascotas', icon: '🐕' },
  { value: 'storage', label: 'Bodega', icon: '📦' },
] as const;

// Tegucigalpa neighborhoods
export const TEGUCIGALPA_AREAS = [
  'Los Próceres',
  'Lomas del Guijarro',
  'Las Colinas',
  'Col. Kennedy',
  'Miraflores',
  'San Ignacio',
  'Florencia Norte',
  'Lomas del Mayab',
  'Col. Palmira',
  'Morazán',
  'Tepeyac',
  'Col. Rubén Darío',
  'Col. Los Alcaldes',
  'Col. Alameda',
  'Col. Matamoros',
  'El Pedregal',
  'Lomas de Toncontín',
  'Res. Las Hadas',
  'Res. El Trapiche',
  'La Cumbre',
] as const;

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type TenantProfileFormData = Partial<TenantProfile>;

export interface ProfileUpdateInput {
  personalInfo?: Partial<PersonalInfo>;
  searchPreferences?: Partial<SearchPreferences>;
}

export interface ContactAttempt {
  propertyId: string;
  contactedAt: Date;
  method: 'whatsapp' | 'email' | 'phone';
}
