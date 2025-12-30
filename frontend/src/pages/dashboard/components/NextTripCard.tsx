/**
 * Next Trip Card Component
 *
 * Displays the user's next upcoming trip with details and actions
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Calendar, Car, MapPin, AlertCircle, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { QRCardModal } from "@/components/QRCardModal";
import { CabDetailsSheet } from "@/components/CabDetailsSheet";
import type { Booking } from "@/types/booking.types";

interface NextTripCardProps {
  booking: Booking;
}

export function NextTripCard({ booking }: NextTripCardProps) {
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [cabDetailsOpen, setCabDetailsOpen] = useState(false);

  const getStatusBadge = () => {
    if (booking.cab_number) {
      return (
        <Badge variant="default" className="bg-green-500">
          Cab Allocated
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="bg-yellow-500">
        Awaiting Allocation
      </Badge>
    );
  };

  return (
    <>
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Next Trip
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border">
            {/* Trip Title & Status */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-lg">{booking.trip_title}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {format(new Date(booking.trip_date), "EEEE, MMMM do, yyyy")}{" "}
                  at {format(new Date(booking.return_time), "HH:mm")}
                </p>
              </div>
              {getStatusBadge()}
            </div>

            <Separator className="my-3" />

            {/* Cab & Pickup Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Car className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Cab Number</p>
                  <p className="font-semibold text-sm">
                    {booking.cab_number || "Not assigned yet"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Pickup Point</p>
                  <p className="font-semibold text-sm">
                    {booking.pickup_region || booking.hall}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-4">
              <Button size="sm" className="flex-1" asChild>
                <Link to="/bookings">
                  View Details
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              {booking.allocation_id && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setQrModalOpen(true)}
                  >
                    View QR Code
                  </Button>
                  {booking.cab_number && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCabDetailsOpen(true)}
                    >
                      <Car className="h-4 w-4" />
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Info Alert */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
            <AlertCircle className="h-4 w-4 text-blue-500 flex-shrink-0" />
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Remember to arrive 10 minutes before departure time
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <QRCardModal
        booking={booking}
        open={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
      />
      <CabDetailsSheet
        booking={booking}
        open={cabDetailsOpen}
        onClose={() => setCabDetailsOpen(false)}
      />
    </>
  );
}
