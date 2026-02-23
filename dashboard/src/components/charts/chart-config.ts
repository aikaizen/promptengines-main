import { ChartConfig } from "@/components/ui/chart";

export const revenueChartConfig: ChartConfig = {
  revenue: {
    label: "Revenue",
    color: "var(--chart-1)",
  },
  cogs: {
    label: "COGS",
    color: "var(--chart-5)",
  },
  margin: {
    label: "Margin",
    color: "var(--chart-2)",
  },
};

export const growthChartConfig: ChartConfig = {
  dau: {
    label: "DAU",
    color: "var(--chart-1)",
  },
  wau: {
    label: "WAU",
    color: "var(--chart-2)",
  },
  mau: {
    label: "MAU",
    color: "var(--chart-3)",
  },
  newUsers: {
    label: "New Users",
    color: "var(--chart-4)",
  },
};

export const engagementChartConfig: ChartConfig = {
  sessions: {
    label: "Sessions",
    color: "var(--chart-1)",
  },
  actions: {
    label: "Actions",
    color: "var(--chart-2)",
  },
};

export const reliabilityChartConfig: ChartConfig = {
  errorRate: {
    label: "Error Rate",
    color: "var(--chart-5)",
  },
  errors: {
    label: "Errors",
    color: "var(--chart-5)",
  },
  p50: {
    label: "p50",
    color: "var(--chart-2)",
  },
  p95: {
    label: "p95",
    color: "var(--chart-4)",
  },
};

export const unitEconomicsChartConfig: ChartConfig = {
  revenue: {
    label: "Revenue",
    color: "var(--chart-1)",
  },
  cost: {
    label: "Cost",
    color: "var(--chart-5)",
  },
};

export const profitabilityChartConfig: ChartConfig = {
  profitable: {
    label: "Profitable",
    color: "hsl(142, 76%, 36%)",
  },
  marginal: {
    label: "Marginal",
    color: "hsl(48, 96%, 53%)",
  },
  unprofitable: {
    label: "Unprofitable",
    color: "hsl(0, 84%, 60%)",
  },
};

export const activityChartConfig: ChartConfig = {
  generations: {
    label: "Generations",
    color: "var(--chart-1)",
  },
};

export const marginBucketChartConfig: ChartConfig = {
  users: {
    label: "Users",
    color: "var(--chart-2)",
  },
};

export const revenueBySourceChartConfig: ChartConfig = {
  credits: {
    label: "Credits",
    color: "var(--chart-1)",
  },
  productSales: {
    label: "Product Sales",
    color: "var(--chart-2)",
  },
  subscriptions: {
    label: "Subscriptions",
    color: "var(--chart-3)",
  },
  other: {
    label: "Other",
    color: "var(--chart-4)",
  },
};

export const costBreakdownChartConfig: ChartConfig = {
  api: {
    label: "API / LLM",
    color: "var(--chart-1)",
  },
  printing: {
    label: "Printing",
    color: "var(--chart-2)",
  },
  shipping: {
    label: "Shipping",
    color: "var(--chart-3)",
  },
  costOther: {
    label: "Other",
    color: "var(--chart-4)",
  },
};

export const appComparisonChartConfig: ChartConfig = {
  kaizen: {
    label: "Kaizen",
    color: "var(--chart-1)",
  },
  "storybook-studio": {
    label: "Storybook Studio",
    color: "var(--chart-2)",
  },
  bible: {
    label: "Bible",
    color: "var(--chart-4)",
  },
  "promptengines-web": {
    label: "PromptEngines.com",
    color: "var(--chart-5)",
  },
  flow: {
    label: "Flow",
    color: "var(--chart-3)",
  },
};
