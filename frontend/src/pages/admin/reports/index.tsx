/**
 * Reports Page
 * Main page for listing all financial reports
 */

import { useState } from "react";
import { Plus, FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { useReportsList } from "./useReportManagement";
import { ReportSummaryCards } from "./components/ReportSummaryCards";
import { ReportCard, PendingTripCard } from "./components/ReportCard";
import { CreateReportDialog } from "./components/CreateReportDialog";
import type { TripWithoutReport } from "@/types/report.types";

export default function ReportsPage() {
  const {
    reports,
    summary,
    pendingTrips,
    loading,
    summaryLoading,
    createReport,
  } = useReportsList();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<TripWithoutReport | null>(
    null
  );

  const handleCreateReport = (tripId: string) => {
    const trip = pendingTrips.find((t) => t.trip_id === tripId);
    if (trip) {
      setSelectedTrip(trip);
      setCreateDialogOpen(true);
    }
  };

  const handleOpenCreateDialog = () => {
    // Open with the first pending trip pre-selected
    if (pendingTrips.length > 0) {
      setSelectedTrip(pendingTrips[0]);
      setCreateDialogOpen(true);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Financial Reports</h1>
          <p className="text-muted-foreground mt-1">
            Track revenue, expenses, and balance for each trip
          </p>
        </div>
        {pendingTrips.length > 0 && (
          <Button onClick={handleOpenCreateDialog}>
            <Plus className="w-4 h-4 mr-2" />
            Create Report
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <ReportSummaryCards summary={summary} loading={summaryLoading} />

      {/* Reports List */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all" className="gap-2">
            <FileText className="h-4 w-4" />
            All Reports
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
              {reports.length}
            </Badge>
          </TabsTrigger>
          {pendingTrips.length > 0 && (
            <TabsTrigger value="pending" className="gap-2">
              <AlertCircle className="h-4 w-4" />
              Pending
              <Badge variant="destructive" className="ml-1 h-5 px-1.5 text-xs">
                {pendingTrips.length}
              </Badge>
            </TabsTrigger>
          )}
        </TabsList>

        {/* All Reports Tab */}
        <TabsContent value="all" className="space-y-4">
          {loading ? (
            <ReportsListSkeleton />
          ) : reports.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <FileText className="h-6 w-6" />
                    </EmptyMedia>
                    <EmptyTitle>No reports yet</EmptyTitle>
                    <EmptyDescription>
                      Reports will appear here once you create them for
                      completed trips
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => (
                <ReportCard key={report.report_id} report={report} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Pending Trips Tab */}
        <TabsContent value="pending" className="space-y-4">
          {pendingTrips.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <FileText className="h-6 w-6" />
                    </EmptyMedia>
                    <EmptyTitle>All caught up!</EmptyTitle>
                    <EmptyDescription>
                      All completed trips have reports
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {pendingTrips.map((trip) => (
                <PendingTripCard
                  key={trip.trip_id}
                  trip={trip}
                  onCreateReport={handleCreateReport}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Report Dialog */}
      <CreateReportDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        trip={selectedTrip}
        onSubmit={createReport}
      />
    </div>
  );
}

function ReportsListSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-32" />
                <div className="flex gap-2 mt-3">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
              <div className="flex gap-6">
                <div className="text-right space-y-1">
                  <Skeleton className="h-3 w-16 ml-auto" />
                  <Skeleton className="h-5 w-20" />
                </div>
                <div className="text-right space-y-1">
                  <Skeleton className="h-3 w-12 ml-auto" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4 pt-3 border-t">
              <Skeleton className="h-3 w-40" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
