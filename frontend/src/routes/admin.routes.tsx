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

// Placeholder admin components - create these as features are built
const AdminDashboard = () => (
  <div className="container mx-auto px-4 py-8">
    <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
    <p className="text-gray-600 dark:text-gray-400">
      Welcome to the admin panel. Manage trips, users, and system settings from here.
    </p>
  </div>
);

const UserManagement = () => (
  <div className="container mx-auto px-4 py-8">
    <h1 className="text-3xl font-bold mb-4">User Management</h1>
    <p className="text-gray-600 dark:text-gray-400">
      View and manage all users in the system.
    </p>
  </div>
);

const TripManagement = () => (
  <div className="container mx-auto px-4 py-8">
    <h1 className="text-3xl font-bold mb-4">Trip Management</h1>
    <p className="text-gray-600 dark:text-gray-400">
      Create and manage Friday cab trips.
    </p>
  </div>
);

const VehicleManagement = () => (
  <div className="container mx-auto px-4 py-8">
    <h1 className="text-3xl font-bold mb-4">Vehicle Management</h1>
    <p className="text-gray-600 dark:text-gray-400">
      Manage the vehicle fleet and assignments.
    </p>
  </div>
);

const AdminSettings = () => (
  <div className="container mx-auto px-4 py-8">
    <h1 className="text-3xl font-bold mb-4">System Settings</h1>
    <p className="text-gray-600 dark:text-gray-400">
      Configure system-wide settings and preferences.
    </p>
  </div>
);

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
  // {
  //   path: 'admin/reports',
  //   element: <Reports />,
  //   meta: {
  //     requireAuth: true,
  //     requireAdmin: true,
  //     title: 'Reports'
  //   }
  // },
];

