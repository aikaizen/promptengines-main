# Flow Education — Technical PRD (Product Requirements Document)

**Version:** 1.0.0  
**Date:** March 2026  
**Status:** Phase 0 MVP  
**Target:** Kindergarten, Ages 5-6  
**Platform:** Android/Chrome Tablets (Chrome OS 114+)

---

## 1. Executive Summary

Flow Education is a tablet-based learning application delivering structured early literacy and numeracy curriculum through adaptive, AI-augmented tutoring. The Phase 0 MVP delivers 36 minutes of curriculum across 6 quests (lessons), targeting independent 60-minute engagement without adult supervision.

**Core Innovation:** Kaizen learning — continuous improvement through real-time adaptation based on every interaction.

---

## 2. Product Goals

### Primary Goals
1. **Engagement:** 80% of children complete all 6 quests in a single session
2. **Learning:** 80% letter recognition (A-E) and number 1 recognition after completion
3. **Independence:** Teacher intervention required <2 times per 60-minute session
4. **Enjoyment:** Child satisfaction 4+/5 (measured via observation)

### Secondary Goals
1. Prove tablet-based adaptive learning works for kindergarten
2. Validate Kaizen (continuous improvement) philosophy
3. Generate data for Phase 1 expansion

---

## 3. User Personas

### Primary: The Child (Ages 5-6)
- **Traits:** Pre-reader, developing fine motor skills, short attention span
- **Needs:** Large touch targets, immediate feedback, visual engagement, no reading required
- **Device:** 7-10" Chrome tablet, touch-only, portrait orientation

### Secondary: The Teacher
- **Traits:** Manages 25 students, limited time for setup
- **Needs:** <2 minute setup, works offline, no training required
- **Success metric:** Can deploy while managing other children

### Tertiary: The Parent
- **Traits:** Wants to see progress, concerned about screen time quality
- **Needs:** Progress reports, reassurance of educational value
- **Access:** Progress view (future feature)

---

## 4. Technical Architecture

### 4.1 Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Frontend** | React 18 + Vite | Component architecture, fast HMR, small bundle |
| **State** | React Hooks + localStorage | No backend needed for MVP, persistence across sessions |
| **Styling** | CSS Modules | Scoped styles, no runtime overhead |
| **Audio** | Web Audio API + Howler.js (optional) | Precise timing, background music, SFX |
| **Assets** | Static images + MP3 | Offline-first, no streaming required |
| **Build** | Vite | ESM, tree-shaking, optimized for tablet performance |

### 4.2 Component Architecture

```
App
├── LessonPlanList (quest selection)
│   ├── LessonCard
│   ├── ProgressOverview
│   └── AchievementDisplay
├── LessonView (quest execution)
│   ├── ChallengeContainer
│   │   ├── ListenChallenge
│   │   ├── FindChallenge
│   │   ├── TraceChallenge
│   │   └── QuizChallenge
│   ├── ProgressBar
│   ├── FeedbackOverlay
│   └── TutorAvatar
└── ProgressTracker (analytics view)
    ├── StatsOverview
    ├── SkillsMastered
    └── LessonsBreakdown
```

### 4.3 Data Flow

```
LessonPlan (static JSON)
  ↓
App State (React Context)
  ↓
LessonView (challenge execution)
  ↓
User Interactions (taps, traces)
  ↓
Adaptive Logic (error tracking)
  ↓
Progress Update (localStorage)
  ↓
UI Update (feedback, hints)
```

---

## 5. Feature Specifications

### 5.1 Quest Structure (6 Minutes)

| Phase | Duration | Interaction | Purpose |
|-------|----------|-------------|---------|
| **Intro** | 30s | Passive | Set context, introduce letter |
| **Challenge 1: Listen** | 90s | Passive | Auditory priming |
| **Challenge 2: Find** | 120s | Active (tap) | Visual discrimination |
| **Challenge 3: Trace** | 120s | Active (motor) | Fine motor + letter shape |
| **Challenge 4: Quiz** | 90s | Active (choice) | Mastery verification |
| **Reward** | 30s | Passive | Celebration, reinforcement |
| **Outro** | 30s | Passive | Transition, next preview |
| **TOTAL** | **6 min** | | |

### 5.2 Adaptive Difficulty System

**Error Tracking:**
- Per-challenge error count
- Consecutive error detection
- Time-to-completion tracking

**Adaptation Triggers:**

| Trigger | Condition | Action |
|---------|-----------|--------|
| **Hint Offer** | 3 consecutive errors | Show visual hint |
| **Difficulty Drop** | 5+ errors in challenge | Reduce targets, extend time |
| **Frustration** | Stuck >30 seconds | Auto-highlight correct answer |
| **Quiz Failure** | <2/3 correct | Return to Challenge 2 for review |
| **Success Streak** | 5 consecutive correct | Increase pace, reduce scaffolding |

### 5.3 Progress Persistence

**Stored in localStorage:**
```typescript
interface StudentProgress {
  completedLessons: string[];
  currentLesson: string | null;
  masteryScores: Record<string, number>; // lessonId -> score
  totalTimeSpent: number; // milliseconds
  lastAccessed: string; // ISO timestamp
  errorCounts: Record<string, number>; // challenge-specific errors
  hintsUsed: Record<string, number>;
}
```

**Sync Strategy:**
- Write on every state change
- Read on app initialization
- No conflict resolution (single user per device)

---

## 6. UI/UX Specifications

### 6.1 Design System

**Colors:**
- Primary: `#F04D26` (Orange) — actions, progress, success
- Background: `#09090b` (Dark zinc) — reduces eye strain
- Surface: `#18181b` (Card background)
- Border: `#27272a` (Subtle separation)
- Text: `#e4e4e7` (Primary), `#71717a` (Muted)
- Success: `#22c55e` (Green)
- Error: `#ef4444` (Red)

**Typography:**
- Headings: 2rem+ (32px), bold, clear sans-serif
- Body: 1.125rem (18px), regular
- Small: 0.875rem (14px), labels, metadata
- Touch targets: Minimum 60px (ideally 80px+)

**Spacing:**
- Base unit: 8px
- Card padding: 24px (1.5rem)
- Section gaps: 32px (2rem)
- Touch target gaps: 16px minimum

### 6.2 Accessibility Requirements

**Touch Targets:**
- Minimum: 60×60px
- Recommended: 80×80px for children
- Spacing: 16px between targets

**Visual:**
- Contrast ratio: 4.5:1 minimum
- No color-only indicators (icons + color)
- Large, clear letterforms

**Motion:**
- Respect `prefers-reduced-motion`
- Animations < 500ms (attention span)
- No flashing >3Hz

**Audio:**
- All instructions have visual equivalents
- Closed captions for narration (future)

---

## 7. Asset Specifications

### 7.1 Image Assets

**Categories:**

| Category | Count | Size | Format |
|----------|-------|------|--------|
| **Characters** | 5 expressions | 512×512 | PNG w/ transparency |
| **Objects** | 8 per quest | 256×256 | PNG |
| **Letters** | 4 per quest | 512×512 | PNG |
| **Backgrounds** | 3 per quest | 1024×768 | JPG (80% quality) |
| **UI Elements** | 10 shared | 64×64 to 256×256 | PNG/SVG |

**Total per Quest:** ~24 unique images  
**Total for MVP:** ~132 images (with reuse)

### 7.2 Audio Assets

**Categories:**

| Category | Count per Quest | Format | Bitrate |
|----------|-----------------|--------|---------|
| **Narration** | 25-30 lines | MP3 | 64kbps |
| **Feedback** | 10 variations | MP3 | 64kbps |
| **SFX** | 5 sounds | MP3 | 128kbps |
| **Music** | 1 ambient track | MP3 | 96kbps |

**Total per Quest:** ~40 audio clips  
**Total for MVP:** ~166 clips

### 7.3 Asset Naming Convention

```
{category}_{questId}_{item}_{variant}.{ext}

Examples:
- tutor_quest001_neutral.png
- object_quest001_apple.png
- letter_quest001_A_upper.png
- audio_quest001_intro_01.mp3
- audio_quest001_correct_03.mp3
- sfx_tap_success.mp3 (shared)
```

---

## 8. Challenge Specifications

### 8.1 Challenge 1: Listen (90 seconds)

**Purpose:** Auditory priming, sound-letter association

**Flow:**
1. Tutor avatar appears with greeting
2. Tutor demonstrates target sound: "A says ahh like apple"
3. 3 target words presented with images
4. Each word repeated 2-3 times with emphasis
5. Auto-advance after 90 seconds

**Technical:**
- Preload audio for seamless playback
- Visual waveforms or mouth animations during speech
- Progress indicator (subtle, not distracting)

**Accessibility:**
- Visual text appears with audio
- No interaction required

---

### 8.2 Challenge 2: Find/Tap (120 seconds)

**Purpose:** Visual discrimination, letter-sound association

**Flow:**
1. Grid of 6-8 items appears
2. Instruction: "Tap all the pictures that start with A"
3. Child taps targets (5 targets + 3 distractors)
4. Immediate feedback on each tap:
   - Correct: Green flash, positive sound
   - Incorrect: Gentle shake, encouraging sound
5. Complete when 4/5 targets identified

**Grid Layout:**
- 3×2 for 6 items
- 4×2 for 8 items
- Item size: 120×120px minimum
- Gap: 24px

**Adaptive Logic:**
- Track errors per item
- After 3 errors: Highlight one unselected target
- After 5 errors: Reduce to 4 targets + 2 distractors

---

### 8.3 Challenge 3: Trace (120 seconds)

**Purpose:** Fine motor skill development, letter shape memory

**Flow:**
1. Full-screen letter displayed
2. Tracing guides appear (dotted line or arrows)
3. Child traces with finger following the guide
4. Visual feedback on trace:
   - On-path: Trail turns green
   - Off-path: Trail turns red, gentle vibration (if supported)
5. Success: 3 accurate traces required

**Technical:**
- Canvas-based tracing
- Path detection algorithm (point-to-line distance)
- Accuracy threshold: 70% overlap

**Adaptive Logic:**
- First 2 attempts: Full freedom
- After 2 fails: Show guide dots
- After 4 fails: Show animated tracing demonstration

---

### 8.4 Challenge 4: Quiz (90 seconds)

**Purpose:** Mastery verification

**Flow:**
1. 3 questions presented sequentially
2. Each question: Target vs Distractor (2 options)
3. Child selects one
4. Immediate feedback after each selection
5. Scoring: Must get 2/3 to pass

**Question Format:**
- "Which starts with A?"
- Images side by side
- Large tap targets (minimum 150×150px)

**Failure Handling:**
- 0/3 or 1/3 correct: Return to Challenge 2 (review)
- 2/3 or 3/3 correct: Proceed to reward
- Review flag stored to adjust difficulty next time

---

## 9. Performance Requirements

### 9.1 Load Times

| Metric | Target | Maximum |
|--------|--------|---------|
| **App startup** | <3 seconds | 5 seconds |
| **Quest load** | <2 seconds | 3 seconds |
| **Challenge transition** | <500ms | 1 second |
| **Audio playback start** | <200ms | 500ms |
| **Image display** | <1 second | 2 seconds |

### 9.2 Runtime Performance

| Metric | Target |
|--------|--------|
| **Frame rate** | 60fps minimum |
| **Memory usage** | <100MB |
| **Storage** | <50MB total |
| **Battery impact** | <5% per hour |
| **Offline capability** | 100% (no network required) |

### 9.3 Tablet Specifications

**Minimum:**
- Chrome OS 114+
- 2GB RAM
- 7" screen
- Touch interface

**Recommended:**
- Chrome OS 120+
- 4GB RAM
- 10" screen
- Stylus support (optional)

---

## 10. Testing Plan

### 10.1 Unit Testing

**Components to test:**
- Challenge logic (error tracking, completion)
- Adaptive difficulty algorithm
- Progress persistence
- Audio playback

**Tools:** Vitest + React Testing Library

### 10.2 Integration Testing

**Scenarios:**
- Complete quest flow (all 6 quests)
- Adaptive difficulty triggers
- Progress save/load cycle
- Offline functionality

### 10.3 User Testing

**Pilot Group:** 3-5 kindergarten children

**Metrics:**
1. Completion rate (target: 80%)
2. Time to completion per quest
3. Error rate per challenge type
4. Teacher intervention count
5. Child satisfaction (observation-based)

**Feedback Collection:**
- Observation logs
- Video recording (with consent)
- Teacher interview

---

## 11. Deployment Plan

### 11.1 Build Process

```bash
# Development
npm run dev

# Production build
npm run build

# Output: dist/ folder
# - index.html
# - assets/
#   - images/
#   - audio/
#   - JS bundles
```

### 11.2 Distribution

**Method 1: Direct Install (MVP)**
- Build app
- Copy to Chrome tablet
- Open in Chrome browser
- Add to home screen (PWA)

**Method 2: Web Server (Phase 1)**
- Host on internal school server
- Tablets access via URL
- Automatic updates

**Future: Chrome Web Store (Phase 2)**
- Packaged as Kiosk app
- Managed via Google Admin Console

---

## 12. Success Metrics

### 12.1 Phase 0 Gates

| Gate | Metric | Target | Status |
|------|--------|--------|--------|
| **Engagement** | 60-min completion | 80% | ⏳ TBD |
| **Learning** | Letter recognition | 80% | ⏳ TBD |
| **Independence** | Teacher interventions | <2 per session | ⏳ TBD |
| **Technical** | Load times | <3s startup | ✅ Passing |
| **Usability** | Child satisfaction | 4+/5 | ⏳ TBD |

### 12.2 Data Collection

**Auto-collected:**
- Time per challenge
- Error counts
- Hint usage
- Completion rates
- Retry attempts

**Manual:**
- Teacher observations
- Child feedback (simple thumbs up/down)

---

## 13. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Children lose focus** | High | Medium | 6-minute quests, frequent feedback, celebration moments |
| **Tablets too slow** | Medium | High | Performance budget, asset optimization, fallback animations |
| **Audio too quiet/unclear** | Medium | High | Visual text backup, volume boost, headphone support |
| **Children tap randomly** | High | Low | Lock incorrect answers briefly, require intentional taps |
| **Progress lost on crash** | Low | High | Auto-save every 10 seconds, localStorage backup |
| **Teacher can't set up** | Low | High | <2 min setup, QR code launch, offline first |

---

## 14. Future Roadmap

### Phase 1 (Q2 2026)
- Quests 007-010 (Letters F-J, Numbers 2-3)
- Teacher dashboard
- Parent progress reports
- Audio recording (child pronunciation)

### Phase 2 (Q3 2026)
- K-1 full curriculum (Quests 001-030)
- Adaptive storybooks
- Multi-player challenges
- School server deployment

### Phase 3 (Q4 2026)
- K-5 complete
- AI tutor personalization
- Speech recognition
- Writing recognition

---

## 15. Appendix

### A. API Reference (Internal)

```typescript
// Challenge Types
enum ChallengeType {
  LISTEN = 'listen',
  FIND = 'find',
  TRACE = 'trace',
  QUIZ = 'quiz'
}

// Lesson Structure
interface Lesson {
  lessonId: string;
  sequence: number;
  title: string;
  duration: string;
  learningObjectives: string[];
  skillsTargeted: string[];
  prerequisites: string[];
  challenges: Challenge[];
}

// Progress Tracking
interface Progress {
  completedLessons: string[];
  masteryScores: Record<string, number>;
  totalTimeSpent: number;
  currentStreak: number;
}
```

### B. Asset Checklist

See `tools/asset-checklist.md` for generation tracking.

### C. Audio Script Templates

See `curriculum/audio-scripts/` for narration templates.

---

**Document Owner:** Flow Education Team  
**Review Cycle:** Weekly during MVP  
**Last Updated:** March 1, 2026
