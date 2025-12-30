import { CalendarIcon, Clock, Users, MapPin } from "lucide-react";
import { StatCard, StatCardGrid } from "@/components/ui/stat-card";
import type { Trip } from "@/types/trip.types";

interface TripStatsProps {
  trips: Trip[];
}

export function TripStats({ trips }: TripStatsProps) {
  const totalTrips = trips.length;

  const activeCount = trips.filter((t) => {
    const now = new Date();
    const bookingStart = new Date(t.booking_start_time);
    const tripEnd = new Date(t.end_time);
    return now >= bookingStart && now < tripEnd;
  }).length;

  const upcomingCount = trips.filter(
    (t) => new Date(t.trip_date) > new Date()
  ).length;

  const totalBookings = trips.reduce(
    (sum, t) => sum + (Number(t.booking_count) || 0),
    0
  );

  return (
    <StatCardGrid columns={4} className="mb-6">
      <StatCard
        value={totalTrips}
        label="Total Trips"
        description={`${upcomingCount} upcoming`}
        icon={MapPin}
        color="blue"
        variant="stacked"
      />
      <StatCard
        value={activeCount}
        label="Active Trips"
        description={`${totalTrips > 0 ? ((activeCount / totalTrips) * 100).toFixed(1) : 0}% of total`}
        icon={Clock}
        color="green"
        variant="stacked"
      />
      <StatCard
        value={totalBookings}
        label="Total Bookings"
        description={`${totalTrips > 0 ? (totalBookings / totalTrips).toFixed(1) : 0} per trip avg`}
        icon={Users}
        color="purple"
        variant="stacked"
      />
      <StatCard
        value={upcomingCount}
        label="Upcoming Trips"
        description={`${totalTrips > 0 ? ((upcomingCount / totalTrips) * 100).toFixed(1) : 0}% of total`}
        icon={CalendarIcon}
        color="orange"
        variant="stacked"
      />
    </StatCardGrid>
  );
}
