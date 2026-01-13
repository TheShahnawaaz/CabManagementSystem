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
 * Get initial form data with smart defaults
 */
export const getInitialFormData = (): TripFormData => ({
  tripTitle: "",
  amount: 50,
  tripDate: undefined,
  bookingStartDate: undefined,
  bookingEndDate: undefined,
  departureDate: undefined,
  prayerDate: undefined,
  endDate: undefined,
  bookingStartTime: "00:00",
  bookingEndTime: "10:00",
  departureTime: "12:30",
  prayerTime: "13:00",
  endTime: "15:00",
  useSameDayBooking: true,
  useSameDaySchedule: true,
});

/**
 * Sync dates when trip date changes (if same-day toggles are enabled)
 */
export const syncDatesWithTripDate = (
  tripDate: Date,
  formData: TripFormData
): Partial<TripFormData> => {
  const updates: Partial<TripFormData> = {};

  if (formData.useSameDayBooking) {
    updates.bookingStartDate = tripDate;
    updates.bookingEndDate = tripDate;
  }

  if (formData.useSameDaySchedule) {
    updates.departureDate = tripDate;
    updates.prayerDate = tripDate;
    updates.endDate = tripDate;
  }

  return updates;
};

/**
 * Get effective dates for form submission (respecting same-day toggles)
 */
export const getEffectiveDates = (formData: TripFormData): TripFormData => {
  const result = { ...formData };

  if (formData.useSameDayBooking && formData.tripDate) {
    result.bookingStartDate = formData.tripDate;
    result.bookingEndDate = formData.tripDate;
  }

  if (formData.useSameDaySchedule && formData.tripDate) {
    result.departureDate = formData.tripDate;
    result.prayerDate = formData.tripDate;
    result.endDate = formData.tripDate;
  }

  return result;
};

/**
 * Convert form data to API create/update format
 */
export const formDataToCreateData = (
  formData: TripFormData
): CreateTripData => {
  // Apply same-day sync if enabled
  const effective = getEffectiveDates(formData);

  return {
    trip_title: effective.tripTitle,
    trip_date: effective.tripDate
      ? format(effective.tripDate, "yyyy-MM-dd")
      : "",
    booking_start_time: buildDateTime(
      effective.bookingStartDate,
      effective.bookingStartTime
    ),
    booking_end_time: buildDateTime(
      effective.bookingEndDate,
      effective.bookingEndTime
    ),
    departure_time: buildDateTime(
      effective.departureDate,
      effective.departureTime
    ),
    prayer_time: buildDateTime(effective.prayerDate, effective.prayerTime),
    end_time: buildDateTime(effective.endDate, effective.endTime),
    amount_per_person: effective.amount,
  };
};
