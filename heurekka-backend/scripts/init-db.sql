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