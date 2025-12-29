import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { bookingApi } from "@/services/booking.service";
import type { Booking } from "@/types/booking.types";
import { BookingCard } from "./BookingCard";
import { BookingCardSkeleton } from "./BookingCardSkeleton";
import { QRCardModal } from "@/components/QRCardModal";
import { CabDetailsSheet } from "@/components/CabDetailsSheet";

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"active" | "all">("active");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [cabDetailsOpen, setCabDetailsOpen] = useState(false);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingApi.getMyBookings(undefined);
      if (response.success && response.data) {
        setBookings(response.data);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleViewQR = (booking: Booking) => {
    setSelectedBooking(booking);
    setQrModalOpen(true);
  };

  const handleCloseQR = () => {
    setQrModalOpen(false);
    setSelectedBooking(null);
  };

  const handleViewCab = (booking: Booking) => {
    setSelectedBooking(booking);
    setCabDetailsOpen(true);
  };

  // Filter bookings based on active tab
  const filteredBookings = bookings.filter((booking) => {
    const now = new Date();
    const tripEnd = new Date(booking.end_time);

    if (activeTab === "active") {
      return tripEnd >= now; // Only show active bookings
    } else {
      return true; // Show all bookings
    }
  });

  const activeCount = bookings.filter(
    (b) => new Date(b.end_time) >= new Date()
  ).length;
  const allCount = bookings.length;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
          <p className="text-muted-foreground mb-6">
            View your active and past Friday prayer trip bookings
          </p>

          {/* Tabs */}
          <Tabs value="active" onValueChange={() => {}}>
            <TabsList className="grid w-full md:w-[350px] grid-cols-2">
              <TabsTrigger value="active" disabled className="gap-2">
                Active <Badge variant="secondary">...</Badge>
              </TabsTrigger>
              <TabsTrigger value="all" disabled className="gap-2">
                All Bookings <Badge variant="secondary">...</Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <BookingCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
        <p className="text-muted-foreground mb-6">
          View your active and past Friday prayer trip bookings
        </p>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "active" | "all")}
        >
          <TabsList className="grid w-full md:w-[350px] grid-cols-2">
            <TabsTrigger value="active" className="gap-2">
              Active <Badge variant="secondary">{activeCount}</Badge>
            </TabsTrigger>
            <TabsTrigger value="all" className="gap-2">
              All Bookings <Badge variant="secondary">{allCount}</Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Bookings Grid */}
      {filteredBookings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onViewQR={handleViewQR}
              onViewCab={handleViewCab}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            {activeTab === "active"
              ? "No active bookings found"
              : "No bookings found"}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {activeTab === "active"
              ? "Book a trip from the Trips page to get started"
              : "Your bookings will appear here once you book a trip"}
          </p>
        </div>
      )}

      {/* Modals */}
      {selectedBooking && (
        <>
          <QRCardModal
            booking={selectedBooking}
            open={qrModalOpen}
            onClose={handleCloseQR}
          />
          <CabDetailsSheet
            booking={selectedBooking}
            open={cabDetailsOpen}
            onClose={() => setCabDetailsOpen(false)}
          />
        </>
      )}
    </div>
  );
}
