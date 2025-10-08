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

export interface ProfileCompletionStatus {
  percentage: number;
  missingFields: string[];
  completedFields: string[];
  nextSteps: string[];
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

      // Sync user data to Supabase Auth
      await this.syncUserAuthData(userId, input);

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

      // Sync user data to Supabase Auth
      await this.syncUserAuthData(userId, input);

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
   * Convert phone number to E.164 format for Supabase Auth
   */
  private convertToE164(phone: string): string | null {
    if (!phone) return null;

    // Remove all non-digit characters
    const digitsOnly = phone.replace(/\D/g, '');

    // If it already starts with 504, add the +
    if (digitsOnly.startsWith('504') && digitsOnly.length === 11) {
      return `+${digitsOnly}`;
    }

    // If it's 8 digits, add +504
    if (digitsOnly.length === 8) {
      return `+504${digitsOnly}`;
    }

    // If it starts with 504 but has wrong length or other cases, return null
    console.log(`[Auth Sync] Invalid phone number format (${digitsOnly.length} digits)`);
    return null;
  }

  /**
   * Sync user data to Supabase Auth for display in Auth table
   */
  private async syncUserAuthData(userId: string, input: Partial<TenantProfileInput>): Promise<void> {
    console.log('[Auth Sync] Starting sync for tenant user:', userId);

    try {
      const fullName = input.fullName;
      const phone = input.phone;

      console.log('[Auth Sync] Extracted data for sync (PII redacted)');

      // Only update if we have values to update
      if (!fullName && !phone) {
        console.log('[Auth Sync] No data to sync, skipping');
        return;
      }

      // Get current user to preserve existing metadata
      console.log('[Auth Sync] Fetching current user...');
      const { data: currentUser, error: getUserError } = await this.supabase.auth.admin.getUserById(userId);

      if (getUserError) {
        console.error('[Auth Sync] Error fetching user:', getUserError);
        return;
      }

      if (!currentUser?.user) {
        console.error('[Auth Sync] User not found:', userId);
        return;
      }

      console.log('[Auth Sync] Current user data retrieved');

      // Build update object - always update user_metadata if we have fullName
      const updateData: { user_metadata?: any; phone?: string } = {};

      // Always preserve and update user_metadata if we have a name
      if (fullName) {
        updateData.user_metadata = {
          ...currentUser.user.user_metadata,
          full_name: fullName
        };
      }

      // Convert phone to E.164 format for Supabase Auth
      if (phone) {
        const e164Phone = this.convertToE164(phone);
        if (e164Phone) {
          updateData.phone = e164Phone;
          console.log('[Auth Sync] Phone converted to E.164 format');
        } else {
          console.log('[Auth Sync] Skipping phone update - invalid format');
        }
      }

      console.log('[Auth Sync] Preparing user update with', Object.keys(updateData).join(', '));

      // Update user in Supabase Auth
      const { error } = await this.supabase.auth.admin.updateUserById(userId, updateData);

      if (error) {
        console.error('[Auth Sync] Error updating user:', error);
        return;
      }

      console.log(`[Auth Sync] ✅ Successfully updated tenant user ${userId}`);
    } catch (error) {
      // Don't fail the profile creation/update if Auth sync fails
      console.error('[Auth Sync] Exception:', error);
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
   * Get profile completion status with detailed breakdown
   */
  async getProfileCompletionStatus(userId: string): Promise<ProfileCompletionStatus> {
    try {
      const profile = await this.getTenantProfileByUserId(userId);

      if (!profile) {
        return {
          percentage: 0,
          missingFields: ['fullName', 'phone', 'budgetMin', 'budgetMax', 'moveDate', 'preferredAreas'],
          completedFields: [],
          nextSteps: [
            'Completa tu nombre completo',
            'Agrega tu número de teléfono',
            'Define tu presupuesto',
            'Indica tu fecha de mudanza',
            'Selecciona tus zonas preferidas'
          ]
        };
      }

      const fieldStatus = this.getFieldCompletionStatus(profile);
      const nextSteps = this.getNextSteps(fieldStatus.missingFields);

      return {
        percentage: profile.profileCompletionPercentage,
        missingFields: fieldStatus.missingFields,
        completedFields: fieldStatus.completedFields,
        nextSteps
      };
    } catch (error) {
      console.error('Error getting profile completion status:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error al obtener el estado del perfil'
      });
    }
  }

  /**
   * Get field completion status
   */
  private getFieldCompletionStatus(profile: TenantProfile): {
    missingFields: string[];
    completedFields: string[];
  } {
    const allFields = {
      fullName: profile.fullName,
      phone: profile.phone,
      occupation: profile.occupation,
      budgetMin: profile.budgetMin,
      budgetMax: profile.budgetMax,
      moveDate: profile.moveDate,
      occupants: profile.occupants,
      preferredAreas: profile.preferredAreas && profile.preferredAreas.length > 0,
      propertyTypes: profile.propertyTypes && profile.propertyTypes.length > 0,
      hasPets: profile.hasPets !== undefined
    };

    const missingFields: string[] = [];
    const completedFields: string[] = [];

    Object.entries(allFields).forEach(([field, value]) => {
      if (value) {
        completedFields.push(field);
      } else {
        missingFields.push(field);
      }
    });

    return { missingFields, completedFields };
  }

  /**
   * Get next steps based on missing fields
   */
  private getNextSteps(missingFields: string[]): string[] {
    const stepMapping: Record<string, string> = {
      fullName: 'Completa tu nombre completo',
      phone: 'Agrega tu número de teléfono',
      occupation: 'Indica tu ocupación',
      budgetMin: 'Define tu presupuesto mínimo',
      budgetMax: 'Define tu presupuesto máximo',
      moveDate: 'Indica tu fecha de mudanza',
      occupants: 'Especifica cuántas personas vivirán',
      preferredAreas: 'Selecciona tus zonas preferidas',
      propertyTypes: 'Elige los tipos de propiedad que buscas',
      hasPets: 'Indica si tienes mascotas'
    };

    // Return steps for the most important missing fields (max 3)
    const priorityFields = ['budgetMin', 'budgetMax', 'moveDate', 'preferredAreas', 'fullName', 'phone'];
    const priorityMissing = priorityFields.filter(f => missingFields.includes(f));

    return priorityMissing.slice(0, 3).map(field => stepMapping[field] || `Completa ${field}`);
  }

  /**
   * Check if profile is complete enough for property contact
   */
  async canContactProperties(userId: string): Promise<{
    canContact: boolean;
    reason?: string;
    missingFields?: string[];
  }> {
    try {
      const profile = await this.getTenantProfileByUserId(userId);

      if (!profile) {
        return {
          canContact: false,
          reason: 'Debes crear un perfil antes de contactar propiedades',
          missingFields: ['fullName', 'phone', 'budgetMin', 'budgetMax']
        };
      }

      // Required fields for contact
      const requiredFields = ['fullName', 'phone', 'budgetMin', 'budgetMax'];
      const missing: string[] = [];

      if (!profile.fullName) missing.push('fullName');
      if (!profile.phone) missing.push('phone');
      if (!profile.budgetMin) missing.push('budgetMin');
      if (!profile.budgetMax) missing.push('budgetMax');

      if (missing.length > 0) {
        return {
          canContact: false,
          reason: 'Completa los campos requeridos para contactar propiedades',
          missingFields: missing
        };
      }

      return { canContact: true };
    } catch (error) {
      console.error('Error checking contact permission:', error);
      return {
        canContact: false,
        reason: 'Error al verificar el perfil'
      };
    }
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