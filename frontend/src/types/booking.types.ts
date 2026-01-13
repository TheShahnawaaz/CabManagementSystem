// Booking-related TypeScript interfaces

export interface Booking {
  id: string;
  trip_id: string;
  user_id: string;
  hall: "LBS" | "MMM" | "PatelHall" | "SNIG";
  payment_id: string;
  created_at: string;
  updated_at: string;

  // Trip details (from JOIN)
  trip_title: string;
  trip_date: string;
  booking_start_time: string;
  booking_end_time: string;
  departure_time: string;
  end_time: string;
  amount_per_person: number;

  // Payment details (from JOIN)
  payment_status: "pending" | "confirmed" | "failed" | "cancelled";
  payment_method: string;
  transaction_id: string;
  payment_date: string;
  payment_amount: number;

  // Cab allocation (from LEFT JOIN - optional)
  allocation_id?: string | null;
  cab_id?: string | null;
  cab_number?: string | null;
  pickup_region?: string | null;
}

export type Hall = "RK" | "PAN" | "LBS" | "VS";

export const HALLS: { value: Hall; label: string; description: string }[] = [
  {
    value: "RK",
    label: "RK",
    description: "Radha Krishnan + Rajendra Prasad Halls",
  },
  {
    value: "PAN",
    label: "PAN",
    description: "PAN Loop",
  },
  {
    value: "LBS",
    label: "LBS",
    description: "Lal Bahadur Shastri + Madan Mohan Malaviya Halls",
  },
  {
    value: "VS",
    label: "VS",
    description: "VS + MS + HJB + JCB + LLR Halls",
  },
];
