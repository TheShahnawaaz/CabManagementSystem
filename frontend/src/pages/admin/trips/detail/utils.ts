import type { Trip } from "@/types/trip.types";

/**
 * Trip status for detail page access control
 */
export type TripDetailStatus =
  | "upcoming"
  | "active-booking-open"
  | "active-booking-closed"
  | "completed";

/**
 * Get detailed trip status for access control
 */
export const getTripDetailStatus = (trip: Trip): TripDetailStatus => {
  const now = new Date();
  const bookingStart = new Date(trip.booking_start_time);
  const bookingEnd = new Date(trip.booking_end_time);
  const tripEnd = new Date(trip.end_time);

  // Completed: trip has ended (inclusive of exact end time)
  if (tripEnd <= now) {
    return "completed";
  }

  // Active - Booking Closed: trip is active but booking window closed
  if (now >= bookingStart && now < tripEnd && now > bookingEnd) {
    return "active-booking-closed";
  }

  // Active - Booking Open: trip is active and booking window open
  if (now >= bookingStart && now < tripEnd && now <= bookingEnd) {
    return "active-booking-open";
  }

  // Upcoming: trip hasn't started yet
  return "upcoming";
};

/**
 * Check if a specific tab is accessible for a trip
 */
export const canAccessTab = (
  tab: "demand" | "journey" | "allocation",
  status: TripDetailStatus,
  trip: Trip
): boolean => {
  const hasAllocations = !!(trip.allocation_count && trip.allocation_count > 0);

  switch (tab) {
    case "demand":
      // Demand tab: Available for all except upcoming
      return status !== "upcoming";

    case "journey":
      // Journey tab: Available only when allocations exist (QR scans require allocations)
      // Can be viewed during active trip or after completion
      return (
        hasAllocations &&
        (status === "active-booking-closed" || status === "completed")
      );

    case "allocation":
      // Allocation tab: Available when booking closed OR after trip completed
      // (to review/manage allocations even after trip ends)
      return status === "active-booking-closed" || status === "completed";

    default:
      return false;
  }
};

/**
 * Get the default accessible tab for a trip status
 */
export const getDefaultTab = (status: TripDetailStatus, trip: Trip): string => {
  if (canAccessTab("demand", status, trip)) {
    return "demand";
  }
  if (canAccessTab("allocation", status, trip)) {
    return "allocation";
  }
  if (canAccessTab("journey", status, trip)) {
    return "journey";
  }
  return "demand"; // Fallback
};
