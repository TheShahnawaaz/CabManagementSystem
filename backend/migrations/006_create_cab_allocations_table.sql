-- Friday Cab Project - Database Migration
-- Migration: 006_create_cab_allocations_table
-- Description: Create cab_allocations table to map students to specific cabs
-- Date: 2025-12-26

-- Create cab_allocations table
CREATE TABLE IF NOT EXISTS cab_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cab_id UUID NOT NULL REFERENCES cabs(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT uq_cab_allocations_trip_user UNIQUE (trip_id, user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_cab_allocations_trip ON cab_allocations(trip_id);
CREATE INDEX IF NOT EXISTS idx_cab_allocations_user ON cab_allocations(user_id);
CREATE INDEX IF NOT EXISTS idx_cab_allocations_cab ON cab_allocations(cab_id);
CREATE INDEX IF NOT EXISTS idx_cab_allocations_trip_user ON cab_allocations(trip_id, user_id);
CREATE INDEX IF NOT EXISTS idx_cab_allocations_trip_cab ON cab_allocations(trip_id, cab_id);

-- Create trigger for updated_at
CREATE TRIGGER cab_allocations_updated_at
  BEFORE UPDATE ON cab_allocations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Add comments
COMMENT ON TABLE cab_allocations IS 'Maps students to specific cabs after allocation algorithm runs. Used to generate QR codes and validate boarding.';
COMMENT ON COLUMN cab_allocations.trip_id IS 'Trip context for this allocation.';
COMMENT ON COLUMN cab_allocations.user_id IS 'Student who is allocated to a cab.';
COMMENT ON COLUMN cab_allocations.cab_id IS 'Cab assigned to this student.';
COMMENT ON CONSTRAINT uq_cab_allocations_trip_user ON cab_allocations IS 'Ensures each student gets exactly one cab per trip.';

-- Create view for cab rosters (useful for admin)
CREATE OR REPLACE VIEW cab_rosters AS
SELECT 
  ca.id as allocation_id,
  ca.trip_id,
  t.trip_title,
  t.trip_date,
  ca.cab_id,
  c.cab_number,
  c.pickup_region,
  c.passkey,
  ca.user_id,
  u.name as student_name,
  u.email as student_email,
  tu.hall as student_hall,
  ca.created_at as allocated_at
FROM cab_allocations ca
JOIN cabs c ON ca.cab_id = c.id
JOIN users u ON ca.user_id = u.id
JOIN trips t ON ca.trip_id = t.id
LEFT JOIN trip_users tu ON tu.trip_id = ca.trip_id AND tu.user_id = ca.user_id
ORDER BY c.cab_number, u.name;

COMMENT ON VIEW cab_rosters IS 'Complete roster showing which students are assigned to which cabs, with all relevant details.';

