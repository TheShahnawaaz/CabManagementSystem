import {
  LayoutDashboard,
  User,
  Calendar,
  MapPin,
  CreditCard,
  CheckCircle,
  XCircle,
  Bell,
} from "lucide-react";
import Dashboard from "@/pages/dashboard";
import ProfilePage from "@/pages/Profile";
import BookingsPage from "@/pages/bookings";
import TripsPage from "@/pages/trips";
import CheckoutPage from "@/pages/checkout/CheckoutPage";
import BookingSuccess from "@/pages/booking/BookingSuccess";
import BookingFailed from "@/pages/booking/BookingFailed";
import NotificationsPage from "@/pages/Notifications";
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
    element: <Dashboard />,
    meta: {
      requireAuth: true,
      title: "Dashboard",
      description: "User dashboard for Friday Cab System",
      breadcrumb: {
        label: "Dashboard",
        icon: LayoutDashboard,
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
  {
    path: "notifications",
    element: <NotificationsPage />,
    meta: {
      requireAuth: true,
      title: "Notifications",
      description: "View your notifications",
      breadcrumb: {
        label: "Notifications",
        icon: Bell,
      },
    },
  },
  // ====================================
  // CHECKOUT & PAYMENT ROUTES
  // ====================================
  {
    path: "checkout/:tripId",
    element: <CheckoutPage />,
    meta: {
      requireAuth: true,
      title: "Checkout",
      description: "Complete your trip booking",
      breadcrumb: {
        label: "Checkout",
        icon: CreditCard,
      },
    },
  },
  {
    path: "booking/success/:bookingId",
    element: <BookingSuccess />,
    meta: {
      requireAuth: true,
      title: "Booking Confirmed",
      description: "Your booking has been confirmed",
      breadcrumb: {
        label: "Booking Confirmed",
        icon: CheckCircle,
      },
    },
  },
  {
    path: "booking/failed",
    element: <BookingFailed />,
    meta: {
      requireAuth: true,
      title: "Booking Failed",
      description: "Your booking could not be completed",
      breadcrumb: {
        label: "Booking Failed",
        icon: XCircle,
      },
    },
  },
];
