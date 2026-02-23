"use client";

import Link from "next/link";
import { useDateRange } from "@/hooks/use-date-range";
import { useOverviewMetrics } from "@/hooks/use-metrics";
import { useUnitEconomics } from "@/hooks/use-user-metrics";
import { KpiCard } from "@/components/tiles/kpi-card";
import { LineChartTile } from "@/components/tiles/line-chart-tile";
import { BarChartTile } from "@/components/tiles/bar-chart-tile";
import { TableTile } from "@/components/tiles/table-tile";
import { UnitEconomicsTile } from "@/components/tiles/unit-economics-tile";
import { growthChartConfig } from "@/components/charts/chart-config";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const revenueByAppConfig = {
  revenue: {
    label: "Revenue",
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

export default function OverviewPage() {
  const { dateRange } = useDateRange();
  const { data, isLoading } = useOverviewMetrics(dateRange);
  const { data: unitEcon, isLoading: unitEconLoading } = useUnitEconomics(
    "all",
    dateRange
  );

  // Use live data only — show zeros when no data
  const kpis = data?.apps
    ? {
        totalUsers: data.apps.reduce(
          (sum: number, a: { growth?: { totalUsers?: number } }) =>
            sum + (a.growth?.totalUsers || 0),
          0
        ),
        dau: data.apps.reduce(
          (sum: number, a: { growth?: { dau?: number } }) =>
            sum + (a.growth?.dau || 0),
          0
        ),
        revenue: data.apps.reduce(
          (sum: number, a: { finance?: { totalRevenue?: number } }) =>
            sum + (a.finance?.totalRevenue || 0),
          0
        ),
        cogs: data.apps.reduce(
          (sum: number, a: { finance?: { cogs?: number } }) =>
            sum + (a.finance?.cogs || 0),
          0
        ),
        margin: 0,
      }
    : {
        totalUsers: 0,
        dau: 0,
        revenue: 0,
        cogs: 0,
        margin: 0,
      };

  const unitEconomicsData = unitEcon?.arpu != null ? unitEcon : emptyUnitEconomics;

  // Derive charts and tables from live data
  const dauTrend = data?.apps?.[0]?.growth?.dauTrend ?? [];
  const revenueByApp = data?.apps
    ? data.apps.map((a: { name?: string; finance?: { totalRevenue?: number } }) => ({
        app: a.name ?? "Unknown",
        revenue: a.finance?.totalRevenue ?? 0,
      }))
    : [];
  const appComparison = data?.apps
    ? data.apps.map(
        (a: {
          name?: string;
          growth?: { totalUsers?: number; dau?: number };
          finance?: { totalRevenue?: number; margin?: number };
          status?: string;
        }) => ({
          app: a.name ?? "Unknown",
          users: a.growth?.totalUsers ?? 0,
          dau: a.growth?.dau ?? 0,
          revenue: a.finance?.totalRevenue != null ? formatCurrency(a.finance.totalRevenue) : "$0",
          margin: a.finance?.margin != null ? `${a.finance.margin}%` : "0%",
          status: a.status ?? "Active",
        })
      )
    : [];
  const topRevenueUsers = data?.topRevenueUsers ?? [];
  const costliestUsers = data?.costliestUsers ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground text-sm">
          Aggregated metrics across all PromptEngines apps
        </p>
      </div>

      {/* KPI Cards Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard
          title="Total Users"
          value={kpis.totalUsers}
          previousValue={kpis.totalUsers * 0.88}
          loading={isLoading}
        />
        <KpiCard
          title="DAU"
          value={kpis.dau}
          previousValue={kpis.dau * 0.92}
          loading={isLoading}
        />
        <KpiCard
          title="Revenue"
          value={kpis.revenue}
          previousValue={kpis.revenue * 0.85}
          format="currency"
          loading={isLoading}
        />
        <KpiCard
          title="COGS"
          value={kpis.cogs}
          previousValue={kpis.cogs * 1.05}
          format="currency"
          loading={isLoading}
        />
        <KpiCard
          title="Margin"
          value={kpis.margin}
          previousValue={kpis.margin * 0.97}
          format="percent"
          loading={isLoading}
        />
      </div>

      {/* Unit Economics Row */}
      <UnitEconomicsTile
        data={unitEconomicsData}
        loading={unitEconLoading}
      />

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        <LineChartTile
          title="DAU Trend (All Apps)"
          data={dauTrend}
          config={growthChartConfig}
          dataKeys={["dau", "mau"]}
        />
        <BarChartTile
          title="Revenue by App"
          data={revenueByApp}
          config={revenueByAppConfig}
          dataKeys={["revenue"]}
          xAxisKey="app"
        />
      </div>

      {/* App Comparison Table */}
      <TableTile
        title="App Comparison"
        columns={[
          { key: "app", label: "App" },
          { key: "users", label: "Users", align: "right" },
          { key: "dau", label: "DAU", align: "right" },
          { key: "revenue", label: "Revenue", align: "right" },
          { key: "margin", label: "Margin", align: "right" },
          { key: "status", label: "Status" },
        ]}
        data={appComparison}
      />

      {/* Most Valuable + Costliest Users */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Most Valuable Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Margin</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topRevenueUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      No data
                    </TableCell>
                  </TableRow>
                ) : (
                  topRevenueUsers.map((user: { id: string; name: string; email: string; revenue: number; margin: number }) => (
                    <TableRow key={user.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell>
                        <Link
                          href={`/app/kaizen/users/${user.id}`}
                          className="block"
                        >
                          <div className="text-sm font-medium">{user.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {user.email}
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell className="text-right text-green-600 dark:text-green-400 font-medium">
                        {formatCurrency(user.revenue)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(user.margin)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Costliest Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {costliestUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      No data
                    </TableCell>
                  </TableRow>
                ) : (
                  costliestUsers.map((user: { id: string; name: string; email: string; cost: number; revenue: number }) => (
                    <TableRow key={user.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell>
                        <Link
                          href={`/app/kaizen/users/${user.id}`}
                          className="block"
                        >
                          <div className="text-sm font-medium">{user.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {user.email}
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell className="text-right text-red-600 dark:text-red-400 font-medium">
                        {formatCurrency(user.cost)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(user.revenue)}
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
