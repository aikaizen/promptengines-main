import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { getApp } from "@/lib/app-registry";

const clientCache = new Map<string, SupabaseClient>();

export function getAppClient(appId: string): SupabaseClient {
  const cached = clientCache.get(appId);
  if (cached) return cached;

  const appConfig = getApp(appId);
  if (!appConfig) {
    throw new Error(`Unknown app: ${appId}`);
  }

  if (!appConfig.supabaseUrl || !appConfig.supabaseServiceRoleKey) {
    throw new Error(`Missing Supabase credentials for app: ${appId}`);
  }

  const client = createClient(
    appConfig.supabaseUrl,
    appConfig.supabaseServiceRoleKey
  );

  clientCache.set(appId, client);
  return client;
}
