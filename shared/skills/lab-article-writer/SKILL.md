---
name: lab-article-writer
description: Write, format, and publish articles for lab.promptengines.com (Lab Notes). Use when: writing a new lab article from source material or a GitHub commit, formatting an article as HTML for the lab, pushing articles to the repo, updating the lab index, drafting experiment reports, model evaluations, architecture write-ups, or AI news analysis. This skill enforces the Lab Notes taste profile — dark zinc aesthetic, Outfit + JetBrains Mono, rigor-with-vibe editorial voice, HTML/CSS charts. NOT for blog posts, marketing copy, or social content.
---

# Lab Article Writer

Writes and publishes articles for lab.promptengines.com. Enforces taste profile and editorial standard.

## References
- **taste-profile.md** — Voice, aesthetic, visual types, what to never write. Read this before writing any article.
- **publishing-workflow.md** — File naming, category tags, index update format, pre-publish checklist, repo paths.

## Asset
- **assets/article-template.html** — Base HTML template. Always start from this.

## Quick Workflow

### From a source article (news/analysis)
1. Read source material
2. Read `references/taste-profile.md`
3. Identify the insight (not the summary) — what does this mean for builders?
4. Draft title + dek first. If the dek is weak, the article will be weak.
5. Write body (400–600 words for analysis)
6. Add 2–3 visuals (matrix or code trace for analysis pieces)
7. Check against taste-profile forbidden phrases
8. Save to `~/workspace/content/lab/drafts/YYYY-MM-DD-slug.html`
9. Flag for review via Telegram

### From a GitHub commit
1. Read commit message + diff if available
2. Classify: experiment / architecture decision / feature update / model change
3. Draft as Experiment Report or Architecture article type
4. Must include: what was tried, what was measured, what changed, why
5. Same steps 6–9

### From scratch (experiment we ran)
1. Structure as: hypothesis → method → result → learning
2. Even null results and failures are publishable
3. Be specific about what broke and why

## Non-Negotiables
- Start from `assets/article-template.html`
- Title must be specific — names the subject, implies a finding
- Dek is ONE sentence. Contains the thesis.
- At least 3 visuals per article
- No forbidden phrases (see taste-profile.md)
- Never start a section with "Introduction" or end with "Conclusion"
- Category tag from approved list in publishing-workflow.md
- File named `YYYY-MM-DD-slug.html`

## Visual Types (HTML/CSS only — no external images)
- `visual-matrix` — comparative data tables in monospace
- `visual-bars` — `<i>` elements with height% as bar chart
- `visual-code` — process traces, pipeline steps, structured output
- `visual-diagram` — placeholder for architecture flows

All visuals: numbered sequentially, descriptive caption stating what it shows.

## Repo
- Lab articles: `aikaizen/promptengines-main` → `labnotes/articles/`
- Index: `aikaizen/promptengines-main` → `labnotes/index.html`
- Push only after human approval

## Git — Atomic Commits Only
New article file + index update = two separate commits, or one commit listing both paths explicitly.

```bash
# New article (untracked):
git restore --staged :/ && git add "labnotes/articles/YYYY-MM-DD-slug.html" && git commit -m "content(lab): add article — <title>" -- labnotes/articles/YYYY-MM-DD-slug.html

# Index update (tracked):
git commit -m "chore(lab): update index for <slug>" -- labnotes/index.html
```

Never `git add .` — always list paths explicitly.

## Tone in One Line
Write like a sharp engineer who did the thing, not a journalist covering it.
