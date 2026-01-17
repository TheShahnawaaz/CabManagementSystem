import { Navigate } from "react-router-dom";
import { LayoutDashboard, Users, MapPin, BarChart3 } from "lucide-react";
import AdminDashboard from "@/pages/admin/Dashboard";
import UserManagement from "@/pages/admin/users";
import TripManagement from "@/pages/admin/trips";
import TripDetailLayout from "@/pages/admin/trips/detail/TripDetailLayout";
import DemandTab from "@/pages/admin/trips/detail/DemandTab";
import JourneyTab from "@/pages/admin/trips/detail/JourneyTab";
import AllocationTab from "@/pages/admin/trips/detail/AllocationTab";
import AllocationEditPage from "@/pages/admin/trips/detail/AllocationEditPage";
import ReportsPage from "@/pages/admin/reports";
import ReportDetailPage from "@/pages/admin/reports/ReportDetailPage";
import type { CustomRouteObject } from "./guards";
import { tripApi } from "@/services/trip.service";

/**
 * Admin Routes Configuration
 *
 * These routes are restricted to administrators only.
 * Both authentication AND admin privileges are required.
 *
 * Use cases:
 * - User management
 * - Trip/vehicle management
 * - System settings
 * - Analytics/reports
 * - Admin dashboard
 *
 * Security:
 * - Requires valid authentication token
 * - Requires is_admin = true in user profile
 * - Non-admin users shown error toast and redirected
 * - Loading screen prevents unauthorized content flash
 */

export const adminRoutes: CustomRouteObject[] = [
  {
    path: "admin",
    element: <AdminDashboard />,
    meta: {
      requireAuth: true,
      requireAdmin: true,
      title: "Admin Dashboard",
      description: "Administrative control panel",
      breadcrumb: {
        label: "Admin Dashboard",
        icon: LayoutDashboard,
      },
    },
  },
  {
    path: "admin/users",
    element: <UserManagement />,
    meta: {
      requireAuth: true,
      requireAdmin: true,
      title: "User Management",
      description: "Manage system users",
      breadcrumb: {
        label: "User Management",
        icon: Users,
      },
    },
  },
  {
    path: "admin/trips",
    element: <TripManagement />,
    meta: {
      requireAuth: true,
      requireAdmin: true,
      title: "Trip Management",
      description: "Manage Friday cab trips",
      breadcrumb: {
        label: "Trip Management",
        icon: MapPin,
      },
    },
  },
  {
    path: "admin/trips/:tripId",
    element: <TripDetailLayout />,
    meta: {
      requireAuth: true,
      requireAdmin: true,
      title: "Trip Details",
      description: "View trip details",
      breadcrumb: {
        dynamic: true,
        entityType: "trip",
        fetchEntity: async (id: string) => {
          const response = await tripApi.getTripById(id);
          return response.data?.trip_title || "Trip";
        },
      },
    },
    children: [
      {
        index: true,
        element: <Navigate to="demand" replace />,
      },
      {
        path: "demand",
        element: <DemandTab />,
        meta: {
          requireAuth: true,
          requireAdmin: true,
          title: "Trip Demand",
          breadcrumb: {
            label: "Demand",
          },
        },
      },
      {
        path: "journey",
        element: <JourneyTab />,
        meta: {
          requireAuth: true,
          requireAdmin: true,
          title: "Trip Journey",
          breadcrumb: {
            label: "Journey",
          },
        },
      },
      {
        path: "allocation",
        element: <AllocationTab />,
        meta: {
          requireAuth: true,
          requireAdmin: true,
          title: "Trip Allocation",
          breadcrumb: {
            label: "Allocation",
          },
        },
      },
      {
        path: "allocation/edit",
        element: <AllocationEditPage />,
        meta: {
          requireAuth: true,
          requireAdmin: true,
          title: "Edit Allocation",
          breadcrumb: {
            label: "Edit",
          },
        },
      },
    ],
  },
  // ====================================
  // REPORTS
  // ====================================
  {
    path: "admin/reports",
    element: <ReportsPage />,
    meta: {
      requireAuth: true,
      requireAdmin: true,
      title: "Financial Reports",
      description: "View financial reports for trips",
      breadcrumb: {
        label: "Reports",
        icon: BarChart3,
      },
    },
  },
  {
    path: "admin/reports/:reportId",
    element: <ReportDetailPage />,
    meta: {
      requireAuth: true,
      requireAdmin: true,
      title: "Report Details",
      description: "View report details",
      breadcrumb: {
        label: "Report Details",
      },
    },
  },
];
