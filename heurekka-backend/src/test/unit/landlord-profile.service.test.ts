import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TRPCError } from '@trpc/server';
import { LandlordProfileService } from '@/services/landlord-profile.service';
import type {
  IndividualOwnerInput,
  RealEstateAgentInput,
  PropertyCompanyInput,
  LandlordProfileInput
} from '@/services/landlord-profile.service';

// Mock Supabase client
const mockSupabaseFrom = vi.fn();
const mockSupabaseSelect = vi.fn();
const mockSupabaseInsert = vi.fn();
const mockSupabaseUpdate = vi.fn();
const mockSupabaseDelete = vi.fn();
const mockSupabaseEq = vi.fn();
const mockSupabaseSingle = vi.fn();
const mockSupabaseMaybeSingle = vi.fn();
const mockSupabaseLimit = vi.fn();

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: mockSupabaseFrom
  }))
}));

describe('LandlordProfileService', () => {
  let landlordProfileService: LandlordProfileService;

  const mockIndividualOwnerData = {
    id: 'profile-123',
    user_id: 'user-123',
    landlord_type: 'individual_owner',
    full_name: 'John Owner',
    phone: '9999-9999',
    whatsapp_number: '8888-8888',
    property_count_range: '2-5',
    property_location: 'Tegucigalpa',
    rental_reason: 'investment',
    verification_status: 'pending',
    rating: 0,
    total_reviews: 0,
    profile_completion_percentage: 80,
    is_verified: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  };

  const mockAgentData = {
    id: 'profile-456',
    user_id: 'user-456',
    landlord_type: 'real_estate_agent',
    full_name: 'Jane Agent',
    phone: '9999-9999',
    whatsapp_number: '8888-8888',
    agent_type: 'independent',
    company_name: 'Best Realty',
    years_experience: '5-10',
    license_number: null,
    specializations: ['residential', 'commercial'],
    coverage_areas: ['Tegucigalpa', 'San Pedro Sula'],
    properties_in_management: '10-20',
    credentials_url: null,
    social_facebook: null,
    social_instagram: null,
    professional_bio: 'Experienced real estate agent',
    verification_status: 'pending',
    rating: 4.5,
    total_reviews: 10,
    profile_completion_percentage: 90,
    is_verified: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  };

  const mockCompanyData = {
    id: 'profile-789',
    user_id: 'user-789',
    landlord_type: 'property_company',
    business_name: 'PropTech Inc',
    company_name: 'PropTech Inc',
    company_rtn: '12345678901234',
    company_type: 'real_estate',
    founded_year: 2015,
    main_phone: '9999-9999',
    whatsapp_business: '8888-8888',
    contact_email: 'contact@proptech.com',
    email: 'contact@proptech.com',
    website: 'https://proptech.com',
    office_address: 'Av. Principal, Col. Palmira',
    city: 'Tegucigalpa',
    operation_zones: ['Francisco Morazán', 'Cortés'],
    portfolio_size: '50-100',
    portfolio_types: ['residential', 'commercial'],
    price_range_min: 5000,
    price_range_max: 50000,
    company_logo_url: null,
    license_document_url: null,
    company_description: 'Leading property management company',
    verification_status: 'verified',
    rating: 4.8,
    total_reviews: 150,
    profile_completion_percentage: 95,
    is_verified: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup environment variables
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_KEY = 'test-service-key';

    // Setup default mock chain
    mockSupabaseFrom.mockReturnValue({
      select: mockSupabaseSelect,
      insert: mockSupabaseInsert,
      update: mockSupabaseUpdate,
      delete: mockSupabaseDelete
    });

    mockSupabaseSelect.mockReturnValue({
      eq: mockSupabaseEq,
      limit: mockSupabaseLimit
    });

    mockSupabaseInsert.mockReturnValue({
      select: mockSupabaseSelect
    });

    mockSupabaseUpdate.mockReturnValue({
      eq: mockSupabaseEq
    });

    mockSupabaseDelete.mockReturnValue({
      eq: mockSupabaseEq
    });

    mockSupabaseEq.mockReturnValue({
      maybeSingle: mockSupabaseMaybeSingle,
      single: mockSupabaseSingle,
      select: mockSupabaseSelect
    });

    mockSupabaseLimit.mockResolvedValue({
      data: null,
      error: null
    });

    landlordProfileService = new LandlordProfileService();
  });

  afterEach(() => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_KEY;
  });

  describe('constructor', () => {
    it('should throw error when SUPABASE_URL is missing', () => {
      delete process.env.SUPABASE_URL;
      expect(() => new LandlordProfileService()).toThrow('Missing Supabase configuration for landlord profile service');
    });

    it('should throw error when SUPABASE_SERVICE_KEY is missing', () => {
      delete process.env.SUPABASE_SERVICE_KEY;
      expect(() => new LandlordProfileService()).toThrow('Missing Supabase configuration for landlord profile service');
    });

    it('should initialize successfully with required environment variables', () => {
      expect(() => new LandlordProfileService()).not.toThrow();
    });
  });

  describe('createLandlordProfile - Individual Owner', () => {
    const validInput: IndividualOwnerInput & { landlordType: 'individual_owner' } = {
      landlordType: 'individual_owner',
      fullName: 'John Owner',
      phone: '9999-9999',
      whatsappNumber: '8888-8888',
      propertyCountRange: '2-5',
      propertyLocation: 'Tegucigalpa',
      rentalReason: 'investment'
    };

    beforeEach(() => {
      mockSupabaseMaybeSingle.mockResolvedValue({
        data: null,
        error: null
      });
    });

    it('should create individual owner profile successfully', async () => {
      mockSupabaseSingle.mockResolvedValue({
        data: mockIndividualOwnerData,
        error: null
      });

      const result = await landlordProfileService.createLandlordProfile('user-123', validInput);

      expect(mockSupabaseFrom).toHaveBeenCalledWith('landlords');
      expect(mockSupabaseInsert).toHaveBeenCalled();
      expect(result.landlordType).toBe('individual_owner');
      expect(result.fullName).toBe('John Owner');
    });

    it('should validate full name for individual owner', async () => {
      const invalidInput = { ...validInput, fullName: 'AB' };

      await expect(landlordProfileService.createLandlordProfile('user-123', invalidInput as any)).rejects.toMatchObject({
        code: 'BAD_REQUEST',
        message: 'El nombre completo es requerido (mínimo 3 caracteres)'
      });
    });

    it('should validate Honduras phone format', async () => {
      const invalidInput = { ...validInput, phone: 'invalid-phone' };

      await expect(landlordProfileService.createLandlordProfile('user-123', invalidInput as any)).rejects.toMatchObject({
        code: 'BAD_REQUEST',
        message: 'El teléfono debe tener el formato 9999-9999'
      });
    });

    it('should prevent duplicate profile creation', async () => {
      mockSupabaseMaybeSingle.mockResolvedValue({
        data: mockIndividualOwnerData,
        error: null
      });

      await expect(landlordProfileService.createLandlordProfile('user-123', validInput)).rejects.toMatchObject({
        code: 'CONFLICT',
        message: 'Ya existe un perfil de arrendador para este usuario'
      });
    });

    it('should calculate profile completion for individual owner', async () => {
      const completeProfile = {
        ...mockIndividualOwnerData,
        profile_completion_percentage: 100
      };

      mockSupabaseSingle.mockResolvedValue({
        data: completeProfile,
        error: null
      });

      const result = await landlordProfileService.createLandlordProfile('user-123', validInput);

      expect(result.profileCompletionPercentage).toBeGreaterThan(0);
    });
  });

  describe('createLandlordProfile - Real Estate Agent', () => {
    const validInput: RealEstateAgentInput & { landlordType: 'real_estate_agent' } = {
      landlordType: 'real_estate_agent',
      fullName: 'Jane Agent',
      phone: '9999-9999',
      whatsappNumber: '8888-8888',
      agentType: 'independent',
      yearsExperience: '5-10',
      specializations: ['residential', 'commercial'],
      coverageAreas: ['Tegucigalpa'],
      propertiesInManagement: '10-20',
      professionalBio: 'Experienced agent'
    };

    beforeEach(() => {
      mockSupabaseMaybeSingle.mockResolvedValue({
        data: null,
        error: null
      });
    });

    it('should create real estate agent profile successfully', async () => {
      mockSupabaseSingle.mockResolvedValue({
        data: mockAgentData,
        error: null
      });

      const result = await landlordProfileService.createLandlordProfile('user-456', validInput);

      expect(result.landlordType).toBe('real_estate_agent');
      expect(result.agentType).toBe('independent');
      expect(result.specializations).toEqual(['residential', 'commercial']);
    });

    it('should validate required fields for agent', async () => {
      const invalidInput = { ...validInput, fullName: undefined } as any;

      await expect(landlordProfileService.createLandlordProfile('user-456', invalidInput)).rejects.toMatchObject({
        code: 'BAD_REQUEST',
        message: 'Nombre y teléfono son requeridos'
      });
    });

    it('should validate coverage areas for agent', async () => {
      const invalidInput = { ...validInput, coverageAreas: [] } as any;

      await expect(landlordProfileService.createLandlordProfile('user-456', invalidInput)).rejects.toMatchObject({
        code: 'BAD_REQUEST',
        message: 'Debe especificar al menos una zona de cobertura'
      });
    });

    it('should calculate profile completion for agent', async () => {
      const completeAgent = {
        ...mockAgentData,
        license_number: 'AHCI-12345',
        credentials_url: 'https://example.com/creds.pdf',
        profile_completion_percentage: 100
      };

      mockSupabaseSingle.mockResolvedValue({
        data: completeAgent,
        error: null
      });

      const completeInput = {
        ...validInput,
        licenseNumber: 'AHCI-12345',
        credentialsUrl: 'https://example.com/creds.pdf'
      };

      const result = await landlordProfileService.createLandlordProfile('user-456', completeInput);

      expect(result.profileCompletionPercentage).toBeGreaterThan(80);
    });
  });

  describe('createLandlordProfile - Property Company', () => {
    const validInput: PropertyCompanyInput & { landlordType: 'property_company' } = {
      landlordType: 'property_company',
      companyName: 'PropTech Inc',
      companyRtn: '12345678901234',
      companyType: 'real_estate',
      foundedYear: 2015,
      mainPhone: '9999-9999',
      whatsappBusiness: '8888-8888',
      officeAddress: 'Av. Principal, Col. Palmira',
      city: 'Tegucigalpa',
      operationZones: ['Francisco Morazán'],
      portfolioSize: '50-100',
      portfolioTypes: ['residential', 'commercial']
    };

    beforeEach(() => {
      mockSupabaseMaybeSingle.mockResolvedValue({
        data: null,
        error: null
      });
    });

    it('should create property company profile successfully', async () => {
      mockSupabaseSingle.mockResolvedValue({
        data: mockCompanyData,
        error: null
      });

      const result = await landlordProfileService.createLandlordProfile('user-789', validInput);

      expect(result.landlordType).toBe('property_company');
      expect(result.companyName).toBe('PropTech Inc');
      expect(result.companyRtn).toBe('12345678901234');
    });

    it('should validate company name', async () => {
      const invalidInput = { ...validInput, companyName: undefined } as any;

      await expect(landlordProfileService.createLandlordProfile('user-789', invalidInput)).rejects.toMatchObject({
        code: 'BAD_REQUEST',
        message: 'Nombre de empresa y RTN son requeridos'
      });
    });

    it('should validate RTN format (14 digits)', async () => {
      const invalidInput = { ...validInput, companyRtn: '123456' } as any;

      await expect(landlordProfileService.createLandlordProfile('user-789', invalidInput)).rejects.toMatchObject({
        code: 'BAD_REQUEST',
        message: 'RTN debe tener 14 dígitos'
      });
    });

    it('should validate operation zones', async () => {
      const invalidInput = { ...validInput, operationZones: [] } as any;

      await expect(landlordProfileService.createLandlordProfile('user-789', invalidInput)).rejects.toMatchObject({
        code: 'BAD_REQUEST',
        message: 'Debe especificar al menos una zona de operación'
      });
    });

    it('should calculate profile completion for company', async () => {
      const completeCompany = {
        ...mockCompanyData,
        contact_email: 'contact@proptech.com',
        website: 'https://proptech.com',
        company_logo_url: 'https://example.com/logo.png',
        license_document_url: 'https://example.com/license.pdf',
        company_description: 'Leading property management',
        profile_completion_percentage: 100
      };

      mockSupabaseSingle.mockResolvedValue({
        data: completeCompany,
        error: null
      });

      const completeInput = {
        ...validInput,
        contactEmail: 'contact@proptech.com',
        website: 'https://proptech.com',
        companyLogoUrl: 'https://example.com/logo.png',
        licenseDocumentUrl: 'https://example.com/license.pdf',
        companyDescription: 'Leading property management'
      };

      const result = await landlordProfileService.createLandlordProfile('user-789', completeInput);

      expect(result.profileCompletionPercentage).toBeGreaterThan(85);
    });
  });

  describe('getLandlordProfileByUserId', () => {
    it('should retrieve individual owner profile', async () => {
      mockSupabaseMaybeSingle.mockResolvedValue({
        data: mockIndividualOwnerData,
        error: null
      });

      const result = await landlordProfileService.getLandlordProfileByUserId('user-123');

      expect(result).not.toBeNull();
      expect(result?.landlordType).toBe('individual_owner');
      expect(result?.fullName).toBe('John Owner');
    });

    it('should retrieve real estate agent profile', async () => {
      mockSupabaseMaybeSingle.mockResolvedValue({
        data: mockAgentData,
        error: null
      });

      const result = await landlordProfileService.getLandlordProfileByUserId('user-456');

      expect(result).not.toBeNull();
      expect(result?.landlordType).toBe('real_estate_agent');
      expect(result?.agentType).toBe('independent');
    });

    it('should retrieve property company profile', async () => {
      mockSupabaseMaybeSingle.mockResolvedValue({
        data: mockCompanyData,
        error: null
      });

      const result = await landlordProfileService.getLandlordProfileByUserId('user-789');

      expect(result).not.toBeNull();
      expect(result?.landlordType).toBe('property_company');
      expect(result?.companyName).toBe('PropTech Inc');
    });

    it('should return null when profile does not exist', async () => {
      mockSupabaseMaybeSingle.mockResolvedValue({
        data: null,
        error: null
      });

      const result = await landlordProfileService.getLandlordProfileByUserId('user-999');

      expect(result).toBeNull();
    });

    it('should handle database query error', async () => {
      mockSupabaseMaybeSingle.mockResolvedValue({
        data: null,
        error: { message: 'Query failed', code: '500' }
      });

      await expect(landlordProfileService.getLandlordProfileByUserId('user-123')).rejects.toMatchObject({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error al obtener el perfil de arrendador'
      });
    });
  });

  describe('updateLandlordProfile', () => {
    beforeEach(() => {
      mockSupabaseMaybeSingle.mockResolvedValue({
        data: mockIndividualOwnerData,
        error: null
      });
    });

    it('should update landlord profile successfully', async () => {
      const updateInput = {
        fullName: 'John Updated Owner',
        phone: '7777-7777'
      };

      const updatedData = {
        ...mockIndividualOwnerData,
        full_name: 'John Updated Owner',
        phone: '7777-7777'
      };

      mockSupabaseSingle.mockResolvedValue({
        data: updatedData,
        error: null
      });

      const result = await landlordProfileService.updateLandlordProfile('user-123', updateInput);

      expect(result.fullName).toBe('John Updated Owner');
      expect(result.phone).toBe('7777-7777');
    });

    it('should throw error when profile does not exist', async () => {
      mockSupabaseMaybeSingle.mockResolvedValue({
        data: null,
        error: null
      });

      await expect(landlordProfileService.updateLandlordProfile('user-999', {})).rejects.toMatchObject({
        code: 'NOT_FOUND',
        message: 'Perfil de arrendador no encontrado'
      });
    });

    it('should recalculate completion percentage on update', async () => {
      const updateInput = {
        professionalBio: 'Updated bio',
        coverageAreas: ['Tegucigalpa', 'San Pedro Sula', 'La Ceiba']
      };

      const updatedData = {
        ...mockAgentData,
        professional_bio: 'Updated bio',
        coverage_areas: ['Tegucigalpa', 'San Pedro Sula', 'La Ceiba'],
        profile_completion_percentage: 95
      };

      mockSupabaseMaybeSingle.mockResolvedValue({
        data: mockAgentData,
        error: null
      });

      mockSupabaseSingle.mockResolvedValue({
        data: updatedData,
        error: null
      });

      const result = await landlordProfileService.updateLandlordProfile('user-456', updateInput);

      expect(result.profileCompletionPercentage).toBeGreaterThan(90);
    });

    it('should update last active timestamp', async () => {
      mockSupabaseSingle.mockResolvedValue({
        data: mockIndividualOwnerData,
        error: null
      });

      await landlordProfileService.updateLandlordProfile('user-123', { fullName: 'Updated' });

      expect(mockSupabaseUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          last_active_at: expect.any(String)
        })
      );
    });

    it('should handle database update error', async () => {
      mockSupabaseSingle.mockResolvedValue({
        data: null,
        error: { message: 'Update failed', code: '500' }
      });

      await expect(landlordProfileService.updateLandlordProfile('user-123', {})).rejects.toMatchObject({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error al actualizar el perfil'
      });
    });
  });

  describe('deleteLandlordProfile', () => {
    it('should delete landlord profile successfully', async () => {
      mockSupabaseEq.mockResolvedValue({
        error: null
      });

      const result = await landlordProfileService.deleteLandlordProfile('user-123');

      expect(mockSupabaseDelete).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });

    it('should handle database delete error', async () => {
      mockSupabaseEq.mockResolvedValue({
        error: { message: 'Delete failed', code: '500' }
      });

      await expect(landlordProfileService.deleteLandlordProfile('user-123')).rejects.toMatchObject({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error al eliminar el perfil'
      });
    });
  });

  describe('healthCheck', () => {
    it('should return healthy status when database is accessible', async () => {
      mockSupabaseLimit.mockResolvedValue({
        data: [],
        error: null
      });

      const result = await landlordProfileService.healthCheck();

      expect(result.status).toBe('healthy');
    });

    it('should return unhealthy status on database error', async () => {
      mockSupabaseLimit.mockResolvedValue({
        data: null,
        error: { message: 'Connection failed', code: '500' }
      });

      const result = await landlordProfileService.healthCheck();

      expect(result.status).toBe('unhealthy');
    });
  });
});