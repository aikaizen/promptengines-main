"use client";

import { use } from "react";
import { useDateRange } from "@/hooks/use-date-range";
import { useGrowthMetrics } from "@/hooks/use-metrics";
import { KpiCard } from "@/components/tiles/kpi-card";
import { LineChartTile } from "@/components/tiles/line-chart-tile";
import { BarChartTile } from "@/components/tiles/bar-chart-tile";
import { CohortTile } from "@/components/tiles/cohort-tile";
import { growthChartConfig } from "@/components/charts/chart-config";
import { AppSwitcher } from "@/components/layout/app-switcher";

const loginConfig = {
  logins: {
    label: "Logins",
    color: "var(--chart-1)",
  },
};

export default function GrowthPage({
  params,
}: {
  params: Promise<{ appId: string }>;
}) {
  const { appId } = use(params);
  const { dateRange } = useDateRange();
  const { data: growth, isLoading } = useGrowthMetrics(appId, dateRange);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Growth</h1>
          <p className="text-muted-foreground text-sm">
            User acquisition, activity, and retention
          </p>
        </div>
        <AppSwitcher currentAppId={appId} />
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard
          title="Total Users"
          value={growth?.totalUsers ?? 0}
          previousValue={(growth?.totalUsers ?? 0) * 0.88}
          loading={isLoading}
        />
        <KpiCard
          title="New Today"
          value={growth?.newUsersToday ?? 0}
          previousValue={0}
          loading={isLoading}
        />
        <KpiCard
          title="DAU"
          value={growth?.dau ?? 0}
          previousValue={(growth?.dau ?? 0) * 0.92}
          loading={isLoading}
        />
        <KpiCard
          title="MAU"
          value={growth?.mau ?? 0}
          previousValue={(growth?.mau ?? 0) * 0.9}
          loading={isLoading}
        />
        <KpiCard
          title="Stickiness (DAU/MAU)"
          value={growth?.stickiness ?? 0}
          previousValue={(growth?.stickiness ?? 0) * 0.95}
          format="percent"
          loading={isLoading}
        />
      </div>

      {/* Trend Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <LineChartTile
          title="New Users Over Time"
          data={growth?.newUsersTrend ?? []}
          config={growthChartConfig}
          dataKeys={["newUsers"]}
        />
        <BarChartTile
          title="Daily Logins by Day of Week"
          data={growth?.loginsByDay ?? []}
          config={loginConfig}
          dataKeys={["logins"]}
          xAxisKey="date"
        />
      </div>

      {/* DAU/WAU/MAU Trend */}
      <LineChartTile
        title="DAU / WAU / MAU Trend"
        data={growth?.dauTrend ?? []}
        config={growthChartConfig}
        dataKeys={["dau", "wau", "mau"]}
      />

      {/* Retention Cohorts */}
      <CohortTile
        title="Retention Cohorts"
        description="Percentage of users returning after signup"
        data={growth?.retentionCohorts ?? []}
        periods={["D1", "D3", "D7", "D14", "D30"]}
      />
    </div>
  );
}
