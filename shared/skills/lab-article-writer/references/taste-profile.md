# Lab Notes — Taste Profile & Editorial Standard

## What This Publication Is

lab.promptengines.com is a lab notebook, not a blog. The difference matters:

- A blog reports on things that happened.
- A lab notebook documents what was tried, what was measured, what was learned.

Every article should feel like it was written by someone who did the thing — not someone who read about someone who did it. Readers should come away knowing something concrete and actionable that they didn't know before.

---

## Aesthetic

### Visual Identity
- **Background:** Near-black zinc (`#09090b`) with subtle grain texture
- **Accent:** Burnt orange (`#F04D26`) — used for links, brand marks, highlights
- **Typography:** Outfit (headings/body) + JetBrains Mono (code, data, captions)
- **Tone:** Dark, precise, slightly severe — the vibe of a serious research tool

### Design Parameters (from CSS comments)
- `taste-skill: compliant`
- `design-variance: 8` — high. Not conservative.
- `motion-intensity: 6` — present but purposeful
- `visual-density: 4` — moderate. Breathing room matters.

### What "Rigor with Vibe" Means
Rigor means: specific numbers, named models, real task descriptions, honest results including failures.
Vibe means: the writing has momentum. It doesn't read like a white paper. Short paragraphs. No throat-clearing.

---

## Voice

### Characteristics
- **First person plural ("we")** — this is a team/lab, not a solo blogger
- **Present-tense findings** — "Codex 5.3 performs better at X" not "Codex 5.3 performed better at X"
- **No hedging introductions** — never start with "In today's rapidly evolving AI landscape"
- **Active verbs** — "we rebuilt", "we tested", "we removed"
- **Short dek** — the subtitle is one punchy sentence that sharpens the headline

### What the Voice Is NOT
- Not academic ("Furthermore, it was observed that...")
- Not hype ("Revolutionary results show...")
- Not vague ("We explored various approaches...")
- Not recapping the obvious ("AI is changing everything")

### Sentence rhythm
Alternate between short punchy sentences and longer explanatory ones. The short ones land the point. The longer ones explain it.

Example (good):
> Most RAG failures come from weak boundaries, not weak retrieval. Teams often say they want strict document-grounded answers, then allow model priors to fill gaps. That is where hallucinations return.

Example (bad):
> In our extensive testing of various RAG approaches, we found that there were multiple factors contributing to hallucination in our system, including but not limited to boundary enforcement, retrieval quality, and model behavior.

---

## Article Structure

### Required Elements
1. **Title** — specific, names the subject, implies a finding
2. **Dek (subtitle)** — one sentence. Sharpens the headline. Usually contains the thesis.
3. **Opening paragraph** — the task context. What were we actually doing?
4. **Visual 1** — always early. Data, matrix, diagram, or code block.
5. **Body sections** (H2s) — 3–5 sections. Each has a point, not just a topic.
6. **At least 3 visuals total** — data speaks louder than prose
7. **Closing recommendation or takeaway** — concrete. Tell the reader what to do or think.

### Title Formulas That Work
- `[Thing A] vs [Thing B]: [Finding]`
- `How to [achieve result] without [common problem]`
- `[Specific technique]: [What it actually does]`
- `[What we built] — [the constraint that made it hard]`
- `[Number] ways [X] breaks and how we fixed them`

### What to Avoid in Structure
- No "Introduction" header — just start
- No "Conclusion" header — just end with the point
- No bullet lists as the main content mode — prose first, lists for genuinely list-like things
- No more than 3 levels of hierarchy (H1 → H2 only in articles)

---

## Visuals

All visuals are HTML/CSS — no external images or charts libraries. Three types:

### 1. visual-matrix (monospace table)
Use for: comparative data, performance profiles, before/after states
```html
<figure class="figure">
  <div class="visual visual-matrix">metric          model_a   model_b
recovery speed   strong    medium
instruction fit  medium    very strong
edit locality    strong    strong</div>
  <figcaption>Visual N. What this shows.</figcaption>
</figure>
```

### 2. visual-bars (CSS bar chart)
Use for: trend data, score comparisons, distributions
Each `<i>` is a bar. Height as percentage of max value.
```html
<figure class="figure">
  <div class="visual visual-bars">
    <i style="height:78%"></i><i style="height:64%"></i>
    <i style="height:53%"></i><i style="height:69%"></i>
  </div>
  <figcaption>Visual N. What the bars represent.</figcaption>
</figure>
```

### 3. visual-code (process trace / structured data)
Use for: pipeline steps, system traces, structured observations
```html
<figure class="figure">
  <div class="visual visual-code">query: "What is X?"
retrieved: doc_a#12, doc_b#44
evidence_score: 0.91
draft_check: pass (0 unsupported claims)
output: grounded answer with citations</div>
  <figcaption>Visual N. What this trace shows.</figcaption>
</figure>
```

### 4. visual-diagram (placeholder for complex flows)
Use for: architecture diagrams, flow charts, system designs
```html
<figure class="figure">
  <div class="visual visual-diagram"></div>
  <figcaption>Visual N. Description of what the diagram represents.</figcaption>
</figure>
```

### Visual Rules
- Number every visual ("Visual 1.", "Visual 2." etc.)
- Caption states what the visual shows — not just a title
- At least one visual in the first 3 paragraphs
- Bars data: use realistic-looking numbers (not all round percentages)
- Matrix data: use consistent column widths with spaces

---

## Article Types

### Evaluation / Benchmark
**Trigger:** Comparing two models, tools, or approaches on real tasks
**Key requirement:** Named models, specific task types, honest win/loss profile
**Must have:** Matrix visual showing performance profile
**Length:** 600–900 words

### Architecture / System Design
**Trigger:** How something was built, a system decision, a technical approach
**Key requirement:** The constraint that drove the design, not just the solution
**Must have:** Diagram or code trace showing the structure
**Length:** 700–1000 words

### Experiment Report
**Trigger:** Something was tried and measured
**Key requirement:** Hypothesis → method → result → learning. Even null results count.
**Must have:** Before/after data, honest failure reporting
**Length:** 500–800 words

### Technique / How-To
**Trigger:** A specific method that solves a specific problem
**Key requirement:** Concrete steps, not generic advice. Code or pseudocode.
**Must have:** Working example, failure modes to avoid
**Length:** 600–900 words

### News Analysis
**Trigger:** A source article is sent in. Write a lab-voice take on it.
**Key requirement:** The insight, not the summary. What does this mean for builders?
**Must have:** A concrete recommendation or implication at the end
**Length:** 400–600 words

---

## What Good Looks Like

### Good dek examples
- ✅ "We compared both models on real engineering tasks: architecture edits, bug isolation, and constrained refactors. The differences are less about raw intelligence and more about how each model behaves under pressure."
- ✅ "Most RAG failures come from weak boundaries, not weak retrieval. If your policy is 'official docs only,' the system must enforce that at every stage of generation."
- ❌ "A comprehensive look at how AI models compare in various scenarios."
- ❌ "This article explores the differences between two popular AI coding assistants."

### Good opening paragraph
- ✅ Names the actual test set or task. Specific.
- ✅ Immediately establishes the constraint or problem.
- ❌ Starts with background/context that could apply to any article.

### Good H2 examples
- ✅ "Where they diverge operationally" (names the finding)
- ✅ "Guardrails that actually matter" (opinionated)
- ✅ "What the numbers miss" (takes a position)
- ❌ "Analysis" / "Results" / "Discussion"

---

## What to Never Write

- "In the rapidly evolving landscape of AI..."
- "It is worth noting that..."
- "Furthermore," / "Additionally," / "Moreover,"
- "In conclusion..."
- "This represents a significant step forward..."
- "Leveraging cutting-edge AI capabilities..."
- Any sentence longer than 35 words
- Passive voice for findings ("it was found that" → "we found")
