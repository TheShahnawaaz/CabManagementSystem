-- Add notification_sent flag to cab_allocations
-- Tracks if user has been notified about their cab assignment

ALTER TABLE cab_allocations ADD COLUMN notification_sent BOOLEAN DEFAULT FALSE;

-- Index for finding un-notified allocations
CREATE INDEX idx_cab_allocations_notification_sent 
ON cab_allocations(cab_id, notification_sent) 
WHERE notification_sent = FALSE;
