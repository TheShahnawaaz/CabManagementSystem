import pool from '../config/database';

/**
 * Activity Log Service
 * 
 * Centralized service for logging admin (and future user) activities.
 * All activity logging goes through this single function to ensure
 * consistency and make it easy to extend in the future.
 * 
 * Usage:
 *   await logActivity({
 *     userId: req.user.id,
 *     actionType: 'TRIP_CREATED',
 *     entityType: 'trip',
 *     entityId: tripId,
 *     details: { trip_title: '...' },
 *     req,
 *   });
 */

interface LogActivityParams {
  userId?: string;          // Actor performing the action
  targetUserId?: string;    // Target user (if action is on a user)
  actionType: string;       // e.g. TRIP_CREATED, USER_BOARDED
  entityType?: string;      // e.g. trip, journey, report
  entityId?: string;        // UUID of the affected entity
  details?: Record<string, any>; // Flexible context payload
  ipAddress?: string;       // Optional IP address
}

/**
 * Log an activity to the activity_logs table.
 * 
 * This function is fire-and-forget safe - errors are caught and logged
 * to console so they never break the main request flow.
 */
export const logActivity = async (params: LogActivityParams): Promise<void> => {
  try {
    const {
      userId = null,
      targetUserId = null,
      actionType,
      entityType = null,
      entityId = null,
      details = {},
      ipAddress = null,
    } = params;

    await pool.query(
      `INSERT INTO activity_logs (
        user_id, target_user_id, action_type, entity_type, entity_id, details, ip_address
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [userId, targetUserId, actionType, entityType, entityId, JSON.stringify(details), ipAddress]
    );
  } catch (error) {
    // Log but don't throw - activity logging should never break the main flow
    console.error('⚠️ Failed to log activity:', error);
  }
};
