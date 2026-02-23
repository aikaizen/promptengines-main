# Build Guide: dashboard.promptengines.com (All promptengines.com apps)

## Goal
Run a single dashboard at `dashboard.promptengines.com` that shows metrics for:
- `kaizen.promptengines.com`
- `storybookstudio.promptengines.com`
- `bible.promptengines.com`
- `promptengines.com`

## Architecture (Current Code)
The dashboard is multi-app and adapter-based:
- `kaizen` -> adapter: `kaizen-telemetry-v1`
- `storybook-studio` -> adapter: `storybook-v1`
- `bible` -> adapter: `neon-telemetry-v1`
- `promptengines-web` -> adapter: `kaizen-telemetry-v1`

Source: `dashboard/src/lib/app-registry.ts`

This means each app can keep its own schema while the dashboard API remains unified.

## Data Source Model
- The dashboard reads directly from each app's production Supabase project.
- No ETL copy into a third database is required.
- Access is server-side only via Supabase service role keys.

## Prerequisites

### 1) Kaizen data readiness (telemetry adapter)
Kaizen Supabase must contain these telemetry assets:
- Migrations applied:
  - `20260211120000_metrics_foundation.sql`
  - `20260211150000_metrics_retention_quality.sql`
  - `20260211170000_metrics_reconciliation_checks.sql`
- Core tables with live rows for `app_id = 'kaizen'`:
  - `event_facts`
  - `ai_usage_facts`
  - `daily_kpis`
  - `retention_cohorts`
- Rollups running (`refresh_daily_kpis`, retention, data-quality/reconciliation jobs).

### 2) Storybook Studio data readiness (storybook-v1 adapter)
The current `storybook-v1` adapter expects:
- `profiles`
- `events`
- `orders`

### 3) Bible data readiness (neon-telemetry-v1 adapter)
The current `neon-telemetry-v1` adapter expects:
- `event_facts`
- `ai_usage_facts`
- `daily_kpis` (optional but recommended)
- `retention_cohorts` (optional but recommended)
- `accounts` (for Users pages)

## Environment Variables (Dashboard Project)
Set these in the Vercel project for `dashboard.promptengines.com`:

- `KAIZEN_SUPABASE_URL`
- `KAIZEN_SUPABASE_SERVICE_ROLE_KEY`
- `STORYBOOK_SUPABASE_URL`
- `STORYBOOK_SUPABASE_SERVICE_ROLE_KEY`
- `BIBLE_NEON_DATABASE_URL`
- `PROMPTENGINES_WEB_SUPABASE_URL`
- `PROMPTENGINES_WEB_SUPABASE_SERVICE_ROLE_KEY`

Notes:
- Keys must be server-only.
- Do not expose service-role keys to client bundles.
- Trim accidental whitespace in env var values.

## App Registry Requirements
Ensure all apps are active in `dashboard/src/lib/app-registry.ts` and mapped exactly:
- `kaizen` with `adapter: "kaizen-telemetry-v1"`
- `storybook-studio` with `adapter: "storybook-v1"`
- `bible` with `adapter: "neon-telemetry-v1"`
- `promptengines-web` with `adapter: "kaizen-telemetry-v1"`

Also keep:
- `contractVersion: "1.0"`
- correct `moneyUnit` per app
- app-specific `paymentSuccessStatuses`

## Build and Deploy
From `dashboard/`:

```bash
npm install
npm run lint
npm run build
vercel --prod
```

## API Verification (Correct Current Contract)
The current metrics API requires `appId`, `type`, `from`, and `to`.

```bash
# 1) App registry health
curl "https://dashboard.promptengines.com/api/apps"

# 2) Kaizen overview
curl "https://dashboard.promptengines.com/api/metrics?appId=kaizen&type=overview&from=2026-02-01&to=2026-02-12"

# 3) Storybook overview
curl "https://dashboard.promptengines.com/api/metrics?appId=storybook-studio&type=overview&from=2026-02-01&to=2026-02-12"

# 4) Cross-app overview (all active apps)
curl "https://dashboard.promptengines.com/api/metrics?appId=all&type=overview&from=2026-02-01&to=2026-02-12"

# 5) Bible and promptengines.com growth
curl "https://dashboard.promptengines.com/api/metrics?appId=bible&type=growth&from=2026-02-01&to=2026-02-12"
curl "https://dashboard.promptengines.com/api/metrics?appId=promptengines-web&type=growth&from=2026-02-01&to=2026-02-12"

# 6) User list + user detail
curl "https://dashboard.promptengines.com/api/metrics/users?appId=kaizen&from=2026-02-01&to=2026-02-12"
curl "https://dashboard.promptengines.com/api/metrics/users?appId=storybook-studio&from=2026-02-01&to=2026-02-12"
```

Expected:
- `/api/apps` lists `kaizen`, `storybook-studio`, `bible`, and `promptengines-web` as active.
- `overview` payloads include non-empty `growth`, `finance`, `engagement`, `reliability`, and `unitEconomics` where data exists.
- `appId=all` returns all active apps in one response.

## Troubleshooting
If one app is empty while the other works:
1. Verify that app's env vars are present and correct.
2. Confirm required tables for that app's adapter have recent rows.
3. Validate payment status values match `paymentSuccessStatuses` in app registry.
4. For Kaizen: confirm telemetry rollups have refreshed.
5. For Storybook: ensure `profiles`, `events`, and `orders` are receiving production writes.
