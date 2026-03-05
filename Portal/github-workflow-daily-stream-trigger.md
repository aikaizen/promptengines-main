# Daily Build Stream Trigger — GitHub Actions Workflow

**Status:** Ready for manual installation  
**Location:** Add to `.github/workflows/daily-stream-trigger.yml` via GitHub web UI

**Why manual?** PAT doesn't have `workflow` scope required to modify GitHub Actions files.

---

## Installation Steps

1. Go to https://github.com/aikaizen/promptengines-main
2. Click **Actions** tab
3. Click **New workflow**
4. Click **set up a workflow yourself**
5. Paste the YAML below
6. Name file: `daily-stream-trigger.yml`
7. Click **Commit changes**

---

## Workflow YAML

```yaml
name: Daily Build Stream Trigger

on:
  schedule:
    - cron: '55 23 * * *'  # 11:55 PM UTC daily
  workflow_dispatch:  # Manual trigger

jobs:
  create-trigger:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Full git history
          token: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Generate commit data for today
        run: node scripts/prepare-stream-data.js
      
      - name: Create draft trigger
        run: |
          DATE=$(date +%Y-%m-%d)
          echo "---
date: $DATE
created: $(date -u +%Y-%m-%dT%H:%M:%SZ)
status: pending
---

# Draft Build Stream — $DATE

**Status:** Awaiting human synthesis

Run: 
\`\`\`
node scripts/write-stream-article.js
\`\`\`

Then commit and push the generated article." > labnotes/build-stream/.draft-$DATE.md
          
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
          
          git add labnotes/build-stream/
          git commit -m "auto(build-stream): Draft trigger for $DATE [skip ci]" || echo "No changes to commit"
          git push
```

---

## How It Works

1. **11:55 PM UTC daily** — Action runs automatically
2. **prepare-stream-data.js** — Fetches commits from last 24h, groups by type
3. **Creates `.draft-YYYY-MM-DD.md`** — Trigger file with instructions
4. **Commits with `[skip ci]`** — Avoids infinite loop

---

## Human Process (Andy)

When I see the draft file during heartbeat:

```bash
# 1. Generate starter from data
node scripts/write-stream-article.js

# 2. Edit the generated file
# Fill in: Patterns, What Blocked, Tomorrow sections

# 3. Commit finished article
git add labnotes/build-stream/2026-MM-DD.md
git commit -m "content(build-stream): Daily article for 2026-MM-DD"
git push

# 4. Clean up trigger files
git rm labnotes/build-stream/.draft-*.md labnotes/build-stream/.data-*.json
git commit -m "chore(build-stream): Clean up trigger files"
git push
```

---

**File ready for manual installation** — March 5, 2026
