import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { TRPCError } from '@trpc/server';

/**
 * Badge types for landlord achievements
 */
export type BadgeType =
  | 'verified_phone'
  | 'verified_email'
  | 'verified_identity'
  | 'verified_business'
  | 'verified_professional'
  | 'first_listing'
  | 'five_listings'
  | 'ten_listings'
  | 'quick_responder'
  | 'highly_rated'
  | 'trusted_landlord'
  | 'premium_member'
  | 'early_adopter'
  | 'complete_profile';

export interface Badge {
  id: string;
  landlordId: string;
  badgeType: BadgeType;
  badgeName: string;
  badgeDescription: string;
  badgeIcon: string;
  awardedAt: Date;
  metadata?: any;
}

/**
 * Landlord Badges Service
 * Manages gamification badges for landlord achievements
 */
class LandlordBadgesService {
  private supabase: SupabaseClient;

  // Badge definitions
  private readonly BADGE_DEFINITIONS: Record<
    BadgeType,
    { name: string; description: string; icon: string }
  > = {
    verified_phone: {
      name: 'Teléfono Verificado',
      description: 'Has verificado tu número de teléfono',
      icon: '📱'
    },
    verified_email: {
      name: 'Email Verificado',
      description: 'Has verificado tu correo electrónico',
      icon: '✉️'
    },
    verified_identity: {
      name: 'Identidad Verificada',
      description: 'Has verificado tu identidad con documento oficial',
      icon: '🆔'
    },
    verified_business: {
      name: 'Negocio Verificado',
      description: 'Has verificado tu empresa con documentación legal',
      icon: '🏢'
    },
    verified_professional: {
      name: 'Profesional Verificado',
      description: 'Has verificado tus credenciales profesionales',
      icon: '👔'
    },
    first_listing: {
      name: 'Primera Publicación',
      description: 'Has publicado tu primera propiedad',
      icon: '🏠'
    },
    five_listings: {
      name: '5 Propiedades',
      description: 'Has publicado 5 propiedades',
      icon: '🏘️'
    },
    ten_listings: {
      name: '10 Propiedades',
      description: 'Has publicado 10 propiedades',
      icon: '🏙️'
    },
    quick_responder: {
      name: 'Respuesta Rápida',
      description: 'Respondes consultas en menos de 2 horas',
      icon: '⚡'
    },
    highly_rated: {
      name: 'Altamente Calificado',
      description: 'Tienes una calificación promedio de 4.5 o superior',
      icon: '⭐'
    },
    trusted_landlord: {
      name: 'Arrendador de Confianza',
      description: 'Has completado 10 alquileres exitosos',
      icon: '🤝'
    },
    premium_member: {
      name: 'Miembro Premium',
      description: 'Has alcanzado el nivel de verificación premium',
      icon: '💎'
    },
    early_adopter: {
      name: 'Adoptador Temprano',
      description: 'Te uniste en los primeros 6 meses de la plataforma',
      icon: '🚀'
    },
    complete_profile: {
      name: 'Perfil Completo',
      description: 'Has completado el 100% de tu perfil',
      icon: '✅'
    }
  };

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration for badges service');
    }

    this.supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log('✅ Landlord Badges service initialized');
  }

  /**
   * Award a badge to a landlord
   */
  async awardBadge(
    landlordId: string,
    badgeType: BadgeType,
    metadata?: any
  ): Promise<Badge> {
    try {
      // Check if badge already exists
      const existing = await this.hasBadge(landlordId, badgeType);
      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Este badge ya ha sido otorgado'
        });
      }

      const badgeInfo = this.BADGE_DEFINITIONS[badgeType];

      if (!badgeInfo) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Tipo de badge inválido'
        });
      }

      // Create badge record
      const { data, error } = await this.supabase
        .from('profile_badges')
        .insert({
          landlord_id: landlordId,
          badge_type: badgeType,
          badge_name: badgeInfo.name,
          badge_description: badgeInfo.description,
          badge_icon: badgeInfo.icon,
          metadata: metadata || {}
        })
        .select()
        .single();

      if (error) {
        console.error('Error awarding badge:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al otorgar el badge'
        });
      }

      return this.transformBadge(data);
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      console.error('Error awarding badge:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error al otorgar badge'
      });
    }
  }

  /**
   * Get all badges for a landlord
   */
  async getBadges(landlordId: string): Promise<Badge[]> {
    try {
      const { data, error } = await this.supabase
        .from('profile_badges')
        .select('*')
        .eq('landlord_id', landlordId)
        .order('awarded_at', { ascending: false });

      if (error) {
        console.error('Error fetching badges:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al obtener badges'
        });
      }

      return data ? data.map(this.transformBadge) : [];
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      console.error('Error getting badges:', error);
      return [];
    }
  }

  /**
   * Check if landlord has a specific badge
   */
  async hasBadge(landlordId: string, badgeType: BadgeType): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('profile_badges')
        .select('id')
        .eq('landlord_id', landlordId)
        .eq('badge_type', badgeType)
        .maybeSingle();

      return !!data;
    } catch (error) {
      console.error('Error checking badge:', error);
      return false;
    }
  }

  /**
   * Check and award automatic badges based on landlord activity
   */
  async checkAndAwardBadges(landlordId: string): Promise<Badge[]> {
    const awardedBadges: Badge[] = [];

    try {
      console.log('[Badges] Starting badge check for landlord:', landlordId);

      // Get landlord profile
      const { data: landlord, error: landlordError } = await this.supabase
        .from('landlords')
        .select('*, properties:properties(count)')
        .eq('id', landlordId)
        .single();

      if (landlordError) {
        console.error('[Badges] Error fetching landlord:', landlordError);
        return awardedBadges;
      }

      if (!landlord) {
        console.log('[Badges] Landlord not found');
        return awardedBadges;
      }

      console.log('[Badges] Landlord data:', {
        id: landlord.id,
        profile_completion_percentage: landlord.profile_completion_percentage,
        created_at: landlord.created_at,
        phone_verified: landlord.phone_verified,
        email_verified: landlord.email_verified
      });

      // Check verification badges
      if (landlord.phone_verified && !(await this.hasBadge(landlordId, 'verified_phone'))) {
        console.log('[Badges] Awarding verified_phone badge');
        const badge = await this.awardBadge(landlordId, 'verified_phone');
        awardedBadges.push(badge);
      }

      if (landlord.email_verified && !(await this.hasBadge(landlordId, 'verified_email'))) {
        console.log('[Badges] Awarding verified_email badge');
        const badge = await this.awardBadge(landlordId, 'verified_email');
        awardedBadges.push(badge);
      }

      if (landlord.identity_verified && !(await this.hasBadge(landlordId, 'verified_identity'))) {
        console.log('[Badges] Awarding verified_identity badge');
        const badge = await this.awardBadge(landlordId, 'verified_identity');
        awardedBadges.push(badge);
      }

      if (
        landlord.business_license_verified &&
        !(await this.hasBadge(landlordId, 'verified_business'))
      ) {
        console.log('[Badges] Awarding verified_business badge');
        const badge = await this.awardBadge(landlordId, 'verified_business');
        awardedBadges.push(badge);
      }

      // Check profile completion
      console.log('[Badges] Checking complete_profile:', {
        completion: landlord.profile_completion_percentage,
        hasBadge: await this.hasBadge(landlordId, 'complete_profile')
      });

      if (
        landlord.profile_completion_percentage === 100 &&
        !(await this.hasBadge(landlordId, 'complete_profile'))
      ) {
        console.log('[Badges] Awarding complete_profile badge');
        const badge = await this.awardBadge(landlordId, 'complete_profile');
        awardedBadges.push(badge);
      }

      // Check premium status
      if (
        landlord.verification_status === 'premium' &&
        !(await this.hasBadge(landlordId, 'premium_member'))
      ) {
        console.log('[Badges] Awarding premium_member badge');
        const badge = await this.awardBadge(landlordId, 'premium_member');
        awardedBadges.push(badge);
      }

      // Check rating
      if (
        landlord.rating >= 4.5 &&
        landlord.total_reviews >= 5 &&
        !(await this.hasBadge(landlordId, 'highly_rated'))
      ) {
        console.log('[Badges] Awarding highly_rated badge');
        const badge = await this.awardBadge(landlordId, 'highly_rated');
        awardedBadges.push(badge);
      }

      // Check early adopter (first 6 months after platform launch)
      const PLATFORM_LAUNCH_DATE = new Date('2025-05-01'); // Platform launched May 2025
      const SIX_MONTHS_AFTER_LAUNCH = new Date(PLATFORM_LAUNCH_DATE);
      SIX_MONTHS_AFTER_LAUNCH.setMonth(SIX_MONTHS_AFTER_LAUNCH.getMonth() + 6); // Cutoff: 2025-11-01

      const createdAt = new Date(landlord.created_at);

      console.log('[Badges] Checking early_adopter:', {
        createdAt: createdAt.toISOString(),
        sixMonthsCutoff: SIX_MONTHS_AFTER_LAUNCH.toISOString(),
        isEligible: createdAt <= SIX_MONTHS_AFTER_LAUNCH,
        hasBadge: await this.hasBadge(landlordId, 'early_adopter')
      });

      if (
        createdAt <= SIX_MONTHS_AFTER_LAUNCH &&
        !(await this.hasBadge(landlordId, 'early_adopter'))
      ) {
        console.log('[Badges] Awarding early_adopter badge');
        const badge = await this.awardBadge(landlordId, 'early_adopter');
        awardedBadges.push(badge);
      }

      console.log('[Badges] Total badges awarded:', awardedBadges.length);
      return awardedBadges;
    } catch (error) {
      console.error('[Badges] Error checking and awarding badges:', error);
      return awardedBadges;
    }
  }

  /**
   * Check and award property count badges
   */
  async checkPropertyBadges(landlordId: string, propertyCount: number): Promise<Badge[]> {
    const awardedBadges: Badge[] = [];

    try {
      if (propertyCount >= 1 && !(await this.hasBadge(landlordId, 'first_listing'))) {
        const badge = await this.awardBadge(landlordId, 'first_listing');
        awardedBadges.push(badge);
      }

      if (propertyCount >= 5 && !(await this.hasBadge(landlordId, 'five_listings'))) {
        const badge = await this.awardBadge(landlordId, 'five_listings');
        awardedBadges.push(badge);
      }

      if (propertyCount >= 10 && !(await this.hasBadge(landlordId, 'ten_listings'))) {
        const badge = await this.awardBadge(landlordId, 'ten_listings');
        awardedBadges.push(badge);
      }

      return awardedBadges;
    } catch (error) {
      console.error('Error checking property badges:', error);
      return awardedBadges;
    }
  }

  /**
   * Get available badges (not yet earned)
   */
  async getAvailableBadges(landlordId: string): Promise<
    Array<{
      badgeType: BadgeType;
      name: string;
      description: string;
      icon: string;
      earned: boolean;
    }>
  > {
    try {
      const earnedBadges = await this.getBadges(landlordId);
      const earnedTypes = new Set(earnedBadges.map((b) => b.badgeType));

      return Object.entries(this.BADGE_DEFINITIONS).map(([type, info]) => ({
        badgeType: type as BadgeType,
        name: info.name,
        description: info.description,
        icon: info.icon,
        earned: earnedTypes.has(type as BadgeType)
      }));
    } catch (error) {
      console.error('Error getting available badges:', error);
      return [];
    }
  }

  /**
   * Transform database record to Badge
   */
  private transformBadge(data: any): Badge {
    return {
      id: data.id,
      landlordId: data.landlord_id,
      badgeType: data.badge_type,
      badgeName: data.badge_name,
      badgeDescription: data.badge_description,
      badgeIcon: data.badge_icon,
      awardedAt: new Date(data.awarded_at),
      metadata: data.metadata || {}
    };
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy' }> {
    try {
      const { error } = await this.supabase.from('profile_badges').select('id').limit(1);

      return { status: error ? 'unhealthy' : 'healthy' };
    } catch (error) {
      return { status: 'unhealthy' };
    }
  }
}

// Export singleton instance
let badgesServiceInstance: LandlordBadgesService | null = null;

export function getLandlordBadgesService(): LandlordBadgesService {
  if (!badgesServiceInstance) {
    badgesServiceInstance = new LandlordBadgesService();
  }
  return badgesServiceInstance;
}

export default LandlordBadgesService;
