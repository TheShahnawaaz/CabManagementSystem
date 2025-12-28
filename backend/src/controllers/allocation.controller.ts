import { Request, Response } from 'express';
import pool from '../config/database';
import {
  solveCabAllocation,
  convertHallDemandToRegions,
  REGION_TO_HALL,
} from '../utils/cabSolver';

/**
 * Allocation Controller
 * Handles cab allocation operations for trips
 */

// ====================================
// HELPER: Generate unique 4-digit passkey
// ====================================
async function generateUniquePasskey(tripId: string): Promise<string> {
  let attempts = 0;
  const maxAttempts = 100;
  
  while (attempts < maxAttempts) {
    const passkey = Math.floor(1000 + Math.random() * 9000).toString();
    
    // Check if passkey already exists for this trip
    const existing = await pool.query(
      'SELECT id FROM cabs WHERE trip_id = $1 AND passkey = $2',
      [tripId, passkey]
    );
    
    if (existing.rows.length === 0) {
      return passkey;
    }
    
    attempts++;
  }
  
  throw new Error('Failed to generate unique passkey');
}

// ====================================
// RUN ALLOCATION ALGORITHM
// ====================================
export const runAllocation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tripId } = req.params;

    if (!tripId) {
      res.status(400).json({
        success: false,
        error: 'Trip ID is required',
      });
      return;
    }

    // 1. Get hall-wise student demand
    const demandResult = await pool.query(
      `SELECT 
        hall,
        COUNT(*)::int as count
      FROM trip_users
      WHERE trip_id = $1
      GROUP BY hall
      ORDER BY hall`,
      [tripId]
    );

    if (demandResult.rows.length === 0) {
      res.status(400).json({
        success: false,
        error: 'No students have booked this trip yet',
      });
      return;
    }

    const hallDemand = demandResult.rows;
    const totalStudents = hallDemand.reduce((sum: number, row: any) => sum + row.count, 0);

    // 2. Run solver
    const studentsPerRegion = convertHallDemandToRegions(hallDemand);
    const solverResult = solveCabAllocation(studentsPerRegion);

    // 3. Get all students with details for random assignment
    const studentsResult = await pool.query(
      `SELECT 
        tu.id as booking_id,
        tu.user_id,
        tu.hall,
        u.name,
        u.email,
        u.phone_number,
        u.profile_picture
      FROM trip_users tu
      JOIN users u ON tu.user_id = u.id
      WHERE tu.trip_id = $1
      ORDER BY tu.created_at ASC`,
      [tripId]
    );

    const allStudents = studentsResult.rows;

    // 4. Create suggested cab allocations
    const cabs: any[] = [];
    let cabCounter = 1;

    for (let regionIdx = 0; regionIdx < 7; regionIdx++) {
      const numCabs = solverResult.numCabsPerRegion[regionIdx];
      
      if (numCabs === 0) continue;

      const pickupRegion = REGION_TO_HALL[regionIdx];
      
      // Get students that should be assigned to this region
      const studentsForRegion: any[] = [];
      
      for (let originIdx = 0; originIdx < 7; originIdx++) {
        const count = solverResult.assignments[originIdx][regionIdx];
        if (count > 0) {
          const originHall = REGION_TO_HALL[originIdx];
          const studentsFromOrigin = allStudents.filter(s => s.hall === originHall);
          studentsForRegion.push(...studentsFromOrigin.splice(0, count));
        }
      }

      // Distribute students across cabs for this region
      for (let cabIdx = 0; cabIdx < numCabs; cabIdx++) {
        const capacity = 7;
        const assignedStudents = studentsForRegion.splice(0, capacity);
        
        const passkey = await generateUniquePasskey(tripId);

        cabs.push({
          temp_id: `temp_${cabCounter++}`,
          pickup_region: pickupRegion,
          capacity: 7,
          cab_number: '',
          cab_type: 'Omni',
          driver_name: '',
          driver_phone: '',
          passkey: passkey,
          assigned_students: assignedStudents.map((student, idx) => ({
            user_id: student.user_id,
            booking_id: student.booking_id,
            name: student.name,
            email: student.email,
            phone_number: student.phone_number,
            profile_picture: student.profile_picture,
            hall: student.hall,
            seat_position: idx + 1,
          })),
        });
      }
    }

    res.status(200).json({
      success: true,
      data: {
        total_students: totalStudents,
        total_cabs: cabs.length,
        solver_cost: solverResult.objectiveValue,
        cabs,
      },
    });
  } catch (error: any) {
    console.error('Error running allocation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to run allocation algorithm',
    });
  }
};

// ====================================
// GET ALLOCATION (if exists)
// ====================================
export const getAllocation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tripId } = req.params;

    if (!tripId) {
      res.status(400).json({
        success: false,
        error: 'Trip ID is required',
      });
      return;
    }

    // Check if allocation exists
    const cabsResult = await pool.query(
      `SELECT 
        c.id,
        c.cab_number,
        c.cab_type,
        c.cab_capacity as capacity,
        c.cab_owner_name as driver_name,
        c.cab_owner_phone as driver_phone,
        c.pickup_region,
        c.passkey,
        COUNT(ca.id)::int as assigned_count
      FROM cabs c
      LEFT JOIN cab_allocations ca ON c.id = ca.cab_id
      WHERE c.trip_id = $1
      GROUP BY c.id
      ORDER BY c.created_at ASC`,
      [tripId]
    );

    if (cabsResult.rows.length === 0) {
      // No allocation exists, return demand summary only
      const demandResult = await pool.query(
        `SELECT 
          hall,
          COUNT(*)::int as count
        FROM trip_users
        WHERE trip_id = $1
        GROUP BY hall
        ORDER BY hall`,
        [tripId]
      );

      res.status(200).json({
        success: true,
        data: {
          has_allocation: false,
          demand_summary: demandResult.rows,
        },
      });
      return;
    }

    // Get students for each cab
    const cabs = await Promise.all(
      cabsResult.rows.map(async (cab: any) => {
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
          [cab.id]
        );

        return {
          id: cab.id,
          pickup_region: cab.pickup_region,
          capacity: cab.capacity,
          cab_number: cab.cab_number,
          cab_type: cab.cab_type,
          driver_name: cab.driver_name,
          driver_phone: cab.driver_phone,
          passkey: cab.passkey,
          assigned_students: studentsResult.rows.map((s: any, idx: number) => ({
            ...s,
            phone_number: s.phone_number,
            seat_position: idx + 1,
          })),
        };
      })
    );

    const totalStudents = cabs.reduce((sum, cab) => sum + cab.assigned_students.length, 0);

    res.status(200).json({
      success: true,
      data: {
        has_allocation: true,
        total_students: totalStudents,
        total_cabs: cabs.length,
        cabs,
      },
    });
  } catch (error: any) {
    console.error('Error fetching allocation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch allocation',
    });
  }
};

// ====================================
// SUBMIT ALLOCATION
// ====================================
export const submitAllocation = async (req: Request, res: Response): Promise<void> => {
  const client = await pool.connect();
  
  try {
    const { tripId } = req.params;
    const { cabs } = req.body;

    if (!tripId || !cabs || !Array.isArray(cabs)) {
      res.status(400).json({
        success: false,
        error: 'Trip ID and cabs array are required',
      });
      return;
    }

    // Get all booked students
    const bookingsResult = await client.query(
      'SELECT user_id FROM trip_users WHERE trip_id = $1',
      [tripId]
    );
    const bookedStudentIds = bookingsResult.rows.map((row: any) => row.user_id);

    // Validation
    const assignedStudentIds: string[] = [];
    const cabNumbers: string[] = [];
    const passkeys: string[] = [];

    for (const cab of cabs) {
      // Required fields
      if (!cab.cab_number || !cab.driver_name || !cab.pickup_region || !cab.passkey || !cab.cab_type || !cab.driver_phone) {
        res.status(400).json({
          success: false,
          error: 'All cab fields (cab_number, driver_name, driver_phone, cab_type, pickup_region, passkey) are required',
        });
        return;
      }

      // Capacity check
      if (!cab.assigned_students || cab.assigned_students.length === 0 || cab.assigned_students.length > 7) {
        res.status(400).json({
          success: false,
          error: 'Each cab must have 1-7 students assigned',
        });
        return;
      }

      // Duplicate cab number check
      if (cabNumbers.includes(cab.cab_number)) {
        res.status(400).json({
          success: false,
          error: `Duplicate cab number: ${cab.cab_number}`,
        });
        return;
      }
      cabNumbers.push(cab.cab_number);

      // Duplicate passkey check
      if (passkeys.includes(cab.passkey)) {
        res.status(400).json({
          success: false,
          error: `Duplicate passkey: ${cab.passkey}`,
        });
        return;
      }
      passkeys.push(cab.passkey);

      // Collect assigned students
      for (const student of cab.assigned_students) {
        if (assignedStudentIds.includes(student.user_id)) {
          res.status(400).json({
            success: false,
            error: `Student ${student.name} is assigned to multiple cabs`,
          });
          return;
        }
        assignedStudentIds.push(student.user_id);
      }
    }

    // Check if all booked students are assigned
    const unassignedStudents = bookedStudentIds.filter(id => !assignedStudentIds.includes(id));
    if (unassignedStudents.length > 0) {
      res.status(400).json({
        success: false,
        error: `${unassignedStudents.length} student(s) are not assigned to any cab`,
      });
      return;
    }

    // Transaction: Save to database
    await client.query('BEGIN');

    // Clear existing allocation
    await client.query('DELETE FROM cab_allocations WHERE trip_id = $1', [tripId]);
    await client.query('DELETE FROM cabs WHERE trip_id = $1', [tripId]);

    // Insert cabs and allocations
    for (const cab of cabs) {
      const cabResult = await client.query(
        `INSERT INTO cabs (trip_id, cab_number, cab_capacity, cab_type, cab_owner_name, cab_owner_phone, pickup_region, passkey)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id`,
        [tripId, cab.cab_number, cab.capacity || 7, cab.cab_type, cab.driver_name, cab.driver_phone, cab.pickup_region, cab.passkey]
      );

      const cabId = cabResult.rows[0].id;

      // Insert allocations
      for (const student of cab.assigned_students) {
        await client.query(
          `INSERT INTO cab_allocations (trip_id, user_id, cab_id)
           VALUES ($1, $2, $3)`,
          [tripId, student.user_id, cabId]
        );
      }
    }

    await client.query('COMMIT');

    res.status(200).json({
      success: true,
      message: 'Allocation saved successfully',
    });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error submitting allocation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save allocation',
    });
  } finally {
    client.release();
  }
};

// ====================================
// CLEAR ALLOCATION
// ====================================
export const clearAllocation = async (req: Request, res: Response): Promise<void> => {
  const client = await pool.connect();
  
  try {
    const { tripId } = req.params;

    if (!tripId) {
      res.status(400).json({
        success: false,
        error: 'Trip ID is required',
      });
      return;
    }

    await client.query('BEGIN');

    await client.query('DELETE FROM cab_allocations WHERE trip_id = $1', [tripId]);
    await client.query('DELETE FROM cabs WHERE trip_id = $1', [tripId]);

    await client.query('COMMIT');

    res.status(200).json({
      success: true,
      message: 'Allocation cleared successfully',
    });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error clearing allocation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear allocation',
    });
  } finally {
    client.release();
  }
};
