-- Migration: 011_add_phone_number_to_users
-- Description: Add phone_number column to users for storing 10-digit Indian mobile numbers (without country code)
-- Date: 2025-02-25

ALTER TABLE users
ADD COLUMN IF NOT EXISTS phone_number VARCHAR(10)
  CONSTRAINT users_phone_number_format CHECK (
    phone_number IS NULL OR phone_number ~ '^[0-9]{10}$'
  );

COMMENT ON COLUMN users.phone_number IS '10-digit Indian mobile number without +91 prefix';
