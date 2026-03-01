# Drift Management — Setup Instructions

## Overview
Systems to prevent priority drift and context loss across sessions.

---

## Files Created

| File | Purpose | When Used |
|------|---------|-----------|
| `VISION.md` | Master context, priority hierarchy | Every session start |
| `DASHBOARD.md` | Weekly status snapshot | Review Sundays |
| `.openclaw/cron/morning-alignment.sh` | Daily priority check | 8am daily (cron) |
| `.openclaw/cron/weekly-audit.sh` | Drift detection, security check | 6pm Sundays (cron) |
| `.openclaw/scripts/startup.sh` | Session initialization | Manual or auto-start |
| `.openclaw/scripts/anti-slop-check.sh` | Content quality gate | Before shipping |
| `.openclaw/templates/session-checkin.md` | Priority enforcement | Every work session |
| `.openclaw/DRIFT-LOG.md` | Pattern tracking | When drift occurs |

---

## To Activate (One-Time Setup)

### 1. Make Scripts Executable
```bash
cd /home/stableclaw/.openclaw/workspace
chmod +x .openclaw/scripts/*.sh
chmod +x .openclaw/cron/*.sh
```

### 2. Add Cron Jobs
```bash
# Edit crontab
crontab -e

# Add these lines:
# Morning alignment — daily 8am
0 8 * * * /home/stableclaw/.openclaw/workspace/.openclaw/cron/morning-alignment.sh >> /home/stableclaw/.openclaw/workspace/.openclaw/cron/logs/morning.log 2>&1

# Weekly audit — Sundays 6pm
0 18 * * 0 /home/stableclaw/.openclaw/workspace/.openclaw/cron/weekly-audit.sh >> /home/stableclaw/.openclaw/workspace/.openclaw/cron/logs/weekly.log 2>&1
```

### 3. Create Log Directory
```bash
mkdir -p .openclaw/cron/logs
```

### 4. Test Scripts
```bash
# Test startup
.openclaw/scripts/startup.sh

# Test anti-slop check
.openclaw/scripts/anti-slop-check.sh "This is not a consultancy"
# Should output: ❌ FAIL: Denial of Commerce pattern
```

---

## Daily Workflow

1. **Session Start**:
   - Run `.openclaw/scripts/startup.sh` (or auto-run)
   - Fill out `.openclaw/templates/session-checkin.md`
   - Confirm: "Does this serve SBS directly?"

2. **During Work**:
   - Reference `VISION.md` for priority conflicts
   - Log progress to `memory/YYYY-MM-DD.md`

3. **Before Shipping**:
   - Run `.openclaw/scripts/anti-slop-check.sh` on content
   - Verify no slop patterns

4. **End of Day**:
   - Update TODO checkboxes
   - Commit with atomic, scoped messages

---

## Weekly Review (Sundays)

1. Check `DASHBOARD.md` (auto-updated by cron)
2. Review drift log for patterns
3. Adjust priorities if needed
4. Confirm `VISION.md` still accurate

---

## Emergency Drift Protocol

If you notice I'm working on wrong priority:

1. Say: "Check VISION.md — priority drift?"
2. I'll re-read priority hierarchy
3. Confirm or adjust current work
4. Log to DRIFT-LOG.md

---

*Last updated: 2026-03-01*
