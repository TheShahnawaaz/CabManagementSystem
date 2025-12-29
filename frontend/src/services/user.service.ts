import { apiClient } from "@/lib/api";
import type {
  ApiResponse,
  UserProfile,
  UpdateUserProfilePayload,
  UserWithStats,
  UserDetailedView,
  CreateUserData,
  UpdateUserData,
} from "@/types";

// ====================================
// USER PROFILE SERVICE (Self)
// ====================================

export const userApi = {
  async getProfile(): Promise<UserProfile> {
    return apiClient.get("/auth/me");
  },

  async updateProfile(
    data: UpdateUserProfilePayload
  ): Promise<ApiResponse<UserProfile>> {
    return apiClient.put("/auth/me", data);
  },
};

// ====================================
// USER MANAGEMENT SERVICE (Admin Only)
// ====================================

export const userManagementApi = {
  /**
   * Get all users with filters and pagination
   * @param filters - Optional filters (is_admin, search, sort, limit, offset)
   */
  async getUsers(filters?: {
    is_admin?: boolean;
    search?: string;
    sort?: "asc" | "desc";
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<UserWithStats[]>> {
    const params = new URLSearchParams();
    if (filters?.is_admin !== undefined)
      params.append("is_admin", String(filters.is_admin));
    if (filters?.search) params.append("search", filters.search);
    if (filters?.sort) params.append("sort", filters.sort);
    if (filters?.limit) params.append("limit", filters.limit.toString());
    if (filters?.offset) params.append("offset", filters.offset.toString());

    const queryString = params.toString();
    return apiClient.get(`/admin/users${queryString ? `?${queryString}` : ""}`);
  },

  /**
   * Get user by ID with detailed information
   */
  async getUserById(id: string): Promise<ApiResponse<UserDetailedView>> {
    return apiClient.get(`/admin/users/${id}`);
  },

  /**
   * Create new user manually (admin only)
   */
  async createUser(data: CreateUserData): Promise<ApiResponse<UserProfile>> {
    return apiClient.post("/admin/users", data);
  },

  /**
   * Update user information
   */
  async updateUser(
    id: string,
    data: UpdateUserData
  ): Promise<ApiResponse<UserProfile>> {
    return apiClient.put(`/admin/users/${id}`, data);
  },

  /**
   * Toggle admin status for a user
   */
  async toggleAdminStatus(id: string): Promise<ApiResponse<UserProfile>> {
    return apiClient.patch(`/admin/users/${id}/admin-status`);
  },

  /**
   * Delete a user (only if no active bookings)
   */
  async deleteUser(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/admin/users/${id}`);
  },
};
