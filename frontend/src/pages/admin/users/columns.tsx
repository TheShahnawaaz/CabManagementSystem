"use client";

import { type ColumnDef } from "@tanstack/react-table";
import {
  Edit,
  Shield,
  ShieldOff,
  Trash2,
  MoreHorizontalIcon,
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type { UserWithStats } from "@/types/user.types";
import { DataTableColumnHeader } from "./DataTableColumnHeader";

export const createColumns = (
  onEdit: (user: UserWithStats) => void,
  onDelete: (user: UserWithStats) => void,
  onToggleAdmin: (user: UserWithStats) => void
): ColumnDef<UserWithStats>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="User" />
    ),
    cell: ({ row }) => {
      const user = row.original;
      const initials = user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage
              src={user.profile_picture || undefined}
              alt={user.name}
            />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <div className="font-medium">{user.name}</div>
            <div className="text-sm text-muted-foreground">{user.email}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "phone_number",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Phone" />
    ),
    cell: ({ row }) => {
      const phone = row.getValue("phone_number") as string | null;
      return (
        <div className="text-sm">
          {phone ? (
            `+91 ${phone}`
          ) : (
            <span className="text-muted-foreground">Not provided</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "is_admin",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" />
    ),
    cell: ({ row }) => {
      const isAdmin = row.getValue("is_admin") as boolean;
      return isAdmin ? (
        <Badge className="bg-purple-500 hover:bg-purple-600">Admin</Badge>
      ) : (
        <Badge variant="outline">User</Badge>
      );
    },
  },
  {
    accessorKey: "booking_count",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Bookings" />
    ),
    cell: ({ row }) => {
      const count = (row.getValue("booking_count") as number) || 0;
      return <Badge variant="secondary">{count}</Badge>;
    },
  },
  {
    accessorKey: "payment_count",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Payments" />
    ),
    cell: ({ row }) => {
      const count = (row.getValue("payment_count") as number) || 0;
      return <Badge variant="outline">{count}</Badge>;
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Joined" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"));
      return <div className="text-sm">{format(date, "MMM dd, yyyy")}</div>;
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const user = row.original;

      return (
        <ButtonGroup>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggleAdmin(user)}
          >
            {user.is_admin ? (
              <ShieldOff className="h-4 w-4" />
            ) : (
              <Shield className="h-4 w-4" />
            )}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="px-2">
                <MoreHorizontalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => onEdit(user)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit User
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleAdmin(user)}>
                {user.is_admin ? (
                  <>
                    <ShieldOff className="mr-2 h-4 w-4" />
                    Remove Admin
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Make Admin
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(user)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </ButtonGroup>
      );
    },
  },
];
