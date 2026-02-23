# PromptEngines Metrics Contract (Canonical)

**Status:** Canonical source of truth for all apps onboarding into `dashboard.promptengines.com`.

## Scope
This contract defines the required telemetry envelope, economic field semantics, and adapter responsibilities for all PromptEngines apps.

If this document conflicts with `INSTRUMENTATION.md`, this document wins.

## 1. Mandatory Event Envelope
Every event written to an app telemetry stream must include:

- `event_id` (string/UUID, idempotent)
- `occurred_at` (UTC timestamp)
- `app_id` (string)
- `environment` (string)
- `account_id` (nullable string/UUID)
- `user_id` (nullable string)
- `event_name` (string)
- `properties` (JSON object)

## 2. Money and Units
Canonical units across adapters:

- Revenue and cost outputs from adapters are USD decimal fields (suffix `*_usd` where applicable).
- Credits remain integer unit counts.
- Legacy SQL adapters may read cent-based source tables, but must normalize outputs to USD decimals.

## 3. Payment Success Statuses
- Default payment success statuses: `["succeeded"]`.
- Each app config may override via `paymentSuccessStatuses`.
- Status filtering must be adapter-configurable (not hardcoded inside shared API routing).

## 4. Adapter Contract
Each app must declare:

- `adapter`: `kaizen-telemetry-v1` or `legacy-sql-v1`
- `contractVersion`: `1.0`
- `moneyUnit`: `usd_decimal` or `usd_cents`
- `paymentSuccessStatuses`: `string[]`

Each adapter must implement:

- `fetchGrowth`
- `fetchFinance`
- `fetchEngagement`
- `fetchReliability`
- `fetchUnitEconomics`
- `fetchUsers`
- `fetchUserDetail`

## 5. Ownership Split
- App teams own event correctness and source schema quality.
- Dashboard team owns adapter logic, metric shapes, and cross-app comparability.
- Shared ownership for KPI definitions and reconciliation rules.

## 6. Rollout Policy
- New apps should use telemetry adapters by default.
- Legacy SQL adapter is temporary compatibility mode only.
- Promotion to telemetry adapter requires passing onboarding checklist and parity checks.
