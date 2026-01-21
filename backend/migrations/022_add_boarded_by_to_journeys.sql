-- Friday Cab Project - Database Migration
-- Migration: 022_add_boarded_by_to_journeys
-- Description: Add columns to track who initiated the boarding (driver or admin with user_id)
-- Date: 2025-01-21

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

-- Add boarded_by_user_id column to store which admin performed the action
-- NULL for driver boardings, populated for admin boardings
ALTER TABLE journeys
ADD COLUMN IF NOT EXISTS boarded_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- Add comments
COMMENT ON COLUMN journeys.boarded_by IS 'Who initiated the boarding: driver (QR scan) or admin (manual boarding)';
COMMENT ON COLUMN journeys.boarded_by_user_id IS 'User ID of the admin who performed manual boarding. NULL for driver QR scans.';

-- Create indexes for filtering
CREATE INDEX IF NOT EXISTS idx_journeys_boarded_by ON journeys(boarded_by);
CREATE INDEX IF NOT EXISTS idx_journeys_boarded_by_user ON journeys(boarded_by_user_id);
CREATE INDEX IF NOT EXISTS idx_journeys_trip_type_boarded_by ON journeys(trip_id, journey_type, boarded_by);
