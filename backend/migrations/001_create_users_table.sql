-- Friday Cab Project - Database Migration
-- Migration: 001_create_users_table
-- Description: Create users table with Google OAuth support
-- Date: 2025-12-17

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  profile_picture TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create index on is_admin for admin queries
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin) WHERE is_admin = TRUE;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for users table
CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Add comment to table
COMMENT ON TABLE users IS 'Stores user information from Google OAuth. Both students and admins use this table.';
COMMENT ON COLUMN users.is_admin IS 'Flag to identify admin users. Set manually after first login.';

-- Sample query to promote user to admin (run after first login)
-- UPDATE users SET is_admin = TRUE WHERE email = 'your-admin-email@example.com';



