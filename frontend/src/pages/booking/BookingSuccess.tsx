/**
 * Booking Success Page
 *
 * Shown after successful payment and booking confirmation.
 */

import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { format } from "date-fns";
import {
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Ticket,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { bookingApi } from "@/services/booking.service";
import type { Booking } from "@/types/booking.types";

export default function BookingSuccess() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (bookingId) {
      fetchBooking();
    } else {
      toast.error("Booking not found", {
        description: "No booking ID provided.",
      });
      navigate("/dashboard");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      const response = await bookingApi.getBookingById(bookingId!);
      if (response.success && response.data) {
        setBooking(response.data);
      } else {
        // Booking not found
        toast.error("Booking not found", {
          description: "The booking you're looking for doesn't exist.",
        });
        navigate("/dashboard");
        return;
      }
    } catch (error) {
      console.error("Error fetching booking:", error);
      toast.error("Booking not found", {
        description: "Could not load booking details.",
      });
      navigate("/dashboard");
      return;
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "EEEE, MMMM do, yyyy");
    } catch {
      return dateStr;
    }
  };

  const formatTime = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "h:mm a");
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="container max-w-lg mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <Skeleton className="h-16 w-16 rounded-full mx-auto mb-4" />
          <Skeleton className="h-8 w-48 mx-auto mb-2" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-lg mx-auto px-4 py-12">
      {/* Success Icon & Message */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
          <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Booking Confirmed!</h1>
        <p className="text-muted-foreground">
          Your trip has been booked successfully.
        </p>
      </div>

      {/* Booking Details Card */}
      {booking && (
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">{booking.trip_title}</CardTitle>
            <CardDescription>
              Booking ID: {booking.id.slice(0, 8)}...
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{formatDate(booking.trip_date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{formatTime(booking.departure_time)}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{booking.hall} Hall</span>
              </div>
              <div className="flex items-center gap-2">
                <Ticket className="h-4 w-4 text-muted-foreground" />
                <span>₹{booking.payment_amount}</span>
              </div>
            </div>

            {/* Cab Allocation Status */}
            <div className="rounded-lg bg-muted p-3 text-sm">
              {booking.cab_number ? (
                <p className="text-green-600 dark:text-green-400">
                  ✓ Cab allocated: {booking.cab_number}
                </p>
              ) : (
                <p className="text-muted-foreground">
                  Cab will be allocated before the trip. Check back later.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button
          className="w-full"
          size="lg"
          onClick={() => navigate("/bookings")}
        >
          View My Bookings
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>

        <Button variant="outline" className="w-full" size="lg" asChild>
          <Link to="/trips">Browse More Trips</Link>
        </Button>
      </div>

      {/* Note */}
      <p className="text-xs text-center text-muted-foreground mt-6">
        You'll receive cab details and QR code once allocation is done.
      </p>
    </div>
  );
}
