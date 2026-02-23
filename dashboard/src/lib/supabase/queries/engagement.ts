import { SupabaseClient } from "@supabase/supabase-js";
import { DateRange, EngagementMetrics, TimeSeriesDataPoint } from "@/types/metrics";
import { format, eachDayOfInterval } from "date-fns";

export async function fetchEngagementMetrics(
  client: SupabaseClient,
  dateRange: DateRange
): Promise<EngagementMetrics> {
  const fromStr = format(dateRange.from, "yyyy-MM-dd");
  const toStr = format(dateRange.to, "yyyy-MM-dd");

  // Fetch sessions in range
  const { data: sessions } = await client
    .from("sessions")
    .select("duration, user_id, created_at")
    .gte("created_at", fromStr)
    .lte("created_at", toStr);

  const totalSessions = sessions?.length || 0;
  const avgSessionDuration =
    totalSessions > 0
      ? (sessions?.reduce((sum, s) => sum + (s.duration || 0), 0) || 0) /
        totalSessions
      : 0;

  // Unique users with sessions
  const uniqueUsers = new Set(sessions?.map((s) => s.user_id)).size;
  const sessionsPerUser = uniqueUsers > 0 ? totalSessions / uniqueUsers : 0;

  // Fetch user actions
  const { count: totalActions } = await client
    .from("user_actions")
    .select("*", { count: "exact", head: true })
    .gte("created_at", fromStr)
    .lte("created_at", toStr);

  const actionsPerSession =
    totalSessions > 0 ? (totalActions || 0) / totalSessions : 0;

  // Activation rate (users who completed onboarding / total signups)
  const { count: activatedUsers } = await client
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("onboarding_complete", true)
    .gte("created_at", fromStr)
    .lte("created_at", toStr);

  const { count: totalSignups } = await client
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .gte("created_at", fromStr)
    .lte("created_at", toStr);

  const activationRate =
    totalSignups && totalSignups > 0
      ? ((activatedUsers || 0) / totalSignups) * 100
      : 0;

  // Session trend
  const days = eachDayOfInterval({ start: dateRange.from, end: dateRange.to });
  const sessionTrend: TimeSeriesDataPoint[] = days.map((day) => {
    const dayStr = format(day, "yyyy-MM-dd");
    const daySessions =
      sessions?.filter((s) => s.created_at?.startsWith(dayStr)).length || 0;
    return {
      date: format(day, "MMM dd"),
      sessions: daySessions,
    };
  });

  return {
    avgSessionDuration: Math.round(avgSessionDuration),
    sessionsPerUser: Math.round(sessionsPerUser * 10) / 10,
    actionsPerSession: Math.round(actionsPerSession * 10) / 10,
    activationRate: Math.round(activationRate * 10) / 10,
    topFeatures: [],
    sessionTrend,
  };
}
