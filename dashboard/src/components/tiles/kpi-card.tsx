import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: number | string;
  previousValue?: number;
  format?: "number" | "currency" | "percent";
  prefix?: string;
  suffix?: string;
  loading?: boolean;
  className?: string;
}

function formatValue(
  value: number | string,
  fmt: "number" | "currency" | "percent" = "number",
  prefix?: string,
  suffix?: string
): string {
  if (typeof value === "string") return value;

  let formatted: string;
  switch (fmt) {
    case "currency":
      formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
      break;
    case "percent":
      formatted = `${value.toFixed(1)}%`;
      break;
    default:
      formatted = new Intl.NumberFormat("en-US").format(value);
  }

  return `${prefix || ""}${formatted}${suffix || ""}`;
}

function calculateChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

export function KpiCard({
  title,
  value,
  previousValue,
  format: fmt = "number",
  prefix,
  suffix,
  loading,
  className,
}: KpiCardProps) {
  const numericValue = typeof value === "number" ? value : 0;
  const change =
    previousValue !== undefined
      ? calculateChange(numericValue, previousValue)
      : undefined;

  return (
    <Card className={cn(className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-7 w-20" />
            <Skeleton className="h-4 w-14" />
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold">
              {formatValue(value, fmt, prefix, suffix)}
            </div>
            {change !== undefined && (
              <p
                className={cn(
                  "text-xs mt-1",
                  change > 0
                    ? "text-green-600 dark:text-green-400"
                    : change < 0
                      ? "text-red-600 dark:text-red-400"
                      : "text-muted-foreground"
                )}
              >
                {change > 0 ? "+" : ""}
                {change.toFixed(1)}% from previous period
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
