/**
 * Backfill Build Stream Data
 *
 * Fetches commits for each day in a date range across all aikaizen repos
 * and generates .data-{date}.json files. Skips dates that already have data.
 *
 * Usage: GITHUB_TOKEN=xxx node scripts/backfill-stream-data.js [startDate] [endDate]
 * Defaults: last 30 days to yesterday
 */

const fs = require("fs");
const path = require("path");
const { Octokit } = require("@octokit/rest");

const OWNER = "aikaizen";
const COMMITS_PER_REPO = 50;
const OUTPUT_DIR = path.join(__dirname, "..", "labnotes", "build-stream");

function parseCommitType(subject) {
  const match = subject.match(
    /^(feat|fix|content|refactor|docs|chore|style|test)(\(.+\))?:/
  );
  return match ? match[1] : "other";
}

function parseCommitScope(subject) {
  const match = subject.match(
    /^(?:feat|fix|content|refactor|docs|chore|style|test)\((.+)\):/
  );
  return match ? match[1] : null;
}

function getStats(commits) {
  const byType = {};
  const byAuthor = {};
  const byRepo = {};
  commits.forEach((c) => {
    byType[c.type] = (byType[c.type] || 0) + 1;
    byAuthor[c.author] = (byAuthor[c.author] || 0) + 1;
    byRepo[c.repo] = (byRepo[c.repo] || 0) + 1;
  });
  return { byType, byAuthor, byRepo, total: commits.length };
}

function dateRange(start, end) {
  const dates = [];
  const d = new Date(start);
  while (d <= end) {
    dates.push(d.toISOString().split("T")[0]);
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

async function main() {
  const token = process.env.GITHUB_TOKEN || process.env.FEED_GITHUB_TOKEN;
  if (!token) {
    console.error("Error: GITHUB_TOKEN required.");
    process.exit(1);
  }

  const octokit = new Octokit({ auth: token });

  // Parse date args or default to last 30 days
  const now = new Date();
  const defaultStart = new Date(now);
  defaultStart.setDate(defaultStart.getDate() - 30);

  const startDate = process.argv[2]
    ? new Date(process.argv[2] + "T00:00:00Z")
    : defaultStart;
  const endDate = process.argv[3]
    ? new Date(process.argv[3] + "T23:59:59Z")
    : new Date(now.toISOString().split("T")[0] + "T23:59:59Z");

  const dates = dateRange(startDate, endDate);
  console.log(`Backfilling ${dates.length} days: ${dates[0]} to ${dates[dates.length - 1]}\n`);

  // Skip dates that already have data
  const toFetch = dates.filter((d) => {
    const fp = path.join(OUTPUT_DIR, `.data-${d}.json`);
    if (fs.existsSync(fp)) {
      console.log(`  Skip ${d} (already exists)`);
      return false;
    }
    return true;
  });

  if (toFetch.length === 0) {
    console.log("\nAll dates already have data. Nothing to do.");
    return;
  }

  console.log(`\nFetching data for ${toFetch.length} days...\n`);

  // Fetch all repos once
  console.log(`Fetching repos for "${OWNER}"...`);
  const repos = await octokit.paginate(
    octokit.rest.repos.listForAuthenticatedUser,
    { per_page: 100, sort: "updated", direction: "desc" }
  );
  console.log(`Found ${repos.length} repos.\n`);

  // For efficiency, fetch commits with a wide window and bin by date
  const globalSince = new Date(toFetch[0] + "T00:00:00Z");
  const globalUntil = new Date(toFetch[toFetch.length - 1] + "T23:59:59Z");

  console.log(`Fetching commits from ${globalSince.toISOString()} to ${globalUntil.toISOString()}...\n`);

  const allCommits = [];

  for (const repo of repos) {
    try {
      const commits = await octokit.paginate(
        octokit.rest.repos.listCommits,
        {
          owner: repo.owner.login,
          repo: repo.name,
          sha: repo.default_branch,
          since: globalSince.toISOString(),
          until: globalUntil.toISOString(),
          per_page: 100,
        },
        (response) => response.data
      );

      for (const c of commits) {
        const message = (c.commit && c.commit.message) || "";
        const subject = message.split("\n")[0].trim();
        if (!subject) continue;
        if (subject.startsWith("Merge ")) continue;

        allCommits.push({
          repo: repo.name,
          hash: c.sha,
          shortHash: c.sha.slice(0, 7),
          date: c.commit.author.date,
          subject,
          author: c.commit.author.name,
          email: c.commit.author.email,
          htmlUrl: c.html_url,
          type: parseCommitType(subject),
          scope: parseCommitScope(subject),
        });
      }

      if (commits.length > 0) {
        console.log(`  ${repo.name}: ${commits.length} commits`);
      }
    } catch (err) {
      if (err.status === 409) continue; // empty repo
      console.warn(`  Skipping ${repo.name}: ${err.message}`);
    }
  }

  console.log(`\nTotal commits fetched: ${allCommits.length}`);

  // Bin commits by date
  const byDate = {};
  for (const c of allCommits) {
    const d = c.date.split("T")[0];
    if (!byDate[d]) byDate[d] = [];
    byDate[d].push(c);
  }

  // Write data files for each date
  let written = 0;
  for (const dateStr of toFetch) {
    const commits = (byDate[dateStr] || []).sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
    const stats = getStats(commits);

    const data = {
      date: dateStr,
      generatedAt: new Date().toISOString(),
      commits,
      stats,
      summary: {
        totalCommits: commits.length,
        activeRepos: Object.keys(stats.byRepo).sort(
          (a, b) => stats.byRepo[b] - stats.byRepo[a]
        ),
        primaryTypes: Object.entries(stats.byType)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3),
        activeAuthors: Object.keys(stats.byAuthor),
      },
    };

    const fp = path.join(OUTPUT_DIR, `.data-${dateStr}.json`);
    fs.writeFileSync(fp, JSON.stringify(data, null, 2));
    console.log(`  ${dateStr}: ${commits.length} commits`);
    written++;
  }

  console.log(`\nDone. Wrote ${written} data files.`);
  console.log("Run: node scripts/build-stream-html.js to regenerate the index.");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
