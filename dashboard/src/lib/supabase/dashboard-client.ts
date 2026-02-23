import { createBrowserClient } from "@supabase/ssr";

// Browser client for client components
export function createDashboardBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_DASHBOARD_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_DASHBOARD_SUPABASE_ANON_KEY!
  );
}
