/**
 * Empty Trips Component
 *
 * Displays appropriate empty state based on trip tab (active/upcoming)
 */

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Calendar, CalendarClock } from "lucide-react";

interface EmptyTripsProps {
  type: "active" | "upcoming";
}

export function EmptyTrips({ type }: EmptyTripsProps) {
  const isActive = type === "active";

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          {isActive ? (
            <CalendarClock className="size-6" />
          ) : (
            <Calendar className="size-6" />
          )}
        </EmptyMedia>
        <EmptyTitle>
          {isActive ? "No Active Trips" : "No Upcoming Trips"}
        </EmptyTitle>
        <EmptyDescription>
          {isActive
            ? "There are currently no trips available for booking. Please check back later."
            : "No upcoming trips scheduled yet. New trips will appear here once announced."}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          {isActive
            ? "Booking windows open a few days before the trip date."
            : "Check the Active tab for trips you can book now."}
        </p>
      </EmptyContent>
    </Empty>
  );
}
