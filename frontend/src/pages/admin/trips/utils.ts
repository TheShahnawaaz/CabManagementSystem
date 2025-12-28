import { format } from "date-fns";
import type { CreateTripData } from "@/types/trip.types";
import type { TripFormData } from "./types";

/**
 * Build ISO datetime string from date and time
 */
export const buildDateTime = (date: Date | undefined, time: string): string => {
  if (!date) return "";
  const [hours, minutes] = time.split(":");
  const combined = new Date(date);
  combined.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  return combined.toISOString();
};

/**
 * Convert form data to API create/update format
 */
export const formDataToCreateData = (
  formData: TripFormData
): CreateTripData => {
  return {
    trip_title: formData.tripTitle,
    trip_date: formData.tripDate ? format(formData.tripDate, "yyyy-MM-dd") : "",
    booking_start_time: buildDateTime(
      formData.bookingStartDate,
      formData.bookingStartTime
    ),
    booking_end_time: buildDateTime(
      formData.bookingEndDate,
      formData.bookingEndTime
    ),
    return_time: buildDateTime(formData.returnDate, formData.returnTime),
    end_time: buildDateTime(formData.endDate, formData.endTime),
    amount_per_person: formData.amount,
  };
};

/**
 * Format datetime for display
 */
export const formatDateTime = (dateString: string): string => {
  try {
    return format(new Date(dateString), "MMM dd, yyyy HH:mm");
  } catch {
    return dateString;
  }
};

/**
 * Format date for display
 */
export const formatDate = (dateString: string): string => {
  try {
    return format(new Date(dateString), "EEEE, MMM dd, yyyy");
  } catch {
    return dateString;
  }
};

/**
 * Get initial form data
 */
export const getInitialFormData = (): TripFormData => ({
  tripTitle: "",
  amount: 50,
  tripDate: undefined,
  bookingStartDate: undefined,
  bookingEndDate: undefined,
  returnDate: undefined,
  endDate: undefined,
  bookingStartTime: "00:00",
  bookingEndTime: "23:59",
  returnTime: "09:00",
  endTime: "11:00",
});
