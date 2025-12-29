import { format } from "date-fns";
import { Calendar, Clock, MapPin, IndianRupee } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Trip } from "@/types/trip.types";

interface UpcomingTripCardProps {
  trip: Trip;
}

export function UpcomingTripCard({ trip }: UpcomingTripCardProps) {
  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy • HH:mm");
    } catch {
      return dateString;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "EEEE, MMMM do, yyyy");
    } catch {
      return dateString;
    }
  };

  const getTimeUntilBooking = (bookingStartTime: string) => {
    const now = new Date();
    const start = new Date(bookingStartTime);
    const diff = start.getTime() - now.getTime();

    if (diff <= 0) {
      return { text: "Booking opens soon", color: "bg-blue-500" };
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return {
        text: `Opens in ${days} day${days > 1 ? "s" : ""}`,
        color: "bg-blue-500",
      };
    }
    if (hours > 0) {
      return {
        text: `Opens in ${hours} hour${hours > 1 ? "s" : ""}`,
        color: "bg-blue-600",
      };
    }
    return { text: "Booking opens soon", color: "bg-blue-600" };
  };

  const bookingStatus = getTimeUntilBooking(trip.booking_start_time);

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow opacity-90">
      {/* Trip Badge */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Badge className={bookingStatus.color}>{bookingStatus.text}</Badge>
      </div>

      {/* Trip Title */}
      <h3 className="text-xl font-bold mb-2">{trip.trip_title}</h3>

      {/* Trip Date */}
      <div className="flex items-start gap-2 mb-3 text-sm">
        <Calendar className="w-4 h-4 mt-0.5 text-muted-foreground" />
        <span className="text-muted-foreground">{formatDate(trip.trip_date)}</span>
      </div>

      {/* Booking Opens */}
      <div className="flex items-start gap-2 mb-3 text-sm">
        <Clock className="w-4 h-4 mt-0.5 text-muted-foreground" />
        <div className="text-muted-foreground">
          <div className="font-medium text-blue-600 dark:text-blue-400">
            Booking opens: {formatDateTime(trip.booking_start_time)}
          </div>
        </div>
      </div>

      {/* Return Time */}
      <div className="flex items-start gap-2 mb-3 text-sm">
        <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground" />
        <div className="text-muted-foreground">
          <div>Departs: {formatDateTime(trip.return_time)}</div>
        </div>
      </div>

      {/* Amount */}
      <div className="flex items-center gap-2 mb-6">
        <IndianRupee className="w-5 h-5 text-primary" />
        <span className="text-2xl font-bold">{trip.amount_per_person}</span>
        <span className="text-sm text-muted-foreground">per person</span>
      </div>

      {/* Info Badge - View Only */}
      <div className="w-full p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-md text-center">
        <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
          Booking not yet open
        </p>
        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
          Check back when booking opens
        </p>
      </div>
    </Card>
  );
}

