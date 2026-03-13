/**
 * Notification Controller
 * 
 * Handles user notifications and admin announcements
 */

import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';
import { sendAdminAnnouncement, notifyBookingReminder } from '../services/notification.service';

// ====================================
// USER: GET NOTIFICATIONS
// ====================================

export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { limit = '20', offset = '0', unread } = req.query;
    
    let query = `
      SELECT id, title, body, icon, action_url, category, priority,
             reference_type, reference_id, read_at, created_at
      FROM notifications
      WHERE user_id = $1 AND archived_at IS NULL
    `;
    
    const params: any[] = [userId];
    let paramIndex = 2;
    
    if (unread === 'true') {
      query += ` AND read_at IS NULL`;
    }
    
    query += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
    params.push(parseInt(limit as string), parseInt(offset as string));
    
    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch notifications',
    });
  }
};

// ====================================
// USER: GET UNREAD COUNT
// ====================================

export const getUnreadCount = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    const result = await pool.query(`
      SELECT COUNT(*) as count
      FROM notifications
      WHERE user_id = $1 AND read_at IS NULL AND archived_at IS NULL
    `, [userId]);
    
    res.json({
      success: true,
      count: parseInt(result.rows[0].count),
    });
  } catch (error: any) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch unread count',
    });
  }
};

// ====================================
// USER: MARK AS READ
// ====================================

export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    
    const result = await pool.query(`
      UPDATE notifications
      SET read_at = NOW()
      WHERE id = $1 AND user_id = $2 AND read_at IS NULL
      RETURNING id
    `, [id, userId]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found or already read',
      });
    }
    
    res.json({
      success: true,
      message: 'Notification marked as read',
    });
  } catch (error: any) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark notification as read',
    });
  }
};

// ====================================
// USER: MARK ALL AS READ
// ====================================

export const markAllAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    const result = await pool.query(`
      UPDATE notifications
      SET read_at = NOW()
      WHERE user_id = $1 AND read_at IS NULL
      RETURNING id
    `, [userId]);
    
    res.json({
      success: true,
      message: `Marked ${result.rowCount} notifications as read`,
      count: result.rowCount,
    });
  } catch (error: any) {
    console.error('Error marking all as read:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark notifications as read',
    });
  }
};

// ====================================
// USER: DELETE (ARCHIVE) NOTIFICATION
// ====================================

export const deleteNotification = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    
    const result = await pool.query(`
      UPDATE notifications
      SET archived_at = NOW()
      WHERE id = $1 AND user_id = $2 AND archived_at IS NULL
      RETURNING id
    `, [id, userId]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found',
      });
    }
    
    res.json({
      success: true,
      message: 'Notification deleted',
    });
  } catch (error: any) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete notification',
    });
  }
};

// ====================================
// ADMIN: SEND ANNOUNCEMENT
// ====================================

export const sendAnnouncement = async (req: AuthRequest, res: Response) => {
  try {
    const { subject, message, targetType, tripId, actionUrl } = req.body;
    
    if (!subject || !message || !targetType) {
      return res.status(400).json({
        success: false,
        error: 'subject, message, and targetType are required',
      });
    }
    
    let userIds: string[] = [];
    
    if (targetType === 'all') {
      // Get all users
      const usersResult = await pool.query('SELECT id FROM users');
      userIds = usersResult.rows.map((r: any) => r.id);
    } else if (targetType === 'trip') {
      if (!tripId) {
        return res.status(400).json({
          success: false,
          error: 'tripId is required when targetType is trip',
        });
      }
      
      // Get users booked for this trip
      const usersResult = await pool.query(`
        SELECT DISTINCT user_id FROM trip_users WHERE trip_id = $1
      `, [tripId]);
      userIds = usersResult.rows.map((r: any) => r.user_id);
    } else {
      return res.status(400).json({
        success: false,
        error: 'Invalid targetType. Must be "all" or "trip"',
      });
    }
    
    if (userIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No users found for the specified target',
      });
    }
    
    const result = await sendAdminAnnouncement({
      userIds,
      subject,
      message,
      actionUrl,
    });
    
    res.json({
      success: true,
      message: `Announcement sent to ${result.notificationsSent} users`,
      data: {
        notifications_sent: result.notificationsSent,
        emails_queued: result.emailsQueued,
      },
    });
  } catch (error: any) {
    console.error('Error sending announcement:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send announcement',
      details: error.message,
    });
  }
};

// ====================================
// ADMIN: SEND BOOKING REMINDER
// ====================================

export const sendBookingReminder = async (req: AuthRequest, res: Response) => {
  try {
    const { tripId, reminderType } = req.body;
    
    if (!tripId || !reminderType) {
      return res.status(400).json({
        success: false,
        error: 'tripId and reminderType are required',
      });
    }
    
    if (!['reminder', 'final_reminder'].includes(reminderType)) {
      return res.status(400).json({
        success: false,
        error: 'reminderType must be "reminder" or "final_reminder"',
      });
    }
    
    // Verify trip exists and booking is currently open
    const tripResult = await pool.query(
      'SELECT id, trip_title, trip_date, departure_time, booking_start_time, booking_end_time, amount_per_person FROM trips WHERE id = $1',
      [tripId]
    );
    
    if (tripResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Trip not found',
      });
    }
    
    const trip = tripResult.rows[0];
    const now = new Date();
    const bookingStart = new Date(trip.booking_start_time);
    const bookingEnd = new Date(trip.booking_end_time);
    
    if (now < bookingStart || now > bookingEnd) {
      return res.status(400).json({
        success: false,
        error: 'Booking window is not currently open for this trip',
      });
    }
    
    // Get ALL registered user emails
    const usersResult = await pool.query('SELECT email FROM users WHERE email_notifications != false');
    const allEmails = usersResult.rows.map((r: any) => r.email).filter(Boolean);
    
    if (allEmails.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No users found to send reminder to',
      });
    }
    
    // Format trip details for the template
    const isFinalReminder = reminderType === 'final_reminder';
    
    const tripDate = new Date(trip.trip_date).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    
    const departureTime = trip.departure_time
      ? new Date(trip.departure_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      : undefined;
    
    const bookingDeadline = trip.booking_end_time
      ? new Date(trip.booking_end_time).toLocaleString('en-IN', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : undefined;
    
    // Send via notification service
    const result = await notifyBookingReminder({
      recipients: allEmails,
      tripTitle: trip.trip_title,
      tripDate,
      departureTime,
      amount: trip.amount_per_person,
      bookingDeadline,
      isFinalReminder,
    });
    
    const typeLabel = isFinalReminder ? 'Final reminder' : 'Reminder';
    
    res.json({
      success: true,
      message: `${typeLabel} queued for ${result.emailsSent} users`,
      data: {
        notifications_sent: 0,
        emails_queued: result.emailsSent,
      },
    });
  } catch (error: any) {
    console.error('Error sending booking reminder:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send booking reminder',
      details: error.message,
    });
  }
};


