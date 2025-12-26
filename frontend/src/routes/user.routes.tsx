import Home from '@/pages/Home';
import type { CustomRouteObject } from './guards';

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
 * - Personal settings
 * - Trip history
 * 
 * Security:
 * - All routes require valid authentication token
 * - Users without tokens are redirected to login
 * - Loading screen shown during auth verification
 */

// Placeholder components - create these as needed
const ProfilePage = () => (
  <div className="container mx-auto px-4 py-8">
    <h1 className="text-3xl font-bold mb-4">User Profile</h1>
    <p className="text-gray-600 dark:text-gray-400">Profile management coming soon...</p>
  </div>
);

const BookingsPage = () => (
  <div className="container mx-auto px-4 py-8">
    <h1 className="text-3xl font-bold mb-4">My Bookings</h1>
    <p className="text-gray-600 dark:text-gray-400">View and manage your cab bookings here.</p>
  </div>
);

const SettingsPage = () => (
  <div className="container mx-auto px-4 py-8">
    <h1 className="text-3xl font-bold mb-4">Settings</h1>
    <p className="text-gray-600 dark:text-gray-400">Manage your account settings.</p>
  </div>
);

export const userRoutes: CustomRouteObject[] = [
  {
    path: 'dashboard',
    element: <Home />,
    meta: {
      requireAuth: true,
      title: 'Dashboard',
      description: 'User dashboard for Friday Cab System',
    },
  },
  {
    path: 'profile',
    element: <ProfilePage />,
    meta: {
      requireAuth: true,
      title: 'Profile',
      description: 'Manage your profile',
    },
  },
  {
    path: 'bookings',
    element: <BookingsPage />,
    meta: {
      requireAuth: true,
      title: 'My Bookings',
      description: 'View and manage your bookings',
    },
  },
  {
    path: 'settings',
    element: <SettingsPage />,
    meta: {
      requireAuth: true,
      title: 'Settings',
      description: 'Account settings',
    },
  },
  // Add more user routes as needed:
  // {
  //   path: 'trips/:tripId',
  //   element: <TripDetails />,
  //   meta: {
  //     requireAuth: true,
  //     title: 'Trip Details'
  //   }
  // },
];

