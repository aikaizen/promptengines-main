import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Server client for server components and API routes
export async function createDashboardServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_DASHBOARD_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_DASHBOARD_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll can be called from a Server Component where cookies
            // are read-only. The middleware will refresh the session.
          }
        },
      },
    }
  );
}

// Admin client with service role key (for server-side only)
export function createDashboardAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_DASHBOARD_SUPABASE_URL!,
    process.env.DASHBOARD_SUPABASE_SERVICE_ROLE_KEY!
  );
}
