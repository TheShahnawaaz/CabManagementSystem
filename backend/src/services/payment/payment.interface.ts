/**
 * Payment Gateway Interface
 * 
 * This interface defines the contract that all payment gateway adapters must implement.
 * By coding against this interface (not specific implementations), we can easily
 * switch between Razorpay, PhonePe, Stripe, or any other payment provider.
 * 
 * Design Principles:
 * 1. Gateway-agnostic - No Razorpay-specific types in the interface
 * 2. Secure by default - All operations validate signatures
 * 3. Testable - Mock adapter for testing without real API calls
 * 4. Auditable - All operations return data suitable for logging
 */

import {
  CreateOrderInput,
  CreateOrderResult,
  VerifyPaymentInput,
  VerifyPaymentResult,
  WebhookValidationInput,
  WebhookResult,
  PaymentStatusResult,
  RefundInput,
  RefundResult,
  PaymentGateway,
} from './payment.types';

/**
 * Payment Gateway Adapter Interface
 * 
 * All payment gateway implementations must implement this interface.
 * This allows the PaymentService to work with any gateway without
 * knowing the specific implementation details.
 */
export interface IPaymentGateway {
  /**
   * Get the gateway identifier
   */
  readonly gateway: PaymentGateway;

  /**
   * Get the publishable key (safe to expose to frontend)
   */
  readonly keyId: string;

  /**
   * Create a payment order
   * 
   * This is the first step in the payment flow. It creates an order
   * with the payment gateway that can then be used to collect payment.
   * 
   * @param input - Order creation parameters
   * @returns Promise resolving to order details
   * @throws Error if order creation fails
   */
  createOrder(input: CreateOrderInput): Promise<CreateOrderResult>;

  /**
   * Verify payment signature
   * 
   * After a customer completes payment, the gateway returns a signature.
   * This method verifies that signature to ensure the payment is authentic
   * and hasn't been tampered with.
   * 
   * CRITICAL: Never trust payment status without signature verification!
   * 
   * @param input - Payment verification parameters
   * @returns Promise resolving to verification result (isValid: true/false)
   */
  verifyPayment(input: VerifyPaymentInput): Promise<VerifyPaymentResult>;

  /**
   * Validate and parse webhook payload
   * 
   * Payment gateways send webhooks for payment events. This method:
   * 1. Validates the webhook signature
   * 2. Parses the payload into a standard format
   * 
   * Use webhooks as a backup verification method.
   * 
   * @param input - Raw webhook body and signature
   * @returns Parsed webhook event or error
   */
  validateWebhook(input: WebhookValidationInput): WebhookResult;

  /**
   * Get payment status from gateway
   * 
   * Fetches the current status of a payment directly from the gateway.
   * Use this for:
   * - Reconciliation
   * - Handling edge cases where webhook/callback failed
   * - Admin verification
   * 
   * @param paymentId - Gateway's payment ID
   * @returns Payment status details
   * @throws Error if payment not found or API error
   */
  getPaymentStatus(paymentId: string): Promise<PaymentStatusResult>;

  /**
   * Initiate a refund
   * 
   * Refunds a previously captured payment.
   * Supports partial refunds if amount is specified.
   * 
   * @param input - Refund parameters
   * @returns Refund result
   * @throws Error if refund fails
   */
  refundPayment(input: RefundInput): Promise<RefundResult>;
}

/**
 * Payment Gateway Configuration
 * 
 * Configuration required to initialize a payment gateway adapter.
 */
export interface PaymentGatewayConfig {
  /** API Key ID (publishable) */
  keyId: string;
  /** API Key Secret (private - never expose!) */
  keySecret: string;
  /** Webhook secret for signature validation */
  webhookSecret?: string;
  /** Gateway-specific additional config */
  options?: Record<string, unknown>;
}

