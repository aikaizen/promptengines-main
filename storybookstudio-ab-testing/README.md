# StoryBook Studio — A/B Testing Variants

**Rule:** Never push to main unless explicitly asked.  
**Location:** Local workspace for review before deployment  
**Purpose:** Testable marketing variants for storybookstudio.promptengines.com

---

## Variant A: Original (Control)

Current landing page with:
- "Your Child, The Hero" headline
- 34 art styles emphasis
- Austin, Texas provenance
- 4-step how-it-works

**File:** `variants/landing-page-a-original.html`

---

## Variant B: Emotion-First (Test)

Headline variants:
- "The Gift They'll Never Forget" (emotion-driven)
- "Your Child's Adventure, Illustrated" (imagination)
- "Make Them The Hero of Their Own Story" (empowerment)

CTA variants:
- "Create Their Book" (action)
- "See The Magic" (curiosity)
- "Start Their Adventure" (journey)

**File:** `variants/landing-page-b-emotion.html`

---

## Variant C: Social Proof First (Test)

Reordered sections:
1. Hero with testimonial quote
2. "As Seen In" / "Loved By" logos
3. 5-star rating aggregation
4. Parent quotes (specific)
5. Product features

**File:** `variants/landing-page-c-social.html`

---

## Variant D: Problem-Agitation-Solution (PAS)

Structure:
- **Problem:** "Generic books collect dust. Your child deserves better."
- **Agitation:** "They outgrow characters. They forget plots. The magic fades."
- **Solution:** "A book where they're the hero. Forever."

**File:** `variants/landing-page-d-pas.html`

---

## Setup for Testing

### 1. Vercel Edge Config (Recommended)
Split traffic via middleware:
- 50% Variant A (control)
- 50% Variant B/C/D (test)
- Rotate every 7 days

### 2. Google Optimize (Free)
- A/B test framework
- Goal: Email signup or preview creation
- Duration: 14 days minimum

### 3. Analytics Tracking
Each variant needs:
- Unique UTM parameters
- GA4 custom events
- Conversion tracking (form submit, scroll depth)

---

## Decision Matrix

| Variant | Hypothesis | Success Metric | Confidence |
|---------|------------|----------------|------------|
| A | Baseline | Current conversion rate | — |
| B | Emotion drives action | +20% CTA clicks | Medium |
| C | Social proof builds trust | +15% email signups | High |
| D | PAS structure converts | +25% time on page | Medium |

---

## Files Ready for Review

- `variants/landing-page-a-original.html` — Control
- `variants/landing-page-b-emotion.html` — Emotion-first
- `variants/landing-page-c-social.html` — Social proof
- `variants/landing-page-d-pas.html` — PAS framework

**Next Step:** Review variants, then explicitly request deployment to storybookstudio.promptengines.com with split testing enabled.
