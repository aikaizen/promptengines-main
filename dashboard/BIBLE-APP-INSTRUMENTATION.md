# Bible App Instrumentation Plan

## Goal
Instrument `bible.promptengines.com` so `dashboard.promptengines.com` can report growth metrics (Total Users, DAU, WAU, MAU, stickiness) and the standard finance/engagement/reliability pages.

This dashboard build is also configured to track visits for `promptengines.com` itself.

## 1. Bible App Requirements

### 1.1 Neon + Dashboard env
- Create or confirm a Neon Postgres database for Bible analytics.
- Add these environment variables to the dashboard deployment:
  - `BIBLE_NEON_DATABASE_URL`

### 1.2 Required telemetry tables
- `event_facts`
- `ai_usage_facts`
- `daily_kpis` (recommended; adapter falls back when empty)
- `retention_cohorts` (recommended)
- `accounts` (needed for Users table/detail pages)

### 1.3 Required event envelope
Every event written to `event_facts` must include:
- `event_id`
- `occurred_at` (UTC)
- `app_id` (must be `bible`)
- `environment`
- `account_id` (nullable for anon)
- `user_id` (nullable)
- `event_name`
- `properties` (JSON)

Schema note:
- This dashboard expects `accounts.id` to match `event_facts.account_id` (UUID/text match).

### 1.4 Minimum Bible events for MAU/DAU
- `auth.account.created` (one-time per account)
- `auth.login.success` (each login/session)

These two events power:
- Total Users + New Users (`auth.account.created`)
- DAU/WAU/MAU (`auth.login.success`)

### 1.5 Recommended events for full dashboard coverage
- Engagement:
  - `session.started`
  - `session.ended` with `properties.duration_ms`
  - `generation.started`, `generation.succeeded`, `generation.failed`
- Finance:
  - `purchase.completed` with `properties.amount_usd`
  - `credits.purchased` with `properties.amount`
  - `credits.spent` with `properties.amount`
- Reliability:
  - `ai_usage_facts` rows with `status`, `latency_ms`, `estimated_cost_usd`

## 2. Root Domain (`promptengines.com`) Visit Tracking

The dashboard now includes an app ID `promptengines-web` with growth config:
- signup event: `web.visitor.created`
- activity event: `web.visit`
- identity field: `user_id`

Implement this on `promptengines.com`:
- Generate a stable anonymous visitor ID (cookie/localStorage).
- Send `web.visitor.created` once per new visitor with `user_id=<visitor_id>`.
- Send `web.visit` on each page visit with `user_id=<visitor_id>`.
- Set `app_id` to `promptengines-web` on both events.

This enables DAU/WAU/MAU for site traffic without requiring auth accounts.

## 3. Validation Queries

After instrumentation is live, verify:

```bash
curl "https://dashboard.promptengines.com/api/apps"
curl "https://dashboard.promptengines.com/api/metrics?appId=bible&type=growth&from=2026-02-01&to=2026-02-20"
curl "https://dashboard.promptengines.com/api/metrics?appId=promptengines-web&type=growth&from=2026-02-01&to=2026-02-20"
curl "https://dashboard.promptengines.com/api/metrics?appId=all&type=overview&from=2026-02-01&to=2026-02-20"
```

Expected:
- Bible shows non-zero growth metrics once events are flowing.
- PromptEngines root shows visit-based DAU/WAU/MAU from `web.visit`.
- `appId=all` includes Kaizen, Storybook Studio, Bible, and PromptEngines.com.
