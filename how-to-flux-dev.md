# How to Run Flux Dev (Fireworks API)

Model: `accounts/fireworks/models/flux-1-dev-fp8`
Endpoint type: **synchronous** — one request, one response, no polling.

---

## Single Image

```typescript
const response = await fetch(
  'https://api.fireworks.ai/inference/v1/workflows/accounts/fireworks/models/flux-1-dev-fp8/text_to_image',
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.FIREWORKS_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: 'A cute cartoon fox wearing a red cape, children\'s storybook illustration',
      width: 1024,
      height: 1024,
    }),
  }
);

const data = await response.json();
// data.base64 is an array — take the first element
const imageDataUrl = `data:image/png;base64,${data.base64[0]}`;
```

**Response shape:**
```json
{
  "base64": ["<base64string>"],
  "finishReason": "SUCCESS"
}
```

---

## Batch — Sequential

Simple loop. Fireworks has no native batch endpoint so fire requests one after another.

```typescript
const prompts = [
  'A brave lion cub on a mountain',
  'A tiny dragon reading a book',
  'A penguin astronaut floating in space',
];

const results: string[] = [];

for (const prompt of prompts) {
  const res = await fetch(
    'https://api.fireworks.ai/inference/v1/workflows/accounts/fireworks/models/flux-1-dev-fp8/text_to_image',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.FIREWORKS_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, width: 1024, height: 1024 }),
    }
  );
  const data = await res.json();
  results.push(`data:image/png;base64,${data.base64[0]}`);
}
```

---

## Batch — Parallel (faster, mind rate limits)

```typescript
const prompts = ['prompt 1', 'prompt 2', 'prompt 3'];

const generate = (prompt: string) =>
  fetch(
    'https://api.fireworks.ai/inference/v1/workflows/accounts/fireworks/models/flux-1-dev-fp8/text_to_image',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.FIREWORKS_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, width: 1024, height: 1024 }),
    }
  ).then(r => r.json()).then(d => `data:image/png;base64,${d.base64[0]}`);

const results = await Promise.all(prompts.map(generate));
```

Fireworks allows ~10 concurrent requests on standard tier. For larger batches, chunk with `Promise.all` in groups of 5–10.

---

## Parameters

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| `prompt` | string | required | Describe what you want |
| `width` | number | 1024 | Must be divisible by 8 |
| `height` | number | 1024 | Must be divisible by 8 |
| `negative_prompt` | string | — | What to avoid |
| `num_inference_steps` | number | 28 | Higher = more detail, slower |
| `guidance_scale` | number | 3.5 | Prompt adherence (1–20) |
| `seed` | number | random | Set for reproducibility |

Typical aspect ratios: `1024×1024` (square), `768×1024` (portrait), `1024×768` (landscape).

---

## Error Handling

```typescript
const res = await fetch(url, options);

if (!res.ok) {
  const err = await res.text();
  throw new Error(`Fireworks error ${res.status}: ${err}`);
}

const data = await res.json();

if (data.finishReason !== 'SUCCESS' || !data.base64?.[0]) {
  throw new Error('No image in response');
}
```

Common status codes:
- `429` — rate limited, back off and retry
- `400` — bad prompt or unsupported dimensions
- `500` — Fireworks internal error, retry once

---

## In This Codebase

The server-side route is in `api/generate.ts` — look for the `accounts/fireworks/` branch. It handles the synchronous path for `flux-1-dev-fp8` and the async polling path for `flux-kontext-pro`.

On the client, all generation goes through `services/geminiService.ts → /api/generate`. Non-Gemini models are detected by `isGeminiModel` check and always routed to the proxy (never the Gemini SDK directly).

Model registry and credit costs live in `types.ts` → `CHAR_MODELS`.
