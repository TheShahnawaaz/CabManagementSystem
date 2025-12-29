import type { Hall } from "./booking.types";

// ====================================
// JOURNEY TYPES
// ====================================

// Student who boarded outbound (allocated to this cab)
export interface OutboundStudent {
  user_id: string;
  name: string;
  email: string;
  phone_number: string | null;
  profile_picture: string | null;
  hall: Hall;
  seat_position: number | string; // Backend returns string from ROW_NUMBER()
  scan_time: string; // Scan timestamp
}

// Student who boarded return (can be from ANY allocation)
export interface ReturnStudent {
  user_id: string;
  name: string;
  email: string;
  phone_number: string | null;
  profile_picture: string | null;
  hall: Hall;
  seat_position: number | string; // Backend returns string from ROW_NUMBER()
  scan_time: string; // Scan timestamp
}

// Student allocated but didn't board outbound
export interface OutboundNoShowStudent {
  user_id: string;
  name: string;
  email: string;
  phone_number: string | null;
  profile_picture: string | null;
  hall: Hall;
  seat_position: number | string; // Backend returns string from ROW_NUMBER()
  // No scan time - they didn't board
}

// Journey cab with separated student lists
export interface JourneyCab {
  cab_id: string;
  cab_number: string;
  cab_type: string;
  pickup_region: Hall;
  capacity: number;
  driver_name: string;
  driver_phone: string;
  passkey: string;

  // Students who boarded THIS cab for outbound (allocated to this cab)
  outbound_students: OutboundStudent[];

  // Students who boarded THIS cab for return (from ANY allocation)
  return_students: ReturnStudent[];

  // Students allocated to this cab who didn't board outbound
  outbound_noshow_students: OutboundNoShowStudent[];
}

// Global no-show student (with allocation info)
export interface GlobalNoShowStudent {
  user_id: string;
  name: string;
  email: string;
  phone_number: string | null;
  profile_picture: string | null;
  hall: Hall;
  allocated_cab_number: string;
  allocated_cab_region: Hall;
}

// Summary statistics
export interface JourneySummary {
  total_bookings: number;
  total_allocations: number;
  total_cabs: number;
  outbound_boarded: number;
  outbound_no_shows: number;
  return_boarded: number;
  return_no_shows: number;
}

// Complete API response
export interface TripJourneyData {
  summary: JourneySummary;
  cabs: JourneyCab[];
  outbound_no_shows: GlobalNoShowStudent[]; // All students allocated but didn't board outbound
  return_no_shows: GlobalNoShowStudent[]; // All students who didn't board any cab for return
}
