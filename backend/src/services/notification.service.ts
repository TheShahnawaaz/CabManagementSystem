/**
 * Notification Service
 * 
 * Handles creating in-app notifications and queuing emails
 * Single entry point for all notification needs
 */

import pool from '../config/database';
import { renderEmailTemplate, getEmailSubject, TemplateData } from './email-template.service';
import {
  NotificationParams,
  BulkNotificationParams,
  NotificationResult,
  BulkNotificationResult,
  BookingConfirmedParams,
  CabAllocatedParams,
  JourneyLoggedParams,
  AdminAnnouncementParams,
} from '../types/notification.types';

// Re-export types for external use
export * from '../types/notification.types';

// ====================================
// SEND NOTIFICATION (Single User)
// ====================================

/**
 * Send notification to a single user
 * Creates in-app notification and optionally queues email
 */
export async function sendNotification(params: NotificationParams): Promise<NotificationResult> {
  const result: { notificationId?: string; emailQueued?: boolean } = {};
  
  try {
    // 1. Create in-app notification (always)
    const notifResult = await pool.query(`
      INSERT INTO notifications (
        user_id, title, body, icon, action_url,
        category, priority, reference_type, reference_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `, [
      params.userId,
      params.title,
      params.body,
      params.icon || 'bell',
      params.actionUrl || null,
      params.category,
      params.priority || 'normal',
      params.referenceType || null,
      params.referenceId || null,
    ]);
    
    result.notificationId = notifResult.rows[0].id;
    
    // 2. Queue email if requested
    if (params.sendEmail && params.emailTemplate && params.emailData) {
      // Get user email and check preference
      const userResult = await pool.query(
        'SELECT email, name, email_notifications FROM users WHERE id = $1',
        [params.userId]
      );
      
      if (userResult.rows.length > 0) {
        const user = userResult.rows[0];
        
        // Check if user wants email notifications
        if (user.email_notifications !== false) {
          const emailData: TemplateData = {
            ...params.emailData,
            userName: user.name,
            userEmail: user.email,
          };
          
          const subject = getEmailSubject(params.emailTemplate, emailData);
          const html = await renderEmailTemplate(params.emailTemplate, emailData);
          
          await pool.query(`
            INSERT INTO email_queue (
              user_id, to_email, to_name, subject, body_html,
              template, template_data, category, priority,
              reference_type, reference_id
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          `, [
            params.userId,
            user.email,
            user.name,
            subject,
            html,
            params.emailTemplate,
            JSON.stringify(emailData),
            params.category,
            params.emailPriority || 5,
            params.referenceType || null,
            params.referenceId || null,
          ]);
          
          result.emailQueued = true;
        }
      }
    }
    
    return result;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
}

// ====================================
// SEND BULK NOTIFICATION (Multiple Users)
// ====================================

/**
 * Send notification to multiple users
 * Used for admin announcements, trip updates, etc.
 */
export async function sendBulkNotification(params: BulkNotificationParams): Promise<BulkNotificationResult> {
  let notificationsSent = 0;
  let emailsQueued = 0;
  
  try {
    // Get all users with their email preferences
    const usersResult = await pool.query(`
      SELECT id, email, name, email_notifications 
      FROM users 
      WHERE id = ANY($1)
    `, [params.userIds]);
    
    for (const user of usersResult.rows) {
      // Create in-app notification
      await pool.query(`
        INSERT INTO notifications (
          user_id, title, body, icon, action_url, category, priority
        ) VALUES ($1, $2, $3, $4, $5, $6, 'normal')
      `, [
        user.id,
        params.title,
        params.body,
        params.icon || 'megaphone',
        params.actionUrl || null,
        params.category,
      ]);
      
      notificationsSent++;
      
      // Queue email if requested and user allows
      if (params.sendEmail && params.emailTemplate && user.email_notifications !== false) {
        const emailData: TemplateData = {
          ...params.emailData,
          userName: user.name,
          userEmail: user.email,
        };
        
        const subject = getEmailSubject(params.emailTemplate, emailData);
        const html = await renderEmailTemplate(params.emailTemplate, emailData);
        
        await pool.query(`
          INSERT INTO email_queue (
            user_id, to_email, to_name, subject, body_html,
            template, template_data, category, priority
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [
          user.id,
          user.email,
          user.name,
          subject,
          html,
          params.emailTemplate,
          JSON.stringify(emailData),
          params.category,
          7, // Lower priority for bulk sends
        ]);
        
        emailsQueued++;
      }
    }
    
    return { notificationsSent, emailsQueued };
  } catch (error) {
    console.error('Error sending bulk notification:', error);
    throw error;
  }
}

// ====================================
// HELPER: NOTIFY BOOKING CONFIRMED
// ====================================

export async function notifyBookingConfirmed(params: BookingConfirmedParams) {
  const frontendUrl = process.env.FRONTEND_URL || 'https://fridaycab.com';
  
  return sendNotification({
    userId: params.userId,
    title: 'Booking Confirmed! ✅',
    body: `Your booking for ${params.tripTitle} is confirmed.`,
    category: 'booking',
    icon: 'check-circle',
    actionUrl: `/bookings`,
    priority: 'high',
    referenceType: 'booking',
    referenceId: params.bookingId,
    sendEmail: true,
    emailTemplate: 'booking_confirmed',
    emailPriority: 2,
    emailData: {
      userName: '', // Will be filled by sendNotification
      tripTitle: params.tripTitle,
      tripDate: params.tripDate,
      tripTime: params.tripTime,
      hall: params.hall,
      amount: params.amount,
      bookingId: String(params.bookingId),
      actionUrl: `${frontendUrl}/bookings`,
    },
  });
}

// ====================================
// HELPER: NOTIFY CAB ALLOCATED
// ====================================

export async function notifyCabAllocated(params: CabAllocatedParams) {
  const frontendUrl = process.env.FRONTEND_URL || 'https://fridaycab.com';
  
  // Generate QR code URL using external API
  const scanUrl = `${frontendUrl}/driver-scan?id=${params.allocationId}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(scanUrl)}`;
  
  return sendNotification({
    userId: params.userId,
    title: 'Cab Assigned! 🚕',
    body: `You've been assigned to cab ${params.cabNumber} for ${params.tripTitle}.`,
    category: 'cab',
    icon: 'car',
    actionUrl: `/bookings`,
    priority: 'high',
    referenceType: 'cab',
    sendEmail: true,
    emailTemplate: 'cab_allocated',
    emailPriority: 2,
    emailData: {
      userName: '',
      tripTitle: params.tripTitle,
      tripDate: params.tripDate,
      tripTime: params.tripTime,
      cabNumber: params.cabNumber,
      pickupRegion: params.pickupRegion,
      hall: params.hall,
      qrCodeUrl,
      actionUrl: `${frontendUrl}/bookings`,
    },
  });
}

// ====================================
// HELPER: NOTIFY TRIP CANCELLED
// ====================================

// ====================================
// HELPER: NOTIFY JOURNEY LOGGED
// ====================================

export async function notifyJourneyLogged(params: JourneyLoggedParams) {
  const isPickup = params.journeyType === 'pickup';
  
  return sendNotification({
    userId: params.userId,
    title: isPickup ? 'Boarding Confirmed! 🚕' : 'Welcome Back! 🏠',
    body: isPickup 
      ? `You've boarded cab ${params.cabNumber} for ${params.tripTitle}.`
      : `Your return journey for ${params.tripTitle} is complete.`,
    category: 'journey',
    icon: isPickup ? 'log-in' : 'log-out',
    priority: 'normal',
    referenceType: 'journey',
    sendEmail: true,
    emailTemplate: isPickup ? 'journey_pickup' : 'journey_return',
    emailPriority: 3,
    emailData: {
      userName: '',
      tripTitle: params.tripTitle,
      cabNumber: params.cabNumber,
      journeyType: params.journeyType,
    },
  });
}

// ====================================
// HELPER: SEND TRIP REMINDER (Admin)
// ====================================

// ====================================
// HELPER: SEND ADMIN ANNOUNCEMENT
// ====================================

export async function sendAdminAnnouncement(params: AdminAnnouncementParams) {
  return sendBulkNotification({
    userIds: params.userIds,
    title: params.subject,
    body: params.message.substring(0, 200) + (params.message.length > 200 ? '...' : ''),
    category: 'admin',
    icon: 'megaphone',
    actionUrl: params.actionUrl,
    sendEmail: true,
    emailTemplate: 'admin_announcement',
    emailData: {
      userName: '',
      subject: params.subject,
      message: params.message,
      actionUrl: params.actionUrl,
    },
  });
}

