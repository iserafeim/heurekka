import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { TRPCError } from '@trpc/server';

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
  phone: string;
  whatsappNumber: string;
  agentType: 'independent' | 'company_agent';
  companyName?: string;
  yearsExperience: string;
  licenseNumber?: string;
  specializations: string[];
  coverageAreas: string[];
  propertiesInManagement: string;
  credentialsUrl?: string;
  socialFacebook?: string;
  socialInstagram?: string;
  professionalBio?: string;
}

export interface PropertyCompanyInput {
  companyName: string;
  companyRtn: string;
  companyType: string;
  foundedYear?: number;
  mainPhone: string;
  whatsappBusiness: string;
  contactEmail?: string;
  website?: string;
  officeAddress: string;
  city: string;
  operationZones: string[];
  portfolioSize: string;
  portfolioTypes: string[];
  priceRangeMin?: number;
  priceRangeMax?: number;
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

      // Build update data
      const updateData = this.buildUpdateData(input);

      // Recalculate completion percentage if needed
      if (Object.keys(input).length > 0) {
        const mergedInput: any = { ...existingProfile, ...input };
        updateData.profile_completion_percentage = this.calculateProfileCompletion(mergedInput);
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
          license_number: input.licenseNumber,
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
          company_rtn: input.companyRtn,
          company_type: input.companyType,
          founded_year: input.foundedYear,
          main_phone: input.mainPhone,
          whatsapp_business: input.whatsappBusiness,
          contact_email: input.contactEmail,
          email: input.contactEmail,
          website: input.website,
          office_address: input.officeAddress,
          city: input.city,
          operation_zones: input.operationZones,
          portfolio_size: input.portfolioSize,
          portfolio_types: input.portfolioTypes,
          price_range_min: input.priceRangeMin,
          price_range_max: input.priceRangeMax,
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
      licenseNumber: data.license_number,
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