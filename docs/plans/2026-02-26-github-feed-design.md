# GitHub Activity Feed Generator Design

## Summary

Build-time Node.js script that fetches recent commits from all repos in the `aikaizen` GitHub org and injects them as activity cards into all theme variant HTML files.

## Architecture

- `scripts/generate-feed.js` reads `GITHUB_TOKEN` from env
- Fetches all repos from `aikaizen` org via GitHub REST API (Octokit)
- For each repo, fetches 5 most recent commits on default branch
- Sorts all commits by date, takes top 6
- Generates HTML activity cards matching existing `.activity-card` structure
- Replaces content between `<!-- FEED:START -->` / `<!-- FEED:END -->` markers in all HTML files

## Card Mapping

| Field | Source |
|-------|--------|
| Timestamp | Relative time from commit date (e.g., "3 days ago") |
| Category | Repo name (e.g., "kaizen", "storybook-studio") |
| Title | First line of commit message |
| Description | Commit message body (lines after first), or empty |
| Link | Product subdomain if known repo, otherwise GitHub commit URL |

## Product URL Map

| Repo name | Link |
|-----------|------|
| kaizen | https://kaizen.promptengines.com |
| storybook-studio | https://storybookstudio.promptengines.com |
| flow | https://flow.promptengines.com |
| consulting | https://consulting.promptengines.com |
| dashboard | https://dashboard.promptengines.com |
| (other) | GitHub commit permalink |

## Usage

```bash
GITHUB_TOKEN=ghp_xxx node scripts/generate-feed.js
```

## Files

- Create: `scripts/generate-feed.js`
- Create: `package.json` (if needed, for octokit dependency)
- Modify: `index.html`, `v1-v6.html` - add feed markers around activity-grid content

## Scope

- No CSS changes
- No other HTML changes beyond the activity-grid content
- Token stays in env, never committed
