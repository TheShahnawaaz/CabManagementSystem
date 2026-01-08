/**
 * Payment Types
 * 
 * Centralized type definitions for payment system.
 * These types are gateway-agnostic to support multiple payment providers.
 */

// ====================================
// GATEWAY TYPES
// ====================================

export type PaymentGateway = 'razorpay' | 'phonepe' | 'stripe' | 'mock';

export type PaymentStatus = 'pending' | 'confirmed' | 'failed';

export type PaymentMethod = 'upi' | 'card' | 'netbanking' | 'wallet' | 'emi' | 'mock' | 'unknown';

// ====================================
// ORDER TYPES
// ====================================

/**
 * Data required to create a payment order
 */
export interface CreateOrderInput {
  /** Amount in smallest currency unit (paise for INR) */
  amount: number;
  /** Currency code (e.g., 'INR') */
  currency: string;
  /** Unique receipt ID for reconciliation */
  receipt: string;
  /** Additional notes/metadata */
  notes?: Record<string, string>;
}

/**
 * Response from gateway after creating an order
 */
export interface CreateOrderResult {
  /** Gateway's order ID (e.g., order_ABC123) */
  orderId: string;
  /** Amount in smallest currency unit */
  amount: number;
  /** Currency code */
  currency: string;
  /** Order status from gateway */
  status: string;
  /** Receipt ID echoed back */
  receipt: string;
  /** Raw response from gateway (for debugging) */
  rawResponse?: Record<string, unknown>;
}

// ====================================
// PAYMENT VERIFICATION TYPES
// ====================================

/**
 * Data required to verify a payment
 */
export interface VerifyPaymentInput {
  /** Our internal order ID from gateway */
  orderId: string;
  /** Payment ID from gateway */
  paymentId: string;
  /** Signature from gateway */
  signature: string;
}

/**
 * Result of payment verification
 */
export interface VerifyPaymentResult {
  /** Whether signature is valid */
  isValid: boolean;
  /** Payment method used (upi, card, etc.) */
  paymentMethod?: PaymentMethod;
  /** Gateway fee in paise */
  fee?: number;
  /** GST on gateway fee in paise */
  tax?: number;
  /** Full gateway response for storage */
  gatewayResponse?: Record<string, unknown>;
  /** Error message if verification failed */
  error?: string;
}

// ====================================
// WEBHOOK TYPES
// ====================================

/**
 * Data required to validate a webhook
 */
export interface WebhookValidationInput {
  /** Raw request body as string */
  body: string;
  /** Signature from request headers */
  signature: string;
}

/**
 * Parsed webhook event
 */
export interface WebhookEvent {
  /** Event type (e.g., 'payment.captured') */
  event: string;
  /** Gateway's order ID */
  orderId: string;
  /** Gateway's payment ID */
  paymentId: string;
  /** Payment amount in smallest currency unit */
  amount: number;
  /** Payment status */
  status: 'captured' | 'failed' | 'authorized';
  /** Payment method used */
  paymentMethod?: PaymentMethod;
  /** Gateway fee in paise */
  fee?: number;
  /** GST on gateway fee in paise */
  tax?: number;
  /** Error code if failed */
  errorCode?: string;
  /** Error description if failed */
  errorDescription?: string;
  /** Raw payload (for logging/storage) */
  rawPayload: Record<string, unknown>;
}

/**
 * Result of webhook processing
 */
export interface WebhookResult {
  /** Whether webhook was valid and processed */
  success: boolean;
  /** Parsed event if valid */
  event?: WebhookEvent;
  /** Error message if invalid */
  error?: string;
}

// ====================================
// PAYMENT STATUS TYPES
// ====================================

/**
 * Payment status from gateway
 */
export interface PaymentStatusResult {
  /** Gateway's payment ID */
  paymentId: string;
  /** Payment status */
  status: 'created' | 'authorized' | 'captured' | 'failed' | 'refunded';
  /** Payment method used */
  paymentMethod?: PaymentMethod;
  /** Amount in smallest currency unit */
  amount: number;
  /** Currency code */
  currency: string;
  /** Error details if failed */
  error?: {
    code: string;
    description: string;
    reason: string;
  };
  /** Raw response from gateway */
  rawResponse?: Record<string, unknown>;
}

// ====================================
// REFUND TYPES
// ====================================

/**
 * Data required to initiate a refund
 */
export interface RefundInput {
  /** Gateway's payment ID to refund */
  paymentId: string;
  /** Amount to refund in smallest currency unit (optional, full refund if not provided) */
  amount?: number;
  /** Reason for refund */
  notes?: Record<string, string>;
}

/**
 * Result of refund operation
 */
export interface RefundResult {
  /** Gateway's refund ID */
  refundId: string;
  /** Payment ID that was refunded */
  paymentId: string;
  /** Amount refunded */
  amount: number;
  /** Refund status */
  status: 'pending' | 'processed' | 'failed';
  /** Raw response from gateway */
  rawResponse?: Record<string, unknown>;
}

// ====================================
// CHECKOUT DATA TYPES
// ====================================

/**
 * Data needed by frontend to open payment checkout
 */
export interface CheckoutData {
  /** Our internal payment ID */
  paymentId: string;
  /** Gateway's order ID */
  orderId: string;
  /** Amount in smallest currency unit */
  amount: number;
  /** Currency code */
  currency: string;
  /** Gateway's publishable key */
  keyId: string;
  /** Business name to display */
  businessName: string;
  /** Business logo URL */
  businessLogo?: string;
  /** Payment description */
  description: string;
  /** Prefill data for checkout form */
  prefill: {
    name: string;
    email: string;
    contact?: string;
  };
  /** Theme color */
  themeColor?: string;
  /** Additional notes */
  notes?: Record<string, string>;
}

// ====================================
// DATABASE PAYMENT RECORD
// ====================================

/**
 * Payment record as stored in database
 */
export interface PaymentRecord {
  id: string;
  user_id: string;
  trip_id: string;
  payment_status: PaymentStatus;
  payment_amount: number;
  payment_date: Date;
  payment_method: string | null;
  transaction_id: string | null;
  gateway: PaymentGateway;
  gateway_order_id: string | null;
  gateway_payment_id: string | null;
  gateway_signature: string | null;
  verified_at: Date | null;
  webhook_verified: boolean;
  metadata: Record<string, unknown>;
  failure_reason: string | null;
  expires_at: Date | null;
  hall: string | null;
  created_at: Date;
  updated_at: Date;
}

