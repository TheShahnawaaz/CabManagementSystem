import { Router } from 'express';
import {
  getAllUsers,
  getUserStats,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleAdminStatus,
} from '../controllers/user.controller';
import { authenticateUser, requireAdmin } from '../middleware/auth.middleware';
import {
  validateUserCreation,
  validateUserUpdate,
  validateUUID,
} from '../middleware/validation.middleware';

const router = Router();

/**
 * User Management Routes (Admin Only)
 * 
 * These routes allow administrators to manage all users in the system.
 * All routes require authentication and admin privileges.
 */

// ====================================
// ADMIN ROUTES (Protected)
// ====================================

/**
 * @route   GET /api/admin/users
 * @desc    Get all users with filters and pagination
 * @access  Admin only
 * @query   is_admin (boolean), search (string), sort (asc|desc), limit, offset
 */
router.get('/admin/users', authenticateUser, requireAdmin, getAllUsers);

/**
 * @route   GET /api/admin/users/stats
 * @desc    Get user statistics (totals independent of filters)
 * @access  Admin only
 */
router.get('/admin/users/stats', authenticateUser, requireAdmin, getUserStats);

/**
 * @route   GET /api/admin/users/:id
 * @desc    Get user by ID with booking history
 * @access  Admin only
 */
router.get(
  '/admin/users/:id',
  authenticateUser,
  requireAdmin,
  validateUUID,
  getUserById
);

/**
 * @route   POST /api/admin/users
 * @desc    Create a new user manually (admin only)
 * @access  Admin only
 */
router.post(
  '/admin/users',
  authenticateUser,
  requireAdmin,
  validateUserCreation,
  createUser
);

/**
 * @route   PUT /api/admin/users/:id
 * @desc    Update user information
 * @access  Admin only
 */
router.put(
  '/admin/users/:id',
  authenticateUser,
  requireAdmin,
  validateUUID,
  validateUserUpdate,
  updateUser
);

/**
 * @route   PATCH /api/admin/users/:id/admin-status
 * @desc    Toggle admin status for a user
 * @access  Admin only
 */
router.patch(
  '/admin/users/:id/admin-status',
  authenticateUser,
  requireAdmin,
  validateUUID,
  toggleAdminStatus
);

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete a user (only if no active bookings)
 * @access  Admin only
 */
router.delete(
  '/admin/users/:id',
  authenticateUser,
  requireAdmin,
  validateUUID,
  deleteUser
);

export default router;

