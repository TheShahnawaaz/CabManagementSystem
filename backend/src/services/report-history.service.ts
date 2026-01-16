/**
 * Report History Service
 * Handles audit trail logging for reports and adjustments
 */

import pool from '../config/database';
import type {
  ReportHistoryAction,
  ReportCreatedChanges,
  ReportUpdatedChanges,
  AdjustmentAddedChanges,
  AdjustmentUpdatedChanges,
  AdjustmentRemovedChanges,
  AdjustmentType,
} from '../types/report.types';

// ====================================
// REPORT HISTORY LOGGING
// ====================================

/**
 * Log when a report is created
 */
export async function logReportCreated(
  reportId: string,
  userId: string,
  data: { cab_cost: number; notes?: string }
): Promise<void> {
  const changes: ReportCreatedChanges = {
    cab_cost: { old: null, new: data.cab_cost },
  };
  
  if (data.notes) {
    changes.notes = { old: null, new: data.notes };
  }

  await pool.query(
    `INSERT INTO report_history (report_id, edited_by, action, changes)
     VALUES ($1, $2, $3, $4)`,
    [reportId, userId, 'report_created', JSON.stringify(changes)]
  );
}

/**
 * Log when a report is updated
 */
export async function logReportUpdated(
  reportId: string,
  userId: string,
  oldData: { cab_cost: number; notes: string | null },
  newData: { cab_cost?: number; notes?: string }
): Promise<void> {
  const changes: ReportUpdatedChanges = {};
  
  if (newData.cab_cost !== undefined && newData.cab_cost !== oldData.cab_cost) {
    changes.cab_cost = { old: oldData.cab_cost, new: newData.cab_cost };
  }
  
  if (newData.notes !== undefined && newData.notes !== oldData.notes) {
    changes.notes = { old: oldData.notes, new: newData.notes };
  }

  // Only log if something actually changed
  if (Object.keys(changes).length === 0) {
    return;
  }

  await pool.query(
    `INSERT INTO report_history (report_id, edited_by, action, changes)
     VALUES ($1, $2, $3, $4)`,
    [reportId, userId, 'report_updated', JSON.stringify(changes)]
  );
}

// ====================================
// ADJUSTMENT HISTORY LOGGING
// ====================================

/**
 * Log when an adjustment is added
 */
export async function logAdjustmentAdded(
  reportId: string,
  userId: string,
  adjustment: {
    id: string;
    adjustment_type: AdjustmentType;
    category: string;
    description: string | null;
    amount: number;
  }
): Promise<void> {
  const changes: AdjustmentAddedChanges = {
    adjustment: {
      id: adjustment.id,
      type: adjustment.adjustment_type,
      category: adjustment.category,
      description: adjustment.description,
      amount: adjustment.amount,
    },
  };

  await pool.query(
    `INSERT INTO report_history (report_id, edited_by, action, changes, adjustment_id)
     VALUES ($1, $2, $3, $4, $5)`,
    [reportId, userId, 'adjustment_added', JSON.stringify(changes), adjustment.id]
  );
}

/**
 * Log when an adjustment is updated
 */
export async function logAdjustmentUpdated(
  reportId: string,
  userId: string,
  adjustmentId: string,
  oldData: { category: string; description: string | null; amount: number },
  newData: { category?: string; description?: string; amount?: number }
): Promise<void> {
  const changes: AdjustmentUpdatedChanges = {
    adjustment_id: adjustmentId,
    changes: {},
  };

  if (newData.category !== undefined && newData.category !== oldData.category) {
    changes.changes.category = { old: oldData.category, new: newData.category };
  }

  if (newData.description !== undefined && newData.description !== oldData.description) {
    changes.changes.description = { old: oldData.description, new: newData.description };
  }

  if (newData.amount !== undefined && newData.amount !== oldData.amount) {
    changes.changes.amount = { old: oldData.amount, new: newData.amount };
  }

  // Only log if something actually changed
  if (Object.keys(changes.changes).length === 0) {
    return;
  }

  await pool.query(
    `INSERT INTO report_history (report_id, edited_by, action, changes, adjustment_id)
     VALUES ($1, $2, $3, $4, $5)`,
    [reportId, userId, 'adjustment_updated', JSON.stringify(changes), adjustmentId]
  );
}

/**
 * Log when an adjustment is removed
 */
export async function logAdjustmentRemoved(
  reportId: string,
  userId: string,
  adjustment: {
    id: string;
    adjustment_type: AdjustmentType;
    category: string;
    description: string | null;
    amount: number;
  }
): Promise<void> {
  const changes: AdjustmentRemovedChanges = {
    adjustment: {
      id: adjustment.id,
      type: adjustment.adjustment_type,
      category: adjustment.category,
      description: adjustment.description,
      amount: adjustment.amount,
    },
  };

  await pool.query(
    `INSERT INTO report_history (report_id, edited_by, action, changes)
     VALUES ($1, $2, $3, $4)`,
    [reportId, userId, 'adjustment_removed', JSON.stringify(changes)]
  );
}
