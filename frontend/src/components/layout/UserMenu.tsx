/**
 * User Menu Component
 *
 * Displays user profile with dropdown menu
 * - Avatar with fallback
 * - Name and email
 * - Theme toggle (in dropdown on mobile)
 * - Profile link
 * - Logout action
 */

import { useAuth } from "@/hooks";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User2, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { ThemeToggleDropdown } from "./ThemeToggle";

export function UserMenu() {
  const { user, signOut, isAdmin } = useAuth();

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-full p-0 font-normal hover:bg-accent hover:text-accent-foreground sm:pr-1"
        >
          <Avatar className="size-9 rounded-md">
            <AvatarImage
              src={user.profile_picture || undefined}
              alt={user.name || "User avatar"}
            />
            <AvatarFallback className="rounded-md">
              {user.name?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="hidden flex-col items-start gap-0.5 lg:flex pl-2">
            <span className="text-sm font-medium">{user.name}</span>
            <span className="text-xs text-muted-foreground">
              {isAdmin ? "Admin" : "User"}
            </span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[240px]" align="end" sideOffset={4}>
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={user.profile_picture || undefined}
                alt={user.name || "User avatar"}
              />
              <AvatarFallback>
                {user.name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <span className="absolute right-0 bottom-0 block size-2 rounded-full bg-green-600 ring-2 ring-card" />
          </div>
          <div className="flex flex-col flex-1">
            <span className="font-semibold text-sm">{user.name}</span>
            <span className="text-xs text-muted-foreground">{user.email}</span>
          </div>
        </div>
        <DropdownMenuSeparator />
        <div className="px-0 py-0 lg:hidden">
          <ThemeToggleDropdown />
        </div>
        <DropdownMenuSeparator className="lg:hidden" />
        <DropdownMenuItem asChild>
          <Link to="/profile">
            <User2 className="mr-2 h-4 w-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={signOut}
          className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 focus:bg-red-50 dark:focus:bg-red-950/50"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
