import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Search, Users } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ItemGroup, ItemSeparator } from "@/components/ui/item";
import { tripApi } from "@/services/trip.service";
import type { HallDemand } from "@/types/trip.types";
import { DemandTrendCard } from "./demand/components/DemandTrendCard";
import { DemandTabSkeleton } from "./demand/components/DemandTabSkeleton";
import { StudentDemandRow } from "./demand/components/StudentDemandRow";
import type {
  ChartType,
  Granularity,
  StudentDemandWithHall,
  TrendMode,
} from "./demand/types";
import {
  buildBookingTrend,
  flattenStudentsByNewest,
  sortDemandsByNewest,
} from "./demand/utils";

export default function DemandTab() {
  const { tripId } = useParams<{ tripId: string }>();
  const [demands, setDemands] = useState<HallDemand[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHall, setSelectedHall] = useState<string>("all");
  const [chartType, setChartType] = useState<ChartType>("area");
  const [trendMode, setTrendMode] = useState<TrendMode>("interval");
  const [granularity, setGranularity] = useState<Granularity>("30m");
  const [searchQuery, setSearchQuery] = useState("");

  const sortedDemands = useMemo(() => sortDemandsByNewest(demands), [demands]);

  const allStudents = useMemo(
    () => flattenStudentsByNewest(sortedDemands),
    [sortedDemands]
  );

  const totalStudents = useMemo(
    () => sortedDemands.reduce((sum, demand) => sum + demand.student_count, 0),
    [sortedDemands]
  );

  const hallOptions = useMemo(
    () => sortedDemands.map((demand) => demand.hall),
    [sortedDemands]
  );

  const filteredStudents = useMemo(() => {
    if (selectedHall === "all") {
      return allStudents;
    }
    return allStudents.filter((student) => student.hall === selectedHall);
  }, [allStudents, selectedHall]);

  const normalizedSearchQuery = searchQuery.trim().toLowerCase();

  const matchesSearchQuery = useCallback(
    (student: StudentDemandWithHall) => {
      if (!normalizedSearchQuery) {
        return true;
      }

      const searchableFields = [
        student.name,
        student.email,
        student.phone_number ?? "",
        student.hall,
      ];

      return searchableFields.some((field) =>
        field.toLowerCase().includes(normalizedSearchQuery)
      );
    },
    [normalizedSearchQuery]
  );

  const searchedStudents = useMemo(
    () => allStudents.filter(matchesSearchQuery),
    [allStudents, matchesSearchQuery]
  );

  const bookingTrend = useMemo(
    () =>
      buildBookingTrend(filteredStudents, granularity, trendMode, hallOptions),
    [filteredStudents, granularity, trendMode, hallOptions]
  );

  const fetchDemand = async () => {
    try {
      setLoading(true);
      const response = await tripApi.getTripDemand(tripId!);
      if (response.success && response.data) {
        setDemands(response.data);
      }
    } catch (error) {
      console.error("Error fetching demand:", error);
      toast.error("Failed to load demand data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemand();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId]);

  if (loading) {
    return <DemandTabSkeleton />;
  }

  if (demands.length === 0) {
    return (
      <Card className="p-12">
        <div className="text-center">
          <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Bookings Yet</h3>
          <p className="text-muted-foreground">
            No students have booked this trip yet.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Student Demand</h2>
        <p className="text-muted-foreground mt-1">
          Hall-wise breakdown of student bookings
        </p>
      </div>

      <DemandTrendCard
        hallOptions={hallOptions}
        selectedHall={selectedHall}
        chartType={chartType}
        trendMode={trendMode}
        granularity={granularity}
        bookingTrend={bookingTrend}
        onHallChange={setSelectedHall}
        onChartTypeChange={setChartType}
        onTrendModeChange={setTrendMode}
        onGranularityChange={setGranularity}
      />

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search users by name, email, phone, or hall..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          className="pl-9"
        />
      </div>

      <Tabs defaultValue="all" className="w-full">
        <div className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden md:overflow-visible">
          <TabsList className="w-max whitespace-nowrap">
            <TabsTrigger value="all" className="gap-2 shrink-0">
              All
              <span className="rounded-full bg-muted-foreground/15 px-2 py-0.5 text-xs leading-none">
                {totalStudents}
              </span>
            </TabsTrigger>
            {sortedDemands.map((demand) => (
              <TabsTrigger
                key={demand.hall}
                value={demand.hall}
                className="gap-2 shrink-0"
              >
                {demand.hall}
                <span className="rounded-full bg-muted-foreground/15 px-2 py-0.5 text-xs leading-none">
                  {demand.student_count}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="all" className="mt-6">
          {searchedStudents.length > 0 ? (
            <ItemGroup className="rounded-lg border">
              {searchedStudents.map((student, index) => (
                <div key={`${student.booking_id}-${student.hall}`}>
                  <StudentDemandRow student={student} showHallInline />
                  {index !== searchedStudents.length - 1 && <ItemSeparator />}
                </div>
              ))}
            </ItemGroup>
          ) : (
            <Card className="p-6">
              <p className="text-sm text-muted-foreground">
                No users match your search.
              </p>
            </Card>
          )}
        </TabsContent>

        {sortedDemands.map((demand) => (
          <TabsContent key={demand.hall} value={demand.hall} className="mt-6">
            {(() => {
              const hallStudents = demand.students
                .map((student) => ({ ...student, hall: demand.hall }))
                .filter(matchesSearchQuery);

              return hallStudents.length > 0 ? (
                <ItemGroup className="rounded-lg border">
                  {hallStudents.map((studentWithHall, index) => (
                    <div key={studentWithHall.id}>
                      <StudentDemandRow student={studentWithHall} />
                      {index !== hallStudents.length - 1 && <ItemSeparator />}
                    </div>
                  ))}
                </ItemGroup>
              ) : (
                <Card className="p-6">
                  <p className="text-sm text-muted-foreground">
                    No users match your search in this hall.
                  </p>
                </Card>
              );
            })()}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
