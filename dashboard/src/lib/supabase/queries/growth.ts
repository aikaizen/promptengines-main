import { SupabaseClient } from "@supabase/supabase-js";
import { DateRange, GrowthMetrics, TimeSeriesDataPoint } from "@/types/metrics";
import { format, eachDayOfInterval, subDays } from "date-fns";

export async function fetchGrowthMetrics(
  client: SupabaseClient,
  dateRange: DateRange
): Promise<GrowthMetrics> {
  // Fetch total users
  const { count: totalUsers } = await client
    .from("profiles")
    .select("*", { count: "exact", head: true });

  // Fetch new users today
  const today = format(new Date(), "yyyy-MM-dd");
  const { count: newUsersToday } = await client
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .gte("created_at", today);

  // DAU - unique users with activity today
  const { count: dau } = await client
    .from("user_activity")
    .select("user_id", { count: "exact", head: true })
    .gte("created_at", today);

  // WAU - unique users active in last 7 days
  const weekAgo = format(subDays(new Date(), 7), "yyyy-MM-dd");
  const { count: wau } = await client
    .from("user_activity")
    .select("user_id", { count: "exact", head: true })
    .gte("created_at", weekAgo);

  // MAU - unique users active in last 30 days
  const monthAgo = format(subDays(new Date(), 30), "yyyy-MM-dd");
  const { count: mau } = await client
    .from("user_activity")
    .select("user_id", { count: "exact", head: true })
    .gte("created_at", monthAgo);

  // DAU trend
  const days = eachDayOfInterval({ start: dateRange.from, end: dateRange.to });
  const dauTrend: TimeSeriesDataPoint[] = days.map((day) => ({
    date: format(day, "MMM dd"),
    dau: 0,
  }));

  // New users trend
  const newUsersTrend: TimeSeriesDataPoint[] = days.map((day) => ({
    date: format(day, "MMM dd"),
    newUsers: 0,
  }));

  const stickiness = mau && dau ? (dau / mau) * 100 : 0;

  return {
    totalUsers: totalUsers || 0,
    newUsersToday: newUsersToday || 0,
    dau: dau || 0,
    wau: wau || 0,
    mau: mau || 0,
    stickiness: Math.round(stickiness * 10) / 10,
    dauTrend,
    newUsersTrend,
    retentionCohorts: [],
  };
}

export async function fetchDauTrend(
  client: SupabaseClient,
  dateRange: DateRange
): Promise<TimeSeriesDataPoint[]> {
  const days = eachDayOfInterval({ start: dateRange.from, end: dateRange.to });

  const results: TimeSeriesDataPoint[] = [];
  for (const day of days) {
    const dayStr = format(day, "yyyy-MM-dd");
    const nextDay = format(subDays(day, -1), "yyyy-MM-dd");

    const { count } = await client
      .from("user_activity")
      .select("user_id", { count: "exact", head: true })
      .gte("created_at", dayStr)
      .lt("created_at", nextDay);

    results.push({
      date: format(day, "MMM dd"),
      dau: count || 0,
    });
  }

  return results;
}
