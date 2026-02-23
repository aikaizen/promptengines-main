# PromptEngines — SEO & Growth Marketing Plan

**Last updated:** February 2026
**Objective:** Rapid user acquisition across the PromptEngines portfolio (consulting, products, media services)

---

## Executive Summary

PromptEngines operates five business lines across a single domain ecosystem: AI Consulting, Kaizen (kids learning), Storybook Studio (AI storybooks), Flow (AI tutoring), and Media Consulting. This plan covers organic search, paid acquisition, content marketing, and community-driven growth across all properties. The goal is measurable traffic, qualified leads, and product signups within 90 days, scaling aggressively through month 6.

---

## Phase 1: Foundation (Weeks 1-3)
*Technical SEO, analytics, and infrastructure*

### 1.1 Technical SEO Audit & Fix

- [ ] **Crawlability:** Add `sitemap.xml` and `robots.txt` to every subdomain (promptengines.com, consulting., kaizen., storybookstudio., flow.)
- [ ] **Meta tags:** Unique `<title>`, `<meta description>`, and `<meta og:*>` tags per page. Each subdomain should have its own keyword-targeted meta.
- [ ] **Structured data:** Add JSON-LD `Organization` schema to promptengines.com, `SoftwareApplication` schema to each product subdomain, `ProfessionalService` schema to consulting.promptengines.com
- [ ] **Core Web Vitals:** Audit LCP, FID, CLS on all pages. Target all green. Current static HTML should score well — verify with PageSpeed Insights.
- [ ] **Mobile-first:** Verify responsive rendering on iOS Safari, Android Chrome at 375px, 390px, 414px widths
- [ ] **HTTPS:** Confirm all subdomains have valid SSL (Vercel handles this)
- [ ] **Canonical tags:** Add `<link rel="canonical">` to every page to prevent duplicate content issues across variants
- [ ] **Internal linking:** Cross-link between subdomains (consulting site links to products, products link back to main site)
- [ ] **Page speed:** Inline critical CSS (already done), lazy-load any images added later, preconnect to Google Fonts (already done)

### 1.2 Analytics & Tracking Setup

- [ ] **Google Analytics 4** on all subdomains with cross-domain tracking enabled
- [ ] **Google Search Console** — verify all 5 properties (main + 4 subdomains)
- [ ] **Conversion events:** Define and track: form submissions, email clicks, outbound product link clicks, CTA button clicks
- [ ] **UTM framework:** Standardize UTM parameters: `utm_source`, `utm_medium`, `utm_campaign`, `utm_content` for all outbound links
- [ ] **Heatmaps:** Set up Microsoft Clarity (free) or Hotjar on the main site and consulting site
- [ ] **Goal funnels:** GA4 funnels for: Landing → Scroll to How We Work → Scroll to Contact → Form Submit

### 1.3 Google Business Profile

- [ ] Claim and optimize Google Business Profile for "Prompt Engines"
- [ ] Category: "AI Consulting," "Software Company," "Media Production"
- [ ] Add photos, services list, business hours, and link to consulting.promptengines.com

---

## Phase 2: Keyword Strategy & Content Engine (Weeks 2-6)
*Organic search positioning and content production*

### 2.1 Keyword Research

**Primary clusters (high intent, medium competition):**

| Cluster | Target Keywords | Landing Page |
|---------|----------------|--------------|
| AI Consulting | "ai consulting for small business," "ai strategy consultant," "ai consulting services," "hire ai consultant" | consulting.promptengines.com |
| AI for Business | "how to use ai in my business," "ai tools for small business," "ai automation for business" | promptengines.com |
| Kids Learning | "ai learning app for kids," "educational app for toddlers," "ai coloring pages for kids" | kaizen.promptengines.com |
| AI Storybooks | "ai storybook maker," "personalized children's storybook," "custom ai storybook" | storybookstudio.promptengines.com |
| AI Tutoring | "ai tutor for students," "ai esl tutoring," "ai homeschool tutor" | flow.promptengines.com |
| Coding Agents | "how to use coding agents," "ai coding assistant for business," "claude code setup" | consulting.promptengines.com (blog) |
| Team AI Training | "ai training for teams," "ai upskilling course," "corporate ai workshop" | consulting.promptengines.com |

**Long-tail targets (low competition, high conversion):**
- "ai consultant who actually builds things"
- "ai consulting for startups"
- "ai consulting for venture capital"
- "turn ai tools into business workflow"
- "ai storybook for my child"
- "ai coloring pages generator kids"
- "ai tutor for esl students"

### 2.2 Content Marketing — Blog & Resource Hub

**Add a `/blog` or `/resources` section to promptengines.com.** Static HTML pages are fine. Publish 2-3 articles per week.

**Content pillars:**

1. **"AI for your business" guides** (top of funnel)
   - "5 Ways Small Businesses Are Actually Using AI Right Now"
   - "AI Tools Your Team Should Be Using in 2026"
   - "How to Evaluate If Your Business Needs AI Consulting"
   - "What a Coding Agent Actually Does (And How to Set One Up)"

2. **Case-study style posts** (middle of funnel)
   - "How We Built an AI Tutoring Platform for a School in Pakistan"
   - "From Idea to Shipped Product in 5 Days: Building Storybook Studio"
   - "Consolidating AI Tools: From 12 Subscriptions to One Workflow"

3. **Product-led content** (bottom of funnel)
   - "How Kaizen Uses AI to Generate Fresh Learning Content Every Day"
   - "Inside Flow: How Adaptive AI Tutoring Works"
   - "What Happens in a Prompt Engines Consulting Engagement"

4. **Thought leadership** (authority building)
   - "Why Most AI Consulting Is a Waste of Money (And What Works Instead)"
   - "The Operating Company Model: Why We Build and Run Our Own Products"
   - "Agent + Human Teams: The Future of Small Business Software Development"

**Content format:** Each post should be 1200-2000 words, include internal links to relevant products/services, have a clear CTA, and be optimized for one primary keyword + 2-3 secondary keywords.

### 2.3 On-Page SEO for Existing Pages

- [ ] Add H2/H3 heading hierarchy to all landing pages (currently flat structure)
- [ ] Add alt text to any images/icons
- [ ] Ensure each page has exactly one H1
- [ ] Add FAQ sections with `FAQPage` schema to consulting and product pages
- [ ] Internal link mesh: every product page links to consulting, consulting links to products, main site links to everything

---

## Phase 3: Paid Acquisition (Weeks 3-8)
*Targeted spend for immediate lead generation*

### 3.1 Google Ads — Search Campaigns

**Campaign 1: AI Consulting (high intent)**
- Keywords: "ai consultant," "ai consulting services," "hire ai consultant," "ai strategy for business"
- Landing page: consulting.promptengines.com
- Budget: $30-50/day
- Bid strategy: Target CPA, optimize for form submissions
- Ad copy angle: "AI Consulting That Builds, Not Just Advises" / "Free Consultation"

**Campaign 2: AI for Kids (product signups)**
- Keywords: "ai learning app kids," "educational app toddlers," "ai coloring pages"
- Landing page: kaizen.promptengines.com
- Budget: $15-25/day
- Bid strategy: Maximize clicks initially, shift to Target CPA once conversion data exists

**Campaign 3: AI Storybooks (product signups)**
- Keywords: "personalized storybook," "custom children's book," "ai storybook maker"
- Landing page: storybookstudio.promptengines.com
- Budget: $15-25/day

### 3.2 Meta Ads (Facebook/Instagram)

**Audience 1: Small Business Owners**
- Interest targeting: Small business, entrepreneurship, AI tools, SaaS
- Lookalike: Build from consulting form submissions once you have 50+
- Creative: Short-form video (30s) showing before/after of an AI workflow transformation
- CTA: "Book a Free Consultation"
- Budget: $20-30/day

**Audience 2: Parents (for Kaizen & Storybook Studio)**
- Interest targeting: Parenting, homeschooling, kids education, children's books
- Age: 25-45
- Creative: Carousel showing AI-generated storybook pages or Kaizen activity screenshots
- CTA: "Try It Free"
- Budget: $15-25/day

### 3.3 LinkedIn Ads (consulting only)

- Target: Founders, CTOs, VPs of Engineering, Operations Directors at companies with 10-200 employees
- Format: Single image + text, linking to consulting.promptengines.com
- Copy angle: "Your team is using 12 different AI tools. We can fix that."
- Budget: $25-40/day
- Goal: Consultation bookings

### 3.4 Retargeting

- Install Meta Pixel and Google Ads remarketing tag on all properties
- Retarget visitors who hit the contact section but didn't submit
- Retarget product page visitors with specific product ads
- 7-day and 30-day windows

---

## Phase 4: Distribution & Community (Weeks 4-12)
*Organic amplification and audience building*

### 4.1 Social Media — Organic

**Platforms (priority order):** LinkedIn, X/Twitter, Instagram, TikTok

**LinkedIn (primary for consulting):**
- 3-5 posts/week from founder's personal account
- Content: short insights on AI for business, behind-the-scenes of builds, mini case studies
- Engage in AI, startup, and small business communities
- Goal: 1000+ followers in 90 days, 2-3 inbound leads/week

**X/Twitter (primary for products + developer audience):**
- Build-in-public threads about shipping products
- Technical content about agent workflows, AI tooling
- Product launch announcements
- Engage with AI, EdTech, and indie hacker communities

**Instagram (primary for Storybook Studio + Kaizen):**
- Visual content: AI-generated storybook pages, Kaizen activity screenshots
- Reels: 15-30s demos of products in action
- Parent-focused content

**TikTok (experimental, high upside):**
- Short demos of AI consulting transformations
- "AI built this in 5 minutes" style content
- Kids using Kaizen / families reading Storybook Studio books

### 4.2 Product Hunt Launches

- [ ] **Storybook Studio** — full Product Hunt launch with maker story, 5+ hunter, screenshot gallery
- [ ] **Kaizen** — launch 2-3 weeks after Storybook Studio
- [ ] **Flow** — launch when ready for public signups
- [ ] Coordinate launches for Tuesday-Thursday (highest traffic days)
- [ ] Prep: 100+ upvotes from network, respond to every comment, offer limited-time deal

### 4.3 Community Seeding

- **Reddit:** Post genuinely in r/smallbusiness, r/artificial, r/homeschool, r/Parenting, r/SideProject — not spammy, add real value
- **Hacker News:** Submit blog posts about technical builds (Flow architecture, agent orchestration patterns)
- **Indie Hackers:** Share revenue milestones, build-in-public updates
- **Facebook Groups:** Homeschooling groups (for Kaizen/Flow), small business AI groups (for consulting)
- **Discord:** Join AI, EdTech, and indie builder communities. Be helpful first, promote second.

### 4.4 Email Marketing

- [ ] Add email capture to all landing pages (exit intent popup or inline form)
- [ ] Lead magnet: "AI Readiness Checklist for Small Businesses" (PDF)
- [ ] Welcome sequence: 3 emails over 7 days (intro → value → soft CTA)
- [ ] Monthly newsletter: new products, blog highlights, AI tips
- [ ] Tool: Loops, Resend, or ConvertKit (any works for this scale)

---

## Phase 5: Partnerships & Referrals (Weeks 6-16)
*Leverage other people's audiences*

### 5.1 Strategic Partnerships

- **Coworking spaces / incubators:** Offer free AI workshops in exchange for promotion to their members
- **VC firms / angel networks:** Offer portfolio company consulting at a preferred rate; they refer, you deliver
- **EdTech networks:** Partner with homeschool co-ops, tutoring centers, and ESL programs for Flow/Kaizen distribution
- **Freelancer platforms:** List consulting services on Toptal, Clarity.fm, or similar for inbound lead flow

### 5.2 Referral Program

- Consulting: 10% referral fee for anyone who sends a paying client
- Products: "Invite a friend, both get a free month" or similar
- Track with simple UTM codes or referral codes initially; formalize later

### 5.3 Guest Content & PR

- Guest posts on AI-focused publications (Towards Data Science, The Gradient, AI newsletters)
- Podcast appearances: pitch founder for AI, startup, and business podcasts
- Press outreach: local business journals, EdTech publications (for Flow/Kaizen story)

---

## Phase 6: Scale & Optimize (Months 3-6)
*Double down on what works, cut what doesn't*

### 6.1 Data-Driven Optimization

- Weekly review of GA4 dashboards: traffic sources, conversion rates, top pages
- Monthly SEO review: keyword rankings, organic traffic growth, backlink profile
- A/B test landing page headlines, CTAs, and form layouts
- Optimize ad spend: pause underperforming campaigns, scale winners
- Review CAC (Customer Acquisition Cost) by channel; target < $50 for consulting leads, < $5 for product signups

### 6.2 Content Scaling

- Increase blog output to 4-5 posts/week using AI-assisted writing (reviewed by human)
- Launch a YouTube channel: product demos, consulting walkthroughs, AI tutorials
- Create a free resource library: templates, checklists, guides (gated for email capture)
- Repurpose blog content into LinkedIn posts, Twitter threads, email sequences

### 6.3 SEO Compounding

- Build backlinks through guest posts, HARO (Help a Reporter Out), and partnership mentions
- Target featured snippets for "how to" queries in the AI consulting space
- Expand keyword coverage into adjacent topics as authority grows
- Monitor and respond to Google algorithm updates

### 6.4 Conversion Rate Optimization (CRO)

- Heatmap analysis: identify drop-off points on all landing pages
- Form optimization: test field count, labels, placeholder text
- Social proof: add testimonials, client counts, or product metrics as they become available
- Speed optimization: target sub-2s load times across all properties

---

## KPIs & Success Metrics

### Month 1 Targets
| Metric | Target |
|--------|--------|
| Organic traffic (all properties) | 500+ sessions/month |
| Consulting form submissions | 10-15 |
| Product signups (Kaizen + Storybook Studio) | 50-100 |
| Email list size | 200+ |
| Google Search Console impressions | 5,000+ |

### Month 3 Targets
| Metric | Target |
|--------|--------|
| Organic traffic | 3,000+ sessions/month |
| Consulting form submissions | 30-50/month |
| Product signups | 300-500/month |
| Email list size | 1,000+ |
| Paid acquisition CAC (consulting) | < $75 |
| Paid acquisition CAC (products) | < $8 |
| Domain authority (Ahrefs/Moz) | 15+ |

### Month 6 Targets
| Metric | Target |
|--------|--------|
| Organic traffic | 10,000+ sessions/month |
| Consulting pipeline | 20+ qualified leads/month |
| Product MAU (Monthly Active Users) | 1,000+ |
| Email list size | 5,000+ |
| Organic keyword rankings (page 1) | 25+ keywords |
| Paid ROAS (Return on Ad Spend) | 3x+ |

---

## Budget Estimate (Monthly)

| Category | Month 1-2 | Month 3-4 | Month 5-6 |
|----------|-----------|-----------|-----------|
| Google Ads | $1,500 | $2,500 | $3,500 |
| Meta Ads | $1,000 | $1,500 | $2,000 |
| LinkedIn Ads | $750 | $1,000 | $1,200 |
| SEO Tools (Ahrefs/Semrush) | $100 | $100 | $100 |
| Email Marketing Tool | $0-30 | $30 | $50 |
| Design/Creative (ads) | $300 | $500 | $500 |
| Content Production | $0 (in-house) | $500 | $1,000 |
| **Total** | **$3,650-3,680** | **$6,130** | **$8,350** |

*Budget is conservative and can be scaled up once CAC and ROAS benchmarks are established.*

---

## Immediate Next Steps (This Week)

1. **Add GA4 + Search Console** to all properties
2. **Add sitemap.xml and robots.txt** to every subdomain
3. **Add structured data (JSON-LD)** to all landing pages
4. **Set up Meta Pixel + Google Ads remarketing tag**
5. **Write and publish first 3 blog posts** targeting highest-intent consulting keywords
6. **Create LinkedIn content calendar** — first 2 weeks of posts
7. **Launch Google Ads Campaign 1** (AI Consulting, search)
8. **Add email capture** to consulting.promptengines.com and promptengines.com

---

*This plan is designed to be executed iteratively. Start with Phase 1-2 immediately, layer in Phase 3-4 within the first month, and scale into Phase 5-6 as data comes in. Every tactic should be measured against the KPIs above — if something isn't moving the needle by month 2, cut it and reallocate.*
