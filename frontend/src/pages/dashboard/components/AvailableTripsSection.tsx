/**
 * Available Trips Section Component
 *
 * Case 2: No active bookings but active trips available
 * Shows trip cards that users can book
 */

import { useNavigate } from "react-router-dom";
import { ActiveTripCard } from "@/pages/trips/ActiveTripCard";
import type { Trip } from "@/types/trip.types";

interface AvailableTripsSectionProps {
  trips: Trip[];
  onBookingComplete?: () => void;
}

export function AvailableTripsSection({ trips }: AvailableTripsSectionProps) {
  const navigate = useNavigate();

  const handleTripClick = (trip: Trip) => {
    // If user already booked, navigate to bookings page
    if (trip.has_booked && trip.booking_id) {
      navigate("/bookings");
      return;
    }

    // Navigate to checkout page with trip data
    navigate(`/checkout/${trip.id}`, { state: { trip } });
  };

  return (
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
  );
}
