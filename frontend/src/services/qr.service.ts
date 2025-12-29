import { apiClient } from "@/lib/api";
import type { ApiResponse } from "@/types/api.types";

/**
 * QR API Service
 *
 * Handles QR code validation for driver scanning
 */

// Types for QR validation
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

export interface QRValidationRequest {
  allocation_id: string;
  passkey: string;
}

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

export const qrApi = {
  /**
   * Get allocation data for QR display (driver scan page)
   */
  async getQRData(
    allocationId: string
  ): Promise<ApiResponse<QRAllocationData>> {
    return apiClient.get(`/qr/${allocationId}`);
  },

  /**
   * Validate passkey and log journey
   */
  async validateQR(
    data: QRValidationRequest
  ): Promise<QRValidationSuccess> {
    return apiClient.post("/qr/validate", data);
  },
};

