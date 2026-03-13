/**
 * Analytics Engine for Build Stream
 *
 * Reusable statistical functions and data aggregation helpers
 * for weekly reports and trend analysis.
 *
 * No external dependencies — uses only Node built-ins.
 */

const fs = require("fs");
const path = require("path");

// ---------------------------------------------------------------------------
// Statistical functions
// ---------------------------------------------------------------------------

/**
 * Arithmetic mean.
 */
function mean(arr) {
  if (!arr || arr.length === 0) return 0;
  return arr.reduce((s, v) => s + v, 0) / arr.length;
}

/**
 * Median value.
 */
function median(arr) {
  if (!arr || arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Standard deviation (population).
 */
function stddev(arr) {
  if (!arr || arr.length === 0) return 0;
  const m = mean(arr);
  const variance = arr.reduce((s, v) => s + (v - m) ** 2, 0) / arr.length;
  return Math.sqrt(variance);
}

/**
 * Percentile (0-100). Uses linear interpolation.
 */
function percentile(arr, p) {
  if (!arr || arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(idx);
  const upper = Math.ceil(idx);
  if (lower === upper) return sorted[lower];
  const weight = idx - lower;
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

/**
 * Coefficient of variation (stddev / mean).
 * Returns 0 if mean is 0.
 */
function coefficientOfVariation(arr) {
  const m = mean(arr);
  if (m === 0) return 0;
  return stddev(arr) / m;
}

/**
 * Herfindahl-Hirschman Index — measures concentration.
 * Input: object or array of counts.
 * Returns value between 0 and 1 (1 = maximally concentrated).
 */
function herfindahlIndex(counts) {
  const values = Array.isArray(counts) ? counts : Object.values(counts);
  const total = values.reduce((s, v) => s + v, 0);
  if (total === 0) return 0;
  return values.reduce((s, v) => s + (v / total) ** 2, 0);
}

/**
 * Gini coefficient — measures inequality.
 * Returns value between 0 (perfect equality) and 1 (maximum inequality).
 */
function giniCoefficient(values) {
  if (!values || values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  const m = mean(sorted);
  if (m === 0) return 0;
  let sum = 0;
  for (let i = 0; i < n; i++) {
    sum += (2 * (i + 1) - n - 1) * sorted[i];
  }
  return sum / (n * n * m);
}

/**
 * Simple linear regression via least squares.
 * Input: array of { x, y } points.
 * Returns { slope, intercept, r2 }.
 */
function linearRegression(points) {
  if (!points || points.length < 2) {
    return { slope: 0, intercept: 0, r2: 0 };
  }
  const n = points.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
  for (const { x, y } of points) {
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
    sumY2 += y * y;
  }
  const denom = n * sumX2 - sumX * sumX;
  if (denom === 0) return { slope: 0, intercept: mean(points.map((p) => p.y)), r2: 0 };

  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;

  // R-squared
  const yMean = sumY / n;
  const ssTot = points.reduce((s, p) => s + (p.y - yMean) ** 2, 0);
  const ssRes = points.reduce((s, p) => s + (p.y - (slope * p.x + intercept)) ** 2, 0);
  const r2 = ssTot === 0 ? 0 : 1 - ssRes / ssTot;

  return { slope, intercept, r2 };
}

/**
 * Moving average with specified window size.
 */
function movingAverage(arr, window) {
  if (!arr || arr.length === 0) return [];
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    const start = Math.max(0, i - window + 1);
    const slice = arr.slice(start, i + 1);
    result.push(mean(slice));
  }
  return result;
}

/**
 * Week-over-week delta.
 * Returns { absolute, percent, direction }.
 */
function weekOverWeekDelta(thisWeek, lastWeek) {
  const absolute = thisWeek - lastWeek;
  const percent = lastWeek === 0 ? (thisWeek > 0 ? 100 : 0) : ((absolute / lastWeek) * 100);
  const direction = absolute > 0 ? "up" : absolute < 0 ? "down" : "flat";
  return { absolute, percent, direction };
}

/**
 * Detect anomalies — values beyond threshold standard deviations from mean.
 * Returns array of { index, value, zScore }.
 */
function detectAnomalies(arr, threshold = 2) {
  if (!arr || arr.length < 3) return [];
  const m = mean(arr);
  const sd = stddev(arr);
  if (sd === 0) return [];
  const anomalies = [];
  for (let i = 0; i < arr.length; i++) {
    const zScore = (arr[i] - m) / sd;
    if (Math.abs(zScore) > threshold) {
      anomalies.push({ index: i, value: arr[i], zScore });
    }
  }
  return anomalies;
}

// ---------------------------------------------------------------------------
// Aggregation helpers
// ---------------------------------------------------------------------------

/**
 * Load a single data file by date string.
 */
function loadDataForDate(dataDir, dateStr) {
  const filePath = path.join(dataDir, `.data-${dateStr}.json`);
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch (e) {
    console.warn(`Warning: Could not parse ${filePath}: ${e.message}`);
    return null;
  }
}

/**
 * Load ALL .data-*.json files from a directory.
 * Returns array sorted by date ascending.
 */
function aggregateAllData(dataDir) {
  const files = fs
    .readdirSync(dataDir)
    .filter((f) => f.startsWith(".data-") && f.endsWith(".json"))
    .sort();

  return files
    .map((f) => {
      try {
        return JSON.parse(fs.readFileSync(path.join(dataDir, f), "utf-8"));
      } catch (e) {
        return null;
      }
    })
    .filter(Boolean);
}

/**
 * Aggregate data for a specific set of dates.
 * Returns rich aggregate object.
 */
function aggregateWeekData(dataDir, weekDates) {
  const dailyData = [];
  const allCommits = [];
  const byRepo = {};
  const byType = {};
  const byAuthor = {};
  const byDay = {};
  let totalCommits = 0;

  for (const dateStr of weekDates) {
    const data = loadDataForDate(dataDir, dateStr);
    if (!data) {
      byDay[dateStr] = 0;
      continue;
    }

    dailyData.push(data);
    totalCommits += data.stats.total;
    byDay[dateStr] = data.stats.total;

    if (data.commits) {
      allCommits.push(...data.commits);
    }

    if (data.stats.byRepo) {
      for (const [repo, count] of Object.entries(data.stats.byRepo)) {
        byRepo[repo] = (byRepo[repo] || 0) + count;
      }
    }

    if (data.stats.byType) {
      for (const [type, count] of Object.entries(data.stats.byType)) {
        byType[type] = (byType[type] || 0) + count;
      }
    }

    if (data.stats.byAuthor) {
      for (const [author, count] of Object.entries(data.stats.byAuthor)) {
        byAuthor[author] = (byAuthor[author] || 0) + count;
      }
    }
  }

  // Peak day
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
    repoDominantType[repo] = sorted[0] ? sorted[0][0] : "other";
  }

  // Daily counts array (for statistical analysis)
  const dailyCounts = weekDates.map((d) => byDay[d] || 0);
  const activeDays = dailyCounts.filter((c) => c > 0);

  return {
    dailyData,
    allCommits,
    totalCommits,
    byRepo: sortedRepos,
    byRepoObj: byRepo,
    byType: sortedTypes,
    byTypeObj: byType,
    byAuthor: sortedAuthors,
    byAuthorObj: byAuthor,
    byDay,
    dailyCounts,
    peakDay,
    peakCount,
    repoDominantType,
    activeRepos: sortedRepos.length,
    daysWithData: activeDays.length,
    totalDays: weekDates.length,
    dailyAverage: mean(activeDays),
    dailyStddev: stddev(activeDays),
    dailyMedian: median(activeDays),
  };
}

/**
 * Get previous week's data for comparison.
 */
function getPreviousWeekData(dataDir, isoYear, isoWeek) {
  let prevWeek = isoWeek - 1;
  let prevYear = isoYear;
  if (prevWeek < 1) {
    prevWeek = 52;
    prevYear = isoYear - 1;
  }

  // Calculate dates for previous week
  const jan4 = new Date(Date.UTC(prevYear, 0, 4));
  const dayOfWeek = jan4.getUTCDay() || 7;
  const mondayOfWeek1 = new Date(jan4);
  mondayOfWeek1.setUTCDate(jan4.getUTCDate() - dayOfWeek + 1);
  const targetMonday = new Date(mondayOfWeek1);
  targetMonday.setUTCDate(mondayOfWeek1.getUTCDate() + (prevWeek - 1) * 7);

  const dates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(targetMonday);
    d.setUTCDate(targetMonday.getUTCDate() + i);
    dates.push(d.toISOString().split("T")[0]);
  }

  return aggregateWeekData(dataDir, dates);
}

/**
 * Get trailing N days of data for trend analysis.
 * endDate is a YYYY-MM-DD string (inclusive).
 */
function getTrailingData(dataDir, days, endDate) {
  const end = endDate
    ? new Date(endDate + "T12:00:00Z")
    : new Date();
  const dates = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setUTCDate(end.getUTCDate() - i);
    dates.push(d.toISOString().split("T")[0]);
  }
  return aggregateWeekData(dataDir, dates);
}

/**
 * Group commits by hour of day (0-23).
 */
function commitsByHour(commits) {
  const hours = new Array(24).fill(0);
  for (const c of commits) {
    if (c.date) {
      const h = new Date(c.date).getUTCHours();
      hours[h]++;
    }
  }
  return hours;
}

/**
 * Group commits by day of week (0=Mon, 6=Sun).
 */
function commitsByDayOfWeek(commits) {
  const days = new Array(7).fill(0);
  for (const c of commits) {
    if (c.date) {
      const d = new Date(c.date).getUTCDay();
      // Convert: JS Sunday=0 → our Monday=0 system
      const idx = d === 0 ? 6 : d - 1;
      days[idx]++;
    }
  }
  return days;
}

/**
 * Detect repo focus shifts between two week aggregates.
 * Returns array of { repo, thisShare, lastShare, delta, direction }.
 */
function repoFocusShifts(thisWeek, lastWeek) {
  const thisTotal = thisWeek.totalCommits || 1;
  const lastTotal = lastWeek.totalCommits || 1;

  const allRepos = new Set([
    ...Object.keys(thisWeek.byRepoObj || {}),
    ...Object.keys(lastWeek.byRepoObj || {}),
  ]);

  const shifts = [];
  for (const repo of allRepos) {
    const thisCount = (thisWeek.byRepoObj || {})[repo] || 0;
    const lastCount = (lastWeek.byRepoObj || {})[repo] || 0;
    const thisShare = thisCount / thisTotal;
    const lastShare = lastCount / lastTotal;
    const delta = thisShare - lastShare;
    const direction = delta > 0.05 ? "gained" : delta < -0.05 ? "lost" : "stable";

    shifts.push({
      repo,
      thisCount,
      lastCount,
      thisShare,
      lastShare,
      delta,
      direction,
    });
  }

  return shifts.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
}

/**
 * Feature/fix health ratio.
 * feat / (feat + fix). Higher = more building than fixing.
 */
function featureFixHealthRatio(byTypeObj) {
  const feat = byTypeObj.feat || 0;
  const fix = byTypeObj.fix || 0;
  const total = feat + fix;
  if (total === 0) return 1;
  return feat / total;
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

module.exports = {
  // Statistical functions
  mean,
  median,
  stddev,
  percentile,
  coefficientOfVariation,
  herfindahlIndex,
  giniCoefficient,
  linearRegression,
  movingAverage,
  weekOverWeekDelta,
  detectAnomalies,

  // Aggregation helpers
  loadDataForDate,
  aggregateAllData,
  aggregateWeekData,
  getPreviousWeekData,
  getTrailingData,
  commitsByHour,
  commitsByDayOfWeek,
  repoFocusShifts,
  featureFixHealthRatio,
};
