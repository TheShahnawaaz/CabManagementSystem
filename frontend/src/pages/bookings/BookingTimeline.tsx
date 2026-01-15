/**
 * Booking Timeline Component - Vertical & Minimal
 *
 * Clean vertical timeline with no repetitive text
 */

import { format } from "date-fns";
import {
  Calendar,
  CreditCard,
  Lock,
  Car,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface BookingTimelineProps {
  bookingStartTime: string;
  paymentDate: string;
  bookingEndTime: string;
  allocationId?: string | null;
  departureTime: string;
  endTime: string;
  cabNumber?: string | null;
}

export function BookingTimeline({
  bookingStartTime,
  paymentDate,
  bookingEndTime,
  allocationId,
  departureTime,
  endTime,
  cabNumber,
}: BookingTimelineProps) {
  const now = new Date();

  const formatTime = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, HH:mm");
    } catch {
      return "N/A";
    }
  };

  const getCurrentStage = (): number => {
    if (now >= new Date(endTime)) return 6;
    if (now >= new Date(departureTime)) return 5;
    if (allocationId) return 4;
    if (now >= new Date(bookingEndTime)) return 3;
    return 2;
  };

  const currentStage = getCurrentStage();

  const events = [
    {
      label: "Booking Window Opened",
      time: formatTime(bookingStartTime),
      icon: Calendar,
      completed: now >= new Date(bookingStartTime),
    },
    {
      label: "Payment Confirmed",
      time: formatTime(paymentDate),
      icon: CreditCard,
      completed: true,
    },
    {
      label: "Booking Window Closed",
      time: formatTime(bookingEndTime),
      icon: Lock,
      completed: currentStage >= 3,
      current: currentStage === 3,
    },
    {
      label: allocationId
        ? `Cab Assigned${cabNumber ? ` - ${cabNumber}` : ""}`
        : "Awaiting Cab Assignment",
      time: allocationId ? formatTime(bookingEndTime) : "Pending",
      icon: Car,
      completed: currentStage >= 4,
      current: currentStage === 4 || (!allocationId && currentStage === 3),
      skipped: !allocationId,
    },
    {
      label: "Trip Departure",
      time: formatTime(departureTime),
      icon: MapPin,
      completed: currentStage >= 5,
      current: currentStage === 5,
    },
    {
      label: "Trip Completed",
      time: formatTime(endTime),
      icon: CheckCircle2,
      completed: currentStage >= 6,
      current: false,
    },
  ];

  return (
    <div className="space-y-3">
      {events.map((event, index) => {
        const isLast = index === events.length - 1;

        return (
          <div key={index} className="relative flex gap-3">
            {/* Timeline Line */}
            {!isLast && (
              <div
                className={cn(
                  "absolute left-3 top-8 bottom-0 w-0.5 -translate-x-1/2",
                  event.completed ? "bg-green-500/30" : "bg-border"
                )}
              />
            )}

            {/* Icon */}
            <div
              className={cn(
                "relative z-10 flex items-center justify-center w-6 h-6 rounded-full border-2 transition-all flex-shrink-0",
                event.completed && "bg-green-500 border-green-500 text-white",
                event.current &&
                  !event.completed &&
                  "bg-primary border-primary text-primary-foreground ring-4 ring-primary/20",
                !event.completed &&
                  !event.current &&
                  !event.skipped &&
                  "bg-background border-border text-muted-foreground",
                event.skipped &&
                  "bg-muted border-muted-foreground/30 text-muted-foreground"
              )}
            >
              <event.icon className="w-3 h-3" strokeWidth={2.5} />
            </div>

            {/* Content */}
            <div className="flex-1 pb-4 pt-0.5">
              <div className="flex items-baseline justify-between gap-2">
                <span
                  className={cn(
                    "text-sm font-medium",
                    event.completed && "text-foreground",
                    event.current && "text-primary font-semibold",
                    !event.completed &&
                      !event.current &&
                      "text-muted-foreground"
                  )}
                >
                  {event.label}
                </span>
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-xs font-normal whitespace-nowrap",
                    event.completed &&
                      "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
                    event.current &&
                      !event.completed &&
                      "bg-primary/10 text-primary dark:bg-primary/20",
                    !event.completed &&
                      !event.current &&
                      !event.skipped &&
                      "bg-muted text-muted-foreground",
                    event.skipped && "bg-muted/50 text-muted-foreground/60"
                  )}
                >
                  {event.time}
                </Badge>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
