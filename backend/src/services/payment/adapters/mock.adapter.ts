/**
 * Mock Payment Gateway Adapter
 * 
 * A mock implementation of the payment gateway interface for:
 * - Local development without real API calls
 * - Testing payment flows
 * - CI/CD pipelines
 * 
 * Usage:
 * Set PAYMENT_GATEWAY=mock in environment variables
 */

import crypto from 'crypto';
import {
  IPaymentGateway,
  PaymentGatewayConfig,
} from '../payment.interface';
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
} from '../payment.types';

/**
 * Mock Payment Gateway Adapter
 */
export class MockAdapter implements IPaymentGateway {
  readonly gateway: PaymentGateway = 'mock';
  readonly keyId: string = 'mock_key_id';
  
  private readonly keySecret: string;
  
  // In-memory store for mock orders (for testing)
  private orders: Map<string, CreateOrderResult> = new Map();
  private payments: Map<string, { orderId: string; status: string }> = new Map();

  constructor(config: PaymentGatewayConfig) {
    this.keySecret = config.keySecret || 'mock_secret';
  }

  /**
   * Create a mock order
   */
  async createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
    // Simulate network delay
    await this.delay(100);

    const orderId = `order_mock_${Date.now()}_${this.randomString(8)}`;
    
    const order: CreateOrderResult = {
      orderId,
      amount: input.amount,
      currency: input.currency,
      status: 'created',
      receipt: input.receipt,
      rawResponse: {
        id: orderId,
        amount: input.amount,
        currency: input.currency,
        receipt: input.receipt,
        status: 'created',
        created_at: Date.now(),
      },
    };

    this.orders.set(orderId, order);
    return order;
  }

  /**
   * Verify mock payment signature
   * 
   * For testing:
   * - signature starting with "valid_" will pass
   * - signature starting with "invalid_" will fail
   * - Otherwise, uses standard HMAC verification
   */
  async verifyPayment(input: VerifyPaymentInput): Promise<VerifyPaymentResult> {
    // Special test signatures
    if (input.signature.startsWith('valid_')) {
      this.payments.set(input.paymentId, {
        orderId: input.orderId,
        status: 'captured',
      });
      return { isValid: true, paymentMethod: 'mock' };
    }
    
    if (input.signature.startsWith('invalid_')) {
      return { isValid: false, error: 'Test invalid signature' };
    }

    // Standard HMAC verification (same as Razorpay)
    try {
      const body = input.orderId + '|' + input.paymentId;
      const expectedSignature = crypto
        .createHmac('sha256', this.keySecret)
        .update(body)
        .digest('hex');

      const isValid = expectedSignature === input.signature;
      
      if (isValid) {
        this.payments.set(input.paymentId, {
          orderId: input.orderId,
          status: 'captured',
        });
        return { isValid: true, paymentMethod: 'mock' };
      }
      
      return { isValid: false, error: 'Signature mismatch' };
    } catch (error) {
      return { 
        isValid: false, 
        error: error instanceof Error ? error.message : 'Verification failed' 
      };
    }
  }

  /**
   * Validate mock webhook
   */
  validateWebhook(input: WebhookValidationInput): WebhookResult {
    try {
      const payload = JSON.parse(input.body);
      
      // For mock, accept if signature is 'mock_webhook_secret'
      if (input.signature !== 'mock_webhook_secret') {
        return { success: false, error: 'Invalid mock webhook signature' };
      }

      return {
        success: true,
        event: {
          event: payload.event || 'payment.captured',
          orderId: payload.order_id || 'order_mock',
          paymentId: payload.payment_id || 'pay_mock',
          amount: payload.amount || 5000,
          status: 'captured',
          paymentMethod: 'mock',
          rawPayload: payload,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Webhook validation failed',
      };
    }
  }

  /**
   * Get mock payment status
   */
  async getPaymentStatus(paymentId: string): Promise<PaymentStatusResult> {
    await this.delay(50);

    const payment = this.payments.get(paymentId);
    
    return {
      paymentId,
      status: payment?.status === 'captured' ? 'captured' : 'created',
      paymentMethod: 'mock',
      amount: 5000,
      currency: 'INR',
      rawResponse: { mock: true },
    };
  }

  /**
   * Process mock refund
   */
  async refundPayment(input: RefundInput): Promise<RefundResult> {
    await this.delay(100);

    const refundId = `rfnd_mock_${Date.now()}_${this.randomString(6)}`;

    return {
      refundId,
      paymentId: input.paymentId,
      amount: input.amount || 5000,
      status: 'processed',
      rawResponse: { mock: true },
    };
  }

  // ====================================
  // HELPER METHODS
  // ====================================

  /**
   * Generate a valid mock signature for testing
   */
  generateValidSignature(orderId: string, paymentId: string): string {
    const body = orderId + '|' + paymentId;
    return crypto
      .createHmac('sha256', this.keySecret)
      .update(body)
      .digest('hex');
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private randomString(length: number): string {
    return crypto.randomBytes(length).toString('hex').slice(0, length);
  }
}

