/**
 * Dashboard Stats Component
 *
 * Shows user's booking statistics
 */

import { MapPin, CheckCircle2, TrendingUp, Clock } from "lucide-react";
import { StatCard, StatCardGrid } from "@/components/ui/stat-card";

interface DashboardStatsProps {
  stats: {
    totalTrips: number;
    activeBookings: number;
    completedTrips: number;
    upcomingTrips: number;
  };
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <StatCardGrid columns={4}>
      <StatCard
        value={stats.totalTrips}
        label="Total Trips"
        icon={MapPin}
        color="blue"
        variant="stacked"
      />
      <StatCard
        value={stats.activeBookings}
        label="Active Bookings"
        icon={CheckCircle2}
        color="green"
        variant="stacked"
      />
      <StatCard
        value={stats.completedTrips}
        label="Completed"
        icon={TrendingUp}
        color="purple"
        variant="stacked"
      />
      <StatCard
        value={stats.upcomingTrips}
        label="Upcoming"
        icon={Clock}
        color="orange"
        variant="stacked"
      />
    </StatCardGrid>
  );
}
