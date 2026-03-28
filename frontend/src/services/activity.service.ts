/**
 * Activity Log Service
 * API calls for the activity logs module
 */

import { apiClient } from "@/lib/api";
import type { ApiResponse } from "@/types/api.types";

// ====================================
// TYPES
// ====================================

export interface ActivityLogActor {
  id: string;
  name: string;
  email: string;
  profile_picture: string | null;
}

export interface ActivityLog {
  id: number;
  action_type: string;
  entity_type: string | null;
  entity_id: string | null;
  details: Record<string, any>;
  ip_address: string | null;
  created_at: string;
  actor: ActivityLogActor | null;
  target: ActivityLogActor | null;
}

export interface ActivityLogPagination {
  total: number;
  page: number;
  limit: number;
}

export interface ActivityLogFilters {
  page?: number;
  limit?: number;
  action_type?: string;
  entity_type?: string;
  user_id?: string;
  start_date?: string;
  end_date?: string;
}

// ====================================
// ACTIVITY LOG API SERVICE
// ====================================

export const activityApi = {
  /**
   * Get paginated activity logs with optional filters
   */
  async getActivityLogs(
    filters: ActivityLogFilters = {},
  ): Promise<
    ApiResponse<ActivityLog[]> & { pagination?: ActivityLogPagination }
  > {
    const params = new URLSearchParams();

    if (filters.page) params.set("page", String(filters.page));
    if (filters.limit) params.set("limit", String(filters.limit));
    if (filters.action_type) params.set("action_type", filters.action_type);
    if (filters.entity_type) params.set("entity_type", filters.entity_type);
    if (filters.user_id) params.set("user_id", filters.user_id);
    if (filters.start_date) params.set("start_date", filters.start_date);
    if (filters.end_date) params.set("end_date", filters.end_date);

    const queryString = params.toString();
    return apiClient.get(
      `/admin/activities${queryString ? `?${queryString}` : ""}`,
    );
  },
};

export default activityApi;
