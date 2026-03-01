# Lab Content System — Plan

**Goal:** Make lab.promptengines.com a top resource for humans and agents.
**Date:** 2026-02-28

---

## Content Pillars

### A. Agent & OpenClaw Articles
Technical write-ups on agent architecture, model evaluations, tooling.
Existing 7 articles are this category. Keep publishing 3-5x/week.

### B. Market & Signal Analysis
- "Current Twitter/X vibe" — sentiment snapshots on AI topics
- Gold price predictions — AI forecasting experiments
- Prediction market experiments — track, analyze, publish findings
- These are live experiments with real data, published as Lab findings

### C. Build Stream Intelligence
Auto-generated insights from commit data across all repos:
- Commit frequency heatmaps by repo/day
- Tech concept frequency (what we're exploring most)
- New libraries/tools introduced over time
- Build velocity reports (weekly)
- "What we shipped this week" digests

### D. Skills Publishing
- New skills we build get published here first
- Skills index page on lab
- Link to dedicated skills repo

---

## Site Sections to Build

Current: Hero + Latest + Archive (flat)

New structure:
```
lab.promptengines.com/
├── index.html          ← Expanded: hero + all 4 sections previewed
├── articles/           ← Existing (keep)
├── signals/            ← NEW: market + vibe analysis posts
│   └── *.html
├── build-stream/       ← NEW: commit intelligence reports
│   ├── index.html      ← Weekly build digest hub
│   └── *.html          ← Individual reports
└── skills/             ← NEW: skills index
    └── index.html
```

---

## Build Stream Intelligence — Technical Design

### Data source
`gh api repos/aikaizen/*/commits` — all repos, paginated, cached

### Metrics to extract and publish
1. **Commit frequency** — commits/day by repo, 30-day rolling
2. **Tech radar** — new packages/imports seen for first time
3. **Concept frequency** — NLP on commit messages, what topics dominate
4. **Co-author breakdown** — human vs AI-assisted commits
5. **Build velocity** — features vs fixes vs docs ratio
6. **Cross-repo activity** — which apps are hottest

### Automation
- Script: `scripts/generate-build-stream.js`
- Runs: GitHub Action every Monday 09:00 UTC
- Output: `build-stream/YYYY-WW.html` (weekly report)
- Also updates: `build-stream/index.html` with latest

### Visual types for build stream
- Commit frequency: `visual-bars` (bars per repo)
- Tech radar: `visual-matrix` (new tech × week introduced)
- Velocity: `visual-code` (structured weekly summary)

---

## Skills Publishing System

### New repo: `aikaizen/promptengines-skills`
Structure:
```
promptengines-skills/
├── README.md
├── skills/
│   ├── lab-article-writer/
│   │   └── SKILL.md
│   ├── marketing-manager/
│   │   └── SKILL.md
│   └── .../
└── CONTRIBUTING.md
```

### Lab skills page: `lab.promptengines.com/skills/`
Each skill gets a card:
- Name + description
- Install command: `npx clawhub install <slug>`
- GitHub link
- Category tag

---

## Execution Order

### Phase 1 — Now (today)
1. ✅ Push first article (character consistency)
2. Add `signals/` section to index
3. Add `build-stream/` section to index  
4. Add `skills/` section to index
5. Publish first build stream report (manual, from commit data already gathered)

### Phase 2 — This week
6. Create `signals/` first article (AI Twitter vibe snapshot)
7. Create `build-stream/index.html`
8. Set up `generate-build-stream.js` script
9. Set up GitHub Action for weekly auto-generation
10. Create skills repo + first 2 skills published

### Phase 3 — Ongoing
- 3-5 articles/week (mix of all pillars)
- Weekly build stream auto-publishes
- Skills added as built
- Signals updated as market events happen
