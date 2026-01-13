/**
 * Console Email Provider
 * 
 * Development provider - logs emails to console instead of sending
 * Used when EMAIL_PROVIDER is not set or set to 'console'
 */

import type { EmailProvider, EmailParams, EmailResult } from '../email';

export class ConsoleProvider implements EmailProvider {
  name = 'Console (Development)';

  async send(params: EmailParams): Promise<EmailResult> {
    console.log('\n📧 ══════════════════════════════════════════════════════');
    console.log('   EMAIL (Development Mode - Not Actually Sent)');
    console.log('══════════════════════════════════════════════════════════');
    console.log(`   To:      ${params.to}`);
    console.log(`   Subject: ${params.subject}`);
    console.log(`   Reply:   ${params.replyTo || 'N/A'}`);
    console.log('──────────────────────────────────────────────────────────');
    console.log('   Body Preview:');
    console.log(`   ${params.html.replace(/<[^>]*>/g, '').substring(0, 200)}...`);
    console.log('══════════════════════════════════════════════════════════\n');

    return { success: true, id: `dev-${Date.now()}` };
  }
}

