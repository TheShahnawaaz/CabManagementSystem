/**
 * Email Queue Service
 * 
 * Processes pending emails from the email_queue table
 * Called by cron job every 2 minutes
 */

import pool from '../config/database';
import { sendEmail } from '../config/email';

// ====================================
// PROCESS EMAIL QUEUE
// ====================================

/**
 * Process pending emails in the queue
 * Called by cron endpoint
 * 
 * Optimized for serverless (Vercel) with:
 * - Small batch size (5 emails max)
 * - Parallel sending for speed
 * - 8-second timeout to stay within Vercel limits
 * 
 * @param limit - Maximum emails to process per run (default 5)
 * @returns Number of emails processed successfully
 */
export async function processEmailQueue(limit: number = 10): Promise<{
  processed: number;
  failed: number;
  remaining: number;
}> {
  const startTime = Date.now();
  const MAX_EXECUTION_TIME = 20000; // 8 seconds max (Vercel free tier = 10s)
  
  let processed = 0;
  let failed = 0;
  
  try {
    // 1. Grab pending emails (with locking to prevent duplicates)
    const result = await pool.query(`
      UPDATE email_queue
      SET status = 'sending', attempts = attempts + 1
      WHERE id IN (
        SELECT id FROM email_queue
        WHERE status = 'pending'
          AND scheduled_for <= NOW()
          AND attempts < max_attempts
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
        // Reset to pending for next run
        await pool.query(`
          UPDATE email_queue 
          SET status = 'pending', attempts = attempts - 1
          WHERE id = $1
        `, [email.id]);
        return { success: false, skipped: true };
      }
      
      try {
        const sendResult = await sendEmail({
          to: email.to_email,
          subject: email.subject,
          html: email.body_html,
        });
        
        if (sendResult.success) {
          await pool.query(`
            UPDATE email_queue 
            SET status = 'sent', sent_at = NOW() 
            WHERE id = $1
          `, [email.id]);
          console.log(`✅ Email sent: ${email.id} to ${email.to_email}`);
          return { success: true };
        } else {
          throw new Error(sendResult.error || 'Unknown send error');
        }
        
      } catch (error: any) {
        console.error(`❌ Email failed: ${email.id}`, error.message);
        
        const newStatus = email.attempts >= email.max_attempts ? 'failed' : 'pending';
        const backoffMinutes = Math.min(5 * Math.pow(2, email.attempts - 1), 30);
        
        await pool.query(`
          UPDATE email_queue 
          SET status = $1, 
              last_error = $2,
              scheduled_for = NOW() + INTERVAL '${backoffMinutes} minutes'
          WHERE id = $3
        `, [newStatus, error.message, email.id]);
        
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



