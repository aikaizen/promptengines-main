"use client";

import { TileWrapper } from "./tile-wrapper";
import { FunnelDataPoint } from "@/types/metrics";
import { cn } from "@/lib/utils";

interface FunnelTileProps {
  title: string;
  description?: string;
  data: FunnelDataPoint[];
  loading?: boolean;
  error?: string;
  className?: string;
}

export function FunnelTile({
  title,
  description,
  data,
  loading,
  error,
  className,
}: FunnelTileProps) {
  const maxUsers = data.length > 0 ? data[0].users : 1;

  return (
    <TileWrapper
      title={title}
      description={description}
      loading={loading}
      error={error}
      className={className}
    >
      <div className="space-y-3">
        {data.map((point, i) => {
          const widthPercent = (point.users / maxUsers) * 100;
          return (
            <div key={point.stageKey}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">{point.stage}</span>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{point.users.toLocaleString()} users</span>
                  {i > 0 && (
                    <>
                      <span className="text-green-600 dark:text-green-400">
                        {point.conversionRate.toFixed(1)}% conv
                      </span>
                      <span className="text-red-500 dark:text-red-400">
                        {point.dropOffRate.toFixed(1)}% drop
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="h-6 w-full rounded bg-muted/30">
                <div
                  className={cn(
                    "h-full rounded transition-all",
                    i === 0
                      ? "bg-blue-500/80"
                      : i === data.length - 1
                        ? "bg-green-500/80"
                        : "bg-blue-400/60"
                  )}
                  style={{ width: `${widthPercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </TileWrapper>
  );
}
