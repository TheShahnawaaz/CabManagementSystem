/**
 * Razorpay Payment Gateway Adapter
 * 
 * Implements the IPaymentGateway interface for Razorpay.
 * This adapter handles all Razorpay-specific API calls and signature verification.
 * 
 * Security Notes:
 * - key_secret is NEVER exposed to frontend
 * - All signatures are verified using HMAC-SHA256
 * - Webhook signatures use separate secret
 */

import Razorpay from 'razorpay';
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
  PaymentMethod,
} from '../payment.types';

/**
 * Razorpay Payment Gateway Adapter
 */
export class RazorpayAdapter implements IPaymentGateway {
  readonly gateway: PaymentGateway = 'razorpay';
  readonly keyId: string;
  
  private readonly keySecret: string;
  private readonly webhookSecret: string;
  private readonly client: Razorpay;

  constructor(config: PaymentGatewayConfig) {
    if (!config.keyId || !config.keySecret) {
      throw new Error('Razorpay keyId and keySecret are required');
    }

    this.keyId = config.keyId;
    this.keySecret = config.keySecret;
    this.webhookSecret = config.webhookSecret || '';

    // Initialize Razorpay client
    this.client = new Razorpay({
      key_id: this.keyId,
      key_secret: this.keySecret,
    });
  }

  /**
   * Create a Razorpay order
   * 
   * This creates an order that the frontend will use to open the checkout.
   * The order must be created server-side to ensure amount integrity.
   */
  async createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
    try {
      const order = await this.client.orders.create({
        amount: input.amount, // Amount in paise
        currency: input.currency,
        receipt: input.receipt,
        notes: input.notes || {},
      });

      return {
        orderId: order.id,
        amount: order.amount as number,
        currency: order.currency,
        status: order.status,
        receipt: order.receipt || input.receipt,
        rawResponse: order as unknown as Record<string, unknown>,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create Razorpay order';
      console.error('Razorpay createOrder error:', error);
      throw new Error(`Razorpay order creation failed: ${errorMessage}`);
    }
  }

  /**
   * Verify payment signature
   * 
   * CRITICAL: This is the most important security function!
   * 
   * Razorpay sends:
   * - razorpay_order_id
   * - razorpay_payment_id
   * - razorpay_signature
   * 
   * We verify by computing:
   * HMAC_SHA256(order_id + "|" + payment_id, key_secret)
   * 
   * And comparing with the received signature.
   */
  async verifyPayment(input: VerifyPaymentInput): Promise<VerifyPaymentResult> {
    try {
      // Construct the string to sign: order_id|payment_id
      const body = input.orderId + '|' + input.paymentId;

      // Compute HMAC SHA256 signature
      const expectedSignature = crypto
        .createHmac('sha256', this.keySecret)
        .update(body)
        .digest('hex');

      // Compare signatures using timing-safe comparison
      const isValid = crypto.timingSafeEqual(
        Buffer.from(expectedSignature),
        Buffer.from(input.signature)
      );

      if (!isValid) {
        return {
          isValid: false,
          error: 'Signature verification failed',
        };
      }

      // Fetch payment details to get method, fee, tax, and full response
      let paymentMethod: PaymentMethod = 'unknown';
      let fee: number | undefined;
      let tax: number | undefined;
      let gatewayResponse: Record<string, unknown> | undefined;

      try {
        const payment = await this.client.payments.fetch(input.paymentId);
        if (payment) {
          // Extract payment method
          if (payment.method) {
            paymentMethod = this.mapPaymentMethod(payment.method);
          }
          // Extract fee and tax (in paise)
          fee = typeof payment.fee === 'number' ? payment.fee : undefined;
          tax = typeof payment.tax === 'number' ? payment.tax : undefined;
          // Store full response for analysis
          gatewayResponse = payment as unknown as Record<string, unknown>;
        }
      } catch (fetchError) {
        // Log but don't fail - these details are nice to have, not required
        console.warn('Could not fetch payment details:', fetchError);
      }

      return {
        isValid: true,
        paymentMethod,
        fee,
        tax,
        gatewayResponse,
      };
    } catch (error: unknown) {
      console.error('Razorpay signature verification error:', error);
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Signature verification failed',
      };
    }
  }

  /**
   * Validate and parse webhook payload
   * 
   * Razorpay webhooks include:
   * - X-Razorpay-Signature header
   * - JSON body with event details
   * 
   * We verify by computing:
   * HMAC_SHA256(request_body, webhook_secret)
   */
  validateWebhook(input: WebhookValidationInput): WebhookResult {
    try {
      if (!this.webhookSecret) {
        return {
          success: false,
          error: 'Webhook secret not configured',
        };
      }

      // Compute expected signature
      const expectedSignature = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(input.body)
        .digest('hex');

      // Compare signatures
      let isValid = false;
      try {
        isValid = crypto.timingSafeEqual(
          Buffer.from(expectedSignature),
          Buffer.from(input.signature)
        );
      } catch {
        // Buffer length mismatch means invalid signature
        isValid = false;
      }

      if (!isValid) {
        return {
          success: false,
          error: 'Invalid webhook signature',
        };
      }

      // Parse the payload
      const payload = JSON.parse(input.body);
      const eventType = payload.event;
      const paymentEntity = payload.payload?.payment?.entity;

      if (!paymentEntity) {
        return {
          success: false,
          error: 'Invalid webhook payload structure',
        };
      }

      // Map Razorpay payment method to our enum
      const paymentMethod = this.mapPaymentMethod(paymentEntity.method);

      // Extract fee and tax from webhook payload
      const fee = typeof paymentEntity.fee === 'number' ? paymentEntity.fee : undefined;
      const tax = typeof paymentEntity.tax === 'number' ? paymentEntity.tax : undefined;

      return {
        success: true,
        event: {
          event: eventType,
          orderId: paymentEntity.order_id,
          paymentId: paymentEntity.id,
          amount: paymentEntity.amount,
          status: this.mapWebhookStatus(eventType),
          paymentMethod,
          fee,
          tax,
          errorCode: paymentEntity.error_code,
          errorDescription: paymentEntity.error_description,
          rawPayload: payload,
        },
      };
    } catch (error: unknown) {
      console.error('Razorpay webhook validation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Webhook validation failed',
      };
    }
  }

  /**
   * Get payment status from Razorpay
   */
  async getPaymentStatus(paymentId: string): Promise<PaymentStatusResult> {
    try {
      const payment = await this.client.payments.fetch(paymentId);

      return {
        paymentId: payment.id,
        status: this.mapPaymentStatus(payment.status),
        paymentMethod: this.mapPaymentMethod(payment.method),
        amount: payment.amount as number,
        currency: payment.currency,
        error: payment.error_code ? {
          code: payment.error_code,
          description: payment.error_description || '',
          reason: payment.error_reason || '',
        } : undefined,
        rawResponse: payment as unknown as Record<string, unknown>,
      };
    } catch (error: unknown) {
      console.error('Razorpay getPaymentStatus error:', error);
      throw new Error(
        `Failed to fetch payment status: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Initiate a refund
   */
  async refundPayment(input: RefundInput): Promise<RefundResult> {
    try {
      const refundOptions: { notes?: Record<string, string>; amount?: number } = {};
      
      if (input.amount) {
        refundOptions.amount = input.amount;
      }
      if (input.notes) {
        refundOptions.notes = input.notes;
      }

      const refund = await this.client.payments.refund(input.paymentId, refundOptions);

      return {
        refundId: refund.id,
        paymentId: refund.payment_id,
        amount: refund.amount ?? 0,
        status: refund.status === 'processed' ? 'processed' : 'pending',
        rawResponse: refund as unknown as Record<string, unknown>,
      };
    } catch (error: unknown) {
      console.error('Razorpay refund error:', error);
      throw new Error(
        `Refund failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  // ====================================
  // PRIVATE HELPER METHODS
  // ====================================

  /**
   * Map Razorpay payment method to our enum
   */
  private mapPaymentMethod(method: string | undefined): PaymentMethod {
    if (!method) return 'unknown';
    
    const methodMap: Record<string, PaymentMethod> = {
      'upi': 'upi',
      'card': 'card',
      'netbanking': 'netbanking',
      'wallet': 'wallet',
      'emi': 'emi',
    };
    
    return methodMap[method.toLowerCase()] || 'unknown';
  }

  /**
   * Map Razorpay payment status to our enum
   */
  private mapPaymentStatus(status: string): 'created' | 'authorized' | 'captured' | 'failed' | 'refunded' {
    const statusMap: Record<string, 'created' | 'authorized' | 'captured' | 'failed' | 'refunded'> = {
      'created': 'created',
      'authorized': 'authorized',
      'captured': 'captured',
      'failed': 'failed',
      'refunded': 'refunded',
    };
    
    return statusMap[status] || 'failed';
  }

  /**
   * Map webhook event to payment status
   */
  private mapWebhookStatus(event: string): 'captured' | 'failed' | 'authorized' {
    if (event === 'payment.captured') return 'captured';
    if (event === 'payment.failed') return 'failed';
    if (event === 'payment.authorized') return 'authorized';
    return 'failed';
  }
}

