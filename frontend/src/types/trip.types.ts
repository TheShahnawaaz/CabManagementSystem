// ====================================
// TRIP TYPES
// ====================================

export interface Trip {
  id: string;
  trip_title: string;
  trip_date: string;
  booking_start_time: string;
  booking_end_time: string;
  departure_time: string;
  prayer_time: string;
  end_time: string;
  amount_per_person: number;
  booking_count?: number;
  cab_count?: number;
  allocation_count?: number;
  created_at: string;
  updated_at: string;
  // User booking status (only present in authenticated endpoints)
  has_booked?: boolean;
  booking_id?: string | null;
}

export interface CreateTripData {
  trip_title: string;
  trip_date: string;
  booking_start_time: string;
  booking_end_time: string;
  departure_time: string;
  prayer_time: string;
  end_time: string;
  amount_per_person: number;
}

export type UpdateTripData = Partial<CreateTripData>;

// ====================================
// DEMAND TYPES
// ====================================

export interface StudentDemand {
  id: string;
  name: string;
  email: string;
  phone_number: string | null;
  profile_picture: string | null;
  booking_id: string;
  created_at: string;
}

export interface HallDemand {
  hall: string;
  student_count: number;
  students: StudentDemand[];
}
