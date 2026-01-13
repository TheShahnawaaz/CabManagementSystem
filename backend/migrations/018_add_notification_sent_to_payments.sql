-- Add notification_sent flag to payments table to prevent duplicate notifications
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS notification_sent BOOLEAN DEFAULT FALSE;

-- Add index for quick lookup
CREATE INDEX IF NOT EXISTS idx_payments_notification_sent ON payments(notification_sent) WHERE notification_sent = FALSE;

COMMENT ON COLUMN payments.notification_sent IS 'Flag to track if booking confirmation notification has been sent for this payment.';

