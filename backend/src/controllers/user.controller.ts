import { Request, Response } from 'express';
import pool from '../config/database';
import type { AuthRequest } from '../middleware/auth.middleware';

/**
 * User Controller
 * Handles all user management operations (Admin only)
 */

const isProduction = process.env.NODE_ENV === 'production';

function sendInternalError(res: Response, error: unknown, safeMessage: string) {
  const details =
    error && typeof error === 'object' && 'message' in error
      ? String((error as any).message)
      : undefined;

  res.status(500).json({
    success: false,
    error: safeMessage,
    ...(isProduction ? {} : { details }),
  });
}

function parseOptionalBoolean(value: unknown): boolean | undefined {
  if (value === undefined) return undefined;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return undefined;
}

function parseOptionalInt(value: unknown): number | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== 'string' || value.trim() === '') return undefined;
  const n = Number(value);
  if (!Number.isInteger(n)) return undefined;
  return n;
}

// ====================================
// GET USER STATS (Independent of filters)
// ====================================
export const getUserStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*)::int AS total_users,
        COUNT(*) FILTER (WHERE is_admin = TRUE)::int AS admin_count,
        (SELECT COUNT(*)::int FROM trip_users) AS total_bookings,
        (SELECT COUNT(*)::int FROM payments WHERE payment_status = 'confirmed') AS confirmed_payments
      FROM users
    `);

    const stats = result.rows[0];

    res.status(200).json({
      success: true,
      data: {
        totalUsers: stats.total_users,
        adminCount: stats.admin_count,
        totalBookings: stats.total_bookings,
        confirmedPayments: stats.confirmed_payments,
      },
    });
  } catch (error: any) {
    console.error('Error fetching user stats:', error);
    sendInternalError(res, error, 'Failed to fetch user stats');
  }
};

// ====================================
// GET ALL USERS
// ====================================
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { is_admin, search, sort = 'desc', limit = '50', offset = '0' } =
      req.query;

    // Validate and normalize query params
    const errors: string[] = [];

    const isAdminFilter = parseOptionalBoolean(is_admin);
    if (is_admin !== undefined && isAdminFilter === undefined) {
      errors.push('is_admin must be "true" or "false"');
    }

    const sortDirection = sort === 'asc' ? 'ASC' : sort === 'desc' ? 'DESC' : null;
    if (!sortDirection) {
      errors.push('sort must be "asc" or "desc"');
    }

    const parsedLimit = parseOptionalInt(limit) ?? 50;
    const parsedOffset = parseOptionalInt(offset) ?? 0;

    if (parsedLimit < 1 || parsedLimit > 200) {
      errors.push('limit must be between 1 and 200');
    }
    if (parsedOffset < 0) {
      errors.push('offset must be >= 0');
    }

    const normalizedSearch =
      typeof search === 'string' ? search.trim().slice(0, 120) : '';

    if (errors.length > 0) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors,
      });
      return;
    }

    let query = `
      SELECT 
        u.id,
        u.email,
        u.name,
        u.phone_number,
        u.profile_picture,
        u.is_admin,
        u.email_notifications,
        u.created_at,
        u.updated_at,
        COALESCE(b.booking_count, 0)::int as booking_count,
        COALESCE(p.payment_count, 0)::int as payment_count,
        COUNT(*) OVER()::int AS total_count
      FROM users u
      LEFT JOIN (
        SELECT user_id, COUNT(*)::int AS booking_count
        FROM trip_users
        GROUP BY user_id
      ) b ON b.user_id = u.id
      LEFT JOIN (
        SELECT user_id, COUNT(*)::int AS payment_count
        FROM payments
        WHERE payment_status = 'confirmed'
        GROUP BY user_id
      ) p ON p.user_id = u.id
    `;

    const params: any[] = [];
    const whereClauses: string[] = [];
    let paramIndex = 1;

    // Filter by admin status
    if (isAdminFilter !== undefined) {
      whereClauses.push(`u.is_admin = $${paramIndex++}`);
      params.push(isAdminFilter);
    }

    // Search by name, email, or ID
    if (normalizedSearch) {
      whereClauses.push(
        `(LOWER(u.name) LIKE $${paramIndex} OR LOWER(u.email) LIKE $${paramIndex} OR u.id::text LIKE $${paramIndex})`
      );
      params.push(`%${normalizedSearch.toLowerCase()}%`);
      paramIndex++;
    }

    // Add WHERE clause if filters exist
    if (whereClauses.length > 0) {
      query += ` WHERE ${whereClauses.join(' AND ')}`;
    }

    // Add sorting
    query += ` ORDER BY u.created_at ${sortDirection}`;

    // Add pagination
    params.push(parsedLimit, parsedOffset);
    query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex}`;

    const result = await pool.query(query, params);
    const total =
      result.rows.length > 0 ? Number(result.rows[0].total_count) : 0;

    // Remove total_count from each row (it’s duplicated per row)
    const data = result.rows.map(({ total_count, ...row }) => row);

    res.status(200).json({
      success: true,
      data,
      pagination: {
        total,
        limit: parsedLimit,
        offset: parsedOffset,
      },
    });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    sendInternalError(res, error, 'Failed to fetch users');
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
        u.email_notifications,
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
    sendInternalError(res, error, 'Failed to fetch user');
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
      RETURNING id, email, name, phone_number, profile_picture, is_admin, email_notifications, created_at, updated_at`,
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

    sendInternalError(res, error, 'Failed to create user');
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
      RETURNING id, email, name, phone_number, profile_picture, is_admin, email_notifications, created_at, updated_at
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

    sendInternalError(res, error, 'Failed to update user');
  }
};

// ====================================
// TOGGLE ADMIN STATUS
// ====================================
export const toggleAdminStatus = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    // Prevent self-lockout
    if (req.user?.id === id) {
      res.status(400).json({
        success: false,
        error: 'You cannot change your own admin status',
      });
      return;
    }

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

    // Prevent revoking the last admin
    if (user.is_admin && !newAdminStatus) {
      const adminCountResult = await pool.query(
        'SELECT COUNT(*)::int AS admin_count FROM users WHERE is_admin = TRUE AND id <> $1',
        [id]
      );
      const remainingAdmins = adminCountResult.rows[0]?.admin_count ?? 0;
      if (remainingAdmins <= 0) {
        res.status(400).json({
          success: false,
          error: 'Cannot revoke admin status from the last admin user',
        });
        return;
      }
    }

    // Update admin status
    const result = await pool.query(
      `UPDATE users 
      SET is_admin = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, email, name, phone_number, profile_picture, is_admin, email_notifications, created_at, updated_at`,
      [newAdminStatus, id]
    );

    res.status(200).json({
      success: true,
      message: `User ${newAdminStatus ? 'granted' : 'revoked'} admin privileges`,
      data: result.rows[0],
    });
  } catch (error: any) {
    console.error('Error toggling admin status:', error);
    sendInternalError(res, error, 'Failed to update admin status');
  }
};

// ====================================
// DELETE USER
// ====================================
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Prevent deleting yourself (admin self-lockout)
    const authReq = req as AuthRequest;
    if (authReq.user?.id === id) {
      res.status(400).json({
        success: false,
        error: 'You cannot delete your own user account',
      });
      return;
    }

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
    sendInternalError(res, error, 'Failed to delete user');
  }
};

