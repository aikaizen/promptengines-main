"use client";

import { use } from "react";
import Link from "next/link";
import { useDateRange } from "@/hooks/use-date-range";
import { useUserDetail } from "@/hooks/use-user-metrics";
import { KpiCard } from "@/components/tiles/kpi-card";
import { LineChartTile } from "@/components/tiles/line-chart-tile";
import { AppSwitcher } from "@/components/layout/app-switcher";
import { unitEconomicsChartConfig, activityChartConfig } from "@/components/charts/chart-config";
import { Badge } from "@/components/ui/badge";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { FunnelStage } from "@/types/metrics";

const funnelStages: { key: FunnelStage; label: string }[] = [
  { key: "signed_up", label: "Signed Up" },
  { key: "onboarded", label: "Onboarded" },
  { key: "first_gen", label: "First Gen" },
  { key: "purchased", label: "Purchased" },
  { key: "retained", label: "Retained" },
];

const planColors: Record<string, string> = {
  free: "secondary",
  starter: "default",
  pro: "default",
  enterprise: "default",
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatCurrencyShort(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function stageIndex(stage: FunnelStage): number {
  return funnelStages.findIndex((s) => s.key === stage);
}

function paymentBadgeVariant(status: string) {
  if (status === "completed" || status === "shipped") return "default" as const;
  if (status === "refunded" || status === "failed" || status === "canceled") {
    return "destructive" as const;
  }
  return "secondary" as const;
}

export default function UserDetailPage({
  params,
}: {
  params: Promise<{ appId: string; userId: string }>;
}) {
  const { appId, userId } = use(params);
  const { dateRange } = useDateRange();
  const { data: user, isLoading, error } = useUserDetail(appId, userId, dateRange);

  // Show loading state if no data yet
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Link
              href={`/app/${appId}/users`}
              className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block"
            >
              &larr; Back to Users
            </Link>
            <h1 className="text-2xl font-bold tracking-tight">Loading...</h1>
          </div>
          <AppSwitcher currentAppId={appId} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard title="Revenue" value={0} format="currency" loading />
          <KpiCard title="Cost" value={0} format="currency" loading />
          <KpiCard title="Margin" value={0} format="currency" loading />
          <KpiCard title="Est. LTV" value={0} format="currency" loading />
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Link
              href={`/app/${appId}/users`}
              className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block"
            >
              &larr; Back to Users
            </Link>
            <h1 className="text-2xl font-bold tracking-tight">User Not Found</h1>
            <p className="text-sm text-muted-foreground mt-1">
              This user does not exist for the selected app or date range.
            </p>
          </div>
          <AppSwitcher currentAppId={appId} />
        </div>
      </div>
    );
  }

  const currentStageIdx = stageIndex(user.funnelStage);

  return (
    <div className="space-y-6">
      {/* Back link + header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href={`/app/${appId}/users`}
            className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block"
          >
            &larr; Back to Users
          </Link>
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="text-sm font-bold">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {user.name}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-muted-foreground">
                  {user.email}
                </span>
                <Badge
                  variant={planColors[user.plan] === "secondary" ? "secondary" : "default"}
                  className="text-[10px]"
                >
                  {user.plan}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Member since {new Date(user.joinedAt).toLocaleDateString()}
                </span>
                <span className="text-xs text-muted-foreground">
                  Last active {new Date(user.lastActive).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
        <AppSwitcher currentAppId={appId} />
      </div>

      {/* Unit Economics for this user */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Revenue"
          value={user.metrics.revenue}
          format="currency"
        />
        <KpiCard
          title="Cost"
          value={user.metrics.cost}
          format="currency"
        />
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Margin
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                "text-2xl font-bold",
                user.metrics.margin >= 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              )}
            >
              {formatCurrencyShort(user.metrics.margin)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {user.metrics.marginPercent > 0
                ? `${user.metrics.marginPercent.toFixed(1)}% margin`
                : user.metrics.marginPercent === 0
                  ? "0% margin"
                  : `${user.metrics.marginPercent.toFixed(0)}% margin`}
            </p>
          </CardContent>
        </Card>
        <KpiCard
          title="Est. LTV"
          value={user.metrics.ltv}
          format="currency"
        />
      </div>

      {/* Revenue & Cost Breakdown (shown when user has multiple revenue streams) */}
      {user.metrics.revenueBySource &&
        (user.metrics.revenueBySource.productSales > 0 ||
          user.metrics.costBreakdown?.printing) && (
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Revenue Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {user.metrics.revenueBySource.credits > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Credits</span>
                      <span className="font-medium">{formatCurrency(user.metrics.revenueBySource.credits)}</span>
                    </div>
                  )}
                  {user.metrics.revenueBySource.subscriptions > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subscription</span>
                      <span className="font-medium">{formatCurrency(user.metrics.revenueBySource.subscriptions)}</span>
                    </div>
                  )}
                  {user.metrics.revenueBySource.productSales > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Product Sales (Books)</span>
                      <span className="font-medium">{formatCurrency(user.metrics.revenueBySource.productSales)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm border-t pt-2 font-bold">
                    <span>Total</span>
                    <span>{formatCurrency(user.metrics.revenue)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Cost Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(user.metrics.costBreakdown?.api ?? 0) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">API / LLM</span>
                      <span className="font-medium">{formatCurrency(user.metrics.costBreakdown!.api)}</span>
                    </div>
                  )}
                  {(user.metrics.costBreakdown?.printing ?? 0) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Printing</span>
                      <span className="font-medium">{formatCurrency(user.metrics.costBreakdown!.printing)}</span>
                    </div>
                  )}
                  {(user.metrics.costBreakdown?.shipping ?? 0) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="font-medium">{formatCurrency(user.metrics.costBreakdown!.shipping)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm border-t pt-2 font-bold">
                    <span>Total</span>
                    <span>{formatCurrency(user.metrics.cost)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

      {/* Credits + Engagement */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <KpiCard
          title="Credits Purchased"
          value={user.metrics.creditsPurchased}
        />
        <KpiCard
          title="Credits Spent"
          value={user.metrics.creditsSpent}
        />
        <KpiCard
          title="Credits Remaining"
          value={user.metrics.creditsRemaining}
        />
        <KpiCard
          title="Generations"
          value={user.metrics.generations}
        />
        <KpiCard
          title="Sessions"
          value={user.metrics.sessions}
        />
        <KpiCard
          title="Avg Session"
          value={`${user.metrics.avgSessionDuration.toFixed(0)}m`}
        />
      </div>

      {/* Product Purchases (if applicable) */}
      {(user.metrics.productPurchases ?? 0) > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          <KpiCard
            title="Books Ordered"
            value={user.metrics.productPurchases!}
          />
          <KpiCard
            title="Product Revenue"
            value={user.metrics.revenueBySource?.productSales ?? 0}
            format="currency"
          />
          <KpiCard
            title="Fulfillment Cost"
            value={
              (user.metrics.costBreakdown?.printing ?? 0) +
              (user.metrics.costBreakdown?.shipping ?? 0)
            }
            format="currency"
          />
        </div>
      )}

      {/* Revenue vs Cost Trend + Activity Trend */}
      <div className="grid gap-4 lg:grid-cols-2">
        <LineChartTile
          title="Revenue vs Cost"
          data={user.metrics.revenueTrend ?? []}
          config={unitEconomicsChartConfig}
          dataKeys={["revenue", "cost"]}
        />
        <LineChartTile
          title="Activity Trend"
          description="Generations per day"
          data={user.metrics.activityTrend ?? []}
          config={activityChartConfig}
          dataKeys={["generations"]}
        />
      </div>

      {/* Funnel Stepper */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Funnel Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            {funnelStages.map((stage, i) => {
              const completed = i <= currentStageIdx;
              return (
                <div key={stage.key} className="flex items-center gap-2 flex-1">
                  <div
                    className={cn(
                      "flex flex-col items-center flex-1",
                    )}
                  >
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2",
                        completed
                          ? "bg-green-500 border-green-500 text-white"
                          : "bg-muted border-muted-foreground/20 text-muted-foreground"
                      )}
                    >
                      {i + 1}
                    </div>
                    <span
                      className={cn(
                        "text-[10px] mt-1 text-center",
                        completed ? "text-foreground font-medium" : "text-muted-foreground"
                      )}
                    >
                      {stage.label}
                    </span>
                  </div>
                  {i < funnelStages.length - 1 && (
                    <div
                      className={cn(
                        "h-0.5 flex-1 -mt-4",
                        i < currentStageIdx
                          ? "bg-green-500"
                          : "bg-muted-foreground/20"
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Payment History + Recent Activity */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Payment History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(user.payments ?? []).length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-muted-foreground"
                    >
                      No payments
                    </TableCell>
                  </TableRow>
                ) : (
                  user.payments.map((payment: { id: string; date: string; type: string; amount: number; status: string }) => (
                    <TableRow key={payment.id}>
                      <TableCell className="text-sm">
                        {new Date(payment.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-sm">{payment.type}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(payment.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={paymentBadgeVariant(payment.status)}
                          className="text-[10px]"
                        >
                          {payment.status}
                        </Badge>
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
              Recent Activity
            </CardTitle>
            <p className="text-xs text-muted-foreground">Last 50 actions</p>
          </CardHeader>
          <CardContent>
            <div className="max-h-[400px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead className="text-right">Credits</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(user.recentActivity ?? []).length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center text-muted-foreground"
                      >
                        No activity
                      </TableCell>
                    </TableRow>
                  ) : (
                    user.recentActivity.slice(0, 50).map((action: { id: string; timestamp: string; action: string; creditsCost: number }) => (
                      <TableRow key={action.id}>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(action.timestamp).toLocaleString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </TableCell>
                        <TableCell className="text-sm">
                          {action.action.replace(/_/g, " ")}
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          {action.creditsCost.toFixed(1)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
