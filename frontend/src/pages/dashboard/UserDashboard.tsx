/**
 * User Dashboard - Card-Centric Overview
 *
 * Features:
 * - Real-time booking statistics
 * - Next upcoming trip preview
 * - Recent activity timeline
 * - Quick action shortcuts
 */

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Car,
  Users,
  TrendingUp,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard, StatCardGrid } from "@/components/ui/stat-card";
import { toast } from "sonner";
import { useAuth } from "@/hooks";
import { bookingApi } from "@/services/booking.service";
import type { Booking } from "@/types/booking.types";

export default function UserDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch bookings on component mount
  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingApi.getMyBookings();
      if (response.success && response.data) {
        setBookings(response.data);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics from real booking data
  const stats = {
    totalTrips: bookings.length,
    activeBookings: bookings.filter((b) => new Date(b.end_time) >= new Date())
      .length,
    completedTrips: bookings.filter((b) => new Date(b.end_time) < new Date())
      .length,
    upcomingTrips: bookings.filter((b) => new Date(b.trip_date) > new Date())
      .length,
  };

  // Find next upcoming trip (earliest trip date in the future)
  const nextTrip = bookings
    .filter((b) => new Date(b.trip_date) > new Date())
    .sort(
      (a, b) =>
        new Date(a.trip_date).getTime() - new Date(b.trip_date).getTime()
    )[0];

  // Generate recent activity from booking history
  const recentActivity = bookings
    .flatMap((booking) => {
      const events = [];

      // Booking created event
      events.push({
        id: `${booking.id}-booking`,
        type: "booking",
        message: `Booked ${booking.trip_title}`,
        time: booking.created_at,
        icon: CheckCircle2,
        color: "text-green-500",
      });

      // Cab allocation event
      if (booking.allocation_id && booking.cab_number) {
        events.push({
          id: `${booking.id}-allocation`,
          type: "allocation",
          message: `Cab allocated - ${booking.cab_number}`,
          time: booking.updated_at,
          icon: Car,
          color: "text-blue-500",
        });
      }

      // Trip completion event
      if (new Date(booking.end_time) < new Date()) {
        events.push({
          id: `${booking.id}-completion`,
          type: "completion",
          message: `Completed ${booking.trip_title}`,
          time: booking.end_time,
          icon: CheckCircle2,
          color: "text-green-500",
        });
      }

      return events;
    })
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 5); // Show last 5 activities

  // Quick actions
  const quickActions = [
    {
      title: "Browse Trips",
      description: "Find and book upcoming trips",
      icon: MapPin,
      href: "/trips",
      color: "bg-blue-500",
    },
    {
      title: "My Bookings",
      description: "View your booking history",
      icon: Calendar,
      href: "/bookings",
      color: "bg-purple-500",
    },
    {
      title: "Profile",
      description: "Update your information",
      icon: Users,
      href: "/profile",
      color: "bg-orange-500",
    },
  ];

  // Format time helper
  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return dateString;
    }
  };

  // Get status badge for next trip
  const getStatusBadge = (booking: Booking) => {
    if (booking.cab_number) {
      return (
        <Badge variant="default" className="bg-green-500">
          Cab Allocated
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="bg-yellow-500">
        Awaiting Allocation
      </Badge>
    );
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Welcome Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-16 w-16 rounded-full" />
        </div>

        {/* Stats Grid Skeleton */}
        <StatCardGrid columns={4}>
          {[...Array(4)].map((_, i) => (
            <StatCard
              key={i}
              value={0}
              label="Loading..."
              loading
              variant="stacked"
            />
          ))}
        </StatCardGrid>

        {/* Content Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-48 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-12 w-12 mb-4" />
                <Skeleton className="h-5 w-24 mb-2" />
                <Skeleton className="h-4 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back, {user?.name?.split(" ")[0]}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your trips
          </p>
        </div>
        <Avatar className="h-16 w-16">
          <AvatarImage src={user?.profile_picture || undefined} />
          <AvatarFallback className="text-lg">
            {user?.name?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Stats Grid */}
      <StatCardGrid columns={4}>
        <StatCard
          value={stats.totalTrips}
          label="Total Trips"
          icon={MapPin}
          color="blue"
          variant="stacked"
        />
        <StatCard
          value={stats.activeBookings}
          label="Active Bookings"
          icon={CheckCircle2}
          color="green"
          variant="stacked"
        />
        <StatCard
          value={stats.completedTrips}
          label="Completed"
          icon={TrendingUp}
          color="purple"
          variant="stacked"
        />
        <StatCard
          value={stats.upcomingTrips}
          label="Upcoming"
          icon={Clock}
          color="orange"
          variant="stacked"
        />
      </StatCardGrid>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Trip Card */}
        {nextTrip ? (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Next Trip
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {nextTrip.trip_title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {format(
                        new Date(nextTrip.trip_date),
                        "EEEE, MMMM do, yyyy"
                      )}{" "}
                      at {format(new Date(nextTrip.return_time), "HH:mm")}
                    </p>
                  </div>
                  {getStatusBadge(nextTrip)}
                </div>

                <Separator className="my-3" />

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Car className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Cab Number
                      </p>
                      <p className="font-semibold text-sm">
                        {nextTrip.cab_number || "Not assigned yet"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Pickup Point
                      </p>
                      <p className="font-semibold text-sm">
                        {nextTrip.pickup_region || nextTrip.hall}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button size="sm" className="flex-1" asChild>
                    <Link to="/bookings">
                      View Details
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  {nextTrip.allocation_id && (
                    <Button size="sm" variant="outline" className="flex-1">
                      View QR Code
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
                <AlertCircle className="h-4 w-4 text-blue-500 flex-shrink-0" />
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Remember to arrive 10 minutes before departure time
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Next Trip
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  No Upcoming Trips
                </h3>
                <p className="text-muted-foreground mb-4">
                  You don't have any trips scheduled yet
                </p>
                <Button asChild>
                  <Link to="/trips">
                    Browse Available Trips
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length > 0 ? (
              <>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-full bg-muted ${activity.color}`}
                      >
                        <activity.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">
                          {activity.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatTime(activity.time)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" className="w-full mt-4" asChild>
                  <Link to="/bookings">
                    View All Activity
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">
                  No recent activity
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <Link key={action.title} to={action.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardContent className="p-6">
                  <div
                    className={`${action.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}
                  >
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-1">{action.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {action.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
