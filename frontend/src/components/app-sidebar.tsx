import {
  Calendar,
  Car,
  LayoutDashboard,
  Users,
  MapPin,
  User2,
  BarChart3,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks";
import { Link, useLocation } from "react-router-dom";

// Menu items for regular users
const userMenuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Trips",
    url: "/trips",
    icon: MapPin,
  },
  {
    title: "My Bookings",
    url: "/bookings",
    icon: Calendar,
  },
  {
    title: "Profile",
    url: "/profile",
    icon: User2,
  },
];

// Menu items for admin users
const adminMenuItems = [
  {
    title: "Admin Dashboard",
    url: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Manage Trips",
    url: "/admin/trips",
    icon: Calendar,
  },
  {
    title: "Manage Reports",
    url: "/admin/reports",
    icon: BarChart3,
  },
  {
    title: "Manage Users",
    url: "/admin/users",
    icon: Users,
  },
];

export function AppSidebar() {
  const { isAdmin } = useAuth();
  const location = useLocation();

  // Check if a menu item is active based on current path
  const isActiveRoute = (url: string) => {
    // Exact match for dashboard/home routes
    if (url === "/dashboard" || url === "/admin") {
      return location.pathname === url;
    }
    // For other routes, check if current path starts with the menu item URL
    return location.pathname.startsWith(url);
  };

  return (
    <Sidebar collapsible="icon">
      {/* Sidebar Header */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Car className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Friday Cab</span>
                  <span className="text-xs text-muted-foreground">
                    {isAdmin ? "Admin Panel" : "Student Portal"}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Sidebar Content */}
      <SidebarContent>
        {/* User Navigation Section */}
        <SidebarGroup>
          <SidebarGroupLabel>
            {isAdmin ? "Student Features" : "Navigation"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {userMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={isActiveRoute(item.url)}
                  >
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin Section - Only show for admins */}
        {isAdmin && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>Administration</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {adminMenuItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        tooltip={item.title}
                        isActive={isActiveRoute(item.url)}
                      >
                        <Link to={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
