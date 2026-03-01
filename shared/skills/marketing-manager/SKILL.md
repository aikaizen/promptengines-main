---
name: marketing-manager
description: Full-stack marketing management for promptengines.com and its subsidiary businesses (storybookstudio.promptengines.com, lab.promptengines.com, etc.). Use when planning or executing any marketing task including: content strategy, SEO, paid ads (Meta, TikTok, Google, Pinterest, X), email campaigns, influencer/PR outreach, in-person events, launch campaigns, competitor research, social media management, content creation, marketing plans, campaign calendars, or analytics review. This is the primary skill for all marketing work across the promptengines ecosystem.
---

# Marketing Manager

Full marketing execution for the promptengines.com ecosystem.

## Businesses
- **storybookstudio.promptengines.com** — AI personalized children's storybooks, digital + print-on-demand. Primary marketing focus.
- **lab.promptengines.com** — AI/tech publication. Needs regular article publishing + current news coverage.
- **promptengines.com** — Hub. Subsidiary pattern: `kaizen.promptengines.com`

## Workspace
All marketing files live in: `~/workspace/marketing/`
All content production lives in: `~/workspace/content/`
- `content/promptengines/` — experiments, updates, project spotlights for promptengines.com
- `content/lab/` — queue, drafts, published for lab.promptengines.com
Portal (user-facing exports): `~/workspace/Portal/`
- `marketing/storybookstudio/` — StoryBook Studio campaigns, plans, content
- `marketing/lab/` — lab.promptengines content and editorial
- `marketing/shared/` — brand assets, shared templates

## Core References
- **channels.md** — All platform strategies, KPIs, budgets, Austin events/venues
- **campaign-planning.md** — Campaign types, creative frameworks, funnel architecture, measurement, budget allocation

Always read the relevant reference before executing a marketing task.

## Priority Order
1. StoryBook Studio — active launch campaign
2. lab.promptengines — ongoing content publishing
3. Other promptengines subsidiaries

## Key Workflows

### Creating a Marketing Plan
1. Read `campaign-planning.md`
2. Check `marketing/storybookstudio/MARKETING-PLAN.md` for current state
3. Identify phase (Foundation → Soft Launch → Launch → Paid → Retention)
4. Draft plan doc in `marketing/<business>/` using phase structure
5. Update `00-index.md` with new doc

### Writing Ad Creative
1. Read `channels.md` → relevant platform section
2. Apply hook formula from `campaign-planning.md`
3. Lead with emotion/outcome, not product features
4. Never lead with "AI" in headline — lead with the feeling
5. Keep video hooks under 3 seconds, full video under 30s

### Planning an Event
1. Read Austin section in `channels.md`
2. Key Austin venues: SXSW (March), Texas Book Festival (October), BookPeople, Austin Central Library, farmers markets
3. Event kit: printed demo books, QR stand, iPad for live demos, email capture, "free page on the spot" offer
4. Follow up within 24h with email sequence for captured leads

### SEO / Content
1. Keywords are in `marketing/storybookstudio/02-seo-keywords.md`
2. Blog posts target informational keywords (top of funnel)
3. On-page: title, meta, H1, alt text, schema markup
4. Publish to lab.promptengines for AI/tech angle, site blog for product angle

### Email Campaigns
1. Templates in `marketing/storybookstudio/04-email-sequences.md`
2. Sequences: Welcome (3 emails), Post-purchase (3 emails), Abandoned cart, Re-engagement
3. Never send without proofreading for [TBD] placeholders

### Influencer / PR
1. Templates in `marketing/storybookstudio/05-influencer-outreach.md`
2. Personalize every outreach — no copy-paste blasts
3. Lead with free product, not the ask
4. PR targets: BabyCenter, Parents, Good Housekeeping, Romper, PopSugar Family, Austin press

## Messaging Rules
- Tagline: *"Every child deserves to be the hero of their own story."*
- Never say "AI-generated" — say "created", "crafted", "made"
- Never say "template" — say "story", "book", "adventure"
- Lead with emotion, not technology
- Brand voice: warm, excited, simple, inclusive

## GitHub Content Workflow
When GitHub access is live:
1. Run `gh repo view` + `gh log` to scan recent commits
2. Classify commits: experiment / feature update / new project / bug fix (skip)
3. Draft content in appropriate `content/` subfolder
4. Flag for review via Telegram message
5. Never publish without approval

Content strategies:
- promptengines.com → `content/promptengines/CONTENT-STRATEGY.md`
- lab.promptengines.com → `content/lab/CONTENT-STRATEGY.md`

## Tools Available
- `xurl` — Post to X/Twitter, search, monitor mentions
- `gog` — Gmail (outreach), Calendar (campaign scheduling), Sheets (tracking)
- `himalaya` — Email outreach for PR/influencer campaigns
- `blogwatcher` — Monitor competitor blogs + RSS for lab.promptengines content
- `gh` / `github` — Site SEO changes, content publishing (when GitHub access granted)

## Blockers Tracking
Before starting any task, check `marketing/storybookstudio/MARKETING-PLAN.md` blockers section.
Current blockers: GitHub access, Google OAuth, social accounts, pricing, Brave API key.
