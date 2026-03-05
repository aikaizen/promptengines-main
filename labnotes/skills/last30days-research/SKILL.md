---
skill_id: last30days-research
version: 1.0.0
status: draft
author: mvanhorn (imported)
date: 2026-03-05
purpose: Research recent events, commits, and activity across a time window
applies_to:
  - Research summaries
  - Build stream analysis
  - Activity retrospectives
type: research-framework
---

# Last 30 Days Research Skill

Imported from: https://github.com/mvanhorn/last30days-skill

## Purpose

Conduct structured research over a defined time window (default: last 30 days). 
Useful for retrospectives, build stream summaries, and activity analysis.

## Activation

**Trigger phrase:** "Research last 30 days" or "last30days analysis"

**Parameters:**
- `days` — Number of days to look back (default: 30)
- `scope` — What to research (commits, articles, external, all)
- `output_format` — Summary, detailed, or bullet points

## Process

1. **Define window** — Calculate date range from today
2. **Collect sources**:
   - Git commits across all repos
   - Lab articles published
   - External sources (if specified)
3. **Categorize** — Group by type, theme, impact
4. **Synthesize** — Identify patterns, blockers, wins
5. **Output** — Structured summary with recommendations

## Output Format

```markdown
# Last 30 Days — [Date Range]

## Summary
- X commits across Y repos
- Z articles published
- [Key theme]

## By Category

### Commits
[Grouped by type: feat, fix, content, refactor]

### Articles
[List with links]

### Patterns
[Observations]

## Blockers Resolved
[What was stuck and how it was fixed]

## Next 30 Days
[Priorities based on trajectory]
```

## Integration with Build Stream

The skill can auto-generate daily stream articles when combined with:
- `scripts/prepare-stream-data.js` (commit data)
- GitHub Actions trigger (daily schedule)
- Human synthesis (narrative writing)

## Usage Example

```
User: "Research last 30 days of activity"
Andy: [Runs skill]
→ Collects commits from 2026-02-04 to 2026-03-05
→ Groups by type (feat: 12, fix: 8, content: 15)
→ Identifies theme: "Lab infrastructure + build automation"
→ Outputs structured summary
```

---

**Status:** Integrated, ready for invocation  
**Location:** Workspace skill library  
**Depends on:** Git feed data, commit history
