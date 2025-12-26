-- Friday Cab Project - Test Script for Phase 1, Step 1.2
-- Description: Test cab management tables (cabs, cab_allocations)
-- Date: 2025-12-26

-- ====================================
-- TEST 1: Verify Tables Exist
-- ====================================
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('cabs', 'cab_allocations')
ORDER BY table_name;

-- Expected: Should return 2 rows (cabs, cab_allocations)

-- ====================================
-- TEST 2: Verify Foreign Keys
-- ====================================
SELECT
  tc.constraint_name, 
  tc.table_name, 
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name IN ('cabs', 'cab_allocations')
ORDER BY tc.table_name, tc.constraint_name;

-- Expected: Should show all foreign key relationships

-- ====================================
-- TEST 3: Verify Indexes
-- ====================================
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename IN ('cabs', 'cab_allocations')
ORDER BY tablename, indexname;

-- Expected: Should show all created indexes

-- ====================================
-- TEST 4: Verify View Created
-- ====================================
SELECT table_name 
FROM information_schema.views 
WHERE table_schema = 'public' 
  AND table_name = 'cab_rosters';

-- Expected: Should return 'cab_rosters'

-- ====================================
-- TEST 5: Insert Sample Cab
-- ====================================
WITH first_trip AS (
  SELECT id FROM trips LIMIT 1
)
INSERT INTO cabs (
  trip_id,
  cab_number,
  cab_type,
  cab_capacity,
  cab_owner_name,
  cab_owner_phone,
  pickup_region,
  passkey
)
SELECT 
  first_trip.id,
  'WB-06-1234',
  'sedan',
  7,
  'Ravi Kumar',
  '9876543210',
  'LBS',
  '4590'
FROM first_trip
RETURNING id, cab_number, passkey, pickup_region;

-- Expected: Should return the created cab with passkey

-- ====================================
-- TEST 6: Insert Another Cab for Same Trip
-- ====================================
WITH first_trip AS (
  SELECT id FROM trips LIMIT 1
)
INSERT INTO cabs (
  trip_id,
  cab_number,
  cab_capacity,
  pickup_region,
  passkey
)
SELECT 
  first_trip.id,
  'WB-06-5678',
  7,
  'LBS',
  '7823'
FROM first_trip
RETURNING id, cab_number, passkey;

-- Expected: Should create second cab

-- ====================================
-- TEST 7: Test UNIQUE Constraint (duplicate cab_number)
-- ====================================
-- This should FAIL with unique constraint violation
-- WITH first_trip AS (
--   SELECT id FROM trips LIMIT 1
-- )
-- INSERT INTO cabs (trip_id, cab_number, cab_capacity, pickup_region, passkey)
-- SELECT first_trip.id, 'WB-06-1234', 7, 'MMM', '1111'
-- FROM first_trip;

-- ====================================
-- TEST 8: Test CHECK Constraint (invalid passkey)
-- ====================================
-- This should FAIL - passkey must be exactly 4 digits
-- WITH first_trip AS (
--   SELECT id FROM trips LIMIT 1
-- )
-- INSERT INTO cabs (trip_id, cab_number, cab_capacity, pickup_region, passkey)
-- SELECT first_trip.id, 'WB-06-9999', 7, 'LBS', '123'  -- Only 3 digits
-- FROM first_trip;

-- ====================================
-- TEST 9: Test CHECK Constraint (non-numeric passkey)
-- ====================================
-- This should FAIL - passkey must be numeric
-- WITH first_trip AS (
--   SELECT id FROM trips LIMIT 1
-- )
-- INSERT INTO cabs (trip_id, cab_number, cab_capacity, pickup_region, passkey)
-- SELECT first_trip.id, 'WB-06-8888', 7, 'LBS', 'ABCD'  -- Letters not allowed
-- FROM first_trip;

-- ====================================
-- TEST 9A: Test UNIQUE Constraint (duplicate passkey in same trip)
-- ====================================
-- This should FAIL - passkeys must be unique per trip (SECURITY CRITICAL)
-- WITH first_trip AS (
--   SELECT id FROM trips LIMIT 1
-- )
-- INSERT INTO cabs (trip_id, cab_number, cab_capacity, pickup_region, passkey)
-- SELECT first_trip.id, 'WB-06-9999', 7, 'MMM', '4590'  -- Same passkey as first cab
-- FROM first_trip;
-- Expected Error: duplicate key value violates unique constraint "uq_cabs_trip_passkey"

-- ====================================
-- TEST 10: Insert Cab Allocation
-- ====================================
WITH first_trip AS (
  SELECT id FROM trips LIMIT 1
),
first_user AS (
  SELECT id FROM users LIMIT 1
),
first_cab AS (
  SELECT id FROM cabs LIMIT 1
)
INSERT INTO cab_allocations (
  trip_id,
  user_id,
  cab_id
)
SELECT 
  first_trip.id,
  first_user.id,
  first_cab.id
FROM first_trip, first_user, first_cab
RETURNING id, created_at;

-- Expected: Should return the created allocation

-- ====================================
-- TEST 11: Test UNIQUE Constraint (duplicate allocation)
-- ====================================
-- This should FAIL - one student can't be allocated twice to same trip
-- WITH first_trip AS (
--   SELECT id FROM trips LIMIT 1
-- ),
-- first_user AS (
--   SELECT id FROM users LIMIT 1
-- ),
-- second_cab AS (
--   SELECT id FROM cabs ORDER BY created_at DESC LIMIT 1 OFFSET 1
-- )
-- INSERT INTO cab_allocations (trip_id, user_id, cab_id)
-- SELECT first_trip.id, first_user.id, second_cab.id
-- FROM first_trip, first_user, second_cab;

-- ====================================
-- TEST 12: Query Cab Rosters View
-- ====================================
SELECT 
  cab_number,
  pickup_region,
  passkey,
  COUNT(*) as students_allocated
FROM cab_rosters
GROUP BY cab_number, pickup_region, passkey
ORDER BY cab_number;

-- Expected: Should show cabs with student counts

-- ====================================
-- TEST 13: Detailed Cab Roster for Specific Cab
-- ====================================
WITH first_cab AS (
  SELECT id, cab_number FROM cabs LIMIT 1
)
SELECT 
  student_name,
  student_email,
  student_hall,
  allocated_at
FROM cab_rosters
WHERE cab_id = (SELECT id FROM first_cab)
ORDER BY student_name;

-- Expected: Should show all students allocated to first cab

-- ====================================
-- TEST 14: Query Cabs by Region
-- ====================================
WITH first_trip AS (
  SELECT id FROM trips LIMIT 1
)
SELECT 
  cab_number,
  pickup_region,
  passkey,
  cab_capacity,
  (SELECT COUNT(*) FROM cab_allocations WHERE cab_id = cabs.id) as allocated_count,
  cab_capacity - (SELECT COUNT(*) FROM cab_allocations WHERE cab_id = cabs.id) as remaining_seats
FROM cabs
WHERE trip_id = (SELECT id FROM first_trip)
  AND pickup_region = 'LBS'
ORDER BY cab_number;

-- Expected: Shows cabs for LBS region with capacity info

-- ====================================
-- TEST 15: Verify Passkey Uniqueness per Trip
-- ====================================
WITH first_trip AS (
  SELECT id FROM trips LIMIT 1
)
SELECT 
  passkey,
  COUNT(*) as passkey_count
FROM cabs
WHERE trip_id = (SELECT id FROM first_trip)
GROUP BY passkey
HAVING COUNT(*) > 1;

-- Expected: Should return 0 rows (all passkeys unique)

-- ====================================
-- TEST 16: Simulate Driver Validation Query
-- ====================================
-- Driver scans QR, gets allocation_id, enters passkey
-- System needs to check if passkey matches allocated cab

WITH test_allocation AS (
  SELECT id FROM cab_allocations LIMIT 1
),
allocation_cab AS (
  SELECT cab_id 
  FROM cab_allocations 
  WHERE id = (SELECT id FROM test_allocation)
),
passkey_cab AS (
  SELECT id 
  FROM cabs 
  WHERE passkey = '4590'  -- Driver's entered passkey
    AND trip_id = (
      SELECT trip_id 
      FROM cab_allocations 
      WHERE id = (SELECT id FROM test_allocation)
    )
)
SELECT 
  CASE 
    WHEN (SELECT cab_id FROM allocation_cab) = (SELECT id FROM passkey_cab)
    THEN 'VALID - Student can board'
    ELSE 'INVALID - Wrong cab'
  END as validation_result;

-- Expected: Should return validation result

-- ====================================
-- TEST 17: Test CASCADE Delete
-- ====================================
-- Delete a cab - should cascade delete allocations
-- WITH test_cab AS (
--   SELECT id FROM cabs LIMIT 1
-- )
-- DELETE FROM cabs WHERE id = (SELECT id FROM test_cab);

-- Verify cascade worked
-- SELECT COUNT(*) as remaining_allocations FROM cab_allocations;

-- ====================================
-- TEST 18: Cab Utilization Report
-- ====================================
WITH first_trip AS (
  SELECT id FROM trips LIMIT 1
)
SELECT 
  c.cab_number,
  c.pickup_region,
  c.cab_capacity,
  COUNT(ca.id) as students_allocated,
  c.cab_capacity - COUNT(ca.id) as empty_seats,
  ROUND((COUNT(ca.id)::NUMERIC / c.cab_capacity) * 100, 2) as utilization_percent
FROM cabs c
LEFT JOIN cab_allocations ca ON c.id = ca.cab_id
WHERE c.trip_id = (SELECT id FROM first_trip)
GROUP BY c.id, c.cab_number, c.pickup_region, c.cab_capacity
ORDER BY utilization_percent DESC;

-- Expected: Shows cab utilization statistics

-- ====================================
-- CLEANUP (Optional - uncomment to clean test data)
-- ====================================
-- DELETE FROM cab_allocations WHERE trip_id IN (SELECT id FROM trips);
-- DELETE FROM cabs WHERE cab_number LIKE 'WB-06-%';

-- ====================================
-- SUMMARY QUERY: Table Statistics
-- ====================================
SELECT 
  'cabs' as table_name,
  COUNT(*) as row_count
FROM cabs
UNION ALL
SELECT 
  'cab_allocations' as table_name,
  COUNT(*) as row_count
FROM cab_allocations;

-- Expected: Shows row counts for each table

-- ====================================
-- SUMMARY: All Tables Created So Far
-- ====================================
SELECT 
  table_name,
  (SELECT COUNT(*) 
   FROM information_schema.columns 
   WHERE table_name = t.table_name 
     AND table_schema = 'public') as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
  AND table_name NOT LIKE 'pg_%'
ORDER BY table_name;

-- Expected: Should show users, trips, payments, trip_users, cabs, cab_allocations, migrations

