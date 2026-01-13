/**
 * Cron Controller
 * 
 * Handles cron job endpoints for background tasks
 */

import { Request, Response } from 'express';
import { processEmailQueue, getEmailQueueStats, cleanupOldEmails } from '../services/email-queue.service';
import { renderEmailTemplate, getEmailSubject, EmailTemplate } from '../services/email-template.service';
import { sendEmail } from '../config/email';

// ====================================
// SAMPLE DATA FOR EMAIL TEMPLATES
// ====================================

const sampleData: Record<EmailTemplate, any> = {
  booking_confirmed: {
    userName: 'John Doe',
    tripTitle: 'Friday Jummah Trip',
    tripDate: 'Friday, January 17, 2026',
    tripTime: '12:30 PM',
    hall: 'RK Hall',
    amount: 50,
    bookingId: 'BK-12345',
  },
  cab_allocated: {
    userName: 'John Doe',
    tripTitle: 'Friday Jummah Trip',
    tripDate: 'Friday, January 17, 2026',
    tripTime: '12:30 PM',
    cabNumber: 'WB-01-X-1234',
    pickupRegion: 'RK/RP/Azad',
    hall: 'RK Hall',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://fridaycab.com/driver-scan?id=test-allocation-123',
  },
  journey_pickup: {
    userName: 'John Doe',
    tripTitle: 'Friday Jummah Trip',
    cabNumber: 'WB-01-X-1234',
  },
  journey_return: {
    userName: 'John Doe',
    tripTitle: 'Friday Jummah Trip',
    cabNumber: 'WB-01-X-1234',
  },
  admin_announcement: {
    userName: 'John Doe',
    subject: 'Important Update',
    message: 'We have updated our pickup timing for this Friday. Please check the app for the new schedule.\n\nThank you for your cooperation!',
    actionUrl: 'https://fridaycab.com/bookings',
  },
};

// ====================================
// CRON HANDLERS
// ====================================

/**
 * Process pending emails from queue
 */
export const processEmails = async (req: Request, res: Response) => {
  const startTime = Date.now();
  
  try {
    console.log('📧 [CRON] Processing email queue...');
    
    const result = await processEmailQueue(); // Uses default (25)
    const duration = Date.now() - startTime;
    
    console.log(`📧 [CRON] Complete: ${result.processed} sent, ${result.failed} failed, ${result.remaining} remaining (${duration}ms)`);
    
    res.json({
      success: true,
      message: `Processed ${result.processed} emails`,
      data: { ...result, duration_ms: duration },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('❌ [CRON] Email processing failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Get email queue statistics
 */
export const getEmailStats = async (req: Request, res: Response) => {
  try {
    const stats = await getEmailQueueStats();
    
    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Cleanup old emails and notifications
 */
export const cleanup = async (req: Request, res: Response) => {
  try {
    console.log('🧹 [CRON] Running cleanup...');
    
    const emailsDeleted = await cleanupOldEmails(7);
    
    console.log(`🧹 [CRON] Cleanup complete: ${emailsDeleted} old emails deleted`);
    
    res.json({
      success: true,
      message: 'Cleanup complete',
      data: { emails_deleted: emailsDeleted },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('❌ [CRON] Cleanup failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// ====================================
// TEST HANDLERS
// ====================================

/**
 * List all available email templates
 */
export const listTemplates = (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Available email templates',
    templates: Object.keys(sampleData),
    usage: {
      preview: 'GET /api/test/email-preview/:template?secret=YOUR_SECRET',
      send: 'POST /api/test/send-email',
    },
  });
};

/**
 * Preview an email template (returns HTML)
 */
export const previewTemplate = async (req: Request, res: Response) => {
  try {
    const template = req.params.template as EmailTemplate;
    
    if (!sampleData[template]) {
      return res.status(400).json({
        success: false,
        error: `Unknown template: ${template}`,
        available: Object.keys(sampleData),
      });
    }
    
    const html = await renderEmailTemplate(template, sampleData[template]);
    
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Test email sending with any template
 */
export const sendTestEmail = async (req: Request, res: Response) => {
  try {
    const { to, template, customData } = req.body;

    if (!to) {
      return res.status(400).json({
        success: false,
        error: 'Email "to" address is required',
        example: {
          to: 'your-email@gmail.com',
          template: 'booking_confirmed',
          customData: { userName: 'Custom Name' },
        },
        available_templates: Object.keys(sampleData),
      });
    }

    let html: string;
    let subject: string;

    if (template && sampleData[template as EmailTemplate]) {
      const data = { ...sampleData[template as EmailTemplate], ...customData };
      html = await renderEmailTemplate(template as EmailTemplate, data);
      subject = getEmailSubject(template as EmailTemplate, data);
    } else {
      html = `
        <div style="font-family: sans-serif; padding: 20px; background: #1a1a1a; color: #fff;">
          <h1 style="color: #10b981;">✅ Email Test Successful!</h1>
          <p>This is a test email from Friday Cab notification system.</p>
          <p style="color: #888;">If you received this, your email setup is working correctly!</p>
          <hr style="border-color: #333; margin: 20px 0;">
          <p style="font-size: 12px; color: #666;">Sent at: ${new Date().toISOString()}</p>
        </div>
      `;
      subject = '🧪 Test Email from Friday Cab';
    }

    const result = await sendEmail({ to, subject, html });

    res.json({
      success: result.success,
      message: result.success ? 'Test email sent!' : 'Failed to send email',
      data: {
        to,
        template: template || 'default',
        subject,
        email_id: result.id,
        error: result.error,
      },
    });
  } catch (error: any) {
    console.error('Test email error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
