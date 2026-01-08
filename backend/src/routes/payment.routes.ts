/**
 * Payment Routes
 * 
 * All payment-related endpoints for the booking payment flow.
 * 
 * Routes:
 * - GET  /api/payments/key          - Get Razorpay key ID (public)
 * - POST /api/payments/initiate     - Create order, get checkout data (auth required)
 * - POST /api/payments/verify       - Verify payment, create booking (auth required)
 * - GET  /api/payments/:id/status   - Get payment status (auth required)
 */

import { Router } from 'express';
import {
  initiatePayment,
  verifyPayment,
  getPaymentStatus,
  getPaymentKey,
} from '../controllers/payment.controller';
import { authenticateUser } from '../middleware/auth.middleware';

const router = Router();

// ====================================
// PUBLIC ROUTES
// ====================================

/**
 * @route   GET /api/payments/key
 * @desc    Get Razorpay publishable key ID
 * @access  Public (key is safe to expose)
 */
router.get('/payments/key', getPaymentKey);

// ====================================
// AUTHENTICATED ROUTES
// ====================================

/**
 * @route   POST /api/payments/initiate
 * @desc    Create a payment order and get checkout data
 * @access  Authenticated users only
 * @body    { trip_id: UUID, hall: string }
 * @returns { checkoutData: CheckoutData }
 */
router.post('/payments/initiate', authenticateUser, initiatePayment);

/**
 * @route   POST /api/payments/verify
 * @desc    Verify payment signature and create booking
 * @access  Authenticated users only
 * @body    {
 *            payment_id: UUID,
 *            razorpay_order_id: string,
 *            razorpay_payment_id: string,
 *            razorpay_signature: string
 *          }
 * @returns { booking_id: UUID }
 */
router.post('/payments/verify', authenticateUser, verifyPayment);

/**
 * @route   GET /api/payments/:id/status
 * @desc    Get payment status
 * @access  Authenticated users only (owner or admin)
 */
router.get('/payments/:id/status', authenticateUser, getPaymentStatus);

export default router;

