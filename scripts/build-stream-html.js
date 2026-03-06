/**
 * Build Stream HTML Generator
 *
 * Reads all .data-*.json files in labnotes/build-stream/ and generates
 * a single index.html with:
 *   - Activity chart (last 30 days)
 *   - Today's stream at the top
 *   - Full history below
 *
 * No external dependencies — uses only Node built-ins.
 */

const fs = require("fs");
const path = require("path");

const STREAM_DIR = path.join(__dirname, "..", "labnotes", "build-stream");
const OUTPUT = path.join(STREAM_DIR, "index.html");

// ---------------------------------------------------------------------------
// Load all data files
// ---------------------------------------------------------------------------

function loadAllData() {
  const files = fs
    .readdirSync(STREAM_DIR)
    .filter((f) => f.startsWith(".data-") && f.endsWith(".json"))
    .sort()
    .reverse(); // newest first

  return files.map((f) => {
    const raw = fs.readFileSync(path.join(STREAM_DIR, f), "utf-8");
    return JSON.parse(raw);
  });
}

// ---------------------------------------------------------------------------
// Chart data (last 30 days)
// ---------------------------------------------------------------------------

function buildChartData(allData) {
  const days = [];
  const today = new Date();

  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const entry = allData.find((e) => e.date === dateStr);
    days.push({
      date: dateStr,
      label: `${d.getMonth() + 1}/${d.getDate()}`,
      total: entry ? entry.stats.total : 0,
      repos: entry ? Object.keys(entry.stats.byRepo || {}).length : 0,
      byRepo: entry ? entry.stats.byRepo || {} : {},
    });
  }

  return days;
}

// ---------------------------------------------------------------------------
// Escape HTML
// ---------------------------------------------------------------------------

function esc(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ---------------------------------------------------------------------------
// Build a day's entry HTML
// ---------------------------------------------------------------------------

function buildDayEntry(data, isToday) {
  const d = new Date(data.date + "T12:00:00Z");
  const dateLabel = d.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });

  // Group by repo
  const byRepo = {};
  data.commits.forEach((c) => {
    if (!byRepo[c.repo]) byRepo[c.repo] = [];
    byRepo[c.repo].push(c);
  });

  // Repo sections
  const repoSections = Object.entries(byRepo)
    .sort((a, b) => b[1].length - a[1].length)
    .map(([repo, commits]) => {
      const lines = commits
        .map((c) => {
          const typeTag =
            c.type !== "other"
              ? `<span class="commit-type type-${esc(c.type)}">${esc(c.type)}</span>`
              : "";
          const subject = c.subject.replace(
            /^(feat|fix|content|refactor|docs|chore|style|test)(\(.+\))?: /,
            ""
          );
          return `            <div class="stream-commit">
              <code class="commit-hash">${esc(c.shortHash)}</code>
              ${typeTag}
              <span class="commit-subject">${esc(subject)}</span>
            </div>`;
        })
        .join("\n");

      return `          <div class="stream-repo">
            <div class="stream-repo-head">
              <span class="stream-repo-name">${esc(repo)}</span>
              <span class="stream-repo-count">${commits.length}</span>
            </div>
${lines}
          </div>`;
    })
    .join("\n");

  // Type summary
  const byType = data.stats.byType || {};
  const typePills = Object.entries(byType)
    .sort((a, b) => b[1] - a[1])
    .map(
      ([t, n]) =>
        `<span class="type-pill type-${esc(t)}">${esc(t)} ${n}</span>`
    )
    .join(" ");

  const todayClass = isToday ? ' stream-day-today' : '';

  return `      <article class="stream-day${todayClass}" id="day-${esc(data.date)}">
        <div class="stream-day-header">
          <h2>${esc(dateLabel)}</h2>
          <div class="stream-day-stats">
            <span class="stat-chip">${data.stats.total} commits</span>
            <span class="stat-chip">${Object.keys(byRepo).length} repos</span>
          </div>
        </div>
        <div class="stream-day-types">${typePills}</div>
        <div class="stream-day-repos">
${repoSections}
        </div>
      </article>`;
}

// ---------------------------------------------------------------------------
// Generate full HTML
// ---------------------------------------------------------------------------

function generate() {
  const allData = loadAllData();

  if (allData.length === 0) {
    console.log("No data files found. Skipping HTML generation.");
    return;
  }

  const chartData = buildChartData(allData);
  const maxCommits = Math.max(...chartData.map((d) => d.total), 1);

  // Collect all repo names for chart legend
  const allRepoNames = new Set();
  allData.forEach((d) => {
    if (d.stats.byRepo) {
      Object.keys(d.stats.byRepo).forEach((r) => allRepoNames.add(r));
    }
  });

  // Total stats
  const totalCommits = allData.reduce((sum, d) => sum + d.stats.total, 0);
  const totalDays = allData.length;
  const allRepos = new Set();
  allData.forEach((d) => {
    if (d.summary && d.summary.activeRepos) {
      d.summary.activeRepos.forEach((r) => allRepos.add(r));
    }
  });

  // Chart bars HTML
  const chartBars = chartData
    .map((day) => {
      const pct = maxCommits > 0 ? (day.total / maxCommits) * 100 : 0;
      const isEmpty = day.total === 0;
      return `          <div class="chart-col${isEmpty ? " chart-col-empty" : ""}" title="${esc(day.date)}: ${day.total} commits">
            <div class="chart-bar" style="height: ${pct}%"></div>
            <div class="chart-label">${esc(day.label)}</div>
          </div>`;
    })
    .join("\n");

  // Day entries (newest first)
  const todayStr = new Date().toISOString().split("T")[0];
  const dayEntries = allData
    .map((data) => buildDayEntry(data, data.date === todayStr))
    .join("\n\n");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Build Stream — Prompt Engines Lab Notes</title>
  <meta name="description" content="Daily commit intelligence from all PromptEngines repos. What shipped, what patterns emerged, what tech was introduced." />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="../styles.css" />
  <style>
    /* ── Build Stream specific ── */
    .stream-chart {
      background: var(--bg-elevated);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 2rem;
      margin-bottom: 2rem;
    }
    .stream-chart h3 {
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--text-3);
      margin-bottom: 1.5rem;
      font-family: var(--mono);
    }
    .chart-grid {
      display: flex;
      align-items: flex-end;
      gap: 3px;
      height: 140px;
      padding-bottom: 1.5rem;
      position: relative;
    }
    .chart-col {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-end;
      height: 100%;
      position: relative;
    }
    .chart-bar {
      width: 100%;
      min-height: 2px;
      background: var(--accent);
      border-radius: 2px 2px 0 0;
      transition: height 0.3s var(--ease);
      opacity: 0.85;
    }
    .chart-col:hover .chart-bar {
      opacity: 1;
      background: var(--accent-hover);
    }
    .chart-col-empty .chart-bar {
      background: var(--border);
      opacity: 0.3;
    }
    .chart-label {
      font-size: 0.55rem;
      color: var(--text-4);
      font-family: var(--mono);
      margin-top: 6px;
      white-space: nowrap;
    }
    /* Only show every 5th label to reduce clutter */
    .chart-col:not(:nth-child(5n+1)) .chart-label {
      visibility: hidden;
    }
    .chart-col:last-child .chart-label {
      visibility: visible;
    }

    .stream-totals {
      display: flex;
      gap: 2rem;
      margin-bottom: 2.5rem;
      flex-wrap: wrap;
    }
    .stream-total {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .stream-total-num {
      font-size: 1.6rem;
      font-weight: 700;
      color: var(--text);
      font-family: var(--mono);
    }
    .stream-total-label {
      font-size: 0.75rem;
      color: var(--text-4);
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    .stream-day {
      background: var(--bg-elevated);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 2rem;
      margin-bottom: 1.25rem;
    }
    .stream-day-today {
      border-color: var(--accent);
      box-shadow: 0 0 0 1px var(--accent-dim);
    }
    .stream-day-header {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }
    .stream-day-header h2 {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--text);
    }
    .stream-day-stats {
      display: flex;
      gap: 0.5rem;
    }
    .stat-chip {
      font-size: 0.7rem;
      font-family: var(--mono);
      color: var(--text-3);
      background: var(--bg);
      padding: 0.2rem 0.6rem;
      border-radius: 99px;
      border: 1px solid var(--border);
    }
    .stream-day-types {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
      margin-bottom: 1.25rem;
    }
    .type-pill {
      font-size: 0.65rem;
      font-family: var(--mono);
      padding: 0.15rem 0.5rem;
      border-radius: 4px;
      background: var(--bg);
      color: var(--text-3);
      border: 1px solid var(--border-subtle);
    }
    .type-pill.type-feat { color: #4ade80; border-color: rgba(74,222,128,0.2); }
    .type-pill.type-fix { color: #f87171; border-color: rgba(248,113,113,0.2); }
    .type-pill.type-content { color: #60a5fa; border-color: rgba(96,165,250,0.2); }
    .type-pill.type-refactor { color: #c084fc; border-color: rgba(192,132,252,0.2); }
    .type-pill.type-docs { color: #fbbf24; border-color: rgba(251,191,36,0.2); }
    .type-pill.type-chore { color: var(--text-4); }

    .stream-day-repos {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .stream-repo {
      padding-left: 1rem;
      border-left: 2px solid var(--border);
    }
    .stream-repo-head {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }
    .stream-repo-name {
      font-family: var(--mono);
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--accent);
    }
    .stream-repo-count {
      font-size: 0.6rem;
      font-family: var(--mono);
      color: var(--text-4);
      background: var(--bg);
      padding: 0.1rem 0.4rem;
      border-radius: 99px;
      border: 1px solid var(--border-subtle);
    }
    .stream-commit {
      display: flex;
      align-items: baseline;
      gap: 0.5rem;
      padding: 0.2rem 0;
      font-size: 0.8rem;
      line-height: 1.4;
    }
    .commit-hash {
      font-family: var(--mono);
      font-size: 0.7rem;
      color: var(--text-4);
      flex-shrink: 0;
    }
    .commit-type {
      font-family: var(--mono);
      font-size: 0.6rem;
      padding: 0.05rem 0.35rem;
      border-radius: 3px;
      flex-shrink: 0;
      background: var(--bg);
      border: 1px solid var(--border-subtle);
    }
    .commit-type.type-feat { color: #4ade80; border-color: rgba(74,222,128,0.15); }
    .commit-type.type-fix { color: #f87171; border-color: rgba(248,113,113,0.15); }
    .commit-type.type-content { color: #60a5fa; border-color: rgba(96,165,250,0.15); }
    .commit-type.type-refactor { color: #c084fc; border-color: rgba(192,132,252,0.15); }
    .commit-type.type-docs { color: #fbbf24; border-color: rgba(251,191,36,0.15); }
    .commit-type.type-chore { color: var(--text-4); }
    .commit-subject {
      color: var(--text-2);
    }

    @media (max-width: 640px) {
      .stream-day { padding: 1.25rem; }
      .stream-day-header { flex-direction: column; gap: 0.4rem; }
      .chart-grid { height: 100px; }
      .chart-col:not(:nth-child(7n+1)) .chart-label { visibility: hidden; }
      .stream-commit { flex-wrap: wrap; }
    }
  </style>
</head>
<body>
  <header class="topbar">
    <div class="container topbar-inner">
      <a class="brand" href="../index.html">Lab<span>Notes</span></a>
      <nav class="nav">
        <a href="../team/">Team</a>
        <a href="../purpose/">Purpose</a>
        <div class="nav-dropdown">
          <span class="nav-dropdown-trigger">Labnotes</span>
          <div class="nav-dropdown-menu">
            <a href="../articles/">Articles</a>
            <a href="../signals/">Signals</a>
            <a href="../build-stream/">Build Stream</a>
            <a href="../skills/">Skills</a>
            <a href="../submit/">Submit Article</a>
            <a href="../about/">About</a>
          </div>
        </div>
        <a href="https://promptengines.com" target="_blank" rel="noopener noreferrer">PromptEngines.com</a>
      </nav>
    </div>
  </header>

  <main>
    <section class="hero">
      <div class="container hero-grid">
        <div>
          <div class="eyebrow">Build Stream</div>
          <h1>What we're building. Every day. From the commits.</h1>
          <p class="hero-lead">Auto-generated daily reports from commit data across all PromptEngines repos. Commit frequency, build velocity, cross-repo patterns.</p>
        </div>
        <aside class="hero-aside">
          <div class="hero-stat">
            <span class="hero-stat-number">Daily</span>
            <span class="hero-stat-label">Auto-generated</span>
          </div>
          <div class="hero-stat">
            <span class="hero-stat-number">${allRepos.size}</span>
            <span class="hero-stat-label">Repos tracked</span>
          </div>
        </aside>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="stream-totals">
          <div class="stream-total">
            <span class="stream-total-num">${totalCommits}</span>
            <span class="stream-total-label">Total commits</span>
          </div>
          <div class="stream-total">
            <span class="stream-total-num">${totalDays}</span>
            <span class="stream-total-label">Days tracked</span>
          </div>
          <div class="stream-total">
            <span class="stream-total-num">${allRepos.size}</span>
            <span class="stream-total-label">Repos</span>
          </div>
          <div class="stream-total">
            <span class="stream-total-num">${maxCommits}</span>
            <span class="stream-total-label">Peak day</span>
          </div>
        </div>

        <div class="stream-chart">
          <h3>Commit activity — last 30 days</h3>
          <div class="chart-grid">
${chartBars}
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-header">
          <h2>Daily Log</h2>
          <span class="section-count">${totalDays} days</span>
        </div>

<!-- STREAM:START -->
${dayEntries}
<!-- STREAM:END -->

      </div>
    </section>
  </main>

  <footer class="footer">
    <div class="container">&copy; 2026 Prompt Engines &middot; Lab Notes</div>
  </footer>
  <script>
    (function () {
      var dropdowns = document.querySelectorAll('.nav-dropdown');
      dropdowns.forEach(function (dropdown) {
        var trigger = dropdown.querySelector('.nav-dropdown-trigger') || dropdown.querySelector('span');
        if (!trigger) return;
        trigger.addEventListener('click', function (e) {
          e.preventDefault();
          dropdowns.forEach(function (other) { if (other !== dropdown) other.classList.remove('is-open'); });
          dropdown.classList.toggle('is-open');
        });
      });
      document.addEventListener('click', function (e) {
        dropdowns.forEach(function (dd) { if (!dd.contains(e.target)) dd.classList.remove('is-open'); });
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') dropdowns.forEach(function (dd) { dd.classList.remove('is-open'); });
      });
    })();
  </script>
</body>
</html>`;

  fs.writeFileSync(OUTPUT, html, "utf-8");
  console.log(`Generated: ${OUTPUT}`);
  console.log(`Days: ${totalDays}, Total commits: ${totalCommits}, Repos: ${allRepos.size}`);
}

if (require.main === module) {
  generate();
}

module.exports = { generate };
