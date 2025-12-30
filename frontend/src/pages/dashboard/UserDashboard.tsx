/**
 * User Dashboard
 *
 * Main dashboard for authenticated users showing:
 * - Booking statistics
 * - Next upcoming trip
 * - Quick action shortcuts
 */

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks";
import { bookingApi } from "@/services/booking.service";
import type { Booking } from "@/types/booking.types";
import { DashboardHeader } from "./components/DashboardHeader";
import { DashboardStats } from "./components/DashboardStats";
import { NextTripCard } from "./components/NextTripCard";
import { QuickActions } from "./components/QuickActions";
import { EmptyDashboard } from "./components/EmptyDashboard";
import { DashboardSkeleton } from "./components/DashboardSkeleton";

export default function UserDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingApi.getMyBookings();
      if (response.success && response.data) {
        setBookings(response.data);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Find next upcoming trip (earliest trip date in the future)
  const nextTrip = bookings
    .filter((b) => new Date(b.trip_date) > new Date())
    .sort(
      (a, b) =>
        new Date(a.trip_date).getTime() - new Date(b.trip_date).getTime()
    )[0];

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Welcome Header - ALWAYS SHOW (user info already in context) */}
      <DashboardHeader user={user} />

      {/* Data Section - Show skeleton while loading */}
      {loading ? (
        <DashboardSkeleton />
      ) : (
        <>
          {/* Stats Grid */}
          <DashboardStats bookings={bookings} />

          {/* Main Content */}
          {bookings.length === 0 ? (
            <EmptyDashboard />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Next Trip Card - Takes 2/3 width on large screens */}
              {nextTrip ? (
                <NextTripCard booking={nextTrip} />
              ) : (
                <EmptyDashboard />
              )}

              {/* Future: Recent Activity or other widgets can go here (1/3 width) */}
              <div className="hidden lg:block">
                {/* Placeholder for future content */}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <QuickActions />
        </>
      )}
    </div>
  );
}
