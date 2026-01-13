// ====================================
// USER TYPES
// ====================================

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone_number: string | null;
  profile_picture?: string | null;
  is_admin: boolean;
  email_notifications: boolean;
  created_at: string;
  updated_at?: string;
}

export interface UpdateUserProfilePayload {
  name?: string;
  phone_number?: string | null;
  email_notifications?: boolean;
}

// ====================================
// USER MANAGEMENT (ADMIN) TYPES
// ====================================

export interface UserWithStats extends UserProfile {
  booking_count: number;
  payment_count: number;
  total_spent?: number;
}

export interface UserDetailedView extends UserWithStats {
  recent_bookings: UserBooking[];
}

export interface UserBooking {
  booking_id: string;
  hall: string;
  booking_date: string;
  trip_title: string;
  trip_date: string;
  amount_per_person: number;
  payment_status: "pending" | "confirmed" | "failed";
}

export interface CreateUserData {
  email: string;
  name: string;
  phone_number?: string | null;
  is_admin?: boolean;
}

export interface UpdateUserData {
  email?: string;
  name?: string;
  phone_number?: string | null;
}
