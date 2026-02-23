export type RevenueModel = "credits" | "credits_and_products";
export type AdapterId =
  | "kaizen-telemetry-v1"
  | "legacy-sql-v1"
  | "storybook-v1"
  | "neon-telemetry-v1";
export type MoneyUnit = "usd_decimal" | "usd_cents";
export type TelemetryIdentityField = "account_id" | "user_id";

export interface TelemetryGrowthConfig {
  signupEventName?: string;
  activityEventName?: string;
  identityField?: TelemetryIdentityField;
}

export interface AppConfig {
  id: string;
  name: string;
  description: string;
  supabaseUrl: string;
  supabaseServiceRoleKey: string;
  icon: string;
  color: string;
  status: "active" | "coming_soon" | "deprecated";
  revenueModel: RevenueModel;
  adapter: AdapterId;
  contractVersion: "1.0";
  moneyUnit: MoneyUnit;
  paymentSuccessStatuses: string[];
  telemetryGrowth?: TelemetryGrowthConfig;
  neonDatabaseUrl?: string;
}

export type AppId =
  | "kaizen"
  | "storybook-studio"
  | "bible"
  | "promptengines-web"
  | "flow";

export interface DashboardUser {
  id: string;
  email: string;
  role: "owner" | "admin" | "analyst" | "viewer";
  created_at: string;
}
