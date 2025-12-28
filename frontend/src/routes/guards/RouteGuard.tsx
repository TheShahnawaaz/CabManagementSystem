import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks";
import { LoadingScreen } from "@/components/ui/loading";
import { toast } from "sonner";
import { useEffect } from "react";
import type { RouteMeta } from "./types";

interface RouteGuardProps {
  children: React.ReactNode;
  meta: RouteMeta;
}

/**
 * Universal route guard that enforces authentication and authorization rules
 *
 * Features:
 * - Displays loading screen during auth check (no content flash)
 * - Enforces authentication requirements
 * - Enforces admin-only access
 * - Handles guest-only routes (e.g., login page)
 * - Shows toast notifications for access denial
 * - Sets document title based on route metadata
 * - Supports custom redirect paths
 *
 * @example
 * // In route configuration:
 * {
 *   path: 'dashboard',
 *   element: <RouteGuard meta={{ requireAuth: true }}><Dashboard /></RouteGuard>
 * }
 */
export function RouteGuard({ children, meta }: RouteGuardProps) {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();

  // ===========================================
  // ALL HOOKS MUST BE CALLED FIRST (Rules of Hooks)
  // ===========================================

  // Update document title when route meta changes
  useEffect(() => {
    if (meta.title) {
      document.title = `${meta.title} | Friday Cab System`;
    }
  }, [meta.title]);

  // Show appropriate toast notifications for access denial
  useEffect(() => {
    // Only show toasts after loading is complete
    if (loading) return;

    // Guest-only route accessed by authenticated user
    if (meta.guestOnly && user) {
      toast.info("Already logged in", {
        description: "You are already authenticated",
        action: {
          label: "Okay",
          onClick: () => toast.dismiss(),
        },
      });
      return;
    }

    // Protected route accessed without authentication
    if (meta.requireAuth && !user) {
      toast.warning("Authentication required", {
        description: "Please log in to access this page",
        action: {
          label: "Okay",
          onClick: () => toast.dismiss(),
        },
      });
      return;
    }

    // Admin route accessed by non-admin
    if (meta.requireAdmin && !isAdmin) {
      toast.error("Access denied", {
        description: "This page is restricted to administrators only",
        action: {
          label: "Okay",
          onClick: () => toast.dismiss(),
        },
      });
      return;
    }
  }, [
    loading,
    user,
    isAdmin,
    meta.guestOnly,
    meta.requireAuth,
    meta.requireAdmin,
  ]);

  // ===========================================
  // NOW WE CAN DO CONDITIONAL RETURNS
  // ===========================================

  // Show loading screen during authentication check
  // This prevents flash of unauthorized content
  if (loading) {
    return <LoadingScreen />;
  }

  // ===========================================
  // GUARD LOGIC - ORDER MATTERS!
  // ===========================================

  // GUARD 1: Guest-only routes (e.g., login page)
  // Authenticated users should not see login/register pages
  if (meta.guestOnly && user) {
    const redirectPath = meta.redirectTo || "/dashboard";
    return <Navigate to={redirectPath} replace />;
  }

  // GUARD 2: Authentication required
  // User must be logged in to access this route
  if (meta.requireAuth && !user) {
    const redirectPath = meta.redirectTo || "/login";
    return (
      <Navigate to={redirectPath} state={{ from: location.pathname }} replace />
    );
  }

  // GUARD 3: Admin-only access
  // User must be an admin to access this route
  if (meta.requireAdmin && !isAdmin) {
    const redirectPath = meta.redirectTo || "/dashboard";
    return <Navigate to={redirectPath} replace />;
  }

  // ===========================================
  // ALL GUARDS PASSED - RENDER CONTENT
  // ===========================================

  return <>{children}</>;
}
