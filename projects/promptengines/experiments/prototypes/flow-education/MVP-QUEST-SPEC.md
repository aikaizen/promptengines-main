# Flow Education — MVP Quest Specification

*Phase 0: 6 Quests = ~36 Minutes of Curriculum*  
*Target: Kindergarten, Ages 5-6*  
*Platform: Android/Chrome Tablets*

---

## Overview

The MVP consists of **6 quests** delivering approximately **36 minutes** of structured learning content. Each quest follows the same 4-challenge structure designed for independent engagement without adult supervision.

**Total Assets Needed:**
- ~120 images (characters, objects, letters, backgrounds, UI)
- ~180 audio clips (narration, feedback)
- 6 lesson manifests

---

## Quest Structure Template

Every quest follows this exact flow:

```
INTRO (30 sec)
├── Tutor welcome + letter introduction
├── Sound demonstration
└── Transition to Challenge 1

CHALLENGE 1: LISTEN (90 sec)
├── Tutor says 3 words starting with target
├── Child listens (passive, no interaction needed)
└── Transition to Challenge 2

CHALLENGE 2: FIND/TAP (120 sec)
├── 5 target items displayed with 3 distractors
├── Child taps all correct items
├── Immediate feedback on each tap
└── Complete when 4/5 targets identified

CHALLENGE 3: TRACE (120 sec)
├── Letter displayed with tracing guides
├── Child traces with finger 3 times
├── Visual feedback on trace accuracy
└── Complete when letter formed correctly

BOSS CHALLENGE: QUIZ (90 sec)
├── 3 multiple-choice questions
├── Each: target vs distractor (2 options)
├── Must get 2/3 correct to pass
└── Failure loops back to easier version

REWARD (30 sec)
├── Letter badge unlocked
├── Recap of learned words
└── Preview of next letter

OUTRO (30 sec)
├── Celebration
├── "See you next time!"
└── Return to quest map
```

**Total per quest: ~6 minutes**

---

## Quest 001: Letter A

**Duration:** 6 minutes  
**Prerequisites:** None  
**Target Words:** Apple, Ant, Astronaut, Anchor, Acorn  
**Distractors:** Ball, Cat, Dog  
**Assets:** 24 images + 38 audio clips

### Assets Required

| Category | Items | Description |
|----------|-------|-------------|
| **Characters** | 5 | Tutor: neutral, happy, thinking, encouraging, waving |
| **Objects** | 8 | Apple, ant, astronaut, anchor, acorn, ball (distractor), cat (distractor), dog (distractor) |
| **Letters** | 4 | Uppercase A, lowercase a, preview B |
| **Backgrounds** | 3 | Classroom, space scene (astronaut), nature scene (ant) |
| **UI** | 4 | Play button, progress bar, star empty/filled, checkmark |

### Audio Required

| Category | Count | Examples |
|----------|-------|----------|
| **Narration** | 28 | Intro, challenge instructions, transitions, outro |
| **Feedback** | 10 | "Correct!" (5 variations), "Try again!" (5 variations) |

### Challenge Flow

1. **Listen (90s)**: Tutor says "Apple! A-a-apple!" x3 with images
2. **Find (120s)**: Tap apple, ant, astronaut (ignore ball, cat)
3. **Trace (120s)**: Trace letter A with finger, 3 attempts
4. **Quiz (90s)**: Which starts with A? (apple vs ball), (ant vs cat), (astronaut vs dog)
5. **Reward**: Letter A badge unlocked

### Key Script Lines

- **Intro:** "Hello! I'm excited to learn with you! Today we're meeting the letter A!"
- **Sound:** "A says ahh like apple. A-a-apple!"
- **Challenge 2:** "Tap all the pictures that start with the A sound!"
- **Trace:** "Start at the top, go down, then across!"
- **Reward:** "Amazing! You unlocked the Letter A!"

---

## Quest 002: Letter B

**Duration:** 6 minutes  
**Prerequisites:** Quest 001 (A)  
**Target Words:** Butterfly, Bear, Ball, Boat, Banana  
**Distractors:** Apple (A), Cat, Dog  
**Assets:** 24 images + 38 audio clips

### Assets Required

| Category | Items | Description |
|----------|-------|-------------|
| **Characters** | 5 | Same tutor expressions (reuse Quest 001) |
| **Objects** | 8 | Butterfly, bear, ball, boat, banana, apple (distractor), cat, dog |
| **Letters** | 5 | Uppercase B, lowercase b, review A, preview C |
| **Backgrounds** | 3 | Classroom, butterfly garden, bear forest |
| **UI** | 4 | Same as Quest 001 |

### Challenge Flow

1. **Listen (90s)**: Tutor demonstrates B sounds: butterfly, bear, ball
2. **Find (120s)**: Tap butterfly, bear, ball, boat, banana (ignore apple, cat, dog)
3. **Trace (120s)**: Trace letter B — straight down, then two bumps
4. **Quiz (90s)**: Which starts with B? (butterfly vs cat), (ball vs apple), (bear vs dog)
5. **Reward:** Letter B badge + "You know A and B now!"

### Key Script Lines

- **Intro:** "Hello again! Ready for a new adventure? Today: the letter B!"
- **Sound:** "B says buh-buh-buh like bear. B-b-bear!"
- **Review:** "Remember A? A says ahh like apple. A and B are neighbors!"

---

## Quest 003: Letter C

**Duration:** 6 minutes  
**Prerequisites:** Quest 001-002 (A, B)  
**Target Words:** Cat, Car, Cookie, Cup, Carrot  
**Distractors:** Apple (A), Ball (B), Dog (preview D)  
**Assets:** 24 images + 30 audio clips

### Special Note: Two C Sounds

Letter C has two sounds:
- **Hard C:** /k/ like cat, car
- **Soft C:** /s/ like cookie, cup, carrot

Tutor introduces both: "C is tricky! Sometimes it's cuh like cat, sometimes sss like cookie."

### Challenge Flow

1. **Listen (90s)**: Hear both sounds — cat (cuh), cookie (sss), car (cuh)
2. **Find (120s)**: Tap all 5 C items regardless of sound
3. **Trace (120s)**: Trace letter C — curve like a smile
4. **Quiz (90s)**: Identify C items (cat vs apple), (cookie vs ball), (car vs dog)
5. **Reward:** Letter C badge + "You know three letters!"

---

## Quest 004: Letter D

**Duration:** 6 minutes  
**Prerequisites:** Quest 001-003 (A, B, C)  
**Target Words:** Dog, Duck, Dinosaur, Donut, Door  
**Distractors:** Apple (A), Ball (B), Cat (C)  
**Assets:** 20 images + 20 audio clips

### Challenge Flow

1. **Listen (90s)**: D sounds — dog (woof), duck (quack), dinosaur (roar)
2. **Find (120s)**: Tap dog, duck, dinosaur, donut, door
3. **Trace (120s)**: Trace letter D — straight down then curve
4. **Quiz (90s)**: D identification quiz
5. **Reward:** Letter D badge

---

## Quest 005: Letter E

**Duration:** 6 minutes  
**Prerequisites:** Quest 001-004 (A, B, C, D)  
**Target Words:** Elephant, Egg, Eagle, Elbow, Engine  
**Distractors:** Apple, Ball, Cat, Dog  
**Assets:** 20 images + 20 audio clips

### Challenge Flow

1. **Listen (90s)**: E sounds — elephant (big!), egg (crack!), eagle (fly!)
2. **Find (120s)**: Tap all E items
3. **Trace (120s)**: Trace letter E — straight line, three across
4. **Quiz (90s)**: E identification quiz
5. **Reward:** Letter E badge + BIG CELEBRATION "You know five letters! A B C D E!"

---

## Quest 006: Number 1

**Duration:** 6 minutes  
**Prerequisites:** Quest 001-005 (Letters A-E)  
**Target Concepts:** Number 1, counting 1 item, recognizing the digit  
**Target Words:** One, Single, Solo, First  
**Distractors:** 2, 3, 4 (preview)  
**Assets:** 20 images + 20 audio clips

### New Challenge Types (Numbers)

Challenge 2 is modified for counting:
- **Counting Challenge:** "Tap one apple" — screen shows 3 apples, child taps exactly 1
- **Number Recognition:** "Find the number 1" — shows digits 1, 2, 3

### Challenge Flow

1. **Listen (90s)**: "One! Just one! One apple. One ball. One cat."
2. **Count (120s)**: Tap exactly 1 item from groups of 2-3
3. **Trace (120s)**: Trace the number 1 — straight line down
4. **Quiz (90s)**: Which shows one? (1 apple vs 2 apples), (digit 1 vs digit 2), (1 finger vs 2 fingers)
5. **Reward:** Number 1 badge + "You know letters AND numbers now!"

### Assets Required

| Category | Items | Description |
|----------|-------|-------------|
| **Characters** | 5 | Same tutor expressions |
| **Objects** | 8 | One apple, one ball, one cat, one dog, two apples (distractor), three balls (distractor), digit 1, digit 2 |
| **Numbers** | 3 | Digit 1, digit 2, digit 3 |
| **Backgrounds** | 2 | Classroom, counting garden |
| **UI** | 2 | Same UI elements |

---

## Summary: All 6 Quests

| Quest | Topic | Duration | New Assets | New Audio | Prerequisites |
|-------|-------|----------|------------|-----------|---------------|
| 001 | Letter A | 6 min | 24 images | 38 clips | None |
| 002 | Letter B | 6 min | 24 images | 38 clips | Quest 001 |
| 003 | Letter C | 6 min | 24 images | 30 clips | Quest 001-002 |
| 004 | Letter D | 6 min | 20 images | 20 clips | Quest 001-003 |
| 005 | Letter E | 6 min | 20 images | 20 clips | Quest 001-004 |
| 006 | Number 1 | 6 min | 20 images | 20 clips | Quest 001-005 |
| **TOTAL** | | **36 min** | **~132 images** | **~166 clips** | |

**Note:** Character images (5 expressions) can be reused across all quests. UI elements can be reused. Unique assets per quest: objects, letters, backgrounds.

---

## Asset Generation Status

| Quest | Manifest | Images Status | Audio Status |
|-------|----------|---------------|--------------|
| 001 | ✅ Complete | ⏳ Generate | ⏳ Generate |
| 002 | ✅ Complete | ⏳ Generate | ⏳ Generate |
| 003 | ✅ Complete | ⏳ Generate | ⏳ Generate |
| 004 | ✅ Complete | ⏳ Generate | ⏳ Generate |
| 005 | ✅ Complete | ⏳ Generate | ⏳ Generate |
| 006 | ⏳ Create | ⏳ Create | ⏳ Create |

---

## Challenge Mechanics Detail

### Challenge 1: Listen (Passive)
- **No interaction required**
- Child watches and listens
- Tutor demonstrates sounds with animation
- Auto-advances after 90 seconds
- **Purpose:** Auditory priming, sound-letter association

### Challenge 2: Find/Tap (Active)
- **Grid of 6-8 images** (3x2 or 4x2)
- Child taps targets, ignores distractors
- **Immediate feedback:**
  - Correct: Green flash + positive audio
  - Incorrect: Gentle shake + encouraging audio
- **Completion:** Identify 4/5 targets correctly
- **Adaptation:** After 3 errors, hint highlights one target

### Challenge 3: Trace (Motor)
- **Letter displayed full-screen**
- Tracing guides (dotted lines or arrows)
- Child traces with finger
- **Accuracy check:** Path overlap >70% = success
- **Attempts:** 5 tries, pass on 3rd successful trace
- **Adaptation:** Guide dots appear after 2 failed attempts

### Boss Challenge: Quiz (Assessment)
- **3 questions, 2 options each**
- Format: Target image vs Distractor image
- Must get 2/3 to complete quest
- **Failure handling:**
  - If 0/3 or 1/3 correct → Return to Challenge 2 (review)
  - If 2/3 or 3/3 → Proceed to reward
- **Purpose:** Mastery verification before advancement

### Reward (Celebration)
- **Badge animation** (letter unlocks)
- **Recap:** "You learned A is for apple, ant, astronaut!"
- **Preview:** "Next time we'll learn B!"
- **Progress bar update** on quest map

---

## Adaptive Logic Per Quest

The system tracks:
- **Error rate** per challenge
- **Time per challenge** (frustration detection)
- **Hint usage** count

**Triggers:**
- 3 consecutive errors → Drop difficulty (more hints, longer time)
- 5 consecutive successes → Raise difficulty (faster pace, fewer hints)
- Stuck >30 seconds → Offer hint
- Failed boss challenge → Insert review challenge

**Outcome:** Quest adjusts in real-time but completes in ~6 minutes regardless.

---

## Next Steps

1. **Generate assets** for Quests 001-005 (run batch tools)
2. **Create manifest** for Quest 006 (Number 1)
3. **Test** one complete quest with 3 children
4. **Iterate** on timing, difficulty, audio clarity
5. **Package** all 6 quests with lesson-assembler
6. **Deploy** to Chrome tablets for pilot

---

*Last updated: March 2026*
