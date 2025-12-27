import { Router } from 'express';
import {
  createBooking,
  getMyBookings,
  getBookingById,
} from '../controllers/booking.controller';
import { authenticateUser } from '../middleware/auth.middleware';
import { validateBooking } from '../middleware/validation.middleware';

const router = Router();

/**
 * Booking Routes
 * 
 * All routes require authentication (student or admin)
 * Handles booking creation and viewing
 */

// ====================================
// BOOKING ROUTES (Protected)
// ====================================

/**
 * @route   POST /api/bookings
 * @desc    Create a new booking (mock payment)
 * @access  Authenticated users only
 * @body    { trip_id: UUID, hall: string }
 */
router.post(
  '/bookings',
  authenticateUser,
  validateBooking,
  createBooking
);

/**
 * @route   GET /api/bookings
 * @desc    Get current user's bookings
 * @access  Authenticated users only
 * @query   status (upcoming|past|active)
 */
router.get('/bookings', authenticateUser, getMyBookings);

/**
 * @route   GET /api/bookings/:id
 * @desc    Get booking details by ID
 * @access  Authenticated users only (must own the booking)
 */
router.get('/bookings/:id', authenticateUser, getBookingById);

export default router;

