import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import {
  ChevronLeft,
  ChevronRight,
  Activity,
  RefreshCw,
  ArrowRight,
  MoveRight,
  Eye,
  Clock,
  User,
  Tag,
  FileText,
} from "lucide-react";
import { activityApi } from "@/services/activity.service";
import type {
  ActivityLog,
  ActivityLogFilters,
  ActivityLogPagination,
} from "@/services/activity.service";

// ====================================
// ACTION TYPE CONFIG — grouped by category
// ====================================

const ACTION_CONFIG: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline"; group: string }
> = {
  // Trip
  TRIP_CREATED: { label: "Trip Created", variant: "default", group: "Trip" },
  TRIP_UPDATED: { label: "Trip Updated", variant: "secondary", group: "Trip" },
  TRIP_DELETED: { label: "Trip Deleted", variant: "destructive", group: "Trip" },
  // Allocation
  ALLOCATION_RUN: { label: "Allocation Run", variant: "secondary", group: "Allocation" },
  ALLOCATION_SUBMITTED: { label: "Allocation Submitted", variant: "default", group: "Allocation" },
  ALLOCATION_CLEARED: { label: "Allocation Cleared", variant: "destructive", group: "Allocation" },
  ALLOCATION_NOTIFIED: { label: "Users Notified", variant: "default", group: "Allocation" },
  CAB_UPDATED: { label: "Cab Updated", variant: "secondary", group: "Allocation" },
  // Boarding
  USER_BOARDED: { label: "User Boarded", variant: "default", group: "Boarding" },
  USER_UNBOARDED: { label: "User Unboarded", variant: "destructive", group: "Boarding" },
  // Report
  REPORT_CREATED: { label: "Report Created", variant: "default", group: "Report" },
  REPORT_UPDATED: { label: "Report Updated", variant: "secondary", group: "Report" },
  ADJUSTMENT_ADDED: { label: "Adjustment Added", variant: "default", group: "Report" },
  ADJUSTMENT_UPDATED: { label: "Adjustment Updated", variant: "secondary", group: "Report" },
  ADJUSTMENT_DELETED: { label: "Adjustment Deleted", variant: "destructive", group: "Report" },
  // Notification
  ANNOUNCEMENT_SENT: { label: "Announcement Sent", variant: "default", group: "Notification" },
  REMINDER_SENT: { label: "Reminder Sent", variant: "default", group: "Notification" },
};

// Group actions by category for the grouped select
const ACTION_GROUPS = Object.entries(ACTION_CONFIG).reduce<
  Record<string, { key: string; label: string }[]>
>((acc, [key, config]) => {
  if (!acc[config.group]) acc[config.group] = [];
  acc[config.group].push({ key, label: config.label });
  return acc;
}, {});

// ====================================
// DETAIL FIELD LABELS — human-readable labels for JSONB keys
// ====================================

const DETAIL_LABELS: Record<string, string> = {
  trip_title: "Trip",
  trip_date: "Trip Date",
  trip_id: "Trip ID",
  journey_type: "Journey Type",
  cab_number: "Cab Number",
  cab_count: "Total Cabs",
  cab_cost: "Cab Cost",
  student_count: "Students",
  total_students: "Total Students",
  total_cabs: "Total Cabs",
  recipient_count: "Recipients",
  user_count: "Users Notified",
  reminder_type: "Reminder Type",
  category: "Category",
  amount: "Amount",
  adjustment_type: "Adjustment Type",
  adjustment_id: "Adjustment ID",
  changed_fields: "Changed Fields",
  subject: "Subject",
  target_type: "Target Type",
};

// ====================================
// HELPER FUNCTIONS
// ====================================

function getActionConfig(actionType: string) {
  return ACTION_CONFIG[actionType] || { label: actionType, variant: "outline" as const, group: "Other" };
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const DATE_FIELDS = new Set([
  'trip_date', 'booking_start_time', 'booking_end_time',
  'departure_time', 'prayer_time', 'end_time', 'created_at',
]);

function formatDetailValue(key: string, value: any): string {
  if (value === null || value === undefined) return "(empty)";
  if (key === "amount" || key === "cab_cost" || key === "amount_per_person")
    return `₹${Number(value).toLocaleString("en-IN")}`;
  if (key === "journey_type")
    return value === "pickup" ? "Outbound (Pickup)" : "Return (Drop)";
  if (key === "changed_fields" && Array.isArray(value))
    return value.join(", ");
  if (key === "reminder_type")
    return value === "final_reminder" ? "Final Reminder" : "Reminder";
  if (key === "target_type")
    return value === "all" ? "All Users" : value.charAt(0).toUpperCase() + value.slice(1);

  // Format date/time fields or ISO strings in IST
  if (DATE_FIELDS.has(key) || (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value))) {
    const d = new Date(value);
    if (!isNaN(d.getTime())) {
      // Date-only field (trip_date) — show just the date
      if (key === "trip_date" && typeof value === "string" && !value.includes("T")) {
        return d.toLocaleDateString("en-IN", {
          day: "numeric", month: "short", year: "numeric",
          timeZone: "Asia/Kolkata",
        });
      }
      // Timestamp fields — show date + time
      return d.toLocaleString("en-IN", {
        day: "numeric", month: "short",
        hour: "2-digit", minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata",
      });
    }
  }

  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function formatSummary(details: Record<string, any>): string {
  if (!details || Object.keys(details).length === 0) return "—";

  const parts: string[] = [];

  if (details.trip_title) parts.push(details.trip_title);
  if (details.journey_type)
    parts.push(details.journey_type === "pickup" ? "Outbound" : "Return");
  if (details.cab_number) parts.push(`Cab ${details.cab_number}`);
  if (details.recipient_count)
    parts.push(`${details.recipient_count} recipients`);
  if (details.category) parts.push(details.category);
  if (details.amount) parts.push(`₹${details.amount}`);
  if (details.changes && typeof details.changes === 'object')
    parts.push(`${Object.keys(details.changes).length} field(s) changed`);
  if (details.cab_count) parts.push(`${details.cab_count} cabs`);
  if (details.student_count || details.total_students)
    parts.push(`${details.student_count || details.total_students} students`);
  if (details.subject) parts.push(details.subject);

  return parts.length > 0 ? parts.join(" · ") : "View details";
}

function formatTimestamp(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString("en-IN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });
}

function formatFullTimestamp(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "Asia/Kolkata",
  });
}

// ====================================
// DETAIL MODAL COMPONENT
// ====================================

function ActivityDetailModal({
  log,
  open,
  onClose,
}: {
  log: ActivityLog | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!log) return null;
  const config = getActionConfig(log.action_type);
  const detailEntries = Object.entries(log.details || {});

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activity Detail
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Action badge + timestamp */}
          <div className="flex items-center justify-between">
            <Badge variant={config.variant} className="text-sm px-3 py-1">
              {config.label}
            </Badge>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {formatFullTimestamp(log.created_at)}
            </div>
          </div>

          <Separator />

          {/* Actor */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <User className="h-3.5 w-3.5" />
              Performed by
            </div>
            {log.actor ? (
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={log.actor.profile_picture || undefined} />
                  <AvatarFallback className="text-xs">
                    {getInitials(log.actor.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{log.actor.name}</p>
                  <p className="text-xs text-muted-foreground">{log.actor.email}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">System</p>
            )}
          </div>

          {/* Target user (if any) */}
          {log.target && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <ArrowRight className="h-3.5 w-3.5" />
                Target User
              </div>
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={log.target.profile_picture || undefined} />
                  <AvatarFallback className="text-xs">
                    {getInitials(log.target.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{log.target.name}</p>
                  <p className="text-xs text-muted-foreground">{log.target.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Entity info */}
          {log.entity_type && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <Tag className="h-3.5 w-3.5" />
                Entity
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground">Type:</span>
                  <Badge variant="outline" className="capitalize">
                    {log.entity_type.replace("_", " ")}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* Changes (from → to) */}
          {log.details?.changes && Object.keys(log.details.changes).length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <FileText className="h-3.5 w-3.5" />
                Changes
              </div>
              <div className="rounded-lg border bg-muted/30 divide-y">
                {Object.entries(log.details.changes as Record<string, { from: any; to: any }>).map(
                  ([field, { from, to }]) => (
                    <div key={field} className="px-3 py-2.5 space-y-1">
                      <span className="text-xs font-medium text-muted-foreground">
                        {DETAIL_LABELS[field] || field.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                      </span>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="px-2 py-0.5 rounded bg-destructive/10 text-destructive line-through">
                          {formatDetailValue(field, from) || "(empty)"}
                        </span>
                        <MoveRight className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                        <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-600 dark:text-green-400">
                          {formatDetailValue(field, to)}
                        </span>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* Other detail fields (non-changes) */}
          {detailEntries.filter(([key]) => key !== 'changes').length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <FileText className="h-3.5 w-3.5" />
                Info
              </div>
              <div className="rounded-lg border bg-muted/30 divide-y">
                {detailEntries
                  .filter(([key]) => key !== 'changes')
                  .map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-start justify-between gap-4 px-3 py-2.5"
                    >
                      <span className="text-sm text-muted-foreground whitespace-nowrap">
                        {DETAIL_LABELS[key] || key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                      </span>
                      <span className="text-sm font-medium text-right">
                        {formatDetailValue(key, value)}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ====================================
// MAIN COMPONENT
// ====================================

export default function ActivityLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [pagination, setPagination] = useState<ActivityLogPagination>({
    total: 0,
    page: 1,
    limit: 20,
  });
  const [filters, setFilters] = useState<ActivityLogFilters>({
    page: 1,
    limit: 20,
  });
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await activityApi.getActivityLogs(filters);
      if (response.success) {
        setLogs(response.data || []);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      }
    } catch (error) {
      console.error("Failed to fetch activity logs:", error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">
            Activity Logs
          </h1>
          <p className="text-muted-foreground mt-1">
            Track all admin actions across the system
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchLogs}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Select
          value={filters.action_type || "all"}
          onValueChange={(value) =>
            setFilters((prev) => ({
              ...prev,
              action_type: value === "all" ? undefined : value,
              page: 1,
            }))
          }
        >
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="All Actions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            {Object.entries(ACTION_GROUPS).map(([group, actions]) => (
              <SelectGroup key={group}>
                <SelectLabel>{group}</SelectLabel>
                {actions.map((action) => (
                  <SelectItem key={action.key} value={action.key}>
                    {action.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>

        <div className="ml-auto text-sm text-muted-foreground">
          {!loading && <>{pagination.total} log{pagination.total !== 1 ? "s" : ""}</>}
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <ActivityTableSkeleton />
          ) : logs.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Activity className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm font-medium">No activity logs found</p>
              <p className="text-xs mt-1">Actions will appear here as admins interact with the system</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Actor</TableHead>
                  <TableHead className="w-[170px]">Action</TableHead>
                  <TableHead className="w-[160px]">Target</TableHead>
                  <TableHead>Summary</TableHead>
                  <TableHead className="w-[130px] text-right">Time</TableHead>
                  <TableHead className="w-[50px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => {
                  const config = getActionConfig(log.action_type);
                  return (
                    <TableRow
                      key={log.id}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => setSelectedLog(log)}
                    >
                      {/* Actor */}
                      <TableCell>
                        {log.actor ? (
                          <div className="flex items-center gap-2">
                            <Avatar className="h-7 w-7">
                              <AvatarImage src={log.actor.profile_picture || undefined} />
                              <AvatarFallback className="text-xs">
                                {getInitials(log.actor.name)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium truncate max-w-[120px]">
                              {log.actor.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">System</span>
                        )}
                      </TableCell>

                      {/* Action */}
                      <TableCell>
                        <Badge variant={config.variant}>
                          {config.label}
                        </Badge>
                      </TableCell>

                      {/* Target */}
                      <TableCell>
                        {log.target ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-1.5">
                                  <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage src={log.target.profile_picture || undefined} />
                                    <AvatarFallback className="text-[10px]">
                                      {getInitials(log.target.name)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm truncate max-w-[100px]">
                                    {log.target.name}
                                  </span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{log.target.email}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>

                      {/* Summary (concise inline) */}
                      <TableCell>
                        <span className="text-sm text-muted-foreground truncate block max-w-[280px]">
                          {formatSummary(log.details)}
                        </span>
                      </TableCell>

                      {/* Time */}
                      <TableCell className="text-right">
                        <span className="text-sm text-muted-foreground">
                          {formatTimestamp(log.created_at)}
                        </span>
                      </TableCell>

                      {/* View button */}
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLog(log);
                          }}
                        >
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {pagination.page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() =>
                setFilters((prev) => ({ ...prev, page: (prev.page || 1) - 1 }))
              }
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= totalPages}
              onClick={() =>
                setFilters((prev) => ({ ...prev, page: (prev.page || 1) + 1 }))
              }
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <ActivityDetailModal
        log={selectedLog}
        open={!!selectedLog}
        onClose={() => setSelectedLog(null)}
      />
    </div>
  );
}

// ====================================
// SKELETON LOADING
// ====================================

function ActivityTableSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[180px]">Actor</TableHead>
          <TableHead className="w-[170px]">Action</TableHead>
          <TableHead className="w-[160px]">Target</TableHead>
          <TableHead>Summary</TableHead>
          <TableHead className="w-[130px] text-right">Time</TableHead>
          <TableHead className="w-[50px]" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {[...Array(8)].map((_, i) => (
          <TableRow key={i}>
            <TableCell>
              <div className="flex items-center gap-2">
                <Skeleton className="h-7 w-7 rounded-full" />
                <Skeleton className="h-4 w-20" />
              </div>
            </TableCell>
            <TableCell>
              <Skeleton className="h-5 w-24 rounded-full" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-16" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-40" />
            </TableCell>
            <TableCell className="text-right">
              <Skeleton className="h-4 w-20 ml-auto" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-7 w-7 rounded" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
