/**
 * Write Stream Article Helper
 *
 * Reads the prepared cross-repo data and generates a starter template
 * for the human/agent to complete with narrative and analysis.
 */

const fs = require("fs");
const path = require("path");

const date = new Date().toISOString().split("T")[0];
const dataPath = path.join(
  __dirname,
  "..",
  "labnotes",
  "build-stream",
  `.data-${date}.json`
);

if (!fs.existsSync(dataPath)) {
  console.error(`No data file found for ${date}`);
  console.error(`Expected: ${dataPath}`);
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

// Group commits by repo
const byRepo = {};
data.commits.forEach((c) => {
  if (!byRepo[c.repo]) byRepo[c.repo] = [];
  byRepo[c.repo].push(c);
});

// Group commits by type (across all repos)
const byType = {};
data.commits.forEach((c) => {
  if (!byType[c.type]) byType[c.type] = [];
  byType[c.type].push(c);
});

// Build per-repo sections
const repoSections = Object.entries(byRepo)
  .sort((a, b) => b[1].length - a[1].length)
  .map(([repo, commits]) => {
    const lines = commits.map((c) => {
      const tag = c.type !== "other" ? `\`${c.type}\`` : "";
      const clean = c.subject
        .replace(
          /^(feat|fix|content|refactor|docs|chore|style|test)(\(.+\))?: /,
          ""
        );
      return `- **${c.shortHash}** ${tag} ${clean}`;
    });
    return `### ${repo} (${commits.length})\n${lines.join("\n")}`;
  });

// Build type summary
const typeSections = [];
const typeOrder = ["feat", "content", "fix", "refactor", "docs", "chore", "style", "test", "other"];
const typeLabels = {
  feat: "Features",
  content: "Content",
  fix: "Fixes",
  refactor: "Refactoring",
  docs: "Documentation",
  chore: "Chores",
  style: "Style",
  test: "Tests",
  other: "Other",
};

for (const t of typeOrder) {
  if (!byType[t] || byType[t].length === 0) continue;
  const repoBreakdown = {};
  byType[t].forEach((c) => {
    repoBreakdown[c.repo] = (repoBreakdown[c.repo] || 0) + 1;
  });
  const breakdown = Object.entries(repoBreakdown)
    .sort((a, b) => b[1] - a[1])
    .map(([r, n]) => `${r} (${n})`)
    .join(", ");
  typeSections.push(`- **${typeLabels[t]}:** ${byType[t].length} — ${breakdown}`);
}

// Build repo velocity summary
const repoVelocity = Object.entries(byRepo)
  .sort((a, b) => b[1].length - a[1].length)
  .map(([repo, commits]) => `| ${repo} | ${commits.length} |`)
  .join("\n");

const template = `---
title: "Build Stream — ${data.date}"
date: ${data.date}
author: "Andy Stable (AI) & Human Co-Author"
category: Build Stream
tags: [${data.summary.primaryTypes.map((t) => t[0]).join(", ")}]
repos: [${data.summary.activeRepos.join(", ")}]
status: draft
---

# Build Stream — ${data.date}

**Commits:** ${data.stats.total} across ${data.summary.activeRepos.length} repos
**Active repos:** ${data.summary.activeRepos.join(", ")}
**Active authors:** ${data.summary.activeAuthors.join(", ")}

---

## Repo Velocity

| Repo | Commits |
|------|---------|
${repoVelocity}

## Type Breakdown

${typeSections.join("\n")}

---

## What We Built

${repoSections.join("\n\n")}

---

## Cross-Repo Patterns

<!-- Analyze patterns across ALL repos:
- Which repos are most active? What does that signal?
- Feature vs fix ratio — are we building or stabilizing?
- Any coordination across repos (e.g. API changes in one, client changes in another)?
- Commit rhythm — bursts vs steady?
- Conventional commit discipline — are all repos following it?
- Any anti-patterns (huge commits, vague messages, missing types)?
-->

## What Blocked

<!-- Document honest failures, not just successes -->

## Tomorrow

<!-- Preview next priorities based on commit trajectory across repos -->

---

**Source:** Git feed from all aikaizen repos (${data.summary.activeRepos.length} active)
**Generated:** ${new Date().toISOString()}
`;

const outputPath = path.join(
  __dirname,
  "..",
  "labnotes",
  "build-stream",
  `${data.date}.md`
);
fs.writeFileSync(outputPath, template);

console.log(`Generated: ${outputPath}`);
console.log(
  `Covered ${data.summary.activeRepos.length} repos, ${data.stats.total} commits`
);
console.log(`\nNext steps:`);
console.log(`1. Read and edit ${outputPath}`);
console.log(`2. Fill in Cross-Repo Patterns, What Blocked, Tomorrow sections`);
console.log(`3. Change status from draft to published`);
console.log(`4. Delete .data-${date}.json`);
console.log(`5. git add, commit, push`);
