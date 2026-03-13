/**
 * Notification Routes
 * 
 * User endpoints for managing in-app notifications
 * Admin endpoints for sending announcements and booking reminders
 */

import { Router } from 'express';
import { authenticateUser, requireAdmin } from '../middleware/auth.middleware';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  sendAnnouncement,
  sendBookingReminder,
} from '../controllers/notification.controller';

const router = Router();

// ====================================
// USER ENDPOINTS
// ====================================

router.get('/notifications', authenticateUser, getNotifications);
router.get('/notifications/unread-count', authenticateUser, getUnreadCount);
router.patch('/notifications/:id/read', authenticateUser, markAsRead);
router.patch('/notifications/read-all', authenticateUser, markAllAsRead);
router.delete('/notifications/:id', authenticateUser, deleteNotification);

// ====================================
// ADMIN ENDPOINTS
// ====================================

router.post('/admin/notifications/send-announcement', authenticateUser, requireAdmin, sendAnnouncement);
router.post('/admin/notifications/send-booking-reminder', authenticateUser, requireAdmin, sendBookingReminder);

export default router;

