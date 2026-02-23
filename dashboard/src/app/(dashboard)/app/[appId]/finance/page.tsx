"use client";

import { use } from "react";
import Link from "next/link";
import { useDateRange } from "@/hooks/use-date-range";
import { useFinanceMetrics } from "@/hooks/use-metrics";
import { useUnitEconomics, useUserMetrics } from "@/hooks/use-user-metrics";
import { KpiCard } from "@/components/tiles/kpi-card";
import { LineChartTile } from "@/components/tiles/line-chart-tile";
import { BarChartTile } from "@/components/tiles/bar-chart-tile";
import { revenueChartConfig, marginBucketChartConfig, revenueBySourceChartConfig, costBreakdownChartConfig } from "@/components/charts/chart-config";
import { PieChartTile } from "@/components/tiles/pie-chart-tile";
import { AppSwitcher } from "@/components/layout/app-switcher";
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

const cogsProviderConfig = {
  cogs: {
    label: "COGS",
    color: "var(--chart-5)",
  },
};

const marginConfig = {
  margin: {
    label: "Margin %",
    color: "var(--chart-2)",
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

export default function FinancePage({
  params,
}: {
  params: Promise<{ appId: string }>;
}) {
  const { appId } = use(params);
  const { dateRange } = useDateRange();
  const { data: finance, isLoading } = useFinanceMetrics(appId, dateRange);
  const { data: unitEcon, isLoading: unitEconLoading } = useUnitEconomics(
    appId,
    dateRange
  );
  const { data: userData } = useUserMetrics(appId, dateRange);

  const appConfig = getApp(appId);
  const isProductApp = appConfig?.revenueModel === "credits_and_products";
  const unitEconomicsData = unitEcon?.arpu != null ? unitEcon : emptyUnitEconomics;

  // Derive user lists from live data
  const topRevenueUsers = userData?.topRevenueUsers ?? [];
  const moneyLosingUsers = userData?.moneyLosingUsers ?? [];

  // Derive chart data from live data
  const revenueBySourceData = unitEcon?.revenueBySource
    ? [
        { name: "Credits", value: unitEcon.revenueBySource.credits ?? 0, fill: "var(--color-credits)" },
        { name: "Product Sales", value: unitEcon.revenueBySource.productSales ?? 0, fill: "var(--color-productSales)" },
        { name: "Subscriptions", value: unitEcon.revenueBySource.subscriptions ?? 0, fill: "var(--color-subscriptions)" },
        { name: "Other", value: unitEcon.revenueBySource.other ?? 0, fill: "var(--color-other)" },
      ].filter((d) => d.value > 0)
    : [];

  const costBreakdownData = unitEcon?.costBreakdown
    ? [
        { name: "API / LLM", value: unitEcon.costBreakdown.api ?? 0, fill: "var(--color-api)" },
        { name: "Printing", value: unitEcon.costBreakdown.printing ?? 0, fill: "var(--color-printing)" },
        { name: "Shipping", value: unitEcon.costBreakdown.shipping ?? 0, fill: "var(--color-shipping)" },
        { name: "Other", value: unitEcon.costBreakdown.other ?? 0, fill: "var(--color-costOther)" },
      ].filter((d) => d.value > 0)
    : [];

  const marginBucketsData = unitEcon?.marginBuckets ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Finance</h1>
          <p className="text-muted-foreground text-sm">
            Revenue, costs, and margin analysis
          </p>
        </div>
        <AppSwitcher currentAppId={appId} />
      </div>

      {/* KPI Cards — app-model-aware */}
      {isProductApp ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <KpiCard
            title="Credits Revenue"
            value={unitEconomicsData.revenueBySource?.credits ?? 0}
            previousValue={(unitEconomicsData.revenueBySource?.credits ?? 0) * 0.88}
            format="currency"
            loading={unitEconLoading}
          />
          <KpiCard
            title="Book Revenue"
            value={unitEconomicsData.revenueBySource?.productSales ?? 0}
            previousValue={(unitEconomicsData.revenueBySource?.productSales ?? 0) * 0.82}
            format="currency"
            loading={unitEconLoading}
          />
          <KpiCard
            title="Total Revenue"
            value={finance?.totalRevenue ?? 0}
            previousValue={(finance?.totalRevenue ?? 0) * 0.85}
            format="currency"
            loading={isLoading}
          />
          <KpiCard
            title="Printing Cost"
            value={unitEconomicsData.costBreakdown?.printing ?? 0}
            previousValue={(unitEconomicsData.costBreakdown?.printing ?? 0) * 1.03}
            format="currency"
            loading={unitEconLoading}
          />
          <KpiCard
            title="Shipping Cost"
            value={unitEconomicsData.costBreakdown?.shipping ?? 0}
            previousValue={(unitEconomicsData.costBreakdown?.shipping ?? 0) * 1.05}
            format="currency"
            loading={unitEconLoading}
          />
          <KpiCard
            title="Margin"
            value={finance?.margin ?? 0}
            previousValue={(finance?.margin ?? 0) * 0.97}
            format="percent"
            loading={isLoading}
          />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <KpiCard
            title="Total Revenue"
            value={finance?.totalRevenue ?? 0}
            previousValue={(finance?.totalRevenue ?? 0) * 0.85}
            format="currency"
            loading={isLoading}
          />
          <KpiCard
            title="COGS"
            value={finance?.cogs ?? 0}
            previousValue={(finance?.cogs ?? 0) * 1.05}
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
            title="LTV"
            value={unitEconomicsData.ltv}
            previousValue={unitEconomicsData.ltv * 0.92}
            format="currency"
            loading={unitEconLoading}
          />
        </div>
      )}

      {/* Revenue & COGS Chart */}
      <div className="grid gap-4 lg:grid-cols-2">
        <LineChartTile
          title="Revenue vs COGS"
          data={finance?.revenueTrend ?? []}
          config={revenueChartConfig}
          dataKeys={["revenue", "cogs"]}
        />
        <LineChartTile
          title="Margin Trend"
          data={finance?.marginTrend ?? []}
          config={marginConfig}
          dataKeys={["margin"]}
        />
      </div>

      {/* COGS Breakdown */}
      <div className="grid gap-4 lg:grid-cols-2">
        {!isProductApp ? (
          <BarChartTile
            title="COGS by Provider"
            data={finance?.cogsByProvider ?? []}
            config={cogsProviderConfig}
            dataKeys={["cogs"]}
            xAxisKey="provider"
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <KpiCard
              title="Books Sold"
              value={finance?.booksSold ?? 0}
              previousValue={(finance?.booksSold ?? 0) * 0.85}
              loading={isLoading}
            />
            <KpiCard
              title="Avg Book Price"
              value={finance?.avgBookPrice ?? 0}
              format="currency"
              loading={isLoading}
            />
            <KpiCard
              title="API Cost"
              value={unitEconomicsData.costBreakdown?.api ?? 0}
              format="currency"
              loading={unitEconLoading}
            />
            <KpiCard
              title="ARPU"
              value={unitEconomicsData.arpu}
              previousValue={unitEconomicsData.arpu * 0.9}
              format="currency"
              loading={unitEconLoading}
            />
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <KpiCard
            title="Credits Purchased"
            value={finance?.creditsPurchased ?? 0}
            previousValue={(finance?.creditsPurchased ?? 0) * 0.88}
            loading={isLoading}
          />
          <KpiCard
            title="Credits Spent"
            value={finance?.creditsSpent ?? 0}
            previousValue={(finance?.creditsSpent ?? 0) * 0.91}
            loading={isLoading}
          />
          <KpiCard
            title="Avg Cost/Generation"
            value={finance?.avgCostPerGeneration ?? 0}
            format="currency"
            loading={isLoading}
          />
          <KpiCard
            title="Revenue/User"
            value={unitEconomicsData.arpu}
            previousValue={unitEconomicsData.arpu * 0.9}
            format="currency"
            loading={unitEconLoading}
          />
        </div>
      </div>

      {/* Revenue by Source + Cost Breakdown */}
      <div className="grid gap-4 lg:grid-cols-2">
        <PieChartTile
          title="Revenue by Source"
          description={isProductApp ? "Book sales and credits" : "Credits, product sales (books), subscriptions"}
          data={revenueBySourceData}
          config={revenueBySourceChartConfig}
        />
        <PieChartTile
          title="Cost Breakdown"
          description={isProductApp ? "Printing, shipping, API/LLM" : "API/LLM, printing, shipping, other"}
          data={costBreakdownData}
          config={costBreakdownChartConfig}
        />
      </div>

      {/* User Profitability Distribution */}
      <BarChartTile
        title="User Profitability Distribution"
        description="Number of users by margin bucket"
        data={marginBucketsData}
        config={marginBucketChartConfig}
        dataKeys={["users"]}
        xAxisKey="bucket"
      />

      {/* Top Revenue Users + Money-Losing Users */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Top Revenue Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                  <TableHead className="text-right">Margin</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topRevenueUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No data
                    </TableCell>
                  </TableRow>
                ) : (
                  topRevenueUsers.slice(0, 10).map((user: { id: string; name: string; email: string; revenue: number; cost: number; margin: number }) => (
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
                      <TableCell className="text-right text-green-600 dark:text-green-400 font-medium">
                        {formatCurrency(user.revenue)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(user.cost)}
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
              Money-Losing Users
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              All users with negative margin
            </p>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                  <TableHead className="text-right">Margin</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {moneyLosingUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No money-losing users
                    </TableCell>
                  </TableRow>
                ) : (
                  moneyLosingUsers.map((user: { id: string; name: string; email: string; revenue: number; cost: number; margin: number }) => (
                    <TableRow
                      key={user.id}
                      className={cn(
                        "cursor-pointer hover:bg-muted/50",
                        "bg-red-50/50 dark:bg-red-950/20"
                      )}
                    >
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
                      <TableCell className="text-right">
                        {formatCurrency(user.revenue)}
                      </TableCell>
                      <TableCell className="text-right text-red-600 dark:text-red-400">
                        {formatCurrency(user.cost)}
                      </TableCell>
                      <TableCell className="text-right text-red-600 dark:text-red-400 font-medium">
                        {formatCurrency(user.margin)}
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
