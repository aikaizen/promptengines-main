# GitHub Activity Feed Generator Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the hardcoded activity feed with commit data fetched from all repos in the `aikaizen` GitHub org at build time.

**Architecture:** A Node.js script reads `GITHUB_TOKEN` from env, fetches recent commits from all `aikaizen` org repos via Octokit, generates HTML activity cards, and injects them between `<!-- FEED:START -->` / `<!-- FEED:END -->` markers in all 7 HTML files (index.html, v1-v6.html).

**Tech Stack:** Node.js, @octokit/rest

---

### Task 1: Initialize package.json and install Octokit

**Files:**
- Create: `package.json`

**Step 1: Initialize package.json**

Run:
```bash
cd /Users/adilislam/Desktop/PromptEngines && npm init -y
```

**Step 2: Install octokit**

Run:
```bash
cd /Users/adilislam/Desktop/PromptEngines && npm install @octokit/rest
```

**Step 3: Add .gitignore entry for node_modules**

Check if `.gitignore` exists at project root. If not, create it. Ensure it contains `node_modules/`.

**Step 4: Commit**

```bash
git add package.json package-lock.json .gitignore
git commit -m "feat: add octokit dependency for GitHub feed generator"
```

---

### Task 2: Add feed markers to all HTML files

**Files:**
- Modify: `index.html:1315-1351`
- Modify: `v1.html` (same structure)
- Modify: `v2.html` (same structure)
- Modify: `v3.html` (same structure)
- Modify: `v4.html` (same structure)
- Modify: `v5.html` (same structure)
- Modify: `v6.html` (same structure)

**Step 1: Add markers in index.html**

Find the activity-grid div in index.html. Wrap its inner content with HTML comment markers. The result should look like:

```html
        <div class="activity-grid">
          <!-- FEED:START -->
          <a class="activity-card" href="https://consulting.promptengines.com" target="_blank" rel="noopener noreferrer">
            ...existing cards stay as fallback...
          </a>
          <!-- FEED:END -->
        </div>
```

The `<!-- FEED:START -->` goes right after `<div class="activity-grid">` (on the next line).
The `<!-- FEED:END -->` goes right before `</div>` that closes activity-grid.

**Step 2: Add same markers to v1.html through v6.html**

The activity-grid structure is identical in all variant files. Apply the same markers.

**Step 3: Verify markers are present**

Run:
```bash
grep -c "FEED:START" index.html v1.html v2.html v3.html v4.html v5.html v6.html
```
Expected: each file shows `1`.

**Step 4: Commit**

```bash
git add index.html v1.html v2.html v3.html v4.html v5.html v6.html
git commit -m "feat: add FEED:START/END markers to activity grid in all theme files"
```

---

### Task 3: Create the feed generator script

**Files:**
- Create: `scripts/generate-feed.js`

**Step 1: Create scripts directory and the generator**

Create `scripts/generate-feed.js` with this content:

```javascript
const { Octokit } = require("@octokit/rest");
const fs = require("fs");
const path = require("path");

const TOKEN = process.env.GITHUB_TOKEN;
if (!TOKEN) {
  console.error("Error: GITHUB_TOKEN environment variable is required");
  process.exit(1);
}

const ORG = "aikaizen";
const MAX_CARDS = 6;
const COMMITS_PER_REPO = 5;

const PRODUCT_URLS = {
  kaizen: "https://kaizen.promptengines.com",
  "storybook-studio": "https://storybookstudio.promptengines.com",
  flow: "https://flow.promptengines.com",
  consulting: "https://consulting.promptengines.com",
  dashboard: "https://dashboard.promptengines.com",
};

const HTML_FILES = [
  "index.html",
  "v1.html",
  "v2.html",
  "v3.html",
  "v4.html",
  "v5.html",
  "v6.html",
];

function relativeTime(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "today";
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks === 1) return "1 week ago";
  if (diffWeeks < 5) return `${diffWeeks} weeks ago`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths === 1) return "1 month ago";
  return `${diffMonths} months ago`;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildCard(commit) {
  const url = PRODUCT_URLS[commit.repo] || commit.htmlUrl;
  const time = relativeTime(commit.date);
  const title = escapeHtml(commit.title);
  const desc = commit.body ? escapeHtml(commit.body) : "";

  const descHtml = desc
    ? `\n            <div class="activity-desc">${desc}</div>`
    : "";

  return `          <a class="activity-card" href="${url}" target="_blank" rel="noopener noreferrer">
            <div class="activity-meta"><span>${time}</span><span>${escapeHtml(commit.repo)}</span></div>
            <div class="activity-title">${title}</div>${descHtml}
          </a>`;
}

async function main() {
  const octokit = new Octokit({ auth: TOKEN });

  console.log(`Fetching repos from ${ORG}...`);
  const repos = await octokit.paginate(octokit.rest.repos.listForOrg, {
    org: ORG,
    type: "all",
    per_page: 100,
  });
  console.log(`Found ${repos.length} repos`);

  const allCommits = [];

  for (const repo of repos) {
    try {
      const { data: commits } = await octokit.rest.repos.listCommits({
        owner: ORG,
        repo: repo.name,
        per_page: COMMITS_PER_REPO,
      });

      for (const c of commits) {
        const messageParts = (c.commit.message || "").split("\n\n");
        const title = messageParts[0].split("\n")[0];
        const body = messageParts.slice(1).join(" ").trim();

        // Skip merge commits and empty messages
        if (title.startsWith("Merge ") || !title.trim()) continue;

        allCommits.push({
          repo: repo.name,
          title,
          body: body.length > 120 ? body.slice(0, 117) + "..." : body,
          date: c.commit.author.date,
          htmlUrl: c.html_url,
        });
      }
    } catch (err) {
      console.warn(`  Skipping ${repo.name}: ${err.message}`);
    }
  }

  console.log(`Collected ${allCommits.length} commits total`);

  // Sort by date descending, take top N
  allCommits.sort((a, b) => new Date(b.date) - new Date(a.date));
  const topCommits = allCommits.slice(0, MAX_CARDS);

  if (topCommits.length === 0) {
    console.error("No commits found. Check your token and org name.");
    process.exit(1);
  }

  // Build HTML
  const cardsHtml = topCommits.map(buildCard).join("\n\n");
  const feedBlock = `<!-- FEED:START -->\n${cardsHtml}\n          <!-- FEED:END -->`;

  // Inject into each HTML file
  const rootDir = path.resolve(__dirname, "..");
  const feedRegex = /<!-- FEED:START -->[\s\S]*?<!-- FEED:END -->/;

  for (const file of HTML_FILES) {
    const filePath = path.join(rootDir, file);
    if (!fs.existsSync(filePath)) {
      console.warn(`  Skipping ${file}: not found`);
      continue;
    }

    let html = fs.readFileSync(filePath, "utf-8");
    if (!feedRegex.test(html)) {
      console.warn(`  Skipping ${file}: no FEED markers found`);
      continue;
    }

    html = html.replace(feedRegex, feedBlock);
    fs.writeFileSync(filePath, html, "utf-8");
    console.log(`  Updated ${file}`);
  }

  console.log(`\nDone! Injected ${topCommits.length} activity cards.`);
}

main().catch((err) => {
  console.error("Fatal error:", err.message);
  process.exit(1);
});
```

**Step 2: Verify the script parses correctly**

Run:
```bash
node -c scripts/generate-feed.js
```
Expected: No output (syntax OK).

**Step 3: Commit**

```bash
git add scripts/generate-feed.js
git commit -m "feat: add GitHub activity feed generator script"
```

---

### Task 4: Test the script end-to-end

**Step 1: Run the generator**

Run:
```bash
cd /Users/adilislam/Desktop/PromptEngines && GITHUB_TOKEN=<your-token> node scripts/generate-feed.js
```

Expected output:
```
Fetching repos from aikaizen...
Found N repos
Collected M commits total
  Updated index.html
  Updated v1.html
  ...
Done! Injected 6 activity cards.
```

**Step 2: Verify the HTML was injected**

Run:
```bash
grep -A 3 "FEED:START" index.html | head -12
```

Expected: activity cards with real commit data between the markers.

**Step 3: Open index.html in browser**

Verify:
- Activity cards show real commit messages
- Timestamps are relative ("3 days ago", etc.)
- Repo names appear as category tags
- Links go to correct product URLs or GitHub commit pages

**Step 4: Add npm script for convenience**

Add to `package.json` scripts:
```json
"generate-feed": "node scripts/generate-feed.js"
```

So it can be run as:
```bash
GITHUB_TOKEN=ghp_xxx npm run generate-feed
```

**Step 5: Commit the generated output**

```bash
git add index.html v1.html v2.html v3.html v4.html v5.html v6.html package.json
git commit -m "feat: populate activity feed from aikaizen GitHub commits"
```
