-- Friday Cab Project - Test Script for Phase 1, Step 1.1
-- Description: Test core tables (trips, payments, trip_users)
-- Date: 2025-12-26

-- ====================================
-- TEST 1: Verify Tables Exist
-- ====================================
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('trips', 'payments', 'trip_users')
ORDER BY table_name;

-- Expected: Should return 3 rows (trips, payments, trip_users)

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
  AND tc.table_name IN ('payments', 'trip_users')
ORDER BY tc.table_name, tc.constraint_name;

-- Expected: Should show foreign key relationships

-- ====================================
-- TEST 3: Verify Indexes
-- ====================================
SELECT
  schemaname,
  tablename,
  indexname
FROM pg_indexes
WHERE tablename IN ('trips', 'payments', 'trip_users')
ORDER BY tablename, indexname;

-- Expected: Should show all created indexes

-- ====================================
-- TEST 4: Insert Sample Trip
-- ====================================
INSERT INTO trips (
  trip_title, 
  trip_date, 
  booking_start_time, 
  booking_end_time, 
  return_time, 
  end_time, 
  amount_per_person
) VALUES (
  'Friday Prayer - Jan 3, 2026',
  '2026-01-03',
  '2026-01-01 00:00:00+00',
  '2026-01-02 23:59:59+00',
  '2026-01-03 09:00:00+00',
  '2026-01-03 11:00:00+00',
  50.00
) RETURNING id, trip_title, trip_date;

-- Expected: Should return the created trip with UUID

-- ====================================
-- TEST 5: Test UNIQUE Constraint (trip_date)
-- ====================================
-- This should FAIL with unique constraint violation
-- INSERT INTO trips (
--   trip_title, 
--   trip_date, 
--   booking_start_time, 
--   booking_end_time, 
--   return_time, 
--   end_time, 
--   amount_per_person
-- ) VALUES (
--   'Duplicate Trip',
--   '2026-01-03',  -- Same date as above
--   '2026-01-01 00:00:00+00',
--   '2026-01-02 23:59:59+00',
--   '2026-01-03 09:00:00+00',
--   '2026-01-03 11:00:00+00',
--   50.00
-- );

-- ====================================
-- TEST 6: Test CHECK Constraint (booking window)
-- ====================================
-- This should FAIL with check constraint violation
-- INSERT INTO trips (
--   trip_title, 
--   trip_date, 
--   booking_start_time, 
--   booking_end_time,  -- Before start time (invalid)
--   return_time, 
--   end_time, 
--   amount_per_person
-- ) VALUES (
--   'Invalid Trip',
--   '2026-01-10',
--   '2026-01-05 00:00:00+00',
--   '2026-01-04 23:59:59+00',  -- Before start time
--   '2026-01-10 09:00:00+00',
--   '2026-01-10 11:00:00+00',
--   50.00
-- );

-- ====================================
-- TEST 7: Insert Sample Payment (requires user and trip)
-- ====================================
-- First, get a user ID (or create a test user)
-- Assuming you have a user from 001_create_users_table.sql
-- Replace 'YOUR_USER_ID' with actual UUID from users table

-- Get first user
WITH first_user AS (
  SELECT id FROM users LIMIT 1
),
first_trip AS (
  SELECT id FROM trips LIMIT 1
)
INSERT INTO payments (
  user_id,
  trip_id,
  payment_status,
  payment_amount,
  payment_method
) 
SELECT 
  first_user.id,
  first_trip.id,
  'confirmed',
  50.00,
  'upi'
FROM first_user, first_trip
RETURNING id, payment_status, payment_amount;

-- Expected: Should return the created payment

-- ====================================
-- TEST 8: Insert Sample Booking (trip_users)
-- ====================================
WITH first_user AS (
  SELECT id FROM users LIMIT 1
),
first_trip AS (
  SELECT id FROM trips LIMIT 1
),
first_payment AS (
  SELECT id FROM payments LIMIT 1
)
INSERT INTO trip_users (
  trip_id,
  user_id,
  hall,
  payment_id
)
SELECT 
  first_trip.id,
  first_user.id,
  'LBS',
  first_payment.id
FROM first_user, first_trip, first_payment
RETURNING id, hall, created_at;

-- Expected: Should return the created booking

-- ====================================
-- TEST 9: Test UNIQUE Constraint (one booking per student per trip)
-- ====================================
-- This should FAIL with unique constraint violation
-- WITH first_user AS (
--   SELECT id FROM users LIMIT 1
-- ),
-- first_trip AS (
--   SELECT id FROM trips LIMIT 1
-- )
-- INSERT INTO trip_users (trip_id, user_id, hall)
-- SELECT first_trip.id, first_user.id, 'MMM'
-- FROM first_user, first_trip;

-- ====================================
-- TEST 10: Verify Foreign Key Cascade (ON DELETE CASCADE)
-- ====================================
-- Delete the sample trip - should cascade delete payments and trip_users
-- DELETE FROM trips WHERE trip_title = 'Friday Prayer - Jan 3, 2026';

-- Verify cascade worked
-- SELECT COUNT(*) as remaining_payments FROM payments;
-- SELECT COUNT(*) as remaining_bookings FROM trip_users;
-- Expected: Should be 0 if cascade worked

-- ====================================
-- TEST 11: Demand Analysis Query (for admin dashboard)
-- ====================================
WITH first_trip AS (
  SELECT id FROM trips LIMIT 1
)
SELECT 
  hall,
  COUNT(*) as student_count
FROM trip_users
WHERE trip_id = (SELECT id FROM first_trip)
GROUP BY hall
ORDER BY student_count DESC;

-- Expected: Should show hall-wise booking counts

-- ====================================
-- CLEANUP (Optional - uncomment to clean test data)
-- ====================================
-- DELETE FROM trip_users WHERE hall = 'LBS';
-- DELETE FROM payments WHERE payment_method = 'upi';
-- DELETE FROM trips WHERE trip_title LIKE 'Friday Prayer - Jan 3, 2026';

-- ====================================
-- SUMMARY QUERY: Table Statistics
-- ====================================
SELECT 
  'trips' as table_name,
  COUNT(*) as row_count
FROM trips
UNION ALL
SELECT 
  'payments' as table_name,
  COUNT(*) as row_count
FROM payments
UNION ALL
SELECT 
  'trip_users' as table_name,
  COUNT(*) as row_count
FROM trip_users;

-- Expected: Shows row counts for each table

