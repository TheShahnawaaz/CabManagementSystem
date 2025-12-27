import { Router } from 'express';
import {
  runAllocation,
  getAllocation,
  submitAllocation,
  clearAllocation,
} from '../controllers/allocation.controller';
import { authenticateUser, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

/**
 * Allocation Routes
 * All routes are admin-only
 */

/**
 * @route   POST /api/admin/trips/:tripId/allocation/run
 * @desc    Run allocation algorithm and return suggested cab assignments
 * @access  Admin only
 */
router.post(
  '/admin/trips/:tripId/allocation/run',
  authenticateUser,
  requireAdmin,
  runAllocation
);

/**
 * @route   GET /api/admin/trips/:tripId/allocation
 * @desc    Get existing allocation or demand summary
 * @access  Admin only
 */
router.get(
  '/admin/trips/:tripId/allocation',
  authenticateUser,
  requireAdmin,
  getAllocation
);

/**
 * @route   POST /api/admin/trips/:tripId/allocation
 * @desc    Submit final allocation (save to database)
 * @access  Admin only
 */
router.post(
  '/admin/trips/:tripId/allocation',
  authenticateUser,
  requireAdmin,
  submitAllocation
);

/**
 * @route   DELETE /api/admin/trips/:tripId/allocation
 * @desc    Clear all allocation data for a trip
 * @access  Admin only
 */
router.delete(
  '/admin/trips/:tripId/allocation',
  authenticateUser,
  requireAdmin,
  clearAllocation
);

export default router;

