# TODO — Build Stream & Article Deployment

## 🚨 Critical: Articles Not Publishing

**Problem:** March articles (OpenRAG, Public APIs) are committed to GitHub but not showing on live site (404).

**Root Cause:** `vercel.json` has `github: { enabled: false }` — auto-deploy disabled.

**Status:** Files pushed to GitHub at `2026-03-05T03:43:21Z` but Vercel not deploying them.

---

## Required Actions

### 1. Enable Vercel Auto-Deploy (One-time fix)

**Option A — Update vercel.json:**
```json
{
  "github": {
    "enabled": true
  }
}
```

**Option B — Vercel Dashboard:**
1. Go to https://vercel.com/dashboard
2. Select promptengines-main project
3. Settings → Git
4. Enable "Redeploy on every push"

### 2. Deploy Current Articles (Immediate)

After enabling auto-deploy, or manually:
```bash
# In promptengines-main directory
vercel --prod
```

Or trigger deploy from Vercel dashboard.

---

## Articles Ready for Deploy

| Article | File | Status |
|---------|------|--------|
| OpenRAG Deployment | 2026-03-04-openrag-deployment-docker-blockers.html | ✅ In git, needs deploy |
| Public APIs Review | 2026-03-04-public-apis-usefulness-review.html | ✅ In git, needs deploy |
| Model Selection Framework | 2026-03-03-model-selection-framework.md | ⚠️ Still .md, needs HTML conversion |
| API Provider Framework | 2026-03-03-api-provider-framework.md | ⚠️ Still .md, needs HTML conversion |
| Just Talk To It | 2026-03-03-just-talk-to-it.md | ⚠️ Still .md, needs HTML conversion |
| Just Rebuild It | 2026-03-03-just-rebuild-it.md | ⚠️ Still .md, needs HTML conversion |
| Zen of Vibecoding | 2026-03-03-zen-and-the-art-of-vibecoding.md | ⚠️ Still .md, needs HTML conversion |

---

## Build Stream Automation (Pending)

**Option B implemented:** Trigger + human review

**Created:**
- `scripts/prepare-stream-data.js` — Fetches commits, generates JSON
- `scripts/write-stream-article.js` — Creates starter template
- `HEARTBEAT.md` — Check for `.draft-*.md` files

**Blocked:** GitHub Actions workflow needs `workflow` scope PAT
- File saved to: `Portal/daily-stream-trigger.yml`
- Needs manual install via GitHub web UI or new PAT

**Process when working:**
1. GitHub Action runs at 11:55 PM UTC
2. Creates `.draft-YYYY-MM-DD.md` trigger file
3. Andy checks heartbeat, writes article
4. Commits finished article
5. Deletes trigger files

---

## Summary

| Task | Status | Blocker |
|------|--------|---------|
| Convert March 3 .md → .html | ⚠️ Pending | Time/effort |
| Deploy March 4+ articles | ⚠️ Ready | Vercel auto-deploy disabled |
| Enable Vercel GitHub integration | ❌ Not started | Needs vercel.json change or dashboard |
| Build stream automation | ✅ Scripts ready | Workflow needs install |

---

**Next Step:** Enable Vercel GitHub integration so pushes auto-deploy.
