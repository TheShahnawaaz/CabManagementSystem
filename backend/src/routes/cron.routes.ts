/**
 * Cron Routes
 * 
 * Endpoints called by cron-job.org
 * Protected by CRON_SECRET header
 * 
 * Setup on cron-job.org:
 * 1. GET /health - Every 14 min (keep server alive) - defined in index.ts
 * 2. POST /api/cron/process-emails - Every 2 min (process email queue)
 */

import { Router } from 'express';
import { verifyCronSecret } from '../middleware/cron.middleware';
import { authenticateUser, requireAdmin } from '../middleware/auth.middleware';
import {
  processEmails,
  getEmailStats,
  cleanup,
  listTemplates,
  previewTemplate,
  sendTestEmail,
} from '../controllers/cron.controller';

const router = Router();

// ====================================
// CRON ENDPOINT (Called by cron-job.org)
// ====================================

router.post('/cron/process-emails', verifyCronSecret, processEmails);

// ====================================
// ADMIN ENDPOINTS
// ====================================

router.get('/admin/email-stats', authenticateUser, requireAdmin, getEmailStats);
router.post('/admin/email-cleanup', authenticateUser, requireAdmin, cleanup);
router.get('/admin/email-templates', authenticateUser, requireAdmin, listTemplates);
router.get('/admin/email-preview/:template', authenticateUser, requireAdmin, previewTemplate);
router.post('/admin/send-test-email', authenticateUser, requireAdmin, sendTestEmail);

export default router;
