# Homepage Production Redesign — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild the lower half of promptengines.com to transition from lab activity into product spotlights, portfolio pipeline, current articles, and a light company OS statement — while keeping Zone 1 (hero, commit terminal, activity grid) untouched and the GitHub Actions feed injection working.

**Architecture:** Single-file edit to `index.html` (1649 lines). The top ~1437 lines (CSS + Zone 1 HTML) stay intact. Lines 1438-1504 (Flow spotlight, stale articles, follow CTA, footer) get replaced with 4 new sections. New CSS gets appended to the existing `<style>` block. The `generate-feed.js` script injects into `<!-- FEED:START/END -->` and `<!-- TELEMETRY:START/END -->` markers — both are in Zone 1 and must not be touched. The v1-v6.html theme variants are legacy and NOT updated in this task.

**Tech Stack:** Static HTML + CSS (no framework). GitHub Actions + Octokit for feed. Vercel static deploy.

**Key constraint:** The `generate-feed.js` regex looks for `<!-- FEED:START -->...<!-- FEED:END -->` and `<!-- TELEMETRY:START -->...<!-- TELEMETRY:END -->`. These markers must remain exactly as-is in the activity grid and terminal sections.

---

## File Map

| Action | File | Lines |
|--------|------|-------|
| Modify | `index.html` | Replace lines ~1438-1504 (Flow spotlight → footer) with new sections |
| Modify | `index.html` | Append new CSS to existing `<style>` block (~line 22-1206) |
| Modify | `index.html` | Update rotator values array in JS (~line 1602) |
| Verify | `scripts/generate-feed.js` | Confirm FEED/TELEMETRY markers still work after edit |
| Verify | `.github/workflows/update-feed.yml` | Confirm workflow targets correct file |

---

## Task 1: Add new CSS for product, portfolio, and OS sections

**Files:**
- Modify: `index.html` — append CSS before the closing `</style>` tag (line ~1206)

**Step 1: Add CSS**

Insert the following CSS block before line 1206 (`</style>`):

```css
    /* ═══════════════════════════════════════════
       PRODUCT SPOTLIGHTS
       ═══════════════════════════════════════════ */
    .product-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 18px;
    }

    .product-card {
      border: 1px solid var(--line);
      border-radius: 14px;
      padding: 28px;
      background: linear-gradient(150deg, rgba(27, 42, 67, 0.7), rgba(18, 30, 50, 0.5));
      display: flex;
      flex-direction: column;
      gap: 14px;
      text-decoration: none;
      color: inherit;
      transition: border-color 0.22s ease, transform 0.18s ease, box-shadow 0.22s ease;
    }

    .product-card:hover {
      border-color: rgba(241, 122, 74, 0.52);
      transform: translateY(-2px);
      box-shadow: 0 16px 42px rgba(9, 14, 25, 0.36);
    }

    .product-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .product-name {
      font-family: var(--font-display);
      font-size: 22px;
      font-weight: 700;
      letter-spacing: -0.02em;
    }

    .product-badge {
      font-family: var(--font-mono);
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      padding: 3px 10px;
      border-radius: 4px;
    }

    .badge-prelaunch {
      background: rgba(241, 122, 74, 0.15);
      color: var(--accent);
    }

    .badge-alpha {
      background: rgba(139, 184, 255, 0.12);
      color: #8bb8ff;
    }

    .badge-active {
      background: rgba(93, 217, 184, 0.12);
      color: var(--signal);
    }

    .badge-proto {
      background: rgba(255, 255, 255, 0.06);
      color: var(--muted);
    }

    .product-pitch {
      color: var(--muted);
      font-size: 15px;
      line-height: 1.5;
    }

    .product-features {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .product-feature {
      font-family: var(--font-mono);
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--text);
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--line);
      padding: 5px 10px;
      border-radius: 5px;
    }

    .product-cta {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-family: var(--font-mono);
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--accent);
      margin-top: 4px;
    }

    /* ═══════════════════════════════════════════
       PORTFOLIO PIPELINE
       ═══════════════════════════════════════════ */
    .pipeline {
      display: flex;
      align-items: center;
      margin-bottom: 24px;
    }

    .pipeline-stage {
      flex: 1;
      text-align: center;
      padding: 14px 12px;
      border: 1px solid var(--line);
      font-family: var(--font-mono);
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--muted);
    }

    .pipeline-stage:first-child { border-radius: 8px 0 0 8px; }
    .pipeline-stage:last-child { border-radius: 0 8px 8px 0; }

    .pipeline-stage.stage-active {
      background: var(--accent-soft);
      color: var(--accent);
      border-color: rgba(241, 122, 74, 0.3);
    }

    .pipeline-arrow {
      font-size: 18px;
      color: var(--muted);
      padding: 0 2px;
    }

    .portfolio-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 14px;
    }

    .portfolio-grid-3 {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 14px;
      margin-top: 14px;
    }

    .portfolio-card {
      border: 1px solid var(--line);
      border-radius: 10px;
      padding: 16px;
      background: var(--panel);
    }

    .portfolio-card-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }

    .portfolio-card-name {
      font-family: var(--font-mono);
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--text);
    }

    .portfolio-card-desc {
      color: var(--muted);
      font-size: 13px;
    }

    .portfolio-card.is-proto {
      opacity: 0.7;
    }

    /* ═══════════════════════════════════════════
       COMPANY OS STATEMENT
       ═══════════════════════════════════════════ */
    .os-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 14px;
    }

    .os-card {
      border: 1px solid var(--line);
      border-radius: 14px;
      padding: 28px;
      background: linear-gradient(150deg, rgba(93, 217, 184, 0.06), rgba(18, 30, 50, 0.5));
    }

    .os-card-sm {
      border: 1px solid var(--line);
      border-radius: 10px;
      padding: 18px;
      background: var(--panel);
    }

    .os-sidebar {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    /* ═══════════════════════════════════════════
       ARTICLES GRID (for "Published" section)
       ═══════════════════════════════════════════ */
    .articles-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 14px;
    }

    .article-card {
      border: 1px solid var(--line);
      border-radius: 12px;
      text-decoration: none;
      color: inherit;
      background: linear-gradient(150deg, rgba(27, 42, 67, 0.58), rgba(18, 30, 50, 0.45));
      transition: border-color 0.22s ease, transform 0.18s ease;
      display: block;
      overflow: hidden;
    }

    .article-card:hover {
      border-color: rgba(241, 122, 74, 0.52);
      transform: translateY(-2px);
    }

    .article-card-head {
      padding: 14px 16px 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .article-card-body {
      padding: 0 16px 16px;
    }

    .article-card-body h3 {
      font-size: 15px;
      font-weight: 600;
      line-height: 1.3;
      margin-bottom: 6px;
    }

    .article-card-body p {
      color: var(--muted);
      font-size: 13px;
      line-height: 1.4;
    }

    .mode-dots {
      font-family: var(--font-mono);
      font-size: 10px;
      color: var(--accent);
    }

    /* ═══ RESPONSIVE ═══ */
    @media (max-width: 900px) {
      .product-grid { grid-template-columns: 1fr; }
      .portfolio-grid { grid-template-columns: 1fr 1fr; }
      .portfolio-grid-3 { grid-template-columns: 1fr; }
      .articles-grid { grid-template-columns: 1fr; }
      .os-grid { grid-template-columns: 1fr; }
    }

    @media (max-width: 680px) {
      .portfolio-grid { grid-template-columns: 1fr; }
      .pipeline { flex-wrap: wrap; }
      .pipeline-stage { flex: 1 1 100px; }
    }
```

**Step 2: Verify CSS doesn't break existing styles**

Visually confirm in browser that Zone 1 renders identically.

**Step 3: Commit**

```bash
git add index.html
git commit -m "style: add CSS for product spotlights, portfolio pipeline, and OS sections"
```

---

## Task 2: Replace Flow Education spotlight with product spotlights + portfolio

**Files:**
- Modify: `index.html` — replace the `<section id="flow-education">` block (lines ~1439-1467)

**Step 1: Replace Flow Education section**

Delete the entire `<section id="flow-education">...</section>` block and replace with two new sections:

```html
    <section id="products">
      <div class="container">
        <div class="section-head">
          <div class="section-tag">From the lab</div>
          <h2 class="section-title">Products approaching alpha.</h2>
          <p class="section-copy">Built in the lab. Tested against real workloads. Graduating to production.</p>
        </div>

        <div class="product-grid">
          <a class="product-card" href="https://storybookstudio.promptengines.com" target="_blank" rel="noopener noreferrer">
            <div class="product-head">
              <span class="product-name">Storybook Studio</span>
              <span class="product-badge badge-prelaunch">Pre-Launch</span>
            </div>
            <p class="product-pitch">AI-powered children's storybook creation. Generate complete illustrated books with consistent characters across 34+ art styles. Digital delivery and print-ready output through Lulu and Gelato.</p>
            <div class="product-features">
              <span class="product-feature">34+ art styles</span>
              <span class="product-feature">Character consistency</span>
              <span class="product-feature">Print-ready</span>
              <span class="product-feature">100 free credits</span>
            </div>
            <span class="product-cta">Try Storybook Studio &rarr;</span>
          </a>

          <a class="product-card" href="https://videoterminal.promptengines.com" target="_blank" rel="noopener noreferrer">
            <div class="product-head">
              <span class="product-name">Video Terminal</span>
              <span class="product-badge badge-alpha">Alpha</span>
            </div>
            <p class="product-pitch">Node-based visual creation tool. Compositing, effects, and AI generation workflows connected through a pipeline editor. Reference images, action prompts, and multi-model output.</p>
            <div class="product-features">
              <span class="product-feature">Node-based pipeline</span>
              <span class="product-feature">Multi-model generation</span>
              <span class="product-feature">Reference images</span>
              <span class="product-feature">Action + camera controls</span>
            </div>
            <span class="product-cta">Try Video Terminal &rarr;</span>
          </a>
        </div>
      </div>
    </section>

    <section id="portfolio">
      <div class="container">
        <div class="section-head">
          <div class="section-tag">How we build</div>
          <h2 class="section-title">Prototype. Ship. Graduate.</h2>
          <p class="section-copy">Every product starts as a prototype. If it survives real use, it graduates to an experiment with its own subdomain. Products that compound get full investment.</p>
        </div>

        <div class="pipeline">
          <div class="pipeline-stage">Prototype<br><span style="font-size: 9px; color: var(--muted);">Internal testing</span></div>
          <span class="pipeline-arrow">&rarr;</span>
          <div class="pipeline-stage stage-active">Experiment<br><span style="font-size: 9px; color: var(--muted);">Subdomain + users</span></div>
          <span class="pipeline-arrow">&rarr;</span>
          <div class="pipeline-stage">Product<br><span style="font-size: 9px; color: var(--muted);">Revenue + growth</span></div>
        </div>

        <div class="portfolio-grid">
          <div class="portfolio-card">
            <div class="portfolio-card-head">
              <span class="portfolio-card-name">Storybook Studio</span>
              <span class="product-badge badge-prelaunch">Pre-Launch</span>
            </div>
            <p class="portfolio-card-desc">AI storybooks. 34+ styles. Print-ready.</p>
          </div>
          <div class="portfolio-card">
            <div class="portfolio-card-head">
              <span class="portfolio-card-name">Video Terminal</span>
              <span class="product-badge badge-alpha">Alpha</span>
            </div>
            <p class="portfolio-card-desc">Node-based visual creation tool.</p>
          </div>
          <div class="portfolio-card">
            <div class="portfolio-card-head">
              <span class="portfolio-card-name">Kaizen</span>
              <span class="product-badge badge-active">Active</span>
            </div>
            <p class="portfolio-card-desc">Educational gaming for kids.</p>
          </div>
          <div class="portfolio-card">
            <div class="portfolio-card-head">
              <span class="portfolio-card-name">Norbu</span>
              <span class="product-badge badge-active">Active</span>
            </div>
            <p class="portfolio-card-desc">Tibetan language learning.</p>
          </div>
        </div>
        <div class="portfolio-grid-3">
          <div class="portfolio-card is-proto">
            <div class="portfolio-card-head">
              <span class="portfolio-card-name">Flow Education</span>
              <span class="product-badge badge-proto">Prototype</span>
            </div>
            <p class="portfolio-card-desc">AI-driven kindergarten learning.</p>
          </div>
          <div class="portfolio-card is-proto">
            <div class="portfolio-card-head">
              <span class="portfolio-card-name">Vajra-Upaya</span>
              <span class="product-badge badge-proto">Prototype</span>
            </div>
            <p class="portfolio-card-desc">Precision tool-fitting service.</p>
          </div>
          <div class="portfolio-card">
            <div class="portfolio-card-head">
              <span class="portfolio-card-name">Consulting</span>
              <span class="product-badge badge-active">Active</span>
            </div>
            <p class="portfolio-card-desc">Applied AI consulting.</p>
          </div>
        </div>
      </div>
    </section>
```

**Step 2: Commit**

```bash
git add index.html
git commit -m "feat: replace Flow spotlight with product spotlights + portfolio pipeline"
```

---

## Task 3: Update "Published this week" with current articles

**Files:**
- Modify: `index.html` — replace the `<section id="writing">` block (lines ~1400-1437)

**Step 1: Replace writing section**

Replace the entire `<section id="writing">...</section>` with:

```html
    <section id="writing">
      <div class="container">
        <div class="section-head">
          <div class="section-tag">Latest from the lab</div>
          <h2 class="section-title">Published this week.</h2>
          <p class="section-copy">New notes from <a href="https://lab.promptengines.com" target="_blank" rel="noopener noreferrer" style="color:var(--accent); text-decoration:none; border-bottom:1px solid rgba(241,122,74,0.4);">lab.promptengines.com</a> — articles, signals, and build intelligence.</p>
        </div>
        <div class="articles-grid">
          <a class="article-card" href="https://lab.promptengines.com/articles/image-models-preliminary-views.html" target="_blank" rel="noopener noreferrer">
            <div class="article-card-head">
              <span class="app-card-tag">Benchmark</span>
              <span class="mode-dots">◉ ◆ ⬡</span>
            </div>
            <div class="article-card-body">
              <h3>Image model API baseline: March 2026</h3>
              <p>9 models, 3 providers. Speed, reliability, content filtering, and IP character handling — benchmarked from production.</p>
            </div>
          </a>
          <a class="article-card" href="https://lab.promptengines.com/articles/2026-03-03-zen-and-the-art-of-vibecoding.html" target="_blank" rel="noopener noreferrer">
            <div class="article-card-head">
              <span class="app-card-tag">Lab Notes</span>
              <span class="mode-dots">◉ ◆ ⬡</span>
            </div>
            <div class="article-card-body">
              <h3>Zen and the Art of Vibe Coding</h3>
              <p>An operating framework for infinite leverage. Screen assignment, input/output separation, and the two-hour daily disconnect.</p>
            </div>
          </a>
          <a class="article-card" href="https://lab.promptengines.com/articles/public-apis-usefulness-review.html" target="_blank" rel="noopener noreferrer">
            <div class="article-card-head">
              <span class="app-card-tag">Infrastructure</span>
            </div>
            <div class="article-card-body">
              <h3>Public APIs: a usefulness review of 400+</h3>
              <p>Which public APIs are production-grade, which are toys. Classification by reliability, documentation quality, and rate limits.</p>
            </div>
          </a>
        </div>
      </div>
    </section>
```

**Step 2: Commit**

```bash
git add index.html
git commit -m "content: update Published this week with current articles + mode dots"
```

---

## Task 4: Add Company OS statement section

**Files:**
- Modify: `index.html` — insert new section between writing and follow sections

**Step 1: Insert OS section**

Add the following section between `</section>` (end of writing) and `<section class="follow" id="follow">`:

```html
    <section id="operating-system">
      <div class="container">
        <div class="os-grid">
          <div class="os-card">
            <div class="section-tag" style="margin-bottom: 16px;">How we operate</div>
            <h2 class="section-title" style="font-size: clamp(28px, 4vw, 44px);">Humans set direction.<br>Agents handle throughput.</h2>
            <p class="section-copy" style="margin-top: 14px;">
              PromptEngines runs as a human-agent operating system. Every product, document, and decision flows through a shared control surface. Agents gather state, draft work, and execute bounded tasks. Humans hold judgment, taste, and final approval. The lab compounds because the system does.
            </p>
          </div>
          <div class="os-sidebar">
            <div class="os-card-sm">
              <div style="font-family: var(--font-mono); font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); margin-bottom: 8px;">Team model</div>
              <p style="color: var(--text); font-size: 14px;">1 human operator + 2 named agents. Shared registry. Approval gates. Clear ownership.</p>
            </div>
            <div class="os-card-sm">
              <div style="font-family: var(--font-mono); font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); margin-bottom: 8px;">Daily operating loop</div>
              <p style="color: var(--text); font-size: 14px;">What exists. What changed. What needs attention. What ships next.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
```

**Step 2: Commit**

```bash
git add index.html
git commit -m "feat: add Company OS statement section"
```

---

## Task 5: Update rotator values and remove stale Flow CSS

**Files:**
- Modify: `index.html` — JS rotator values (~line 1602)

**Step 1: Update rotator values**

Change:
```js
const values = ["Kaizen", "Storybook Studio", "Lab"];
```

To:
```js
const values = ["Storybook Studio", "Video Terminal", "Kaizen", "Norbu", "Lab"];
```

**Step 2: Commit**

```bash
git add index.html
git commit -m "fix: update rotator values to include all active products"
```

---

## Task 6: Verify feed injection markers are intact

**Step 1: Verify FEED markers exist**

```bash
grep -n "FEED:START\|FEED:END" index.html
```

Expected: Two lines, both inside the `<section id="activity">` block.

**Step 2: Verify TELEMETRY markers exist**

```bash
grep -n "TELEMETRY:START\|TELEMETRY:END" index.html
```

Expected: Two lines, both inside the `.terminal-log` div.

**Step 3: Dry-run the feed script locally (optional)**

```bash
GITHUB_TOKEN=test node -e "
const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf-8');
const feedOk = /<!-- FEED:START -->[\s\S]*?<!-- FEED:END -->/.test(content);
const telOk = /<!-- TELEMETRY:START -->[\s\S]*?<!-- TELEMETRY:END -->/.test(content);
console.log('FEED markers:', feedOk ? 'OK' : 'MISSING');
console.log('TELEMETRY markers:', telOk ? 'OK' : 'MISSING');
"
```

Expected: Both OK.

---

## Task 7: Visual verification

**Step 1: Serve locally and screenshot**

```bash
python3 -m http.server 8787
```

Open http://localhost:8787 and verify:
- Zone 1 (hero, terminal, activity grid) unchanged
- Product spotlights render with two cards side-by-side
- Portfolio pipeline shows graduation stages
- Portfolio grid shows 7 products/prototypes with correct badges
- Articles section shows 3 current articles with mode dots
- OS statement renders cleanly
- Follow CTA and footer intact
- Mobile responsive at 900px and 680px breakpoints
- Theme switcher still works across all 5 themes

**Step 2: Check all links**

Verify these URLs resolve:
- `https://storybookstudio.promptengines.com`
- `https://videoterminal.promptengines.com`
- `https://kaizen.promptengines.com`
- `https://norbu.promptengines.com`
- `https://lab.promptengines.com/articles/image-models-preliminary-views.html`
- `https://lab.promptengines.com/articles/2026-03-03-zen-and-the-art-of-vibecoding.html`
- `https://lab.promptengines.com/articles/public-apis-usefulness-review.html`

**Step 3: Commit final state**

If any adjustments were needed during verification, commit them:

```bash
git add index.html
git commit -m "fix: visual adjustments from homepage verification"
```

---

## Task 8: Push to production

**Step 1: Push to main**

```bash
git push origin main
```

Vercel auto-deploys on push. Verify at https://promptengines.com after deploy completes (~60s).

**Step 2: Verify live site**

Confirm all sections render, links work, theme switcher works, and the commit feed data is present.
