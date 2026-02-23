# Dashboard Instrumentation & Metrics Specification

> [!WARNING]
> This document is now **legacy guidance** for implementation details.
> The canonical contract is `/Users/adilislam/Desktop/PromptEngines/dashboard/METRICS-CONTRACT.md`.
> If there is any conflict (status filters, currency units, adapter behavior), the canonical contract wins.

> **Audience:** Kaizen and Storybook Studio engineering teams
> **Dashboard version:** 0.1.0 (Next.js 16 + Supabase)
> **Last updated:** 2026-02-11

## How to Read This Document

Every requirement is tagged with a confidence marker:

| Marker | Meaning |
|--------|---------|
| **FIRM** | The dashboard relies on this exact contract. Changing it will break queries. Do not deviate without a dashboard code change. |
| **STRONG** | The dashboard uses this and it's well-reasoned, but an alternative could work if you update the corresponding query file. |
| **FLEXIBLE** | Placeholder logic or assumption. Override freely — just tell the dashboard team what you chose so they can update. |

---

## 1. Architecture Overview

```
┌──────────────┐     ┌──────────────────┐     ┌────────────────────┐
│  Your App    │────▶│  Supabase (PG)   │◀────│  Dashboard         │
│  (Kaizen /   │     │  per-app instance │     │  (Next.js)         │
│  Storybook)  │     └──────────────────┘     └────────────────────┘
└──────────────┘            ▲                         │
       │                    │                         │
       │  writes rows ──────┘         reads via ──────┘
       │  (events, payments,          supabase-js
       │   sessions, etc.)            service-role key
```

Each app has its **own Supabase project**. The dashboard connects to each using a service-role key (env vars). All queries run server-side through `/api/metrics` routes.

**Revenue model per app** (configured in `src/lib/app-registry.ts`):

| App | Revenue Model | Primary Top-Level Metrics |
|-----|---------------|--------------------------|
| Kaizen | `credits` | Total Users, DAU, MAU, Stickiness, Revenue, Margin |
| Storybook Studio | `credits_and_products` | **Credits Purchased, Books Sold**, Total Revenue, Total Users, Margin, Avg Book Price |

---

## 2. Required Database Tables

### 2.1 `profiles` — **FIRM**

The central user table. One row per user. The dashboard queries this table on nearly every page.

| Column | Type | Required | Confidence | Notes |
|--------|------|----------|------------|-------|
| `id` | `uuid` (PK) | Yes | **FIRM** | User ID. Must match `user_id` FK in all other tables. |
| `email` | `text` | Yes | **FIRM** | Displayed in user tables, search, and detail pages. |
| `full_name` | `text` | No | **FIRM** | Falls back to `email` if null. Displayed as user name. |
| `created_at` | `timestamptz` | Yes | **FIRM** | Used for growth metrics, cohort analysis, date filtering. |
| `last_active` | `timestamptz` | No | **STRONG** | Shown in user detail. Falls back to `created_at`. |
| `avatar_url` | `text` | No | **FLEXIBLE** | Optional avatar. Not currently rendered (initials used). |
| `plan` | `text` | No | **STRONG** | Expected values: `"free"`, `"starter"`, `"pro"`, `"enterprise"`. Falls back to `"free"`. Used for badge display and user filtering. |
| `has_paid` | `boolean` | No | **STRONG** | `true` if user has ever made a payment. Used to count paying users in unit economics. If you can't store this, the dashboard can be updated to derive it from the `payments` table — but it's slower. |
| `funnel_stage` | `text` | No | **STRONG** | Expected values: `"signed_up"`, `"onboarded"`, `"first_gen"`, `"purchased"`, `"retained"`. Falls back to `"signed_up"`. See Section 5 for funnel definition. |
| `onboarding_complete` | `boolean` | No | **STRONG** | Used to calculate activation rate in engagement metrics. |
| `total_revenue` | `numeric` | No | **FLEXIBLE** | Denormalized: total credit + subscription revenue (in cents or dollars — see Section 7). Used in user list for fast queries. Can be derived from `payments` if you'd rather not denormalize. |
| `total_product_revenue` | `numeric` | No | **FLEXIBLE** | Denormalized: total revenue from product orders (books). Only needed for `credits_and_products` apps. |
| `total_cost` | `numeric` | No | **FLEXIBLE** | Denormalized: total API/LLM cost attributed to this user. |
| `total_fulfillment_cost` | `numeric` | No | **FLEXIBLE** | Denormalized: total printing + shipping cost for this user's orders. |
| `printing_cost` | `numeric` | No | **FLEXIBLE** | Denormalized breakdown of fulfillment into printing. Only needed for user detail cost breakdown view. |
| `shipping_cost` | `numeric` | No | **FLEXIBLE** | Denormalized breakdown of fulfillment into shipping. Only needed for user detail cost breakdown view. |
| `total_generations` | `numeric` | No | **FLEXIBLE** | Count of AI generations. Displayed in user table and detail. |
| `credits_purchased` | `numeric` | No | **FLEXIBLE** | Lifetime credits purchased. Shown in user detail. |
| `credits_spent` | `numeric` | No | **FLEXIBLE** | Lifetime credits consumed. Shown in user detail. |
| `total_sessions` | `numeric` | No | **FLEXIBLE** | Lifetime session count. Shown in user detail. |
| `avg_session_duration` | `numeric` | No | **FLEXIBLE** | Average session length in minutes. Shown in user detail. |
| `product_purchases` | `numeric` | No | **FLEXIBLE** | Count of product orders (e.g., books ordered). Only for Storybook Studio. |

**Note on denormalized columns:** The `total_*` columns on profiles are used so the user list page can display revenue/cost/margin without joining to every event table. If you prefer not to denormalize, we can update the user list query to aggregate from `payments`, `api_costs`, and `orders` — but it will be slower for large user bases. The dashboard currently reads these directly from `profiles` with `select("*")`.

---

### 2.2 `payments` — **FIRM**

All monetary transactions from users (credit pack purchases, subscription payments).

| Column | Type | Required | Confidence | Notes |
|--------|------|----------|------------|-------|
| `id` | `uuid` (PK) | Yes | **FIRM** | Payment ID. |
| `user_id` | `uuid` (FK → profiles.id) | Yes | **FIRM** | Who paid. |
| `amount` | `numeric` | Yes | **FIRM** | Payment amount. **See Section 7 for currency unit convention.** |
| `type` | `text` | Yes | **STRONG** | `"subscription"` for recurring plans, anything else is treated as a credit purchase. If you have other types, let us know. |
| `status` | `text` | Yes | **FIRM** | Finance queries filter by `status = 'succeeded'`. User detail queries show all statuses. Expected values: `"succeeded"`, `"completed"`, `"pending"`, `"refunded"`. |
| `created_at` | `timestamptz` | Yes | **FIRM** | Used for date range filtering and trend charts. |

**Important:** The finance query currently filters `status = 'succeeded'` for revenue calculation. If your payment processor uses `'completed'` instead, update the query or use `'succeeded'`. This is a **known inconsistency** — the unit-economics query filters by `status = 'completed'`. **Your team should pick one status string and we'll standardize.**

---

### 2.3 `orders` — **FIRM for Storybook Studio, not needed for Kaizen**

Product/physical-good purchases (e.g., printed books). The dashboard wraps all `orders` queries in try/catch, so if this table doesn't exist, it degrades gracefully.

| Column | Type | Required | Confidence | Notes |
|--------|------|----------|------------|-------|
| `id` | `uuid` or `bigint` (PK) | Yes | **FIRM** | Order ID. |
| `user_id` | `uuid` (FK → profiles.id) | Yes | **FIRM** | Who ordered. |
| `amount` | `numeric` | Yes | **FIRM** | Order total in same unit as `payments.amount`. |
| `product_type` | `text` | No | **FLEXIBLE** | e.g., `"book"`, `"poster"`. Shown in payment history as the type label. Falls back to `"Book Purchase"`. |
| `status` | `text` | Yes | **STRONG** | `"completed"` for revenue counting. Also `"pending"`, `"refunded"`. |
| `created_at` | `timestamptz` | Yes | **FIRM** | Date range filtering. |

---

### 2.4 `credit_transactions` — **STRONG**

Ledger of credit purchases and spends.

| Column | Type | Required | Confidence | Notes |
|--------|------|----------|------------|-------|
| `credits` | `numeric` | Yes | **FIRM** | Number of credits. Positive for purchases, negative (or positive with type="spend") for usage. |
| `type` | `text` | Yes | **FIRM** | `"purchase"` or `"spend"`. |
| `created_at` | `timestamptz` | Yes | **FIRM** | Date range filtering. |

**If you track credits differently** (e.g., a running balance column on `profiles`), tell us. The finance page uses this table to show "Credits Purchased" and "Credits Spent" as separate aggregates.

---

### 2.5 `api_costs` — **FIRM**

Per-request cost tracking for LLM/API calls.

| Column | Type | Required | Confidence | Notes |
|--------|------|----------|------------|-------|
| `cost` | `numeric` | Yes | **FIRM** | Cost of this API call in **dollars** (not cents). |
| `created_at` | `timestamptz` | Yes | **FIRM** | Date range filtering and daily COGS trend. |

**Granularity:** One row per API call is ideal for accurate trends. If you batch (e.g., one row per user per day), the daily trend charts will still work but will be less granular.

**What counts as an API cost:** Any external API call your app makes that has a $ cost — primarily LLM inference (OpenAI, Anthropic, Google, etc.), but also image generation, embeddings, or any third-party API with usage-based pricing.

---

### 2.6 `fulfillment_costs` — **STRONG for Storybook Studio, not needed for Kaizen**

Costs associated with physical product fulfillment. Wrapped in try/catch — degrades gracefully if missing.

| Column | Type | Required | Confidence | Notes |
|--------|------|----------|------------|-------|
| `printing_cost` | `numeric` | Yes | **FIRM** | Cost to print the product (dollars). |
| `shipping_cost` | `numeric` | Yes | **FIRM** | Shipping/delivery cost (dollars). |
| `created_at` | `timestamptz` | Yes | **FIRM** | Date range filtering. |

**Alternative:** If you track fulfillment costs as columns on the `orders` table instead of a separate table, let us know. The dashboard query can be easily updated.

---

### 2.7 `user_activity` — **FIRM**

Raw activity events used to calculate DAU/WAU/MAU.

| Column | Type | Required | Confidence | Notes |
|--------|------|----------|------------|-------|
| `user_id` | `uuid` (FK → profiles.id) | Yes | **FIRM** | Who was active. |
| `created_at` | `timestamptz` | Yes | **FIRM** | When the activity occurred. |

**What counts as "activity":** Any meaningful user action — page view, generation request, button click, API call. The dashboard counts **distinct user_ids** per day/week/month. One event per user per day is sufficient for DAU, but logging individual actions is fine too (we use `DISTINCT`).

**If you already have an analytics table** (e.g., `events` or `analytics`), we can point the query there instead. The dashboard just needs `user_id` + `created_at`.

---

### 2.8 `sessions` — **STRONG**

Session-level data for engagement metrics.

| Column | Type | Required | Confidence | Notes |
|--------|------|----------|------------|-------|
| `user_id` | `uuid` (FK → profiles.id) | Yes | **FIRM** | Session owner. |
| `duration` | `numeric` | Yes | **STRONG** | Session duration in **milliseconds**. The dashboard converts to seconds for display. If you store in seconds, let us know. |
| `created_at` | `timestamptz` | Yes | **FIRM** | Session start time. |

---

### 2.9 `user_actions` — **STRONG**

Individual user actions within sessions.

| Column | Type | Required | Confidence | Notes |
|--------|------|----------|------------|-------|
| `created_at` | `timestamptz` | Yes | **FIRM** | When the action happened. |

**Currently** the dashboard only counts total actions to compute `actionsPerSession`. It does not query action types or details from this table. If you want per-action-type breakdowns, add a `type` column and let us know.

---

### 2.10 `api_logs` — **FIRM**

HTTP-level request logging for reliability metrics.

| Column | Type | Required | Confidence | Notes |
|--------|------|----------|------------|-------|
| `status_code` | `integer` | Yes | **FIRM** | HTTP status code. Anything >= 400 is counted as an error. |
| `latency_ms` | `numeric` | Yes | **FIRM** | Request latency in milliseconds. Used for p50/p95/p99 percentile calculations. |
| `created_at` | `timestamptz` | Yes | **FIRM** | Used for date filtering and trend charts. |

**Coverage:** Log every external-facing API request. Internal health checks should be excluded. The dashboard computes error rate, success rate, and latency percentiles from this table.

---

## 3. Metric Definitions & Formulas

### 3.1 Growth Metrics

| Metric | Formula | Confidence | Notes |
|--------|---------|------------|-------|
| Total Users | `COUNT(profiles)` | **FIRM** | All-time registrations. |
| New Users Today | `COUNT(profiles WHERE created_at >= today)` | **FIRM** | |
| DAU | `COUNT(DISTINCT user_activity.user_id WHERE created_at = today)` | **FIRM** | |
| WAU | `COUNT(DISTINCT user_activity.user_id WHERE created_at >= 7d ago)` | **FIRM** | |
| MAU | `COUNT(DISTINCT user_activity.user_id WHERE created_at >= 30d ago)` | **FIRM** | |
| Stickiness | `(DAU / MAU) * 100` | **FIRM** | Percentage. Higher is better. |
| DAU Trend | Daily DAU for each day in range | **FIRM** | Chart data. |
| New Users Trend | Daily new signups for each day in range | **FIRM** | Chart data. |

### 3.2 Finance Metrics

| Metric | Formula | Confidence | Notes |
|--------|---------|------------|-------|
| Credit/Sub Revenue | `SUM(payments.amount WHERE status='succeeded')` | **FIRM** | |
| Product Revenue | `SUM(orders.amount WHERE status='completed')` | **FIRM** (SB only) | 0 for credit-only apps. |
| Total Revenue | Credit/Sub Revenue + Product Revenue | **FIRM** | |
| Credit Revenue | `SUM(payments.amount WHERE type != 'subscription')` | **STRONG** | Split for Revenue by Source pie chart. |
| Subscription Revenue | `SUM(payments.amount WHERE type = 'subscription')` | **STRONG** | |
| Credits Purchased | `SUM(credit_transactions.credits WHERE type='purchase')` | **FIRM** | Top-level KPI for Storybook Studio. |
| Credits Spent | `SUM(ABS(credit_transactions.credits) WHERE type='spend')` | **FIRM** | |
| API Cost (COGS) | `SUM(api_costs.cost)` | **FIRM** | |
| Printing Cost | `SUM(fulfillment_costs.printing_cost)` | **FIRM** (SB only) | |
| Shipping Cost | `SUM(fulfillment_costs.shipping_cost)` | **FIRM** (SB only) | |
| Total COGS | API Cost + Printing Cost + Shipping Cost | **FIRM** | |
| Margin % | `((Total Revenue - COGS) / Total Revenue) * 100` | **FIRM** | |
| Revenue Trend | Daily `SUM(payments.amount + orders.amount)` per day | **FIRM** | Divided by 100 for display (assumes cents — see Section 7). |
| COGS Trend | Daily `SUM(api_costs.cost + fulfillment_costs.*)` per day | **FIRM** | |

### 3.3 Unit Economics

| Metric | Formula | Confidence | Notes |
|--------|---------|------------|-------|
| ARPU | `Total Revenue / Total Users` | **FIRM** | Average Revenue Per User (all users, not just paying). |
| Cost/User | `Total COGS / Total Users` | **FIRM** | |
| Margin/User | `ARPU - Cost/User` | **FIRM** | |
| LTV | `ARPU * 12 * 0.7` | **FLEXIBLE** | Estimated lifetime value. **The 12-month window and 70% retention factor are assumptions.** Override if you have better retention data. |
| Paying Users | `COUNT(profiles WHERE has_paid=true)` | **STRONG** | |

### 3.4 Engagement Metrics

| Metric | Formula | Confidence | Notes |
|--------|---------|------------|-------|
| Avg Session Duration | `SUM(sessions.duration) / COUNT(sessions)` in seconds | **FIRM** | |
| Sessions Per User | `COUNT(sessions) / COUNT(DISTINCT sessions.user_id)` | **FIRM** | |
| Actions Per Session | `COUNT(user_actions) / COUNT(sessions)` | **STRONG** | |
| Activation Rate | `COUNT(profiles WHERE onboarding_complete=true) / COUNT(profiles)` in date range | **STRONG** | What counts as "activated" is **FLEXIBLE** — currently `onboarding_complete`. |

### 3.5 Reliability Metrics

| Metric | Formula | Confidence | Notes |
|--------|---------|------------|-------|
| Error Rate | `COUNT(api_logs WHERE status_code >= 400) / COUNT(api_logs) * 100` | **FIRM** | |
| Success Rate | `100 - Error Rate` | **FIRM** | |
| p50 Latency | 50th percentile of `api_logs.latency_ms` | **FIRM** | Calculated in-app from sorted array. |
| p95 Latency | 95th percentile of `api_logs.latency_ms` | **FIRM** | |
| p99 Latency | 99th percentile of `api_logs.latency_ms` | **FIRM** | |

**Status indicator thresholds** (**FLEXIBLE** — tune to your SLAs):

| Indicator | Healthy | Warning | Critical |
|-----------|---------|---------|----------|
| API Health | Error rate < 1% | Error rate < 5% | Error rate >= 5% |
| Latency | p95 < 500ms | p95 < 2000ms | p95 >= 2000ms |
| Generation | Success rate > 99% | Success rate > 95% | Success rate <= 95% |

### 3.6 Per-User Profitability

| Metric | Formula | Confidence | Notes |
|--------|---------|------------|-------|
| User Revenue | `profiles.total_revenue + profiles.total_product_revenue` | **FIRM** (if denormalized) | |
| User Cost | `profiles.total_cost + profiles.total_fulfillment_cost` | **FIRM** (if denormalized) | |
| User Margin | Revenue - Cost | **FIRM** | |
| Margin % | `(Margin / Revenue) * 100` | **FIRM** | |
| Profitability Tag | `margin > $5` → "profitable", `>= $0` → "marginal", `< $0` → "unprofitable" | **FLEXIBLE** | The $5 threshold is arbitrary. Adjust to your unit economics. |
| User LTV | `(Revenue / months_since_signup) * 12 * 0.7` | **FLEXIBLE** | Same 12-month / 70% retention assumption as aggregate LTV. |

---

## 4. Storybook Studio — Specific Requirements

Storybook Studio's revenue model is `credits_and_products`. This means all the tables from Section 2 apply, plus these specific considerations:

### 4.1 Primary KPIs (Top of Every Page)

**FIRM:** The dashboard's top KPI row for Storybook Studio always leads with:

1. **Total Credits Purchased** — from `credit_transactions WHERE type='purchase'`
2. **Total Books Sold** — from `COUNT(orders WHERE status='completed')` OR `SUM(profiles.product_purchases)`

All other metrics (revenue, margin, ARPU, costs) are derived from these two primary inputs:
- Credit revenue = credits purchased * credit price
- Book revenue = books sold * book price
- COGS = API costs + printing costs + shipping costs

### 4.2 Required Tables (in addition to Kaizen's tables)

| Table | Purpose | Confidence |
|-------|---------|------------|
| `orders` | Book/product purchases | **FIRM** |
| `fulfillment_costs` | Printing + shipping costs | **STRONG** |

### 4.3 Book-Specific Metrics

| Metric | Source | Confidence |
|--------|--------|------------|
| Books Sold | `COUNT(orders WHERE status='completed')` or denormalized on profiles | **FIRM** |
| Avg Book Price | `SUM(orders.amount) / COUNT(orders)` | **STRONG** |
| Book Revenue | `SUM(orders.amount WHERE status='completed')` | **FIRM** |
| Printing Cost | `SUM(fulfillment_costs.printing_cost)` | **FIRM** |
| Shipping Cost | `SUM(fulfillment_costs.shipping_cost)` | **FIRM** |
| Fulfillment Cost | Printing + Shipping | **FIRM** |

### 4.4 Finance Page KPI Row (Storybook Studio)

| Position | KPI | Source |
|----------|-----|--------|
| 1 | Credits Revenue | `SUM(payments.amount)` excluding subscriptions |
| 2 | Book Revenue | `SUM(orders.amount)` |
| 3 | Total Revenue | Credits + Book revenue |
| 4 | Printing Cost | `SUM(fulfillment_costs.printing_cost)` |
| 5 | Shipping Cost | `SUM(fulfillment_costs.shipping_cost)` |
| 6 | Margin % | `((Total Revenue - Total COGS) / Total Revenue) * 100` |

---

## 5. Funnel Stages

**STRONG** — The dashboard expects users to progress through these stages:

| Stage | Key | Trigger | Confidence |
|-------|-----|---------|------------|
| Signed Up | `signed_up` | User creates an account | **FIRM** |
| Onboarded | `onboarded` | User completes onboarding flow | **STRONG** — define "onboarding" as you see fit |
| First Generation | `first_gen` | User triggers their first AI generation | **STRONG** |
| Purchased | `purchased` | User makes their first payment (credits or product) | **FIRM** |
| Retained | `retained` | User is active 7+ days after first purchase | **FLEXIBLE** — 7-day window is an assumption. Override with your retention definition. |

**How to update funnel stage:**
- Store the current stage in `profiles.funnel_stage`
- Update it as the user progresses (stages are monotonically increasing — a user never goes backward)
- The dashboard reads `profiles.funnel_stage` for individual users and aggregates across all profiles for the funnel chart

**Funnel chart calculation:**
```
For each stage: COUNT(profiles WHERE funnel_stage >= stage)
Conversion rate: current_stage_users / previous_stage_users * 100
Drop-off rate: 100 - conversion_rate
```

---

## 6. Instrumentation Checklist

### 6.1 Events Your App Must Write

| When | Write to | What | Confidence |
|------|----------|------|------------|
| User signs up | `profiles` | New row with `id`, `email`, `created_at`, `funnel_stage='signed_up'` | **FIRM** |
| User completes onboarding | `profiles` | Set `onboarding_complete=true`, `funnel_stage='onboarded'` | **STRONG** |
| User triggers AI generation | `user_activity`, `user_actions` | One row each with `user_id`, `created_at` | **FIRM** |
| AI generation completes | `api_costs` | One row with `cost` (in dollars), `created_at` | **FIRM** |
| First generation ever | `profiles` | Set `funnel_stage='first_gen'` | **STRONG** |
| User starts a session | `sessions` | New row with `user_id`, `created_at` | **STRONG** |
| User ends a session | `sessions` | Update row with `duration` (ms) | **STRONG** |
| User buys credits | `payments`, `credit_transactions` | Payment row + credit transaction with `type='purchase'` | **FIRM** |
| User spends credits | `credit_transactions` | Row with `type='spend'`, negative or absolute `credits` | **FIRM** |
| User subscribes | `payments` | Row with `type='subscription'` | **STRONG** |
| First payment ever | `profiles` | Set `has_paid=true`, `funnel_stage='purchased'` | **STRONG** |
| User retained 7d+ | `profiles` | Set `funnel_stage='retained'` | **FLEXIBLE** |
| API request logged | `api_logs` | Row with `status_code`, `latency_ms`, `created_at` | **FIRM** |
| **Storybook Studio only:** | | | |
| User orders a book | `orders` | Row with `user_id`, `amount`, `status`, `product_type`, `created_at` | **FIRM** |
| Book is fulfilled | `fulfillment_costs` | Row with `printing_cost`, `shipping_cost`, `created_at` | **STRONG** |
| Update user profile | `profiles` | Increment `total_revenue`, `total_product_revenue`, `total_cost`, `total_generations`, etc. | **FLEXIBLE** (see denormalization note) |

### 6.2 Denormalization Strategy

The dashboard reads aggregated metrics from `profiles` for the user list (to avoid expensive JOINs on every page load). You have two options:

**Option A: Denormalize on write (recommended)**
- When a payment comes in, increment `profiles.total_revenue`
- When an API call is made, increment `profiles.total_cost` and `profiles.total_generations`
- When a book is ordered, increment `profiles.total_product_revenue` and `profiles.product_purchases`
- Use Supabase database functions or triggers for this

**Option B: Don't denormalize, use views**
- Create a Postgres view that joins `payments`, `api_costs`, `orders` to `profiles`
- Let us know and we'll update the user query to use the view

**Confidence: FLEXIBLE** — Either approach works. Option A is faster at read time.

---

## 7. Currency & Units Convention

> **This is the most important thing to get right. A mismatch here silently corrupts all revenue/cost numbers.**

| Field | Expected Unit | Confidence | Notes |
|-------|---------------|------------|-------|
| `payments.amount` | **Cents (integer)** | **STRONG** | The finance query divides by 100 for display: `totalRevenue / 100`. If you store in dollars, tell us and we'll remove the division. |
| `orders.amount` | **Cents (integer)** | **STRONG** | Same treatment as payments — divided by 100 for display. |
| `api_costs.cost` | **Dollars (decimal)** | **STRONG** | NOT divided by 100. Stored as-is (e.g., `0.023` for 2.3 cents). |
| `fulfillment_costs.printing_cost` | **Dollars (decimal)** | **STRONG** | Same as api_costs — not divided. |
| `fulfillment_costs.shipping_cost` | **Dollars (decimal)** | **STRONG** | Same as api_costs — not divided. |
| `credit_transactions.credits` | **Credit count (integer)** | **FIRM** | Not a dollar amount. Raw credit units. |
| `sessions.duration` | **Milliseconds (integer)** | **STRONG** | Divided by 1000 for seconds display. If you store seconds, tell us. |
| `api_logs.latency_ms` | **Milliseconds (integer)** | **FIRM** | Used directly for percentile calculations. |

**Action item:** Confirm your unit convention for `payments.amount` and `orders.amount`. If you use dollars instead of cents, the revenue trend chart and total revenue will be off by 100x.

---

## 8. API Contract

The dashboard fetches data through these endpoints:

### `GET /api/metrics`

| Param | Type | Required | Values |
|-------|------|----------|--------|
| `appId` | string | Yes | `"kaizen"`, `"storybook-studio"` |
| `type` | string | Yes | `"growth"`, `"finance"`, `"engagement"`, `"reliability"`, `"unit-economics"`, `"overview"` |
| `from` | string | Yes | `YYYY-MM-DD` |
| `to` | string | Yes | `YYYY-MM-DD` |

### `GET /api/metrics/users`

| Param | Type | Required | Notes |
|-------|------|----------|-------|
| `appId` | string | Yes | |
| `from` | string | Yes | `YYYY-MM-DD` |
| `to` | string | Yes | `YYYY-MM-DD` |

Returns: `{ users: UserSummary[], total: number }`

### `GET /api/metrics/users/[userId]`

| Param | Type | Required | Notes |
|-------|------|----------|-------|
| `appId` | string | Yes | |
| `from` | string | Yes | `YYYY-MM-DD` |
| `to` | string | Yes | `YYYY-MM-DD` |

Returns: `UserDetail` with full metrics, payments array, and recent activity.

---

## 9. Known Assumptions & Open Questions

These are items tagged **FLEXIBLE** that your team should review and either confirm or override:

| # | Assumption | Current Value | Impact | Override? |
|---|-----------|---------------|--------|-----------|
| 1 | LTV retention factor | 70% annual retention | Affects LTV calculation on every page | Provide your actual retention rate |
| 2 | LTV time horizon | 12 months | `LTV = ARPU * 12 * 0.7` | Could be 24 months for enterprise apps |
| 3 | Profitability threshold | $5 margin = "profitable", $0-$5 = "marginal" | Color coding in user tables | Adjust to your unit economics |
| 4 | Funnel "retained" definition | Active 7+ days after first purchase | Retention stage | Could be 30-day, 60-day, etc. |
| 5 | `payments.amount` unit | Cents (divided by 100) | Revenue numbers | Confirm cents vs dollars |
| 6 | `sessions.duration` unit | Milliseconds | Session duration display | Confirm ms vs seconds |
| 7 | Revenue split (user detail) | 70% credits / 30% subscription | Revenue by Source breakdown per user | Should come from actual payment types |
| 8 | `payments.status` for revenue | `'succeeded'` in finance, `'completed'` in unit-economics | Revenue total accuracy | **Pick one and standardize** |
| 9 | "Activity" event definition | Any row in `user_activity` | DAU/MAU accuracy | Define what qualifies |
| 10 | Activation definition | `onboarding_complete = true` | Activation rate metric | Could be "first generation" instead |

---

## 10. Supabase Environment Variables

Each app needs these set in the dashboard's `.env.local`:

```env
# Kaizen
KAIZEN_SUPABASE_URL=https://xxxxx.supabase.co
KAIZEN_SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Storybook Studio
STORYBOOK_SUPABASE_URL=https://yyyyy.supabase.co
STORYBOOK_SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

The dashboard uses the **service role key** (not the anon key) because it reads across all users server-side. Keep these keys out of client bundles — they're only used in API routes.

---

## 11. Quick-Start: Minimum Viable Instrumentation

If you want to get the dashboard showing real data as fast as possible, here's the minimum:

### Phase 1 — Core (gets 60% of the dashboard working)
1. `profiles` table with `id`, `email`, `full_name`, `created_at`, `plan`
2. `payments` table with `user_id`, `amount`, `type`, `status`, `created_at`
3. `api_costs` table with `cost`, `created_at`
4. `user_activity` table with `user_id`, `created_at`

### Phase 2 — Engagement & Reliability
5. `sessions` table with `user_id`, `duration`, `created_at`
6. `api_logs` table with `status_code`, `latency_ms`, `created_at`
7. `user_actions` table with `created_at`
8. Add `has_paid`, `funnel_stage`, `onboarding_complete` to `profiles`

### Phase 3 — User Drill-Down
9. Add denormalized columns to `profiles` (`total_revenue`, `total_cost`, `total_generations`, etc.)
10. `credit_transactions` table

### Phase 4 — Products (Storybook Studio only)
11. `orders` table
12. `fulfillment_costs` table
13. Add `total_product_revenue`, `product_purchases`, `printing_cost`, `shipping_cost` to `profiles`

---

## 12. File Reference

If you need to look at or modify the dashboard queries:

| File | What it queries |
|------|----------------|
| `src/lib/supabase/queries/growth.ts` | `profiles`, `user_activity` |
| `src/lib/supabase/queries/finance.ts` | `payments`, `orders`, `credit_transactions`, `api_costs`, `fulfillment_costs` |
| `src/lib/supabase/queries/engagement.ts` | `sessions`, `user_actions`, `profiles` |
| `src/lib/supabase/queries/reliability.ts` | `api_logs` |
| `src/lib/supabase/queries/users.ts` | `profiles`, `payments`, `orders` |
| `src/lib/supabase/queries/unit-economics.ts` | `profiles`, `payments`, `orders`, `api_costs`, `fulfillment_costs` |
| `src/types/metrics.ts` | All TypeScript interfaces for metric shapes |
| `src/lib/app-registry.ts` | App configuration and revenue models |
