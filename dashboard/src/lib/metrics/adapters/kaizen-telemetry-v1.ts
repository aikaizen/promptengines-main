import { addDays, eachDayOfInterval, format } from "date-fns";
import { MetricsAdapter } from "@/lib/metrics/adapters/types";
import { AppConfig, TelemetryIdentityField } from "@/types/apps";
import {
  CohortData,
  EngagementMetrics,
  FinanceMetrics,
  GrowthMetrics,
  ReliabilityMetrics,
  StatusIndicator,
  TimeSeriesDataPoint,
  UnitEconomics,
  UserAction,
  UserDetail,
  UserPayment,
  UserSummary,
} from "@/types/metrics";

type EventFactRow = {
  event_id: string;
  occurred_at: string;
  account_id: string | null;
  user_id: string | null;
  event_name: string;
  properties: Record<string, unknown> | null;
};

type AiUsageRow = {
  event_id: string | null;
  occurred_at: string;
  account_id: string | null;
  user_id: string | null;
  estimated_cost_usd: number | null;
  latency_ms: number | null;
  status: string | null;
};

type DailyKpiRow = {
  kpi_date: string;
  metrics: Record<string, unknown> | null;
};

type RetentionCohortRow = {
  cohort_date: string;
  cohort_size: number | null;
  retained_d1: number | null;
  retained_d7: number | null;
  retained_d30: number | null;
};

type AccountRow = {
  id: string;
  email: string | null;
  name: string | null;
  created_at: string;
};

const ACTION_EVENTS = new Set([
  "mode.changed",
  "history.viewed",
  "favorites.added",
  "favorites.removed",
  "ui.action",
  "generation.started",
  "generation.succeeded",
  "generation.failed",
  "user.pin.verify.success",
]);

const RETENTION_ACTIVITY_EVENTS = new Set([
  "auth.login.success",
  "generation.started",
  "generation.succeeded",
  "history.viewed",
  "favorites.added",
  "credits.spent",
  "purchase.completed",
  "user.pin.verify.success",
]);

function toNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
}

function toProperties(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(index, sorted.length - 1))];
}

function dayKey(iso: string): string {
  return iso.slice(0, 10);
}

function rangeBounds(from: Date, to: Date) {
  const fromDate = format(from, "yyyy-MM-dd");
  const toDate = format(to, "yyyy-MM-dd");
  const toExclusiveDate = format(addDays(to, 1), "yyyy-MM-dd");
  return {
    fromDate,
    toDate,
    fromIso: `${fromDate}T00:00:00.000Z`,
    toIsoExclusive: `${toExclusiveDate}T00:00:00.000Z`,
  };
}

function initializeDailyMap(dateRange: { from: Date; to: Date }) {
  const days = eachDayOfInterval({ start: dateRange.from, end: dateRange.to });
  const map = new Map<string, string>();
  for (const day of days) {
    const key = format(day, "yyyy-MM-dd");
    map.set(key, format(day, "MMM dd"));
  }
  return map;
}

function growthIdentityField(app: AppConfig): TelemetryIdentityField {
  return app.telemetryGrowth?.identityField ?? "account_id";
}

function growthSignupEvent(app: AppConfig): string {
  return app.telemetryGrowth?.signupEventName ?? "auth.account.created";
}

function growthActivityEvent(app: AppConfig): string {
  return app.telemetryGrowth?.activityEventName ?? "auth.login.success";
}

function actorId(
  row: { account_id: string | null; user_id: string | null },
  field: TelemetryIdentityField
): string | null {
  return field === "user_id" ? row.user_id : row.account_id;
}

function distinctActorCount(
  rows: Array<{ account_id: string | null; user_id: string | null }> | null | undefined,
  field: TelemetryIdentityField
): number {
  return new Set(
    (rows ?? [])
      .map((row) => actorId(row, field))
      .filter((id): id is string => Boolean(id))
  ).size;
}

function humanizeEvent(eventName: string): string {
  return eventName
    .split(".")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function computeFunnelStage(allEvents: EventFactRow[]): UserSummary["funnelStage"] {
  const hasOnboarded = allEvents.some((event) => event.event_name === "user.created");
  const firstGeneration = allEvents.find((event) => event.event_name === "generation.succeeded");
  const purchaseEvents = allEvents
    .filter((event) => event.event_name === "purchase.completed")
    .sort((a, b) => a.occurred_at.localeCompare(b.occurred_at));

  if (purchaseEvents.length > 0) {
    const firstPurchaseAt = new Date(purchaseEvents[0].occurred_at).getTime();
    const retained = allEvents.some((event) => {
      if (!RETENTION_ACTIVITY_EVENTS.has(event.event_name)) return false;
      const eventTime = new Date(event.occurred_at).getTime();
      return eventTime >= firstPurchaseAt + 7 * 24 * 60 * 60 * 1000;
    });
    if (retained) return "retained";
    return "purchased";
  }

  if (firstGeneration) return "first_gen";
  if (hasOnboarded) return "onboarded";
  return "signed_up";
}

function sumPurchaseRevenue(events: EventFactRow[]): number {
  return events
    .filter((event) => event.event_name === "purchase.completed")
    .reduce((total, event) => total + toNumber(toProperties(event.properties).amount_usd), 0);
}

function sumCreditsPurchased(events: EventFactRow[]): number {
  return events
    .filter((event) => event.event_name === "credits.purchased")
    .reduce((total, event) => total + toNumber(toProperties(event.properties).amount), 0);
}

function sumCreditsSpent(events: EventFactRow[]): number {
  return events
    .filter((event) => event.event_name === "credits.spent")
    .reduce((total, event) => total + toNumber(toProperties(event.properties).amount), 0);
}

function sumUsageCost(rows: AiUsageRow[]): number {
  return rows
    .filter((row) => row.status === "success")
    .reduce((total, row) => total + toNumber(row.estimated_cost_usd), 0);
}

function averageSessionDurationSeconds(events: EventFactRow[]): number {
  const endedSessions = events.filter((event) => event.event_name === "session.ended");
  if (endedSessions.length === 0) return 0;

  const totalSeconds = endedSessions.reduce((sum, event) => {
    const props = toProperties(event.properties);
    const durationMs = toNumber(props.duration_ms);
    return sum + durationMs / 1000;
  }, 0);

  return totalSeconds / endedSessions.length;
}

function buildStatusIndicators(errorRate: number, successRate: number, p95: number): StatusIndicator[] {
  return [
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
}

export const kaizenTelemetryV1Adapter: MetricsAdapter = {
  id: "kaizen-telemetry-v1",

  async fetchGrowth({ app, client, dateRange }): Promise<GrowthMetrics> {
    const range = rangeBounds(dateRange.from, dateRange.to);
    const today = rangeBounds(new Date(), new Date()).fromIso;
    const identityField = growthIdentityField(app);
    const signupEventName = growthSignupEvent(app);
    const activityEventName = growthActivityEvent(app);

    const wauStart = `${format(addDays(new Date(), -6), "yyyy-MM-dd")}T00:00:00.000Z`;
    const mauStart = `${format(addDays(new Date(), -29), "yyyy-MM-dd")}T00:00:00.000Z`;

    const [
      totalUsersRows,
      newUsersTodayRows,
      dauRows,
      wauRows,
      mauRows,
      kpiRowsResult,
      newUserEventsResult,
      retentionRowsResult,
    ] = await Promise.all([
      client
        .from("event_facts")
        .select("account_id,user_id")
        .eq("app_id", app.id)
        .eq("event_name", signupEventName)
        .not(identityField, "is", null)
        .lt("occurred_at", range.toIsoExclusive),
      client
        .from("event_facts")
        .select("account_id,user_id")
        .eq("app_id", app.id)
        .eq("event_name", signupEventName)
        .not(identityField, "is", null)
        .gte("occurred_at", today),
      client
        .from("event_facts")
        .select("account_id,user_id")
        .eq("app_id", app.id)
        .eq("event_name", activityEventName)
        .not(identityField, "is", null)
        .gte("occurred_at", today),
      client
        .from("event_facts")
        .select("account_id,user_id")
        .eq("app_id", app.id)
        .eq("event_name", activityEventName)
        .not(identityField, "is", null)
        .gte("occurred_at", wauStart),
      client
        .from("event_facts")
        .select("account_id,user_id")
        .eq("app_id", app.id)
        .eq("event_name", activityEventName)
        .not(identityField, "is", null)
        .gte("occurred_at", mauStart),
      client
        .from("daily_kpis")
        .select("kpi_date,metrics")
        .eq("app_id", app.id)
        .gte("kpi_date", range.fromDate)
        .lte("kpi_date", range.toDate),
      client
        .from("event_facts")
        .select("account_id,user_id,occurred_at")
        .eq("app_id", app.id)
        .eq("event_name", signupEventName)
        .not(identityField, "is", null)
        .gte("occurred_at", range.fromIso)
        .lt("occurred_at", range.toIsoExclusive),
      client
        .from("retention_cohorts")
        .select("cohort_date,cohort_size,retained_d1,retained_d7,retained_d30")
        .eq("app_id", app.id)
        .gte("cohort_date", range.fromDate)
        .lte("cohort_date", range.toDate)
        .order("cohort_date", { ascending: true }),
    ]);

    const totalUsers = distinctActorCount(
      totalUsersRows.data as Array<{ account_id: string | null; user_id: string | null }> | null,
      identityField
    );
    const newUsersToday = distinctActorCount(
      newUsersTodayRows.data as Array<{ account_id: string | null; user_id: string | null }> | null,
      identityField
    );
    const dau = distinctActorCount(
      dauRows.data as Array<{ account_id: string | null; user_id: string | null }> | null,
      identityField
    );
    const wau = distinctActorCount(
      wauRows.data as Array<{ account_id: string | null; user_id: string | null }> | null,
      identityField
    );
    const mau = distinctActorCount(
      mauRows.data as Array<{ account_id: string | null; user_id: string | null }> | null,
      identityField
    );

    const dayLabels = initializeDailyMap(dateRange);
    const dauSeries = new Map<string, { dau: number; wau: number; mau: number }>();
    const newUsersSeries = new Map<string, number>();

    for (const key of dayLabels.keys()) {
      dauSeries.set(key, { dau: 0, wau: 0, mau: 0 });
      newUsersSeries.set(key, 0);
    }

    for (const row of (kpiRowsResult.data ?? []) as DailyKpiRow[]) {
      const key = row.kpi_date;
      const metrics = toProperties(row.metrics);
      if (!dauSeries.has(key)) continue;
      const current = dauSeries.get(key)!;
      dauSeries.set(key, {
        dau: current.dau + toNumber(metrics.dau_accounts),
        wau: current.wau + toNumber(metrics.wau_accounts),
        mau: current.mau + toNumber(metrics.mau_accounts),
      });
    }

    const newUsersByDay = new Map<string, Set<string>>();
    for (const key of dayLabels.keys()) {
      newUsersByDay.set(key, new Set<string>());
    }

    for (const event of (newUserEventsResult.data ?? []) as Array<{
      account_id: string | null;
      user_id: string | null;
      occurred_at: string;
    }>) {
      const key = dayKey(event.occurred_at);
      if (!newUsersSeries.has(key)) continue;
      const actor = actorId(event, identityField);
      if (!actor) continue;
      newUsersByDay.get(key)?.add(actor);
    }

    for (const [key, users] of newUsersByDay.entries()) {
      if (!newUsersSeries.has(key)) continue;
      newUsersSeries.set(key, users.size);
    }

    const dauTrend: TimeSeriesDataPoint[] = Array.from(dayLabels.entries()).map(([key, label]) => {
      const value = dauSeries.get(key) ?? { dau: 0, wau: 0, mau: 0 };
      return {
        date: label,
        dau: value.dau,
        wau: value.wau,
        mau: value.mau,
      };
    });

    const newUsersTrend: TimeSeriesDataPoint[] = Array.from(dayLabels.entries()).map(([key, label]) => ({
      date: label,
      newUsers: newUsersSeries.get(key) ?? 0,
    }));

    const retentionCohorts: CohortData[] = ((retentionRowsResult.data ?? []) as RetentionCohortRow[]).map((row) => {
      const cohortSize = toNumber(row.cohort_size);
      const percent = (value: number) => (cohortSize > 0 ? Math.round((value / cohortSize) * 1000) / 10 : 0);
      return {
        cohort: row.cohort_date,
        D1: percent(toNumber(row.retained_d1)),
        D3: 0,
        D7: percent(toNumber(row.retained_d7)),
        D14: 0,
        D30: percent(toNumber(row.retained_d30)),
      };
    });

    return {
      totalUsers,
      newUsersToday,
      dau,
      wau,
      mau,
      stickiness: mau > 0 ? Math.round((dau / mau) * 1000) / 10 : 0,
      dauTrend,
      newUsersTrend,
      retentionCohorts,
    };
  },

  async fetchFinance({ app, client, dateRange }): Promise<FinanceMetrics> {
    const range = rangeBounds(dateRange.from, dateRange.to);

    const [eventResult, usageResult, kpiResult] = await Promise.all([
      client
        .from("event_facts")
        .select("occurred_at,event_name,properties")
        .eq("app_id", app.id)
        .in("event_name", ["purchase.completed", "credits.purchased", "credits.spent"])
        .gte("occurred_at", range.fromIso)
        .lt("occurred_at", range.toIsoExclusive),
      client
        .from("ai_usage_facts")
        .select("occurred_at,estimated_cost_usd,status")
        .eq("app_id", app.id)
        .gte("occurred_at", range.fromIso)
        .lt("occurred_at", range.toIsoExclusive),
      client
        .from("daily_kpis")
        .select("kpi_date,metrics")
        .eq("app_id", app.id)
        .gte("kpi_date", range.fromDate)
        .lte("kpi_date", range.toDate),
    ]);

    const events = (eventResult.data ?? []) as EventFactRow[];
    const usageRows = (usageResult.data ?? []) as AiUsageRow[];
    const kpiRows = (kpiResult.data ?? []) as DailyKpiRow[];

    const totalRevenue = sumPurchaseRevenue(events);
    const creditsPurchased = sumCreditsPurchased(events);
    const creditsSpent = sumCreditsSpent(events);
    const apiCogs = sumUsageCost(usageRows);

    const margin = totalRevenue > 0 ? ((totalRevenue - apiCogs) / totalRevenue) * 100 : 0;

    const dayLabels = initializeDailyMap(dateRange);
    const eventRevenueByDay = new Map<string, number>();
    const usageCogsByDay = new Map<string, number>();
    const kpiRevenueByDay = new Map<string, number>();
    const kpiCogsByDay = new Map<string, number>();

    for (const key of dayLabels.keys()) {
      eventRevenueByDay.set(key, 0);
      usageCogsByDay.set(key, 0);
      kpiRevenueByDay.set(key, 0);
      kpiCogsByDay.set(key, 0);
    }

    for (const event of events) {
      const key = dayKey(event.occurred_at);
      if (event.event_name === "purchase.completed" && eventRevenueByDay.has(key)) {
        eventRevenueByDay.set(key, (eventRevenueByDay.get(key) ?? 0) + toNumber(toProperties(event.properties).amount_usd));
      }
    }

    for (const usage of usageRows) {
      const key = dayKey(usage.occurred_at);
      if (usage.status === "success" && usageCogsByDay.has(key)) {
        usageCogsByDay.set(key, (usageCogsByDay.get(key) ?? 0) + toNumber(usage.estimated_cost_usd));
      }
    }

    for (const row of kpiRows) {
      if (!kpiRevenueByDay.has(row.kpi_date)) continue;
      const metrics = toProperties(row.metrics);
      kpiRevenueByDay.set(row.kpi_date, (kpiRevenueByDay.get(row.kpi_date) ?? 0) + toNumber(metrics.realized_revenue_usd));
      kpiCogsByDay.set(row.kpi_date, (kpiCogsByDay.get(row.kpi_date) ?? 0) + toNumber(metrics.estimated_cogs_usd));
    }

    const revenueTrend: TimeSeriesDataPoint[] = Array.from(dayLabels.entries()).map(([key, label]) => ({
      date: label,
      revenue: kpiRevenueByDay.get(key)
        ? (kpiRevenueByDay.get(key) ?? 0)
        : (eventRevenueByDay.get(key) ?? 0),
    }));

    const cogsTrend: TimeSeriesDataPoint[] = Array.from(dayLabels.entries()).map(([key, label]) => ({
      date: label,
      cogs: kpiCogsByDay.get(key)
        ? (kpiCogsByDay.get(key) ?? 0)
        : (usageCogsByDay.get(key) ?? 0),
    }));

    return {
      totalRevenue,
      monthlyRevenue: totalRevenue,
      creditsPurchased,
      creditsSpent,
      cogs: apiCogs,
      margin: Math.round(margin * 10) / 10,
      revenueTrend,
      cogsTrend,
      revenueByApp: [],
      revenueBySource: {
        credits: totalRevenue,
        productSales: 0,
        subscriptions: 0,
        other: 0,
      },
      costBreakdown: {
        api: apiCogs,
        printing: 0,
        shipping: 0,
        other: 0,
      },
    };
  },

  async fetchEngagement({ app, client, dateRange }): Promise<EngagementMetrics> {
    const range = rangeBounds(dateRange.from, dateRange.to);

    const { data } = await client
      .from("event_facts")
      .select("occurred_at,event_name,properties,account_id")
      .eq("app_id", app.id)
      .in("event_name", [
        "auth.account.created",
        "session.started",
        "session.ended",
        "mode.changed",
        "history.viewed",
        "favorites.added",
        "favorites.removed",
        "ui.action",
        "generation.started",
        "generation.succeeded",
        "generation.failed",
      ])
      .gte("occurred_at", range.fromIso)
      .lt("occurred_at", range.toIsoExclusive);

    const events = (data ?? []) as EventFactRow[];
    const sessionStarts = events.filter((event) => event.event_name === "session.started");
    const uniqueSessionAccounts = new Set(
      sessionStarts.map((event) => event.account_id).filter((id): id is string => Boolean(id))
    );

    const actionCount = events.filter((event) => ACTION_EVENTS.has(event.event_name)).length;
    const avgSessionDuration = averageSessionDurationSeconds(events);
    const sessionsPerUser = uniqueSessionAccounts.size > 0 ? sessionStarts.length / uniqueSessionAccounts.size : 0;
    const actionsPerSession = sessionStarts.length > 0 ? actionCount / sessionStarts.length : 0;

    const signups = events.filter((event) => event.event_name === "auth.account.created");
    const generationSuccess = events.filter((event) => event.event_name === "generation.succeeded");

    let activated = 0;
    for (const signup of signups) {
      const signupAccount = signup.account_id;
      if (!signupAccount) continue;
      const signupTime = new Date(signup.occurred_at).getTime();
      const activationWindowEnd = signupTime + 7 * 24 * 60 * 60 * 1000;
      const hasActivation = generationSuccess.some((event) => {
        if (event.account_id !== signupAccount) return false;
        const eventTime = new Date(event.occurred_at).getTime();
        return eventTime >= signupTime && eventTime <= activationWindowEnd;
      });
      if (hasActivation) activated += 1;
    }

    const dayLabels = initializeDailyMap(dateRange);
    const sessionsByDay = new Map<string, number>();
    for (const key of dayLabels.keys()) sessionsByDay.set(key, 0);

    for (const session of sessionStarts) {
      const key = dayKey(session.occurred_at);
      if (!sessionsByDay.has(key)) continue;
      sessionsByDay.set(key, (sessionsByDay.get(key) ?? 0) + 1);
    }

    const sessionTrend: TimeSeriesDataPoint[] = Array.from(dayLabels.entries()).map(([key, label]) => ({
      date: label,
      sessions: sessionsByDay.get(key) ?? 0,
    }));

    const featureUsageMap = new Map<string, number>();
    for (const event of events) {
      if (!ACTION_EVENTS.has(event.event_name)) continue;
      const props = toProperties(event.properties);
      const featureKey =
        event.event_name === "mode.changed"
          ? `Mode: ${String(props.to_tab || "unknown")}`
          : humanizeEvent(event.event_name);
      featureUsageMap.set(featureKey, (featureUsageMap.get(featureKey) ?? 0) + 1);
    }

    const topFeatures = Array.from(featureUsageMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([feature, usage]) => ({ feature, usage }));

    return {
      avgSessionDuration: Math.round(avgSessionDuration),
      sessionsPerUser: Math.round(sessionsPerUser * 10) / 10,
      actionsPerSession: Math.round(actionsPerSession * 10) / 10,
      activationRate: signups.length > 0 ? Math.round((activated / signups.length) * 1000) / 10 : 0,
      topFeatures,
      sessionTrend,
    };
  },

  async fetchReliability({ app, client, dateRange }): Promise<ReliabilityMetrics> {
    const range = rangeBounds(dateRange.from, dateRange.to);

    const { data } = await client
      .from("ai_usage_facts")
      .select("occurred_at,latency_ms,status")
      .eq("app_id", app.id)
      .gte("occurred_at", range.fromIso)
      .lt("occurred_at", range.toIsoExclusive)
      .order("occurred_at", { ascending: true });

    const rows = (data ?? []) as AiUsageRow[];
    const totalRequests = rows.length;
    const errors = rows.filter((row) => row.status !== "success").length;
    const errorRate = totalRequests > 0 ? (errors / totalRequests) * 100 : 0;
    const successRate = 100 - errorRate;

    const latencies = rows
      .map((row) => toNumber(row.latency_ms))
      .filter((value) => Number.isFinite(value) && value >= 0);

    const p50 = percentile(latencies, 50);
    const p95 = percentile(latencies, 95);
    const p99 = percentile(latencies, 99);

    const dayLabels = initializeDailyMap(dateRange);
    const errorTrend: TimeSeriesDataPoint[] = [];
    const latencyTrend: TimeSeriesDataPoint[] = [];

    for (const [key, label] of dayLabels.entries()) {
      const dayRows = rows.filter((row) => row.occurred_at.startsWith(key));
      const dayErrors = dayRows.filter((row) => row.status !== "success").length;
      const dayTotal = dayRows.length;
      const dayLatencies = dayRows
        .map((row) => toNumber(row.latency_ms))
        .filter((value) => Number.isFinite(value) && value >= 0);

      errorTrend.push({
        date: label,
        errorRate: dayTotal > 0 ? (dayErrors / dayTotal) * 100 : 0,
        errors: dayErrors,
      });

      latencyTrend.push({
        date: label,
        p50: percentile(dayLatencies, 50),
        p95: percentile(dayLatencies, 95),
      });
    }

    return {
      errorRate: Math.round(errorRate * 100) / 100,
      p50Latency: Math.round(p50),
      p95Latency: Math.round(p95),
      p99Latency: Math.round(p99),
      successRate: Math.round(successRate * 100) / 100,
      errorTrend,
      latencyTrend,
      statusIndicators: buildStatusIndicators(errorRate, successRate, p95),
    };
  },

  async fetchUnitEconomics({ app, client, dateRange }): Promise<UnitEconomics> {
    const range = rangeBounds(dateRange.from, dateRange.to);
    const identityField = growthIdentityField(app);
    const signupEventName = growthSignupEvent(app);

    const [
      totalUsersResult,
      payingUsersResult,
      revenueEventsResult,
      usageResult,
    ] = await Promise.all([
      client
        .from("event_facts")
        .select("account_id,user_id")
        .eq("app_id", app.id)
        .eq("event_name", signupEventName)
        .not(identityField, "is", null)
        .lt("occurred_at", range.toIsoExclusive),
      client
        .from("event_facts")
        .select("account_id,user_id")
        .eq("app_id", app.id)
        .eq("event_name", "purchase.completed")
        .not(identityField, "is", null)
        .lt("occurred_at", range.toIsoExclusive),
      client
        .from("event_facts")
        .select("event_name,properties")
        .eq("app_id", app.id)
        .in("event_name", ["purchase.completed"])
        .gte("occurred_at", range.fromIso)
        .lt("occurred_at", range.toIsoExclusive),
      client
        .from("ai_usage_facts")
        .select("estimated_cost_usd,status")
        .eq("app_id", app.id)
        .gte("occurred_at", range.fromIso)
        .lt("occurred_at", range.toIsoExclusive),
    ]);

    const totalUsers = distinctActorCount(
      totalUsersResult.data as Array<{ account_id: string | null; user_id: string | null }> | null,
      identityField
    );
    const payingUsers = distinctActorCount(
      payingUsersResult.data as Array<{ account_id: string | null; user_id: string | null }> | null,
      identityField
    );

    const revenueEvents = (revenueEventsResult.data ?? []) as Array<{ event_name: string; properties: Record<string, unknown> | null }>;
    const totalRevenue = revenueEvents.reduce(
      (sum, row) => sum + toNumber(toProperties(row.properties).amount_usd),
      0
    );

    const usageRows = (usageResult.data ?? []) as Array<{ estimated_cost_usd: number | null; status: string | null }>;
    const apiCost = usageRows
      .filter((row) => row.status === "success")
      .reduce((sum, row) => sum + toNumber(row.estimated_cost_usd), 0);

    const arpu = totalUsers > 0 ? totalRevenue / totalUsers : 0;
    const costPerUser = totalUsers > 0 ? apiCost / totalUsers : 0;
    const marginPerUser = arpu - costPerUser;
    const ltv = arpu * 12 * 0.7;

    return {
      arpu,
      costPerUser,
      marginPerUser,
      ltv,
      payingUsers,
      totalUsers,
      revenueBySource: {
        credits: totalRevenue,
        productSales: 0,
        subscriptions: 0,
        other: 0,
      },
      costBreakdown: {
        api: apiCost,
        printing: 0,
        shipping: 0,
        other: 0,
      },
    };
  },

  async fetchUsers({ app, client, dateRange }): Promise<{ users: UserSummary[]; total: number }> {
    const range = rangeBounds(dateRange.from, dateRange.to);

    const accountsResult = await client
      .from("accounts")
      .select("id,email,name,created_at")
      .gte("created_at", range.fromIso)
      .lt("created_at", range.toIsoExclusive)
      .order("created_at", { ascending: false });

    const accounts = (accountsResult.data ?? []) as AccountRow[];
    if (accounts.length === 0) {
      return { users: [], total: 0 };
    }

    const accountIds = accounts.map((account) => account.id);

    const [eventsRangeResult, eventsToDateResult, usageRangeResult] = await Promise.all([
      client
        .from("event_facts")
        .select("event_id,occurred_at,account_id,user_id,event_name,properties")
        .eq("app_id", app.id)
        .in("account_id", accountIds)
        .gte("occurred_at", range.fromIso)
        .lt("occurred_at", range.toIsoExclusive),
      client
        .from("event_facts")
        .select("event_id,occurred_at,account_id,user_id,event_name,properties")
        .eq("app_id", app.id)
        .in("account_id", accountIds)
        .lt("occurred_at", range.toIsoExclusive),
      client
        .from("ai_usage_facts")
        .select("occurred_at,account_id,estimated_cost_usd,status")
        .eq("app_id", app.id)
        .in("account_id", accountIds)
        .gte("occurred_at", range.fromIso)
        .lt("occurred_at", range.toIsoExclusive),
    ]);

    const eventsRange = (eventsRangeResult.data ?? []) as EventFactRow[];
    const eventsToDate = (eventsToDateResult.data ?? []) as EventFactRow[];
    const usageRange = (usageRangeResult.data ?? []) as AiUsageRow[];

    const eventsRangeByAccount = new Map<string, EventFactRow[]>();
    const eventsToDateByAccount = new Map<string, EventFactRow[]>();
    const usageByAccount = new Map<string, AiUsageRow[]>();

    for (const accountId of accountIds) {
      eventsRangeByAccount.set(accountId, []);
      eventsToDateByAccount.set(accountId, []);
      usageByAccount.set(accountId, []);
    }

    for (const event of eventsRange) {
      if (!event.account_id) continue;
      eventsRangeByAccount.get(event.account_id)?.push(event);
    }
    for (const event of eventsToDate) {
      if (!event.account_id) continue;
      eventsToDateByAccount.get(event.account_id)?.push(event);
    }
    for (const usage of usageRange) {
      if (!usage.account_id) continue;
      usageByAccount.get(usage.account_id)?.push(usage);
    }

    const users: UserSummary[] = accounts.map((account) => {
      const accountEvents = eventsRangeByAccount.get(account.id) ?? [];
      const accountEventsToDate = eventsToDateByAccount.get(account.id) ?? [];
      const accountUsage = usageByAccount.get(account.id) ?? [];

      const revenue = sumPurchaseRevenue(accountEvents);
      const cost = sumUsageCost(accountUsage);
      const margin = revenue - cost;
      const generations = accountEvents.filter((event) => event.event_name === "generation.succeeded").length;

      const lastEvent = accountEventsToDate
        .filter((event) => event.event_name !== "auth.account.created")
        .sort((a, b) => b.occurred_at.localeCompare(a.occurred_at))[0];

      return {
        id: account.id,
        email: account.email || "",
        name: account.name || account.email || account.id,
        joinedAt: account.created_at,
        lastActive: lastEvent?.occurred_at || account.created_at,
        revenue,
        cost,
        margin,
        marginPercent: revenue > 0 ? (margin / revenue) * 100 : 0,
        generations,
        funnelStage: computeFunnelStage(accountEventsToDate),
        profitability: margin > 5 ? "profitable" : margin >= 0 ? "marginal" : "unprofitable",
        plan: "free",
      };
    });

    return { users, total: users.length };
  },

  async fetchUserDetail({ app, client, dateRange, userId }): Promise<UserDetail | null> {
    const range = rangeBounds(dateRange.from, dateRange.to);

    const accountResult = await client
      .from("accounts")
      .select("id,email,name,created_at")
      .eq("id", userId)
      .single();

    if (!accountResult.data) {
      return null;
    }

    const account = accountResult.data as AccountRow;

    const [eventsToDateResult, usageToDateResult] = await Promise.all([
      client
        .from("event_facts")
        .select("event_id,occurred_at,account_id,user_id,event_name,properties")
        .eq("app_id", app.id)
        .eq("account_id", userId)
        .lt("occurred_at", range.toIsoExclusive)
        .order("occurred_at", { ascending: true }),
      client
        .from("ai_usage_facts")
        .select("event_id,occurred_at,account_id,user_id,estimated_cost_usd,latency_ms,status")
        .eq("app_id", app.id)
        .eq("account_id", userId)
        .lt("occurred_at", range.toIsoExclusive)
        .order("occurred_at", { ascending: true }),
    ]);

    const allEvents = (eventsToDateResult.data ?? []) as EventFactRow[];
    const allUsage = (usageToDateResult.data ?? []) as AiUsageRow[];

    const rangeEvents = allEvents.filter(
      (event) => event.occurred_at >= range.fromIso && event.occurred_at < range.toIsoExclusive
    );
    const rangeUsage = allUsage.filter(
      (usage) => usage.occurred_at >= range.fromIso && usage.occurred_at < range.toIsoExclusive
    );

    const lifetimeRevenue = sumPurchaseRevenue(allEvents);
    const lifetimeCost = sumUsageCost(allUsage);
    const rangeRevenue = sumPurchaseRevenue(rangeEvents);
    const rangeCost = sumUsageCost(rangeUsage);

    const lifetimeCreditsPurchased = sumCreditsPurchased(allEvents);
    const lifetimeCreditsSpent = sumCreditsSpent(allEvents);
    const lifetimeGenerations = allEvents.filter((event) => event.event_name === "generation.succeeded").length;
    const lifetimeSessions = allEvents.filter((event) => event.event_name === "session.started").length;

    const monthsSinceSignup = Math.max(
      1,
      (new Date().getFullYear() - new Date(account.created_at).getFullYear()) * 12 +
        (new Date().getMonth() - new Date(account.created_at).getMonth())
    );

    const dayLabels = initializeDailyMap(dateRange);
    const revenueByDay = new Map<string, { revenue: number; cost: number; generations: number }>();
    for (const key of dayLabels.keys()) {
      revenueByDay.set(key, { revenue: 0, cost: 0, generations: 0 });
    }

    for (const event of rangeEvents) {
      const key = dayKey(event.occurred_at);
      const current = revenueByDay.get(key);
      if (!current) continue;
      if (event.event_name === "purchase.completed") {
        current.revenue += toNumber(toProperties(event.properties).amount_usd);
      }
      if (event.event_name === "generation.succeeded") {
        current.generations += 1;
      }
    }

    for (const usage of rangeUsage) {
      const key = dayKey(usage.occurred_at);
      const current = revenueByDay.get(key);
      if (!current) continue;
      if (usage.status === "success") {
        current.cost += toNumber(usage.estimated_cost_usd);
      }
    }

    const revenueTrend: TimeSeriesDataPoint[] = Array.from(dayLabels.entries()).map(([key, label]) => {
      const value = revenueByDay.get(key) ?? { revenue: 0, cost: 0, generations: 0 };
      return {
        date: label,
        revenue: value.revenue,
        cost: value.cost,
      };
    });

    const activityTrend: TimeSeriesDataPoint[] = Array.from(dayLabels.entries()).map(([key, label]) => ({
      date: label,
      generations: revenueByDay.get(key)?.generations ?? 0,
    }));

    const payments: UserPayment[] = rangeEvents
      .filter((event) => event.event_name === "purchase.completed")
      .map((event) => ({
        id: event.event_id,
        date: event.occurred_at,
        amount: toNumber(toProperties(event.properties).amount_usd),
        type: "Credit Purchase",
        status: "completed" as const,
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const recentActivity: UserAction[] = [...rangeEvents]
      .sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime())
      .slice(0, 20)
      .map((event) => {
        const props = toProperties(event.properties);
        return {
          id: event.event_id,
          timestamp: event.occurred_at,
          action: humanizeEvent(event.event_name),
          detail: JSON.stringify(props).slice(0, 220),
          creditsCost: toNumber(props.amount) || toNumber(props.credits_charged),
        };
      });

    const avgSessionSeconds = averageSessionDurationSeconds(allEvents);

    return {
      id: account.id,
      email: account.email || "",
      name: account.name || account.email || account.id,
      plan: "free",
      funnelStage: computeFunnelStage(allEvents),
      joinedAt: account.created_at,
      lastActive:
        allEvents.length > 0 ? allEvents[allEvents.length - 1].occurred_at : account.created_at,
      metrics: {
        revenue: rangeRevenue,
        cost: rangeCost,
        margin: rangeRevenue - rangeCost,
        marginPercent: rangeRevenue > 0 ? ((rangeRevenue - rangeCost) / rangeRevenue) * 100 : 0,
        ltv: (lifetimeRevenue / monthsSinceSignup) * 12 * 0.7,
        creditsPurchased: lifetimeCreditsPurchased,
        creditsSpent: lifetimeCreditsSpent,
        creditsRemaining: lifetimeCreditsPurchased - lifetimeCreditsSpent,
        generations: lifetimeGenerations,
        sessions: lifetimeSessions,
        avgSessionDuration: avgSessionSeconds / 60,
        revenueTrend,
        activityTrend,
        revenueBySource: {
          credits: lifetimeRevenue,
          productSales: 0,
          subscriptions: 0,
          other: 0,
        },
        costBreakdown: {
          api: lifetimeCost,
          printing: 0,
          shipping: 0,
          other: 0,
        },
      },
      payments,
      recentActivity,
    };
  },
};
