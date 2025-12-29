import { Request, Response } from 'express';
import pool from '../config/database';

/**
 * User Controller
 * Handles all user management operations (Admin only)
 */

// ====================================
// GET ALL USERS
// ====================================
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { is_admin, search, sort = 'desc', limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT 
        u.id,
        u.email,
        u.name,
        u.phone_number,
        u.profile_picture,
        u.is_admin,
        u.created_at,
        u.updated_at,
        (SELECT COUNT(*)::int FROM trip_users WHERE user_id = u.id) as booking_count,
        (SELECT COUNT(*)::int FROM payments WHERE user_id = u.id AND payment_status = 'confirmed') as payment_count
      FROM users u
    `;

    const params: any[] = [];
    const whereClauses: string[] = [];
    let paramIndex = 1;

    // Filter by admin status
    if (is_admin !== undefined) {
      whereClauses.push(`u.is_admin = $${paramIndex++}`);
      params.push(is_admin === 'true');
    }

    // Search by name or email
    if (search && typeof search === 'string' && search.trim()) {
      whereClauses.push(`(LOWER(u.name) LIKE $${paramIndex} OR LOWER(u.email) LIKE $${paramIndex})`);
      params.push(`%${search.toLowerCase()}%`);
      paramIndex++;
    }

    // Add WHERE clause if filters exist
    if (whereClauses.length > 0) {
      query += ` WHERE ${whereClauses.join(' AND ')}`;
    }

    // Add sorting
    const sortDirection = sort === 'asc' ? 'ASC' : 'DESC';
    query += ` ORDER BY u.created_at ${sortDirection}`;

    // Add pagination
    params.push(limit, offset);
    query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex}`;

    const result = await pool.query(query, params);

    // Get total count for pagination
    let countQuery = `SELECT COUNT(*) FROM users u`;
    let countParams: any[] = [];
    if (whereClauses.length > 0) {
      countQuery += ` WHERE ${whereClauses.join(' AND ')}`;
      countParams = params.slice(0, params.length - 2); // Exclude limit and offset
    }
    const countResult = await pool.query(countQuery, countParams);

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
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users',
      details: error.message,
    });
  }
};

// ====================================
// GET USER BY ID
// ====================================
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Get user with detailed stats
    const result = await pool.query(
      `SELECT 
        u.id,
        u.email,
        u.name,
        u.phone_number,
        u.profile_picture,
        u.is_admin,
        u.created_at,
        u.updated_at,
        (SELECT COUNT(*)::int FROM trip_users WHERE user_id = u.id) as booking_count,
        (SELECT COUNT(*)::int FROM payments WHERE user_id = u.id AND payment_status = 'confirmed') as payment_count,
        (SELECT COALESCE(SUM(payment_amount), 0) FROM payments WHERE user_id = u.id AND payment_status = 'confirmed') as total_spent
      FROM users u
      WHERE u.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'User not found',
      });
      return;
    }

    // Get recent bookings
    const bookingsResult = await pool.query(
      `SELECT 
        tu.id as booking_id,
        tu.hall,
        tu.created_at as booking_date,
        t.trip_title,
        t.trip_date,
        t.amount_per_person,
        p.payment_status
      FROM trip_users tu
      JOIN trips t ON tu.trip_id = t.id
      LEFT JOIN payments p ON tu.payment_id = p.id
      WHERE tu.user_id = $1
      ORDER BY t.trip_date DESC
      LIMIT 10`,
      [id]
    );

    res.status(200).json({
      success: true,
      data: {
        ...result.rows[0],
        recent_bookings: bookingsResult.rows,
      },
    });
  } catch (error: any) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user',
      details: error.message,
    });
  }
};

// ====================================
// CREATE USER
// ====================================
export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, name, phone_number, is_admin = false } = req.body;

    // Validate required fields
    if (!email || !name) {
      res.status(400).json({
        success: false,
        error: 'Email and name are required',
      });
      return;
    }

    // Normalize phone number
    const normalizedPhone = phone_number
      ? String(phone_number).replace(/[^0-9]/g, '')
      : null;

    // Insert user into database
    const result = await pool.query(
      `INSERT INTO users (email, name, phone_number, is_admin)
      VALUES ($1, $2, $3, $4)
      RETURNING id, email, name, phone_number, profile_picture, is_admin, created_at, updated_at`,
      [email, name, normalizedPhone, is_admin]
    );

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: result.rows[0],
    });
  } catch (error: any) {
    console.error('Error creating user:', error);

    // Handle unique constraint violation (duplicate email)
    if (error.code === '23505') {
      res.status(409).json({
        success: false,
        error: 'A user with this email already exists',
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Failed to create user',
      details: error.message,
    });
  }
};

// ====================================
// UPDATE USER
// ====================================
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, phone_number, email } = req.body;

    // Check if user exists
    const checkResult = await pool.query('SELECT * FROM users WHERE id = $1', [id]);

    if (checkResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'User not found',
      });
      return;
    }

    // Build dynamic UPDATE query
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(name);
    }

    if (email !== undefined) {
      updates.push(`email = $${paramIndex++}`);
      values.push(email);
    }

    if (phone_number !== undefined) {
      const normalizedPhone = phone_number
        ? String(phone_number).replace(/[^0-9]/g, '')
        : null;
      updates.push(`phone_number = $${paramIndex++}`);
      values.push(normalizedPhone);
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
      UPDATE users 
      SET ${updates.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex}
      RETURNING id, email, name, phone_number, profile_picture, is_admin, created_at, updated_at
    `;

    const result = await pool.query(updateQuery, values);

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: result.rows[0],
    });
  } catch (error: any) {
    console.error('Error updating user:', error);

    // Handle unique constraint violation
    if (error.code === '23505') {
      res.status(409).json({
        success: false,
        error: 'A user with this email already exists',
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Failed to update user',
      details: error.message,
    });
  }
};

// ====================================
// TOGGLE ADMIN STATUS
// ====================================
export const toggleAdminStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if user exists and get current status
    const checkResult = await pool.query(
      'SELECT id, is_admin, name, email FROM users WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'User not found',
      });
      return;
    }

    const user = checkResult.rows[0];
    const newAdminStatus = !user.is_admin;

    // Update admin status
    const result = await pool.query(
      `UPDATE users 
      SET is_admin = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, email, name, phone_number, profile_picture, is_admin, created_at, updated_at`,
      [newAdminStatus, id]
    );

    res.status(200).json({
      success: true,
      message: `User ${newAdminStatus ? 'granted' : 'revoked'} admin privileges`,
      data: result.rows[0],
    });
  } catch (error: any) {
    console.error('Error toggling admin status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update admin status',
      details: error.message,
    });
  }
};

// ====================================
// DELETE USER
// ====================================
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if user exists
    const checkResult = await pool.query('SELECT * FROM users WHERE id = $1', [id]);

    if (checkResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'User not found',
      });
      return;
    }

    // Check if user has bookings
    const bookingCheck = await pool.query(
      'SELECT COUNT(*) FROM trip_users WHERE user_id = $1',
      [id]
    );

    const bookingCount = parseInt(bookingCheck.rows[0].count);

    if (bookingCount > 0) {
      res.status(400).json({
        success: false,
        error: `Cannot delete user with ${bookingCount} existing booking(s). User data must be retained for record-keeping.`,
      });
      return;
    }

    // Delete user (will cascade to related records due to ON DELETE CASCADE)
    await pool.query('DELETE FROM users WHERE id = $1', [id]);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete user',
      details: error.message,
    });
  }
};

