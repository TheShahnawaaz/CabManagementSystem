/**
 * Report Routes
 * All routes for the reports module
 */

import { Router } from 'express';
import { authenticateUser, requireAdmin } from '../middleware/auth.middleware';
import {
  getReports,
  getReportsSummary,
  getTripsWithoutReport,
  getReport,
  getReportByTrip,
  createReport,
  updateReport,
  getReportHistory,
  addAdjustment,
  updateAdjustment,
  deleteAdjustment,
} from '../controllers/report.controller';

const router = Router();

// All routes require admin authentication
router.use(authenticateUser, requireAdmin);

// ====================================
// REPORT ROUTES
// ====================================

// GET /admin/reports - List all reports
router.get('/', getReports);

// GET /admin/reports/summary - Get aggregated summary
router.get('/summary', getReportsSummary);

// GET /admin/reports/pending-trips - Get trips without reports
router.get('/pending-trips', getTripsWithoutReport);

// GET /admin/reports/:id - Get single report with details
router.get('/:id', getReport);

// POST /admin/reports - Create new report
router.post('/', createReport);

// PATCH /admin/reports/:id - Update report
router.patch('/:id', updateReport);

// GET /admin/reports/:id/history - Get edit history
router.get('/:id/history', getReportHistory);

// ====================================
// ADJUSTMENT ROUTES
// ====================================

// POST /admin/reports/:id/adjustments - Add adjustment
router.post('/:id/adjustments', addAdjustment);

// PATCH /admin/reports/:id/adjustments/:adjustmentId - Update adjustment
router.patch('/:id/adjustments/:adjustmentId', updateAdjustment);

// DELETE /admin/reports/:id/adjustments/:adjustmentId - Delete adjustment
router.delete('/:id/adjustments/:adjustmentId', deleteAdjustment);

export default router;
