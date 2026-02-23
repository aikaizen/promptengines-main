# Consolidated Instrumentation TODO (Kaizen + Dashboard)

**Source of truth for cross-project consolidation work.**

## Ownership
- **Dashboard team:** contract, adapters, cross-app metric consistency, onboarding framework.
- **Kaizen team:** event correctness, telemetry completeness, rollup quality.
- **Shared:** KPI definitions, reconciliation thresholds, rollout gating.

---

## Phase 1: Contract Freeze (Dashboard-owned)
- [x] Create canonical contract doc (`METRICS-CONTRACT.md`)
- [x] Add app-level adapter metadata in registry (`adapter`, `contractVersion`, `moneyUnit`, `paymentSuccessStatuses`)
- [x] Set default payment success statuses and remove hardcoded status assumptions from API routing path
- [ ] Resolve remaining conflicts in `INSTRUMENTATION.md` and align wording with canonical contract

## Phase 2: Adapter Architecture (Dashboard-owned)
- [x] Add adapter interface (`src/lib/metrics/adapters/types.ts`)
- [x] Add adapter registry (`src/lib/metrics/adapters/index.ts`)
- [x] Add legacy compatibility adapter (`legacy-sql-v1`)
- [x] Route metrics APIs through adapters (`/api/metrics`, `/api/metrics/users`, `/api/metrics/users/[userId]`)

## Phase 3: Kaizen Telemetry Adapter (Dashboard-owned)
- [x] Implement `kaizen-telemetry-v1` adapter
- [x] Source growth from `daily_kpis` + `retention_cohorts` + `event_facts`
- [x] Source finance/unit economics from `event_facts` + `ai_usage_facts` (+ `daily_kpis` trends)
- [x] Source engagement/reliability from telemetry facts
- [x] Keep API response shapes backward-compatible

## Phase 4: Kaizen Instrumentation Alignment (Kaizen-owned)
- [x] Expand `METRICS-SPEC.md` with explicit contract mapping table for dashboard KPIs
- [x] Verify all payment events include stable IDs and USD/credits fields
- [x] Ensure session/activity/reliability signals are complete for adapter needs
- [ ] Validate rollup refresh hooks remain in place and operational

## Phase 5: Legacy Isolation (Dashboard-owned)
- [x] Isolate legacy table-based query behavior into `legacy-sql-v1` adapter
- [ ] Migrate remaining active apps off direct legacy paths where possible
- [ ] Mark legacy adapter sunset criteria and timeline

## Phase 6: Multi-App Onboarding (Shared)
- [x] Add onboarding checklist (`APP-ONBOARDING-CHECKLIST.md`)
- [ ] Run onboarding checklist for Storybook Studio
- [ ] Define onboarding playbook for next app after Kaizen/Storybook

---

## Validation & Test Checklist
- [ ] Adapter parity checks on 7d/30d/90d windows
- [ ] Finance vs unit-economics consistency checks by app
- [ ] `appId=all` mixed adapter regression test
- [ ] Data quality failure-path checks (missing keys, stale data, duplicates)
- [ ] Production smoke on `dashboard.promptengines.com`
