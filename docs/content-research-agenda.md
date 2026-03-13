# Content Research Agenda

## Content Pipeline Status

| Metric | Value |
|---|---|
| Articles published to date | 19 |
| Last published | March 4, 2026 |
| Content gap | 9 days (as of March 13) |
| Publishing cadence target | 2-3 articles per week |
| Active repos driving content | storybookstudio, videoterminal, bible, pantheon-os, norbu |
| Total commits (Mar 7-13) | ~176 across 6 repos |

The 9-day gap is the longest since the lab launched. Most build activity shifted to product work (Storybook Studio spreads, Video Terminal agentic engine, Bible notifications). That product work is exactly what generates articles.

---

## Research Topics Queue

### P0 -- Write This Week

**1. Agentic scene planning in Video Terminal: from text prompt to multi-node canvas**

- **Category:** Architecture
- **Source signal:** 18 commits to videoterminal on Mar 12 alone. Full agentic stack built: LLM planner with two-step calls, execution engine with phase planning, AgenticWizard UI, CharacterPicker, auto-start canvas wiring. Uses Gemini 3.1 Pro for plan generation.
- **Research needed:**
  - Document the two-step LLM call architecture (plan generation vs. execution)
  - Measure latency from text prompt to completed scene plan
  - Compare agentic plan quality across prompt lengths and complexity
  - Capture the wizard UI flow: plan > review > create
- **Estimated effort:** Medium (4-8h)
- **Priority:** P0

**2. Double-page spreads in AI storybooks: the layout problem nobody warns you about**

- **Category:** Experiments
- **Source signal:** 10 feat commits to storybookstudio on Mar 12. Full spread system: spread-aware drag-and-drop, double-width aspect ratio editing, split spread images for print PDF, full-width BookReader display, assembly mode grid rendering.
- **Research needed:**
  - Document the spread-to-single-page split pipeline for PDF generation
  - Test print output quality (pixel loss from splitting)
  - Compare aspect ratio handling between spread and single pages
  - Measure how spread pages affect Generate All performance
- **Estimated effort:** Medium (4-8h)
- **Priority:** P0

**3. Character insertion in generated scenes: placing known characters into new illustrations**

- **Category:** Benchmark
- **Source signal:** storybookstudio commits (Mar 12): Insert Character tool in PageEditor, always-enforce character consistency, pose images as references. Also: ref image 512px cap and 4-image limit to prevent 413 errors.
- **Research needed:**
  - Benchmark character fidelity when inserting into different scene styles
  - Document the reference image size/count constraints and why they exist
  - Test character consistency with pose images vs. without
  - Measure failure rate (413 errors) before and after the 512px cap
- **Estimated effort:** Light (2-4h)
- **Priority:** P0

**4. Credit systems for AI products: deducting after success, not before**

- **Category:** Architecture
- **Source signal:** storybookstudio fix commit (Mar 13): "deduct credits only after successful API response, not before." A one-line change with broad implications for any credits/tokens billing system.
- **Research needed:**
  - Document the race conditions in pre-deduction vs. post-deduction
  - Survey how other AI products handle credit billing (Midjourney, Runway, etc.)
  - Analyze failure modes: what happens when the API succeeds but credit deduction fails?
  - Outline the idempotency requirements for post-success deduction
- **Estimated effort:** Light (2-4h)
- **Priority:** P0

---

### P1 -- Research + Write Next Week

**5. Character systems across two products: Storybook Studio vs. Video Terminal**

- **Category:** Architecture
- **Source signal:** Both repos built character systems in the same week. storybookstudio: character sheet gen, pose system, detail modal. videoterminal: character CRUD API, Zod schemas with tests, character library page, Save Character button with canvas-to-character flow.
- **Research needed:**
  - Compare data models (Storybook character vs. VideoTerminal character schema)
  - Document shared patterns (CRUD, pose storage, reference images)
  - Evaluate whether a shared character service makes sense
  - Test cross-product character portability
- **Estimated effort:** Medium (4-8h)
- **Priority:** P1

**6. Bible app notification pipeline: Resend, preferences, and scripture-based templates**

- **Category:** Infrastructure
- **Source signal:** 11 commits to bible repo on Mar 10-11. Full notification stack: Resend SDK, email service with templates, notification preferences migration, user preferences API, unsubscribe endpoints, notification settings UI. All authored by Andy Stable.
- **Research needed:**
  - Document the Resend integration pattern (applicable to all aikaizen products)
  - Review notification preference schema design
  - Test email deliverability with scripture-based templates
  - Evaluate the warm/community-focused copy approach for notification UX
- **Estimated effort:** Medium (4-8h)
- **Priority:** P1

**7. Video quality baselines: prepending quality constraints to every video prompt**

- **Category:** Benchmark
- **Source signal:** videoterminal commits (Mar 12): "prepend video quality baseline to all video prompts" and "add technical camera/lens details to all style suffixes." A systematic approach to video generation quality.
- **Research needed:**
  - Document the baseline prompt template and what it constrains
  - Benchmark video output with and without baseline prepended
  - Catalog the camera/lens detail suffixes and their visual impact
  - Compare across video generation models (which respond best to technical constraints)
- **Estimated effort:** Medium (4-8h)
- **Priority:** P1

**8. Pantheon OS: building an internal dashboard for a multi-product AI company**

- **Category:** Architecture
- **Source signal:** 8 commits to pantheon-os (Mar 10-13). New repo. Dashboard aligned to PromptEngines portfolio, terminal wireframe, gated public auth, metrics pipeline plan, MVP wiring checklist.
- **Research needed:**
  - Document the architecture decisions (auth model, metrics pipeline)
  - Compare internal dashboards across similar-scale AI companies
  - Evaluate what metrics matter for a multi-product AI lab
  - Review the open-source plan mentioned in the Mar 13 commit
- **Estimated effort:** Heavy (8h+)
- **Priority:** P1

**9. Demo mode for AI products: showing capability without burning API credits**

- **Category:** Experiments
- **Source signal:** videoterminal commits (Mar 11): "Add production-safe demo mode for live demos" and "[Demo] button with slot-based pre-generated assets." Client-side images approach.
- **Research needed:**
  - Document the slot-based pre-generated asset pattern
  - Compare demo strategies: pre-generated assets vs. cached responses vs. mock APIs
  - Measure demo mode UX impact (does it feel authentic enough?)
  - Outline when to use client-side images vs. server-cached demos
- **Estimated effort:** Light (2-4h)
- **Priority:** P1

---

### P2 -- Backlog

**10. Norbu language app: validation runs and curriculum integration for Tibetan**

- **Category:** Analysis
- **Source signal:** 4 norbu commits (Mar 6-7): curriculum section, official packet integration roadmap, visual redesign with saffron palette, logo integration. A niche language learning app with unique design challenges.
- **Research needed:**
  - Document the curriculum validation process for low-resource languages
  - Review the saffron palette design decision (cultural context in UI design)
  - Compare AI tutoring for low-resource languages vs. high-resource ones
  - Evaluate official packet integration as a content strategy
- **Estimated effort:** Medium (4-8h)
- **Priority:** P2

**11. Multi-provider image routing: surviving rate limits and 413 errors at scale**

- **Category:** Infrastructure
- **Source signal:** storybookstudio commits: multi-POD routing, Generate All with rate limit handling, 413 payload fix, Gemini API key rotation. Production resilience patterns.
- **Research needed:**
  - Document the multi-POD routing architecture
  - Catalog the failure modes encountered (rate limits, 413s, key rotation)
  - Benchmark throughput with rate-limit-aware sequential generation
  - Compare provider failover strategies
- **Estimated effort:** Medium (4-8h)
- **Priority:** P2

**12. Mobile-first AI creative tools: what breaks when PageEditor goes to phone**

- **Category:** Experiments
- **Source signal:** storybookstudio commit (Mar 10): "mobile experience overhaul -- PageEditor tabs, touch support, mobile-first dashboard." Redesigning a complex canvas editor for mobile.
- **Research needed:**
  - Document which PageEditor features survive mobile and which get cut
  - Test touch gesture accuracy for image editing operations
  - Benchmark mobile vs. desktop generation speed and UX completion rates
  - Review tab-based mobile layout patterns for creative tools
- **Estimated effort:** Medium (4-8h)
- **Priority:** P2

**13. Stripe webhook integration for AI credits: the payment-to-generation pipeline**

- **Category:** Infrastructure
- **Source signal:** videoterminal commit (Mar 9): "Move dev password to env var, add Stripe webhook + transition tests." Payment infrastructure for AI product monetization.
- **Research needed:**
  - Document the Stripe webhook to credit allocation flow
  - Review webhook signature verification and retry handling
  - Compare credit-based vs. subscription-based pricing for AI generation tools
  - Outline test strategies for payment flows (Stripe test mode patterns)
- **Estimated effort:** Medium (4-8h)
- **Priority:** P2

**14. A/B testing landing pages for AI products: what converts in the storybook market**

- **Category:** Analysis
- **Source signal:** storybookstudio commit (Mar 12): "add AB test landing pages and spread preview images." Testing conversion approaches.
- **Research needed:**
  - Document the landing page variants and what they test
  - Set up conversion tracking methodology
  - Review AI product landing page patterns that convert (case studies)
  - Analyze early results after 1-2 weeks of traffic
- **Estimated effort:** Heavy (8h+)
- **Priority:** P2

**15. Play Mode: sequential video playback from a node-based canvas**

- **Category:** Experiments
- **Source signal:** videoterminal commits (Mar 9): "Add Play Mode -- column-based sequential video playback" and Play Mode design. Converting a non-linear canvas into linear playback.
- **Research needed:**
  - Document the column-based sequencing algorithm
  - Test playback with various canvas topologies (linear, branching, looping)
  - Compare to timeline-based video editors (Premiere, DaVinci) for sequential playback
  - Measure user comprehension of canvas-to-playback mapping
- **Estimated effort:** Medium (4-8h)
- **Priority:** P2

**16. Print-ready PDF generation from AI-generated storybooks**

- **Category:** Architecture
- **Source signal:** storybookstudio: Lulu go-live checklist, Gelato integration planning, spread image splitting for print PDF. The pipeline from generation to physical book.
- **Research needed:**
  - Document the full generation-to-print pipeline
  - Test color accuracy between screen and print
  - Compare Lulu vs. Gelato for print-on-demand AI books
  - Measure image resolution requirements and how generation models meet them
- **Estimated effort:** Heavy (8h+)
- **Priority:** P2

**17. Atomic state updates in React: preventing pixel loss and race conditions**

- **Category:** Architecture
- **Source signal:** storybookstudio fix commit (Mar 12): "address code review -- atomic updateProject, remove dead code, fix pixel loss." Low-level state management for image editing.
- **Research needed:**
  - Document the pixel loss bug and its root cause
  - Review atomic state update patterns for canvas/image editing apps
  - Compare optimistic updates vs. atomic writes for collaborative editing
  - Benchmark state update frequency in image editing UIs
- **Estimated effort:** Light (2-4h)
- **Priority:** P2

---

## Topic Categories -- Coverage Analysis

### Currently Covered (19 articles)
- Image model benchmarks (3 articles)
- Model selection / evaluation (2 articles)
- RAG and retrieval (1 article)
- Agentic coding practices (3 articles)
- Docker / deployment (2 articles)
- API providers and infrastructure (1 article)
- Tutor architecture (1 article)
- Character consistency (1 article)
- Iterative rebuilds (1 article)
- Industry acceleration analysis (1 article)
- Public API classification (1 article)
- Codex vs. Opus model comparison (1 article)
- Aesthetic scoring for children (1 article)

### Not Yet Covered -- Gaps to Fill
| Domain | Why it matters | Suggested first article |
|---|---|---|
| Video generation | VideoTerminal is a primary product. Zero articles on video. | Agentic scene planning (P0 #1) |
| Payment / billing | Credits and Stripe are live. No documentation of the patterns. | Credit deduction timing (P0 #4) |
| Print / physical output | Storybook Studio ships physical books. No coverage. | Print-ready PDF pipeline (P2 #16) |
| Notification systems | Bible app built a full notification stack. Applicable to all products. | Resend integration pattern (P1 #6) |
| Mobile UX for AI tools | Mobile overhaul happened. No analysis published. | Mobile-first creative tools (P2 #12) |
| Internal tooling / ops | Pantheon OS is new. No coverage of how the lab runs itself. | Multi-product dashboard (P1 #8) |
| Demo / showcase patterns | Demo mode is a solved problem worth documenting. | Slot-based demo mode (P1 #9) |
| Cross-product architecture | Two products built character systems independently. | Character system comparison (P1 #5) |

---

## Daily Article Suggestions Framework

### Rule
Every article must trace back to one of two sources:
1. **Active build work** -- commits from the last 48 hours that reveal a technical decision, benchmark result, or architecture pattern.
2. **A concrete experiment** -- something tested, measured, or compared with documented results.

No speculative think pieces. No industry commentary without internal data.

### Template
```
[Product] + [Technical discovery or decision] = Article topic
```

### Examples from this week's commits

| Product | Discovery | Article |
|---|---|---|
| storybookstudio | Insert Character tool + 512px ref cap | Character insertion constraints in production image generation |
| videoterminal | Two-step LLM planner + Gemini 3.1 Pro | Building an agentic scene planner: architecture and latency |
| storybookstudio | Spread pages + print PDF splitting | Double-page spreads in AI storybooks: the layout pipeline |
| bible | Resend SDK + scripture templates | Notification systems for community apps: a Resend integration |
| videoterminal | Demo mode + pre-generated assets | Demo mode for AI products: showing capability without cost |
| pantheon-os | Dashboard + gated auth | Internal dashboards for multi-product AI companies |

### Daily process
1. Run `node scripts/suggest-daily-article.js`
2. Review the 3-5 suggestions against the P0/P1 queue above
3. Pick one. Write the Standard mode first. Add Experimental and Agent modes if warranted.
4. Publish. Update the articles index.

---

## Industry Research Signals

### 1. Video generation models reaching production quality
- **Industry:** Sora, Runway Gen-4, Kling 2.0, Veo 3 are shipping production APIs. Quality baselines are shifting monthly.
- **Our work:** VideoTerminal uses video generation APIs with quality baselines prepended to prompts. Camera/lens technical suffixes added to all styles.
- **Article angle:** Video generation API baseline (mirrors our image model baseline article). Benchmark 4-5 video models on consistency, motion quality, prompt adherence.

### 2. Agentic workflows beyond code
- **Industry:** Agentic coding is established (Claude Code, Cursor, Devin). The frontier is agentic non-code workflows: design, video production, content creation.
- **Our work:** VideoTerminal built a full agentic execution engine for scene planning. Storybook Studio's Generate All is batch agentic generation.
- **Article angle:** Agentic creative tools: what works and what breaks when agents make art instead of code.

### 3. Character consistency as a solved problem
- **Industry:** IP-safe character generation is a top request. LoRA training, reference image conditioning, and style transfer are all improving fast.
- **Our work:** Character systems in both Storybook Studio and VideoTerminal. 34-style consistency test already published. Pose-based reference images now enforced.
- **Article angle:** Update to the character consistency article with pose-based reference results. Or: cross-product character portability.

### 4. Print-on-demand meets AI generation
- **Industry:** Amazon KDP, Lulu, Gelato are all seeing AI-generated book submissions increase. Quality standards are tightening.
- **Our work:** Storybook Studio has Lulu go-live checklist and Gelato integration planned. Spread splitting for print PDF is live.
- **Article angle:** The AI-to-print pipeline: what print-on-demand services actually require from generated images.

### 5. Multi-model orchestration
- **Industry:** Products increasingly use multiple models: one for text, one for images, one for video, one for planning. Routing and fallback are becoming infrastructure concerns.
- **Our work:** Storybook Studio has multi-POD routing. VideoTerminal uses Gemini for planning and separate models for image/video generation.
- **Article angle:** Multi-model routing in production: when and how to use different models for different tasks.

### 6. AI product monetization patterns
- **Industry:** Credit-based pricing is dominant (Midjourney, Runway, most image generators). Subscription vs. credits debate continues.
- **Our work:** Both Storybook Studio and VideoTerminal have credit systems. Stripe webhooks live in VideoTerminal. Credit deduction timing just fixed.
- **Article angle:** Credit system architecture: pre-deduction vs. post-deduction and the edge cases that matter.

### 7. Low-resource language AI
- **Industry:** Most AI language models are trained on English/Chinese/Spanish. Low-resource languages (Tibetan, Indigenous languages, minority scripts) are underserved.
- **Our work:** Norbu is a Tibetan language learning app with curriculum integration and official packet support.
- **Article angle:** Building AI tutoring for languages with limited training data: the Norbu approach.

### 8. Internal developer platforms for AI teams
- **Industry:** Platform engineering is growing. AI teams need dashboards, metrics, and deployment automation beyond what GitHub provides.
- **Our work:** Pantheon OS is a new internal dashboard. Build Stream already tracks commits. Weekly reports are automated.
- **Article angle:** Building an internal OS for an AI lab: what metrics matter when you ship 6 products.
