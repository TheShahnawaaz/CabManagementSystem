-- Migration: Add fee tracking columns to payments table
-- This allows tracking Razorpay fees and GST for financial analysis

-- Add dedicated columns for fee tracking (stored in paise for precision)
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS gateway_fee INTEGER DEFAULT 0;

ALTER TABLE payments
ADD COLUMN IF NOT EXISTS gateway_tax INTEGER DEFAULT 0;

ALTER TABLE payments
ADD COLUMN IF NOT EXISTS net_amount INTEGER;

-- Add comment for documentation
COMMENT ON COLUMN payments.gateway_fee IS 'Payment gateway fee in paise';
COMMENT ON COLUMN payments.gateway_tax IS 'GST on gateway fee in paise';
COMMENT ON COLUMN payments.net_amount IS 'Amount received after deductions (amount - fee - tax) in paise';

