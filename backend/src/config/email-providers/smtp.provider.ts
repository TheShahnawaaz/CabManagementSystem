/**
 * SMTP Email Provider
 * 
 * Works with Gmail, Outlook, or any SMTP server
 * 
 * Environment Variables:
 * - SMTP_HOST (default: smtp.gmail.com)
 * - SMTP_PORT (default: 587)
 * - SMTP_USER (your email)
 * - SMTP_PASS (app password)
 * - EMAIL_FROM (optional, defaults to SMTP_USER)
 */

import nodemailer from 'nodemailer';
import type { EmailProvider, EmailParams, EmailResult } from '../email';

export class SmtpProvider implements EmailProvider {
  name = 'SMTP';
  private transporter: nodemailer.Transporter;

  constructor() {
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = parseInt(process.env.SMTP_PORT || '587');
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!user || !pass) {
      console.warn('⚠️ SMTP_USER and SMTP_PASS not set. Emails will fail.');
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for 465, false for other ports
      auth: {
        user,
        pass,
      },
    });

    console.log(`   Host: ${host}:${port}`);
    console.log(`   User: ${user || 'NOT SET'}`);
  }

  async send(params: EmailParams): Promise<EmailResult> {
    try {
      const from = process.env.EMAIL_FROM || process.env.SMTP_USER;
      
      const result = await this.transporter.sendMail({
        from,
        to: params.to,
        subject: params.subject,
        html: params.html,
        replyTo: params.replyTo,
      });

      console.log(`✅ Email sent: ${result.messageId} → ${params.to}`);
      return { success: true, id: result.messageId };
    } catch (error: any) {
      console.error('❌ SMTP send error:', error.message);
      return { success: false, error: error.message };
    }
  }
}

