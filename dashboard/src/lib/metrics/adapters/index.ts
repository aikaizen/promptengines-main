import { getApp } from "@/lib/app-registry";
import { getAppClient } from "@/lib/supabase/app-clients";
import { MetricsAdapter } from "@/lib/metrics/adapters/types";
import { kaizenTelemetryV1Adapter } from "@/lib/metrics/adapters/kaizen-telemetry-v1";
import { legacySqlV1Adapter } from "@/lib/metrics/adapters/legacy-sql-v1";
import { storybookV1Adapter } from "@/lib/metrics/adapters/storybook-v1";
import { neonTelemetryV1Adapter } from "@/lib/metrics/adapters/neon-telemetry-v1";
import { AdapterId } from "@/types/apps";
import { SupabaseClient } from "@supabase/supabase-js";

const adapterById: Record<AdapterId, MetricsAdapter> = {
  "kaizen-telemetry-v1": kaizenTelemetryV1Adapter,
  "legacy-sql-v1": legacySqlV1Adapter,
  "storybook-v1": storybookV1Adapter,
  "neon-telemetry-v1": neonTelemetryV1Adapter,
};

export function getMetricsAdapterContext(appId: string) {
  const app = getApp(appId);
  if (!app) {
    throw new Error(`Unknown app: ${appId}`);
  }

  const adapter = adapterById[app.adapter];

  if (!adapter) {
    throw new Error(`No adapter registered for app ${appId} (${app.adapter})`);
  }

  const client =
    app.adapter === "neon-telemetry-v1"
      ? (null as unknown as SupabaseClient)
      : getAppClient(appId);

  return { app, client, adapter };
}
