import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { bookingTrendConfig } from "../constants";
import { DemandTrendTooltip } from "./DemandTrendTooltip";
import type { BookingTrendData, ChartType, Granularity, TrendMode } from "../types";

type DemandTrendCardProps = {
  hallOptions: string[];
  selectedHall: string;
  chartType: ChartType;
  trendMode: TrendMode;
  granularity: Granularity;
  bookingTrend: BookingTrendData;
  onHallChange: (value: string) => void;
  onChartTypeChange: (value: ChartType) => void;
  onTrendModeChange: (value: TrendMode) => void;
  onGranularityChange: (value: Granularity) => void;
};

export function DemandTrendCard({
  hallOptions,
  selectedHall,
  chartType,
  trendMode,
  granularity,
  bookingTrend,
  onHallChange,
  onChartTypeChange,
  onTrendModeChange,
  onGranularityChange,
}: DemandTrendCardProps) {
  const chartMetricKey =
    trendMode === "interval" ? "intervalCount" : "cumulativeCount";

  const chartContent = useMemo(() => {
    const chartProps = {
      accessibilityLayer: true,
      data: bookingTrend.points,
      margin: { top: 8, right: 8, left: 8, bottom: 8 },
    };

    const xAxis = (
      <XAxis
        dataKey="label"
        tickLine={false}
        axisLine={false}
        tickMargin={10}
        minTickGap={18}
        tickFormatter={(value, index) =>
          index % bookingTrend.tickStep === 0 ? String(value) : ""
        }
      />
    );

    const yAxis = (
      <YAxis
        allowDecimals={false}
        tickLine={false}
        axisLine={false}
        width={28}
      />
    );

    const tooltip = (
      <ChartTooltip
        cursor={false}
        content={<DemandTrendTooltip halls={hallOptions} />}
      />
    );

    if (chartType === "line") {
      return (
        <LineChart {...chartProps}>
          <CartesianGrid vertical={false} />
          {xAxis}
          {yAxis}
          {tooltip}
          <Line
            type="monotone"
            dataKey={chartMetricKey}
            stroke={`var(--color-${chartMetricKey})`}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      );
    }

    if (chartType === "area") {
      return (
        <AreaChart {...chartProps}>
          <CartesianGrid vertical={false} />
          {xAxis}
          {yAxis}
          {tooltip}
          <Area
            type="monotone"
            dataKey={chartMetricKey}
            stroke={`var(--color-${chartMetricKey})`}
            fill={`var(--color-${chartMetricKey})`}
            fillOpacity={0.22}
          />
        </AreaChart>
      );
    }

    return (
      <BarChart {...chartProps}>
        <CartesianGrid vertical={false} />
        {xAxis}
        {yAxis}
        {tooltip}
        <Bar
          dataKey={chartMetricKey}
          fill={`var(--color-${chartMetricKey})`}
          radius={[6, 6, 0, 0]}
        />
      </BarChart>
    );
  }, [bookingTrend.points, bookingTrend.tickStep, chartMetricKey, chartType, hallOptions]);

  return (
    <Card className="rounded-lg border p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">Booking Trend</h3>
          <p className="text-sm text-muted-foreground">
            Time vs bookings ({bookingTrend.bucketLabel} buckets)
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={selectedHall} onValueChange={onHallChange}>
            <SelectTrigger className="h-8 w-[120px]">
              <SelectValue placeholder="Hall" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All halls</SelectItem>
              {hallOptions.map((hall) => (
                <SelectItem key={hall} value={hall}>
                  {hall}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={chartType}
            onValueChange={(value) => onChartTypeChange(value as ChartType)}
          >
            <SelectTrigger className="h-8 w-[108px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bar">Bar</SelectItem>
              <SelectItem value="line">Line</SelectItem>
              <SelectItem value="area">Area</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={trendMode}
            onValueChange={(value) => onTrendModeChange(value as TrendMode)}
          >
            <SelectTrigger className="h-8 w-[120px]">
              <SelectValue placeholder="Mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="interval">Interval</SelectItem>
              <SelectItem value="cumulative">Cumulative</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={granularity}
            onValueChange={(value) => onGranularityChange(value as Granularity)}
          >
            <SelectTrigger className="h-8 w-[96px]">
              <SelectValue placeholder="Bucket" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15m">15m</SelectItem>
              <SelectItem value="30m">30m</SelectItem>
              <SelectItem value="1h">1h</SelectItem>
              <SelectItem value="2h">2h</SelectItem>
              <SelectItem value="4h">4h</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {bookingTrend.points.length > 0 ? (
        <ChartContainer config={bookingTrendConfig} className="h-[280px] w-full">
          {chartContent}
        </ChartContainer>
      ) : (
        <p className="text-sm text-muted-foreground">
          No booking time data available yet.
        </p>
      )}
    </Card>
  );
}
