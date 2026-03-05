# Model Configuration for OpenClaw

## Current Model Distribution (Per moritzkremb Hardening)

| Priority | Model | Provider | Use Case |
|----------|-------|----------|----------|
| **Primary** | `anthropic/claude-sonnet-4-6` | Anthropic | Default reasoning, complex tasks |
| **Fallback 1** | `fireworks/accounts/fireworks/models/kimi-k2p5` | Fireworks | Cost-efficient, high throughput |
| **Fallback 2** | `openrouter/auto` | OpenRouter | Provider redundancy |
| **Fallback 3** | `kilo/gateway-models` | Gateway | Local/offline fallback |

## Recommended Default Stack

```yaml
# agents.defaults.model configuration
primary: anthropic/claude-sonnet-4-6
fallbacks:
  - fireworks/accounts/fireworks/models/kimi-k2p5
  - openrouter/auto
  - kilo/gateway-models

# Aliases for convenience
models:
  opus:
    alias: anthropic/claude-opus-4-6
  sonnet:
    alias: anthropic/claude-sonnet-4-6
  kimi:
    alias: fireworks/accounts/fireworks/models/kimi-k2p5
```

**Principle:** Optimize for reliability first, then cost.

## Fireworks Models for Coding

Based on Fireworks.ai Model Library (March 2026):

### 🏆 Recommended for React/JavaScript Development

**`fireworks/accounts/fireworks/models/qwen3-coder-480b-a35b-instruct`**
- **Context:** 262,144 tokens
- **Type:** Instruction-tuned coding model
- **Strengths:** 
  - Latest Qwen3 architecture
  - Massive 480B parameters (35B active)
  - Optimized for code generation
  - Long context for large codebases
- **Best for:** React components, TypeScript, full-file edits

### Alternative Options

| Model | Context | Best For |
|-------|---------|----------|
| `deepseek-coder-v2-instruct` | 32,768 | General coding, shorter files |
| `deepseek-coder-v2-lite-instruct` | 163,840 | Longer files, cost-efficient |
| `kimi-k2-instruct` | 131,072 | General purpose, current fallback |
| `deepseek-r1` | 163,840 | Reasoning-heavy coding tasks |

## Setting Up Qwen3 Coder

### Option 1: Use via Session Override
```bash
# For a single session with Qwen3 Coder
openclaw ask "Build a React component" --model fireworks/accounts/fireworks/models/qwen3-coder-480b-a35b-instruct
```

### Option 2: Configure as Coding-Mode Default

Edit OpenClaw configuration to add a coding profile:

```json
{
  "models": {
    "default": "anthropic/claude-sonnet-4-6",
    "coding": "fireworks/accounts/fireworks/models/qwen3-coder-480b-a35b-instruct",
    "fast": "fireworks/accounts/fireworks/models/kimi-k2p5",
    "reasoning": "fireworks/accounts/fireworks/models/deepseek-r1"
  }
}
```

### Option 3: Environment Variable
```bash
export OPENCLAW_MODEL="fireworks/accounts/fireworks/models/qwen3-coder-480b-a35b-instruct"
```

## Cost Comparison (Fireworks)

| Model | Input (per 1M tokens) | Output (per 1M tokens) |
|-------|------------------------|------------------------|
| Qwen3 Coder 480B | ~$0.80 | ~$2.40 |
| Kimi K2.5 | ~$0.50 | ~$1.50 |
| DeepSeek Coder V2 | ~$0.70 | ~$2.10 |
| Claude Sonnet 4.6 | ~$3.00 | ~$15.00 |

**Recommendation:** Use Qwen3 Coder for complex coding tasks, Kimi K2.5 for quick iterations.

## For Flow Education React App

**Suggested workflow:**
1. Use `claude-sonnet-4-6` for architecture decisions
2. Use `qwen3-coder-480b-a35b-instruct` for component implementation
3. Use `kimi-k2p5` for quick edits and refinements

## Next Steps

To configure Qwen3 Coder as your coding model:

1. Get Fireworks API key: https://fireworks.ai/api-keys
2. Configure:
   ```bash
   openclaw configure --section fireworks apiKey=fw_...
   ```
3. Test with:
   ```bash
   openclaw ask "Create a React counter component" --model fireworks/accounts/fireworks/models/qwen3-coder-480b-a35b-instruct
   ```
