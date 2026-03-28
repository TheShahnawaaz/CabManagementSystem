import { Request, Response } from 'express';
import pool from '../config/database';

/**
 * Activity Controller
 * Handles fetching activity logs for admin dashboard
 */

// ====================================
// GET ALL ACTIVITY LOGS (Admin only)
// ====================================
export const getActivityLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = '1',
      limit = '20',
      action_type,
      entity_type,
      user_id,
      start_date,
      end_date,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string)));
    const offset = (pageNum - 1) * limitNum;

    // Build dynamic WHERE clause
    const whereClauses: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (action_type) {
      whereClauses.push(`al.action_type = $${paramIndex++}`);
      params.push(action_type);
    }

    if (entity_type) {
      whereClauses.push(`al.entity_type = $${paramIndex++}`);
      params.push(entity_type);
    }

    if (user_id) {
      whereClauses.push(`al.user_id = $${paramIndex++}`);
      params.push(user_id);
    }

    if (start_date) {
      whereClauses.push(`al.created_at >= $${paramIndex++}`);
      params.push(start_date);
    }

    if (end_date) {
      whereClauses.push(`al.created_at <= $${paramIndex++}`);
      params.push(end_date);
    }

    const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Fetch logs with actor and target user info
    const dataQuery = `
      SELECT 
        al.id,
        al.action_type,
        al.entity_type,
        al.entity_id,
        al.details,
        al.ip_address,
        al.created_at,
        CASE WHEN actor.id IS NOT NULL 
          THEN json_build_object(
            'id', actor.id,
            'name', actor.name,
            'email', actor.email,
            'profile_picture', actor.profile_picture
          )
          ELSE NULL
        END as actor,
        CASE WHEN target.id IS NOT NULL 
          THEN json_build_object(
            'id', target.id,
            'name', target.name,
            'email', target.email,
            'profile_picture', target.profile_picture
          )
          ELSE NULL
        END as target
      FROM activity_logs al
      LEFT JOIN users actor ON al.user_id = actor.id
      LEFT JOIN users target ON al.target_user_id = target.id
      ${whereSQL}
      ORDER BY al.created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex}
    `;
    params.push(limitNum, offset);

    const result = await pool.query(dataQuery, params);

    // Get total count for pagination (reuse where clauses)
    const countParams = params.slice(0, params.length - 2); // Remove limit & offset
    const countQuery = `SELECT COUNT(*)::int as total FROM activity_logs al ${whereSQL}`;
    const countResult = await pool.query(countQuery, countParams);

    res.status(200).json({
      success: true,
      data: result.rows,
      pagination: {
        total: countResult.rows[0].total,
        page: pageNum,
        limit: limitNum,
      },
    });
  } catch (error: any) {
    console.error('Error fetching activity logs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch activity logs',
    });
  }
};
