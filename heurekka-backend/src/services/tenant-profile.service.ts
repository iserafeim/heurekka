import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { TRPCError } from '@trpc/server';

// Types for tenant profiles
export interface TenantProfileInput {
  fullName: string;
  phone: string;
  occupation?: string;
  budgetMin?: number;
  budgetMax?: number;
  moveDate?: string; // ISO date string
  occupants?: string;
  preferredAreas?: string[];
  propertyTypes?: string[];
  hasPets?: boolean;
  petDetails?: string;
  hasReferences?: boolean;
  messageToLandlords?: string;
}

export interface TenantProfile {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  phoneVerified: boolean;
  occupation?: string;
  profilePhotoUrl?: string;
  budgetMin?: number;
  budgetMax?: number;
  moveDate?: string;
  occupants?: string;
  preferredAreas?: string[];
  propertyTypes?: string[];
  hasPets: boolean;
  petDetails?: string;
  hasReferences: boolean;
  messageToLandlords?: string;
  profileCompletionPercentage: number;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastActiveAt: string;
}

export interface UpdateTenantProfileInput extends Partial<TenantProfileInput> {
  profilePhotoUrl?: string;
}

class TenantProfileService {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration for tenant profile service');
    }

    this.supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log('✅ Tenant Profile service initialized');
  }

  /**
   * Create a new tenant profile
   */
  async createTenantProfile(userId: string, input: TenantProfileInput): Promise<TenantProfile> {
    try {
      // Validate required fields
      this.validateTenantProfileInput(input);

      // Check if profile already exists
      const existingProfile = await this.getTenantProfileByUserId(userId);
      if (existingProfile) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Ya existe un perfil de inquilino para este usuario'
        });
      }

      // Calculate profile completion percentage
      const completionPercentage = this.calculateProfileCompletion(input);

      // Create tenant profile
      const { data, error } = await this.supabase
        .from('tenant_profiles')
        .insert({
          user_id: userId,
          full_name: input.fullName,
          phone: input.phone,
          occupation: input.occupation,
          budget_min: input.budgetMin,
          budget_max: input.budgetMax,
          move_date: input.moveDate,
          occupants: input.occupants,
          preferred_areas: input.preferredAreas || [],
          property_types: input.propertyTypes || ['apartment', 'house'],
          has_pets: input.hasPets || false,
          pet_details: input.petDetails,
          has_references: input.hasReferences || false,
          message_to_landlords: input.messageToLandlords,
          profile_completion_percentage: completionPercentage
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating tenant profile:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'No se pudo crear el perfil de inquilino'
        });
      }

      return this.transformTenantProfile(data);
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      console.error('Error creating tenant profile:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error al crear el perfil de inquilino'
      });
    }
  }

  /**
   * Get tenant profile by user ID
   */
  async getTenantProfileByUserId(userId: string): Promise<TenantProfile | null> {
    try {
      const { data, error } = await this.supabase
        .from('tenant_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching tenant profile:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al obtener el perfil de inquilino'
        });
      }

      if (!data) {
        return null;
      }

      return this.transformTenantProfile(data);
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      console.error('Error getting tenant profile:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error al obtener el perfil'
      });
    }
  }

  /**
   * Get tenant profile by ID
   */
  async getTenantProfileById(profileId: string): Promise<TenantProfile | null> {
    try {
      const { data, error } = await this.supabase
        .from('tenant_profiles')
        .select('*')
        .eq('id', profileId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching tenant profile:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al obtener el perfil'
        });
      }

      if (!data) {
        return null;
      }

      return this.transformTenantProfile(data);
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      console.error('Error getting tenant profile:', error);
      return null;
    }
  }

  /**
   * Update tenant profile
   */
  async updateTenantProfile(userId: string, input: UpdateTenantProfileInput): Promise<TenantProfile> {
    try {
      // Get existing profile
      const existingProfile = await this.getTenantProfileByUserId(userId);
      if (!existingProfile) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Perfil de inquilino no encontrado'
        });
      }

      // Merge with existing data for completion calculation
      const mergedData = {
        ...existingProfile,
        ...input
      };

      // Calculate new completion percentage
      const completionPercentage = this.calculateProfileCompletion(mergedData);

      // Update profile
      const { data, error } = await this.supabase
        .from('tenant_profiles')
        .update({
          full_name: input.fullName,
          phone: input.phone,
          occupation: input.occupation,
          profile_photo_url: input.profilePhotoUrl,
          budget_min: input.budgetMin,
          budget_max: input.budgetMax,
          move_date: input.moveDate,
          occupants: input.occupants,
          preferred_areas: input.preferredAreas,
          property_types: input.propertyTypes,
          has_pets: input.hasPets,
          pet_details: input.petDetails,
          has_references: input.hasReferences,
          message_to_landlords: input.messageToLandlords,
          profile_completion_percentage: completionPercentage,
          last_active_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating tenant profile:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al actualizar el perfil'
        });
      }

      return this.transformTenantProfile(data);
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      console.error('Error updating tenant profile:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error al actualizar el perfil'
      });
    }
  }

  /**
   * Delete tenant profile
   */
  async deleteTenantProfile(userId: string): Promise<{ success: boolean }> {
    try {
      const { error } = await this.supabase
        .from('tenant_profiles')
        .delete()
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting tenant profile:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al eliminar el perfil'
        });
      }

      return { success: true };
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      console.error('Error deleting tenant profile:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error al eliminar el perfil'
      });
    }
  }

  /**
   * Update phone verification status
   */
  async updatePhoneVerification(userId: string, verified: boolean): Promise<void> {
    try {
      await this.supabase
        .from('tenant_profiles')
        .update({ phone_verified: verified })
        .eq('user_id', userId);
    } catch (error) {
      console.error('Error updating phone verification:', error);
      // Don't throw - this is not critical
    }
  }

  /**
   * Validate tenant profile input
   */
  private validateTenantProfileInput(input: TenantProfileInput): void {
    if (!input.fullName || input.fullName.trim().length < 3) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'El nombre completo debe tener al menos 3 caracteres'
      });
    }

    if (!input.phone || !/^[0-9]{4}-[0-9]{4}$/.test(input.phone)) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'El teléfono debe tener el formato 9999-9999'
      });
    }

    if (input.budgetMin && input.budgetMax && input.budgetMin > input.budgetMax) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'El presupuesto máximo debe ser mayor al mínimo'
      });
    }

    if (input.moveDate) {
      const moveDate = new Date(input.moveDate);
      const today = new Date();
      const sixMonthsFromNow = new Date();
      sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);

      if (moveDate < today || moveDate > sixMonthsFromNow) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'La fecha de mudanza debe estar entre hoy y 6 meses'
        });
      }
    }
  }

  /**
   * Calculate profile completion percentage
   */
  private calculateProfileCompletion(profile: Partial<TenantProfileInput>): number {
    const fields = {
      fullName: 15,
      phone: 15,
      occupation: 10,
      budgetMin: 10,
      budgetMax: 10,
      moveDate: 10,
      occupants: 10,
      preferredAreas: 10,
      propertyTypes: 5,
      hasPets: 5
    };

    let completedPoints = 0;

    if (profile.fullName) completedPoints += fields.fullName;
    if (profile.phone) completedPoints += fields.phone;
    if (profile.occupation) completedPoints += fields.occupation;
    if (profile.budgetMin) completedPoints += fields.budgetMin;
    if (profile.budgetMax) completedPoints += fields.budgetMax;
    if (profile.moveDate) completedPoints += fields.moveDate;
    if (profile.occupants) completedPoints += fields.occupants;
    if (profile.preferredAreas && profile.preferredAreas.length > 0) completedPoints += fields.preferredAreas;
    if (profile.propertyTypes && profile.propertyTypes.length > 0) completedPoints += fields.propertyTypes;
    if (profile.hasPets !== undefined) completedPoints += fields.hasPets;

    return Math.min(100, completedPoints);
  }

  /**
   * Transform database record to TenantProfile
   */
  private transformTenantProfile(data: any): TenantProfile {
    return {
      id: data.id,
      userId: data.user_id,
      fullName: data.full_name,
      phone: data.phone,
      phoneVerified: data.phone_verified || false,
      occupation: data.occupation,
      profilePhotoUrl: data.profile_photo_url,
      budgetMin: data.budget_min,
      budgetMax: data.budget_max,
      moveDate: data.move_date,
      occupants: data.occupants,
      preferredAreas: data.preferred_areas || [],
      propertyTypes: data.property_types || [],
      hasPets: data.has_pets || false,
      petDetails: data.pet_details,
      hasReferences: data.has_references || false,
      messageToLandlords: data.message_to_landlords,
      profileCompletionPercentage: data.profile_completion_percentage || 0,
      isVerified: data.is_verified || false,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      lastActiveAt: data.last_active_at
    };
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy' }> {
    try {
      const { error } = await this.supabase
        .from('tenant_profiles')
        .select('id')
        .limit(1);

      return { status: error ? 'unhealthy' : 'healthy' };
    } catch (error) {
      return { status: 'unhealthy' };
    }
  }
}

// Export singleton instance
let tenantProfileServiceInstance: TenantProfileService | null = null;

export function getTenantProfileService(): TenantProfileService {
  if (!tenantProfileServiceInstance) {
    tenantProfileServiceInstance = new TenantProfileService();
  }
  return tenantProfileServiceInstance;
}

export default TenantProfileService;