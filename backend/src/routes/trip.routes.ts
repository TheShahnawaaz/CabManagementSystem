import { Router } from 'express';
import {
  createTrip,
  getAllTrips,
  getTripById,
  updateTrip,
  deleteTrip,
  getActiveTrips,
  getUpcomingTrips,
  getTripDemand,
} from '../controllers/trip.controller';
import { authenticateUser, requireAdmin } from '../middleware/auth.middleware';
import {
  validateTripData,
  validateTripUpdate,
  validateUUID,
} from '../middleware/validation.middleware';

const router = Router();

/**
 * Trip Routes
 * 
 * Admin Routes: Protected by both authenticateUser and requireAdmin
 * Public Routes: No authentication required (for students to view)
 */

// ====================================
// ADMIN ROUTES (Protected)
// ====================================

/**
 * @route   POST /api/admin/trips
 * @desc    Create a new trip
 * @access  Admin only
 */
router.post(
  '/admin/trips',
  authenticateUser,
  requireAdmin,
  validateTripData,
  createTrip
);

/**
 * @route   GET /api/admin/trips
 * @desc    Get all trips with filters
 * @access  Admin only
 * @query   status (upcoming|past|active), sort (asc|desc), limit, offset
 */
router.get('/admin/trips', authenticateUser, requireAdmin, getAllTrips);

/**
 * @route   GET /api/admin/trips/:id
 * @desc    Get trip by ID with detailed stats
 * @access  Admin only
 */
router.get(
  '/admin/trips/:id',
  authenticateUser,
  requireAdmin,
  validateUUID,
  getTripById
);

/**
 * @route   PUT /api/admin/trips/:id
 * @desc    Update a trip
 * @access  Admin only
 */
router.put(
  '/admin/trips/:id',
  authenticateUser,
  requireAdmin,
  validateUUID,
  validateTripUpdate,
  updateTrip
);

/**
 * @route   DELETE /api/admin/trips/:id
 * @desc    Delete a trip (only if no bookings exist)
 * @access  Admin only
 */
router.delete(
  '/admin/trips/:id',
  authenticateUser,
  requireAdmin,
  validateUUID,
  deleteTrip
);

/**
 * @route   GET /api/admin/trips/:tripId/demand
 * @desc    Get hall-wise student demand for a trip
 * @access  Admin only
 */
router.get(
  '/admin/trips/:tripId/demand',
  authenticateUser,
  requireAdmin,
  getTripDemand
);

// ====================================
// PUBLIC ROUTES (Student View)
// ====================================

/**
 * @route   GET /api/trips/active
 * @desc    Get currently active trips (booking window open)
 * @access  Public
 */
router.get('/trips/active', getActiveTrips);

/**
 * @route   GET /api/trips/upcoming
 * @desc    Get upcoming trips
 * @access  Public
 */
router.get('/trips/upcoming', getUpcomingTrips);

/**
 * @route   GET /api/trips/:id
 * @desc    Get trip details by ID (public view)
 * @access  Public
 */
router.get('/trips/:id', validateUUID, getTripById);

export default router;

