import { apiClient } from "../lib/api";
import type { ApiResponse } from "../types/api.types";
import type {
  Trip,
  CreateTripData,
  UpdateTripData,
  HallDemand,
} from "../types/trip.types";

// ====================================
// TRIP API SERVICE
// ====================================

export const tripApi = {
  /**
   * Get all trips (admin only)
   * @param filters - Optional filters (status, sort, limit, offset)
   */
  async getTrips(filters?: {
    status?: "upcoming" | "past" | "active";
    sort?: "asc" | "desc";
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<Trip[]>> {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.sort) params.append("sort", filters.sort);
    if (filters?.limit) params.append("limit", filters.limit.toString());
    if (filters?.offset) params.append("offset", filters.offset.toString());

    const queryString = params.toString();
    return apiClient.get(`/admin/trips${queryString ? `?${queryString}` : ""}`);
  },

  /**
   * Get trip by ID (admin only)
   */
  async getTripById(id: string): Promise<ApiResponse<Trip>> {
    return apiClient.get(`/admin/trips/${id}`);
  },

  /**
   * Create new trip (admin only)
   */
  async createTrip(data: CreateTripData): Promise<ApiResponse<Trip>> {
    return apiClient.post("/admin/trips", data);
  },

  /**
   * Update trip (admin only)
   */
  async updateTrip(
    id: string,
    data: UpdateTripData
  ): Promise<ApiResponse<Trip>> {
    return apiClient.put(`/admin/trips/${id}`, data);
  },

  /**
   * Delete trip (admin only)
   */
  async deleteTrip(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/admin/trips/${id}`);
  },

  /**
   * Get active trips (public - for students)
   */
  async getActiveTrips(): Promise<ApiResponse<Trip[]>> {
    return apiClient.get("/trips/active");
  },

  /**
   * Get active trips with user's booking status (authenticated)
   * Returns trips with has_booked and booking_id fields
   */
  async getActiveTripsForMe(): Promise<ApiResponse<Trip[]>> {
    return apiClient.get("/trips/active/me");
  },

  /**
   * Get upcoming trips (public - for students)
   */
  async getUpcomingTrips(): Promise<ApiResponse<Trip[]>> {
    return apiClient.get("/trips/upcoming");
  },

  /**
   * Get trip demand (admin only)
   * Returns hall-wise student booking data
   */
  async getTripDemand(tripId: string): Promise<ApiResponse<HallDemand[]>> {
    return apiClient.get(`/admin/trips/${tripId}/demand`);
  },
};
