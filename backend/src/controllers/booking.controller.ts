import { Request, Response } from 'express';
import pool from '../config/database';

/**
 * Booking Controller
 * 
 * Handles student booking operations:
 * - Create booking with payment
 * - Get user's bookings
 * 
 * Flow:
 * 1. Student selects trip and hall
 * 2. System creates payment record (status: confirmed for mock)
 * 3. System creates trip_users entry
 * 4. Returns booking confirmation
 */

// ====================================
// CREATE BOOKING (Mock Payment)
// ====================================
export const createBooking = async (req: Request, res: Response): Promise<void> => {
  const client = await pool.connect();
  
  try {
    const userId = (req as any).user?.id;
    const { trip_id, hall } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
      return;
    }

    // Start transaction
    await client.query('BEGIN');

    // 1. Check if trip exists and is bookable
    const tripResult = await client.query(
      `SELECT * FROM trips 
       WHERE id = $1 
         AND booking_start_time <= NOW() 
         AND booking_end_time >= NOW()`,
      [trip_id]
    );

    if (tripResult.rows.length === 0) {
      await client.query('ROLLBACK');
      res.status(400).json({
        success: false,
        error: 'Trip not found or booking window is closed',
      });
      return;
    }

    const trip = tripResult.rows[0];

    // 2. Check if user already booked this trip
    const existingBooking = await client.query(
      `SELECT * FROM trip_users WHERE trip_id = $1 AND user_id = $2`,
      [trip_id, userId]
    );

    if (existingBooking.rows.length > 0) {
      await client.query('ROLLBACK');
      res.status(409).json({
        success: false,
        error: 'You have already booked this trip',
      });
      return;
    }

    // 3. Create payment record (mock - directly confirmed)
    const paymentResult = await client.query(
      `INSERT INTO payments (
        user_id,
        trip_id,
        payment_status,
        payment_amount,
        payment_method,
        transaction_id
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [
        userId,
        trip_id,
        'confirmed',
        trip.amount_per_person,
        'mock',
        `MOCK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ]
    );

    const payment = paymentResult.rows[0];

    // 4. Create trip_users entry (booking)
    const bookingResult = await client.query(
      `INSERT INTO trip_users (
        trip_id,
        user_id,
        hall,
        payment_id
      ) VALUES ($1, $2, $3, $4)
      RETURNING *`,
      [trip_id, userId, hall, payment.id]
    );

    const booking = bookingResult.rows[0];

    // Commit transaction
    await client.query('COMMIT');

    // 5. Return complete booking details
    const completeBooking = await client.query(
      `SELECT 
        tu.*,
        t.trip_title,
        t.trip_date,
        t.return_time,
        t.end_time,
        t.amount_per_person,
        p.payment_status,
        p.payment_method,
        p.transaction_id,
        p.payment_date
      FROM trip_users tu
      JOIN trips t ON tu.trip_id = t.id
      JOIN payments p ON tu.payment_id = p.id
      WHERE tu.id = $1`,
      [booking.id]
    );

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: {
        booking: completeBooking.rows[0],
      },
    });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error creating booking:', error);

    // Handle specific errors
    if (error.code === '23505') {
      res.status(409).json({
        success: false,
        error: 'You have already booked this trip',
      });
      return;
    }

    if (error.code === '23503') {
      res.status(400).json({
        success: false,
        error: 'Invalid trip or user ID',
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Failed to create booking',
      details: error.message,
    });
  } finally {
    client.release();
  }
};

// ====================================
// GET MY BOOKINGS
// ====================================
export const getMyBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
      return;
    }

    const { status } = req.query;

    let query = `
      SELECT 
        tu.*,
        t.trip_title,
        t.trip_date,
        t.booking_start_time,
        t.booking_end_time,
        t.return_time,
        t.end_time,
        t.amount_per_person,
        p.payment_status,
        p.payment_method,
        p.transaction_id,
        p.payment_date,
        p.payment_amount,
        ca.id as allocation_id,
        ca.cab_id,
        c.cab_number,
        c.pickup_region
      FROM trip_users tu
      JOIN trips t ON tu.trip_id = t.id
      JOIN payments p ON tu.payment_id = p.id
      LEFT JOIN cab_allocations ca ON ca.trip_id = tu.trip_id AND ca.user_id = tu.user_id
      LEFT JOIN cabs c ON c.id = ca.cab_id
      WHERE tu.user_id = $1
    `;

    const params: any[] = [userId];

    // Filter by status
    if (status === 'upcoming') {
      query += ` AND t.trip_date >= CURRENT_DATE`;
    } else if (status === 'past') {
      query += ` AND t.end_time < NOW()`;
    } else if (status === 'active') {
      query += ` AND t.booking_start_time <= NOW() AND t.end_time > NOW()`;
    }

    query += ` ORDER BY t.trip_date DESC`;

    const result = await pool.query(query, params);

    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error: any) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch bookings',
      details: error.message,
    });
  }
};

// ====================================
// GET BOOKING BY ID
// ====================================
export const getBookingById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
      return;
    }

    const result = await pool.query(
      `SELECT 
        tu.*,
        t.trip_title,
        t.trip_date,
        t.booking_start_time,
        t.booking_end_time,
        t.return_time,
        t.end_time,
        t.amount_per_person,
        p.payment_status,
        p.payment_method,
        p.transaction_id,
        p.payment_date,
        p.payment_amount,
        ca.id as allocation_id,
        ca.cab_id,
        c.cab_number,
        c.pickup_region,
        c.passkey
      FROM trip_users tu
      JOIN trips t ON tu.trip_id = t.id
      JOIN payments p ON tu.payment_id = p.id
      LEFT JOIN cab_allocations ca ON ca.trip_id = tu.trip_id AND ca.user_id = tu.user_id
      LEFT JOIN cabs c ON c.id = ca.cab_id
      WHERE tu.id = $1 AND tu.user_id = $2`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Booking not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error: any) {
    console.error('Error fetching booking:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch booking',
      details: error.message,
    });
  }
};

