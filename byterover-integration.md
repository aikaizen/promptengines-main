# ByteRover Integration — Setup Guide

**Source:** https://storage.googleapis.com/brv-releases/openclaw-setup.sh  
**Purpose:** Configure ByteRover as long-term memory for OpenClaw agents  
**Status:** Prerequisites needed — installation guide below

---

## 🎯 What ByteRover Integration Provides

### 1. Automatic Memory Flush
**When:** Context window fills up (compaction triggers)  
**What:** Automatically curates key insights to ByteRover before compaction  
**Config:**
```json
{
  "agents": {
    "defaults": {
      "compaction": {
        "reserveTokensFloor": 50000,
        "memoryFlush": {
          "enabled": true,
          "softThresholdTokens": 4000,
          "systemPrompt": "Session nearing compaction. Store durable memories now.",
          "prompt": "Review for architectural decisions, bug fixes, patterns. Run 'brv curate <summary>' to update context tree."
        }
      }
    }
  }
}
```

### 2. Daily Knowledge Mining (Cron Job)
**When:** Every day at 9:00 AM  
**What:** Reads `memory/YYYY-MM-DD.md`, extracts patterns, curates to ByteRover  
**Command:**
```bash
openclaw cron add \
  --name "ByteRover Knowledge Miner" \
  --cron "0 9 * * *" \
  --session isolated \
  --message "DAILY MINING: Read memory/YYYY-MM-DD.md, extract patterns, run 'brv curate <summary>'"
```

### 3. ByteRover Context Plugin
**When:** Every prompt  
**What:** Auto-queries ByteRover and injects relevant context  
**Location:** `~/.openclaw/extensions/byterover/index.ts`  
**Function:** Runs `brv query <user_prompt>` before building context

### 4. Workspace Protocol Updates
**Files Modified:**
- `AGENTS.md` — Adds Knowledge Protocol section
- `TOOLS.md` — Adds ByteRover tool reference

---

## 📋 Prerequisites Checklist

| Requirement | Status | Install Command |
|-------------|--------|-----------------|
| Node.js | ✅ | `node --version` (v18+) |
| Clawhub | ❌ | `npm install -g @openclaw/clawhub` |
| ByteRover CLI (`brv`) | ❌ | See docs.byterover.dev |
| ByteRover Skill | ❌ | `clawhub install byterover` |
| OpenClaw CLI | ✅ | `openclaw --version` |

---

## 🚀 Installation Steps

### Step 1: Install ByteRover CLI
```bash
# From ByteRover docs (https://docs.byterover.dev)
npm install -g byterover-cli
# OR
curl -fsSL https://byterover.dev/install.sh | sh
```

### Step 2: Install Clawhub (if missing)
```bash
npm install -g @openclaw/clawhub
```

### Step 3: Install ByteRover Skill
```bash
clawhub install byterover
brv connectors install OpenClaw --type skill
```

### Step 4: Run Setup Script
```bash
curl -fsSL https://storage.googleapis.com/brv-releases/openclaw-setup.sh | sh
```

---

## 🔧 Manual Integration (If Script Fails)

### 1. Patch openclaw.json for Memory Flush
```javascript
// Add to ~/.openclaw/openclaw.json
{
  "agents": {
    "defaults": {
      "compaction": {
        "reserveTokensFloor": 50000,
        "memoryFlush": {
          "enabled": true,
          "softThresholdTokens": 4000,
          "systemPrompt": "Session nearing compaction. Store durable memories now.",
          "prompt": "Review the session for architectural decisions, bug fixes, or new patterns. If found, run 'brv curate \"<summary of change>\"' to update context tree. Also write to memory/YYYY-MM-DD.md. Reply NO_REPLY if nothing to store."
        }
      }
    }
  }
}
```

### 2. Create Daily Cron Job
```bash
openclaw cron add \
  --name "ByteRover Knowledge Miner" \
  --cron "0 9 * * *" \
  --session isolated \
  --message "DAILY KNOWLEDGE MINING:
1. Read latest file in memory/ (memory/YYYY-MM-DD.md).
2. Extract architectural decisions, patterns, bug fixes.
3. Run 'brv curate \"<summary>\"' to save to Context Tree." \
  --announce
```

### 3. Create Context Plugin
```bash
mkdir -p ~/.openclaw/extensions/byterover
```

**File: `~/.openclaw/extensions/byterover/index.ts`**
```typescript
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

export default function (api) {
  api.logger.info("[byterover] Loaded!");

  api.on("before_prompt_build", async (event, ctx) => {
    let userPrompt = event.prompt;
    if (!userPrompt) {
      const messages = ctx?.messages || [];
      const lastUserMessage = messages.slice().reverse().find(m => m.role === 'user');
      userPrompt = lastUserMessage?.content || "";
    }
    
    // Strip OpenClaw metadata
    userPrompt = userPrompt.replace(/^Conversation info \(untrusted metadata\):[\s\S]*?```json[\s\S]*?```\s*/i, "").trim();
    if (!userPrompt) return;

    try {
      const { stdout } = await execFileAsync("brv", ["query", userPrompt], { timeout: 300000 });
      const brvOutput = stdout.trim();
      if (brvOutput) {
        return { prependContext: `\n\n## ByteRover Context (Auto-Enriched)\n${brvOutput}\n` };
      }
    } catch (error) {
      if (error.code !== 'ENOENT') {
        api.logger.warn(`[byterover] Query failed: ${error.message}`);
      }
    }
  });
}
```

**File: `~/.openclaw/extensions/byterover/openclaw.plugin.json`**
```json
{
  "id": "byterover",
  "name": "ByteRover Context",
  "version": "1.0.0",
  "entry": "./index.ts",
  "description": "Injects ByteRover context into system prompts based on user queries.",
  "configSchema": { "type": "object", "additionalProperties": true }
}
```

### 4. Enable Plugin in Config
```javascript
// Add to ~/.openclaw/openclaw.json
{
  "plugins": {
    "entries": {
      "byterover": { "enabled": true }
    }
  }
}
```

### 5. Update Workspace Protocols

**Add to `AGENTS.md`:**
```markdown
## Knowledge Protocol (ByteRover)
This agent uses ByteRover (`brv`) as long-term structured memory.

1. **Start:** Before answering, run `brv query "<topic>"` to load patterns.
2. **Finish:** After completing, run `brv curate "<summary>"` to save knowledge.
3. **Don't Guess:** Query first if you don't know.
4. **Cite:** "Based on brv contexts at `.brv/context-trees/...`..."
```

**Add to `TOOLS.md`:**
```markdown
## ByteRover (Memory)
- **Query:** `brv query "auth patterns"`
- **Curate:** `brv curate "Auth uses JWT in cookies"`
- **Sync:** `brv pull` / `brv push` (team sync, requires login)
```

---

## 🎁 Benefits for Orchestrator Role

| Capability | Use Case |
|------------|----------|
| `brv query` | Subagents retrieve context I curated |
| `brv curate` | I store coordination patterns, decisions |
| Auto-flush | No knowledge lost during compaction |
| Daily mining | Automated extraction from daily notes |
| Context plugin | Every prompt enriched with relevant history |

---

## ⚡ Quick Commands (Once Installed)

```bash
# Query stored knowledge
brv query "storybook studio marketing strategy"

# Curate new knowledge
brv curate "A/B test shows Variant C (social proof) outperforms by 23%"

# Sync with team
brv pull && brv push

# Check context tree
brv list
```

---

## 🔗 Resources

- **ByteRover Docs:** https://docs.byterover.dev
- **OpenClaw Plugins:** https://docs.openclaw.ai/plugins
- **Setup Script Source:** https://storage.googleapis.com/brv-releases/openclaw-setup.sh

---

## ❓ Current Blocker

**ByteRover CLI not installed** — requires:
1. User to get ByteRover access (docs.byterover.dev)
2. Install `brv` CLI
3. Re-run setup script

**OR** proceed with manual integration of just the memory flush and cron job (no auto-context injection).
