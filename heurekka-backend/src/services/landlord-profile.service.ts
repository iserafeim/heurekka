import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { TRPCError } from '@trpc/server';
import { getStorageService } from './storage.service';

// Types for landlord profiles
export type LandlordType = 'individual_owner' | 'real_estate_agent' | 'property_company';

export interface IndividualOwnerInput {
  fullName: string;
  phone: string;
  whatsappNumber: string;
  propertyCountRange?: string;
  propertyLocation?: string;
  rentalReason?: string;
}

export interface RealEstateAgentInput {
  fullName: string;
  professionalName?: string; // Frontend sends this instead of fullName
  phone: string;
  whatsappNumber: string;
  agentType: 'independent' | 'company_agent';
  companyName?: string;
  yearsExperience: string;
  yearsOfExperience?: string; // Frontend alias for yearsExperience
  specializations: string[];
  coverageAreas: string[];
  propertiesInManagement: string;
  propertiesManaged?: string; // Frontend alias for propertiesInManagement
  credentialsUrl?: string;
  socialFacebook?: string;
  socialInstagram?: string;
  professionalBio?: string;
}

export interface PropertyCompanyInput {
  companyName: string;
  foundedYear?: number;
  mainPhone: string;
  primaryPhone?: string; // Frontend alias for mainPhone
  whatsappBusiness: string;
  contactEmail?: string;
  website?: string;
  officeAddress: string;
  city: string;
  operationZones: string[];
  operatingAreas?: string[]; // Frontend alias for operationZones
  portfolioSize: string;
  portfolioTypes: string[];
  propertyTypes?: string[]; // Frontend alias for portfolioTypes
  companyLogoUrl?: string;
  licenseDocumentUrl?: string;
  companyDescription?: string;
}

export type LandlordProfileInput =
  | ({ landlordType: 'individual_owner' } & IndividualOwnerInput)
  | ({ landlordType: 'real_estate_agent' } & RealEstateAgentInput)
  | ({ landlordType: 'property_company' } & PropertyCompanyInput);

export interface LandlordProfile {
  id: string;
  userId: string;
  landlordType: LandlordType;
  businessName?: string;
  whatsappNumber: string;
  verificationStatus: string;
  rating: number;
  totalReviews: number;
  profileCompletionPercentage: number;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;

  // Type-specific fields
  fullName?: string;
  phone?: string;
  email?: string;
  companyName?: string;
  [key: string]: any; // For additional type-specific fields
}

class LandlordProfileService {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration for landlord profile service');
    }

    this.supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log('✅ Landlord Profile service initialized');
  }

  /**
   * Create a new landlord profile
   */
  async createLandlordProfile(userId: string, input: LandlordProfileInput): Promise<LandlordProfile> {
    try {
      // Check if profile already exists
      const existingProfile = await this.getLandlordProfileByUserId(userId);
      if (existingProfile) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Ya existe un perfil de arrendador para este usuario'
        });
      }

      // Validate input based on landlord type
      this.validateLandlordInput(input);

      // Sync user data to Supabase Auth for display in Auth table
      await this.syncUserAuthData(userId, input);

      // Build profile data based on type
      const profileData = this.buildProfileData(userId, input);

      // Calculate completion percentage
      const completionPercentage = this.calculateProfileCompletion(input);
      profileData.profile_completion_percentage = completionPercentage;

      // Create landlord profile
      const { data, error } = await this.supabase
        .from('landlords')
        .insert(profileData)
        .select()
        .single();

      if (error) {
        console.error('Error creating landlord profile:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'No se pudo crear el perfil de arrendador'
        });
      }

      return this.transformLandlordProfile(data);
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      console.error('Error creating landlord profile:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error al crear el perfil de arrendador'
      });
    }
  }

  /**
   * Get landlord profile by user ID
   */
  async getLandlordProfileByUserId(userId: string): Promise<LandlordProfile | null> {
    try {
      const { data, error } = await this.supabase
        .from('landlords')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching landlord profile:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al obtener el perfil de arrendador'
        });
      }

      if (!data) {
        return null;
      }

      return this.transformLandlordProfile(data);
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      console.error('Error getting landlord profile:', error);
      return null;
    }
  }

  /**
   * Get landlord profile by ID
   */
  async getLandlordProfileById(profileId: string): Promise<LandlordProfile | null> {
    try {
      const { data, error } = await this.supabase
        .from('landlords')
        .select('*')
        .eq('id', profileId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching landlord profile:', error);
        return null;
      }

      if (!data) {
        return null;
      }

      return this.transformLandlordProfile(data);
    } catch (error) {
      console.error('Error getting landlord profile:', error);
      return null;
    }
  }

  /**
   * Update landlord profile
   */
  async updateLandlordProfile(userId: string, input: Partial<LandlordProfileInput>): Promise<LandlordProfile> {
    try {
      const existingProfile = await this.getLandlordProfileByUserId(userId);
      if (!existingProfile) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Perfil de arrendador no encontrado'
        });
      }

      // Sync user data to Supabase Auth if name or phone changed
      await this.syncUserAuthData(userId, input);

      // Build update data
      const updateData = this.buildUpdateData(input);

      // Recalculate completion percentage if needed
      if (Object.keys(input).length > 0) {
        const mergedInput: any = { ...existingProfile, ...input };
        updateData.profile_completion_percentage = await this.calculateCompletionWithVerifications(userId, mergedInput);
      }

      updateData.last_active_at = new Date().toISOString();

      // Update profile
      const { data, error } = await this.supabase
        .from('landlords')
        .update(updateData)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating landlord profile:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al actualizar el perfil'
        });
      }

      return this.transformLandlordProfile(data);
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      console.error('Error updating landlord profile:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error al actualizar el perfil'
      });
    }
  }

  /**
   * Delete landlord profile
   */
  async deleteLandlordProfile(userId: string): Promise<{ success: boolean }> {
    try {
      const { error } = await this.supabase
        .from('landlords')
        .delete()
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting landlord profile:', error);
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
      console.error('Error deleting landlord profile:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error al eliminar el perfil'
      });
    }
  }

  /**
   * Convert Honduran phone number to E.164 format
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
  private async syncUserAuthData(userId: string, input: Partial<LandlordProfileInput>): Promise<void> {
    console.log('[Auth Sync] Starting sync for user:', userId);

    try {
      // Extract fullName and phone based on landlord type
      let fullName: string | undefined;
      let phone: string | undefined;

      // Priority: professionalName > fullName > companyName
      // For real estate agents, professionalName is the correct field
      if (input.professionalName) {
        fullName = input.professionalName;
      } else if (input.fullName) {
        fullName = input.fullName;
      } else if (input.companyName) {
        fullName = input.companyName;
      }

      if (input.phone) {
        phone = input.phone;
      } else if (input.mainPhone) {
        phone = input.mainPhone;
      } else if (input.primaryPhone) {
        phone = input.primaryPhone;
      }

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

      console.log(`[Auth Sync] ✅ Successfully updated user ${userId}`);
    } catch (error) {
      // Don't fail the profile creation/update if Auth sync fails
      console.error('[Auth Sync] Exception:', error);
    }
  }

  /**
   * Build profile data for insert based on landlord type
   */
  private buildProfileData(userId: string, input: LandlordProfileInput): any {
    const baseData = {
      user_id: userId,
      landlord_type: input.landlordType,
      whatsapp_number: (input as any).whatsappNumber || (input as any).whatsappBusiness
    };

    switch (input.landlordType) {
      case 'individual_owner':
        return {
          ...baseData,
          full_name: input.fullName,
          phone: input.phone,
          property_count_range: input.propertyCountRange,
          property_location: input.propertyLocation,
          rental_reason: input.rentalReason
        };

      case 'real_estate_agent':
        return {
          ...baseData,
          full_name: input.fullName,
          phone: input.phone,
          agent_type: input.agentType,
          company_name: input.companyName,
          years_experience: input.yearsExperience,
          specializations: input.specializations,
          coverage_areas: input.coverageAreas,
          properties_in_management: input.propertiesInManagement,
          credentials_url: input.credentialsUrl,
          social_facebook: input.socialFacebook,
          social_instagram: input.socialInstagram,
          professional_bio: input.professionalBio
        };

      case 'property_company':
        return {
          ...baseData,
          business_name: input.companyName,
          company_name: input.companyName,
          founded_year: input.foundedYear,
          main_phone: input.mainPhone || input.primaryPhone,
          phone: input.mainPhone || input.primaryPhone,
          whatsapp_business: input.whatsappBusiness,
          contact_email: input.contactEmail,
          email: input.contactEmail,
          website: input.website,
          office_address: input.officeAddress,
          city: input.city,
          operation_zones: input.operationZones || input.operatingAreas,
          portfolio_size: input.portfolioSize,
          portfolio_types: input.portfolioTypes || input.propertyTypes,
          company_logo_url: input.companyLogoUrl,
          license_document_url: input.licenseDocumentUrl,
          company_description: input.companyDescription
        };

      default:
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Tipo de arrendador inválido'
        });
    }
  }

  /**
   * Build update data
   */
  private buildUpdateData(input: Partial<LandlordProfileInput>): any {
    const updateData: any = {};

    // Common fields
    if ('whatsappNumber' in input) updateData.whatsapp_number = input.whatsappNumber;
    if ('fullName' in input) updateData.full_name = (input as any).fullName;
    if ('phone' in input) updateData.phone = (input as any).phone;

    // Type-specific fields
    if ('companyName' in input) {
      updateData.company_name = (input as any).companyName;
      updateData.business_name = (input as any).companyName;
    }
    if ('companyRtn' in input) updateData.company_rtn = (input as any).companyRtn;
    if ('agentType' in input) updateData.agent_type = (input as any).agentType;
    if ('yearsExperience' in input) updateData.years_experience = (input as any).yearsExperience;
    if ('specializations' in input) updateData.specializations = (input as any).specializations;
    if ('coverageAreas' in input) updateData.coverage_areas = (input as any).coverageAreas;
    if ('operationZones' in input) updateData.operation_zones = (input as any).operationZones;
    if ('portfolioTypes' in input) updateData.portfolio_types = (input as any).portfolioTypes;

    return updateData;
  }

  /**
   * Validate landlord input
   */
  private validateLandlordInput(input: LandlordProfileInput): void {
    switch (input.landlordType) {
      case 'individual_owner':
        if (!input.fullName || input.fullName.trim().length < 3) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'El nombre completo es requerido (mínimo 3 caracteres)'
          });
        }
        if (!input.phone || !/^[0-9]{4}-[0-9]{4}$/.test(input.phone)) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'El teléfono debe tener el formato 9999-9999'
          });
        }
        break;

      case 'real_estate_agent':
        if (!input.fullName || !input.phone) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Nombre y teléfono son requeridos'
          });
        }
        if (!input.coverageAreas || input.coverageAreas.length === 0) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Debe especificar al menos una zona de cobertura'
          });
        }
        break;

      case 'property_company':
        if (!input.companyName || !input.companyRtn) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Nombre de empresa y RTN son requeridos'
          });
        }
        if (input.companyRtn && !/^[0-9]{14}$/.test(input.companyRtn.replace(/-/g, ''))) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'RTN debe tener 14 dígitos'
          });
        }
        if (!input.operationZones || input.operationZones.length === 0) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Debe especificar al menos una zona de operación'
          });
        }
        break;
    }
  }

  /**
   * Calculate profile completion percentage
   */
  /**
   * Update profile completion percentage for a landlord
   * This should be called after profile updates or verification changes
   */
  async updateProfileCompletionPercentage(userId: string): Promise<void> {
    try {
      // Get current landlord profile
      const { data: landlord, error } = await this.supabase
        .from('landlords')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error || !landlord) {
        console.error('Error fetching landlord for completion update:', error);
        return;
      }

      // Calculate new completion percentage
      const newPercentage = await this.calculateCompletionWithVerifications(userId, landlord);

      // Update the percentage in landlords table
      await this.supabase
        .from('landlords')
        .update({ profile_completion_percentage: newPercentage })
        .eq('user_id', userId);

      // Also update overall_profile_completion in user_accounts
      await this.supabase
        .from('user_accounts')
        .update({ overall_profile_completion: newPercentage })
        .eq('user_id', userId);

      console.log(`[Profile Completion] Updated for user ${userId}: ${newPercentage}%`);
    } catch (error) {
      console.error('Error updating profile completion percentage:', error);
      // Don't throw - this is not critical
    }
  }

  /**
   * Calculate profile completion including verifications
   * 70% for profile fields (50% required + 20% optional)
   * 15% for email verification
   * 15% for phone verification
   */
  private async calculateCompletionWithVerifications(userId: string, input: any): Promise<number> {
    const baseScore = this.calculateProfileCompletion(input);
    const basePercentage = (baseScore / 100) * 70; // Scale base to 70%

    // Check verification status
    const { data: landlord } = await this.supabase
      .from('landlords')
      .select('email_verified, phone_verified')
      .eq('user_id', userId)
      .single();

    const emailVerificationScore = landlord?.email_verified ? 15 : 0;
    const phoneVerificationScore = landlord?.phone_verified ? 15 : 0;

    return Math.min(100, Math.round(basePercentage + emailVerificationScore + phoneVerificationScore));
  }

  private calculateProfileCompletion(input: any): number {
    const landlordType = input.landlordType || input.landlord_type;

    switch (landlordType) {
      case 'individual_owner':
        const individualFields = {
          fullName: 25,
          phone: 25,
          whatsappNumber: 20,
          propertyCountRange: 15,
          propertyLocation: 15
        };
        let individualPoints = 0;
        if (input.fullName || input.full_name) individualPoints += individualFields.fullName;
        if (input.phone) individualPoints += individualFields.phone;
        if (input.whatsappNumber || input.whatsapp_number) individualPoints += individualFields.whatsappNumber;
        if (input.propertyCountRange || input.property_count_range) individualPoints += individualFields.propertyCountRange;
        if (input.propertyLocation || input.property_location) individualPoints += individualFields.propertyLocation;
        return Math.min(100, individualPoints);

      case 'real_estate_agent':
        const agentFields = {
          fullName: 15,
          phone: 15,
          whatsappNumber: 15,
          yearsExperience: 10,
          specializations: 10,
          coverageAreas: 15,
          propertiesInManagement: 10,
          professionalBio: 10
        };
        let agentPoints = 0;
        if (input.fullName || input.full_name) agentPoints += agentFields.fullName;
        if (input.phone) agentPoints += agentFields.phone;
        if (input.whatsappNumber || input.whatsapp_number) agentPoints += agentFields.whatsappNumber;
        if (input.yearsExperience || input.years_experience) agentPoints += agentFields.yearsExperience;
        if ((input.specializations || input.specializations)?.length > 0) agentPoints += agentFields.specializations;
        if ((input.coverageAreas || input.coverage_areas)?.length > 0) agentPoints += agentFields.coverageAreas;
        if (input.propertiesInManagement || input.properties_in_management) agentPoints += agentFields.propertiesInManagement;
        if (input.professionalBio || input.professional_bio) agentPoints += agentFields.professionalBio;
        return Math.min(100, agentPoints);

      case 'property_company':
        const companyFields = {
          companyName: 15,
          companyRtn: 15,
          mainPhone: 10,
          whatsappBusiness: 10,
          officeAddress: 10,
          operationZones: 15,
          portfolioSize: 10,
          portfolioTypes: 10,
          companyDescription: 5
        };
        let companyPoints = 0;
        if (input.companyName || input.company_name) companyPoints += companyFields.companyName;
        if (input.companyRtn || input.company_rtn) companyPoints += companyFields.companyRtn;
        if (input.mainPhone || input.main_phone) companyPoints += companyFields.mainPhone;
        if (input.whatsappBusiness || input.whatsapp_business) companyPoints += companyFields.whatsappBusiness;
        if (input.officeAddress || input.office_address) companyPoints += companyFields.officeAddress;
        if ((input.operationZones || input.operation_zones)?.length > 0) companyPoints += companyFields.operationZones;
        if (input.portfolioSize || input.portfolio_size) companyPoints += companyFields.portfolioSize;
        if ((input.portfolioTypes || input.portfolio_types)?.length > 0) companyPoints += companyFields.portfolioTypes;
        if (input.companyDescription || input.company_description) companyPoints += companyFields.companyDescription;
        return Math.min(100, companyPoints);

      default:
        return 0;
    }
  }

  /**
   * Transform database record to LandlordProfile
   */
  private transformLandlordProfile(data: any): LandlordProfile {
    return {
      id: data.id,
      userId: data.user_id,
      landlordType: data.landlord_type,
      businessName: data.business_name,
      whatsappNumber: data.whatsapp_number,
      verificationStatus: data.verification_status || 'pending',
      rating: parseFloat(data.rating) || 0,
      totalReviews: data.total_reviews || 0,
      profileCompletionPercentage: data.profile_completion_percentage || 0,
      isVerified: data.is_verified || false,
      createdAt: data.created_at,
      updatedAt: data.updated_at,

      // Include all other fields
      fullName: data.full_name,
      phone: data.phone,
      email: data.email || data.contact_email,
      companyName: data.company_name,
      companyRtn: data.company_rtn,
      agentType: data.agent_type,
      yearsExperience: data.years_experience,
      specializations: data.specializations || [],
      coverageAreas: data.coverage_areas || [],
      propertiesInManagement: data.properties_in_management,
      credentialsUrl: data.credentials_url,
      socialFacebook: data.social_facebook,
      socialInstagram: data.social_instagram,
      professionalBio: data.professional_bio,
      companyType: data.company_type,
      foundedYear: data.founded_year,
      mainPhone: data.main_phone,
      whatsappBusiness: data.whatsapp_business,
      website: data.website,
      officeAddress: data.office_address,
      city: data.city,
      operationZones: data.operation_zones || [],
      portfolioSize: data.portfolio_size,
      portfolioTypes: data.portfolio_types || [],
      priceRangeMin: data.price_range_min,
      priceRangeMax: data.price_range_max,
      companyLogoUrl: data.company_logo_url,
      licenseDocumentUrl: data.license_document_url,
      companyDescription: data.company_description
    };
  }

  /**
   * Save onboarding progress
   */
  async saveOnboardingProgress(
    userId: string,
    step: number,
    formData: Partial<LandlordProfileInput>,
    skippedSteps?: string[]
  ): Promise<{ success: boolean; currentStep: number }> {
    try {
      console.log('[SaveOnboardingProgress] Saving progress:', JSON.stringify({
        userId,
        step,
        landlordType: formData.landlordType,
        skippedSteps
      }, null, 2));

      // Check if profile exists
      let profile = await this.getLandlordProfileByUserId(userId);

      if (!profile) {
        // Create minimal profile if doesn't exist
        const minimalData: any = {
          user_id: userId,
          landlord_type: formData.landlordType || 'individual_owner',
          onboarding_step: step,
          onboarding_data: formData,
          skipped_steps: skippedSteps || []
        };

        const { data, error } = await this.supabase
          .from('landlords')
          .insert(minimalData)
          .select()
          .single();

        if (error) {
          console.error('Error creating onboarding profile:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Error al guardar progreso de onboarding'
          });
        }

        return { success: true, currentStep: step };
      }

      // Update existing profile
      const { error } = await this.supabase
        .from('landlords')
        .update({
          onboarding_step: step,
          onboarding_data: formData,
          skipped_steps: skippedSteps || [],
          last_active_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating onboarding progress:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al guardar progreso'
        });
      }

      return { success: true, currentStep: step };
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      console.error('Error saving onboarding progress:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error al guardar progreso de onboarding'
      });
    }
  }

  /**
   * Get onboarding progress
   */
  async getOnboardingProgress(userId: string): Promise<{
    currentStep: number;
    formData: Partial<LandlordProfileInput>;
    completionScore: number;
    skippedSteps: string[];
  } | null> {
    try {
      const { data, error } = await this.supabase
        .from('landlords')
        .select('onboarding_step, onboarding_data, profile_completion_percentage, skipped_steps')
        .eq('user_id', userId)
        .maybeSingle();

      if (error || !data) {
        return null;
      }

      return {
        currentStep: data.onboarding_step || 0,
        formData: data.onboarding_data || {},
        completionScore: data.profile_completion_percentage || 0,
        skippedSteps: data.skipped_steps || []
      };
    } catch (error) {
      console.error('Error getting onboarding progress:', error);
      return null;
    }
  }

  /**
   * Complete onboarding
   */
  async completeOnboarding(userId: string): Promise<{ success: boolean; profileId: string }> {
    try {
      const profile = await this.getLandlordProfileByUserId(userId);

      if (!profile) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Perfil no encontrado'
        });
      }

      // Get onboarding data to copy to main columns
      const { data: landlordData, error: fetchError } = await this.supabase
        .from('landlords')
        .select('onboarding_data, landlord_type')
        .eq('user_id', userId)
        .single();

      if (fetchError || !landlordData) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al obtener datos de onboarding'
        });
      }

      const onboardingData = landlordData.onboarding_data || {};

      console.log('[CompleteOnboarding] Processing onboarding data for landlord type:', onboardingData.landlordType || landlordData.landlord_type);

      // Use landlordType from onboarding_data if available, otherwise fall back to landlord_type column
      // This allows users to change their type during onboarding
      const landlordType = onboardingData.landlordType || landlordData.landlord_type;

      // Prepare update data based on landlord type
      const updateData: any = {
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString(),
        last_active_at: new Date().toISOString(),
        landlord_type: landlordType // Update the landlord_type column with the correct value
      };

      // Copy common fields
      // For real_estate_agent, use professionalName instead of fullName
      if (landlordType === 'real_estate_agent') {
        // Try professionalName first, then fullName, then fall back to existing full_name in DB
        if (onboardingData.professionalName) {
          updateData.full_name = onboardingData.professionalName;
          console.log('[CompleteOnboarding] Using professionalName');
        } else if (onboardingData.fullName) {
          updateData.full_name = onboardingData.fullName;
          console.log('[CompleteOnboarding] Using fullName');
        } else if (profile.full_name) {
          // Keep existing name if no new one provided
          console.log('[CompleteOnboarding] Keeping existing full_name from DB');
        } else {
          console.warn('[CompleteOnboarding] No professionalName, fullName, or existing full_name found!');
        }
      } else if (onboardingData.fullName) {
        updateData.full_name = onboardingData.fullName;
      }
      if (onboardingData.phone) updateData.phone = onboardingData.phone;
      if (onboardingData.whatsappNumber) updateData.whatsapp_number = onboardingData.whatsappNumber;

      // Process profile photo if present
      if (onboardingData.profilePhotoUrl) {
        try {
          const storageService = getStorageService();

          // Check if it's a base64 image
          if (onboardingData.profilePhotoUrl.startsWith('data:image/')) {
            console.log('[CompleteOnboarding] Processing base64 profile photo');

            // Validate and decode base64 image
            const { buffer, mimeType } = storageService.validateAndDecodeBase64Image(onboardingData.profilePhotoUrl);

            // Upload to Supabase Storage
            const { url } = await storageService.uploadProfilePhoto(
              userId,
              buffer,
              mimeType,
              'profile-photo.jpg'
            );

            // Save public URL to profile
            updateData.profile_photo_url = url;
            console.log('[CompleteOnboarding] Profile photo uploaded successfully:', url);
          } else {
            // If it's already a URL, just copy it
            updateData.profile_photo_url = onboardingData.profilePhotoUrl;
            console.log('[CompleteOnboarding] Profile photo URL copied:', onboardingData.profilePhotoUrl);
          }
        } catch (error) {
          console.error('[CompleteOnboarding] Error processing profile photo:', error);
          // Don't fail onboarding if photo upload fails - just log it
        }
      }

      // Calculate profile completion percentage
      let completionScore = 0;
      const requiredFields: string[] = [];
      const providedFields: string[] = [];

      // Copy type-specific fields and track required/provided fields
      if (landlordType === 'individual_owner') {
        // Required fields for individual owner
        requiredFields.push('fullName', 'phone', 'whatsappNumber');

        if (onboardingData.fullName) providedFields.push('fullName');
        if (onboardingData.phone) providedFields.push('phone');
        if (onboardingData.whatsappNumber) providedFields.push('whatsappNumber');

        if (onboardingData.propertyCountRange) {
          updateData.property_count_range = onboardingData.propertyCountRange;
          providedFields.push('propertyCountRange');
        }
        if (onboardingData.primaryLocation) {
          updateData.property_location = onboardingData.primaryLocation;
          providedFields.push('primaryLocation');
        }
        if (onboardingData.rentingReason) {
          updateData.rental_reason = onboardingData.rentingReason;
          providedFields.push('rentingReason');
        }
      } else if (landlordType === 'real_estate_agent') {
        // Required fields for real estate agent
        requiredFields.push('fullName', 'phone', 'whatsappNumber', 'agentType', 'yearsExperience', 'specializations', 'coverageAreas');

        // Check for professionalName OR fullName
        if (onboardingData.professionalName || onboardingData.fullName) providedFields.push('fullName');
        if (onboardingData.phone) providedFields.push('phone');
        if (onboardingData.whatsappNumber) providedFields.push('whatsappNumber');

        if (onboardingData.agentType) {
          updateData.agent_type = onboardingData.agentType;
          providedFields.push('agentType');
        }
        if (onboardingData.companyName) {
          updateData.company_name = onboardingData.companyName;
          providedFields.push('companyName');
        }
        // Map yearsOfExperience from frontend to yearsExperience
        if (onboardingData.yearsExperience || onboardingData.yearsOfExperience) {
          updateData.years_experience = onboardingData.yearsExperience || onboardingData.yearsOfExperience;
          providedFields.push('yearsExperience');
        }
        if (onboardingData.specializations) {
          updateData.specializations = onboardingData.specializations;
          providedFields.push('specializations');
        }
        if (onboardingData.coverageAreas) {
          updateData.coverage_areas = onboardingData.coverageAreas;
          providedFields.push('coverageAreas');
        }
        // Map propertiesManaged from frontend to propertiesInManagement
        if (onboardingData.propertiesInManagement || onboardingData.propertiesManaged) {
          updateData.properties_in_management = onboardingData.propertiesInManagement || onboardingData.propertiesManaged;
          providedFields.push('propertiesInManagement');
        }
        if (onboardingData.professionalBio) {
          updateData.professional_bio = onboardingData.professionalBio;
          providedFields.push('professionalBio');
        }
      } else if (landlordType === 'property_company') {
        // Required fields for property company
        requiredFields.push('companyName', 'primaryPhone', 'whatsappBusiness', 'officeAddress', 'city', 'operatingAreas', 'portfolioSize');

        if (onboardingData.companyName) {
          updateData.company_name = onboardingData.companyName;
          updateData.business_name = onboardingData.companyName;
          updateData.full_name = onboardingData.companyName; // Use company name as full_name
          providedFields.push('companyName');
        }
        if (onboardingData.foundedYear) {
          updateData.founded_year = onboardingData.foundedYear;
          providedFields.push('foundedYear');
        }
        // Map primaryPhone or mainPhone to phone column
        if (onboardingData.primaryPhone || onboardingData.mainPhone) {
          updateData.phone = onboardingData.primaryPhone || onboardingData.mainPhone;
          updateData.main_phone = onboardingData.primaryPhone || onboardingData.mainPhone;
          providedFields.push('primaryPhone');
        }
        if (onboardingData.whatsappBusiness) {
          updateData.whatsapp_number = onboardingData.whatsappBusiness;
          providedFields.push('whatsappBusiness');
        }
        if (onboardingData.contactEmail) {
          updateData.contact_email = onboardingData.contactEmail;
          providedFields.push('contactEmail');
        }
        if (onboardingData.website) {
          updateData.website = onboardingData.website;
          providedFields.push('website');
        }
        if (onboardingData.officeAddress) {
          updateData.office_address = onboardingData.officeAddress;
          providedFields.push('officeAddress');
        }
        if (onboardingData.city) {
          updateData.city = onboardingData.city;
          providedFields.push('city');
        }
        // Map operatingAreas or operationZones to operation_zones column
        if (onboardingData.operatingAreas || onboardingData.operationZones) {
          updateData.operation_zones = onboardingData.operatingAreas || onboardingData.operationZones;
          providedFields.push('operatingAreas');
        }
        if (onboardingData.portfolioSize) {
          updateData.portfolio_size = onboardingData.portfolioSize;
          providedFields.push('portfolioSize');
        }
        // Map propertyTypes or portfolioTypes to portfolio_types column
        if (onboardingData.propertyTypes || onboardingData.portfolioTypes) {
          updateData.portfolio_types = onboardingData.propertyTypes || onboardingData.portfolioTypes;
          providedFields.push('propertyTypes');
        }
        if (onboardingData.companyDescription) {
          updateData.company_description = onboardingData.companyDescription;
          providedFields.push('companyDescription');
        }
      }

      // Add profile photo to completion calculation if present
      if (updateData.profile_photo_url) {
        providedFields.push('profilePhoto');
      }

      // Calculate profile completion percentage
      // 70% for profile fields (50% required + 20% optional)
      // 15% for email verification
      // 15% for phone verification

      const requiredCount = requiredFields.length;
      const requiredProvided = requiredFields.filter(field => providedFields.includes(field)).length;
      const requiredScore = requiredCount > 0 ? (requiredProvided / requiredCount) * 50 : 0; // 50% weight for required fields

      const optionalProvided = providedFields.length - requiredProvided;
      const optionalScore = Math.min(20, optionalProvided * 5); // 20% weight for optional fields

      // Check verification status from existing landlord record
      const { data: existingLandlord } = await this.supabase
        .from('landlords')
        .select('email_verified, phone_verified')
        .eq('user_id', userId)
        .single();

      const emailVerificationScore = existingLandlord?.email_verified ? 15 : 0;
      const phoneVerificationScore = existingLandlord?.phone_verified ? 15 : 0;

      completionScore = Math.min(100, Math.round(requiredScore + optionalScore + emailVerificationScore + phoneVerificationScore));
      updateData.profile_completion_percentage = completionScore;

      console.log('[Profile Completion] Calculation details:', {
        landlordType,
        requiredFields,
        providedFields,
        requiredCount,
        requiredProvided,
        optionalProvided,
        requiredScore,
        optionalScore,
        emailVerificationScore,
        phoneVerificationScore,
        finalScore: completionScore
      });

      // Update profile with onboarding data copied to main columns
      const { error } = await this.supabase
        .from('landlords')
        .update(updateData)
        .eq('user_id', userId);

      if (error) {
        console.error('Error completing onboarding:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al completar onboarding'
        });
      }

      // Update user_accounts to mark has_landlord_profile and sync profile data
      await this.supabase
        .from('user_accounts')
        .update({
          has_landlord_profile: true,
          active_context: 'landlord',
          overall_profile_completion: completionScore,
          onboarding_completed: true
        })
        .eq('user_id', userId);

      // Create initial portfolio_stats record
      const { error: portfolioError } = await this.supabase
        .from('portfolio_stats')
        .insert({
          landlord_id: profile.id,
          total_properties: 0,
          active_properties: 0,
          rented_properties: 0,
          inactive_properties: 0,
          total_views: 0,
          total_saves: 0,
          total_inquiries: 0,
          conversion_rate: 0,
          total_responses: 0,
          verified_properties_count: 0,
          featured_properties_count: 0,
          last_calculated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (portfolioError && portfolioError.code !== '23505') {
        // Ignore duplicate key error (already exists), log other errors
        console.error('Error creating portfolio stats:', portfolioError);
      }

      // Sync user data to Supabase Auth
      console.log('[CompleteOnboarding] Syncing auth data for user:', userId);
      await this.syncUserAuthData(userId, onboardingData);

      // TODO: Trigger welcome notification

      return { success: true, profileId: profile.id };
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      console.error('Error completing onboarding:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error al completar onboarding'
      });
    }
  }

  /**
   * Update profile photo URL
   */
  async updateProfilePhoto(userId: string, photoUrl: string): Promise<LandlordProfile> {
    try {
      const { data, error } = await this.supabase
        .from('landlords')
        .update({
          profile_photo_url: photoUrl,
          last_active_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile photo:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al actualizar foto de perfil'
        });
      }

      return this.transformLandlordProfile(data);
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      console.error('Error updating profile photo:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error al actualizar foto'
      });
    }
  }

  /**
   * Get portfolio statistics
   */
  async getPortfolioStats(landlordId: string): Promise<{
    totalProperties: number;
    activeProperties: number;
    rentedProperties: number;
    totalViews: number;
    totalInquiries: number;
    conversionRate: number;
    averageResponseTimeHours: number;
    responseRate: number;
  }> {
    try {
      // Get data from portfolio_stats table
      const { data: stats } = await this.supabase
        .from('portfolio_stats')
        .select('*')
        .eq('landlord_id', landlordId)
        .maybeSingle();

      if (!stats) {
        // Return zeros if no stats exist yet
        return {
          totalProperties: 0,
          activeProperties: 0,
          rentedProperties: 0,
          totalViews: 0,
          totalInquiries: 0,
          conversionRate: 0,
          averageResponseTimeHours: 0,
          responseRate: 0
        };
      }

      return {
        totalProperties: stats.total_properties || 0,
        activeProperties: stats.active_properties || 0,
        rentedProperties: stats.rented_properties || 0,
        totalViews: stats.total_views || 0,
        totalInquiries: stats.total_inquiries || 0,
        conversionRate: stats.conversion_rate || 0,
        averageResponseTimeHours: stats.average_response_time_hours || 0,
        responseRate: stats.response_rate || 0
      };
    } catch (error) {
      console.error('Error getting portfolio stats:', error);
      // Return zeros on error instead of throwing
      return {
        totalProperties: 0,
        activeProperties: 0,
        rentedProperties: 0,
        totalViews: 0,
        totalInquiries: 0,
        conversionRate: 0,
        averageResponseTimeHours: 0,
        responseRate: 0
      };
    }
  }

  /**
   * Calculate and update portfolio statistics
   * Should be called when properties are created/updated
   */
  async calculatePortfolioStats(landlordId: string): Promise<void> {
    try {
      // Get property counts from properties table
      const { data: properties } = await this.supabase
        .from('properties')
        .select('status')
        .eq('landlord_id', landlordId);

      if (!properties) {
        return;
      }

      const totalProperties = properties.length;
      const activeProperties = properties.filter((p) => p.status === 'active').length;
      const rentedProperties = properties.filter((p) => p.status === 'rented').length;

      // Update or create portfolio stats
      const { error } = await this.supabase
        .from('portfolio_stats')
        .upsert({
          landlord_id: landlordId,
          total_properties: totalProperties,
          active_properties: activeProperties,
          rented_properties: rentedProperties,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error updating portfolio stats:', error);
      }
    } catch (error) {
      console.error('Error calculating portfolio stats:', error);
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy' }> {
    try {
      const { error } = await this.supabase
        .from('landlords')
        .select('id')
        .limit(1);

      return { status: error ? 'unhealthy' : 'healthy' };
    } catch (error) {
      return { status: 'unhealthy' };
    }
  }
}

// Export singleton instance
let landlordProfileServiceInstance: LandlordProfileService | null = null;

export function getLandlordProfileService(): LandlordProfileService {
  if (!landlordProfileServiceInstance) {
    landlordProfileServiceInstance = new LandlordProfileService();
  }
  return landlordProfileServiceInstance;
}

export default LandlordProfileService;