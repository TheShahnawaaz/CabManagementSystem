import { format } from 'date-fns';
import { ChevronDownIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import type { Trip } from '@/types/trip.types';
import type { TripFormState } from './types';

interface TripFormSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingTrip: Trip | null;
  formState: TripFormState;
  onFormChange: (updates: Partial<TripFormState>) => void;
  onSubmit: () => void;
  submitting: boolean;
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
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {editingTrip ? 'Edit Trip' : 'Create New Trip'}
          </SheetTitle>
          <SheetDescription>
            {editingTrip
              ? 'Update trip details. Changes will be reflected immediately.'
              : 'Add a new Friday prayer trip. Make sure the trip date is a Friday.'}
          </SheetDescription>
        </SheetHeader>

        <div className="grid gap-4 py-4">
          {/* Trip Title */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="trip_title">
              Trip Title *
            </Label>
            <Input
              id="trip_title"
              value={formState.tripTitle}
              onChange={(e) => onFormChange({ tripTitle: e.target.value })}
              placeholder="Friday Prayer - Jan 10, 2026"
            />
          </div>

          {/* Trip Date */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="trip_date">
              Trip Date (Friday) *
            </Label>
            <Popover open={formState.tripDateOpen} onOpenChange={(open) => onFormChange({ tripDateOpen: open })}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  id="trip_date"
                  className="justify-between font-normal"
                >
                  {formState.tripDate ? format(formState.tripDate, 'do MMM, yyyy') : 'Select date'}
                  <ChevronDownIcon className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formState.tripDate}
                  captionLayout="dropdown"
                  fromYear={2024}
                  toYear={2030}
                  onSelect={(date) => onFormChange({ tripDate: date, tripDateOpen: false })}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Booking Start Date & Time */}
          <div className="flex gap-3">
            <div className="flex flex-col gap-2 flex-1">
              <Label>
                Booking Start Date *
              </Label>
              <Popover open={formState.bookingStartOpen} onOpenChange={(open) => onFormChange({ bookingStartOpen: open })}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="justify-between font-normal"
                  >
                    {formState.bookingStartDate ? format(formState.bookingStartDate, 'do MMM, yyyy') : 'Select date'}
                    <ChevronDownIcon className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formState.bookingStartDate}
                    captionLayout="dropdown"
                    fromYear={2024}
                    toYear={2030}
                    onSelect={(date) => onFormChange({ bookingStartDate: date, bookingStartOpen: false })}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="booking_start_time">
                Time *
              </Label>
              <Input
                type="time"
                id="booking_start_time"
                value={formState.bookingStartTime}
                onChange={(e) => onFormChange({ bookingStartTime: e.target.value })}
                className="w-32 bg-background"
              />
            </div>
          </div>

          {/* Booking End Date & Time */}
          <div className="flex gap-3">
            <div className="flex flex-col gap-2 flex-1">
              <Label>
                Booking End Date *
              </Label>
              <Popover open={formState.bookingEndOpen} onOpenChange={(open) => onFormChange({ bookingEndOpen: open })}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="justify-between font-normal"
                  >
                    {formState.bookingEndDate ? format(formState.bookingEndDate, 'do MMM, yyyy') : 'Select date'}
                    <ChevronDownIcon className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formState.bookingEndDate}
                    captionLayout="dropdown"
                    fromYear={2024}
                    toYear={2030}
                    onSelect={(date) => onFormChange({ bookingEndDate: date, bookingEndOpen: false })}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="booking_end_time">
                Time *
              </Label>
              <Input
                type="time"
                id="booking_end_time"
                value={formState.bookingEndTime}
                onChange={(e) => onFormChange({ bookingEndTime: e.target.value })}
                className="w-32 bg-background"
              />
            </div>
          </div>

          {/* Return Date & Time */}
          <div className="flex gap-3">
            <div className="flex flex-col gap-2 flex-1">
              <Label>
                Return Date (Trip Start) *
              </Label>
              <Popover open={formState.returnOpen} onOpenChange={(open) => onFormChange({ returnOpen: open })}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="justify-between font-normal"
                  >
                    {formState.returnDate ? format(formState.returnDate, 'do MMM, yyyy') : 'Select date'}
                    <ChevronDownIcon className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formState.returnDate}
                    captionLayout="dropdown"
                    fromYear={2024}
                    toYear={2030}
                    onSelect={(date) => onFormChange({ returnDate: date, returnOpen: false })}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="return_time">
                Time *
              </Label>
              <Input
                type="time"
                id="return_time"
                value={formState.returnTime}
                onChange={(e) => onFormChange({ returnTime: e.target.value })}
                className="w-32 bg-background"
              />
            </div>
          </div>

          {/* End Date & Time */}
          <div className="flex gap-3">
            <div className="flex flex-col gap-2 flex-1">
              <Label>
                End Date (Trip End) *
              </Label>
              <Popover open={formState.endOpen} onOpenChange={(open) => onFormChange({ endOpen: open })}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="justify-between font-normal"
                  >
                    {formState.endDate ? format(formState.endDate, 'do MMM, yyyy') : 'Select date'}
                    <ChevronDownIcon className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formState.endDate}
                    captionLayout="dropdown"
                    fromYear={2024}
                    toYear={2030}
                    onSelect={(date) => onFormChange({ endDate: date, endOpen: false })}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="end_time">
                Time *
              </Label>
              <Input
                type="time"
                id="end_time"
                value={formState.endTime}
                onChange={(e) => onFormChange({ endTime: e.target.value })}
                className="w-32 bg-background"
              />
            </div>
          </div>

          {/* Amount */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="amount_per_person">
              Amount per Person (₹) *
            </Label>
            <Input
              id="amount_per_person"
              type="number"
              min="0"
              step="0.01"
              value={formState.amount}
              onChange={(e) => onFormChange({ amount: parseFloat(e.target.value) || 0 })}
            />
          </div>
        </div>

        <SheetFooter>
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
                ? 'Updating...'
                : 'Creating...'
              : editingTrip
              ? 'Update Trip'
              : 'Create Trip'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

