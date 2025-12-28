import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function TripStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {[...Array(4)].map((_, index) => (
        <Card key={index} className="p-4">
          <div className="flex items-center space-x-2">
            <Skeleton className="w-5 h-5 rounded" />
            <div className="flex-1">
              <Skeleton className="h-3 w-24 mb-2" />
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
