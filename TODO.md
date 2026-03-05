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

## 🟡 Medium Priority: Article Format Fix

### Convert March 3 Articles to HTML
Current: `.md` files (404 on live site)
Target: `.html` files with Lab styling

**Files needing conversion:**
- `2026-03-03-model-selection-framework.md`
- `2026-03-03-api-provider-framework.md`
- `2026-03-03-just-talk-to-it.md`
- `2026-03-03-just-rebuild-it.md`
- `2026-03-03-zen-and-the-art-of-vibecoding.md`

**Template:** Use `2026-03-04-openrag-deployment-docker-blockers.html` structure

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

**Created:** March 5, 2026  
**Last Updated:** March 5, 2026 — 10:28 PM UTC

---

## 🆕 New Tasks

### ✅ X Post — moritzkremb OpenClaw Hardening Guide
**Status:** Content received, skill created, implementation tracking  
**URL:** https://x.com/moritzkremb/status/2029304864719667335

**Skill created:** `labnotes/skills/openclaw-hardening/SKILL.md`

**Implementation checklist for this workspace:**
- [ ] 0) Install clawddocs skill (troubleshooting baseline)
- [ ] 2) Memory flow — verify MEMORY.md + daily files working
- [ ] 3) Model fallbacks — add to config
- [ ] 4) **Secrets → env file** (currently in files — CRITICAL)
- [ ] 5) Telegram optimizations (allowlists, topic prompts)
- [ ] 6) **Brave API key** (missing — blocks web search)
- [ ] 7) Cron health checks — add to HEARTBEAT.md
- [ ] 8) Operational accounts — create agent-owned GitHub/Google
- [ ] 9) Install summarize skill
