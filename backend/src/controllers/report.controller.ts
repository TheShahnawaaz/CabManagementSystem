/**
 * Report Controller
 * Handles all report-related API operations
 */

import { Request, Response } from 'express';
import pool from '../config/database';
import {
  logReportCreated,
  logReportUpdated,
  logAdjustmentAdded,
  logAdjustmentUpdated,
  logAdjustmentRemoved,
} from '../services/report-history.service';
import type {
  CreateReportDTO,
  UpdateReportDTO,
  CreateAdjustmentDTO,
  UpdateAdjustmentDTO,
} from '../types/report.types';

// ====================================
// GET ALL REPORTS
// ====================================

/**
 * Get all reports with financial summary
 * GET /admin/reports
 */
export const getReports = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(`
      SELECT 
        rf.*,
        json_build_object(
          'id', cu.id, 
          'name', cu.name, 
          'email', cu.email,
          'phone_number', cu.phone_number,
          'profile_picture', cu.profile_picture
        ) as created_by_user,
        CASE WHEN lu.id IS NOT NULL 
          THEN json_build_object(
            'id', lu.id, 
            'name', lu.name, 
            'email', lu.email,
            'phone_number', lu.phone_number,
            'profile_picture', lu.profile_picture
          ) 
          ELSE NULL 
        END as last_edited_by_user
      FROM report_financials rf
      LEFT JOIN users cu ON rf.created_by = cu.id
      LEFT JOIN users lu ON rf.last_edited_by = lu.id
      ORDER BY rf.trip_date DESC
    `);

    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error: any) {
    console.error('Error fetching reports:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch reports',
    });
  }
};

// ====================================
// GET REPORTS SUMMARY
// ====================================

/**
 * Get aggregated summary across all reports
 * GET /admin/reports/summary
 */
export const getReportsSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query('SELECT * FROM reports_summary');

    res.status(200).json({
      success: true,
      data: result.rows[0] || {
        total_reports: 0,
        total_students: 0,
        total_cabs: 0,
        total_gross_revenue: 0,
        total_net_profit: 0,
        overall_profit_margin: 0,
      },
    });
  } catch (error: any) {
    console.error('Error fetching reports summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch reports summary',
    });
  }
};

// ====================================
// GET TRIPS WITHOUT REPORT
// ====================================

/**
 * Get list of trips that don't have a report yet
 * GET /admin/reports/pending-trips
 */
export const getTripsWithoutReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query('SELECT * FROM trips_without_report');

    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error: any) {
    console.error('Error fetching trips without report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch trips without report',
    });
  }
};

// ====================================
// GET SINGLE REPORT
// ====================================

/**
 * Get single report with full details
 * GET /admin/reports/:id
 */
export const getReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Get report financials
    const reportResult = await pool.query(`
      SELECT 
        rf.*,
        json_build_object(
          'id', cu.id, 
          'name', cu.name, 
          'email', cu.email,
          'phone_number', cu.phone_number,
          'profile_picture', cu.profile_picture
        ) as created_by_user,
        CASE WHEN lu.id IS NOT NULL 
          THEN json_build_object(
            'id', lu.id, 
            'name', lu.name, 
            'email', lu.email,
            'phone_number', lu.phone_number,
            'profile_picture', lu.profile_picture
          ) 
          ELSE NULL 
        END as last_edited_by_user
      FROM report_financials rf
      LEFT JOIN users cu ON rf.created_by = cu.id
      LEFT JOIN users lu ON rf.last_edited_by = lu.id
      WHERE rf.report_id = $1
    `, [id]);

    if (reportResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Report not found',
      });
      return;
    }

    // Get adjustments
    const adjustmentsResult = await pool.query(`
      SELECT 
        ra.*,
        json_build_object(
          'id', u.id, 
          'name', u.name, 
          'email', u.email,
          'phone_number', u.phone_number,
          'profile_picture', u.profile_picture
        ) as created_by_user
      FROM report_adjustments ra
      LEFT JOIN users u ON ra.created_by = u.id
      WHERE ra.report_id = $1
      ORDER BY ra.created_at DESC
    `, [id]);

    res.status(200).json({
      success: true,
      data: {
        ...reportResult.rows[0],
        adjustments: adjustmentsResult.rows,
      },
    });
  } catch (error: any) {
    console.error('Error fetching report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch report',
    });
  }
};

// ====================================
// GET REPORT BY TRIP
// ====================================

/**
 * Get report for a specific trip (or check if exists)
 * GET /admin/trips/:tripId/report
 */
export const getReportByTrip = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tripId } = req.params;

    const result = await pool.query(`
      SELECT id FROM reports WHERE trip_id = $1
    `, [tripId]);

    if (result.rows.length === 0) {
      // Check if trip exists
      const tripResult = await pool.query('SELECT id FROM trips WHERE id = $1', [tripId]);
      
      if (tripResult.rows.length === 0) {
        res.status(404).json({
          success: false,
          error: 'Trip not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          has_report: false,
          report_id: null,
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        has_report: true,
        report_id: result.rows[0].id,
      },
    });
  } catch (error: any) {
    console.error('Error checking report for trip:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check report for trip',
    });
  }
};

// ====================================
// CREATE REPORT
// ====================================

/**
 * Create a new report for a trip
 * POST /admin/reports
 */
export const createReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { trip_id, cab_cost, notes } = req.body as CreateReportDTO;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
      return;
    }

    // Validate required fields
    if (!trip_id) {
      res.status(400).json({
        success: false,
        error: 'trip_id is required',
      });
      return;
    }

    if (cab_cost === undefined || cab_cost < 0) {
      res.status(400).json({
        success: false,
        error: 'cab_cost must be a non-negative number',
      });
      return;
    }

    // Check if trip exists
    const tripResult = await pool.query('SELECT id FROM trips WHERE id = $1', [trip_id]);
    if (tripResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Trip not found',
      });
      return;
    }

    // Check if report already exists
    const existingResult = await pool.query('SELECT id FROM reports WHERE trip_id = $1', [trip_id]);
    if (existingResult.rows.length > 0) {
      res.status(409).json({
        success: false,
        error: 'Report already exists for this trip',
        report_id: existingResult.rows[0].id,
      });
      return;
    }

    // Create report
    const insertResult = await pool.query(`
      INSERT INTO reports (trip_id, cab_cost, notes, created_by)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `, [trip_id, cab_cost, notes || null, userId]);

    const reportId = insertResult.rows[0].id;

    // Log history
    await logReportCreated(reportId, userId, { cab_cost, notes });

    res.status(201).json({
      success: true,
      data: {
        id: reportId,
      },
      message: 'Report created successfully',
    });
  } catch (error: any) {
    console.error('Error creating report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create report',
    });
  }
};

// ====================================
// UPDATE REPORT
// ====================================

/**
 * Update an existing report
 * PATCH /admin/reports/:id
 */
export const updateReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const { cab_cost, notes } = req.body as UpdateReportDTO;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
      return;
    }

    // Get current report data
    const currentResult = await pool.query(
      'SELECT cab_cost, notes FROM reports WHERE id = $1',
      [id]
    );

    if (currentResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Report not found',
      });
      return;
    }

    const currentData = currentResult.rows[0];

    // Validate cab_cost if provided
    if (cab_cost !== undefined && cab_cost < 0) {
      res.status(400).json({
        success: false,
        error: 'cab_cost must be a non-negative number',
      });
      return;
    }

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (cab_cost !== undefined) {
      updates.push(`cab_cost = $${paramIndex++}`);
      values.push(cab_cost);
    }

    if (notes !== undefined) {
      updates.push(`notes = $${paramIndex++}`);
      values.push(notes);
    }

    if (updates.length === 0) {
      res.status(400).json({
        success: false,
        error: 'No fields to update',
      });
      return;
    }

    // Add last_edited_by
    updates.push(`last_edited_by = $${paramIndex++}`);
    values.push(userId);

    // Add id for WHERE clause
    values.push(id);

    await pool.query(
      `UPDATE reports SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
      values
    );

    // Log history
    await logReportUpdated(id as string, userId, currentData, { cab_cost, notes });

    res.status(200).json({
      success: true,
      message: 'Report updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update report',
    });
  }
};

// ====================================
// GET REPORT HISTORY
// ====================================

/**
 * Get edit history for a report
 * GET /admin/reports/:id/history
 */
export const getReportHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if report exists
    const reportResult = await pool.query('SELECT id FROM reports WHERE id = $1', [id]);
    if (reportResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Report not found',
      });
      return;
    }

    const result = await pool.query(`
      SELECT 
        rh.*,
        json_build_object(
          'id', u.id, 
          'name', u.name, 
          'email', u.email,
          'phone_number', u.phone_number,
          'profile_picture', u.profile_picture
        ) as edited_by_user
      FROM report_history rh
      LEFT JOIN users u ON rh.edited_by = u.id
      WHERE rh.report_id = $1
      ORDER BY rh.edited_at DESC
    `, [id]);

    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error: any) {
    console.error('Error fetching report history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch report history',
    });
  }
};

// ====================================
// ADD ADJUSTMENT
// ====================================

/**
 * Add an adjustment (income/expense) to a report
 * POST /admin/reports/:id/adjustments
 */
export const addAdjustment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: reportId } = req.params;
    const userId = req.user?.id;
    const { adjustment_type, category, description, amount } = req.body as CreateAdjustmentDTO;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
      return;
    }

    // Validate required fields
    if (!adjustment_type || !['income', 'expense'].includes(adjustment_type)) {
      res.status(400).json({
        success: false,
        error: 'adjustment_type must be "income" or "expense"',
      });
      return;
    }

    if (!category || category.trim() === '') {
      res.status(400).json({
        success: false,
        error: 'category is required',
      });
      return;
    }

    if (amount === undefined || amount <= 0) {
      res.status(400).json({
        success: false,
        error: 'amount must be a positive number',
      });
      return;
    }

    // Check if report exists
    const reportResult = await pool.query('SELECT id FROM reports WHERE id = $1', [reportId]);
    if (reportResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Report not found',
      });
      return;
    }

    // Insert adjustment
    const insertResult = await pool.query(`
      INSERT INTO report_adjustments (report_id, adjustment_type, category, description, amount, created_by)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `, [reportId, adjustment_type, category.trim(), description || null, amount, userId]);

    const adjustmentId = insertResult.rows[0].id;

    // Update report's last_edited_by
    await pool.query(
      'UPDATE reports SET last_edited_by = $1 WHERE id = $2',
      [userId, reportId]
    );

    // Log history
    await logAdjustmentAdded(reportId as string, userId, {
      id: adjustmentId,
      adjustment_type,
      category: category.trim(),
      description: description || null,
      amount,
    });

    res.status(201).json({
      success: true,
      data: {
        id: adjustmentId,
      },
      message: 'Adjustment added successfully',
    });
  } catch (error: any) {
    console.error('Error adding adjustment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add adjustment',
    });
  }
};

// ====================================
// UPDATE ADJUSTMENT
// ====================================

/**
 * Update an adjustment
 * PATCH /admin/reports/:id/adjustments/:adjustmentId
 */
export const updateAdjustment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: reportId, adjustmentId } = req.params;
    const userId = req.user?.id;
    const { category, description, amount } = req.body as UpdateAdjustmentDTO;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
      return;
    }

    // Get current adjustment data
    const currentResult = await pool.query(
      'SELECT category, description, amount FROM report_adjustments WHERE id = $1 AND report_id = $2',
      [adjustmentId, reportId]
    );

    if (currentResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Adjustment not found',
      });
      return;
    }

    const currentData = currentResult.rows[0];

    // Validate amount if provided
    if (amount !== undefined && amount <= 0) {
      res.status(400).json({
        success: false,
        error: 'amount must be a positive number',
      });
      return;
    }

    // Build update query
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (category !== undefined) {
      updates.push(`category = $${paramIndex++}`);
      values.push(category.trim());
    }

    if (description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(description);
    }

    if (amount !== undefined) {
      updates.push(`amount = $${paramIndex++}`);
      values.push(amount);
    }

    if (updates.length === 0) {
      res.status(400).json({
        success: false,
        error: 'No fields to update',
      });
      return;
    }

    // Add IDs for WHERE clause
    values.push(adjustmentId, reportId);

    await pool.query(
      `UPDATE report_adjustments SET ${updates.join(', ')} WHERE id = $${paramIndex++} AND report_id = $${paramIndex}`,
      values
    );

    // Update report's last_edited_by
    await pool.query(
      'UPDATE reports SET last_edited_by = $1 WHERE id = $2',
      [userId, reportId]
    );

    // Log history
    await logAdjustmentUpdated(reportId as string, userId, adjustmentId as string, currentData, {
      category: category?.trim(),
      description,
      amount,
    });

    res.status(200).json({
      success: true,
      message: 'Adjustment updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating adjustment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update adjustment',
    });
  }
};

// ====================================
// DELETE ADJUSTMENT
// ====================================

/**
 * Delete an adjustment
 * DELETE /admin/reports/:id/adjustments/:adjustmentId
 */
export const deleteAdjustment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: reportId, adjustmentId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
      return;
    }

    // Get adjustment data for history
    const adjustmentResult = await pool.query(
      'SELECT id, adjustment_type, category, description, amount FROM report_adjustments WHERE id = $1 AND report_id = $2',
      [adjustmentId, reportId]
    );

    if (adjustmentResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Adjustment not found',
      });
      return;
    }

    const adjustment = adjustmentResult.rows[0];

    // Delete adjustment
    await pool.query(
      'DELETE FROM report_adjustments WHERE id = $1 AND report_id = $2',
      [adjustmentId, reportId]
    );

    // Update report's last_edited_by
    await pool.query(
      'UPDATE reports SET last_edited_by = $1 WHERE id = $2',
      [userId, reportId]
    );

    // Log history
    await logAdjustmentRemoved(reportId as string, userId, adjustment);

    res.status(200).json({
      success: true,
      message: 'Adjustment deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting adjustment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete adjustment',
    });
  }
};
