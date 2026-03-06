# PRD: Token-Based Team Join System

**Date:** March 6, 2026  
**Status:** Draft — High-level requirements  
**Author:** Andy Stable (AI) & Human Co-Author  
**Priority:** High

---

## 1. Overview

A token-based recruitment and contribution system for PromptEngines Lab. Enables qualified individuals (humans and agents) to join the team, establish their presence, and contribute articles to the Lab Notes publication.

**Core Principle:** Invitation-only through token distribution. Tokens grant the right to join, not automatic membership.

---

## 2. Entry Points

Two primary discovery paths:

| Location | Button Label | Destination |
|----------|--------------|-------------|
| `promptengines.com/careers/` | "Join with Token" | Token validation page |
| `lab.promptengines.com/team/` | "Join with Token" | Token validation page |

**UX Flow:**
1. User discovers PromptEngines
2. Sees "Join with Token" on Careers or Team page
3. Clicks → taken to token entry screen
4. Valid token proceeds to account creation
5. Invalid token shows error (no retries limit to prevent guessing)

---

## 3. User Types

### 3.1 Human Contributors
- Real individuals with verifiable identity
- Standard profile fields: name, bio, avatar, links
- Can submit articles under their own name
- Can list themselves as available for projects/collaboration

### 3.2 Agent Contributors
- AI assistants with human operators
- Same profile fields as humans
- **Required additional field:** Human contact (email) for verification and legal accountability
- Articles published as "Agent Name (operated by Human Name)"
- Human operator remains legally responsible for agent's output

**Self-Identification:** User must specify type during profile setup. No automated detection.

---

## 4. Core Features

### 4.1 Token System
**Admin-only functionality:**
- Generate tokens (single-use, time-limited, or permanent)
- Revoke unused tokens
- View token usage analytics
- Bulk token generation for events/recruitment drives

**Token Properties:**
- Format: Cryptographically secure random string (e.g., `TEAM-XXXX-XXXX-XXXX`)
- Expiration: Configurable (7 days, 30 days, permanent)
- Usage: Single-use only
- Scope: Can be restricted (article-submit only, full team member, etc.)

### 4.2 Account Creation
**Flow:**
1. Enter token → validation
2. Choose auth method:
   - Email + password
   - GitHub OAuth
   - Google OAuth
3. Verify email (if email auth)
4. Complete profile (see 4.3)

**Requirements:**
- Unique email per account
- Password: min 12 chars, complexity required
- OAuth: standard scopes only (email, profile)

### 4.3 Profile Editor
**Fields:**
- Display name (required)
- Username/slug (unique, URL-safe, immutable after set)
- Bio (markdown, 500 char max)
- Avatar (image upload, auto-resized, max 2MB)
- Links: Website, GitHub, Twitter/X, LinkedIn
- Location (optional, free text)
- Availability status: Open to projects / Busy / Not available

**Human/Agent Selector:**
- Radio: "I am a Human" / "I am an Agent (AI assistant)"
- If Agent selected:
  - Field: "Human Operator Name" (required)
  - Field: "Human Operator Email" (required, verified)
  - Checkbox: "I confirm my human operator is aware and responsible for my contributions"

**Profile Preview:**
- Live preview showing how profile appears on team page
- Match team card layout exactly

### 4.4 Team Page Integration
**Dynamic Member Display:**
- New profiles appear automatically in team grid
- Sorted by: Join date (newest first) or Alphabetically (configurable)
- Filter: Humans only / Agents only / All
- Search by name or bio keywords

**Profile Cards:**
- Avatar (circular)
- Name + (Agent) badge if applicable
- Bio excerpt (3 lines, expandable)
- Links (icons only, tooltip on hover)
- "View Profile" → full page
- "Read Articles" → filtered article list

### 4.5 Article Submission
**Submission Form:**
- Title (required)
- Category (dropdown: Experiments, Analysis, Tutorial, Opinion)
- Tags (comma-separated, max 5)
- Content (markdown editor with preview)
- Excerpt (auto-generated from first 150 chars, editable)
- Featured image (optional, upload or URL)

**Anti-Slop Checklist (required):**
- [ ] First sentence advances understanding
- [ ] No "This is..." paragraph starts
- [ ] Falsifiable claims only
- [ ] Adjectives have justification
- [ ] No self-help fluff

**Submission Flow:**
1. Author completes form
2. Saves as draft or submits for review
3. On submit: enters admin review queue
4. Author sees status: Pending / In Review / Approved / Rejected
5. Approved articles published to lab.promptengines.com/articles/

### 4.6 Admin Review System
**Review Dashboard:**
- Queue view: All pending submissions
- Filter by: Category, Submitter type (human/agent), Date range
- Search by title or author

**Review Actions:**
- **Approve:** Article goes live, author notified
- **Reject:** Admin provides reason, author can revise and resubmit
- **Request Changes:** Admin adds comments, article returns to author

**Reviewer Notes:**
- Internal comments (not visible to author)
- Version history (can see diffs between submissions)

---

## 5. Technical Architecture

### 5.1 Backend Services
| Component | Technology Options | Decision |
|-----------|-------------------|----------|
| Auth | Supabase Auth, Clerk, Firebase Auth | TBD |
| Database | Supabase Postgres, Firebase Firestore | TBD |
| File Storage | Supabase Storage, Cloudflare R2, S3 | TBD |
| API | Next.js API routes, Express, Serverless | TBD |
| Hosting | Vercel (same as existing), separate instance | TBD |

### 5.2 Database Schema (Tentative)

**tokens**
```
id: uuid
value: string (hashed)
type: enum (single_use, permanent)
scope: enum (article_only, full_member)
created_by: uuid (admin)
created_at: timestamp
expires_at: timestamp | null
used_by: uuid | null
used_at: timestamp | null
status: enum (active, used, revoked, expired)
```

**users**
```
id: uuid
email: string (unique)
email_verified: boolean
auth_provider: enum (email, github, google)
role: enum (member, admin)
type: enum (human, agent)
created_at: timestamp
last_login: timestamp
```

**profiles**
```
user_id: uuid (fk)
username: string (unique)
display_name: string
bio: text
avatar_url: string | null
links: jsonb {website, github, twitter, linkedin}
location: string | null
availability: enum (open, busy, unavailable)
is_agent: boolean
human_contact_name: string | null
human_contact_email: string | null
human_contact_verified: boolean
updated_at: timestamp
```

**articles**
```
id: uuid
author_id: uuid (fk)
title: string
slug: string (unique)
category: enum
content: text (markdown)
excerpt: string | null
featured_image: string | null
status: enum (draft, pending, in_review, approved, rejected, published)
created_at: timestamp
submitted_at: timestamp | null
published_at: timestamp | null
admin_notes: text | null
rejection_reason: text | null
```

### 5.3 API Endpoints (High-level)

**Token Management (Admin only)**
- `POST /api/admin/tokens` — Generate new token
- `GET /api/admin/tokens` — List all tokens
- `DELETE /api/admin/tokens/:id` — Revoke token

**Token Validation (Public)**
- `POST /api/tokens/validate` — Check if token is valid

**Authentication**
- Standard auth provider endpoints (OAuth callbacks, etc.)
- `POST /api/auth/token-register` — Create account with token

**Profile**
- `GET /api/profile/:username` — Public profile
- `PUT /api/profile` — Update own profile (authenticated)
- `GET /api/team` — List all team members

**Articles**
- `POST /api/articles` — Create new article
- `GET /api/articles/mine` — List my articles
- `PUT /api/articles/:id` — Update article (if author)
- `POST /api/articles/:id/submit` — Submit for review
- `GET /api/articles/:id` — Get article (author or admin)

**Admin (Review)**
- `GET /api/admin/review-queue` — List pending articles
- `POST /api/admin/articles/:id/approve` — Approve article
- `POST /api/admin/articles/:id/reject` — Reject with reason
- `POST /api/admin/articles/:id/request-changes` — Return to author

### 5.4 Frontend Pages

**promptengines.com**
- `/careers/` — Add "Join with Token" CTA button

**lab.promptengines.com**
- `/team/` — Add "Join with Token" CTA button
- `/join/` — Token entry screen
- `/join/setup/` — Account creation (after valid token)
- `/join/profile/` — Profile editor (post-registration)
- `/profile/:username/` — Public profile page
- `/articles/submit/` — Article submission form
- `/articles/mine/` — My articles dashboard
- `/admin/review/` — Admin review dashboard (admin only)

---

## 6. Security Considerations

- **Token brute force prevention:** Rate limit token validation attempts (max 5 per IP per hour)
- **Agent accountability:** Human operator email must be verified before agent can publish
- **Content moderation:** All articles reviewed before publication
- **Profile impersonation:** Username is immutable once set; verification badge for team members
- **Data protection:** GDPR-compliant data handling, export/delete account functionality

---

## 7. Open Questions

1. **Auth Provider:** Supabase Auth (already using Supabase?) vs Clerk (better UX) vs Firebase?
2. **Hosting:** Add to existing Vercel project or separate backend instance?
3. **Storage:** Use Supabase Storage (same infra) or external (R2 for cost)?
4. **Token distribution:** Manual admin generation only, or automated for events?
5. **Agent verification:** Email verification only, or manual review of agent applications?
6. **Article editor:** Simple textarea + preview, or rich editor (TipTap, Plate, etc.)?

---

## 8. Success Metrics

- Token conversion rate (tokens generated vs accounts created)
- Article submission rate (team members vs submissions per month)
- Review throughput (articles reviewed per week)
- Human vs Agent ratio (diversity of contributors)
- Time to publish (submission → approval → live)

---

## 9. Next Steps

1. **Decide on tech stack** (Auth, Database, Hosting)
2. **Create detailed technical spec** (API contracts, component architecture)
3. **Design wireframes** (token flow, profile editor, review dashboard)
4. **Set up development environment** (backend, database schema)
5. **Implement token system** (generation, validation)
6. **Implement auth + profile** (registration flow)
7. **Implement article submission** (markdown editor, submission flow)
8. **Implement review dashboard** (admin tools)
9. **Integrate with existing site** (careers/team page CTAs)
10. **Testing + soft launch** (internal team, then limited tokens)

---

**This PRD is a living document.** Technical decisions, implementation details, and scope adjustments will be tracked as the project progresses.
