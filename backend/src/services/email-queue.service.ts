/**
 * Email Queue Service
 * 
 * Processes pending emails from the email_queue table
 * Called by cron job every 2 minutes
 */

import pool from '../config/database';
import { sendEmail } from '../config/email';

// ====================================
// CONSTANTS
// ====================================

const MAX_RETRY_ATTEMPTS = 3;

// ====================================
// SEND SINGLE EMAIL WITH RETRIES
// ====================================

/**
 * Attempts to send a single email with immediate retries
 * Retries consecutively without any delay between attempts
 * 
 * @param email - Email record from database
 * @returns Result object with success status and final attempt count
 */
async function sendEmailWithRetry(email: any): Promise<{
  success: boolean;
  attempts: number;
  error?: string;
}> {
  let lastError = '';
  
  for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {
    try {
      const result = await sendEmail({
        to: email.to_email,
        subject: email.subject,
        html: email.body_html,
      });
      
      if (result.success) {
        console.log(`✅ Email sent: ${email.id} to ${email.to_email} (attempt ${attempt})`);
        return { success: true, attempts: attempt };
      }
      
      lastError = result.error || 'Unknown send error';
      console.warn(`⚠️ Email attempt ${attempt} failed: ${email.id} - ${lastError}`);
      
    } catch (error: any) {
      lastError = error.message || 'Unknown error';
      console.warn(`⚠️ Email attempt ${attempt} failed: ${email.id} - ${lastError}`);
    }
  }
  
  // All attempts exhausted
  console.error(`❌ Email failed after ${MAX_RETRY_ATTEMPTS} attempts: ${email.id}`);
  return { success: false, attempts: MAX_RETRY_ATTEMPTS, error: lastError };
}

// ====================================
// PROCESS EMAIL QUEUE
// ====================================

/**
 * Process pending emails in the queue
 * Called by cron endpoint
 * 
 * Optimized for serverless (Vercel) with:
 * - Configurable batch size via EMAIL_BATCH_SIZE env var
 * - Parallel sending for speed
 * - Configurable timeout via EMAIL_TIMEOUT env var
 * - Immediate retries (no backoff delay)
 * 
 * Environment Variables:
 * - EMAIL_BATCH_SIZE: Number of emails per batch (default: 25)
 * - EMAIL_TIMEOUT: Max execution time in ms (default: 25000)
 * 
 * @returns Number of emails processed successfully
 */
export async function processEmailQueue(): Promise<{
  processed: number;
  failed: number;
  remaining: number;
}> {
  const startTime = Date.now();
  const limit = parseInt(process.env.EMAIL_BATCH_SIZE || '25', 10);
  const MAX_EXECUTION_TIME = parseInt(process.env.EMAIL_TIMEOUT || '25000', 10);
  
  let processed = 0;
  let failed = 0;
  
  try {
    // 1. Grab pending emails (with locking to prevent duplicates)
    const result = await pool.query(`
      UPDATE email_queue
      SET status = 'sending'
      WHERE id IN (
        SELECT id FROM email_queue
        WHERE status = 'pending'
          AND scheduled_for <= NOW()
        ORDER BY priority ASC, scheduled_for ASC
        LIMIT $1
        FOR UPDATE SKIP LOCKED
      )
      RETURNING *
    `, [limit]);
    
    // 2. Send emails in parallel for speed
    const sendPromises = result.rows.map(async (email) => {
      // Check if we're running out of time
      if (Date.now() - startTime > MAX_EXECUTION_TIME) {
        console.log(`⏰ Timeout approaching, skipping email ${email.id}`);
        await pool.query(`
          UPDATE email_queue 
          SET status = 'pending'
          WHERE id = $1
        `, [email.id]);
        return { success: false, skipped: true };
      }
      
      // Send with immediate retries
      const sendResult = await sendEmailWithRetry(email);
      
      if (sendResult.success) {
        // Mark as sent
        await pool.query(`
          UPDATE email_queue 
          SET status = 'sent', 
              sent_at = NOW(),
              attempts = $1
          WHERE id = $2
        `, [sendResult.attempts, email.id]);
        return { success: true };
        
      } else {
        // Mark as failed after all retries exhausted
        await pool.query(`
          UPDATE email_queue 
          SET status = 'failed', 
              last_error = $1,
              attempts = $2
          WHERE id = $3
        `, [sendResult.error, sendResult.attempts, email.id]);
        return { success: false };
      }
    });
    
    // Wait for all emails to complete
    const results = await Promise.all(sendPromises);
    
    processed = results.filter(r => r.success).length;
    failed = results.filter(r => !r.success && !r.skipped).length;
    
    // 3. Get remaining count
    const remainingResult = await pool.query(`
      SELECT COUNT(*) FROM email_queue 
      WHERE status = 'pending' AND scheduled_for <= NOW()
    `);
    
    const remaining = parseInt(remainingResult.rows[0].count);
    
    return { processed, failed, remaining };
    
  } catch (error) {
    console.error('Error processing email queue:', error);
    throw error;
  }
}

// ====================================
// GET QUEUE STATS
// ====================================

/**
 * Get email queue statistics
 */
export async function getEmailQueueStats(): Promise<{
  pending: number;
  sending: number;
  sent: number;
  failed: number;
  total: number;
}> {
  const result = await pool.query(`
    SELECT 
      status,
      COUNT(*) as count
    FROM email_queue
    WHERE created_at > NOW() - INTERVAL '7 days'
    GROUP BY status
  `);
  
  const stats = {
    pending: 0,
    sending: 0,
    sent: 0,
    failed: 0,
    total: 0,
  };
  
  for (const row of result.rows) {
    const count = parseInt(row.count);
    stats[row.status as keyof typeof stats] = count;
    stats.total += count;
  }
  
  return stats;
}

// ====================================
// RETRY FAILED EMAILS
// ====================================

/**
 * Reset failed emails to pending for retry
 * Used for manual intervention
 */
export async function retryFailedEmails(emailIds?: number[]): Promise<number> {
  let query = `
    UPDATE email_queue 
    SET status = 'pending', 
        attempts = 0, 
        last_error = NULL,
        scheduled_for = NOW()
    WHERE status = 'failed'
  `;
  
  const params: any[] = [];
  
  if (emailIds && emailIds.length > 0) {
    query += ` AND id = ANY($1)`;
    params.push(emailIds);
  }
  
  query += ` RETURNING id`;
  
  const result = await pool.query(query, params);
  return result.rowCount || 0;
}

// ====================================
// CLEANUP OLD EMAILS
// ====================================

/**
 * Delete old sent emails to keep table size manageable
 */
export async function cleanupOldEmails(daysToKeep: number = 7): Promise<number> {
  const result = await pool.query(`
    DELETE FROM email_queue 
    WHERE status = 'sent' 
      AND sent_at < NOW() - INTERVAL '${daysToKeep} days'
    RETURNING id
  `);
  
  return result.rowCount || 0;
}
