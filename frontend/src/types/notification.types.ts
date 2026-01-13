/**
 * Notification Types
 */

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  icon: string;
  action_url?: string;
  category: "booking" | "payment" | "trip" | "cab" | "admin" | "journey";
  priority: "low" | "normal" | "high" | "critical";
  reference_type?: string;
  reference_id?: string;
  read_at?: string;
  created_at: string;
}

export interface NotificationResponse {
  success: boolean;
  data: AppNotification[];
}

export interface UnreadCountResponse {
  success: boolean;
  count: number;
}
