/**
 * React Email - Main Export
 * 
 * Renders React Email templates to HTML strings
 */

import * as React from 'react';
import { render } from '@react-email/components';
import {
  BookingConfirmed,
  CabAllocated,
  JourneyPickup,
  JourneyReturn,
  AdminAnnouncement,
  BookingReminder,
} from './templates';

// ====================================
// TYPES
// ====================================

export type EmailTemplate =
  | 'booking_confirmed'
  | 'cab_allocated'
  | 'journey_pickup'
  | 'journey_return'
  | 'admin_announcement'
  | 'booking_reminder';

export interface TemplateData {
  userName?: string;
  userEmail?: string;
  tripTitle?: string;
  tripDate?: string;
  tripTime?: string;
  departureTime?: string;
  boardedAt?: string;   // For JourneyPickup and JourneyReturn - when student boarded
  hall?: string;
  amount?: number;
  bookingId?: string;
  cabNumber?: string;
  driverName?: string;
  driverPhone?: string;
  pickupRegion?: string;
  qrCodeUrl?: string;
  journeyType?: 'pickup' | 'return';
  message?: string;
  subject?: string;
  actionUrl?: string;
  [key: string]: any;
}

// ====================================
// TEMPLATE COMPONENTS MAP
// ====================================

const templates: Record<EmailTemplate, React.FC<any>> = {
  booking_confirmed: BookingConfirmed,
  cab_allocated: CabAllocated,
  journey_pickup: JourneyPickup,
  journey_return: JourneyReturn,
  admin_announcement: AdminAnnouncement,
  booking_reminder: BookingReminder,
};

// ====================================
// RENDER FUNCTION
// ====================================

/**
 * Render a React Email template to HTML string (async)
 */
export async function renderEmailTemplate(template: EmailTemplate, data: TemplateData): Promise<string> {
  const Component = templates[template];

  if (!Component) {
    throw new Error(`Unknown email template: ${template}`);
  }

  // Create React element and render to HTML
  const element = React.createElement(Component, data);
  return await render(element);
}

// ====================================
// SUBJECT GENERATOR
// ====================================

/**
 * Get email subject for a template
 */
export function getEmailSubject(template: EmailTemplate, data: TemplateData): string {
  switch (template) {
    case 'booking_confirmed':
      return `✅ Booking Confirmed - ${data.tripTitle}`;
    case 'cab_allocated':
      return `🚕 Cab Assigned - ${data.tripTitle}`;
    case 'journey_pickup':
      return `✓ Boarding Confirmed - ${data.tripTitle}`;
    case 'journey_return':
      return `✓ Journey Completed - ${data.tripTitle}`;
    case 'admin_announcement':
      return `📢 ${data.subject || 'Important Update from Friday Cab'}`;
    case 'booking_reminder':
      return data.isFinalReminder
        ? `⏰ Last Chance to Book - ${data.tripTitle}`
        : `🔔 Booking Open - ${data.tripTitle}`;
    default:
      return 'Friday Cab Notification';
  }
}

// ====================================
// AVAILABLE TEMPLATES LIST
// ====================================

export const availableTemplates = Object.keys(templates) as EmailTemplate[];
