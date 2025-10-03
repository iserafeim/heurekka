/**
 * Landlord Profile Type Definitions
 * Spanish labels for all user-facing text
 */

export type LandlordType = 'individual_owner' | 'real_estate_agent' | 'property_company';

export type VerificationLevel = 'basic' | 'verified' | 'premium';

export type VerificationStatus = {
  phoneVerified: boolean;
  emailVerified: boolean;
  identityVerified: boolean;
  businessLicenseVerified: boolean;
  verificationLevel: VerificationLevel;
};

// Individual Owner Profile
export interface IndividualOwnerFormData {
  fullName: string;
  phone: string;
  whatsappNumber?: string;
  primaryLocation: string;
  propertyCountRange?: '1' | '2-3' | '4-5' | '5+';
  rentingReason?: string;
}

// Real Estate Agent Profile
export interface RealEstateAgentFormData {
  professionalName: string;
  phone: string;
  whatsappNumber: string;
  agentType: 'independent' | 'agency_agent';
  companyName?: string;
  yearsOfExperience: '<1' | '1-3' | '3-5' | '5+';
  licenseNumber?: string;
  specializations: ('residential' | 'commercial' | 'industrial')[];
  coverageAreas: string[]; // min 1, max 10
  propertiesManaged: '1-5' | '6-10' | '11-20' | '20+';
  credentialsUrl?: string;
  facebook?: string;
  instagram?: string;
  professionalBio?: string;
}

// Property Company Profile
export interface PropertyCompanyFormData {
  companyName: string;
  rtn: string; // 14 digits
  companyType: string;
  foundedYear?: number;
  primaryPhone: string;
  whatsappBusiness: string;
  contactEmail?: string;
  website?: string;
  officeAddress: string;
  city: string;
  operatingAreas: string[]; // min 1, max 20
  portfolioSize: '1-10' | '11-25' | '26-50' | '50+';
  propertyTypes: ('residential' | 'commercial' | 'industrial' | 'land')[];
  priceRangeMin?: number;
  priceRangeMax?: number;
  companyLogoUrl?: string;
  licenseDocumentUrl?: string;
  companyDescription?: string;
}

export type LandlordFormData =
  | IndividualOwnerFormData
  | RealEstateAgentFormData
  | PropertyCompanyFormData;

// Onboarding State
export interface OnboardingState {
  currentStep: number;
  totalSteps: number;
  landlordType?: LandlordType;
  formData: Partial<LandlordFormData>;
  completionScore: number;
  skippedSteps: string[];
}

// Portfolio Stats
export interface PortfolioStats {
  totalProperties: number;
  activeProperties: number;
  rentedProperties: number;
  totalViews: number;
  totalInquiries: number;
  conversionRate: number;
  averageResponseTimeHours: number;
  responseRate: number;
}

// Badge
export interface Badge {
  badgeType: string;
  badgeName: string;
  badgeDescription: string;
  badgeIcon: string;
  awardedAt?: Date | null;
  earned: boolean;
  criteria?: string;
}

// Landlord Profile
export interface LandlordProfile {
  id: string;
  userId: string;
  landlordType: LandlordType;
  profilePhotoUrl?: string | null;
  onboardingCompleted: boolean;
  onboardingCompletedAt?: Date | null;
  verificationStatus: VerificationStatus;
  formData: LandlordFormData;
  createdAt: Date;
  updatedAt: Date;
}

// Landlord Type Selection Options
export const LANDLORD_TYPE_OPTIONS = [
  {
    type: 'individual_owner' as const,
    icon: '👤',
    title: 'Propietario Individual',
    description: 'Tengo mis propias propiedades',
    details: [
      'Gestión personal',
      'Hasta 5 propiedades',
      'Comunicación directa',
      'Panel simplificado',
    ],
  },
  {
    type: 'real_estate_agent' as const,
    icon: '🏢',
    title: 'Agente Inmobiliario',
    description: 'Gestiono propiedades de clientes',
    details: [
      'Gestión profesional',
      'Portfolio de clientes',
      'CRM avanzado',
      'Analytics detallado',
    ],
  },
  {
    type: 'property_company' as const,
    icon: '🏛',
    title: 'Empresa de Gestión',
    description: 'Administramos múltiples propiedades',
    details: [
      'Gestión empresarial',
      'Equipo colaborativo',
      'API access',
      'Reportes avanzados',
    ],
  },
] as const;

// Property Count Range Options
export const PROPERTY_COUNT_OPTIONS = [
  { value: '1', label: '1' },
  { value: '2-3', label: '2-3' },
  { value: '4-5', label: '4-5' },
  { value: '5+', label: '5+' },
] as const;

// Years of Experience Options
export const YEARS_EXPERIENCE_OPTIONS = [
  { value: '<1', label: 'Menos de 1 año' },
  { value: '1-3', label: '1-3 años' },
  { value: '3-5', label: '3-5 años' },
  { value: '5+', label: 'Más de 5 años' },
] as const;

// Specializations
export const SPECIALIZATIONS_OPTIONS = [
  { value: 'residential', label: 'Residencial' },
  { value: 'commercial', label: 'Comercial' },
  { value: 'industrial', label: 'Industrial' },
] as const;

// Property Types for Company
export const PROPERTY_TYPES_OPTIONS = [
  { value: 'residential', label: 'Residencial' },
  { value: 'commercial', label: 'Comercial' },
  { value: 'industrial', label: 'Industrial' },
  { value: 'land', label: 'Terrenos' },
] as const;

// Portfolio Size Options
export const PORTFOLIO_SIZE_OPTIONS = [
  { value: '1-10', label: '1-10' },
  { value: '11-25', label: '11-25' },
  { value: '26-50', label: '26-50' },
  { value: '50+', label: 'Más de 50' },
] as const;

// Agent Type Options
export const AGENT_TYPE_OPTIONS = [
  { value: 'independent', label: 'Independiente' },
  { value: 'agency_agent', label: 'Agente de Empresa' },
] as const;

// Company Type Options
export const COMPANY_TYPE_OPTIONS = [
  { value: 'sociedad_anonima', label: 'Sociedad Anónima (S.A.)' },
  { value: 'sociedad_responsabilidad_limitada', label: 'Sociedad de Responsabilidad Limitada (S.R.L.)' },
  { value: 'empresa_individual', label: 'Empresa Individual' },
  { value: 'otro', label: 'Otro' },
] as const;

// Cities in Honduras
export const HONDURAS_CITIES = [
  'Tegucigalpa',
  'San Pedro Sula',
  'La Ceiba',
  'Choloma',
  'El Progreso',
  'Villanueva',
  'Choluteca',
  'Comayagua',
  'Puerto Cortés',
  'La Lima',
  'Danlí',
  'Siguatepeque',
  'Juticalpa',
  'Tocoa',
  'Tela',
  'Santa Rosa de Copán',
  'Olanchito',
  'Catacamas',
  'La Entrada',
  'Trujillo',
  'Santa Bárbara',
  'Gracias',
  'Yoro',
  'Yuscaran',
  'Copán Ruinas',
];

// Neighborhoods in Tegucigalpa
export const TEGUCIGALPA_NEIGHBORHOODS = [
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
];
