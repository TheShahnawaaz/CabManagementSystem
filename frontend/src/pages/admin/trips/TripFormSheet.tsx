import * as React from "react";
import { format } from "date-fns";
import {
  CalendarIcon,
  ClockIcon,
  TicketIcon,
  BusIcon,
  InfoIcon,
  IndianRupeeIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Trip } from "@/types/trip.types";
import type { TripFormState } from "./types";
import { syncDatesWithTripDate } from "./utils";

interface TripFormSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingTrip: Trip | null;
  formState: TripFormState;
  onFormChange: (updates: Partial<TripFormState>) => void;
  onSubmit: () => void;
  submitting: boolean;
}

// Section Header Component
function SectionHeader({
  icon: Icon,
  title,
  description,
  className,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start gap-3 mb-3", className)}>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="space-y-0.5">
        <h4 className="text-sm font-semibold">{title}</h4>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}

// Date Picker Button - forwardRef to work with PopoverTrigger asChild
const DatePickerButton = React.forwardRef<
  HTMLButtonElement,
  {
    date: Date | undefined;
    placeholder?: string;
    className?: string;
  } & React.ComponentPropsWithoutRef<typeof Button>
>(({ date, placeholder = "Select date", className, ...props }, ref) => {
  return (
    <Button
      ref={ref}
      variant="outline"
      className={cn(
        "justify-start text-left font-normal",
        !date && "text-muted-foreground",
        className
      )}
      {...props}
    >
      <CalendarIcon className="mr-2 h-4 w-4" />
      {date ? format(date, "EEE, MMM d") : placeholder}
    </Button>
  );
});
DatePickerButton.displayName = "DatePickerButton";

// Time Input with Clock Icon
function TimeInput({
  id,
  value,
  onChange,
  className,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <ClockIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="time"
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-9 bg-background"
      />
    </div>
  );
}

export function TripFormSheet({
  isOpen,
  onOpenChange,
  editingTrip,
  formState,
  onFormChange,
  onSubmit,
  submitting,
}: TripFormSheetProps) {
  // Handle trip date change with smart sync
  const handleTripDateChange = (date: Date | undefined) => {
    if (date) {
      const syncUpdates = syncDatesWithTripDate(date, formState);
      onFormChange({
        tripDate: date,
        tripDateOpen: false,
        ...syncUpdates,
      });
    } else {
      onFormChange({ tripDate: date, tripDateOpen: false });
    }
  };

  // Handle same-day toggle changes
  const handleSameDayBookingChange = (checked: boolean) => {
    const updates: Partial<TripFormState> = { useSameDayBooking: checked };
    if (checked && formState.tripDate) {
      updates.bookingStartDate = formState.tripDate;
      updates.bookingEndDate = formState.tripDate;
    }
    onFormChange(updates);
  };

  const handleSameDayScheduleChange = (checked: boolean) => {
    const updates: Partial<TripFormState> = { useSameDaySchedule: checked };
    if (checked && formState.tripDate) {
      updates.departureDate = formState.tripDate;
      updates.prayerDate = formState.tripDate;
      updates.endDate = formState.tripDate;
    }
    onFormChange(updates);
  };

  return (
    <TooltipProvider>
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-xl">
              {editingTrip ? "Edit Trip" : "Create New Trip"}
            </SheetTitle>
            <SheetDescription>
              {editingTrip
                ? "Update trip details. Changes will be reflected immediately."
                : "Set up a new Friday prayer trip with booking windows and schedule."}
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6 py-4">
            {/* ======================================== */}
            {/* SECTION: Trip Details */}
            {/* ======================================== */}
            <div className="space-y-4">
              <SectionHeader
                icon={CalendarIcon}
                title="Trip Details"
                description="Basic information about the trip"
              />

              {/* Trip Title */}
              <div className="space-y-2">
                <Label htmlFor="trip_title">Trip Title</Label>
                <Input
                  id="trip_title"
                  value={formState.tripTitle}
                  onChange={(e) => onFormChange({ tripTitle: e.target.value })}
                  placeholder="e.g., Friday Prayer - Jan 17"
                  className="bg-background"
                />
              </div>

              {/* Trip Date & Amount Row */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Trip Date (Friday)</Label>
                    <Popover
                      open={formState.tripDateOpen}
                      onOpenChange={(open) =>
                        onFormChange({ tripDateOpen: open })
                      }
                    >
                      <PopoverTrigger asChild>
                        <DatePickerButton
                          date={formState.tripDate}
                          placeholder="Select Friday"
                          className="w-full"
                        />
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={formState.tripDate}
                          onSelect={handleTripDateChange}
                          captionLayout="dropdown"
                          fromYear={2024}
                          toYear={2030}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount">Price per Person</Label>
                    <div className="relative">
                      <IndianRupeeIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="amount"
                        type="number"
                        min="0"
                        step="1"
                        value={formState.amount}
                        onChange={(e) =>
                          onFormChange({
                            amount: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="pl-9 bg-background"
                      />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  The main Friday prayer date. Other dates will auto-sync if
                  "Same day" is enabled.
                </p>
              </div>
            </div>

            {/* ======================================== */}
            {/* SECTION: Booking Window */}
            {/* ======================================== */}
            <div className="space-y-4 rounded-lg border p-4 bg-blue-500/5">
              <div className="flex items-center justify-between">
                <SectionHeader
                  icon={TicketIcon}
                  title="Booking Window"
                  description="When students can book seats"
                  className="mb-0"
                />
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="same-day-booking"
                    className="text-xs text-muted-foreground cursor-pointer"
                  >
                    Same day
                  </Label>
                  <Switch
                    id="same-day-booking"
                    checked={formState.useSameDayBooking}
                    onCheckedChange={handleSameDayBookingChange}
                  />
                </div>
              </div>

              {formState.useSameDayBooking ? (
                /* Simplified: Just time inputs */
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="booking_start_time">Opens at</Label>
                      <TimeInput
                        id="booking_start_time"
                        value={formState.bookingStartTime}
                        onChange={(v) => onFormChange({ bookingStartTime: v })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="booking_end_time">Closes at</Label>
                      <TimeInput
                        id="booking_end_time"
                        value={formState.bookingEndTime}
                        onChange={(v) => onFormChange({ bookingEndTime: v })}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Students can book seats during this window. After closing,
                    no new bookings allowed.
                  </p>
                </div>
              ) : (
                /* Full: Date + Time inputs */
                <div className="space-y-3">
                  <div className="grid grid-cols-[1fr,auto] gap-2">
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Popover
                        open={formState.bookingStartOpen}
                        onOpenChange={(open) =>
                          onFormChange({ bookingStartOpen: open })
                        }
                      >
                        <PopoverTrigger asChild>
                          <DatePickerButton
                            date={formState.bookingStartDate}
                            className="w-full"
                          />
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={formState.bookingStartDate}
                            onSelect={(date) =>
                              onFormChange({
                                bookingStartDate: date,
                                bookingStartOpen: false,
                              })
                            }
                            captionLayout="dropdown"
                            fromYear={2024}
                            toYear={2030}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label>Time</Label>
                      <TimeInput
                        id="booking_start_time_full"
                        value={formState.bookingStartTime}
                        onChange={(v) => onFormChange({ bookingStartTime: v })}
                        className="w-28"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-[1fr,auto] gap-2">
                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Popover
                        open={formState.bookingEndOpen}
                        onOpenChange={(open) =>
                          onFormChange({ bookingEndOpen: open })
                        }
                      >
                        <PopoverTrigger asChild>
                          <DatePickerButton
                            date={formState.bookingEndDate}
                            className="w-full"
                          />
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={formState.bookingEndDate}
                            onSelect={(date) =>
                              onFormChange({
                                bookingEndDate: date,
                                bookingEndOpen: false,
                              })
                            }
                            captionLayout="dropdown"
                            fromYear={2024}
                            toYear={2030}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label>Time</Label>
                      <TimeInput
                        id="booking_end_time_full"
                        value={formState.bookingEndTime}
                        onChange={(v) => onFormChange({ bookingEndTime: v })}
                        className="w-28"
                      />
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Students can book seats during this window. After closing,
                    no new bookings allowed.
                  </p>
                </div>
              )}
            </div>

            {/* ======================================== */}
            {/* SECTION: Trip Schedule */}
            {/* ======================================== */}
            <div className="space-y-4 rounded-lg border p-4 bg-emerald-500/5">
              <div className="flex items-center justify-between">
                <SectionHeader
                  icon={BusIcon}
                  title="Trip Schedule"
                  description="Departure, prayer, and return times"
                  className="mb-0"
                />
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="same-day-schedule"
                    className="text-xs text-muted-foreground cursor-pointer"
                  >
                    Same day
                  </Label>
                  <Switch
                    id="same-day-schedule"
                    checked={formState.useSameDaySchedule}
                    onCheckedChange={handleSameDayScheduleChange}
                  />
                </div>
              </div>

              {formState.useSameDaySchedule ? (
                /* Simplified: Just time inputs */
                <div className="space-y-3">
                  {/* Departure Time */}
                  <div className="grid grid-cols-[1fr,auto] gap-3 items-end">
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5">
                        <Label htmlFor="departure_time">Departure Time</Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <InfoIcon className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-[200px]">
                            When cabs leave campus. Shown to students as the
                            deadline.
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <TimeInput
                        id="departure_time"
                        value={formState.departureTime}
                        onChange={(v) => onFormChange({ departureTime: v })}
                      />
                    </div>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium pb-2.5">
                      Visible to students
                    </span>
                  </div>

                  {/* Prayer Time */}
                  <div className="grid grid-cols-[1fr,auto] gap-3 items-end">
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5">
                        <Label htmlFor="prayer_time">Prayer Time</Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <InfoIcon className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-[200px]">
                            Cutoff between pickup and return journeys. Not shown
                            to students.
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <TimeInput
                        id="prayer_time"
                        value={formState.prayerTime}
                        onChange={(v) => onFormChange({ prayerTime: v })}
                      />
                    </div>
                    <span className="text-xs text-amber-600 dark:text-amber-400 font-medium pb-2.5">
                      Internal only
                    </span>
                  </div>

                  {/* End Time */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                      <Label htmlFor="end_time">Trip Ends</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <InfoIcon className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[200px]">
                          When students are expected back on campus.
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <TimeInput
                      id="end_time"
                      value={formState.endTime}
                      onChange={(v) => onFormChange({ endTime: v })}
                    />
                  </div>

                  <p className="text-xs text-muted-foreground pt-1">
                    <strong>Departure:</strong> Cabs leave campus (shown to
                    students) →<strong> Prayer:</strong> Cutoff for
                    pickup/return (internal) →<strong> End:</strong> Students
                    back on campus
                  </p>
                </div>
              ) : (
                /* Full: Date + Time inputs */
                <div className="space-y-3">
                  {/* Departure */}
                  <div className="grid grid-cols-[1fr,auto] gap-2">
                    <div className="space-y-2">
                      <Label>Departure Date</Label>
                      <Popover
                        open={formState.departureOpen}
                        onOpenChange={(open) =>
                          onFormChange({ departureOpen: open })
                        }
                      >
                        <PopoverTrigger asChild>
                          <DatePickerButton
                            date={formState.departureDate}
                            className="w-full"
                          />
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={formState.departureDate}
                            onSelect={(date) =>
                              onFormChange({
                                departureDate: date,
                                departureOpen: false,
                              })
                            }
                            captionLayout="dropdown"
                            fromYear={2024}
                            toYear={2030}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label>Time</Label>
                      <TimeInput
                        id="departure_time_full"
                        value={formState.departureTime}
                        onChange={(v) => onFormChange({ departureTime: v })}
                        className="w-28"
                      />
                    </div>
                  </div>

                  {/* Prayer */}
                  <div className="grid grid-cols-[1fr,auto] gap-2">
                    <div className="space-y-2">
                      <Label>Prayer Date</Label>
                      <Popover
                        open={formState.prayerOpen}
                        onOpenChange={(open) =>
                          onFormChange({ prayerOpen: open })
                        }
                      >
                        <PopoverTrigger asChild>
                          <DatePickerButton
                            date={formState.prayerDate}
                            className="w-full"
                          />
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={formState.prayerDate}
                            onSelect={(date) =>
                              onFormChange({
                                prayerDate: date,
                                prayerOpen: false,
                              })
                            }
                            captionLayout="dropdown"
                            fromYear={2024}
                            toYear={2030}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label>Time</Label>
                      <TimeInput
                        id="prayer_time_full"
                        value={formState.prayerTime}
                        onChange={(v) => onFormChange({ prayerTime: v })}
                        className="w-28"
                      />
                    </div>
                  </div>

                  {/* End */}
                  <div className="grid grid-cols-[1fr,auto] gap-2">
                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Popover
                        open={formState.endOpen}
                        onOpenChange={(open) => onFormChange({ endOpen: open })}
                      >
                        <PopoverTrigger asChild>
                          <DatePickerButton
                            date={formState.endDate}
                            className="w-full"
                          />
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={formState.endDate}
                            onSelect={(date) =>
                              onFormChange({ endDate: date, endOpen: false })
                            }
                            captionLayout="dropdown"
                            fromYear={2024}
                            toYear={2030}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label>Time</Label>
                      <TimeInput
                        id="end_time_full"
                        value={formState.endTime}
                        onChange={(v) => onFormChange({ endTime: v })}
                        className="w-28"
                      />
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground pt-1">
                    <strong>Departure:</strong> Cabs leave campus (shown to
                    students) → <strong>Prayer:</strong> Cutoff for
                    pickup/return (internal) → <strong>End:</strong> Students
                    back on campus
                  </p>
                </div>
              )}
            </div>
          </div>

          <SheetFooter className="pt-4 gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button onClick={onSubmit} disabled={submitting}>
              {submitting
                ? editingTrip
                  ? "Updating..."
                  : "Creating..."
                : editingTrip
                  ? "Update Trip"
                  : "Create Trip"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </TooltipProvider>
  );
}
