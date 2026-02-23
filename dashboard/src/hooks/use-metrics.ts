"use client";

import useSWR from "swr";
import { DateRange } from "@/types/metrics";
import { format } from "date-fns";

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
};

function buildUrl(
  base: string,
  params: Record<string, string>
): string {
  const searchParams = new URLSearchParams(params);
  return `${base}?${searchParams.toString()}`;
}

export function useGrowthMetrics(appId: string, dateRange: DateRange) {
  const url = buildUrl("/api/metrics", {
    appId,
    type: "growth",
    from: format(dateRange.from, "yyyy-MM-dd"),
    to: format(dateRange.to, "yyyy-MM-dd"),
  });
  return useSWR(url, fetcher, { refreshInterval: 60000 });
}

export function useFinanceMetrics(appId: string, dateRange: DateRange) {
  const url = buildUrl("/api/metrics", {
    appId,
    type: "finance",
    from: format(dateRange.from, "yyyy-MM-dd"),
    to: format(dateRange.to, "yyyy-MM-dd"),
  });
  return useSWR(url, fetcher, { refreshInterval: 60000 });
}

export function useEngagementMetrics(appId: string, dateRange: DateRange) {
  const url = buildUrl("/api/metrics", {
    appId,
    type: "engagement",
    from: format(dateRange.from, "yyyy-MM-dd"),
    to: format(dateRange.to, "yyyy-MM-dd"),
  });
  return useSWR(url, fetcher, { refreshInterval: 60000 });
}

export function useReliabilityMetrics(appId: string, dateRange: DateRange) {
  const url = buildUrl("/api/metrics", {
    appId,
    type: "reliability",
    from: format(dateRange.from, "yyyy-MM-dd"),
    to: format(dateRange.to, "yyyy-MM-dd"),
  });
  return useSWR(url, fetcher, { refreshInterval: 60000 });
}

export function useOverviewMetrics(dateRange: DateRange) {
  const url = buildUrl("/api/metrics", {
    appId: "all",
    type: "overview",
    from: format(dateRange.from, "yyyy-MM-dd"),
    to: format(dateRange.to, "yyyy-MM-dd"),
  });
  return useSWR(url, fetcher, { refreshInterval: 60000 });
}
