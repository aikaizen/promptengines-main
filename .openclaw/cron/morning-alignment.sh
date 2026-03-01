#!/bin/bash
# Morning Alignment Cron — Runs daily at 8am
# Purpose: Prevent drift by enforcing context reload and priority check

cd /home/stableclaw/.openclaw/workspace

echo "=== MORNING ALIGNMENT $(date) ==="

# 1. Load VISION.md (enforce priority hierarchy)
echo "[PRIORITY CHECK] StoryBook Studio status:"
grep -A 5 "StoryBook Studio" VISION.md | head -6

# 2. Check for blockers requiring human action
echo ""
echo "[BLOCKERS] Items needing your action:"
grep -E "^- \[ \]" projects/storybookstudio/TODO.md | grep -E "(Buy domain|Rotate|Set up email|Provide founder)" | head -5

# 3. Daily progress check
echo ""
echo "[PROGRESS] Yesterday's commits:"
git log --oneline --since="yesterday" --author="stableclaw" 2>/dev/null || echo "No commits yesterday"

# 4. Priority enforcement
echo ""
echo "[ENFORCEMENT] Today's rule: StoryBook Studio before all else"

# 5. Log to memory
echo "$(date '+%Y-%m-%d %H:%M') | Morning alignment complete" >> memory/$(date +%Y-%m-%d).md 2>/dev/null || true

echo "=== END ==="
