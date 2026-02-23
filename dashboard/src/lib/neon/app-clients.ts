import { Pool } from "pg";
import { getApp } from "@/lib/app-registry";

const poolCache = new Map<string, Pool>();

export function getNeonAppClient(appId: string): Pool {
  const cached = poolCache.get(appId);
  if (cached) return cached;

  const appConfig = getApp(appId);
  if (!appConfig) {
    throw new Error(`Unknown app: ${appId}`);
  }

  if (!appConfig.neonDatabaseUrl) {
    throw new Error(`Missing Neon database URL for app: ${appId}`);
  }

  const pool = new Pool({
    connectionString: appConfig.neonDatabaseUrl,
    ssl: { rejectUnauthorized: false },
    max: 5,
  });

  poolCache.set(appId, pool);
  return pool;
}
