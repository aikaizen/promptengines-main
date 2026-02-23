"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { UnitEconomics } from "@/types/metrics";

interface UnitEconomicsTileProps {
  data: UnitEconomics;
  loading?: boolean;
  className?: string;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function UnitEconomicsTile({
  data,
  loading,
  className,
}: UnitEconomicsTileProps) {
  const metrics = [
    { label: "ARPU", value: data.arpu, color: "" },
    { label: "Cost/User", value: data.costPerUser, color: "text-red-600 dark:text-red-400" },
    { label: "Margin/User", value: data.marginPerUser, color: data.marginPerUser >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400" },
    { label: "LTV", value: data.ltv, color: "text-blue-600 dark:text-blue-400" },
  ];

  return (
    <Card className={cn(className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Unit Economics
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-1">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-6 w-12" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {metrics.map((m) => (
              <div key={m.label}>
                <p className="text-xs text-muted-foreground">{m.label}</p>
                <p className={cn("text-xl font-bold", m.color)}>
                  {formatCurrency(m.value)}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
