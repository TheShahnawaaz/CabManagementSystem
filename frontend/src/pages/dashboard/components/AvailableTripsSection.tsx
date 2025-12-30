/**
 * Available Trips Section Component
 *
 * Case 2: No active bookings but active trips available
 * Shows trip cards that users can book
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ActiveTripCard } from "@/pages/trips/ActiveTripCard";
import { BookingModal } from "@/pages/trips/BookingModal";
import { bookingApi } from "@/services/booking.service";
import type { Trip } from "@/types/trip.types";
import type { Hall } from "@/types/booking.types";

interface AvailableTripsSectionProps {
  trips: Trip[];
  onBookingComplete?: () => void;
}

export function AvailableTripsSection({
  trips,
  onBookingComplete,
}: AvailableTripsSectionProps) {
  const navigate = useNavigate();
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleTripClick = (trip: Trip) => {
    // If user already booked, navigate to bookings page
    if (trip.has_booked && trip.booking_id) {
      navigate("/bookings");
      return;
    }

    // Otherwise, open booking modal
    setSelectedTrip(trip);
    setIsBookingModalOpen(true);
  };

  const handleConfirmBooking = async (hall: Hall) => {
    if (!selectedTrip) return;

    try {
      setSubmitting(true);
      const response = await bookingApi.createBooking({
        trip_id: selectedTrip.id,
        hall: hall,
      });

      if (response.success) {
        toast.success("Booking confirmed!", {
          description: `You have successfully booked ${selectedTrip.trip_title}. Check "My Bookings" for details.`,
          duration: 5000,
        });
        setIsBookingModalOpen(false);
        setSelectedTrip(null);
        // Refresh dashboard data
        if (onBookingComplete) {
          onBookingComplete();
        }
      }
    } catch (error: unknown) {
      console.error("Booking failed:", error);

      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      // Handle specific errors
      if (errorMessage.includes("already booked")) {
        toast.error("Already Booked", {
          description: "You have already booked this trip.",
          duration: 5000,
        });
      } else if (errorMessage.includes("booking window is closed")) {
        toast.error("Booking Closed", {
          description: "The booking window for this trip has closed.",
          duration: 5000,
        });
      } else {
        toast.error("Booking Failed", {
          description:
            errorMessage || "Failed to create booking. Please try again.",
          duration: 5000,
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div>
        <h2 className="text-2xl font-bold mb-4">Available Trips</h2>
        <p className="text-muted-foreground mb-6">
          Book your seat for upcoming Friday prayer trips
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <ActiveTripCard
              key={trip.id}
              trip={trip}
              onBookClick={handleTripClick}
            />
          ))}
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        trip={selectedTrip}
        open={isBookingModalOpen}
        onOpenChange={setIsBookingModalOpen}
        onConfirm={handleConfirmBooking}
        isSubmitting={submitting}
      />
    </>
  );
}
