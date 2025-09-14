-- ==============================================
-- Heurekka Database Initialization Script
-- ==============================================
-- This script is automatically run when PostgreSQL container starts
-- It sets up the basic database structure and extensions

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;
CREATE EXTENSION IF NOT EXISTS fuzzystrmatch;
CREATE EXTENSION IF NOT EXISTS postgis_tiger_geocoder;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable full-text search extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Create schemas for better organization
CREATE SCHEMA IF NOT EXISTS public;
CREATE SCHEMA IF NOT EXISTS audit;
CREATE SCHEMA IF NOT EXISTS logs;

-- Set search path
ALTER DATABASE heurekka_dev SET search_path TO public, postgis, audit, logs;

-- Grant permissions to the application user
GRANT ALL PRIVILEGES ON SCHEMA public TO heurekka;
GRANT ALL PRIVILEGES ON SCHEMA audit TO heurekka;
GRANT ALL PRIVILEGES ON SCHEMA logs TO heurekka;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO heurekka;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO heurekka;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO heurekka;

-- Create audit trigger function for change tracking
CREATE OR REPLACE FUNCTION audit.audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit.audit_log (
            table_name,
            operation,
            new_values,
            created_at,
            user_id
        ) VALUES (
            TG_TABLE_NAME,
            TG_OP,
            to_jsonb(NEW),
            NOW(),
            COALESCE(current_setting('app.user_id', true), 'system')
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit.audit_log (
            table_name,
            operation,
            old_values,
            new_values,
            created_at,
            user_id
        ) VALUES (
            TG_TABLE_NAME,
            TG_OP,
            to_jsonb(OLD),
            to_jsonb(NEW),
            NOW(),
            COALESCE(current_setting('app.user_id', true), 'system')
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit.audit_log (
            table_name,
            operation,
            old_values,
            created_at,
            user_id
        ) VALUES (
            TG_TABLE_NAME,
            TG_OP,
            to_jsonb(OLD),
            NOW(),
            COALESCE(current_setting('app.user_id', true), 'system')
        );
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit log table
CREATE TABLE IF NOT EXISTS audit.audit_log (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(255) NOT NULL,
    operation VARCHAR(10) NOT NULL,
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id VARCHAR(255)
);

-- Create application log table
CREATE TABLE IF NOT EXISTS logs.application_logs (
    id SERIAL PRIMARY KEY,
    level VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    meta JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    service VARCHAR(100),
    trace_id VARCHAR(255)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_audit_log_table_name ON audit.audit_log (table_name);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit.audit_log (created_at);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit.audit_log (user_id);

CREATE INDEX IF NOT EXISTS idx_app_logs_level ON logs.application_logs (level);
CREATE INDEX IF NOT EXISTS idx_app_logs_timestamp ON logs.application_logs (timestamp);
CREATE INDEX IF NOT EXISTS idx_app_logs_service ON logs.application_logs (service);
CREATE INDEX IF NOT EXISTS idx_app_logs_trace_id ON logs.application_logs (trace_id);

-- Insert development data (optional)
-- This will be expanded as the application schema is developed

COMMENT ON DATABASE heurekka_dev IS 'Heurekka Development Database with PostGIS support for geospatial operations';
COMMENT ON SCHEMA audit IS 'Schema for audit trails and change tracking';
COMMENT ON SCHEMA logs IS 'Schema for application logging';

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Heurekka database initialized successfully with PostGIS extensions';
END $$;

-- ==============================================
-- Property Discovery Schema Migration
-- ==============================================

-- Create enum types
CREATE TYPE property_type AS ENUM ('apartment', 'house', 'room', 'commercial');
CREATE TYPE property_status AS ENUM ('active', 'inactive', 'pending', 'sold', 'rented');
CREATE TYPE verification_status AS ENUM ('verified', 'pending', 'unverified');
CREATE TYPE currency AS ENUM ('HNL', 'USD');
CREATE TYPE price_period AS ENUM ('month', 'day', 'week');
CREATE TYPE size_unit AS ENUM ('m2', 'ft2');

-- Landlords/Property Owners table
CREATE TABLE landlords (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    photo_url TEXT,
    rating DECIMAL(2,1) DEFAULT 4.5 CHECK (rating >= 0 AND rating <= 5),
    response_rate INTEGER DEFAULT 85 CHECK (response_rate >= 0 AND response_rate <= 100),
    whatsapp_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Neighborhoods table for location-based searches
CREATE TABLE neighborhoods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    city VARCHAR(50) DEFAULT 'Tegucigalpa',
    state VARCHAR(50) DEFAULT 'Francisco Morazán',
    country VARCHAR(50) DEFAULT 'Honduras',
    location GEOGRAPHY(POINT, 4326), -- PostGIS point for center of neighborhood
    property_count INTEGER DEFAULT 0,
    average_price DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Properties table - core property data
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    landlord_id UUID NOT NULL REFERENCES landlords(id) ON DELETE CASCADE,

    -- Basic information
    title VARCHAR(200) NOT NULL,
    description TEXT,
    type property_type NOT NULL,
    status property_status DEFAULT 'active',

    -- Location
    address JSONB NOT NULL, -- Flexible address structure
    neighborhood_id UUID REFERENCES neighborhoods(id),
    location GEOGRAPHY(POINT, 4326) NOT NULL, -- PostGIS point for exact location

    -- Pricing
    price_amount DECIMAL(10,2) NOT NULL,
    price_currency currency DEFAULT 'HNL',
    price_period price_period DEFAULT 'month',

    -- Details
    size_value DECIMAL(8,2),
    size_unit size_unit DEFAULT 'm2',
    bedrooms INTEGER CHECK (bedrooms >= 0 AND bedrooms <= 20),
    bathrooms DECIMAL(2,1) CHECK (bathrooms >= 0 AND bathrooms <= 20),
    amenities TEXT[], -- Array of amenity names

    -- Media
    virtual_tour_url TEXT,
    video_url TEXT,

    -- Availability
    available_from DATE DEFAULT CURRENT_DATE,
    minimum_stay INTEGER, -- days
    maximum_stay INTEGER, -- days

    -- Features for search and display
    featured BOOLEAN DEFAULT false,
    featured_at TIMESTAMP WITH TIME ZONE,

    -- Analytics
    view_count INTEGER DEFAULT 0,
    save_count INTEGER DEFAULT 0,
    response_time INTEGER DEFAULT 60, -- average response time in minutes
    verification_status verification_status DEFAULT 'pending',

    -- Full-text search
    search_vector tsvector,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Indexes for performance
    CONSTRAINT valid_price CHECK (price_amount > 0),
    CONSTRAINT valid_size CHECK (size_value IS NULL OR size_value > 0)
);

-- Property images table
CREATE TABLE property_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    alt VARCHAR(255),
    width INTEGER,
    height INTEGER,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Search analytics for tracking popular searches
CREATE TABLE search_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    query TEXT NOT NULL,
    search_count INTEGER DEFAULT 1,
    last_searched TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Analytics events table
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_name VARCHAR(100) NOT NULL,
    event_properties JSONB,
    session_id VARCHAR(100),
    user_id UUID,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT
);

-- Saved properties for users (session-based for now)
CREATE TABLE saved_properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(100) NOT NULL, -- session ID or user ID
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, property_id)
);

-- Search metrics for homepage display
CREATE TABLE search_metrics (
    id INTEGER PRIMARY KEY DEFAULT 1,
    total_properties INTEGER DEFAULT 0,
    average_response_time INTEGER DEFAULT 60,
    successful_matches INTEGER DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT single_row CHECK (id = 1)
);

-- Create indexes for performance
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_featured ON properties(featured, featured_at DESC) WHERE featured = true;
CREATE INDEX idx_properties_type ON properties(type);
CREATE INDEX idx_properties_price ON properties(price_amount);
CREATE INDEX idx_properties_bedrooms ON properties(bedrooms);
CREATE INDEX idx_properties_location ON properties USING GIST(location);
CREATE INDEX idx_properties_created_at ON properties(created_at DESC);
CREATE INDEX idx_properties_updated_at ON properties(updated_at DESC);
CREATE INDEX idx_properties_search_vector ON properties USING GIN(search_vector);
CREATE INDEX idx_properties_neighborhood ON properties(neighborhood_id);

CREATE INDEX idx_property_images_property_id ON property_images(property_id, order_index);
CREATE INDEX idx_neighborhoods_location ON neighborhoods USING GIST(location);
CREATE INDEX idx_search_analytics_query ON search_analytics(query);
CREATE INDEX idx_search_analytics_count ON search_analytics(search_count DESC);
CREATE INDEX idx_analytics_events_name ON analytics_events(event_name);
CREATE INDEX idx_analytics_events_timestamp ON analytics_events(timestamp DESC);
CREATE INDEX idx_saved_properties_user ON saved_properties(user_id);

-- Create a function to update the search vector
CREATE OR REPLACE FUNCTION update_property_search_vector() RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(array_to_string(NEW.amenities, ' '), '')), 'C') ||
        setweight(to_tsvector('english', COALESCE((NEW.address->>'neighborhood'), '')), 'B') ||
        setweight(to_tsvector('english', COALESCE((NEW.address->>'street'), '')), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update search vector
CREATE TRIGGER properties_search_vector_trigger
    BEFORE INSERT OR UPDATE ON properties
    FOR EACH ROW
    EXECUTE FUNCTION update_property_search_vector();

-- Create function to increment property save count
CREATE OR REPLACE FUNCTION increment_property_save_count(property_id UUID) RETURNS VOID AS $$
BEGIN
    UPDATE properties
    SET save_count = save_count + 1, updated_at = CURRENT_TIMESTAMP
    WHERE id = property_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to update search metrics
CREATE OR REPLACE FUNCTION update_search_metrics() RETURNS VOID AS $$
BEGIN
    INSERT INTO search_metrics (id, total_properties, average_response_time, successful_matches, last_updated)
    VALUES (1,
        (SELECT COUNT(*) FROM properties WHERE status = 'active'),
        (SELECT AVG(response_time)::INTEGER FROM properties WHERE status = 'active'),
        (SELECT COUNT(*) FROM saved_properties WHERE saved_at > CURRENT_DATE - INTERVAL '30 days'),
        CURRENT_TIMESTAMP
    )
    ON CONFLICT (id) DO UPDATE SET
        total_properties = EXCLUDED.total_properties,
        average_response_time = EXCLUDED.average_response_time,
        successful_matches = EXCLUDED.successful_matches,
        last_updated = EXCLUDED.last_updated;
END;
$$ LANGUAGE plpgsql;

-- Insert some initial data for development
INSERT INTO neighborhoods (name, location, property_count, average_price) VALUES
('Colonia Palmira', ST_GeogFromText('POINT(-87.2068 14.0941)'), 45, 15000.00),
('Lomas del Guijarro', ST_GeogFromText('POINT(-87.1923 14.1156)'), 32, 22000.00),
('Las Colinas', ST_GeogFromText('POINT(-87.1845 14.1089)'), 28, 18000.00),
('Centro Histórico', ST_GeogFromText('POINT(-87.2069 14.1014)'), 15, 12000.00),
('Comayagüela', ST_GeogFromText('POINT(-87.2208 14.0889)'), 25, 9000.00);

-- Insert initial search metrics
INSERT INTO search_metrics (id, total_properties, average_response_time, successful_matches, last_updated)
VALUES (1, 0, 60, 0, CURRENT_TIMESTAMP);

-- Insert some sample landlords
INSERT INTO landlords (name, email, phone, rating, response_rate, whatsapp_enabled) VALUES
('María González', 'maria.gonzalez@email.com', '+504 9999-1234', 4.8, 92, true),
('Carlos Rodríguez', 'carlos.rodriguez@email.com', '+504 9999-5678', 4.6, 87, true),
('Ana Martínez', 'ana.martinez@email.com', '+504 9999-9012', 4.9, 95, true),
('Luis Hernández', 'luis.hernandez@email.com', '+504 9999-3456', 4.5, 83, true),
('Carmen López', 'carmen.lopez@email.com', '+504 9999-7890', 4.7, 90, true);

-- Insert sample properties for testing
INSERT INTO properties (
    landlord_id, title, description, type, address, neighborhood_id, location,
    price_amount, price_currency, price_period, size_value, size_unit,
    bedrooms, bathrooms, amenities, featured, featured_at, verification_status
)
SELECT
    l.id,
    CASE
        WHEN n.name = 'Colonia Palmira' THEN 'Hermoso Apartamento en Colonia Palmira'
        WHEN n.name = 'Lomas del Guijarro' THEN 'Casa Moderna en Lomas del Guijarro'
        WHEN n.name = 'Las Colinas' THEN 'Apartamento Amueblado Las Colinas'
        ELSE 'Propiedad en ' || n.name
    END,
    'Espaciosa propiedad en excelente ubicación con todas las comodidades modernas. Ideal para familias que buscan tranquilidad y accesibilidad.',
    CASE WHEN random() > 0.7 THEN 'house'::property_type ELSE 'apartment'::property_type END,
    jsonb_build_object(
        'street', 'Calle Principal ' || (floor(random() * 100) + 1)::text,
        'neighborhood', n.name,
        'city', 'Tegucigalpa',
        'state', 'Francisco Morazán',
        'country', 'Honduras',
        'postalCode', '11101'
    ),
    n.id,
    n.location,
    n.average_price + (random() * 5000 - 2500),
    'HNL',
    'month',
    50 + (random() * 100),
    'm2',
    floor(random() * 4) + 1,
    1 + (random() * 2.5)::numeric(2,1),
    ARRAY['parking', 'security', 'internet', 'furnished']::text[],
    random() > 0.7, -- 30% chance of being featured
    CASE WHEN random() > 0.7 THEN CURRENT_TIMESTAMP ELSE NULL END,
    'verified'::verification_status
FROM landlords l
CROSS JOIN neighborhoods n
LIMIT 20; -- Create 4 properties per neighborhood

-- Update search metrics after inserting sample data
SELECT update_search_metrics();

-- Create a view for featured properties with all related data
CREATE VIEW featured_properties_view AS
SELECT
    p.*,
    l.name as landlord_name,
    l.photo_url as landlord_photo,
    l.rating as landlord_rating,
    l.response_rate as landlord_response_rate,
    l.whatsapp_enabled as landlord_whatsapp_enabled,
    n.name as neighborhood_name,
    (
        SELECT json_agg(
            json_build_object(
                'id', pi.id,
                'url', pi.url,
                'thumbnail_url', pi.thumbnail_url,
                'alt', pi.alt,
                'width', pi.width,
                'height', pi.height,
                'order', pi.order_index
            ) ORDER BY pi.order_index
        )
        FROM property_images pi
        WHERE pi.property_id = p.id
    ) as images
FROM properties p
JOIN landlords l ON p.landlord_id = l.id
LEFT JOIN neighborhoods n ON p.neighborhood_id = n.id
WHERE p.status = 'active' AND p.featured = true;

COMMENT ON TABLE properties IS 'Core properties table for the rental marketplace';
COMMENT ON TABLE property_images IS 'Property images with ordering and metadata';
COMMENT ON TABLE search_analytics IS 'Tracks popular search queries for suggestions';
COMMENT ON TABLE analytics_events IS 'General analytics event tracking';
COMMENT ON TABLE neighborhoods IS 'Predefined neighborhoods with location data';
COMMENT ON VIEW featured_properties_view IS 'Optimized view for featured properties with all related data';