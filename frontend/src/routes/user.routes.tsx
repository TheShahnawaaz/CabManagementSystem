import { Home as HomeIcon, User, Calendar, MapPin } from "lucide-react";
import Home from "@/pages/Home";
import ProfilePage from "@/pages/Profile";
import BookingsPage from "@/pages/bookings";
import TripsPage from "@/pages/trips";
import type { CustomRouteObject } from "./guards";

/**
 * User Routes Configuration
 *
 * These routes require authentication but are accessible to all logged-in users
 * (both regular users and admins).
 *
 * Use cases:
 * - Dashboard
 * - User profile
 * - Booking management
 * - Trip history
 *
 * Security:
 * - All routes require valid authentication token
 * - Users without tokens are redirected to login
 * - Loading screen shown during auth verification
 */

export const userRoutes: CustomRouteObject[] = [
  {
    path: "dashboard",
    element: <Home />,
    meta: {
      requireAuth: true,
      title: "Dashboard",
      description: "User dashboard for Friday Cab System",
      breadcrumb: {
        label: "Dashboard",
        icon: HomeIcon,
      },
    },
  },
  {
    path: "profile",
    element: <ProfilePage />,
    meta: {
      requireAuth: true,
      title: "Profile",
      description: "Manage your profile",
      breadcrumb: {
        label: "Profile",
        icon: User,
      },
    },
  },
  {
    path: "bookings",
    element: <BookingsPage />,
    meta: {
      requireAuth: true,
      title: "My Bookings",
      description: "View your active and past Friday prayer trip bookings",
      breadcrumb: {
        label: "My Bookings",
        icon: Calendar,
      },
    },
  },
  {
    path: "trips",
    element: <TripsPage />,
    meta: {
      requireAuth: true,
      title: "Trips",
      description: "View and book your trips",
      breadcrumb: {
        label: "Trips",
        icon: MapPin,
      },
    },
  },
];
