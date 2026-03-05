# TOOLS.md - Local Notes

## Git Rules — NON-NEGOTIABLE

**Atomic commits only.** One logical change per commit. List every path explicitly.

```bash
# Tracked files:
git commit -m "<scoped message>" -- path/to/file1 path/to/file2

# New (untracked) files:
git restore --staged :/ && git add "path/to/file1" "path/to/file2" && git commit -m "<scoped message>" -- path/to/file1 path/to/file2
```

- Never `git add .` or `git add -A`
- Never bundle unrelated files in one commit
- Scoped message format: `type(scope): description` e.g. `feat(lab): add character consistency article`
- Types: feat / fix / docs / chore / refactor / content

---

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## What Goes Here

Things like:

- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Examples

```markdown
### Cameras

- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH

- home-server → 192.168.1.100, user: admin

### TTS

- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

## Web Search — Brave API (Free Tier)

**Required for:** `web_search` tool, research tasks, trend analysis

**Get free API key:** https://api.search.brave.com/app/engines/web/pages
- Free tier: 2,000 queries/month
- No credit card required

**Setup:**
```bash
# Option 1: Configure via openclaw
openclaw configure --section web braveApiKey=YOUR_KEY

# Option 2: Environment variable
export BRAVE_API_KEY=YOUR_KEY
# Add to ~/.openclaw/secrets/brave.env
```

**Verify:**
```bash
web_search "test query"  # Should return results
```

---

## Lab Notes Article Format — CRITICAL

**Always write HTML articles, not Markdown.**

The Vercel-hosted lab.promptengines.com serves static HTML files. Markdown files 404.

### Article Template Location
`/home/stableclaw/.openclaw/workspace/archive/promptengines-main/labnotes/articles/YYYY-MM-DD-{slug}.html`

### Required HTML Structure
- Full HTML5 document with `<!DOCTYPE html>`
- Include Lab styles: `<link rel="stylesheet" href="../styles.css">`
- Wrap content in `<article class="section">` with `.article-content` class
- Include topbar navigation from existing articles
- Add footer from existing articles

### Never Do This
❌ Write `.md` files and assume they'll work  
❌ Skip the HTML wrapper and navigation  

### Always Do This
✅ Write complete `.html` files with full styling  
✅ Copy navigation structure from existing articles  
✅ Test by checking if HTML renders with Lab styles  

### Reference Articles
- `2026-03-04-openrag-deployment-docker-blockers.html` — Good structure example
- `2026-02-28-character-consistency-34-styles.html` — Older but valid reference

---

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

Add whatever helps you do your job. This is your cheat sheet.
