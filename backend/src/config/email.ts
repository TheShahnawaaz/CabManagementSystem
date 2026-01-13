/**
 * Email Configuration
 * 
 * Extensible provider system - just change EMAIL_PROVIDER in .env
 * 
 * Supported providers:
 * - smtp (Gmail, Outlook, any SMTP server)
 * - resend (Resend.com API)
 * - console (Development - logs to console)
 * 
 * To add a new provider:
 * 1. Create a new file in providers/ folder
 * 2. Implement the EmailProvider interface
 * 3. Register in the providers object below
 */

import { SmtpProvider } from './email-providers/smtp.provider';
import { ConsoleProvider } from './email-providers/console.provider';
import { ResendProvider } from './email-providers/resend.provider';

// ====================================
// TYPES
// ====================================

export interface EmailParams {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

export interface EmailResult {
  success: boolean;
  id?: string;
  error?: string;
}

export interface EmailProvider {
  name: string;
  send(params: EmailParams): Promise<EmailResult>;
}

// ====================================
// PROVIDER REGISTRY
// ====================================

const providers: Record<string, () => EmailProvider> = {
  smtp: () => new SmtpProvider(),
  console: () => new ConsoleProvider(),
  resend: () => new ResendProvider(),
};

// ====================================
// ACTIVE PROVIDER
// ====================================

const providerName = process.env.EMAIL_PROVIDER || 'console';
const provider = providers[providerName]?.() || new ConsoleProvider();

console.log(`📧 Email provider: ${provider.name}`);

// ====================================
// EMAIL CONFIG
// ====================================

export const emailConfig = {
  provider: provider.name,
  from: process.env.EMAIL_FROM || process.env.SMTP_USER || 'Friday Cab <noreply@fridaycab.com>',
  replyTo: process.env.EMAIL_REPLY_TO || process.env.SMTP_USER,
};

// ====================================
// SEND EMAIL (Main Export)
// ====================================

export async function sendEmail(params: EmailParams): Promise<EmailResult> {
  return provider.send({
    ...params,
    replyTo: params.replyTo || emailConfig.replyTo,
  });
}

export default { sendEmail, emailConfig };
