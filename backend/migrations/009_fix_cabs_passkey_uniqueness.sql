-- Friday Cab Project - Database Migration
-- Migration: 009_fix_cabs_passkey_uniqueness
-- Description: Add UNIQUE constraint on (trip_id, passkey) to prevent security vulnerability
-- Date: 2025-12-26
-- Issue: Duplicate passkeys within same trip could allow drivers to validate wrong students
-- Fix: Add UNIQUE constraint to ensure passkeys are unique per trip

ALTER TABLE cabs DROP CONSTRAINT IF EXISTS uq_cabs_trip_passkey;

-- Add the missing UNIQUE constraint on (trip_id, passkey)
ALTER TABLE cabs 
ADD CONSTRAINT uq_cabs_trip_passkey 
UNIQUE (trip_id, passkey);

-- Update constraint comment to explain security importance
COMMENT ON CONSTRAINT uq_cabs_trip_passkey ON cabs IS 'Ensures passkeys are unique per trip. Critical for security - prevents drivers from validating wrong students. Fixed in migration 009.';

-- Optional: If there's existing data with duplicate passkeys, you would need to fix it first
-- Example query to find duplicates (run this manually if needed):
-- SELECT trip_id, passkey, COUNT(*) as duplicate_count
-- FROM cabs
-- GROUP BY trip_id, passkey
-- HAVING COUNT(*) > 1;

-- If duplicates exist, you would need to update them before applying the constraint:
-- UPDATE cabs SET passkey = LPAD((FLOOR(RANDOM() * 10000)::INT)::TEXT, 4, '0')
-- WHERE id IN (
--   SELECT id FROM (
--     SELECT id, ROW_NUMBER() OVER (PARTITION BY trip_id, passkey ORDER BY created_at) as rn
--     FROM cabs
--   ) t WHERE rn > 1
-- );

