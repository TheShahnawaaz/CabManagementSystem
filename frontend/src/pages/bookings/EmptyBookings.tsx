/**
 * Empty Bookings Component
 *
 * Displays appropriate empty state based on booking tab (active/all)
 */

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { CalendarX, CalendarClock } from "lucide-react";
import { Link } from "react-router-dom";

interface EmptyBookingsProps {
  type: "active" | "all";
}

export function EmptyBookings({ type }: EmptyBookingsProps) {
  const isActive = type === "active";

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          {isActive ? (
            <CalendarClock className="size-6" />
          ) : (
            <CalendarX className="size-6" />
          )}
        </EmptyMedia>
        <EmptyTitle>
          {isActive ? "No Active Bookings" : "No Bookings Found"}
        </EmptyTitle>
        <EmptyDescription>
          {isActive
            ? "You don't have any active bookings at the moment. Book a trip to get started."
            : "Your booking history will appear here once you book a trip."}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Link to="/trips" className="w-full max-w-xs">
          <Button className="w-full" size="sm">
            Browse Available Trips
          </Button>
        </Link>
      </EmptyContent>
    </Empty>
  );
}
