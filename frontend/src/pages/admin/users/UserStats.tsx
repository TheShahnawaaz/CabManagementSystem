import { Users, Shield, Calendar, CreditCard } from "lucide-react";
import { StatCard, StatCardGrid } from "@/components/ui/stat-card";
import type { UserWithStats } from "@/types/user.types";

interface UserStatsProps {
  users: UserWithStats[];
}

export function UserStats({ users }: UserStatsProps) {
  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.is_admin).length;
  const totalBookings = users.reduce(
    (sum, u) => sum + (Number(u.booking_count) || 0),
    0
  );
  const totalPayments = users.reduce(
    (sum, u) => sum + (Number(u.payment_count) || 0),
    0
  );

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
        value={totalPayments}
        label="Confirmed Payments"
        description={
        totalBookings > 0
          ? `${((totalPayments / totalBookings) * 100).toFixed(1)}% completion`
            : "0% completion"
        }
        icon={CreditCard}
        color="orange"
        variant="stacked"
      />
    </StatCardGrid>
  );
}
