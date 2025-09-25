import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Pool } from 'pg';
import type { Property, SearchResults, Suggestion, HomepageData, AnalyticsEvent } from '../types/homepage';

class SupabaseService {
  private client: SupabaseClient | null = null;
  private pgPool: Pool | null = null;
  private useDirectPg = false;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
    const databaseUrl = process.env.DATABASE_URL;

    // Try to use local PostgreSQL if DATABASE_URL is available (localhost or Docker)
    // TEMP: Disabled PostgreSQL direct connection to force Supabase client usage for coordinate debugging
    if (false && databaseUrl && (databaseUrl.includes('localhost') || databaseUrl.includes('postgres:5432'))) {
      console.log('🔄 Using direct PostgreSQL connection for local/Docker development');
      this.useDirectPg = true;
      this.pgPool = new Pool({
        connectionString: databaseUrl,
      });
    } else if (supabaseUrl && supabaseKey) {
      console.log('☁️ Using Supabase client');
      this.client = createClient(supabaseUrl, supabaseKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });
    } else {
      throw new Error('Missing database configuration - need either DATABASE_URL or Supabase credentials');
    }
  }

  async getFeaturedProperties(limit: number = 6, userLocation?: { lat: number; lng: number }): Promise<Property[]> {
    try {
      // Force Supabase client usage for coordinate debugging
      // if (this.useDirectPg) {
      //   return await this.getFeaturedPropertiesWithPg(limit, userLocation);
      // }

      if (!this.client) {
        throw new Error('Supabase client not initialized');
      }

      let query = this.client
        .from('properties')
        .select(`
          *,
          landlords (*),
          property_images (*)
        `)
        .in('status', ['available', 'active'])
        .eq('featured', true)
        .order('featured_at', { ascending: false })
        .limit(limit);

      // If user location is provided, add distance-based ordering
      if (userLocation) {
        // Use secure RPC function for distance calculation to prevent injection
        const { data: distanceOrderedData } = await this.client.rpc('get_featured_properties_by_distance', {
          user_lat: userLocation.lat,
          user_lng: userLocation.lng,
          property_limit: limit
        });

        if (distanceOrderedData) {
          return distanceOrderedData.map(this.transformPropertyData);
        }
        // Fallback to regular query without distance ordering if RPC fails
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching featured properties:', error);
        throw new Error('Failed to fetch featured properties');
      }

      return data?.map(this.transformPropertyData) || [];
    } catch (error) {
      console.error('Database error in getFeaturedProperties:', error);
      throw error;
    }
  }

  async searchProperties(
    searchParams: {
      query?: string;
      location?: { lat: number; lng: number };
      filters?: any;
      page?: number;
      limit?: number;
      sortBy?: string;
    }
  ): Promise<SearchResults> {
    try {
      console.log('🔍 Starting searchProperties with params:', searchParams);
      const { query: searchText, location, filters, page = 1, limit = 20, sortBy = 'relevance' } = searchParams;
      console.log('🔍 Filters received:', JSON.stringify(filters, null, 2));
      const offset = (page - 1) * limit;

      // Force Supabase client usage for coordinate debugging
      // if (this.useDirectPg) {
      //   console.log('🐘 Using PostgreSQL direct connection for search');
      //   return await this.searchPropertiesWithPg(searchParams);
      // }

      console.log('☁️ Using Supabase client for search');

      let baseQuery = this.client!
        .from('properties')
        .select(`
          *,
          property_images (*)
        `, { count: 'exact' })
        .eq('status', 'active');

      // Apply text search
      if (searchText) {
        baseQuery = baseQuery.textSearch('search_vector', searchText);
      }

      // Apply location-based filtering
      if (location) {
        // Search within 25km radius using PostGIS
        const radiusKm = 25;
        // For now, use a bounding box approach for location filtering
        // In production, you would set up proper PostGIS RPC functions
        const latDelta = 0.5; // approximately 25km
        const lngDelta = 0.5;
        
        // This is a simplified approach - in production use proper PostGIS functions
        console.log(`Filtering by location: ${location.lat}, ${location.lng} with radius ${radiusKm}km`);
        // Note: Actual PostGIS integration would require custom RPC functions
      }

      // Apply property ID filter (for getting specific property by ID)
      if (filters?.propertyId) {
        baseQuery = baseQuery.eq('id', filters.propertyId);
      }

      // Apply price filters
      if (filters?.priceMin) {
        baseQuery = baseQuery.gte('price_amount', filters.priceMin);
      }
      if (filters?.priceMax) {
        baseQuery = baseQuery.lte('price_amount', filters.priceMax);
      }

      // Apply property type filters
      if (filters?.propertyTypes?.length > 0) {
        baseQuery = baseQuery.in('type', filters.propertyTypes);
      }

      // Apply bedroom filters
      if (filters?.bedrooms?.length > 0) {
        console.log('🛏️ Applying bedroom filters:', filters.bedrooms);
        baseQuery = baseQuery.in('bedrooms', filters.bedrooms);
      }

      // Apply bathroom filters
      if (filters?.bathrooms?.length > 0) {
        console.log('🚿 Applying bathroom filters:', filters.bathrooms);
        baseQuery = baseQuery.in('bathrooms', filters.bathrooms);
      }

      // Apply amenity filters
      if (filters?.amenities?.length > 0) {
        baseQuery = baseQuery.contains('amenities', filters.amenities);
      }

      // Apply sorting
      switch (sortBy) {
        case 'price_asc':
          baseQuery = baseQuery.order('price_amount', { ascending: true });
          break;
        case 'price_desc':
          baseQuery = baseQuery.order('price_amount', { ascending: false });
          break;
        case 'date_desc':
          baseQuery = baseQuery.order('created_at', { ascending: false });
          break;
        case 'distance':
          if (location) {
            // For now, order by created_at since we need custom RPC for PostGIS distance
            baseQuery = baseQuery.order('created_at', { ascending: false });
            console.log(`Distance sorting requested for location: ${location.lat}, ${location.lng}`);
          }
          break;
        default: // relevance
          if (searchText) {
            // Use parameterized textSearch instead of raw query to prevent SQL injection
            baseQuery = baseQuery.textSearch('search_vector', searchText, {
              config: 'english'
            }).order('created_at', { ascending: false }); // Use created_at for ordering instead of ts_rank to avoid injection
          } else {
            baseQuery = baseQuery.order('created_at', { ascending: false });
          }
      }

      // Apply pagination
      baseQuery = baseQuery.range(offset, offset + limit - 1);

      console.log('📊 Executing query...');
      const { data, error, count } = await baseQuery;

      console.log('✅ Query result:', { dataCount: data?.length, error: error?.message, count });

      if (error) {
        console.error('❌ Error searching properties:', error);
        console.log('🔄 Falling back to mock data with filters applied');
        return await this.getMockPropertiesWithFilters(filters, page, limit);
      }

      // Get facets for filtering - temporarily disabled for debugging
      // const facets = await this.getSearchFacets(searchParams);

      return {
        properties: data?.map(this.transformPropertyData) || [],
        total: count || 0,
        page,
        limit,
        facets: {
          neighborhoods: [],
          priceRanges: [],
          propertyTypes: []
        }
      };
    } catch (error) {
      console.error('Database error in searchProperties:', error);
      throw error;
    }
  }

  private async getFeaturedPropertiesWithPg(limit: number = 6, userLocation?: { lat: number; lng: number }): Promise<Property[]> {
    try {
      if (!this.pgPool) {
        throw new Error('PostgreSQL pool not initialized');
      }

      const query = `
        SELECT
          p.*,
          l.name as landlord_name,
          l.photo_url as landlord_photo,
          l.rating as landlord_rating,
          l.response_rate as landlord_response_rate,
          l.whatsapp_enabled as landlord_whatsapp_enabled,
          ST_X(p.location::geometry) as lng,
          ST_Y(p.location::geometry) as lat,
          COALESCE(
            json_agg(
              json_build_object(
                'id', pi.id,
                'url', pi.url,
                'thumbnail_url', pi.thumbnail_url,
                'alt', pi.alt,
                'width', pi.width,
                'height', pi.height,
                'order_index', pi.order_index
              ) ORDER BY pi.order_index
            ) FILTER (WHERE pi.id IS NOT NULL),
            '[]'::json
          ) as property_images
        FROM properties p
        JOIN landlords l ON p.landlord_id = l.id
        LEFT JOIN property_images pi ON p.id = pi.property_id
        WHERE p.status = 'active' AND p.featured = true
        GROUP BY p.id, l.name, l.photo_url, l.rating, l.response_rate, l.whatsapp_enabled
        ORDER BY p.featured_at DESC NULLS LAST
        LIMIT $1
      `;

      const result = await this.pgPool.query(query, [limit]);
      return result.rows.map(row => this.transformPropertyData(row));
    } catch (error) {
      console.error('PostgreSQL getFeaturedProperties error:', error);
      throw new Error('Failed to get featured properties');
    }
  }

  private async searchPropertiesWithPg(searchParams: {
    query?: string;
    location?: { lat: number; lng: number };
    filters?: any;
    page?: number;
    limit?: number;
    sortBy?: string;
  }): Promise<SearchResults> {
    const { query: searchText, location, filters, page = 1, limit = 20, sortBy = 'relevance' } = searchParams;
    const offset = (page - 1) * limit;

    try {
      // Build the SQL query
      let whereConditions = ['p.status = $1'];
      let queryParams: any[] = ['active'];
      let paramIndex = 2;

      // Add text search
      if (searchText) {
        whereConditions.push(`(p.title ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`);
        queryParams.push(`%${searchText}%`);
        paramIndex++;
      }

      // Add filters
      if (filters?.priceMin) {
        whereConditions.push(`p.price_amount >= $${paramIndex}`);
        queryParams.push(filters.priceMin);
        paramIndex++;
      }
      if (filters?.priceMax) {
        whereConditions.push(`p.price_amount <= $${paramIndex}`);
        queryParams.push(filters.priceMax);
        paramIndex++;
      }
      if (filters?.bedrooms?.length > 0) {
        whereConditions.push(`p.bedrooms = ANY($${paramIndex})`);
        queryParams.push(filters.bedrooms);
        paramIndex++;
      }

      // Build ORDER BY clause
      let orderBy = 'p.created_at DESC';
      if (sortBy === 'price_asc') orderBy = 'p.price_amount ASC';
      else if (sortBy === 'price_desc') orderBy = 'p.price_amount DESC';
      else if (sortBy === 'date_desc') orderBy = 'p.created_at DESC';

      const countQuery = `
        SELECT COUNT(*) as total
        FROM properties p
        WHERE ${whereConditions.join(' AND ')}
      `;

      const dataQuery = `
        SELECT
          p.*,
          ST_X(p.location::geometry) as lng,
          ST_Y(p.location::geometry) as lat,
          l.id as landlord_id,
          l.name as landlord_name,
          l.photo_url as landlord_photo,
          l.rating as landlord_rating,
          l.response_rate as landlord_response_rate,
          l.whatsapp_enabled as landlord_whatsapp_enabled,
          COALESCE(
            json_agg(
              json_build_object(
                'id', pi.id,
                'url', pi.url,
                'thumbnail_url', pi.thumbnail_url,
                'alt', pi.alt,
                'width', pi.width,
                'height', pi.height,
                'order_index', pi.order_index
              ) ORDER BY pi.order_index
            ) FILTER (WHERE pi.id IS NOT NULL),
            '[]'::json
          ) as property_images
        FROM properties p
        LEFT JOIN property_images pi ON p.id = pi.property_id
        LEFT JOIN landlords l ON p.landlord_id = l.id
        WHERE ${whereConditions.join(' AND ')}
        GROUP BY p.id, l.id
        ORDER BY ${orderBy}
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;

      queryParams.push(limit, offset);

      const [countResult, dataResult] = await Promise.all([
        this.pgPool!.query(countQuery, queryParams.slice(0, -2)), // Remove limit/offset for count
        this.pgPool!.query(dataQuery, queryParams)
      ]);

      const total = parseInt(countResult.rows[0].total);
      const properties = dataResult.rows.map(row => this.transformPropertyData(row));

      return {
        properties,
        total,
        page,
        limit,
        facets: {
          neighborhoods: [],
          priceRanges: [],
          propertyTypes: []
        }
      };
    } catch (error) {
      console.error('PostgreSQL search error:', error);
      throw new Error('Failed to search properties');
    }
  }

  async getSearchSuggestions(query: string, location?: { lat: number; lng: number }, limit: number = 5): Promise<Suggestion[]> {
    try {
      if (!this.client) {
        throw new Error('Supabase client not initialized');
      }

      const suggestions: Suggestion[] = [];

      // Get location suggestions
      const { data: neighborhoods } = await this.client
        .from('neighborhoods')
        .select('*')
        .ilike('name', `%${query}%`)
        .limit(Math.ceil(limit / 2));

      if (neighborhoods) {
        neighborhoods.forEach(neighborhood => {
          suggestions.push({
            id: `neighborhood-${neighborhood.id}`,
            text: neighborhood.name,
            type: 'location',
            icon: 'map-pin',
            metadata: {
              propertyCount: neighborhood.property_count,
              coordinates: neighborhood.location ? {
                lat: neighborhood.location.coordinates[1],
                lng: neighborhood.location.coordinates[0],
                source: 'manual' as const
              } : undefined
            }
          });
        });
      }

      // Get popular searches
      const { data: popularSearches } = await this.client
        .from('search_analytics')
        .select('query, search_count')
        .ilike('query', `%${query}%`)
        .order('search_count', { ascending: false })
        .limit(Math.floor(limit / 2));

      if (popularSearches) {
        popularSearches.forEach(search => {
          suggestions.push({
            id: `search-${search.query}`,
            text: search.query,
            type: 'property',
            icon: 'search',
            metadata: {
              popularityScore: search.search_count
            }
          });
        });
      }

      return suggestions.slice(0, limit);
    } catch (error) {
      console.error('Database error in getSearchSuggestions:', error);
      return []; // Return empty array on error to not break the search experience
    }
  }

  async getHomepageData(): Promise<HomepageData> {
    try {
      // Get all data in parallel
      const [featuredProperties, popularSearches, recentListings, neighborhoods, metrics] = await Promise.all([
        this.getFeaturedProperties(6),
        this.getPopularSearches(5),
        this.getRecentListings(6),
        this.getPopularNeighborhoods(10),
        this.getSearchMetrics()
      ]);

      return {
        featuredProperties,
        popularSearches,
        recentListings,
        neighborhoods,
        searchMetrics: metrics
      };
    } catch (error) {
      console.error('Database error in getHomepageData:', error);
      throw error;
    }
  }

  async trackAnalyticsEvent(event: AnalyticsEvent): Promise<void> {
    try {
      if (!this.client) {
        console.warn('Supabase client not available for analytics tracking');
        return;
      }

      await this.client
        .from('analytics_events')
        .insert({
          event_name: event.name,
          event_properties: event.properties,
          timestamp: new Date(event.timestamp).toISOString(),
          session_id: event.sessionId,
          user_id: event.userId
        });
    } catch (error) {
      console.error('Error tracking analytics event:', error);
      // Don't throw here - analytics failures shouldn't break the main functionality
    }
  }

  async saveProperty(userId: string, propertyId: string): Promise<void> {
    try {
      if (!this.client) {
        throw new Error('Supabase client not available for saving property');
      }

      await this.client
        .from('saved_properties')
        .upsert({
          user_id: userId,
          property_id: propertyId,
          saved_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,property_id'
        });

      // Update save count
      await this.client.rpc('increment_property_save_count', { property_id: propertyId });
    } catch (error) {
      console.error('Error saving property:', error);
      throw new Error('Failed to save property');
    }
  }

  // Helper method to get mock properties with filters applied
  private async getMockPropertiesWithFilters(filters: any, page: number = 1, limit: number = 20): Promise<SearchResults> {
    const mockProperties = this.generateMockProperties();

    let filteredProperties = mockProperties;

    // Apply bedroom filters
    if (filters?.bedrooms?.length > 0) {
      console.log('🛏️ Applying bedroom filters to mock data:', filters.bedrooms);
      filteredProperties = filteredProperties.filter(property =>
        filters.bedrooms.includes(property.bedrooms)
      );
    }

    // Apply bathroom filters
    if (filters?.bathrooms?.length > 0) {
      console.log('🚿 Applying bathroom filters to mock data:', filters.bathrooms);
      filteredProperties = filteredProperties.filter(property =>
        filters.bathrooms.includes(property.bathrooms)
      );
    }

    // Apply price filters
    if (filters?.priceMin && filters?.priceMax) {
      filteredProperties = filteredProperties.filter(property =>
        property.price_amount >= filters.priceMin && property.price_amount <= filters.priceMax
      );
    }

    // Apply property type filters
    if (filters?.propertyTypes?.length > 0) {
      filteredProperties = filteredProperties.filter(property =>
        filters.propertyTypes.includes(property.type)
      );
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    const paginatedProperties = filteredProperties.slice(offset, offset + limit);

    console.log(`🔍 Mock data filtered: ${mockProperties.length} -> ${filteredProperties.length} -> ${paginatedProperties.length} (paginated)`);

    return {
      properties: paginatedProperties.map(this.transformPropertyData.bind(this)),
      total: filteredProperties.length,
      page,
      limit,
      facets: {
        neighborhoods: [],
        priceRanges: [],
        propertyTypes: []
      }
    };
  }

  // Helper method to generate comprehensive mock data with better filter coverage
  private generateMockProperties(): any[] {
    const properties = [
      // Studio apartments (0 bedrooms)
      {
        id: 'studio-1',
        title: 'Estudio moderno en centro',
        description: 'Acogedor estudio perfecto para estudiantes o profesionales',
        type: 'apartment',
        bedrooms: 0,
        bathrooms: 1,
        price_amount: 6000,
        status: 'active',
        created_at: new Date().toISOString(),
        address: { neighborhood: 'Centro', city: 'Tegucigalpa' },
        landlord: { id: '1', name: 'Carlos López' },
        property_images: []
      },
      {
        id: 'studio-2',
        title: 'Estudio en Palmira',
        description: 'Pequeño pero cómodo estudio',
        type: 'apartment',
        bedrooms: 0,
        bathrooms: 1,
        price_amount: 7500,
        status: 'active',
        created_at: new Date().toISOString(),
        address: { neighborhood: 'Palmira', city: 'Tegucigalpa' },
        landlord: { id: '2', name: 'Ana García' },
        property_images: []
      },

      // 1 bedroom properties
      {
        id: '1bed-apt-1',
        title: 'Apartamento 1 habitación Palmira',
        description: 'Hermoso apartamento de 1 habitación',
        type: 'apartment',
        bedrooms: 1,
        bathrooms: 1,
        price_amount: 8000,
        status: 'active',
        created_at: new Date().toISOString(),
        address: { neighborhood: 'Palmira', city: 'Tegucigalpa' },
        landlord: { id: '3', name: 'Juan Pérez' },
        property_images: []
      },
      {
        id: '1bed-apt-2',
        title: 'Apartamento 1 habitación Lomas',
        description: 'Moderno apartamento con vista',
        type: 'apartment',
        bedrooms: 1,
        bathrooms: 1,
        price_amount: 12000,
        status: 'active',
        created_at: new Date().toISOString(),
        address: { neighborhood: 'Lomas del Guijarro', city: 'Tegucigalpa' },
        landlord: { id: '4', name: 'María Rodríguez' },
        property_images: []
      },
      {
        id: '1bed-house-1',
        title: 'Casa pequeña 1 habitación',
        description: 'Casa independiente con jardín',
        type: 'house',
        bedrooms: 1,
        bathrooms: 1,
        price_amount: 10000,
        status: 'active',
        created_at: new Date().toISOString(),
        address: { neighborhood: 'Colonia Kennedy', city: 'Tegucigalpa' },
        landlord: { id: '5', name: 'Roberto Silva' },
        property_images: []
      },

      // 2 bedroom properties
      {
        id: '2bed-apt-1',
        title: 'Apartamento 2 habitaciones Palmira',
        description: 'Espacioso apartamento familiar',
        type: 'apartment',
        bedrooms: 2,
        bathrooms: 2,
        price_amount: 15000,
        status: 'active',
        created_at: new Date().toISOString(),
        address: { neighborhood: 'Palmira', city: 'Tegucigalpa' },
        landlord: { id: '6', name: 'Laura Méndez' },
        property_images: []
      },
      {
        id: '2bed-apt-2',
        title: 'Apartamento 2 habitaciones con 1 baño',
        description: 'Apartamento económico con 1 baño',
        type: 'apartment',
        bedrooms: 2,
        bathrooms: 1,
        price_amount: 11000,
        status: 'active',
        created_at: new Date().toISOString(),
        address: { neighborhood: 'Centro', city: 'Tegucigalpa' },
        landlord: { id: '7', name: 'Diego Castro' },
        property_images: []
      },
      {
        id: '2bed-house-1',
        title: 'Casa familiar 2 habitaciones',
        description: 'Casa con jardín y estacionamiento',
        type: 'house',
        bedrooms: 2,
        bathrooms: 2,
        price_amount: 18000,
        status: 'active',
        created_at: new Date().toISOString(),
        address: { neighborhood: 'Lomas del Guijarro', city: 'Tegucigalpa' },
        landlord: { id: '8', name: 'Sandra López' },
        property_images: []
      },
      {
        id: '2bed-house-2',
        title: 'Casa 2 habitaciones con 3 baños',
        description: 'Casa con baños adicionales',
        type: 'house',
        bedrooms: 2,
        bathrooms: 3,
        price_amount: 22000,
        status: 'active',
        created_at: new Date().toISOString(),
        address: { neighborhood: 'Colonia Palmira', city: 'Tegucigalpa' },
        landlord: { id: '9', name: 'Fernando Díaz' },
        property_images: []
      },

      // 3 bedroom properties
      {
        id: '3bed-apt-1',
        title: 'Apartamento 3 habitaciones',
        description: 'Amplio apartamento para familias',
        type: 'apartment',
        bedrooms: 3,
        bathrooms: 2,
        price_amount: 25000,
        status: 'active',
        created_at: new Date().toISOString(),
        address: { neighborhood: 'Lomas del Guijarro', city: 'Tegucigalpa' },
        landlord: { id: '10', name: 'Patricia Vargas' },
        property_images: []
      },
      {
        id: '3bed-house-1',
        title: 'Casa de lujo 3 habitaciones',
        description: 'Elegante casa con todas las comodidades',
        type: 'house',
        bedrooms: 3,
        bathrooms: 3,
        price_amount: 35000,
        status: 'active',
        created_at: new Date().toISOString(),
        address: { neighborhood: 'Colonia Palmira', city: 'Tegucigalpa' },
        landlord: { id: '11', name: 'Ana Martínez' },
        property_images: []
      },
      {
        id: '3bed-house-2',
        title: 'Casa 3 habitaciones económica',
        description: 'Casa familiar a buen precio',
        type: 'house',
        bedrooms: 3,
        bathrooms: 2,
        price_amount: 20000,
        status: 'active',
        created_at: new Date().toISOString(),
        address: { neighborhood: 'Colonia Kennedy', city: 'Tegucigalpa' },
        landlord: { id: '12', name: 'Miguel Torres' },
        property_images: []
      },

      // 4+ bedroom properties
      {
        id: '4bed-apt-1',
        title: 'Apartamento 4 habitaciones de lujo',
        description: 'Penthouse con vista panorámica',
        type: 'apartment',
        bedrooms: 4,
        bathrooms: 3,
        price_amount: 45000,
        status: 'active',
        created_at: new Date().toISOString(),
        address: { neighborhood: 'Lomas del Guijarro', city: 'Tegucigalpa' },
        landlord: { id: '13', name: 'Roberto Silva' },
        property_images: []
      },
      {
        id: '4bed-house-1',
        title: 'Casa grande 4 habitaciones',
        description: 'Casa familiar con piscina',
        type: 'house',
        bedrooms: 4,
        bathrooms: 4,
        price_amount: 50000,
        status: 'active',
        created_at: new Date().toISOString(),
        address: { neighborhood: 'Colonia Palmira', city: 'Tegucigalpa' },
        landlord: { id: '14', name: 'Carmen Ruiz' },
        property_images: []
      },
      {
        id: '5bed-house-1',
        title: 'Mansión 5 habitaciones',
        description: 'Casa de lujo para familias grandes',
        type: 'house',
        bedrooms: 5,
        bathrooms: 4,
        price_amount: 65000,
        status: 'active',
        created_at: new Date().toISOString(),
        address: { neighborhood: 'Lomas del Guijarro', city: 'Tegucigalpa' },
        landlord: { id: '15', name: 'Eduardo Morales' },
        property_images: []
      },

      // Room rentals
      {
        id: 'room-1',
        title: 'Habitación individual centro',
        description: 'Habitación en casa compartida',
        type: 'room',
        bedrooms: 1,
        bathrooms: 1,
        price_amount: 4000,
        status: 'active',
        created_at: new Date().toISOString(),
        address: { neighborhood: 'Centro', city: 'Tegucigalpa' },
        landlord: { id: '16', name: 'Sofía Hernández' },
        property_images: []
      },
      {
        id: 'room-2',
        title: 'Habitación en Palmira',
        description: 'Habitación en zona residencial',
        type: 'room',
        bedrooms: 1,
        bathrooms: 1,
        price_amount: 5500,
        status: 'active',
        created_at: new Date().toISOString(),
        address: { neighborhood: 'Palmira', city: 'Tegucigalpa' },
        landlord: { id: '17', name: 'Carlos Vega' },
        property_images: []
      }
    ];

    console.log(`📊 Generated ${properties.length} mock properties with comprehensive filter coverage`);
    return properties;
  }

  // Private helper methods
  private transformPropertyData(rawData: any): Property {
    // Extract coordinates from PostGIS location field
    let lat = rawData.lat || 0;
    let lng = rawData.lng || 0;

    // If we have a PostGIS location field but no lat/lng, parse the location
    if (!lat && !lng && rawData.location) {
      try {
        // PostGIS location field comes as either:
        // 1. A string like "POINT(-87.21 14.095)"
        // 2. An object with coordinates
        if (typeof rawData.location === 'string' && rawData.location.includes('POINT')) {
          // Extract from "POINT(-87.21 14.095)" format
          const match = rawData.location.match(/POINT\(([^)]+)\)/);
          if (match) {
            const coords = match[1].split(' ');
            lng = parseFloat(coords[0]);
            lat = parseFloat(coords[1]);
          }
        } else if (rawData.location && typeof rawData.location === 'object') {
          // Handle PostGIS object format
          if (rawData.location.coordinates) {
            lng = rawData.location.coordinates[0];
            lat = rawData.location.coordinates[1];
          }
        }
      } catch (error) {
        console.warn('Error parsing location field:', error);
      }
    }

    // Debug logging for coordinate extraction (temporarily disabled)
    // console.log('🔍 DEBUG - Raw data coordinates:', {
    //   id: rawData.id,
    //   title: rawData.title,
    //   originalLat: rawData.lat,
    //   originalLng: rawData.lng,
    //   locationField: rawData.location,
    //   extractedLat: lat,
    //   extractedLng: lng
    // });

    return {
      id: rawData.id,
      title: rawData.title,
      description: rawData.description,
      type: rawData.type,
      address: rawData.address,
      coordinates: {
        lat: lat,
        lng: lng
      },
      price: {
        amount: rawData.price_amount,
        currency: rawData.price_currency || 'HNL',
        period: rawData.price_period || 'month'
      },
      size: {
        value: rawData.area_sqm || rawData.size_value || 0,
        unit: rawData.size_unit || 'm2'
      },
      bedrooms: rawData.bedrooms,
      bathrooms: rawData.bathrooms,
      amenities: rawData.amenities || [],
      images: rawData.property_images?.map((img: any) => ({
        id: img.id,
        url: img.url,
        thumbnailUrl: img.thumbnail_url,
        alt: img.alt || rawData.title,
        width: img.width,
        height: img.height,
        order: img.order_index
      })) || [],
      virtualTour: rawData.virtual_tour_url,
      video: rawData.video_url,
      availableFrom: rawData.available_from ? new Date(rawData.available_from) : new Date(),
      minimumStay: rawData.minimum_stay,
      maximumStay: rawData.maximum_stay,
      createdAt: rawData.created_at ? new Date(rawData.created_at) : new Date(),
      updatedAt: rawData.updated_at ? new Date(rawData.updated_at) : new Date(),
      viewCount: rawData.view_count || 0,
      saveCount: rawData.save_count || 0,
      responseTime: rawData.response_time || 60,
      verificationStatus: rawData.verification_status || 'pending',
      landlord: {
        id: rawData.landlord_id,
        name: rawData.landlord_name || 'Property Owner',
        photo: rawData.landlord_photo,
        rating: rawData.landlord_rating || 4.5,
        responseRate: rawData.landlord_response_rate || 85,
        whatsappEnabled: rawData.landlord_whatsapp_enabled !== false
      }
    };
  }

  private async getSearchFacets(searchParams: any) {
    // Implementation for search facets
    // This would aggregate data for filters UI
    return {
      neighborhoods: [],
      priceRanges: [],
      propertyTypes: []
    };
  }

  private async getPopularSearches(limit: number): Promise<string[]> {
    if (!this.client) {
      return [];
    }

    const { data } = await this.client
      .from('search_analytics')
      .select('query')
      .order('search_count', { ascending: false })
      .limit(limit);

    return data?.map(item => item.query) || [];
  }

  private async getRecentListings(limit: number): Promise<Property[]> {
    if (!this.client) {
      return [];
    }

    const { data } = await this.client
      .from('properties')
      .select(`
        *,
        property_images (*),
        landlords (*)
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(limit);

    return data?.map(this.transformPropertyData) || [];
  }

  private async getPopularNeighborhoods(limit: number) {
    if (!this.client) {
      return [];
    }

    const { data } = await this.client
      .from('neighborhoods')
      .select('name, property_count')
      .order('property_count', { ascending: false })
      .limit(limit);

    return data?.map(item => ({
      name: item.name,
      count: item.property_count
    })) || [];
  }

  private async getSearchMetrics() {
    if (!this.client) {
      return {
        totalProperties: 0,
        averageResponseTime: 60,
        successfulMatches: 0
      };
    }

    const { data } = await this.client
      .from('search_metrics')
      .select('*')
      .single();

    return {
      totalProperties: data?.total_properties || 0,
      averageResponseTime: data?.average_response_time || 60,
      successfulMatches: data?.successful_matches || 0
    };
  }
}

let _supabaseService: SupabaseService | null = null;

export const supabaseService = {
  get instance(): SupabaseService {
    if (!_supabaseService) {
      _supabaseService = new SupabaseService();
    }
    return _supabaseService;
  },
  
  // Proxy all methods for backward compatibility
  searchProperties: (...args: Parameters<SupabaseService['searchProperties']>) => supabaseService.instance.searchProperties(...args),
  getSearchSuggestions: (...args: Parameters<SupabaseService['getSearchSuggestions']>) => supabaseService.instance.getSearchSuggestions(...args),
  getFeaturedProperties: (...args: Parameters<SupabaseService['getFeaturedProperties']>) => supabaseService.instance.getFeaturedProperties(...args),
  getHomepageData: (...args: Parameters<SupabaseService['getHomepageData']>) => supabaseService.instance.getHomepageData(...args),
  trackAnalyticsEvent: (...args: Parameters<SupabaseService['trackAnalyticsEvent']>) => supabaseService.instance.trackAnalyticsEvent(...args),
  saveProperty: (...args: Parameters<SupabaseService['saveProperty']>) => supabaseService.instance.saveProperty(...args)
};