import type { StudentDemand } from "@/types/trip.types";

export type ChartType = "bar" | "line" | "area";
export type TrendMode = "interval" | "cumulative";
export type Granularity = "15m" | "30m" | "1h" | "2h" | "4h";

export type StudentDemandWithHall = StudentDemand & { hall: string };

export type TrendPoint = {
  bucketStart: number;
  bucket: string;
  label: string;
  intervalCount: number;
  cumulativeCount: number;
  hallCounts: Record<string, number>;
};

export type BookingTrendData = {
  bucketLabel: Granularity;
  maxCount: number;
  tickStep: number;
  points: TrendPoint[];
};
