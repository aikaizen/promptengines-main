/**
 * Write Stream Article Helper
 * 
 * Reads the prepared data and generates a starter template
 * for the human to complete with narrative and analysis.
 */

const fs = require('fs');
const path = require('path');

const date = new Date().toISOString().split('T')[0];
const dataPath = path.join(__dirname, '..', 'labnotes', 'build-stream', `.data-${date}.json`);
const draftPath = path.join(__dirname, '..', 'labnotes', 'build-stream', `.draft-${date}.md`);

if (!fs.existsSync(dataPath)) {
  console.error(`No data file found for ${date}`);
  console.error(`Expected: ${dataPath}`);
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

// Group commits by type
const byType = {};
data.commits.forEach(c => {
  if (!byType[c.type]) byType[c.type] = [];
  byType[c.type].push(c);
});

// Generate sections based on commit types
const sections = [];

if (byType.feat?.length) {
  sections.push(`### Features Built (${byType.feat.length})
${byType.feat.map(c => `- **${c.shortHash}** — ${c.subject.replace(/^feat(\(.+\))?: /, '')}`).join('\n')}`);
}

if (byType.content?.length) {
  sections.push(`### Content Published (${byType.content.length})
${byType.content.map(c => `- **${c.shortHash}** — ${c.subject.replace(/^content(\(.+\))?: /, '')}`).join('\n')}`);
}

if (byType.fix?.length) {
  sections.push(`### Fixes (${byType.fix.length})
${byType.fix.map(c => `- **${c.shortHash}** — ${c.subject.replace(/^fix(\(.+\))?: /, '')}`).join('\n')}`);
}

if (byType.refactor?.length) {
  sections.push(`### Refactoring (${byType.refactor.length})
${byType.refactor.map(c => `- **${c.shortHash}** — ${c.subject.replace(/^refactor(\(.+\))?: /, '')}`).join('\n')}`);
}

if (byType.docs?.length) {
  sections.push(`### Documentation (${byType.docs.length})
${byType.docs.map(c => `- **${c.shortHash}** — ${c.subject.replace(/^docs(\(.+\))?: /, '')}`).join('\n')}`);
}

const template = `---
title: "Build Stream — ${data.date}"
date: ${data.date}
author: "Andy Stable (AI) & Human Co-Author"
category: Build Stream
tags: [${data.summary.primaryTypes.map(t => t[0]).join(', ')}]
status: draft
---

# Build Stream — ${data.date}

**Commits:** ${data.stats.total}  
**Active:** ${data.summary.activeAuthors.join(', ')}

---

## What We Built

${sections.join('\n\n')}

---

## Patterns

<!-- Look for patterns across commits:
- Atomic commits maintained?
- Design consistency?
- Documentation as feature?
- Any anti-patterns?
-->

## What Blocked

<!-- Document honest failures, not just successes -->

## Tomorrow

<!-- Preview next priorities based on commit trajectory -->

---

**Source:** Git feed from aikaizen/promptengines-main  
**Generated:** ${new Date().toISOString()}
`;

const outputPath = path.join(__dirname, '..', 'labnotes', 'build-stream', `${data.date}.md`);
fs.writeFileSync(outputPath, template);

console.log(`Generated starter: ${outputPath}`);
console.log(`\nNext steps:`);
console.log(`1. Read and edit ${outputPath}`);
console.log(`2. Fill in Patterns, What Blocked, Tomorrow sections`);
console.log(`3. Change status from draft to published`);
console.log(`4. Delete .draft-${data.date}.md and .data-${data.date}.json`);
console.log(`5. git add, commit, push`);
