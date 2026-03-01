# Flow Education — Tools Plan

*Asset Generation Pipeline for Lesson Creation*  
*Current: MVP Pilot Tools (CLI)*  
*Future: Teacher-Facing Web UI*

---

## 🎯 Tool Philosophy

**Now (MVP Pilot)**: 
- Batch CLI tools for rapid asset generation
- You run locally with your API keys
- JSON manifests define what to generate
- Review outputs, iterate on prompts

**Future (Teacher Product)**:
- Web UI with preview-before-generate
- Template library (start from "Letter A" quest)
- Asset marketplace (share between teachers)
- Incremental generation (add one image, not whole lesson)

---

## 🛠️ Current Tools (MVP)

### 1. image-gen (COMPLETE)
**File**: `tools/image-gen/batch-generate.js`

**Purpose**: Generate consistent cartoon illustrations via Fireworks AI

**Input**: `assets-manifest.json` with prompts
```json
{
  "images": {
    "characters": [{"id": "tutor-happy", "prompt": "..."}],
    "objects": [{"id": "apple", "prompt": "..."}],
    "letters": [{"id": "letter-a", "prompt": "..."}],
    "backgrounds": [{"id": "bg-classroom", "prompt": "..."}],
    "ui": [{"id": "button-primary", "prompt": "..."}]
  }
}
```

**Output**: Organized PNG files in `assets/images/{lesson}/{category}/`

**Usage**:
```bash
# Set up config
cp tools/config.json.template tools/config.json
# Add your Fireworks API key

# Generate all images for lesson
node tools/image-gen/batch-generate.js --lesson quest-001-letter-a

# Force regenerate (overwrite existing)
node tools/image-gen/batch-generate.js --lesson quest-001-letter-a --force
```

**Status**: ✅ Ready to use

---

### 2. audio-gen (COMPLETE)
**File**: `tools/audio-gen/batch-audio.js`

**Purpose**: Generate narration and feedback audio via TTS

**Input**: `assets-manifest.json` with text lines
```json
{
  "audio": {
    "narration": [{"id": "intro-01", "text": "Hi there!...", "emotion": "excited"}],
    "feedback": [{"id": "correct-01", "text": "That's right!"}]
  }
}
```

**Output**: MP3 files in `assets/audio/{lesson}/{category}/`

**Usage**:
```bash
# Add ElevenLabs API key to config.json
# Recommended voice: "Bella" or "Antoni" for tutoring

# Generate all audio
node tools/audio-gen/batch-audio.js --lesson quest-001-letter-a
```

**Status**: ✅ Ready (ElevenLabs provider)

**Audio Strategy**:
- **Primary**: ElevenLabs (warm, natural, worth the cost)
- **Alternative**: Amazon Polly (cheaper, robotic but acceptable)
- **Hybrid**: ElevenLabs for narration, Polly for feedback (cost optimization)

---

### 3. lesson-assembler (NEXT)
**File**: `tools/lesson-assembler/package.js` (TO BUILD)

**Purpose**: Compile all assets into deployable lesson package

**Input**: 
- Lesson JSON definition
- Image assets folder
- Audio assets folder
- Configuration

**Output**: `output/{lesson}/` with:
```
lesson-package/
├── manifest.json          # Lesson metadata
├── lesson.json           # Challenge definitions
├── images/               # All PNG assets
├── audio/                # All MP3 assets
└── index.html            # Preview/validation
```

**Features**:
- Validate all assets present (check against manifest)
- Generate lesson.json with challenge sequencing
- Create preview HTML (test lesson in browser)
- Package for Android app integration

**Usage**:
```bash
node tools/lesson-assembler/package.js --lesson quest-001-letter-a
```

**Status**: 🟡 Design complete, build next

---

### 4. test-builder (FUTURE)
**File**: `tools/test-builder/generate-challenges.js` (FUTURE)

**Purpose**: AI-assisted challenge/question generation

**Input**: Learning objectives ("Child should recognize letter A")

**Output**: Challenge definitions with:
- Question text
- Distractor generation (wrong answers)
- Difficulty calibration
- Hint generation

**Example**:
```bash
node tools/test-builder/generate.js \
  --objective "recognize uppercase A" \
  --type "tap" \
  --count 5
```

**Output**:
```json
{
  "challenges": [
    {
      "id": "c2-find-a-1",
      "type": "tap",
      "instruction": "Find the letter A",
      "correct": "letter-a-upper",
      "distractors": ["letter-b-upper", "letter-c-upper"],
      "hint": "Look for the letter with two pointy tops"
    }
  ]
}
```

**Status**: 🔵 Future — can hand-write for MVP

---

### 5. prompt-optimizer (FUTURE)
**File**: `tools/image-gen/prompt-optimizer.js` (FUTURE)

**Purpose**: Refine prompts based on generation results

**Input**: Generated images + human feedback (👍/👎)

**Output**: Optimized prompts for consistent style

**How it works**:
1. Generate batch with current prompts
2. You review, mark which images work
3. System analyzes patterns (what makes good "apple" vs bad)
4. Suggests prompt improvements
5. Iterates until style is locked

**Status**: 🔵 Future — manual iteration for MVP

---

### 6. style-locker (FUTURE)
**File**: `tools/image-gen/style-locker.js` (FUTURE)

**Purpose**: Maintain visual consistency across all lessons

**Problem**: Each lesson might look different if prompts vary

**Solution**: 
1. Define "master style" from approved images
2. All future prompts get style prefix automatically
3. Ensures year 1 and year 5 lessons look same

**Input**: Reference images that represent the style

**Output**: `style-template.txt` prepended to all prompts

**Status**: 🔵 Future — hardcoded style template for MVP

---

## 📋 Asset Generation Workflow

### Step 1: Define Lesson (You + Andy)
- Write lesson script (Quest structure)
- Identify needed assets (images, audio)
- Create `assets-manifest.json`

### Step 2: Configure Tools (One-time)
```bash
# Copy template
cp tools/config.json.template tools/config.json

# Edit with your API keys
nano tools/config.json

# Keys needed:
# - Fireworks AI (images)
# - ElevenLabs (audio) or Amazon Polly
```

### Step 3: Generate Images
```bash
node tools/image-gen/batch-generate.js --lesson quest-001-letter-a

# Review outputs in assets/images/quest-001-letter-a/
# Iterate on prompts if needed
# Re-run with --force to regenerate
```

### Step 4: Generate Audio
```bash
node tools/audio-gen/batch-audio.js --lesson quest-001-letter-a

# Review outputs in assets/audio/quest-001-letter-a/
# ElevenLabs web UI can regenerate individual lines
```

### Step 5: Assemble Lesson (NEXT)
```bash
node tools/lesson-assembler/package.js --lesson quest-001-letter-a

# Get output/quest-001-letter-a/ ready for app
```

### Step 6: Test (You)
- Load into Android app
- Test with pilot school kids
- Iterate based on feedback

---

## 💰 Cost Estimates (Per Lesson)

### Image Generation (Fireworks AI)
- 24 images per lesson
- ~$0.002 per image
- **Cost**: ~$0.05 per lesson

### Audio Generation (ElevenLabs)
- ~40 audio clips per lesson (narration + feedback)
- ~$0.10 per 1000 characters
- ~20000 characters total
- **Cost**: ~$2.00 per lesson

### Alternative Audio (Amazon Polly)
- Standard voices: ~$4 per million characters
- **Cost**: ~$0.08 per lesson
- Tradeoff: Robotic but much cheaper

### Total Per Lesson
- **High quality** (ElevenLabs): ~$2.05
- **Budget** (Polly): ~$0.13

**Recommendation**: Use ElevenLabs for MVP (only 10 lessons = $20), switch to Polly for scale.

---

## 🎨 Style Consistency System

### Current (MVP): Hardcoded Style Template

All image prompts get this suffix automatically:
```
2D cartoon illustration for children, friendly and warm, simple shapes, 
bold outlines, flat colors, no gradients, educational style, 
suitable for kindergarten, high contrast, cheerful, isolated on transparent background
```

### Future: Style Locker

Reference images → Style embedding → Automatic prompt enhancement

---

## 🚀 Tool Development Roadmap

### Week 1 (Now)
- ✅ image-gen: Batch generation working
- ✅ audio-gen: TTS integration working
- 🟡 lesson-assembler: Build next

### Week 2
- 🟡 lesson-assembler: Complete + test
- 🟡 test-builder: Basic challenge generation
- 🟡 preview-server: Browser-based lesson preview

### Week 3-4 (MVP Test)
- Use tools to generate all Quest 001 assets
- Iterate based on pilot feedback
- Refine prompts for consistent quality

### Month 2-3 (Scale)
- Generate remaining 9 quests (90 more lessons? No, 9 more quests)
- Actually 10 quests total, so 9 more
- Batch generate all assets
- Parallel generation (multiple lessons at once)

### Month 6+ (Teacher Product)
- Web UI wrapper around CLI tools
- Template library
- Asset marketplace
- Real-time preview

---

## 📝 Configuration Template

`tools/config.json`:
```json
{
  "image_api": {
    "provider": "fireworks",
    "api_key": "fw_...",
    "model": "stable-diffusion-xl-1024-v1-0"
  },
  "audio_api": {
    "provider": "elevenlabs",
    "api_key": "...",
    "voice_id": "XB0fDUnXU5powFXDhCwa"
  }
}
```

---

## 🎯 Immediate Next Steps

1. **You**: Set up `tools/config.json` with your API keys
2. **You**: Run `node tools/image-gen/batch-generate.js --lesson quest-001-letter-a`
3. **Review**: Check generated images in `assets/images/quest-001-letter-a/`
4. **Iterate**: Adjust prompts in manifest if needed, regenerate
5. **Audio**: Run audio generation
6. **Andy**: Build lesson-assembler while you review images

---

## 🔮 Future Teacher-Facing Features

### Web UI (Month 6+)

**Lesson Creator Flow**:
1. Teacher selects template ("Letter A Quest")
2. Modifies content (changes "apple" to "avocado" for different region)
3. Previews in browser (see before generating)
4. Clicks "Generate Assets" (runs batch tools behind scenes)
5. Downloads lesson package
6. Uploads to their classroom tablets

**Asset Marketplace**:
- Teachers share custom images
- "I made a great astronaut, use it in your lesson"
- Community-contributed prompts
- Verified high-quality assets

**Analytics Dashboard**:
- Which assets work best (child engagement data)
- Cost tracking per lesson
- Generation history

---

*Tools ready. First lesson manifest complete. Await your API keys to start generation.*
