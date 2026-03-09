/**
 * Build Stream HTML Generator
 *
 * Reads all .data-*.json files in labnotes/build-stream/ and generates
 * a single index.html with:
 *   - Activity chart (last 30 days)
 *   - Today's stream expanded at the top
 *   - Collapsible history for the last 14 days below
 *
 * No external dependencies — uses only Node built-ins.
 */

const fs = require("fs");
const path = require("path");

const STREAM_DIR = path.join(__dirname, "..", "labnotes", "build-stream");
const OUTPUT = path.join(STREAM_DIR, "index.html");
const HISTORY_DAYS = 14;

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
// Format a date string as readable label
// ---------------------------------------------------------------------------

function formatDate(dateStr) {
  const d = new Date(dateStr + "T12:00:00Z");
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

function formatDateShort(dateStr) {
  const d = new Date(dateStr + "T12:00:00Z");
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

// ---------------------------------------------------------------------------
// Build repo detail HTML (shared between today + history)
// ---------------------------------------------------------------------------

function buildRepoDetail(data) {
  const byRepo = {};
  data.commits.forEach((c) => {
    if (!byRepo[c.repo]) byRepo[c.repo] = [];
    byRepo[c.repo].push(c);
  });

  const byType = data.stats.byType || {};
  const typePills = Object.entries(byType)
    .sort((a, b) => b[1] - a[1])
    .map(
      ([t, n]) =>
        `<span class="type-pill type-${esc(t)}">${esc(t)} ${n}</span>`
    )
    .join(" ");

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
          return `              <div class="stream-commit">
                <code class="commit-hash">${esc(c.shortHash)}</code>
                ${typeTag}
                <span class="commit-subject">${esc(subject)}</span>
              </div>`;
        })
        .join("\n");

      return `            <div class="stream-repo">
              <div class="stream-repo-head">
                <span class="stream-repo-name">${esc(repo)}</span>
                <span class="stream-repo-count">${commits.length}</span>
              </div>
${lines}
            </div>`;
    })
    .join("\n");

  return { typePills, repoSections, repoCount: Object.keys(byRepo).length };
}

// ---------------------------------------------------------------------------
// Build today's expanded entry
// ---------------------------------------------------------------------------

function buildTodayEntry(data) {
  const { typePills, repoSections, repoCount } = buildRepoDetail(data);

  return `        <article class="stream-day stream-day-today" id="day-${esc(data.date)}">
          <div class="stream-day-header">
            <h2>${esc(formatDate(data.date))}</h2>
            <div class="stream-day-stats">
              <span class="stat-chip stat-chip-today">Today</span>
              <span class="stat-chip">${data.stats.total} commits</span>
              <span class="stat-chip">${repoCount} repos</span>
            </div>
          </div>
          <div class="stream-day-types">${typePills}</div>
          <div class="stream-day-repos">
${repoSections}
          </div>
        </article>`;
}

// ---------------------------------------------------------------------------
// Build a collapsible history entry
// ---------------------------------------------------------------------------

function buildHistoryEntry(data) {
  const { typePills, repoSections, repoCount } = buildRepoDetail(data);

  // Build a short repo summary for the collapsed summary line
  const repoNames = [];
  const byRepo = {};
  data.commits.forEach((c) => {
    if (!byRepo[c.repo]) byRepo[c.repo] = 0;
    byRepo[c.repo]++;
  });
  Object.entries(byRepo)
    .sort((a, b) => b[1] - a[1])
    .forEach(([r, n]) => repoNames.push(`${r} (${n})`));

  return `        <details class="history-day" id="day-${esc(data.date)}">
          <summary class="history-summary">
            <span class="history-date">${esc(formatDateShort(data.date))}</span>
            <span class="history-stats">
              <span class="stat-chip">${data.stats.total} commits</span>
              <span class="stat-chip">${repoCount} repos</span>
            </span>
            <span class="history-repos-preview">${esc(repoNames.join(" · "))}</span>
          </summary>
          <div class="history-detail">
            <div class="stream-day-types">${typePills}</div>
            <div class="stream-day-repos">
${repoSections}
            </div>
          </div>
        </details>`;
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
      const isPeak = day.total === maxCommits && day.total > 0;
      const intensity = maxCommits > 0 ? day.total / maxCommits : 0;
      const opacity = isEmpty ? 0.15 : (0.5 + intensity * 0.5).toFixed(2);
      return `            <div class="chart-col${isEmpty ? " chart-col-empty" : ""}${isPeak ? " chart-col-peak" : ""}" title="${esc(day.date)}: ${day.total} commits">
              <div class="chart-bar" style="height: ${pct}%; opacity: ${opacity}"></div>
              <div class="chart-label">${esc(day.label)}</div>
            </div>`;
    })
    .join("\n");

  // Repo breakdown chart (aggregate across all days)
  const repoTotals = {};
  allData.forEach((d) => {
    if (d.stats.byRepo) {
      Object.entries(d.stats.byRepo).forEach(([r, n]) => {
        repoTotals[r] = (repoTotals[r] || 0) + n;
      });
    }
  });
  const repoColors = [
    "#2dd4bf", "#34d399", "#38bdf8", "#818cf8",
    "#f59e0b", "#fb7185", "#a78bfa", "#22d3ee",
  ];
  const sortedRepos = Object.entries(repoTotals).sort((a, b) => b[1] - a[1]);
  const maxRepo = sortedRepos.length > 0 ? sortedRepos[0][1] : 1;
  const repoBars = sortedRepos
    .map(([repo, count], i) => {
      const pct = (count / maxRepo) * 100;
      const color = repoColors[i % repoColors.length];
      return `            <div class="hbar-row">
              <span class="hbar-label">${esc(repo)}</span>
              <div class="hbar-track"><div class="hbar-fill" style="width:${pct}%; background:${color}; box-shadow: 0 0 8px ${color}33"></div></div>
              <span class="hbar-value">${count}</span>
            </div>`;
    })
    .join("\n");

  // Type distribution chart (aggregate across all days)
  const typeTotals = {};
  allData.forEach((d) => {
    if (d.stats.byType) {
      Object.entries(d.stats.byType).forEach(([t, n]) => {
        typeTotals[t] = (typeTotals[t] || 0) + n;
      });
    }
  });
  const typeColors = {
    feat: "#34d399", fix: "#fb7185", content: "#38bdf8",
    refactor: "#a78bfa", docs: "#f59e0b", chore: "#71717a",
    style: "#2dd4bf", test: "#fb923c", other: "#52525b",
  };
  const sortedTypes = Object.entries(typeTotals).sort((a, b) => b[1] - a[1]);
  const maxType = sortedTypes.length > 0 ? sortedTypes[0][1] : 1;
  const typeBars = sortedTypes
    .map(([type, count]) => {
      const pct = (count / maxType) * 100;
      const color = typeColors[type] || "#52525b";
      return `            <div class="hbar-row">
              <span class="hbar-label">${esc(type)}</span>
              <div class="hbar-track"><div class="hbar-fill" style="width:${pct}%; background:${color}; box-shadow: 0 0 8px ${color}33"></div></div>
              <span class="hbar-value">${count}</span>
            </div>`;
    })
    .join("\n");

  // Feature/Fix ratio
  const featCount = typeTotals.feat || 0;
  const fixCount = typeTotals.fix || 0;
  const featFixTotal = featCount + fixCount || 1;
  const featPct = Math.round((featCount / featFixTotal) * 100);
  const fixPct = 100 - featPct;

  // Weekly reports (scan for W*.html files)
  const weeklyFiles = fs
    .readdirSync(STREAM_DIR)
    .filter((f) => /^\d{4}-W\d{2}\.html$/.test(f))
    .sort()
    .reverse();

  const weeklyReportsHtml = weeklyFiles.length > 0
    ? weeklyFiles.map((f) => {
        const weekMatch = f.match(/(\d{4})-W(\d{2})/);
        const year = weekMatch[1];
        const week = weekMatch[2];
        return `          <a class="archive-item" href="./${esc(f)}">
            <div class="archive-meta">Week ${week}, ${year} &middot; Build Stream</div>
            <h3>Weekly Report &mdash; Week ${week}</h3>
          </a>`;
      }).join("\n")
    : `          <p style="color: var(--text-4);">No weekly reports yet.</p>`;

  // Split: today vs history
  const todayStr = new Date().toISOString().split("T")[0];
  const todayData = allData.find((d) => d.date === todayStr);

  // History: everything except today, limited to HISTORY_DAYS
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - HISTORY_DAYS);
  const cutoffStr = cutoffDate.toISOString().split("T")[0];

  const historyData = allData.filter(
    (d) => d.date !== todayStr && d.date >= cutoffStr
  );

  const todayHtml = todayData
    ? buildTodayEntry(todayData)
    : `        <div class="stream-day" style="text-align:center; color: var(--text-4); padding: 3rem;">
          <p>No data for today yet. The stream runs daily at 6:30am CST.</p>
        </div>`;

  const historyHtml =
    historyData.length > 0
      ? historyData.map((d) => buildHistoryEntry(d)).join("\n")
      : `        <p style="color: var(--text-4); padding: 1rem 0;">No previous days recorded yet. History will appear here as data accumulates.</p>`;

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
    /* ── Build Stream — Redesigned ── */
    .stream-chart {
      background: var(--bg-elevated);
      border-radius: var(--radius);
      padding: 2.5rem;
      margin-bottom: 2rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.2), 0 8px 24px rgba(0,0,0,0.15);
    }
    .stream-chart h3 {
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--text-2);
      margin-bottom: 1.75rem;
      font-family: var(--sans);
      letter-spacing: -0.01em;
    }
    .stream-chart h3 .chart-subtitle {
      color: var(--text-4);
      font-weight: 400;
    }

    /* Activity chart with gridlines */
    .chart-grid-wrapper {
      position: relative;
      height: 160px;
      padding-bottom: 1.75rem;
    }
    .chart-gridlines {
      position: absolute;
      inset: 0;
      bottom: 1.75rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      pointer-events: none;
      padding: 0;
    }
    .chart-gridline {
      width: 100%;
      height: 1px;
      background: var(--border-subtle);
    }
    .chart-grid {
      position: relative;
      display: flex;
      align-items: flex-end;
      gap: 4px;
      height: 100%;
      z-index: 1;
    }
    .chart-col {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-end;
      height: calc(100% - 1.75rem);
      position: relative;
    }
    .chart-bar {
      width: 80%;
      min-height: 2px;
      background: linear-gradient(180deg, var(--accent) 0%, rgba(240,77,38,0.5) 100%);
      border-radius: 3px 3px 1px 1px;
      transition: all 0.3s var(--ease);
    }
    .chart-col:hover .chart-bar {
      background: linear-gradient(180deg, var(--accent-hover) 0%, var(--accent) 100%);
      opacity: 1 !important;
      filter: brightness(1.1);
    }
    .chart-col-empty .chart-bar {
      background: var(--border-subtle);
      opacity: 0.25 !important;
    }
    .chart-col-peak .chart-bar {
      box-shadow: 0 0 12px var(--accent-glow), 0 0 4px var(--accent-dim);
    }
    .chart-label {
      font-size: 0.55rem;
      color: var(--text-4);
      font-family: var(--mono);
      margin-top: 8px;
      white-space: nowrap;
      position: absolute;
      bottom: -1.5rem;
    }
    .chart-col:not(:nth-child(5n+1)) .chart-label { visibility: hidden; }
    .chart-col:last-child .chart-label { visibility: visible; }

    /* ── Totals row ── */
    .stream-totals {
      display: flex;
      gap: 3rem;
      margin-bottom: 2.5rem;
      flex-wrap: wrap;
    }
    .stream-total {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    .stream-total-num {
      font-size: 2.2rem;
      font-weight: 800;
      color: var(--text);
      font-family: var(--sans);
      letter-spacing: -0.03em;
      line-height: 1;
    }
    .stream-total-label {
      font-size: 0.7rem;
      color: var(--text-4);
      font-family: var(--mono);
      letter-spacing: 0.04em;
      padding-bottom: 0.25rem;
      border-bottom: 2px solid var(--accent-dim);
      display: inline-block;
    }

    /* ── Today's entry ── */
    .stream-day {
      background: var(--bg-elevated);
      border-radius: var(--radius);
      padding: 2rem;
      margin-bottom: 1.25rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.2), 0 4px 16px rgba(0,0,0,0.12);
    }
    .stream-day-today {
      box-shadow: 0 0 0 1px var(--accent-dim), 0 1px 3px rgba(0,0,0,0.2), 0 8px 24px rgba(0,0,0,0.15);
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
    .stream-day-stats { display: flex; gap: 0.5rem; }
    .stat-chip {
      font-size: 0.7rem;
      font-family: var(--mono);
      color: var(--text-3);
      background: var(--bg);
      padding: 0.2rem 0.6rem;
      border-radius: 99px;
      border: 1px solid var(--border);
    }
    .stat-chip-today {
      color: var(--accent);
      border-color: var(--accent);
      background: var(--accent-dim);
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
    .type-pill.type-feat { color: #34d399; border-color: rgba(52,211,153,0.2); }
    .type-pill.type-fix { color: #fb7185; border-color: rgba(251,113,133,0.2); }
    .type-pill.type-content { color: #38bdf8; border-color: rgba(56,189,248,0.2); }
    .type-pill.type-refactor { color: #a78bfa; border-color: rgba(167,139,250,0.2); }
    .type-pill.type-docs { color: #f59e0b; border-color: rgba(245,158,11,0.2); }
    .type-pill.type-chore { color: var(--text-4); }

    .stream-day-repos { display: flex; flex-direction: column; gap: 1rem; }
    .stream-repo { padding-left: 1rem; border-left: 2px solid var(--border); }
    .stream-repo-head { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; }
    .stream-repo-name { font-family: var(--mono); font-size: 0.8rem; font-weight: 600; color: var(--accent); }
    .stream-repo-count {
      font-size: 0.6rem; font-family: var(--mono); color: var(--text-4);
      background: var(--bg); padding: 0.1rem 0.4rem; border-radius: 99px; border: 1px solid var(--border-subtle);
    }
    .stream-commit {
      display: flex; align-items: baseline; gap: 0.5rem; padding: 0.2rem 0; font-size: 0.8rem; line-height: 1.4;
    }
    .commit-hash { font-family: var(--mono); font-size: 0.7rem; color: var(--text-4); flex-shrink: 0; }
    .commit-type {
      font-family: var(--mono); font-size: 0.6rem; padding: 0.05rem 0.35rem; border-radius: 3px;
      flex-shrink: 0; background: var(--bg); border: 1px solid var(--border-subtle);
    }
    .commit-type.type-feat { color: #34d399; border-color: rgba(52,211,153,0.15); }
    .commit-type.type-fix { color: #fb7185; border-color: rgba(251,113,133,0.15); }
    .commit-type.type-content { color: #38bdf8; border-color: rgba(56,189,248,0.15); }
    .commit-type.type-refactor { color: #a78bfa; border-color: rgba(167,139,250,0.15); }
    .commit-type.type-docs { color: #f59e0b; border-color: rgba(245,158,11,0.15); }
    .commit-type.type-chore { color: var(--text-4); }
    .commit-subject { color: var(--text-2); }

    /* ── History (collapsible) ── */
    .history-section {
      margin-top: 3rem;
      border-top: 1px solid var(--border);
      padding-top: 2rem;
    }
    .history-day {
      background: var(--bg-elevated);
      border-radius: var(--radius);
      margin-bottom: 0.5rem;
      overflow: hidden;
      transition: box-shadow 0.2s ease;
      box-shadow: 0 1px 2px rgba(0,0,0,0.15);
    }
    .history-day[open] {
      box-shadow: 0 0 0 1px var(--accent-dim), 0 4px 16px rgba(0,0,0,0.2);
      margin-bottom: 1rem;
    }
    .history-summary {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.5rem;
      cursor: pointer;
      list-style: none;
      user-select: none;
      transition: background 0.15s ease;
    }
    .history-summary::-webkit-details-marker { display: none; }
    .history-summary::before {
      content: "\\25B6";
      font-size: 0.6rem;
      color: var(--text-4);
      transition: transform 0.2s ease;
      flex-shrink: 0;
    }
    .history-day[open] .history-summary::before {
      transform: rotate(90deg);
      color: var(--accent);
    }
    .history-summary:hover { background: var(--bg-subtle); }
    .history-date {
      font-family: var(--mono);
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text);
      min-width: 110px;
      flex-shrink: 0;
    }
    .history-stats {
      display: flex;
      gap: 0.4rem;
      flex-shrink: 0;
    }
    .history-repos-preview {
      font-size: 0.7rem;
      color: var(--text-4);
      font-family: var(--mono);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .history-detail {
      padding: 0 1.5rem 1.5rem 2.5rem;
    }

    /* ── Horizontal bar charts ── */
    .charts-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }
    .hbar-chart {
      background: var(--bg-elevated);
      border-radius: var(--radius);
      padding: 2rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.2), 0 4px 16px rgba(0,0,0,0.12);
    }
    .hbar-chart h3 {
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--text-2);
      margin-bottom: 1.25rem;
      font-family: var(--sans);
      letter-spacing: -0.01em;
    }
    .hbar-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.6rem;
    }
    .hbar-label {
      font-family: var(--mono);
      font-size: 0.7rem;
      color: var(--text-3);
      min-width: 100px;
      text-align: right;
      flex-shrink: 0;
    }
    .hbar-track {
      flex: 1;
      height: 10px;
      background: transparent;
      border-radius: 99px;
      overflow: hidden;
      position: relative;
    }
    .hbar-track::before {
      content: "";
      position: absolute;
      inset: 0;
      background: var(--border-subtle);
      border-radius: 99px;
    }
    .hbar-fill {
      height: 100%;
      border-radius: 99px;
      opacity: 0.85;
      transition: width 0.5s var(--ease);
      position: relative;
      z-index: 1;
    }
    .hbar-row:hover .hbar-fill {
      opacity: 1;
    }
    .hbar-value {
      font-family: var(--mono);
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--text-3);
      min-width: 30px;
      flex-shrink: 0;
    }

    /* ── Feat/Fix ratio bar ── */
    .ratio-chart {
      background: var(--bg-elevated);
      border-radius: var(--radius);
      padding: 2rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.2), 0 4px 16px rgba(0,0,0,0.12);
    }
    .ratio-chart h3 {
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--text-2);
      margin-bottom: 1.25rem;
      font-family: var(--sans);
      letter-spacing: -0.01em;
    }
    .ratio-row {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .ratio-bar {
      display: flex;
      flex: 1;
      height: 8px;
      border-radius: 99px;
      overflow: hidden;
    }
    .ratio-feat { background: #34d399; }
    .ratio-fix { background: #fb7185; }
    .ratio-label {
      font-family: var(--mono);
      font-size: 0.75rem;
      white-space: nowrap;
      flex-shrink: 0;
    }
    .ratio-label-feat { color: #34d399; }
    .ratio-label-fix { color: #fb7185; }

    /* ── Weekly reports ── */
    .weekly-section {
      margin-top: 3rem;
      border-top: 1px solid var(--border);
      padding-top: 2rem;
    }

    @media (max-width: 640px) {
      .stream-day { padding: 1.25rem; }
      .stream-day-header { flex-direction: column; gap: 0.4rem; }
      .chart-grid-wrapper { height: 120px; }
      .chart-col:not(:nth-child(7n+1)) .chart-label { visibility: hidden; }
      .stream-commit { flex-wrap: wrap; }
      .history-summary { flex-wrap: wrap; gap: 0.5rem; padding: 0.75rem 1rem; }
      .history-repos-preview { display: none; }
      .history-detail { padding: 0 1rem 1rem 1.5rem; }
      .charts-row { grid-template-columns: 1fr; }
      .hbar-label { min-width: 70px; }
      .stream-totals { gap: 2rem; }
      .stream-total-num { font-size: 1.8rem; }
      .ratio-row { flex-direction: column; gap: 0.5rem; align-items: stretch; }
      .ratio-label { text-align: center; }
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
          <h3>Commit activity <span class="chart-subtitle">&mdash; last 30 days</span></h3>
          <div class="chart-grid-wrapper">
            <div class="chart-gridlines">
              <div class="chart-gridline"></div>
              <div class="chart-gridline"></div>
              <div class="chart-gridline"></div>
            </div>
            <div class="chart-grid">
${chartBars}
            </div>
          </div>
        </div>

        <div class="charts-row">
          <div class="hbar-chart">
            <h3>Commits by repo</h3>
${repoBars}
          </div>
          <div class="hbar-chart">
            <h3>Commits by type</h3>
${typeBars}
          </div>
        </div>


        <div class="ratio-chart">
          <h3>Feature / Fix ratio</h3>
          <div class="ratio-row">
            <span class="ratio-label ratio-label-feat">feat ${featCount} (${featPct}%)</span>
            <div class="ratio-bar">
              <div class="ratio-feat" style="width:${featPct}%"></div>
              <div class="ratio-fix" style="width:${fixPct}%"></div>
            </div>
            <span class="ratio-label ratio-label-fix">fix ${fixCount} (${fixPct}%)</span>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-header">
          <h2>Today</h2>
        </div>
${todayHtml}
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="history-section">
          <div class="section-header">
            <h2>History</h2>
            <span class="section-count">Last ${HISTORY_DAYS} days</span>
          </div>
${historyHtml}
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="weekly-section">
          <div class="section-header">
            <h2>Weekly Reports</h2>
            <span class="section-count">Published Fridays</span>
          </div>
          <div class="archive-list">
${weeklyReportsHtml}
          </div>
        </div>
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
  console.log(
    `Today: ${todayData ? todayData.stats.total + " commits" : "no data"}, History: ${historyData.length} days`
  );
  console.log(`Total: ${totalDays} days, ${totalCommits} commits, ${allRepos.size} repos`);
}

if (require.main === module) {
  generate();
}

module.exports = { generate };
