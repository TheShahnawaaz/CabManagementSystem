/**
 * Webhook Middleware
 * 
 * Middleware for handling webhook requests that require raw body
 * for signature verification.
 * 
 * Usage:
 * Apply this BEFORE express.json() middleware for webhook routes.
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Capture raw body for webhook signature verification
 * 
 * This middleware captures the raw request body before JSON parsing
 * and stores it on req.rawBody for later use in webhook handlers.
 * 
 * @param req - Express request
 * @param res - Express response
 * @param next - Next middleware
 */
export const captureRawBody = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  let data = '';
  
  req.on('data', (chunk) => {
    data += chunk;
  });
  
  req.on('end', () => {
    (req as any).rawBody = data;
    next();
  });
};

/**
 * Verify webhook signature header exists
 * 
 * Quick validation before processing webhook.
 */
export const requireWebhookSignature = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const signature = req.headers['x-razorpay-signature'];
  
  if (!signature) {
    res.status(401).json({ 
      success: false, 
      error: 'Missing webhook signature' 
    });
    return;
  }
  
  next();
};

/**
 * Rate limiting for webhooks
 * 
 * Prevents webhook flooding attacks.
 * Uses in-memory store (consider Redis for multi-instance).
 */
const webhookRateLimit = new Map<string, { count: number; resetTime: number }>();

export const webhookRateLimiter = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  const maxRequests = 100; // Max 100 webhooks per minute per IP

  const record = webhookRateLimit.get(ip);

  if (!record || now > record.resetTime) {
    webhookRateLimit.set(ip, { count: 1, resetTime: now + windowMs });
    next();
    return;
  }

  if (record.count >= maxRequests) {
    console.warn(`Webhook rate limit exceeded for IP: ${ip}`);
    res.status(429).json({ 
      success: false, 
      error: 'Too many requests' 
    });
    return;
  }

  record.count++;
  next();
};

/**
 * Clean up old rate limit entries periodically
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of webhookRateLimit.entries()) {
    if (now > value.resetTime) {
      webhookRateLimit.delete(key);
    }
  }
}, 60000); // Clean up every minute

