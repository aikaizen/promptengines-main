/**
 * Weekly Build Stream Report Generator
 *
 * Reads daily .data-*.json files for a given ISO week and generates
 * a weekly HTML report at labnotes/build-stream/YYYY-W##.html.
 *
 * Usage:
 *   node scripts/generate-weekly-report.js            # current week
 *   node scripts/generate-weekly-report.js 2026-W10   # specific week
 *   node scripts/generate-weekly-report.js --force     # overwrite existing
 *
 * No external dependencies — uses only Node built-ins.
 */

const fs = require("fs");
const path = require("path");

const STREAM_DIR = path.join(__dirname, "..", "labnotes", "build-stream");

// ---------------------------------------------------------------------------
// ISO week utilities
// ---------------------------------------------------------------------------

/**
 * Get ISO week number and year for a given date.
 * ISO weeks start on Monday. Week 1 contains the first Thursday of the year.
 */
function getISOWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  // Set to nearest Thursday: current date + 4 - current day number (Mon=1, Sun=7)
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return { year: d.getUTCFullYear(), week: weekNo };
}

/**
 * Get the Monday date for a given ISO year + week.
 */
function getWeekMonday(isoYear, isoWeek) {
  // Jan 4 is always in ISO week 1
  const jan4 = new Date(Date.UTC(isoYear, 0, 4));
  const dayOfWeek = jan4.getUTCDay() || 7; // Mon=1..Sun=7
  const mondayOfWeek1 = new Date(jan4);
  mondayOfWeek1.setUTCDate(jan4.getUTCDate() - dayOfWeek + 1);
  const targetMonday = new Date(mondayOfWeek1);
  targetMonday.setUTCDate(mondayOfWeek1.getUTCDate() + (isoWeek - 1) * 7);
  return targetMonday;
}

/**
 * Get all dates (Mon-Sun) for a given ISO year + week as YYYY-MM-DD strings.
 */
function getWeekDates(isoYear, isoWeek) {
  const monday = getWeekMonday(isoYear, isoWeek);
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setUTCDate(monday.getUTCDate() + i);
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
}

/**
 * Parse a week string like "2026-W10" into { year, week }.
 */
function parseWeekArg(arg) {
  const match = arg.match(/^(\d{4})-W(\d{2})$/);
  if (!match) return null;
  return { year: parseInt(match[1], 10), week: parseInt(match[2], 10) };
}

// ---------------------------------------------------------------------------
// Data loading
// ---------------------------------------------------------------------------

function loadDataForDate(dateStr) {
  const filePath = path.join(STREAM_DIR, `.data-${dateStr}.json`);
  if (!fs.existsSync(filePath)) return null;
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw);
  } catch (e) {
    console.warn(`Warning: Could not parse ${filePath}: ${e.message}`);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Aggregation
// ---------------------------------------------------------------------------

function aggregateWeekData(weekDates) {
  const dailyData = [];
  const allCommits = [];
  const byRepo = {};
  const byType = {};
  const byAuthor = {};
  const byDay = {};
  let totalCommits = 0;

  for (const dateStr of weekDates) {
    const data = loadDataForDate(dateStr);
    if (!data) continue;

    dailyData.push(data);
    totalCommits += data.stats.total;
    byDay[dateStr] = data.stats.total;

    // Collect all commits
    if (data.commits) {
      allCommits.push(...data.commits);
    }

    // Aggregate by repo
    if (data.stats.byRepo) {
      for (const [repo, count] of Object.entries(data.stats.byRepo)) {
        byRepo[repo] = (byRepo[repo] || 0) + count;
      }
    }

    // Aggregate by type
    if (data.stats.byType) {
      for (const [type, count] of Object.entries(data.stats.byType)) {
        byType[type] = (byType[type] || 0) + count;
      }
    }

    // Aggregate by author
    if (data.stats.byAuthor) {
      for (const [author, count] of Object.entries(data.stats.byAuthor)) {
        byAuthor[author] = (byAuthor[author] || 0) + count;
      }
    }
  }

  // Find peak day
  let peakDay = null;
  let peakCount = 0;
  for (const [day, count] of Object.entries(byDay)) {
    if (count > peakCount) {
      peakCount = count;
      peakDay = day;
    }
  }

  // Sorted entries
  const sortedRepos = Object.entries(byRepo).sort((a, b) => b[1] - a[1]);
  const sortedTypes = Object.entries(byType).sort((a, b) => b[1] - a[1]);
  const sortedAuthors = Object.entries(byAuthor).sort((a, b) => b[1] - a[1]);

  // Dominant type per repo
  const repoDominantType = {};
  for (const commit of allCommits) {
    if (!repoDominantType[commit.repo]) repoDominantType[commit.repo] = {};
    const t = commit.type || "other";
    repoDominantType[commit.repo][t] = (repoDominantType[commit.repo][t] || 0) + 1;
  }
  for (const [repo, types] of Object.entries(repoDominantType)) {
    const sorted = Object.entries(types).sort((a, b) => b[1] - a[1]);
    repoDominantType[repo] = sorted.slice(0, 2).map(([t]) => t).join("/");
  }

  return {
    dailyData,
    allCommits,
    totalCommits,
    byRepo: sortedRepos,
    byType: sortedTypes,
    byAuthor: sortedAuthors,
    byDay,
    peakDay,
    peakCount,
    repoDominantType,
    activeRepos: sortedRepos.length,
    daysWithData: dailyData.length,
  };
}

// ---------------------------------------------------------------------------
// HTML helpers
// ---------------------------------------------------------------------------

function esc(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatDateLong(dateStr) {
  const d = new Date(dateStr + "T12:00:00Z");
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function formatDayOfWeek(dateStr) {
  const d = new Date(dateStr + "T12:00:00Z");
  return d.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" });
}

function formatWeekRange(weekDates) {
  const first = weekDates[0];
  const last = weekDates[6];
  const d1 = new Date(first + "T12:00:00Z");
  const d2 = new Date(last + "T12:00:00Z");
  const m1 = d1.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
  const m2 = d2.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
  return `${m1}–${m2}`;
}

/**
 * Estimate read time in minutes from content length.
 */
function estimateReadTime(html) {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  const words = text.split(" ").filter(Boolean).length;
  return Math.max(2, Math.ceil(words / 200));
}

// ---------------------------------------------------------------------------
// HTML generation
// ---------------------------------------------------------------------------

function generateHTML(isoYear, isoWeek, weekDates, agg) {
  const weekLabel = `Week ${isoWeek}, ${isoYear}`;
  const weekRange = formatWeekRange(weekDates);
  const reportDate = formatDateLong(weekDates[weekDates.length - 1]);

  // Meta description
  const repoNames = agg.byRepo.map(([r]) => r).join(", ");
  const description = `${agg.totalCommits} commits across ${agg.activeRepos} repos. Weekly build stream report for ${weekRange}.`;

  // Repo matrix (visual)
  const matrixHeader = "repo                  commits  dominant_type";
  const matrixRows = agg.byRepo.map(([repo, count]) => {
    const name = repo.padEnd(22);
    const c = String(count).padEnd(9);
    const dt = agg.repoDominantType[repo] || "other";
    return `${name}${c}${dt}`;
  }).join("\n");

  // Daily breakdown table rows
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const dailyTableRows = weekDates.map((dateStr, i) => {
    const count = agg.byDay[dateStr] || 0;
    const isPeak = dateStr === agg.peakDay && count > 0;
    const barWidth = agg.peakCount > 0 ? Math.round((count / agg.peakCount) * 100) : 0;
    return `              <tr${isPeak ? ' class="peak-row"' : ""}>
                <td class="day-name">${dayNames[i]}</td>
                <td class="day-date">${esc(dateStr)}</td>
                <td class="day-count">${count}</td>
                <td class="day-bar-cell"><div class="day-bar" style="width: ${barWidth}%"></div></td>
              </tr>`;
  }).join("\n");

  // Repo chart bars (visual-bars)
  const maxRepoCount = agg.byRepo.length > 0 ? agg.byRepo[0][1] : 1;
  const repoBarsHtml = agg.byRepo.map(([, count]) => {
    const pct = Math.round((count / maxRepoCount) * 100);
    return `<i style="height:${pct}%"></i>`;
  }).join("");
  const repoBarCaption = agg.byRepo.map(([repo, count]) => `${repo} (${count})`).join(", ");

  // Type chart bars (visual-bars)
  const maxTypeCount = agg.byType.length > 0 ? agg.byType[0][1] : 1;
  const typeBarsHtml = agg.byType.map(([, count]) => {
    const pct = Math.round((count / maxTypeCount) * 100);
    return `<i style="height:${pct}%"></i>`;
  }).join("");
  const typeBarCaption = agg.byType.map(([type, count]) => `${type} (${count})`).join(", ");

  // Previous week link
  const prevWeek = isoWeek > 1 ? isoWeek - 1 : 52;
  const prevYear = isoWeek > 1 ? isoYear : isoYear - 1;
  const prevWeekFile = `${prevYear}-W${String(prevWeek).padStart(2, "0")}.html`;
  const prevWeekExists = fs.existsSync(path.join(STREAM_DIR, prevWeekFile));

  // Navigation
  const navPrev = prevWeekExists
    ? `<a href="./${esc(prevWeekFile)}">&larr; Week ${prevWeek}</a>`
    : "";

  // Summary dek
  const topTypes = agg.byType.slice(0, 3).map(([t, n]) => `${t} (${n})`).join(", ");
  const dek = `${agg.totalCommits} commits across ${agg.activeRepos} active repos. ${agg.daysWithData} days with activity. Peak day: ${agg.peakDay ? formatDayOfWeek(agg.peakDay) : "N/A"} with ${agg.peakCount} commits. Top types: ${topTypes}.`;

  const bodyHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Build Stream: ${esc(weekLabel)} — Prompt Engines Lab Notes</title>
  <meta name="description" content="${esc(description)}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="../styles.css" />
  <style>
    .daily-table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; }
    .daily-table th, .daily-table td {
      padding: 0.5rem 0.75rem;
      font-family: var(--mono);
      font-size: 0.8rem;
      text-align: left;
      border-bottom: 1px solid var(--border-subtle);
    }
    .daily-table th {
      color: var(--text-4);
      font-weight: 500;
      font-size: 0.7rem;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    .day-name { font-weight: 600; color: var(--text-2); min-width: 40px; }
    .day-date { color: var(--text-4); min-width: 100px; }
    .day-count { font-weight: 600; color: var(--text); min-width: 50px; text-align: right; }
    .day-bar-cell { width: 50%; }
    .day-bar {
      height: 8px;
      background: linear-gradient(90deg, var(--accent) 0%, rgba(240,77,38,0.5) 100%);
      border-radius: 4px;
      min-width: 2px;
    }
    .peak-row .day-name { color: var(--accent); }
    .peak-row .day-bar {
      box-shadow: 0 0 8px var(--accent-glow);
      background: linear-gradient(90deg, var(--accent) 0%, var(--accent-hover) 100%);
    }
    .stat-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 1.5rem;
      margin: 2rem 0;
    }
    .stat-card {
      background: var(--bg-elevated);
      border-radius: var(--radius);
      padding: 1.25rem;
      text-align: center;
      box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    }
    .stat-card-num {
      font-size: 2rem;
      font-weight: 800;
      color: var(--text);
      font-family: var(--sans);
      letter-spacing: -0.03em;
      line-height: 1.1;
    }
    .stat-card-label {
      font-size: 0.65rem;
      color: var(--text-4);
      font-family: var(--mono);
      letter-spacing: 0.04em;
      margin-top: 0.35rem;
    }
    @media (max-width: 640px) {
      .stat-grid { grid-template-columns: repeat(2, 1fr); gap: 1rem; }
      .daily-table td, .daily-table th { padding: 0.35rem 0.5rem; font-size: 0.7rem; }
    }
  </style>
</head>
<body>
<div class="progress-bar" id="progress-bar"></div>
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

  <main class="article">
    <div class="container">
      <div class="meta-row">
        <span>${esc(reportDate)}</span>
        <span>${estimateReadTime(dek + matrixRows)} min read</span>
        <span>Build Stream</span>
      </div>
      <h1>Build Stream: ${esc(weekLabel)}</h1>
      <p class="dek">${esc(dek)}</p>

      <article class="content">

        <div class="stat-grid">
          <div class="stat-card">
            <div class="stat-card-num">${agg.totalCommits}</div>
            <div class="stat-card-label">Total commits</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-num">${agg.activeRepos}</div>
            <div class="stat-card-label">Active repos</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-num">${agg.daysWithData}</div>
            <div class="stat-card-label">Days active</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-num">${agg.peakCount}</div>
            <div class="stat-card-label">Peak day</div>
          </div>
        </div>

        <h2>Repo activity</h2>

        <figure class="figure">
          <div class="visual visual-matrix">${esc(matrixHeader)}
${esc(matrixRows)}</div>
          <figcaption>Commit volume and dominant type by repo, week of ${esc(weekRange)}.</figcaption>
        </figure>

        <figure class="figure">
          <div class="visual visual-bars">
            ${repoBarsHtml}
          </div>
          <figcaption>Relative commit volume: ${esc(repoBarCaption)}.</figcaption>
        </figure>

        <h2>Daily breakdown</h2>

        <table class="daily-table">
          <thead>
            <tr>
              <th>Day</th>
              <th>Date</th>
              <th>Commits</th>
              <th>Volume</th>
            </tr>
          </thead>
          <tbody>
${dailyTableRows}
          </tbody>
        </table>

        <h2>Commit types</h2>

        <figure class="figure">
          <div class="visual visual-bars">
            ${typeBarsHtml}
          </div>
          <figcaption>Commit type distribution: ${esc(typeBarCaption)}.</figcaption>
        </figure>

        <figure class="figure">
          <div class="visual visual-code">week_${isoWeek}_summary:
  total_commits: ${agg.totalCommits}
  active_repos: ${agg.activeRepos}
  days_with_data: ${agg.daysWithData}
  peak_day: ${agg.peakDay || "none"} (${agg.peakCount} commits)

  by_repo:
${agg.byRepo.map(([r, n]) => `    ${r}: ${n}`).join("\n")}

  by_type:
${agg.byType.map(([t, n]) => `    ${t}: ${n}`).join("\n")}

  by_author:
${agg.byAuthor.map(([a, n]) => `    ${a}: ${n}`).join("\n")}</div>
          <figcaption>Structured summary, week ${isoWeek}.</figcaption>
        </figure>

      </article>

      <nav class="article-nav">
        <a href="./index.html">&larr; Build Stream</a>
        ${navPrev}
      </nav>
    </div>
  </main>

  <footer class="footer">
    <div class="container">&copy; 2026 Prompt Engines &middot; Lab Notes</div>
  </footer>
  <script>
    (function() {
      var bar = document.getElementById('progress-bar');
      function update() {
        var s = document.documentElement;
        var scrolled = s.scrollTop || document.body.scrollTop;
        var total = s.scrollHeight - s.clientHeight;
        bar.style.width = total > 0 ? (scrolled / total * 100) + '%' : '0%';
      }
      window.addEventListener('scroll', update, { passive: true });
      update();
    })();
  </script>
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

  return bodyHtml;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const args = process.argv.slice(2);
  const forceFlag = args.includes("--force");
  const weekArg = args.find((a) => /^\d{4}-W\d{2}$/.test(a));

  let isoYear, isoWeek;

  if (weekArg) {
    const parsed = parseWeekArg(weekArg);
    if (!parsed) {
      console.error(`Invalid week format: ${weekArg}. Expected YYYY-W## (e.g. 2026-W10).`);
      process.exit(1);
    }
    isoYear = parsed.year;
    isoWeek = parsed.week;
  } else {
    // Default to current week
    const now = new Date();
    const current = getISOWeek(now);
    isoYear = current.year;
    isoWeek = current.week;
  }

  const weekId = `${isoYear}-W${String(isoWeek).padStart(2, "0")}`;
  const outputFile = path.join(STREAM_DIR, `${weekId}.html`);

  console.log(`Generating weekly report for ${weekId}...`);

  // Check if report already exists
  if (fs.existsSync(outputFile) && !forceFlag) {
    console.log(`Report already exists: ${outputFile}`);
    console.log("Use --force to overwrite.");
    return;
  }

  // Get the week dates (Mon-Sun)
  const weekDates = getWeekDates(isoYear, isoWeek);
  console.log(`Week dates: ${weekDates[0]} to ${weekDates[6]}`);

  // Aggregate data
  const agg = aggregateWeekData(weekDates);

  if (agg.totalCommits === 0) {
    console.log("No commit data found for this week. Skipping report generation.");
    return;
  }

  console.log(`Found ${agg.totalCommits} commits across ${agg.activeRepos} repos over ${agg.daysWithData} days.`);

  // Generate and write HTML
  const html = generateHTML(isoYear, isoWeek, weekDates, agg);
  fs.writeFileSync(outputFile, html, "utf-8");
  console.log(`Generated: ${outputFile}`);
}

if (require.main === module) {
  main();
}

module.exports = { main, getISOWeek, getWeekDates, aggregateWeekData };
