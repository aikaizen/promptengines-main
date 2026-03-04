---
title: "Just Rebuild It"
subtitle: "Why we scrapped Flow Education four times—and the math that justifies it"
date: 2026-03-03
author: "Andy Stable (AI) & Human Co-Author"
category: experiments
topics: [vibe-coding, prototyping, flow-education, rebuild-strategy]
---

# Just Rebuild It

Everyone is vibe-coding furiously. The promise is clear: describe what you want, watch it appear, iterate in minutes not days. The reality is darker alleys—code that works until it doesn't, dependencies you didn't choose, architectures that made sense for the first prototype and choke on the fifth feature.

Here's the counterintuitive KPI we use: **When the cost of tokens to rebuild is less than or equal to the value of time you'll spend debugging, rebuild.** Not refactor. Not patch. Start fresh.

## The Visibility Problem

Vibe-coding tools—Claude Code, Codex, ChatGPT, Replit Agent—excel at generation and terrible at archaeology. They can produce a working React app in seconds. They struggle to answer: "Why does this specific re-render trigger when state changes in this specific edge case?"

The visibility gap creates a trap:
1. You generate a working app
2. You add features, layering complexity
3. A bug emerges that requires understanding the full architecture
4. You spend hours tracing prop drilling, context providers, useEffect chains
5. The fix feels fragile—touching one component breaks another

At this point, you've lost the primary advantage of vibe-coding: speed. You're now debugging code you didn't write, in an architecture you didn't design, with tools that don't provide visibility into runtime behavior.

## The Math

Let's make it concrete. Assume:
- Your time: $100/hour (conservative for technical work)
- Token costs: Claude Sonnet at $3/$15 per 1M tokens[^1]
- A typical rebuild: ~200K input tokens, ~100K output tokens = $2.10

The break-even is **75 seconds of your time**. If you suspect the fix will take longer than a minute of focused debugging, the rebuild is cheaper.

This feels wrong. We've been trained that "throwing away code" is waste. But vibe-coding changes the production function—the marginal cost of a new implementation approaches zero, while the marginal cost of understanding inherited complexity remains high.

## Our Experience: Flow Education

We rebuilt Flow Education from scratch four times. Not refactored. Deleted the directory, wiped node_modules, started fresh.

| Iteration | Environment | Trigger for Rebuild | Time to Functional |
|-----------|-------------|--------------------|-------------------|
| 1 | Google AI Studio | Initial prototype → complexity limit reached | 4 hours |
| 2 | Replit | State management spiraled, iOS Safari crashes | 3 hours |
| 3 | Claude Code | Tracing challenge architecture too rigid for 4YO mode | 2.5 hours |
| 4 | Codex 5.3 | Light mode conversion revealed CSS variable cascade issues | 2 hours |

[^1]: Anthropic pricing, March 2026. Input $3/1M, output $15/1M.

Each rebuild was faster than the previous. Not because we were cutting corners—because we understood the problem better. The first build explores the solution space. The fourth build implements a known solution.

Our git history shows this pattern clearly. Commits like `11d4e1d` (localStorage safety) and `b3f98b6` (SimpleLessonView safety) were added to stable code. But `d70881c` (improved ErrorBoundary) and `1ae1a8e` (ErrorBoundary creation) were rebuilding infrastructure we'd already built twice before. The third time, we got it right.

## What Makes Rebuilds Cheap

The strategy only works if you can transfer operational state quickly. We optimize for:

**API Keys and Secrets:** One command to populate environment variables. We use a local encrypted store (1Password CLI) that injects into new projects automatically. Transfer time: <30 seconds.

**Data and Assets:** Lesson plans, curriculum JSON, image assets live in `/data` and `/assets` directories, separate from implementation. Copied, not recreated.

**Design Decisions:** Written down, not remembered. The "parent-friendly light mode" palette lives in a variable file, not scattered across components.

**Generalizable Components:** The tracing canvas, the audio hook—these are implementation patterns we've validated. We can reimplement them quickly because we understand the requirements.

## When Not to Rebuild

There are hard limits to this strategy:

**Production data is sacred.** Once Flow Education has student progress records, lesson completions, parent accounts—these don't get rebuilt. They get migrated. Rebuilding is for the application layer, not the data layer.

**Generalizable assets survive.** The character sprite system, the audio assets, the lesson plan JSON—these are portable across implementations. They're copied into each new build, not regenerated.

**Complex integrations require continuity.** If you've spent days calibrating a specific model's output for a specific use case, that calibration is worth preserving. Document the prompt, the temperature, the few-shot examples. Don't rediscover them.

The rule: Rebuild the code, preserve the data and decisions.

## The Dark Alley Warning Signs

We've learned to recognize when we're in the danger zone:

- **The 30-minute fix becomes a 3-hour investigation.** You've lost the plot. The architecture has outpaced your understanding.
- **You're afraid to touch a component.** This indicates unknown dependencies. Fear is information—listen to it.
- **The bug only appears in production builds.** This suggests environment-specific complexity (bundler, polyfill, transpilation) that's hard to reproduce locally.
- **You're adding defensive code to fix symptoms, not causes.** `try/catch` blocks around code you don't understand are technical debt compounds.

Each of these is a signal: the cost of understanding exceeds the cost of rebuilding.

## The Psychology

Rebuilding feels like failure. It isn't. It's acknowledgement that the primary value in vibe-coding is speed of iteration, not perfection of first draft.

The Flow Education you see today—light mode, iOS-safe, two age modes, Web Audio API—is the fourth iteration. The first three taught us what we actually needed. They weren't wasted; they were tuition.

The apps we don't rebuild are the ones where we've paid enough tuition to know the answer before starting.

## Implementation Notes for Teams

If you're working with others, rebuilding requires coordination:

**Branch strategy:** Each rebuild gets a branch. The old branch remains accessible. If the rebuild fails, you haven't lost ground.

**Time-boxing:** Two hours maximum for a rebuild. If it takes longer, you underestimated the complexity—keep the old version, understand why.

**Document the delta:** What does the new version do differently? Write it down. This becomes your test plan and your README.

**Commit atomicity:** Each rebuild phase (scaffold → data layer → UI → polish) gets its own commit. You can bisect if something breaks.

## The Bottom Line

Vibe-coding changes the economics of software development. The cost of implementation drops toward zero. The cost of maintenance—understanding, debugging, extending—remains high.

When those curves cross, rebuild. We've done it four times for Flow Education. Each iteration is smaller, faster, and closer to right. The fourth build took 2 hours and shipped with fewer bugs than the 40-hour first build.

Your time is the constraint. Tokens are cheap.

---

## Decision Checklist

**Consider rebuilding when:**
- [ ] Debugging time > 1 hour with no clear resolution path
- [ ] You're adding defensive code instead of understanding root cause
- [ ] The architecture has outpaced your mental model
- [ ] Environment-specific bugs (prod-only, device-specific) are multiplying
- [ ] You can transfer data/assets in <10 minutes

**Do not rebuild when:**
- [ ] Production data would be lost or require complex migration
- [ ] The fix is isolated and well-understood
- [ ] You're in a team context and others depend on the current structure
- [ ] The rebuild would take >4 hours (time-box and reassess)

---

## Evidence from Our Git Feed

Our commit history validates the strategy. Major rewrites in Flow Education:

- `d70881c` — ErrorBoundary infrastructure (third iteration, finally right)
- `3c83a26` — Developer Portfolio Craft design patterns (extracted, reusable)
- `9f012f5` — Light mode conversion (easier as rebuild than refactor)
- `2fa4796` — Merge resolution keeping local changes (preserved working state)

Each represents either a rebuild or infrastructure that survived multiple rebuilds. The pattern: stabilize data and assets, iterate rapidly on implementation.

---

## Sources

[^1]: Anthropic API pricing. https://anthropic.com/pricing. Accessed March 2026.
[^2]: Internal time tracking on Flow Education rebuilds, February–March 2026.
[^3]: Git commit history, aikaizen/promptengines-main, flow-education app directory.
