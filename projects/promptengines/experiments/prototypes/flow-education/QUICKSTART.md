# Flow Education — Quick Start

*Get from zero to generated assets in 10 minutes*

---

## 🚀 Step-by-Step

### 1. Get API Keys (5 minutes)

**Fireworks AI** (Images):
1. Go to https://fireworks.ai
2. Sign up / log in
3. Create API key
4. Copy key (starts with `fw_`)

**ElevenLabs** (Audio - Recommended):
1. Go to https://elevenlabs.io
2. Sign up (free tier = 10k chars/month)
3. Go to Profile → API Keys
4. Copy key
5. Note Voice ID: `XB0fDUnXU5powFXDhCwa` (Bella - warm, friendly)

**Alternative: Amazon Polly** (Budget option):
- AWS account required
- Standard voices much cheaper
- Robotic but acceptable for MVP

---

### 2. Configure Tools (2 minutes)

```bash
cd projects/promptengines/experiments/flow-education/tools

# Copy template
cp config.json.template config.json

# Edit with your keys
nano config.json
```

Replace:
```json
{
  "image_api": {
    "provider": "fireworks",
    "api_key": "fw_YOUR_FIREWORKS_KEY_HERE",
    "model": "stable-diffusion-xl-1024-v1-0"
  },
  "audio_api": {
    "provider": "elevenlabs",
    "api_key": "YOUR_ELEVENLABS_KEY_HERE",
    "voice_id": "XB0fDUnXU5powFXDhCwa"
  }
}
```

---

### 3. Generate Images (3 minutes + API time)

```bash
# Generate all 24 images for Quest 001
node tools/image-gen/batch-generate.js --lesson quest-001-letter-a
```

**What happens**:
- Creates `assets/images/quest-001-letter-a/` with subfolders
- Generates each image (1-2 seconds per image)
- Shows progress in terminal
- Saves generation report

**Output**:
```
assets/images/quest-001-letter-a/
├── characters/
│   ├── tutor-neutral.png
│   ├── tutor-happy.png
│   └── ...
├── objects/
│   ├── apple.png
│   ├── ant.png
│   └── ...
├── letters/
│   ├── letter-a-upper.png
│   └── ...
├── backgrounds/
│   ├── bg-classroom.png
│   └── ...
├── ui/
│   ├── button-primary.png
│   └── ...
└── generation-report.json
```

**Review**:
- Open images, check quality
- If any look wrong, edit prompt in `lessons/quest-001-letter-a/assets-manifest.json`
- Re-run with `--force` to regenerate

---

### 4. Generate Audio (5 minutes + API time)

```bash
# Generate all 38 audio clips
node tools/audio-gen/batch-audio.js --lesson quest-001-letter-a
```

**What happens**:
- Creates `assets/audio/quest-001-letter-a/` with subfolders
- Generates narration (28 clips)
- Generates feedback (10 clips)
- Saves audio report

**Output**:
```
assets/audio/quest-001-letter-a/
├── narration/
│   ├── intro-01.mp3
│   ├── intro-02.mp3
│   └── ...
├── feedback/
│   ├── correct-01.mp3
│   └── ...
└── audio-report.json
```

**Review**:
- Play MP3s, check pronunciation
- ElevenLabs web UI can regenerate individual lines if needed

---

### 5. You Now Have (10 minutes elapsed)

✅ 24 images (characters, objects, letters, backgrounds, UI)  
✅ 38 audio clips (narration, feedback)  
✅ Organized in lesson-ready structure  
✅ Generation reports for tracking  

**Total cost**: ~$2.05 (ElevenLabs) or ~$0.13 (Polly)

---

## 🛠️ Common Tasks

### Regenerate specific images

Edit `assets-manifest.json`, then:
```bash
node tools/image-gen/batch-generate.js --lesson quest-001-letter-a --force
```

### Preview all images

```bash
# Mac
open assets/images/quest-001-letter-a/*

# Linux
xdg-open assets/images/quest-001-letter-a/
```

### Check manifest

```bash
# See what's defined
cat lessons/quest-001-letter-a/assets-manifest.json | jq '.assets.images | keys'
```

---

## 📝 Create Your Next Lesson

1. **Copy template**:
```bash
cp -r lessons/quest-001-letter-a lessons/quest-002-letter-b
```

2. **Edit manifest**: Replace all "A" with "B", update prompts (ball, bat, bear, etc.)

3. **Generate**:
```bash
node tools/image-gen/batch-generate.js --lesson quest-002-letter-b
node tools/audio-gen/batch-audio.js --lesson quest-002-letter-b
```

---

## 🎯 Next (Andy Building)

While you generate assets, I'm building:

**lesson-assembler** — Packages everything into deployable lesson:
```bash
# Coming soon
node tools/lesson-assembler/package.js --lesson quest-001-letter-a
# Output: output/quest-001-letter-a/ ready for Android app
```

---

## 🆘 Troubleshooting

### "Error loading config"
- Make sure `config.json` exists (not just template)
- Check JSON syntax (no trailing commas)

### API errors
- Check API key is valid
- Check you have credits (ElevenLabs free tier = 10k chars)
- Rate limiting: Add delay between requests (already in code)

### Images look wrong
- Edit prompt in manifest
- Add more specific details
- Re-run with `--force`

---

## 📊 Cost Tracking

| Lesson | Images Cost | Audio Cost | Total |
|--------|-------------|------------|-------|
| Quest 001 | ~$0.05 | ~$2.00 | ~$2.05 |
| Quest 002-010 (9 more) | ~$0.45 | ~$18.00 | ~$18.45 |
| **All 10 Quests** | ~$0.50 | ~$20.00 | **~$20.50** |

**Budget option** (Amazon Polly audio): ~$1.30 total for all 10 quests

---

## ✅ Checklist

- [ ] Fireworks API key obtained
- [ ] ElevenLabs API key obtained
- [ ] `tools/config.json` created with keys
- [ ] Images generated for Quest 001
- [ ] Audio generated for Quest 001
- [ ] Reviewed all assets
- [ ] Ready for lesson-assembler (coming)

---

**Start with Step 1: Get API keys. Ready when you are.**
