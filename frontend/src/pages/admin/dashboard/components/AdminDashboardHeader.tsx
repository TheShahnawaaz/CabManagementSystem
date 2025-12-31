/**
 * Admin Dashboard Header Component
 *
 * Welcome message and admin info
 */

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { UserProfile } from "@/types/user.types";

interface AdminDashboardHeaderProps {
  user: UserProfile;
}

export function AdminDashboardHeader({ user }: AdminDashboardHeaderProps) {
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back, {user.name?.split(" ")[0]}! 👋
        </h1>
        <p className="text-muted-foreground mt-1">{currentDate}</p>
      </div>
      <Avatar className="h-16 w-16">
        <AvatarImage src={user.profile_picture || undefined} alt={user.name} />
        <AvatarFallback className="text-lg">
          {user.name?.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
    </div>
  );
}
