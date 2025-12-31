/**
 * Pending Actions Card Component
 *
 * Shows items requiring admin attention
 */

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Calendar, Users } from "lucide-react";
import { Link } from "react-router-dom";

interface PendingActionsCardProps {
  pendingAllocations: number;
  upcomingTripsCount: number;
}

export function PendingActionsCard({
  pendingAllocations,
  upcomingTripsCount,
}: PendingActionsCardProps) {
  const hasPendingItems = pendingAllocations > 0 || upcomingTripsCount > 0;

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle className="h-5 w-5 text-orange-500" />
        <h2 className="text-lg font-semibold">Pending Actions</h2>
        {hasPendingItems && (
          <Badge variant="destructive" className="ml-auto">
            {pendingAllocations + upcomingTripsCount}
          </Badge>
        )}
      </div>

      {hasPendingItems ? (
        <div className="space-y-3">
          {pendingAllocations > 0 && (
            <Link to="/admin/trips">
              <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-500/10">
                    <Users className="h-4 w-4 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      Trips Awaiting Allocation
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Allocate cabs to students
                    </p>
                  </div>
                </div>
                <Badge variant="outline">{pendingAllocations}</Badge>
              </div>
            </Link>
          )}

          {upcomingTripsCount > 0 && (
            <Link to="/admin/trips">
              <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Calendar className="h-4 w-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Upcoming Trips</p>
                    <p className="text-xs text-muted-foreground">Next 7 days</p>
                  </div>
                </div>
                <Badge variant="outline">{upcomingTripsCount}</Badge>
              </div>
            </Link>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/10 mb-3">
            <AlertCircle className="h-6 w-6 text-green-500" />
          </div>
          <p className="text-sm font-medium">All caught up!</p>
          <p className="text-xs text-muted-foreground mt-1">
            No pending actions at the moment
          </p>
        </div>
      )}
    </Card>
  );
}
