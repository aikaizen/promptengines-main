import { TileWrapper } from "./tile-wrapper";
import { cn } from "@/lib/utils";

interface CohortTileProps {
  title: string;
  description?: string;
  data: { cohort: string; [key: string]: string | number }[];
  periods: string[];
  loading?: boolean;
  error?: string;
  className?: string;
}

function getRetentionColor(value: number): string {
  if (value >= 80) return "bg-green-600 text-white";
  if (value >= 60) return "bg-green-500 text-white";
  if (value >= 40) return "bg-green-400 text-white";
  if (value >= 20) return "bg-green-300 text-green-900";
  if (value > 0) return "bg-green-200 text-green-900";
  return "bg-muted text-muted-foreground";
}

export function CohortTile({
  title,
  description,
  data,
  periods,
  loading,
  error,
  className,
}: CohortTileProps) {
  return (
    <TileWrapper
      title={title}
      description={description}
      loading={loading}
      error={error}
      className={className}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th className="text-left p-2 font-medium text-muted-foreground">
                Cohort
              </th>
              {periods.map((period) => (
                <th
                  key={period}
                  className="p-2 text-center font-medium text-muted-foreground"
                >
                  {period}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.cohort}>
                <td className="p-2 font-medium">{row.cohort}</td>
                {periods.map((period) => {
                  const value =
                    typeof row[period] === "number"
                      ? (row[period] as number)
                      : 0;
                  return (
                    <td key={period} className="p-1">
                      <div
                        className={cn(
                          "rounded p-2 text-center",
                          getRetentionColor(value)
                        )}
                      >
                        {value > 0 ? `${value}%` : "-"}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </TileWrapper>
  );
}
