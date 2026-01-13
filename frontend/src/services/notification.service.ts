/**
 * Notification Service
 * 
 * API calls for notifications
 */

import { apiClient } from '@/lib/api';
import type { AppNotification } from '@/types';

/**
 * Get user's notifications
 */
export async function getNotifications(params?: {
  limit?: number;
  offset?: number;
  unread?: boolean;
}): Promise<AppNotification[]> {
  const searchParams = new URLSearchParams();
  
  if (params?.limit) searchParams.set('limit', String(params.limit));
  if (params?.offset) searchParams.set('offset', String(params.offset));
  if (params?.unread) searchParams.set('unread', 'true');
  
  const query = searchParams.toString();
  const url = `/notifications${query ? `?${query}` : ''}`;
  
  const response = await apiClient.get(url);
  return response.data;
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(): Promise<number> {
  const response = await apiClient.get('/notifications/unread-count');
  return response.count;
}

/**
 * Mark a notification as read
 */
export async function markAsRead(notificationId: string): Promise<void> {
  await apiClient.patch(`/notifications/${notificationId}/read`);
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead(): Promise<number> {
  const response = await apiClient.patch('/notifications/read-all');
  return response.count || 0;
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string): Promise<void> {
  await apiClient.delete(`/notifications/${notificationId}`);
}

/**
 * Send announcement (Admin only)
 */
export async function sendAnnouncement(params: {
  subject: string;
  message: string;
  targetType: 'all' | 'trip';
  tripId?: string;
  actionUrl?: string;
}): Promise<{
  notifications_sent: number;
  emails_queued: number;
}> {
  const response = await apiClient.post('/admin/notifications/send-announcement', params);
  return response.data;
}
