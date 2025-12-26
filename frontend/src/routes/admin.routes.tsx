import AdminDashboard from '@/pages/admin/Dashboard';
import UserManagement from '@/pages/admin/Users';
import TripManagement from '@/pages/admin/Trips';
import VehicleManagement from '@/pages/admin/Vehicles';
import PaymentsManagement from '@/pages/admin/Payments';
import ReportsPage from '@/pages/admin/Reports';
import AdminSettings from '@/pages/admin/AdminSettings';
import type { CustomRouteObject } from './guards';

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
    path: 'admin',
    element: <AdminDashboard />,
    meta: {
      requireAuth: true,
      requireAdmin: true,
      title: 'Admin Dashboard',
      description: 'Administrative control panel',
    },
  },
  {
    path: 'admin/users',
    element: <UserManagement />,
    meta: {
      requireAuth: true,
      requireAdmin: true,
      title: 'User Management',
      description: 'Manage system users',
    },
  },
  {
    path: 'admin/trips',
    element: <TripManagement />,
    meta: {
      requireAuth: true,
      requireAdmin: true,
      title: 'Trip Management',
      description: 'Manage Friday cab trips',
    },
  },
  {
    path: 'admin/vehicles',
    element: <VehicleManagement />,
    meta: {
      requireAuth: true,
      requireAdmin: true,
      title: 'Vehicle Management',
      description: 'Manage vehicle fleet',
    },
  },
  {
    path: 'admin/payments',
    element: <PaymentsManagement />,
    meta: {
      requireAuth: true,
      requireAdmin: true,
      title: 'Payments',
      description: 'Manage payments',
    },
  },
  {
    path: 'admin/reports',
    element: <ReportsPage />,
    meta: {
      requireAuth: true,
      requireAdmin: true,
      title: 'Reports',
      description: 'Analytics and reports',
    },
  },
  {
    path: 'admin/settings',
    element: <AdminSettings />,
    meta: {
      requireAuth: true,
      requireAdmin: true,
      title: 'System Settings',
      description: 'Configure system settings',
    },
  },
  // Add more admin routes as needed:
  // {
  //   path: 'admin/analytics',
  //   element: <Analytics />,
  //   meta: {
  //     requireAuth: true,
  //     requireAdmin: true,
  //     title: 'Analytics'
  //   }
  // },
];

