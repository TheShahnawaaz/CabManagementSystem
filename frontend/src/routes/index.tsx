import { createBrowserRouter, Navigate } from 'react-router-dom';
import RootLayout from '@/components/layout/RootLayout';
import DashboardLayout from '@/components/layout/DashboardLayout';
import AuthCallback from '@/pages/AuthCallback';
import NotFoundPage from '@/pages/NotFound';
import { processRoutes, validateRouteConfig } from './guards';
import { publicRoutes } from './public.routes';
import { guestRoutes } from './guest.routes';
import { userRoutes } from './user.routes';
import { adminRoutes } from './admin.routes';
import { roughRoutes } from './rough.routes';

/**
 * Main Application Router
 * 
 * Architecture:
 * - Declarative permission-based routing
 * - Routes organized by access level (public/guest/user/admin)
 * - Automatic guard application via processRoutes()
 * - Type-safe route configuration
 * - Easy to add/modify/remove routes
 * 
 * Route Types:
 * 1. Public Routes     - No authentication required
 * 2. Guest Routes      - Only for non-authenticated users
 * 3. User Routes       - Requires authentication
 * 4. Admin Routes      - Requires authentication + admin role
 * 5. Special Routes    - Auth callback, 404, etc.
 * 
 * Adding New Routes:
 * 1. Add route to appropriate file (public/guest/user/admin.routes.tsx)
 * 2. Set meta.requireAuth and/or meta.requireAdmin as needed
 * 3. Route guards are automatically applied
 * 
 * @see {@link https://reactrouter.com/en/main/routers/create-browser-router}
 */

// Validate route configurations in development
if (import.meta.env.DEV) {
  try {
    validateRouteConfig(publicRoutes);
    validateRouteConfig(guestRoutes);
    validateRouteConfig(userRoutes);
    validateRouteConfig(adminRoutes);
    console.log('✅ Route configuration validation passed');
  } catch (error) {
    console.error('❌ Route configuration error:', error);
    throw error;
  }
}

export const router = createBrowserRouter([
  // ==========================================
  // SPECIAL ROUTES (No Layout)
  // ==========================================
  {
    path: '/auth/callback',
    element: <AuthCallback />,
  },

  // ==========================================
  // GUEST ROUTES (RootLayout - No Sidebar)
  // ==========================================
  {
    path: '/',
    element: <RootLayout />,
    children: [
      // Root path - redirect to login
      {
        index: true,
        element: <Navigate to="/login" replace />,
      },

      // PUBLIC ROUTES
      // Accessible to everyone, no guards needed
      ...processRoutes(publicRoutes),

      // GUEST-ONLY ROUTES
      // Only non-authenticated users (login, register, etc.)
      ...processRoutes(guestRoutes),
    ],
  },

  // ==========================================
  // AUTHENTICATED ROUTES (Dashboard Layout with Sidebar)
  // ==========================================
  {
    path: '/',
    element: <DashboardLayout />,
    children: [
      // AUTHENTICATED USER ROUTES
      // Requires valid authentication token
      ...processRoutes(userRoutes),

      // ADMIN-ONLY ROUTES
      // Requires authentication + admin privileges
      ...processRoutes(adminRoutes),
    ],
  },

  // ==========================================
  // ROUGH/TESTING ROUTES (Original Layout)
  // ==========================================
  {
    path: '/',
    element: <RootLayout />,
    children: [
      // ROUGH/TESTING ROUTES
      // Keep existing rough routes for component testing
      roughRoutes,

      // 404 HANDLER
      // Catches all unmatched routes
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);

/**
 * Route Organization Summary:
 * 
 * Public (No Auth Required):
 * - /about
 * 
 * Guest Only (Not Logged In):
 * - /login
 * 
 * Authenticated Users:
 * - /dashboard
 * - /profile
 * - /bookings
 * - /settings
 * 
 * Admin Only:
 * - /admin
 * - /admin/users
 * - /admin/trips
 * - /admin/vehicles
 * - /admin/settings
 * 
 * Special:
 * - /auth/callback (OAuth callback)
 * - /rough/* (Testing routes)
 * - * (404 Not Found)
 */
