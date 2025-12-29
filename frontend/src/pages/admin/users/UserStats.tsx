import { Users, Shield, Calendar, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  const stats = [
    {
      title: "Total Users",
      value: totalUsers,
      icon: Users,
      description: `${adminCount} admin${adminCount !== 1 ? "s" : ""}`,
      color: "text-blue-500",
    },
    {
      title: "Admin Users",
      value: adminCount,
      icon: Shield,
      description: `${((adminCount / totalUsers) * 100).toFixed(1)}% of total`,
      color: "text-purple-500",
    },
    {
      title: "Total Bookings",
      value: totalBookings,
      icon: Calendar,
      description: `${(totalBookings / totalUsers).toFixed(1)} per user avg`,
      color: "text-green-500",
    },
    {
      title: "Confirmed Payments",
      value: totalPayments,
      icon: CreditCard,
      description: `${((totalPayments / totalBookings) * 100).toFixed(1)}% completion`,
      color: "text-orange-500",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
