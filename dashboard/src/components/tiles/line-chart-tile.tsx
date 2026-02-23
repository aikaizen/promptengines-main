"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { TileWrapper } from "./tile-wrapper";

interface LineChartTileProps {
  title: string;
  description?: string;
  data: Record<string, string | number>[];
  config: ChartConfig;
  dataKeys: string[];
  xAxisKey?: string;
  loading?: boolean;
  error?: string;
  className?: string;
}

export function LineChartTile({
  title,
  description,
  data,
  config,
  dataKeys,
  xAxisKey = "date",
  loading,
  error,
  className,
}: LineChartTileProps) {
  return (
    <TileWrapper
      title={title}
      description={description}
      loading={loading}
      error={error}
      className={className}
    >
      <ChartContainer config={config} className="h-[250px] w-full">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            {dataKeys.map((key) => (
              <linearGradient key={key} id={`fill-${key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={`var(--color-${key})`} stopOpacity={0.3} />
                <stop offset="95%" stopColor={`var(--color-${key})`} stopOpacity={0.05} />
              </linearGradient>
            ))}
          </defs>
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
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              stroke={`var(--color-${key})`}
              fill={`url(#fill-${key})`}
              strokeWidth={2}
            />
          ))}
        </AreaChart>
      </ChartContainer>
    </TileWrapper>
  );
}
