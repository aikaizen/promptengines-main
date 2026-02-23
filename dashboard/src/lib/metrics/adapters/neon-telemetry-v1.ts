import { addDays, eachDayOfInterval, format } from "date-fns";
import { Pool } from "pg";
import { getNeonAppClient } from "@/lib/neon/app-clients";
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
  kpi_date: string | Date;
  metrics: Record<string, unknown> | null;
};

type RetentionCohortRow = {
  cohort_date: string | Date;
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

const ACTION_EVENTS = [
  "mode.changed",
  "history.viewed",
  "favorites.added",
  "favorites.removed",
  "ui.action",
  "generation.started",
  "generation.succeeded",
  "generation.failed",
];

function poolForApp(appId: string): Pool {
  return getNeonAppClient(appId);
}

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

function toDayKey(value: string | Date): string {
  if (value instanceof Date) return format(value, "yyyy-MM-dd");
  return value.slice(0, 10);
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
  rows: Array<{ account_id: string | null; user_id: string | null }>,
  field: TelemetryIdentityField
): number {
  return new Set(
    rows.map((row) => actorId(row, field)).filter((id): id is string => Boolean(id))
  ).size;
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

function humanizeEvent(eventName: string): string {
  return eventName
    .split(".")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
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

function identityColumnSql(field: TelemetryIdentityField): "account_id" | "user_id" {
  return field === "user_id" ? "user_id" : "account_id";
}

async function queryEventFacts(
  pool: Pool,
  app: AppConfig,
  eventName: string,
  from: string | null,
  toExclusive: string,
  identityField: TelemetryIdentityField
) {
  const identityColumn = identityColumnSql(identityField);
  const clauses: string[] = [
    "app_id = $1",
    "event_name = $2",
    `${identityColumn} is not null`,
    "occurred_at < $3",
  ];
  const params: Array<string> = [app.id, eventName, toExclusive];

  if (from) {
    clauses.push(`occurred_at >= $${params.length + 1}`);
    params.push(from);
  }

  const sql = `
    select account_id::text as account_id, user_id::text as user_id, occurred_at::text as occurred_at
    from event_facts
    where ${clauses.join(" and ")}
  `;

  const result = await pool.query<{
    account_id: string | null;
    user_id: string | null;
    occurred_at: string;
  }>(sql, params);
  return result.rows;
}

export const neonTelemetryV1Adapter: MetricsAdapter = {
  id: "neon-telemetry-v1",

  async fetchGrowth({ app, dateRange }): Promise<GrowthMetrics> {
    try {
      const pool = poolForApp(app.id);
      const range = rangeBounds(dateRange.from, dateRange.to);
      const identityField = growthIdentityField(app);
      const signupEventName = growthSignupEvent(app);
      const activityEventName = growthActivityEvent(app);

      const today = rangeBounds(new Date(), new Date()).fromIso;
      const wauStart = `${format(addDays(new Date(), -6), "yyyy-MM-dd")}T00:00:00.000Z`;
      const mauStart = `${format(addDays(new Date(), -29), "yyyy-MM-dd")}T00:00:00.000Z`;

      const [
        totalUsersRows,
        newUsersTodayRows,
        dauRows,
        wauRows,
        mauRows,
        newUserEventsRows,
        kpiRowsResult,
        retentionRowsResult,
      ] = await Promise.all([
        queryEventFacts(pool, app, signupEventName, null, range.toIsoExclusive, identityField),
        queryEventFacts(pool, app, signupEventName, today, range.toIsoExclusive, identityField),
        queryEventFacts(pool, app, activityEventName, today, range.toIsoExclusive, identityField),
        queryEventFacts(pool, app, activityEventName, wauStart, range.toIsoExclusive, identityField),
        queryEventFacts(pool, app, activityEventName, mauStart, range.toIsoExclusive, identityField),
        queryEventFacts(pool, app, signupEventName, range.fromIso, range.toIsoExclusive, identityField),
        pool.query<DailyKpiRow>(
          `
            select kpi_date, metrics
            from daily_kpis
            where app_id = $1 and kpi_date >= $2::date and kpi_date <= $3::date
          `,
          [app.id, range.fromDate, range.toDate]
        ),
        pool.query<RetentionCohortRow>(
          `
            select cohort_date, cohort_size, retained_d1, retained_d7, retained_d30
            from retention_cohorts
            where app_id = $1 and cohort_date >= $2::date and cohort_date <= $3::date
            order by cohort_date asc
          `,
          [app.id, range.fromDate, range.toDate]
        ),
      ]);

      const totalUsers = distinctActorCount(totalUsersRows, identityField);
      const newUsersToday = distinctActorCount(newUsersTodayRows, identityField);
      const dau = distinctActorCount(dauRows, identityField);
      const wau = distinctActorCount(wauRows, identityField);
      const mau = distinctActorCount(mauRows, identityField);

      const dayLabels = initializeDailyMap(dateRange);
      const dauSeries = new Map<string, { dau: number; wau: number; mau: number }>();
      const newUsersByDay = new Map<string, Set<string>>();

      for (const key of dayLabels.keys()) {
        dauSeries.set(key, { dau: 0, wau: 0, mau: 0 });
        newUsersByDay.set(key, new Set<string>());
      }

      for (const row of kpiRowsResult.rows) {
        const key = toDayKey(row.kpi_date);
        const metrics = toProperties(row.metrics);
        const current = dauSeries.get(key);
        if (!current) continue;
        dauSeries.set(key, {
          dau: current.dau + toNumber(metrics.dau_accounts),
          wau: current.wau + toNumber(metrics.wau_accounts),
          mau: current.mau + toNumber(metrics.mau_accounts),
        });
      }

      for (const event of newUserEventsRows) {
        const key = toDayKey(event.occurred_at);
        const actor = actorId(event, identityField);
        if (!actor) continue;
        newUsersByDay.get(key)?.add(actor);
      }

      const dauTrend: TimeSeriesDataPoint[] = Array.from(dayLabels.entries()).map(([key, label]) => {
        const value = dauSeries.get(key) ?? { dau: 0, wau: 0, mau: 0 };
        return { date: label, dau: value.dau, wau: value.wau, mau: value.mau };
      });

      const newUsersTrend: TimeSeriesDataPoint[] = Array.from(dayLabels.entries()).map(([key, label]) => ({
        date: label,
        newUsers: newUsersByDay.get(key)?.size ?? 0,
      }));

      const retentionCohorts: CohortData[] = retentionRowsResult.rows.map((row) => {
        const cohortSize = toNumber(row.cohort_size);
        const percent = (value: number) =>
          cohortSize > 0 ? Math.round((value / cohortSize) * 1000) / 10 : 0;
        return {
          cohort: toDayKey(row.cohort_date),
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
    } catch {
      return {
        totalUsers: 0,
        newUsersToday: 0,
        dau: 0,
        wau: 0,
        mau: 0,
        stickiness: 0,
        dauTrend: [],
        newUsersTrend: [],
        retentionCohorts: [],
      };
    }
  },

  async fetchFinance({ app, dateRange }): Promise<FinanceMetrics> {
    try {
      const pool = poolForApp(app.id);
      const range = rangeBounds(dateRange.from, dateRange.to);

      const [eventResult, usageResult] = await Promise.all([
        pool.query<EventFactRow>(
          `
            select event_id, occurred_at::text as occurred_at, account_id::text as account_id, user_id::text as user_id, event_name, properties
            from event_facts
            where app_id = $1
              and event_name = any($2::text[])
              and occurred_at >= $3
              and occurred_at < $4
          `,
          [app.id, ["purchase.completed", "credits.purchased", "credits.spent"], range.fromIso, range.toIsoExclusive]
        ),
        pool.query<AiUsageRow>(
          `
            select event_id, occurred_at::text as occurred_at, account_id::text as account_id, user_id::text as user_id, estimated_cost_usd, latency_ms, status
            from ai_usage_facts
            where app_id = $1 and occurred_at >= $2 and occurred_at < $3
          `,
          [app.id, range.fromIso, range.toIsoExclusive]
        ),
      ]);

      const events = eventResult.rows;
      const usageRows = usageResult.rows;
      const totalRevenue = sumPurchaseRevenue(events);
      const creditsPurchased = sumCreditsPurchased(events);
      const creditsSpent = sumCreditsSpent(events);
      const cogs = sumUsageCost(usageRows);
      const margin = totalRevenue > 0 ? ((totalRevenue - cogs) / totalRevenue) * 100 : 0;

      const dayLabels = initializeDailyMap(dateRange);
      const revenueByDay = new Map<string, number>();
      const cogsByDay = new Map<string, number>();
      for (const key of dayLabels.keys()) {
        revenueByDay.set(key, 0);
        cogsByDay.set(key, 0);
      }

      for (const event of events) {
        if (event.event_name !== "purchase.completed") continue;
        const key = toDayKey(event.occurred_at);
        revenueByDay.set(key, (revenueByDay.get(key) ?? 0) + toNumber(toProperties(event.properties).amount_usd));
      }
      for (const usage of usageRows) {
        if (usage.status !== "success") continue;
        const key = toDayKey(usage.occurred_at);
        cogsByDay.set(key, (cogsByDay.get(key) ?? 0) + toNumber(usage.estimated_cost_usd));
      }

      const revenueTrend: TimeSeriesDataPoint[] = Array.from(dayLabels.entries()).map(([key, label]) => ({
        date: label,
        revenue: revenueByDay.get(key) ?? 0,
      }));
      const cogsTrend: TimeSeriesDataPoint[] = Array.from(dayLabels.entries()).map(([key, label]) => ({
        date: label,
        cogs: cogsByDay.get(key) ?? 0,
      }));

      return {
        totalRevenue,
        monthlyRevenue: totalRevenue,
        creditsPurchased,
        creditsSpent,
        cogs,
        margin: Math.round(margin * 10) / 10,
        revenueTrend,
        cogsTrend,
        revenueByApp: [],
        revenueBySource: { credits: totalRevenue, productSales: 0, subscriptions: 0, other: 0 },
        costBreakdown: { api: cogs, printing: 0, shipping: 0, other: 0 },
      };
    } catch {
      return {
        totalRevenue: 0,
        monthlyRevenue: 0,
        creditsPurchased: 0,
        creditsSpent: 0,
        cogs: 0,
        margin: 0,
        revenueTrend: [],
        cogsTrend: [],
        revenueByApp: [],
        revenueBySource: { credits: 0, productSales: 0, subscriptions: 0, other: 0 },
        costBreakdown: { api: 0, printing: 0, shipping: 0, other: 0 },
      };
    }
  },

  async fetchEngagement({ app, dateRange }): Promise<EngagementMetrics> {
    try {
      const pool = poolForApp(app.id);
      const range = rangeBounds(dateRange.from, dateRange.to);
      const identityField = growthIdentityField(app);
      const signupEvent = growthSignupEvent(app);

      const eventsResult = await pool.query<EventFactRow>(
        `
          select event_id, occurred_at::text as occurred_at, account_id::text as account_id, user_id::text as user_id, event_name, properties
          from event_facts
          where app_id = $1 and event_name = any($2::text[]) and occurred_at >= $3 and occurred_at < $4
        `,
        [
          app.id,
          [...ACTION_EVENTS, signupEvent, "session.started", "session.ended"],
          range.fromIso,
          range.toIsoExclusive,
        ]
      );

      const events = eventsResult.rows;
      const sessionStarts = events.filter((event) => event.event_name === "session.started");
      const sessionsByActor = new Set(
        sessionStarts.map((event) => actorId(event, identityField)).filter((id): id is string => Boolean(id))
      );

      const actionCount = events.filter((event) => ACTION_EVENTS.includes(event.event_name)).length;
      const avgSessionDuration = (() => {
        const ended = events.filter((event) => event.event_name === "session.ended");
        if (ended.length === 0) return 0;
        const totalSeconds = ended.reduce((sum, event) => {
          return sum + toNumber(toProperties(event.properties).duration_ms) / 1000;
        }, 0);
        return totalSeconds / ended.length;
      })();

      const signups = events.filter((event) => event.event_name === signupEvent);
      const generations = events.filter((event) => event.event_name === "generation.succeeded");
      let activated = 0;
      for (const signup of signups) {
        const signupActor = actorId(signup, identityField);
        if (!signupActor) continue;
        const signupTime = new Date(signup.occurred_at).getTime();
        const activatedInWindow = generations.some((event) => {
          const actor = actorId(event, identityField);
          if (actor !== signupActor) return false;
          const eventTime = new Date(event.occurred_at).getTime();
          return eventTime >= signupTime && eventTime <= signupTime + 7 * 24 * 60 * 60 * 1000;
        });
        if (activatedInWindow) activated += 1;
      }

      const dayLabels = initializeDailyMap(dateRange);
      const sessionsByDay = new Map<string, number>();
      for (const key of dayLabels.keys()) sessionsByDay.set(key, 0);
      for (const session of sessionStarts) {
        const key = toDayKey(session.occurred_at);
        sessionsByDay.set(key, (sessionsByDay.get(key) ?? 0) + 1);
      }

      const sessionTrend: TimeSeriesDataPoint[] = Array.from(dayLabels.entries()).map(([key, label]) => ({
        date: label,
        sessions: sessionsByDay.get(key) ?? 0,
      }));

      const featureMap = new Map<string, number>();
      for (const event of events) {
        if (!ACTION_EVENTS.includes(event.event_name)) continue;
        const feature = humanizeEvent(event.event_name);
        featureMap.set(feature, (featureMap.get(feature) ?? 0) + 1);
      }
      const topFeatures = Array.from(featureMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([feature, usage]) => ({ feature, usage }));

      return {
        avgSessionDuration: Math.round(avgSessionDuration),
        sessionsPerUser: sessionsByActor.size > 0 ? Math.round((sessionStarts.length / sessionsByActor.size) * 10) / 10 : 0,
        actionsPerSession: sessionStarts.length > 0 ? Math.round((actionCount / sessionStarts.length) * 10) / 10 : 0,
        activationRate: signups.length > 0 ? Math.round((activated / signups.length) * 1000) / 10 : 0,
        topFeatures,
        sessionTrend,
      };
    } catch {
      return {
        avgSessionDuration: 0,
        sessionsPerUser: 0,
        actionsPerSession: 0,
        activationRate: 0,
        topFeatures: [],
        sessionTrend: [],
      };
    }
  },

  async fetchReliability({ app, dateRange }): Promise<ReliabilityMetrics> {
    try {
      const pool = poolForApp(app.id);
      const range = rangeBounds(dateRange.from, dateRange.to);
      const result = await pool.query<AiUsageRow>(
        `
          select event_id, occurred_at::text as occurred_at, account_id::text as account_id, user_id::text as user_id, estimated_cost_usd, latency_ms, status
          from ai_usage_facts
          where app_id = $1 and occurred_at >= $2 and occurred_at < $3
          order by occurred_at asc
        `,
        [app.id, range.fromIso, range.toIsoExclusive]
      );

      const rows = result.rows;
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
        const dayRows = rows.filter((row) => toDayKey(row.occurred_at) === key);
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
    } catch {
      return {
        errorRate: 0,
        p50Latency: 0,
        p95Latency: 0,
        p99Latency: 0,
        successRate: 0,
        errorTrend: [],
        latencyTrend: [],
        statusIndicators: [],
      };
    }
  },

  async fetchUnitEconomics({ app, dateRange }): Promise<UnitEconomics> {
    try {
      const pool = poolForApp(app.id);
      const range = rangeBounds(dateRange.from, dateRange.to);
      const identityField = growthIdentityField(app);
      const signupEventName = growthSignupEvent(app);

      const [totalUsersRows, payingUsersRows, revenueRows, usageRows] = await Promise.all([
        queryEventFacts(pool, app, signupEventName, null, range.toIsoExclusive, identityField),
        queryEventFacts(pool, app, "purchase.completed", null, range.toIsoExclusive, identityField),
        pool.query<EventFactRow>(
          `
            select event_id, occurred_at::text as occurred_at, account_id::text as account_id, user_id::text as user_id, event_name, properties
            from event_facts
            where app_id = $1 and event_name = 'purchase.completed' and occurred_at >= $2 and occurred_at < $3
          `,
          [app.id, range.fromIso, range.toIsoExclusive]
        ),
        pool.query<AiUsageRow>(
          `
            select event_id, occurred_at::text as occurred_at, account_id::text as account_id, user_id::text as user_id, estimated_cost_usd, latency_ms, status
            from ai_usage_facts
            where app_id = $1 and occurred_at >= $2 and occurred_at < $3
          `,
          [app.id, range.fromIso, range.toIsoExclusive]
        ),
      ]);

      const totalUsers = distinctActorCount(totalUsersRows, identityField);
      const payingUsers = distinctActorCount(payingUsersRows, identityField);
      const totalRevenue = sumPurchaseRevenue(revenueRows.rows);
      const apiCost = sumUsageCost(usageRows.rows);

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
    } catch {
      return {
        arpu: 0,
        costPerUser: 0,
        marginPerUser: 0,
        ltv: 0,
        payingUsers: 0,
        totalUsers: 0,
        revenueBySource: { credits: 0, productSales: 0, subscriptions: 0, other: 0 },
        costBreakdown: { api: 0, printing: 0, shipping: 0, other: 0 },
      };
    }
  },

  async fetchUsers({ app, dateRange }): Promise<{ users: UserSummary[]; total: number }> {
    try {
      const pool = poolForApp(app.id);
      const range = rangeBounds(dateRange.from, dateRange.to);
      const accountResult = await pool.query<AccountRow>(
        `
          select id::text as id, email, name, created_at::text as created_at
          from accounts
          where created_at >= $1 and created_at < $2
          order by created_at desc
        `,
        [range.fromIso, range.toIsoExclusive]
      );

      const accounts = accountResult.rows;
      if (accounts.length === 0) return { users: [], total: 0 };

      const accountIds = accounts.map((account) => account.id);
      const [eventsRangeResult, usageRangeResult] = await Promise.all([
        pool.query<EventFactRow>(
          `
            select event_id, occurred_at::text as occurred_at, account_id::text as account_id, user_id::text as user_id, event_name, properties
            from event_facts
            where app_id = $1
              and account_id::text = any($2::text[])
              and occurred_at >= $3
              and occurred_at < $4
          `,
          [app.id, accountIds, range.fromIso, range.toIsoExclusive]
        ),
        pool.query<AiUsageRow>(
          `
            select event_id, occurred_at::text as occurred_at, account_id::text as account_id, user_id::text as user_id, estimated_cost_usd, latency_ms, status
            from ai_usage_facts
            where app_id = $1
              and account_id::text = any($2::text[])
              and occurred_at >= $3
              and occurred_at < $4
          `,
          [app.id, accountIds, range.fromIso, range.toIsoExclusive]
        ),
      ]);

      const eventsRangeByAccount = new Map<string, EventFactRow[]>();
      const usageByAccount = new Map<string, AiUsageRow[]>();
      for (const accountId of accountIds) {
        eventsRangeByAccount.set(accountId, []);
        usageByAccount.set(accountId, []);
      }
      for (const row of eventsRangeResult.rows) {
        if (!row.account_id) continue;
        eventsRangeByAccount.get(row.account_id)?.push(row);
      }
      for (const row of usageRangeResult.rows) {
        if (!row.account_id) continue;
        usageByAccount.get(row.account_id)?.push(row);
      }

      const users: UserSummary[] = accounts.map((account) => {
        const accountEvents = eventsRangeByAccount.get(account.id) ?? [];
        const accountUsage = usageByAccount.get(account.id) ?? [];
        const revenue = sumPurchaseRevenue(accountEvents);
        const cost = sumUsageCost(accountUsage);
        const margin = revenue - cost;
        const generations = accountEvents.filter((event) => event.event_name === "generation.succeeded").length;

        return {
          id: account.id,
          email: account.email || "",
          name: account.name || account.email || account.id,
          joinedAt: account.created_at,
          lastActive: accountEvents[accountEvents.length - 1]?.occurred_at || account.created_at,
          revenue,
          cost,
          margin,
          marginPercent: revenue > 0 ? (margin / revenue) * 100 : 0,
          generations,
          funnelStage: "signed_up",
          profitability: margin > 5 ? "profitable" : margin >= 0 ? "marginal" : "unprofitable",
          plan: "free",
        };
      });

      return { users, total: users.length };
    } catch {
      return { users: [], total: 0 };
    }
  },

  async fetchUserDetail({ app, userId, dateRange }): Promise<UserDetail | null> {
    try {
      const pool = poolForApp(app.id);
      const range = rangeBounds(dateRange.from, dateRange.to);

      const accountResult = await pool.query<AccountRow>(
        `
          select id::text as id, email, name, created_at::text as created_at
          from accounts
          where id::text = $1
          limit 1
        `,
        [userId]
      );
      if (accountResult.rows.length === 0) return null;

      const account = accountResult.rows[0];
      const [eventResult, usageResult] = await Promise.all([
        pool.query<EventFactRow>(
          `
            select event_id, occurred_at::text as occurred_at, account_id::text as account_id, user_id::text as user_id, event_name, properties
            from event_facts
            where app_id = $1 and account_id::text = $2 and occurred_at < $3
            order by occurred_at asc
          `,
          [app.id, userId, range.toIsoExclusive]
        ),
        pool.query<AiUsageRow>(
          `
            select event_id, occurred_at::text as occurred_at, account_id::text as account_id, user_id::text as user_id, estimated_cost_usd, latency_ms, status
            from ai_usage_facts
            where app_id = $1 and account_id::text = $2 and occurred_at < $3
            order by occurred_at asc
          `,
          [app.id, userId, range.toIsoExclusive]
        ),
      ]);

      const allEvents = eventResult.rows;
      const allUsage = usageResult.rows;
      const rangeEvents = allEvents.filter((event) => event.occurred_at >= range.fromIso && event.occurred_at < range.toIsoExclusive);
      const rangeUsage = allUsage.filter((row) => row.occurred_at >= range.fromIso && row.occurred_at < range.toIsoExclusive);

      const revenue = sumPurchaseRevenue(rangeEvents);
      const cost = sumUsageCost(rangeUsage);
      const lifetimeRevenue = sumPurchaseRevenue(allEvents);
      const lifetimeCost = sumUsageCost(allUsage);

      const payments: UserPayment[] = rangeEvents
        .filter((event) => event.event_name === "purchase.completed")
        .map((event) => ({
          id: event.event_id,
          date: event.occurred_at,
          amount: toNumber(toProperties(event.properties).amount_usd),
          type: "Credit Purchase",
          status: "completed",
        }));

      const recentActivity: UserAction[] = [...rangeEvents]
        .reverse()
        .slice(0, 20)
        .map((event) => ({
          id: event.event_id,
          timestamp: event.occurred_at,
          action: humanizeEvent(event.event_name),
          detail: JSON.stringify(toProperties(event.properties)).slice(0, 220),
          creditsCost: toNumber(toProperties(event.properties).amount),
        }));

      const monthsSinceSignup = Math.max(
        1,
        (new Date().getFullYear() - new Date(account.created_at).getFullYear()) * 12 +
          (new Date().getMonth() - new Date(account.created_at).getMonth())
      );

      return {
        id: account.id,
        email: account.email || "",
        name: account.name || account.email || account.id,
        plan: "free",
        funnelStage: "signed_up",
        joinedAt: account.created_at,
        lastActive: allEvents[allEvents.length - 1]?.occurred_at || account.created_at,
        metrics: {
          revenue,
          cost,
          margin: revenue - cost,
          marginPercent: revenue > 0 ? ((revenue - cost) / revenue) * 100 : 0,
          ltv: (lifetimeRevenue / monthsSinceSignup) * 12 * 0.7,
          creditsPurchased: sumCreditsPurchased(allEvents),
          creditsSpent: sumCreditsSpent(allEvents),
          creditsRemaining: sumCreditsPurchased(allEvents) - sumCreditsSpent(allEvents),
          generations: allEvents.filter((event) => event.event_name === "generation.succeeded").length,
          sessions: allEvents.filter((event) => event.event_name === "session.started").length,
          avgSessionDuration: 0,
          revenueTrend: [],
          activityTrend: [],
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
    } catch {
      return null;
    }
  },
};
