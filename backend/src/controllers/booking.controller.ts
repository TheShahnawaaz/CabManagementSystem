import { Request, Response } from 'express';
import pool from '../config/database';

/**
 * Booking Controller
 * 
 * Handles student booking operations:
 * - Get user's bookings
 * - Get booking by ID
 * 
 * Note: Booking creation is handled by payment.service.ts after payment verification
 */

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
        t.departure_time,
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
        t.departure_time,
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
