import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { TRPCError } from '@trpc/server';
import { getTenantProfileService, TenantProfile } from './tenant-profile.service';
import { getSavedSearchService, SavedSearch } from './saved-search.service';
import { getFavoriteService, FavoriteProperty, FavoriteSummary } from './favorite.service';

// Types for dashboard data
export interface ConversationSummary {
  propertyId: string;
  propertyTitle: string;
  landlordName: string;
  landlordId: string;
  lastMessage: string;
  lastMessageAt: string;
  status: string;
  propertyImage: string | null;
}

export interface DashboardStats {
  savedSearches: number;
  activeSavedSearches: number;
  newMatches: number;
  totalFavorites: number;
  contactedFavorites: number;
  totalConversations: number;
  activeConversations: number;
}

export interface TenantDashboardData {
  profile: TenantProfile | null;
  stats: DashboardStats;
  savedSearches: SavedSearch[];
  favorites: FavoriteProperty[];
  conversations: ConversationSummary[];
  recentlyViewed: any[];
}

class TenantDashboardService {
  private supabase: SupabaseClient;
  private tenantProfileService: ReturnType<typeof getTenantProfileService>;
  private savedSearchService: ReturnType<typeof getSavedSearchService>;
  private favoriteService: ReturnType<typeof getFavoriteService>;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration for tenant dashboard service');
    }

    this.supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    this.tenantProfileService = getTenantProfileService();
    this.savedSearchService = getSavedSearchService();
    this.favoriteService = getFavoriteService();

    console.log('✅ Tenant Dashboard service initialized');
  }

  /**
   * Get complete dashboard data for tenant
   * Aggregates all dashboard sections in parallel for performance
   */
  async getDashboardData(userId: string): Promise<TenantDashboardData> {
    try {
      // Execute all queries in parallel for better performance
      const [
        profile,
        savedSearches,
        favorites,
        conversations,
        recentlyViewed
      ] = await Promise.all([
        this.tenantProfileService.getTenantProfileByUserId(userId),
        this.savedSearchService.getUserSavedSearches(userId),
        this.favoriteService.getUserFavorites(userId),
        this.getConversations(userId),
        this.getRecentlyViewed(userId)
      ]);

      // Calculate stats
      const stats = this.calculateStats(savedSearches, favorites, conversations);

      return {
        profile,
        stats,
        savedSearches: savedSearches.slice(0, 5), // Only first 5 for dashboard
        favorites: favorites.slice(0, 6), // Only first 6 for dashboard
        conversations: conversations.slice(0, 5), // Only first 5 for dashboard
        recentlyViewed: recentlyViewed.slice(0, 4) // Only first 4 for dashboard
      };
    } catch (error) {
      console.error('Error getting dashboard data:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error al cargar el dashboard'
      });
    }
  }

  /**
   * Get quick stats for dashboard
   */
  async getQuickStats(userId: string): Promise<DashboardStats> {
    try {
      const [
        savedSearchesSummary,
        favoritesSummary,
        conversationsCount
      ] = await Promise.all([
        this.savedSearchService.getSavedSearchesSummary(userId),
        this.favoriteService.getFavoritesSummary(userId),
        this.getConversationsCount(userId)
      ]);

      return {
        savedSearches: savedSearchesSummary.totalSearches,
        activeSavedSearches: savedSearchesSummary.activeSearches,
        newMatches: savedSearchesSummary.totalNewMatches,
        totalFavorites: favoritesSummary.totalFavorites,
        contactedFavorites: favoritesSummary.contactedCount,
        totalConversations: conversationsCount.total,
        activeConversations: conversationsCount.active
      };
    } catch (error) {
      console.error('Error getting quick stats:', error);
      return {
        savedSearches: 0,
        activeSavedSearches: 0,
        newMatches: 0,
        totalFavorites: 0,
        contactedFavorites: 0,
        totalConversations: 0,
        activeConversations: 0
      };
    }
  }

  /**
   * Get conversations/contact history for tenant
   */
  async getConversations(userId: string, limit: number = 20): Promise<ConversationSummary[]> {
    try {
      const { data, error } = await this.supabase
        .from('property_inquiries')
        .select(`
          id,
          property_id,
          message_content,
          created_at,
          status,
          properties (
            id,
            title,
            landlord_id,
            property_images (
              url,
              is_primary
            )
          ),
          landlords (
            id,
            full_name,
            business_name
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching conversations:', error);
        return [];
      }

      return (data || []).map(item => ({
        propertyId: item.property_id,
        propertyTitle: item.properties?.title || 'Propiedad sin título',
        landlordName: item.landlords?.full_name || item.landlords?.business_name || 'Propietario',
        landlordId: item.properties?.landlord_id || '',
        lastMessage: item.message_content || '',
        lastMessageAt: item.created_at,
        status: item.status || 'pending',
        propertyImage: this.getPrimaryImage(item.properties?.property_images)
      }));
    } catch (error) {
      console.error('Error getting conversations:', error);
      return [];
    }
  }

  /**
   * Get conversations count
   */
  private async getConversationsCount(userId: string): Promise<{ total: number; active: number }> {
    try {
      const [totalResult, activeResult] = await Promise.all([
        this.supabase
          .from('property_inquiries')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId),
        this.supabase
          .from('property_inquiries')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .in('status', ['pending', 'in_conversation'])
      ]);

      return {
        total: totalResult.count || 0,
        active: activeResult.count || 0
      };
    } catch (error) {
      console.error('Error getting conversations count:', error);
      return { total: 0, active: 0 };
    }
  }

  /**
   * Get recently viewed properties
   */
  async getRecentlyViewed(userId: string, limit: number = 10): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('property_views')
        .select(`
          property_id,
          viewed_at,
          properties (
            id,
            title,
            type,
            price_amount,
            currency,
            bedrooms,
            bathrooms,
            area_sqm,
            address,
            status,
            property_images (
              url,
              is_primary
            )
          )
        `)
        .eq('user_id', userId)
        .order('viewed_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching recently viewed:', error);
        return [];
      }

      // Deduplicate by property_id (keep most recent)
      const seen = new Set();
      return (data || [])
        .filter(item => {
          if (seen.has(item.property_id)) {
            return false;
          }
          seen.add(item.property_id);
          return true;
        })
        .map(item => ({
          ...item.properties,
          viewedAt: item.viewed_at,
          primaryImage: this.getPrimaryImage(item.properties?.property_images)
        }));
    } catch (error) {
      console.error('Error getting recently viewed:', error);
      return [];
    }
  }

  /**
   * Calculate dashboard stats from data
   */
  private calculateStats(
    savedSearches: SavedSearch[],
    favorites: FavoriteProperty[],
    conversations: ConversationSummary[]
  ): DashboardStats {
    return {
      savedSearches: savedSearches.length,
      activeSavedSearches: savedSearches.filter(s => s.isActive).length,
      newMatches: savedSearches.reduce((sum, s) => sum + s.newMatchesCount, 0),
      totalFavorites: favorites.length,
      contactedFavorites: favorites.filter(f => f.contacted).length,
      totalConversations: conversations.length,
      activeConversations: conversations.filter(c =>
        ['pending', 'in_conversation'].includes(c.status)
      ).length
    };
  }

  /**
   * Get primary image URL from property images
   */
  private getPrimaryImage(images: any[] | undefined): string | null {
    if (!images || images.length === 0) {
      return null;
    }

    const primary = images.find(img => img.is_primary);
    return primary?.url || images[0]?.url || null;
  }

  /**
   * Update last active timestamp for tenant profile
   */
  async updateLastActive(userId: string): Promise<void> {
    try {
      await this.supabase
        .from('tenant_profiles')
        .update({ last_active_at: new Date().toISOString() })
        .eq('user_id', userId);
    } catch (error) {
      // Don't throw - this is not critical
      console.error('Error updating last active:', error);
    }
  }
}

// Export singleton instance
let tenantDashboardServiceInstance: TenantDashboardService | null = null;

export function getTenantDashboardService(): TenantDashboardService {
  if (!tenantDashboardServiceInstance) {
    tenantDashboardServiceInstance = new TenantDashboardService();
  }
  return tenantDashboardServiceInstance;
}

export default TenantDashboardService;
