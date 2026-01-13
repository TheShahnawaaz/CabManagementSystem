-- Migration: Create notifications table for in-app notifications
-- Powers the 🔔 bell icon in the app

CREATE TABLE IF NOT EXISTS notifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Content
  title           VARCHAR(255) NOT NULL,
  body            TEXT NOT NULL,
  icon            VARCHAR(50) DEFAULT 'bell',
  action_url      VARCHAR(255),
  
  -- Metadata
  category        VARCHAR(50) NOT NULL,
  priority        VARCHAR(20) DEFAULT 'normal',
  reference_type  VARCHAR(50),
  reference_id    UUID,
  
  -- Status
  read_at         TIMESTAMP,
  archived_at     TIMESTAMP,
  
  -- Timestamps
  created_at      TIMESTAMP DEFAULT NOW()
);

-- Index for fetching user's unread notifications (most common query)
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread 
  ON notifications(user_id, created_at DESC) 
  WHERE read_at IS NULL AND archived_at IS NULL;

-- Index for fetching all user notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_all 
  ON notifications(user_id, created_at DESC) 
  WHERE archived_at IS NULL;

-- Index for reference lookups (find notifications about specific booking/trip)
CREATE INDEX IF NOT EXISTS idx_notifications_reference 
  ON notifications(reference_type, reference_id) 
  WHERE reference_type IS NOT NULL;

-- Comments
COMMENT ON TABLE notifications IS 'In-app notifications shown in the bell icon dropdown';
COMMENT ON COLUMN notifications.icon IS 'Lucide icon name (e.g., check-circle, car, clock)';
COMMENT ON COLUMN notifications.action_url IS 'URL to navigate when notification is clicked';
COMMENT ON COLUMN notifications.category IS 'Type: booking, payment, trip, cab, admin';
COMMENT ON COLUMN notifications.priority IS 'Importance: low, normal, high, critical';
COMMENT ON COLUMN notifications.read_at IS 'NULL means unread, timestamp means read';
COMMENT ON COLUMN notifications.archived_at IS 'Soft delete - NULL means visible';



