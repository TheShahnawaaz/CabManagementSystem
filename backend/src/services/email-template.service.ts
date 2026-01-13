/**
 * Email Template Service
 * 
 * Re-exports React Email templates for use in other services
 * This file provides backward compatibility
 */

export {
  renderEmailTemplate,
  getEmailSubject,
  availableTemplates,
  type EmailTemplate,
  type TemplateData,
} from '../emails';
