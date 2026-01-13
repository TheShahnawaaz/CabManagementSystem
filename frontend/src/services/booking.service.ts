import { apiClient } from "@/lib/api";
import type { ApiResponse } from "@/types/api.types";
import type { Booking } from "@/types/booking.types";

/**
 * Booking Service
 *
 * Note: Booking creation is handled via payment flow
 * (paymentApi.initiatePayment → Razorpay → paymentApi.verifyPayment)
 */
export const bookingApi = {
  /**
   * Get current user's bookings
   */
  async getMyBookings(
    status?: "upcoming" | "past" | "active"
  ): Promise<ApiResponse<Booking[]>> {
    const params = status ? `?status=${status}` : "";
    return apiClient.get(`/bookings${params}`);
  },

  /**
   * Get single booking by ID
   */
  async getBookingById(id: string): Promise<ApiResponse<Booking>> {
    return apiClient.get(`/bookings/${id}`);
  },
};
