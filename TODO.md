# TODO — Fix & Integration Tasks

## 🔴 High Priority: PAT + Workflow

### GitHub Workflow Scope Issue — ⏳ STILL PENDING
**Problem:** Current PAT lacks `workflow` scope — can't push GitHub Actions files.

**Needed:** New PAT with these scopes:
- ☑️ `repo` (full repository access) — ✅ Current PAT has this
- ☑️ `workflow` (update GitHub Actions workflows) — ❌ **MISSING**

**Status:** 
- Workspace repo pushes: ✅ Working (history rewrite fixed secret scanning)
- `promptengines-main` content pushes: ✅ Working  
- Workflow file push: ❌ Blocked — needs `workflow` scope

**Action required from you:**
1. Go to https://github.com/settings/tokens
2. Generate new **classic PAT** (not fine-grained)
3. Check scopes: ☑️ repo, ☑️ **workflow**
4. Share securely or update remote URL yourself:
   ```bash
   cd /home/stableclaw/.openclaw/workspace/archive/promptengines-main
   git remote set-url origin https://<NEW_PAT_WITH_WORKFLOW>@github.com/aikaizen/promptengines-main.git
   git push origin main
   ```

**Workflow file ready:** `08129c6` — committed locally, waiting for push

---

## 🟡 Medium Priority: Article Format Fix — ✅ DONE

### Convert March 3 Articles to HTML
**Status:** COMPLETED — All 5 articles converted to HTML

**Commit:** `f98aff8` — content(lab): Convert March 3 articles to HTML format

**Converted:**
- ✅ `2026-03-03-model-selection-framework.html`
- ✅ `2026-03-03-api-provider-framework.html`
- ✅ `2026-03-03-just-talk-to-it.html`
- ✅ `2026-03-03-just-rebuild-it.html`
- ✅ `2026-03-03-zen-and-the-art-of-vibecoding.html`

**Note:** .md originals preserved. Can delete after verifying HTML works on live site.

---

## 🔴 CURRENT BLOCKER: Article Publishing

### Why Articles Aren't Live on lab.promptengines.com

**Root cause:** `vercel.json` has `github: { enabled: false }`

**Effect:** GitHub pushes don't trigger Vercel deploy

**All articles are committed but not deployed:**
- March 3 HTML files: `f98aff8` (5 articles)
- March 4 HTML files: `05804a7`, `69779e7` (2 articles)

**To publish:**
1. **Option A (Recommended):** Enable GitHub integration
   ```json
   // vercel.json
   { "github": { "enabled": true } }
   ```
   Then push → auto-deploy

2. **Option B (Manual):** Run `npx vercel --prod` in archive/promptengines-main

3. **Option C (Dashboard):** Trigger manual deploy via Vercel web UI

---

## 🟢 Low Priority: Vercel Auto-Deploy

### Enable GitHub Integration
**Current:** `vercel.json` has `github: { enabled: false }`
**Effect:** Pushes don't auto-deploy

**Fix:**
```json
{
  "github": {
    "enabled": true
  }
}
```

**Or:** Manual deploy via `npx vercel --prod` or dashboard trigger

---

## 🔴 DEPLOYMENT — Manual Vercel Deploy Needed

**Issue:** GitHub integration not triggering builds despite `vercel.json: github.enabled: true`

**Likely cause:** Project-level GitHub disconnect in Vercel dashboard

**Immediate fix:**
```bash
cd /home/stableclaw/.openclaw/workspace/archive/promptengines-main
npx vercel --prod
```

**Long-term fix:** Check Vercel dashboard → Settings → Git → Reconnect GitHub

**Blocked articles:** 7 HTML articles committed but not live (404)

---

**Created:** March 5, 2026  
**Last Updated:** March 5, 2026 — 11:40 PM UTC

---

## 🆕 New Tasks

### ✅ X Post — moritzkremb OpenClaw Hardening Guide
**Status:** IMPLEMENTED — 7/9 items complete  
**URL:** https://x.com/moritzkremb/status/2029304864719667335

**Skill created:** `labnotes/skills/openclaw-hardening/SKILL.md`

**Implementation completed:**
| Item | Status |
|------|--------|
| 0) Brew installed | ✅ 5.0.16 |
| 0) clawddocs skill | ⏳ Rate limited — retry later |
| 1) Personalization | ✅ SOUL/USER/IDENTITY done |
| 2) Memory flow | ✅ Working |
| 3) Model fallbacks | ✅ 3-tier stack configured |
| 4) Secrets → env file | ✅ `~/.openclaw/secrets/` (700/600 perms) |
| 5) Telegram | ✅ Already configured |
| 6) Brave API | ⏳ Template ready — needs key (free tier) |
| 7) Cron health checks | ✅ Added to HEARTBEAT.md |
| 8) Operational accounts | ⏳ Optional free accounts |
| 9) Summarize skill | ✅ Installed via cargo (v0.2.0) |

**Action needed from you:**
- Get free Brave API key: https://api.search.brave.com/app/engines/web/pages (2,000 queries/month)
