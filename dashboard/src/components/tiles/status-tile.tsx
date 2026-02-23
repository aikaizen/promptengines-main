import { TileWrapper } from "./tile-wrapper";
import { cn } from "@/lib/utils";
import { StatusIndicator } from "@/types/metrics";

interface StatusTileProps {
  title: string;
  description?: string;
  indicators: StatusIndicator[];
  loading?: boolean;
  error?: string;
  className?: string;
}

const statusStyles = {
  healthy: {
    dot: "bg-green-500",
    bg: "bg-green-50 dark:bg-green-950/30",
    text: "text-green-700 dark:text-green-400",
    label: "Healthy",
  },
  warning: {
    dot: "bg-yellow-500",
    bg: "bg-yellow-50 dark:bg-yellow-950/30",
    text: "text-yellow-700 dark:text-yellow-400",
    label: "Warning",
  },
  critical: {
    dot: "bg-red-500",
    bg: "bg-red-50 dark:bg-red-950/30",
    text: "text-red-700 dark:text-red-400",
    label: "Critical",
  },
};

export function StatusTile({
  title,
  description,
  indicators,
  loading,
  error,
  className,
}: StatusTileProps) {
  return (
    <TileWrapper
      title={title}
      description={description}
      loading={loading}
      error={error}
      className={className}
    >
      <div className="space-y-3">
        {indicators.map((indicator) => {
          const style = statusStyles[indicator.status];
          return (
            <div
              key={indicator.label}
              className={cn("flex items-center justify-between rounded-md p-3", style.bg)}
            >
              <div className="flex items-center gap-3">
                <span className={cn("h-2.5 w-2.5 rounded-full", style.dot)} />
                <div>
                  <p className="text-sm font-medium">{indicator.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {indicator.detail}
                  </p>
                </div>
              </div>
              <span className={cn("text-xs font-medium", style.text)}>
                {style.label}
              </span>
            </div>
          );
        })}
      </div>
    </TileWrapper>
  );
}
