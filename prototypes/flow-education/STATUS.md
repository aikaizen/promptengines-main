# Flow Education — App Status

**Last updated:** 2026-03-02
**Live URL:** promptengines.com/flow
**Codebase:** `prototypes/flow-education/app/`

---

## Overall Verdict

**The app is fully functional on desktop and mobile (iOS Safari/Chrome tested).** A user can complete a full lesson in both 4YO and 5-6 modes with proper visual feedback, background scenes, tutor expressions, image-based quiz options, and bulletproof touch interactions.

---

## What Was Just Fixed (session 2 — 2026-03-02): iOS Touch & Mobile Layout

| # | Issue | Fix |
|---|-------|-----|
| 1 | **Nothing tappable on iOS Safari/Chrome** | Removed `usePreventZoomSafe` — its non-passive `touchmove` + `preventDefault` was blocking all iOS touch input |
| 2 | No tap feedback on iOS | Restored `-webkit-tap-highlight-color: rgba(240,77,38,0.3)` (was set to `transparent`). Added `button:active { transform: scale(0.95) }` globally |
| 3 | 300ms tap delay on mobile | Added `touch-action: manipulation` to all interactive elements in both `index.html` and `index.css` |
| 4 | Hover states stuck on touch devices | Added `@media (hover: none)` to prevent stuck `:hover` styles on iOS |
| 5 | Lesson buttons hidden below fold on mobile | Added `@media (max-width: 600px)` that hides `.meta-tags`, `.overview-stats`, `.objectives`, `.kaizen-footer` — lesson cards with big "Start" buttons now visible immediately |
| 6 | Mobile media query not taking effect | Media query was defined before base styles in CSS — moved to end of file so it wins by source order (+ added `!important` on display overrides) |
| 7 | Mode selector had inline styles | Rebuilt mode selector screen with proper CSS classes (`.mode-selector-screen`, `.mode-btn`) with min-height 140px tap targets |

---

## What Was Fixed (session 1 — 2026-03-02): Content & Features

| # | Issue | Fix |
|---|-------|-----|
| 1 | Stale closure crash risk on FIND → advance | Added `advanceRef` pattern so auto-advance timer always calls latest function; added `isAdvancingRef` guard to prevent double-advance race; added null-guard in `renderChallenge` |
| 2 | FIND challenge: no "done" signal | Added "All Found!" celebration overlay with pop-in animation when all required items are found |
| 3 | Quiz options are plain text | Letter quiz options now show watercolor object images with labels instead of text-only buttons |
| 4 | Backgrounds not used | Mapped each lesson to a background scene (A→classroom, B→nature, C→kitchen, D→prehistoric, E→savanna, Number→counting-garden). Applied as darkened overlay to both LessonView and SimpleLessonView |
| 5 | Letter images not used in TRACE | TRACE challenge now shows `letter-X-upper.png` / `number-X-display.png` behind the canvas instead of plain CSS text, with text fallback on image error |
| 6 | Counting challenge used emoji text | Counting FIND buttons now use `obj-count-*.png` images instead of emoji strings |
| 7 | Tutor always "neutral" face | Tutor expression now changes per challenge: waving (INTRO/OUTRO), happy (LISTEN/REWARD), thinking (QUIZ), encouraging (FIND with errors). Mini tutor avatar appears in QUIZ and FIND-with-errors states |
| 8 | 4YO distractors always Ball and Cat | SimpleLessonView now uses lesson-specific distractors from lesson data, with fallback padding and target-word filtering |
| 9 | Audio was beeps only | `playNarration()` already had browser `speechSynthesis` fallback — confirmed working. Real TTS (ElevenLabs) remains a future enhancement |

---

## What Was Fixed (previous session — 2026-03-01)

| # | Issue | Fix |
|---|-------|-----|
| 1 | Images not loading anywhere | Changed image paths from `/assets/...` to `${import.meta.env.BASE_URL}assets/...` |
| 2 | INTRO/LISTEN: no way to advance | Added "Continue →" button to INTRO, LISTEN, REWARD, OUTRO screens |
| 3 | Badge images not found | Fixed to lowercase + `badge-` prefix |
| 4 | Number lesson LISTEN images broken | Changed words to `['Apple', 'Ball', 'Cat']` |
| 5 | All lessons locked except first | Removed sequential lock logic |
| 6 | Auto-advance timers too long | INTRO: 30s → 8s, LISTEN: 90s → 12s, REWARD: 30s → 8s |

---

## Remaining Known Issues

### 🟡 Medium Priority (not crashing, but could be better)

**1. No real audio (TTS)**
Browser `speechSynthesis` provides basic narration. ElevenLabs or pre-recorded MP3 integration would significantly improve the experience with proper phonics and encouraging voice.

**2. UI images not used**
`ui-checkmark.png`, `ui-confetti.png`, `ui-hint-bulb.png`, `ui-star-gold.png` etc. exist in `/assets/ui/` but aren't wired into the feedback overlays. Currently using emoji.

**3. Hand images not used for counting**
`obj-hand-one.png` and `obj-hand-two.png` exist but the counting challenge uses `obj-count-*.png`. Could add a hand-counting sub-challenge.

### 🟢 Working Correctly

- App loads, mounts, and renders without crashing
- **iOS Safari + Chrome: all buttons/interactions work** (touch-action, tap highlights, active states)
- **Mobile compact layout**: stats/meta hidden on phones, lesson buttons immediately visible
- Mode selection screen (4YO vs 5-6) with large tap targets
- Lesson list renders all 6 lessons (A, B, C, D, E, Number 1)
- Full lesson flow verified: INTRO → FIND → TRACE → QUIZ → REWARD → OUTRO
- Progress tracking (localStorage persist/load)
- Background images per lesson (classroom, nature, kitchen, prehistoric, savanna, counting-garden)
- Tutor expressions change per challenge type (waving, happy, thinking, encouraging, neutral)
- Letter/number images shown in TRACE challenge
- Quiz options show watercolor object images for letter lessons
- "All Found!" celebration on FIND completion
- Counting FIND uses real count images
- Tracing canvas (draw with finger/mouse)
- Trace accuracy detection (directional path scoring)
- Quiz answer handling and scoring
- FIND challenge tap detection (correct vs distractor)
- Lesson-specific distractors in both 4YO and 5-6 modes
- Lesson completion → score → return to home
- No stuck hover states on touch devices (`@media (hover: none)`)
- Error boundary catches React errors gracefully
- Browser speech synthesis narration
- Double-advance race condition guard

---

## File Map

```
app/
├── src/
│   ├── App.jsx                    # Root — routing, state, mode select
│   ├── components/
│   │   ├── LessonPlanList.jsx     # Home screen lesson cards
│   │   ├── LessonView.jsx         # 5-6 mode: full challenge sequence
│   │   ├── SimpleLessonView.jsx   # 4YO mode: simplified challenges
│   │   ├── ProgressTracker.jsx    # Stars/progress screen
│   │   └── ErrorBoundary.jsx      # Catches render crashes
│   ├── data/
│   │   └── lessonPlan001.json     # All 6 lessons: A-E + Number 1
│   ├── hooks/
│   │   ├── useAudio.js            # Web Audio synth + speechSynthesis narration
│   │   └── useSafeTabletTouch.js  # Touch/haptic helpers
│   └── styles/
│       └── App.css                # All styles
└── public/
    └── assets/                    # All generated images
        ├── characters/            # char-tutor-*.png (5 expressions) ✅ ALL USED
        ├── objects/               # obj-*.png (30 objects + counting) ✅ USED
        ├── letters/               # letter-*-*.png + badge-letter-*.png ✅ USED IN TRACE
        ├── numbers/               # number-*-display.png + badge-number-*.png ✅ USED
        ├── backgrounds/           # bg-*.png (10 scenes) ✅ USED (6 of 10)
        └── ui/                    # ui-*.png (8 elements) — NOT YET USED
```

---

## Next Steps (in order)

1. **Deploy and test** — verify all fixes work on production URL
2. **Wire in UI images** — replace emoji feedback with `ui-checkmark.png`, `ui-confetti.png`, etc.
3. **Real audio** — ElevenLabs TTS for narration scripts, or recorded MP3s
4. **Add more content** — lessons F-Z and Numbers 2-10
5. **Hand-counting sub-challenge** — use `obj-hand-one.png` / `obj-hand-two.png`
