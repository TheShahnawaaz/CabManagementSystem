import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function BookingCardSkeleton() {
  return (
    <Card className="p-6">
      {/* Status Badges */}
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>

      {/* Trip Title */}
      <Skeleton className="h-7 w-3/4 mb-2" />

      {/* Trip Date */}
      <div className="flex items-start gap-2 mb-3">
        <Skeleton className="h-4 w-4 rounded mt-0.5" />
        <Skeleton className="h-4 w-48" />
      </div>

      {/* Departure Time */}
      <div className="flex items-start gap-2 mb-3">
        <Skeleton className="h-4 w-4 rounded mt-0.5" />
        <Skeleton className="h-4 w-56" />
      </div>

      {/* Amount Paid */}
      <div className="flex items-start gap-2 mb-4">
        <Skeleton className="h-4 w-4 rounded mt-0.5" />
        <Skeleton className="h-4 w-32" />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mb-4">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 flex-1" />
      </div>

      {/* Timeline Section - Full Width Separator */}
      <div className="-mx-6 border-t my-4" />

      {/* Timeline Skeleton */}
      <div className="space-y-3">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="relative flex gap-3">
            {/* Icon */}
            <Skeleton className="w-6 h-6 rounded-full flex-shrink-0" />
            {/* Content */}
            <div className="flex-1 pb-4 pt-0.5">
              <div className="flex items-baseline justify-between gap-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Payment ID Footer - Full Width Divider */}
      <div className="-mx-6 border-t px-6 pt-3 mt-4">
        <Skeleton className="h-4 w-48" />
      </div>
    </Card>
  );
}
