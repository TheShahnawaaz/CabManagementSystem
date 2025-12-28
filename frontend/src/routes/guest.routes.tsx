import Login from "@/pages/Login";
import type { CustomRouteObject } from "./guards";

/**
 * Guest-Only Routes Configuration
 *
 * These routes are only accessible to non-authenticated users.
 * Authenticated users attempting to access these routes will be
 * redirected to the dashboard.
 *
 * Use cases:
 * - Login page
 * - Registration page
 * - Password reset
 * - Email verification
 *
 * Why separate these?
 * - Prevents logged-in users from seeing login pages
 * - Improves UX by redirecting authenticated users appropriately
 * - Keeps authentication flow clean and logical
 */

export const guestRoutes: CustomRouteObject[] = [
  {
    path: "login",
    element: <Login />,
    meta: {
      guestOnly: true,
      title: "Login",
      description: "Sign in to access Friday Cab System",
      redirectTo: "/dashboard", // Where to send authenticated users
    },
  },
  // Future guest-only routes:
  // {
  //   path: 'register',
  //   element: <Register />,
  //   meta: {
  //     guestOnly: true,
  //     title: 'Register',
  //     redirectTo: '/dashboard'
  //   }
  // },
  // {
  //   path: 'forgot-password',
  //   element: <ForgotPassword />,
  //   meta: {
  //     guestOnly: true,
  //     title: 'Forgot Password'
  //   }
  // },
];
