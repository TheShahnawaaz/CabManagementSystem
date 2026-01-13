/**
 * Webhook Routes
 * 
 * Handles incoming webhooks from payment gateways.
 * 
 * IMPORTANT: Webhooks require raw body for signature verification.
 * This is configured in index.ts before JSON parsing middleware.
 * 
 * Routes:
 * - POST /api/webhooks/razorpay - Razorpay payment webhooks
 */

import { Router, Request, Response } from 'express';
import { paymentService } from '../services/payment';

const router = Router();

// ====================================
// RAZORPAY WEBHOOK
// ====================================

/**
 * @route   POST /api/webhooks/razorpay
 * @desc    Handle Razorpay payment webhooks
 * @access  Public (verified by signature)
 * @header  X-Razorpay-Signature: HMAC signature
 * @body    Raw JSON body from Razorpay
 * 
 * Events handled:
 * - payment.captured - Payment successful
 * - payment.failed - Payment failed
 * 
 * Note: This endpoint expects raw body (not parsed JSON)
 * for signature verification. See webhook.middleware.ts
 */
router.post('/razorpay', async (req: Request, res: Response) => {
  try {
    // Get signature from header
    const signature = req.headers['x-razorpay-signature'] as string;

    if (!signature) {
      console.error('Webhook missing signature header');
      res.status(400).json({ 
        success: false, 
        error: 'Missing signature header' 
      });
      return;
    }

    // Get raw body
    // Note: We need the raw body as a string for signature verification
    // This is set up in the webhook middleware
    const rawBody = (req as any).rawBody;

    if (!rawBody) {
      console.error('Webhook missing raw body');
      res.status(400).json({ 
        success: false, 
        error: 'Missing request body' 
      });
      return;
    }

    // Process webhook
    const result = await paymentService.processWebhook(rawBody, signature);

    if (!result.success) {
      console.error('Webhook processing failed:', result.message);
      // Still return 200 to prevent retries for invalid webhooks
      res.status(200).json({ received: true, processed: false, message: result.message });
      return;
    }

    res.status(200).json({ received: true, processed: true, message: result.message });
  } catch (error) {
    console.error('Webhook error:', error);
    // Return 200 to prevent infinite retries
    res.status(200).json({ 
      received: true, 
      processed: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

export default router;

