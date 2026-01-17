/**
 * Report History Sheet
 * Modal showing the audit trail of changes
 */

import { useState } from "react";
import { format, isToday, isYesterday } from "date-fns";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import {
  FilePlus,
  FileEdit,
  Plus,
  Pencil,
  Trash2,
  ArrowRight,
  Mail,
  Phone,
} from "lucide-react";
import {
  HISTORY_ACTION_LABELS,
  formatCurrency,
} from "@/constants/report.constants";
import type { ReportHistory, ReportUser } from "@/types/report.types";
import { cn } from "@/lib/utils";

interface ReportHistorySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  history: ReportHistory[];
  loading: boolean;
}

export function ReportHistorySheet({
  open,
  onOpenChange,
  history,
  loading,
}: ReportHistorySheetProps) {
  // Group history by date
  const groupedHistory = groupByDate(history);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit History</SheetTitle>
          <SheetDescription>
            Audit trail of all changes to this report
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {loading ? (
            <HistorySkeleton />
          ) : history.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No history available
            </p>
          ) : (
            Object.entries(groupedHistory).map(([dateLabel, items]) => (
              <div key={dateLabel}>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">
                  {dateLabel}
                </h4>
                <div className="space-y-3">
                  {items.map((item) => (
                    <HistoryItem key={item.id} item={item} />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function HistoryItem({ item }: { item: ReportHistory }) {
  const time = format(new Date(item.edited_at), "h:mm a");
  const user = item.edited_by_user;

  return (
    <div className="relative rounded-xl border bg-card shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Colored accent bar on left */}
      <div
        className={cn(
          "absolute left-0 top-0 bottom-0 w-1",
          getActionAccentColor(item.action)
        )}
      />

      <div className="p-4 pl-5">
        {/* Header: Action icon, title, and time */}
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0",
              getActionColor(item.action)
            )}
          >
            <ActionIcon action={item.action} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-foreground">
                {HISTORY_ACTION_LABELS[item.action] || item.action}
              </p>
              <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                {time}
              </span>
            </div>

            {/* Change Details */}
            <div className="mt-2">
              <ChangeDetails action={item.action} changes={item.changes} />
            </div>
          </div>
        </div>

        {/* Footer: User info on bottom right */}
        <div className="flex justify-end mt-3 pt-3 border-t border-border/50">
          <UserPopover user={user} />
        </div>
      </div>
    </div>
  );
}

/**
 * User Popover Component
 * Shows user avatar and name, with full details in popover
 * Supports both hover (desktop) and tap (mobile)
 */
function UserPopover({ user }: { user: ReportUser }) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);

  const initials = user.name
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
    }, 200); // 200ms delay before opening
    setHoverTimeout(timeout);
  };

  const handleMouseLeave = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        asChild
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="flex items-center gap-2 cursor-pointer w-fit">
          <Avatar className="h-6 w-6 border border-background">
            {user.profile_picture && (
              <AvatarImage src={user.profile_picture} alt={user.name} />
            )}
            <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs font-medium hover:underline">
            {user.name}
          </span>
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
      >
        <Item variant="outline" className="border-0">
          <ItemMedia>
            <Avatar className="h-12 w-12">
              {user.profile_picture && (
                <AvatarImage src={user.profile_picture} alt={user.name} />
              )}
              <AvatarFallback className="bg-primary/10 text-primary text-base font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </ItemMedia>

          <ItemContent>
            <ItemTitle className="line-clamp-1">{user.name}</ItemTitle>
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

function ChangeDetails({
  action,
  changes,
}: {
  action: string;
  changes: Record<string, unknown>;
}) {
  if (action === "report_created" || action === "report_updated") {
    const fieldChanges = Object.entries(changes).filter(
      ([key]) => key !== "adjustment"
    );

    if (fieldChanges.length === 0) return null;

    return (
      <div className="mt-2 space-y-1">
        {fieldChanges.map(([field, change]) => {
          const { old: oldVal, new: newVal } = change as {
            old: unknown;
            new: unknown;
          };

          return (
            <div key={field} className="flex items-center gap-2 text-xs">
              <Badge variant="outline" className="font-normal">
                {formatFieldName(field)}
              </Badge>
              {oldVal !== null && (
                <>
                  <span className="text-muted-foreground line-through">
                    {formatValue(field, oldVal)}
                  </span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                </>
              )}
              <span className="font-medium">{formatValue(field, newVal)}</span>
            </div>
          );
        })}
      </div>
    );
  }

  if (action === "adjustment_added" || action === "adjustment_removed") {
    const adjustment = (
      changes as {
        adjustment?: { type: string; amount: number; category: string };
      }
    ).adjustment;
    if (!adjustment) return null;

    return (
      <div className="mt-2 p-2 rounded bg-background border text-xs">
        <div className="flex items-center justify-between">
          <span className="capitalize">{adjustment.type}</span>
          <span className="font-medium">
            {adjustment.type === "income" ? "+" : "-"}
            {formatCurrency(adjustment.amount)}
          </span>
        </div>
        <p className="text-muted-foreground mt-1">{adjustment.category}</p>
      </div>
    );
  }

  if (action === "adjustment_updated") {
    const { changes: fieldChanges } = changes as {
      adjustment_id: string;
      changes: Record<string, { old: unknown; new: unknown }>;
    };

    if (!fieldChanges) return null;

    return (
      <div className="mt-2 space-y-1">
        {Object.entries(fieldChanges).map(([field, change]) => (
          <div key={field} className="flex items-center gap-2 text-xs">
            <Badge variant="outline" className="font-normal">
              {formatFieldName(field)}
            </Badge>
            <span className="text-muted-foreground line-through">
              {formatValue(field, change.old)}
            </span>
            <ArrowRight className="h-3 w-3 text-muted-foreground" />
            <span className="font-medium">
              {formatValue(field, change.new)}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return null;
}

function HistorySkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="rounded-xl border bg-card p-4 pl-5 relative">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-muted rounded-l-xl" />
          <div className="flex items-start gap-3">
            <Skeleton className="h-9 w-9 rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
          </div>
          <div className="flex justify-end mt-3 pt-3 border-t border-border/50">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ====================================
// HELPERS
// ====================================

function groupByDate(
  history: ReportHistory[]
): Record<string, ReportHistory[]> {
  const groups: Record<string, ReportHistory[]> = {};

  history.forEach((item) => {
    const date = new Date(item.edited_at);
    let label: string;

    if (isToday(date)) {
      label = "Today";
    } else if (isYesterday(date)) {
      label = "Yesterday";
    } else {
      label = format(date, "MMMM d, yyyy");
    }

    if (!groups[label]) {
      groups[label] = [];
    }
    groups[label].push(item);
  });

  return groups;
}

function ActionIcon({ action }: { action: string }) {
  switch (action) {
    case "report_created":
      return <FilePlus className="h-4 w-4" />;
    case "report_updated":
      return <FileEdit className="h-4 w-4" />;
    case "adjustment_added":
      return <Plus className="h-4 w-4" />;
    case "adjustment_updated":
      return <Pencil className="h-4 w-4" />;
    case "adjustment_removed":
      return <Trash2 className="h-4 w-4" />;
    default:
      return <FileEdit className="h-4 w-4" />;
  }
}

function getActionColor(action: string): string {
  switch (action) {
    case "report_created":
      return "bg-green-500/10 text-green-600";
    case "report_updated":
      return "bg-blue-500/10 text-blue-600";
    case "adjustment_added":
      return "bg-green-500/10 text-green-600";
    case "adjustment_updated":
      return "bg-amber-500/10 text-amber-600";
    case "adjustment_removed":
      return "bg-red-500/10 text-red-600";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function getActionAccentColor(action: string): string {
  switch (action) {
    case "report_created":
      return "bg-green-500";
    case "report_updated":
      return "bg-blue-500";
    case "adjustment_added":
      return "bg-green-500";
    case "adjustment_updated":
      return "bg-amber-500";
    case "adjustment_removed":
      return "bg-red-500";
    default:
      return "bg-muted-foreground";
  }
}

function formatFieldName(field: string): string {
  return field.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatValue(field: string, value: unknown): string {
  if (value === null || value === undefined) return "-";

  if (field === "cab_cost" || field === "amount") {
    return formatCurrency(value as number);
  }

  if (typeof value === "string" && value.length > 50) {
    return value.slice(0, 50) + "...";
  }

  return String(value);
}
