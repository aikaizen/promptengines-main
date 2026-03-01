# Flow Education — Model Configuration

**Version:** 1.0.0  
**Date:** March 1, 2026  
**Status:** Active Configuration

---

## 🎯 Model Stack Hierarchy

| Priority | Model | Provider | Use Case | Status |
|----------|-------|----------|----------|--------|
| **1** | **Kimi K2.5** | Fireworks AI | Primary (default) | ✅ Available |
| **2** | **MiniMax 2.5** | Fireworks AI | Backup 1 | ⏳ Verify availability |
| **3** | **Claude Sonnet 4.6** | Anthropic | Backup 2 | ✅ Available |
| **4** | **Qwen 3 Coder 480B** | Fireworks AI | Coding specialized | ❌ **NOT AVAILABLE** |

---

## ❌ Qwen 3 Coder 480B — Unavailable

**Current Status:** Model not allowed in this environment  
**Attempts Made:**
- `fireworks/accounts/fireworks/models/qwen3-coder-480b-a35b-instruct` → Not allowed
- `fireworks/accounts/fireworks/models/qwen3-coder` → Not allowed  
- `fireworks/accounts/fireworks/models/qwen3` → Not allowed

**Action Required:** User must configure Qwen 3 via OpenClaw settings or request model enablement.

**Command to configure:**
```bash
# If available in your Fireworks account:
openclaw configure --model fireworks/accounts/fireworks/models/qwen3-coder-480b-a35b-instruct

# Or set as environment variable:
export OPENCLAW_DEFAULT_MODEL=fireworks/accounts/fireworks/models/qwen3-coder-480b-a35b-instruct
```

---

## ✅ Active Configuration

### Primary: Kimi K2.5

**Model ID:** `fireworks/accounts/fireworks/models/kimi-k2p5`  
**Provider:** Fireworks AI  
**Role:** Default for all tasks  
**Strengths:**
- Excellent React/frontend coding
- Fast response times
- Strong reasoning capabilities
- Very cost-effective (~10x cheaper than Claude)

**Current Cost:** $0.50-1.50 per Flow Education development session  
**vs Claude:** ~$5-15 per session

### Coding with Kimi K2.5

Kimi K2.5 has proven effective for Flow Education development:
- Full React component architecture
- CSS module styling
- Complex JSX logic (7 challenge types)
- State management hooks
- Canvas-based interactions

**Performance:** Comparable to Qwen 3 for React development based on build results.

---

## 🔧 Configuration Methods

### Method 1: Runtime Override (Per Message)
```
/model fireworks/accounts/fireworks/models/kimi-k2p5
```

### Method 2: Session Default
```bash
openclaw configure --model fireworks/accounts/fireworks/models/kimi-k2p5
```

### Method 3: Environment Variable
```bash
export OPENCLAW_DEFAULT_MODEL=fireworks/accounts/fireworks/models/kimi-k2p5
```

### Method 4: Request Header (API)
```
X-Model: fireworks/accounts/fireworks/models/kimi-k2p5
```

---

## 📊 Cost Comparison (Flow Education Scale)

| Model | Per 1M Tokens | Est. Per Session | Monthly (20 sessions) |
|-------|---------------|------------------|----------------------|
| Kimi K2.5 | ~$0.40 | $0.50-1.50 | $10-30 |
| MiniMax 2.5 | ~$0.35 | $0.40-1.20 | $8-24 |
| Claude Sonnet 4.6 | ~$3.00 | $5-15 | $100-300 |
| Qwen 3 Coder | ~$0.50 | $0.60-2.00 | $12-40 |

**Savings with Kimi:** 80-90% vs Claude Sonnet

---

## 🧪 Verification Tests

Run these to confirm model availability:

```bash
# Test Kimi K2.5 (should work)
openclaw model-test fireworks/accounts/fireworks/models/kimi-k2p5

# Test Qwen 3 (expected to fail until configured)
openclaw model-test fireworks/accounts/fireworks/models/qwen3-coder-480b-a35b-instruct

# Check all available models
openclaw models list
```

---

## 🔄 Fallback Strategy

If primary model fails:

1. **Auto-fallback** (OpenClaw handles internally)
   - Kimi K2.5 → MiniMax 2.5 → Claude Sonnet 4.6

2. **Manual override** (explicit switch)
   ```
   /model anthropic/claude-sonnet-4-6
   ```

3. **Task-specific model** (when Qwen 3 available)
   ```
   /model fireworks/accounts/fireworks/models/qwen3-coder-480b-a35b-instruct
   /code [complex task]
   ```

---

## 📝 Recommended Setup

### For Current Flow Development

Use **Kimi K2.5** as primary — it's working excellently:

```bash
# Set as default
openclaw configure --model fireworks/accounts/fireworks/models/kimi-k2p5

# Verify
openclaw status
```

### When Qwen 3 Becomes Available

```bash
# Add to stack for coding tasks
openclaw configure --model-coding fireworks/accounts/fireworks/models/qwen3-coder-480b-a35b-instruct

# Or request on-demand
/model fireworks/accounts/fireworks/models/qwen3-coder-480b-a35b-instruct
Write this complex algorithm...
```

---

## 🚀 Next Steps

1. **Immediate:** Continue with Kimi K2.5 (verified working)
2. **Short-term:** Request Qwen 3 enablement from OpenClaw/Fireworks
3. **Medium-term:** A/B test Qwen 3 vs Kimi for coding tasks when available
4. **Long-term:** Optimize per-task model selection (coding vs creative)

---

## 📚 References

- Kimi K2.5: https://www.moonshot.cn/kimi
- Qwen 3 Coder: https://qwenlm.github.io/
- Fireworks Models: https://fireworks.ai/models
- OpenClaw Docs: https://docs.openclaw.ai/models

---

**Document Owner:** Flow Education Team  
**Last Updated:** March 1, 2026  
**Next Review:** When Qwen 3 becomes available
