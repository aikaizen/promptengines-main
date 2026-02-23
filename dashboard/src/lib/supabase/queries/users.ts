import { SupabaseClient } from "@supabase/supabase-js";
import { DateRange, UserSummary, UserDetail } from "@/types/metrics";

export async function fetchUserMetrics(
  client: SupabaseClient,
  dateRange: DateRange
): Promise<{ users: UserSummary[]; total: number }> {
  try {
    const { data: profiles, error } = await client
      .from("profiles")
      .select("*")
      .gte("created_at", dateRange.from.toISOString())
      .lte("created_at", dateRange.to.toISOString());

    if (error || !profiles) {
      return { users: [], total: 0 };
    }

    // Transform profiles into UserSummary format
    // Revenue includes both credit/subscription payments AND product sales (books, etc.)
    const users: UserSummary[] = profiles.map((profile) => {
      const creditRevenue = profile.total_revenue || 0;
      const productRevenue = profile.total_product_revenue || 0;
      const totalRevenue = creditRevenue + productRevenue;

      const apiCost = profile.total_cost || 0;
      const fulfillmentCost = profile.total_fulfillment_cost || 0;
      const totalCost = apiCost + fulfillmentCost;

      const margin = totalRevenue - totalCost;

      return {
        id: profile.id,
        email: profile.email || "",
        name: profile.full_name || profile.email || "",
        joinedAt: profile.created_at,
        lastActive: profile.last_active || profile.created_at,
        revenue: totalRevenue,
        cost: totalCost,
        margin,
        marginPercent: totalRevenue > 0 ? (margin / totalRevenue) * 100 : 0,
        generations: profile.total_generations || 0,
        funnelStage: profile.funnel_stage || "signed_up",
        profitability:
          margin > 5 ? "profitable" : margin >= 0 ? "marginal" : "unprofitable",
        plan: profile.plan || "free",
      };
    });

    return { users, total: users.length };
  } catch {
    return { users: [], total: 0 };
  }
}

export async function fetchUserDetail(
  client: SupabaseClient,
  userId: string,
  dateRange: DateRange
): Promise<UserDetail | null> {
  try {
    const { data: profile, error } = await client
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error || !profile) return null;

    // Revenue from credits/subscriptions + product sales
    const creditRevenue = profile.total_revenue || 0;
    const productRevenue = profile.total_product_revenue || 0;
    const totalRevenue = creditRevenue + productRevenue;

    // Costs: API + fulfillment (printing + shipping)
    const apiCost = profile.total_cost || 0;
    const printingCost = profile.printing_cost || 0;
    const shippingCost = profile.shipping_cost || 0;
    const totalCost = apiCost + printingCost + shippingCost;

    const margin = totalRevenue - totalCost;

    const detail: UserDetail = {
      id: profile.id,
      email: profile.email || "",
      name: profile.full_name || profile.email || "",
      avatarUrl: profile.avatar_url,
      plan: profile.plan || "free",
      funnelStage: profile.funnel_stage || "signed_up",
      joinedAt: profile.created_at,
      lastActive: profile.last_active || profile.created_at,
      metrics: {
        revenue: totalRevenue,
        cost: totalCost,
        margin,
        marginPercent: totalRevenue > 0 ? (margin / totalRevenue) * 100 : 0,
        ltv: (totalRevenue / Math.max(1, monthsSince(profile.created_at))) * 12 * 0.7,
        creditsPurchased: profile.credits_purchased || 0,
        creditsSpent: profile.credits_spent || 0,
        creditsRemaining: (profile.credits_purchased || 0) - (profile.credits_spent || 0),
        generations: profile.total_generations || 0,
        sessions: profile.total_sessions || 0,
        avgSessionDuration: profile.avg_session_duration || 0,
        revenueTrend: [],
        activityTrend: [],
        revenueBySource: {
          credits: creditRevenue * 0.7,
          productSales: productRevenue,
          subscriptions: creditRevenue * 0.3,
          other: 0,
        },
        costBreakdown: {
          api: apiCost,
          printing: printingCost,
          shipping: shippingCost,
          other: 0,
        },
        productPurchases: profile.product_purchases || 0,
      },
      payments: [],
      recentActivity: [],
    };

    // Fetch payments (credit purchases + subscriptions)
    const { data: payments } = await client
      .from("payments")
      .select("*")
      .eq("user_id", userId)
      .gte("created_at", dateRange.from.toISOString())
      .lte("created_at", dateRange.to.toISOString())
      .order("created_at", { ascending: false });

    // Fetch product orders (books, etc.)
    // Table may not exist for all apps
    let orders: Record<string, unknown>[] | null = null;
    try {
      const res = await client
        .from("orders")
        .select("*")
        .eq("user_id", userId)
        .gte("created_at", dateRange.from.toISOString())
        .lte("created_at", dateRange.to.toISOString())
        .order("created_at", { ascending: false });
      orders = res.data;
    } catch {
      // orders table doesn't exist for this app
    }

    if (payments) {
      detail.payments.push(
        ...payments.map((p) => ({
          id: p.id,
          date: p.created_at,
          amount: p.amount,
          type: p.type || "Credit Purchase",
          status: (p.status || "completed") as "completed" | "pending" | "refunded",
        }))
      );
    }

    if (orders) {
      detail.payments.push(
        ...orders.map((o) => ({
          id: String(o.id ?? ""),
          date: String(o.created_at ?? ""),
          amount: Number(o.amount ?? 0),
          type: String(o.product_type || "Book Purchase"),
          status: (String(o.status || "completed")) as "completed" | "pending" | "refunded",
        }))
      );
    }

    // Sort all payments by date descending
    detail.payments.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return detail;
  } catch {
    return null;
  }
}

function monthsSince(dateStr: string): number {
  const d = new Date(dateStr);
  const now = new Date();
  return Math.max(1, (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth()));
}
