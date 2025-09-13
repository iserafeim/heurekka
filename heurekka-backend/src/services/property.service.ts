import { supabaseService } from './supabase';
import type { 
  Property, 
  SearchFilters, 
  SearchResults, 
  MapBounds, 
  Coordinates,
  PropertyCluster,
  AutocompleteSuggestion,
  PropertyViewEvent,
  PropertyContactEvent
} from '../types/property';

interface UserContext {
  userId?: string;
  isAuthenticated: boolean;
}

export class PropertyService {
  
  /**
   * Search properties with filters, location, and pagination
   */
  async searchProperties(filters: SearchFilters, userContext?: UserContext): Promise<SearchResults> {
    try {
      const {
        location,
        bounds,
        coordinates,
        priceMin,
        priceMax,
        bedrooms,
        propertyTypes,
        amenities,
        sortBy,
        cursor,
        limit,
        radiusKm
      } = filters;

      // Build base query with selective field projection based on user authentication
      const baseFields = `
        id,
        title,
        description,
        type,
        price_amount,
        currency,
        bedrooms,
        bathrooms,
        area_sqm,
        amenities,
        view_count,
        favorite_count,
        contact_count,
        created_at,
        updated_at,
        property_locations!inner(
          neighborhood,
          city,
          coordinates,
          formatted_address
          ${userContext?.isAuthenticated ? ', street_address' : ''}
        ),
        property_images(
          id,
          image_url,
          alt_text,
          is_primary,
          display_order
        ),
        landlords(
          id,
          business_name,
          rating,
          verification_status
          ${userContext?.isAuthenticated ? ', whatsapp_number' : ''}
        )
      `;
      
      // Add sensitive fields only for authenticated users
      const sensitiveFields = userContext?.isAuthenticated 
        ? ', contact_whatsapp, contact_phone, contact_email' 
        : '';

      let query = supabaseService.instance.client
        .from('properties')
        .select(baseFields + sensitiveFields, { count: 'exact' })
        .eq('status', 'active');

      // Apply price filters
      if (priceMin && priceMin > 0) {
        query = query.gte('price_amount', priceMin);
      }
      if (priceMax && priceMax < 1000000) {
        query = query.lte('price_amount', priceMax);
      }

      // Apply bedroom filters
      if (bedrooms && bedrooms.length > 0) {
        query = query.in('bedrooms', bedrooms);
      }

      // Apply property type filters
      if (propertyTypes && propertyTypes.length > 0) {
        query = query.in('type', propertyTypes);
      }

      // Apply amenity filters
      if (amenities && amenities.length > 0) {
        query = query.contains('amenities', amenities);
      }

      // Apply location-based filtering
      if (coordinates && radiusKm) {
        // Use PostGIS function for radius search
        const { data: nearbyProperties } = await supabaseService.instance.client
          .rpc('search_properties_nearby', {
            p_lat: coordinates.lat,
            p_lng: coordinates.lng,
            p_radius_km: radiusKm,
            p_filters: {
              price_min: priceMin,
              price_max: priceMax,
              bedrooms: bedrooms?.length ? bedrooms : null,
              property_types: propertyTypes?.length ? propertyTypes : null,
              limit
            }
          });

        if (nearbyProperties) {
          return {
            properties: nearbyProperties.map(this.transformNearbyPropertyData),
            total: nearbyProperties.length,
            facets: await this.getSearchFacets(bounds, filters),
            nextCursor: null, // PostGIS function doesn't support cursor pagination yet
          };
        }
      }

      // Apply text search if location string is provided
      if (location && location.trim()) {
        // Search in title, description, and neighborhood
        query = query.or(`title.ilike.%${location}%,description.ilike.%${location}%,property_locations.neighborhood.ilike.%${location}%`);
      }

      // Apply sorting
      switch (sortBy) {
        case 'precio_asc':
          query = query.order('price_amount', { ascending: true });
          break;
        case 'precio_desc':
          query = query.order('price_amount', { ascending: false });
          break;
        case 'reciente':
          query = query.order('created_at', { ascending: false });
          break;
        case 'relevancia':
        default:
          // For relevance, prioritize featured properties and then by date
          query = query.order('featured', { ascending: false }).order('created_at', { ascending: false });
          break;
      }

      // Apply pagination
      let from = 0;
      let to = limit - 1;
      
      if (cursor) {
        // Simple offset-based pagination for now
        // In production, you might want cursor-based pagination
        const offset = parseInt(cursor, 10);
        from = offset;
        to = offset + limit - 1;
      }
      
      query = query.range(from, to);

      // Execute query
      const { data, error, count } = await query;

      if (error) {
        console.error('Error searching properties:', error);
        throw new Error('Failed to search properties');
      }

      // Transform data with user context
      const properties = data?.map(property => this.transformPropertyData(property, userContext?.isAuthenticated)) || [];

      // Generate next cursor
      const nextCursor = properties.length === limit ? String(from + limit) : null;

      return {
        properties,
        total: count || 0,
        facets: await this.getSearchFacets(bounds, filters),
        nextCursor,
      };

    } catch (error) {
      console.error('Error in searchProperties:', error);
      throw error;
    }
  }

  /**
   * Get property by ID with full details
   */
  async getPropertyById(id: string, userContext?: UserContext): Promise<Property | null> {
    try {
      // Build selective query based on user authentication
      const selectFields = userContext?.isAuthenticated 
        ? `
            *,
            property_locations(*),
            property_images(*),
            landlords(*)
          `
        : `
            id,
            title,
            description,
            type,
            price_amount,
            currency,
            bedrooms,
            bathrooms,
            area_sqm,
            amenities,
            view_count,
            favorite_count,
            created_at,
            updated_at,
            property_locations(
              neighborhood,
              city,
              coordinates,
              formatted_address
            ),
            property_images(*),
            landlords(
              id,
              business_name,
              rating,
              verification_status
            )
          `;

      const { data, error } = await supabaseService.instance.client
        .from('properties')
        .select(selectFields)
        .eq('id', id)
        .eq('status', 'active')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        console.error('Error getting property by ID:', error);
        throw new Error('Failed to get property');
      }

      // Increment view count
      await this.incrementViewCount(id);

      return this.transformDetailedPropertyData(data, userContext?.isAuthenticated);

    } catch (error) {
      console.error('Error in getPropertyById:', error);
      throw error;
    }
  }

  /**
   * Get properties within map bounds
   */
  async getPropertiesInBounds(
    bounds: MapBounds,
    filters: Partial<SearchFilters> = {},
    limit: number = 100
  ): Promise<Property[]> {
    try {
      const { data, error } = await supabaseService.instance.client
        .rpc('get_properties_in_bounds', {
          p_bounds: bounds,
          p_filters: {
            price_min: filters.priceMin,
            price_max: filters.priceMax,
            bedrooms: filters.bedrooms?.length ? filters.bedrooms : null,
            property_types: filters.propertyTypes?.length ? filters.propertyTypes : null,
          },
          p_limit: limit
        });

      if (error) {
        console.error('Error getting properties in bounds:', error);
        throw new Error('Failed to get properties in bounds');
      }

      return data?.map(this.transformBoundsPropertyData) || [];

    } catch (error) {
      console.error('Error in getPropertiesInBounds:', error);
      throw error;
    }
  }

  /**
   * Cluster properties for map view
   */
  async clusterProperties(
    bounds: MapBounds,
    zoom: number,
    filters: Partial<SearchFilters> = {}
  ): Promise<PropertyCluster[]> {
    try {
      const { data, error } = await supabaseService.instance.client
        .rpc('cluster_properties_by_zoom', {
          p_bounds: bounds,
          p_zoom: zoom,
          p_filters: {
            price_min: filters.priceMin,
            price_max: filters.priceMax,
            bedrooms: filters.bedrooms?.length ? filters.bedrooms : null,
            property_types: filters.propertyTypes?.length ? filters.propertyTypes : null,
          }
        });

      if (error) {
        console.error('Error clustering properties:', error);
        throw new Error('Failed to cluster properties');
      }

      return data?.map(this.transformClusterData) || [];

    } catch (error) {
      console.error('Error in clusterProperties:', error);
      throw error;
    }
  }

  /**
   * Search properties nearby using PostGIS
   */
  async searchPropertiesNearby(
    lat: number,
    lng: number,
    radiusKm: number,
    filters: Partial<SearchFilters> = {}
  ): Promise<Property[]> {
    try {
      const { data, error } = await supabaseService.instance.client
        .rpc('search_properties_nearby', {
          p_lat: lat,
          p_lng: lng,
          p_radius_km: radiusKm,
          p_filters: {
            price_min: filters.priceMin,
            price_max: filters.priceMax,
            bedrooms: filters.bedrooms?.length ? filters.bedrooms : null,
            property_types: filters.propertyTypes?.length ? filters.propertyTypes : null,
            limit: filters.limit || 50
          }
        });

      if (error) {
        console.error('Error searching nearby properties:', error);
        throw new Error('Failed to search nearby properties');
      }

      return data?.map(this.transformNearbyPropertyData) || [];

    } catch (error) {
      console.error('Error in searchPropertiesNearby:', error);
      throw error;
    }
  }

  /**
   * Get autocomplete suggestions
   */
  async getAutocompleteSuggestions(
    query: string,
    location?: Coordinates,
    limit: number = 10
  ): Promise<AutocompleteSuggestion[]> {
    try {
      const suggestions: AutocompleteSuggestion[] = [];

      // Get neighborhood suggestions
      const { data: neighborhoods } = await supabaseService.instance.client
        .from('neighborhoods')
        .select('id, name, properties_count')
        .ilike('name', `%${query}%`)
        .order('properties_count', { ascending: false })
        .limit(Math.ceil(limit / 2));

      if (neighborhoods) {
        neighborhoods.forEach(neighborhood => {
          suggestions.push({
            id: `neighborhood-${neighborhood.id}`,
            text: neighborhood.name,
            type: 'location',
            icon: 'map-pin',
            subtitle: `${neighborhood.properties_count} propiedades`,
            metadata: {
              propertyCount: neighborhood.properties_count,
              type: 'neighborhood'
            }
          });
        });
      }

      // Get property type suggestions
      if (query.length >= 3) {
        const propertyTypes = [
          { key: 'apartment', label: 'Apartamentos' },
          { key: 'house', label: 'Casas' },
          { key: 'room', label: 'Habitaciones' },
          { key: 'office', label: 'Oficinas' },
        ];

        propertyTypes
          .filter(type => type.label.toLowerCase().includes(query.toLowerCase()))
          .forEach(type => {
            suggestions.push({
              id: `type-${type.key}`,
              text: type.label,
              type: 'filter',
              icon: 'home',
              subtitle: `Buscar ${type.label.toLowerCase()}`,
              metadata: {
                filterType: 'propertyType',
                filterValue: type.key
              }
            });
          });
      }

      return suggestions.slice(0, limit);

    } catch (error) {
      console.error('Error getting autocomplete suggestions:', error);
      return []; // Return empty array on error
    }
  }

  /**
   * Get similar properties based on criteria
   */
  async getSimilarProperties(
    propertyId: string,
    limit: number = 6
  ): Promise<Property[]> {
    try {
      // First get the base property
      const baseProperty = await this.getPropertyById(propertyId);
      if (!baseProperty) {
        return [];
      }

      // Find similar properties based on type, bedrooms, and price range
      let query = supabaseService.instance.client
        .from('properties')
        .select(`
          id,
          title,
          price_amount,
          bedrooms,
          bathrooms,
          area_sqm,
          type,
          property_locations!inner(neighborhood, coordinates),
          property_images(image_url, alt_text, is_primary, display_order),
          landlords(business_name)
        `)
        .eq('status', 'active')
        .neq('id', propertyId) // Exclude the current property
        .eq('type', baseProperty.type);

      // Similar bedroom count (±1)
      const bedroomRange = [
        Math.max(0, baseProperty.bedrooms - 1),
        baseProperty.bedrooms,
        baseProperty.bedrooms + 1
      ];
      query = query.in('bedrooms', bedroomRange);

      // Similar price range (±30%)
      const priceMin = Math.floor(baseProperty.price.amount * 0.7);
      const priceMax = Math.ceil(baseProperty.price.amount * 1.3);
      query = query.gte('price_amount', priceMin).lte('price_amount', priceMax);

      // Limit results
      query = query.limit(limit);

      const { data, error } = await query;

      if (error) {
        console.error('Error getting similar properties:', error);
        throw new Error('Failed to get similar properties');
      }

      return data?.map(this.transformPropertyData) || [];

    } catch (error) {
      console.error('Error in getSimilarProperties:', error);
      throw error;
    }
  }

  /**
   * Toggle favorite status for a property
   */
  async toggleFavorite(userId: string, propertyId: string): Promise<{ isFavorite: boolean }> {
    try {
      // Check if already favorited
      const { data: existing } = await supabaseService.instance.client
        .from('property_favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('property_id', propertyId)
        .single();

      if (existing) {
        // Remove favorite
        await supabaseService.instance.client
          .from('property_favorites')
          .delete()
          .eq('user_id', userId)
          .eq('property_id', propertyId);

        // Decrement favorite count
        await supabaseService.instance.client
          .rpc('decrement_property_favorite_count', { p_property_id: propertyId });

        return { isFavorite: false };
      } else {
        // Add favorite
        await supabaseService.instance.client
          .from('property_favorites')
          .insert({
            user_id: userId,
            property_id: propertyId
          });

        // Increment favorite count
        await supabaseService.instance.client
          .rpc('increment_property_favorite_count', { p_property_id: propertyId });

        return { isFavorite: true };
      }

    } catch (error) {
      console.error('Error toggling favorite:', error);
      throw error;
    }
  }

  /**
   * Track property view event
   */
  async trackPropertyView(event: PropertyViewEvent): Promise<void> {
    try {
      // Insert view event
      await supabaseService.instance.client
        .from('property_views')
        .insert({
          property_id: event.propertyId,
          user_id: event.userId || null,
          session_id: event.sessionId || null,
          ip_address: event.ipAddress,
          user_agent: event.userAgent,
          referrer: event.referrer,
          source: event.source,
        });

      // Increment view count
      await supabaseService.instance.client
        .rpc('increment_property_view_count', { p_property_id: event.propertyId });

    } catch (error) {
      console.error('Error tracking property view:', error);
      // Don't throw - analytics shouldn't break the app
    }
  }

  /**
   * Track property contact event
   */
  async trackPropertyContact(event: PropertyContactEvent): Promise<void> {
    try {
      // Insert contact event
      await supabaseService.instance.client
        .from('property_contact_events')
        .insert({
          property_id: event.propertyId,
          user_id: event.userId || null,
          session_id: event.sessionId || null,
          contact_method: event.contactMethod,
          phone_number: event.phoneNumber,
          success: event.success,
          error_message: event.errorMessage,
        });

      // Increment contact count if successful
      if (event.success) {
        await supabaseService.instance.client
          .rpc('increment_property_contact_count', { p_property_id: event.propertyId });
      }

    } catch (error) {
      console.error('Error tracking property contact:', error);
      // Don't throw - analytics shouldn't break the app
    }
  }

  /**
   * Get search facets for filtering UI
   */
  async getSearchFacets(bounds?: MapBounds, filters: Partial<SearchFilters> = {}): Promise<any> {
    try {
      // This would typically aggregate data based on current search results
      // For now, returning basic facets
      const facets = {
        neighborhoods: [],
        priceRanges: [
          { range: '0-5000', count: 0 },
          { range: '5000-10000', count: 0 },
          { range: '10000-15000', count: 0 },
          { range: '15000-25000', count: 0 },
          { range: '25000+', count: 0 },
        ],
        propertyTypes: [
          { type: 'apartment', count: 0 },
          { type: 'house', count: 0 },
          { type: 'room', count: 0 },
          { type: 'office', count: 0 },
        ],
        amenities: [],
      };

      return facets;
    } catch (error) {
      console.error('Error getting search facets:', error);
      return {
        neighborhoods: [],
        priceRanges: [],
        propertyTypes: [],
        amenities: [],
      };
    }
  }

  /**
   * Increment view count for a property
   */
  private async incrementViewCount(propertyId: string): Promise<void> {
    try {
      await supabaseService.instance.client
        .rpc('increment_property_view_count', { p_property_id: propertyId });
    } catch (error) {
      console.error('Error incrementing view count:', error);
      // Don't throw - this shouldn't break the main functionality
    }
  }

  // Data transformation methods
  private transformPropertyData = (rawData: any, isAuthenticated: boolean = false): Property => {
    const location = rawData.property_locations?.[0] || rawData.property_locations;
    const landlord = rawData.landlords || {};
    
    return {
      id: rawData.id,
      title: rawData.title,
      description: rawData.description || '',
      type: rawData.type,
      // Conditionally include sensitive location data
      address: isAuthenticated 
        ? (location?.formatted_address || location?.street_address || '')
        : (location?.neighborhood ? `${location.neighborhood}, Tegucigalpa` : 'Tegucigalpa'),
      neighborhood: location?.neighborhood || '',
      coordinates: {
        lat: location?.coordinates ? location.coordinates.coordinates[1] : 0,
        lng: location?.coordinates ? location.coordinates.coordinates[0] : 0,
      },
      price: {
        amount: rawData.price_amount,
        currency: rawData.currency || 'HNL',
        period: 'month'
      },
      bedrooms: rawData.bedrooms || 0,
      bathrooms: rawData.bathrooms || 0,
      areaSqm: rawData.area_sqm,
      amenities: rawData.amenities || [],
      images: rawData.property_images?.map((img: any) => ({
        id: img.id,
        url: img.image_url,
        alt: img.alt_text || rawData.title,
        isPrimary: img.is_primary || false,
        order: img.display_order || 0
      })).sort((a: any, b: any) => a.order - b.order) || [],
      viewCount: rawData.view_count || 0,
      favoriteCount: rawData.favorite_count || 0,
      contactCount: rawData.contact_count || 0,
      // Only include contact info for authenticated users
      contactPhone: isAuthenticated ? rawData.contact_whatsapp : undefined,
      landlord: {
        id: landlord.id,
        name: landlord.business_name || 'Propietario',
        // Only include phone for authenticated users
        phone: isAuthenticated ? landlord.whatsapp_number : undefined,
        rating: landlord.rating || 4.5,
        verified: landlord.verification_status === 'verified',
      },
      createdAt: new Date(rawData.created_at),
      updatedAt: new Date(rawData.updated_at),
    };
  };

  private transformDetailedPropertyData = (rawData: any, isAuthenticated: boolean = false): Property => {
    // Same as transformPropertyData but with additional details
    return {
      ...this.transformPropertyData(rawData, isAuthenticated),
      // Add any additional fields for detailed view
      floor: rawData.floor,
      totalFloors: rawData.total_floors,
      yearBuilt: rawData.year_built,
      parkingSpaces: rawData.parking_spaces,
      utilitiesIncluded: rawData.utilities_included,
      depositMonths: rawData.deposit_months,
      minimumStayMonths: rawData.minimum_stay_months,
      maximumOccupants: rawData.maximum_occupants,
      petsAllowed: rawData.pets_allowed,
      petRestrictions: rawData.pet_restrictions,
      videoTourUrl: rawData.video_tour_url,
      virtualTourUrl: rawData.virtual_tour_url,
    };
  };

  private transformNearbyPropertyData = (rawData: any): Property => {
    return {
      id: rawData.property_id,
      title: rawData.title,
      description: '',
      type: 'apartment', // Default, should be included in the query
      address: rawData.address,
      neighborhood: '',
      coordinates: {
        lat: rawData.lat,
        lng: rawData.lng,
      },
      price: {
        amount: rawData.price,
        currency: 'HNL',
        period: 'month'
      },
      bedrooms: rawData.bedrooms,
      bathrooms: rawData.bathrooms,
      areaSqm: rawData.area_sqm,
      amenities: rawData.amenities || [],
      images: Array.isArray(rawData.images) ? rawData.images : [],
      viewCount: 0,
      favoriteCount: 0,
      contactCount: 0,
      contactPhone: '',
      landlord: {
        id: '',
        name: 'Propietario',
        phone: '',
        rating: 4.5,
        verified: false,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      distance: rawData.distance_km,
    };
  };

  private transformBoundsPropertyData = (rawData: any): Property => {
    return {
      id: rawData.property_id,
      title: rawData.title,
      description: '',
      type: rawData.property_type,
      address: '',
      neighborhood: rawData.neighborhood,
      coordinates: {
        lat: rawData.lat,
        lng: rawData.lng,
      },
      price: {
        amount: rawData.price_amount,
        currency: 'HNL',
        period: 'month'
      },
      bedrooms: rawData.bedrooms,
      bathrooms: rawData.bathrooms,
      areaSqm: rawData.area_sqm,
      amenities: [],
      images: Array.isArray(rawData.images) ? rawData.images : [],
      viewCount: rawData.view_count || 0,
      favoriteCount: rawData.favorite_count || 0,
      contactCount: 0,
      contactPhone: rawData.contact_whatsapp,
      landlord: {
        id: '',
        name: rawData.landlord_name || 'Propietario',
        phone: rawData.contact_whatsapp,
        rating: 4.5,
        verified: false,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  };

  private transformClusterData = (rawData: any): PropertyCluster => {
    return {
      id: rawData.cluster_id,
      coordinates: {
        lat: rawData.centroid_lat,
        lng: rawData.centroid_lng,
      },
      count: rawData.property_count,
      avgPrice: parseFloat(rawData.avg_price),
      minPrice: rawData.min_price,
      maxPrice: rawData.max_price,
      propertyIds: rawData.property_ids,
    };
  };
}