import { Router } from 'express';
import { getActivityLogs } from '../controllers/activity.controller';

const router = Router();

/**
 * Activity Log Routes (Admin only)
 * 
 * GET /api/admin/activities - Get paginated activity logs
 *   Query params: page, limit, action_type, entity_type, user_id, start_date, end_date
 */
router.get('/activities', getActivityLogs);

export default router;
