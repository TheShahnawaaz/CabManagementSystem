import { format } from "date-fns";
import {
  Calendar,
  MapPin,
  QrCode,
  Car,
  AlertCircle,
  CheckCircle,
  IndianRupee,
  CreditCard,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Booking } from "@/types/booking.types";
import { BookingTimeline } from "./BookingTimeline";

interface BookingCardProps {
  booking: Booking;
  onViewQR: (booking: Booking) => void;
  onViewCab: (booking: Booking) => void;
}

export function BookingCard({
  booking,
  onViewQR,
  onViewCab,
}: BookingCardProps) {
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

  const getBookingStatus = () => {
    const now = new Date();
    const tripEnd = new Date(booking.end_time);
    const departureTime = new Date(booking.departure_time);

    // Completed: trip has ended
    if (tripEnd < now) {
      return { label: "Completed", color: "bg-gray-500", icon: CheckCircle };
    }
    // In Progress: between departure time and end time
    else if (departureTime <= now && now < tripEnd) {
      return { label: "In Progress", color: "bg-green-500", icon: null };
    }
    // Cab Allocated: has cab assignment
    else if (booking.cab_number) {
      return { label: "Cab Allocated", color: "bg-green-500", icon: null };
    }
    // Awaiting Allocation: no cab yet
    else {
      return {
        label: "Awaiting Allocation",
        color: "bg-yellow-500",
        icon: null,
      };
    }
  };

  const status = getBookingStatus();
  const isCompleted = new Date(booking.end_time) < new Date();

  return (
    <Card
      className={`p-6 hover:shadow-lg transition-shadow ${isCompleted ? "opacity-90" : ""}`}
    >
      {/* Status Badge */}
      <div className="flex items-center justify-between mb-4">
        <Badge className={status.color}>
          {status.icon && <status.icon className="w-3 h-3 mr-1" />}
          {status.label}
        </Badge>
        <Badge variant="outline">{booking.hall}</Badge>
      </div>

      {/* Trip Title */}
      <h3 className="text-xl font-bold mb-2">{booking.trip_title}</h3>

      {/* Trip Date */}
      <div className="flex items-start gap-2 mb-3 text-sm">
        <Calendar className="w-4 h-4 mt-0.5 text-muted-foreground" />
        <span className="text-muted-foreground">
          {formatDate(booking.trip_date)}
        </span>
      </div>

      {/* Departure Time */}
      <div className="flex items-start gap-2 mb-3 text-sm">
        <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground" />
        <span className="text-muted-foreground">
          Departs: {formatDateTime(booking.departure_time)}
        </span>
      </div>

      {/* Amount Paid */}
      <div className="flex items-start gap-2 mb-3 text-sm">
        <IndianRupee className="w-4 h-4 mt-0.5 text-muted-foreground" />
        <span className="text-muted-foreground">
          Amount:{" "}
          <span className="font-semibold text-foreground">
            ₹{Number(booking.payment_amount || 0).toFixed(2)}
          </span>
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mb-4">
        {booking.allocation_id ? (
          <>
            <Button
              className="flex-1"
              variant="default"
              onClick={() => onViewQR(booking)}
            >
              <QrCode className="w-4 h-4 mr-2" />
              View QR
            </Button>
            {booking.cab_number && (
              <Button
                className="flex-1"
                variant="outline"
                onClick={() => onViewCab(booking)}
              >
                <Car className="w-4 h-4 mr-2" />
                Cab Details
              </Button>
            )}
          </>
        ) : (
          <Button className="w-full" variant="outline" disabled>
            <AlertCircle className="w-4 h-4 mr-2" />
            Awaiting Cab Assignment
          </Button>
        )}
      </div>

      {/* Timeline Section - Accordion */}
      <div className="-mx-6 border-t my-4" />

      <BookingTimeline
        createdAt={booking.created_at}
        paymentDate={booking.payment_date}
        bookingEndTime={booking.booking_end_time}
        allocationId={booking.allocation_id}
        departureTime={booking.departure_time}
        endTime={booking.end_time}
        cabNumber={booking.cab_number}
      />

      {/* Payment ID Footer - Full Width Divider */}
      <div className="-mx-6 border-t px-6 pt-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <CreditCard className="hidden md:inline w-3.5 h-3.5" />
          <span className="hidden md:inline">Payment ID:</span>
          <span className="font-mono">{booking.payment_id}</span>
        </div>
      </div>
    </Card>
  );
}
