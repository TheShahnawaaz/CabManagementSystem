import { CalendarIcon, Clock, Users, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  const stats = [
    {
      title: "Total Trips",
      value: totalTrips,
      icon: MapPin,
      description: `${upcomingCount} upcoming`,
      color: "text-blue-500",
    },
    {
      title: "Active Trips",
      value: activeCount,
      icon: Clock,
      description: `${((activeCount / totalTrips) * 100).toFixed(1)}% of total`,
      color: "text-green-500",
    },
    {
      title: "Total Bookings",
      value: totalBookings,
      icon: Users,
      description: `${totalTrips > 0 ? (totalBookings / totalTrips).toFixed(1) : 0} per trip avg`,
      color: "text-purple-500",
    },
    {
      title: "Upcoming Trips",
      value: upcomingCount,
      icon: CalendarIcon,
      description: `${((upcomingCount / totalTrips) * 100).toFixed(1)}% of total`,
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
