"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { TileWrapper } from "./tile-wrapper";

interface BarChartTileProps {
  title: string;
  description?: string;
  data: Record<string, string | number>[];
  config: ChartConfig;
  dataKeys: string[];
  xAxisKey?: string;
  loading?: boolean;
  error?: string;
  className?: string;
  stacked?: boolean;
}

export function BarChartTile({
  title,
  description,
  data,
  config,
  dataKeys,
  xAxisKey = "date",
  loading,
  error,
  className,
  stacked,
}: BarChartTileProps) {
  return (
    <TileWrapper
      title={title}
      description={description}
      loading={loading}
      error={error}
      className={className}
    >
      <ChartContainer config={config} className="h-[250px] w-full">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey={xAxisKey}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            fontSize={12}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            fontSize={12}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          {dataKeys.map((key) => (
            <Bar
              key={key}
              dataKey={key}
              fill={`var(--color-${key})`}
              radius={[4, 4, 0, 0]}
              stackId={stacked ? "stack" : undefined}
            />
          ))}
        </BarChart>
      </ChartContainer>
    </TileWrapper>
  );
}
