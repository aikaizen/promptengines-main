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

function buildUrl(base: string, params: Record<string, string>): string {
  const searchParams = new URLSearchParams(params);
  return `${base}?${searchParams.toString()}`;
}

export function useUserMetrics(appId: string, dateRange: DateRange) {
  const url = buildUrl("/api/metrics/users", {
    appId,
    from: format(dateRange.from, "yyyy-MM-dd"),
    to: format(dateRange.to, "yyyy-MM-dd"),
  });
  return useSWR(url, fetcher, { refreshInterval: 60000 });
}

export function useUserDetail(
  appId: string,
  userId: string,
  dateRange: DateRange
) {
  const url = buildUrl(`/api/metrics/users/${userId}`, {
    appId,
    from: format(dateRange.from, "yyyy-MM-dd"),
    to: format(dateRange.to, "yyyy-MM-dd"),
  });
  return useSWR(url, fetcher, { refreshInterval: 60000 });
}

export function useUnitEconomics(appId: string, dateRange: DateRange) {
  const url = buildUrl("/api/metrics", {
    appId,
    type: "unit-economics",
    from: format(dateRange.from, "yyyy-MM-dd"),
    to: format(dateRange.to, "yyyy-MM-dd"),
  });
  return useSWR(url, fetcher, { refreshInterval: 60000 });
}
