/**
 * Resend Email Provider
 * 
 * Uses Resend.com API - requires custom domain for production
 * 
 * Environment Variables:
 * - RESEND_API_KEY (from resend.com dashboard)
 * - EMAIL_FROM (verified domain email)
 * 
 * To enable: Set EMAIL_PROVIDER=resend in .env
 */

import type { EmailProvider, EmailParams, EmailResult } from '../email';

export class ResendProvider implements EmailProvider {
  name = 'Resend';
  private resend: any;

  constructor() {
    try {
      const { Resend } = require('resend');
      this.resend = new Resend(process.env.RESEND_API_KEY);
      console.log('   API Key: ****' + (process.env.RESEND_API_KEY?.slice(-4) || 'NOT SET'));
    } catch (e) {
      console.error('⚠️ Resend package not installed. Run: npm install resend');
      this.resend = null;
    }
  }

  async send(params: EmailParams): Promise<EmailResult> {
    if (!this.resend) {
      return { success: false, error: 'Resend not initialized' };
    }

    try {
      const from = process.env.EMAIL_FROM || 'Friday Cab <onboarding@resend.dev>';
      
      const result = await this.resend.emails.send({
        from,
        to: params.to,
        subject: params.subject,
        html: params.html,
        reply_to: params.replyTo,
      });

      if (result.error) {
        console.error('❌ Resend error:', result.error);
        return { success: false, error: result.error.message };
      }

      console.log(`✅ Email sent: ${result.data?.id} → ${params.to}`);
      return { success: true, id: result.data?.id };
    } catch (error: any) {
      console.error('❌ Resend send error:', error.message);
      return { success: false, error: error.message };
    }
  }
}

