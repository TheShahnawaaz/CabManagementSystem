-- Friday Cab Project - Database Migration
-- Migration: 004_create_trip_users_table
-- Description: Create trip_users table for confirmed bookings (student-trip mapping)
-- Date: 2025-12-26

-- Create hall enum type for residence halls
DO $$ BEGIN
  CREATE TYPE hall_enum AS ENUM ('LBS', 'MMM', 'RK', 'RP', 'GKH', 'VS', 'MS', 'HJB', 'JCB', 'LLR', 'PAN');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create trip_users table
CREATE TABLE IF NOT EXISTS trip_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  hall hall_enum NOT NULL,
  payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT uq_trip_users_booking UNIQUE (trip_id, user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_trip_users_trip ON trip_users(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_users_user ON trip_users(user_id);
CREATE INDEX IF NOT EXISTS idx_trip_users_hall ON trip_users(trip_id, hall);
CREATE INDEX IF NOT EXISTS idx_trip_users_payment ON trip_users(payment_id);

-- Create trigger for updated_at
CREATE TRIGGER trip_users_updated_at
  BEFORE UPDATE ON trip_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Add comments
COMMENT ON TABLE trip_users IS 'Confirmed bookings linking students to trips. Created only after successful payment.';
COMMENT ON COLUMN trip_users.hall IS 'Pickup hall/residence selected by student. Used for cab allocation.';
COMMENT ON COLUMN trip_users.payment_id IS 'Reference to the payment that confirmed this booking.';
COMMENT ON CONSTRAINT uq_trip_users_booking ON trip_users IS 'Ensures one booking per student per trip.';

