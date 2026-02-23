# App Onboarding Checklist (Dashboard)

## 1. Choose Adapter Mode
- [ ] `kaizen-telemetry-v1` (preferred)
- [ ] `legacy-sql-v1` (temporary fallback)

## 2. Register App
- [ ] Add app to `src/lib/app-registry.ts`
- [ ] Set `adapter`, `contractVersion`, `moneyUnit`, `paymentSuccessStatuses`
- [ ] Add Supabase URL + service role env vars

## 3. Contract Validation
- [ ] Required keys present: `event_id`, `occurred_at`, `app_id`, `environment`, `account_id`, `user_id`, `event_name`, `properties`
- [ ] Currency convention verified (`usd_decimal` vs `usd_cents`)
- [ ] Payment success statuses validated against production records
- [ ] Date filtering validated (UTC boundaries)

## 4. KPI Readiness
- [ ] Growth metrics load with real data
- [ ] Finance metrics reconcile with source-of-truth
- [ ] Engagement metrics produce non-empty series
- [ ] Reliability metrics produce latency/error distributions
- [ ] User list and detail endpoints return valid payloads

## 5. Data Quality Gates
- [ ] Freshness lag monitored
- [ ] Null key rate acceptable
- [ ] Duplicate event rate acceptable
- [ ] Revenue/cost reconciliation deltas within threshold

## 6. Launch Criteria
- [ ] `appId=all` works with mixed adapter apps
- [ ] 7d/30d/90d ranges validated in dashboard UI
- [ ] Known caveats documented in app onboarding notes
