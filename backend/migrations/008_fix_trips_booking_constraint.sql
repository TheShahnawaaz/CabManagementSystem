-- Friday Cab Project - Database Migration
-- Migration: 008_fix_trips_booking_constraint
-- Description: Add constraint to ensure booking window closes before trip starts
-- Date: 2025-12-26
-- Issue: booking_end_time could be after return_time (logically impossible)
-- Fix: Add CHECK constraint to ensure booking_end_time < return_time

-- Add the missing constraint
ALTER TABLE trips 
ADD CONSTRAINT chk_booking_before_trip 
CHECK (booking_end_time < return_time);

-- Update table comment to reflect the fix
COMMENT ON CONSTRAINT chk_booking_before_trip ON trips IS 'Ensures booking window closes before the trip starts. Fixed in migration 008.';

