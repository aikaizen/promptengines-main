/**
 * Prepare Build Stream Data
 *
 * Fetches commits from the last 24 hours across ALL repos in the aikaizen
 * GitHub account and generates a JSON file for the daily stream article.
 *
 * Required env: GITHUB_TOKEN (or FEED_GITHUB_TOKEN)
 */

const fs = require("fs");
const path = require("path");
const { Octokit } = require("@octokit/rest");

const OWNER = "aikaizen";
const COMMITS_PER_REPO = 30; // generous limit per repo for a 24h window

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

async function fetchAllCommits(octokit, since) {
  // Fetch all repos for the aikaizen user
  console.log(`Fetching repos for user "${OWNER}"...`);
  const repos = await octokit.paginate(
    octokit.rest.repos.listForAuthenticatedUser,
    {
      per_page: 100,
      sort: "updated",
      direction: "desc",
    }
  );
  console.log(`Found ${repos.length} repos.`);

  const allCommits = [];

  for (const repo of repos) {
    try {
      const { data: commits } = await octokit.rest.repos.listCommits({
        owner: repo.owner.login,
        repo: repo.name,
        sha: repo.default_branch,
        since: since.toISOString(),
        per_page: COMMITS_PER_REPO,
      });

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
      // Empty repos, permission issues, etc.
      if (err.status !== 409) {
        console.warn(`  Skipping ${repo.name}: ${err.message}`);
      }
    }
  }

  return allCommits;
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

async function generateData() {
  const token = process.env.GITHUB_TOKEN || process.env.FEED_GITHUB_TOKEN;
  if (!token) {
    console.error(
      "Error: GITHUB_TOKEN or FEED_GITHUB_TOKEN environment variable is required."
    );
    process.exit(1);
  }

  const octokit = new Octokit({ auth: token });

  const date = new Date();
  const dateStr = date.toISOString().split("T")[0];

  // Look back 24 hours
  const since = new Date();
  since.setDate(since.getDate() - 1);
  since.setHours(0, 0, 0, 0);

  const commits = await fetchAllCommits(octokit, since);

  // Sort by date descending
  commits.sort((a, b) => new Date(b.date) - new Date(a.date));

  const stats = getStats(commits);

  const data = {
    date: dateStr,
    generatedAt: date.toISOString(),
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

  const outputPath = path.join(
    __dirname,
    "..",
    "labnotes",
    "build-stream",
    `.data-${dateStr}.json`
  );

  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
  console.log(`\nGenerated: ${outputPath}`);
  console.log(`Total commits: ${commits.length}`);
  console.log(`Active repos: ${data.summary.activeRepos.join(", ")}`);
  console.log(`Types:`, stats.byType);

  return data;
}

if (require.main === module) {
  generateData().catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
  });
}

module.exports = { fetchAllCommits, getStats, generateData };
