"use client";

import { use } from "react";
import Link from "next/link";
import { useDateRange } from "@/hooks/use-date-range";
import {
  useGrowthMetrics,
  useFinanceMetrics,
  useReliabilityMetrics,
} from "@/hooks/use-metrics";
import { useUnitEconomics } from "@/hooks/use-user-metrics";
import { KpiCard } from "@/components/tiles/kpi-card";
import { LineChartTile } from "@/components/tiles/line-chart-tile";
import { BarChartTile } from "@/components/tiles/bar-chart-tile";
import { PieChartTile } from "@/components/tiles/pie-chart-tile";
import { UnitEconomicsTile } from "@/components/tiles/unit-economics-tile";
import { AppSwitcher } from "@/components/layout/app-switcher";
import { growthChartConfig, profitabilityChartConfig } from "@/components/charts/chart-config";
import { getApp } from "@/lib/app-registry";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const activationConfig = {
  users: {
    label: "Users",
    color: "var(--chart-1)",
  },
};

const emptyUnitEconomics = {
  arpu: 0,
  costPerUser: 0,
  marginPerUser: 0,
  ltv: 0,
  payingUsers: 0,
  totalUsers: 0,
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function AppOverviewPage({
  params,
}: {
  params: Promise<{ appId: string }>;
}) {
  const { appId } = use(params);
  const { dateRange } = useDateRange();
  const { data: growth, isLoading: growthLoading } = useGrowthMetrics(
    appId,
    dateRange
  );
  const { data: finance, isLoading: financeLoading } = useFinanceMetrics(
    appId,
    dateRange
  );
  const { isLoading: reliabilityLoading } = useReliabilityMetrics(appId, dateRange);
  const { data: unitEcon, isLoading: unitEconLoading } = useUnitEconomics(
    appId,
    dateRange
  );

  const isLoading = growthLoading || financeLoading || reliabilityLoading;
  const appConfig = getApp(appId);
  const isProductApp = appConfig?.revenueModel === "credits_and_products";
  const unitEconomicsData = unitEcon?.arpu != null ? unitEcon : emptyUnitEconomics;

  // Derive profitability and at-risk users from live data
  const profitabilityData = unitEcon?.profitabilityDistribution ?? [];
  const atRiskUsers = unitEcon?.atRiskUsers ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight capitalize">
            {appConfig?.name ?? appId.replace("-", " ")}
          </h1>
          <p className="text-muted-foreground text-sm">
            App overview and key metrics
          </p>
        </div>
        <AppSwitcher currentAppId={appId} />
      </div>

      {/* KPI Cards Row — app-model-aware */}
      {isProductApp ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <KpiCard
            title="Credits Purchased"
            value={finance?.creditsPurchased ?? 0}
            previousValue={(finance?.creditsPurchased ?? 0) * 0.88}
            loading={isLoading}
          />
          <KpiCard
            title="Books Sold"
            value={finance?.booksSold ?? 0}
            previousValue={(finance?.booksSold ?? 0) * 0.85}
            loading={isLoading}
          />
          <KpiCard
            title="Total Revenue"
            value={finance?.totalRevenue ?? 0}
            previousValue={(finance?.totalRevenue ?? 0) * 0.85}
            format="currency"
            loading={isLoading}
          />
          <KpiCard
            title="Total Users"
            value={growth?.totalUsers ?? 0}
            previousValue={(growth?.totalUsers ?? 0) * 0.88}
            loading={isLoading}
          />
          <KpiCard
            title="Margin"
            value={finance?.margin ?? 0}
            previousValue={(finance?.margin ?? 0) * 0.97}
            format="percent"
            loading={isLoading}
          />
          <KpiCard
            title="Avg Book Price"
            value={finance?.avgBookPrice ?? 0}
            format="currency"
            loading={isLoading}
          />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <KpiCard
            title="Total Users"
            value={growth?.totalUsers ?? 0}
            previousValue={(growth?.totalUsers ?? 0) * 0.88}
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
            title="Stickiness"
            value={growth?.stickiness ?? 0}
            previousValue={(growth?.stickiness ?? 0) * 0.95}
            format="percent"
            loading={isLoading}
          />
          <KpiCard
            title="Revenue"
            value={finance?.totalRevenue ?? 0}
            previousValue={(finance?.totalRevenue ?? 0) * 0.85}
            format="currency"
            loading={isLoading}
          />
          <KpiCard
            title="Margin"
            value={finance?.margin ?? 0}
            previousValue={(finance?.margin ?? 0) * 0.97}
            format="percent"
            loading={isLoading}
          />
        </div>
      )}

      {/* Unit Economics Row */}
      <UnitEconomicsTile
        data={unitEconomicsData}
        loading={unitEconLoading}
      />

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        <LineChartTile
          title="DAU / MAU Trend"
          data={growth?.dauTrend ?? []}
          config={growthChartConfig}
          dataKeys={["dau", "mau"]}
        />
        <BarChartTile
          title="Activation Funnel"
          data={growth?.activationFunnel ?? []}
          config={activationConfig}
          dataKeys={["users"]}
          xAxisKey="stage"
        />
      </div>

      {/* Bottom Row: Profitability Pie + Users at Risk */}
      <div className="grid gap-4 lg:grid-cols-2">
        <PieChartTile
          title="User Profitability"
          description="Distribution of user profitability"
          data={profitabilityData}
          config={profitabilityChartConfig}
        />
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Users at Risk
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Highest cost-to-revenue ratio
            </p>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Ratio</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {atRiskUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No data
                    </TableCell>
                  </TableRow>
                ) : (
                  atRiskUsers.map((user: { id: string; name: string; email: string; cost: number; revenue: number; costToRevenueRatio: number }) => (
                    <TableRow key={user.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell>
                        <Link
                          href={`/app/${appId}/users/${user.id}`}
                          className="block"
                        >
                          <div className="text-sm font-medium">{user.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {user.email}
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell className="text-right text-red-600 dark:text-red-400">
                        {formatCurrency(user.cost)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(user.revenue)}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-right font-medium",
                          user.costToRevenueRatio > 1
                            ? "text-red-600 dark:text-red-400"
                            : "text-muted-foreground"
                        )}
                      >
                        {user.costToRevenueRatio.toFixed(1)}x
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
