export interface DateRange {
  from: Date;
  to: Date;
}

export interface KpiMetric {
  label: string;
  value: number;
  previousValue: number;
  format: "number" | "currency" | "percent";
  prefix?: string;
}

export interface TimeSeriesDataPoint {
  date: string;
  [key: string]: string | number;
}

export interface CohortData {
  cohort: string;
  [key: string]: string | number;
}

export interface StatusIndicator {
  label: string;
  status: "healthy" | "warning" | "critical";
  detail: string;
}

export interface TileProps {
  appId: string;
  dateRange: DateRange;
  className?: string;
}

export interface GrowthMetrics {
  totalUsers: number;
  newUsersToday: number;
  dau: number;
  wau: number;
  mau: number;
  stickiness: number;
  dauTrend: TimeSeriesDataPoint[];
  newUsersTrend: TimeSeriesDataPoint[];
  retentionCohorts: CohortData[];
}

export interface FinanceMetrics {
  totalRevenue: number;
  monthlyRevenue: number;
  creditsPurchased: number;
  creditsSpent: number;
  cogs: number;
  margin: number;
  revenueTrend: TimeSeriesDataPoint[];
  cogsTrend: TimeSeriesDataPoint[];
  revenueByApp: { app: string; revenue: number }[];
  revenueBySource?: RevenueBySource;
  costBreakdown?: CostBreakdown;
}

export interface EngagementMetrics {
  avgSessionDuration: number;
  sessionsPerUser: number;
  actionsPerSession: number;
  activationRate: number;
  topFeatures: { feature: string; usage: number }[];
  sessionTrend: TimeSeriesDataPoint[];
}

export interface ReliabilityMetrics {
  errorRate: number;
  p50Latency: number;
  p95Latency: number;
  p99Latency: number;
  successRate: number;
  errorTrend: TimeSeriesDataPoint[];
  latencyTrend: TimeSeriesDataPoint[];
  statusIndicators: StatusIndicator[];
}

// Revenue & cost breakdowns — apps can earn from credits, product sales, subscriptions
export interface RevenueBySource {
  credits: number;
  productSales: number;  // e.g. Storybook Studio book purchases
  subscriptions: number;
  other: number;
}

export interface CostBreakdown {
  api: number;           // LLM / generation API costs
  printing: number;      // physical product printing (books, etc.)
  shipping: number;      // fulfillment / shipping costs
  other: number;
}

// Unit Economics
export interface UnitEconomics {
  arpu: number;
  costPerUser: number;
  marginPerUser: number;
  ltv: number;
  payingUsers: number;
  totalUsers: number;
  revenueBySource?: RevenueBySource;
  costBreakdown?: CostBreakdown;
}

// User list & detail types
export type ProfitabilityStatus = "profitable" | "marginal" | "unprofitable";
export type FunnelStage = "signed_up" | "onboarded" | "first_gen" | "purchased" | "retained";

export interface UserSummary {
  id: string;
  email: string;
  name: string;
  joinedAt: string;
  lastActive: string;
  revenue: number;
  cost: number;
  margin: number;
  marginPercent: number;
  generations: number;
  funnelStage: FunnelStage;
  profitability: ProfitabilityStatus;
  plan: "free" | "starter" | "pro" | "enterprise";
}

export interface UserPayment {
  id: string;
  date: string;
  amount: number;
  type: string;
  status:
    | "completed"
    | "pending"
    | "refunded"
    | "paid"
    | "printing"
    | "shipped"
    | "failed"
    | "canceled";
}

export interface UserAction {
  id: string;
  timestamp: string;
  action: string;
  detail: string;
  creditsCost: number;
}

export interface UserMetrics {
  revenue: number;
  cost: number;
  margin: number;
  marginPercent: number;
  ltv: number;
  creditsPurchased: number;
  creditsSpent: number;
  creditsRemaining: number;
  generations: number;
  sessions: number;
  avgSessionDuration: number;
  revenueTrend: TimeSeriesDataPoint[];
  activityTrend: TimeSeriesDataPoint[];
  revenueBySource?: RevenueBySource;
  costBreakdown?: CostBreakdown;
  productPurchases?: number;  // e.g. books ordered
}

export interface UserDetail {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  plan: "free" | "starter" | "pro" | "enterprise";
  funnelStage: FunnelStage;
  joinedAt: string;
  lastActive: string;
  metrics: UserMetrics;
  payments: UserPayment[];
  recentActivity: UserAction[];
}

export interface FunnelDataPoint {
  stage: string;
  stageKey: FunnelStage;
  users: number;
  conversionRate: number;
  dropOffRate: number;
}
