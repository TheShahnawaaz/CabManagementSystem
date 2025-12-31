/**
 * Admin Quick Actions Component
 *
 * Wrapper for QuickActions with admin-specific actions
 */

import { Plus, Users, MapPin, Zap } from "lucide-react";
import { QuickActions as QuickActionsBase } from "@/components/QuickActions";
import type { QuickAction } from "@/components/QuickActions";

const adminActions: QuickAction[] = [
  {
    label: "Create New Trip",
    description: "Add a new Friday prayer trip",
    icon: Plus,
    href: "/admin/trips",
  },
  {
    label: "Manage Trips",
    description: "View and edit existing trips",
    icon: MapPin,
    href: "/admin/trips",
  },
  {
    label: "Manage Users",
    description: "View and manage system users",
    icon: Users,
    href: "/admin/users",
  },
];

export function AdminQuickActions() {
  return (
    <QuickActionsBase
      title="Quick Actions"
      titleIcon={Zap}
      actions={adminActions}
      defaultOpen={true}
    />
  );
}
