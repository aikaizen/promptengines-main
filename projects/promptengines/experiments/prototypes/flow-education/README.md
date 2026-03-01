# Flow Education — Asset Generation System

*Tools for creating lesson assets at scale*  
*Target Users: MVP pilot (you), future teachers*  
*API: Fireworks AI for images, TBD for audio*

---

## 📁 Folder Structure

```
experiments/flow-education/
├── lessons/                  # Lesson definitions (JSON/YAML)
│   └── quest-001-letter-a.json
├── assets/                   # Generated assets (organized by type)
│   ├── images/              # PNG/SVG illustrations
│   │   ├── characters/      # Tutor avatars, mascots
│   │   ├── objects/         # Apple, ant, astronaut, etc.
│   │   ├── letters/         # Letter illustrations (A-Z, 0-9)
│   │   ├── backgrounds/     # Scene backgrounds
│   │   └── ui/              # Buttons, icons, frames
│   ├── audio/               # MP3/OGG audio files
│   │   ├── narration/       # Tutor voice lines
│   │   ├── feedback/        # Correct/incorrect sounds
│   │   ├── music/           # Background tracks, jingles
│   │   └── sfx/             # Tap, swipe, transition sounds
│   ├── fonts/               # Typography assets
│   └── ui/                  # UI components (buttons, cards)
├── tools/                    # Asset generation scripts
│   ├── image-gen/           # Batch image generation
│   ├── audio-gen/           # Audio/TTS generation
│   ├── test-builder/        # Assessment creation
│   └── lesson-assembler/    # Compile lessons from assets
├── docs/                     # Documentation
└── output/                   # Compiled lesson packages
    └── quest-001-letter-a/
        ├── manifest.json
        ├── images/
        ├── audio/
        └── lesson.json
```

---

## 🎯 Asset Types Per Lesson

Each quest/lesson needs:

| Asset Type | Count | Tool | Example |
|------------|-------|------|---------|
| **Character images** | 5-10 | image-gen | Tutor avatar expressions |
| **Object illustrations** | 10-20 | image-gen | Apple, ant, anchor, etc. |
| **Letter illustrations** | 2-4 | image-gen | Uppercase A, stylized A |
| **Backgrounds** | 2-3 | image-gen | Classroom, space, nature |
| **Narration audio** | 20-30 | audio-gen | "A is for apple!" |
| **Feedback audio** | 10-15 | audio-gen | "Correct!", "Try again!" |
| **Sound effects** | 5-10 | audio-gen | Tap, success, transition |
| **UI elements** | 10-20 | image-gen/ui | Buttons, progress bars, frames |

**Per lesson total**: ~75-120 assets

---

## 🛠️ Tools Overview

### 1. image-gen (Batch Image Generator)
**Purpose**: Generate consistent cartoon illustrations  
**Input**: JSON batch file with prompts  
**Output**: PNG images in organized folders  
**API**: Fireworks AI (or Stability, DALL-E, etc.)

### 2. audio-gen (Audio Generator)
**Purpose**: Generate narration and sound effects  
**Input**: JSON batch file with text/lines  
**Output**: MP3/OGG audio files  
**API**: Amazon Polly, Google TTS, or ElevenLabs

### 3. test-builder (Assessment Creator)
**Purpose**: Generate challenge questions, quizzes  
**Input**: Learning objectives  
**Output**: JSON test definitions with distractors  
**API**: OpenAI GPT-4 for question generation

### 4. lesson-assembler (Lesson Compiler)
**Purpose**: Combine all assets into deployable lesson package  
**Input**: Lesson definition + asset folders  
**Output**: Zipped lesson package with manifest  
**API**: None (local processing)

---

## 📝 Workflow

### For MVP Pilot (You)

1. **Define lesson** in `lessons/quest-XXX.json`
2. **Generate images**: Run `tools/image-gen/batch-generate.js` with lesson manifest
3. **Generate audio**: Run `tools/audio-gen/batch-generate.js` with script
4. **Build tests**: Run `tools/test-builder/generate-challenges.js`
5. **Assemble**: Run `tools/lesson-assembler/package.js`
6. **Output**: Get `output/quest-XXX/` ready for app integration

### For Future Teachers

Same workflow, but with:
- Web UI instead of CLI
- Template library (start from "Letter A" template, modify)
- Preview mode (see lesson before generating all assets)
- Asset marketplace (share/reuse assets between teachers)

---

## 🎨 Style Guide

All assets must follow consistent style:

### Visual Style
- **Type**: 2D cartoon illustration
- **Palette**: Warm, inviting, high contrast
- **Characters**: Friendly, gender-neutral, diverse
- **Backgrounds**: Simple, not distracting
- **Format**: PNG with transparency (for characters/objects), JPG (for backgrounds)
- **Resolution**: 1024x1024 for flexibility, app scales down

### Audio Style
- **Voice**: Warm, encouraging, clear pronunciation
- **Pace**: Slightly slower than normal conversation
- **Music**: Upbeat but not distracting, instrumental
- **SFX**: Pleasant, non-jarring
- **Format**: MP3 128kbps or OGG Vorbis

---

## 🔧 Configuration

Create `tools/config.json`:

```json
{
  "image_api": {
    "provider": "fireworks",
    "api_key": "YOUR_FIREWORKS_KEY",
    "model": "stable-diffusion-xl-1024-v1-0",
    "default_params": {
      "width": 1024,
      "height": 1024,
      "steps": 30,
      "cfg_scale": 7.5
    }
  },
  "audio_api": {
    "provider": "elevenlabs",
    "api_key": "YOUR_ELEVENLABS_KEY",
    "voice_id": "XB0fDUnXU5powFXDhCwa"
  },
  "output_quality": "high",
  "batch_size": 5
}
```

---

## 📊 Asset Inventory Template

Each lesson should have `assets-manifest.json`:

```json
{
  "lesson_id": "quest-001-letter-a",
  "lesson_title": "Meet the Letter A",
  "assets": {
    "images": {
      "characters": [
        {"id": "tutor-happy", "prompt": "Friendly cartoon tutor character, happy expression, waving, transparent background..."},
        {"id": "tutor-thinking", "prompt": "Tutor character with thinking expression, hand on chin..."}
      ],
      "objects": [
        {"id": "apple", "prompt": "Cartoon red apple, friendly face, simple style, transparent background..."},
        {"id": "ant", "prompt": "Cute cartoon ant, friendly expression, simple style, transparent background..."}
      ],
      "letters": [
        {"id": "letter-a-upper", "prompt": "Cartoon uppercase letter A, orange color, playful style, transparent background..."}
      ]
    },
    "audio": {
      "narration": [
        {"id": "intro-01", "text": "Hi there! I'm excited to learn with you today!"},
        {"id": "intro-02", "text": "Today we're going to meet the letter A!"}
      ]
    }
  }
}
```

---

## 🚀 Next Steps

1. Set up API keys in `tools/config.json`
2. Review first lesson manifest (Quest 001: Letter A)
3. Run image generation batch
4. Review outputs, adjust prompts
5. Run audio generation
6. Assemble first lesson package

---

*Ready to generate assets. Start with Quest 001: Letter A.*
