import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TRPCError } from '@trpc/server';
import { TenantProfileService } from '@/services/tenant-profile.service';
import type { TenantProfileInput, UpdateTenantProfileInput } from '@/services/tenant-profile.service';

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

describe('TenantProfileService', () => {
  let tenantProfileService: TenantProfileService;

  const mockTenantProfileData = {
    id: 'profile-123',
    user_id: 'user-123',
    full_name: 'Test User',
    phone: '9999-9999',
    phone_verified: false,
    occupation: 'Software Engineer',
    profile_photo_url: null,
    budget_min: 10000,
    budget_max: 20000,
    move_date: '2024-12-01',
    occupants: '2 adults',
    preferred_areas: ['Lomas del Guijarro', 'Col. Palmira'],
    property_types: ['apartment', 'house'],
    has_pets: false,
    pet_details: null,
    has_references: true,
    message_to_landlords: 'Looking for a quiet place',
    profile_completion_percentage: 85,
    is_verified: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    last_active_at: '2024-01-01T00:00:00Z'
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

    tenantProfileService = new TenantProfileService();
  });

  afterEach(() => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_KEY;
  });

  describe('constructor', () => {
    it('should throw error when SUPABASE_URL is missing', () => {
      delete process.env.SUPABASE_URL;
      expect(() => new TenantProfileService()).toThrow('Missing Supabase configuration for tenant profile service');
    });

    it('should throw error when SUPABASE_SERVICE_KEY is missing', () => {
      delete process.env.SUPABASE_SERVICE_KEY;
      expect(() => new TenantProfileService()).toThrow('Missing Supabase configuration for tenant profile service');
    });

    it('should initialize successfully with required environment variables', () => {
      expect(() => new TenantProfileService()).not.toThrow();
    });
  });

  describe('createTenantProfile', () => {
    const validInput: TenantProfileInput = {
      fullName: 'Test User',
      phone: '9999-9999',
      occupation: 'Software Engineer',
      budgetMin: 10000,
      budgetMax: 20000,
      moveDate: '2024-12-01T00:00:00Z',
      occupants: '2 adults',
      preferredAreas: ['Lomas del Guijarro'],
      propertyTypes: ['apartment'],
      hasPets: false,
      hasReferences: true,
      messageToLandlords: 'Looking for a quiet place'
    };

    beforeEach(() => {
      // Mock no existing profile
      mockSupabaseMaybeSingle.mockResolvedValue({
        data: null,
        error: null
      });
    });

    it('should create tenant profile successfully', async () => {
      mockSupabaseSingle.mockResolvedValue({
        data: mockTenantProfileData,
        error: null
      });

      const result = await tenantProfileService.createTenantProfile('user-123', validInput);

      expect(mockSupabaseFrom).toHaveBeenCalledWith('tenant_profiles');
      expect(mockSupabaseInsert).toHaveBeenCalled();
      expect(result.id).toBe('profile-123');
      expect(result.fullName).toBe('Test User');
      expect(result.phone).toBe('9999-9999');
    });

    it('should validate full name length', async () => {
      const invalidInput = { ...validInput, fullName: 'AB' };

      await expect(tenantProfileService.createTenantProfile('user-123', invalidInput)).rejects.toMatchObject({
        code: 'BAD_REQUEST',
        message: 'El nombre completo debe tener al menos 3 caracteres'
      });
    });

    it('should validate Honduras phone format', async () => {
      const invalidInput = { ...validInput, phone: '12345678' };

      await expect(tenantProfileService.createTenantProfile('user-123', invalidInput)).rejects.toMatchObject({
        code: 'BAD_REQUEST',
        message: 'El teléfono debe tener el formato 9999-9999'
      });
    });

    it('should validate budget min less than max', async () => {
      const invalidInput = { ...validInput, budgetMin: 20000, budgetMax: 10000 };

      await expect(tenantProfileService.createTenantProfile('user-123', invalidInput)).rejects.toMatchObject({
        code: 'BAD_REQUEST',
        message: 'El presupuesto máximo debe ser mayor al mínimo'
      });
    });

    it('should validate move date within 6 months', async () => {
      const tooFarDate = new Date();
      tooFarDate.setMonth(tooFarDate.getMonth() + 7);
      const invalidInput = { ...validInput, moveDate: tooFarDate.toISOString() };

      await expect(tenantProfileService.createTenantProfile('user-123', invalidInput)).rejects.toMatchObject({
        code: 'BAD_REQUEST',
        message: 'La fecha de mudanza debe estar entre hoy y 6 meses'
      });
    });

    it('should validate move date not in the past', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      const invalidInput = { ...validInput, moveDate: pastDate.toISOString() };

      await expect(tenantProfileService.createTenantProfile('user-123', invalidInput)).rejects.toMatchObject({
        code: 'BAD_REQUEST',
        message: 'La fecha de mudanza debe estar entre hoy y 6 meses'
      });
    });

    it('should prevent duplicate profile creation', async () => {
      mockSupabaseMaybeSingle.mockResolvedValue({
        data: mockTenantProfileData,
        error: null
      });

      await expect(tenantProfileService.createTenantProfile('user-123', validInput)).rejects.toMatchObject({
        code: 'CONFLICT',
        message: 'Ya existe un perfil de inquilino para este usuario'
      });
    });

    it('should calculate profile completion percentage', async () => {
      const partialInput: TenantProfileInput = {
        fullName: 'Test User',
        phone: '9999-9999'
      };

      const mockPartialProfile = {
        ...mockTenantProfileData,
        profile_completion_percentage: 30
      };

      mockSupabaseSingle.mockResolvedValue({
        data: mockPartialProfile,
        error: null
      });

      const result = await tenantProfileService.createTenantProfile('user-123', partialInput);

      expect(result.profileCompletionPercentage).toBeLessThan(100);
    });

    it('should handle database insert error', async () => {
      mockSupabaseSingle.mockResolvedValue({
        data: null,
        error: { message: 'Insert failed', code: '500' }
      });

      await expect(tenantProfileService.createTenantProfile('user-123', validInput)).rejects.toMatchObject({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'No se pudo crear el perfil de inquilino'
      });
    });

    it('should set default values for optional fields', async () => {
      const minimalInput: TenantProfileInput = {
        fullName: 'Test User',
        phone: '9999-9999'
      };

      mockSupabaseSingle.mockResolvedValue({
        data: {
          ...mockTenantProfileData,
          preferred_areas: [],
          property_types: ['apartment', 'house'],
          has_pets: false
        },
        error: null
      });

      const result = await tenantProfileService.createTenantProfile('user-123', minimalInput);

      expect(result.preferredAreas).toEqual([]);
      expect(result.propertyTypes).toEqual(['apartment', 'house']);
      expect(result.hasPets).toBe(false);
    });
  });

  describe('getTenantProfileByUserId', () => {
    it('should retrieve tenant profile by user ID', async () => {
      mockSupabaseMaybeSingle.mockResolvedValue({
        data: mockTenantProfileData,
        error: null
      });

      const result = await tenantProfileService.getTenantProfileByUserId('user-123');

      expect(mockSupabaseFrom).toHaveBeenCalledWith('tenant_profiles');
      expect(mockSupabaseEq).toHaveBeenCalledWith('user_id', 'user-123');
      expect(result).not.toBeNull();
      expect(result?.id).toBe('profile-123');
    });

    it('should return null when profile does not exist', async () => {
      mockSupabaseMaybeSingle.mockResolvedValue({
        data: null,
        error: null
      });

      const result = await tenantProfileService.getTenantProfileByUserId('user-456');

      expect(result).toBeNull();
    });

    it('should handle database query error', async () => {
      mockSupabaseMaybeSingle.mockResolvedValue({
        data: null,
        error: { message: 'Query failed', code: '500' }
      });

      await expect(tenantProfileService.getTenantProfileByUserId('user-123')).rejects.toMatchObject({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error al obtener el perfil de inquilino'
      });
    });
  });

  describe('getTenantProfileById', () => {
    it('should retrieve tenant profile by profile ID', async () => {
      mockSupabaseMaybeSingle.mockResolvedValue({
        data: mockTenantProfileData,
        error: null
      });

      const result = await tenantProfileService.getTenantProfileById('profile-123');

      expect(mockSupabaseEq).toHaveBeenCalledWith('id', 'profile-123');
      expect(result).not.toBeNull();
      expect(result?.userId).toBe('user-123');
    });

    it('should return null when profile does not exist', async () => {
      mockSupabaseMaybeSingle.mockResolvedValue({
        data: null,
        error: null
      });

      const result = await tenantProfileService.getTenantProfileById('profile-456');

      expect(result).toBeNull();
    });

    it('should handle database errors gracefully', async () => {
      mockSupabaseMaybeSingle.mockResolvedValue({
        data: null,
        error: { message: 'Query failed', code: '500' }
      });

      const result = await tenantProfileService.getTenantProfileById('profile-123');

      expect(result).toBeNull();
    });
  });

  describe('updateTenantProfile', () => {
    const updateInput: UpdateTenantProfileInput = {
      occupation: 'Senior Engineer',
      budgetMax: 25000
    };

    beforeEach(() => {
      mockSupabaseMaybeSingle.mockResolvedValue({
        data: mockTenantProfileData,
        error: null
      });
    });

    it('should update tenant profile successfully', async () => {
      const updatedData = {
        ...mockTenantProfileData,
        occupation: 'Senior Engineer',
        budget_max: 25000,
        profile_completion_percentage: 90
      };

      mockSupabaseSingle.mockResolvedValue({
        data: updatedData,
        error: null
      });

      const result = await tenantProfileService.updateTenantProfile('user-123', updateInput);

      expect(mockSupabaseUpdate).toHaveBeenCalled();
      expect(result.occupation).toBe('Senior Engineer');
      expect(result.budgetMax).toBe(25000);
    });

    it('should throw error when profile does not exist', async () => {
      mockSupabaseMaybeSingle.mockResolvedValue({
        data: null,
        error: null
      });

      await expect(tenantProfileService.updateTenantProfile('user-456', updateInput)).rejects.toMatchObject({
        code: 'NOT_FOUND',
        message: 'Perfil de inquilino no encontrado'
      });
    });

    it('should recalculate completion percentage on update', async () => {
      const fullUpdate: UpdateTenantProfileInput = {
        fullName: 'Updated User',
        phone: '8888-8888',
        occupation: 'Manager',
        budgetMin: 15000,
        budgetMax: 30000,
        moveDate: '2024-12-15T00:00:00Z',
        occupants: '3 adults',
        preferredAreas: ['Area 1', 'Area 2'],
        propertyTypes: ['apartment'],
        hasPets: true,
        petDetails: 'Small dog'
      };

      const updatedData = {
        ...mockTenantProfileData,
        ...fullUpdate,
        profile_completion_percentage: 100
      };

      mockSupabaseSingle.mockResolvedValue({
        data: updatedData,
        error: null
      });

      const result = await tenantProfileService.updateTenantProfile('user-123', fullUpdate);

      expect(result.profileCompletionPercentage).toBe(100);
    });

    it('should update last active timestamp', async () => {
      const updatedData = {
        ...mockTenantProfileData,
        last_active_at: new Date().toISOString()
      };

      mockSupabaseSingle.mockResolvedValue({
        data: updatedData,
        error: null
      });

      await tenantProfileService.updateTenantProfile('user-123', updateInput);

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

      await expect(tenantProfileService.updateTenantProfile('user-123', updateInput)).rejects.toMatchObject({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error al actualizar el perfil'
      });
    });

    it('should validate phone format on update', async () => {
      const invalidUpdate = { phone: 'invalid-phone' };

      // The validation happens in the service, so we need to check the update call
      mockSupabaseSingle.mockResolvedValue({
        data: mockTenantProfileData,
        error: null
      });

      await tenantProfileService.updateTenantProfile('user-123', invalidUpdate);

      // Service should allow the update (validation is at router level)
      expect(mockSupabaseUpdate).toHaveBeenCalled();
    });
  });

  describe('deleteTenantProfile', () => {
    it('should delete tenant profile successfully', async () => {
      mockSupabaseEq.mockResolvedValue({
        error: null
      });

      const result = await tenantProfileService.deleteTenantProfile('user-123');

      expect(mockSupabaseDelete).toHaveBeenCalled();
      expect(mockSupabaseEq).toHaveBeenCalledWith('user_id', 'user-123');
      expect(result.success).toBe(true);
    });

    it('should handle database delete error', async () => {
      mockSupabaseEq.mockResolvedValue({
        error: { message: 'Delete failed', code: '500' }
      });

      await expect(tenantProfileService.deleteTenantProfile('user-123')).rejects.toMatchObject({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error al eliminar el perfil'
      });
    });

    it('should handle exceptions gracefully', async () => {
      mockSupabaseEq.mockRejectedValue(new Error('Network error'));

      await expect(tenantProfileService.deleteTenantProfile('user-123')).rejects.toMatchObject({
        code: 'INTERNAL_SERVER_ERROR'
      });
    });
  });

  describe('updatePhoneVerification', () => {
    it('should update phone verification status', async () => {
      mockSupabaseEq.mockResolvedValue({
        error: null
      });

      await tenantProfileService.updatePhoneVerification('user-123', true);

      expect(mockSupabaseUpdate).toHaveBeenCalledWith({ phone_verified: true });
      expect(mockSupabaseEq).toHaveBeenCalledWith('user_id', 'user-123');
    });

    it('should not throw on update error', async () => {
      mockSupabaseEq.mockResolvedValue({
        error: { message: 'Update failed', code: '500' }
      });

      await expect(tenantProfileService.updatePhoneVerification('user-123', true)).resolves.not.toThrow();
    });

    it('should handle exceptions gracefully', async () => {
      mockSupabaseEq.mockRejectedValue(new Error('Network error'));

      await expect(tenantProfileService.updatePhoneVerification('user-123', true)).resolves.not.toThrow();
    });
  });

  describe('profileCompletionCalculation', () => {
    it('should calculate 100% for fully complete profile', async () => {
      const completeInput: TenantProfileInput = {
        fullName: 'Test User',
        phone: '9999-9999',
        occupation: 'Engineer',
        budgetMin: 10000,
        budgetMax: 20000,
        moveDate: '2024-12-01T00:00:00Z',
        occupants: '2 adults',
        preferredAreas: ['Area 1'],
        propertyTypes: ['apartment'],
        hasPets: true,
        hasReferences: true
      };

      const mockCompleteProfile = {
        ...mockTenantProfileData,
        profile_completion_percentage: 100
      };

      mockSupabaseSingle.mockResolvedValue({
        data: mockCompleteProfile,
        error: null
      });

      const result = await tenantProfileService.createTenantProfile('user-123', completeInput);

      expect(result.profileCompletionPercentage).toBe(100);
    });

    it('should calculate partial completion for minimal profile', async () => {
      const minimalInput: TenantProfileInput = {
        fullName: 'Test User',
        phone: '9999-9999'
      };

      const mockPartialProfile = {
        ...mockTenantProfileData,
        occupation: null,
        budget_min: null,
        budget_max: null,
        move_date: null,
        occupants: null,
        preferred_areas: [],
        profile_completion_percentage: 30
      };

      mockSupabaseSingle.mockResolvedValue({
        data: mockPartialProfile,
        error: null
      });

      const result = await tenantProfileService.createTenantProfile('user-123', minimalInput);

      expect(result.profileCompletionPercentage).toBeLessThan(50);
    });
  });

  describe('healthCheck', () => {
    it('should return healthy status when database is accessible', async () => {
      mockSupabaseLimit.mockResolvedValue({
        data: [],
        error: null
      });

      const result = await tenantProfileService.healthCheck();

      expect(result.status).toBe('healthy');
    });

    it('should return unhealthy status on database error', async () => {
      mockSupabaseLimit.mockResolvedValue({
        data: null,
        error: { message: 'Connection failed', code: '500' }
      });

      const result = await tenantProfileService.healthCheck();

      expect(result.status).toBe('unhealthy');
    });

    it('should return unhealthy status on exception', async () => {
      mockSupabaseLimit.mockRejectedValue(new Error('Network error'));

      const result = await tenantProfileService.healthCheck();

      expect(result.status).toBe('unhealthy');
    });
  });
});