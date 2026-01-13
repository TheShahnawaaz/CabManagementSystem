-- Migration: Create email_queue table for email job processing
-- Emails are queued here and processed by cron job

CREATE TABLE IF NOT EXISTS email_queue (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Recipient (stored separately so email can be sent even if user deleted)
  to_email        VARCHAR(255) NOT NULL,
  to_name         VARCHAR(255),
  
  -- Content
  subject         VARCHAR(255) NOT NULL,
  body_html       TEXT NOT NULL,
  
  -- Template tracking (for debugging and analytics)
  template        VARCHAR(100),
  template_data   JSONB DEFAULT '{}',
  
  -- Metadata
  category        VARCHAR(50) NOT NULL,
  priority        INTEGER DEFAULT 5,
  reference_type  VARCHAR(50),
  reference_id    UUID,
  
  -- Queue status
  status          VARCHAR(20) DEFAULT 'pending',
  attempts        INTEGER DEFAULT 0,
  max_attempts    INTEGER DEFAULT 3,
  last_error      TEXT,
  
  -- Scheduling
  scheduled_for   TIMESTAMP DEFAULT NOW(),
  sent_at         TIMESTAMP,
  
  -- Timestamps
  created_at      TIMESTAMP DEFAULT NOW()
);

-- Index for queue processing (get pending emails to send)
CREATE INDEX IF NOT EXISTS idx_email_queue_pending 
  ON email_queue(priority, scheduled_for) 
  WHERE status = 'pending' AND attempts < max_attempts;

-- Index for user's email history
CREATE INDEX IF NOT EXISTS idx_email_queue_user 
  ON email_queue(user_id, created_at DESC);

-- Index for status queries
CREATE INDEX IF NOT EXISTS idx_email_queue_status 
  ON email_queue(status, created_at DESC);

-- Comments
COMMENT ON TABLE email_queue IS 'Queue of emails to be sent by cron job';
COMMENT ON COLUMN email_queue.status IS 'pending, sending, sent, failed';
COMMENT ON COLUMN email_queue.priority IS '1=highest (critical), 5=normal, 10=lowest (marketing)';
COMMENT ON COLUMN email_queue.attempts IS 'Number of send attempts made';
COMMENT ON COLUMN email_queue.max_attempts IS 'Maximum retry attempts before marking as failed';
COMMENT ON COLUMN email_queue.scheduled_for IS 'When to send - allows delayed/scheduled emails';



