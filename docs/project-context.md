# PromptEngines — Project Context

> Living document. Last updated: 2026-03-11.

## What This Is

PromptEngines is an applied AI research lab run as a **pseudo-open research project**. The main site ([promptengines.com](https://promptengines.com)) is a static HTML site deployed via Vercel. It serves as the public face for multiple products, prototypes, and a technical blog (Lab Notes).

The GitHub org is `aikaizen`. The main site repo is `aikaizen/promptengines-main`.

---

## Products and Repos

| Product | Repo | URL | Status |
|---------|------|-----|--------|
| Prompt Engines (main site) | `promptengines-main` | promptengines.com | Active |
| Flow Education | `flow` | flow.promptengines.com | Active |
| Kaizen | `kaizen` | kaizen.promptengines.com | Active |
| Storybook Studio | `storybookstudio` | storybookstudio.promptengines.com | Active |
| Video Terminal | `videoterminal` | videoterminal.promptengines.com | Active |
| Norbu | `norbu` | norbu.promptengines.com | Active |
| Bible | `bible` | bible.promptengines.com | Active |
| Consulting | `consulting` | consulting.promptengines.com | Active |
| Dashboard | `dashboard` | dashboard.promptengines.com | Active |
| Lab Notes | (within `promptengines-main`) | lab.promptengines.com | Active |

Other repos in `aikaizen` may exist (experiments, forks, tooling). The build stream captures **all** of them.

---

## Team

| Member | Type | Role | Status |
|--------|------|------|--------|
| A.I. | Human | Principal & Architect | Active |
| Andy Stable | Agent | Operations & Execution | Active |
| Hermetic_Demiurge | Agent | Developer & Engineer | Active |
| Thoth | Agent | Teaching & Transmission | Coming soon |
| Dzambhala | Agent | Wealth & Dharma | Coming soon |

Both active agents push to `main` independently. Always check recent git history before assuming current state.

---

## Deployment Pipeline

```
Push to main → vercel-deploy.yml → npx vercel --prod → promptengines.com
```

- **Workflow:** `.github/workflows/vercel-deploy.yml`
- **Trigger:** Every push to `main`
- **Secret:** `VERCEL_TOKEN` (set in repo secrets)
- **Config:** `vercel.json` at repo root (modern format: `redirects` + `rewrites`)
- **Status:** Working. All pushes to main auto-deploy.

Any agent or human that pushes to `main` triggers a production deploy. This is intentional.

---

## System 1: Activity Feed (Homepage Ticker)

**Purpose:** Populate the live commit ticker and app cards on promptengines.com with real commit data from across all aikaizen repos.

**How it works:**
1. `update-feed.yml` runs every 6 hours (or manual trigger)
2. `scripts/generate-feed.js` uses GitHub API (`@octokit/rest`) to fetch recent commits from the `aikaizen` user's repos
3. Generates two HTML blocks:
   - **App cards** — grouped by repo, 3 commits each (injected between `<!-- FEED:START -->` / `<!-- FEED:END -->`)
   - **Terminal lines** — top 10 commits chronologically (injected between `<!-- TELEMETRY:START -->` / `<!-- TELEMETRY:END -->`)
4. Injects into `index.html` and theme variants (`v1.html` through `v6.html`)
5. Commits and pushes → triggers Vercel deploy

**Secret:** `FEED_GITHUB_TOKEN` (set in repo secrets)

**Featured apps** (in `generate-feed.js`):
- `promptengines-main` → "Prompt Engines" (Platform)
- `flow` → "Flow" (Education)
- `kaizen` → "Kaizen" (Kids)
- `storybookstudio` → "Storybook Studio" (Creator Tool)
- `videoterminal` → "Video Terminal" (Media)
- `norbu` → "Norbu" (Language)
- `bible` → "Bible" (Scripture)

To add a new product to the feed cards, add it to both `APP_URLS` and `FEATURED_APPS` in `generate-feed.js`.

---

## System 2: Build Stream (Daily + Weekly Commit Analysis)

**Purpose:** Generate daily digests and weekly reports of commit activity for pattern analysis and public research documentation.

### Daily Pipeline

**Workflow:** `.github/workflows/daily-stream.yml` — runs at 11:50 UTC daily.

**Scripts:**
- `scripts/prepare-stream-data.js` — fetches commits from ALL aikaizen repos in the last 24h via `@octokit/rest`, produces `.data-YYYY-MM-DD.json`
- `scripts/write-stream-article.js` — reads the JSON, generates a multi-repo markdown draft
- `scripts/build-stream-html.js` — generates `labnotes/build-stream/index.html` with activity chart (bar chart + SVG line chart overlay with Catmull-Rom splines), repo/type breakdowns, feature/fix ratio

**Utilities:**
- `scripts/backfill-stream-data.js` — backfills historical commit data for date ranges: `GITHUB_TOKEN=xxx node scripts/backfill-stream-data.js [startDate] [endDate]`

### Weekly Pipeline

- `scripts/generate-weekly-report.js` — aggregates a week's daily data into `labnotes/build-stream/YYYY-W##.html`
- Runs automatically on Fridays via `daily-stream.yml` (day-of-week check in the workflow step)
- Can be run manually: `node scripts/generate-weekly-report.js 2026-W11`

### Data Flow

```
Daily at 11:50 UTC:
  daily-stream.yml →
    prepare-stream-data.js (fetches ALL repos) → .data-YYYY-MM-DD.json
    write-stream-article.js (markdown draft)
    build-stream-html.js (regenerate index.html with charts)
    [Fridays only] generate-weekly-report.js → YYYY-W##.html
    commit + push → Vercel deploy
```

---

## System 3: Three-Mode Content

Every Lab Notes article can be published in up to three modes:
- **◉ Standard** — Professional lab writing. Numbered rules, tables, checklists.
- **◆ Experimental** — Hyper-concise visual. Massive headings, KPI badges, charts, minimal prose.
- **⬡ Agent** — Hyperdense sigilized docs. YAML-like, sigil-prefixed, no filler.

Multi-mode articles show ◉ ◆ ⬡ dots in the articles index. Mode badge appears in article header.

**Articles with all three modes:**
| Article | Standard | Experimental | Agent |
|---------|----------|--------------|-------|
| Zen and the Art of Vibe Coding | `2026-03-03-zen-and-the-art-of-vibecoding.html` | `-v2.html` | `-v3.html` |
| Image Model API Baseline | `image-models-preliminary-views.html` | `-v2.html` | `-v3.html` |
| The Great Acceleration | `the-great-acceleration.html` | `-v2.html` | `-v3.html` |
| Model Selection Framework | `model-selection-framework.html` | `-v2.html` | `-v3.html` |
| RAG Without Hallucination | `rag-without-hallucination.html` | `-v2.html` | `-v3.html` |

---

## System 4: Token-Based Team Join

**Status:** Frontend complete, backend needs Supabase setup.

**Frontend pages:**
- `/labnotes/join/` — Token entry page (demo token: `TEAM-DEMO-2026-JOIN`)
- `/labnotes/join/setup/` — Multi-step profile setup (type, info, links, review)
- "Join with Token" CTAs on `/careers/` and `/labnotes/team/`

**API stubs** (Vercel serverless functions):
- `api/tokens/validate.js` — Token validation
- `api/auth/register.js` — Account creation
- `api/profile/index.js` — Profile CRUD

**Database:** `database/migrations/001-initial-schema.sql` (Supabase Postgres schema)

**To go live:** Create Supabase project, set `SUPABASE_URL` + `SUPABASE_ANON_KEY` in Vercel env vars, run migration.

---

## System 5: GWS CLI Integration

**Status:** Scaffolding complete, needs Google Cloud setup.

**Docker:**
- `docker/gws-agent/Dockerfile` — Node 20-slim with `@googleworkspace/cli`
- `docker/docker-compose.yml` — Service with read-only credential mount
- `docker/gws-agent/skills/` — Custom skill templates (labnotes-submit, build-stream-generate, team-onboard)

**Local setup:** `scripts/gws-setup.sh` — Guided setup for OAuth flow

**Guide:** `docs/gws-setup-guide.md`

**To go live:** Create Google Cloud project, enable APIs, OAuth credentials, service account key for Docker agents.

---

## Repo Structure (key paths)

```
promptengines-main/
├── index.html                    # Main site (FEED + TELEMETRY markers)
├── v1.html – v6.html             # Theme variants
├── vercel.json                   # Vercel config (redirects + rewrites)
├── package.json                  # Dep: @octokit/rest
├── scripts/
│   ├── generate-feed.js          # Activity feed generator
│   ├── prepare-stream-data.js    # Build stream data collector (all repos)
│   ├── write-stream-article.js   # Build stream article generator
│   ├── build-stream-html.js      # Build stream HTML + charts generator
│   ├── generate-weekly-report.js # Weekly report generator
│   ├── backfill-stream-data.js   # Historical data backfill
│   └── gws-setup.sh             # GWS CLI local setup
├── .github/workflows/
│   ├── vercel-deploy.yml         # Auto-deploy on push to main
│   ├── update-feed.yml           # Activity feed (every 6h)
│   └── daily-stream.yml          # Build stream (daily) + weekly report (Fridays)
├── api/                          # Vercel serverless function stubs
│   ├── tokens/validate.js
│   ├── auth/register.js
│   └── profile/index.js
├── database/
│   └── migrations/001-initial-schema.sql
├── docker/
│   ├── docker-compose.yml
│   └── gws-agent/               # Dockerfile, entrypoint, skills
├── docs/
│   ├── project-context.md        # This file
│   ├── gws-setup-guide.md       # GWS CLI setup guide
│   ├── prds/                    # Product requirement documents
│   └── plans/                   # Design + implementation plans
├── labnotes/
│   ├── articles/                # Published HTML articles (some with v2/v3 variants)
│   ├── build-stream/            # Daily data + index.html + weekly reports
│   ├── join/                    # Token-based team join pages
│   ├── signals/                 # Short-form signals
│   ├── team/                    # Team page
│   └── styles.css               # Shared Lab Notes stylesheet
├── careers/                     # Careers page
├── contact/                     # Contact page
└── map/                         # Product map
```

---

## Secrets Required

| Secret | Used by | Purpose |
|--------|---------|---------|
| `VERCEL_TOKEN` | `vercel-deploy.yml` | Deploy to Vercel production |
| `FEED_GITHUB_TOKEN` | `update-feed.yml`, `daily-stream.yml` | GitHub API access for commit fetching |

Future secrets (when backends go live):
| Secret | Used by | Purpose |
|--------|---------|---------|
| `SUPABASE_URL` | `api/*` | Supabase project URL |
| `SUPABASE_ANON_KEY` | `api/*` | Supabase anonymous key |

Both current secrets are set in `aikaizen/promptengines-main` repo secrets.

---

## Conventions

- **Commit style:** Conventional commits (`feat:`, `fix:`, `content:`, `docs:`, `chore:`, `refactor:`)
- **Articles:** HTML files in `labnotes/articles/`, using `../styles.css`. Three-mode variants use `-v2.html` (Experimental) and `-v3.html` (Agent) suffixes.
- **Nav dropdowns:** `.nav-dropdown` / `.nav-dropdown-trigger` / `.nav-dropdown-menu` pattern.
- **Always pull before push:** Multiple contributors. Always `git pull --rebase` before pushing.
- **No AI co-authorship mentions** on public-facing pages.
- **Writing style:** Direct, declarative, concrete. See `docs/writing-style.md` for rules.
