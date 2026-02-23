import { SupabaseClient } from "@supabase/supabase-js";
import { DateRange, UnitEconomics } from "@/types/metrics";

export async function fetchUnitEconomics(
  client: SupabaseClient,
  dateRange: DateRange
): Promise<UnitEconomics> {
  try {
    // Count total and paying users
    const { count: totalUsers } = await client
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .lte("created_at", dateRange.to.toISOString());

    const { count: payingUsers } = await client
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("has_paid", true)
      .lte("created_at", dateRange.to.toISOString());

    // Credit/subscription revenue from payments table
    const { data: revenueData } = await client
      .from("payments")
      .select("amount, type")
      .eq("status", "completed")
      .gte("created_at", dateRange.from.toISOString())
      .lte("created_at", dateRange.to.toISOString());

    let creditRevenue = 0;
    let subscriptionRevenue = 0;
    for (const p of revenueData ?? []) {
      if (p.type === "subscription") {
        subscriptionRevenue += p.amount || 0;
      } else {
        creditRevenue += p.amount || 0;
      }
    }

    // Product sales revenue (e.g. book purchases)
    // Table may not exist for all apps
    let orderData: { amount: number }[] | null = null;
    try {
      const res = await client
        .from("orders")
        .select("amount")
        .eq("status", "completed")
        .gte("created_at", dateRange.from.toISOString())
        .lte("created_at", dateRange.to.toISOString());
      orderData = res.data;
    } catch {
      // orders table doesn't exist for this app
    }

    const productRevenue = orderData?.reduce((sum, o) => sum + (o.amount || 0), 0) ?? 0;

    const totalRevenue = creditRevenue + subscriptionRevenue + productRevenue;

    // API / LLM costs
    const { data: costData } = await client
      .from("api_costs")
      .select("cost")
      .gte("created_at", dateRange.from.toISOString())
      .lte("created_at", dateRange.to.toISOString());

    const apiCost = costData?.reduce((sum, c) => sum + (c.cost || 0), 0) ?? 0;

    // Fulfillment costs (printing + shipping for physical products)
    // Table may not exist for all apps
    let fulfillmentData: { printing_cost: number; shipping_cost: number }[] | null = null;
    try {
      const res = await client
        .from("fulfillment_costs")
        .select("printing_cost, shipping_cost")
        .gte("created_at", dateRange.from.toISOString())
        .lte("created_at", dateRange.to.toISOString());
      fulfillmentData = res.data;
    } catch {
      // fulfillment_costs table doesn't exist for this app
    }

    const printingCost = fulfillmentData?.reduce((sum, f) => sum + (f.printing_cost || 0), 0) ?? 0;
    const shippingCost = fulfillmentData?.reduce((sum, f) => sum + (f.shipping_cost || 0), 0) ?? 0;

    const totalCost = apiCost + printingCost + shippingCost;

    const users = totalUsers ?? 1;
    const arpu = users > 0 ? totalRevenue / users : 0;
    const costPerUser = users > 0 ? totalCost / users : 0;
    const marginPerUser = arpu - costPerUser;
    // LTV = monthly ARPU * 12 months * retention estimate (70%)
    const ltv = arpu * 12 * 0.7;

    return {
      arpu,
      costPerUser,
      marginPerUser,
      ltv,
      payingUsers: payingUsers ?? 0,
      totalUsers: users,
      revenueBySource: {
        credits: creditRevenue,
        productSales: productRevenue,
        subscriptions: subscriptionRevenue,
        other: 0,
      },
      costBreakdown: {
        api: apiCost,
        printing: printingCost,
        shipping: shippingCost,
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
    };
  }
}
