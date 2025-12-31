/**
 * User Quick Actions Component
 *
 * Wrapper for QuickActions with user-specific actions
 */

import { MapPin, Calendar, User, Zap } from "lucide-react";
import { QuickActions as QuickActionsBase } from "@/components/QuickActions";
import type { QuickAction } from "@/components/QuickActions";

const userActions: QuickAction[] = [
  {
    label: "Browse Trips",
    description: "Find and book upcoming Friday trips",
    icon: MapPin,
    href: "/trips",
  },
  {
    label: "My Bookings",
    description: "View and manage your bookings",
    icon: Calendar,
    href: "/bookings",
  },
  {
    label: "Profile Settings",
    description: "Update your account information",
    icon: User,
    href: "/profile",
  },
];

export function QuickActions() {
  return (
    <QuickActionsBase
      title="Quick Actions"
      titleIcon={Zap}
      actions={userActions}
      defaultOpen={true}
    />
  );
}
