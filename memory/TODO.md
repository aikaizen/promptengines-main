# TODO - Morning Checklist

*Generated: 2026-03-01 04:45 UTC*
*Review tomorrow morning*

---

## 🔴 URGENT - Security & Domain

- [ ] **BUY DOMAIN**: storybookstudio.ai (or .io/.app) — TOMORROW MORNING PRIORITY
- [ ] **SET UP DOMAIN**: Configure DNS, connect to hosting, set up redirects
- [ ] **EMAIL SETUP**: Create hello@, press@, partnerships@ addresses
- [ ] **GIVE ANDY CONTROL**: Provide credentials/access so I can manage domain, email, hosting without asking each time
- [ ] **Rotate BOTH GitHub PATs** exposed in plaintext chat (Feb 27 & Feb 28)
  - Go to: github.com/settings/tokens
  - Current tokens: [REMOVED — use env var GITHUB_TOKEN]
  - Note: PATs should never be stored in files, only environment variables

---

## 🔧 Technical Setup

### 1. Google Workspace (gog) Setup - YOU HANDLING
- [ ] Go to Google Cloud Console (console.cloud.google.com)
- [ ] Create/select project "PromptEngines"
- [ ] Enable APIs: Gmail, Calendar, Drive, Docs, Sheets, Contacts
- [ ] Create OAuth 2.0 credentials (Desktop app type)
- [ ] Download `client_secret.json`
- [ ] Securely provide file to Andy (do NOT paste in chat)
- [ ] Andy will run: `gog auth credentials` and `gog auth add promptengine@gmail.com`

### 2. Browser Access for Andy
- [ ] Install OpenClaw Chrome extension
- [ ] Open Chrome to any page Andy needs to scrape/interact with
- [ ] Click OpenClaw extension icon to "attach" tab

### 3. Lab Site Deployment
- [ ] Check what platform hosts lab.promptengines.com (Vercel? Netlify? GitHub Pages?)
- [ ] Trigger rebuild/redeploy from `aikaizen/promptengines-main` repo
- [ ] Verify new nav structure live: Team | Purpose | Labnotes

---

## 📋 StoryBook Studio - Blocked Items

- [ ] **Domain acquisition**: storybookstudio.ai/.io/.app (decide and purchase)
- [ ] **Landing page**: Build marketing landing page (hero → how it works → examples → pricing → CTA)
- [ ] **GitHub access**: Grant Andy GitHub access for on-site SEO, pixel installation
- [ ] **Google OAuth**: Enable Search Console, Analytics, gog skill
- [ ] **Brave API key**: For keyword research and competitor intel
- [ ] **Social accounts**: Create TikTok, Instagram, Pinterest, Facebook Page
- [ ] **Founder name/contact**: Provide for pitch emails (BookPeople, APL, press)
- [ ] **App pricing**: Confirm pricing structure to finalize email sequences
- [ ] **New PAT with full scope**: Needs access to kaizen, flow, storybookstudio, bible, transcriber repos

---

## 📚 Lab Content

### Immediate Actions
- [ ] **Paste X post text**: https://x.com/trq212/status/2027463795355095314 (X blocking external fetches)
- [ ] **Review visuals audit**: Check all articles have data-driven charts with synthetic/real data mix

### Content Pipeline
- [ ] **Idea Wizard skill**: Get from jeffreyspromptscom.vercel.app (provide screenshot/paste text)
- [ ] **Skills wishlist**: Review 2,868 catalogued skills for useful additions
- [ ] **GitHub Action**: Set up weekly auto-generated build stream reports
- [ ] **Prediction market signal**: Write gold price or market experiment article

### Article Queue (from ARTICLE-IDEAS.md)
- [ ] #11: Nudge removal in AI interfaces
- [ ] #18: Claude as co-author workflow
- [ ] Top 5 recommended articles from list

---

## 📄 Constitutional Documents & Lore

- [ ] Add constitutional documents for A.I. (human)
- [ ] Add lore documents for Andy Stable (agent)
- [ ] Expand Purpose page with additional philosophical frameworks
- [ ] Add historical timeline of human-agent collaboration development

---

## 🏢 Business Setup

- [ ] **Email credentials**: For himalaya skill (PR/influencer outreach)
- [ ] **BookPeople pitch**: Send pitch email (template ready in marketing folder)
- [ ] **APL pitch**: Send storytime integration pitch
- [ ] **Texas Book Festival 2026**: Submit application ($850 early rate, deadline approaching)
- [ ] **SXSW 2026**: Book side event venue (March 12-18)

---

## ✅ Completed (For Reference)

- [x] Team page with parallel character sheets
- [x] Purpose page with symbiosis content
- [x] Nav restructure: Team | Purpose | Labnotes
- [x] Anti-slop skill created
- [x] Visual diagrams updated with synthetic data + footnotes
- [x] The Great Acceleration article published
- [x] About section simplified
- [x] **Landing page** (marketing/storybookstudio/landing/index.html)
- [x] **Texas homegrown article** (content/lab/drafts/2026-03-01-homegrown-austin.html)
- [x] **SEO keyword strategy** (marketing/storybookstudio/SEO-KEYWORDS.md)
- [x] **Texas Book Festival event page** (marketing/storybookstudio/events/texas-book-festival-2026.html)
- [x] **SXSW event page** (marketing/storybookstudio/events/sxsw-2026.html)

---

## 🎓 Educational App — New Project

### Research Task: Exceptional Education Experience
**Source**: https://x.com/clharrington024/status/2027756965506486651 (paste text/screenshot — X blocking fetches)

**Core Curriculum Stack to Integrate:**
1. **Teach Your Child to Read in 100 Lessons** (Engelmann) — ages 4-5 reading foundation
2. **FLDOE Recommended Book Lists** — grade-leveled novels, reading + discussion + writing
3. **Math Academy** — grade 4+ math (claims "light years ahead of any other app")
4. **Ed Hirsch Core Knowledge** — "What Your X Grader Needs to Know" series, K-8 curriculum

**Research Questions:**
- [ ] Can we license/integrate these curricula or build alternative?
- [ ] What does Math Academy do that others don't?
- [ ] How to combine these four into cohesive app experience?
- [ ] AI personalization opportunities: adaptive pacing, comprehension checks, writing prompts

**Hypothesis:** Parents want "refuse slop" education — best-in-class materials, not mediocre everything-apps.

**Approach:** Research first, then prototype if viable. Could be StoryBook Studio sibling or standalone product.

---

## 🔐 Git Access Clarification

**Current State:**
- Lab Notes repo (`promptengines-main`): I have PAT, can push to GitHub ✅
- Marketing workspace: Local commits only, no remote configured ⚠️
- Need: PAT for marketing repo or use `promptengines-main` for all content

**Action Needed:** Provide PAT or confirm marketing files should go in `promptengines-main/labnotes/` structure

---

**REMINDER**: Check this TODO first thing in the morning. Prioritize security (PAT rotation) before any other work.
