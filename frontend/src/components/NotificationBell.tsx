/**
 * Notification Bell Component
 *
 * Shows notification bell icon with unread count badge
 * Dropdown displays recent notifications with proper icons
 */

import {
  useState,
  useEffect,
  useCallback,
  useLayoutEffect,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  Bell,
  CheckCheck,
  X,
  Settings,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/hooks";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "@/services/notification.service";
import type { AppNotification } from "@/types";

// Tab configuration
const notificationTabs = [
  { name: "Unread", value: "unread" },
  { name: "All", value: "all" },
];

// Icon mapping for notification categories
const CategoryIcon = ({ category }: { category: string }) => {
  const iconClass = "h-4 w-4";

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
    return <AlertTriangle className="h-3 w-3 text-amber-500" />;
  }

  if (priority === "critical") {
    return <AlertCircle className="h-3 w-3 text-red-500" />;
  }

  return null;
};

// Time ago formatter
function timeAgo(date: string): string {
  const now = new Date();
  const then = new Date(date);
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  return then.toLocaleDateString();
}

export function NotificationBell() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("unread");

  // Animated underline refs
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });

  // Update underline position when tab changes or popover opens
  useLayoutEffect(() => {
    // Small delay to ensure DOM is ready when popover opens
    const updateUnderline = () => {
      const activeIndex = notificationTabs.findIndex(
        (tab) => tab.value === activeTab
      );
      const activeTabElement = tabRefs.current[activeIndex];

      if (activeTabElement) {
        const { offsetLeft, offsetWidth } = activeTabElement;
        setUnderlineStyle({
          left: offsetLeft,
          width: offsetWidth,
        });
      }
    };

    if (open) {
      // Use requestAnimationFrame to ensure DOM is painted
      requestAnimationFrame(() => {
        updateUnderline();
      });
    }
  }, [activeTab, open]);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!user) return;

    try {
      const [notifs, count] = await Promise.all([
        getNotifications({ limit: 10 }),
        getUnreadCount(),
      ]);

      setNotifications(notifs);
      setUnreadCount(count);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Poll for new notifications every 60 seconds
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      getUnreadCount().then(setUnreadCount).catch(console.error);
    }, 60000);

    return () => clearInterval(interval);
  }, [user]);

  // Refetch when dropdown opens
  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open, fetchNotifications]);

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

  // Handle dismiss (delete)
  const handleDismiss = async (
    notification: AppNotification,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();

    try {
      await deleteNotification(notification.id);
      setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
      if (!notification.read_at) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch {
      toast.error("Failed to dismiss notification");
    }
  };

  // Handle notification click
  const handleNotificationClick = async (notification: AppNotification) => {
    // Mark as read if unread
    if (!notification.read_at) {
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
      } catch (err) {
        console.error("Failed to mark as read:", err);
      }
    }

    // Navigate if action URL exists
    if (notification.action_url) {
      setOpen(false);
      navigate(notification.action_url);
    }
  };

  // Filter notifications based on active tab
  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !n.read_at;
    return true;
  });

  if (!user) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 flex items-center justify-center text-[10px] font-medium bg-destructive text-destructive-foreground rounded-full">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 sm:w-96 p-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-base">Notifications</span>
            {unreadCount > 0 && (
              <Badge
                variant="secondary"
                className="text-xs px-2 py-0.5 font-medium"
              >
                {unreadCount} New
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              setOpen(false);
              navigate("/profile");
            }}
            title="Settings"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        {/* Animated Underline Tabs */}
        <div className="px-4">
          <div className="relative border-b">
            <div className="flex">
              {notificationTabs.map((tab, index) => (
                <button
                  key={tab.value}
                  ref={(el) => {
                    tabRefs.current[index] = el;
                  }}
                  onClick={() => setActiveTab(tab.value)}
                  className={cn(
                    "relative z-10 px-4 py-2 text-sm font-medium transition-colors",
                    activeTab === tab.value
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab.name}
                </button>
              ))}
            </div>

            {/* Animated Underline */}
            <motion.div
              className="absolute bottom-0 h-0.5 bg-primary"
              layoutId="notification-tab-underline"
              style={{
                left: underlineStyle.left,
                width: underlineStyle.width,
              }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 40,
              }}
            />
          </div>
        </div>

        {/* Notification List */}
        <ScrollArea className="h-[360px]">
          {loading ? (
            <div className="p-4 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-8 text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                <Bell className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">No notifications</p>
              <p className="text-xs text-muted-foreground mt-1">
                {activeTab === "unread"
                  ? "You're all caught up!"
                  : "You'll see notifications here"}
              </p>
            </div>
          ) : (
            <div>
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "relative flex gap-3 px-4 py-3 hover:bg-muted/50 cursor-pointer transition-colors",
                    !notification.read_at && "bg-muted/30"
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  {/* Icon */}
                  <div
                    className={cn(
                      "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
                      !notification.read_at
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <CategoryIcon category={notification.category} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p
                        className={cn(
                          "text-sm line-clamp-1",
                          !notification.read_at
                            ? "font-semibold"
                            : "font-medium"
                        )}
                      >
                        {notification.title}
                      </p>
                      <PriorityIndicator priority={notification.priority} />
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                      {notification.body}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {timeAgo(notification.created_at)}
                    </p>
                  </div>

                  {/* Action: Unread dot or Dismiss button */}
                  {activeTab === "unread" && !notification.read_at ? (
                    <div className="h-6 w-6 flex items-center justify-center shrink-0">
                      <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0 text-muted-foreground hover:text-foreground"
                      onClick={(e) => handleDismiss(notification, e)}
                      title="Dismiss"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="border-t p-2 flex gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 text-xs h-8"
                onClick={handleMarkAllAsRead}
              >
                <CheckCheck className="h-3.5 w-3.5 mr-1.5" />
                Mark all as read
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 text-xs h-8"
              onClick={() => {
                setOpen(false);
                navigate("/notifications");
              }}
            >
              View all
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
