// Generate 5 tutor character images via Fireworks Flux Dev
// Output: assets/images/characters/

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT_DIR = path.join(__dirname, 'images', 'characters')

const API_KEY = 'fw_W8JLCeyaA8HMsS9d2JzmcG'
const ENDPOINT = 'https://api.fireworks.ai/inference/v1/workflows/accounts/fireworks/models/flux-1-dev-fp8/text_to_image'

// Character base — repeated key traits for consistency across all 5 images
const CHARACTER = 'kind woman teacher, warm brown skin, long hair, small gold hoop earrings'

const IMAGES = [
  {
    file: 'char-tutor-neutral.png',
    label: 'neutral',
    prompt: `Watercolor cartoon portrait avatar of a ${CHARACTER}. Warm brown skin, long hair, small gold earrings. Calm gentle smile, relaxed soft expression, large friendly eyes. Bust-length portrait, face and shoulders centered. White background, no text, soft pastel watercolor style, child-friendly kindergarten illustration. Woman with brown skin, long hair, and gold earrings.`,
  },
  {
    file: 'char-tutor-happy.png',
    label: 'happy',
    prompt: `Watercolor cartoon portrait avatar of a ${CHARACTER}. Warm brown skin, long hair, small gold earrings. Huge beaming grin, eyes bright and crinkled with joy, radiant happy expression. Bust-length portrait, face and shoulders centered. White background, no text, soft pastel watercolor style, child-friendly kindergarten illustration. Woman with brown skin, long hair, and gold earrings, celebrating.`,
  },
  {
    file: 'char-tutor-thinking.png',
    label: 'thinking',
    prompt: `Watercolor cartoon portrait avatar of a ${CHARACTER}. Warm brown skin, long hair, small gold earrings. One finger raised to chin in thinking pose, curious tilted head, thoughtful gentle expression. Bust-length portrait, face and shoulders centered. White background, no text, soft pastel watercolor style, child-friendly kindergarten illustration. Woman with brown skin, long hair, and gold earrings, thinking curiously.`,
  },
  {
    file: 'char-tutor-encouraging.png',
    label: 'encouraging',
    prompt: `Watercolor cartoon portrait avatar of a ${CHARACTER}. Warm brown skin, long hair, small gold earrings. Warm reassuring smile, one hand giving a thumbs up, kind gentle encouraging expression. Bust-length portrait, face and shoulders centered. White background, no text, soft pastel watercolor style, child-friendly kindergarten illustration. Woman with brown skin, long hair, and gold earrings, encouraging thumbs up.`,
  },
  {
    file: 'char-tutor-waving.png',
    label: 'waving',
    prompt: `Watercolor cartoon portrait avatar of a ${CHARACTER}. Warm brown skin, long hair, small gold earrings. Waving one hand goodbye, big warm friendly smile, cheerful farewell expression. Bust-length portrait, face and shoulders centered. White background, no text, soft pastel watercolor style, child-friendly kindergarten illustration. Woman with brown skin, long hair, and gold earrings, waving goodbye.`,
  },
]

async function generate(item) {
  console.log(`→ Generating: ${item.label}...`)

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
  const outPath = path.join(OUT_DIR, item.file)

  if (contentType.includes('application/json')) {
    // JSON response with base64
    const data = await res.json()
    if (data.finishReason !== 'SUCCESS' || !data.base64?.[0]) {
      throw new Error(`Bad response for ${item.label}: ${JSON.stringify(data)}`)
    }
    fs.writeFileSync(outPath, Buffer.from(data.base64[0], 'base64'))
  } else {
    // Raw binary image response
    const buffer = Buffer.from(await res.arrayBuffer())
    fs.writeFileSync(outPath, buffer)
  }

  console.log(`  ✓ Saved: ${item.file}`)
  return outPath
}

async function main() {
  console.log(`\nGenerating 5 tutor character images → ${OUT_DIR}\n`)

  // Sequential to avoid rate limits
  for (const item of IMAGES) {
    try {
      await generate(item)
    } catch (err) {
      console.error(`  ✗ Failed ${item.label}:`, err.message)
    }
  }

  console.log('\nDone.')
}

main()
