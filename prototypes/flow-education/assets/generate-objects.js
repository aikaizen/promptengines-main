// Generate all object images via Fireworks Flux Dev
// Output: assets/images/objects/

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT_DIR = path.join(__dirname, 'images', 'objects')
fs.mkdirSync(OUT_DIR, { recursive: true })

const API_KEY = 'fw_W8JLCeyaA8HMsS9d2JzmcG'
const ENDPOINT = 'https://api.fireworks.ai/inference/v1/workflows/accounts/fireworks/models/flux-1-dev-fp8/text_to_image'

// Style prefix shared across all object images
const STYLE = 'Watercolor cartoon illustration, white background, no text, no shadows, simple clean shapes, child-friendly, kindergarten flashcard style, bold friendly outlines, soft bright colors, isolated single subject'

const IMAGES = [
  // --- Quest A targets ---
  { file: 'obj-apple.png',        prompt: `${STYLE}. A single round red apple with a small green leaf on top. Bright red, clean and simple, very recognizable.` },
  { file: 'obj-ant.png',          prompt: `${STYLE}. A small cartoon ant. Black body with red accents, three oval body segments, six legs, two antennae. Cute and friendly.` },
  { file: 'obj-astronaut.png',    prompt: `${STYLE}. A cartoon astronaut in a white spacesuit with a large round helmet. Friendly waving pose. Simple and clear.` },
  { file: 'obj-anchor.png',       prompt: `${STYLE}. A classic boat anchor shape. Navy blue, simple bold outline, horizontal crossbar, ring at top.` },
  { file: 'obj-acorn.png',        prompt: `${STYLE}. A cute round acorn with a striped cap on top. Warm brown tones, plump and simple.` },

  // --- Quest A distractors (reused in later quests) ---
  { file: 'obj-ball.png',         prompt: `${STYLE}. A round rubber ball. Red with a single blue stripe. Simple, bouncy-looking, perfectly round.` },
  { file: 'obj-cat.png',          prompt: `${STYLE}. A friendly orange tabby cat sitting upright. Big round eyes, small pink nose, simple clean face, sitting neatly.` },
  { file: 'obj-dog.png',          prompt: `${STYLE}. A friendly brown dog sitting. Large floppy ears, big happy eyes, tail curled up. Simple and cute.` },

  // --- Quest B new targets ---
  { file: 'obj-butterfly.png',    prompt: `${STYLE}. A colorful butterfly with open wings. Symmetrical wing pattern, bright blues and oranges, simple and clean.` },
  { file: 'obj-bear.png',         prompt: `${STYLE}. A cute brown bear sitting upright. Round ears, friendly face, simple round body, soft brown tones.` },
  { file: 'obj-boat.png',         prompt: `${STYLE}. A simple sailboat. Red hull, white triangular sail, a thin water line at the base. Clean simple shapes.` },
  { file: 'obj-banana.png',       prompt: `${STYLE}. A single yellow banana, gently curved, with a short brown stem at the top. Bright clean yellow.` },

  // --- Quest C new targets ---
  { file: 'obj-car.png',          prompt: `${STYLE}. A small friendly car in side view. Bright red, two visible round wheels, rounded simple shape.` },
  { file: 'obj-cookie.png',       prompt: `${STYLE}. A round chocolate chip cookie. Golden brown with a few dark chocolate chips on top. Appetizing and simple.` },
  { file: 'obj-cup.png',          prompt: `${STYLE}. A simple blue drinking mug with a handle. Clean smooth shape, bright cheerful blue.` },
  { file: 'obj-carrot.png',       prompt: `${STYLE}. An orange carrot with a green feathery leafy top. Simple and clean, bright orange.` },

  // --- Quest D new targets ---
  { file: 'obj-duck.png',         prompt: `${STYLE}. A bright yellow cartoon duck. Round fluffy body, small orange beak, friendly eyes. Cute and simple.` },
  { file: 'obj-dinosaur.png',     prompt: `${STYLE}. A friendly green cartoon dinosaur standing upright. Small arms, rounded body, big friendly eyes, happy expression.` },
  { file: 'obj-donut.png',        prompt: `${STYLE}. A pink frosted donut with colorful sprinkles. Round ring shape with hole in center. Cute and appetizing.` },
  { file: 'obj-door.png',         prompt: `${STYLE}. A simple wooden door. Brown planks, small brass round doorknob on the right side, clean clear shape.` },

  // --- Quest E new targets ---
  { file: 'obj-elephant.png',     prompt: `${STYLE}. A friendly grey elephant in side view. Big round floppy ears, short curled trunk, gentle expression.` },
  { file: 'obj-egg.png',          prompt: `${STYLE}. A simple white egg standing upright. Smooth oval shape. Use a very subtle grey outline to define it against white background.` },
  { file: 'obj-eagle.png',        prompt: `${STYLE}. A brown eagle with wings slightly spread. White head and tail feathers, bold but friendly expression.` },
  { file: 'obj-elbow.png',        prompt: `${STYLE}. A cartoon arm bent at the elbow with the elbow joint clearly visible and prominent. Simple clean lines, warm skin tone.` },
  { file: 'obj-engine.png',       prompt: `${STYLE}. A small red steam train engine in side view. Round boiler shape, small wheels, a small puff of steam at the top.` },

  // --- Quest 6 counting objects ---
  { file: 'obj-count-1.png',      prompt: `${STYLE}. Exactly ONE single red apple perfectly centered with lots of clear white space around it. Very obviously one item.` },
  { file: 'obj-count-2.png',      prompt: `${STYLE}. Exactly TWO red apples side by side. Clearly and obviously two items, evenly spaced, same apple style.` },
  { file: 'obj-count-3.png',      prompt: `${STYLE}. Exactly THREE red apples in a row. Clearly and obviously three items, evenly spaced, same apple style.` },
  { file: 'obj-hand-one.png',     prompt: `${STYLE}. A cartoon hand with one finger (index finger) pointing straight up, all other fingers curled in. Warm skin tone, friendly and clear.` },
  { file: 'obj-hand-two.png',     prompt: `${STYLE}. A cartoon hand showing two fingers in a peace or victory sign (V shape). Warm skin tone, friendly and clear.` },
]

async function generate(item) {
  const outPath = path.join(OUT_DIR, item.file)

  // Skip if already exists
  if (fs.existsSync(outPath)) {
    console.log(`  ↷ Skip (exists): ${item.file}`)
    return
  }

  console.log(`→ Generating: ${item.file}`)

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: item.prompt,
      width: 768,
      height: 768,
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

  console.log(`  ✓ Saved: ${item.file}`)
}

async function main() {
  console.log(`\nGenerating ${IMAGES.length} object images → ${OUT_DIR}\n`)

  for (const item of IMAGES) {
    try {
      await generate(item)
    } catch (err) {
      console.error(`  ✗ Failed ${item.file}:`, err.message)
    }
  }

  console.log('\nDone.')
}

main()
