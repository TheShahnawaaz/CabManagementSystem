import { Users, Shield, Calendar, CreditCard } from "lucide-react";
import { StatCard, StatCardGrid } from "@/components/ui/stat-card";
import type { UserStatsData } from "./types";

interface UserStatsProps {
  stats: UserStatsData;
}

export function UserStats({ stats }: UserStatsProps) {
  const { totalUsers, adminCount, totalBookings, confirmedPayments } = stats;

  return (
    <StatCardGrid columns={4} className="mb-6">
      <StatCard
        value={totalUsers}
        label="Total Users"
        description={`${adminCount} admin${adminCount !== 1 ? "s" : ""}`}
        icon={Users}
        color="blue"
        variant="stacked"
      />
      <StatCard
        value={adminCount}
        label="Admin Users"
        description={
          totalUsers > 0
            ? `${((adminCount / totalUsers) * 100).toFixed(1)}% of total`
            : "0% of total"
        }
        icon={Shield}
        color="purple"
        variant="stacked"
      />
      <StatCard
        value={totalBookings}
        label="Total Bookings"
        description={
          totalUsers > 0
            ? `${(totalBookings / totalUsers).toFixed(1)} per user avg`
            : "0 per user avg"
        }
        icon={Calendar}
        color="green"
        variant="stacked"
      />
      <StatCard
        value={confirmedPayments}
        label="Confirmed Payments"
        description={
          totalBookings > 0
            ? `${((confirmedPayments / totalBookings) * 100).toFixed(1)}% completion`
            : "0% completion"
        }
        icon={CreditCard}
        color="orange"
        variant="stacked"
      />
    </StatCardGrid>
  );
}
