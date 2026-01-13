import { useEffect, useState } from "react";
import { useOutletContext, useParams, useNavigate } from "react-router-dom";
import {
  Car,
  Wand2,
  Trash2,
  Edit,
  Bell,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { allocationApi } from "@/services/allocation.service";
import { DemandSummaryCards } from "./allocation/DemandSummaryCards";
import { VehicleSeatViewer } from "@/components/VehicleSeatViewer";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { mapStudentsToSeats } from "@/utils/allocation.utils";
import type { Trip } from "@/types/trip.types";
import type { TripDetailStatus } from "./utils";
import type { CabAllocation, DemandSummary } from "@/types/allocation.types";

interface AllocationTabContext {
  trip: Trip;
  status: TripDetailStatus;
  refreshTrip: () => void;
}

export default function AllocationTab() {
  const { tripId } = useParams<{ tripId: string }>();
  const { refreshTrip } = useOutletContext<AllocationTabContext>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  // State
  const [hasAllocation, setHasAllocation] = useState(false);
  const [demandSummary, setDemandSummary] = useState<DemandSummary[]>([]);
  const [cabs, setCabs] = useState<CabAllocation[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);

  // Dialogs
  const [showClearDialog, setShowClearDialog] = useState(false);

  // Notification state
  const [notificationStatus, setNotificationStatus] = useState<{
    notified_count: number;
    pending_count: number;
    total_count: number;
    all_notified: boolean;
  } | null>(null);
  const [notifying, setNotifying] = useState(false);

  useEffect(() => {
    fetchAllocationData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId]);

  const fetchAllocationData = async () => {
    try {
      setLoading(true);
      const response = await allocationApi.getAllocation(tripId!);

      if (response.success && response.data) {
        setHasAllocation(response.data.has_allocation);

        if (response.data.has_allocation) {
          const cabData = response.data.cabs || [];
          setCabs(cabData);
          setTotalStudents(response.data.total_students || 0);

          // Fetch notification status
          fetchNotificationStatus();
        } else {
          setDemandSummary(response.data.demand_summary || []);
          setNotificationStatus(null);
        }
      }
    } catch (error) {
      console.error("Error fetching allocation:", error);
      toast.error("Failed to load allocation data");
    } finally {
      setLoading(false);
    }
  };

  const fetchNotificationStatus = async () => {
    try {
      const response = await allocationApi.getNotificationStatus(tripId!);
      if (response.success && response.data) {
        setNotificationStatus(response.data);
      }
    } catch (error) {
      console.error("Error fetching notification status:", error);
    }
  };

  const handleRunAllocation = async () => {
    try {
      setRunning(true);
      const response = await allocationApi.runAllocation(tripId!);

      if (response.success && response.data) {
        toast.success(
          `Allocation generated: ${response.data.total_cabs} cabs for ${response.data.total_students} students`
        );
        // Redirect to edit page with suggested data
        navigate(`/admin/trips/${tripId}/allocation/edit`, {
          state: { suggestedAllocation: response.data },
        });
      }
    } catch (error) {
      console.error("Error running allocation:", error);
      toast.error("Failed to run allocation algorithm");
    } finally {
      setRunning(false);
    }
  };

  const handleClearAllocation = async () => {
    try {
      const response = await allocationApi.clearAllocation(tripId!);

      if (response.success) {
        toast.success("Allocation cleared successfully");
        setHasAllocation(false);
        setCabs([]);
        setNotificationStatus(null);
        refreshTrip();
        fetchAllocationData();
      }
    } catch (error) {
      console.error("Error clearing allocation:", error);
      toast.error("Failed to clear allocation");
    } finally {
      setShowClearDialog(false);
    }
  };

  const handleNotifyUsers = async () => {
    try {
      setNotifying(true);
      const response = await allocationApi.notifyAllocatedUsers(tripId!);

      if (response.success) {
        const count = response.data?.notified_count || 0;
        if (count > 0) {
          toast.success(`Notifications sent to ${count} users`);
        } else {
          toast.info("All users have already been notified");
        }
        fetchNotificationStatus();
      }
    } catch (error) {
      console.error("Error notifying users:", error);
      toast.error("Failed to send notifications");
    } finally {
      setNotifying(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <Card className="p-4 sm:p-6">
          <Skeleton className="h-6 sm:h-8 w-32 sm:w-48 mb-4" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-20 sm:h-24 w-full" />
            ))}
          </div>
        </Card>
      </div>
    );
  }

  // State 1: No Allocation
  if (!hasAllocation) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <DemandSummaryCards demandSummary={demandSummary} />

        <Card className="p-8 sm:p-12">
          <div className="text-center max-w-md mx-auto">
            <Car className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold mb-2">
              No Allocation Yet
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-6">
              Run the allocation algorithm to automatically assign students to
              cabs based on their halls and optimize pickup routes.
            </p>
            <Button
              size="lg"
              onClick={handleRunAllocation}
              disabled={running}
              className="w-full sm:w-auto"
            >
              <Wand2 className="w-4 h-4 mr-2" />
              {running ? "Running Algorithm..." : "Run Allocation Model"}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // State 2 & 3: Suggested/Saved Allocation
  const assignedCount = cabs.reduce(
    (sum, cab) => sum + cab.assigned_students.length,
    0
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <Card className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">Cab Allocation</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {cabs.length} cabs • {assignedCount}/{totalStudents} students
              assigned
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {/* Notify Users Button */}
            {notificationStatus && (
              <Button
                variant={
                  notificationStatus.all_notified ? "outline" : "default"
                }
                size="sm"
                onClick={handleNotifyUsers}
                disabled={notifying || notificationStatus.all_notified}
                className="flex-1 sm:flex-none"
              >
                {notifying ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : notificationStatus.all_notified ? (
                  <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                ) : (
                  <Bell className="w-4 h-4 mr-2" />
                )}
                {notifying
                  ? "Sending..."
                  : notificationStatus.all_notified
                    ? "All Notified"
                    : `Notify (${notificationStatus.pending_count})`}
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/admin/trips/${tripId}/allocation/edit`)}
              className="flex-1 sm:flex-none"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowClearDialog(true)}
              className="flex-1 sm:flex-none"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-muted/50 p-3 rounded-lg">
            <p className="text-xs text-muted-foreground">Total Cabs</p>
            <p className="text-lg sm:text-2xl font-bold">{cabs.length}</p>
          </div>
          <div className="bg-muted/50 p-3 rounded-lg">
            <p className="text-xs text-muted-foreground">Students</p>
            <p className="text-lg sm:text-2xl font-bold">{assignedCount}</p>
          </div>
          <div className="bg-muted/50 p-3 rounded-lg">
            <p className="text-xs text-muted-foreground">Avg per Cab</p>
            <p className="text-lg sm:text-2xl font-bold">
              {(assignedCount / cabs.length).toFixed(1)}
            </p>
          </div>
          <div className="bg-muted/50 p-3 rounded-lg">
            <p className="text-xs text-muted-foreground">Empty Seats</p>
            <p className="text-lg sm:text-2xl font-bold">
              {cabs.length * 7 - assignedCount}
            </p>
          </div>
          <div
            className={`p-3 rounded-lg ${
              notificationStatus?.all_notified
                ? "bg-green-500/10 border border-green-500/20"
                : "bg-amber-500/10 border border-amber-500/20"
            }`}
          >
            <p className="text-xs text-muted-foreground">Notified</p>
            <p className="text-lg sm:text-2xl font-bold">
              {notificationStatus
                ? `${notificationStatus.notified_count}/${notificationStatus.total_count}`
                : "—"}
            </p>
          </div>
        </div>
      </Card>

      {/* Cabs */}
      <div className="space-y-6">
        {cabs.map((cab, index) => {
          // Map students to seats using utility function
          const studentsBySeat = mapStudentsToSeats(cab.assigned_students);

          return (
            <Card key={cab.id || cab.temp_id} className="overflow-hidden">
              {/* Cab Header */}
              <div className="flex items-center justify-between p-4 sm:p-6 border-b bg-muted/30">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                    Cab #{index + 1}
                    <span className="text-xs sm:text-sm font-normal text-muted-foreground">
                      • {cab.pickup_region}
                    </span>
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                    {cab.assigned_students.length}/7 seats filled
                  </p>
                </div>
              </div>

              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr,auto,1fr] gap-6 lg:gap-8">
                  {/* Left: Cab Details (Read-only) */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          Cab Number
                        </Label>
                        <div className="h-10 px-3 py-2 rounded-md border bg-muted/50 flex items-center font-mono text-sm">
                          {cab.cab_number}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Cab Type</Label>
                        <div className="h-10 px-3 py-2 rounded-md border bg-muted/50 flex items-center text-sm capitalize">
                          {cab.cab_type}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Driver Name</Label>
                      <div className="h-10 px-3 py-2 rounded-md border bg-muted/50 flex items-center text-sm">
                        {cab.driver_name}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Driver Phone
                      </Label>
                      <div className="h-10 px-3 py-2 rounded-md border bg-muted/50 flex items-center text-sm">
                        {cab.driver_phone}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          Starting Point
                        </Label>
                        <div className="h-10 px-3 py-2 rounded-md border bg-muted/50 flex items-center text-sm">
                          {cab.pickup_region}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Passkey</Label>
                        <div className="h-10 px-3 py-2 rounded-md border border-primary/20 bg-primary/5 flex items-center font-mono text-base font-semibold text-primary">
                          {cab.passkey}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="hidden lg:block">
                    <Separator orientation="vertical" className="h-full" />
                  </div>
                  <div className="lg:hidden">
                    <Separator orientation="horizontal" />
                  </div>

                  {/* Right: Vehicle Seat Viewer */}
                  <div className="flex items-center justify-center lg:justify-start">
                    <VehicleSeatViewer students={studentsBySeat} />
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Clear Allocation Dialog */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Allocation?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete all cab assignments for this trip. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearAllocation}
              className="bg-destructive"
            >
              Clear Allocation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
