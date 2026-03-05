# HEARTBEAT.md — Andy Stable Session Checklist

Check these items when receiving a heartbeat poll. If nothing needs attention, reply HEARTBEAT_OK.

## ⏰ Daily Priority Checks

- [ ] **Build Stream Draft** — Check for `.draft-YYYY-MM-DD.md` in `labnotes/build-stream/`
  - If found: Run `node scripts/write-stream-article.js`, edit, commit
  - Delete `.draft-*.md` and `.data-*.json` after publishing

## 📅 Periodic Checks (Rotate through these)

- [ ] **Email** — Any urgent unread messages?
- [ ] **Calendar** — Upcoming events in next 24-48h?
- [ ] **Git Status** — Uncommitted changes in workspace?
- [ ] **Memory Maintenance** — Review recent daily files, update MEMORY.md

## 🎯 Project-Specific (If Active)

Flow Education Phase 1:
- [ ] Supabase project created and configured
- [ ] Database schema deployed
- [ ] Next.js 15 scaffold ready

StoryBook Studio:
- [ ] Domain purchased (storybookstudio.ai/.io)
- [ ] Landing page refinements

## 📝 Memory Maintenance (Per moritzkremb Hardening)

Every few days:
1. Read through recent `memory/YYYY-MM-DD.md` files
2. Identify significant events, lessons, insights
3. Update `MEMORY.md` with distilled learnings
4. Remove outdated info from MEMORY.md

**Daily memory rules:**
- [ ] Create today's file if missing
- [ ] Append major decisions/learnings
- [ ] Curate important items into MEMORY.md

## 🔧 Cron Health Checks (Per moritzkremb Hardening)

- [ ] Check critical cron jobs for stale `lastRunAtMs`
- [ ] If stale > threshold, report and suggest force-run
- [ ] Log brief exception reports

**Critical cron jobs to monitor:**
- `daily-stream-trigger` (build stream automation)
- Any user-defined recurring tasks

## ✅ Done Criteria

Reply HEARTBEAT_OK if:
- No draft files waiting
- No urgent emails/calendar items
- No uncommitted work
- Not time for memory review

Otherwise, report what needs attention.

---

**Last Updated:** March 5, 2026
