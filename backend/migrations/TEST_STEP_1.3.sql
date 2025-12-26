-- Friday Cab Project - Test Script for Phase 1, Step 1.3
-- Description: Test journeys table and audit logging views
-- Date: 2025-12-26

-- ====================================
-- TEST 1: Verify Table Exists
-- ====================================
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'journeys';

-- Expected: Should return 'journeys'

-- ====================================
-- TEST 2: Verify Enum Type Created
-- ====================================
SELECT 
  t.typname as enum_name,
  e.enumlabel as enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname = 'journey_type_enum'
ORDER BY e.enumsortorder;

-- Expected: Should show 'pickup' and 'dropoff'

-- ====================================
-- TEST 3: Verify Foreign Keys
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
  AND tc.table_name = 'journeys'
ORDER BY tc.constraint_name;

-- Expected: Should show 3 foreign keys (trip_id, user_id, cab_id)

-- ====================================
-- TEST 4: Verify Indexes
-- ====================================
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'journeys'
ORDER BY indexname;

-- Expected: Should show all 7 indexes

-- ====================================
-- TEST 5: Verify Views Created
-- ====================================
SELECT table_name 
FROM information_schema.views 
WHERE table_schema = 'public' 
  AND table_name IN ('journey_analytics', 'no_shows', 'journey_details')
ORDER BY table_name;

-- Expected: Should return 3 views

-- ====================================
-- TEST 6: Insert Pickup Journey
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
INSERT INTO journeys (
  trip_id,
  user_id,
  cab_id,
  journey_type,
  journey_date_time
)
SELECT 
  first_trip.id,
  first_user.id,
  first_cab.id,
  'pickup',
  NOW()
FROM first_trip, first_user, first_cab
RETURNING id, journey_type, journey_date_time;

-- Expected: Should return the created journey

-- ====================================
-- TEST 7: Insert Dropoff Journey (Same Student)
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
INSERT INTO journeys (
  trip_id,
  user_id,
  cab_id,
  journey_type,
  journey_date_time
)
SELECT 
  first_trip.id,
  first_user.id,
  first_cab.id,
  'dropoff',
  NOW() + interval '4 hours'  -- Return journey 4 hours later
FROM first_trip, first_user, first_cab
RETURNING id, journey_type, journey_date_time;

-- Expected: Should create second journey for same student

-- ====================================
-- TEST 8: Test Duplicate Scans Allowed
-- ====================================
-- Journeys table allows duplicates (multiple scans for same student)
WITH first_trip AS (
  SELECT id FROM trips LIMIT 1
),
first_user AS (
  SELECT id FROM users LIMIT 1
),
first_cab AS (
  SELECT id FROM cabs LIMIT 1
)
INSERT INTO journeys (trip_id, user_id, cab_id, journey_type)
SELECT first_trip.id, first_user.id, first_cab.id, 'pickup'
FROM first_trip, first_user, first_cab
RETURNING id;

-- Expected: Should succeed (duplicate scans allowed for audit)

-- ====================================
-- TEST 9: Query Journey Analytics View
-- ====================================
SELECT * FROM journey_analytics
ORDER BY trip_date DESC, journey_type;

-- Expected: Shows summary stats per trip and journey type

-- ====================================
-- TEST 10: Query Journey Details View
-- ====================================
SELECT 
  journey_type,
  student_name,
  cab_number,
  journey_date_time
FROM journey_details
ORDER BY journey_date_time DESC
LIMIT 10;

-- Expected: Shows detailed journey records

-- ====================================
-- TEST 11: Query No-Shows View
-- ====================================
SELECT 
  trip_title,
  student_name,
  student_email,
  hall,
  cab_number
FROM no_shows
ORDER BY trip_date DESC, hall;

-- Expected: Shows students who didn't board (no pickup scan)

-- ====================================
-- TEST 12: Count Pickups vs Dropoffs
-- ====================================
WITH first_trip AS (
  SELECT id FROM trips LIMIT 1
)
SELECT 
  journey_type,
  COUNT(*) as journey_count,
  COUNT(DISTINCT user_id) as unique_students
FROM journeys
WHERE trip_id = (SELECT id FROM first_trip)
GROUP BY journey_type
ORDER BY journey_type;

-- Expected: Shows pickup and dropoff counts

-- ====================================
-- TEST 13: Students Who Boarded vs Total Bookings
-- ====================================
WITH first_trip AS (
  SELECT id FROM trips LIMIT 1
)
SELECT 
  'Total Bookings' as metric,
  COUNT(*) as count
FROM trip_users
WHERE trip_id = (SELECT id FROM first_trip)
UNION ALL
SELECT 
  'Boarded (Pickup)',
  COUNT(DISTINCT user_id)
FROM journeys
WHERE trip_id = (SELECT id FROM first_trip)
  AND journey_type = 'pickup'
UNION ALL
SELECT 
  'Returned (Dropoff)',
  COUNT(DISTINCT user_id)
FROM journeys
WHERE trip_id = (SELECT id FROM first_trip)
  AND journey_type = 'dropoff';

-- Expected: Shows booking vs actual boarding stats

-- ====================================
-- TEST 14: Journey Timeline
-- ====================================
WITH first_trip AS (
  SELECT id FROM trips LIMIT 1
)
SELECT 
  journey_date_time,
  journey_type,
  COUNT(*) as scans_at_this_time
FROM journeys
WHERE trip_id = (SELECT id FROM first_trip)
GROUP BY journey_date_time, journey_type
ORDER BY journey_date_time;

-- Expected: Shows timeline of boarding events

-- ====================================
-- TEST 15: Cab-Wise Journey Count
-- ====================================
WITH first_trip AS (
  SELECT id FROM trips LIMIT 1
)
SELECT 
  c.cab_number,
  c.pickup_region,
  COUNT(CASE WHEN j.journey_type = 'pickup' THEN 1 END) as pickups,
  COUNT(CASE WHEN j.journey_type = 'dropoff' THEN 1 END) as dropoffs,
  COUNT(DISTINCT j.user_id) as unique_students
FROM cabs c
LEFT JOIN journeys j ON c.id = j.cab_id
WHERE c.trip_id = (SELECT id FROM first_trip)
GROUP BY c.id, c.cab_number, c.pickup_region
ORDER BY c.cab_number;

-- Expected: Shows journey counts per cab

-- ====================================
-- TEST 16: Validate Journey Sequence
-- ====================================
-- Check if any student has dropoff before pickup (anomaly)
WITH first_trip AS (
  SELECT id FROM trips LIMIT 1
),
pickup_times AS (
  SELECT 
    user_id,
    MIN(journey_date_time) as first_pickup
  FROM journeys
  WHERE trip_id = (SELECT id FROM first_trip)
    AND journey_type = 'pickup'
  GROUP BY user_id
),
dropoff_times AS (
  SELECT 
    user_id,
    MIN(journey_date_time) as first_dropoff
  FROM journeys
  WHERE trip_id = (SELECT id FROM first_trip)
    AND journey_type = 'dropoff'
  GROUP BY user_id
)
SELECT 
  u.name,
  pt.first_pickup,
  dt.first_dropoff,
  CASE 
    WHEN dt.first_dropoff < pt.first_pickup THEN 'ANOMALY: Dropoff before pickup'
    ELSE 'OK'
  END as sequence_check
FROM users u
JOIN pickup_times pt ON u.id = pt.user_id
LEFT JOIN dropoff_times dt ON u.id = dt.user_id
WHERE dt.first_dropoff < pt.first_pickup;

-- Expected: Should return 0 rows (no anomalies)

-- ====================================
-- TEST 17: Average Journey Duration
-- ====================================
WITH first_trip AS (
  SELECT id FROM trips LIMIT 1
),
pickup_times AS (
  SELECT 
    user_id,
    MIN(journey_date_time) as pickup_time
  FROM journeys
  WHERE trip_id = (SELECT id FROM first_trip)
    AND journey_type = 'pickup'
  GROUP BY user_id
),
dropoff_times AS (
  SELECT 
    user_id,
    MIN(journey_date_time) as dropoff_time
  FROM journeys
  WHERE trip_id = (SELECT id FROM first_trip)
    AND journey_type = 'dropoff'
  GROUP BY user_id
)
SELECT 
  COUNT(*) as students_with_both_journeys,
  AVG(dt.dropoff_time - pt.pickup_time) as avg_journey_duration,
  MIN(dt.dropoff_time - pt.pickup_time) as min_duration,
  MAX(dt.dropoff_time - pt.pickup_time) as max_duration
FROM pickup_times pt
JOIN dropoff_times dt ON pt.user_id = dt.user_id;

-- Expected: Shows average time between pickup and dropoff

-- ====================================
-- TEST 18: No-Show Rate
-- ====================================
WITH first_trip AS (
  SELECT id FROM trips LIMIT 1
),
bookings AS (
  SELECT COUNT(*) as total_bookings
  FROM trip_users
  WHERE trip_id = (SELECT id FROM first_trip)
),
pickups AS (
  SELECT COUNT(DISTINCT user_id) as students_boarded
  FROM journeys
  WHERE trip_id = (SELECT id FROM first_trip)
    AND journey_type = 'pickup'
)
SELECT 
  b.total_bookings,
  p.students_boarded,
  b.total_bookings - p.students_boarded as no_shows,
  ROUND(
    ((b.total_bookings - p.students_boarded)::NUMERIC / b.total_bookings) * 100, 
    2
  ) as no_show_percentage
FROM bookings b, pickups p;

-- Expected: Shows no-show statistics

-- ====================================
-- TEST 19: Test CASCADE Delete
-- ====================================
-- Delete a journey manually (typically wouldn't do this)
-- WITH test_journey AS (
--   SELECT id FROM journeys LIMIT 1
-- )
-- DELETE FROM journeys WHERE id = (SELECT id FROM test_journey);

-- ====================================
-- CLEANUP (Optional - uncomment to clean test data)
-- ====================================
-- DELETE FROM journeys WHERE journey_type IN ('pickup', 'dropoff');

-- ====================================
-- SUMMARY: All Database Tables
-- ====================================
SELECT 
  table_name,
  (SELECT COUNT(*) 
   FROM information_schema.columns 
   WHERE table_name = t.table_name 
     AND table_schema = 'public') as column_count,
  (SELECT COUNT(*) 
   FROM pg_indexes 
   WHERE tablename = t.table_name) as index_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
  AND table_name NOT LIKE 'pg_%'
  AND table_name != 'migrations'
ORDER BY table_name;

-- Expected: Should show all 7 main tables

-- ====================================
-- SUMMARY: All Views
-- ====================================
SELECT 
  table_name as view_name
FROM information_schema.views 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Expected: Should show 4 views (cab_rosters, journey_analytics, no_shows, journey_details)

-- ====================================
-- FINAL CHECK: Row Counts
-- ====================================
SELECT 'users' as table_name, COUNT(*) as row_count FROM users
UNION ALL SELECT 'trips', COUNT(*) FROM trips
UNION ALL SELECT 'payments', COUNT(*) FROM payments
UNION ALL SELECT 'trip_users', COUNT(*) FROM trip_users
UNION ALL SELECT 'cabs', COUNT(*) FROM cabs
UNION ALL SELECT 'cab_allocations', COUNT(*) FROM cab_allocations
UNION ALL SELECT 'journeys', COUNT(*) FROM journeys
ORDER BY table_name;

-- Expected: Shows row counts for all tables

