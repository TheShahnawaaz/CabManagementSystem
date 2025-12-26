-- Friday Cab Project - Database Migration
-- Migration: 003_create_payments_table
-- Description: Create payments table for tracking student payment transactions
-- Date: 2025-12-26

-- Create payment status enum type
DO $$ BEGIN
  CREATE TYPE payment_status_enum AS ENUM ('pending', 'confirmed', 'failed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  payment_status payment_status_enum NOT NULL DEFAULT 'pending',
  payment_amount DECIMAL(10,2) NOT NULL,
  payment_date TIMESTAMPTZ DEFAULT NOW(),
  payment_method VARCHAR(50),
  transaction_id VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT chk_payment_amount_positive CHECK (payment_amount > 0)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_trip ON payments(trip_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_payments_trip_status ON payments(trip_id, payment_status);

-- Create trigger for updated_at
CREATE TRIGGER payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Add comments
COMMENT ON TABLE payments IS 'Records all payment transactions for trip bookings.';
COMMENT ON COLUMN payments.payment_status IS 'Payment status: pending (initiated), confirmed (successful), failed (rejected/timeout).';
COMMENT ON COLUMN payments.payment_amount IS 'Amount paid by student in INR or local currency.';
COMMENT ON COLUMN payments.payment_method IS 'Payment method used: upi, card, netbanking, etc.';
COMMENT ON COLUMN payments.transaction_id IS 'Payment gateway transaction ID for reconciliation.';

