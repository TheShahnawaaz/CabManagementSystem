import { apiClient } from "@/lib/api";
import type {
  ApiResponse,
  UserProfile,
  UpdateUserProfilePayload,
} from "@/types";

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
