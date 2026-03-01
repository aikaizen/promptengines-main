# Publishing Workflow

## Repos (once write access granted)
- **Lab:** `aikaizen/promptengines-main` → `labnotes/articles/`
- **Archive:** TBD second repo
- **Index update:** `labnotes/index.html` must be updated with every new article

## File Naming Convention
`YYYY-MM-DD-slug.html`
Examples:
- `2026-02-27-codex-vs-opus-evaluation.html`
- `2026-03-01-character-consistency-storybook.html`

Slug rules: lowercase, hyphens, no special chars, descriptive not clever.

## Category Tags (use exactly one)
- `Evaluation` — model/tool comparisons
- `Architecture` — system design, technical decisions
- `Agents` — agent frameworks, multi-agent systems
- `Experiments` — hypothesis → test → result
- `Tools` — new tool reviews and walkthroughs
- `Products` — PromptEngines product updates for lab audience
- `Analysis` — news/trend analysis from source articles

## Read Time Calculation
- ~200 words per minute
- Count words in `<article class="content">` only
- Round to nearest minute

## Publishing Steps
1. Write article using template at `assets/article-template.html`
2. Save to `content/lab/drafts/YYYY-MM-DD-slug.html`
3. Run self-review checklist (see taste-profile.md)
4. Move to `content/lab/queue/` and flag for human review via Telegram
5. On approval: push to `labnotes/articles/` in promptengines-main repo
6. Update `labnotes/index.html` with new article card
7. Move to `content/lab/published/`

## Index Card Format
Each article in index.html gets a card. Match existing format:
```html
<article class="card">
  <div class="card-meta">
    <span class="tag">{{CATEGORY}}</span>
    <span class="date">{{DATE}}</span>
  </div>
  <h2><a href="articles/{{FILENAME}}">{{TITLE}}</a></h2>
  <p>{{DEK}}</p>
  <span class="read-time">{{READ_TIME}} min read</span>
</article>
```

## Pre-Publish Checklist
- [ ] Title names the subject specifically (not generic)
- [ ] Dek is one sentence, contains the thesis
- [ ] No forbidden phrases (see taste-profile.md)
- [ ] At least 3 visuals present
- [ ] All visuals numbered and captioned
- [ ] Opening paragraph establishes specific context (not generic intro)
- [ ] Each H2 states a finding, not just a topic
- [ ] Closing paragraph has a concrete recommendation
- [ ] Meta description matches dek (≤160 chars)
- [ ] Read time calculated and correct
- [ ] Category tag selected
- [ ] Filename follows convention
- [ ] Article nav links updated (prev/next)
