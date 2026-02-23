import { SupabaseClient } from "@supabase/supabase-js";
import {
  DateRange,
  ReliabilityMetrics,
  TimeSeriesDataPoint,
  StatusIndicator,
} from "@/types/metrics";
import { format, eachDayOfInterval } from "date-fns";

export async function fetchReliabilityMetrics(
  client: SupabaseClient,
  dateRange: DateRange
): Promise<ReliabilityMetrics> {
  const fromStr = format(dateRange.from, "yyyy-MM-dd");
  const toStr = format(dateRange.to, "yyyy-MM-dd");

  // Fetch API logs for error rates and latency
  const { data: apiLogs } = await client
    .from("api_logs")
    .select("status_code, latency_ms, created_at")
    .gte("created_at", fromStr)
    .lte("created_at", toStr)
    .order("created_at", { ascending: true });

  const totalRequests = apiLogs?.length || 0;
  const errors = apiLogs?.filter((l) => l.status_code >= 400).length || 0;
  const errorRate = totalRequests > 0 ? (errors / totalRequests) * 100 : 0;
  const successRate = 100 - errorRate;

  // Calculate latency percentiles
  const latencies = (apiLogs?.map((l) => l.latency_ms) || []).sort(
    (a: number, b: number) => a - b
  );
  const p50 = percentile(latencies, 50);
  const p95 = percentile(latencies, 95);
  const p99 = percentile(latencies, 99);

  // Error trend
  const days = eachDayOfInterval({ start: dateRange.from, end: dateRange.to });
  const errorTrend: TimeSeriesDataPoint[] = days.map((day) => {
    const dayStr = format(day, "yyyy-MM-dd");
    const dayLogs = apiLogs?.filter((l) =>
      l.created_at?.startsWith(dayStr)
    );
    const dayErrors = dayLogs?.filter((l) => l.status_code >= 400).length || 0;
    const dayTotal = dayLogs?.length || 0;
    return {
      date: format(day, "MMM dd"),
      errorRate: dayTotal > 0 ? (dayErrors / dayTotal) * 100 : 0,
      errors: dayErrors,
    };
  });

  // Latency trend
  const latencyTrend: TimeSeriesDataPoint[] = days.map((day) => {
    const dayStr = format(day, "yyyy-MM-dd");
    const dayLatencies = (
      apiLogs
        ?.filter((l) => l.created_at?.startsWith(dayStr))
        .map((l) => l.latency_ms) || []
    ).sort((a: number, b: number) => a - b);
    return {
      date: format(day, "MMM dd"),
      p50: percentile(dayLatencies, 50),
      p95: percentile(dayLatencies, 95),
    };
  });

  // Status indicators
  const statusIndicators: StatusIndicator[] = [
    {
      label: "API Health",
      status: errorRate < 1 ? "healthy" : errorRate < 5 ? "warning" : "critical",
      detail: `${errorRate.toFixed(1)}% error rate`,
    },
    {
      label: "Latency",
      status: p95 < 500 ? "healthy" : p95 < 2000 ? "warning" : "critical",
      detail: `p95: ${Math.round(p95)}ms`,
    },
    {
      label: "Generation",
      status: successRate > 99 ? "healthy" : successRate > 95 ? "warning" : "critical",
      detail: `${successRate.toFixed(1)}% success`,
    },
  ];

  return {
    errorRate: Math.round(errorRate * 100) / 100,
    p50Latency: Math.round(p50),
    p95Latency: Math.round(p95),
    p99Latency: Math.round(p99),
    successRate: Math.round(successRate * 100) / 100,
    errorTrend,
    latencyTrend,
    statusIndicators,
  };
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}
