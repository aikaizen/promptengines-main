# Lab Notes — Article Ideas

Generated from repo analysis. 2026-02-27.

---

## StoryBook Studio

1. **Lulu vs Gelato: How we evaluated print-on-demand providers for a children's book app**
   Dek: The capability matrix that drove our decision — binding options, API reliability, webhook behavior, and the one thing Gelato still can't do.
   Source: `fix: shipping pipeline bugs + provider toggle for Lulu/Gelato comparison`

2. **Why we hit Vercel's 12-function limit and how we merged our way out**
   Dek: Serverless function limits are a real architectural constraint. Collapsing two print endpoints into one taught us something about how to think about API surface area early.
   Source: `fix: merge print API into single endpoint`

3. **Spine width is not a simple formula: what we learned building cover PDF generation**
   Dek: Paperback spine width is a formula. Hardcover casewrap is a lookup table. Neither behaves the way you expect at edge page counts — and the print provider doesn't warn you.
   Source: `feat: add spine width calculation and cover PDF generation`

4. **A/B testing login splash screens: what actually gets people into a creative app**
   Dek: We ran a carousel variant against a static splash on first login. The results were less about conversion and more about what users expected the product to be.
   Source: `feat: login splash experiments`

5. **How we built community remix without breaking attribution**
   Dek: Letting users remix each other's books required lineage metadata, privacy defaults, and a clear answer to "whose book is this now?" We got two of those right on the first try.
   Source: `feat: community book remix/import flow with lineage metadata`

6. **Auto-book concurrency: why we capped parallel generation and what happened when we didn't**
   Dek: Uncapped concurrent AI generation on a multi-page book product produces race conditions, billing anomalies, and incomplete books. Here's the architecture that fixed it.
   Source: `feat: auto-book concurrency cap, improved cover prompts, billing per successful page`

---

## Kaizen (Kids Education App)

7. **AppShell architecture: how we eliminated 1,400 lines of duplicate nav chrome**
   Dek: Every tab in Kaizen was independently rendering the same sidebar, tab bar, and profile badge. The refactor that fixed it is a case study in what "extract once, render once" actually requires.
   Source: `refactor: unified HUD shell + game modularity`

8. **Game module registries: lazy-loading educational games without a monolith**
   Dek: We replaced direct component imports with a game registry and lazy loader. The result is a system where adding a new game requires touching exactly one file.
   Source: `refactor: unified HUD shell, GameHost lazy-load from registry`

9. **Pre-K curriculum architecture: why we structured 5 plans × 4 lessons instead of a flat list**
   Dek: Twenty lessons sounds simple until you need to track progress, recommend next steps, and support five different learning domains. The hierarchy that emerged shaped everything downstream.
   Source: `feat: restructure pre-K curriculum to 5 plans with 20 lessons`

10. **Math Battle as a state machine: routing between game modes without spaghetti**
    Dek: Adding a Battle mode to a Numbers game that didn't expect one revealed how fragile direct component transitions are. The fix was metadata-driven routing — the component never knows where it's going.
    Source: `fix: add missing Battle button, fires onComplete with requestBattle metadata`

---

## Flow (AI Tutor)

11. **We removed the AI nudge system. Students did better.**
    Dek: Flow had a system that injected motivational prompts every 3 turns. Removing it reduced churn and improved session depth. The lesson: agentic behavior in tutoring contexts needs a much higher bar than we set.
    Source: `fix: disable agentic nudges and suppress early challenge cards`

12. **Challenge cards and the cold-start problem in AI tutoring**
    Dek: Showing challenge cards before a student has sent 3 messages creates pressure before trust. Suppressing them until engagement is established changed how students experienced the first session.
    Source: `fix: suppress challenge cards until student has sent at least 3 messages`

13. **Routing students to the right starting point: why a home page matters more than a chat interface**
    Dek: Students landing directly in chat skipped lesson selection entirely. Moving the entry point to a home screen with 20 visible lessons doubled lesson diversity in early sessions.
    Source: `fix: route students to home page so all 20 lessons are visible`

14. **Lesson state management across sessions: what flowContext needs to track and why**
    Dek: Resuming a tutoring session mid-lesson requires more state than you think — progress markers, curriculum position, teacher settings, and the last known emotional state of the interaction.
    Source: `feat: improve learning state, teacher settings, and flow context`

---

## Transcriber (Meeting Notes)

15. **Small vs Distil Large v3.5: choosing a transcription model for real meeting audio**
    Dek: We ship two models — fast and balanced. The gap between them is not just speed. It is word error rate on crosstalk, accents, and low-quality audio, which describes most real meetings.
    Source: `Updated transcription models: Small (fast) + Distil Large v3.5 (balanced)`

16. **AI edit as a post-processing layer: letting users refine notes with natural language**
    Dek: Meeting notes that are 90% right are still wrong. We added a natural language edit layer that lets users instruct the AI to fix specific sections. The UX constraint: undo had to work.
    Source: `Added AI Edit (beta) for refining notes with natural language instructions`

17. **Split-view layout for transcript + analysis: what we learned from a desktop-first redesign**
    Dek: The original Transcriber UI was mobile-tolerant. The redesign committed to desktop with a split view — transcript on one side, AI analysis on the other. Here's what that forced us to get right.
    Source: `Redesigned desktop-optimized UI with split-view layout`

---

## Cross-Cutting / Meta

18. **Claude as co-author: what it actually looks like to have an AI write most of your commits**
    Dek: Almost every commit across our repos is co-authored by Claude. This is not AI-generated slop — it is a specific workflow with specific constraints. Here's what works and what regularly breaks.
    Source: Co-Authored-By pattern across all repos

19. **The PromptEngines stack in 2026: what we're running and why**
    Dek: Supabase, Vercel, React, Gemini, Lulu, Stripe — and the decisions that led to each. Some are boring choices. A few are things we'd change if we started today.
    Source: Tech stack visible across storybookstudio + flow + kaizen repos

20. **Bible app group annotations: merging highlights and discussion into a single timeline**
    Dek: Verse annotations and discussion comments are different actions with the same social intent. Merging them into one timeline required resolving a data model conflict we'd been avoiding.
    Source: `feat: merge annotations into Discussion as unified timeline`

---

## Queue Order Recommendation

Start with these 5 — highest signal, most universal appeal:

1. #11 — "We removed the AI nudge system. Students did better." (provocative, counterintuitive)
2. #18 — "Claude as co-author" (meta, unique to your workflow, high shareability)
3. #1 — "Lulu vs Gelato" (practical, useful to any POD builder)
4. #7 — "AppShell: eliminating 1,400 lines of duplicate nav chrome" (specific, credible)
5. #6 — "Auto-book concurrency" (technical depth, real production problem)
