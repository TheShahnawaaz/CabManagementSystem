/**
 * Upcoming Trips Card Component
 *
 * Shows next 5 upcoming trips
 */

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import type { Trip } from "@/types/trip.types";

interface UpcomingTripsCardProps {
  trips: Trip[];
}

export function UpcomingTripsCard({ trips }: UpcomingTripsCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Upcoming Trips</h2>
        </div>
        <Link to="/admin/trips">
          <Button variant="ghost" size="sm">
            View All
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </div>

      {trips.length === 0 ? (
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-3">
            <Calendar className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">No upcoming trips</p>
          <p className="text-xs text-muted-foreground mt-1">
            Create a new trip to get started
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {trips.slice(0, 5).map((trip) => (
            <Link key={trip.id} to={`/admin/trips/${trip.id}`}>
              <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {trip.trip_title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(trip.trip_date), "MMM dd, yyyy • HH:mm")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="gap-1">
                    <Users className="h-3 w-3" />
                    {trip.booking_count || 0}
                  </Badge>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Card>
  );
}
