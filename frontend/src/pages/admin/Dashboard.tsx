/**
 * Admin Dashboard
 *
 * Main admin dashboard showing system overview and key metrics
 * - System stats (users, trips, bookings, revenue)
 * - Active & upcoming trips
 * - Quick admin actions
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks";
import { userManagementApi } from "@/services/user.service";
import { tripApi } from "@/services/trip.service";
import type { Trip } from "@/types/trip.types";
import type { UserWithStats } from "@/types/user.types";

// Components
import { AdminDashboardHeader } from "./dashboard/components/AdminDashboardHeader";
import { SystemStats } from "./dashboard/components/SystemStats";
import { TripsSection } from "./dashboard/components/TripsSection";
import { AdminQuickActions } from "./dashboard/components/AdminQuickActions";
import { AdminDashboardSkeleton } from "./dashboard/components/AdminDashboardSkeleton";

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel
      const [usersRes, tripsRes] = await Promise.all([
        userManagementApi.getUsers(),
        tripApi.getTrips(),
      ]);

      if (usersRes.success && usersRes.data) {
        setUsers(usersRes.data);
      }
      if (tripsRes.success && tripsRes.data) {
        setTrips(tripsRes.data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  // Calculate system stats
  const stats = {
    totalUsers: users.length,
    activeTrips: trips.filter((trip) => {
      const now = new Date();
      const bookingStart = new Date(trip.booking_start_time);
      const bookingEnd = new Date(trip.booking_end_time);
      return now >= bookingStart && now <= bookingEnd;
    }).length,
    totalBookings: users.reduce(
      (sum, user) => sum + (user.booking_count || 0),
      0
    ),
    totalRevenue: trips.reduce(
      (sum, trip) =>
        sum +
        (trip.booking_count && trip.amount_per_person
          ? trip.booking_count * Number(trip.amount_per_person)
          : 0),
      0
    ),
  };

  // Filter trips for display (active and upcoming only)
  const now = new Date();
  const displayTrips = trips
    .filter((trip) => {
      const tripDate = new Date(trip.trip_date);
      // Show only non-completed trips (trip date in future or today)
      return tripDate >= now || new Date(trip.booking_end_time) >= now;
    })
    .sort((a, b) => {
      // Sort by booking start time (upcoming first, then active)
      return (
        new Date(a.booking_start_time).getTime() -
        new Date(b.booking_start_time).getTime()
      );
    })
    .slice(0, 6); // Show max 6 trips

  const handleEditTrip = () => {
    navigate(`/admin/trips`);
  };

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Welcome Header - Always show (user already loaded) */}
      <AdminDashboardHeader user={user} />

      {/* Main Content - Show skeleton while loading */}
      {loading ? (
        <AdminDashboardSkeleton />
      ) : (
        <>
          {/* System Stats */}
          <SystemStats stats={stats} />

          {/* Active & Upcoming Trips */}
          <TripsSection trips={displayTrips} onEditTrip={handleEditTrip} />

          {/* Quick Actions */}
          <AdminQuickActions />
        </>
      )}
    </div>
  );
}
