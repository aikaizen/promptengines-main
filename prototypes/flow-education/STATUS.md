# Flow Education — App Status

**Last updated:** 2026-03-01
**Live URL:** promptengines.com/flow
**Codebase:** `prototypes/flow-education/app/`

---

## Overall Verdict

**The app is partially functional but has several blocking bugs that prevent a normal user from completing even one lesson.** The React crashes from the previous session were fixed, but image loading, navigation, and a badge path bug remained broken until this session's fixes.

---

## What Was Just Fixed (this session)

| # | Issue | Fix |
|---|-------|-----|
| 1 | Images not loading anywhere | Changed image paths from `/assets/...` (root-relative) to `${import.meta.env.BASE_URL}assets/...` — Vite base is `/prototypes/flow-education/app/dist/` so absolute paths resolved to wrong server location |
| 2 | INTRO/LISTEN: no way to advance | Added "Continue →" button to INTRO, LISTEN, REWARD, OUTRO screens — previously the only option was waiting 30–90 seconds for a timer |
| 3 | Badge images not found | `getBadgeImage('letter-A')` was returning `badge-letter-A.png` but actual files are `badge-letter-a.png`. Fixed to lowercase + `badge-` prefix |
| 4 | Number lesson LISTEN images broken | Words were `['One apple', 'One ball', 'One cat']` — image lookup tried `obj-one apple.png`. Changed to `['Apple', 'Ball', 'Cat']` |
| 5 | All lessons locked except first | Removed sequential lock logic — all lessons now accessible |
| 6 | Auto-advance timers too long | INTRO: 30s → 8s, LISTEN: 90s → 12s, REWARD: 30s → 8s — user no longer stranded |

---

## Remaining Known Issues

### 🔴 High Priority (blocking UX)

**1. Possible crash on FIND → advance with stale closure**
The timer `useEffect` that calls `advanceToNextChallenge()` is missing `advanceToNextChallenge` from its dependency array. In theory, the functional updater `setCurrentChallengeIndex(prev => prev + 1)` protects against the worst case, but if two timers race (e.g., user manually taps Continue AND auto-advance fires), it could double-advance and land on `currentChallenge = undefined`, crashing `switch (currentChallenge.type)`.
**Fix:** Add `advanceToNextChallenge` to the `useEffect` dep array, or add a null-guard in `renderChallenge`.

**2. FIND challenge: no explicit "done" signal to user**
After tapping 4/5 correct items in the letter FIND challenge, the app auto-advances after 1.5s with no visual "all done!" moment. It just disappears. Confusing.

**3. Quiz options are plain text strings, not images**
Quiz questions show word text (`Apple`, `Ball`) as answer options. The visual intent was image buttons matching the object images. Currently shows a text label which is fine for 5-6 but doesn't match the watercolor visual style established elsewhere.

### 🟡 Medium Priority (not crashing, but incomplete)

**4. Backgrounds not used**
10 background scenes were generated (`bg-classroom.png`, `bg-space.png`, etc.) and sit in `/assets/backgrounds/`. None are wired into any screen. The app uses plain dark CSS backgrounds throughout.

**5. Letter display images not used**
Generated `letter-A-upper.png` through `letter-e-lower.png` exist but aren't shown anywhere. The TRACE challenge shows a plain CSS text character as the tracing target. Intended to show the styled letter image instead.

**6. Counting challenge uses Apple emoji text, not hand images**
`obj-hand-one.png` and `obj-hand-two.png` were generated for the Number 1 counting challenge FIND screen. The challenge currently shows the count images (`obj-count-1.png` etc.) but the hand images aren't wired in.

**7. Tutor is always "neutral" face**
The tutor has 5 expressions: neutral, happy, thinking, encouraging, waving. Currently only `neutral` is used for INTRO and LISTEN. `waving` for OUTRO, `happy` for SimpleLessonView intro. `thinking` and `encouraging` are never shown. Logic to switch tutor face based on challenge state doesn't exist yet.

**8. No real audio**
All sounds are Web Audio API synthesized beeps and tones. No narration, no letter phonics, no encouraging voice. The `playNarration(script)` calls in the code do nothing useful — the function generates tones, not speech. ElevenLabs or similar TTS integration is planned but not started.

**9. SimpleLessonView (4YO mode): distractors are always Ball and Cat**
For all letter lessons in 4YO mode, the FIND challenge shows the target word image against Ball and Cat as distractors regardless of the lesson. Should vary by lesson.

### 🟢 Working Correctly

- App loads, mounts, and renders without crashing
- Mode selection screen (4YO vs 5-6)
- Lesson list renders all 6 lessons (A, B, C, D, E, Number 1)
- Lesson plan metadata displays correctly
- Progress tracking (localStorage persist/load)
- Tracing canvas (draw with finger/mouse)
- Trace accuracy detection (directional path scoring)
- Quiz answer handling and scoring
- FIND challenge tap detection (correct vs distractor)
- Lesson completion → score → return to home
- Responsive layout, touch events, tablet optimization
- Error boundary catches React errors gracefully

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
│   │   ├── useAudio.js            # Web Audio synth (placeholder)
│   │   └── useSafeTabletTouch.js  # Touch/haptic helpers
│   └── styles/
│       └── App.css                # All styles
└── public/
    └── assets/                    # All generated images
        ├── characters/            # char-tutor-*.png (5 expressions)
        ├── objects/               # obj-*.png (30 objects + counting)
        ├── letters/               # letter-*-*.png + badge-letter-*.png
        ├── numbers/               # number-*-display.png + badge-number-*.png
        ├── backgrounds/           # bg-*.png (10 scenes) — NOT YET USED
        └── ui/                    # ui-*.png (8 elements) — NOT YET USED
```

---

## Next Steps (in order)

1. **Test the current deploy** — verify images load, Continue button works, badges show
2. **Add null guard in `renderChallenge`** — prevent crash if `currentChallenge` is undefined
3. **Wire in backgrounds** — show a relevant background image behind each lesson type
4. **Show letter images in TRACE** — display `letter-A-upper.png` behind the canvas instead of plain text
5. **Switch tutor expression** per challenge type (happy on REWARD, thinking on QUIZ, encouraging on FIND errors)
6. **Real audio** — ElevenLabs TTS for narration scripts, or recorded MP3s
7. **Add more content** — lessons F-Z and Numbers 2-10
