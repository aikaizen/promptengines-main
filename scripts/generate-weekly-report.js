/**
 * Weekly Build Stream Report Generator (v2)
 *
 * Reads daily .data-*.json files for a given ISO week and generates
 * a rich analytics report at labnotes/build-stream/YYYY-W##.html.
 *
 * Features:
 *   - SVG sparklines, donut charts, horizontal bar charts
 *   - Week-over-week comparison with delta indicators
 *   - Trailing trend analysis (14-day, 28-day)
 *   - Auto-generated observations and content suggestions
 *   - Repo concentration index (HHI)
 *   - Author concentration (Gini coefficient)
 *   - Feature/fix health ratio
 *   - Anomaly detection
 *
 * Usage:
 *   node scripts/generate-weekly-report.js            # current week
 *   node scripts/generate-weekly-report.js 2026-W11   # specific week
 *   node scripts/generate-weekly-report.js --force     # overwrite existing
 *
 * No external dependencies — uses only Node built-ins + local analytics lib.
 */

const fs = require("fs");
const path = require("path");
const analytics = require("./lib/analytics");

const STREAM_DIR = path.join(__dirname, "..", "labnotes", "build-stream");

// ---------------------------------------------------------------------------
// ISO week utilities
// ---------------------------------------------------------------------------

function getISOWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return { year: d.getUTCFullYear(), week: weekNo };
}

function getWeekMonday(isoYear, isoWeek) {
  const jan4 = new Date(Date.UTC(isoYear, 0, 4));
  const dayOfWeek = jan4.getUTCDay() || 7;
  const mondayOfWeek1 = new Date(jan4);
  mondayOfWeek1.setUTCDate(jan4.getUTCDate() - dayOfWeek + 1);
  const targetMonday = new Date(mondayOfWeek1);
  targetMonday.setUTCDate(mondayOfWeek1.getUTCDate() + (isoWeek - 1) * 7);
  return targetMonday;
}

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

function parseWeekArg(arg) {
  const match = arg.match(/^(\d{4})-W(\d{2})$/);
  if (!match) return null;
  return { year: parseInt(match[1], 10), week: parseInt(match[2], 10) };
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
    month: "short", day: "numeric", year: "numeric", timeZone: "UTC",
  });
}

function formatDayOfWeek(dateStr) {
  const d = new Date(dateStr + "T12:00:00Z");
  return d.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" });
}

function formatWeekRange(weekDates, daysWithData) {
  const first = weekDates[0];
  // Use last day with data if partial week
  const lastIdx = Math.min(daysWithData > 0 ? 6 : 0, 6);
  const last = weekDates[lastIdx];
  const d1 = new Date(first + "T12:00:00Z");
  const d2 = new Date(last + "T12:00:00Z");
  const m1 = d1.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
  const m2 = d2.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
  return `${m1}\u2013${m2}`;
}

function estimateReadTime(html) {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  const words = text.split(" ").filter(Boolean).length;
  return Math.max(3, Math.ceil(words / 200));
}

function fmtNum(n) {
  return Number.isFinite(n) ? (Number.isInteger(n) ? String(n) : n.toFixed(1)) : "0";
}

function fmtPct(n) {
  return Number.isFinite(n) ? Math.round(n * 100) + "%" : "0%";
}

function deltaArrow(delta) {
  if (delta.direction === "up") return "\u25B2";
  if (delta.direction === "down") return "\u25BC";
  return "\u25CF";
}

function deltaClass(delta) {
  if (delta.direction === "up") return "delta-up";
  if (delta.direction === "down") return "delta-down";
  return "delta-flat";
}

// ---------------------------------------------------------------------------
// SVG chart generators
// ---------------------------------------------------------------------------

const REPO_COLORS = ["#2dd4bf", "#34d399", "#38bdf8", "#818cf8", "#f59e0b", "#fb7185", "#a78bfa", "#22d3ee"];
const TYPE_COLORS = {
  feat: "#34d399", fix: "#fb7185", content: "#38bdf8",
  docs: "#f59e0b", chore: "#818cf8", refactor: "#a78bfa",
  other: "#6b7280", style: "#2dd4bf", test: "#fb923c",
};

function getTypeColor(type) {
  return TYPE_COLORS[type] || "#6b7280";
}

/**
 * SVG sparkline — daily commits for the week.
 */
function svgSparkline(dailyCounts, weekDates) {
  const w = 280;
  const h = 60;
  const pad = 8;
  const max = Math.max(...dailyCounts, 1);
  const n = dailyCounts.length;
  const stepX = (w - pad * 2) / (n - 1 || 1);

  const points = dailyCounts.map((v, i) => ({
    x: pad + i * stepX,
    y: h - pad - ((v / max) * (h - pad * 2)),
  }));

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const areaD = pathD + ` L ${points[n - 1].x.toFixed(1)},${h - pad} L ${points[0].x.toFixed(1)},${h - pad} Z`;

  const dots = points.map((p, i) => {
    const isMax = dailyCounts[i] === max && dailyCounts[i] > 0;
    return `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${isMax ? 4 : 3}" fill="${isMax ? "var(--accent)" : "#38bdf8"}" opacity="${dailyCounts[i] === 0 ? 0.2 : 0.9}"><title>${weekDates[i]}: ${dailyCounts[i]}</title></circle>`;
  }).join("\n      ");

  const dayLabels = weekDates.map((d, i) => {
    const day = ["M", "T", "W", "T", "F", "S", "S"][i];
    return `<text x="${points[i].x.toFixed(1)}" y="${h}" text-anchor="middle" fill="var(--text-4)" font-size="8" font-family="var(--mono)">${day}</text>`;
  }).join("\n      ");

  return `<svg viewBox="0 0 ${w} ${h + 8}" class="sparkline-svg">
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.25"/>
          <stop offset="100%" stop-color="#38bdf8" stop-opacity="0.03"/>
        </linearGradient>
      </defs>
      <path d="${areaD}" fill="url(#sparkGrad)"/>
      <path d="${pathD}" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      ${dots}
      ${dayLabels}
    </svg>`;
}

/**
 * SVG horizontal bar chart for repos.
 */
function svgRepoBarChart(repos, dominantTypes) {
  const barH = 28;
  const labelW = 140;
  const valueW = 40;
  const gap = 6;
  const chartW = 500;
  const maxCount = repos.length > 0 ? repos[0][1] : 1;
  const totalH = repos.length * (barH + gap);

  const bars = repos.map(([repo, count], i) => {
    const y = i * (barH + gap);
    const barW = Math.max(2, (count / maxCount) * (chartW - labelW - valueW - 20));
    const color = getTypeColor(dominantTypes[repo] || "other");
    const shortRepo = repo.length > 18 ? repo.slice(0, 17) + "\u2026" : repo;
    return `
      <g transform="translate(0, ${y})">
        <text x="${labelW - 8}" y="${barH / 2 + 4}" text-anchor="end" fill="var(--text-3)" font-size="11" font-family="var(--mono)">${esc(shortRepo)}</text>
        <rect x="${labelW}" y="2" width="${barW.toFixed(1)}" height="${barH - 4}" rx="4" fill="${color}" opacity="0.8"/>
        <text x="${labelW + barW + 8}" y="${barH / 2 + 4}" fill="var(--text-2)" font-size="12" font-weight="600" font-family="var(--mono)">${count}</text>
      </g>`;
  }).join("");

  return `<svg viewBox="0 0 ${chartW} ${totalH}" class="repo-bar-svg">
      ${bars}
    </svg>`;
}

/**
 * SVG donut chart for commit types.
 */
function svgDonutChart(types, total) {
  const cx = 80;
  const cy = 80;
  const r = 60;
  const innerR = 38;
  const size = 160;

  if (total === 0 || types.length === 0) {
    return `<svg viewBox="0 0 ${size} ${size}" class="donut-svg">
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--border)" stroke-width="${r - innerR}"/>
    </svg>`;
  }

  let startAngle = -90; // Start from top
  const segments = types.map(([type, count]) => {
    const pct = count / total;
    const angle = pct * 360;
    const endAngle = startAngle + angle;

    // SVG arc calculations
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);
    const ix1 = cx + innerR * Math.cos(startRad);
    const iy1 = cy + innerR * Math.sin(startRad);
    const ix2 = cx + innerR * Math.cos(endRad);
    const iy2 = cy + innerR * Math.sin(endRad);
    const largeArc = angle > 180 ? 1 : 0;

    const color = getTypeColor(type);
    const d = `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} L ${ix2.toFixed(2)} ${iy2.toFixed(2)} A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix1.toFixed(2)} ${iy1.toFixed(2)} Z`;

    startAngle = endAngle;

    return `<path d="${d}" fill="${color}" opacity="0.85"><title>${type}: ${count} (${Math.round(pct * 100)}%)</title></path>`;
  }).join("\n      ");

  return `<svg viewBox="0 0 ${size} ${size}" class="donut-svg">
      ${segments}
      <text x="${cx}" y="${cy - 4}" text-anchor="middle" fill="var(--text)" font-size="20" font-weight="800" font-family="var(--sans)">${total}</text>
      <text x="${cx}" y="${cy + 12}" text-anchor="middle" fill="var(--text-4)" font-size="8" font-family="var(--mono)">COMMITS</text>
    </svg>`;
}

/**
 * SVG trend line (14-day trailing).
 */
function svgTrendLine(trailingCounts, trailingDates) {
  const w = 400;
  const h = 80;
  const pad = 8;
  const n = trailingCounts.length;
  if (n < 2) return "";

  const max = Math.max(...trailingCounts, 1);
  const stepX = (w - pad * 2) / (n - 1);

  const points = trailingCounts.map((v, i) => ({
    x: pad + i * stepX,
    y: h - pad - ((v / max) * (h - pad * 2)),
  }));

  // Moving average
  const ma = analytics.movingAverage(trailingCounts, 3);
  const maPoints = ma.map((v, i) => ({
    x: pad + i * stepX,
    y: h - pad - ((v / max) * (h - pad * 2)),
  }));

  const rawPath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const maPath = maPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

  // Area under raw line
  const areaD = rawPath + ` L ${points[n - 1].x.toFixed(1)},${h - pad} L ${points[0].x.toFixed(1)},${h - pad} Z`;

  // Label every 7th day + last
  const labels = trailingDates.map((d, i) => {
    if (i % 7 !== 0 && i !== n - 1) return "";
    const dateObj = new Date(d + "T12:00:00Z");
    const label = `${dateObj.getUTCMonth() + 1}/${dateObj.getUTCDate()}`;
    return `<text x="${points[i].x.toFixed(1)}" y="${h + 6}" text-anchor="middle" fill="var(--text-4)" font-size="7" font-family="var(--mono)">${label}</text>`;
  }).filter(Boolean).join("\n      ");

  return `<svg viewBox="0 0 ${w} ${h + 10}" class="trend-svg">
      <defs>
        <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--accent)" stop-opacity="0.15"/>
          <stop offset="100%" stop-color="var(--accent)" stop-opacity="0.02"/>
        </linearGradient>
      </defs>
      <path d="${areaD}" fill="url(#trendGrad)"/>
      <path d="${rawPath}" fill="none" stroke="var(--accent)" stroke-width="1.5" stroke-linecap="round" opacity="0.5"/>
      <path d="${maPath}" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      ${labels}
    </svg>`;
}

// ---------------------------------------------------------------------------
// Auto-generated analysis
// ---------------------------------------------------------------------------

function generateObservations(agg, prevAgg, trailing14) {
  const observations = [];

  // 1. Volume trend
  const delta = analytics.weekOverWeekDelta(agg.totalCommits, prevAgg.totalCommits);
  if (delta.direction === "up" && Math.abs(delta.percent) > 15) {
    observations.push(`Commit volume increased ${Math.round(Math.abs(delta.percent))}% week-over-week (${prevAgg.totalCommits} to ${agg.totalCommits}), indicating accelerating development velocity.`);
  } else if (delta.direction === "down" && Math.abs(delta.percent) > 15) {
    observations.push(`Commit volume decreased ${Math.round(Math.abs(delta.percent))}% week-over-week (${prevAgg.totalCommits} to ${agg.totalCommits}).`);
  } else {
    observations.push(`Commit volume held steady at ${agg.totalCommits} commits (${delta.direction === "flat" ? "unchanged" : Math.round(Math.abs(delta.percent)) + "% " + delta.direction} from last week).`);
  }

  // 2. Peak day analysis
  if (agg.peakDay) {
    const peakDow = formatDayOfWeek(agg.peakDay);
    const peakShare = ((agg.peakCount / agg.totalCommits) * 100).toFixed(0);
    if (agg.peakCount > agg.dailyAverage * 1.5) {
      observations.push(`${peakDow} (${agg.peakDay}) was a significant spike day with ${agg.peakCount} commits (${peakShare}% of the week's total), more than 1.5x the daily average.`);
    }
  }

  // 3. Repo concentration
  const hhi = analytics.herfindahlIndex(agg.byRepoObj);
  if (hhi > 0.4) {
    const topRepo = agg.byRepo[0];
    observations.push(`Development was heavily focused: ${topRepo[0]} accounted for ${Math.round((topRepo[1] / agg.totalCommits) * 100)}% of all commits. HHI of ${hhi.toFixed(2)} indicates concentrated effort.`);
  } else if (hhi < 0.2) {
    observations.push(`Work was distributed across ${agg.activeRepos} repos (HHI ${hhi.toFixed(2)}), suggesting parallel workstreams.`);
  }

  // 4. Feature/fix ratio
  const healthRatio = analytics.featureFixHealthRatio(agg.byTypeObj);
  const featCount = agg.byTypeObj.feat || 0;
  const fixCount = agg.byTypeObj.fix || 0;
  if (featCount > 0 && fixCount > 0) {
    if (healthRatio > 0.8) {
      observations.push(`Feature-heavy week: ${featCount} feat vs ${fixCount} fix commits (${Math.round(healthRatio * 100)}% build ratio). Active construction phase.`);
    } else if (healthRatio < 0.5) {
      observations.push(`Fix-dominant week: ${fixCount} fix vs ${featCount} feat commits. Stabilization phase detected.`);
    }
  }

  // 5. Repo focus shifts
  if (prevAgg.totalCommits > 0) {
    const shifts = analytics.repoFocusShifts(agg, prevAgg);
    const gained = shifts.filter((s) => s.direction === "gained");
    const lost = shifts.filter((s) => s.direction === "lost");
    if (gained.length > 0) {
      const top = gained[0];
      observations.push(`${top.repo} gained significant focus share this week (${Math.round(top.thisShare * 100)}% vs ${Math.round(top.lastShare * 100)}% last week).`);
    }
    if (lost.length > 0) {
      const top = lost[0];
      observations.push(`${top.repo} saw reduced attention (${Math.round(top.thisShare * 100)}% share, down from ${Math.round(top.lastShare * 100)}%).`);
    }
  }

  return observations.slice(0, 5);
}

function generateContentSuggestions(agg) {
  const suggestions = [];

  for (const [repo, count] of agg.byRepo.slice(0, 4)) {
    if (count < 3) continue;
    const dominant = agg.repoDominantType[repo] || "other";

    // Analyze commit subjects for patterns
    const repoCommits = agg.allCommits.filter((c) => c.repo === repo);
    const subjects = repoCommits.map((c) => c.subject.toLowerCase());

    if (dominant === "feat") {
      const keywords = extractKeywords(subjects);
      if (keywords.length > 0) {
        suggestions.push(`Based on ${count} ${repo} commits (primarily feat), consider writing about ${keywords.slice(0, 2).join(" and ")}.`);
      }
    } else if (dominant === "fix") {
      suggestions.push(`${repo} had ${count} commits (primarily fix). A stability/hardening case study could capture lessons learned.`);
    } else if (dominant === "content") {
      suggestions.push(`${repo} had ${count} content commits. Consider a writing process or editorial workflow article.`);
    }
  }

  // General suggestions based on type distribution
  if ((agg.byTypeObj.refactor || 0) > 3) {
    suggestions.push("Multiple refactoring commits detected. An architecture evolution article could document the reasoning.");
  }
  if (agg.activeRepos >= 4) {
    suggestions.push(`${agg.activeRepos} active repos in one week. A cross-project coordination patterns article could be valuable.`);
  }

  return suggestions.slice(0, 5);
}

function extractKeywords(subjects) {
  const stopwords = new Set(["the", "a", "an", "and", "or", "for", "to", "in", "of", "with", "add", "fix", "update", "remove", "use", "from", "by", "on", "is", "it", "at", "as", "be", "all", "new", "get"]);
  const freq = {};
  for (const s of subjects) {
    const words = s.replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter((w) => w.length > 3 && !stopwords.has(w));
    for (const w of words) {
      freq[w] = (freq[w] || 0) + 1;
    }
  }
  return Object.entries(freq)
    .filter(([, n]) => n >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([w]) => w);
}

function generateExecutiveSummary(agg, prevAgg, weekRange) {
  const delta = analytics.weekOverWeekDelta(agg.totalCommits, prevAgg.totalCommits);
  const topRepos = agg.byRepo.slice(0, 3).map(([r, n]) => `${r} (${n})`).join(", ");
  const healthRatio = analytics.featureFixHealthRatio(agg.byTypeObj);

  let trend = "";
  if (delta.direction === "up") {
    trend = `up ${Math.round(Math.abs(delta.percent))}% from last week`;
  } else if (delta.direction === "down") {
    trend = `down ${Math.round(Math.abs(delta.percent))}% from last week`;
  } else {
    trend = "steady from last week";
  }

  const partial = agg.daysWithData < 7 ? ` across ${agg.daysWithData} active days (partial week)` : ` across ${agg.daysWithData} active days`;

  return `${agg.totalCommits} commits${partial}, ${trend}. ${agg.activeRepos} repos active. Top contributors: ${topRepos}. Feature/fix health ratio: ${Math.round(healthRatio * 100)}%. Peak day: ${agg.peakDay ? formatDayOfWeek(agg.peakDay) : "N/A"} with ${agg.peakCount} commits.`;
}

// ---------------------------------------------------------------------------
// HTML generation
// ---------------------------------------------------------------------------

function generateHTML(isoYear, isoWeek, weekDates, agg, prevAgg, trailing14) {
  const weekLabel = `Week ${isoWeek}, ${isoYear}`;
  const weekRange = formatWeekRange(weekDates, agg.daysWithData);
  const lastDateWithData = Object.entries(agg.byDay).filter(([, c]) => c > 0).sort().pop();
  const reportDate = lastDateWithData ? formatDateLong(lastDateWithData[0]) : formatDateLong(weekDates[6]);
  const isPartialWeek = agg.daysWithData < 7;

  // Compute analytics
  const hhi = analytics.herfindahlIndex(agg.byRepoObj);
  const hhiLabel = hhi > 0.4 ? "Focused" : hhi > 0.2 ? "Balanced" : "Distributed";
  const cv = analytics.coefficientOfVariation(agg.dailyCounts.filter((c) => c > 0));
  const consistencyScore = Math.max(0, Math.round((1 - cv) * 100));
  const healthRatio = analytics.featureFixHealthRatio(agg.byTypeObj);
  const gini = analytics.giniCoefficient(Object.values(agg.byAuthorObj));

  // Deltas
  const totalDelta = analytics.weekOverWeekDelta(agg.totalCommits, prevAgg.totalCommits);
  const repoDelta = analytics.weekOverWeekDelta(agg.activeRepos, prevAgg.activeRepos);
  const avgDelta = analytics.weekOverWeekDelta(agg.dailyAverage, prevAgg.dailyAverage);

  // Trailing 14-day data
  const trailing14Counts = trailing14.dailyCounts;
  const trailing14Dates = Object.keys(trailing14.byDay).sort();
  const trailing14Avg = analytics.mean(trailing14Counts.filter((c) => c > 0));

  // Trailing 28-day regression (4-week trend)
  const trailing28 = analytics.getTrailingData(STREAM_DIR, 28, weekDates[6]);
  const trailing28Counts = trailing28.dailyCounts;
  const regressionPoints = trailing28Counts.map((y, x) => ({ x, y }));
  const regression = analytics.linearRegression(regressionPoints);
  const trendDirection = regression.slope > 0.3 ? "accelerating" : regression.slope < -0.3 ? "decelerating" : "stable";

  // Repo focus shifts
  const focusShifts = analytics.repoFocusShifts(agg, prevAgg);

  // Observations and suggestions
  const observations = generateObservations(agg, prevAgg, trailing14);
  const suggestions = generateContentSuggestions(agg);
  const execSummary = generateExecutiveSummary(agg, prevAgg, weekRange);

  // Anomaly detection on trailing data
  const anomalies = analytics.detectAnomalies(trailing14Counts, 1.8);

  // Navigation
  const prevWeek = isoWeek > 1 ? isoWeek - 1 : 52;
  const prevYear = isoWeek > 1 ? isoYear : isoYear - 1;
  const prevWeekFile = `${prevYear}-W${String(prevWeek).padStart(2, "0")}.html`;
  const prevWeekExists = fs.existsSync(path.join(STREAM_DIR, prevWeekFile));
  const navPrev = prevWeekExists ? `<a href="./${esc(prevWeekFile)}">&larr; Week ${prevWeek}</a>` : "";

  // Day names
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // Charts
  const sparklineHtml = svgSparkline(agg.dailyCounts, weekDates);
  const repoBarHtml = svgRepoBarChart(agg.byRepo, agg.repoDominantType);
  const donutHtml = svgDonutChart(agg.byType, agg.totalCommits);
  const trendHtml = svgTrendLine(trailing14Counts, trailing14Dates);

  // Type legend
  const typeLegendHtml = agg.byType.map(([type, count]) => {
    const pct = Math.round((count / agg.totalCommits) * 100);
    const color = getTypeColor(type);
    return `<span class="type-legend-item"><span class="type-dot" style="background:${color}"></span>${esc(type)} ${count} (${pct}%)</span>`;
  }).join("\n              ");

  // Daily breakdown rows
  const dailyTableRows = weekDates.map((dateStr, i) => {
    const count = agg.byDay[dateStr] || 0;
    const isPeak = dateStr === agg.peakDay && count > 0;
    const isWeekend = i >= 5;
    const barWidth = agg.peakCount > 0 ? Math.round((count / agg.peakCount) * 100) : 0;
    const weekendFlag = isWeekend && count > 0 ? ' <span class="weekend-flag">weekend</span>' : "";
    return `              <tr${isPeak ? ' class="peak-row"' : ""}>
                <td class="day-name">${dayNames[i]}</td>
                <td class="day-date">${esc(dateStr)}</td>
                <td class="day-count">${count}${weekendFlag}</td>
                <td class="day-bar-cell"><div class="day-bar" style="width: ${barWidth}%"></div></td>
              </tr>`;
  }).join("\n");

  // Author table rows
  const authorRows = agg.byAuthor.map(([author, count]) => {
    const pct = Math.round((count / agg.totalCommits) * 100);
    const barWidth = Math.round((count / agg.byAuthor[0][1]) * 100);
    return `              <tr>
                <td class="author-name">${esc(author)}</td>
                <td class="author-count">${count}</td>
                <td class="author-pct">${pct}%</td>
                <td class="author-bar-cell"><div class="author-bar" style="width: ${barWidth}%"></div></td>
              </tr>`;
  }).join("\n");

  // WoW comparison table
  const wowRows = [
    ["Total commits", agg.totalCommits, prevAgg.totalCommits, totalDelta],
    ["Active repos", agg.activeRepos, prevAgg.activeRepos, repoDelta],
    ["Daily average", fmtNum(agg.dailyAverage), fmtNum(prevAgg.dailyAverage), avgDelta],
    ["Peak day", agg.peakCount, prevAgg.peakCount, analytics.weekOverWeekDelta(agg.peakCount, prevAgg.peakCount)],
    ["Days active", agg.daysWithData, prevAgg.daysWithData, analytics.weekOverWeekDelta(agg.daysWithData, prevAgg.daysWithData)],
    ["Health ratio", fmtPct(healthRatio), fmtPct(analytics.featureFixHealthRatio(prevAgg.byTypeObj)), { direction: healthRatio > analytics.featureFixHealthRatio(prevAgg.byTypeObj) ? "up" : healthRatio < analytics.featureFixHealthRatio(prevAgg.byTypeObj) ? "down" : "flat", percent: 0 }],
  ].map(([label, thisVal, lastVal, delta]) => {
    const arrow = deltaArrow(delta);
    const cls = deltaClass(delta);
    return `              <tr>
                <td class="wow-label">${esc(String(label))}</td>
                <td class="wow-this">${esc(String(thisVal))}</td>
                <td class="wow-last">${esc(String(lastVal))}</td>
                <td class="wow-delta ${cls}"><span class="delta-arrow">${arrow}</span> ${typeof delta.percent === "number" ? Math.round(Math.abs(delta.percent)) + "%" : ""}</td>
              </tr>`;
  }).join("\n");

  // Observations HTML
  const obsHtml = observations.map((o) => `            <li>${esc(o)}</li>`).join("\n");

  // Suggestions HTML
  const sugHtml = suggestions.length > 0
    ? suggestions.map((s) => `            <li>${esc(s)}</li>`).join("\n")
    : "            <li>Insufficient activity for targeted suggestions this week.</li>";

  // Focus shifts HTML
  const shiftRows = focusShifts
    .filter((s) => s.direction !== "stable")
    .slice(0, 5)
    .map((s) => {
      const arrow = s.direction === "gained" ? "\u25B2" : "\u25BC";
      const cls = s.direction === "gained" ? "delta-up" : "delta-down";
      return `              <tr>
                <td class="shift-repo">${esc(s.repo)}</td>
                <td class="shift-this">${s.thisCount} (${Math.round(s.thisShare * 100)}%)</td>
                <td class="shift-last">${s.lastCount} (${Math.round(s.lastShare * 100)}%)</td>
                <td class="shift-delta ${cls}">${arrow} ${Math.round(Math.abs(s.delta) * 100)}pp</td>
              </tr>`;
    }).join("\n");

  // Structured summary
  const structuredSummary = `week_${isoWeek}_summary:
  period: ${weekDates[0]} to ${weekDates[6]}${isPartialWeek ? " (partial)" : ""}
  total_commits: ${agg.totalCommits}
  active_repos: ${agg.activeRepos}
  days_with_data: ${agg.daysWithData}
  daily_average: ${fmtNum(agg.dailyAverage)}
  daily_stddev: ${fmtNum(agg.dailyStddev)}
  consistency_score: ${consistencyScore}%
  health_ratio: ${fmtPct(healthRatio)}
  repo_concentration: ${hhi.toFixed(3)} (${hhiLabel})
  author_gini: ${gini.toFixed(3)}
  peak_day: ${agg.peakDay || "none"} (${agg.peakCount} commits)
  trend_28d: ${trendDirection} (slope: ${regression.slope.toFixed(2)})

  wow_delta:
    commits: ${totalDelta.direction} ${Math.round(Math.abs(totalDelta.percent))}%
    repos: ${repoDelta.direction} ${Math.abs(repoDelta.absolute)}
    daily_avg: ${avgDelta.direction} ${Math.round(Math.abs(avgDelta.percent))}%

  by_repo:
${agg.byRepo.map(([r, n]) => `    ${r}: ${n}`).join("\n")}

  by_type:
${agg.byType.map(([t, n]) => `    ${t}: ${n}`).join("\n")}

  by_author:
${agg.byAuthor.map(([a, n]) => `    ${a}: ${n}`).join("\n")}`;

  // Meta description
  const description = `${agg.totalCommits} commits across ${agg.activeRepos} repos. Build stream analytics for ${weekRange}.`;

  // -----------------------------------------------------------------------
  // Full HTML
  // -----------------------------------------------------------------------
  const bodyHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Build Stream: ${esc(weekLabel)} \u2014 Prompt Engines Lab Notes</title>
  <meta name="description" content="${esc(description)}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="../styles.css" />
  <style>
    /* ── Stat Cards ── */
    .stat-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 1rem;
      margin: 2rem 0;
    }
    .stat-card {
      background: var(--bg-elevated);
      border-radius: var(--radius);
      padding: 1.25rem;
      text-align: center;
      box-shadow: 0 1px 3px rgba(0,0,0,0.2);
      position: relative;
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
      font-size: 0.6rem;
      color: var(--text-4);
      font-family: var(--mono);
      letter-spacing: 0.04em;
      margin-top: 0.35rem;
      text-transform: uppercase;
    }
    .stat-card-delta {
      font-size: 0.65rem;
      font-family: var(--mono);
      margin-top: 0.25rem;
    }
    .delta-up { color: #34d399; }
    .delta-down { color: #fb7185; }
    .delta-flat { color: var(--text-4); }
    .delta-arrow { font-size: 0.6em; }

    /* ── Chart containers ── */
    .chart-section {
      background: var(--bg-elevated);
      border-radius: var(--radius);
      padding: 2rem;
      margin: 1.5rem 0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    }
    .chart-section h3 {
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--text-2);
      margin-bottom: 1.25rem;
      font-family: var(--sans);
      letter-spacing: -0.01em;
    }
    .chart-section h3 .chart-sub {
      color: var(--text-4);
      font-weight: 400;
      font-size: 0.8rem;
    }

    .sparkline-svg { width: 100%; max-width: 320px; height: auto; }
    .trend-svg { width: 100%; max-width: 460px; height: auto; }
    .repo-bar-svg { width: 100%; max-width: 520px; height: auto; }
    .donut-svg { width: 160px; height: 160px; }

    /* ── Velocity section ── */
    .velocity-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }
    .velocity-stat {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
      padding: 0.75rem 0;
    }
    .velocity-stat-num {
      font-size: 1.2rem;
      font-weight: 700;
      color: var(--text);
      font-family: var(--sans);
    }
    .velocity-stat-label {
      font-size: 0.6rem;
      color: var(--text-4);
      font-family: var(--mono);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    /* ── Donut + type legend ── */
    .donut-row {
      display: flex;
      align-items: center;
      gap: 2rem;
      flex-wrap: wrap;
    }
    .type-legend {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    .type-legend-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-family: var(--mono);
      font-size: 0.75rem;
      color: var(--text-3);
    }
    .type-dot {
      width: 10px;
      height: 10px;
      border-radius: 3px;
      flex-shrink: 0;
    }

    /* ── Repo bar chart ── */
    .hhi-badge {
      display: inline-block;
      font-family: var(--mono);
      font-size: 0.65rem;
      padding: 0.15rem 0.5rem;
      border-radius: 4px;
      background: var(--bg);
      color: var(--text-3);
      border: 1px solid var(--border);
      margin-left: 0.75rem;
    }

    /* ── Daily table ── */
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
    .weekend-flag {
      font-size: 0.55rem;
      color: var(--text-4);
      background: var(--bg);
      padding: 0.1rem 0.3rem;
      border-radius: 3px;
      margin-left: 0.3rem;
      vertical-align: middle;
    }

    /* ── Author table ── */
    .author-table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
    .author-table th, .author-table td {
      padding: 0.4rem 0.75rem;
      font-family: var(--mono);
      font-size: 0.8rem;
      text-align: left;
      border-bottom: 1px solid var(--border-subtle);
    }
    .author-table th {
      color: var(--text-4);
      font-weight: 500;
      font-size: 0.7rem;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    .author-name { color: var(--text-2); font-weight: 600; }
    .author-count { color: var(--text); text-align: right; min-width: 40px; }
    .author-pct { color: var(--text-4); text-align: right; min-width: 40px; }
    .author-bar-cell { width: 40%; }
    .author-bar {
      height: 6px;
      background: #818cf8;
      border-radius: 3px;
      opacity: 0.7;
    }
    .gini-label {
      font-family: var(--mono);
      font-size: 0.7rem;
      color: var(--text-4);
      margin-top: 0.5rem;
    }

    /* ── WoW table ── */
    .wow-table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
    .wow-table th, .wow-table td {
      padding: 0.5rem 0.75rem;
      font-family: var(--mono);
      font-size: 0.8rem;
      text-align: left;
      border-bottom: 1px solid var(--border-subtle);
    }
    .wow-table th {
      color: var(--text-4);
      font-weight: 500;
      font-size: 0.7rem;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    .wow-label { color: var(--text-3); }
    .wow-this { color: var(--text); font-weight: 600; text-align: right; }
    .wow-last { color: var(--text-4); text-align: right; }
    .wow-delta { text-align: right; font-weight: 600; }

    /* ── Focus shifts table ── */
    .shift-table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
    .shift-table th, .shift-table td {
      padding: 0.4rem 0.75rem;
      font-family: var(--mono);
      font-size: 0.75rem;
      text-align: left;
      border-bottom: 1px solid var(--border-subtle);
    }
    .shift-table th {
      color: var(--text-4);
      font-weight: 500;
      font-size: 0.65rem;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    .shift-repo { color: var(--text-2); font-weight: 600; }
    .shift-this { color: var(--text-3); text-align: right; }
    .shift-last { color: var(--text-4); text-align: right; }
    .shift-delta { text-align: right; font-weight: 600; }

    /* ── Observations / Suggestions ── */
    .obs-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .obs-list li {
      padding: 0.6rem 0;
      border-bottom: 1px solid var(--border-subtle);
      font-size: 0.85rem;
      line-height: 1.5;
      color: var(--text-2);
    }
    .obs-list li:last-child { border-bottom: none; }
    .sug-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .sug-list li {
      padding: 0.5rem 0;
      font-size: 0.8rem;
      line-height: 1.5;
      color: var(--text-3);
      border-bottom: 1px solid var(--border-subtle);
    }
    .sug-list li:last-child { border-bottom: none; }

    /* ── Partial week banner ── */
    .partial-banner {
      background: rgba(245,158,11,0.1);
      border: 1px solid rgba(245,158,11,0.2);
      border-radius: var(--radius);
      padding: 0.6rem 1rem;
      font-family: var(--mono);
      font-size: 0.75rem;
      color: #f59e0b;
      margin-bottom: 1.5rem;
    }

    /* ── Health ratio bar ── */
    .health-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin: 1rem 0;
    }
    .health-bar {
      display: flex;
      flex: 1;
      height: 8px;
      border-radius: 99px;
      overflow: hidden;
    }
    .health-feat { background: #34d399; }
    .health-fix { background: #fb7185; }
    .health-label {
      font-family: var(--mono);
      font-size: 0.7rem;
      white-space: nowrap;
      flex-shrink: 0;
    }

    @media (max-width: 640px) {
      .stat-grid { grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }
      .stat-card { padding: 1rem; }
      .stat-card-num { font-size: 1.5rem; }
      .velocity-grid { grid-template-columns: 1fr; }
      .donut-row { flex-direction: column; align-items: flex-start; }
      .daily-table td, .daily-table th { padding: 0.35rem 0.5rem; font-size: 0.7rem; }
      .chart-section { padding: 1.25rem; }
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
        <span class="read-time-placeholder">-- min read</span>
        <span>Build Stream</span>
      </div>
      <h1>Build Stream: ${esc(weekLabel)}</h1>
      <p class="dek">${esc(execSummary)}</p>

      <article class="content">

${isPartialWeek ? `        <div class="partial-banner">Partial week: data available for ${agg.daysWithData} of 7 days (${weekDates.filter((d) => (agg.byDay[d] || 0) > 0).map((d) => formatDayOfWeek(d)).join(", ")}). Metrics normalized to active days.</div>` : ""}

        <!-- ── Key Metrics ── -->
        <div class="stat-grid">
          <div class="stat-card">
            <div class="stat-card-num">${agg.totalCommits}</div>
            <div class="stat-card-label">Total commits</div>
            <div class="stat-card-delta ${deltaClass(totalDelta)}"><span class="delta-arrow">${deltaArrow(totalDelta)}</span> ${Math.round(Math.abs(totalDelta.percent))}% WoW</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-num">${fmtNum(agg.dailyAverage)}</div>
            <div class="stat-card-label">Daily avg &plusmn; ${fmtNum(agg.dailyStddev)}</div>
            <div class="stat-card-delta ${deltaClass(avgDelta)}"><span class="delta-arrow">${deltaArrow(avgDelta)}</span> ${Math.round(Math.abs(avgDelta.percent))}% WoW</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-num">${agg.activeRepos}</div>
            <div class="stat-card-label">Active repos</div>
            <div class="stat-card-delta ${deltaClass(repoDelta)}"><span class="delta-arrow">${deltaArrow(repoDelta)}</span> ${Math.abs(repoDelta.absolute)} WoW</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-num">${consistencyScore}%</div>
            <div class="stat-card-label">Consistency</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-num">${Math.round(healthRatio * 100)}%</div>
            <div class="stat-card-label">Feat/fix health</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-num">${agg.peakCount}</div>
            <div class="stat-card-label">Peak (${agg.peakDay ? formatDayOfWeek(agg.peakDay) : "N/A"})</div>
          </div>
        </div>

        <!-- ── Velocity Analysis ── -->
        <div class="chart-section">
          <h3>Velocity analysis <span class="chart-sub">\u2014 daily commits</span></h3>
          ${sparklineHtml}
          <div class="velocity-grid">
            <div class="velocity-stat">
              <span class="velocity-stat-num">${fmtNum(agg.totalCommits / Math.max(agg.daysWithData, 1))}</span>
              <span class="velocity-stat-label">Commits / active day</span>
            </div>
            <div class="velocity-stat">
              <span class="velocity-stat-num">${fmtNum(trailing14Avg)}</span>
              <span class="velocity-stat-label">14-day trailing avg</span>
            </div>
            <div class="velocity-stat">
              <span class="velocity-stat-num">${trendDirection}</span>
              <span class="velocity-stat-label">28-day trend (slope: ${regression.slope.toFixed(2)})</span>
            </div>
            <div class="velocity-stat">
              <span class="velocity-stat-num">${fmtNum(analytics.mean(trailing28Counts.filter((c) => c > 0)))}</span>
              <span class="velocity-stat-label">4-week trailing avg</span>
            </div>
          </div>
${trendHtml ? `
          <h3 style="margin-top:1.5rem">14-day trailing <span class="chart-sub">\u2014 3-day moving average</span></h3>
          ${trendHtml}
` : ""}
        </div>

        <!-- ── Repo Focus ── -->
        <div class="chart-section">
          <h3>Repo focus <span class="hhi-badge">${hhiLabel} (HHI ${hhi.toFixed(2)})</span></h3>
          ${repoBarHtml}
${shiftRows ? `
          <h4 style="font-size:0.8rem; color:var(--text-3); margin-top:1.5rem; font-family:var(--sans);">Week-over-week share changes</h4>
          <table class="shift-table">
            <thead>
              <tr>
                <th>Repo</th>
                <th style="text-align:right">This week</th>
                <th style="text-align:right">Last week</th>
                <th style="text-align:right">Delta</th>
              </tr>
            </thead>
            <tbody>
${shiftRows}
            </tbody>
          </table>
` : ""}
        </div>

        <!-- ── Commit Type Distribution ── -->
        <div class="chart-section">
          <h3>Commit type distribution</h3>
          <div class="donut-row">
            ${donutHtml}
            <div class="type-legend">
              ${typeLegendHtml}
            </div>
          </div>
          <div class="health-row" style="margin-top:1.25rem">
            <span class="health-label" style="color:#34d399">feat ${agg.byTypeObj.feat || 0}</span>
            <div class="health-bar">
              <div class="health-feat" style="width:${Math.round(healthRatio * 100)}%"></div>
              <div class="health-fix" style="width:${Math.round((1 - healthRatio) * 100)}%"></div>
            </div>
            <span class="health-label" style="color:#fb7185">fix ${agg.byTypeObj.fix || 0}</span>
          </div>
        </div>

        <!-- ── Daily Breakdown ── -->
        <h2>Daily breakdown</h2>
        <table class="daily-table">
          <thead>
            <tr>
              <th>Day</th>
              <th>Date</th>
              <th style="text-align:right">Commits</th>
              <th>Volume</th>
            </tr>
          </thead>
          <tbody>
${dailyTableRows}
          </tbody>
        </table>

        <!-- ── Author Analysis ── -->
        <div class="chart-section">
          <h3>Author analysis</h3>
          <table class="author-table">
            <thead>
              <tr>
                <th>Author</th>
                <th style="text-align:right">Commits</th>
                <th style="text-align:right">Share</th>
                <th>Volume</th>
              </tr>
            </thead>
            <tbody>
${authorRows}
            </tbody>
          </table>
          <p class="gini-label">Author concentration (Gini): ${gini.toFixed(2)} \u2014 ${gini > 0.5 ? "concentrated" : gini > 0.3 ? "moderate" : "distributed"}</p>
        </div>

        <!-- ── Week-over-Week ── -->
        <div class="chart-section">
          <h3>Week-over-week comparison</h3>
          <table class="wow-table">
            <thead>
              <tr>
                <th>Metric</th>
                <th style="text-align:right">This week</th>
                <th style="text-align:right">Last week</th>
                <th style="text-align:right">Delta</th>
              </tr>
            </thead>
            <tbody>
${wowRows}
            </tbody>
          </table>
        </div>

        <!-- ── Observations ── -->
        <h2>Observations</h2>
        <ul class="obs-list">
${obsHtml}
        </ul>

        <!-- ── Content Suggestions ── -->
        <h2>Content suggestions</h2>
        <ul class="sug-list">
${sugHtml}
        </ul>

        <!-- ── Structured Summary ── -->
        <figure class="figure">
          <div class="visual visual-code">${esc(structuredSummary)}</div>
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
    // Update read time
    (function() {
      var text = document.querySelector('.article').textContent || '';
      var words = text.trim().split(/\\s+/).length;
      var mins = Math.max(3, Math.ceil(words / 200));
      var el = document.querySelector('.read-time-placeholder');
      if (el) el.textContent = mins + ' min read';
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
      console.error(`Invalid week format: ${weekArg}. Expected YYYY-W## (e.g. 2026-W11).`);
      process.exit(1);
    }
    isoYear = parsed.year;
    isoWeek = parsed.week;
  } else {
    const now = new Date();
    const current = getISOWeek(now);
    isoYear = current.year;
    isoWeek = current.week;
  }

  const weekId = `${isoYear}-W${String(isoWeek).padStart(2, "0")}`;
  const outputFile = path.join(STREAM_DIR, `${weekId}.html`);

  console.log(`Generating weekly report for ${weekId}...`);

  if (fs.existsSync(outputFile) && !forceFlag) {
    console.log(`Report already exists: ${outputFile}`);
    console.log("Use --force to overwrite.");
    return;
  }

  const weekDates = getWeekDates(isoYear, isoWeek);
  console.log(`Week dates: ${weekDates[0]} to ${weekDates[6]}`);

  // Aggregate data
  const agg = analytics.aggregateWeekData(STREAM_DIR, weekDates);

  if (agg.totalCommits === 0) {
    console.log("No commit data found for this week. Skipping report generation.");
    return;
  }

  console.log(`Found ${agg.totalCommits} commits across ${agg.activeRepos} repos over ${agg.daysWithData} days.`);

  // Previous week data
  const prevAgg = analytics.getPreviousWeekData(STREAM_DIR, isoYear, isoWeek);
  console.log(`Previous week: ${prevAgg.totalCommits} commits for comparison.`);

  // Trailing 14-day data
  const trailing14 = analytics.getTrailingData(STREAM_DIR, 14, weekDates[6]);
  console.log(`Trailing 14d: ${trailing14.totalCommits} commits.`);

  // Generate HTML
  const html = generateHTML(isoYear, isoWeek, weekDates, agg, prevAgg, trailing14);
  fs.writeFileSync(outputFile, html, "utf-8");
  console.log(`Generated: ${outputFile}`);
}

if (require.main === module) {
  main();
}

module.exports = { main, getISOWeek, getWeekDates };
