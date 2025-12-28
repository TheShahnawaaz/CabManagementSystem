import { Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { DemandSummary } from "@/types/allocation.types";

interface DemandSummaryCardsProps {
  demandSummary: DemandSummary[];
}

export function DemandSummaryCards({ demandSummary }: DemandSummaryCardsProps) {
  const totalStudents = demandSummary.reduce((sum, d) => sum + d.count, 0);
  const cabsNeeded = Math.ceil(totalStudents / 7);

  return (
    <Card className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 mb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Demand Summary</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Hall-wise student bookings
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-sm px-3 py-1">
            <Users className="w-3 h-3 mr-1" />
            {totalStudents} students
          </Badge>
          <Badge variant="outline" className="text-sm px-3 py-1">
            ~{cabsNeeded} cabs needed
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {demandSummary.map((demand) => (
          <Card
            key={demand.hall}
            className="p-3 sm:p-4 border-2 hover:border-primary/50 transition-colors"
          >
            <h3 className="font-bold text-base sm:text-lg mb-2">
              {demand.hall}
            </h3>
            <div className="space-y-1 text-xs sm:text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Students:</span>
                <span className="font-bold text-primary">{demand.count}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Cabs:</span>
                <span className="font-medium">
                  {Math.ceil(demand.count / 7)}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Card>
  );
}
