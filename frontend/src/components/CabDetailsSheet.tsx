import { useState, useEffect, useCallback } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Car, Users, Loader2, AlertCircle } from "lucide-react";
import { VehicleSeatViewer } from "@/components/VehicleSeatViewer";
import { qrApi } from "@/services/qr.service";
import type { SeatPosition, AssignedStudent } from "@/types/allocation.types";
import type { CabDetails } from "@/types/qr.types";
import type { Booking } from "@/types/booking.types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface CabDetailsSheetProps {
  booking: Booking;
  open: boolean;
  onClose: () => void;
}

// Utility function to map students to seats (same as admin)
function mapStudentsToSeats(
  students: AssignedStudent[]
): Partial<Record<SeatPosition, AssignedStudent>> {
  const seats: Partial<Record<SeatPosition, AssignedStudent>> = {};
  const seatOrder: SeatPosition[] = ["F1", "M1", "M2", "M3", "B1", "B2", "B3"];

  students.forEach((student, index) => {
    if (index < seatOrder.length) {
      seats[seatOrder[index]] = student;
    }
  });

  return seats;
}

export function CabDetailsSheet({
  booking,
  open,
  onClose,
}: CabDetailsSheetProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cabDetails, setCabDetails] = useState<CabDetails | null>(null);

  const fetchCabDetails = useCallback(async () => {
    if (!booking.allocation_id) return;

    try {
      setLoading(true);
      setError(null);
      const response = await qrApi.getCabDetails(booking.allocation_id);
      setCabDetails(response.data ?? null);
    } catch (err) {
      console.error("Error fetching cab details:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to load cab details. Please try again later.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [booking.allocation_id]);

  useEffect(() => {
    if (open && booking.allocation_id) {
      fetchCabDetails();
    }
  }, [open, booking.allocation_id, fetchCabDetails]);

  // Map students to seat positions
  const studentsBySeat = cabDetails
    ? mapStudentsToSeats(cabDetails.assigned_students)
    : {};

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-4xl overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-2xl">
            <Car className="w-6 h-6 text-primary" />
            My Cab Details
          </SheetTitle>
          <SheetDescription>{booking.trip_title}</SheetDescription>
        </SheetHeader>

        <Separator className="my-4" />

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading cab details...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Cab Details Content */}
        {cabDetails && !loading && !error && (
          <div className="space-y-6 pb-6">
            {/* Cab Summary */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border">
              <div>
                <h3 className="text-lg font-semibold">
                  {cabDetails.cab_number}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {cabDetails.assigned_students.length}/7 seats filled
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">
                  {cabDetails.pickup_region}
                </p>
              </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr,auto,1fr] gap-6 lg:gap-8">
              {/* Left: Cab Details */}
              <div className="space-y-4">
                <h4 className="font-semibold text-base flex items-center gap-2">
                  <Car className="w-4 h-4" />
                  Vehicle Information
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Cab Number</Label>
                    <div className="h-10 px-3 py-2 rounded-md border bg-muted/50 flex items-center font-mono text-sm">
                      {cabDetails.cab_number}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Cab Type</Label>
                    <div className="h-10 px-3 py-2 rounded-md border bg-muted/50 flex items-center text-sm capitalize">
                      {cabDetails.cab_type}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Driver Name</Label>
                  <div className="h-10 px-3 py-2 rounded-md border bg-muted/50 flex items-center text-sm">
                    {cabDetails.driver_name}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Driver Phone</Label>
                  <div className="h-10 px-3 py-2 rounded-md border bg-muted/50 flex items-center text-sm">
                    {cabDetails.driver_phone}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Pickup Region</Label>
                  <div className="h-10 px-3 py-2 rounded-md border bg-muted/50 flex items-center text-sm">
                    {cabDetails.pickup_region}
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="hidden lg:block">
                <Separator orientation="vertical" className="h-full" />
              </div>
              <div className="lg:hidden">
                <Separator orientation="horizontal" />
              </div>

              {/* Right: Vehicle Seat Viewer */}
              <div className="space-y-4">
                <h4 className="font-semibold text-base flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Seating Arrangement
                </h4>

                <div className="flex items-center justify-center lg:justify-start">
                  <VehicleSeatViewer students={studentsBySeat} />
                </div>
              </div>
            </div>

            {/* Info Banner */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>
                Hover or tap on any seat to view detailed student information
                including contact details.
              </AlertTitle>
            </Alert>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
