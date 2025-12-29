import { useState, useEffect } from "react";
import { Calendar, MapPin, CreditCard, Users, AlertCircle, QrCode } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { bookingApi } from "@/services/booking.service";
import type { Booking } from "@/types/booking.types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QRCardModal } from "@/components/QRCardModal";

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const status =
        activeTab === "all"
          ? undefined
          : (activeTab as "upcoming" | "past" | "active");
      const response = await bookingApi.getMyBookings(status);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

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

  const getBookingStatus = (booking: Booking) => {
    const now = new Date();
    const tripEnd = new Date(booking.end_time);
    const returnTime = new Date(booking.return_time);

    if (tripEnd < now) {
      return { label: "Completed", color: "bg-gray-500" };
    } else if (returnTime <= now && now < tripEnd) {
      return { label: "In Progress", color: "bg-green-500" };
    } else if (booking.cab_number) {
      return { label: "Cab Allocated", color: "bg-blue-500" };
    } else {
      return { label: "Awaiting Allocation", color: "bg-yellow-500" };
    }
  };

  const handleViewQR = (booking: Booking) => {
    setSelectedBooking(booking);
    setQrModalOpen(true);
  };

  const handleCloseQR = () => {
    setQrModalOpen(false);
    setSelectedBooking(null);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-6 w-96" />
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-6">
              <div className="space-y-3">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </Card>
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
        <p className="text-muted-foreground">
          View and manage your Friday cab bookings
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All Bookings</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Bookings Found</h3>
            <p className="text-muted-foreground mb-4">
              You haven't made any bookings yet.
            </p>
            <Button onClick={() => (window.location.href = "/trips")}>
              Browse Active Trips
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const status = getBookingStatus(booking);

            return (
              <Card key={booking.id} className="p-6">
                <div className="flex flex-col gap-4">
                  {/* Trip Info */}
                  <div className="flex-1 space-y-3">
                    {/* Title & Status */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-xl font-bold">
                        {booking.trip_title}
                      </h3>
                      <Badge className={status.color}>{status.label}</Badge>
                      {booking.payment_status === "cancelled" && (
                        <Badge variant="destructive">Cancelled</Badge>
                      )}
                    </div>

                    {/* Trip Details */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {formatDate(booking.trip_date)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          Hall:{" "}
                          <span className="font-medium text-foreground">
                            {booking.hall}
                          </span>
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          Amount:{" "}
                          <span className="font-medium text-foreground">
                            ₹{booking.payment_amount}
                          </span>
                          {" • "}
                          Payment:{" "}
                          <span className="font-medium text-foreground capitalize">
                            {booking.payment_status}
                          </span>
                        </span>
                      </div>

                      {/* Cab Details */}
                      {booking.cab_number ? (
                        <div className="mt-3 p-3 rounded-md bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
                          <div className="flex items-center gap-2 mb-1">
                            <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <span className="font-semibold text-blue-900 dark:text-blue-100">
                              Cab Allocated
                            </span>
                          </div>
                          <div className="text-sm space-y-1">
                            <p>
                              <span className="text-muted-foreground">
                                Cab Number:
                              </span>{" "}
                              <span className="font-medium">
                                {booking.cab_number}
                              </span>
                            </p>
                            <p>
                              <span className="text-muted-foreground">
                                Pickup:
                              </span>{" "}
                              <span className="font-medium">
                                {booking.pickup_region}
                              </span>
                            </p>
                            <p>
                              <span className="text-muted-foreground">
                                Departure:
                              </span>{" "}
                              <span className="font-medium">
                                {formatDateTime(booking.return_time)}
                              </span>
                            </p>
                          </div>

                          {/* QR Code Button */}
                          {booking.allocation_id && (
                            <Button
                              className="w-full mt-3"
                              variant="default"
                              size="sm"
                              onClick={() => handleViewQR(booking)}
                            >
                              <QrCode className="w-4 h-4 mr-2" />
                              View QR Code
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="mt-3 p-3 rounded-md bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                            <span className="text-sm text-yellow-900 dark:text-yellow-100">
                              Cab details will be available after allocation
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Transaction ID */}
                <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
                  Transaction ID: {booking.transaction_id}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* QR Code Modal */}
      {selectedBooking && (
        <QRCardModal
          booking={selectedBooking}
          open={qrModalOpen}
          onClose={handleCloseQR}
        />
      )}
    </div>
  );
}
