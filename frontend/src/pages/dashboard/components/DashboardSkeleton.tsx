/**
 * Dashboard Skeleton Component
 *
 * Loading skeleton for dashboard data sections
 * Note: Header (user info) is not included as it's already loaded
 *
 * We show the stats skeleton even though we don't know if the user is new yet,
 * because we need to fetch bookings data to determine that.
 */

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard, StatCardGrid } from "@/components/ui/stat-card";

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Stats Skeleton - Always show while loading */}
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

      {/* Main Content Skeleton - Generic card grid */}
      <div>
        <Skeleton className="h-8 w-48 mb-4" /> {/* Section title */}
        <Skeleton className="h-5 w-96 mb-6" /> {/* Section description */}
        {/* Card Grid Skeleton (works for all cases: bookings, active trips, upcoming trips) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-6">
              <div className="space-y-4">
                {/* Card header */}
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>

                {/* Card content */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>

                {/* Card footer/actions */}
                <div className="pt-2 border-t">
                  <Skeleton className="h-9 w-full" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Actions Skeleton */}
      <div>
        <Skeleton className="h-8 w-40 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <Card key={i} className="p-6">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-5 w-5 rounded-full" />
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* How It Works Skeleton */}
      <div>
        <Skeleton className="h-8 w-40 mb-6" />
        <Card className="p-6">
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-3 border-b last:border-0"
              >
                <Skeleton className="h-5 w-64" />
                <Skeleton className="h-4 w-4" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
