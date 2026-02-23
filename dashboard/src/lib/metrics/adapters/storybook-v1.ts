import { addDays, eachDayOfInterval, format } from "date-fns";
import { MetricsAdapter } from "@/lib/metrics/adapters/types";
import { AppConfig } from "@/types/apps";
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
import { SupabaseClient } from "@supabase/supabase-js";

/* ------------------------------------------------------------------ */
/*  Row types matching Storybook Studio's actual Supabase tables       */
/* ------------------------------------------------------------------ */

type ProfileRow = {
  id: string;
  email: string | null;
  name: string | null;
  created_at: string;
  credits: number | null;
};

type EventRow = {
  id: string;
  user_id: string | null;
  event_type: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

type OrderRow = {
  id: string;
  user_id: string | null;
  status: string | null;
  total_cost: number | null;
  created_at: string;
  lulu_order_id?: string | null;
  tracking_number?: string | null;
  printing_cost?: number | null;
  shipping_cost?: number | null;
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function toNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
}

function toMeta(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
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

function humanizeEvent(eventType: string): string {
  return eventType
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function normalizeStatus(status: string | null | undefined): string {
  return (status ?? "").trim().toLowerCase();
}

function getPaidStatuses(app: AppConfig): string[] {
  const statuses = app.paymentSuccessStatuses
    .map((status) => normalizeStatus(status))
    .filter((status) => status.length > 0);
  return statuses.length > 0 ? Array.from(new Set(statuses)) : ["completed"];
}

function isPaidOrderStatus(status: string | null | undefined, paidStatuses: Set<string>): boolean {
  return paidStatuses.has(normalizeStatus(status));
}

function getOrderDedupeKey(order: OrderRow): string {
  const luluOrderId = (order.lulu_order_id ?? "").trim();
  if (luluOrderId.length > 0) return `lulu:${luluOrderId}`;

  const trackingNumber = (order.tracking_number ?? "").trim();
  if (trackingNumber.length > 0) return `tracking:${trackingNumber}`;

  return `id:${order.id}`;
}

function dedupeOrders(rows: OrderRow[]): OrderRow[] {
  const map = new Map<string, OrderRow>();

  for (const row of rows) {
    const key = getOrderDedupeKey(row);
    const existing = map.get(key);
    if (!existing) {
      map.set(key, row);
      continue;
    }

    if (new Date(row.created_at).getTime() > new Date(existing.created_at).getTime()) {
      map.set(key, row);
    }
  }

  return Array.from(map.values());
}

function orderFulfillmentCost(order: OrderRow): number {
  return toNumber(order.printing_cost) + toNumber(order.shipping_cost);
}

function toPaymentStatus(status: string | null | undefined): UserPayment["status"] {
  const normalized = normalizeStatus(status);
  if (normalized === "completed") return "completed";
  if (normalized === "pending") return "pending";
  if (normalized === "refunded") return "refunded";
  if (normalized === "paid") return "paid";
  if (normalized === "printing") return "printing";
  if (normalized === "shipped") return "shipped";
  if (normalized === "failed") return "failed";
  if (normalized === "canceled" || normalized === "cancelled") return "canceled";
  return "pending";
}

type OrderQueryOptions = {
  userId?: string;
  userIds?: string[];
  fromIso?: string;
  toIsoExclusive?: string;
  onlyPaid?: boolean;
  paidStatuses?: string[];
  orderBy?: "asc" | "desc";
};

async function fetchOrders(
  client: SupabaseClient,
  options: OrderQueryOptions
): Promise<OrderRow[]> {
  const extendedSelect =
    "id,user_id,status,total_cost,created_at,lulu_order_id,tracking_number,printing_cost,shipping_cost";
  const baseSelect = "id,user_id,status,total_cost,created_at";

  const runQuery = async (selectClause: string) => {
    let query = client.from("orders").select(selectClause);

    if (options.userId) {
      query = query.eq("user_id", options.userId);
    } else if (options.userIds && options.userIds.length > 0) {
      query = query.in("user_id", options.userIds);
    }

    if (options.onlyPaid && options.paidStatuses && options.paidStatuses.length > 0) {
      query = query.in("status", options.paidStatuses);
    }

    if (options.fromIso) {
      query = query.gte("created_at", options.fromIso);
    }
    if (options.toIsoExclusive) {
      query = query.lt("created_at", options.toIsoExclusive);
    }

    if (options.orderBy) {
      query = query.order("created_at", { ascending: options.orderBy === "asc" });
    }

    return query;
  };

  const primary = await runQuery(extendedSelect);
  if (!primary.error) {
    return dedupeOrders((primary.data ?? []) as unknown as OrderRow[]);
  }

  const fallback = await runQuery(baseSelect);
  if (fallback.error) {
    return [];
  }
  return dedupeOrders((fallback.data ?? []) as unknown as OrderRow[]);
}

const ACTIVATION_EVENTS = new Set([
  "generation_completed",
  "story_generated",
  "image_generated",
]);

const ACTION_EVENTS = new Set([
  "generation_started",
  "generation_completed",
  "story_generated",
  "image_generated",
  "character_created",
  "project_created",
  "book_preview",
  "order_placed",
]);

/* ------------------------------------------------------------------ */
/*  Adapter                                                            */
/* ------------------------------------------------------------------ */

export const storybookV1Adapter: MetricsAdapter = {
  id: "storybook-v1",

  /* ======================== GROWTH ======================== */
  async fetchGrowth({ client, dateRange }): Promise<GrowthMetrics> {
    const range = rangeBounds(dateRange.from, dateRange.to);
    const today = rangeBounds(new Date(), new Date()).fromIso;
    const wauStart = `${format(addDays(new Date(), -6), "yyyy-MM-dd")}T00:00:00.000Z`;
    const mauStart = `${format(addDays(new Date(), -29), "yyyy-MM-dd")}T00:00:00.000Z`;

    const [
      totalUsersResult,
      newUsersTodayResult,
      dauResult,
      wauResult,
      mauResult,
      newUsersRangeResult,
    ] = await Promise.all([
      client
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .lt("created_at", range.toIsoExclusive),
      client
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .gte("created_at", today),
      client
        .from("events")
        .select("user_id")
        .eq("event_type", "login")
        .not("user_id", "is", null)
        .gte("created_at", today),
      client
        .from("events")
        .select("user_id")
        .eq("event_type", "login")
        .not("user_id", "is", null)
        .gte("created_at", wauStart),
      client
        .from("events")
        .select("user_id")
        .eq("event_type", "login")
        .not("user_id", "is", null)
        .gte("created_at", mauStart),
      client
        .from("profiles")
        .select("id,created_at")
        .gte("created_at", range.fromIso)
        .lt("created_at", range.toIsoExclusive),
    ]);

    const totalUsers = totalUsersResult.count ?? 0;
    const newUsersToday = newUsersTodayResult.count ?? 0;

    const distinctUsers = (rows: Array<{ user_id: string | null }> | null) =>
      new Set((rows ?? []).map((r) => r.user_id).filter(Boolean)).size;

    const dau = distinctUsers(dauResult.data as Array<{ user_id: string | null }> | null);
    const wau = distinctUsers(wauResult.data as Array<{ user_id: string | null }> | null);
    const mau = distinctUsers(mauResult.data as Array<{ user_id: string | null }> | null);

    // Build daily new-users series
    const dayLabels = initializeDailyMap(dateRange);
    const newUsersSeries = new Map<string, number>();
    for (const key of dayLabels.keys()) newUsersSeries.set(key, 0);

    for (const row of (newUsersRangeResult.data ?? []) as Array<{ id: string; created_at: string }>) {
      const key = dayKey(row.created_at);
      if (newUsersSeries.has(key)) {
        newUsersSeries.set(key, (newUsersSeries.get(key) ?? 0) + 1);
      }
    }

    const newUsersTrend: TimeSeriesDataPoint[] = Array.from(dayLabels.entries()).map(
      ([key, label]) => ({ date: label, newUsers: newUsersSeries.get(key) ?? 0 })
    );

    // DAU/WAU/MAU trend — we don't have daily_kpis, so set each day to 0 except today
    const dauTrend: TimeSeriesDataPoint[] = Array.from(dayLabels.entries()).map(
      ([, label]) => ({ date: label, dau: 0, wau: 0, mau: 0 })
    );
    // Populate today's entry if it falls in the range
    const todayKey = format(new Date(), "yyyy-MM-dd");
    if (dayLabels.has(todayKey)) {
      const todayLabel = dayLabels.get(todayKey)!;
      const idx = dauTrend.findIndex((d) => d.date === todayLabel);
      if (idx >= 0) {
        dauTrend[idx] = { date: todayLabel, dau, wau, mau };
      }
    }

    // No retention_cohorts table — return empty
    const retentionCohorts: CohortData[] = [];

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

  /* ======================== FINANCE ======================== */
  async fetchFinance({ app, client, dateRange }): Promise<FinanceMetrics> {
    const range = rangeBounds(dateRange.from, dateRange.to);
    const paidStatuses = getPaidStatuses(app);

    const [creditEventsResult, orders] = await Promise.all([
      client
        .from("events")
        .select("id,user_id,event_type,metadata,created_at")
        .eq("event_type", "credit_purchase_initiated")
        .gte("created_at", range.fromIso)
        .lt("created_at", range.toIsoExclusive),
      fetchOrders(client, {
        onlyPaid: true,
        paidStatuses,
        fromIso: range.fromIso,
        toIsoExclusive: range.toIsoExclusive,
      }),
    ]);

    const creditEvents = (creditEventsResult.data ?? []) as EventRow[];

    // Credit revenue: amount_usd from metadata
    let creditRevenue = 0;
    for (const ev of creditEvents) {
      const meta = toMeta(ev.metadata);
      creditRevenue += toNumber(meta.amount_usd);
    }

    // Product revenue: sum of orders.total_cost (stored in USD decimal)
    let productRevenue = 0;
    for (const order of orders) {
      productRevenue += toNumber(order.total_cost);
    }

    const totalRevenue = creditRevenue + productRevenue;
    const printingCost = orders.reduce((sum, order) => sum + toNumber(order.printing_cost), 0);
    const shippingCost = orders.reduce((sum, order) => sum + toNumber(order.shipping_cost), 0);
    const cogs = printingCost + shippingCost;
    const margin = totalRevenue > 0 ? ((totalRevenue - cogs) / totalRevenue) * 100 : 0;

    // Build daily revenue series
    const dayLabels = initializeDailyMap(dateRange);
    const revenueByDay = new Map<string, number>();
    for (const key of dayLabels.keys()) revenueByDay.set(key, 0);

    for (const ev of creditEvents) {
      const key = dayKey(ev.created_at);
      if (revenueByDay.has(key)) {
        revenueByDay.set(key, (revenueByDay.get(key) ?? 0) + toNumber(toMeta(ev.metadata).amount_usd));
      }
    }
    for (const order of orders) {
      const key = dayKey(order.created_at);
      if (revenueByDay.has(key)) {
        revenueByDay.set(key, (revenueByDay.get(key) ?? 0) + toNumber(order.total_cost));
      }
    }

    const revenueTrend: TimeSeriesDataPoint[] = Array.from(dayLabels.entries()).map(
      ([key, label]) => ({ date: label, revenue: revenueByDay.get(key) ?? 0 })
    );

    const cogsByDay = new Map<string, number>();
    for (const key of dayLabels.keys()) cogsByDay.set(key, 0);
    for (const order of orders) {
      const key = dayKey(order.created_at);
      if (cogsByDay.has(key)) {
        cogsByDay.set(key, (cogsByDay.get(key) ?? 0) + orderFulfillmentCost(order));
      }
    }
    const cogsTrend: TimeSeriesDataPoint[] = Array.from(dayLabels.entries()).map(
      ([key, label]) => ({ date: label, cogs: cogsByDay.get(key) ?? 0 })
    );

    return {
      totalRevenue,
      monthlyRevenue: totalRevenue,
      creditsPurchased: creditRevenue,
      creditsSpent: 0,
      cogs,
      margin: Math.round(margin * 10) / 10,
      revenueTrend,
      cogsTrend,
      revenueByApp: [],
      revenueBySource: {
        credits: creditRevenue,
        productSales: productRevenue,
        subscriptions: 0,
        other: 0,
      },
      costBreakdown: {
        api: 0,
        printing: printingCost,
        shipping: shippingCost,
        other: 0,
      },
    };
  },

  /* ======================== ENGAGEMENT ======================== */
  async fetchEngagement({ client, dateRange }): Promise<EngagementMetrics> {
    const range = rangeBounds(dateRange.from, dateRange.to);

    const [eventsResult, signupsResult] = await Promise.all([
      client
        .from("events")
        .select("id,user_id,event_type,metadata,created_at")
        .gte("created_at", range.fromIso)
        .lt("created_at", range.toIsoExclusive),
      client
        .from("profiles")
        .select("id,created_at")
        .gte("created_at", range.fromIso)
        .lt("created_at", range.toIsoExclusive),
    ]);

    const events = (eventsResult.data ?? []) as EventRow[];
    const signups = (signupsResult.data ?? []) as Array<{ id: string; created_at: string }>;

    // Activation rate: % of signups who generated content within 7 days
    let activated = 0;
    for (const signup of signups) {
      const signupTime = new Date(signup.created_at).getTime();
      const windowEnd = signupTime + 7 * 24 * 60 * 60 * 1000;
      const hasActivation = events.some((ev) => {
        if (ev.user_id !== signup.id) return false;
        if (!ACTIVATION_EVENTS.has(ev.event_type)) return false;
        const evTime = new Date(ev.created_at).getTime();
        return evTime >= signupTime && evTime <= windowEnd;
      });
      if (hasActivation) activated += 1;
    }

    // Actions per session: total actions / unique login events (proxy for sessions)
    const loginEvents = events.filter((ev) => ev.event_type === "login");
    const actionCount = events.filter((ev) => ACTION_EVENTS.has(ev.event_type)).length;
    const uniqueSessionUsers = new Set(
      loginEvents.map((ev) => ev.user_id).filter(Boolean)
    );
    const sessionsPerUser =
      uniqueSessionUsers.size > 0 ? loginEvents.length / uniqueSessionUsers.size : 0;
    const actionsPerSession =
      loginEvents.length > 0 ? actionCount / loginEvents.length : 0;

    // Session trend (logins per day as proxy)
    const dayLabels = initializeDailyMap(dateRange);
    const sessionsByDay = new Map<string, number>();
    for (const key of dayLabels.keys()) sessionsByDay.set(key, 0);

    for (const ev of loginEvents) {
      const key = dayKey(ev.created_at);
      if (sessionsByDay.has(key)) {
        sessionsByDay.set(key, (sessionsByDay.get(key) ?? 0) + 1);
      }
    }

    const sessionTrend: TimeSeriesDataPoint[] = Array.from(dayLabels.entries()).map(
      ([key, label]) => ({ date: label, sessions: sessionsByDay.get(key) ?? 0 })
    );

    // Top features by event_type distribution
    const featureMap = new Map<string, number>();
    for (const ev of events) {
      if (!ACTION_EVENTS.has(ev.event_type)) continue;
      const label = humanizeEvent(ev.event_type);
      featureMap.set(label, (featureMap.get(label) ?? 0) + 1);
    }

    const topFeatures = Array.from(featureMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([feature, usage]) => ({ feature, usage }));

    return {
      avgSessionDuration: 0, // no session_started/ended events
      sessionsPerUser: Math.round(sessionsPerUser * 10) / 10,
      actionsPerSession: Math.round(actionsPerSession * 10) / 10,
      activationRate:
        signups.length > 0 ? Math.round((activated / signups.length) * 1000) / 10 : 0,
      topFeatures,
      sessionTrend,
    };
  },

  /* ======================== RELIABILITY ======================== */
  async fetchReliability({ client, dateRange }): Promise<ReliabilityMetrics> {
    const range = rangeBounds(dateRange.from, dateRange.to);

    const { data } = await client
      .from("events")
      .select("id,event_type,created_at")
      .in("event_type", [
        "generation_started",
        "generation_completed",
        "generation_failed",
        "story_generated",
        "image_generated",
      ])
      .gte("created_at", range.fromIso)
      .lt("created_at", range.toIsoExclusive)
      .order("created_at", { ascending: true });

    const events = (data ?? []) as EventRow[];
    const totalRequests = events.filter(
      (ev) => ev.event_type === "generation_started"
    ).length;
    const failures = events.filter(
      (ev) => ev.event_type === "generation_failed"
    ).length;
    const successes = events.filter(
      (ev) =>
        ev.event_type === "generation_completed" ||
        ev.event_type === "story_generated" ||
        ev.event_type === "image_generated"
    ).length;

    const total = totalRequests || successes + failures || 1;
    const errorRate = (failures / total) * 100;
    const successRate = 100 - errorRate;

    // Build daily error trend
    const dayLabels = initializeDailyMap(dateRange);
    const errorTrend: TimeSeriesDataPoint[] = [];
    const latencyTrend: TimeSeriesDataPoint[] = [];

    for (const [key, label] of dayLabels.entries()) {
      const dayEvents = events.filter((ev) => ev.created_at.startsWith(key));
      const dayStarted = dayEvents.filter(
        (ev) => ev.event_type === "generation_started"
      ).length;
      const dayFailed = dayEvents.filter(
        (ev) => ev.event_type === "generation_failed"
      ).length;
      const daySucceeded = dayEvents.filter(
        (ev) =>
          ev.event_type === "generation_completed" ||
          ev.event_type === "story_generated" ||
          ev.event_type === "image_generated"
      ).length;
      const dayTotal = dayStarted || daySucceeded + dayFailed || 0;

      errorTrend.push({
        date: label,
        errorRate: dayTotal > 0 ? (dayFailed / dayTotal) * 100 : 0,
        errors: dayFailed,
      });

      latencyTrend.push({
        date: label,
        p50: 0, // no latency data
        p95: 0,
      });
    }

    const statusIndicators: StatusIndicator[] = [
      {
        label: "Generation Health",
        status: errorRate < 1 ? "healthy" : errorRate < 5 ? "warning" : "critical",
        detail: `${errorRate.toFixed(1)}% error rate`,
      },
      {
        label: "Latency",
        status: "healthy",
        detail: "No latency data",
      },
      {
        label: "Generation",
        status:
          successRate > 99 ? "healthy" : successRate > 95 ? "warning" : "critical",
        detail: `${successRate.toFixed(1)}% success`,
      },
    ];

    return {
      errorRate: Math.round(errorRate * 100) / 100,
      p50Latency: 0,
      p95Latency: 0,
      p99Latency: 0,
      successRate: Math.round(successRate * 100) / 100,
      errorTrend,
      latencyTrend,
      statusIndicators,
    };
  },

  /* ======================== UNIT ECONOMICS ======================== */
  async fetchUnitEconomics({ app, client, dateRange }): Promise<UnitEconomics> {
    const range = rangeBounds(dateRange.from, dateRange.to);
    const paidStatuses = getPaidStatuses(app);

    const [
      totalUsersResult,
      creditEventsResult,
      orders,
    ] = await Promise.all([
      client
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .lt("created_at", range.toIsoExclusive),
      client
        .from("events")
        .select("user_id,metadata")
        .eq("event_type", "credit_purchase_initiated")
        .gte("created_at", range.fromIso)
        .lt("created_at", range.toIsoExclusive),
      fetchOrders(client, {
        onlyPaid: true,
        paidStatuses,
        fromIso: range.fromIso,
        toIsoExclusive: range.toIsoExclusive,
      }),
    ]);

    const totalUsers = totalUsersResult.count ?? 0;

    const creditEvents = (creditEventsResult.data ?? []) as Array<{
      user_id: string | null;
      metadata: Record<string, unknown> | null;
    }>;
    // Revenue
    let creditRevenue = 0;
    for (const ev of creditEvents) {
      creditRevenue += toNumber(toMeta(ev.metadata).amount_usd);
    }
    let productRevenue = 0;
    for (const order of orders) {
      productRevenue += toNumber(order.total_cost);
    }
    const totalRevenue = creditRevenue + productRevenue;
    const printingCost = orders.reduce((sum, order) => sum + toNumber(order.printing_cost), 0);
    const shippingCost = orders.reduce((sum, order) => sum + toNumber(order.shipping_cost), 0);
    const totalCost = printingCost + shippingCost;

    // Paying users: distinct user_ids across credit events + orders
    const payingUserIds = new Set<string>();
    for (const ev of creditEvents) {
      if (ev.user_id) payingUserIds.add(ev.user_id);
    }
    for (const order of orders) {
      if (order.user_id) payingUserIds.add(order.user_id);
    }

    const arpu = totalUsers > 0 ? totalRevenue / totalUsers : 0;
    const costPerUser = totalUsers > 0 ? totalCost / totalUsers : 0;
    const ltv = arpu * 12 * 0.7;

    return {
      arpu,
      costPerUser,
      marginPerUser: arpu - costPerUser,
      ltv,
      payingUsers: payingUserIds.size,
      totalUsers,
      revenueBySource: {
        credits: creditRevenue,
        productSales: productRevenue,
        subscriptions: 0,
        other: 0,
      },
      costBreakdown: {
        api: 0,
        printing: printingCost,
        shipping: shippingCost,
        other: 0,
      },
    };
  },

  /* ======================== USERS ======================== */
  async fetchUsers({ app, client, dateRange }): Promise<{ users: UserSummary[]; total: number }> {
    const range = rangeBounds(dateRange.from, dateRange.to);
    const paidStatuses = getPaidStatuses(app);

    const profilesResult = await client
      .from("profiles")
      .select("id,email,name,created_at,credits")
      .gte("created_at", range.fromIso)
      .lt("created_at", range.toIsoExclusive)
      .order("created_at", { ascending: false });

    const profiles = (profilesResult.data ?? []) as ProfileRow[];
    if (profiles.length === 0) {
      return { users: [], total: 0 };
    }

    const profileIds = profiles.map((p) => p.id);

    const [eventsResult, allOrders] = await Promise.all([
      client
        .from("events")
        .select("id,user_id,event_type,metadata,created_at")
        .in("user_id", profileIds)
        .lt("created_at", range.toIsoExclusive),
      fetchOrders(client, {
        userIds: profileIds,
        onlyPaid: true,
        paidStatuses,
        toIsoExclusive: range.toIsoExclusive,
      }),
    ]);

    const allEvents = (eventsResult.data ?? []) as EventRow[];

    // Group by user
    const eventsByUser = new Map<string, EventRow[]>();
    const ordersByUser = new Map<string, OrderRow[]>();
    for (const uid of profileIds) {
      eventsByUser.set(uid, []);
      ordersByUser.set(uid, []);
    }
    for (const ev of allEvents) {
      if (ev.user_id) eventsByUser.get(ev.user_id)?.push(ev);
    }
    for (const order of allOrders) {
      if (order.user_id) ordersByUser.get(order.user_id)?.push(order);
    }

    const users: UserSummary[] = profiles.map((profile) => {
      const userEvents = eventsByUser.get(profile.id) ?? [];
      const userOrders = ordersByUser.get(profile.id) ?? [];

      // Revenue
      let creditRevenue = 0;
      for (const ev of userEvents) {
        if (ev.event_type === "credit_purchase_initiated") {
          creditRevenue += toNumber(toMeta(ev.metadata).amount_usd);
        }
      }
      let productRevenue = 0;
      for (const order of userOrders) {
        productRevenue += toNumber(order.total_cost);
      }
      const revenue = creditRevenue + productRevenue;
      const cost = userOrders.reduce((sum, order) => sum + orderFulfillmentCost(order), 0);
      const margin = revenue - cost;

      const generations = userEvents.filter((ev) =>
        ACTIVATION_EVENTS.has(ev.event_type)
      ).length;

      const lastEvent = userEvents
        .sort((a, b) => b.created_at.localeCompare(a.created_at))[0];

      // Funnel
      const hasGeneration = userEvents.some((ev) =>
        ACTIVATION_EVENTS.has(ev.event_type)
      );
      const hasPurchase = creditRevenue > 0 || userOrders.length > 0;
      let funnelStage: UserSummary["funnelStage"] = "signed_up";
      if (hasPurchase) {
        // Check retention: activity 7+ days after first purchase
        const purchaseDates = [
          ...userEvents
            .filter((ev) => ev.event_type === "credit_purchase_initiated")
            .map((ev) => new Date(ev.created_at).getTime()),
          ...userOrders.map((o) => new Date(o.created_at).getTime()),
        ].sort((a, b) => a - b);
        const firstPurchase = purchaseDates[0];
        const retained = userEvents.some((ev) => {
          const t = new Date(ev.created_at).getTime();
          return t >= firstPurchase + 7 * 24 * 60 * 60 * 1000;
        });
        funnelStage = retained ? "retained" : "purchased";
      } else if (hasGeneration) {
        funnelStage = "first_gen";
      } else if (userEvents.length > 0) {
        funnelStage = "onboarded";
      }

      return {
        id: profile.id,
        email: profile.email || "",
        name: profile.name || profile.email || profile.id,
        joinedAt: profile.created_at,
        lastActive: lastEvent?.created_at || profile.created_at,
        revenue,
        cost,
        margin,
        marginPercent: revenue > 0 ? (margin / revenue) * 100 : 0,
        generations,
        funnelStage,
        profitability: margin > 5 ? "profitable" : margin >= 0 ? "marginal" : "unprofitable",
        plan: "free" as const,
      };
    });

    return { users, total: users.length };
  },

  /* ======================== USER DETAIL ======================== */
  async fetchUserDetail({ app, client, dateRange, userId }): Promise<UserDetail | null> {
    const range = rangeBounds(dateRange.from, dateRange.to);
    const paidStatuses = new Set(getPaidStatuses(app));

    const profileResult = await client
      .from("profiles")
      .select("id,email,name,created_at,credits")
      .eq("id", userId)
      .single();

    if (!profileResult.data) return null;
    const profile = profileResult.data as ProfileRow;

    const [eventsResult, allOrders] = await Promise.all([
      client
        .from("events")
        .select("id,user_id,event_type,metadata,created_at")
        .eq("user_id", userId)
        .lt("created_at", range.toIsoExclusive)
        .order("created_at", { ascending: true }),
      fetchOrders(client, {
        userId,
        toIsoExclusive: range.toIsoExclusive,
        orderBy: "desc",
      }),
    ]);

    const allEvents = (eventsResult.data ?? []) as EventRow[];

    const rangeEvents = allEvents.filter(
      (ev) => ev.created_at >= range.fromIso && ev.created_at < range.toIsoExclusive
    );
    const rangeOrders = allOrders.filter(
      (o) => o.created_at >= range.fromIso && o.created_at < range.toIsoExclusive
    );

    // Lifetime revenue
    let lifetimeCreditRev = 0;
    let lifetimeProductRev = 0;
    for (const ev of allEvents) {
      if (ev.event_type === "credit_purchase_initiated") {
        lifetimeCreditRev += toNumber(toMeta(ev.metadata).amount_usd);
      }
    }
    for (const order of allOrders) {
      if (isPaidOrderStatus(order.status, paidStatuses)) {
        lifetimeProductRev += toNumber(order.total_cost);
      }
    }
    const lifetimePrintingCost = allOrders
      .filter((order) => isPaidOrderStatus(order.status, paidStatuses))
      .reduce((sum, order) => sum + toNumber(order.printing_cost), 0);
    const lifetimeShippingCost = allOrders
      .filter((order) => isPaidOrderStatus(order.status, paidStatuses))
      .reduce((sum, order) => sum + toNumber(order.shipping_cost), 0);
    const lifetimeCost = lifetimePrintingCost + lifetimeShippingCost;
    const lifetimeRevenue = lifetimeCreditRev + lifetimeProductRev;

    // Range revenue
    let rangeCreditRev = 0;
    let rangeProductRev = 0;
    for (const ev of rangeEvents) {
      if (ev.event_type === "credit_purchase_initiated") {
        rangeCreditRev += toNumber(toMeta(ev.metadata).amount_usd);
      }
    }
    for (const order of rangeOrders) {
      if (isPaidOrderStatus(order.status, paidStatuses)) {
        rangeProductRev += toNumber(order.total_cost);
      }
    }
    const rangePrintingCost = rangeOrders
      .filter((order) => isPaidOrderStatus(order.status, paidStatuses))
      .reduce((sum, order) => sum + toNumber(order.printing_cost), 0);
    const rangeShippingCost = rangeOrders
      .filter((order) => isPaidOrderStatus(order.status, paidStatuses))
      .reduce((sum, order) => sum + toNumber(order.shipping_cost), 0);
    const rangeCost = rangePrintingCost + rangeShippingCost;
    const rangeRevenue = rangeCreditRev + rangeProductRev;

    const lifetimeGenerations = allEvents.filter((ev) =>
      ACTIVATION_EVENTS.has(ev.event_type)
    ).length;
    const lifetimeSessions = allEvents.filter(
      (ev) => ev.event_type === "login"
    ).length;
    const lifetimeProductPurchases = allOrders.filter((o) =>
      isPaidOrderStatus(o.status, paidStatuses)
    ).length;

    const monthsSinceSignup = Math.max(
      1,
      (new Date().getFullYear() - new Date(profile.created_at).getFullYear()) * 12 +
        (new Date().getMonth() - new Date(profile.created_at).getMonth())
    );

    // Daily trends
    const dayLabels = initializeDailyMap(dateRange);
    const revenueByDay = new Map<string, { revenue: number; cost: number; generations: number }>();
    for (const key of dayLabels.keys()) {
      revenueByDay.set(key, { revenue: 0, cost: 0, generations: 0 });
    }

    for (const ev of rangeEvents) {
      const key = dayKey(ev.created_at);
      const current = revenueByDay.get(key);
      if (!current) continue;
      if (ev.event_type === "credit_purchase_initiated") {
        current.revenue += toNumber(toMeta(ev.metadata).amount_usd);
      }
      if (ACTIVATION_EVENTS.has(ev.event_type)) {
        current.generations += 1;
      }
    }
    for (const order of rangeOrders) {
      if (!isPaidOrderStatus(order.status, paidStatuses)) continue;
      const key = dayKey(order.created_at);
      const current = revenueByDay.get(key);
      if (current) {
        current.revenue += toNumber(order.total_cost);
        current.cost += orderFulfillmentCost(order);
      }
    }

    const revenueTrend: TimeSeriesDataPoint[] = Array.from(dayLabels.entries()).map(
      ([key, label]) => {
        const value = revenueByDay.get(key) ?? { revenue: 0, cost: 0, generations: 0 };
        return { date: label, revenue: value.revenue, cost: value.cost };
      }
    );

    const activityTrend: TimeSeriesDataPoint[] = Array.from(dayLabels.entries()).map(
      ([key, label]) => ({
        date: label,
        generations: revenueByDay.get(key)?.generations ?? 0,
      })
    );

    // Payments: credit purchases + orders
    const payments: UserPayment[] = [];
    for (const ev of rangeEvents) {
      if (ev.event_type === "credit_purchase_initiated") {
        payments.push({
          id: ev.id,
          date: ev.created_at,
          amount: toNumber(toMeta(ev.metadata).amount_usd),
          type: "Credit Purchase",
          status: "completed" as const,
        });
      }
    }
    for (const order of rangeOrders) {
      payments.push({
        id: order.id,
        date: order.created_at,
        amount: toNumber(order.total_cost),
        type: "Product Order",
        status: toPaymentStatus(order.status),
      });
    }
    payments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Recent activity
    const recentActivity: UserAction[] = [...rangeEvents]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 20)
      .map((ev) => {
        const meta = toMeta(ev.metadata);
        return {
          id: ev.id,
          timestamp: ev.created_at,
          action: humanizeEvent(ev.event_type),
          detail: JSON.stringify(meta).slice(0, 220),
          creditsCost: toNumber(meta.credits_used) || toNumber(meta.amount),
        };
      });

    // Funnel stage
    const hasGen = allEvents.some((ev) => ACTIVATION_EVENTS.has(ev.event_type));
    const hasPurchase = lifetimeCreditRev > 0 || lifetimeProductPurchases > 0;
    let funnelStage: UserDetail["funnelStage"] = "signed_up";
    if (hasPurchase) {
      const purchaseTimes = [
        ...allEvents
          .filter((ev) => ev.event_type === "credit_purchase_initiated")
          .map((ev) => new Date(ev.created_at).getTime()),
        ...allOrders
          .filter((o) => isPaidOrderStatus(o.status, paidStatuses))
          .map((o) => new Date(o.created_at).getTime()),
      ].sort((a, b) => a - b);
      const firstPurchase = purchaseTimes[0];
      const retained = allEvents.some((ev) => {
        const t = new Date(ev.created_at).getTime();
        return t >= firstPurchase + 7 * 24 * 60 * 60 * 1000;
      });
      funnelStage = retained ? "retained" : "purchased";
    } else if (hasGen) {
      funnelStage = "first_gen";
    } else if (allEvents.length > 0) {
      funnelStage = "onboarded";
    }

    const creditsRemaining = toNumber(profile.credits);

    return {
      id: profile.id,
      email: profile.email || "",
      name: profile.name || profile.email || profile.id,
      plan: "free",
      funnelStage,
      joinedAt: profile.created_at,
      lastActive:
        allEvents.length > 0
          ? allEvents[allEvents.length - 1].created_at
          : profile.created_at,
      metrics: {
        revenue: rangeRevenue,
        cost: rangeCost,
        margin: rangeRevenue - rangeCost,
        marginPercent: rangeRevenue > 0 ? ((rangeRevenue - rangeCost) / rangeRevenue) * 100 : 0,
        ltv: ((lifetimeRevenue - lifetimeCost) / monthsSinceSignup) * 12 * 0.7,
        creditsPurchased: lifetimeCreditRev,
        creditsSpent: lifetimeCreditRev - creditsRemaining,
        creditsRemaining,
        generations: lifetimeGenerations,
        sessions: lifetimeSessions,
        avgSessionDuration: 0, // no session duration data
        revenueTrend,
        activityTrend,
        revenueBySource: {
          credits: lifetimeCreditRev,
          productSales: lifetimeProductRev,
          subscriptions: 0,
          other: 0,
        },
        costBreakdown: {
          api: 0,
          printing: rangePrintingCost,
          shipping: rangeShippingCost,
          other: 0,
        },
        productPurchases: lifetimeProductPurchases,
      },
      payments,
      recentActivity,
    };
  },
};
