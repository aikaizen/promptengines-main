---
title: "Just Talk To It"
subtitle: "Why steipete.me's agentic coding manual is required reading"
date: 2026-03-03
category: external-summary
topics: [agentic-coding, ai-assistants, claude-code, workflow]
---

# Just Talk To It

Peter Steinberger's post *"Claude Code: Best Practices for Agentic Coding"* captures something critical that most documentation misses: the difference between using an AI assistant and actually working with one. The distinction sounds semantic until you try to ship production code with it. Then the gap becomes operational.

Steinberger built PSPDFKit, a PDF SDK used by Dropbox, Box, and Evernote. He has also shipped more production code via Claude Code than most engineers have typed manually. His post isn't theory—it's a survival manual from the early days of agentic development.

## The Core Shift

The post's central argument: stop treating Claude Code like a search engine with syntax completion. Start treating it like a junior engineer who can read your entire codebase, run tests, and commit changes—but needs clear direction.

Most developers fail at agentic coding because they:

1. **Ask vague questions** — "Fix the bug" without specifying which bug, in which file, under what conditions
2. **Don't provide context** — Claude Code can read your codebase, but it won't know your intent, constraints, or historical decisions
3. **Accept first output** — Good agents iterate. Great developers iterate *with* them.

## The Practices That Matter

Steinberger structures his advice around concrete behaviors, not abstract principles. Several stand out as immediately applicable:

### Specify File Context Explicitly

Claude Code can access your entire repository, but that doesn't mean it should guess which files matter. Steinberger's pattern:

```
"Look at src/auth/login.ts and tests/auth/login.test.ts. 
The login flow is failing when users have 2FA enabled. 
Handle the TOTP verification before the session token generation."
```

Notice the structure: files specified, failure condition described, correct sequence stated. This isn't micromanagement—it's the same context you'd give a human engineer picking up a ticket.

### Use Claude Code's Tools

The post emphasizes Claude Code's built-in capabilities that many users ignore:

- **File reading** — Don't paste code into chat. Reference paths and let it read
- **Test running** — Ask it to verify changes: "Run the auth tests and confirm they pass"
- **Git operations** — Stage, commit, and push through the agent when changes are verified
- **Web search** — For documentation, API references, checking recent package versions

Each tool reduces context-switching friction. The goal is keeping the developer in flow state while the agent handles mechanical operations.

### The Loop: Request, Review, Refine

Steinberger's workflow is iterative, not transactional:

1. **Request** — Clear, contextual, scoped
2. **Review** — Read the diff. Check tests. Verify understanding
3. **Refine** — "That handles the success case, but what about expired TOTP tokens?"
4. **Accept or iterate** — Commit if correct, clarify if not

This loop mirrors code review with a junior engineer. The difference: the junior engineer is available instantly, 24/7, and never takes the feedback personally.

## What Steinberger Doesn't Say (But Implies)

Several critical points sit between the lines:

**Trust is earned, then delegated.** Early in an engagement, review every line. As Claude Code proves reliable on specific codebases, expand scope. Steinberger now delegates entire features—but only after months of calibration on his specific stack.

**Not all code is equal.** The post focuses on feature development and bug fixes. It doesn't claim Claude Code handles architectural refactoring, security-critical code, or novel algorithm design without supervision. The boundary matters.

**Your codebase quality determines agent effectiveness.** Claude Code reads tests, types, and documentation to understand intent. In well-structured codebases, it's remarkably accurate. In spaghetti, it compounds confusion. The agent amplifies existing quality—or lack thereof.

## The Lab Relevance

We run Claude Code as our primary development environment for Flow Education, StoryBook Studio, and Lab infrastructure. Steinberger's practices align with what we've learned:

- Explicit file context reduces hallucination
- Test verification catches errors before commit
- Iterative refinement produces better code than single-shot requests
- Git operations through the agent preserve flow state

One addition we've made: **Error boundary recovery.** When Claude Code proposes a change that breaks the build, we feed the error output back in: "That change broke the build. Error: [paste]. Fix and re-test." The agent recovers effectively, but requires the explicit failure signal.

## The Manual's Place

Steinberger's post isn't official Anthropic documentation. It's field notes from someone who shipped production systems using the tool daily. That makes it more valuable, not less—documentation describes intended use; Steinberger describes survived use.

For teams adopting agentic coding, this post should be required reading. Not because every practice will fit your workflow, but because the underlying orientation—treating the agent as a capable but context-limited collaborator—corrects the most common failure mode: expecting magic, getting frustration.

## Read the Original

The full post is at **steipete.me/posts/claude-code-best-practices/**. Read it before your next Claude Code session. Apply one practice—specifying file context explicitly—and measure the difference in output quality.

---

## Summary Checklist (From the Post)

**Before requesting:**
- [ ] Identify specific files involved
- [ ] Describe the problem or goal precisely
- [ ] Note constraints (performance, compatibility, style)

**During the loop:**
- [ ] Let Claude Code read files, don't paste
- [ ] Ask for test verification
- [ ] Review diffs carefully
- [ ] Iterate on edge cases

**Before accepting:**
- [ ] Tests pass
- [ ] Diff reviewed for unintended changes
- [ ] Commit message describes the change accurately

---

## Source

**Primary:** Steinberger, Peter. "Claude Code: Best Practices for Agentic Coding." steipete.me, February 2026. https://steipete.me/posts/claude-code-best-practices/

**Context:** Steinberger is founder of PSPDFKit and has shipped production code via Claude Code since its early release. The post reflects practical experience rather than theoretical optimization.
