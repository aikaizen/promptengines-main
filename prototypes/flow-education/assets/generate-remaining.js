// Generate all remaining assets: hand redo, letters, numbers, backgrounds, UI
// Output: assets/images/{letters,numbers,backgrounds,ui}/

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const API_KEY = 'fw_W8JLCeyaA8HMsS9d2JzmcG'
const ENDPOINT = 'https://api.fireworks.ai/inference/v1/workflows/accounts/fireworks/models/flux-1-dev-fp8/text_to_image'

const OBJ_STYLE = 'Watercolor cartoon illustration, white background, no text, no shadows, simple clean shapes, child-friendly, kindergarten flashcard style, bold friendly outlines, soft bright colors, isolated single subject'

const IMAGES = [
  // --- Hand redo ---
  {
    dir: 'objects',
    file: 'obj-hand-one.png',
    force: true,
    w: 768, h: 768,
    prompt: `${OBJ_STYLE}. A cartoon hand showing exactly ONE finger — only the index finger pointing straight up, the thumb and all other three fingers curled tightly into a closed fist. Very clearly only one finger visible. Simple clean lines, warm skin tone, friendly.`,
  },

  // ─── LETTERS ─────────────────────────────────────────────────────────────
  // Display letters — uppercase
  {
    dir: 'letters',
    file: 'letter-A-upper.png',
    w: 768, h: 768,
    prompt: `A single large bold uppercase letter A, bright orange color, thick rounded friendly strokes, very clear and legible, centered on plain white background, no other text or decoration, nothing else in the image, just the letter A, kindergarten learning card style`,
  },
  {
    dir: 'letters',
    file: 'letter-B-upper.png',
    w: 768, h: 768,
    prompt: `A single large bold uppercase letter B, bright blue color, thick rounded friendly strokes, very clear and legible, centered on plain white background, no other text or decoration, nothing else in the image, just the letter B, kindergarten learning card style`,
  },
  {
    dir: 'letters',
    file: 'letter-C-upper.png',
    w: 768, h: 768,
    prompt: `A single large bold uppercase letter C, bright green color, thick rounded friendly strokes, very clear and legible, centered on plain white background, no other text or decoration, nothing else in the image, just the letter C, kindergarten learning card style`,
  },
  {
    dir: 'letters',
    file: 'letter-D-upper.png',
    w: 768, h: 768,
    prompt: `A single large bold uppercase letter D, bright purple color, thick rounded friendly strokes, very clear and legible, centered on plain white background, no other text or decoration, nothing else in the image, just the letter D, kindergarten learning card style`,
  },
  {
    dir: 'letters',
    file: 'letter-E-upper.png',
    w: 768, h: 768,
    prompt: `A single large bold uppercase letter E, bright red color, thick rounded friendly strokes, very clear and legible, centered on plain white background, no other text or decoration, nothing else in the image, just the letter E, kindergarten learning card style`,
  },
  // Display letters — lowercase
  {
    dir: 'letters',
    file: 'letter-a-lower.png',
    w: 768, h: 768,
    prompt: `A single large bold lowercase letter a, bright orange color, thick rounded friendly strokes, very clear and legible, centered on plain white background, no other text or decoration, nothing else in the image, just the lowercase letter a, kindergarten learning card style`,
  },
  {
    dir: 'letters',
    file: 'letter-b-lower.png',
    w: 768, h: 768,
    prompt: `A single large bold lowercase letter b, bright blue color, thick rounded friendly strokes, very clear and legible, centered on plain white background, no other text or decoration, nothing else in the image, just the lowercase letter b, kindergarten learning card style`,
  },
  {
    dir: 'letters',
    file: 'letter-c-lower.png',
    w: 768, h: 768,
    prompt: `A single large bold lowercase letter c, bright green color, thick rounded friendly strokes, very clear and legible, centered on plain white background, no other text or decoration, nothing else in the image, just the lowercase letter c, kindergarten learning card style`,
  },
  {
    dir: 'letters',
    file: 'letter-d-lower.png',
    w: 768, h: 768,
    prompt: `A single large bold lowercase letter d, bright purple color, thick rounded friendly strokes, very clear and legible, centered on plain white background, no other text or decoration, nothing else in the image, just the lowercase letter d, kindergarten learning card style`,
  },
  {
    dir: 'letters',
    file: 'letter-e-lower.png',
    w: 768, h: 768,
    prompt: `A single large bold lowercase letter e, bright red color, thick rounded friendly strokes, very clear and legible, centered on plain white background, no other text or decoration, nothing else in the image, just the lowercase letter e, kindergarten learning card style`,
  },
  // Letter badges
  {
    dir: 'letters',
    file: 'badge-letter-a.png',
    w: 768, h: 768,
    prompt: `A round medal badge for a children's educational app. The letter A is large and prominent in the center, orange and gold color scheme, simple gold star sparkles around the edges, a small ribbon at the bottom, white background, celebratory and cheerful, child-friendly, no other text`,
  },
  {
    dir: 'letters',
    file: 'badge-letter-b.png',
    w: 768, h: 768,
    prompt: `A round medal badge for a children's educational app. The letter B is large and prominent in the center, blue and gold color scheme, simple gold star sparkles around the edges, a small ribbon at the bottom, white background, celebratory and cheerful, child-friendly, no other text`,
  },
  {
    dir: 'letters',
    file: 'badge-letter-c.png',
    w: 768, h: 768,
    prompt: `A round medal badge for a children's educational app. The letter C is large and prominent in the center, green and gold color scheme, simple gold star sparkles around the edges, a small ribbon at the bottom, white background, celebratory and cheerful, child-friendly, no other text`,
  },
  {
    dir: 'letters',
    file: 'badge-letter-d.png',
    w: 768, h: 768,
    prompt: `A round medal badge for a children's educational app. The letter D is large and prominent in the center, purple and gold color scheme, simple gold star sparkles around the edges, a small ribbon at the bottom, white background, celebratory and cheerful, child-friendly, no other text`,
  },
  {
    dir: 'letters',
    file: 'badge-letter-e.png',
    w: 768, h: 768,
    prompt: `A round medal badge for a children's educational app. The letter E is large and prominent in the center, red and gold color scheme, simple gold star sparkles around the edges, a small ribbon at the bottom, white background, celebratory and cheerful, child-friendly, no other text`,
  },

  // ─── NUMBERS ─────────────────────────────────────────────────────────────
  {
    dir: 'numbers',
    file: 'number-1-display.png',
    w: 768, h: 768,
    prompt: `A single large bold numeral 1, bright orange color, thick rounded friendly stroke, very clear and legible, centered on plain white background, no other text or decoration, nothing else in the image, just the number 1, kindergarten learning card style`,
  },
  {
    dir: 'numbers',
    file: 'number-2-display.png',
    w: 768, h: 768,
    prompt: `A single large bold numeral 2, steel blue color, thick rounded friendly stroke, very clear and legible, centered on plain white background, no other text or decoration, nothing else in the image, just the number 2, kindergarten learning card style`,
  },
  {
    dir: 'numbers',
    file: 'number-3-display.png',
    w: 768, h: 768,
    prompt: `A single large bold numeral 3, steel blue color, thick rounded friendly stroke, very clear and legible, centered on plain white background, no other text or decoration, nothing else in the image, just the number 3, kindergarten learning card style`,
  },
  {
    dir: 'numbers',
    file: 'badge-number-1.png',
    w: 768, h: 768,
    prompt: `A round medal badge for a children's educational app. The numeral 1 is large and prominent in the center, gold and orange color scheme, simple gold star sparkles around the edges, a small ribbon at the bottom, white background, celebratory and cheerful, child-friendly, no other text`,
  },

  // ─── BACKGROUNDS ─────────────────────────────────────────────────────────
  {
    dir: 'backgrounds',
    file: 'bg-classroom.png',
    w: 1024, h: 768,
    prompt: `Watercolor illustration of a bright cheerful kindergarten classroom interior. Colorful alphabet strip on the back wall, small wooden desks, sunny windows with warm light streaming in. Soft pastel colors, open lighter center area. Child-friendly, no text on walls, wide landscape format`,
  },
  {
    dir: 'backgrounds',
    file: 'bg-space.png',
    w: 1024, h: 768,
    prompt: `Watercolor illustration of a friendly outer space scene. Deep blue sky with scattered white stars, two or three small colorful planets, a tiny cute rocket in one corner. NOT dark or scary, soft and dreamlike, open bright center area. Child-friendly, wide landscape format`,
  },
  {
    dir: 'backgrounds',
    file: 'bg-nature-outdoors.png',
    w: 1024, h: 768,
    prompt: `Watercolor illustration of a sunny outdoor nature scene. Green grass at the bottom, simple flowers, a leafy tree off to one side, blue sky with fluffy white clouds. Bright and cheerful, open center area. Child-friendly, wide landscape format`,
  },
  {
    dir: 'backgrounds',
    file: 'bg-flower-garden.png',
    w: 1024, h: 768,
    prompt: `Watercolor illustration of a colorful flower garden. Rows of simple bright flowers in pink yellow and purple, green stems, warm sunny light, butterflies suggested softly in background. Open center space. Child-friendly, wide landscape format`,
  },
  {
    dir: 'backgrounds',
    file: 'bg-forest.png',
    w: 1024, h: 768,
    prompt: `Watercolor illustration of a soft friendly forest scene. Large rounded trees with full green canopies, warm dappled sunlight on the ground, NOT dark or scary, bright and open. Open center space. Child-friendly, wide landscape format`,
  },
  {
    dir: 'backgrounds',
    file: 'bg-kitchen.png',
    w: 1024, h: 768,
    prompt: `Watercolor illustration of a cozy bright kitchen interior. Simple white countertop, cheerful yellow cabinets, a window with sunlight. Warm friendly tones, open center space. Child-friendly, no text, wide landscape format`,
  },
  {
    dir: 'backgrounds',
    file: 'bg-farm.png',
    w: 1024, h: 768,
    prompt: `Watercolor illustration of a sunny farm scene. Red barn in the background, simple wooden fence in the middle ground, green grass, blue sky with white clouds. Bright and cheerful, open center area. Child-friendly, wide landscape format`,
  },
  {
    dir: 'backgrounds',
    file: 'bg-prehistoric.png',
    w: 1024, h: 768,
    prompt: `Watercolor illustration of a friendly prehistoric scene. Large tropical fern leaves framing the sides, warm golden-orange sky, small volcano in background. NOT scary, bright and cheerful, open center. Child-friendly, wide landscape format`,
  },
  {
    dir: 'backgrounds',
    file: 'bg-savanna.png',
    w: 1024, h: 768,
    prompt: `Watercolor illustration of a warm African savanna. Golden grass at the bottom, a single acacia tree silhouette to one side, warm sunset sky in yellow and orange. Open center space, soft and peaceful. Child-friendly, wide landscape format`,
  },
  {
    dir: 'backgrounds',
    file: 'bg-counting-garden.png',
    w: 1024, h: 768,
    prompt: `Watercolor illustration of a bright sunny garden with lots of open flat space. Cheerful flower border along the edges, large open green center area for placing counting items, blue sky. Clean and uncluttered. Child-friendly, wide landscape format`,
  },

  // ─── UI ELEMENTS ─────────────────────────────────────────────────────────
  {
    dir: 'ui',
    file: 'ui-star-empty.png',
    w: 512, h: 512,
    prompt: `A simple five-pointed star outline, light grey color, clean and clear, plain white background, no text, nothing else, just a star outline. Simple icon style`,
  },
  {
    dir: 'ui',
    file: 'ui-star-gold.png',
    w: 512, h: 512,
    prompt: `A shiny gold five-pointed star, bright yellow-gold with a soft warm glow around it, clean simple shape, plain white background, no text, nothing else. Celebratory icon style`,
  },
  {
    dir: 'ui',
    file: 'ui-checkmark.png',
    w: 512, h: 512,
    prompt: `A bold bright green checkmark, thick friendly rounded strokes, clean simple shape, plain white background, no text, nothing else. Simple icon style`,
  },
  {
    dir: 'ui',
    file: 'ui-lock.png',
    w: 512, h: 512,
    prompt: `A simple closed padlock icon, grey with a small gold clasp at the top, friendly rounded shape, plain white background, no text, nothing else. Simple icon style`,
  },
  {
    dir: 'ui',
    file: 'ui-confetti.png',
    w: 512, h: 512,
    prompt: `A burst of colorful confetti pieces, scattered in pink blue yellow and green, joyful and celebratory, white background, no text, simple illustration style`,
  },
  {
    dir: 'ui',
    file: 'ui-hint-bulb.png',
    w: 512, h: 512,
    prompt: `A glowing yellow light bulb, soft warm glow radiating around it, simple clean cartoon shape, plain white background, no text, nothing else. Friendly icon style`,
  },
  {
    dir: 'ui',
    file: 'ui-progress-empty.png',
    w: 512, h: 512,
    prompt: `A single small simple circle outline, light grey, clean, centered on plain white background. Nothing else.`,
  },
  {
    dir: 'ui',
    file: 'ui-progress-filled.png',
    w: 512, h: 512,
    prompt: `A single small filled circle, warm orange color, soft slight glow, centered on plain white background. Nothing else.`,
  },
]

async function generate(item) {
  const outDir = path.join(__dirname, 'images', item.dir)
  fs.mkdirSync(outDir, { recursive: true })
  const outPath = path.join(outDir, item.file)

  if (!item.force && fs.existsSync(outPath)) {
    console.log(`  ↷ Skip: ${item.dir}/${item.file}`)
    return
  }

  console.log(`→ ${item.dir}/${item.file}`)

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: item.prompt,
      width: item.w,
      height: item.h,
      num_inference_steps: 28,
      guidance_scale: 3.5,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Fireworks ${res.status}: ${err}`)
  }

  const contentType = res.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    const data = await res.json()
    if (data.finishReason !== 'SUCCESS' || !data.base64?.[0]) {
      throw new Error(`Bad response: ${JSON.stringify(data)}`)
    }
    fs.writeFileSync(outPath, Buffer.from(data.base64[0], 'base64'))
  } else {
    fs.writeFileSync(outPath, Buffer.from(await res.arrayBuffer()))
  }

  console.log(`  ✓ ${item.file}`)
}

async function main() {
  console.log(`\nGenerating ${IMAGES.length} images...\n`)
  for (const item of IMAGES) {
    try {
      await generate(item)
    } catch (err) {
      console.error(`  ✗ ${item.file}: ${err.message}`)
    }
  }
  console.log('\nAll done.')
}

main()
