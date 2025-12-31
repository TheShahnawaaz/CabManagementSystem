/**
 * Admin Trip Card Component
 *
 * Unified card for displaying trips in admin dashboard
 * Handles active, upcoming, and completed trip states
 */

import { format } from "date-fns";
import {
  Calendar,
  Clock,
  MapPin,
  IndianRupee,
  Users,
  Edit,
  Eye,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Trip } from "@/types/trip.types";

interface AdminTripCardProps {
  trip: Trip;
  onEdit: (trip: Trip) => void;
}

export function AdminTripCard({ trip, onEdit }: AdminTripCardProps) {
  const navigate = useNavigate();

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy • HH:mm");
    } catch {
      return dateString;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "EEEE, MMMM do, yyyy");
    } catch {
      return dateString;
    }
  };

  // Get trip status (same logic as admin trip table)
  const getTripStatus = () => {
    const now = new Date();
    const bookingStart = new Date(trip.booking_start_time);
    const bookingEnd = new Date(trip.booking_end_time);
    const tripDate = new Date(trip.trip_date);

    // Completed: trip date has passed
    if (now > tripDate) {
      return {
        label: "Completed",
        color: "bg-gray-500",
        variant: "completed" as const,
      };
    }

    // Active: booking window is open
    if (now >= bookingStart && now <= bookingEnd) {
      const diff = bookingEnd.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const days = Math.floor(hours / 24);

      let timeLeft = "";
      if (days > 0) {
        timeLeft = `${days} day${days > 1 ? "s" : ""} left`;
      } else if (hours > 0) {
        timeLeft = `${hours} hour${hours > 1 ? "s" : ""} left`;
      } else {
        timeLeft = "Closing soon";
      }

      return {
        label: `Active • ${timeLeft}`,
        color: "bg-green-500",
        variant: "active" as const,
      };
    }

    // Upcoming: booking hasn't started yet
    if (now < bookingStart) {
      const diff = bookingStart.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const days = Math.floor(hours / 24);

      let opensIn = "";
      if (days > 0) {
        opensIn = `Opens in ${days} day${days > 1 ? "s" : ""}`;
      } else if (hours > 0) {
        opensIn = `Opens in ${hours} hour${hours > 1 ? "s" : ""}`;
      } else {
        opensIn = "Opens soon";
      }

      return {
        label: opensIn,
        color: "bg-blue-500",
        variant: "upcoming" as const,
      };
    }

    // Closed: booking window closed but trip hasn't happened
    return {
      label: "Booking Closed",
      color: "bg-orange-500",
      variant: "closed" as const,
    };
  };

  const status = getTripStatus();
  const canViewDetails = status.variant !== "upcoming";

  const handleViewDetails = () => {
    if (canViewDetails) {
      navigate(`/admin/trips/${trip.id}`);
    }
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      {/* Trip Badge */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Badge className={status.color}>{status.label}</Badge>
        {trip.booking_count ? (
          <Badge variant="secondary" className="gap-1">
            <Users className="h-3 w-3" />
            {trip.booking_count} booked
          </Badge>
        ) : null}
      </div>

      {/* Trip Title */}
      <h3 className="text-xl font-bold mb-2">{trip.trip_title}</h3>

      {/* Trip Date */}
      <div className="flex items-start gap-2 mb-3 text-sm">
        <Calendar className="w-4 h-4 mt-0.5 text-muted-foreground" />
        <span className="text-muted-foreground">
          {formatDate(trip.trip_date)}
        </span>
      </div>

      {/* Booking Window */}
      <div className="flex items-start gap-2 mb-3 text-sm">
        <Clock className="w-4 h-4 mt-0.5 text-muted-foreground" />
        <div className="text-muted-foreground">
          {status.variant === "active" ? (
            <div className="text-green-600 dark:text-green-400 font-medium">
              Book until: {formatDateTime(trip.booking_end_time)}
            </div>
          ) : status.variant === "upcoming" ? (
            <div className="text-blue-600 dark:text-blue-400 font-medium">
              Opens: {formatDateTime(trip.booking_start_time)}
            </div>
          ) : (
            <div className="text-muted-foreground">
              Closed: {formatDateTime(trip.booking_end_time)}
            </div>
          )}
        </div>
      </div>

      {/* Departure Time */}
      <div className="flex items-start gap-2 mb-3 text-sm">
        <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground" />
        <div className="text-muted-foreground">
          <div>Departs: {formatDateTime(trip.return_time)}</div>
        </div>
      </div>

      {/* Amount */}
      <div className="flex items-center gap-2 mb-6">
        <IndianRupee className="w-5 h-5 text-primary" />
        <span className="text-2xl font-bold">{trip.amount_per_person}</span>
        <span className="text-sm text-muted-foreground">per person</span>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => onEdit(trip)}
        >
          <Edit className="w-4 h-4 mr-2" />
          Edit
        </Button>
        <Button
          variant="default"
          className="flex-1"
          disabled={!canViewDetails}
          onClick={handleViewDetails}
        >
          <Eye className="w-4 h-4 mr-2" />
          View Details
        </Button>
      </div>
    </Card>
  );
}
