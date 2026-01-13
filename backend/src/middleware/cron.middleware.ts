import { Request, Response, NextFunction } from 'express';

/**
 * Verify cron secret to protect endpoints
 * Accepts secret via header or query param
 */
export const verifyCronSecret = (req: Request, res: Response, next: NextFunction) => {
  const secret = req.headers['x-cron-secret'] || req.query.secret;
  const cronSecret = process.env.CRON_SECRET;
  
  // In development, allow without secret
  if (process.env.NODE_ENV !== 'production' && !cronSecret) {
    console.log('⚠️ CRON_SECRET not set, allowing request in development');
    return next();
  }
  
  if (!cronSecret) {
    console.error('❌ CRON_SECRET environment variable not set');
    return res.status(500).json({ error: 'Server misconfiguration' });
  }
  
  if (secret !== cronSecret) {
    console.warn('⚠️ Invalid cron secret attempt');
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  next();
};
