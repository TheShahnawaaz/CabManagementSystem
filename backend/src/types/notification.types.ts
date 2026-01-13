/**
 * Notification Types
 * 
 * Type definitions for the notification system
 */

import { EmailTemplate, TemplateData } from '../emails';

// ====================================
// ENUMS / UNION TYPES
// ====================================

/** Notification categories for organizing notifications */
export type NotificationCategory = 'booking' | 'payment' | 'trip' | 'cab' | 'admin' | 'journey';

/** Priority levels for notifications */
export type NotificationPriority = 'low' | 'normal' | 'high' | 'critical';

/** Reference types for linking notifications to entities */
export type ReferenceType = 'booking' | 'trip' | 'payment' | 'cab' | 'journey';

// ====================================
// NOTIFICATION PARAMS
// ====================================

/** Parameters for sending a single notification */
export interface NotificationParams {
  userId: string | number;
  title: string;
  body: string;
  category: NotificationCategory;
  icon?: string;
  actionUrl?: string;
  priority?: NotificationPriority;
  referenceType?: ReferenceType;
  referenceId?: string | number;
  // Email options
  sendEmail?: boolean;
  emailTemplate?: EmailTemplate;
  emailData?: TemplateData;
  emailPriority?: number; // 1-10, lower = higher priority
}

/** Parameters for sending bulk notifications */
export interface BulkNotificationParams {
  userIds: (string | number)[];
  title: string;
  body: string;
  category: NotificationCategory;
  icon?: string;
  actionUrl?: string;
  // Email options
  sendEmail?: boolean;
  emailTemplate?: EmailTemplate;
  emailData?: Omit<TemplateData, 'userName' | 'userEmail'>;
}

// ====================================
// NOTIFICATION RESULTS
// ====================================

/** Result of sending a notification */
export interface NotificationResult {
  notificationId?: string;
  emailQueued?: boolean;
}

/** Result of sending bulk notifications */
export interface BulkNotificationResult {
  notificationsSent: number;
  emailsQueued: number;
}

// ====================================
// HELPER FUNCTION PARAMS
// ====================================

/** Parameters for booking confirmation notification */
export interface BookingConfirmedParams {
  userId: string | number;
  bookingId: string | number;
  tripTitle: string;
  tripDate: string;
  tripTime?: string;
  hall: string;
  amount: number;
}

/** Parameters for cab allocation notification */
export interface CabAllocatedParams {
  userId: string | number;
  tripTitle: string;
  tripDate: string;
  departureTime?: string;
  cabNumber: string;
  pickupRegion: string;
  hall?: string;
  allocationId: string;
}

/** Parameters for journey logged notification */
export interface JourneyLoggedParams {
  userId: string | number;
  tripTitle: string;
  cabNumber: string;
  journeyType: 'pickup' | 'return';
}

/** Parameters for admin announcement */
export interface AdminAnnouncementParams {
  userIds: (string | number)[];
  subject: string;
  message: string;
  actionUrl?: string;
}
