"use client"

import { type ColumnDef } from "@tanstack/react-table";
import { Edit, MoreHorizontal, Trash2, Eye } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Trip } from "@/types/trip.types";
import { DataTableColumnHeader } from "./DataTableColumnHeader";

export const createColumns = (
  onEdit: (trip: Trip) => void,
  onDelete: (trip: Trip) => void,
  onViewDetails: (trip: Trip) => void
): ColumnDef<Trip>[] => [
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
    accessorKey: "trip_title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Trip Title" />
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("trip_title")}</div>
    ),
  },
  {
    accessorKey: "trip_date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Trip Date" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("trip_date"));
      return <div>{format(date, "EEEE, MMM dd, yyyy")}</div>;
    },
  },
  {
    accessorKey: "booking_start_time",
    header: "Booking Window",
    cell: ({ row }) => {
      const start = new Date(row.getValue("booking_start_time"));
      const end = new Date(row.original.booking_end_time);
      return (
        <div className="text-sm">
          <div>{format(start, "MMM dd, yyyy HH:mm")}</div>
          <div className="text-muted-foreground">
            to {format(end, "MMM dd, yyyy HH:mm")}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "amount_per_person",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Amount" />
    ),
    cell: ({ row }) => {
      const amount = row.getValue("amount_per_person") as number;
      return <div>₹{amount}</div>;
    },
  },
  {
    accessorKey: "booking_count",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Bookings" />
    ),
    cell: ({ row }) => {
      const count = (row.getValue("booking_count") as number) || 0;
      return <Badge variant="outline">{count}</Badge>;
    },
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => {
      const trip = row.original;
      const now = new Date();
      const bookingStart = new Date(trip.booking_start_time);
      const tripEnd = new Date(trip.end_time);

      if (tripEnd <= now) {
        return <Badge variant="secondary">Completed</Badge>;
      } else if (now >= bookingStart && now < tripEnd) {
        return <Badge className="bg-green-500">Active</Badge>;
      } else {
        return <Badge className="bg-blue-500">Upcoming</Badge>;
      }
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const trip = row.original;
      const now = new Date();
      const bookingStart = new Date(trip.booking_start_time);
      
      // Check if trip is upcoming (can't view details)
      const isUpcoming = now < bookingStart;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            {!isUpcoming && (
              <>
                <DropdownMenuItem onClick={() => onViewDetails(trip)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem onClick={() => onEdit(trip)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Trip
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(trip)}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Trip
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

