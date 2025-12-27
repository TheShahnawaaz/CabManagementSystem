import { Outlet } from "react-router-dom"
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb } from "@/components/Breadcrumb"
import { ThemeToggle } from "./ThemeToggle"

/**
 * Dashboard Layout with Sidebar
 * 
 * Features:
 * - Collapsible sidebar (desktop: icons only, mobile: sheet)
 * - Sticky header with breadcrumbs
 * - Auto-generated breadcrumbs from URL
 * - Breadcrumbs show entity names (not IDs)
 * - Theme toggleimage.png
 * - Auto-collapses on mobile
 * - Persists state in cookies
 */
export default function DashboardLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Sticky Header with breadcrumbs and controls */}
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          
          {/* Smart Breadcrumbs - Auto-generated from route config */}
          <Breadcrumb />

          {/* Right side controls */}
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>

        {/* Main content area */}
        <div className="flex flex-1 flex-col gap-4 p-4">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

