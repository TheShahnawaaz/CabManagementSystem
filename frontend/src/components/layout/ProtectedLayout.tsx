import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks';
import { LoadingScreen } from '@/components/ui/loading';

/**
 * Protected Layout Wrapper
 * 
 * This component wraps layouts that require authentication.
 * It shows a fullscreen loading spinner while checking auth status,
 * preventing the layout (sidebar, etc.) from rendering prematurely.
 * 
 * Features:
 * - Fullscreen loading (not inside layout)
 * - Redirects to login if not authenticated
 * - Only renders layout + children after auth is verified
 * 
 * Usage:
 * Wrap DashboardLayout in the router configuration
 */
export default function ProtectedLayout() {
  const { user, loading } = useAuth();

  // Show fullscreen loading while checking authentication
  // This prevents sidebar/layout from rendering before auth is verified
  if (loading) {
    return <LoadingScreen />;
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // User is authenticated - render the layout and its children
  return <Outlet />;
}

