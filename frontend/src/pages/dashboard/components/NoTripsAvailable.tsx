/**
 * No Trips Available Component
 *
 * Case 4: No bookings, no active trips, no upcoming trips
 * Empty state with helpful message
 */

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Calendar } from "lucide-react";

export function NoTripsAvailable() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Calendar className="size-6" />
        </EmptyMedia>
        <EmptyTitle>No Trips Available</EmptyTitle>
      </EmptyHeader>
      <EmptyDescription>
        There are no trips available to book right now. Please check back later
        for upcoming Friday prayer trips.
      </EmptyDescription>
    </Empty>
  );
}
