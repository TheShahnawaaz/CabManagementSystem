import { HALL_COLORS } from "../../hallColors";
import type { TrendPoint } from "../types";

export function DemandTrendTooltip({
  active,
  payload,
  halls,
}: {
  active?: boolean;
  payload?: Array<{ payload: TrendPoint }>;
  halls: string[];
}) {
  if (!active || !payload?.length) {
    return null;
  }

  const point = payload[0].payload;

  return (
    <div className="grid min-w-[12rem] items-start gap-2 rounded-lg border border-border/50 bg-background px-2.5 py-2 text-xs shadow-xl">
      <div className="font-medium">{point.bucket}</div>
      <div className="grid gap-1">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Interval</span>
          <span className="font-mono font-medium tabular-nums">
            {point.intervalCount}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Cumulative</span>
          <span className="font-mono font-medium tabular-nums">
            {point.cumulativeCount}
          </span>
        </div>
      </div>
      <div className="h-px bg-border/70" />
      <div className="grid gap-1">
        {halls.map((hall) => (
          <div key={hall} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span
                className={`h-2.5 w-2.5 rounded-[2px] ${HALL_COLORS[hall] || "bg-gray-500"}`}
              />
              <span className="text-muted-foreground">{hall}</span>
            </div>
            <span className="font-mono tabular-nums">{point.hallCounts[hall] || 0}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
