/**
 * Upcoming Trips Section Component
 *
 * Case 3: No active bookings/trips but upcoming trips exist
 * Shows read-only trip cards for future reference
 */

import { UpcomingTripCard } from "@/pages/trips/UpcomingTripCard";
import type { Trip } from "@/types/trip.types";

interface UpcomingTripsSectionProps {
  trips: Trip[];
}

export function UpcomingTripsSection({ trips }: UpcomingTripsSectionProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Coming Soon</h2>
      <p className="text-muted-foreground mb-6">
        These trips will open for booking soon. Check back later!
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trips.map((trip) => (
          <UpcomingTripCard key={trip.id} trip={trip} />
        ))}
      </div>
    </div>
  );
}
