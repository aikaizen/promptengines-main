---
title: "Evaluating Large Language Models: A Framework for Production Selection"
date: 2026-03-03
author: "Andy Stable (AI) & Human Co-Author"
category: experiments
topics: [model-evaluation, llm-comparison, testing-framework]
---

# Evaluating Large Language Models: A Framework for Production Selection

Selecting a primary language model for production use requires testing across dimensions that benchmark suites miss. Latency variance, retry rates, and context-window degradation don't appear in leaderboards but dominate operational costs. We are designing a systematic evaluation to move beyond surface-level comparisons. This article documents our framework, preliminary observations, and the experiments we plan to run.

## The Gap in Public Benchmarks

Published evaluations focus on standardized tasks: MMLU for reasoning, HumanEval for coding, Arena Elo for aggregate quality. These metrics matter but fail to capture production realities:

- **Latency variance** matters more than mean latency when you're running thousands of parallel requests
- **Retry rates** multiply nominal costs by 1.5–3× in practice
- **Context degradation**—performance at 4K versus 64K context—determines whether advertised specs match real usage
- **Output consistency** affects whether automated pipelines can trust model responses without human verification

Our goal is a testing framework that measures these operational variables, not just headline benchmark scores.

## The Models Under Evaluation

We are testing four models that occupy the "large context, high capability" segment:

| Model | Provider Access | Context Window | Price (Input/Output per 1M)[^1] |
|-------|----------------|----------------|--------------------------------|
| Claude Opus 4.6 | Anthropic direct | 200K | $15.00 / $75.00 |
| Claude Sonnet 4.6 | Anthropic direct | 200K | $3.00 / $15.00 |
| Kimi 2.5 | Fireworks AI | 256K | $0.80 / $0.80 |
| MiniMax 2.5 | Fireworks AI | 1M | $0.26 / $0.26 |

[^1]: Pricing verified March 2026 from provider documentation. Anthropic pricing at https://anthropic.com/pricing, Fireworks at https://fireworks.ai/pricing.

The pricing spread is significant: Opus costs 28× more per token than MiniMax on the input side, 288× more on output. Whether that premium translates to operational value depends on variables public benchmarks don't capture.

## Our Evaluation Framework

We are designing tests across four dimensions:

### 1. Quality Distribution Testing

**The Question:** Do models maintain consistent quality across prompts, or does variance introduce operational risk?

**Planned Methodology:**
- Curate 100–200 representative tasks from our actual workload: code review, documentation generation, structured data extraction, reasoning chains
- Submit each task 10× per model (to measure variance, not just point estimates)
- Human rating on 1–5 rubric with explicit criteria
- Calculate mean, standard deviation, and percentile distributions
- Measure inter-rater reliability (multiple raters on subset)

**Preliminary Observation:** In limited testing, we've noticed Kimi 2.5 produces more consistent formatting and structure across similar prompts. Opus occasionally returns verbose, over-explained responses where concise output was requested. We need systematic measurement to determine if this pattern holds.

**What We Need:** A rating rubric; human rating time budget (~40 hours); statistical analysis plan for comparing distributions (not just means).

### 2. Latency Under Load

**The Question:** How do models behave at production-scale request volumes, not single-request benchmarks?

**Planned Methodology:**
- Test at 1, 10, 50, 100+ concurrent requests
- Measure time-to-first-token (TTFT) and tokens-per-second (TPS) at p50, p95, p99
- Test at multiple context sizes: 1K, 4K, 16K, 32K, 64K input tokens
- Run from multiple geographic origins (us-east-1, us-west-2, eu-west-1)
- Include retry/backoff behavior under rate limiting

**What We Need:** Load testing infrastructure; consistent prompt templates at varying context sizes; monitoring for rate limit behavior (429 responses, retry-after headers).

### 3. Retry and Failure Analysis

**The Question:** What percentage of requests require retry, and what's the total cost-to-completion?

**Planned Methodology:**
- Run 1000+ requests per model through automated pipeline
- Log: success on first try; success after retry; failed after max retries; timeout
- Calculate "true cost" = (nominal price) × (1 + retry rate)
- Analyze failure patterns by task type and context size

**Hypothesis to Test:** Cheaper models (MiniMax) may have higher retry rates for complex reasoning, negating cost advantage. We've observed anecdotal cases where MiniMax produces structurally correct but semantically incomplete outputs for multi-step reasoning tasks.

**What We Need:** Automated pipeline with retry logic; structured logging; categorization of failure modes (hallucination, formatting error, refusal, timeout).

### 4. Context Window Reality Check

**The Question:** Do models maintain quality at advertised context limits, or does performance degrade before the theoretical maximum?

**Planned Methodology:**
- "Needle in a haystack" test: place specific fact at varying positions in long context (beginning, middle, end), test retrieval accuracy
- Reasoning task complexity at 4K, 16K, 32K, 64K contexts
- Measure latency degradation as context grows

**What We Need:** Synthetic long-context test sets; automated accuracy scoring for needle retrieval; complexity-calibrated reasoning tasks.

## Preliminary Allocation Strategy

Based on limited experience and the pricing structure, we've adopted a tiered allocation for our current development phase:

| Model | Current Role | Rationale (To Be Tested) |
|-------|-------------|-------------------------|
| **Kimi 2.5** | Default for prototyping and internal tools | Lowest cost for acceptable quality; Fireworks provides fast, reliable hosting |
| **Claude Sonnet 4.6** | Customer-facing features requiring "safe" refusal patterns | Anthropic's safety training may reduce edge-case risk; needs validation |
| **Claude Opus 4.6** | Complex multi-step analysis where reasoning depth critical | Reserved for tasks where failure cost exceeds price premium |
| **MiniMax 2.5** | Summarization, classification, low-complexity batch jobs | Price point enables high-volume experimentation; quality ceiling unclear |

**Explicit Uncertainty:** These allocations are provisional. We lack sufficient data to confirm whether Kimi's consistency advantage outweighs Sonnet's safety benefits, or whether MiniMax's retry rate makes it truly cheaper than Kimi for our workloads. The framework above is designed to replace these assumptions with measurements.

## What We Hope to Learn

**Specific Questions:**

1. Does Kimi 2.5's quality variance (if measured lower) translate to measurable operational savings (fewer retries, less human verification)?
2. At what volume does Opus's price premium become indefensible, even for complex tasks?
3. Does MiniMax's 1M context window work reliably at full length, or does effective context degrade earlier?
4. What's the latency penalty (if any) for running Kimi through Fireworks versus theoretical direct access?
5. How does Anthropic's direct API reliability compare to Fireworks-hosted alternatives for our geographic distribution?

**Expected Timeline:**
- Framework implementation: 2–3 weeks
- Initial data collection: 4–6 weeks  
- Analysis and publication: 2 weeks
- Ongoing monitoring: Continuous

## A Note on "Vibe" vs. Data

Currently, our preference for Kimi 2.5 as a default rests on:
- **Pricing transparency:** $0.80/1M is straightforward to calculate against
- **Fireworks hosting:** Fast TTFT in limited testing; 99.9%+ uptime in our brief monitoring
- **Anecdotal consistency:** Less output variance in manual spot-checking

These are not findings. They are hypotheses to test. The framework above is designed to replace "feels consistent" with measured variance, "seems fast" with latency distributions, and "appears cheaper" with total cost-to-completion including retries.

## Call for Collaboration

If you are running similar evaluations—or have data to share on model consistency, retry rates, or context-window performance—we would welcome exchange. Standardized testing methodologies benefit the ecosystem more than isolated benchmark runs. Contact: [lab@promptengines.com]

---

## Planned Experiments Summary

| Experiment | Sample Size | Variables Measured | Timeline |
|------------|-------------|-------------------|----------|
| Quality distribution | 200 tasks × 10 samples × 4 models = 8,000 rated outputs | Mean, std dev, percentile scores, inter-rater reliability | 4 weeks |
| Latency under load | 10,000 requests per model at 4 concurrency levels | TTFT p50/p95/p99, TPS, geographic variance | 2 weeks |
| Retry analysis | 5,000 requests per model through automated pipeline | First-pass success rate, retry count, true cost multiplier | 3 weeks |
| Context window | 500 needle tests + 200 reasoning tasks | Accuracy at 4K/16K/32K/64K, latency degradation | 2 weeks |

**Total planned requests for full evaluation:** ~40,000 API calls per model

---

## Sources

[^1]: Anthropic API pricing (https://www.anthropic.com/pricing). Fireworks AI pricing (https://fireworks.ai/pricing). Accessed March 2026.
[^2]: Model capability claims from provider documentation. Context windows verified from API specifications.
