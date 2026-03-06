# PromptEngines — Project Context

> Living document. Last updated: 2026-03-05.

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
| Consulting | `consulting` | consulting.promptengines.com | Active |
| Dashboard | `dashboard` | dashboard.promptengines.com | Active |
| Lab Notes | (within `promptengines-main`) | lab.promptengines.com | Active |

Other repos in `aikaizen` may exist (experiments, forks, tooling). The build stream should capture **all** of them.

---

## Deployment Pipeline

```
Push to main → vercel-deploy.yml → npx vercel --prod → promptengines.com
```

- **Workflow:** `.github/workflows/vercel-deploy.yml`
- **Trigger:** Every push to `main`
- **Secret:** `VERCEL_TOKEN` (set in repo secrets)
- **Config:** `vercel.json` at repo root (project: `promptengines`, builder: `@vercel/static`)
- **Status:** Working. All pushes to main auto-deploy.

Any agent or human that pushes to `main` triggers a production deploy. This is intentional — an external agent has write PAT for this repo.

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

**Current scope:** Fetches ALL repos for the authenticated user, but only generates app cards for repos listed in `FEATURED_APPS`. The telemetry terminal shows commits from any repo.

**Featured apps** (in `generate-feed.js`):
- `promptengines-main` → "Prompt Engines" (Platform)
- `flow` → "Flow" (Education)
- `kaizen` → "Kaizen" (Kids)
- `storybookstudio` → "Storybook Studio" (Creator Tool)
- `videoterminal` → "Video Terminal" (Media)
- `norbu` → "Norbu" (Language)

To add a new product to the feed cards, add it to both `PRODUCT_URLS` and `FEATURED_APPS` in `generate-feed.js`.

---

## System 2: Build Stream (Daily Commit Analysis)

**Purpose:** Generate a daily digest of commit activity for pattern analysis and public research documentation. This is central to PromptEngines' identity as an open research project — we investigate our own build patterns.

### Current state (cross-repo, operational)

**Workflow:** `.github/workflows/daily-stream.yml` — runs at 11:55 PM UTC daily.

**Scripts:**
- `scripts/prepare-stream-data.js` — uses GitHub API (`@octokit/rest`) to fetch commits from ALL aikaizen repos in the last 24h, produces `.data-YYYY-MM-DD.json`
- `scripts/write-stream-article.js` — reads the JSON, generates a multi-repo markdown draft at `labnotes/build-stream/YYYY-MM-DD.md`

**Capabilities:**
1. Fetches commits from ALL repos under the `aikaizen` GitHub account via API
2. Groups data by repo, type, and author
3. Generates repo velocity tables and type breakdowns
4. Produces per-repo commit listings in the article
5. Includes cross-repo pattern analysis prompts for the human/agent reviewer
6. Stats include `byRepo` alongside `byType` and `byAuthor`

### Human + Agent workflow

```
Daily at 23:55 UTC:
  daily-stream.yml →
    prepare-stream-data.js (fetches ALL aikaizen repos via API) →
    write-stream-article.js (generates draft) →
    commit + push → triggers Vercel deploy

Then (async, agent or human):
  Read the draft →
  Analyze patterns across repos →
  Fill in Patterns / What Blocked / Tomorrow sections →
  Change status: draft → published →
  Commit + push
```

---

## Repo Structure (key paths)

```
promptengines-main/
├── index.html                    # Main site (contains FEED + TELEMETRY markers)
├── v1.html – v6.html             # Theme variants (also contain markers)
├── vercel.json                   # Vercel static deploy config
├── package.json                  # Only dep: @octokit/rest
├── scripts/
│   ├── generate-feed.js          # Activity feed generator (GitHub API)
│   ├── prepare-stream-data.js    # Build stream data collector (all aikaizen repos via API)
│   └── write-stream-article.js   # Build stream article generator
├── .github/workflows/
│   ├── vercel-deploy.yml         # Auto-deploy on push to main
│   ├── update-feed.yml           # Activity feed (every 6h)
│   └── daily-stream.yml          # Build stream (daily 23:55 UTC)
├── docs/
│   ├── project-context.md        # This file
│   ├── marketing-plan.md         # SEO/growth plan
│   ├── marketing-todo.md         # Marketing checklist
│   ├── MODEL-CONFIG.md           # AI model configuration
│   └── plans/                    # Design + implementation plans
├── labnotes/
│   ├── articles/                 # Published HTML articles
│   ├── build-stream/             # Daily stream digests + weekly reports
│   ├── signals/                  # Short-form signals
│   └── styles.css                # Shared Lab Notes stylesheet
├── prototypes/                   # Active prototypes (Flow Education, Vajra-Upaya)
├── careers/                      # Careers page
├── contact/                      # Contact page
├── map/                          # Product map
└── Vajra-Upaya/                  # Precision tool-fitting service docs
```

---

## Secrets Required

| Secret | Used by | Purpose |
|--------|---------|---------|
| `VERCEL_TOKEN` | `vercel-deploy.yml` | Deploy to Vercel production |
| `FEED_GITHUB_TOKEN` | `update-feed.yml`, `daily-stream.yml` | GitHub API access for commit fetching |

Both are set in `aikaizen/promptengines-main` repo secrets.

---

## External Agents

An external agent has a write PAT for `promptengines-main`. It can push directly to `main`, which triggers auto-deploy. This is by design — the agent contributes to the build stream and its commits appear in the feed.

---

## Conventions

- **Commit style:** Conventional commits (`feat:`, `fix:`, `content:`, `docs:`, `chore:`, `refactor:`)
- **Articles:** HTML files in `labnotes/articles/`, using `../styles.css`, following the template pattern (progress bar, topbar, nav dropdown, article body, footer)
- **Nav dropdowns:** Use `.nav-dropdown` / `.nav-dropdown-trigger` / `.nav-dropdown-menu` pattern. JS handles multiple dropdowns via `querySelectorAll`.
- **Always pull before push:** Multiple contributors work on this repo. Always `git pull --rebase` (stash if needed) before pushing.
