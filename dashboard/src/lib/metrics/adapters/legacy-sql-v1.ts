import { addDays, eachDayOfInterval, format } from "date-fns";
import { fetchEngagementMetrics } from "@/lib/supabase/queries/engagement";
import { fetchGrowthMetrics } from "@/lib/supabase/queries/growth";
import { fetchReliabilityMetrics } from "@/lib/supabase/queries/reliability";
import { fetchUserDetail, fetchUserMetrics } from "@/lib/supabase/queries/users";
import { MetricsAdapter } from "@/lib/metrics/adapters/types";
import { DateRange, FinanceMetrics, TimeSeriesDataPoint, UnitEconomics } from "@/types/metrics";
import { MoneyUnit } from "@/types/apps";

function toUsd(amount: number, moneyUnit: MoneyUnit): number {
  if (!Number.isFinite(amount)) return 0;
  return moneyUnit === "usd_cents" ? amount / 100 : amount;
}

function sum(values: Array<number | null | undefined>): number {
  return values.reduce<number>((total, value) => {
    const numeric = typeof value === "number" ? value : Number(value);
    return Number.isFinite(numeric) ? total + numeric : total;
  }, 0);
}

function buildRange(dateRange: DateRange) {
  const fromStr = format(dateRange.from, "yyyy-MM-dd");
  const toStr = format(dateRange.to, "yyyy-MM-dd");
  const toExclusiveStr = format(addDays(dateRange.to, 1), "yyyy-MM-dd");
  return { fromStr, toStr, toExclusiveStr };
}

async function fetchLegacyFinanceWithConfig(
  context: Parameters<MetricsAdapter["fetchFinance"]>[0]
): Promise<FinanceMetrics> {
  const { client, app, dateRange } = context;
  const { fromStr, toExclusiveStr } = buildRange(dateRange);

  const { data: payments } = await client
    .from("payments")
    .select("amount, created_at, type, status")
    .gte("created_at", fromStr)
    .lt("created_at", toExclusiveStr)
    .in("status", app.paymentSuccessStatuses);

  const paymentRows = payments ?? [];

  const orderResult = await client
    .from("orders")
    .select("amount, created_at, status")
    .gte("created_at", fromStr)
    .lt("created_at", toExclusiveStr)
    .eq("status", "completed");
  const orders = orderResult.error ? [] : orderResult.data ?? [];

  const { data: creditTransactions } = await client
    .from("credit_transactions")
    .select("credits, type, created_at")
    .gte("created_at", fromStr)
    .lt("created_at", toExclusiveStr);

  const { data: apiCosts } = await client
    .from("api_costs")
    .select("cost, created_at")
    .gte("created_at", fromStr)
    .lt("created_at", toExclusiveStr);

  const fulfillmentResult = await client
    .from("fulfillment_costs")
    .select("printing_cost, shipping_cost, created_at")
    .gte("created_at", fromStr)
    .lt("created_at", toExclusiveStr);
  const fulfillmentCosts = fulfillmentResult.error ? [] : fulfillmentResult.data ?? [];

  const totalPaymentRevenueRaw = sum(paymentRows.map((p) => Number(p.amount || 0)));
  const productRevenueRaw = sum(orders.map((o) => Number(o.amount || 0)));

  const totalPaymentRevenue = toUsd(totalPaymentRevenueRaw, app.moneyUnit);
  const productRevenue = toUsd(productRevenueRaw, app.moneyUnit);
  const totalRevenue = totalPaymentRevenue + productRevenue;

  let creditRevenueRaw = 0;
  let subscriptionRevenueRaw = 0;
  for (const payment of paymentRows) {
    if (payment.type === "subscription") {
      subscriptionRevenueRaw += Number(payment.amount || 0);
    } else {
      creditRevenueRaw += Number(payment.amount || 0);
    }
  }

  const creditsPurchased =
    creditTransactions
      ?.filter((row) => row.type === "purchase")
      .reduce((acc, row) => acc + Number(row.credits || 0), 0) ?? 0;

  const creditsSpent =
    creditTransactions
      ?.filter((row) => row.type === "spend")
      .reduce((acc, row) => acc + Math.abs(Number(row.credits || 0)), 0) ?? 0;

  const apiCostTotal = sum(apiCosts?.map((row) => Number(row.cost || 0)) ?? []);
  const printingCost = sum(fulfillmentCosts.map((row) => Number(row.printing_cost || 0)));
  const shippingCost = sum(fulfillmentCosts.map((row) => Number(row.shipping_cost || 0)));

  const cogs = apiCostTotal + printingCost + shippingCost;
  const margin = totalRevenue > 0 ? ((totalRevenue - cogs) / totalRevenue) * 100 : 0;

  const days = eachDayOfInterval({ start: dateRange.from, end: dateRange.to });
  const revenueTrend: TimeSeriesDataPoint[] = days.map((day) => {
    const dayStr = format(day, "yyyy-MM-dd");
    const dayPaymentRevenueRaw = sum(
      paymentRows
        .filter((row) => row.created_at?.startsWith(dayStr))
        .map((row) => Number(row.amount || 0))
    );
    const dayProductRevenueRaw = sum(
      orders
        .filter((row) => row.created_at?.startsWith(dayStr))
        .map((row) => Number(row.amount || 0))
    );

    return {
      date: format(day, "MMM dd"),
      revenue: toUsd(dayPaymentRevenueRaw + dayProductRevenueRaw, app.moneyUnit),
    };
  });

  const cogsTrend: TimeSeriesDataPoint[] = days.map((day) => {
    const dayStr = format(day, "yyyy-MM-dd");
    const dayApiCost = sum(
      (apiCosts ?? [])
        .filter((row) => row.created_at?.startsWith(dayStr))
        .map((row) => Number(row.cost || 0))
    );
    const dayFulfillment = sum(
      fulfillmentCosts
        .filter((row) => row.created_at?.startsWith(dayStr))
        .map((row) => Number(row.printing_cost || 0) + Number(row.shipping_cost || 0))
    );

    return {
      date: format(day, "MMM dd"),
      cogs: dayApiCost + dayFulfillment,
    };
  });

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
    revenueBySource: {
      credits: toUsd(creditRevenueRaw, app.moneyUnit),
      productSales: toUsd(productRevenueRaw, app.moneyUnit),
      subscriptions: toUsd(subscriptionRevenueRaw, app.moneyUnit),
      other: 0,
    },
    costBreakdown: {
      api: apiCostTotal,
      printing: printingCost,
      shipping: shippingCost,
      other: 0,
    },
  };
}

async function fetchLegacyUnitEconomicsWithConfig(
  context: Parameters<MetricsAdapter["fetchUnitEconomics"]>[0]
): Promise<UnitEconomics> {
  const { client, app, dateRange } = context;

  const { count: totalUsers } = await client
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .lte("created_at", dateRange.to.toISOString());

  const { data: payingUserRows } = await client
    .from("payments")
    .select("user_id")
    .in("status", app.paymentSuccessStatuses)
    .lte("created_at", dateRange.to.toISOString());

  const payingUsers = new Set(
    (payingUserRows ?? [])
      .map((row) => row.user_id)
      .filter((value): value is string => Boolean(value))
  ).size;

  const { data: revenueData } = await client
    .from("payments")
    .select("amount, type, status")
    .in("status", app.paymentSuccessStatuses)
    .gte("created_at", dateRange.from.toISOString())
    .lte("created_at", dateRange.to.toISOString());

  let creditRevenueRaw = 0;
  let subscriptionRevenueRaw = 0;
  for (const payment of revenueData ?? []) {
    if (payment.type === "subscription") {
      subscriptionRevenueRaw += Number(payment.amount || 0);
    } else {
      creditRevenueRaw += Number(payment.amount || 0);
    }
  }

  const orderResult = await client
    .from("orders")
    .select("amount")
    .eq("status", "completed")
    .gte("created_at", dateRange.from.toISOString())
    .lte("created_at", dateRange.to.toISOString());
  const orderRows = orderResult.error ? [] : orderResult.data ?? [];
  const productRevenueRaw = sum(orderRows.map((row) => Number(row.amount || 0)));

  const totalRevenue =
    toUsd(creditRevenueRaw, app.moneyUnit) +
    toUsd(subscriptionRevenueRaw, app.moneyUnit) +
    toUsd(productRevenueRaw, app.moneyUnit);

  const { data: costRows } = await client
    .from("api_costs")
    .select("cost")
    .gte("created_at", dateRange.from.toISOString())
    .lte("created_at", dateRange.to.toISOString());
  const apiCost = sum((costRows ?? []).map((row) => Number(row.cost || 0)));

  const fulfillmentResult = await client
    .from("fulfillment_costs")
    .select("printing_cost, shipping_cost")
    .gte("created_at", dateRange.from.toISOString())
    .lte("created_at", dateRange.to.toISOString());
  const fulfillmentRows = fulfillmentResult.error ? [] : fulfillmentResult.data ?? [];

  const printingCost = sum(fulfillmentRows.map((row) => Number(row.printing_cost || 0)));
  const shippingCost = sum(fulfillmentRows.map((row) => Number(row.shipping_cost || 0)));
  const totalCost = apiCost + printingCost + shippingCost;

  const users = totalUsers ?? 0;
  const arpu = users > 0 ? totalRevenue / users : 0;
  const costPerUser = users > 0 ? totalCost / users : 0;
  const marginPerUser = arpu - costPerUser;
  const ltv = arpu * 12 * 0.7;

  return {
    arpu,
    costPerUser,
    marginPerUser,
    ltv,
    payingUsers,
    totalUsers: users,
    revenueBySource: {
      credits: toUsd(creditRevenueRaw, app.moneyUnit),
      productSales: toUsd(productRevenueRaw, app.moneyUnit),
      subscriptions: toUsd(subscriptionRevenueRaw, app.moneyUnit),
      other: 0,
    },
    costBreakdown: {
      api: apiCost,
      printing: printingCost,
      shipping: shippingCost,
      other: 0,
    },
  };
}

export const legacySqlV1Adapter: MetricsAdapter = {
  id: "legacy-sql-v1",
  async fetchGrowth(context) {
    return fetchGrowthMetrics(context.client, context.dateRange);
  },
  async fetchFinance(context) {
    return fetchLegacyFinanceWithConfig(context);
  },
  async fetchEngagement(context) {
    return fetchEngagementMetrics(context.client, context.dateRange);
  },
  async fetchReliability(context) {
    return fetchReliabilityMetrics(context.client, context.dateRange);
  },
  async fetchUnitEconomics(context) {
    return fetchLegacyUnitEconomicsWithConfig(context);
  },
  async fetchUsers(context) {
    return fetchUserMetrics(context.client, context.dateRange);
  },
  async fetchUserDetail(context) {
    return fetchUserDetail(context.client, context.userId, context.dateRange);
  },
};
