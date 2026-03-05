---
skill_id: openclaw-hardening
version: 1.0.0
status: draft
author: moritzkremb (adapted)
date: 2026-03-05
purpose: Production hardening checklist for OpenClaw — turn fresh install into daily-usable system
applies_to:
  - OpenClaw setup
  - Production deployment
  - Daily operations
type: operational-framework
---

# OpenClaw Hardening Guide

Source: https://x.com/moritzkremb/status/2029304864719667335

## Purpose

Transform a fresh OpenClaw install into a production-ready system in 30–60 minutes. 
Addresses common failure modes: session memory loss, API key exposure, cron failures, model misconfiguration.

---

## 0) Troubleshooting Baseline

**Before anything else:**

Create a separate Claude project for OpenClaw ops/debugging.
- Add Context7 OpenClaw docs context
- Use this to ask questions when stuck

Install and keep available: `clawddocs` skill (docs context for your OpenClaw instance)

**Quick diagnostic commands:**
```bash
openclaw gateway status
openclaw gateway restart
openclaw doctor
openclaw doctor --repair  # if things are weird
```

---

## 1) Personalization

**Update in workspace:**

| File | Purpose |
|------|---------|
| `USER.md` | Who the assistant helps |
| `IDENTITY.md` | Assistant identity |
| `SOUL.md` | Tone, rules, archetypes |

**Goal:** Make responses specific, opinionated, and useful from day 1.

---

## 2) Memory Reliability

**Ensure long-term memory exists:**
- `MEMORY.md` — curated long-term memory
- `memory/YYYY-MM-DD.md` — daily notes flow

**Add to HEARTBEAT.md:**
```markdown
## Memory Maintenance
- [ ] Create today's file if missing
- [ ] Append major decisions/learnings
- [ ] Promote important items to MEMORY.md
```

---

## 3) Model Defaults + Fallbacks

**Recommended stack:**

```yaml
# agents.defaults
model:
  primary: openai-codex/gpt-5.3-codex  # or gpt-5.2
  fallbacks:
    - anthropic/claude-sonnet-4-6
    - openrouter/auto
    - kilo/gateway-models

# Optional aliases
models:
  opus:
    provider: anthropic
    model: claude-opus-4-6
```

**Principle:** Optimize for reliability first, then cost.

---

## 4) Security Basics

**Secrets storage:**
```bash
# One env file, outside workspace
~/.openclaw/secrets/openclaw.env

# Permissions
chmod 700 ~/.openclaw/secrets/
chmod 600 ~/.openclaw/secrets/openclaw.env
```

**If on VPS:**
- Allow inbound only from trusted IPs
- Keep gateway auth token enabled
- Avoid public open gateway exposure

**Bonus:**
```yaml
# Gateway config
dmPolicy: "allowlist"
allowFrom: [telegram_id_1, telegram_id_2]
groupAllowFrom: [telegram_id_1]
```

---

## 5) Telegram Groups + Chat Optimizations

**Recommended group config:**

```yaml
# Telegram settings
dmPolicy: allowlist
groupAllowFrom: [your_telegram_id]
group:
  requireMention: false  # for proactive behavior

# BotFather settings
privacyMode: disabled  # for full group context
```

**Group setup:**
- Add bot as admin in groups
- Enable topics for separated workflows
- Set topic-specific `systemPrompt` for dedicated jobs

**General enhancements:**
- Add default ack reaction (👀) — signals message seen
- Enable streaming responses

---

## 6) Browser + Research Stack

**Brave API key:**
```bash
openclaw configure --section web
# Add BRAVE_API_KEY
```

**Browser mode selection:**

| Use Case | Profile |
|----------|---------|
| Automation / default work | `profile="openclaw"` (managed) |
| Logged-in sessions / passkeys | `profile="chrome"` (relay) |

**Rule of thumb:**
- Default → managed profile (isolated, stable)
- Personal sessions → Chrome relay

---

## 7) Heartbeat + Cron Hardening

**Add to HEARTBEAT.md:**

```markdown
## Cron Health Check
- [ ] Check critical cron jobs for stale `lastRunAtMs`
- [ ] If stale > threshold, force-run missed jobs
- [ ] Report exceptions briefly
```

**Prevents:** Silent cron misses, stale automations.

---

## 8) Operational Accounts (Agent-Owned)

Create dedicated accounts for agent environment:

| Service | Account Type |
|---------|-------------|
| Google | Agent-dedicated account |
| Mail | Gmail or AgentMail |
| GitHub | Separate from personal |

**Why:** Clean separation, safer permissions, easier auditability.

---

## 9) Skills Strategy

**Install early (high leverage):**
- `summarize` skill

**Add custom skills for:**
- Every recurring successful workflow
- Voice transcription (Whisper/OpenAI Whisper API)

**Principle:** If repeated 2–3 times, skill it.

---

## Fast Acceptance Checklist

- [ ] `SOUL.md`, `USER.md`, `IDENTITY.md` customized
- [ ] `MEMORY.md` + daily memory flow working
- [ ] Heartbeat includes cron + memory maintenance
- [ ] Model primary + fallbacks configured
- [ ] Secrets moved to secure env file with strict perms
- [ ] Telegram allowlists + topic prompts configured
- [ ] Brave key set; browser mode rules established
- [ ] Dedicated Google/mail/GitHub accounts created
- [ ] `summarize` + at least one custom skill installed

**If all checked:** Your OpenClaw install is production-usable.

---

## Local Notes

**Implementation status in this workspace:**
- [ ] Troubleshooting baseline (clawddocs skill)
- [ ] Model fallbacks configured
- [ ] Secrets in env file (currently in files — needs fix)
- [ ] Telegram group optimizations
- [ ] Brave API key (missing)
- [ ] Cron health checks in HEARTBEAT
- [ ] Operational accounts (needs setup)
- [ ] Summarize skill installed

**Next actions:**
1. Generate new PAT with workflow scope (GitHub Action push)
2. Move secrets to env file
3. Configure Brave API key
4. Add cron health checks to HEARTBEAT.md
5. Install clawddocs and summarize skills
