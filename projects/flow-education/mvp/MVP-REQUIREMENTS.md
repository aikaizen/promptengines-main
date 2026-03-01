# Flow Education — MVP Requirements

*Target: Kindergarten | Platform: Android/Chrome Tablets | Timeline: 6-8 weeks*

---

## 🎯 MVP Goal

**A tablet app that keeps kindergarteners engaged in educational content for 60 minutes without adult assistance.**

---

## 📋 Core Requirements

### R1: 60-Minute Curriculum
**Must provide**: At least 60 minutes of structured, sequenced content

#### Breakdown
- **Warm-up**: 5 min (login, review, preview)
- **Block 1**: 20 min (literacy focus)
- **Transition**: 5 min (break, movement, reward check)
- **Block 2**: 20 min (math focus)
- **Creative time**: 10 min (choice activities)

**Total**: 60 minutes of designed experience

#### Content Volume Needed
| Component | Quantity | Time Each | Total |
|-----------|----------|-----------|-------|
| Quests (learning arcs) | 10 | 6 min | 60 min |
| Challenges (within quests) | 40 | 1.5 min | 60 min |
| Warm-up/review activities | 20 | 30 sec | 10 min |
| Break/stretch animations | 10 | 1 min | 10 min |
| Reward stories | 10 | 3 min | 30 min |

**Minimum viable content**: 10 quests, 40 challenges, 20 warm-ups, 10 breaks, 10 stories

---

### R2: Full Voice Narration
**Critical**: Kindergarteners cannot read instructions

#### Audio Requirements
- **All instructions**: Text-to-speech or pre-recorded
- **Feedback**: "That's right! The 'B' says /b/!" 
- **Encouragement**: "You're doing great! Try again!"
- **Explanations**: "See how this shape has 3 sides? That's a triangle."

#### Audio Specifications
- **Format**: MP3 or OGG, 64-128kbps (balance quality/size)
- **Total audio assets**: ~200-300 phrases
- **Size budget**: <200MB for all audio
- **Latency**: <500ms between tap and audio start

#### TTS vs. Human Voice Decision
| Option | Pros | Cons | Recommendation |
|--------|------|------|----------------|
| **TTS** (Google Cloud, Amazon Polly) | Infinite variety, updates easy | Robotic, expensive at scale | Use for dynamic content |
| **Pre-recorded human** | Warm, engaging, trust | Expensive, time-consuming | Use for core instructions |
| **Hybrid** | Best of both | Complex implementation | **RECOMMENDED** |

**Hybrid approach**:
- Pre-record human voice for core quest narration (80%)
- TTS for specific feedback, names, adaptive responses (20%)

---

### R3: Adaptive Difficulty
**Not just levels — real-time adjustment**

#### Adaptive Triggers
| Signal | Action |
|--------|--------|
| 3 wrong answers in a row | Easier challenge, more scaffolding |
| 3 right answers in a row | Harder challenge, faster pace |
| 30 seconds no interaction | Prompt with hint, then easier path |
| Child says "I'm tired" (if voice input) | Offer break, easier content |
| Time elapsed >45 min | Wind-down content, no new concepts |

#### Difficulty Dimensions
- **Complexity**: Fewer vs. more choices
- **Speed**: Slower vs. faster pace
- **Support**: More vs. less scaffolding
- **Length**: Shorter vs. longer challenges

---

### R4: Challenge/Quest Structure

#### Quest Template
```
QUEST: [Learning Objective]
├── INTRO: Tutor explains what we're learning (30 sec)
├── CHALLENGE 1: Listen/Watch (input only) (2 min)
├── CHALLENGE 2: Recognition/Selection (tap correct answer) (2 min)
├── CHALLENGE 3: Production/Action (draw, speak, drag) (2 min)
├── BOSS CHALLENGE: Assessment (no help, prove mastery) (2 min)
├── REWARD: Story/Animation/Praise (1 min)
└── OUTRO: Preview next quest (30 sec)
```

#### Challenge Types
1. **Listen**: Audio plays, child listens (passive learning)
2. **Tap**: Multiple choice, single correct answer
3. **Drag**: Sorting, matching, sequencing
4. **Trace**: Letter/number formation
5. **Speak**: Voice input (if technically feasible)
6. **Draw**: Simple drawing, shapes, letters

---

### R5: Offline Mode
**Critical for school deployment**

#### Offline Capabilities
- [ ] All curriculum assets cached locally
- [ ] Progress saved locally (sync when online)
- [ ] Audio files pre-downloaded
- [ ] Works without internet ( degrade gracefully)

#### Sync Strategy
- **When online**: Sync progress to cloud every 5 minutes
- **When offline**: Queue sync, upload when connection restored
- **Conflict resolution**: Server wins (teacher/admin authoritative)

---

### R6: Teacher Dashboard (Web)
**Minimal viable dashboard for classroom management**

#### Features
- [ ] Class roster (add/remove students)
- [ ] Session overview (who's active, time on task)
- [ ] Individual progress (quests completed, skills mastered)
- [ ] Basic analytics (completion rate, struggle areas)
- [ ] Content controls (enable/disable specific quests)

#### Tech Stack Options
1. **Simple**: Google Sheets + App Script (free, fast)
2. **Standard**: Firebase + React (scalable, moderate effort)
3. **Full**: Custom backend + dashboard (expensive, slow)

**Recommendation**: Start with Firebase, migrate if needed

---

### R7: Chrome Tablet Compatibility

#### Technical Specs to Support
- **Screen**: 10-inch minimum (touch targets must be large)
- **OS**: Android 8+ or Chrome OS with Android runtime
- **RAM**: 2GB minimum, 4GB recommended
- **Storage**: 4GB free space for app + content
- **Audio**: Speaker + headphone jack

#### Testing Requirements
- [ ] Test on actual Chrome tablets (not just emulator)
- [ ] Test with child-sized hands (touch target size: 48dp minimum)
- [ ] Test audio with ambient classroom noise
- [ ] Test offline mode (airplane mode)
- [ ] Test battery consumption (60 min session)

---

## 🎨 UX/UI Requirements

### Visual Design
- **Color palette**: High contrast, accessible (WCAG AA minimum)
- **Touch targets**: Minimum 48x48dp (7mm physical size)
- **Font size**: Minimum 16sp for text, 24sp for instructions
- **Animations**: Smooth 60fps, not distracting

### Interaction Patterns
- **Primary action**: Always visible, high contrast
- **Back/exit**: Hard to hit accidentally (confirm dialog)
- **Progress indication**: Always visible (quest progress bar)
- **Feedback**: Immediate (<100ms) audio + visual

### Accessibility
- [ ] Screen reader support (TalkBack)
- [ ] High contrast mode
- [ ] Motor impairment support (dwell time, large targets)
- [ ] Hearing impairment support (visual cues for all audio)

---

## 📊 Data & Analytics

### What to Track
| Metric | Why | How |
|--------|-----|-----|
| Session duration | Core requirement | Start/end timestamps |
| Challenges completed | Engagement | Count per session |
| Time per challenge | Pace | Duration per challenge |
| Error rate | Difficulty calibration | Wrong answers / total |
| Help requests | Self-sufficiency | "Help" button taps |
| Exit reasons | Debugging | Why did they quit? |

### Privacy Requirements
- **COPPA compliant**: No personal data beyond first name + avatar
- **FERPA awareness**: School data protection
- **No advertising**: Zero ads, ever
- **Opt-in analytics**: Default minimal tracking

---

## 🔧 Technical Architecture

### Recommended Stack

#### Option A: React Native (Recommended)
**Pros**: Cross-platform, good performance, large community  
**Cons**: Android-only for MVP (Chrome tablets), audio can be tricky

#### Option B: Flutter
**Pros**: Fast, beautiful, single codebase  
**Cons**: Smaller community, audio plugins less mature

#### Option C: PWA (Progressive Web App)
**Pros**: No app store, easy updates, works on any device  
**Cons**: Limited offline capabilities, audio latency issues

**Decision**: React Native for Android MVP, evaluate cross-platform later

### Backend (Firebase)
- **Auth**: Anonymous auth for students, email for teachers
- **Database**: Firestore for progress, curriculum config
- **Storage**: Firebase Storage for audio assets
- **Analytics**: Firebase Analytics (privacy-compliant config)
- **Hosting**: Firebase Hosting for teacher dashboard

### Audio Pipeline
1. Record/buy human voice for core content
2. Generate TTS for dynamic content (Amazon Polly or Google Cloud)
3. Cache all audio locally after first download
4. Stream only if not cached

---

## 📝 Content Production Plan

### Phase 1: Foundation (Week 1-2)
- [ ] Map kindergarten standards to quest structure
- [ ] Write scripts for 10 quests (40 challenges)
- [ ] Record/buy audio for core narration (80%)
- [ ] Create visual assets (illustrations, UI elements)

### Phase 2: Build (Week 3-4)
- [ ] Implement quest engine (challenge progression)
- [ ] Build challenge types (tap, drag, trace, speak)
- [ ] Implement adaptive logic
- [ ] Create teacher dashboard (basic)

### Phase 3: Integration (Week 5)
- [ ] Add all audio assets
- [ ] Integrate StoryBook Studio reward stories (if available)
- [ ] Implement offline mode
- [ ] Polish UX, animations, transitions

### Phase 4: Test (Week 6-7)
- [ ] Internal testing (adults as "fake kids")
- [ ] Pilot with 2-3 actual kindergarteners
- [ ] Teacher feedback
- [ ] Iterate based on findings

### Phase 5: Deploy (Week 8)
- [ ] Package for Chrome tablets
- [ ] Deploy to pilot school
- [ ] Train teachers (30 min session)
- [ ] Monitor first week, hotfix issues

---

## 💰 Resource Requirements

### Time
- **Development**: 6-8 weeks (1 developer, 1 curriculum designer)
- **Content**: 2-3 weeks (scripts, audio, visuals)
- **Testing**: 2 weeks (pilot, iteration)

### Budget (Rough)
| Item | Cost | Notes |
|------|------|-------|
| Developer time | $8-15K | Contract or equity |
| Audio (voice actor) | $2-5K | Or DIY with good mic |
| Visual assets | $1-3K | Illustrations, UI design |
| Firebase (1 year) | $500-2K | Scales with users |
| Testing devices | $500 | 2-3 Chrome tablets |
| **Total** | **$12-25K** | MVP budget |

### Alternative: DIY Approach
- Developer: You or Andy (sweat equity)
- Audio: Record yourself or use TTS entirely
- Visuals: Use open-source illustrations, simple UI
- **Cost**: $2-5K (devices + Firebase + small design help)

---

## ✅ MVP Success Criteria

### Must Pass All
- [ ] Child can complete 60 min session without adult help
- [ ] Child learns measurable skills (letter/number recognition)
- [ ] Teacher says "this actually works" (4+/5 rating)
- [ ] App doesn't crash on Chrome tablets
- [ ] Works offline

### Nice to Have
- [ ] Kids ask to use it again
- [ ] Teacher wants it for next year
- [ ] Parents ask about it
- [ ] Other schools inquire

---

## 🚧 Risk Mitigation

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Audio latency ruins experience | Medium | Pre-cache all audio, test on slow devices |
| Kids get bored at 30 min | Medium | Pilot test with real kids early, iterate |
| Teacher setup too complex | Low | Keep login simple, provide 1-page guide |
| Tablets too underpowered | Low | Test on target hardware week 1 |
| Content creation takes too long | High | Start with 30 min MVP, expand to 60 |

---

## 🎯 First Quest to Build (Proof of Concept)

**Quest Name**: "Meet the Letter 'A'"  
**Duration**: 6 minutes  
**Challenges**: 4

1. **Listen**: "This is the letter A. It says /a/ like 'apple'. Can you say /a/?" (audio plays, child taps to continue)
2. **Find**: "Find all the A's!" (screen shows A, B, C, D, E mixed — child taps A's, 5 correct to proceed)
3. **Trace**: "Trace the A with your finger" (guided tracing, 3 attempts allowed)
4. **Boss**: "What sound does A make?" (shows apple, ball, cat, dog — child taps apple)

**Reward**: 30-second animation: "You're an A expert! A is for apple, ant, and astronaut!"

**Build this first**: If this works with 3 kindergarteners, the approach is validated.

---

*MVP requirements complete. Ready for technical specification.*
