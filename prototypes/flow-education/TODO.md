# Flow Education — Full App Build TODO

_Production-grade education platform for ages 4-6. Built like a real app, not a prototype._

---

## 🎯 Current Status

**Prototype Phase:** ✅ COMPLETE
- React app with 2 age modes (4YO + 5-6)
- 6 lessons (Letters A-E, Number 1)
- Web Audio API, touch optimizations
- Deployed at promptengines.com/flow

**Production Phase:** 🚧 NOT STARTED
- Need: Backend, database, auth, sync, CMS

---

## 📋 PHASE 1: Foundation (Backend & Auth)

### Database & Storage
- [ ] Set up Supabase project (PostgreSQL + Auth + Storage)
- [ ] Create database schema (users, students, progress, lessons, sessions)
- [ ] Set up Row Level Security (RLS) policies
- [ ] Configure storage buckets (images, audio, avatars)
- [ ] Create migration scripts

### API Layer
- [ ] Scaffold Next.js 15 app with API routes
- [ ] Set up Supabase client (server + client components)
- [ ] Create API endpoints:
  - `POST /api/auth/login` — Parent/Teacher login
  - `POST /api/students` — Create child profile  
  - `GET /api/lessons` — Fetch available lessons
  - `GET /api/progress/:studentId` — Get progress
  - `POST /api/progress` — Update progress
  - `GET /api/recommendations/:studentId` — AI lesson suggestions
- [ ] Add API validation (Zod)
- [ ] Add error handling middleware

### Authentication
- [ ] Parent signup/login (email + password)
- [ ] Teacher signup/login (email + school domain SSO)
- [ ] Password reset flow
- [ ] Session management (JWT + refresh tokens)
- [ ] Role-based access (parent vs teacher vs admin)

### Deployment
- [ ] Deploy frontend to Vercel
- [ ] Connect Supabase (production project)
- [ ] Set up environment variables
- [ ] Configure custom domain (flow.promptengines.com)
- [ ] SSL certificates

---

## 📋 PHASE 2: Student & Progress System

### Student Management
- [ ] Parent can create child profiles (name, age, avatar)
- [ ] Multiple children per parent account
- [ ] Student avatar selection (emoji + colors)
- [ ] Age-based mode auto-selection (4YO vs 5-6)
- [ ] Student switcher (dropdown on login)

### Progress Tracking
- [ ] Replace localStorage with Supabase
- [ ] Real-time progress sync (useBroadcastChannel fallback)
- [ ] Offline queue (save locally, sync when online)
- [ ] Progress conflict resolution (last-write-wins)
- [ ] Master score calculation (per lesson + overall)

### Session Analytics
- [ ] Track session start/end
- [ ] Log challenge completions, errors, time spent
- [ ] Frustration signal detection (3+ wrong taps → flag)
- [ ] Daily/weekly streak tracking
- [ ] Learning velocity metrics

---

## 📋 PHASE 3: Content Management System

### Lesson Schema (v2)
```typescript
interface Lesson {
  id: string
  sequence: number
  type: 'letter' | 'number' | 'shape' | 'word'
  title: string
  targetWords: string[]
  distractors: string[]
  challenges: Challenge[]
  assets: {
    images: Record<string, string>
    audio: Record<string, string>
  }
  difficulty: 1 | 2 | 3
  prerequisites: string[]
  duration: number // seconds
  ageMode: '4yo' | '5-6' | 'both'
}
```

### Admin Interface (Teacher/Content Admin)
- [ ] Lesson list view (table with filters)
- [ ] Lesson editor (form with live preview)
- [ ] Challenge sequence builder
- [ ] Asset upload (drag & drop images/audio)
- [ ] Asset library (browse, search, reuse)
- [ ] Lesson publish workflow (draft → review → live)
- [ ] A/B test setup (variant management)

### Asset Pipeline
- [ ] Image optimization (WebP conversion, responsive sizes)
- [ ] Audio normalization (consistent volume)
- [ ] CDN delivery (Cloudflare R2 or Supabase Storage CDN)
- [ ] Asset versioning (cache busting)

### Curriculum Organization
- [ ] Lesson plans (groups of lessons)
- [ ] Grade-level alignment (Pre-K, K, 1st)
- [ ] Standards mapping (TEKS, CCSS, FLDOE)
- [ ] Prerequisite chain visualization

---

## 📋 PHASE 4: Adaptive Learning Engine

### Spaced Repetition
- [ ] Review scheduler (when to re-show mastered letters)
- [ ] Interval calculation (1 day → 3 days → 7 days → 30 days)
- [ ] Decay detection (if not practiced, mastery drops)
- [ ] Smart review insertion (between new lessons)

### Difficulty Adaptation
- [ ] Frustration detection (error rate, time per challenge)
- [ ] Auto-simplify mode (reduce choices, add hints)
- [ ] Challenge skipping (if stuck 60+ seconds)
- [ ] Mastery acceleration (skip review if 100% confident)

### Personalized Path
- [ ] Learning velocity tracking (fast vs slow learner)
- [ ] Interest-based content (animals vs vehicles vs food)
- [ ] Weakness targeting (extra practice on struggling letters)
- [ ] Parent goal setting ("know all letters by June")

---

## 📋 PHASE 5: Parent & Teacher Dashboards

### Parent Dashboard
- [ ] Weekly progress email (automated)
- [ ] Daily activity log (what they did today)
- [ ] Skills mastered visualization (grid of letters/numbers)
- [ ] Time spent this week (vs recommended 15 min/day)
- [ ] "Practice at home" suggestions (printable worksheets)
- [ ] Device management (see which tablets are active)

### Teacher Dashboard
- [ ] Class roster (24 students, avatars, progress bars)
- [ ] At-risk alerts (students falling behind)
- [ ] Class-wide skill gaps ("70% struggling with letter D")
- [ ] Standards alignment report ("87% TEKS K.1 complete")
- [ ] Time-on-task analytics (who's engaged, who's rushing)
- [ ] Parent communication tools (send progress reports)
- [ ] Bulk student import (CSV upload)

### Admin Dashboard (Superuser)
- [ ] School/district management
- [ ] Teacher account management
- [ ] Content performance (which lessons have high error rates)
- [ ] System health (API latency, error rates)
- [ ] User growth metrics (MAU, retention)

---

## 📋 PHASE 6: Advanced Features

### Audio & Voice
- [ ] Real audio assets (replace Web Audio synth)
- [ ] ElevenLabs TTS integration (narration)
- [ ] Voice recognition ("Say the letter A")
- [ ] Background music (optional, parent-toggleable)
- [ ] Sound effects library (success, error, hint)

### Gamification (Subtle)
- [ ] Streak counter (consecutive days)
- [ ] Collection system (unlock new avatars)
- [ ] Milestone celebrations ("You know 10 letters!")
- [ ] No points, no leaderboards, no competition

### Multi-Device Sync
- [ ] Offline-first architecture (PWA)
- [ ] Service worker for asset caching
- [ ] Background sync (queue updates when offline)
- [ ] Conflict resolution (merge local + server state)
- [ ] iOS/Android app wrappers (Capacitor)

### Accessibility
- [ ] Screen reader optimization (VoiceOver, TalkBack)
- [ ] Switch control support (for motor disabilities)
- [ ] High contrast mode
- [ ] Reduced motion respect
- [ ] Font size adjustment

---

## 📋 PHASE 7: Pilot & Launch

### Pilot School Prep
- [ ] Kiosk mode documentation (Chrome OS)
- [ ] MDM deployment guide
- [ ] Teacher training materials
- [ ] Parent consent forms (COPPA compliance)
- [ ] Data privacy policy
- [ ] IRB approval (if research study)

### Analytics & Monitoring
- [ ] PostHog / Mixpanel integration
- [ ] Error tracking (Sentry)
- [ ] Performance monitoring (Vercel Analytics)
- [ ] Uptime monitoring
- [ ] Parent/teacher NPS surveys

### Marketing Site
- [ ] Landing page (storybookstudio.promptengines.com style)
- [ ] Features comparison (vs Khan/ABCmouse)
- [ ] Testimonials (from pilot)
- [ ] Pricing page (parent subscription vs school license)
- [ ] Blog (education research, tips)

---

## 🔥 IMMEDIATE PRIORITY (This Week)

### MUST DO
1. [ ] Set up Supabase project
2. [ ] Create database schema
3. [ ] Scaffold Next.js 15
4. [ ] Basic auth (parent signup/login)
5. [ ] Migrate from localStorage to Supabase

### NICE TO HAVE
- [ ] Student avatar selection
- [ ] Real-time progress sync
- [ ] Basic parent dashboard (view only)

---

## 🛠️ Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | Next.js 15 | Full-stack React, API routes |
| Database | Supabase (PostgreSQL) | Auth + Storage + Realtime in one |
| Auth | Supabase Auth | Built-in, handles email/oauth |
| ORM | Prisma | Type-safe DB queries |
| Validation | Zod | Schema validation |
| UI | Tailwind + shadcn/ui | Fast, accessible |
| State | Zustand | Simple, persists to localStorage |
| Sync | Supabase Realtime | Live updates |
| Assets | Cloudflare R2 | Cheaper than S3, CDN included |
| Hosting | Vercel | Edge deployment, fast |

---

## 📝 Research Tasks (Background)

- [ ] Math Academy deep-dive (what makes it "light years ahead")
- [ ] Engelmann's 100 Lessons script analysis
- [ ] FLDOE book list acquisition
- [ ] Core Knowledge Sequence mapping
- [ ] Spaced repetition research (Anki algorithms)
- [ ] Dyslexia-friendly design patterns
- [ ] Chrome OS kiosk mode best practices

---

## ✅ COMPLETED (Prototype Phase)

- [x] React app with Vite
- [x] 2 age modes (4YO + 5-6)
- [x] 6 lessons (Letters A-E, Number 1)
- [x] Web Audio API sounds
- [x] Touch optimization
- [x] Error boundaries
- [x] Deployed to Vercel

---

**Last Updated:** 2026-03-01
**Current Phase:** Ready to start Phase 1 (Backend)
**Next Action:** Set up Supabase + Next.js scaffold
