/**
 * Quick Actions Grid Component
 *
 * Navigation shortcuts for common user actions
 */

import { Link } from "react-router-dom";
import { MapPin, Calendar, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const quickActions = [
  {
    title: "Browse Trips",
    description: "Find and book upcoming trips",
    icon: MapPin,
    href: "/trips",
    color: "bg-blue-500",
  },
  {
    title: "My Bookings",
    description: "View your booking history",
    icon: Calendar,
    href: "/bookings",
    color: "bg-purple-500",
  },
  {
    title: "Profile",
    description: "Update your information",
    icon: Users,
    href: "/profile",
    color: "bg-orange-500",
  },
];

export function QuickActions() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickActions.map((action) => (
          <Link key={action.title} to={action.href}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardContent className="p-6">
                <div
                  className={`${action.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}
                >
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold mb-1">{action.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {action.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
