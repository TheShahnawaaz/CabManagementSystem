/**
 * System Stats Component
 *
 * Shows key system metrics for admin overview
 */

import { Users, MapPin, Calendar, IndianRupee } from "lucide-react";
import { StatCard, StatCardGrid } from "@/components/ui/stat-card";

interface SystemStatsProps {
  stats: {
    totalUsers: number;
    activeTrips: number;
    totalBookings: number;
    totalRevenue: number;
  };
}

export function SystemStats({ stats }: SystemStatsProps) {
  return (
    <StatCardGrid columns={4}>
      <StatCard
        value={stats.totalUsers}
        label="Total Users"
        icon={Users}
        color="blue"
        variant="stacked"
        description="Registered"
      />
      <StatCard
        value={stats.activeTrips}
        label="Active Trips"
        icon={MapPin}
        color="green"
        variant="stacked"
        description="Ongoing"
      />
      <StatCard
        value={stats.totalBookings}
        label="Total Bookings"
        icon={Calendar}
        color="purple"
        variant="stacked"
        description="All time"
      />
      <StatCard
        value={stats.totalRevenue}
        label="Revenue"
        icon={IndianRupee}
        color="orange"
        variant="stacked"
        description="Collected"
      />
    </StatCardGrid>
  );
}
