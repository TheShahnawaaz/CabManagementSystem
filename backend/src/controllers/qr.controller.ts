import { Request, Response } from 'express';
import pool from '../config/database';

/**
 * QR Controller
 * 
 * Handles QR code generation and validation for student boarding
 * - Get allocation data for QR display (public)
 * - Validate passkey and log journey (public)
 * - Get cab details for student view (public)
 */

// ====================================
// GET QR DATA (for driver scan page)
// ====================================
export const getQRData = async (req: Request, res: Response): Promise<void> => {
  try {
    const { allocationId } = req.params;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(allocationId)) {
      res.status(400).json({
        success: false,
        error: 'invalid_format',
        message: 'Invalid allocation ID format',
      });
      return;
    }

    // Fetch allocation details with all related data
    const result = await pool.query(
      `SELECT 
        ca.id as allocation_id,
        ca.trip_id,
        ca.user_id,
        ca.cab_id,
        u.name as student_name,
        u.email as student_email,
        tu.hall as student_hall,
        c.cab_number,
        c.pickup_region,
        c.passkey as cab_passkey,
        t.trip_title,
        t.trip_date,
        t.return_time,
        t.end_time,
        p.payment_status
      FROM cab_allocations ca
      JOIN users u ON u.id = ca.user_id
      JOIN cabs c ON c.id = ca.cab_id
      JOIN trips t ON t.id = ca.trip_id
      JOIN trip_users tu ON tu.trip_id = ca.trip_id AND tu.user_id = ca.user_id
      JOIN payments p ON p.id = tu.payment_id
      WHERE ca.id = $1`,
      [allocationId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'not_found',
        message: 'Invalid QR code or allocation not found',
      });
      return;
    }

    const allocation = result.rows[0];

    // Check payment status
    if (allocation.payment_status !== 'confirmed') {
      res.status(400).json({
        success: false,
        error: 'payment_pending',
        message: 'Payment not confirmed for this booking',
      });
      return;
    }

    // Determine journey type based on current time
    const now = new Date();
    const returnTime = new Date(allocation.return_time);
    const journeyType = now < returnTime ? 'pickup' : 'dropoff';

    // Return allocation data (without passkey - that's validated separately)
    res.status(200).json({
      success: true,
      data: {
        allocation_id: allocation.allocation_id,
        trip_title: allocation.trip_title,
        trip_date: allocation.trip_date,
        return_time: allocation.return_time,
        end_time: allocation.end_time,
        student_name: allocation.student_name,
        student_email: allocation.student_email,
        student_hall: allocation.student_hall,
        cab_number: allocation.cab_number,
        pickup_region: allocation.pickup_region,
        journey_type: journeyType,
        current_time: now.toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Error fetching QR data:', error);
    res.status(500).json({
      success: false,
      error: 'server_error',
      message: 'Failed to fetch allocation data',
      details: error.message,
    });
  }
};

// ====================================
// VALIDATE QR CODE
// ====================================
export const validateQR = async (req: Request, res: Response): Promise<void> => {
  const client = await pool.connect();

  try {
    const { allocation_id, passkey } = req.body;

    // Validate inputs
    if (!allocation_id || !passkey) {
      res.status(400).json({
        success: false,
        error: 'missing_fields',
        message: 'allocation_id and passkey are required',
      });
      return;
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(allocation_id)) {
      res.status(400).json({
        success: false,
        error: 'invalid_format',
        message: 'Invalid allocation ID format',
      });
      return;
    }

    // Validate passkey format (4 digits)
    if (!/^\d{4}$/.test(passkey)) {
      res.status(400).json({
        success: false,
        error: 'invalid_passkey_format',
        message: 'Passkey must be exactly 4 digits',
      });
      return;
    }

    // Start transaction
    await client.query('BEGIN');

    // 1. Get allocation details
    const allocationResult = await client.query(
      `SELECT 
        ca.*,
        c.cab_number, c.pickup_region, c.passkey as cab_passkey,
        t.trip_title, t.trip_date, t.return_time, t.end_time,
        u.name as student_name, u.email as student_email,
        tu.hall,
        p.payment_status
      FROM cab_allocations ca
      JOIN cabs c ON c.id = ca.cab_id
      JOIN trips t ON t.id = ca.trip_id
      JOIN users u ON u.id = ca.user_id
      JOIN trip_users tu ON tu.trip_id = ca.trip_id AND tu.user_id = ca.user_id
      JOIN payments p ON p.id = tu.payment_id
      WHERE ca.id = $1`,
      [allocation_id]
    );

    if (allocationResult.rows.length === 0) {
      await client.query('ROLLBACK');
      res.status(404).json({
        success: false,
        error: 'not_found',
        message: 'Invalid QR code or allocation not found',
      });
      return;
    }

    const allocation = allocationResult.rows[0];

    // 2. Check payment status
    if (allocation.payment_status !== 'confirmed') {
      await client.query('ROLLBACK');
      res.status(400).json({
        success: false,
        error: 'payment_pending',
        message: 'Payment not confirmed for this booking',
      });
      return;
    }

    // 3. Determine journey type based on current time
    const now = new Date();
    const returnTime = new Date(allocation.return_time);
    const journeyType = now < returnTime ? 'pickup' : 'dropoff';

    // 4. Check if already scanned for this journey type
    const existingScanResult = await client.query(
      `SELECT * FROM journeys
       WHERE trip_id = $1 AND user_id = $2 AND journey_type = $3`,
      [allocation.trip_id, allocation.user_id, journeyType]
    );

    if (existingScanResult.rows.length > 0) {
      const scan = existingScanResult.rows[0];
      await client.query('ROLLBACK');
      res.status(409).json({
        success: false,
        error: 'already_boarded',
        message: `Student already boarded for ${journeyType}`,
        details: {
          previous_scan_time: scan.journey_date_time,
          cab_number: allocation.cab_number,
        },
      });
      return;
    }

    // 5. Get the cab that matches the entered passkey
    const scannedCabResult = await client.query(
      `SELECT * FROM cabs
       WHERE trip_id = $1 AND passkey = $2`,
      [allocation.trip_id, passkey]
    );

    if (scannedCabResult.rows.length === 0) {
      await client.query('ROLLBACK');
      res.status(401).json({
        success: false,
        error: 'invalid_passkey',
        message: 'Incorrect passkey for this trip',
        details: {
          attempts_remaining: null, // Can implement rate limiting here
        },
      });
      return;
    }

    const scannedCab = scannedCabResult.rows[0];

    // 6. OUTBOUND: Check if scanned cab matches assigned cab
    if (journeyType === 'pickup') {
      if (scannedCab.id !== allocation.cab_id) {
        await client.query('ROLLBACK');
        res.status(400).json({
          success: false,
          error: 'wrong_cab',
          message: 'Student assigned to different cab',
          details: {
            assigned_cab: allocation.cab_number,
            assigned_pickup: allocation.pickup_region,
            your_cab: scannedCab.cab_number,
          },
        });
        return;
      }
    }

    // 7. RETURN: Any valid passkey accepted (already validated above)

    // 8. Log journey with the ACTUAL cab that scanned
    await client.query(
      `INSERT INTO journeys (
        trip_id, user_id, cab_id, journey_type, journey_date_time
      ) VALUES ($1, $2, $3, $4, NOW())`,
      [allocation.trip_id, allocation.user_id, scannedCab.id, journeyType]
    );

    // Commit transaction
    await client.query('COMMIT');

    // 9. Return success
    res.status(200).json({
      success: true,
      journey_type: journeyType,
      message: `${journeyType === 'pickup' ? 'Outbound' : 'Return'} boarding validated successfully`,
      data: {
        student_name: allocation.student_name,
        student_hall: allocation.hall,
        cab_number: scannedCab.cab_number,
        scan_time: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error validating QR:', error);
    res.status(500).json({
      success: false,
      error: 'server_error',
      message: 'Failed to validate QR code',
      details: error.message,
    });
  } finally {
    client.release();
  }
};

// ====================================
// GET CAB DETAILS (for student cab view)
// ====================================
export const getCabDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const { allocationId } = req.params;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(allocationId)) {
      res.status(400).json({
        success: false,
        error: 'invalid_format',
        message: 'Invalid allocation ID format',
      });
      return;
    }

    // Get cab_id from the allocation
    const allocationResult = await pool.query(
      `SELECT cab_id, trip_id, user_id 
       FROM cab_allocations 
       WHERE id = $1`,
      [allocationId]
    );

    if (allocationResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'not_found',
        message: 'Allocation not found',
      });
      return;
    }

    const { cab_id, trip_id, user_id } = allocationResult.rows[0];

    // Check if user has paid for this trip
    const paymentCheck = await pool.query(
      `SELECT p.payment_status
       FROM trip_users tu
       JOIN payments p ON tu.payment_id = p.id
       WHERE tu.trip_id = $1 AND tu.user_id = $2`,
      [trip_id, user_id]
    );

    if (paymentCheck.rows.length === 0 || paymentCheck.rows[0].payment_status !== 'confirmed') {
      res.status(403).json({
        success: false,
        error: 'payment_required',
        message: 'Payment not confirmed for this trip',
      });
      return;
    }

    // Fetch cab details (WITHOUT passkey - students shouldn't see it)
    const cabResult = await pool.query(
      `SELECT 
        c.id,
        c.cab_number,
        c.cab_type,
        c.cab_capacity as capacity,
        c.cab_owner_name as driver_name,
        c.cab_owner_phone as driver_phone,
        c.pickup_region
      FROM cabs c
      WHERE c.id = $1`,
      [cab_id]
    );

    if (cabResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'not_found',
        message: 'Cab not found',
      });
      return;
    }

    const cab = cabResult.rows[0];

    // Fetch all students in this cab
    const studentsResult = await pool.query(
      `SELECT 
        ca.user_id,
        ca.id as booking_id,
        u.name,
        u.email,
        u.phone_number,
        u.profile_picture,
        tu.hall,
        1 as seat_position
      FROM cab_allocations ca
      JOIN users u ON ca.user_id = u.id
      JOIN trip_users tu ON tu.user_id = ca.user_id AND tu.trip_id = ca.trip_id
      WHERE ca.cab_id = $1
      ORDER BY ca.created_at ASC`,
      [cab_id]
    );

    // Map students to seat positions
    const assignedStudents = studentsResult.rows.map((s: any, idx: number) => ({
      user_id: s.user_id,
      booking_id: s.booking_id,
      name: s.name,
      email: s.email,
      phone_number: s.phone_number,
      profile_picture: s.profile_picture,
      hall: s.hall,
      seat_position: idx + 1, // Assign seat positions sequentially
    }));

    res.status(200).json({
      success: true,
      data: {
        ...cab,
        assigned_students: assignedStudents,
      },
    });
  } catch (error: any) {
    console.error('Error fetching cab details:', error);
    res.status(500).json({
      success: false,
      error: 'server_error',
      message: 'Failed to fetch cab details',
      details: error.message,
    });
  }
};

