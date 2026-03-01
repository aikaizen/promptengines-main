#!/bin/bash
# Startup Protocol — Run at beginning of every session
# Purpose: Ensure context is loaded before any work begins

echo "🚀 SESSION STARTUP PROTOCOL"
echo ""

# 1. Verify we're in workspace
cd /home/stableclaw/.openclaw/workspace || exit 1

# 2. Load VISION.md (mandatory)
echo "📋 Loading VISION.md..."
if [ -f VISION.md ]; then
    echo "   ✓ VISION.md found"
    # Show priority summary
    grep -A 2 "The Three Projects" VISION.md | tail -3
else
    echo "   ❌ VISION.md missing — drift management broken"
fi

# 3. Check for daily memory file
TODAY=$(date +%Y-%m-%d)
if [ ! -f memory/$TODAY.md ]; then
    echo ""
    echo "📝 Creating memory/$TODAY.md..."
    echo "# $TODAY — Daily Log" > memory/$TODAY.md
    echo "" >> memory/$TODAY.md
    echo "## 🎯 Priority" >> memory/$TODAY.md
    echo "" >> memory/$TODAY.md
    echo "StoryBook Studio: ___" >> memory/$TODAY.md
    echo "" >> memory/$TODAY.md
    echo "## ✅ Completed" >> memory/$TODAY.md
    echo "" >> memory/$TODAY.md
    echo "- [ ] " >> memory/$TODAY.md
    echo "   ✓ Created memory/$TODAY.md"
fi

# 4. Show current blockers
echo ""
echo "🔴 BLOCKERS requiring human action:"
grep -E "^- \[ \]" projects/storybookstudio/TODO.md 2>/dev/null | grep -E "(Buy domain|Rotate|Set up email|Provide founder|GitHub access|Google OAuth)" | head -3 || echo "   None logged"

# 5. Priority enforcement check
echo ""
echo "⚡ ENFORCEMENT: StoryBook Studio is 🔴 CRITICAL priority"
echo "   → All other work is filler when SBS is blocked"
echo "   → Check session-checkin.md before proceeding"

echo ""
echo "✅ Startup complete. Ready to work."
