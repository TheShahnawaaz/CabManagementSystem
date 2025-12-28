import type { Trip } from "@/types/trip.types";

export interface TripFormData {
  tripTitle: string;
  tripDate: Date | undefined;
  bookingStartDate: Date | undefined;
  bookingStartTime: string;
  bookingEndDate: Date | undefined;
  bookingEndTime: string;
  returnDate: Date | undefined;
  returnTime: string;
  endDate: Date | undefined;
  endTime: string;
  amount: number;
}

export interface TripFormState extends TripFormData {
  tripDateOpen: boolean;
  bookingStartOpen: boolean;
  bookingEndOpen: boolean;
  returnOpen: boolean;
  endOpen: boolean;
}

export interface TripManagementState {
  trips: Trip[];
  loading: boolean;
  isSheetOpen: boolean;
  isDeleteDialogOpen: boolean;
  editingTrip: Trip | null;
  deletingTrip: Trip | null;
  submitting: boolean;
}
