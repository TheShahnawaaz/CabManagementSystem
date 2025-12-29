import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar } from "lucide-react";
import { toast } from "sonner";
import { tripApi } from "@/services/trip.service";
import { bookingApi } from "@/services/booking.service";
import type { Trip } from "@/types/trip.types";
import type { Hall } from "@/types/booking.types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ActiveTripCard } from "./ActiveTripCard";
import { UpcomingTripCard } from "./UpcomingTripCard";
import { TripCardSkeleton } from "./TripCardSkeleton";
import { BookingModal } from "./BookingModal";

export default function TripsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"active" | "upcoming">("active");
  const [activeTrips, setActiveTrips] = useState<Trip[]>([]);
  const [upcomingTrips, setUpcomingTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      setLoading(true);

      // Fetch active trips (authenticated - with booking status)
      const activeResponse = await tripApi.getActiveTripsForMe();
      if (activeResponse.success && activeResponse.data) {
        setActiveTrips(activeResponse.data);
      }

      // Fetch upcoming trips (public)
      const upcomingResponse = await tripApi.getUpcomingTrips();
      if (upcomingResponse.success && upcomingResponse.data) {
        setUpcomingTrips(upcomingResponse.data);
      }
    } catch (error) {
      console.error("Error fetching trips:", error);
      toast.error("Failed to load trips");
    } finally {
      setLoading(false);
    }
  };

  const handleActiveBookClick = (trip: Trip) => {
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
        // Refresh trips to update booking status
        fetchTrips();
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

  const getCurrentTrips = () => {
    return activeTab === "active" ? activeTrips : upcomingTrips;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Trips</h1>
          <p className="text-muted-foreground mb-6">
            Browse and book your trips for Friday prayer journeys
          </p>

          {/* Tabs Skeleton */}
          <Tabs value="active" onValueChange={() => {}}>
            <TabsList className="grid w-full md:w-[350px] grid-cols-2">
              <TabsTrigger value="active" disabled className="gap-2">
                Active <Badge variant="secondary">...</Badge>
              </TabsTrigger>
              <TabsTrigger value="upcoming" disabled className="gap-2">
                Upcoming <Badge variant="secondary">...</Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Trip Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <TripCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  const trips = getCurrentTrips();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Trips</h1>
        <p className="text-muted-foreground mb-6">
          Browse and book your trips for Friday prayer journeys
        </p>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as "active" | "upcoming")}
        >
          <TabsList className="grid w-full md:w-[350px] grid-cols-2">
            <TabsTrigger value="active" className="gap-2">
              Active <Badge variant="secondary">{activeTrips.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="gap-2">
              Upcoming <Badge variant="secondary">{upcomingTrips.length}</Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Trips Grid */}
      {trips.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {activeTab === "active" ? "No Active Trips" : "No Upcoming Trips"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {activeTab === "active"
                ? "There are currently no trips available for booking. Please check back later."
                : "No upcoming trips scheduled yet. New trips will appear here once announced."}
            </p>
            <p className="text-sm text-muted-foreground">
              {activeTab === "active"
                ? "Booking windows open a few days before the trip date."
                : "Check the Active tab for trips you can book now."}
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeTab === "active"
            ? trips.map((trip) => (
                <ActiveTripCard
                  key={trip.id}
                  trip={trip}
                  onBookClick={handleActiveBookClick}
                />
              ))
            : trips.map((trip) => (
                <UpcomingTripCard key={trip.id} trip={trip} />
              ))}
        </div>
      )}

      {/* Booking Modal */}
      <BookingModal
        trip={selectedTrip}
        open={isBookingModalOpen}
        onOpenChange={setIsBookingModalOpen}
        onConfirm={handleConfirmBooking}
        isSubmitting={submitting}
      />
    </div>
  );
}
