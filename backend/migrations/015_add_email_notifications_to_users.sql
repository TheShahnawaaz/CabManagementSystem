-- Migration: Add email notification preference to users
-- One simple toggle for email notifications

ALTER TABLE users ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true;

-- Comment for clarity
COMMENT ON COLUMN users.email_notifications IS 'User preference for receiving email notifications';



