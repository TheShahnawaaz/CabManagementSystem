// ====================================
// QR CODE TYPES
// ====================================

import type { AssignedStudent } from "./allocation.types";

/**
 * QR Allocation Data
 * Data displayed when driver scans a student's QR code
 */
export interface QRAllocationData {
  allocation_id: string;
  trip_title: string;
  trip_date: string;
  return_time: string;
  end_time: string;
  student_name: string;
  student_email: string;
  student_hall: string;
  cab_number: string;
  pickup_region: string;
  journey_type: "pickup" | "dropoff";
  current_time: string;
}

/**
 * QR Validation Request
 * Data sent when driver validates passkey
 */
export interface QRValidationRequest {
  allocation_id: string;
  passkey: string;
}

/**
 * QR Validation Success Response
 */
export interface QRValidationSuccess {
  success: true;
  journey_type: "pickup" | "dropoff";
  message: string;
  data: {
    student_name: string;
    student_hall: string;
    cab_number: string;
    scan_time: string;
  };
}

/**
 * QR Validation Error Response
 */
export interface QRValidationError {
  error:
    | "not_found"
    | "invalid_passkey"
    | "wrong_cab"
    | "already_boarded"
    | "payment_pending"
    | "invalid_format"
    | "missing_fields"
    | "server_error";
  message: string;
  details?: {
    assigned_cab?: string;
    assigned_pickup?: string;
    your_cab?: string;
    previous_scan_time?: string;
    attempts_remaining?: number | null;
  };
}

/**
 * Other Cab (for return journey options)
 * Only includes driver details and starting point - no passenger info
 */
export interface OtherCab {
  id: string;
  cab_number: string;
  cab_type: string;
  driver_name: string;
  driver_phone: string;
  pickup_region: string;
}

/**
 * Cab Details (Student View)
 * Note: passkey is NOT included for security - students shouldn't see it
 */
export interface CabDetails {
  id: string;
  cab_number: string;
  cab_type: string;
  capacity: number;
  driver_name: string;
  driver_phone: string;
  pickup_region: string;
  assigned_students: AssignedStudent[];
  other_cabs: OtherCab[];
}
