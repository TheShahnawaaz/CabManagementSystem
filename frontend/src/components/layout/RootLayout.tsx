import { Outlet } from "react-router-dom";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { PublicLinksBar } from "@/components/layout/PublicLinksBar";

/**
 * Root Layout - Minimal layout for public/guest pages
 *
 * Used for:
 * - Login page (guests only)
 * - Public pages: /about, /terms, /privacy, /contact, etc.
 *
 * Features:
 * - No sidebar (unlike DashboardLayout)
 * - Simple header with just theme toggle
 * - Public links bar at bottom
 *
 * NOTE: This layout does NOT show user info even if logged in.
 * Logged-in users visiting public pages get a clean, simple view.
 * They can use /dashboard to access the full app with sidebar.
 */
export default function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Simple header - just theme toggle */}
      <header className="flex items-center justify-end p-4">
        <ThemeToggle />
      </header>

      {/* Page content */}
      <main className="flex-1">
        <Outlet />
      </main>

      <PublicLinksBar />
    </div>
  );
}
