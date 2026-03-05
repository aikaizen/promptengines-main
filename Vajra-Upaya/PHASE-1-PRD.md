# Vajra-Upaya — Phase 1 PRD

## Product Requirements Document: Broad Launch

---

```
   ◇◇◇ PHASE 1 — The Catalog Expands, The Diamond Predicts ◇◇◇
```

---

## Context

MVP proved the core loop: problem → PRD → match → forge → deliver. Phase 1 scales it. The three pillars of Phase 1:

1. **The Catalog goes wide** — 100+ curated tools, automated ingestion, community submissions
2. **The Mutation Engine goes live** — AI-predicted pre-builds, instant re-customization
3. **Self-service opens** — customers can request changes, track progress, browse the catalog

Phase 1 is the transition from **concierge service** to **platform-assisted service.** Humans still forge. But the system around them gets dramatically smarter.

---

## Success Criteria (Phase 1)

1. Catalog contains 100+ vetted tools across 15+ categories
2. Mutation projection engine correctly predicts >40% of change requests (pre-built and deliverable within 1 hour)
3. Average problem → delivery time drops to <1 week (from <2 weeks in MVP)
4. Self-service portal handles 80% of change requests without human triage
5. 50+ active customers with at least 1 delivered tool each
6. Net retention >90% (customers who come back for a second engagement)

---

## New Capabilities

### 1. Expanded Catalog System

#### 1.1 Catalog Scale

```
◎ THE STABLE — Phase 1

  PromptEngines Products (internal)
  ├─ Kaizen
  ├─ Flow
  ├─ Storybook Studio
  ├─ Blayde
  └─ [new products from MVP engagements]

  Curated External Tools (vetted)
  ├─ Productivity (15-20 tools)
  ├─ Communication (10-15 tools)
  ├─ Data & Analytics (10-15 tools)
  ├─ Developer Tools (15-20 tools)
  ├─ Content & Creative (10-15 tools)
  ├─ Sales & CRM (10-15 tools)
  ├─ Operations & Workflow (10-15 tools)
  └─ Specialized / Niche (10-20 tools)

  Total: 100-150 tools, each with:
  ├─ Capability matrix
  ├─ Modifiability score
  ├─ Integration map
  ├─ Modification history
  └─ Mutation projection data
```

#### 1.2 Catalog Ingestion Pipeline

- **Automated discovery**: Agents scan Product Hunt, GitHub trending, industry reports for promising tools
- **Vetting process**: Each candidate tool is evaluated on:
  - API quality and extensibility
  - Documentation completeness
  - License compatibility
  - Community health
  - Modifiability (can we actually change it?)
- **Scoring**: Automated pre-score + human review for final admission
- **Community submissions**: Customers and partners can nominate tools for catalog inclusion

#### 1.3 Catalog Intelligence

Every tool in the catalog accumulates intelligence over time:

```
TOOL: Fireflies.ai
├─ Times selected: 12
├─ Times modified: 12
├─ Common modifications:
│   ├─ HubSpot integration (8x) — PRE-BUILT ✓
│   ├─ Slack summary webhook (6x) — PRE-BUILT ✓
│   ├─ Custom transcript format (4x) — PRE-BUILT ✓
│   └─ Salesforce integration (2x) — IN QUEUE
├─ Avg modification time: 3.2 days → 0.5 days (with pre-builds)
├─ Customer satisfaction: 92%
└─ Predicted next mutations:
    ├─ Microsoft Teams integration (78% confidence)
    ├─ Weekly email digest (65% confidence)
    └─ Multi-language transcription (52% confidence)
```

---

### 2. Mutation Projection Engine

The core differentiator of Phase 1. This is what makes "changes at any time, instantly" real.

#### 2.1 How It Works

```
┌─────────────────────────────────────────────────────┐
│                                                       │
│   OBSERVE                                             │
│   ├─ Every modification request across all customers  │
│   ├─ Industry trends (what tools are adding natively) │
│   ├─ Customer usage patterns (what features get used) │
│   └─ Support requests (what's missing / breaking)     │
│                                                       │
│         ↓                                             │
│                                                       │
│   PREDICT                                             │
│   ├─ Cluster similar tools by modification patterns   │
│   ├─ Project likely future requests per tool           │
│   ├─ Score predictions by confidence + effort          │
│   └─ Prioritize: high-confidence + low-effort first    │
│                                                       │
│         ↓                                             │
│                                                       │
│   PRE-BUILD                                           │
│   ├─ Agent teams build predicted mutations as modules  │
│   ├─ Each module is tested against the base tool       │
│   ├─ Stored in the mutation cache, ready for instant   │
│   │   deployment                                       │
│   └─ Cache is pruned: unused predictions expire        │
│                                                       │
│         ↓                                             │
│                                                       │
│   DELIVER (when requested)                             │
│   ├─ Customer requests a change                        │
│   ├─ System checks mutation cache                      │
│   ├─ If cached: deploy instantly (< 1 hour)            │
│   ├─ If not cached: route to Forge (standard timeline) │
│   └─ Either way, the request feeds OBSERVE             │
│                                                       │
└─────────────────────────────────────────────────────┘
```

#### 2.2 Prediction Model

- **Input signals**:
  - Modification history across all tools in the same category
  - Customer industry and team size (similar companies want similar things)
  - Tool's native roadmap (if they're adding X, customers will want Y to integrate with it)
  - Seasonal patterns (Q4 → reporting features, Q1 → planning features)
- **Output**: Ranked list of predicted mutations per tool, with confidence scores
- **Threshold**: Pre-build if confidence >60% and effort <2 days
- **Learning**: Every fulfilled (or unfulfilled) prediction updates the model

#### 2.3 Mutation Cache

```
CACHE STRUCTURE (per tool):

tool_id: fireflies-ai
├─ base_version: 2.4.1
├─ cached_mutations:
│   ├─ mut_hubspot_v3:
│   │   ├─ description: "Push structured notes to HubSpot deals"
│   │   ├─ confidence: 0.94
│   │   ├─ built: 2026-02-15
│   │   ├─ last_deployed: 2026-03-01
│   │   ├─ deploy_count: 8
│   │   └─ modules: [hubspot-api-connector, note-formatter, deal-matcher]
│   ├─ mut_slack_digest:
│   │   ├─ description: "Weekly Slack digest of all call summaries"
│   │   ├─ confidence: 0.72
│   │   ├─ built: 2026-02-20
│   │   ├─ last_deployed: 2026-02-28
│   │   ├─ deploy_count: 3
│   │   └─ modules: [slack-webhook, digest-aggregator, schedule-runner]
│   └─ mut_teams_integration:
│       ├─ description: "Microsoft Teams call recording + transcription"
│       ├─ confidence: 0.78
│       ├─ built: 2026-03-01
│       ├─ last_deployed: null (predicted, not yet requested)
│       ├─ deploy_count: 0
│       └─ modules: [teams-bot, audio-pipe, transcript-adapter]
└─ expired_mutations:
    └─ mut_discord_bot (confidence dropped below 0.3, pruned)
```

---

### 3. Self-Service Portal

#### 3.1 Customer Dashboard

```
◇ VAJRA-UPAYA PORTAL

┌─────────────────────────────────────────────┐
│                                               │
│  ◇ Your Tools                                 │
│                                               │
│  ┌─────────────────────────────────────────┐  │
│  │ Sales Call Automator          LIVE  ◇    │  │
│  │ Delivered: Feb 15, 2026                  │  │
│  │ Last modified: Mar 1, 2026               │  │
│  │ [Request Change] [View PRD] [Usage]      │  │
│  └─────────────────────────────────────────┘  │
│                                               │
│  ┌─────────────────────────────────────────┐  │
│  │ Onboarding Workflow Bot      IN FORGE ⚡ │  │
│  │ Started: Mar 2, 2026                     │  │
│  │ Est. delivery: Mar 8, 2026               │  │
│  │ [Track Progress] [View PRD] [Chat]       │  │
│  └─────────────────────────────────────────┘  │
│                                               │
│  ◇ New Problem                                │
│  [Describe your problem →]                    │
│                                               │
└─────────────────────────────────────────────┘
```

#### 3.2 Change Request Flow

```
Customer clicks [Request Change] on a delivered tool

    ↓

◎ CHANGE INTAKE
"What would you like to change?"
"Add a weekly email digest to the manager"

    ↓

⚡ MUTATION CHECK
System checks cache...

  CACHE HIT: mut_email_digest (confidence 0.89)
  Pre-built module available.
  Estimated deployment: < 1 hour

    ↓

◇ INSTANT DEPLOY
"Your change is live. Here's what was added: [details]"
"Anything else?"
```

#### 3.3 Problem Submission (Public)

- Web form on promptengines.com/vajra-upaya
- Minimal friction: name, email, "describe your problem" textarea
- Optional: existing tools, team size, timeline
- Submitting triggers the Intake Agent conversation (async or real-time)

---

### 4. Enhanced Match Engine (V1)

Upgrades from MVP's weighted scoring to a multi-signal system:

#### 4.1 Signals

| Signal | Weight | Source |
|--------|--------|--------|
| Requirement coverage | 30% | PRD requirements vs. tool capability matrix |
| Modification history | 20% | Has this tool been successfully modified for similar needs? |
| Mutation cache hits | 15% | Are the needed modifications already pre-built? |
| Customer similarity | 15% | Have similar customers (industry, size) been happy with this tool? |
| Time to delivery | 10% | How fast can we deliver, factoring in cache hits? |
| Cost efficiency | 10% | Total cost including tool license + modification labor |

#### 4.2 Presentation

The match engine now shows customers **why** each tool was selected:

```
⚡ RECOMMENDATION: Fireflies.ai + Custom Integration

  WHY THIS TOOL:
  ├─ 90% requirement coverage out of the box
  ├─ HubSpot integration already pre-built (8 prior deployments)
  ├─ Slack summary already pre-built (6 prior deployments)
  ├─ Only custom work: weekly email digest (~1 day)
  ├─ 3 similar companies (SaaS, 5-20 person sales team) rated 4.8/5
  └─ Estimated delivery: 2 days (vs. 2 weeks building from scratch)

  ◇ This is a Diamond Match — 85%+ fit with cached mutations.
     Expected delivery is near-instant for most requirements.
```

---

### 5. Agent Team Expansion

#### 5.1 Agent Roles (Phase 1)

| Agent | Role | New in Phase 1? |
|-------|------|-----------------|
| **Intake Agent** | Problem → PRD | MVP (enhanced) |
| **Match Agent** | PRD → Tool candidates | MVP (enhanced) |
| **Forge Agent** | Assists human engineers in modification | MVP (enhanced) |
| **Catalog Scout** | Discovers and pre-vets new tools | New |
| **Mutation Predictor** | Analyzes patterns, predicts future mutations | New |
| **Change Agent** | Handles self-service change requests | New |
| **Quality Agent** | Post-delivery satisfaction checks, feedback loops | New |

#### 5.2 Agent Coordination

```
◎ AGENT MANDALA

              Catalog Scout
                  ↓
    Quality ← COORDINATOR → Mutation Predictor
    Agent         ↑↓              ↓
        ↑     Intake Agent    Pre-Builder
        │         ↓
        │     Match Agent
        │         ↓
        └──── Forge Agent → Change Agent
```

---

## Technical Architecture (Phase 1)

### Infrastructure

| Component | Technology | Notes |
|-----------|-----------|-------|
| Agent runtime | Claude API + custom orchestration | All agents run on Claude |
| Catalog DB | Supabase (PostgreSQL) | Tool entries, capability matrices, scores |
| Mutation cache | Supabase + file storage | Module code, configs, deployment scripts |
| Customer portal | Next.js or similar | Dashboard, change requests, PRD viewer |
| Intake widget | Embedded chat (web component) | Deploys on promptengines.com |
| Prediction model | Claude + structured analytics | Pattern analysis on modification history |
| Deployment pipeline | GitHub Actions + Vercel/Railway | Automated deployment of mutations |

### Data Model (Key Entities)

```
CUSTOMER
├─ id, name, email, company
├─ industry, team_size
└─ tools[] → DELIVERED_TOOL

DELIVERED_TOOL
├─ id, customer_id, tool_id
├─ prd_id, status, delivered_at
├─ modules[] → MODULE
└─ change_requests[] → CHANGE_REQUEST

CATALOG_TOOL
├─ id, name, category, description
├─ capability_matrix, modifiability_score
├─ integration_map, license
├─ modification_history[] → MODIFICATION
└─ predicted_mutations[] → MUTATION

MUTATION (cached)
├─ id, tool_id, description
├─ confidence, effort_estimate
├─ modules[] → MODULE
├─ built_at, last_deployed, deploy_count
└─ status: predicted | building | cached | deployed | expired

MODULE (composable block)
├─ id, name, description
├─ type: integration | feature | config | ui
├─ code_ref, test_ref
├─ compatible_tools[]
└─ dependencies[]

PRD
├─ id, customer_id
├─ problem, users, stack
├─ requirements[], constraints
├─ acceptance_criteria[]
└─ status: draft | approved | in_forge | delivered
```

---

## Pricing Model (Phase 1)

| Tier | Description | Price |
|------|-------------|-------|
| **Spark** | Single problem, single tool delivery | Per-engagement pricing (varies by complexity) |
| **Sustain** | Delivered tool + 12 months of change requests | Monthly retainer |
| **Scale** | Multiple tools + priority forge + unlimited changes | Custom enterprise pricing |

All tiers include:
- Agent-guided discovery
- PRD generation
- Tool matching
- Modular delivery
- Instant mutations (when cached)

---

## Rollout Plan (Phase 1)

| Month | Milestone | Key Deliverable |
|-------|-----------|-----------------|
| 1 | Catalog expansion | 50 → 100+ tools, ingestion pipeline live |
| 2 | Mutation engine V1 | Prediction model trained on MVP data, first pre-builds |
| 3 | Self-service portal | Customer dashboard, change request flow |
| 4 | Match engine V1 | Multi-signal scoring, Diamond Match classification |
| 5 | Agent team expansion | Catalog Scout, Mutation Predictor, Change Agent live |
| 6 | Public launch | promptengines.com/vajra-upaya, intake widget, marketing push |

---

## Metrics (Phase 1)

| Metric | MVP Baseline | Phase 1 Target |
|--------|-------------|----------------|
| Problem → PRD | < 30 min | < 15 min |
| PRD → Match | < 2 hours | < 30 min |
| Match → Delivery | < 2 weeks | < 1 week |
| Change request → Live (cached) | N/A | < 1 hour |
| Change request → Live (uncached) | N/A | < 3 days |
| Catalog size | ~25 tools | 100+ tools |
| Mutation prediction accuracy | N/A | > 40% |
| Customer satisfaction | > 85% | > 90% |
| Net retention | N/A | > 90% |
| Active customers | 3-5 (MVP test) | 50+ |

---

## Risks (Phase 1)

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Mutation predictions are wrong | Wasted pre-build effort | Start conservative (>60% confidence threshold), tune aggressively |
| Catalog grows faster than vetting capacity | Low-quality tool matches | Automated pre-vetting + human final review gate |
| Self-service change requests are ambiguous | Bad mutations deployed | Change Agent validates understanding before deploying |
| Customers expect everything to be instant | Disappointment when cache misses | Clear UI: "Diamond Match (instant)" vs. "Forge Required (X days)" |
| Scaling forge capacity | Delivery bottleneck | Invest in agent-assisted modification to reduce human hours per engagement |

---

## The Vision Realized

```
        ◇
       ◇ ◇
      ◇   ◇
     ◇  ⚡  ◇
      ◇   ◇
       ◇ ◇
        ◇

  Phase 1 is where the diamond learns to predict.

  MVP proved: we can find the tool and make it perfect.
  Phase 1 proves: we can do it at scale, and we can
  anticipate what you'll need before you ask.

  The catalog grows. The mutations compound.
  Every engagement makes the next one faster.

  The diamond sharpens itself.
```

---

*Vajra-Upaya Phase 1 — PromptEngines*
*The diamond cuts. The method fits. Nothing wasted.*
