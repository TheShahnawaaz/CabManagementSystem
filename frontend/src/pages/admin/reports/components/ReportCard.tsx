/**
 * Report Card
 * Beautiful card displaying a single report in the list view
 */

import { useState } from "react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Users,
  Car,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Wallet,
  Receipt,
  Plus,
  Mail,
  Phone,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { formatCurrency } from "@/constants/report.constants";
import type { ReportFinancials, ReportUser } from "@/types/report.types";
import { cn } from "@/lib/utils";

interface ReportCardProps {
  report: ReportFinancials;
}

export function ReportCard({ report }: ReportCardProps) {
  const navigate = useNavigate();

  // Parse numeric values
  const netBalance = Number(report.net_profit) || 0;
  const grossRevenue = Number(report.gross_revenue) || 0;
  const totalExpense = Number(report.total_expense) || 0;
  const totalStudents = Number(report.total_students) || 0;
  const totalCabs = Number(report.total_cabs) || 0;

  const isSurplus = netBalance >= 0;
  const tripDate = new Date(report.trip_date);

  // Get user for footer
  const editorUser = report.last_edited_by_user || report.created_by_user;

  return (
    <Card
      className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary/30 hover:-translate-y-0.5"
      onClick={() => navigate(`/admin/reports/${report.report_id}`)}
    >
      <CardContent className="p-0">
        {/* Main Content */}
        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            {/* Left Section: Date & Title */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-base truncate">
                    {format(tripDate, "EEEE, MMMM d, yyyy")}
                  </h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {report.trip_title}
                  </p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="outline" className="gap-1.5 py-1">
                          <Users className="h-3.5 w-3.5" />
                          {totalStudents}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{totalStudents} students booked</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="outline" className="gap-1.5 py-1">
                          <Car className="h-3.5 w-3.5" />
                          {totalCabs}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{totalCabs} cabs allocated</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                {/* Mobile: Surplus/Deficit badge - aligned right */}
                <Badge
                  variant="outline"
                  className={cn(
                    "md:hidden gap-1.5 py-1 px-2.5",
                    isSurplus
                      ? "bg-green-500/10 text-green-600 border-green-500/30"
                      : "bg-red-500/10 text-red-600 border-red-500/30"
                  )}
                >
                  {isSurplus ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {formatCurrency(Math.abs(netBalance))}
                </Badge>
              </div>
            </div>

            {/* Right Section: Financial Summary */}
            <div className="flex items-center gap-6">
              {/* Revenue & Expense */}
              <div className="hidden md:flex items-center gap-4">
                <div className="text-right">
                  <div className="flex items-center justify-end gap-1.5 text-xs text-muted-foreground mb-0.5">
                    <Wallet className="h-3 w-3" />
                    Revenue
                  </div>
                  <p className="font-semibold text-green-600">
                    {formatCurrency(grossRevenue)}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center justify-end gap-1.5 text-xs text-muted-foreground mb-0.5">
                    <Receipt className="h-3 w-3" />
                    Expense
                  </div>
                  <p className="font-semibold text-red-600">
                    {formatCurrency(totalExpense)}
                  </p>
                </div>
              </div>

              {/* Balance Box - Hidden on mobile */}
              <div
                className={cn(
                  "hidden md:block px-4 py-2.5 rounded-lg min-w-[120px] text-center",
                  isSurplus ? "bg-green-500/10" : "bg-red-500/10"
                )}
              >
                <p
                  className={cn(
                    "text-xs font-medium mb-1",
                    isSurplus ? "text-green-600/80" : "text-red-600/80"
                  )}
                >
                  {isSurplus ? "Surplus" : "Deficit"}
                </p>
                <div className="flex items-center justify-center gap-1.5">
                  {isSurplus ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  <span
                    className={cn(
                      "text-lg font-bold",
                      isSurplus ? "text-green-600" : "text-red-600"
                    )}
                  >
                    {formatCurrency(Math.abs(netBalance))}
                  </span>
                </div>
              </div>

              {/* Arrow */}
              <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hidden lg:block" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-muted/30 border-t">
          <UserCardPopover
            user={editorUser}
            actionLabel={
              report.last_edited_by_user ? "Edited by" : "Created by"
            }
            timestamp={format(
              new Date(report.updated_at),
              "MMM d, yyyy 'at' h:mm a"
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}

// ====================================
// PENDING TRIP CARD
// ====================================

interface PendingTripCardProps {
  trip: {
    trip_id: string;
    trip_title: string;
    trip_date: string;
    total_students: number;
    total_cabs: number;
    gross_revenue: number;
  };
  onCreateReport: (tripId: string) => void;
}

export function PendingTripCard({
  trip,
  onCreateReport,
}: PendingTripCardProps) {
  const tripDate = new Date(trip.trip_date);
  const grossRevenue = Number(trip.gross_revenue) || 0;
  const totalStudents = Number(trip.total_students) || 0;
  const totalCabs = Number(trip.total_cabs) || 0;

  return (
    <Card className="border-dashed border-2 border-amber-500/40 bg-gradient-to-r from-amber-500/5 to-orange-500/5 hover:border-amber-500/60 transition-colors">
      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Left: Trip Info */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
              <Calendar className="h-5 w-5 text-amber-600" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge className="bg-amber-500/20 text-amber-700 border-amber-500/30 hover:bg-amber-500/30">
                  Report Pending
                </Badge>
              </div>
              <h3 className="font-semibold truncate">
                {format(tripDate, "EEEE, MMMM d, yyyy")}
              </h3>
              <p className="text-sm text-muted-foreground truncate">
                {trip.trip_title}
              </p>

              {/* Stats Row */}
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <Badge variant="outline" className="gap-1.5 py-1">
                  <Users className="h-3.5 w-3.5" />
                  {totalStudents} students
                </Badge>
                <Badge variant="outline" className="gap-1.5 py-1">
                  <Car className="h-3.5 w-3.5" />
                  {totalCabs} cabs
                </Badge>
                <Badge
                  variant="outline"
                  className="gap-1.5 py-1 text-green-600 border-green-500/30"
                >
                  <Wallet className="h-3.5 w-3.5" />
                  {formatCurrency(grossRevenue)}
                </Badge>
              </div>
            </div>
          </div>

          {/* Right: Create Button */}
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onCreateReport(trip.trip_id);
            }}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Report
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ====================================
// USER CARD POPOVER
// ====================================

interface UserCardPopoverProps {
  user: ReportUser | null;
  actionLabel: string;
  timestamp: string;
}

function UserCardPopover({
  user,
  actionLabel,
  timestamp,
}: UserCardPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);

  const name = user?.name || "Unknown";
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Handle hover with delay (desktop)
  const handleMouseEnter = () => {
    if (hoverTimeout) clearTimeout(hoverTimeout);
    const timeout = setTimeout(() => {
      setIsOpen(true);
    }, 200);
    setHoverTimeout(timeout);
  };

  const handleMouseLeave = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setIsOpen(false);
  };

  if (!user) {
    return (
      <div className="flex items-center gap-2.5">
        <Avatar className="h-7 w-7 border-2 border-background shadow-sm">
          <AvatarFallback className="text-[10px] bg-muted text-muted-foreground font-medium">
            ?
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="text-xs font-medium">{actionLabel} Unknown</span>
          <span className="text-[11px] text-muted-foreground">{timestamp}</span>
        </div>
      </div>
    );
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        asChild
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className="flex items-center gap-2.5 cursor-pointer"
          onClick={(e) => e.stopPropagation()}
        >
          <Avatar className="h-7 w-7 border-2 border-background shadow-sm">
            {user.profile_picture && (
              <AvatarImage src={user.profile_picture} alt={name} />
            )}
            <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-xs font-medium hover:underline">
              {actionLabel} {name}
            </span>
            <span className="text-[11px] text-muted-foreground">
              {timestamp}
            </span>
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="w-72 p-0"
        side="top"
        align="start"
        onMouseEnter={() => {
          if (hoverTimeout) clearTimeout(hoverTimeout);
          setIsOpen(true);
        }}
        onMouseLeave={handleMouseLeave}
        onClick={(e) => e.stopPropagation()}
      >
        <Item variant="outline" className="border-0">
          <ItemMedia>
            <Avatar className="h-12 w-12">
              {user.profile_picture && (
                <AvatarImage src={user.profile_picture} alt={name} />
              )}
              <AvatarFallback className="bg-primary/10 text-primary text-base font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </ItemMedia>

          <ItemContent>
            <ItemTitle className="line-clamp-1">{name}</ItemTitle>
            {(user.email || user.phone_number) && (
              <ItemDescription className="mt-1 space-y-1">
                {user.email && (
                  <div className="flex items-center gap-1.5 text-xs">
                    <Mail className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </div>
                )}
                {user.phone_number && (
                  <div className="flex items-center gap-1.5 text-xs">
                    <Phone className="w-3 h-3 flex-shrink-0" />
                    <span>{user.phone_number}</span>
                  </div>
                )}
              </ItemDescription>
            )}
          </ItemContent>
        </Item>
      </PopoverContent>
    </Popover>
  );
}
