/**
 * Test fixtures for authentication testing
 */

export const mockUsers = {
  tenant: {
    id: 'user-tenant-123',
    email: 'tenant@example.com',
    phone: '9999-9999',
    emailVerified: true,
    phoneVerified: false
  },
  landlord: {
    id: 'user-landlord-456',
    email: 'landlord@example.com',
    phone: '8888-8888',
    emailVerified: true,
    phoneVerified: true
  },
  both: {
    id: 'user-both-789',
    email: 'both@example.com',
    phone: '7777-7777',
    emailVerified: true,
    phoneVerified: true
  },
  unverified: {
    id: 'user-unverified-999',
    email: 'unverified@example.com',
    phone: '6666-6666',
    emailVerified: false,
    phoneVerified: false
  }
};

export const mockSessions = {
  valid: {
    accessToken: 'valid-access-token',
    refreshToken: 'valid-refresh-token',
    expiresAt: Date.now() + 3600000 // 1 hour from now
  },
  expired: {
    accessToken: 'expired-access-token',
    refreshToken: 'expired-refresh-token',
    expiresAt: Date.now() - 3600000 // 1 hour ago
  },
  expiringSoon: {
    accessToken: 'expiring-access-token',
    refreshToken: 'expiring-refresh-token',
    expiresAt: Date.now() + 300000 // 5 minutes from now
  }
};

export const validSignupInputs = {
  tenant: {
    email: 'newtenant@example.com',
    password: 'SecurePass123',
    fullName: 'New Tenant User',
    phone: '9999-9999',
    intent: 'tenant' as const
  },
  landlord: {
    email: 'newlandlord@example.com',
    password: 'SecurePass123',
    fullName: 'New Landlord User',
    phone: '8888-8888',
    intent: 'landlord' as const
  },
  minimal: {
    email: 'minimal@example.com',
    password: 'SecurePass123'
  }
};

export const invalidSignupInputs = {
  shortPassword: {
    email: 'test@example.com',
    password: 'short'
  },
  weakPassword: {
    email: 'test@example.com',
    password: 'password123' // no uppercase
  },
  invalidEmail: {
    email: 'invalid-email',
    password: 'SecurePass123'
  },
  invalidPhone: {
    email: 'test@example.com',
    password: 'SecurePass123',
    phone: '12345678' // wrong format
  },
  shortName: {
    email: 'test@example.com',
    password: 'SecurePass123',
    fullName: 'AB' // too short
  }
};

export const validLoginInputs = {
  tenant: {
    email: 'tenant@example.com',
    password: 'TenantPass123'
  },
  landlord: {
    email: 'landlord@example.com',
    password: 'LandlordPass123'
  }
};

export const mockTenantProfiles = {
  complete: {
    id: 'tenant-profile-complete',
    userId: 'user-tenant-123',
    fullName: 'Test Tenant',
    phone: '9999-9999',
    phoneVerified: true,
    occupation: 'Software Engineer',
    profilePhotoUrl: 'https://example.com/photo.jpg',
    budgetMin: 10000,
    budgetMax: 20000,
    moveDate: '2024-12-01',
    occupants: '2 adults',
    preferredAreas: ['Lomas del Guijarro', 'Col. Palmira'],
    propertyTypes: ['apartment', 'house'],
    hasPets: false,
    hasReferences: true,
    messageToLandlords: 'Reliable tenant seeking long-term rental',
    profileCompletionPercentage: 100,
    isVerified: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
    lastActiveAt: '2024-01-15T00:00:00Z'
  },
  partial: {
    id: 'tenant-profile-partial',
    userId: 'user-tenant-456',
    fullName: 'Partial Tenant',
    phone: '8888-8888',
    phoneVerified: false,
    occupation: null,
    profilePhotoUrl: null,
    budgetMin: null,
    budgetMax: null,
    moveDate: null,
    occupants: null,
    preferredAreas: [],
    propertyTypes: ['apartment'],
    hasPets: false,
    hasReferences: false,
    messageToLandlords: null,
    profileCompletionPercentage: 30,
    isVerified: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    lastActiveAt: '2024-01-01T00:00:00Z'
  }
};

export const mockLandlordProfiles = {
  individualOwner: {
    id: 'landlord-profile-individual',
    userId: 'user-landlord-123',
    landlordType: 'individual_owner' as const,
    fullName: 'John Owner',
    phone: '9999-9999',
    whatsappNumber: '9999-9999',
    propertyCountRange: '2-5',
    propertyLocation: 'Tegucigalpa',
    rentalReason: 'investment',
    verificationStatus: 'verified',
    rating: 4.5,
    totalReviews: 12,
    profileCompletionPercentage: 85,
    isVerified: true,
    createdAt: '2024-01-01T00:00:00Z',
    updated At: '2024-01-10T00:00:00Z'
  },
  realEstateAgent: {
    id: 'landlord-profile-agent',
    userId: 'user-landlord-456',
    landlordType: 'real_estate_agent' as const,
    fullName: 'Jane Agent',
    phone: '8888-8888',
    whatsappNumber: '8888-8888',
    agentType: 'independent',
    yearsExperience: '5-10',
    specializations: ['residential', 'commercial'],
    coverageAreas: ['Tegucigalpa', 'San Pedro Sula'],
    propertiesInManagement: '10-20',
    professionalBio: 'Experienced real estate professional',
    verificationStatus: 'verified',
    rating: 4.8,
    totalReviews: 45,
    profileCompletionPercentage: 95,
    isVerified: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-10T00:00:00Z'
  },
  propertyCompany: {
    id: 'landlord-profile-company',
    userId: 'user-landlord-789',
    landlordType: 'property_company' as const,
    companyName: 'PropTech Inc',
    companyRtn: '12345678901234',
    companyType: 'real_estate',
    foundedYear: 2015,
    mainPhone: '7777-7777',
    whatsappBusiness: '7777-7777',
    contactEmail: 'contact@proptech.com',
    website: 'https://proptech.com',
    officeAddress: 'Av. Principal, Col. Palmira',
    city: 'Tegucigalpa',
    operationZones: ['Francisco Morazán', 'Cortés'],
    portfolioSize: '50-100',
    portfolioTypes: ['residential', 'commercial'],
    priceRangeMin: 5000,
    priceRangeMax: 50000,
    companyDescription: 'Leading property management company',
    verificationStatus: 'verified',
    rating: 4.9,
    totalReviews: 200,
    profileCompletionPercentage: 100,
    isVerified: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-10T00:00:00Z'
  }
};

export const validTenantProfileInput = {
  fullName: 'New Tenant',
  phone: '9999-9999',
  occupation: 'Engineer',
  budgetMin: 10000,
  budgetMax: 15000,
  moveDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
  occupants: '1 adult',
  preferredAreas: ['Lomas del Guijarro'],
  propertyTypes: ['apartment' as const],
  hasPets: false,
  hasReferences: true,
  messageToLandlords: 'Professional seeking quality accommodation'
};

export const validLandlordProfileInputs = {
  individualOwner: {
    landlordType: 'individual_owner' as const,
    fullName: 'New Owner',
    phone: '9999-9999',
    whatsappNumber: '9999-9999',
    propertyCountRange: '1',
    propertyLocation: 'Tegucigalpa',
    rentalReason: 'investment'
  },
  realEstateAgent: {
    landlordType: 'real_estate_agent' as const,
    fullName: 'New Agent',
    phone: '9999-9999',
    whatsappNumber: '9999-9999',
    agentType: 'independent' as const,
    yearsExperience: '3-5',
    specializations: ['residential' as const],
    coverageAreas: ['Tegucigalpa'],
    propertiesInManagement: '5-10'
  },
  propertyCompany: {
    landlordType: 'property_company' as const,
    companyName: 'New Company',
    companyRtn: '98765432109876',
    companyType: 'real_estate',
    foundedYear: 2020,
    mainPhone: '9999-9999',
    whatsappBusiness: '9999-9999',
    officeAddress: 'Main Street 123',
    city: 'Tegucigalpa',
    operationZones: ['Francisco Morazán'],
    portfolioSize: '1-10',
    portfolioTypes: ['residential' as const]
  }
};

export const invalidTenantProfileInputs = {
  shortName: {
    fullName: 'AB',
    phone: '9999-9999'
  },
  invalidPhone: {
    fullName: 'Test User',
    phone: '12345678'
  },
  budgetMaxLessThanMin: {
    fullName: 'Test User',
    phone: '9999-9999',
    budgetMin: 20000,
    budgetMax: 10000
  },
  pastMoveDate: {
    fullName: 'Test User',
    phone: '9999-9999',
    moveDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // yesterday
  },
  farFutureMoveDate: {
    fullName: 'Test User',
    phone: '9999-9999',
    moveDate: new Date(Date.now() + 200 * 24 * 60 * 60 * 1000).toISOString() // 200 days
  }
};

export const invalidLandlordProfileInputs = {
  shortName: {
    landlordType: 'individual_owner' as const,
    fullName: 'AB',
    phone: '9999-9999',
    whatsappNumber: '9999-9999'
  },
  invalidPhone: {
    landlordType: 'individual_owner' as const,
    fullName: 'Test Owner',
    phone: '12345678',
    whatsappNumber: '9999-9999'
  },
  invalidRtn: {
    landlordType: 'property_company' as const,
    companyName: 'Test Company',
    companyRtn: '123456', // too short
    companyType: 'real_estate',
    mainPhone: '9999-9999',
    whatsappBusiness: '9999-9999',
    officeAddress: 'Test Address',
    city: 'Tegucigalpa',
    operationZones: ['Test Zone'],
    portfolioSize: '1-10',
    portfolioTypes: ['residential' as const]
  },
  noCoverageAreas: {
    landlordType: 'real_estate_agent' as const,
    fullName: 'Test Agent',
    phone: '9999-9999',
    whatsappNumber: '9999-9999',
    agentType: 'independent' as const,
    yearsExperience: '3-5',
    specializations: ['residential' as const],
    coverageAreas: [],
    propertiesInManagement: '5-10'
  }
};

export const spanishErrorMessages = {
  auth: {
    invalidEmail: 'Correo electrónico inválido',
    shortPassword: 'La contraseña debe tener al menos 8 caracteres',
    weakPassword: 'La contraseña debe incluir mayúsculas, minúsculas y números',
    duplicateEmail: 'Ya existe una cuenta con este correo electrónico',
    invalidCredentials: 'Correo o contraseña incorrectos',
    emailNotVerified: 'Por favor verifica tu correo electrónico antes de iniciar sesión',
    sessionExpired: 'Session expired. Please login again.',
    invalidSession: 'Sesión inválida'
  },
  tenantProfile: {
    shortName: 'El nombre completo debe tener al menos 3 caracteres',
    invalidPhone: 'El teléfono debe tener el formato 9999-9999',
    budgetError: 'El presupuesto máximo debe ser mayor al mínimo',
    moveDateError: 'La fecha de mudanza debe estar entre hoy y 6 meses',
    profileExists: 'Ya existe un perfil de inquilino para este usuario',
    profileNotFound: 'Perfil de inquilino no encontrado'
  },
  landlordProfile: {
    shortName: 'El nombre completo es requerido (mínimo 3 caracteres)',
    invalidPhone: 'El teléfono debe tener el formato 9999-9999',
    invalidRtn: 'RTN debe tener 14 dígitos',
    noCoverageAreas: 'Debe especificar al menos una zona de cobertura',
    noOperationZones: 'Debe especificar al menos una zona de operación',
    profileExists: 'Ya existe un perfil de arrendador para este usuario',
    profileNotFound: 'Perfil de arrendador no encontrado'
  }
};