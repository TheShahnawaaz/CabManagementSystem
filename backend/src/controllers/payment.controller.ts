/**
 * Payment Controller
 * 
 * Handles all payment-related HTTP endpoints:
 * - POST /api/payments/initiate - Create order and get checkout data
 * - POST /api/payments/verify - Verify payment and create booking
 * - GET /api/payments/:id/status - Get payment status
 * 
 * Security:
 * - All endpoints require authentication
 * - Amount is always fetched from database (never trust frontend)
 * - Signatures are verified server-side
 */

import { Request, Response } from 'express';
import { paymentService } from '../services/payment';
import { AuthRequest } from '../types/express';

// ====================================
// INITIATE PAYMENT
// ====================================

/**
 * Initiate a payment order
 * 
 * POST /api/payments/initiate
 * Body: { trip_id: string, hall: string }
 * 
 * Returns checkout data for frontend to open payment gateway
 */
export const initiatePayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const user = authReq.user;

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
      return;
    }

    const { trip_id, hall } = req.body;

    // Validate input
    if (!trip_id) {
      res.status(400).json({
        success: false,
        error: 'trip_id is required',
      });
      return;
    }

    if (!hall) {
      res.status(400).json({
        success: false,
        error: 'hall is required',
      });
      return;
    }

    // Validate hall value
    const validHalls = ['RK', 'PAN', 'LBS', 'VS'];
    if (!validHalls.includes(hall)) {
      res.status(400).json({
        success: false,
        error: `hall must be one of: ${validHalls.join(', ')}`,
      });
      return;
    }

    // Initiate payment
    const result = await paymentService.initiatePayment({
      userId: user.id,
      tripId: trip_id,
      hall,
      userName: user.name,
      userEmail: user.email,
      userPhone: user.phone_number || undefined,
    });

    if (!result.success) {
      res.status(400).json({
        success: false,
        error: result.error,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Payment order created',
      data: result.checkoutData,
    });
  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initiate payment',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// ====================================
// VERIFY PAYMENT
// ====================================

/**
 * Verify payment signature and create booking
 * 
 * POST /api/payments/verify
 * Body: {
 *   payment_id: string,          // Our internal payment ID
 *   razorpay_order_id: string,   // Gateway order ID
 *   razorpay_payment_id: string, // Gateway payment ID
 *   razorpay_signature: string   // Gateway signature
 * }
 * 
 * Returns booking ID on success
 */
export const verifyPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const user = authReq.user;

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
      return;
    }

    const {
      payment_id,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    // Validate input
    if (!payment_id || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: payment_id, razorpay_order_id, razorpay_payment_id, razorpay_signature',
      });
      return;
    }

    // Security: Verify user owns this payment before processing
    const payment = await paymentService.getPaymentStatus(payment_id);
    if (!payment) {
      res.status(404).json({
        success: false,
        error: 'Payment not found',
      });
      return;
    }

    if (payment.user_id !== user.id && !user.is_admin) {
      res.status(403).json({
        success: false,
        error: 'Access denied: You do not own this payment',
      });
      return;
    }

    // Verify payment
    const result = await paymentService.verifyPayment({
      paymentId: payment_id,
      gatewayOrderId: razorpay_order_id,
      gatewayPaymentId: razorpay_payment_id,
      gatewaySignature: razorpay_signature,
    });

    if (!result.success) {
      res.status(400).json({
        success: false,
        error: result.error,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Payment verified and booking created',
      data: {
        booking_id: result.bookingId,
      },
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify payment',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// ====================================
// GET PAYMENT STATUS
// ====================================

/**
 * Get payment status
 * 
 * GET /api/payments/:id/status
 * 
 * Returns current payment status and details
 */
export const getPaymentStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const user = authReq.user;

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
      return;
    }

    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'Payment ID is required',
      });
      return;
    }

    const payment = await paymentService.getPaymentStatus(id as string);

    if (!payment) {
      res.status(404).json({
        success: false,
        error: 'Payment not found',
      });
      return;
    }

    // Ensure user owns this payment (or is admin)
    if (payment.user_id !== user.id && !user.is_admin) {
      res.status(403).json({
        success: false,
        error: 'Access denied',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        id: payment.id,
        status: payment.payment_status,
        amount: payment.payment_amount,
        method: payment.payment_method,
        gateway: payment.gateway,
        created_at: payment.created_at,
        verified_at: payment.verified_at,
      },
    });
  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get payment status',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// ====================================
// GET PAYMENT KEY (Public)
// ====================================

/**
 * Get Razorpay key ID (safe to expose)
 * 
 * GET /api/payments/key
 * 
 * Frontend can use this to initialize Razorpay SDK
 */
export const getPaymentKey = async (_req: Request, res: Response): Promise<void> => {
  try {
    const keyId = paymentService.getKeyId();
    
    res.status(200).json({
      success: true,
      data: {
        key_id: keyId,
      },
    });
  } catch (error) {
    console.error('Get payment key error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get payment key',
    });
  }
};

