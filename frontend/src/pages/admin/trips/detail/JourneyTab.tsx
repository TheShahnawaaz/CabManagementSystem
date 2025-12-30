import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Car,
  Users,
  AlertCircle,
  CheckCircle2,
  XCircle,
  MapPin,
  Phone,
  Key,
} from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard, StatCardGrid } from "@/components/ui/stat-card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { tripApi } from "@/services/trip.service";
import { VehicleJourneyViewer } from "./allocation/VehicleJourneyViewer";
import { StudentInfoCard } from "@/components/StudentInfoCard";
import type {
  TripJourneyData,
  JourneyCab,
  GlobalNoShowStudent,
} from "@/types/journey.types";

// Hall colors for cab header
const HALL_COLORS: Record<string, string> = {
  RK: "bg-blue-500",
  VS: "bg-purple-500",
  LBS: "bg-green-500",
  PAN: "bg-orange-500",
};

export default function JourneyTab() {
  const { tripId } = useParams<{ tripId: string }>();
  const [data, setData] = useState<TripJourneyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"outbound" | "return">("outbound");

  const fetchJourneys = async () => {
    try {
      setLoading(true);
      const response = await tripApi.getTripJourneys(tripId!);
      if (response.success && response.data) {
        setData(response.data);
      }
    } catch (error) {
      console.error("Error fetching journeys:", error);
      toast.error("Failed to load journey data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJourneys();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId]);

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>

        {/* Stats Skeleton */}
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

        {/* Tabs Skeleton */}
        <Skeleton className="h-12 w-full md:w-[400px] rounded-lg" />

        {/* Cards Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <Skeleton key={i} className="h-[500px] rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.cabs.length === 0) {
    return (
      <Card className="p-12">
        <div className="text-center">
          <Car className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Allocation Data</h3>
          <p className="text-muted-foreground">
            This trip has no cab allocations yet. Journey tracking will appear
            after allocation.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Journey Tracking</h2>
        <p className="text-muted-foreground mt-1">
          Real-time QR scan records for pickup and dropoff journeys
        </p>
      </div>

      {/* Summary Statistics */}
      <StatCardGrid columns={4}>
        <StatCard
          value={data.summary.total_allocations}
          label="Allocated"
          icon={Users}
          color="neutral"
          variant="stacked"
        />
        <StatCard
          value={data.summary.outbound_boarded}
          label="Outbound"
          icon={CheckCircle2}
          color="green"
          variant="stacked"
        />
        <StatCard
          value={data.summary.return_boarded}
          label="Return"
          icon={CheckCircle2}
          color="indigo"
          variant="stacked"
        />
        <StatCard
          value={data.summary.outbound_no_shows + data.summary.return_no_shows}
          label="No-Shows"
          icon={XCircle}
          color="red"
          variant="stacked"
        />
      </StatCardGrid>

      {/* Tabs: Outbound vs Return */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as "outbound" | "return")}
      >
        <TabsList className="grid w-full md:w-[350px] grid-cols-2">
          <TabsTrigger value="outbound" className="gap-2">
            <MapPin className="w-4 h-4" />
            Outbound
          </TabsTrigger>
          <TabsTrigger value="return" className="gap-2">
            <MapPin className="w-4 h-4" />
            Return
          </TabsTrigger>
        </TabsList>

        {/* Outbound Tab Content */}
        <TabsContent value="outbound" className="space-y-6 mt-6">
          {/* Outbound Global No-Shows */}
          {data.outbound_no_shows.length > 0 && (
            <NoShowAccordion
              students={data.outbound_no_shows}
              title="Outbound No-Shows"
            />
          )}

          {/* Per-Cab Journey Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {data.cabs.map((cab) => (
              <CabJourneyCard
                key={cab.cab_id}
                cab={cab}
                journeyType="outbound"
              />
            ))}
          </div>
        </TabsContent>

        {/* Return Tab Content */}
        <TabsContent value="return" className="space-y-6 mt-6">
          {/* Return Global No-Shows */}
          {data.return_no_shows.length > 0 && (
            <NoShowAccordion
              students={data.return_no_shows}
              title="Return No-Shows"
            />
          )}

          {/* Per-Cab Journey Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {data.cabs.map((cab) => (
              <CabJourneyCard key={cab.cab_id} cab={cab} journeyType="return" />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// No-Show Accordion Component
function NoShowAccordion({
  students,
  title,
}: {
  students: GlobalNoShowStudent[];
  title: string;
}) {
  return (
    <Card>
      <Accordion type="single" collapsible>
        <AccordionItem value="no-shows" className="border-none">
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <div className="flex items-center gap-2 text-sm font-medium">
              <AlertCircle className="w-4 h-4 text-muted-foreground" />
              <span>
                {title} ({students.length})
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {students.map((student) => (
                <StudentInfoCard
                  key={student.user_id}
                  student={student}
                  showEmail={true}
                  showPhone={true}
                  showAllocatedCab={true}
                  compact
                />
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}

// Cab Journey Card Component
function CabJourneyCard({
  cab,
  journeyType,
}: {
  cab: JourneyCab;
  journeyType: "outbound" | "return";
}) {
  const students =
    journeyType === "outbound" ? cab.outbound_students : cab.return_students;
  const noShows =
    journeyType === "outbound" ? cab.outbound_noshow_students : [];
  const totalAllocated =
    journeyType === "outbound"
      ? cab.outbound_students.length + cab.outbound_noshow_students.length
      : cab.return_students.length;

  const hallColor = HALL_COLORS[cab.pickup_region] || "bg-gray-500";
  const isFull = students.length === cab.capacity;

  return (
    <Card className="overflow-hidden h-fit">
      {/* Cab Header */}
      <div className="flex items-center justify-between p-4 border-b bg-muted/30">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${hallColor}`}>
            <Car className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold flex items-center gap-2">
              {cab.cab_number}
              <Badge variant="outline" className="text-xs font-normal">
                {cab.pickup_region}
              </Badge>
            </h3>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3" />
                {cab.driver_name || "No driver"}
              </span>
              <span className="flex items-center gap-1">
                <Key className="w-3 h-3" />
                {cab.passkey}
              </span>
            </div>
          </div>
        </div>
        <Badge
          variant={isFull ? "default" : "secondary"}
          className={`font-mono ${isFull ? "bg-green-500 hover:bg-green-600" : ""}`}
        >
          {students.length}/
          {journeyType === "outbound" ? totalAllocated : cab.capacity}
        </Badge>
      </div>

      {/* Vehicle Viewer */}
      <div className="p-4">
        {students.length > 0 ? (
          <VehicleJourneyViewer students={students} journeyType={journeyType} />
        ) : (
          <div className="py-12 text-center text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No students boarded this cab</p>
          </div>
        )}
      </div>

      {/* Per-Cab No-Shows (outbound only) */}
      {journeyType === "outbound" && noShows.length > 0 && (
        <div className="border-t">
          <Accordion type="single" collapsible>
            <AccordionItem value="no-shows" className="border-none">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center gap-2 text-sm font-medium text-red-600 dark:text-red-400">
                  <XCircle className="w-4 h-4" />
                  <span>
                    {noShows.length} No-Show{noShows.length > 1 ? "s" : ""}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="grid grid-cols-1 gap-2">
                  {noShows.map((student) => (
                    <StudentInfoCard
                      key={student.user_id}
                      student={student}
                      showEmail={true}
                      showPhone={true}
                      showSeat={true}
                      compact
                    />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )}
    </Card>
  );
}
