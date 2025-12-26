-- Friday Cab Project - Database Migration
-- Migration: 005_create_cabs_table
-- Description: Create cabs table for managing hired vehicles per trip
-- Date: 2025-12-26

-- Create cabs table
CREATE TABLE IF NOT EXISTS cabs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  cab_number VARCHAR(20) NOT NULL,
  cab_type VARCHAR(50),
  cab_capacity INTEGER NOT NULL DEFAULT 7,
  cab_owner_name VARCHAR(255),
  cab_owner_phone VARCHAR(15),
  pickup_region VARCHAR(50) NOT NULL,
  passkey CHAR(4) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT uq_cabs_trip_number UNIQUE (trip_id, cab_number),
  CONSTRAINT chk_cab_capacity_positive CHECK (cab_capacity > 0),
  CONSTRAINT chk_passkey_length CHECK (LENGTH(passkey) = 4 AND passkey ~ '^[0-9]{4}$')
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_cabs_trip ON cabs(trip_id);
CREATE INDEX IF NOT EXISTS idx_cabs_trip_region ON cabs(trip_id, pickup_region);
CREATE INDEX IF NOT EXISTS idx_cabs_passkey ON cabs(passkey);
CREATE INDEX IF NOT EXISTS idx_cabs_number ON cabs(cab_number);

-- Create trigger for updated_at
CREATE TRIGGER cabs_updated_at
  BEFORE UPDATE ON cabs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Add comments
COMMENT ON TABLE cabs IS 'Stores cab/vehicle information hired for specific trips. Each cab gets a unique 4-digit passkey for driver validation.';
COMMENT ON COLUMN cabs.cab_number IS 'Vehicle registration plate number (e.g., WB-06-1234).';
COMMENT ON COLUMN cabs.cab_type IS 'Type of vehicle: sedan, suv, tempo, etc.';
COMMENT ON COLUMN cabs.cab_capacity IS 'Maximum passenger capacity. Default is 7 seats.';
COMMENT ON COLUMN cabs.pickup_region IS 'Assigned pickup region/hall for this cab. Maps to residence halls.';
COMMENT ON COLUMN cabs.passkey IS 'Unique 4-digit code for driver validation. Shared with driver by admin.';
COMMENT ON CONSTRAINT uq_cabs_trip_number ON cabs IS 'Prevents duplicate cab numbers in the same trip.';
COMMENT ON CONSTRAINT chk_passkey_length ON cabs IS 'Ensures passkey is exactly 4 digits (0000-9999).';

