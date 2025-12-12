# Database Schema Documentation

## Friday Cab Allocation System

**Version:** 1.0  
**Last Updated:** December 10, 2025  
**Database Type:** PostgreSQL / MySQL

---

## Table of Contents

1. [Overview](#overview)
2. [Entity Relationship Diagram](#entity-relationship-diagram)
3. [Table Definitions](#table-definitions)
4. [Indexes and Constraints](#indexes-and-constraints)
5. [Data Flow](#data-flow)

---

## Overview

This document defines the complete database schema for the Friday Cab Allocation System. The system manages student transportation bookings, cab assignments, payment processing, and journey validation through a multi-table relational database.

### Design Principles

- **Normalization:** Schema follows 3NF to minimize redundancy
- **Referential Integrity:** All foreign keys enforce cascading rules
- **Audit Trail:** All tables include `created_at` and `updated_at` timestamps
- **Scalability:** Designed to handle hundreds of concurrent users per trip

---

## Table Definitions

### 1. `users`

**Purpose:** Stores student information obtained through Google OAuth authentication.

**Usage:** 
- Created when a student first logs in via Google
- Used for authentication and identification throughout the system
- Referenced in bookings, payments, and journey logs

| Column Name      | Data Type      | Constraints                    | Description                           |
|------------------|----------------|--------------------------------|---------------------------------------|
| `id`             | BIGINT         | PRIMARY KEY, AUTO_INCREMENT    | Unique user identifier                |
| `name`           | VARCHAR(255)   | NOT NULL                       | Full name from Google profile         |
| `email`          | VARCHAR(255)   | UNIQUE, NOT NULL               | Google email (unique identifier)      |
| `profile_picture`| TEXT           | NULL                           | Google profile picture URL            |
| `created_at`     | TIMESTAMP      | DEFAULT CURRENT_TIMESTAMP      | Account creation timestamp            |
| `updated_at`     | TIMESTAMP      | ON UPDATE CURRENT_TIMESTAMP    | Last profile update timestamp         |

**Indexes:**
- PRIMARY KEY on `id`
- UNIQUE INDEX on `email`

**Sample Data:**
```sql
INSERT INTO users (name, email, profile_picture) 
VALUES ('Shahnawaz Hussain', 'shahnawaz@example.com', 'https://lh3.googleusercontent.com/...');
```

---

### 2. `admins`

**Purpose:** Stores administrator credentials for system management.

**Usage:**
- Admins log in using email/password (not OAuth)
- Used to access admin dashboard for trip management, cab allocation, and system oversight
- Separate from student users for security isolation

| Column Name      | Data Type      | Constraints                    | Description                           |
|------------------|----------------|--------------------------------|---------------------------------------|
| `id`             | BIGINT         | PRIMARY KEY, AUTO_INCREMENT    | Unique admin identifier               |
| `name`           | VARCHAR(255)   | NOT NULL                       | Admin full name                       |
| `email`          | VARCHAR(255)   | UNIQUE, NOT NULL               | Admin login email                     |
| `password_hash`  | VARCHAR(255)   | NOT NULL                       | Bcrypt hashed password                |
| `created_at`     | TIMESTAMP      | DEFAULT CURRENT_TIMESTAMP      | Admin account creation                |
| `updated_at`     | TIMESTAMP      | ON UPDATE CURRENT_TIMESTAMP    | Last update timestamp                 |

**Indexes:**
- PRIMARY KEY on `id`
- UNIQUE INDEX on `email`

**Security Notes:**
- Passwords must be hashed using bcrypt (cost factor 12+)
- Implement rate limiting on login attempts
- Consider adding `role` field for future RBAC

---

### 3. `trips`

**Purpose:** Represents a single Friday prayer transportation event.

**Usage:**
- Created by admin when opening bookings for a new Friday
- Defines booking window and trip schedule
- Acts as parent entity for all bookings, payments, and allocations
- One trip per Friday (typically created weekly)

| Column Name          | Data Type      | Constraints                    | Description                           |
|----------------------|----------------|--------------------------------|---------------------------------------|
| `id`                 | BIGINT         | PRIMARY KEY, AUTO_INCREMENT    | Unique trip identifier                |
| `trip_title`         | VARCHAR(255)   | NOT NULL                       | Title/name of the trip                |
| `trip_date`          | DATE           | NOT NULL, UNIQUE               | Date of Friday prayer trip            |
| `booking_start_time` | TIMESTAMP      | NOT NULL                       | When booking window opens             |
| `booking_end_time`   | TIMESTAMP      | NOT NULL                       | When booking window closes            |
| `return_time`        | TIMESTAMP      | NOT NULL                       | Expected prayer time in the mosque     |
| `end_time`           | TIMESTAMP      | NOT NULL                       | Expected trip end time                |
| `amount_per_person`  | DECIMAL(10,2)  | NOT NULL                       | Cost per person for the trip          |
| `created_at`         | TIMESTAMP      | DEFAULT CURRENT_TIMESTAMP      | Trip record creation                  |
| `updated_at`         | TIMESTAMP      | ON UPDATE CURRENT_TIMESTAMP    | Last update timestamp                 |

**Constraints:**
- `booking_end_time` must be after `booking_start_time`
- `end_time` must be after `return_time`
- `amount_per_person` must be > 0

**Indexes:**
- PRIMARY KEY on `id`
- UNIQUE INDEX on `trip_date`
- INDEX on `booking_start_time`, `booking_end_time` for active trip queries

**Sample Data:**
```sql
INSERT INTO trips (trip_title, trip_date, booking_start_time, booking_end_time, return_time, end_time, amount_per_person)
VALUES ('Friday Prayer - Dec 12', '2025-12-12', '2025-12-08 00:00:00', '2025-12-11 23:59:59', '2025-12-12 15:00:00', '2025-12-12 16:30:00', 50.00);
```

---

### 4. `payments`

**Purpose:** Records all payment transactions for trip bookings.

**Usage:**
- Entry created when student initiates payment
- Status updated based on payment gateway callback
- Used to verify payment before confirming booking
- Links student, trip, and transaction details

| Column Name      | Data Type      | Constraints                    | Description                           |
|------------------|----------------|--------------------------------|---------------------------------------|
| `id`             | BIGINT         | PRIMARY KEY, AUTO_INCREMENT    | Unique payment identifier             |
| `user_id`        | BIGINT         | FOREIGN KEY → users(id)        | Student who made payment              |
| `trip_id`        | BIGINT         | FOREIGN KEY → trips(id)        | Trip being paid for                   |
| `payment_status` | ENUM           | NOT NULL                       | 'pending', 'confirmed', 'failed'      |
| `payment_amount` | DECIMAL(10,2)  | NOT NULL                       | Amount paid (e.g., 50.00)             |
| `payment_date`   | TIMESTAMP      | DEFAULT CURRENT_TIMESTAMP      | When payment was initiated            |
| `payment_method` | VARCHAR(50)    | NULL                           | 'upi', 'card', 'netbanking', etc.     |
| `created_at`     | TIMESTAMP      | DEFAULT CURRENT_TIMESTAMP      | Record creation                       |
| `updated_at`     | TIMESTAMP      | ON UPDATE CURRENT_TIMESTAMP    | Last status update                    |

**Constraints:**
- `payment_amount` must be > 0
- Foreign key `user_id` references `users(id)` ON DELETE CASCADE
- Foreign key `trip_id` references `trips(id)` ON DELETE CASCADE

**Indexes:**
- PRIMARY KEY on `id`
- INDEX on `user_id`
- INDEX on `trip_id`
- INDEX on `payment_status` for filtering

**State Transitions:**
```
pending → confirmed  (Payment gateway success)
pending → failed     (Payment gateway failure/timeout)
```

**Sample Data:**
```sql
INSERT INTO payments (user_id, trip_id, payment_status, payment_amount, payment_method)
VALUES (1, 1, 'confirmed', 50.00, 'upi');
```

---

### 5. `trip_users`

**Purpose:** Represents confirmed bookings linking students to specific trips.

**Usage:**
- Entry created ONLY after successful payment confirmation
- Stores which hall the student is booking from
- Used by admin to view demand per hall
- Foundation for cab allocation algorithm

| Column Name      | Data Type      | Constraints                    | Description                           |
|------------------|----------------|--------------------------------|---------------------------------------|
| `id`             | BIGINT         | PRIMARY KEY, AUTO_INCREMENT    | Unique booking identifier             |
| `trip_id`        | BIGINT         | FOREIGN KEY → trips(id)        | Which trip is booked                  |
| `user_id`        | BIGINT         | FOREIGN KEY → users(id)        | Student who booked                    |
| `hall`           | VARCHAR(50)    | NOT NULL                       | Pickup hall (LBS, MMM, etc.)          |
| `payment_id`     | BIGINT         | FOREIGN KEY → payments(id)     | Reference to payment record           |
| `created_at`     | TIMESTAMP      | DEFAULT CURRENT_TIMESTAMP      | Booking confirmation time             |
| `updated_at`     | TIMESTAMP      | ON UPDATE CURRENT_TIMESTAMP    | Last update timestamp                 |

**Constraints:**
- UNIQUE constraint on (`trip_id`, `user_id`) - one booking per student per trip
- Foreign key `trip_id` references `trips(id)` ON DELETE CASCADE
- Foreign key `user_id` references `users(id)` ON DELETE CASCADE
- Foreign key `payment_id` references `payments(id)` ON DELETE SET NULL
- `hall` must match predefined hall list

**Indexes:**
- PRIMARY KEY on `id`
- UNIQUE INDEX on (`trip_id`, `user_id`)
- INDEX on `trip_id`, `hall` for demand aggregation queries

**Valid Hall Values:**
```
LBS, MMM, RK, RP, GKH, VS, MS, HJB, JCB, LLR, PAN
```

**Sample Query (Admin Demand Dashboard):**
```sql
SELECT hall, COUNT(*) as student_count
FROM trip_users
WHERE trip_id = 1
GROUP BY hall;
```

---

### 6. `cabs`

**Purpose:** Stores cab/vehicle information hired for a specific trip.

**Usage:**
- Admin creates cab entries after running optimization model
- Each cab is assigned to a pickup region
- Generates unique 4-digit passkey for driver validation
- Used in cab allocation and journey validation

| Column Name      | Data Type      | Constraints                    | Description                           |
|------------------|----------------|--------------------------------|---------------------------------------|
| `id`             | BIGINT         | PRIMARY KEY, AUTO_INCREMENT    | Unique cab identifier                 |
| `trip_id`        | BIGINT         | FOREIGN KEY → trips(id)        | Which trip this cab serves            |
| `cab_number`     | VARCHAR(20)    | NOT NULL                       | Vehicle registration plate            |
| `cab_type`       | VARCHAR(50)    | NULL                           | 'sedan', 'suv', 'tempo', etc.         |
| `cab_capacity`   | INT            | NOT NULL, DEFAULT 7            | Maximum passenger capacity            |
| `cab_owner_name` | VARCHAR(255)   | NULL                           | Owner/vendor name                     |
| `cab_owner_phone`| VARCHAR(15)    | NULL                           | Owner contact number                  |
| `pickup_region`  | VARCHAR(50)    | NOT NULL                       | Assigned pickup region/hall           |
| `passkey`        | CHAR(4)        | NOT NULL                       | 4-digit driver validation code        |
| `created_at`     | TIMESTAMP      | DEFAULT CURRENT_TIMESTAMP      | Cab entry creation                    |
| `updated_at`     | TIMESTAMP      | ON UPDATE CURRENT_TIMESTAMP    | Last update timestamp                 |

**Constraints:**
- UNIQUE constraint on (`trip_id`, `cab_number`) - no duplicate cabs per trip
- Foreign key `trip_id` references `trips(id)` ON DELETE CASCADE
- `passkey` must be exactly 4 digits (validated at application level)
- `cab_capacity` must be > 0

**Indexes:**
- PRIMARY KEY on `id`
- UNIQUE INDEX on (`trip_id`, `cab_number`)
- INDEX on `trip_id`, `pickup_region` for region-wise queries
- INDEX on `passkey` for validation lookups

**Valid Pickup Regions:**
```
RK, RP, GKH, VS, MS, HJB, JCB, LLR, PAN loop
(Maps to Region 1-7 in optimization model)
```

**Passkey Generation:**
```python
import random
passkey = str(random.randint(1000, 9999))  # Ensure uniqueness per trip
```

**Sample Data:**
```sql
INSERT INTO cabs (trip_id, cab_number, cab_capacity, pickup_region, passkey)
VALUES (1, 'WB-06-1234', 7, 'LBS', '4590');
```

---

### 7. `cab_allocations`

**Purpose:** Maps students to specific cabs after optimization algorithm runs.

**Usage:**
- Created by system after admin triggers cab allocation
- Defines which cab each student should board
- Used to generate QR codes for students
- Referenced during outbound journey validation

| Column Name      | Data Type      | Constraints                    | Description                           |
|------------------|----------------|--------------------------------|---------------------------------------|
| `id`             | BIGINT         | PRIMARY KEY, AUTO_INCREMENT    | Unique allocation identifier          |
| `trip_id`        | BIGINT         | FOREIGN KEY → trips(id)        | Trip context                          |
| `user_id`        | BIGINT         | FOREIGN KEY → users(id)        | Student allocated                     |
| `cab_id`         | BIGINT         | FOREIGN KEY → cabs(id)         | Assigned cab                          |
| `created_at`     | TIMESTAMP      | DEFAULT CURRENT_TIMESTAMP      | Allocation timestamp                  |
| `updated_at`     | TIMESTAMP      | ON UPDATE CURRENT_TIMESTAMP    | Last update timestamp                 |

**Constraints:**
- UNIQUE constraint on (`trip_id`, `user_id`) - one cab per student per trip
- Foreign key `trip_id` references `trips(id)` ON DELETE CASCADE
- Foreign key `user_id` references `users(id)` ON DELETE CASCADE
- Foreign key `cab_id` references `cabs(id)` ON DELETE CASCADE

**Indexes:**
- PRIMARY KEY on `id`
- UNIQUE INDEX on (`trip_id`, `user_id`)
- INDEX on `cab_id` for cab-wise student lists

**QR Code Generation:**
```python
# QR code encodes: /validate?token=<encrypted_allocation_id>
qr_data = f"https://example.com/validate?token={encrypt(allocation.id)}"
```

**Sample Query (Get Cab Roster):**
```sql
SELECT u.name, u.email, ca.id as allocation_id
FROM cab_allocations ca
JOIN users u ON ca.user_id = u.id
WHERE ca.cab_id = 5;
```

---

### 8. `journeys`

**Purpose:** Audit log of all QR code scans and boarding validations.

**Usage:**
- Entry created every time a driver scans a student's QR code
- Records both outbound (campus → mosque) and return trips
- Provides real-time tracking of who boarded which cab
- Used for attendance, analytics, and dispute resolution

| Column Name         | Data Type      | Constraints                    | Description                           |
|---------------------|----------------|--------------------------------|---------------------------------------|
| `id`                | BIGINT         | PRIMARY KEY, AUTO_INCREMENT    | Unique journey log identifier         |
| `trip_id`           | BIGINT         | FOREIGN KEY → trips(id)        | Trip context                          |
| `user_id`           | BIGINT         | FOREIGN KEY → users(id)        | Student who boarded                   |
| `cab_id`            | BIGINT         | FOREIGN KEY → cabs(id)         | Cab that was boarded                  |
| `journey_type`      | ENUM           | NOT NULL                       | 'pickup', 'dropoff'                   |
| `journey_date_time` | TIMESTAMP      | DEFAULT CURRENT_TIMESTAMP      | When QR was scanned                   |
| `created_at`        | TIMESTAMP      | DEFAULT CURRENT_TIMESTAMP      | Log entry creation                    |
| `updated_at`        | TIMESTAMP      | ON UPDATE CURRENT_TIMESTAMP    | Last update timestamp                 |

**Constraints:**
- Foreign key `trip_id` references `trips(id)` ON DELETE CASCADE
- Foreign key `user_id` references `users(id)` ON DELETE CASCADE
- Foreign key `cab_id` references `cabs(id)` ON DELETE CASCADE
- Can have multiple entries per user (duplicate scans allowed for logging)

**Indexes:**
- PRIMARY KEY on `id`
- INDEX on (`trip_id`, `user_id`) for student journey history
- INDEX on `cab_id`, `journey_type` for cab-wise reports
- INDEX on `journey_date_time` for time-based analytics

**Journey Types:**
- `pickup`: Outbound journey (campus → mosque)
- `dropoff`: Return journey (mosque → campus)

**Sample Query (Who Boarded):**
```sql
SELECT u.name, j.journey_type, j.journey_date_time, c.cab_number
FROM journeys j
JOIN users u ON j.user_id = u.id
JOIN cabs c ON j.cab_id = c.id
WHERE j.trip_id = 1
ORDER BY j.journey_date_time;
```

**Sample Data:**
```sql
INSERT INTO journeys (trip_id, user_id, cab_id, journey_type, journey_date_time)
VALUES (1, 1, 5, 'pickup', '2025-12-12 12:30:00');
```

---

## Indexes and Constraints

### Primary Keys
All tables use `BIGINT AUTO_INCREMENT` primary keys for scalability.

### Foreign Keys
All foreign key relationships enforce `ON DELETE CASCADE` to maintain referential integrity when parent records are deleted.

### Unique Constraints
| Table           | Columns                    | Purpose                              |
|-----------------|----------------------------|--------------------------------------|
| users           | email                      | Prevent duplicate Google accounts    |
| admins          | email                      | Prevent duplicate admin accounts     |
| trips           | trip_date                  | One trip per Friday                  |
| trip_users      | (trip_id, user_id)         | One booking per student per trip     |
| cabs            | (trip_id, cab_number)      | No duplicate cabs in same trip       |
| cab_allocations | (trip_id, user_id)         | One cab assignment per student       |

### Performance Indexes
```sql
-- Fast lookup for active trips
CREATE INDEX idx_trips_booking_window ON trips(booking_start_time, booking_end_time);

-- Demand dashboard query optimization
CREATE INDEX idx_trip_users_hall ON trip_users(trip_id, hall);

-- Payment verification
CREATE INDEX idx_payments_status ON payments(payment_status, trip_id);

-- Cab region filtering
CREATE INDEX idx_cabs_region ON cabs(trip_id, pickup_region);

-- Journey analytics
CREATE INDEX idx_journeys_time ON journeys(trip_id, journey_date_time);
```

---

## Data Flow

### 1. Student Booking Flow

```
1. Student logs in → users table entry created (if new)
2. Student selects trip and hall → payment table entry (status: pending)
3. Payment gateway callback → payment status updated to 'confirmed'
4. Trigger creates trip_users entry → Booking confirmed
```

### 2. Admin Allocation Flow

```
1. Admin queries trip_users grouped by hall → Gets demand per hall
2. Admin runs optimization model → Determines cab requirements
3. Admin creates cab entries → cabs table populated with passkeys
4. Admin triggers allocation → cab_allocations table populated
5. System generates QR codes → Based on cab_allocations.id
```

### 3. Validation Flow (Outbound)

```
1. Driver scans QR code → Decodes allocation_id
2. Query cab_allocations → Get student's assigned cab_id
3. Driver enters passkey → Query cabs → Get cab_id for passkey
4. Compare cab_ids → Match = Success, Mismatch = Error
5. Log result → journeys table entry (journey_type: pickup)
```

### 4. Validation Flow (Return)

```
1. Driver scans QR code → Decodes allocation_id
2. Verify payment status → Query via allocation → trip_users → payments
3. Verify passkey validity → Query cabs for trip_id
4. Any valid passkey = Success (no cab matching needed)
5. Log result → journeys table entry (journey_type: dropoff)
```

---

## Migration Strategy

### Initial Setup
```sql
-- Create tables in order (respecting foreign key dependencies)
CREATE TABLE users (...);
CREATE TABLE admins (...);
CREATE TABLE trips (...);
CREATE TABLE payments (...);
CREATE TABLE trip_users (...);
CREATE TABLE cabs (...);
CREATE TABLE cab_allocations (...);
CREATE TABLE journeys (...);
```

### Sample Seed Data
```sql
-- Create admin account
INSERT INTO admins (name, email, password_hash) 
VALUES ('Admin User', 'admin@example.com', '$2b$12$...');

-- Create first trip
INSERT INTO trips (trip_title, trip_date, booking_start_time, booking_end_time, return_time, end_time, amount_per_person)
VALUES ('Friday Prayer - Dec 19', '2025-12-19', '2025-12-15 00:00:00', '2025-12-18 23:59:59', '2025-12-19 15:00:00', '2025-12-19 16:30:00', 50.00);
```

---

## Backup and Maintenance

### Recommended Backup Schedule
- **Full backup:** Daily at 2 AM
- **Incremental backup:** Every 6 hours
- **Retention:** 30 days

### Archive Strategy
- Archive completed trips older than 1 year to separate tables
- Keep journeys data for analytics (indefinite retention)

### Performance Monitoring
- Monitor query performance on `trip_users` GROUP BY queries (demand dashboard)
- Monitor index usage on foreign key lookups
- Set up alerts for slow queries (> 1 second)

---

## Future Enhancements

1. **Add `transaction_id` to payments** for payment gateway reconciliation
2. **Add `booking_status` to trip_users** for cancelled bookings support
3. **Add `qr_token` to cab_allocations** for stateless QR validation
4. **Add `validation_status` to journeys** for failed scan logging
5. **Add `role` to admins** for role-based access control

---

**Document End**



