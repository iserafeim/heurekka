-- Update verification_data table schema for email/phone verification
-- Migration: 003_update_verification_data_schema.sql
-- Created: 2025-10-04

-- Add missing columns
ALTER TABLE verification_data
ADD COLUMN IF NOT EXISTS status text,
ADD COLUMN IF NOT EXISTS verification_code_hash text,
ADD COLUMN IF NOT EXISTS code_expires_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS attempts integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_attempts integer DEFAULT 5,
ADD COLUMN IF NOT EXISTS verified_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS metadata jsonb;

-- Migrate existing data
-- Map verification_status to status
UPDATE verification_data
SET status = verification_status::text
WHERE status IS NULL;

-- Map expires_at to code_expires_at
UPDATE verification_data
SET code_expires_at = expires_at
WHERE code_expires_at IS NULL;

-- Map verification_attempts to attempts
UPDATE verification_data
SET attempts = COALESCE(verification_attempts, 0)
WHERE attempts IS NULL OR attempts = 0;

-- Set default max_attempts if null
UPDATE verification_data
SET max_attempts = 5
WHERE max_attempts IS NULL;

-- Create index on landlord_id and verification_type for faster queries
CREATE INDEX IF NOT EXISTS idx_verification_data_landlord_type
ON verification_data(landlord_id, verification_type);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_verification_data_status
ON verification_data(status);

-- Create index on code_expires_at for expiration checks
CREATE INDEX IF NOT EXISTS idx_verification_data_expires
ON verification_data(code_expires_at);
