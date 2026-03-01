# PRD — StoryBook Studio Landing Page + Interactive Product Tour

**Status:** Draft
**Priority:** 🔴 P0 — Must ship before any marketing spend
**Last updated:** 2026-02-26

---

## Overview

Build a marketing landing page for `storybookstudio.promptengines.com` (and eventual standalone domain) that:

1. Converts cold visitors into signups/book creators
2. Includes an **interactive product tour** — visitors experience the magic of the product without creating an account
3. Captures emails from visitors who aren't ready to sign up yet
4. Works on mobile and desktop

The landing page is the single highest-leverage thing we can build right now. Without it, every dollar spent on ads and every person met at events lands on a login screen and bounces.

---

## The Problem

**Current state:** Visiting the site takes you directly to an app login screen. There is no explanation of what the product is, who it's for, what it costs, or why it's special. Cold visitors bounce immediately.

**Impact:** Every marketing channel (ads, events, PR, social) is currently broken at the last mile. People arrive and leave.

---

## Goals

| Goal | Metric | Target |
|------|--------|--------|
| Convert visitors to signups | Signup conversion rate | > 8% |
| Convert visitors to book creators | "Book started" rate | > 5% |
| Capture emails from non-signups | Email capture rate | > 3% |
| Communicate value instantly | Time-to-understand | < 10 seconds |
| Reduce bounce rate | Bounce rate | < 60% |

---

## Users

### Primary: The Curious Parent
- Arrived from TikTok, Instagram, or a friend's recommendation
- On mobile (70%+ of traffic)
- Skeptical — has seen "AI" products overpromise before
- Needs to **feel** the product before they trust it
- Will not sign up until they believe the output is actually beautiful

### Secondary: The Gift-Giver
- Arrived from Google ("personalized children's book gift")
- Older demographic, possibly on desktop
- Higher intent — already in buying mode
- Needs to see pricing and shipping info clearly

### Tertiary: The Press/Investor
- Arrived from a pitch, press mention, or event
- Wants to understand the product quickly
- Cares about differentiation from Wonderbly/Lost My Name

---

## Feature Specifications

---

### F1 — Hero Section

**Purpose:** Stop the scroll. Communicate value in under 3 seconds.

**Components:**
- **Headline (H1):** "Every child deserves to be the hero of their own story."
- **Subheadline:** "Create a personalized, AI-illustrated storybook starring your child. Digital download or print-on-demand. Ready in minutes."
- **Hero visual:** Animated book cover with a child's name that types in and updates in real time (interactive — visitor types their child's name and the cover updates live). Fallback: beautiful static image of a finished book.
- **Primary CTA button:** "Create Your Book Free →"
  - Color: primary brand accent
  - Below button: "No credit card needed · 100 free credits · Takes 3 minutes"
- **Secondary CTA:** "See how it works ↓" (anchor link to tour section)

**Hero Visual — Interactive Name Preview (HIGH PRIORITY)**
- Input field: "Enter your child's name"
- As user types, the name appears on an animated book cover in real time
- No signup required for this interaction
- On completion: "✨ Beautiful. Now let's make the full book →" → triggers signup/start flow
- This single interaction is the most powerful conversion tool on the page

**Mobile behavior:** Stack vertically. Name input above the fold. CTA visible without scrolling.

---

### F2 — Social Proof Bar

**Purpose:** Immediately establish credibility below the hero.

**Components:**
- Books created counter: "📖 [X] books created" (live counter if possible, static if not)
- Star rating: "⭐⭐⭐⭐⭐ Loved by families in [X] countries"
- Press logos (when available): Empty state = hide this section until we have 1+ mention

**Implementation note:** Counter can be hardcoded and updated manually at first. Auto-pull from Supabase when engineering has bandwidth.

---

### F3 — Interactive Product Tour

**Purpose:** Let visitors experience the core magic of the product without creating an account. The #1 objection to signing up for a creative tool is "I don't know if the output will be good." The tour eliminates this objection.

**Tour Flow (5 steps, ~2 minutes total):**

#### Step 1 — Meet Your Character
- User sees a pre-built demo character (e.g., "Emma, age 5, loves dinosaurs")
- They can tweak 2–3 traits: hair color, name, one personality trait
- No upload required — works from description only in demo mode
- Visual: character reference sheet generates in real time (cached/pre-generated for demo)
- CTA at bottom: "Next: Pick your story →"

#### Step 2 — Choose Your Style
- Horizontal scrollable gallery of 8 art style previews (subset of 34+)
- Tapping a style updates the demo character preview
- Style names shown: Watercolor, Studio Ghibli, Comic Book, Classic Illustration, etc.
- Visual delight is the goal — make it feel like a toy
- CTA: "Next: See your page →"

#### Step 3 — Your Page
- A full illustrated book page generates with:
  - The character they customized
  - The art style they picked
  - Their child's name in the story text
  - A pre-written story sentence that incorporates the name
- This is a **pre-generated image** (not live AI generation) — select the best-looking output from each style combination and cache it
- Presentation: page flip animation, like reading a real book
- "This is what your child's book looks like" label
- CTA: "Make the full book →" → triggers signup

#### Step 4 — Choose Your Format (shown during/after signup)
- Digital download — instant, from $X
- Printed Picture Book — shipped in X days, from $X
- Hardcover Keepsake — premium, from $X
- "Which would you like?" selection → drives them into the real app

#### Step 5 — Complete (Post-signup)
- "Your book is waiting for you!"
- "You have 100 free credits — enough to create your first complete book"
- Redirect into app with tour context preserved (character/style pre-selected if possible)

**Technical approach:**
- Tour can be built as a standalone React component embedded in the landing page
- Pre-generate ~50 high-quality demo outputs (8 styles × ~6 character types) and cache them
- No live AI calls in the tour — show best-case outputs
- Track: step completion rate, drop-off by step, conversion from tour → signup

**Tour entry points:**
- "See how it works ↓" link in hero
- Dedicated "Try it" button in nav
- After 30 seconds on page (scroll-triggered)

---

### F4 — How It Works

**Purpose:** Remove confusion. Show the process is simple.

**Format:** 3-step horizontal layout (desktop) / vertical stack (mobile)

```
[Icon]          [Icon]          [Icon]
Step 1          Step 2          Step 3
Describe        Pick your       Get your
your child      story style     book

Tell us their   Choose from     Download
name, look,     34+ art styles  instantly or
and personality and a story     we print and
                theme           ship to you
```

**Visual:** Screenshot or illustration of the app at each step.

---

### F5 — Sample Books Gallery

**Purpose:** Show the product. This is the primary sales tool.

**Components:**
- 6 book spreads (2-page layouts) across different art styles
- Style filter: "Watercolor · Studio Ghibli · Comic · Classic · All"
- Each spread shows: a child's name in the story, a full scene illustration, story text
- Lightbox on click — full-size view
- Caption: art style name + "Created by [parent name], [city]" (humanizes it)
- CTA below gallery: "Create yours →"

**Content needed:** 6 high-quality sample book spreads across different styles. Real books preferred over demo outputs.

---

### F6 — Who It's For

**Purpose:** Help each persona self-identify. Reduces cognitive load.

**Format:** 3 cards

```
🧒 For Parents          🎁 For Gift-Givers       📚 For Educators
─────────────────       ──────────────────        ─────────────────
"Bedtime just got       "The gift they'll         "Watch reluctant
magical."               never forget."            readers come alive."

Your child is the       No more toys they         When kids see
hero of every           already have. Give        themselves as the
bedtime story.          them their own            hero, reading
Make it personal.       storybook adventure.      becomes magic.

[Create a book]         [Find a gift]             [Try for free]
```

Each CTA links to the same signup flow with a source tag for analytics.

---

### F7 — Pricing

**Purpose:** Remove hesitation. Transparent pricing builds trust.

**Format:** Clean 3-column pricing table

```
FREE                    DIGITAL                  PRINT
────────────────        ─────────────────        ──────────────────
100 credits             From $X                  Picture Book: $X
to start                per book                 Paperback: $X
                                                 Hardcover: $X

✓ Full app access       ✓ Instant download       ✓ Printed & shipped
✓ All art styles        ✓ High-res PDF           ✓ Premium quality
✓ Unlimited projects    ✓ Share digitally        ✓ X–X day delivery
✓ No card needed        ✓ Print later            ✓ Gift wrapping option

[Start Free]            [See pricing]            [Order a book]
```

**Note:** Actual prices TBD — need to confirm with team. Currently not visible on site.

---

### F8 — Testimonials

**Purpose:** Social proof from real parents.

**Format:** 3 featured quotes + rotating ticker of shorter quotes

**Featured (large cards):**
- Photo/avatar + name + location
- Quote (focus on child's reaction — that's the emotional trigger)
- Book they made (thumbnail)

**Example copy (placeholder until real quotes collected):**
> "She looked at the cover, saw her name, and whispered 'that's me.' I cried."
> — Sarah M., Austin TX

> "I've spent so much on gifts over the years. This is the only one my son still talks about."
> — James R., Dallas TX

> "My class of reluctant readers actually asked for more books after I showed them this."
> — Ms. Chen, 2nd Grade Teacher

**How to collect:** Post-purchase email #2 asks for a quote + reaction photo. Automate with a simple form link.

---

### F9 — FAQ

**Purpose:** Kill the last objections before they bounce.

**Questions:**
1. **Is it really free to start?** Yes — new accounts get 100 credits, enough to create one complete book. No credit card required.
2. **How does the printing work?** We partner with a professional print-on-demand provider. Books are printed in [X] and shipped to your door in [X–X] business days.
3. **How long does it take to make a book?** Most parents finish their first book in 10–20 minutes. The AI generates each page in under a minute.
4. **Can I customize everything or is it a template?** Everything is customizable — characters, art style, story themes, individual pages. It's a full creative studio, not a fill-in-the-blank template.
5. **Is my child's information safe?** Yes. Your books are private by default. We never share or use your child's information for AI training. [Link to privacy policy]
6. **What ages is this for?** Best for ages 2–8, but we've seen kids up to 12 love being the hero of their own story.
7. **Can I make more than one book?** Absolutely — create as many projects as you want. Each book creation uses credits.
8. **What if I don't like the output?** Credits are refunded for generations that fail or that you're not happy with.

**Format:** Accordion/expand — all collapsed by default, open on click.

---

### F10 — Final CTA Section

**Purpose:** Last chance to convert. Repeat the emotional hook.

**Components:**
- Background: warm, inviting color or illustration
- Headline: "Your child's adventure is waiting."
- Subheadline: "Join thousands of families creating books they'll treasure forever."
- CTA button: "Create Your Book Free →"
- Below button: "100 free credits · No card needed · Ready in minutes"

---

### F11 — Navigation

**Desktop nav:**
- Logo (left)
- Links: How It Works · Gallery · Pricing · FAQ
- CTA button: "Try Free" (right, accent color)
- Secondary: "Sign In" (text link)

**Mobile nav:**
- Hamburger menu
- Same links
- Full-width "Try Free" button at bottom of menu

**Behavior:** Sticky on scroll. CTA button always visible.

---

### F12 — Footer

- Logo + tagline
- Links: Privacy Policy · Terms · Contact · Blog
- Social icons (once accounts exist)
- "© 2026 StoryBook Studio by PromptEngines"

---

## Interactive Tour — Technical PRD

### Architecture

```
LandingPage
├── HeroSection
│   └── LiveNamePreview (interactive)
├── SocialProofBar
├── ProductTour (F3)
│   ├── TourStep1_Character
│   ├── TourStep2_Style
│   ├── TourStep3_PagePreview
│   └── TourStep4_Format
├── HowItWorks
├── SampleGallery
├── WhoItsFor
├── Pricing
├── Testimonials
├── FAQ
└── FinalCTA
```

### Pre-generated Demo Assets Required

| Style | Character Type | Output needed |
|-------|---------------|---------------|
| Watercolor | Girl, light hair | Cover + 1 spread |
| Watercolor | Boy, dark hair | Cover + 1 spread |
| Studio Ghibli | Girl, curly hair | Cover + 1 spread |
| Studio Ghibli | Boy, blond | Cover + 1 spread |
| Comic Book | Girl | Cover + 1 spread |
| Comic Book | Boy | Cover + 1 spread |
| Classic Illustration | Girl | Cover + 1 spread |
| Classic Illustration | Boy | Cover + 1 spread |

**Total: ~16 pre-generated assets** (cover + spread per combination). Generated once, cached, served as static images on the landing page.

### Tour State Management

```typescript
interface TourState {
  step: 1 | 2 | 3 | 4 | 5;
  childName: string;
  hairColor: 'light' | 'dark' | 'curly' | 'blond';
  artStyle: string;
  selectedFormat: 'digital' | 'picture-book' | 'hardcover' | null;
  entryPoint: 'hero' | 'how-it-works-cta' | 'scroll-trigger';
}
```

### Analytics Events to Track

```
tour_started { entry_point }
tour_step_completed { step, time_spent }
tour_step_abandoned { step, time_spent }
tour_completed
tour_to_signup { style_selected, format_selected }
hero_name_typed { name_length }
hero_name_cta_clicked
```

### Performance Requirements
- Hero LCP (Largest Contentful Paint): < 2.5s
- Tour asset loading: preload next step assets while user is on current step
- Mobile: all interactions work with touch
- No layout shift (CLS < 0.1)

---

## Content Requirements (Needed Before Build)

| Asset | Owner | Status |
|-------|-------|--------|
| 6 sample book spreads (real books) | Product | ⬜ Needed |
| 16 pre-generated tour demo images | Product/AI | ⬜ Needed |
| Hero OG image (1200×630) | Design | ⬜ Needed |
| Actual pricing (digital + each print tier) | Business | ⬜ Needed |
| 3 real parent testimonials + photos | Marketing | ⬜ Needed |
| Privacy policy page | Legal | ⬜ Needed |
| Social account handles | Marketing | ⬜ Needed |

---

## Implementation Phases

### Phase A — Static Landing Page (Week 1)
*No tour yet. Just a proper page that converts.*
- Hero (static image, no live preview)
- How It Works
- Sample Gallery (3 spreads minimum)
- Pricing (even if approximate)
- FAQ
- Final CTA
- Email capture

**Ship this first.** Even a basic landing page is 10x better than the current login screen.

### Phase B — Interactive Hero (Week 2)
- Live name preview in hero (types in, name appears on cover)
- Scroll-triggered email capture modal

### Phase C — Full Product Tour (Week 3–4)
- Full 5-step interactive tour
- Pre-generated demo assets
- Tour analytics
- Tour → signup handoff with state preservation

### Phase D — Dynamic Social Proof (Week 4+)
- Live books created counter (pulls from Supabase)
- Real testimonials with photos
- Press logos (when earned)

---

## Success Criteria

| Metric | Baseline (now) | Target (Phase A) | Target (Phase C) |
|--------|---------------|-----------------|-----------------|
| Bounce rate | ~90% (login page) | < 65% | < 50% |
| Signup conversion | ~1% | > 5% | > 10% |
| Email capture | 0% | > 3% | > 5% |
| Time on page | ~10s | > 60s | > 120s |
| Mobile conversion | ~0% | > 3% | > 7% |

---

## Open Questions

1. **Domain** — Are we building on `storybookstudio.promptengines.com` or a new standalone domain? Standalone is strongly recommended before this goes live.
2. **Pricing** — What are the actual credit pack prices and print prices? Needed for pricing section.
3. **Sample books** — Do we have 6 high-quality book spreads we can use? Or do we need to generate them?
4. **Testimonials** — Do we have any real parent quotes from the early users? Or do we start collecting via post-signup prompt?
5. **Tech** — Is this landing page built in the same React repo as the app, or separate? Separate is cleaner for performance.
6. **Tour handoff** — When tour user clicks "Make the full book," can we pre-populate their character/style in the real app? This dramatically improves the signup → creation conversion.
