"use client";

import useSWR from "swr";
import { AppConfig } from "@/types/apps";

export interface DashboardAppListItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  status: AppConfig["status"];
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useApps() {
  const { data, error, isLoading } = useSWR<{ apps: DashboardAppListItem[] }>(
    "/api/apps",
    fetcher,
    { refreshInterval: 60000 }
  );

  const apps = [...(data?.apps ?? [])].sort((a, b) => {
    if (a.status === b.status) {
      return a.name.localeCompare(b.name);
    }
    return a.status === "active" ? -1 : 1;
  });

  return { apps, error, isLoading };
}
