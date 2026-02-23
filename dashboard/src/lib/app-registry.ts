import { AppConfig, AppId } from "@/types/apps";

const apps: Record<AppId, AppConfig> = {
  kaizen: {
    id: "kaizen",
    name: "Kaizen",
    description: "AI-powered continuous improvement platform",
    supabaseUrl: process.env.KAIZEN_SUPABASE_URL || "",
    supabaseServiceRoleKey: process.env.KAIZEN_SUPABASE_SERVICE_ROLE_KEY || "",
    icon: "Zap",
    color: "hsl(var(--chart-1))",
    status: "active",
    revenueModel: "credits",
    adapter: "kaizen-telemetry-v1",
    contractVersion: "1.0",
    moneyUnit: "usd_decimal",
    paymentSuccessStatuses: ["succeeded"],
  },
  "storybook-studio": {
    id: "storybook-studio",
    name: "Storybook Studio",
    description: "AI story generation platform",
    supabaseUrl: process.env.STORYBOOK_SUPABASE_URL || "",
    supabaseServiceRoleKey:
      process.env.STORYBOOK_SUPABASE_SERVICE_ROLE_KEY || "",
    icon: "BookOpen",
    color: "hsl(var(--chart-2))",
    status: "active",
    revenueModel: "credits_and_products",
    adapter: "storybook-v1",
    contractVersion: "1.0",
    moneyUnit: "usd_decimal",
    paymentSuccessStatuses: ["paid", "printing", "shipped", "completed"],
  },
  bible: {
    id: "bible",
    name: "Bible",
    description: "Bible.promptengines.com",
    supabaseUrl: "",
    supabaseServiceRoleKey: "",
    neonDatabaseUrl: process.env.BIBLE_NEON_DATABASE_URL || "",
    icon: "Book",
    color: "hsl(var(--chart-4))",
    status: "active",
    revenueModel: "credits",
    adapter: "neon-telemetry-v1",
    contractVersion: "1.0",
    moneyUnit: "usd_decimal",
    paymentSuccessStatuses: ["succeeded", "completed"],
  },
  "promptengines-web": {
    id: "promptengines-web",
    name: "PromptEngines.com",
    description: "Root website analytics for promptengines.com",
    supabaseUrl: process.env.PROMPTENGINES_WEB_SUPABASE_URL || "",
    supabaseServiceRoleKey:
      process.env.PROMPTENGINES_WEB_SUPABASE_SERVICE_ROLE_KEY || "",
    icon: "Globe",
    color: "hsl(var(--chart-5))",
    status: "active",
    revenueModel: "credits",
    adapter: "kaizen-telemetry-v1",
    contractVersion: "1.0",
    moneyUnit: "usd_decimal",
    paymentSuccessStatuses: ["succeeded", "completed"],
    telemetryGrowth: {
      signupEventName: "web.visitor.created",
      activityEventName: "web.visit",
      identityField: "user_id",
    },
  },
  flow: {
    id: "flow",
    name: "Flow",
    description: "AI workflow automation",
    supabaseUrl: process.env.FLOW_SUPABASE_URL || "",
    supabaseServiceRoleKey: process.env.FLOW_SUPABASE_SERVICE_ROLE_KEY || "",
    icon: "GitBranch",
    color: "hsl(var(--chart-3))",
    status: "coming_soon",
    revenueModel: "credits",
    adapter: "legacy-sql-v1",
    contractVersion: "1.0",
    moneyUnit: "usd_cents",
    paymentSuccessStatuses: ["succeeded", "completed"],
  },
};

export function getApp(appId: string): AppConfig | undefined {
  return apps[appId as AppId];
}

export function getActiveApps(): AppConfig[] {
  return Object.values(apps).filter((app) => app.status === "active");
}

export function getAllApps(): AppConfig[] {
  return Object.values(apps);
}

export { apps };
