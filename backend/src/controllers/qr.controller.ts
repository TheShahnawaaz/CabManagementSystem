import { Request, Response } from 'express';
import pool from '../config/database';
import { notifyJourneyLogged } from '../services/notification.service';
import { logActivity } from '../services/activity.service';

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
    const allocationId = req.params.allocationId as string;

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
        t.departure_time,
        t.prayer_time,
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

    // Determine journey type based on current time vs prayer_time
    // Before prayer = outbound (pickup), after prayer = return (dropoff)
    const now = new Date();
    const prayerTime = new Date(allocation.prayer_time);
    const journeyType = now < prayerTime ? 'pickup' : 'dropoff';

    // Return allocation data (without passkey - that's validated separately)
    // Note: departure_time is shown to users, prayer_time is only used for journey type logic
    res.status(200).json({
      success: true,
      data: {
        allocation_id: allocation.allocation_id,
        trip_title: allocation.trip_title,
        trip_date: allocation.trip_date,
        departure_time: allocation.departure_time,
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
        t.trip_title, t.trip_date, t.departure_time, t.prayer_time, t.end_time,
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

    // 3. Determine journey type based on current time vs prayer_time
    // Before prayer = outbound (pickup), after prayer = return (dropoff)
    const now = new Date();
    const prayerTime = new Date(allocation.prayer_time);
    const journeyType = now < prayerTime ? 'pickup' : 'dropoff';

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


    // 8. Number of scanned for a journey type for a cab should not exceed cab capacity
    const cabCapacity = scannedCab.cab_capacity;
    const cabScanCountResult = await client.query(
      `SELECT COUNT(*) FROM journeys
        WHERE trip_id = $1 AND cab_id = $2 AND journey_type = $3`,
      [allocation.trip_id, scannedCab.id, journeyType]
    );
    const cabScanCount = parseInt(cabScanCountResult.rows[0].count, 10);
    if (cabScanCount >= cabCapacity) {
      await client.query('ROLLBACK');
      res.status(400).json({
        success: false,
        error: 'This cab has reached its capacity for this journey',
        details: {
          cab_number: scannedCab.cab_number,
          cab_capacity: cabCapacity,
          current_boarded: cabScanCount,
        },
      });
      return;
    }

    // 9. Log journey with the ACTUAL cab that scanned (boarded_by='driver')
    await client.query(
      `INSERT INTO journeys (
        trip_id, user_id, cab_id, journey_type, journey_date_time, boarded_by
      ) VALUES ($1, $2, $3, $4, NOW(), 'driver')`,
      [allocation.trip_id, allocation.user_id, scannedCab.id, journeyType]
    );

    // Commit transaction
    await client.query('COMMIT');

    // 10. Send journey notification (async, don't block response)
    // Note: 'now' was already declared at line 205 for journey type check
    const scanTime = new Date();
    notifyJourneyLogged({
      userId: allocation.user_id,
      tripTitle: allocation.trip_title,
      tripDate: new Date(allocation.trip_date).toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'Asia/Kolkata',
      }),
      journeyTime: scanTime.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Kolkata',
      }),
      cabNumber: scannedCab.cab_number,
      journeyType: journeyType as 'pickup' | 'return',
    }).catch((err) => {
      console.error('Failed to send journey notification:', err);
    });

    // 11. Return success
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
// ADMIN BOARD STUDENT (without QR/passkey)
// ====================================
/**
 * Admin can board any student directly without QR scan or passkey
 * - Pickup (outbound): Student can only board their assigned cab
 * - Dropoff (return): Student can board any cab
 */
export const adminBoardStudent = async (req: Request, res: Response): Promise<void> => {
  const client = await pool.connect();

  try {
    const tripId = req.params.tripId as string;
    const { user_id, cab_id, journey_type } = req.body;

    // 1. Validate inputs and UUID formats
    if (!tripId || !user_id || !cab_id || !journey_type) {
      res.status(400).json({
        success: false,
        error: 'tripId, user_id, cab_id, and journey_type are required',
      });
      return;
    }

    // Validate UUID format for tripId, user_id, and cab_id
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(tripId)) {
      res.status(400).json({
        success: false,
        error: 'invalid_format',
        message: 'Invalid trip ID format',
      });
      return;
    }
    if (!uuidRegex.test(user_id)) {
      res.status(400).json({
        success: false,
        error: 'invalid_format',
        message: 'Invalid user ID format',
      });
      return;
    }
    if (!uuidRegex.test(cab_id)) {
      res.status(400).json({
        success: false,
        error: 'invalid_format',
        message: 'Invalid cab ID format',
      });
      return;
    }

    // 2. Validate journey_type
    if (!['pickup', 'dropoff'].includes(journey_type)) {
      res.status(400).json({
        success: false,
        error: 'journey_type must be "pickup" or "dropoff"',
      });
      return;
    }

    // Start transaction
    await client.query('BEGIN');

    // 3. Check if trip exists
    const tripResult = await client.query(
      'SELECT id, trip_title, trip_date FROM trips WHERE id = $1',
      [tripId]
    );

    if (tripResult.rows.length === 0) {
      await client.query('ROLLBACK');
      res.status(404).json({
        success: false,
        error: 'Trip not found',
      });
      return;
    }

    const trip = tripResult.rows[0];

    // 4. Check if student has a confirmed booking for this trip
    const bookingResult = await client.query(
      `SELECT tu.*, p.payment_status
       FROM trip_users tu
       JOIN payments p ON p.id = tu.payment_id
       WHERE tu.trip_id = $1 AND tu.user_id = $2`,
      [tripId, user_id]
    );

    if (bookingResult.rows.length === 0) {
      await client.query('ROLLBACK');
      res.status(404).json({
        success: false,
        error: 'Student does not have a booking for this trip',
      });
      return;
    }

    const booking = bookingResult.rows[0];

    // 5. Check payment status
    if (booking.payment_status !== 'confirmed') {
      await client.query('ROLLBACK');
      res.status(400).json({
        success: false,
        error: 'Payment not confirmed for this booking',
      });
      return;
    }

    // 6. Check if cab exists and belongs to this trip
    const cabResult = await client.query(
      'SELECT * FROM cabs WHERE id = $1 AND trip_id = $2',
      [cab_id, tripId]
    );

    if (cabResult.rows.length === 0) {
      await client.query('ROLLBACK');
      res.status(404).json({
        success: false,
        error: 'Cab not found for this trip',
      });
      return;
    }

    const cab = cabResult.rows[0];

    // 7. Check if student is already boarded for this journey type
    const existingScanResult = await client.query(
      `SELECT * FROM journeys
       WHERE trip_id = $1 AND user_id = $2 AND journey_type = $3`,
      [tripId, user_id, journey_type]
    );

    if (existingScanResult.rows.length > 0) {
      const scan = existingScanResult.rows[0];
      await client.query('ROLLBACK');
      res.status(409).json({
        success: false,
        error: `Student already boarded for ${journey_type}`,
        details: {
          previous_scan_time: scan.journey_date_time,
        },
      });
      return;
    }

    // 8. Get student's cab allocation (assigned cab)
    const allocationResult = await client.query(
      `SELECT ca.*
       FROM cab_allocations ca
       WHERE ca.trip_id = $1 AND ca.user_id = $2`,
      [tripId, user_id]
    );

    if (allocationResult.rows.length === 0) {
      await client.query('ROLLBACK');
      res.status(400).json({
        success: false,
        error: 'Student has no cab allocation for this trip',
      });
      return;
    }

    const allocation = allocationResult.rows[0];

    // 9. PICKUP: Check if selected cab matches assigned cab
    if (journey_type === 'pickup') {
      if (cab_id !== allocation.cab_id) {
        await client.query('ROLLBACK');
        res.status(400).json({
          success: false,
          error: 'For pickup, student must board their assigned cab',
          details: {
            assigned_cab_id: allocation.cab_id,
            selected_cab_number: cab.cab_number,
          },
        });
        return;
      }
    }

    // 10. DROPOFF: Any cab is allowed (no additional check needed)


    // 11. Number of scanned for a journey type for a cab should not exceed cab capacity
    const cabCapacity = cab.cab_capacity;
    const cabScanCountResult = await client.query(
      `SELECT COUNT(*) FROM journeys
        WHERE trip_id = $1 AND cab_id = $2 AND journey_type = $3`,
      [tripId, cab_id, journey_type]
    );
    const cabScanCount = parseInt(cabScanCountResult.rows[0].count, 10);
    if (cabScanCount >= cabCapacity) {
      await client.query('ROLLBACK');
      res.status(400).json({
        success: false,
        error: 'This cab has reached its capacity for this journey',
        details: {
          cab_number: cab.cab_number,
          cab_capacity: cabCapacity,
          current_boarded: cabScanCount,
        },
      });
      return;
    }

    // 12. Insert journey record (with boarded_by='admin' and admin's user_id)
    const adminUserId = req.user?.id;
    await client.query(
      `INSERT INTO journeys (
        trip_id, user_id, cab_id, journey_type, journey_date_time, boarded_by, boarded_by_user_id
      ) VALUES ($1, $2, $3, $4, NOW(), 'admin', $5)`,
      [tripId, user_id, cab_id, journey_type, adminUserId]
    );

    // Commit transaction
    await client.query('COMMIT');

    // 13. Send notification (async, don't block response)
    const scanTime = new Date();
    notifyJourneyLogged({
      userId: user_id,
      tripTitle: trip.trip_title,
      tripDate: new Date(trip.trip_date).toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'Asia/Kolkata',
      }),
      journeyTime: scanTime.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Kolkata',
      }),
      cabNumber: cab.cab_number,
      journeyType: journey_type as 'pickup' | 'return',
    }).catch((err) => {
      console.error('Failed to send journey notification:', err);
    });

    // 14. Return success
    res.status(200).json({
      success: true,
      message: `Student boarded successfully for ${journey_type}`,
      data: {
        student_hall: booking.hall,
        cab_number: cab.cab_number,
        journey_type: journey_type,
        boarded_at: scanTime.toISOString(),
        boarded_by: 'admin',
        boarded_by_user_id: adminUserId,
      },
    });

    // 15. Log activity (fire-and-forget)
    logActivity({
      userId: adminUserId,
      targetUserId: user_id,
      actionType: 'USER_BOARDED',
      entityType: 'journey',
      entityId: tripId,
      details: { journey_type, cab_number: cab.cab_number },
    });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error in admin board student:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to board student',
      details: error.message,
    });
  } finally {
    client.release();
  }
};

// ====================================
// ADMIN UNBOARD STUDENT (undo any boarding for pickup or return)
// ====================================
/**
 * Admin can unboard a student (pickup or return journey)
 * - Work for both admin and driver boarded students
 * - Works for both pickup and dropoff journeys
 */
export const adminUnboardStudent = async (req: Request, res: Response): Promise<void> => {
  const client = await pool.connect();

  try {
    const tripId = req.params.tripId as string;
    const { user_id, journey_type } = req.body;

    // 1. Validate inputs
    if (!tripId || !user_id || !journey_type) {
      res.status(400).json({
        success: false,
        error: 'tripId, user_id, and journey_type are required',
      });
      return;
    }

    // Validate UUID format for tripId and user_id
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(tripId)) {
      res.status(400).json({
        success: false,
        error: 'invalid_format',
        message: 'Invalid trip ID format',
      });
      return;
    }
    if (!uuidRegex.test(user_id)) {
      res.status(400).json({
        success: false,
        error: 'invalid_format',
        message: 'Invalid user ID format',
      });
      return;
    }

    // Validate journey_type
    if (!['pickup', 'dropoff'].includes(journey_type)) {
      res.status(400).json({
        success: false,
        error: 'journey_type must be pickup or dropoff',
      });
      return;
    }

    // Start transaction
    await client.query('BEGIN');

    // 3. Delete the journey record
    const deleteResult = await client.query(
      `DELETE FROM journeys 
       WHERE trip_id = $1 AND user_id = $2 AND journey_type = $3`,
      [tripId, user_id, journey_type]
    );
    // If no journey record was deleted, roll back and return an error
    if (!deleteResult || deleteResult.rowCount === 0) {
      await client.query('ROLLBACK');
      res.status(404).json({
        success: false,
        error: 'journey_not_found',
        message: 'No matching journey record found to unboard for the given trip, user, and journey_type',
      });
      return;
    }

    // Commit transaction
    await client.query('COMMIT');

    // 4. Return success
    res.status(200).json({
      success: true,
      message: `Student unboarded successfully from ${journey_type} journey`,
      data: {
        journey_type: journey_type,
        unboarded_at: new Date().toISOString(),
      },
    });

    // 5. Log activity (fire-and-forget)
    logActivity({
      userId: req.user?.id,
      targetUserId: user_id,
      actionType: 'USER_UNBOARDED',
      entityType: 'journey',
      entityId: tripId,
      details: { journey_type },
    });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error in admin unboard student:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to unboard student',
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
  const client = await pool.connect();
  
  try {
    const allocationId = req.params.allocationId as string;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(allocationId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid allocation ID format',
      });
      return;
    }

    // Start transaction for consistent read
    await client.query('BEGIN');

    // Get cab_id from the allocation
    const allocationResult = await client.query(
      `SELECT cab_id, trip_id, user_id 
       FROM cab_allocations 
       WHERE id = $1`,
      [allocationId]
    );

    if (allocationResult.rows.length === 0) {
      await client.query('ROLLBACK');
      res.status(404).json({
        success: false,
        error: 'Allocation not found',
      });
      return;
    }

    const { cab_id, trip_id, user_id } = allocationResult.rows[0];

    // Check if user has paid for this trip
    const paymentCheck = await client.query(
      `SELECT p.payment_status
       FROM trip_users tu
       JOIN payments p ON tu.payment_id = p.id
       WHERE tu.trip_id = $1 AND tu.user_id = $2`,
      [trip_id, user_id]
    );

    if (paymentCheck.rows.length === 0 || paymentCheck.rows[0].payment_status !== 'confirmed') {
      await client.query('ROLLBACK');
      res.status(403).json({
        success: false,
        error: 'payment_required',
        message: 'Payment not confirmed for this trip',
      });
      return;
    }

    // Fetch cab details (WITHOUT passkey - students shouldn't see it)
    const cabResult = await client.query(
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
      await client.query('ROLLBACK');
      res.status(404).json({
        success: false,
        error: 'not_found',
        message: 'Cab not found',
      });
      return;
    }

    const cab = cabResult.rows[0];

    // Fetch all students in this cab
    const studentsResult = await client.query(
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

    // Fetch ALL OTHER cabs for this trip (for return journey options)
    // Only return driver details and starting point - no passenger info
    const otherCabsResult = await client.query(
      `SELECT 
        c.id,
        c.cab_number,
        c.cab_type,
        c.cab_owner_name as driver_name,
        c.cab_owner_phone as driver_phone,
        c.pickup_region
      FROM cabs c
      WHERE c.trip_id = $1 AND c.id != $2
      ORDER BY c.pickup_region, c.cab_number`,
      [trip_id, cab_id]
    );

    const otherCabs = otherCabsResult.rows;

    // Commit transaction
    await client.query('COMMIT');

    res.status(200).json({
      success: true,
      data: {
        ...cab,
        assigned_students: assignedStudents,
        other_cabs: otherCabs,
      },
    });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error fetching cab details:', error);
    res.status(500).json({
      success: false,
      error: 'server_error',
      message: 'Failed to fetch cab details',
      details: error.message,
    });
  } finally {
    client.release();
  }
};

