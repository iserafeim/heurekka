import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { TRPCError } from '@trpc/server';

// Types for saved searches
export interface SearchCriteria {
  propertyTypes?: string[];
  locations?: string[];
  budgetMin?: number;
  budgetMax?: number;
  bedrooms?: { min?: number; max?: number };
  bathrooms?: { min?: number; max?: number };
  amenities?: string[];
  areaMin?: number;
  areaMax?: number;
  petsAllowed?: boolean;
  furnished?: boolean;
}

export interface SavedSearchInput {
  profileName: string;
  searchCriteria: SearchCriteria;
  isActive?: boolean;
}

export interface SavedSearch {
  id: string;
  userId: string;
  profileName: string;
  searchCriteria: SearchCriteria;
  isActive: boolean;
  newMatchesCount: number;
  lastCheckedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateSavedSearchInput {
  profileName?: string;
  searchCriteria?: SearchCriteria;
  isActive?: boolean;
}

export interface MatchedProperty {
  id: string;
  title: string;
  type: string;
  priceAmount: number;
  bedrooms: number;
  bathrooms: number;
  areaSqm: number | null;
  address: any;
  amenities: string[];
  images: any[];
  landlordId: string;
  createdAt: string;
}

class SavedSearchService {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration for saved search service');
    }

    this.supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log('✅ Saved Search service initialized');
  }

  /**
   * Create a new saved search
   */
  async createSavedSearch(userId: string, input: SavedSearchInput): Promise<SavedSearch> {
    try {
      // Validate input
      this.validateSavedSearchInput(input);

      // Check limit (max 10 saved searches per user)
      const { count } = await this.supabase
        .from('saved_searches')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (count && count >= 10) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Has alcanzado el límite máximo de 10 búsquedas guardadas'
        });
      }

      // Create saved search
      const { data, error } = await this.supabase
        .from('saved_searches')
        .insert({
          user_id: userId,
          profile_name: input.profileName,
          search_criteria: input.searchCriteria,
          is_active: input.isActive !== undefined ? input.isActive : true
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating saved search:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'No se pudo crear la búsqueda guardada'
        });
      }

      return this.transformSavedSearch(data);
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      console.error('Error creating saved search:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error al crear la búsqueda guardada'
      });
    }
  }

  /**
   * Get all saved searches for a user
   */
  async getUserSavedSearches(userId: string): Promise<SavedSearch[]> {
    try {
      const { data, error } = await this.supabase
        .from('saved_searches')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching saved searches:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al obtener las búsquedas guardadas'
        });
      }

      return (data || []).map(item => this.transformSavedSearch(item));
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      console.error('Error getting saved searches:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error al obtener las búsquedas'
      });
    }
  }

  /**
   * Get a single saved search by ID
   */
  async getSavedSearchById(userId: string, searchId: string): Promise<SavedSearch | null> {
    try {
      const { data, error } = await this.supabase
        .from('saved_searches')
        .select('*')
        .eq('id', searchId)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching saved search:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al obtener la búsqueda'
        });
      }

      if (!data) {
        return null;
      }

      return this.transformSavedSearch(data);
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      console.error('Error getting saved search:', error);
      return null;
    }
  }

  /**
   * Update a saved search
   */
  async updateSavedSearch(
    userId: string,
    searchId: string,
    input: UpdateSavedSearchInput
  ): Promise<SavedSearch> {
    try {
      // Verify ownership
      const existing = await this.getSavedSearchById(userId, searchId);
      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Búsqueda guardada no encontrada'
        });
      }

      // Update
      const updateData: any = {};
      if (input.profileName !== undefined) updateData.profile_name = input.profileName;
      if (input.searchCriteria !== undefined) updateData.search_criteria = input.searchCriteria;
      if (input.isActive !== undefined) updateData.is_active = input.isActive;

      const { data, error } = await this.supabase
        .from('saved_searches')
        .update(updateData)
        .eq('id', searchId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating saved search:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al actualizar la búsqueda'
        });
      }

      return this.transformSavedSearch(data);
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      console.error('Error updating saved search:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error al actualizar la búsqueda'
      });
    }
  }

  /**
   * Delete a saved search
   */
  async deleteSavedSearch(userId: string, searchId: string): Promise<{ success: boolean }> {
    try {
      const { error } = await this.supabase
        .from('saved_searches')
        .delete()
        .eq('id', searchId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting saved search:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al eliminar la búsqueda'
        });
      }

      return { success: true };
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      console.error('Error deleting saved search:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error al eliminar la búsqueda'
      });
    }
  }

  /**
   * Toggle active status of a saved search
   */
  async toggleSavedSearchStatus(userId: string, searchId: string): Promise<SavedSearch> {
    try {
      const existing = await this.getSavedSearchById(userId, searchId);
      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Búsqueda guardada no encontrada'
        });
      }

      return await this.updateSavedSearch(userId, searchId, {
        isActive: !existing.isActive
      });
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      console.error('Error toggling saved search:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error al cambiar el estado'
      });
    }
  }

  /**
   * Execute a saved search and return matching properties
   */
  async executeSearch(userId: string, searchId: string): Promise<MatchedProperty[]> {
    try {
      const savedSearch = await this.getSavedSearchById(userId, searchId);
      if (!savedSearch) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Búsqueda guardada no encontrada'
        });
      }

      const properties = await this.findMatchingProperties(savedSearch.searchCriteria);

      // Update last checked timestamp
      await this.supabase
        .from('saved_searches')
        .update({
          last_checked_at: new Date().toISOString(),
          new_matches_count: 0
        })
        .eq('id', searchId)
        .eq('user_id', userId);

      return properties;
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      console.error('Error executing search:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error al ejecutar la búsqueda'
      });
    }
  }

  /**
   * Find properties matching the search criteria
   */
  async findMatchingProperties(criteria: SearchCriteria): Promise<MatchedProperty[]> {
    try {
      let query = this.supabase
        .from('properties')
        .select(`
          id,
          title,
          type,
          price_amount,
          bedrooms,
          bathrooms,
          area_sqm,
          address,
          amenities,
          landlord_id,
          created_at,
          property_images (
            url,
            is_primary,
            order_index
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      // Apply filters based on criteria
      if (criteria.propertyTypes && criteria.propertyTypes.length > 0) {
        query = query.in('type', criteria.propertyTypes);
      }

      if (criteria.budgetMin !== undefined) {
        query = query.gte('price_amount', criteria.budgetMin);
      }

      if (criteria.budgetMax !== undefined) {
        query = query.lte('price_amount', criteria.budgetMax);
      }

      if (criteria.bedrooms?.min !== undefined) {
        query = query.gte('bedrooms', criteria.bedrooms.min);
      }

      if (criteria.bedrooms?.max !== undefined) {
        query = query.lte('bedrooms', criteria.bedrooms.max);
      }

      if (criteria.bathrooms?.min !== undefined) {
        query = query.gte('bathrooms', criteria.bathrooms.min);
      }

      if (criteria.areaMin !== undefined) {
        query = query.gte('area_sqm', criteria.areaMin);
      }

      if (criteria.areaMax !== undefined) {
        query = query.lte('area_sqm', criteria.areaMax);
      }

      if (criteria.petsAllowed !== undefined && criteria.petsAllowed) {
        query = query.eq('pets_allowed', true);
      }

      // Execute query
      const { data, error } = await query.limit(100);

      if (error) {
        console.error('Error finding matching properties:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al buscar propiedades'
        });
      }

      // Transform and filter results
      let properties = (data || []).map(prop => this.transformProperty(prop));

      // Filter by amenities if specified
      if (criteria.amenities && criteria.amenities.length > 0) {
        properties = properties.filter(prop => {
          return criteria.amenities!.some(amenity =>
            prop.amenities.includes(amenity)
          );
        });
      }

      // Filter by neighborhoods if specified
      if (criteria.locations && criteria.locations.length > 0) {
        properties = properties.filter(prop => {
          const neighborhood = prop.address?.neighborhood?.toLowerCase() || '';
          return criteria.locations!.some(loc =>
            neighborhood.includes(loc.toLowerCase())
          );
        });
      }

      return properties;
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      console.error('Error finding matching properties:', error);
      return [];
    }
  }

  /**
   * Get summary of active saved searches with match counts
   */
  async getSavedSearchesSummary(userId: string): Promise<{
    totalSearches: number;
    activeSearches: number;
    totalNewMatches: number;
  }> {
    try {
      const searches = await this.getUserSavedSearches(userId);

      return {
        totalSearches: searches.length,
        activeSearches: searches.filter(s => s.isActive).length,
        totalNewMatches: searches.reduce((sum, s) => sum + s.newMatchesCount, 0)
      };
    } catch (error) {
      console.error('Error getting saved searches summary:', error);
      return {
        totalSearches: 0,
        activeSearches: 0,
        totalNewMatches: 0
      };
    }
  }

  /**
   * Validate saved search input
   */
  private validateSavedSearchInput(input: SavedSearchInput): void {
    if (!input.profileName || input.profileName.trim().length < 3) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'El nombre del perfil debe tener al menos 3 caracteres'
      });
    }

    if (input.profileName.length > 100) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'El nombre del perfil no puede exceder 100 caracteres'
      });
    }

    const criteria = input.searchCriteria;
    if (criteria.budgetMin && criteria.budgetMax && criteria.budgetMin > criteria.budgetMax) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'El presupuesto máximo debe ser mayor al mínimo'
      });
    }

    if (criteria.bedrooms?.min && criteria.bedrooms?.max && criteria.bedrooms.min > criteria.bedrooms.max) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'El número máximo de habitaciones debe ser mayor al mínimo'
      });
    }
  }

  /**
   * Transform database record to SavedSearch
   */
  private transformSavedSearch(data: any): SavedSearch {
    return {
      id: data.id,
      userId: data.user_id,
      profileName: data.profile_name,
      searchCriteria: data.search_criteria || {},
      isActive: data.is_active,
      newMatchesCount: data.new_matches_count || 0,
      lastCheckedAt: data.last_checked_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  /**
   * Transform property record
   */
  private transformProperty(data: any): MatchedProperty {
    return {
      id: data.id,
      title: data.title,
      type: data.type,
      priceAmount: data.price_amount,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      areaSqm: data.area_sqm,
      address: data.address,
      amenities: data.amenities || [],
      images: data.property_images || [],
      landlordId: data.landlord_id,
      createdAt: data.created_at
    };
  }
}

// Export singleton instance
let savedSearchServiceInstance: SavedSearchService | null = null;

export function getSavedSearchService(): SavedSearchService {
  if (!savedSearchServiceInstance) {
    savedSearchServiceInstance = new SavedSearchService();
  }
  return savedSearchServiceInstance;
}

export default SavedSearchService;
