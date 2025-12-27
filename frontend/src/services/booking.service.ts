import { apiClient } from '@/lib/api';
import type { ApiResponse } from '@/types/api.types';
import type { Booking, CreateBookingData } from '@/types/booking.types';

/**
 * Booking API Service
 * 
 * Handles all booking-related API calls
 */

export const bookingApi = {
  /**
   * Create a new booking
   */
  async createBooking(data: CreateBookingData): Promise<ApiResponse<{ booking: Booking }>> {
    return apiClient.post('/bookings', data);
  },

  /**
   * Get all bookings for current user
   * @param status - Filter by status: 'upcoming', 'past', 'active'
   */
  async getMyBookings(status?: 'upcoming' | 'past' | 'active'): Promise<ApiResponse<Booking[]>> {
    const params = status ? `?status=${status}` : '';
    return apiClient.get(`/bookings${params}`);
  },

  /**
   * Get single booking by ID
   */
  async getBookingById(id: string): Promise<ApiResponse<Booking>> {
    return apiClient.get(`/bookings/${id}`);
  },
};

