import { useEffect, useState } from "react";
import {
  useParams,
  useNavigate,
  useLocation,
  Outlet,
  Link,
} from "react-router-dom";
import {
  Calendar,
  Clock,
  IndianRupee,
  Users,
  BarChart3,
  Navigation,
  Target,
  Bell,
  BellRing,
  AlarmClock,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { tripApi } from "@/services/trip.service";
import { sendBookingReminder } from "@/services";
import type { Trip } from "@/types/trip.types";
import { getTripDetailStatus, canAccessTab, getDefaultTab } from "./utils";

export default function TripDetailLayout() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendingReminder, setSendingReminder] = useState(false);

  // Determine current tab from URL
  const pathSegments = location.pathname.split("/");
  const currentTab: "demand" | "journey" | "allocation" =
    pathSegments.includes("allocation")
      ? "allocation"
      : pathSegments.includes("journey")
        ? "journey"
        : "demand";

  useEffect(() => {
    if (!tripId) {
      toast.error("Invalid trip ID");
      navigate("/admin/trips");
      return;
    }

    fetchTripDetails();
  }, [tripId]);

  const fetchTripDetails = async () => {
    try {
      setLoading(true);
      const response = await tripApi.getTripById(tripId!);
      if (response.success && response.data) {
        setTrip(response.data);
      } else {
        toast.error("Failed to load trip details");
        navigate("/admin/trips");
      }
    } catch (error: unknown) {
      console.error("Error fetching trip:", error);
      toast.error("Failed to load trip details");
      navigate("/admin/trips");
    } finally {
      setLoading(false);
    }
  };

  const handleSendReminder = async (
    reminderType: "reminder" | "final_reminder"
  ) => {
    if (!trip || sendingReminder) return;
    const typeLabel =
      reminderType === "final_reminder" ? "Final reminder" : "Reminder";

    setSendingReminder(true);
    try {
      const result = await sendBookingReminder({
        tripId: String(trip.id),
        reminderType,
      });

      toast.success(`${typeLabel} Sent!`, {
        description: `Email queued for ${result.emails_queued} users`,
      });
    } catch (error: any) {
      toast.error(`${typeLabel} Failed`, {
        description: error.message || "Failed to send reminder",
      });
    } finally {
      setSendingReminder(false);
    }
  };

  // Access control: Check if current tab is allowed
  useEffect(() => {
    if (!trip || loading) return;

    const status = getTripDetailStatus(trip);

    // If trip is upcoming, redirect back to trips page
    if (status === "upcoming") {
      toast.error("Upcoming trips cannot be viewed in detail");
      navigate("/admin/trips");
      return;
    }

    // Check if current tab is accessible
    if (!canAccessTab(currentTab, status, trip)) {
      // Redirect to default accessible tab
      const defaultTab = getDefaultTab(status, trip);
      navigate(`/admin/trips/${tripId}/${defaultTab}`, { replace: true });
      toast.info(`This tab is not available for this trip status`);
    }
  }, [trip, currentTab, loading]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-4 sm:p-6 mb-6">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-9 w-2/3" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
            <Skeleton className="h-6 w-6 rounded-md" />
          </div>

          <div className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <Skeleton className="h-10 w-[320px] rounded-lg" />
          </div>
        </Card>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!trip) {
    return null;
  }

  const status = getTripDetailStatus(trip);
  const getStatusBadge = () => {
    switch (status) {
      case "completed":
        return <Badge variant="secondary">Completed</Badge>;
      case "active-booking-closed":
        return <Badge className="bg-yellow-500">Active • Booking Closed</Badge>;
      case "active-booking-open":
        return <Badge className="bg-green-500">Active • Booking Open</Badge>;
      case "upcoming":
        return <Badge className="bg-blue-500">Upcoming</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Trip Info Card */}
      <Card className="p-4 sm:p-6 mb-6">
        <Accordion type="single" collapsible>
          <AccordionItem value="trip-overview" className="border-none">
            <AccordionTrigger className="py-0 hover:no-underline [&>svg]:h-6 [&>svg]:w-6 [&>svg]:rounded-md [&>svg]:border [&>svg]:border-border [&>svg]:p-0.5">
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold leading-tight">
                  {trip.trip_title}
                </h1>
                <div className="mt-2 flex items-center gap-1.5">
                  {getStatusBadge()}
                  {status === "active-booking-open" && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="ml-2"
                          disabled={sendingReminder}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <BellRing className="h-4 w-4 mr-2" />
                          {sendingReminder ? "Sending..." : "Send Reminder"}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-48">
                        <DropdownMenuItem
                          disabled={sendingReminder}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSendReminder("reminder");
                          }}
                        >
                          <Bell className="mr-2 h-4 w-4" />
                          Send Reminder
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={sendingReminder}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSendReminder("final_reminder");
                          }}
                        >
                          <AlarmClock className="mr-2 h-4 w-4" />
                          Send Final Reminder
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 pb-0">
              {/* Trip Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Trip Date</p>
                    <p className="font-medium">
                      {format(new Date(trip.trip_date), "dd MMM, yyyy")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Bookings</p>
                    <p className="font-medium">{trip.booking_count || 0} students</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <IndianRupee className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Amount</p>
                    <p className="font-medium">₹{trip.amount_per_person}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Booking Window</p>
                    <p className="font-medium text-sm">
                      {format(new Date(trip.booking_start_time), "dd MMM, HH:mm")} -{" "}
                      {format(new Date(trip.booking_end_time), "dd MMM, HH:mm")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">End Time</p>
                    <p className="font-medium text-sm">
                      {format(new Date(trip.end_time), "dd MMM, HH:mm")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Departure Time</p>
                    <p className="font-medium text-sm">
                      {format(new Date(trip.departure_time), "dd MMM, HH:mm")}
                    </p>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Tabs */}
        <Tabs value={currentTab} className="mt-4">
          <div className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <TabsList className="grid grid-cols-3 w-max whitespace-nowrap">
            {canAccessTab("demand", status, trip) && (
              <TabsTrigger value="demand" asChild>
                <Link
                  to={`/admin/trips/${tripId}/demand`}
                  className="flex items-center gap-2"
                >
                  <BarChart3 className="w-4 h-4" />
                  Demand
                </Link>
              </TabsTrigger>
            )}
            {canAccessTab("journey", status, trip) && (
              <TabsTrigger value="journey" asChild>
                <Link
                  to={`/admin/trips/${tripId}/journey`}
                  className="flex items-center gap-2"
                >
                  <Navigation className="w-4 h-4" />
                  Journey
                </Link>
              </TabsTrigger>
            )}
            {canAccessTab("allocation", status, trip) && (
              <TabsTrigger value="allocation" asChild>
                <Link
                  to={`/admin/trips/${tripId}/allocation`}
                  className="flex items-center gap-2"
                >
                  <Target className="w-4 h-4" />
                  Allocation
                </Link>
              </TabsTrigger>
            )}
            </TabsList>
          </div>
        </Tabs>
      </Card>

      {/* Tab Content */}
      <Outlet context={{ trip, status, refreshTrip: fetchTripDetails }} />
    </div>
  );
}
