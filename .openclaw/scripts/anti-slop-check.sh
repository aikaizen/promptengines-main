#!/bin/bash
# Anti-Slop Pre-Flight Check
# Run before shipping any external-facing content

CONTENT="$1"
if [ -z "$CONTENT" ]; then
    echo "Usage: $0 '<content>'"
    exit 1
fi

ERRORS=0

echo "=== ANTI-SLOP CHECK ==="

# Check 1: No "In today's rapidly evolving landscape..."
if echo "$CONTENT" | grep -qi "today's rapidly evolving"; then
    echo "❌ FAIL: Hedging preamble detected"
    ((ERRORS++))
fi

# Check 2: No "This is not a consultancy"
if echo "$CONTENT" | grep -qi "not a consultancy"; then
    echo "❌ FAIL: Denial of Commerce pattern"
    ((ERRORS++))
fi

# Check 3: No "The old categories dissolve"
if echo "$CONTENT" | grep -qi "old categories dissolve"; then
    echo "❌ FAIL: Symbiosis Sermon detected"
    ((ERRORS++))
fi

# Check 4: No excessive adjectives (vibe stacks)
ADJ_COUNT=$(echo "$CONTENT" | grep -oE '\b(groundbreaking|transformative|revolutionary|synergistic|innovative|disruptive)\b' | wc -l)
if [ "$ADJ_COUNT" -gt 3 ]; then
    echo "❌ FAIL: Vibe Adjective Stack ($ADJ_COUNT hype words)"
    ((ERRORS++))
fi

# Check 5: Specific data present?
if ! echo "$CONTENT" | grep -qE '[0-9]+%|[0-9]+ (users|customers|minutes|hours|days)'; then
    echo "⚠️ WARNING: No quantified metrics found"
    # Not a fail, just warning
fi

# Check 6: First-person agentic self-reference
if echo "$CONTENT" | grep -qiE "As an AI|I am an AI|As a language model"; then
    echo "❌ FAIL: Agentic Self-Reference"
    ((ERRORS++))
fi

# Result
if [ $ERRORS -eq 0 ]; then
    echo "✅ PASS: Anti-slop clean"
    exit 0
else
    echo "🚫 FAILED: $ERRORS slop patterns detected"
    exit 1
fi
