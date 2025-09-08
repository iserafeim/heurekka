-- Security Migration: Add secure RPC functions to prevent SQL injection
-- Date: 2025-09-08
-- Purpose: Replace vulnerable string concatenation with parameterized RPC functions

-- Enable PostGIS extension if not already enabled
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create secure function for distance-based featured properties
-- This replaces the vulnerable string concatenation for location ordering
CREATE OR REPLACE FUNCTION get_featured_properties_by_distance(
    user_lat double precision,
    user_lng double precision,
    property_limit integer DEFAULT 6
)
RETURNS TABLE (
    id uuid,
    title text,
    description text,
    type text,
    price_amount decimal,
    price_period text,
    bedrooms integer,
    bathrooms integer,
    area_size decimal,
    area_unit text,
    location geometry,
    address text,
    neighborhood text,
    city text,
    country text,
    amenities text[],
    status text,
    featured boolean,
    featured_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    landlord_id uuid,
    distance_meters double precision
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_point geometry;
BEGIN
    -- Validate input parameters
    IF user_lat IS NULL OR user_lng IS NULL THEN
        RAISE EXCEPTION 'Invalid coordinates: lat and lng cannot be null';
    END IF;
    
    IF user_lat < -90 OR user_lat > 90 THEN
        RAISE EXCEPTION 'Invalid latitude: must be between -90 and 90';
    END IF;
    
    IF user_lng < -180 OR user_lng > 180 THEN
        RAISE EXCEPTION 'Invalid longitude: must be between -180 and 180';
    END IF;
    
    IF property_limit IS NULL OR property_limit <= 0 OR property_limit > 50 THEN
        property_limit := 6;
    END IF;
    
    -- Create point from user coordinates
    user_point := ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326);
    
    -- Return properties ordered by distance
    RETURN QUERY
    SELECT 
        p.id,
        p.title,
        p.description,
        p.type,
        p.price_amount,
        p.price_period,
        p.bedrooms,
        p.bathrooms,
        p.area_size,
        p.area_unit,
        p.location,
        p.address,
        p.neighborhood,
        p.city,
        p.country,
        p.amenities,
        p.status,
        p.featured,
        p.featured_at,
        p.created_at,
        p.updated_at,
        p.landlord_id,
        ST_Distance(p.location::geography, user_point::geography) as distance_meters
    FROM properties p
    WHERE p.status = 'active'
        AND p.featured = true
        AND p.location IS NOT NULL
    ORDER BY p.location <-> user_point
    LIMIT property_limit;
END;
$$;

-- Create secure function for search with distance ordering
-- This provides safe distance-based ordering for search results
CREATE OR REPLACE FUNCTION search_properties_by_distance(
    user_lat double precision,
    user_lng double precision,
    search_text text DEFAULT NULL,
    max_distance_km integer DEFAULT 25,
    result_limit integer DEFAULT 20,
    result_offset integer DEFAULT 0
)
RETURNS TABLE (
    id uuid,
    title text,
    description text,
    type text,
    price_amount decimal,
    price_period text,
    bedrooms integer,
    bathrooms integer,
    area_size decimal,
    area_unit text,
    location geometry,
    address text,
    neighborhood text,
    city text,
    country text,
    amenities text[],
    status text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    landlord_id uuid,
    distance_meters double precision,
    search_rank real
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_point geometry;
    search_query tsquery;
BEGIN
    -- Validate input parameters
    IF user_lat IS NULL OR user_lng IS NULL THEN
        RAISE EXCEPTION 'Invalid coordinates: lat and lng cannot be null';
    END IF;
    
    IF user_lat < -90 OR user_lat > 90 OR user_lng < -180 OR user_lng > 180 THEN
        RAISE EXCEPTION 'Invalid coordinates: lat must be [-90,90], lng must be [-180,180]';
    END IF;
    
    -- Sanitize and validate other parameters
    IF max_distance_km IS NULL OR max_distance_km <= 0 OR max_distance_km > 100 THEN
        max_distance_km := 25;
    END IF;
    
    IF result_limit IS NULL OR result_limit <= 0 OR result_limit > 100 THEN
        result_limit := 20;
    END IF;
    
    IF result_offset IS NULL OR result_offset < 0 THEN
        result_offset := 0;
    END IF;
    
    -- Create point from user coordinates
    user_point := ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326);
    
    -- Safely create search query if provided
    IF search_text IS NOT NULL AND length(trim(search_text)) > 0 THEN
        -- Use plainto_tsquery to safely handle user input
        search_query := plainto_tsquery('english', trim(search_text));
    END IF;
    
    -- Return properties ordered by distance within radius
    RETURN QUERY
    SELECT 
        p.id,
        p.title,
        p.description,
        p.type,
        p.price_amount,
        p.price_period,
        p.bedrooms,
        p.bathrooms,
        p.area_size,
        p.area_unit,
        p.location,
        p.address,
        p.neighborhood,
        p.city,
        p.country,
        p.amenities,
        p.status,
        p.created_at,
        p.updated_at,
        p.landlord_id,
        ST_Distance(p.location::geography, user_point::geography) as distance_meters,
        CASE 
            WHEN search_query IS NOT NULL AND p.search_vector IS NOT NULL THEN 
                ts_rank(p.search_vector, search_query)
            ELSE 1.0 
        END as search_rank
    FROM properties p
    WHERE p.status = 'active'
        AND p.location IS NOT NULL
        AND ST_DWithin(p.location::geography, user_point::geography, max_distance_km * 1000)
        AND (
            search_query IS NULL 
            OR p.search_vector @@ search_query
        )
    ORDER BY 
        CASE WHEN search_query IS NOT NULL THEN search_rank ELSE 0 END DESC,
        distance_meters ASC
    LIMIT result_limit
    OFFSET result_offset;
END;
$$;

-- Grant execute permissions to the service role
GRANT EXECUTE ON FUNCTION get_featured_properties_by_distance(double precision, double precision, integer) TO service_role;
GRANT EXECUTE ON FUNCTION search_properties_by_distance(double precision, double precision, text, integer, integer, integer) TO service_role;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_properties_location_gist ON properties USING GIST (location) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_properties_featured_location ON properties (featured, featured_at) WHERE status = 'active' AND featured = true;
CREATE INDEX IF NOT EXISTS idx_properties_search_vector_gin ON properties USING GIN (search_vector) WHERE status = 'active';

-- Comment documentation
COMMENT ON FUNCTION get_featured_properties_by_distance IS 'Securely returns featured properties ordered by distance from user location. Prevents SQL injection by using parameterized queries.';
COMMENT ON FUNCTION search_properties_by_distance IS 'Securely searches properties by distance and text search. All parameters are validated and sanitized to prevent injection attacks.';