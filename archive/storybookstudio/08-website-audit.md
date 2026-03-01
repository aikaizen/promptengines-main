# StoryBook Studio — Website Audit

**URL:** https://storybookstudio.promptengines.com
**Audited:** 2026-02-26
**Verdict:** Strong foundation. Needs marketing work before driving traffic.

---

## What I Found

### Tech Stack
- React SPA (Vite build)
- Tailwind CSS with custom theme system
- Supabase (auth + database)
- Google Gemini AI (image/story generation)
- Vercel Blob (asset storage)
- Print provider integration (Lulu Press or similar — saddle stitch, paperback, hardcover)

### Pricing Model (from schema)
- **Free to start with 100 credits**
- Credits system: 5 credits for generation, 1 credit for lighter tasks
- Print products: Picture Book, Paperback, Keepsake Edition (Hardcover)

---

## ✅ What's Working Well

### 1. SEO Basics Are Actually Good
- Title tag: ✅ "Storybook Studio — Create Illustrated Children's Books with AI"
- Meta description: ✅ Solid — mentions 34+ art styles, print
- Keywords meta: ✅ Present (less important but fine)
- Canonical URL: ✅ Set correctly
- Open Graph tags: ✅ Complete (og:title, og:description, og:image, og:url)
- Twitter Card: ✅ summary_large_image set
- Schema.org: ✅ WebApplication schema with offer/pricing info
- Fonts: ✅ Fredoka, Space Grotesk, Playfair Display — beautiful, on-brand

### 2. Product Is Actually Deeper Than I Expected
Not just "enter child's name." This is a full creative tool:
- 34+ art styles
- Character builder (upload photo OR brainstorm from scratch)
- Page-by-page construction OR auto-generate
- Scene + background control
- Text overlay system
- Print formats: Saddle stitch, Paperback, Hardcover Casewrap
- Community gallery (optional sharing)
- Share links (X, Facebook, WhatsApp, Email)
- Gift sending flow

### 3. Freemium Model Is Smart
- 100 free credits on signup = low barrier to entry
- Users invest time creating before hitting paywall
- Credit system (5 per generation) means users can explore before committing

### 4. Themed UI
Multiple visual themes (candy, forest, sunset, hyper) — good for brand personality and delight

---

## ⚠️ What Needs Work

### 1. Domain — Biggest Problem
**The URL is the #1 issue.**
`storybookstudio.promptengines.com` is a subdomain of a domain most people have never heard of.

- Looks like a prototype, not a product
- Hard to remember and say out loud ("it's at storybookstudio dot prompt engines dot com")
- Hurts trust at events, in press, on business cards
- Hurts SEO — subdomain carries less authority than a root domain
- **Recommendation:** Get `storybookstudio.com` or `storybookstudio.ai` and redirect

### 2. No Landing Page / Marketing Layer
The site goes straight into the app. There's no:
- Hero section explaining what the product is
- Before/after visuals showing a finished book
- Social proof / testimonials
- "How it works" walkthrough
- Pricing page
- FAQ section
- Email capture / lead magnet

A first-time visitor from an ad or social post lands on... a login screen. That kills conversions.

**Fix:** Build a proper marketing landing page before the app login. Standard SaaS structure:
```
Hero → How It Works → Example Books → Pricing → Testimonials → FAQ → CTA
```

### 3. No Blog / Content
No `/blog`, no articles, no SEO content. Zero chance of organic traffic beyond branded search.

### 4. Messaging Is Too Feature-Focused
Current meta description: *"Design characters, generate artwork in 34+ art styles, and print real books"*

That's features, not feelings. Compare:
- ❌ Current: "generate artwork in 34+ art styles"
- ✅ Better: "Create a storybook starring your child — ready in minutes"

The product is emotionally powerful. The copy doesn't reflect that yet.

### 5. No Trust Signals
- No testimonials
- No review count
- No "X books created" social proof counter
- No press mentions
- No money-back guarantee
- No privacy/security reassurance for parents (important — this is for kids)

### 6. Subdomain Branding Creates Confusion
"PromptEngines" as the parent brand doesn't mean anything to a parent looking for a gift. When they Google "StoryBook Studio" after hearing about it at an event, they need to find a clean, standalone brand.

### 7. The App Is Complex for New Users
It's a powerful tool — almost too powerful for someone expecting "enter name, get book."
- New users need to create a character first (not obvious)
- The "page by page OR auto-generate" split isn't immediately clear
- Onboarding is likely where users drop off

**Fix:** Add a guided onboarding flow for first-time users. "Quick mode" vs "Custom mode."

### 8. No Mobile App
Web-only is fine for now, but parents are on their phones. The web app needs to be fully responsive and fast on mobile. Worth testing.

### 9. Print Pricing Not Visible
The schema says "Free to start" but print pricing isn't visible without going through the flow. Users need to know the price before they commit emotionally. Unclear pricing = hesitation at checkout.

---

## Priority Fixes (in order)

| Priority | Fix | Effort | Impact |
|----------|-----|--------|--------|
| 🔴 1 | Get a standalone domain (storybookstudio.com or .ai) | Low | Massive |
| 🔴 2 | Build a marketing landing page before the app | High | Massive |
| 🔴 3 | Rewrite hero copy — emotion, not features | Low | High |
| 🟡 4 | Add pricing page / visible print pricing | Medium | High |
| 🟡 5 | Add testimonials + social proof | Medium | High |
| 🟡 6 | Add onboarding flow / "Quick mode" | High | High |
| 🟡 7 | Set up blog for SEO content | Medium | Medium |
| 🟢 8 | Add email capture on landing page | Low | Medium |
| 🟢 9 | Add FAQ section | Low | Medium |
| 🟢 10 | Mobile experience audit | Low | Medium |

---

## Overall Score

| Category | Score | Notes |
|----------|-------|-------|
| Technical SEO | 7/10 | Good basics, missing blog/content |
| Copywriting | 4/10 | Feature-focused, not emotional |
| Conversion optimization | 3/10 | No landing page, goes straight to app |
| Trust signals | 2/10 | Nothing there yet |
| Brand/domain | 4/10 | Subdomain hurts credibility |
| Product depth | 8/10 | Genuinely impressive tool |
| Mobile readiness | Unknown | Needs testing |
| **Overall** | **5/10** | Strong product, weak marketing layer |

---

## Bottom Line

The product is real and it's good — better than I expected. 34+ art styles, character builder, print options, free credits — this is a proper creative tool, not a toy.

The problem is nobody knows it exists, and when they find it, the landing experience doesn't sell them. You're sending people to an app before you've told them why they should care.

The single biggest unlock: **a proper marketing landing page.** Before we spend a dollar on ads or attend a single event, there needs to be something to land on that converts.

Second biggest: **a real domain.** `storybookstudio.com` or `storybookstudio.ai`. Worth checking availability immediately.
