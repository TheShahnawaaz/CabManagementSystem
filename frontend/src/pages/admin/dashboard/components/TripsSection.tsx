/**
 * Trips Section Component
 *
 * Shows active and upcoming trips that users can see
 * Matches user dashboard style (no card wrapper)
 */

import { Button } from "@/components/ui/button";
import { Plus, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { AdminTripCard } from "./AdminTripCard";
import type { Trip } from "@/types/trip.types";

interface TripsSectionProps {
  trips: Trip[];
  onEditTrip: (trip: Trip) => void;
}

export function TripsSection({ trips, onEditTrip }: TripsSectionProps) {
  return (
    <div>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Active & Upcoming Trips</h2>
          <p className="text-muted-foreground mt-1">
            Trips available for students to book
          </p>
        </div>
        <Link to="/admin/trips">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Trip
          </Button>
        </Link>
      </div>

      {/* Trips Grid or Empty State */}
      {trips.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
            <Calendar className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No trips available</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            There are no active or upcoming trips at the moment. Create a new
            trip to get started.
          </p>
          <Link to="/admin/trips">
            <Button size="lg">
              <Plus className="h-5 w-5 mr-2" />
              Create Your First Trip
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <AdminTripCard key={trip.id} trip={trip} onEdit={onEditTrip} />
          ))}
        </div>
      )}
    </div>
  );
}
