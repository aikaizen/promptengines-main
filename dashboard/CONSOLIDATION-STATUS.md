# Consolidation Status (Kaizen + Dashboard)

## Why This Exists
This repository now uses an adapter-based metrics architecture so Kaizen can be telemetry-native while other apps can remain on legacy SQL queries temporarily.

This enables:
- separation of app engineering vs dashboard engineering
- a single canonical contract for metrics behavior
- phased onboarding of additional PromptEngines apps without breaking existing dashboard pages

## Current State

### Canonical Contract
- Canonical metrics contract has been added:
  - `METRICS-CONTRACT.md`
- `INSTRUMENTATION.md` is now marked legacy guidance where it conflicts with the canonical contract.

### App Configuration Model
`src/types/apps.ts` and `src/lib/app-registry.ts` now include:
- `adapter`: `kaizen-telemetry-v1` or `legacy-sql-v1`
- `contractVersion`: `1.0`
- `moneyUnit`: `usd_decimal` or `usd_cents`
- `paymentSuccessStatuses`: `string[]`

This removes hardcoded payment status assumptions from routing logic.

## Adapter Architecture

### New Adapter Interface and Registry
- `src/lib/metrics/adapters/types.ts`
- `src/lib/metrics/adapters/index.ts`

Each adapter implements:
- `fetchGrowth`
- `fetchFinance`
- `fetchEngagement`
- `fetchReliability`
- `fetchUnitEconomics`
- `fetchUsers`
- `fetchUserDetail`

### Implemented Adapters
- `legacy-sql-v1`
  - `src/lib/metrics/adapters/legacy-sql-v1.ts`
  - wraps existing table-based behavior for non-migrated apps
  - normalizes money using `moneyUnit` and configurable payment statuses

- `kaizen-telemetry-v1`
  - `src/lib/metrics/adapters/kaizen-telemetry-v1.ts`
  - reads Kaizen telemetry tables:
    - `event_facts`
    - `ai_usage_facts`
    - `daily_kpis`
    - `retention_cohorts`
  - preserves existing API response shapes so UI integrations do not break

## API Routing Changes
The API layer now dispatches by adapter instead of directly calling legacy query modules:
- `src/app/api/metrics/route.ts`
- `src/app/api/metrics/users/route.ts`
- `src/app/api/metrics/users/[userId]/route.ts`

External endpoint contract remains unchanged:
- `GET /api/metrics`
- `GET /api/metrics/users`
- `GET /api/metrics/users/[userId]`

## Cross-Project Tracking Artifacts
- Consolidated TODO (source of truth):
  - `TODO-CONSOLIDATED.md`
- Onboarding checklist for future apps:
  - `APP-ONBOARDING-CHECKLIST.md`

## Validation Run
- `npm run lint` -> passes (warnings only)
- `npm run build` -> passes

## Open Work Before Full Rollout
1. Complete parity checks across 7d/30d/90d windows.
2. Run `appId=all` mixed-adapter regression validation in production-like data.
3. Finish cleanup pass to reconcile remaining legacy wording in `INSTRUMENTATION.md`.
4. Execute onboarding checklist for Storybook Studio.

## Commit Notes
When committing this consolidation, include:
- adapter architecture files
- app registry/type changes
- API route adapter dispatch changes
- canonical contract + checklist + consolidated TODO docs
- instrumentation legacy warning banner update

Recommended commit message theme:
`dashboard: add metrics adapter architecture + canonical contract + kaizen telemetry adapter`
