/**
 * Dashboard Header Component
 *
 * Welcome message with user avatar
 */

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User } from "@/types/user.types";

interface DashboardHeaderProps {
  user: User;
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back, {user.name?.split(" ")[0]}! 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Here's what's happening with your trips
        </p>
      </div>
      <Avatar className="h-16 w-16">
        <AvatarImage src={user.profile_picture || undefined} />
        <AvatarFallback className="text-lg">
          {user.name?.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
    </div>
  );
}
