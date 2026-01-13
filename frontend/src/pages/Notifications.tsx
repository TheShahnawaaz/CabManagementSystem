/**
 * Notifications Page
 *
 * Full page view of all notifications
 */

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Loader2,
  ExternalLink,
  Calendar,
  CreditCard,
  Car,
  Megaphone,
  MapPin,
  Ticket,
  AlertTriangle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "@/services/notification.service";
import type { AppNotification } from "@/types";

// Icon component for notification categories
const CategoryIcon = ({ category }: { category: string }) => {
  const iconClass = "h-5 w-5";

  switch (category) {
    case "booking":
      return <Ticket className={iconClass} />;
    case "payment":
      return <CreditCard className={iconClass} />;
    case "trip":
      return <Calendar className={iconClass} />;
    case "cab":
      return <Car className={iconClass} />;
    case "admin":
      return <Megaphone className={iconClass} />;
    case "journey":
      return <MapPin className={iconClass} />;
    default:
      return <Bell className={iconClass} />;
  }
};

// Priority indicator
const PriorityIndicator = ({ priority }: { priority: string }) => {
  if (priority === "low" || priority === "normal") return null;

  if (priority === "high") {
    return <AlertTriangle className="h-4 w-4 text-amber-500" />;
  }

  if (priority === "critical") {
    return <AlertCircle className="h-4 w-4 text-red-500" />;
  }

  return null;
};

// Time formatter
function formatDate(date: string): string {
  const now = new Date();
  const then = new Date(date);
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;

  return then.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type FilterType = "all" | "unread" | "read";

export default function NotificationsPage() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");
  const [offset, setOffset] = useState(0);

  const LIMIT = 20;

  // Fetch notifications
  const fetchNotifications = useCallback(
    async (reset = false) => {
      try {
        const currentOffset = reset ? 0 : offset;

        if (reset) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }

        const notifs = await getNotifications({
          limit: LIMIT,
          offset: currentOffset,
          unread: filter === "unread" ? true : undefined,
        });

        // Filter read notifications on client side if filter is 'read'
        let filteredNotifs = notifs;
        if (filter === "read") {
          filteredNotifs = notifs.filter((n) => n.read_at);
        }

        if (reset) {
          setNotifications(filteredNotifs);
        } else {
          setNotifications((prev) => [...prev, ...filteredNotifs]);
        }

        setHasMore(notifs.length === LIMIT);
        setOffset(currentOffset + LIMIT);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
        toast.error("Failed to load notifications");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [filter, offset]
  );

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    setOffset(0);
    fetchNotifications(true);
    fetchUnreadCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  // Handle mark as read
  const handleMarkAsRead = async (notification: AppNotification) => {
    if (notification.read_at) return;

    try {
      await markAsRead(notification.id);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id
            ? { ...n, read_at: new Date().toISOString() }
            : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      toast.error("Failed to mark as read");
    }
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          read_at: n.read_at || new Date().toISOString(),
        }))
      );
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to mark all as read");
    }
  };

  // Handle delete
  const handleDelete = async (notification: AppNotification) => {
    try {
      await deleteNotification(notification.id);
      setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
      if (!notification.read_at) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      toast.success("Notification deleted");
    } catch {
      toast.error("Failed to delete notification");
    }
  };

  // Handle notification click
  const handleNotificationClick = async (notification: AppNotification) => {
    // Mark as read if unread
    if (!notification.read_at) {
      await handleMarkAsRead(notification);
    }

    // Navigate if action URL exists
    if (notification.action_url) {
      navigate(notification.action_url);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold mb-2">Notifications</h1>
            <p className="text-muted-foreground">
              {unreadCount > 0
                ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                : "All caught up!"}
            </p>
          </div>

          {unreadCount > 0 && (
            <Button variant="outline" onClick={handleMarkAllAsRead}>
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark all as read
            </Button>
          )}
        </div>

        {/* Tabs */}
        <div className="mt-6">
          <Tabs
            value={filter}
            onValueChange={(v) => setFilter(v as FilterType)}
          >
            <TabsList className="grid w-full md:w-[400px] grid-cols-3">
              <TabsTrigger value="all" className="gap-2">
                All
              </TabsTrigger>
              <TabsTrigger value="unread" className="gap-2">
                Unread
                {unreadCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-1 h-5 min-w-5 px-1.5"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="read" className="gap-2">
                Read
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Notification List */}
      <div className="space-y-3 max-w-3xl">
        {loading ? (
          // Loading skeleton
          [...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-12 w-12 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-1/2" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : notifications.length === 0 ? (
          // Empty state
          <Card>
            <CardContent className="p-12 text-center">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Bell className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No notifications</h3>
              <p className="text-muted-foreground text-sm">
                {filter === "unread"
                  ? "You've read all your notifications"
                  : filter === "read"
                    ? "No read notifications yet"
                    : "You don't have any notifications yet"}
              </p>
            </CardContent>
          </Card>
        ) : (
          // Notification cards
          <>
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={cn(
                  "transition-colors cursor-pointer hover:bg-muted/50",
                  !notification.read_at && "bg-muted/30 border-primary/20"
                )}
                onClick={() => handleNotificationClick(notification)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="relative shrink-0">
                      <div
                        className={cn(
                          "h-12 w-12 rounded-full flex items-center justify-center",
                          !notification.read_at
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        <CategoryIcon category={notification.category} />
                      </div>
                      {/* Unread indicator */}
                      {!notification.read_at && (
                        <div className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-primary border-2 border-background" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3
                            className={cn(
                              "font-semibold",
                              !notification.read_at
                                ? "text-foreground"
                                : "text-muted-foreground"
                            )}
                          >
                            {notification.title}
                          </h3>
                          <PriorityIndicator priority={notification.priority} />
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          {!notification.read_at && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsRead(notification);
                              }}
                              title="Mark as read"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(notification);
                            }}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.body}
                      </p>

                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <span className="text-xs text-muted-foreground">
                          {formatDate(notification.created_at)}
                        </span>

                        {notification.action_url && (
                          <span className="flex items-center gap-1 text-xs text-primary font-medium">
                            <ExternalLink className="h-3 w-3" />
                            Click to view
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Load more */}
            {hasMore && (
              <div className="text-center pt-4">
                <Button
                  variant="outline"
                  onClick={() => fetchNotifications(false)}
                  disabled={loadingMore}
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Load more"
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
