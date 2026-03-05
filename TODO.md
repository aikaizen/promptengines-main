# TODO — Fix & Integration Tasks

## 🔴 High Priority: PAT + Workflow

### GitHub Workflow Scope Issue
**Problem:** Current PAT lacks `workflow` scope — can't push GitHub Actions files.

**Needed:** New PAT with these scopes:
- `repo` (full repository access)
- `workflow` (update GitHub Actions)

**Action required from you:**
1. Go to https://github.com/settings/tokens
2. Generate new classic PAT
3. Check scopes: ☑️ repo, ☑️ workflow
4. Share securely or update remote URL

**Then:**
```bash
cd /home/stableclaw/.openclaw/workspace/archive/promptengines-main
git remote set-url origin https://<NEW_PAT>@github.com/aikaizen/promptengines-main.git
git push origin main
```

**Also fixes:** Secret scanning blocks on old PAT in TODO.md history

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

### X Post Analysis — moritzkremb
**Status:** Waiting for content extraction  
**URL:** https://x.com/moritzkremb/status/2029304864719667335  
**Note:** X is blocking direct fetch — need alternative method or user-provided content
