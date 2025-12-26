-- Friday Cab Project - Database Migration
-- Migration: 002_create_trips_table
-- Description: Create trips table for managing Friday prayer transportation events
-- Date: 2025-12-26

-- Create trips table
CREATE TABLE IF NOT EXISTS trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_title VARCHAR(255) NOT NULL,
  trip_date DATE NOT NULL UNIQUE,
  booking_start_time TIMESTAMPTZ NOT NULL,
  booking_end_time TIMESTAMPTZ NOT NULL,
  return_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  amount_per_person DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT chk_booking_window CHECK (booking_end_time > booking_start_time),
  CONSTRAINT chk_booking_before_trip CHECK (booking_end_time < return_time),
  CONSTRAINT chk_trip_times CHECK (end_time > return_time),
  CONSTRAINT chk_amount_positive CHECK (amount_per_person > 0)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_trips_date ON trips(trip_date);
CREATE INDEX IF NOT EXISTS idx_trips_booking_window ON trips(booking_start_time, booking_end_time);

-- Create trigger for updated_at
CREATE TRIGGER trips_updated_at
  BEFORE UPDATE ON trips
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Add comments
COMMENT ON TABLE trips IS 'Stores Friday prayer trip information. One trip per Friday date.';
COMMENT ON COLUMN trips.trip_date IS 'Date of the Friday prayer trip. Must be unique.';
COMMENT ON COLUMN trips.booking_start_time IS 'When booking window opens for students.';
COMMENT ON COLUMN trips.booking_end_time IS 'When booking window closes for students. Must be before return_time.';
COMMENT ON COLUMN trips.return_time IS 'Expected return time from mosque (trip start time).';
COMMENT ON COLUMN trips.end_time IS 'Expected trip end time (when students are back).';
COMMENT ON COLUMN trips.amount_per_person IS 'Cost per person in INR or local currency.';
COMMENT ON CONSTRAINT chk_booking_before_trip ON trips IS 'Ensures booking window closes before the trip starts (return_time).';

