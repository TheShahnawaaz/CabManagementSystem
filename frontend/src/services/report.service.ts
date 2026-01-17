/**
 * Report Service
 * API calls for the reports module
 */

import { apiClient } from "@/lib/api";
import type { ApiResponse } from "@/types/api.types";
import type {
  ReportFinancials,
  ReportWithAdjustments,
  ReportsSummary,
  TripWithoutReport,
  ReportHistory,
  CreateReportDTO,
  UpdateReportDTO,
  CreateAdjustmentDTO,
  UpdateAdjustmentDTO,
} from "@/types/report.types";

// ====================================
// REPORT API SERVICE
// ====================================

export const reportApi = {
  /**
   * Get all reports with financial summary
   */
  async getReports(): Promise<ApiResponse<ReportFinancials[]>> {
    return apiClient.get("/admin/reports");
  },

  /**
   * Get aggregated summary across all reports
   */
  async getSummary(): Promise<ApiResponse<ReportsSummary>> {
    return apiClient.get("/admin/reports/summary");
  },

  /**
   * Get trips that don't have reports yet
   */
  async getPendingTrips(): Promise<ApiResponse<TripWithoutReport[]>> {
    return apiClient.get("/admin/reports/pending-trips");
  },

  /**
   * Get single report with full details and adjustments
   */
  async getReport(id: string): Promise<ApiResponse<ReportWithAdjustments>> {
    return apiClient.get(`/admin/reports/${id}`);
  },

  /**
   * Check if a trip has a report
   */
  async getReportByTrip(
    tripId: string
  ): Promise<ApiResponse<ReportWithAdjustments | null>> {
    return apiClient.get(`/admin/trips/${tripId}/report`);
  },

  /**
   * Create a new report for a trip
   */
  async createReport(data: CreateReportDTO): Promise<ApiResponse<{ id: string }>> {
    return apiClient.post("/admin/reports", data);
  },

  /**
   * Update an existing report
   */
  async updateReport(id: string, data: UpdateReportDTO): Promise<ApiResponse<void>> {
    return apiClient.patch(`/admin/reports/${id}`, data);
  },

  /**
   * Get edit history for a report
   */
  async getHistory(id: string): Promise<ApiResponse<ReportHistory[]>> {
    return apiClient.get(`/admin/reports/${id}/history`);
  },

  // ====================================
  // ADJUSTMENT ENDPOINTS
  // ====================================

  /**
   * Add an adjustment to a report
   */
  async addAdjustment(
    reportId: string,
    data: CreateAdjustmentDTO
  ): Promise<ApiResponse<{ id: string }>> {
    return apiClient.post(`/admin/reports/${reportId}/adjustments`, data);
  },

  /**
   * Update an adjustment
   */
  async updateAdjustment(
    reportId: string,
    adjustmentId: string,
    data: UpdateAdjustmentDTO
  ): Promise<ApiResponse<void>> {
    return apiClient.patch(
      `/admin/reports/${reportId}/adjustments/${adjustmentId}`,
      data
    );
  },

  /**
   * Delete an adjustment
   */
  async deleteAdjustment(
    reportId: string,
    adjustmentId: string
  ): Promise<ApiResponse<void>> {
    return apiClient.delete(
      `/admin/reports/${reportId}/adjustments/${adjustmentId}`
    );
  },
};

export default reportApi;
