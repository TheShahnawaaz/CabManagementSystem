/**
 * Payment Service
 * 
 * Main payment service that orchestrates payment operations.
 * This service:
 * - Uses the gateway adapter interface (gateway-agnostic)
 * - Handles database operations
 * - Manages payment state machine
 * - Provides business logic validation
 * 
 * Security:
 * - All amounts are validated server-side
 * - Signatures are verified before any state changes
 * - Database operations use transactions
 */

import pool from '../../config/database';
import { IPaymentGateway } from './payment.interface';
import { RazorpayAdapter } from './adapters/razorpay.adapter';
import { MockAdapter } from './adapters/mock.adapter';
import {
  CheckoutData,
  PaymentRecord,
  PaymentGateway,
} from './payment.types';

// ====================================
// CONFIGURATION
// ====================================

const PAYMENT_TIMEOUT_MINUTES = parseInt(process.env.PAYMENT_TIMEOUT_MINUTES || '15', 10);
const PAYMENT_CURRENCY = process.env.PAYMENT_CURRENCY || 'INR';
const BUSINESS_NAME = 'Friday Cab System';
const BUSINESS_LOGO = process.env.BUSINESS_LOGO_URL || '';
const THEME_COLOR = '#3B82F6'; // Blue

// ====================================
// GATEWAY INITIALIZATION
// ====================================

/**
 * Get the configured payment gateway adapter
 */
function getGatewayAdapter(): IPaymentGateway {
  const gatewayType = (process.env.PAYMENT_GATEWAY || 'razorpay') as PaymentGateway;

  switch (gatewayType) {
    case 'razorpay':
      if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        throw new Error('RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are required');
      }
      return new RazorpayAdapter({
        keyId: process.env.RAZORPAY_KEY_ID,
        keySecret: process.env.RAZORPAY_KEY_SECRET,
        webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET,
      });

    case 'mock':
      return new MockAdapter({
        keyId: 'mock_key',
        keySecret: 'mock_secret',
      });

    default:
      throw new Error(`Unsupported payment gateway: ${gatewayType}`);
  }
}

// Singleton gateway instance
let gatewayInstance: IPaymentGateway | null = null;

function getGateway(): IPaymentGateway {
  if (!gatewayInstance) {
    gatewayInstance = getGatewayAdapter();
  }
  return gatewayInstance;
}

// ====================================
// TYPES
// ====================================

export interface InitiatePaymentInput {
  userId: string;
  tripId: string;
  hall: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
}

export interface InitiatePaymentResult {
  success: boolean;
  checkoutData?: CheckoutData;
  error?: string;
}

export interface VerifyPaymentInput {
  paymentId: string;
  gatewayOrderId: string;
  gatewayPaymentId: string;
  gatewaySignature: string;
}

export interface VerifyPaymentResult {
  success: boolean;
  bookingId?: string;
  error?: string;
}

export interface WebhookProcessResult {
  success: boolean;
  message: string;
}

// ====================================
// PAYMENT SERVICE
// ====================================

export const paymentService = {
  /**
   * Get the gateway's publishable key (safe for frontend)
   */
  getKeyId(): string {
    return getGateway().keyId;
  },

  /**
   * Initiate a payment
   * 
   * This is the first step in the payment flow:
   * 1. Validate trip exists and is bookable
   * 2. Check user hasn't already booked
   * 3. Check no pending payment exists
   * 4. Create payment record (status: pending)
   * 5. Create gateway order
   * 6. Return checkout data for frontend
   */
  async initiatePayment(input: InitiatePaymentInput): Promise<InitiatePaymentResult> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // 1. Validate trip exists and is within booking window
      const tripResult = await client.query(
        `SELECT id, trip_title, amount_per_person 
         FROM trips 
         WHERE id = $1 
           AND booking_start_time <= NOW() 
           AND booking_end_time >= NOW()`,
        [input.tripId]
      );

      if (tripResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return {
          success: false,
          error: 'Trip not found or booking window is closed',
        };
      }

      const trip = tripResult.rows[0];
      const amountInRupees = parseFloat(trip.amount_per_person);
      const amountInPaise = Math.round(amountInRupees * 100);

      // 2. Check if user already has a confirmed booking
      const existingBooking = await client.query(
        `SELECT tu.id FROM trip_users tu
         JOIN payments p ON tu.payment_id = p.id
         WHERE tu.trip_id = $1 AND tu.user_id = $2 AND p.payment_status = 'confirmed'`,
        [input.tripId, input.userId]
      );

      if (existingBooking.rows.length > 0) {
        await client.query('ROLLBACK');
        return {
          success: false,
          error: 'You have already booked this trip',
        };
      }

      // 3. Check for existing pending payment with SAME hall
      // Only reuse if hall matches - allows users to change their selection
      const existingPending = await client.query(
        `SELECT id, gateway_order_id, expires_at, hall 
         FROM payments 
         WHERE trip_id = $1 AND user_id = $2 AND payment_status = 'pending' AND hall = $3
         ORDER BY created_at DESC
         LIMIT 1`,
        [input.tripId, input.userId, input.hall]
      );

      // If there's a non-expired pending payment with same hall, return its checkout data
      if (existingPending.rows.length > 0) {
        const pending = existingPending.rows[0];
        const expiresAt = new Date(pending.expires_at);
        
        if (expiresAt > new Date() && pending.gateway_order_id) {
          await client.query('COMMIT');
          
          // Return existing order's checkout data
          return {
            success: true,
            checkoutData: {
              paymentId: pending.id,
              orderId: pending.gateway_order_id,
              amount: amountInPaise,
              currency: PAYMENT_CURRENCY,
              keyId: getGateway().keyId,
              businessName: BUSINESS_NAME,
              businessLogo: BUSINESS_LOGO || undefined,
              description: `Booking for ${trip.trip_title}`,
              prefill: {
                name: input.userName,
                email: input.userEmail,
                contact: input.userPhone,
              },
              themeColor: THEME_COLOR,
              notes: {
                trip_id: input.tripId,
                user_id: input.userId,
                hall: input.hall, // Same as pending.hall (query ensures match)
              },
            },
          };
        } else {
          // Mark expired payment as failed
          await client.query(
            `UPDATE payments SET payment_status = 'failed', failure_reason = 'Expired'
             WHERE id = $1`,
            [pending.id]
          );
        }
      }

      // 4. Create new payment record
      const expiresAt = new Date(Date.now() + PAYMENT_TIMEOUT_MINUTES * 60 * 1000);
      const receipt = `rcpt_${input.tripId.slice(0, 8)}_${Date.now()}`;

      const paymentResult = await client.query(
        `INSERT INTO payments (
          user_id,
          trip_id,
          payment_status,
          payment_amount,
          payment_method,
          gateway,
          hall,
          expires_at,
          metadata
        ) VALUES ($1, $2, 'pending', $3, NULL, $4, $5, $6, $7)
        RETURNING id`,
        [
          input.userId,
          input.tripId,
          amountInRupees,
          getGateway().gateway,
          input.hall,
          expiresAt,
          JSON.stringify({
            receipt,
            userName: input.userName,
            userEmail: input.userEmail,
          }),
        ]
      );

      const paymentId = paymentResult.rows[0].id;

      // 5. Create gateway order
      const gateway = getGateway();
      const orderResult = await gateway.createOrder({
        amount: amountInPaise,
        currency: PAYMENT_CURRENCY,
        receipt,
        notes: {
          payment_id: paymentId,
          trip_id: input.tripId,
          user_id: input.userId,
          hall: input.hall,
        },
      });

      // 6. Update payment with gateway order ID
      await client.query(
        `UPDATE payments 
         SET gateway_order_id = $1, transaction_id = $1, updated_at = NOW()
         WHERE id = $2`,
        [orderResult.orderId, paymentId]
      );

      await client.query('COMMIT');

      // 7. Return checkout data
      return {
        success: true,
        checkoutData: {
          paymentId,
          orderId: orderResult.orderId,
          amount: amountInPaise,
          currency: PAYMENT_CURRENCY,
          keyId: gateway.keyId,
          businessName: BUSINESS_NAME,
          businessLogo: BUSINESS_LOGO || undefined,
          description: `Booking for ${trip.trip_title}`,
          prefill: {
            name: input.userName,
            email: input.userEmail,
            contact: input.userPhone,
          },
          themeColor: THEME_COLOR,
          notes: {
            trip_id: input.tripId,
            user_id: input.userId,
            hall: input.hall,
          },
        },
      };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Payment initiation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment initiation failed',
      };
    } finally {
      client.release();
    }
  },

  /**
   * Verify payment and create booking
   * 
   * This is called after user completes payment:
   * 1. Fetch payment record
   * 2. Verify gateway signature
   * 3. Update payment status
   * 4. Create trip_users entry (booking)
   * 5. Return booking ID
   */
  async verifyPayment(input: VerifyPaymentInput): Promise<VerifyPaymentResult> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // 1. Fetch payment record
      const paymentResult = await client.query(
        `SELECT * FROM payments WHERE id = $1 FOR UPDATE`,
        [input.paymentId]
      );

      if (paymentResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return { success: false, error: 'Payment not found' };
      }

      const payment: PaymentRecord = paymentResult.rows[0];

      // Check if already confirmed
      if (payment.payment_status === 'confirmed') {
        // Fetch existing booking
        const existingBooking = await client.query(
          `SELECT id FROM trip_users WHERE payment_id = $1`,
          [payment.id]
        );
        await client.query('COMMIT');
        return { 
          success: true, 
          bookingId: existingBooking.rows[0]?.id || undefined,
        };
      }

      // Check if payment is in valid state
      if (payment.payment_status !== 'pending') {
        await client.query('ROLLBACK');
        return { success: false, error: `Payment is already ${payment.payment_status}` };
      }

      // Verify order ID matches
      if (payment.gateway_order_id !== input.gatewayOrderId) {
        await client.query('ROLLBACK');
        return { success: false, error: 'Order ID mismatch' };
      }

      // 2. Verify signature
      const gateway = getGateway();
      const verifyResult = await gateway.verifyPayment({
        orderId: input.gatewayOrderId,
        paymentId: input.gatewayPaymentId,
        signature: input.gatewaySignature,
      });

      if (!verifyResult.isValid) {
        // Mark payment as failed
        await client.query(
          `UPDATE payments 
           SET payment_status = 'failed', 
               failure_reason = $1,
               updated_at = NOW()
           WHERE id = $2`,
          [verifyResult.error || 'Signature verification failed', input.paymentId]
        );
        await client.query('COMMIT');
        return { success: false, error: 'Payment verification failed' };
      }

      // 3. Update payment as confirmed with fee/tax data
      const fee = verifyResult.fee || 0;
      const tax = verifyResult.tax || 0;
      const amountInPaise = Math.round(payment.payment_amount * 100); // Convert rupees to paise (rounded to avoid floating-point issues)
      const netAmount = amountInPaise - fee - tax;

      // Merge existing metadata with gateway response
      const existingMetadata = payment.metadata || {};
      const updatedMetadata = {
        ...existingMetadata,
        gatewayResponse: verifyResult.gatewayResponse || null,
      };

      await client.query(
        `UPDATE payments 
         SET payment_status = 'confirmed',
             gateway_payment_id = $1,
             gateway_signature = $2,
             payment_method = $3,
             gateway_fee = $4,
             gateway_tax = $5,
             net_amount = $6,
             metadata = $7,
             transaction_id = $1,
             verified_at = NOW(),
             updated_at = NOW()
         WHERE id = $8`,
        [
          input.gatewayPaymentId,
          input.gatewaySignature,
          verifyResult.paymentMethod || 'unknown',
          fee,
          tax,
          netAmount,
          JSON.stringify(updatedMetadata),
          input.paymentId,
        ]
      );

      // 4. Create trip_users entry (booking)
      // First check if booking already exists (idempotency)
      const existingTripUser = await client.query(
        `SELECT id FROM trip_users WHERE trip_id = $1 AND user_id = $2`,
        [payment.trip_id, payment.user_id]
      );

      let bookingId: string;

      if (existingTripUser.rows.length > 0) {
        bookingId = existingTripUser.rows[0].id;
        // Update payment_id if different
        await client.query(
          `UPDATE trip_users SET payment_id = $1 WHERE id = $2`,
          [payment.id, bookingId]
        );
      } else {
        const bookingResult = await client.query(
          `INSERT INTO trip_users (trip_id, user_id, hall, payment_id)
           VALUES ($1, $2, $3, $4)
           RETURNING id`,
          [payment.trip_id, payment.user_id, payment.hall, payment.id]
        );
        bookingId = bookingResult.rows[0].id;
      }

      await client.query('COMMIT');

      return { success: true, bookingId };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Payment verification error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment verification failed',
      };
    } finally {
      client.release();
    }
  },

  /**
   * Process webhook event
   * 
   * Webhooks serve as backup verification:
   * 1. Validate webhook signature
   * 2. Find payment by order ID
   * 3. Update status if not already confirmed
   * 4. Create booking if not exists
   */
  async processWebhook(body: string, signature: string): Promise<WebhookProcessResult> {
    const gateway = getGateway();
    
    // 1. Validate webhook
    const webhookResult = gateway.validateWebhook({ body, signature });
    
    if (!webhookResult.success || !webhookResult.event) {
      console.error('Webhook validation failed:', webhookResult.error);
      return { success: false, message: webhookResult.error || 'Invalid webhook' };
    }

    const event = webhookResult.event;
    
    // Only process payment.captured events
    if (event.event !== 'payment.captured') {
      return { success: true, message: `Ignored event: ${event.event}` };
    }

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // 2. Find payment by order ID
      const paymentResult = await client.query(
        `SELECT * FROM payments WHERE gateway_order_id = $1 FOR UPDATE`,
        [event.orderId]
      );

      if (paymentResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return { success: false, message: 'Payment not found for order' };
      }

      const payment: PaymentRecord = paymentResult.rows[0];

      // 3. Update status if pending
      if (payment.payment_status === 'pending') {
        // Calculate fee, tax, and net amount
        const fee = event.fee || 0;
        const tax = event.tax || 0;
        const netAmount = event.amount - fee - tax;

        // Merge with existing metadata
        const existingMetadata = payment.metadata || {};
        const updatedMetadata = {
          ...existingMetadata,
          gatewayResponse: event.rawPayload,
          webhookVerified: true,
        };

        await client.query(
          `UPDATE payments 
           SET payment_status = 'confirmed',
               gateway_payment_id = $1,
               payment_method = $2,
               gateway_fee = $3,
               gateway_tax = $4,
               net_amount = $5,
               metadata = $6,
               webhook_verified = true,
               verified_at = NOW(),
               updated_at = NOW()
           WHERE id = $7`,
          [
            event.paymentId,
            event.paymentMethod || 'unknown',
            fee,
            tax,
            netAmount,
            JSON.stringify(updatedMetadata),
            payment.id,
          ]
        );

        // 4. Create booking if not exists
        const existingBooking = await client.query(
          `SELECT id FROM trip_users WHERE trip_id = $1 AND user_id = $2`,
          [payment.trip_id, payment.user_id]
        );

        if (existingBooking.rows.length === 0) {
          await client.query(
            `INSERT INTO trip_users (trip_id, user_id, hall, payment_id)
             VALUES ($1, $2, $3, $4)`,
            [payment.trip_id, payment.user_id, payment.hall, payment.id]
          );
        }
      } else if (payment.payment_status === 'confirmed') {
        // Already confirmed - just update webhook data if missing
        const fee = event.fee || 0;
        const tax = event.tax || 0;
        const netAmount = event.amount - fee - tax;

        // Merge gateway response if not already stored
        const existingMetadata = payment.metadata || {};
        const updatedMetadata = {
          ...existingMetadata,
          gatewayResponse: existingMetadata.gatewayResponse || event.rawPayload,
          webhookVerified: true,
        };

        await client.query(
          `UPDATE payments 
           SET webhook_verified = true,
               gateway_fee = COALESCE(gateway_fee, $1),
               gateway_tax = COALESCE(gateway_tax, $2),
               net_amount = COALESCE(net_amount, $3),
               metadata = $4,
               updated_at = NOW()
           WHERE id = $5`,
          [fee, tax, netAmount, JSON.stringify(updatedMetadata), payment.id]
        );
      }

      await client.query('COMMIT');
      return { success: true, message: 'Webhook processed successfully' };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Webhook processing error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Webhook processing failed',
      };
    } finally {
      client.release();
    }
  },

  /**
   * Get payment status
   */
  async getPaymentStatus(paymentId: string): Promise<PaymentRecord | null> {
    const result = await pool.query(
      `SELECT * FROM payments WHERE id = $1`,
      [paymentId]
    );
    return result.rows[0] || null;
  },

  /**
   * Clean up expired pending payments
   * (Can be called by a cron job)
   */
  async cleanupExpiredPayments(): Promise<number> {
    const result = await pool.query(
      `UPDATE payments 
       SET payment_status = 'failed', 
           failure_reason = 'Payment expired',
           updated_at = NOW()
       WHERE payment_status = 'pending' 
         AND expires_at < NOW()
       RETURNING id`
    );
    return result.rowCount || 0;
  },
};

export default paymentService;

