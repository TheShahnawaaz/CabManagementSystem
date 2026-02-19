import { format } from "date-fns";
import type { HallDemand } from "@/types/trip.types";
import { GRANULARITY_MINUTES } from "./constants";
import type {
  BookingTrendData,
  Granularity,
  StudentDemandWithHall,
  TrendMode,
  TrendPoint,
} from "./types";

function toTime(dateString: string): number {
  return new Date(dateString).getTime();
}

export function sortDemandsByNewest(demands: HallDemand[]): HallDemand[] {
  return demands.map((demand) => ({
    ...demand,
    students: [...demand.students].sort(
      (a, b) => toTime(b.created_at) - toTime(a.created_at)
    ),
  }));
}

export function flattenStudentsByNewest(
  demands: HallDemand[]
): StudentDemandWithHall[] {
  return demands
    .flatMap((demand) =>
      demand.students.map((student) => ({
        ...student,
        hall: demand.hall,
      }))
    )
    .sort((a, b) => toTime(b.created_at) - toTime(a.created_at));
}

export function buildBookingTrend(
  students: StudentDemandWithHall[],
  granularity: Granularity,
  trendMode: TrendMode,
  hallOptions: string[]
): BookingTrendData {
  const emptyState: BookingTrendData = {
    bucketLabel: granularity,
    maxCount: 0,
    tickStep: 1,
    points: [],
  };

  if (students.length === 0) {
    return emptyState;
  }

  const parsedStudents = students
    .map((student) => ({
      hall: student.hall,
      timestamp: toTime(student.created_at),
    }))
    .filter((entry) => !Number.isNaN(entry.timestamp))
    .sort((a, b) => a.timestamp - b.timestamp);

  if (parsedStudents.length === 0) {
    return emptyState;
  }

  const bucketMinutes = GRANULARITY_MINUTES[granularity];
  const bucketMs = bucketMinutes * 60_000;

  const counts = new Map<number, number>();
  const hallBucketCounts = new Map<number, Record<string, number>>();

  parsedStudents.forEach(({ timestamp, hall }) => {
    const bucketStart = Math.floor(timestamp / bucketMs) * bucketMs;
    counts.set(bucketStart, (counts.get(bucketStart) || 0) + 1);

    const existing = hallBucketCounts.get(bucketStart) || {};
    existing[hall] = (existing[hall] || 0) + 1;
    hallBucketCounts.set(bucketStart, existing);
  });

  const minBucket = Math.floor(parsedStudents[0].timestamp / bucketMs) * bucketMs;
  const maxBucket =
    Math.floor(parsedStudents[parsedStudents.length - 1].timestamp / bucketMs) *
    bucketMs;

  let runningTotal = 0;
  const points: TrendPoint[] = [];

  for (
    let bucketStart = minBucket;
    bucketStart <= maxBucket;
    bucketStart += bucketMs
  ) {
    const intervalCount = counts.get(bucketStart) || 0;
    runningTotal += intervalCount;

    const startDate = new Date(bucketStart);
    const endDate = new Date(bucketStart + bucketMs);
    const hallCountsRaw = hallBucketCounts.get(bucketStart) || {};
    const hallCounts = hallOptions.reduce((acc, hall) => {
      acc[hall] = hallCountsRaw[hall] || 0;
      return acc;
    }, {} as Record<string, number>);

    points.push({
      bucketStart,
      bucket: format(startDate, "dd MMM, HH:mm"),
      label:
        bucketMinutes < 60
          ? format(startDate, "HH:mm")
          : `${format(startDate, "HH:mm")}-${format(endDate, "HH:mm")}`,
      intervalCount,
      cumulativeCount: runningTotal,
      hallCounts,
    });
  }

  const metricKey = trendMode === "interval" ? "intervalCount" : "cumulativeCount";
  return {
    bucketLabel: granularity,
    maxCount: Math.max(...points.map((point) => point[metricKey])),
    tickStep: Math.max(1, Math.ceil(points.length / 8)),
    points,
  };
}
