#!/usr/bin/env node

/**
 * Daily Article Suggestion Script
 *
 * Reads the most recent build stream data file and suggests 3-5 article
 * topics based on commit activity. Groups commits by semantic theme using
 * keyword matching, then ranks themes by volume and editorial interest.
 *
 * Usage: node scripts/suggest-daily-article.js
 *
 * No external dependencies. No API calls. Reads local JSON only.
 */

const fs = require("fs");
const path = require("path");

// ── Configuration ──────────────────────────────────────────────────────

const DATA_DIR = path.join(
  __dirname,
  "..",
  "labnotes",
  "build-stream"
);

// Semantic theme definitions: keyword groups that indicate a topic cluster.
// Each theme has a label, keywords to match in commit subjects, and an
// article angle template.
const THEMES = [
  {
    id: "character-system",
    label: "Character systems & consistency",
    keywords: [
      "character",
      "pose",
      "consistency",
      "sheet",
      "insert character",
      "character library",
      "character crud",
      "character picker",
      "character sheet",
      "character creator",
    ],
    angle: (repos, count) =>
      `Character systems in AI creative tools: ${describeWork(repos, count)}`,
  },
  {
    id: "agentic",
    label: "Agentic workflows & planning",
    keywords: [
      "agentic",
      "agent",
      "planner",
      "execution engine",
      "wizard",
      "auto-start",
      "phase planning",
      "llm call",
      "plan api",
    ],
    angle: (repos, count) =>
      `Agentic execution in production: ${describeWork(repos, count)}`,
  },
  {
    id: "spread-layout",
    label: "Page layout & spreads",
    keywords: [
      "spread",
      "double-page",
      "double-width",
      "aspect ratio",
      "assembly mode",
      "page editor",
      "pagination",
      "grid column",
      "book reader",
    ],
    angle: (repos, count) =>
      `Layout engineering for AI-generated books: ${describeWork(repos, count)}`,
  },
  {
    id: "video-generation",
    label: "Video generation & playback",
    keywords: [
      "video",
      "play mode",
      "playback",
      "transition",
      "scene",
      "freeze",
      "canvas",
      "screengrab",
      "video quality",
      "video prompt",
    ],
    angle: (repos, count) =>
      `Video generation pipeline: ${describeWork(repos, count)}`,
  },
  {
    id: "image-generation",
    label: "Image generation & quality",
    keywords: [
      "image model",
      "generate all",
      "ref image",
      "512px",
      "4-image",
      "image gen",
      "aesthetic",
      "style suffix",
      "camera",
      "lens detail",
    ],
    angle: (repos, count) =>
      `Image generation constraints in production: ${describeWork(repos, count)}`,
  },
  {
    id: "billing-credits",
    label: "Billing, credits & payments",
    keywords: [
      "credit",
      "deduct",
      "stripe",
      "webhook",
      "payment",
      "billing",
      "subscription",
      "pricing",
    ],
    angle: (repos, count) =>
      `Credit and billing systems for AI products: ${describeWork(repos, count)}`,
  },
  {
    id: "notifications",
    label: "Notifications & email",
    keywords: [
      "notification",
      "email",
      "resend",
      "unsubscribe",
      "preference",
      "template",
    ],
    angle: (repos, count) =>
      `Notification pipelines for AI apps: ${describeWork(repos, count)}`,
  },
  {
    id: "mobile-ux",
    label: "Mobile UX & responsive design",
    keywords: [
      "mobile",
      "touch",
      "responsive",
      "tabs",
      "mobile-first",
      "swipe",
    ],
    angle: (repos, count) =>
      `Mobile-first design for AI creative tools: ${describeWork(repos, count)}`,
  },
  {
    id: "api-infrastructure",
    label: "API infrastructure & routing",
    keywords: [
      "api route",
      "rate limit",
      "413",
      "payload",
      "multi-pod",
      "provider",
      "key rotation",
      "gemini",
      "api key",
      "cors",
    ],
    angle: (repos, count) =>
      `API infrastructure patterns: ${describeWork(repos, count)}`,
  },
  {
    id: "demo-mode",
    label: "Demo mode & showcasing",
    keywords: [
      "demo",
      "demo mode",
      "pre-generated",
      "slot-based",
      "showcase",
    ],
    angle: (repos, count) =>
      `Demo mode for AI products: ${describeWork(repos, count)}`,
  },
  {
    id: "pdf-print",
    label: "PDF generation & print",
    keywords: [
      "pdf",
      "print",
      "lulu",
      "gelato",
      "split",
      "spread image",
    ],
    angle: (repos, count) =>
      `AI-to-print pipeline: ${describeWork(repos, count)}`,
  },
  {
    id: "testing",
    label: "Testing & quality assurance",
    keywords: [
      "test",
      "zod schema",
      "route test",
      "expectations",
      "baseline",
      "code review",
    ],
    angle: (repos, count) =>
      `Testing AI products: ${describeWork(repos, count)}`,
  },
  {
    id: "dashboard-ops",
    label: "Internal dashboards & operations",
    keywords: [
      "dashboard",
      "pantheon",
      "metrics",
      "pipeline",
      "terminal wireframe",
      "mvp",
      "portfolio",
    ],
    angle: (repos, count) =>
      `Building internal tools for AI teams: ${describeWork(repos, count)}`,
  },
  {
    id: "auth-security",
    label: "Authentication & security",
    keywords: [
      "auth",
      "gated",
      "password",
      "env var",
      "admin",
      "hardening",
      "token",
    ],
    angle: (repos, count) =>
      `Security patterns for AI products: ${describeWork(repos, count)}`,
  },
  {
    id: "curriculum-language",
    label: "Language learning & curriculum",
    keywords: [
      "curriculum",
      "language",
      "tibetan",
      "packet",
      "tutor",
      "lesson",
      "norbu",
    ],
    angle: (repos, count) =>
      `AI tutoring for low-resource languages: ${describeWork(repos, count)}`,
  },
];

// ── Helpers ────────────────────────────────────────────────────────────

function describeWork(repoMap, count) {
  const repos = Object.entries(repoMap)
    .sort((a, b) => b[1] - a[1])
    .map(([repo, n]) => `${repo} (${n})`)
    .join(", ");
  return repos;
}

function findMostRecentDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    console.error(`Error: data directory not found at ${DATA_DIR}`);
    process.exit(1);
  }

  const files = fs
    .readdirSync(DATA_DIR)
    .filter((f) => f.startsWith(".data-") && f.endsWith(".json"))
    .sort()
    .reverse();

  if (files.length === 0) {
    console.error("Error: no .data-*.json files found in build-stream/");
    process.exit(1);
  }

  return path.join(DATA_DIR, files[0]);
}

function filterBotCommits(commits) {
  return commits.filter((c) => {
    if (c.author === "github-actions[bot]") return false;
    if (c.subject.startsWith("Merge ")) return false;
    if (c.type === "chore" && c.subject.includes("update activity feed"))
      return false;
    if (
      c.type === "chore" &&
      c.subject.includes("auto-generate daily stream")
    )
      return false;
    return true;
  });
}

function matchCommitToThemes(commit) {
  const subject = commit.subject.toLowerCase();
  const matched = [];

  for (const theme of THEMES) {
    for (const keyword of theme.keywords) {
      if (subject.includes(keyword.toLowerCase())) {
        matched.push(theme.id);
        break; // one match per theme is enough
      }
    }
  }

  return matched;
}

function classifyCommitType(commit) {
  // Simplified type for display
  const type = commit.type || "other";
  if (type === "feat") return "feat";
  if (type === "fix") return "fix";
  if (type === "refactor") return "refactor";
  if (type === "docs") return "docs";
  return "other";
}

function extractKeySubjects(commits, limit) {
  // Return the most interesting commit subjects for a theme
  // Prefer feat > fix > refactor > other
  const typeOrder = { feat: 0, fix: 1, refactor: 2, docs: 3, other: 4 };
  return commits
    .sort(
      (a, b) =>
        (typeOrder[a.type] || 4) - (typeOrder[b.type] || 4)
    )
    .slice(0, limit)
    .map((c) => c.subject);
}

// ── Main ───────────────────────────────────────────────────────────────

function run() {
  const dataFile = findMostRecentDataFile();
  const raw = fs.readFileSync(dataFile, "utf-8");
  const data = JSON.parse(raw);

  const date = data.date || "unknown";
  const allCommits = data.commits || [];
  const humanCommits = filterBotCommits(allCommits);

  if (humanCommits.length === 0) {
    console.log(`No human commits found for ${date}. Nothing to suggest.`);
    process.exit(0);
  }

  // Group commits by theme
  const themeGroups = {}; // themeId -> { commits: [], repos: {}, types: {} }

  for (const commit of humanCommits) {
    const themes = matchCommitToThemes(commit);

    for (const themeId of themes) {
      if (!themeGroups[themeId]) {
        themeGroups[themeId] = { commits: [], repos: {}, types: {} };
      }
      themeGroups[themeId].commits.push(commit);
      themeGroups[themeId].repos[commit.repo] =
        (themeGroups[themeId].repos[commit.repo] || 0) + 1;
      const cType = classifyCommitType(commit);
      themeGroups[themeId].types[cType] =
        (themeGroups[themeId].types[cType] || 0) + 1;
    }
  }

  // Also find "unmatched" commits and group by repo for catch-all suggestions
  const matchedHashes = new Set();
  for (const g of Object.values(themeGroups)) {
    for (const c of g.commits) {
      matchedHashes.add(c.hash);
    }
  }

  const unmatchedByRepo = {};
  for (const commit of humanCommits) {
    if (!matchedHashes.has(commit.hash)) {
      if (!unmatchedByRepo[commit.repo]) {
        unmatchedByRepo[commit.repo] = [];
      }
      unmatchedByRepo[commit.repo].push(commit);
    }
  }

  // Rank themes by editorial interest:
  //   1. Number of feat commits (features are more article-worthy)
  //   2. Total commit count
  //   3. Number of repos involved (cross-product themes are stronger)
  const ranked = Object.entries(themeGroups)
    .map(([themeId, group]) => {
      const themeDef = THEMES.find((t) => t.id === themeId);
      const featCount = group.types.feat || 0;
      const repoCount = Object.keys(group.repos).length;
      const total = group.commits.length;
      const score = featCount * 3 + total * 1 + repoCount * 2;

      return {
        themeId,
        label: themeDef.label,
        angle: themeDef.angle(group.repos, total),
        featCount,
        fixCount: group.types.fix || 0,
        total,
        repoCount,
        repos: group.repos,
        types: group.types,
        score,
        keySubjects: extractKeySubjects(group.commits, 3),
      };
    })
    .sort((a, b) => b.score - a.score);

  // Take top 5
  const suggestions = ranked.slice(0, 5);

  // If we have fewer than 3 themed suggestions, add repo-based catch-alls
  if (suggestions.length < 3) {
    const repoSuggestions = Object.entries(unmatchedByRepo)
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 3 - suggestions.length);

    for (const [repo, commits] of repoSuggestions) {
      suggestions.push({
        themeId: `repo-${repo}`,
        label: `General ${repo} activity`,
        angle: `${repo} development roundup: ${commits.length} commits`,
        featCount: commits.filter((c) => c.type === "feat").length,
        fixCount: commits.filter((c) => c.type === "fix").length,
        total: commits.length,
        repoCount: 1,
        repos: { [repo]: commits.length },
        types: {},
        score: 0,
        keySubjects: extractKeySubjects(commits, 3),
      });
    }
  }

  // ── Output ─────────────────────────────────────────────────────────

  const today = new Date().toISOString().split("T")[0];
  const bar = "\u2501".repeat(50);

  console.log();
  console.log(`Daily Article Suggestions (${today})`);
  console.log(`Data source: ${path.basename(dataFile)}`);
  console.log(bar);

  if (suggestions.length === 0) {
    console.log(
      "No strong themes detected. Review commits manually."
    );
    console.log(
      `Total human commits: ${humanCommits.length} across ${Object.keys(data.stats.byRepo).length} repos`
    );
    process.exit(0);
  }

  suggestions.forEach((s, i) => {
    const typeBreakdown = [];
    if (s.featCount > 0) typeBreakdown.push(`${s.featCount} feat`);
    if (s.fixCount > 0) typeBreakdown.push(`${s.fixCount} fix`);
    const otherCount =
      s.total - s.featCount - s.fixCount;
    if (otherCount > 0) typeBreakdown.push(`${otherCount} other`);

    const repoList = Object.entries(s.repos)
      .sort((a, b) => b[1] - a[1])
      .map(([r, n]) => r)
      .join(", ");

    console.log();
    console.log(`${i + 1}. ${s.angle}`);
    console.log(
      `   Source: ${repoList} (${s.total} commits: ${typeBreakdown.join(", ")})`
    );

    if (s.keySubjects.length > 0) {
      const subjects = s.keySubjects
        .map((subj) => {
          // Truncate long subjects
          return subj.length > 80
            ? subj.slice(0, 77) + "..."
            : subj;
        })
        .join("; ");
      console.log(`   Key commits: ${subjects}`);
    }
  });

  console.log();
  console.log(bar);
  console.log(
    `Summary: ${humanCommits.length} human commits across ${Object.keys(data.stats.byRepo).length} repos`
  );
  console.log(
    `Themes detected: ${ranked.length} | Unmatched commits: ${humanCommits.length - matchedHashes.size}`
  );
  console.log();
}

run();
