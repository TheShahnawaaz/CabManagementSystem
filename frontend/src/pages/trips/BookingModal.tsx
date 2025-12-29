import { useState } from "react";
import { format } from "date-fns";
import { Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Trip } from "@/types/trip.types";
import type { Hall } from "@/types/booking.types";
import { HALLS } from "@/types/booking.types";

interface BookingModalProps {
  trip: Trip | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (hall: Hall) => void;
  isSubmitting: boolean;
}

export function BookingModal({
  trip,
  open,
  onOpenChange,
  onConfirm,
  isSubmitting,
}: BookingModalProps) {
  const [selectedHall, setSelectedHall] = useState<Hall>("RK");

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

  if (!trip) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Booking</DialogTitle>
          <DialogDescription>
            Complete your booking for {trip.trip_title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Trip Details */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Trip Date:</span>
              <span className="font-medium">{formatDate(trip.trip_date)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Departure:</span>
              <span className="font-medium">
                {formatDateTime(trip.return_time)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Amount:</span>
              <span className="font-medium text-lg">
                ₹{trip.amount_per_person}
              </span>
            </div>
          </div>

          {/* Hall Selection */}
          <div className="space-y-2">
            <Label htmlFor="hall">Select Your Hostel Hall *</Label>
            <Select
              value={selectedHall}
              onValueChange={(value) => setSelectedHall(value as Hall)}
            >
              <SelectTrigger id="hall">
                <SelectValue placeholder="Select your hall" />
              </SelectTrigger>
              <SelectContent>
                {HALLS.map((hall) => (
                  <SelectItem key={hall.value} value={hall.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{hall.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {hall.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Terms */}
          <div className="rounded-md bg-muted p-3 text-sm">
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 mt-0.5 text-green-600" />
              <div className="space-y-1">
                <p className="font-medium">Booking Confirmation</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Payment will be processed instantly (mock mode)</li>
                  <li>• You will receive cab details after allocation</li>
                  <li>• Cancellation allowed before trip starts</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={() => onConfirm(selectedHall)}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Processing..."
              : `Confirm Booking (₹${trip.amount_per_person})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

