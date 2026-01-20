-- Friday Cab Project - Database Migration
-- Migration: 022_add_boarded_by_to_journeys
-- Description: Add boarded_by column to track who initiated the boarding (driver or admin)
-- Date: 2025-01-20

-- Create boarded_by enum
DO $$ BEGIN
  CREATE TYPE boarded_by_enum AS ENUM ('driver', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add boarded_by column to journeys table
-- Default to 'driver' for existing records (all were QR scanned before this feature)
ALTER TABLE journeys 
ADD COLUMN IF NOT EXISTS boarded_by boarded_by_enum NOT NULL DEFAULT 'driver';

-- Add comment
COMMENT ON COLUMN journeys.boarded_by IS 'Who initiated the boarding: driver (QR scan) or admin (manual boarding)';

-- Create index for filtering by boarded_by
CREATE INDEX IF NOT EXISTS idx_journeys_boarded_by ON journeys(boarded_by);
CREATE INDEX IF NOT EXISTS idx_journeys_trip_type_boarded_by ON journeys(trip_id, journey_type, boarded_by);
