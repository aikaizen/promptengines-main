"use client";

import { use } from "react";
import { useDateRange } from "@/hooks/use-date-range";
import { useEngagementMetrics } from "@/hooks/use-metrics";
import { KpiCard } from "@/components/tiles/kpi-card";
import { LineChartTile } from "@/components/tiles/line-chart-tile";
import { BarChartTile } from "@/components/tiles/bar-chart-tile";
import { PieChartTile } from "@/components/tiles/pie-chart-tile";
import { engagementChartConfig } from "@/components/charts/chart-config";
import { AppSwitcher } from "@/components/layout/app-switcher";

const featureConfig = {
  usage: {
    label: "Usage",
    color: "var(--chart-1)",
  },
};

const creditPieConfig = {
  "Text Generation": { label: "Text Gen", color: "var(--chart-1)" },
  "Image Generation": { label: "Image Gen", color: "var(--chart-2)" },
  "Code Generation": { label: "Code Gen", color: "var(--chart-3)" },
  Other: { label: "Other", color: "var(--chart-4)" },
};

export default function EngagementPage({
  params,
}: {
  params: Promise<{ appId: string }>;
}) {
  const { appId } = use(params);
  const { dateRange } = useDateRange();
  const { data: engagement, isLoading } = useEngagementMetrics(
    appId,
    dateRange
  );

  // Derive feature usage and credit usage from live data
  const featureUsage = engagement?.topFeatures ?? [];
  const creditUsagePie = engagement?.creditUsageByFeature ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Engagement</h1>
          <p className="text-muted-foreground text-sm">
            Session depth, feature usage, and activation
          </p>
        </div>
        <AppSwitcher currentAppId={appId} />
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Avg Session Duration"
          value={engagement?.avgSessionDuration ?? 0}
          previousValue={0}
          suffix="s"
          loading={isLoading}
        />
        <KpiCard
          title="Sessions / User"
          value={engagement?.sessionsPerUser ?? 0}
          previousValue={0}
          loading={isLoading}
        />
        <KpiCard
          title="Actions / Session"
          value={engagement?.actionsPerSession ?? 0}
          previousValue={0}
          loading={isLoading}
        />
        <KpiCard
          title="Activation Rate"
          value={engagement?.activationRate ?? 0}
          previousValue={0}
          format="percent"
          loading={isLoading}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <LineChartTile
          title="Session Trend"
          data={engagement?.sessionTrend ?? []}
          config={engagementChartConfig}
          dataKeys={["sessions"]}
        />
        <PieChartTile
          title="Credit Usage by Feature"
          data={creditUsagePie}
          config={creditPieConfig}
        />
      </div>

      {/* Feature Usage */}
      <BarChartTile
        title="Feature Usage (Actions)"
        data={featureUsage}
        config={featureConfig}
        dataKeys={["usage"]}
        xAxisKey="feature"
      />
    </div>
  );
}
