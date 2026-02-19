import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function DemandTabSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-36 rounded-md" />
      </div>

      <Skeleton className="h-10 w-80 rounded-lg" />

      <Card className="rounded-lg border p-4">
        <Skeleton className="h-5 w-56 mb-4" />
        <Skeleton className="h-40 w-full" />
      </Card>

      <Card className="rounded-lg border overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div key={i}>
            <div className="flex items-center gap-4 p-4">
              <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-56" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-6 w-20 rounded-md" />
            </div>
            {i !== 4 && <div className="border-t" />}
          </div>
        ))}
      </Card>
    </div>
  );
}
