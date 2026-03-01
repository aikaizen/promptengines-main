#!/bin/bash
# Weekly Priority Audit — Runs Sundays at 6pm
# Purpose: Catch drift before it compounds

cd /home/stableclaw/.openclaw/workspace

echo "=== WEEKLY AUDIT $(date) ==="

# 1. Update DASHBOARD timestamp
sed -i "s/Last updated:.*/Last updated: $(date '+%Y-%m-%d %H:%M UTC')/" DASHBOARD.md

# 2. Check project health
SBS_ITEMS=$(grep -c "^- \[ \]" projects/storybookstudio/TODO.md 2>/dev/null || echo "0")
LAB_ITEMS=$(grep -c "^- \[ \]" projects/lab/TODO.md 2>/dev/null || echo "0")

echo "StoryBook Studio open tasks: $SBS_ITEMS"
echo "Lab open tasks: $LAB_ITEMS"

# 3. Drift detection — are we working on wrong priorities?
LAST_SBS_COMMIT=$(git log --since="1 week ago" --oneline -- projects/storybookstudio/ | wc -l)
LAST_LAB_COMMIT=$(git log --since="1 week ago" --oneline -- projects/lab/ | wc -l)

echo "SBS commits this week: $LAST_SBS_COMMIT"
echo "Lab commits this week: $LAST_LAB_COMMIT"

if [ "$LAST_SBS_COMMIT" -lt 2 ] && [ "$SBS_ITEMS" -gt 5 ]; then
    echo "⚠️ DRIFT DETECTED: Low SBS activity despite open tasks"
    echo "REMINDER: StoryBook Studio is CRITICAL priority"
fi

# 4. Security check — any exposed credentials?
if grep -r "github_pat_" . --include="*.md" 2>/dev/null | grep -v ".git"; then
    echo "🚨 SECURITY: Exposed GitHub PATs found in markdown files"
fi

# 5. Commit dashboard update
git add DASHBOARD.md && git commit -m "chore(dashboard): weekly audit $(date +%Y-%m-%d)" 2>/dev/null || true

echo "=== END ==="
