-- Friday Cab Project - Database Migration
-- Migration: 013_extend_payments_for_razorpay
-- Description: Extend payments table for Razorpay integration with gateway abstraction
-- Date: 2026-01-08

-- ====================================
-- ADD GATEWAY-SPECIFIC COLUMNS
-- ====================================

-- Gateway identifier (razorpay, phonepe, stripe, mock)
-- Allows switching payment providers in the future
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS gateway VARCHAR(50) DEFAULT 'razorpay';

-- Razorpay order_id (e.g., order_ABC123)
-- Created when initiating payment, before user pays
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS gateway_order_id VARCHAR(255);

-- Razorpay payment_id (e.g., pay_XYZ789)
-- Received after successful payment
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS gateway_payment_id VARCHAR(255);

-- Signature for verification and audit trail
-- Stored after successful verification
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS gateway_signature TEXT;

-- Timestamp when payment signature was verified
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;

-- Whether webhook confirmation was received (backup verification)
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS webhook_verified BOOLEAN DEFAULT FALSE;

-- Flexible metadata storage (notes, receipt info, etc.)
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Reason for failure (for debugging and user feedback)
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS failure_reason TEXT;

-- When this payment order expires (for cleanup)
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- Hall selection stored with payment (needed before trip_users is created)
-- Using VARCHAR to avoid enum dependency issues
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS hall VARCHAR(10);

-- ====================================
-- ADD INDEXES FOR NEW COLUMNS
-- ====================================

-- Index for looking up by gateway order ID (primary lookup during verification)
CREATE INDEX IF NOT EXISTS idx_payments_gateway_order 
ON payments(gateway_order_id) WHERE gateway_order_id IS NOT NULL;

-- Index for looking up by gateway payment ID
CREATE INDEX IF NOT EXISTS idx_payments_gateway_payment 
ON payments(gateway_payment_id) WHERE gateway_payment_id IS NOT NULL;

-- Index for filtering by gateway type
CREATE INDEX IF NOT EXISTS idx_payments_gateway 
ON payments(gateway);

-- Index for finding expired pending payments (for cleanup job)
CREATE INDEX IF NOT EXISTS idx_payments_pending_expires 
ON payments(expires_at) WHERE payment_status = 'pending';

-- ====================================
-- ADD CONSTRAINTS
-- ====================================

-- Unique constraint on gateway_order_id to prevent duplicate orders
-- This prevents race conditions and double-payments
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uq_payments_gateway_order'
  ) THEN
    ALTER TABLE payments
    ADD CONSTRAINT uq_payments_gateway_order UNIQUE (gateway_order_id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ====================================
-- ADD COMMENTS FOR DOCUMENTATION
-- ====================================

COMMENT ON COLUMN payments.gateway IS 'Payment gateway provider: razorpay, phonepe, stripe, mock';
COMMENT ON COLUMN payments.gateway_order_id IS 'Order ID from payment gateway (e.g., order_xxx from Razorpay). Created before payment.';
COMMENT ON COLUMN payments.gateway_payment_id IS 'Payment ID from gateway (e.g., pay_xxx from Razorpay). Received after payment.';
COMMENT ON COLUMN payments.gateway_signature IS 'Signature for verification. Stored for audit trail.';
COMMENT ON COLUMN payments.verified_at IS 'Timestamp when payment signature was successfully verified.';
COMMENT ON COLUMN payments.webhook_verified IS 'Whether webhook confirmation was received (backup verification method).';
COMMENT ON COLUMN payments.metadata IS 'Flexible JSON storage for gateway-specific data, notes, receipt info.';
COMMENT ON COLUMN payments.failure_reason IS 'Human-readable reason for payment failure (for debugging).';
COMMENT ON COLUMN payments.expires_at IS 'When this payment order expires. Pending payments past this time should be cleaned up.';
COMMENT ON COLUMN payments.hall IS 'Selected pickup hall. Stored here since trip_users is created after payment verification.';

-- ====================================
-- VERIFY MIGRATION
-- ====================================

-- Log success
DO $$ 
BEGIN
  RAISE NOTICE '✅ Migration 013: payments table extended for Razorpay integration';
END $$;

