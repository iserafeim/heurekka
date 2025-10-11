import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { TRPCError } from '@trpc/server';

// Types for favorites
export interface FavoriteProperty {
  id: string;
  userId: string;
  propertyId: string;
  createdAt: string;
  property: {
    id: string;
    title: string;
    type: string;
    priceAmount: number;
    currency: string;
    bedrooms: number;
    bathrooms: number;
    areaSqm: number | null;
    address: any;
    amenities: string[];
    status: string;
    landlordId: string;
    images: any[];
    createdAt: string;
  };
  contacted: boolean;
  contactedAt: string | null;
}

export interface FavoriteSummary {
  totalFavorites: number;
  contactedCount: number;
  notContactedCount: number;
}

class FavoriteService {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration for favorite service');
    }

    this.supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log('✅ Favorite service initialized');
  }

  /**
   * Add property to favorites
   */
  async addFavorite(userId: string, propertyId: string): Promise<FavoriteProperty> {
    try {
      // Check if already favorited
      const { data: existing } = await this.supabase
        .from('property_favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('property_id', propertyId)
        .maybeSingle();

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Esta propiedad ya está en favoritos'
        });
      }

      // Get property details first
      const { data: property, error: propertyError } = await this.supabase
        .from('properties')
        .select(`
          id,
          title,
          type,
          price_amount,
          currency,
          bedrooms,
          bathrooms,
          area_sqm,
          address,
          amenities,
          status,
          landlord_id,
          created_at,
          property_images (
            url,
            is_primary,
            order_index
          )
        `)
        .eq('id', propertyId)
        .single();

      if (propertyError || !property) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Propiedad no encontrada'
        });
      }

      // Add to favorites
      const { data, error } = await this.supabase
        .from('property_favorites')
        .insert({
          user_id: userId,
          property_id: propertyId
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding favorite:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'No se pudo agregar a favoritos'
        });
      }

      // Increment favorite_count on property using rpc
      try {
        await this.supabase.rpc('increment_favorite_count', { property_id: propertyId });
      } catch (rpcError) {
        // Non-critical error, just log it
        console.warn('Failed to increment favorite count:', rpcError);
      }

      // Check if contacted
      const contactedProperties = await this.getContactedProperties(userId, [propertyId]);
      const contactedAt = contactedProperties.get(propertyId) || null;

      // Return the favorite with property details
      return {
        id: data.id,
        userId: data.user_id,
        propertyId: data.property_id,
        createdAt: data.created_at,
        property: {
          id: property.id,
          title: property.title,
          type: property.type,
          priceAmount: property.price_amount,
          currency: property.currency || 'HNL',
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          areaSqm: property.area_sqm,
          address: property.address,
          amenities: property.amenities || [],
          status: property.status,
          landlordId: property.landlord_id,
          images: property.property_images || [],
          createdAt: property.created_at
        },
        contacted: !!contactedAt,
        contactedAt
      };
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      console.error('Error adding favorite:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error al agregar a favoritos'
      });
    }
  }

  /**
   * Remove property from favorites
   */
  async removeFavorite(userId: string, propertyId: string): Promise<{ success: boolean }> {
    try {
      const { error } = await this.supabase
        .from('property_favorites')
        .delete()
        .eq('user_id', userId)
        .eq('property_id', propertyId);

      if (error) {
        console.error('Error removing favorite:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al quitar de favoritos'
        });
      }

      // Decrement favorite_count on property using rpc
      try {
        await this.supabase.rpc('decrement_favorite_count', { property_id: propertyId });
      } catch (rpcError) {
        // Non-critical error, just log it
        console.warn('Failed to decrement favorite count:', rpcError);
      }

      return { success: true };
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      console.error('Error removing favorite:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error al quitar de favoritos'
      });
    }
  }

  /**
   * Get all favorites for a user with property details
   */
  async getUserFavorites(userId: string): Promise<FavoriteProperty[]> {
    try {
      const { data, error } = await this.supabase
        .from('property_favorites')
        .select(`
          id,
          user_id,
          property_id,
          created_at,
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
            amenities,
            status,
            landlord_id,
            created_at,
            property_images (
              url,
              is_primary,
              order_index
            )
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching favorites:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al obtener favoritos'
        });
      }

      // Check which properties have been contacted
      const propertyIds = (data || []).map(f => f.property_id);
      const contactedProperties = await this.getContactedProperties(userId, propertyIds);

      return (data || []).map(item => this.transformFavorite(item, contactedProperties));
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      console.error('Error getting favorites:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error al obtener favoritos'
      });
    }
  }

  /**
   * Check if property is favorited by user
   */
  async isFavorite(userId: string, propertyId: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('property_favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('property_id', propertyId)
        .maybeSingle();

      if (error) {
        console.error('Error checking favorite:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error checking favorite:', error);
      return false;
    }
  }

  /**
   * Get favorites summary for user
   */
  async getFavoritesSummary(userId: string): Promise<FavoriteSummary> {
    try {
      const favorites = await this.getUserFavorites(userId);

      return {
        totalFavorites: favorites.length,
        contactedCount: favorites.filter(f => f.contacted).length,
        notContactedCount: favorites.filter(f => !f.contacted).length
      };
    } catch (error) {
      console.error('Error getting favorites summary:', error);
      return {
        totalFavorites: 0,
        contactedCount: 0,
        notContactedCount: 0
      };
    }
  }

  /**
   * Get favorite with full property details
   */
  private async getFavoriteWithProperty(favoriteId: string): Promise<FavoriteProperty> {
    try {
      const { data, error } = await this.supabase
        .from('property_favorites')
        .select(`
          id,
          user_id,
          property_id,
          created_at,
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
            amenities,
            status,
            landlord_id,
            created_at,
            property_images (
              url,
              is_primary,
              order_index
            )
          )
        `)
        .eq('id', favoriteId)
        .single();

      if (error || !data) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Favorito no encontrado'
        });
      }

      const contactedProperties = await this.getContactedProperties(
        data.user_id,
        [data.property_id]
      );

      return this.transformFavorite(data, contactedProperties);
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error al obtener favorito'
      });
    }
  }

  /**
   * Get list of property IDs that have been contacted by user
   */
  private async getContactedProperties(userId: string, propertyIds: string[]): Promise<Map<string, string>> {
    if (propertyIds.length === 0) {
      return new Map();
    }

    try {
      const { data, error } = await this.supabase
        .from('property_inquiries')
        .select('property_id, created_at')
        .eq('user_id', userId)
        .in('property_id', propertyIds);

      if (error) {
        console.error('Error fetching contacted properties:', error);
        return new Map();
      }

      const contactMap = new Map<string, string>();
      (data || []).forEach(inquiry => {
        contactMap.set(inquiry.property_id, inquiry.created_at);
      });

      return contactMap;
    } catch (error) {
      console.error('Error getting contacted properties:', error);
      return new Map();
    }
  }

  /**
   * Transform database record to FavoriteProperty
   */
  private transformFavorite(data: any, contactedMap: Map<string, string>): FavoriteProperty {
    const property = data.properties;
    const contactedAt = contactedMap.get(data.property_id) || null;

    return {
      id: data.id,
      userId: data.user_id,
      propertyId: data.property_id,
      createdAt: data.created_at,
      property: {
        id: property.id,
        title: property.title,
        type: property.type,
        priceAmount: property.price_amount,
        currency: property.currency || 'HNL',
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        areaSqm: property.area_sqm,
        address: property.address,
        amenities: property.amenities || [],
        status: property.status,
        landlordId: property.landlord_id,
        images: property.property_images || [],
        createdAt: property.created_at
      },
      contacted: !!contactedAt,
      contactedAt
    };
  }
}

// Export singleton instance
let favoriteServiceInstance: FavoriteService | null = null;

export function getFavoriteService(): FavoriteService {
  if (!favoriteServiceInstance) {
    favoriteServiceInstance = new FavoriteService();
  }
  return favoriteServiceInstance;
}

export default FavoriteService;
