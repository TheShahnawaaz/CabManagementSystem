import type { ChartConfig } from "@/components/ui/chart";
import type { Granularity } from "./types";

export const bookingTrendConfig = {
  intervalCount: {
    label: "Interval",
    color: "hsl(var(--chart-1))",
  },
  cumulativeCount: {
    label: "Cumulative",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export const GRANULARITY_MINUTES: Record<Granularity, number> = {
  "15m": 15,
  "30m": 30,
  "1h": 60,
  "2h": 120,
  "4h": 240,
};
