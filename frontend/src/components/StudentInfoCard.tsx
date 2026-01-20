import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Mail, Phone, Car, Armchair, UserPlus, Loader2 } from "lucide-react";
import { formatPhoneNumber } from "@/lib/utils";
import { toast } from "sonner";
import { tripApi } from "@/services/trip.service";

// Hall color mapping
const HALL_COLORS: Record<
  string,
  { avatar: string; text: string; badge: string }
> = {
  RK: {
    avatar: "bg-blue-500",
    text: "text-blue-950 dark:text-blue-50",
    badge: "text-blue-500",
  },
  VS: {
    avatar: "bg-purple-500",
    text: "text-purple-950 dark:text-purple-50",
    badge: "text-purple-500",
  },
  LBS: {
    avatar: "bg-green-500",
    text: "text-green-950 dark:text-green-50",
    badge: "text-green-500",
  },
  PAN: {
    avatar: "bg-orange-500",
    text: "text-orange-950 dark:text-orange-50",
    badge: "text-orange-500",
  },
  MS: {
    avatar: "bg-pink-500",
    text: "text-pink-950 dark:text-pink-50",
    badge: "text-pink-500",
  },
  HJB: {
    avatar: "bg-cyan-500",
    text: "text-cyan-950 dark:text-cyan-50",
    badge: "text-cyan-500",
  },
  LLR: {
    avatar: "bg-amber-500",
    text: "text-amber-950 dark:text-amber-50",
    badge: "text-amber-500",
  },
};

export interface StudentInfo {
  user_id: string;
  name: string;
  email: string;
  hall: string;
  profile_picture?: string | null;
  phone_number?: string | null;
  seat_position?: number | string;
  allocated_cab_number?: string;
  allocated_cab_region?: string;
}

// Cab info for boarding selection
export interface BoardingCab {
  cab_id: string;
  cab_number: string;
  pickup_region: string;
  driver_name: string;
}

interface StudentInfoCardProps {
  student: StudentInfo;
  /** Show email row */
  showEmail?: boolean;
  /** Show phone row */
  showPhone?: boolean;
  /** Show seat position row */
  showSeat?: boolean;
  /** Show allocated cab info */
  showAllocatedCab?: boolean;
  /** Compact mode - smaller avatar and less padding */
  compact?: boolean;
  /** Custom className for the wrapper */
  className?: string;
  /** Enable boarding functionality */
  boardingEnabled?: boolean;
  /** Trip ID for boarding */
  tripId?: string;
  /** Journey type for boarding */
  journeyType?: "pickup" | "dropoff";
  /** Assigned cab ID (for pickup - auto board to this cab) */
  assignedCabId?: string;
  /** Available cabs (for dropoff - select from list) */
  availableCabs?: BoardingCab[];
  /** Callback after successful boarding */
  onBoardingSuccess?: () => void;
}

export function StudentInfoCard({
  student,
  showEmail = true,
  showPhone = true,
  showSeat = false,
  showAllocatedCab = false,
  compact = false,
  className = "",
  boardingEnabled = false,
  tripId,
  journeyType,
  assignedCabId,
  availableCabs = [],
  onBoardingSuccess,
}: StudentInfoCardProps) {
  const [loading, setLoading] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const hallColors = HALL_COLORS[student.hall] || {
    avatar: "bg-gray-500",
    text: "text-gray-950 dark:text-gray-50",
    badge: "text-gray-500",
  };

  const initials = student.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  // Handle boarding for pickup (assigned cab)
  const handlePickupBoard = async () => {
    if (!tripId || !assignedCabId) {
      toast.error("Missing trip or cab information");
      return;
    }

    try {
      setLoading(true);
      const response = await tripApi.adminBoardStudent(tripId, {
        user_id: student.user_id,
        cab_id: assignedCabId,
        journey_type: "pickup",
      });

      if (response.success && response.data) {
        toast.success(
          `${student.name} boarded ${response.data.cab_number} for pickup`
        );
        onBoardingSuccess?.();
      }
    } catch (error: any) {
      console.error("Error boarding student:", error);
      if (error.error === "already_boarded") {
        toast.error("Student already boarded for pickup");
      } else {
        toast.error(error.message || "Failed to board student");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle boarding for dropoff (select cab)
  const handleDropoffBoard = async (cabId: string, cabNumber: string) => {
    if (!tripId) {
      toast.error("Missing trip information");
      return;
    }

    try {
      setLoading(true);
      const response = await tripApi.adminBoardStudent(tripId, {
        user_id: student.user_id,
        cab_id: cabId,
        journey_type: "dropoff",
      });

      if (response.success && response.data) {
        toast.success(`${student.name} boarded ${cabNumber} for dropoff`);
        setPopoverOpen(false);
        onBoardingSuccess?.();
      }
    } catch (error: any) {
      console.error("Error boarding student:", error);
      if (error.error === "already_boarded") {
        toast.error("Student already boarded for dropoff");
      } else {
        toast.error(error.message || "Failed to board student");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Item variant="outline" className={`${compact ? "py-2" : ""} ${className}`}>
      <ItemMedia>
        <Avatar className={compact ? "h-10 w-10" : "h-12 w-12"}>
          <AvatarImage
            src={student.profile_picture || undefined}
            alt={student.name}
          />
          <AvatarFallback
            className={`${hallColors.avatar} ${hallColors.text} ${compact ? "text-xs" : "text-sm"} font-bold`}
          >
            {initials}
          </AvatarFallback>
        </Avatar>
      </ItemMedia>

      <ItemContent>
        <ItemTitle className="line-clamp-1 flex items-center gap-2">
          {student.name}
          <Badge
            variant="secondary"
            className={`${hallColors.badge} text-xs font-semibold`}
          >
            {student.hall}
          </Badge>
        </ItemTitle>
        <ItemDescription className="space-y-0.5 mt-1">
          {showEmail && (
            <div className="flex items-center gap-1.5 text-xs">
              <Mail className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{student.email}</span>
            </div>
          )}

          {showPhone && student.phone_number && (
            <div className="flex items-center gap-1.5 text-xs">
              <Phone className="w-3 h-3 flex-shrink-0" />
              <span>{formatPhoneNumber(student.phone_number)}</span>
            </div>
          )}

          {showSeat && student.seat_position && (
            <div className="flex items-center gap-1.5 text-xs">
              <Armchair className="w-3 h-3 flex-shrink-0" />
              <span className="font-mono font-medium">
                Seat {student.seat_position}
              </span>
            </div>
          )}

          {showAllocatedCab && student.allocated_cab_number && (
            <div className="flex items-center gap-1.5 text-xs">
              <Car className="w-3 h-3 flex-shrink-0" />
              <span className="font-medium">
                {student.allocated_cab_number}
                {student.allocated_cab_region && (
                  <span className="text-muted-foreground ml-1">
                    ({student.allocated_cab_region})
                  </span>
                )}
              </span>
            </div>
          )}
        </ItemDescription>
      </ItemContent>

      {/* Boarding Button */}
      {boardingEnabled && tripId && journeyType && (
        <div className="flex-shrink-0 ml-2">
          {journeyType === "pickup" ? (
            // Pickup: Confirmation Dialog
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 h-8 text-xs"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <UserPlus className="w-3 h-3" />
                  )}
                  Board
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Board Student for Pickup</AlertDialogTitle>
                  <AlertDialogDescription>
                    Board <strong>{student.name}</strong> to their assigned cab{" "}
                    <strong>{student.allocated_cab_number}</strong>?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handlePickupBoard}>
                    Confirm Board
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : (
            // Dropoff: Popover with Cab List
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 h-8 text-xs"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <UserPlus className="w-3 h-3" />
                  )}
                  Board
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-2" align="end">
                <div className="space-y-2">
                  <p className="text-sm font-medium px-2 py-1">
                    Select cab for {student.name}
                  </p>
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {availableCabs.map((cab) => (
                      <Button
                        key={cab.cab_id}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start h-auto py-2 px-2"
                        onClick={() =>
                          handleDropoffBoard(cab.cab_id, cab.cab_number)
                        }
                        disabled={loading}
                      >
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{cab.cab_number}</span>
                          <span className="text-xs text-muted-foreground">
                            {cab.pickup_region} - {cab.driver_name}
                          </span>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      )}
    </Item>
  );
}
