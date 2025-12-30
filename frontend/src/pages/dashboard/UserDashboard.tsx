/**
 * User Dashboard
 *
 * Main dashboard that shows different content based on user state:
 * - Active bookings → ActiveBookingsSection
 * - Available trips → AvailableTripsSection
 * - Upcoming trips → UpcomingTripsSection
 * - Nothing → NoTripsAvailable
 *
 * Always shows: Header, Quick Actions, How It Works
 */

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks";
import { bookingApi } from "@/services/booking.service";
import { tripApi } from "@/services/trip.service";
import type { Booking } from "@/types/booking.types";
import type { Trip } from "@/types/trip.types";

// Layout components
import { DashboardHeader } from "./components/DashboardHeader";
import { DashboardStats } from "./components/DashboardStats";
import { QuickActions } from "./components/QuickActions";
import { HowItWorks } from "./components/HowItWorks";
import { DashboardSkeleton } from "./components/DashboardSkeleton";

// Case-specific sections
import { ActiveBookingsSection } from "./components/ActiveBookingsSection";
import { AvailableTripsSection } from "./components/AvailableTripsSection";
import { UpcomingTripsSection } from "./components/UpcomingTripsSection";
import { NoTripsAvailable } from "./components/NoTripsAvailable";

export default function UserDashboard() {
  const { user } = useAuth();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTrips, setActiveTrips] = useState<Trip[]>([]);
  const [upcomingTrips, setUpcomingTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel
      const [bookingsRes, activeTripsRes, upcomingTripsRes] = await Promise.all(
        [
          bookingApi.getMyBookings(),
          tripApi.getActiveTripsForMe(),
          tripApi.getUpcomingTrips(),
        ]
      );

      if (bookingsRes.success && bookingsRes.data) {
        setBookings(bookingsRes.data);
      }
      if (activeTripsRes.success && activeTripsRes.data) {
        setActiveTrips(activeTripsRes.data);
      }
      if (upcomingTripsRes.success && upcomingTripsRes.data) {
        setUpcomingTrips(upcomingTripsRes.data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  // Filter active bookings (end_time >= now)
  const activeBookings = bookings.filter(
    (b) => new Date(b.end_time) >= new Date()
  );

  // Calculate stats (only if user has bookings)
  const stats = {
    totalTrips: bookings.length,
    activeBookings: activeBookings.length,
    completedTrips: bookings.filter((b) => new Date(b.end_time) < new Date())
      .length,
    upcomingTrips: bookings.filter((b) => new Date(b.trip_date) > new Date())
      .length,
  };

  // Check if user is new (no bookings)
  const isNewUser = bookings.length === 0;

  // Determine which section to show
  const renderMainContent = () => {
    // Case 1: Has active bookings
    if (activeBookings.length > 0) {
      return <ActiveBookingsSection bookings={activeBookings} />;
    }

    // Case 2: No active bookings but active trips available
    if (activeTrips.length > 0) {
      return (
        <AvailableTripsSection
          trips={activeTrips}
          onBookingComplete={fetchData}
        />
      );
    }

    // Case 3: No active bookings/trips but upcoming trips exist
    if (upcomingTrips.length > 0) {
      return <UpcomingTripsSection trips={upcomingTrips} />;
    }

    // Case 4: Nothing available
    return <NoTripsAvailable />;
  };

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Welcome Header - Always show (user already loaded) */}
      <DashboardHeader user={user} />

      {/* Main Content - Show skeleton while loading */}
      {loading ? (
        <DashboardSkeleton />
      ) : (
        <>
          {/* Stats - Only show for existing users (not new users) */}
          {!isNewUser && <DashboardStats stats={stats} />}

          {/* Dynamic section based on user state */}
          {renderMainContent()}

          {/* Quick Actions - Always show */}
          <QuickActions />

          {/* How It Works - Always show (collapsed by default) */}
          <HowItWorks />
        </>
      )}
    </div>
  );
}
