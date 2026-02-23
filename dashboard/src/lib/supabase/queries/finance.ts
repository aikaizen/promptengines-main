import { SupabaseClient } from "@supabase/supabase-js";
import { DateRange, FinanceMetrics, TimeSeriesDataPoint } from "@/types/metrics";
import { format, eachDayOfInterval } from "date-fns";

export async function fetchFinanceMetrics(
  client: SupabaseClient,
  dateRange: DateRange
): Promise<FinanceMetrics> {
  const fromStr = format(dateRange.from, "yyyy-MM-dd");
  const toStr = format(dateRange.to, "yyyy-MM-dd");

  // Fetch credit/subscription payments
  const { data: payments } = await client
    .from("payments")
    .select("amount, created_at, type")
    .gte("created_at", fromStr)
    .lte("created_at", toStr)
    .eq("status", "succeeded");

  const totalPaymentRevenue = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

  // Fetch product/order revenue (e.g. book purchases in Storybook Studio)
  // Table may not exist for all apps — gracefully handle missing table
  let orders: { amount: number; created_at: string; type: string }[] | null = null;
  try {
    const res = await client
      .from("orders")
      .select("amount, created_at, type")
      .gte("created_at", fromStr)
      .lte("created_at", toStr)
      .eq("status", "completed");
    orders = res.data;
  } catch {
    // orders table doesn't exist for this app
  }

  const productRevenue = orders?.reduce((sum, o) => sum + (o.amount || 0), 0) || 0;

  const totalRevenue = totalPaymentRevenue + productRevenue;

  // Classify payment revenue by source
  let creditRevenue = 0;
  let subscriptionRevenue = 0;
  for (const p of payments ?? []) {
    if (p.type === "subscription") {
      subscriptionRevenue += p.amount || 0;
    } else {
      creditRevenue += p.amount || 0;
    }
  }

  // Fetch credit purchases
  const { data: creditPurchases } = await client
    .from("credit_transactions")
    .select("credits, type, created_at")
    .gte("created_at", fromStr)
    .lte("created_at", toStr);

  const creditsPurchased =
    creditPurchases
      ?.filter((t) => t.type === "purchase")
      .reduce((sum, t) => sum + (t.credits || 0), 0) || 0;

  const creditsSpent =
    creditPurchases
      ?.filter((t) => t.type === "spend")
      .reduce((sum, t) => sum + Math.abs(t.credits || 0), 0) || 0;

  // Fetch API costs (LLM generation)
  const { data: apiCosts } = await client
    .from("api_costs")
    .select("cost, created_at")
    .gte("created_at", fromStr)
    .lte("created_at", toStr);

  const apiCostTotal = apiCosts?.reduce((sum, c) => sum + (c.cost || 0), 0) || 0;

  // Fetch fulfillment costs (printing + shipping for physical products)
  // Table may not exist for all apps — gracefully handle missing table
  let fulfillmentCosts: { printing_cost: number; shipping_cost: number; created_at: string }[] | null = null;
  try {
    const res = await client
      .from("fulfillment_costs")
      .select("printing_cost, shipping_cost, created_at")
      .gte("created_at", fromStr)
      .lte("created_at", toStr);
    fulfillmentCosts = res.data;
  } catch {
    // fulfillment_costs table doesn't exist for this app
  }

  const printingCost = fulfillmentCosts?.reduce((sum, f) => sum + (f.printing_cost || 0), 0) || 0;
  const shippingCost = fulfillmentCosts?.reduce((sum, f) => sum + (f.shipping_cost || 0), 0) || 0;

  const cogs = apiCostTotal + printingCost + shippingCost;
  const margin = totalRevenue > 0 ? ((totalRevenue - cogs) / totalRevenue) * 100 : 0;

  // Revenue trend
  const days = eachDayOfInterval({ start: dateRange.from, end: dateRange.to });
  const revenueTrend: TimeSeriesDataPoint[] = days.map((day) => {
    const dayStr = format(day, "yyyy-MM-dd");
    const dayPaymentRevenue =
      payments
        ?.filter((p) => p.created_at?.startsWith(dayStr))
        .reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
    const dayProductRevenue =
      orders
        ?.filter((o) => o.created_at?.startsWith(dayStr))
        .reduce((sum, o) => sum + (o.amount || 0), 0) || 0;
    return {
      date: format(day, "MMM dd"),
      revenue: (dayPaymentRevenue + dayProductRevenue) / 100,
    };
  });

  const cogsTrend: TimeSeriesDataPoint[] = days.map((day) => {
    const dayStr = format(day, "yyyy-MM-dd");
    const dayApiCogs =
      apiCosts
        ?.filter((c) => c.created_at?.startsWith(dayStr))
        .reduce((sum, c) => sum + (c.cost || 0), 0) || 0;
    const dayFulfillment =
      fulfillmentCosts
        ?.filter((f) => f.created_at?.startsWith(dayStr))
        .reduce((sum, f) => sum + (f.printing_cost || 0) + (f.shipping_cost || 0), 0) || 0;
    return {
      date: format(day, "MMM dd"),
      cogs: dayApiCogs + dayFulfillment,
    };
  });

  return {
    totalRevenue: totalRevenue / 100,
    monthlyRevenue: totalRevenue / 100,
    creditsPurchased,
    creditsSpent,
    cogs,
    margin: Math.round(margin * 10) / 10,
    revenueTrend,
    cogsTrend,
    revenueByApp: [],
    revenueBySource: {
      credits: creditRevenue / 100,
      productSales: productRevenue / 100,
      subscriptions: subscriptionRevenue / 100,
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
