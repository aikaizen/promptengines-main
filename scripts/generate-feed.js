#!/usr/bin/env node

/**
 * generate-feed.js
 *
 * Fetches recent commits from the aikaizen GitHub account and injects
 * activity-card HTML into the PromptEngines site pages.
 *
 * Required env: GITHUB_TOKEN
 */

const fs = require("fs");
const path = require("path");
const { Octokit } = require("@octokit/rest");

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const OWNER = "aikaizen";
const COMMITS_PER_REPO = 5;
const COMMITS_PER_CARD = 3;
const BODY_MAX_LENGTH = 120;

const TARGET_FILES = [
  "index.html",
  "v1.html",
  "v2.html",
  "v3.html",
  "v4.html",
  "v5.html",
  "v6.html",
];

const PRODUCT_URLS = {
  kaizen: "https://kaizen.promptengines.com",
  storybookstudio: "https://storybookstudio.promptengines.com",
  flow: "https://flow.promptengines.com",
  consulting: "https://consulting.promptengines.com",
  dashboard: "https://dashboard.promptengines.com",
  "promptengines-main": "https://promptengines.com",
};

const FEATURED_APPS = [
  { repo: "promptengines-main", name: "Prompt Engines", tag: "Platform" },
  { repo: "flow", name: "Flow", tag: "Education" },
  { repo: "kaizen", name: "Kaizen", tag: "Kids" },
  { repo: "storybookstudio", name: "Storybook Studio", tag: "Creator Tool" },
];

const ROOT_DIR = path.resolve(__dirname, "..");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** HTML-escape user content to prevent XSS. */
function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Convert a date string to a human-friendly relative time label. */
function relativeTime(dateStr) {
  const now = new Date();
  const then = new Date(dateStr);
  const diffMs = now - then;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "today";
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;

  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks === 1) return "1 week ago";
  if (diffWeeks < 4) return `${diffWeeks} weeks ago`;

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths === 1) return "1 month ago";
  return `${diffMonths} months ago`;
}

/**
 * Parse a commit message into { title, body }.
 * Title = first line. Body = everything after the first blank line,
 * truncated to BODY_MAX_LENGTH characters.
 */
function parseMessage(message) {
  const lines = message.split("\n");
  const title = lines[0].trim();

  // Find first blank line
  let blankIdx = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === "") {
      blankIdx = i;
      break;
    }
  }

  let body = "";
  if (blankIdx !== -1 && blankIdx + 1 < lines.length) {
    body = lines
      .slice(blankIdx + 1)
      .join(" ")
      .trim();
    if (body.length > BODY_MAX_LENGTH) {
      body = body.slice(0, BODY_MAX_LENGTH).trimEnd() + "...";
    }
  }

  return { title, body };
}

/** Build a terminal-line string for the telemetry widget. */
function buildTerminalLine(commit) {
  const d = new Date(commit.date);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const shortTitle = commit.title.length > 50
    ? commit.title.slice(0, 47) + "..."
    : commit.title;
  return `[${hh}:${mm}] ${commit.repo}: ${shortTitle}`;
}

/** Build a grouped app card with recent commits as sub-lines. */
function buildAppCard(app, commits) {
  const url = PRODUCT_URLS[app.repo] || `https://github.com/aikaizen/${app.repo}`;
  const commitLines = commits.slice(0, COMMITS_PER_CARD).map(function (c) {
    const time = relativeTime(c.date);
    const msg = c.title.length > 60 ? c.title.slice(0, 57) + "..." : c.title;
    return `              <div class="commit-line"><span class="commit-time">${escapeHtml(time)}</span><span class="commit-msg">${escapeHtml(msg)}</span></div>`;
  }).join("\n");

  return `          <a class="app-card" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">
            <div class="app-card-head">
              <span class="app-card-name">${escapeHtml(app.name)}</span>
              <span class="app-card-tag">${escapeHtml(app.tag)}</span>
            </div>
            <div class="app-card-commits">
${commitLines}
            </div>
          </a>`;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  // 1. Validate token
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.error("Error: GITHUB_TOKEN environment variable is required.");
    process.exit(1);
  }

  const octokit = new Octokit({ auth: token });

  // 2. Fetch repos (aikaizen is a user account, not an org)
  console.log(`Fetching repos for user "${OWNER}"...`);
  const repos = await octokit.paginate(octokit.rest.repos.listForAuthenticatedUser, {
    per_page: 100,
    sort: "updated",
    direction: "desc",
  });
  console.log(`Found ${repos.length} repos.`);

  // 3. Fetch recent commits from each repo
  const allCommits = [];

  for (const repo of repos) {
    try {
      const { data: commits } = await octokit.rest.repos.listCommits({
        owner: repo.owner.login,
        repo: repo.name,
        sha: repo.default_branch,
        per_page: COMMITS_PER_REPO,
      });

      for (const c of commits) {
        const message = (c.commit && c.commit.message) || "";
        if (!message.trim()) continue;

        const { title, body } = parseMessage(message);

        // Skip merge commits
        if (title.startsWith("Merge ")) continue;

        allCommits.push({
          repo: repo.name,
          title,
          body,
          date: c.commit.author.date,
          htmlUrl: c.html_url,
        });
      }
    } catch (err) {
      // Some repos may be empty or inaccessible; log and continue
      console.warn(`  Skipping ${repo.name}: ${err.message}`);
    }
  }

  console.log(`Collected ${allCommits.length} commits (after filtering).`);

  if (allCommits.length === 0) {
    console.error("Error: No commits found. Exiting.");
    process.exit(1);
  }

  // 4. Sort all commits by date descending
  allCommits.sort((a, b) => new Date(b.date) - new Date(a.date));

  // 5. Group commits by repo for featured apps
  const commitsByRepo = {};
  for (const c of allCommits) {
    if (!commitsByRepo[c.repo]) commitsByRepo[c.repo] = [];
    commitsByRepo[c.repo].push(c);
  }

  // 6. Build grouped app cards
  const appCards = FEATURED_APPS
    .filter((app) => commitsByRepo[app.repo] && commitsByRepo[app.repo].length > 0)
    .map((app) => buildAppCard(app, commitsByRepo[app.repo]));

  console.log(`Built ${appCards.length} app cards.`);

  const cardsHtml = appCards.join("\n");

  // 7. Build telemetry terminal lines (initial HTML + JS stream array)
  const telemetryCommits = allCommits.slice(0, 5);
  const streamCommits = allCommits.slice(5, 11);

  const telemetryHtml = telemetryCommits
    .map((c) => `              <div class="terminal-line">${escapeHtml(buildTerminalLine(c))}</div>`)
    .join("\n");

  const streamJs = streamCommits
    .map((c) => `        "${buildTerminalLine(c).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`)
    .join(",\n");

  // 7. Inject into HTML files
  const feedRegex = /<!-- FEED:START -->[\s\S]*?<!-- FEED:END -->/;
  const feedReplacement = `<!-- FEED:START -->\n${cardsHtml}\n          <!-- FEED:END -->`;

  const telemetryRegex = /<!-- TELEMETRY:START -->[\s\S]*?<!-- TELEMETRY:END -->/;
  const telemetryReplacement = `<!-- TELEMETRY:START -->\n${telemetryHtml}\n              <!-- TELEMETRY:END -->`;

  const streamRegex = /\/\/ STREAM:START[\s\S]*?\/\/ STREAM:END/;
  const streamReplacement = `// STREAM:START\n      const stream = [\n${streamJs}\n      ];\n      // STREAM:END`;

  for (const file of TARGET_FILES) {
    const filePath = path.join(ROOT_DIR, file);

    if (!fs.existsSync(filePath)) {
      console.warn(`  File not found, skipping: ${file}`);
      continue;
    }

    let content = fs.readFileSync(filePath, "utf-8");

    if (feedRegex.test(content)) {
      content = content.replace(feedRegex, feedReplacement);
    } else {
      console.warn(`  No FEED markers in ${file}`);
    }

    if (telemetryRegex.test(content)) {
      content = content.replace(telemetryRegex, telemetryReplacement);
    } else {
      console.warn(`  No TELEMETRY markers in ${file}`);
    }

    if (streamRegex.test(content)) {
      content = content.replace(streamRegex, streamReplacement);
    } else {
      console.warn(`  No STREAM markers in ${file}`);
    }

    fs.writeFileSync(filePath, content, "utf-8");
    console.log(`  Updated: ${file}`);
  }

  console.log(`\nDone. Injected ${appCards.length} app cards + telemetry from real commits.`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
