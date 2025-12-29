import { Request, Response } from 'express';
import pool from '../config/database';

/**
 * Trip Controller
 * Handles all trip management operations (Admin only)
 */

// ====================================
// GET TRIP DEMAND (Admin only)
// ====================================
export const getTripDemand = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tripId } = req.params;

    if (!tripId) {
      res.status(400).json({
        success: false,
        error: 'Trip ID is required',
      });
      return;
    }

    // Check if trip exists
    const tripCheck = await pool.query(
      'SELECT id FROM trips WHERE id = $1',
      [tripId]
    );

    if (tripCheck.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Trip not found',
      });
      return;
    }

    // Get hall-wise demand with student details
    const result = await pool.query(
      `SELECT 
        tu.hall,
        COUNT(*)::int as student_count,
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'id', u.id,
            'name', u.name,
            'email', u.email,
            'phone_number', u.phone_number,
            'profile_picture', u.profile_picture,
            'booking_id', tu.id,
            'created_at', tu.created_at
          ) ORDER BY tu.created_at ASC
        ) as students
      FROM trip_users tu
      JOIN users u ON tu.user_id = u.id
      WHERE tu.trip_id = $1
      GROUP BY tu.hall
      ORDER BY tu.hall`,
      [tripId]
    );

    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error: any) {
    console.error('Error fetching trip demand:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch trip demand',
    });
  }
};

// ====================================
// CREATE TRIP
// ====================================
export const createTrip = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      trip_title,
      trip_date,
      booking_start_time,
      booking_end_time,
      return_time,
      end_time,
      amount_per_person,
    } = req.body;

    // Validate required fields
    if (
      !trip_title ||
      !trip_date ||
      !booking_start_time ||
      !booking_end_time ||
      !return_time ||
      !end_time ||
      !amount_per_person
    ) {
      res.status(400).json({
        success: false,
        error: 'All fields are required',
      });
      return;
    }

    // Insert trip into database
    const result = await pool.query(
      `INSERT INTO trips (
        trip_title, 
        trip_date, 
        booking_start_time, 
        booking_end_time, 
        return_time, 
        end_time, 
        amount_per_person
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        trip_title,
        trip_date,
        booking_start_time,
        booking_end_time,
        return_time,
        end_time,
        amount_per_person,
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Trip created successfully',
      data: result.rows[0],
    });
  } catch (error: any) {
    console.error('Error creating trip:', error);

    // Handle unique constraint violation (if any other unique constraints exist)
    if (error.code === '23505') {
      res.status(409).json({
        success: false,
        error: 'Duplicate value detected',
        details: error.message,
      });
      return;
    }

    // Handle check constraint violations
    if (error.code === '23514') {
      res.status(400).json({
        success: false,
        error: 'Invalid time window or amount. Please check your input.',
        details: error.message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Failed to create trip',
      details: error.message,
    });
  }
};

// ====================================
// GET ALL TRIPS
// ====================================
export const getAllTrips = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, sort = 'desc', limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT 
        t.*,
        (SELECT COUNT(*)::int FROM trip_users WHERE trip_id = t.id) as booking_count
      FROM trips t
    `;

    const params: any[] = [];
    const whereClauses: string[] = [];

    // Filter by status
    if (status === 'upcoming') {
      whereClauses.push(`t.booking_start_time > NOW()`);
    } else if (status === 'past') {
      whereClauses.push(`t.end_time <= NOW()`);
    } else if (status === 'active') {
      whereClauses.push(
        `t.booking_start_time <= NOW() AND t.end_time > NOW()`
      );
    }

    // Add WHERE clause if filters exist
    if (whereClauses.length > 0) {
      query += ` WHERE ${whereClauses.join(' AND ')}`;
    }

    // Add sorting
    const sortDirection = sort === 'asc' ? 'ASC' : 'DESC';
    query += ` ORDER BY t.trip_date ${sortDirection}`;

    // Add pagination
    params.push(limit, offset);
    query += ` LIMIT $${params.length - 1} OFFSET $${params.length}`;

    const result = await pool.query(query, params);

    // Get total count for pagination
    let countQuery = `SELECT COUNT(*) FROM trips t`;
    if (whereClauses.length > 0) {
      countQuery += ` WHERE ${whereClauses.join(' AND ')}`;
    }
    const countResult = await pool.query(countQuery);

    res.status(200).json({
      success: true,
      data: result.rows,
      pagination: {
        total: parseInt(countResult.rows[0].count),
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      },
    });
  } catch (error: any) {
    console.error('Error fetching trips:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch trips',
      details: error.message,
    });
  }
};

// ====================================
// GET TRIP BY ID
// ====================================
export const getTripById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT 
        t.*,
        (SELECT COUNT(*)::int FROM trip_users WHERE trip_id = t.id) as booking_count,
        (SELECT COUNT(*)::int FROM cabs WHERE trip_id = t.id) as cab_count,
        (SELECT COUNT(*)::int FROM cab_allocations WHERE trip_id = t.id) as allocation_count
      FROM trips t
      WHERE t.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Trip not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error: any) {
    console.error('Error fetching trip:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch trip',
      details: error.message,
    });
  }
};

// ====================================
// UPDATE TRIP
// ====================================
export const updateTrip = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      trip_title,
      trip_date,
      booking_start_time,
      booking_end_time,
      return_time,
      end_time,
      amount_per_person,
    } = req.body;

    // Check if trip exists
    const checkResult = await pool.query('SELECT * FROM trips WHERE id = $1', [
      id,
    ]);

    if (checkResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Trip not found',
      });
      return;
    }

    // Build dynamic UPDATE query
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (trip_title !== undefined) {
      updates.push(`trip_title = $${paramIndex++}`);
      values.push(trip_title);
    }
    if (trip_date !== undefined) {
      updates.push(`trip_date = $${paramIndex++}`);
      values.push(trip_date);
    }
    if (booking_start_time !== undefined) {
      updates.push(`booking_start_time = $${paramIndex++}`);
      values.push(booking_start_time);
    }
    if (booking_end_time !== undefined) {
      updates.push(`booking_end_time = $${paramIndex++}`);
      values.push(booking_end_time);
    }
    if (return_time !== undefined) {
      updates.push(`return_time = $${paramIndex++}`);
      values.push(return_time);
    }
    if (end_time !== undefined) {
      updates.push(`end_time = $${paramIndex++}`);
      values.push(end_time);
    }
    if (amount_per_person !== undefined) {
      updates.push(`amount_per_person = $${paramIndex++}`);
      values.push(amount_per_person);
    }

    if (updates.length === 0) {
      res.status(400).json({
        success: false,
        error: 'No fields to update',
      });
      return;
    }

    values.push(id);
    const updateQuery = `
      UPDATE trips 
      SET ${updates.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(updateQuery, values);

    res.status(200).json({
      success: true,
      message: 'Trip updated successfully',
      data: result.rows[0],
    });
  } catch (error: any) {
    console.error('Error updating trip:', error);

    // Handle unique constraint violation (if any other unique constraints exist)
    if (error.code === '23505') {
      res.status(409).json({
        success: false,
        error: 'Duplicate value detected',
        details: error.message,
      });
      return;
    }

    // Handle check constraint violations
    if (error.code === '23514') {
      res.status(400).json({
        success: false,
        error: 'Invalid time window or amount. Please check your input.',
        details: error.message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Failed to update trip',
      details: error.message,
    });
  }
};

// ====================================
// DELETE TRIP
// ====================================
export const deleteTrip = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if trip exists
    const checkResult = await pool.query('SELECT * FROM trips WHERE id = $1', [
      id,
    ]);

    if (checkResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Trip not found',
      });
      return;
    }

    // Check if trip has bookings
    const bookingCheck = await pool.query(
      'SELECT COUNT(*) FROM trip_users WHERE trip_id = $1',
      [id]
    );

    const bookingCount = parseInt(bookingCheck.rows[0].count);

    if (bookingCount > 0) {
      res.status(400).json({
        success: false,
        error: `Cannot delete trip with ${bookingCount} existing booking(s). Please cancel bookings first.`,
      });
      return;
    }

    // Delete trip (will cascade to related records due to ON DELETE CASCADE)
    await pool.query('DELETE FROM trips WHERE id = $1', [id]);

    res.status(200).json({
      success: true,
      message: 'Trip deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting trip:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete trip',
      details: error.message,
    });
  }
};

// ====================================
// GET ACTIVE TRIPS (Public - for students)
// ====================================
export const getActiveTrips = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Active trips = current time is between booking_start_time and end_time
    // This means the trip lifecycle is active (from when booking opens until trip completes)
    const result = await pool.query(
      `SELECT 
        t.*,
        (SELECT COUNT(*)::int FROM trip_users WHERE trip_id = t.id) as booking_count,
        (SELECT COUNT(*)::int FROM cabs WHERE trip_id = t.id) as cab_count
      FROM trips t
      WHERE t.booking_start_time <= NOW() 
        AND t.end_time > NOW()
      ORDER BY t.trip_date ASC`
    );

    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error: any) {
    console.error('Error fetching active trips:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch active trips',
      details: error.message,
    });
  }
};

// ====================================
// GET ACTIVE TRIPS FOR AUTHENTICATED USER
// ====================================
export const getActiveTripsForUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
      return;
    }

    // Get active trips with user's booking status
    const result = await pool.query(
      `SELECT 
        t.*,
        (SELECT COUNT(*)::int FROM trip_users WHERE trip_id = t.id) as booking_count,
        (SELECT COUNT(*)::int FROM cabs WHERE trip_id = t.id) as cab_count,
        CASE 
          WHEN tu.id IS NOT NULL THEN TRUE 
          ELSE FALSE 
        END as has_booked,
        tu.id as booking_id
      FROM trips t
      LEFT JOIN trip_users tu ON tu.trip_id = t.id AND tu.user_id = $1
      WHERE t.booking_start_time <= NOW() 
        AND t.end_time > NOW()
      ORDER BY t.trip_date ASC`,
      [userId]
    );

    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error: any) {
    console.error('Error fetching active trips for user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch active trips',
      details: error.message,
    });
  }
};

// ====================================
// GET UPCOMING TRIPS (Public - for students)
// ====================================
export const getUpcomingTrips = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Upcoming trips = booking has not started yet (future trips)
    const result = await pool.query(
      `SELECT 
        t.*,
        (SELECT COUNT(*)::int FROM trip_users WHERE trip_id = t.id) as booking_count
      FROM trips t
      WHERE t.booking_start_time > NOW()
      ORDER BY t.trip_date ASC
      LIMIT 10`
    );

    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error: any) {
    console.error('Error fetching upcoming trips:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch upcoming trips',
      details: error.message,
    });
  }
};
