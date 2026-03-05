# Git Feed → Markdown

This directory contains individual markdown files for each commit from the Prompt Engines git feed.

## Format

Each file is named: `YYYY-MM-DD-{short-hash}.md`

Frontmatter includes:
- `hash` - Full commit SHA
- `date` - ISO 8601 timestamp
- `author` - Commit author
- `repo` - Repository name
- `branch` - Branch name

## Purpose

Raw commit data preserved for:
1. Daily stream article generation
2. Historical search and analysis
3. Build pattern research

## Source

Generated from: `git log --all --pretty=format:'%H|%ci|%s|%an|%ae'`
Across all aikaizen repositories.

## Automation

Should be automated via GitHub Action similar to `scripts/generate-feed.js` but outputting markdown to this directory instead of injecting HTML.

---

**Last updated:** March 5, 2026
