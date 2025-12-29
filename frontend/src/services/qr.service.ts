import { apiClient } from "@/lib/api";
import type { ApiResponse } from "@/types/api.types";
import type {
  QRAllocationData,
  QRValidationRequest,
  QRValidationSuccess,
  CabDetails,
} from "@/types/qr.types";

/**
 * QR API Service
 *
 * Handles QR code validation for driver scanning
 * Also provides cab details for student view
 */

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
  async validateQR(data: QRValidationRequest): Promise<QRValidationSuccess> {
    return apiClient.post("/qr/validate", data);
  },

  /**
   * Get cab details and all co-travelers for student view
   */
  async getCabDetails(allocationId: string): Promise<ApiResponse<CabDetails>> {
    return apiClient.get(`/qr/cab/${allocationId}`);
  },
};
