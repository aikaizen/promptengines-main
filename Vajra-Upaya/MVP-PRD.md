# Vajra-Upaya — MVP PRD

## Product Requirements Document: Minimum Viable Product

---

```
   ◇ MVP — The First Diamond
```

---

## Objective

Ship the smallest version of Vajra-Upaya that proves the core loop works:

**Problem in → PRD out → Tool matched → Modification delivered → Customer satisfied**

The MVP does not need the mutation projection engine. It does not need a large catalog. It needs to demonstrate that agent-guided discovery + curated tool matching + surgical modification creates a result that customers cannot get elsewhere.

---

## Success Criteria

1. A customer can describe a problem in plain language and receive a structured PRD within 1 conversation
2. The system surfaces 1-3 tool candidates with clear trade-off analysis
3. At least one tool is modified and delivered within the agreed timeline
4. The customer confirms the tool solves their stated problem
5. The delivered tool is modular enough that a future change request could be fulfilled without a full rebuild

---

## Scope

### In Scope (MVP)

| Component | What It Does | Implementation |
|-----------|-------------|----------------|
| **Intake Agent** | Guides customer from raw problem → structured PRD | Conversational AI agent with structured output |
| **PRD Generator** | Produces formatted PRD with requirements, constraints, acceptance criteria | Template-driven generation from agent conversation |
| **Catalog (Seed)** | PromptEngines products + 10-20 curated external tools across common categories | Manual curation, scored on fit/modifiability |
| **Match Engine (V0)** | Scores catalog entries against PRD requirements, surfaces top candidates | Weighted scoring: requirement overlap, modification complexity, delivery time |
| **Forge (Manual+)** | Human engineers + AI agents modify the selected tool | Agent-assisted development, modular build patterns |
| **Delivery** | Hand off the finished tool with documentation | Standard deployment + handoff doc |

### Out of Scope (MVP)

- Mutation projection engine (Phase 1)
- Automated pre-caching of variations (Phase 1)
- Self-service change requests (Phase 1)
- Large-scale external catalog (grows organically)
- Public-facing catalog browsing
- Pricing engine / automated quoting

---

## User Journey

### 1. Problem Intake

```
◇ ENTRY POINT
Customer reaches out (web form, email, direct message)
"I have a problem..."

    ↓

◎ DISCOVERY SESSION
Intake Agent engages in structured conversation:

  Agent: "Tell me about the problem you're facing."
  Customer: "My sales team spends hours manually updating our
            CRM after every client call."

  Agent: "Who on your team is affected? How many people?"
  Customer: "5 sales reps, plus the manager who reviews notes."

  Agent: "What does the ideal outcome look like?"
  Customer: "Call ends, notes are automatically in the CRM,
            manager gets a summary."

  Agent: "Any tools you're already using?"
  Customer: "Zoom for calls, HubSpot for CRM, Slack for comms."

  Agent: "Any constraints — budget, compliance, timeline?"
  Customer: "HIPAA not needed. Under $200/mo. Need it in 2 weeks."
```

### 2. PRD Generation

```
⚡ OUTPUT: Structured PRD

┌──────────────────────────────────────────┐
│ VAJRA-UPAYA PRD #0042                     │
│                                            │
│ Problem: Manual CRM updates post-call      │
│ Users: 5 sales reps + 1 manager            │
│ Stack: Zoom, HubSpot, Slack                │
│                                            │
│ Requirements:                              │
│ ├─ Auto-transcribe Zoom calls              │
│ ├─ Extract action items + key details      │
│ ├─ Push structured notes to HubSpot        │
│ ├─ Send summary to manager via Slack       │
│ └─ No manual intervention after call ends  │
│                                            │
│ Constraints:                               │
│ ├─ Budget: <$200/mo operational cost       │
│ ├─ Timeline: 2 weeks to delivery           │
│ └─ No HIPAA requirements                   │
│                                            │
│ Acceptance Criteria:                       │
│ ├─ Call ends → CRM updated within 5 min    │
│ ├─ Manager receives Slack summary w/in 10m │
│ └─ Sales rep confirms accuracy >90%        │
└──────────────────────────────────────────┘
```

### 3. Tool Match

```
◎ CATALOG SEARCH
Match engine scores catalog against PRD requirements

  CANDIDATE A: Fireflies.ai + custom HubSpot integration
  ├─ Fit: 85% (transcription ✓, CRM push needs custom work)
  ├─ Modification: Medium (API integration, Slack webhook)
  └─ Delivery: ~5 days

  CANDIDATE B: Custom Zoom bot + Whisper + HubSpot API
  ├─ Fit: 95% (full control, exact spec match)
  ├─ Modification: High (build from components)
  └─ Delivery: ~12 days

  ⚡ RECOMMENDATION: Candidate A
  Rationale: 85% fit with 5-day delivery.
  Remaining 15% is a straightforward Slack integration.
  Candidate B is higher fit but burns most of the timeline.
```

### 4. Customer Decision

```
◇ PRESENTATION
Agent presents candidates with clear trade-offs.
Customer selects (or asks to adjust).

  Customer: "Go with A. Can you also add a weekly digest
            email to the manager?"

  Agent: "Yes — adding that as a requirement.
          Updated delivery: 6 days. Proceeding."
```

### 5. Forge & Deliver

```
🔨 MODIFICATION
- Fork/extend selected tool
- Build integration modules
- Configure for customer's stack
- Test against acceptance criteria

    ↓

◇ DELIVERY
- Deploy to customer's environment
- Handoff documentation
- 1-week support window
- Tool is built modularly for future changes
```

---

## Technical Architecture (MVP)

### Intake Agent

- **Runtime**: Claude-based conversational agent
- **Structure**: Guided dialogue with branching question trees
- **Output**: JSON-structured PRD conforming to Vajra-Upaya PRD schema
- **Integration**: Web widget, email-to-agent pipeline, or direct chat

### PRD Schema

```
{
  "id": "VU-0042",
  "problem": "string — plain language problem statement",
  "users": {
    "count": "number",
    "roles": ["string"],
    "technical_level": "low | medium | high"
  },
  "existing_stack": ["string — tools already in use"],
  "requirements": [
    {
      "id": "R1",
      "description": "string",
      "priority": "must | should | could",
      "measurable_criteria": "string"
    }
  ],
  "constraints": {
    "budget": "string",
    "timeline": "string",
    "compliance": ["string"],
    "technical": ["string"]
  },
  "acceptance_criteria": [
    {
      "id": "AC1",
      "description": "string",
      "measurement": "string"
    }
  ]
}
```

### Catalog (Seed)

- **Format**: Structured entries in a database (Supabase or similar)
- **Initial size**: PromptEngines products + 10-20 curated external tools
- **Each entry includes**:
  - Name, category, description
  - Capability matrix (what it can do out of the box)
  - Modifiability score (how easy to extend)
  - Integration options (APIs, webhooks, plugins)
  - Past modification history (empty at launch, grows over time)

### Match Engine (V0)

- **Algorithm**: Weighted scoring
  - Requirement coverage: 40%
  - Modification complexity (inverse): 25%
  - Time to delivery: 20%
  - Cost efficiency: 15%
- **Output**: Ranked list of 1-3 candidates with scores and rationale
- **Implementation**: Agent-driven analysis (not a traditional search engine — the agent reasons about fit)

### Forge

- **Process**: Human engineers + AI agent assistants
- **Build pattern**: Modular — every feature is a composable block
- **Version control**: Every modification is tracked, tagged, and reusable
- **Testing**: Automated acceptance criteria verification where possible

---

## Metrics (MVP)

| Metric | Target | Measurement |
|--------|--------|-------------|
| Problem → PRD time | < 30 minutes | Time from first message to PRD approval |
| PRD → Tool match time | < 2 hours | Time from PRD to candidate presentation |
| Match → Delivery time | < 2 weeks | Time from selection to working tool |
| Customer satisfaction | > 85% | Post-delivery survey |
| Tool accuracy | > 90% | % of acceptance criteria met at delivery |
| Modular build rate | 100% | Every delivery uses modular architecture |

---

## Team (MVP)

| Role | Responsibility |
|------|---------------|
| **Intake Agent (AI)** | Guides discovery, generates PRDs |
| **Match Agent (AI)** | Scores catalog, generates recommendations |
| **Forge Engineer (Human + AI)** | Modifies and delivers tools |
| **Catalog Curator** | Vets, scores, and maintains tool catalog |

---

## Timeline (MVP)

| Week | Milestone |
|------|-----------|
| 1-2 | Build Intake Agent + PRD schema + templates |
| 3 | Seed catalog (PromptEngines products + 10-20 external) |
| 4 | Build Match Engine V0 (agent-driven scoring) |
| 5-6 | Forge workflow: modular build patterns, delivery pipeline |
| 7 | End-to-end test with 3 internal problems |
| 8 | First external customer engagement |

---

## Risks (MVP)

| Risk | Mitigation |
|------|-----------|
| Intake agent misunderstands problem | Human review of every PRD before match phase |
| Catalog too small to find good matches | Honest "we'll build from components" option always available |
| Modification takes longer than quoted | Buffer 30% on all estimates; modular patterns reduce surprise |
| Customer scope creeps during forge | PRD is the contract — changes trigger a PRD amendment |

---

*MVP proves the diamond cuts. Phase 1 makes it scale.*
