"use client";

import { use } from "react";
import { useDateRange } from "@/hooks/use-date-range";
import { useReliabilityMetrics } from "@/hooks/use-metrics";
import { KpiCard } from "@/components/tiles/kpi-card";
import { LineChartTile } from "@/components/tiles/line-chart-tile";
import { StatusTile } from "@/components/tiles/status-tile";
import { TableTile } from "@/components/tiles/table-tile";
import { reliabilityChartConfig } from "@/components/charts/chart-config";
import { AppSwitcher } from "@/components/layout/app-switcher";

export default function ReliabilityPage({
  params,
}: {
  params: Promise<{ appId: string }>;
}) {
  const { appId } = use(params);
  const { dateRange } = useDateRange();
  const { data: reliability, isLoading } = useReliabilityMetrics(
    appId,
    dateRange
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reliability</h1>
          <p className="text-muted-foreground text-sm">
            Error rates, latency, and system health
          </p>
        </div>
        <AppSwitcher currentAppId={appId} />
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard
          title="Error Rate"
          value={reliability?.errorRate ?? 0}
          previousValue={0}
          format="percent"
          loading={isLoading}
        />
        <KpiCard
          title="p50 Latency"
          value={reliability?.p50Latency ?? 0}
          previousValue={0}
          suffix="ms"
          loading={isLoading}
        />
        <KpiCard
          title="p95 Latency"
          value={reliability?.p95Latency ?? 0}
          previousValue={0}
          suffix="ms"
          loading={isLoading}
        />
        <KpiCard
          title="p99 Latency"
          value={reliability?.p99Latency ?? 0}
          previousValue={0}
          suffix="ms"
          loading={isLoading}
        />
        <KpiCard
          title="Success Rate"
          value={reliability?.successRate ?? 0}
          previousValue={0}
          format="percent"
          loading={isLoading}
        />
      </div>

      {/* Status Overview */}
      <StatusTile
        title="System Status"
        indicators={reliability?.statusIndicators ?? []}
        loading={isLoading}
      />

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <LineChartTile
          title="Error Rate Trend"
          data={reliability?.errorTrend ?? []}
          config={reliabilityChartConfig}
          dataKeys={["errorRate"]}
        />
        <LineChartTile
          title="Latency Percentiles"
          data={reliability?.latencyTrend ?? []}
          config={reliabilityChartConfig}
          dataKeys={["p50", "p95"]}
        />
      </div>

      {/* Error Breakdown Table */}
      <TableTile
        title="Error Breakdown"
        columns={[
          { key: "error", label: "Error Type" },
          { key: "count", label: "Count", align: "right" },
          { key: "percentage", label: "% of Total", align: "right" },
        ]}
        data={reliability?.errorBreakdown ?? []}
      />
    </div>
  );
}
