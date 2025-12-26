-- Friday Cab Project - Database Migration
-- Migration: 007_create_journeys_table
-- Description: Create journeys table for audit logging of QR scans and boarding validations
-- Date: 2025-12-26

-- Create journey type enum
DO $$ BEGIN
  CREATE TYPE journey_type_enum AS ENUM ('pickup', 'dropoff');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create journeys table
CREATE TABLE IF NOT EXISTS journeys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cab_id UUID NOT NULL REFERENCES cabs(id) ON DELETE CASCADE,
  journey_type journey_type_enum NOT NULL,
  journey_date_time TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_journeys_trip ON journeys(trip_id);
CREATE INDEX IF NOT EXISTS idx_journeys_user ON journeys(user_id);
CREATE INDEX IF NOT EXISTS idx_journeys_cab ON journeys(cab_id);
CREATE INDEX IF NOT EXISTS idx_journeys_trip_user ON journeys(trip_id, user_id);
CREATE INDEX IF NOT EXISTS idx_journeys_trip_type ON journeys(trip_id, journey_type);
CREATE INDEX IF NOT EXISTS idx_journeys_datetime ON journeys(journey_date_time);
CREATE INDEX IF NOT EXISTS idx_journeys_cab_type ON journeys(cab_id, journey_type);

-- Create trigger for updated_at
CREATE TRIGGER journeys_updated_at
  BEFORE UPDATE ON journeys
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Add comments
COMMENT ON TABLE journeys IS 'Audit log of all QR code scans and boarding validations. Records both outbound (pickup) and return (dropoff) journeys.';
COMMENT ON COLUMN journeys.journey_type IS 'Type of journey: pickup (campus to mosque) or dropoff (mosque to campus).';
COMMENT ON COLUMN journeys.journey_date_time IS 'Timestamp when QR code was scanned by driver.';

-- Create view for journey analytics
CREATE OR REPLACE VIEW journey_analytics AS
SELECT 
  j.trip_id,
  t.trip_title,
  t.trip_date,
  j.journey_type,
  COUNT(DISTINCT j.user_id) as unique_students,
  COUNT(j.id) as total_scans,
  MIN(j.journey_date_time) as first_scan_time,
  MAX(j.journey_date_time) as last_scan_time
FROM journeys j
JOIN trips t ON j.trip_id = t.id
GROUP BY j.trip_id, t.trip_title, t.trip_date, j.journey_type
ORDER BY t.trip_date DESC, j.journey_type;

COMMENT ON VIEW journey_analytics IS 'Summary statistics of journeys per trip and type (pickup/dropoff).';

-- Create view for no-shows (paid but didn't board)
CREATE OR REPLACE VIEW no_shows AS
SELECT 
  tu.trip_id,
  t.trip_title,
  t.trip_date,
  tu.user_id,
  u.name as student_name,
  u.email as student_email,
  tu.hall,
  ca.cab_id,
  c.cab_number,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM journeys j 
      WHERE j.trip_id = tu.trip_id 
        AND j.user_id = tu.user_id 
        AND j.journey_type = 'pickup'
    ) THEN false
    ELSE true
  END as is_no_show
FROM trip_users tu
JOIN users u ON tu.user_id = u.id
JOIN trips t ON tu.trip_id = t.id
LEFT JOIN cab_allocations ca ON ca.trip_id = tu.trip_id AND ca.user_id = tu.user_id
LEFT JOIN cabs c ON c.id = ca.cab_id
WHERE NOT EXISTS (
  SELECT 1 FROM journeys j 
  WHERE j.trip_id = tu.trip_id 
    AND j.user_id = tu.user_id 
    AND j.journey_type = 'pickup'
)
ORDER BY t.trip_date DESC, tu.hall, u.name;

COMMENT ON VIEW no_shows IS 'Students who paid and were allocated but did not board (no pickup scan). Useful for admin reports.';

-- Create view for journey details (complete audit trail)
CREATE OR REPLACE VIEW journey_details AS
SELECT 
  j.id as journey_id,
  j.journey_type,
  j.journey_date_time,
  t.trip_title,
  t.trip_date,
  u.name as student_name,
  u.email as student_email,
  tu.hall as student_hall,
  c.cab_number,
  c.pickup_region,
  c.passkey as cab_passkey,
  ca.id as allocation_id
FROM journeys j
JOIN trips t ON j.trip_id = t.id
JOIN users u ON j.user_id = u.id
JOIN cabs c ON j.cab_id = c.id
LEFT JOIN trip_users tu ON tu.trip_id = j.trip_id AND tu.user_id = j.user_id
LEFT JOIN cab_allocations ca ON ca.trip_id = j.trip_id AND ca.user_id = j.user_id
ORDER BY j.journey_date_time DESC;

COMMENT ON VIEW journey_details IS 'Complete journey audit trail with all related details for each scan.';

