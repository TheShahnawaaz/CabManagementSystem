import { format } from "date-fns";
import {
  Calendar,
  Clock,
  MapPin,
  IndianRupee,
  Users,
  CheckCircle2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Trip } from "@/types/trip.types";

interface ActiveTripCardProps {
  trip: Trip;
  onBookClick: (trip: Trip) => void;
}

export function ActiveTripCard({ trip, onBookClick }: ActiveTripCardProps) {
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

  const getBookingStatus = (bookingEndTime: string) => {
    const now = new Date();
    const end = new Date(bookingEndTime);
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) {
      return { text: "Booking closed", color: "bg-gray-500" };
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return {
        text: `${days} day${days > 1 ? "s" : ""} left`,
        color: "bg-green-500",
      };
    }
    if (hours > 0) {
      return {
        text: `${hours} hour${hours > 1 ? "s" : ""} left`,
        color: "bg-yellow-500",
      };
    }
    return { text: "Closing soon", color: "bg-orange-500" };
  };

  const canBook = (bookingEndTime: string) => {
    const now = new Date();
    const end = new Date(bookingEndTime);
    return now < end;
  };

  const bookingStatus = getBookingStatus(trip.booking_end_time);
  const isBookable = canBook(trip.booking_end_time);
  const hasBooked = trip.has_booked === true;

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      {/* Trip Badge */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Badge className={bookingStatus.color}>{bookingStatus.text}</Badge>
        {hasBooked && (
          <Badge variant="default" className="bg-green-500 hover:bg-green-600">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Already Booked
          </Badge>
        )}
      </div>

      {/* Trip Title */}
      <h3 className="text-xl font-bold mb-2">{trip.trip_title}</h3>

      {/* Trip Date */}
      <div className="flex items-start gap-2 mb-3 text-sm">
        <Calendar className="w-4 h-4 mt-0.5 text-muted-foreground" />
        <span className="text-muted-foreground">
          {formatDate(trip.trip_date)}
        </span>
      </div>

      {/* Booking Window */}
      <div className="flex items-start gap-2 mb-3 text-sm">
        <Clock className="w-4 h-4 mt-0.5 text-muted-foreground" />
        <div className="text-muted-foreground">
          {isBookable ? (
            <div className="text-green-600 dark:text-green-400 font-medium">
              Book until: {formatDateTime(trip.booking_end_time)}
            </div>
          ) : (
            <div className="text-orange-600 dark:text-orange-400 font-medium">
              Booking closed
            </div>
          )}
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

      {/* Book Button */}
      <Button
        className="w-full"
        size="lg"
        variant={hasBooked ? "outline" : "default"}
        disabled={!isBookable && !hasBooked}
        onClick={() => onBookClick(trip)}
      >
        {hasBooked ? (
          <>
            <CheckCircle2 className="w-4 h-4 mr-2" />
            View My Booking
          </>
        ) : (
          <>
            <Users className="w-4 h-4 mr-2" />
            {isBookable ? "Book Now" : "Booking Closed"}
          </>
        )}
      </Button>
    </Card>
  );
}
