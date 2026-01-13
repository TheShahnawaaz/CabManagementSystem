-- Friday Cab Project - Database Migration
-- Migration: 020_rename_return_time_add_prayer_time
-- Description: Rename return_time to departure_time and add prayer_time
-- Date: 2026-01-13
-- Reason: Clarify timestamp purposes
--   - departure_time: When cabs leave campus (shown to users)
--   - prayer_time: Hard deadline between outbound/return journeys (backend only)

-- Step 1: Add the new prayer_time column (initially nullable)
ALTER TABLE trips 
ADD COLUMN IF NOT EXISTS prayer_time TIMESTAMPTZ;

-- Step 2: Populate prayer_time with return_time + 30 minutes (default estimate)
UPDATE trips 
SET prayer_time = return_time + INTERVAL '30 minutes'
WHERE prayer_time IS NULL;

-- Step 3: Make prayer_time NOT NULL
ALTER TABLE trips 
ALTER COLUMN prayer_time SET NOT NULL;

-- Step 4: Rename return_time to departure_time
ALTER TABLE trips 
RENAME COLUMN return_time TO departure_time;

-- Step 5: Drop old constraint that referenced return_time
ALTER TABLE trips 
DROP CONSTRAINT IF EXISTS chk_booking_before_trip;

ALTER TABLE trips 
DROP CONSTRAINT IF EXISTS chk_trip_times;

-- Step 6: Add new constraints with proper naming
-- Booking window must close before departure
ALTER TABLE trips 
ADD CONSTRAINT chk_booking_before_departure CHECK (booking_end_time < departure_time);

-- Departure must be before prayer time
ALTER TABLE trips 
ADD CONSTRAINT chk_departure_before_prayer CHECK (departure_time < prayer_time);

-- Prayer must be before end time
ALTER TABLE trips 
ADD CONSTRAINT chk_prayer_before_end CHECK (prayer_time < end_time);

-- Step 7: Update comments
COMMENT ON COLUMN trips.departure_time IS 'When cabs leave campus for mosque. Displayed to users as the hard deadline to arrive.';
COMMENT ON COLUMN trips.prayer_time IS 'Approximate prayer time. Used as hard cutoff between outbound (pickup) and return (dropoff) journeys.';
COMMENT ON COLUMN trips.end_time IS 'Expected time when students are back on campus.';

COMMENT ON CONSTRAINT chk_booking_before_departure ON trips IS 'Ensures booking window closes before cabs depart.';
COMMENT ON CONSTRAINT chk_departure_before_prayer ON trips IS 'Ensures departure is before prayer time.';
COMMENT ON CONSTRAINT chk_prayer_before_end ON trips IS 'Ensures prayer time is before trip end.';
