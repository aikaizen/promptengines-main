"use client";

import { use } from "react";
import { useDateRange } from "@/hooks/use-date-range";
import { useUnitEconomics, useUserMetrics } from "@/hooks/use-user-metrics";
import { KpiCard } from "@/components/tiles/kpi-card";
import { PieChartTile } from "@/components/tiles/pie-chart-tile";
import { UserTableTile } from "@/components/tiles/user-table-tile";
import { FunnelTile } from "@/components/tiles/funnel-tile";
import { AppSwitcher } from "@/components/layout/app-switcher";
import { profitabilityChartConfig } from "@/components/charts/chart-config";
import { getApp } from "@/lib/app-registry";

const emptyUnitEconomics = {
  arpu: 0,
  costPerUser: 0,
  marginPerUser: 0,
  ltv: 0,
  payingUsers: 0,
  totalUsers: 0,
};

export default function UsersPage({
  params,
}: {
  params: Promise<{ appId: string }>;
}) {
  const { appId } = use(params);
  const { dateRange } = useDateRange();
  const { data: unitEcon, isLoading: unitEconLoading } = useUnitEconomics(
    appId,
    dateRange
  );
  const { data: userData } = useUserMetrics(appId, dateRange);

  const appConfig = getApp(appId);
  const isProductApp = appConfig?.revenueModel === "credits_and_products";
  const unitEconomicsData = unitEcon?.arpu != null ? unitEcon : emptyUnitEconomics;

  // Derive from live data
  const profitabilityData = unitEcon?.profitabilityDistribution ?? [];
  const funnelData = userData?.funnel ?? [];
  const users = userData?.users ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground text-sm">
            User-level profitability and acquisition funnel
          </p>
        </div>
        <AppSwitcher currentAppId={appId} />
      </div>

      {/* KPI Strip — app-model-aware */}
      {isProductApp ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <KpiCard
            title="Credits Purchased"
            value={unitEcon?.creditsPurchased ?? 0}
            previousValue={(unitEcon?.creditsPurchased ?? 0) * 0.88}
            loading={unitEconLoading}
          />
          <KpiCard
            title="Books Sold"
            value={unitEcon?.booksSold ?? 0}
            previousValue={(unitEcon?.booksSold ?? 0) * 0.85}
            loading={unitEconLoading}
          />
          <KpiCard
            title="Paying Users"
            value={unitEconomicsData.payingUsers}
            previousValue={unitEconomicsData.payingUsers * 0.9}
            loading={unitEconLoading}
          />
          <KpiCard
            title="ARPU"
            value={unitEconomicsData.arpu}
            previousValue={unitEconomicsData.arpu * 0.9}
            format="currency"
            loading={unitEconLoading}
          />
          <KpiCard
            title="Cost/User"
            value={unitEconomicsData.costPerUser}
            previousValue={unitEconomicsData.costPerUser * 1.05}
            format="currency"
            loading={unitEconLoading}
          />
          <KpiCard
            title="Margin/User"
            value={unitEconomicsData.marginPerUser}
            previousValue={unitEconomicsData.marginPerUser * 0.92}
            format="currency"
            loading={unitEconLoading}
          />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            title="Paying Users"
            value={unitEconomicsData.payingUsers}
            previousValue={unitEconomicsData.payingUsers * 0.9}
            loading={unitEconLoading}
          />
          <KpiCard
            title="ARPU"
            value={unitEconomicsData.arpu}
            previousValue={unitEconomicsData.arpu * 0.9}
            format="currency"
            loading={unitEconLoading}
          />
          <KpiCard
            title="Cost/User"
            value={unitEconomicsData.costPerUser}
            previousValue={unitEconomicsData.costPerUser * 1.05}
            format="currency"
            loading={unitEconLoading}
          />
          <KpiCard
            title="Margin/User"
            value={unitEconomicsData.marginPerUser}
            previousValue={unitEconomicsData.marginPerUser * 0.92}
            format="currency"
            loading={unitEconLoading}
          />
        </div>
      )}

      {/* Profitability Pie + Acquisition Funnel */}
      <div className="grid gap-4 lg:grid-cols-2">
        <PieChartTile
          title="User Profitability"
          description="Profitable / Marginal / Unprofitable split"
          data={profitabilityData}
          config={profitabilityChartConfig}
        />
        <FunnelTile
          title="Acquisition Funnel"
          description="Conversion and drop-off rates between stages"
          data={funnelData}
        />
      </div>

      {/* User Table */}
      <UserTableTile
        title="All Users"
        description="Click any row to view user detail"
        users={users}
        appId={appId}
      />
    </div>
  );
}
