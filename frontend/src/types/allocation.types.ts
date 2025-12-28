// ====================================
// ALLOCATION TYPES
// ====================================

// Note: Hall type is defined in booking.types.ts
import type { Hall } from './booking.types';
export type { Hall };

export interface AssignedStudent {
  user_id: string;
  booking_id: string;
  name: string;
  email: string;
  phone_number: string | null;
  profile_picture: string | null;
  hall: Hall;
  seat_position: string | number; // Seat ID (F1, M1, etc.) or position number
}

export interface CabAllocation {
  id?: string; // Present if saved to DB
  temp_id?: string; // Present in suggested allocation
  pickup_region: Hall;
  capacity: number;
  cab_number: string;
  cab_type: string;
  driver_name: string;
  driver_phone: string;
  passkey: string;
  assigned_students: AssignedStudent[];
}

export interface AllocationSuggestion {
  total_students: number;
  total_cabs: number;
  solver_cost: number;
  cabs: CabAllocation[];
}

export interface AllocationState {
  has_allocation: boolean;
  total_students?: number;
  total_cabs?: number;
  cabs?: CabAllocation[];
  demand_summary?: DemandSummary[];
}

export interface DemandSummary {
  hall: Hall;
  count: number;
}

export interface SubmitAllocationData {
  cabs: CabAllocation[];
}

// Student option for seat selection dropdown
export interface StudentOption {
  user_id: string;
  name: string;
  email: string;
  phone_number: string | null;
  profile_picture: string | null;
  hall: Hall;
}

// Seat assignments for vehicle UI
export type SeatPosition = 'F1' | 'M1' | 'M2' | 'M3' | 'B1' | 'B2' | 'B3';
export type SeatAssignments = Record<SeatPosition, string | null>;

// Cab form data for edit page
export interface AllocationFormCab {
  temp_id: string;
  pickup_region: Hall;
  capacity: number;
  cab_number: string;
  cab_type: string;
  driver_name: string;
  driver_phone: string;
  passkey: string;
  seats: SeatAssignments;
}
