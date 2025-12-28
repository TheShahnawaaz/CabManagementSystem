import { CalendarIcon, Clock, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Trip } from "@/types/trip.types";

interface TripStatsProps {
  trips: Trip[];
}

export function TripStats({ trips }: TripStatsProps) {
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
    (sum, t) => sum + (t.booking_count || 0),
    0
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card className="p-4">
        <div className="flex items-center space-x-2">
          <CalendarIcon className="w-5 h-5 text-blue-500" />
          <div>
            <p className="text-sm text-muted-foreground">Total Trips</p>
            <p className="text-2xl font-bold">{trips.length}</p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-green-500" />
          <div>
            <p className="text-sm text-muted-foreground">Active</p>
            <p className="text-2xl font-bold">{activeCount}</p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-purple-500" />
          <div>
            <p className="text-sm text-muted-foreground">Total Bookings</p>
            <p className="text-2xl font-bold">{totalBookings}</p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center space-x-2">
          <CalendarIcon className="w-5 h-5 text-orange-500" />
          <div>
            <p className="text-sm text-muted-foreground">Upcoming</p>
            <p className="text-2xl font-bold">{upcomingCount}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
