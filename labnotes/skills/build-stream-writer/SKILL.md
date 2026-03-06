---
skill_id: build-stream-writer
version: 1.0.0
status: stable
author: Andy Stable (AI) & Human Co-Author
date: 2026-03-06
purpose: Write high-signal build stream content from actual git commit data — no hallucination, only deduction
applies_to:
  - labnotes/build-stream/
  - Daily/weekly commit analysis
  - Build intelligence documentation
type: writing-framework
---

# Build Stream Writer Skill

## Purpose

Transform raw git commit data into insightful build stream content for lab.promptengines.com. 

**Core principle:** Only write what can be derived from the commits. No invented facts. No synthetic metrics. Deduction and pattern recognition only.

## Activation

**Trigger:** When daily/weekly build stream article is needed
**Input:** Git commit log (with hashes, messages, timestamps, authors)
**Output:** Markdown + HTML article for labnotes/build-stream/

## Data Sources (Use These Only)

1. **Git commit log** — Primary source
   ```bash
   git log --since="YYYY-MM-DD" --until="YYYY-MM-DD" --format="%h|%ad|%s|%an" --date=short
   ```

2. **GitHub Activity Feed** — Secondary source (if available)
   - Workflow-generated data files
   - Cross-repo commit aggregation

3. **File change statistics** — When provided
   - Lines changed
   - Files modified
   - But NEVER invent these numbers

## Prohibited (Hallucination Traps)

❌ **NEVER:**
- Invent commit counts ("47 commits this week")
- Guess file change statistics
- Assume author intent without evidence in commit message
- Claim deployments happened without verification
- Attribute emotions/motivations to developers
- Use phrases like "the team was excited about"

✅ **ALWAYS:**
- Count commits explicitly from log
- Quote actual commit messages
- Note when data is incomplete ("promptengines-main only; other repos not accessible")
- Distinguish observation from speculation
- Use hedging language for deductions ("suggests", "indicates", "pattern implies")

## Analysis Framework

### Step 1: Temporal Analysis
- Group commits by time period (morning/afternoon/evening)
- Identify clusters of related work
- Note gaps or bursts of activity

### Step 2: Type Classification
Categorize each commit by conventional commit prefix:
- `feat` — New capabilities
- `fix` — Bug fixes
- `content` — Documentation, articles
- `chore` — Maintenance, automation
- `refactor` — Code restructuring
- `docs` — Documentation-only
- `security` — Security fixes
- `hardening` — Infrastructure/security improvements

Calculate ratios. What dominates?

### Step 3: Pattern Recognition (Deduction Zone)

**What patterns can you legitimately deduce?**

1. **Iteration patterns:**
   - Sequence: `ab784ea` (API) → `abfec26` (HTML) → `323f510` (interactive)
   - Deduction: "Three iterations to get right. Built incrementally."

2. **Response patterns:**
   - External input (moritzkremb thread) → Immediate commits
   - Deduction: "Reactive hardening based on external intelligence"

3. **Priority patterns:**
   - Infrastructure commits precede content commits
   - Deduction: "Meta-work before work itself"

4. **Cost patterns:**
   - GitHub Actions + API + Vercel mentioned
   - Deduction: "Zero marginal cost architecture"

5. **Deployment gaps:**
   - Commits exist but site shows 404
   - Deduction: "Tracking solved, shipping bottlenecked"

**Template for deductions:**
```
[Observation from commits] + [Logical inference] = [Deduction with hedging]
```

Example:
> Commits show API integration (`ab784ea`), then HTML generation (`abfec26`), then interactive features (`323f510`). This three-phase sequence suggests the system was built incrementally rather than in a single push.

## Article Structure

```markdown
---
title: "Build Stream — {Date}"
date: {YYYY-MM-DD}
author: "Andy Stable (AI) & Human Co-Author"
category: Build Stream
tags: [derived from commit types]
status: published
---

# Build Stream — {Date}

**Commits:** {actual count from log}  
**Files changed:** {if known, otherwise omit}  
**Focus:** {1-2 sentence summary derived from commit messages}

---

## What the Commits Show

### {Time Period}: {Theme from commits}

Present commits in chronological or thematic groups. Include:
- Commit hash (short)
- Type
- Actual commit message (or condensed version)
- What changed

Use tables for multiple commits:

| Time | Commit | Type | What Changed |
|------|--------|------|--------------|
| 19:32 | `323f510` | feat | Repo/type/ratio charts |

### {Next Time Period}
...

---

## By The Numbers

**Commit type distribution:**

| Type | Count | % | Purpose |
|------|-------|---|----------|
| feat | 5 | 38% | New capabilities |
| chore | 4 | 31% | Automation |
| ... | ... | ... | ... |

**Dominant pattern:** {Observation from distribution}

---

## Deduced Patterns

### 1. {Pattern Name}
[Observation] + [Inference] = [Deduction]

### 2. {Pattern Name}
...

---

## Technical Artifacts Created

| Path | Lines | Purpose |
|------|-------|---------|
| `scripts/build-stream-html.js` | 873 | HTML generator |
| ... | ... | ... |

(Only if file stats are available from commit data)

---

## What to Watch Next

- Specific upcoming events based on commit trajectory
- Automation triggers
- Deployment resolution
- Cross-repo propagation

---

**Source:** Git commits {first_hash} through {last_hash} from {repo}
**Generated:** {Date} from actual commit data — no synthetic facts
```

## Quality Checklist

Before publishing, verify:

- [ ] All commit hashes are real and from the log
- [ ] All commit messages match actual messages (may be condensed)
- [ ] No invented statistics (counts derived from explicit enumeration)
- [ ] Deductions marked as such ("suggests", "indicates", "implies")
- [ ] No attribution of emotion/motivation
- [ ] Deployment status verified or noted as uncertain
- [ ] Cross-repo scope clearly stated (which repos were accessible)

## Example: Good vs Bad Deductions

**BAD (Hallucination):**
> The team was excited about the new build stream system and worked late into the night to get it done.

**GOOD (Deduction):**
> Commits `323f510`, `1cd2f37`, and `53f89d8` all landed at 19:32 UTC — a burst of activity suggesting focused, uninterrupted work on the build stream visualization features.

**BAD (Invented):**
> 47 commits this week across all repos, showing intense development velocity.

**GOOD (Counted):**
> 18 commits in promptengines-main (the only repo accessible for this analysis). Pattern suggests focused, single-repo work rather than distributed development.

**BAD (Assumed):**
> The deployment went smoothly and all features are now live.

**GOOD (Verified):**
> Commits `d62c664` and `d6d42ef` exist in the repository but return 404 on the live site. The deployment pipeline shows a tracking/shipping disconnect.

## Output

Produce two files:
1. `{YYYY-MM-DD}-build-stream.md` — Markdown source with frontmatter
2. `{YYYY-MM-DD}-build-stream.html` — Full HTML with Lab styling

Commit both atomically with descriptive message citing commit range analyzed.

---

## Local Notes

**Current implementation status:**
- Skill created: 2026-03-06
- Tested on: March 6, 2026 commit stream (18 commits)
- Result: Article `2026-03-06-build-stream.html` created

**Dependencies:**
- Git commit log access
- Markdown processing (marked library available)
- HTML template with Lab styling

**Next iteration:**
- Test on weekly aggregation (cross-repo)
- Validate against GitHub Activity Feed data
- Refine pattern recognition heuristics
