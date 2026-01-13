import { Router } from 'express';
import {
  runAllocation,
  getAllocation,
  submitAllocation,
  clearAllocation,
  notifyAllocatedUsers,
  getNotificationStatus,
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

/**
 * @route   POST /api/admin/trips/:tripId/allocation/notify
 * @desc    Send notifications to all allocated users (who haven't been notified)
 * @access  Admin only
 */
router.post(
  '/admin/trips/:tripId/allocation/notify',
  authenticateUser,
  requireAdmin,
  notifyAllocatedUsers
);

/**
 * @route   GET /api/admin/trips/:tripId/allocation/notification-status
 * @desc    Get notification status for a trip's allocations
 * @access  Admin only
 */
router.get(
  '/admin/trips/:tripId/allocation/notification-status',
  authenticateUser,
  requireAdmin,
  getNotificationStatus
);

export default router;

