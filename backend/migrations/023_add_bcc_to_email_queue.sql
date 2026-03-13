-- Migration: Add BCC support to email_queue table
-- Allows queuing bulk emails that are sent via BCC to multiple recipients

-- Create enum for email type
CREATE TYPE email_send_type AS ENUM ('individual', 'bcc');

-- Add new columns
ALTER TABLE email_queue ADD COLUMN IF NOT EXISTS bcc_emails TEXT[];
ALTER TABLE email_queue ADD COLUMN IF NOT EXISTS email_type email_send_type DEFAULT 'individual';

COMMENT ON COLUMN email_queue.bcc_emails IS 'Array of BCC recipient emails for bulk sends (NULL for individual emails)';
COMMENT ON COLUMN email_queue.email_type IS 'individual (per-user) or bcc (bulk BCC send)';
