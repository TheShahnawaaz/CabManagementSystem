import { Router } from 'express';
import { getMyBookings, getBookingById } from '../controllers/booking.controller';
import { authenticateUser } from '../middleware/auth.middleware';

const router = Router();

/**
 * Booking Routes
 * 
 * All routes require authentication
 * 
 * Note: Booking creation is handled via payment verification flow
 * (POST /api/payments/initiate → Razorpay → POST /api/payments/verify)
 */

// ====================================
// BOOKING ROUTES (Protected)
// ====================================

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
