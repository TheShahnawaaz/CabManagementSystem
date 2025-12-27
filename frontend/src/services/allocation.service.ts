import { apiClient } from '../lib/api';
import type { ApiResponse } from '../types/api.types';
import type {
  AllocationSuggestion,
  AllocationState,
  SubmitAllocationData,
} from '../types/allocation.types';

// ====================================
// ALLOCATION API SERVICE
// ====================================

export const allocationApi = {
  /**
   * Run allocation algorithm (admin only)
   * Returns suggested cab assignments (not saved to DB)
   */
  async runAllocation(tripId: string): Promise<ApiResponse<AllocationSuggestion>> {
    return apiClient.post(`/admin/trips/${tripId}/allocation/run`, {});
  },

  /**
   * Get existing allocation or demand summary (admin only)
   */
  async getAllocation(tripId: string): Promise<ApiResponse<AllocationState>> {
    return apiClient.get(`/admin/trips/${tripId}/allocation`);
  },

  /**
   * Submit final allocation (save to database) (admin only)
   */
  async submitAllocation(
    tripId: string,
    data: SubmitAllocationData
  ): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post(`/admin/trips/${tripId}/allocation`, data);
  },

  /**
   * Clear all allocation data (admin only)
   */
  async clearAllocation(tripId: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.delete(`/admin/trips/${tripId}/allocation`);
  },
};

