import { SupabaseClient } from "@supabase/supabase-js";
import { AppConfig } from "@/types/apps";
import {
  DateRange,
  EngagementMetrics,
  FinanceMetrics,
  GrowthMetrics,
  ReliabilityMetrics,
  UnitEconomics,
  UserDetail,
  UserSummary,
} from "@/types/metrics";

export interface MetricsAdapterContext {
  app: AppConfig;
  client: SupabaseClient;
  dateRange: DateRange;
}

export interface MetricsUserDetailContext extends MetricsAdapterContext {
  userId: string;
}

export interface MetricsAdapter {
  id: AppConfig["adapter"];
  fetchGrowth(context: MetricsAdapterContext): Promise<GrowthMetrics>;
  fetchFinance(context: MetricsAdapterContext): Promise<FinanceMetrics>;
  fetchEngagement(context: MetricsAdapterContext): Promise<EngagementMetrics>;
  fetchReliability(context: MetricsAdapterContext): Promise<ReliabilityMetrics>;
  fetchUnitEconomics(context: MetricsAdapterContext): Promise<UnitEconomics>;
  fetchUsers(context: MetricsAdapterContext): Promise<{ users: UserSummary[]; total: number }>;
  fetchUserDetail(context: MetricsUserDetailContext): Promise<UserDetail | null>;
}
