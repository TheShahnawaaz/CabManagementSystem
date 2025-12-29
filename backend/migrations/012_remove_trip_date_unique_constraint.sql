-- Friday Cab Project - Database Migration
-- Migration: 012_remove_trip_date_unique_constraint
-- Description: Remove UNIQUE constraint on trip_date to allow multiple trips per day
-- Date: 2025-12-29
-- Reason: Business requirement changed - allow multiple trips on same date

-- Drop the UNIQUE constraint on trip_date
ALTER TABLE trips 
DROP CONSTRAINT IF EXISTS trips_trip_date_key;

-- Update table comment to reflect the change
COMMENT ON TABLE trips IS 'Stores trip information. Multiple trips can be scheduled on the same date.';
COMMENT ON COLUMN trips.trip_date IS 'Date of the trip. Multiple trips can have the same date.';

-- Note: The index idx_trips_date is still useful for performance even without uniqueness

