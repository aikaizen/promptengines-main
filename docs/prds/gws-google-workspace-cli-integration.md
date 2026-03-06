# PRD: Google Workspace CLI (gws) Integration for Claude & Agents

**Date:** March 6, 2026  
**Status:** Draft — Research & Planning Phase  
**Author:** Andy Stable (AI) & Human Co-Author  
**Priority:** Medium-High

---

## 1. Overview

Integration of the [Google Workspace CLI (`gws`)](https://github.com/googleworkspace/cli) into the PromptEngines infrastructure. Enables Claude instances and Docker-based agents to interact with Google Workspace APIs (Drive, Gmail, Calendar, Sheets, Docs, Chat, Admin) through a unified CLI interface.

**Key Differentiator:**
- `gws` dynamically builds commands from Google's Discovery Service — when Google adds new APIs, the CLI picks them up automatically without updates.
- 40+ AI agent skills included out of the box.
- Structured JSON output designed for programmatic consumption.

---

## 2. Use Cases

### 2.1 Claude on Local Computers
- Access user's calendar for scheduling context
- Read/search Gmail for information retrieval
- Create Google Docs for documentation output
- Manage Drive files for project assets
- Interact with Google Chat for team coordination

### 2.2 Agents in Docker (Separate Account)
- Service account automation (scheduled reports, backups)
- Shared team calendar management
- Document generation pipelines
- Cross-agent coordination via shared Drive folders
- Different OAuth credentials from local Claude (isolation)

---

## 3. Architecture

### 3.1 Core Components

| Component | Technology | Purpose |
|-----------|------------|---------|
| `gws` CLI | Rust/npm binary | Unified Google Workspace API access |
| OAuth 2.0 | Google Cloud Console | Authentication & authorization |
| Credentials Store | Local file system (~/.config/gws/) | Token persistence per environment |
| Skill System | YAML-based | Agent capabilities definition |

### 3.2 Deployment Targets

```
┌─────────────────────────────────────────────────────────────┐
│                    PROMPTENGINES INFRA                       │
├─────────────────────────┬───────────────────────────────────┤
│  Local Claude Instances │  Docker Agents (Separate Account) │
│  (User's computers)     │  (Cloud/Server environment)         │
├─────────────────────────┼───────────────────────────────────┤
│  • Personal OAuth creds │  • Service account OAuth creds      │
│  • ~/.config/gws/       │  • Container-mounted credentials  │
│  • Interactive auth     │  • Pre-authenticated at startup   │
│  • User context         │  • Automation context             │
└──────────┬──────────────┴──────────────┬────────────────────┘
           │                              │
           └──────────────┬───────────────┘
                          │
              ┌───────────▼───────────┐
              │   Google Workspace     │
              │   APIs (Drive, Gmail,  │
              │   Calendar, Sheets...) │
              └────────────────────────┘
```

---

## 4. Authentication Strategy

### 4.1 Local Claude (Interactive)

**Flow:**
1. User creates Google Cloud project
2. Enables required APIs (Drive, Gmail, Calendar, etc.)
3. Creates OAuth 2.0 Desktop Application credentials
4. Downloads `client_secret.json`
5. Runs `gws auth setup` — opens browser for OAuth flow
6. Tokens stored in `~/.config/gws/credentials.json`
7. Claude calls `gws` commands as needed

**Security:**
- Tokens stored in user's home directory (not workspace)
- File permissions: `600`
- Refresh token rotation handled automatically
- User can revoke at any time via Google Account

### 4.2 Docker Agents (Service Account)

**Flow:**
1. Create separate Google Cloud project (or same project, different credentials)
2. Create Service Account (e.g., `agents@project.iam.gserviceaccount.com`)
3. Download service account key (`service-account-key.json`)
4. Share specific resources with service account (Drive folders, Calendars)
5. Mount key file into container at runtime
6. Container calls `gws` with service account impersonation

**Security:**
- Service account has limited scope (principle of least privilege)
- Key file mounted read-only in container
- Different OAuth credentials from local (isolation)
- Regular key rotation policy

---

## 5. Agent Skills Integration

### 5.1 Skill Format

`gws` includes 40+ pre-built skills in the `skills/` directory:
- `gws-calendar` — Calendar operations
- `gws-calendar-agenda` — Daily agenda retrieval
- `gws-calendar-insert` — Event creation
- `gws-chat` — Google Chat operations
- `gws-chat-send` — Send chat messages
- `gws-docs-write` — Document creation
- `gws-drive` — File management
- `gws-gmail` — Email operations
- `gws-sheets` — Spreadsheet operations
- `gws-admin-reports` — Admin SDK reports
- `gws-classroom` — Google Classroom operations

### 5.2 Skill Structure

Each skill includes:
- `skill.yaml` — Metadata, parameters, permissions
- `README.md` — Usage documentation
- Example prompts for Claude/agents

### 5.3 Custom Skills

We can extend with PromptEngines-specific skills:
- `gws-labnotes-publish` — Publish article to Lab Notes
- `gws-build-stream-update` — Update build stream from commits
- `gws-team-profile-sync` — Sync team profiles from database

---

## 6. Implementation Plan

### Phase 1: Local Claude Setup (Week 1)

**Tasks:**
1. Install `gws` CLI:
   ```bash
   npm install -g @googleworkspace/cli
   ```
2. Create Google Cloud project (`promptengines-claude`)
3. Enable APIs:
   - Google Drive API
   - Gmail API
   - Google Calendar API
   - Google Docs API
   - Google Sheets API
4. Create OAuth Desktop Application credentials
5. Complete OAuth flow: `gws auth setup`
6. Test basic operations:
   ```bash
   gws calendar list
   gws drive list --max-results=10
   ```
7. Document Claude integration patterns

**Deliverable:** Claude on local machine can access user's Google Workspace data.

### Phase 2: Docker Agent Setup (Week 2)

**Tasks:**
1. Create service account: `agents@promptengines-ga.iam.gserviceaccount.com`
2. Create and download service account key
3. Build Docker image with `gws` pre-installed:
   ```dockerfile
   FROM node:18-slim
   RUN npm install -g @googleworkspace/cli
   COPY service-account-key.json /etc/gws/credentials.json
   ENV GWS_SERVICE_ACCOUNT_KEY=/etc/gws/credentials.json
   ```
4. Configure container permissions (read-only mount)
5. Share specific resources with service account:
   - Shared Drive folder ("Agent Output")
   - Team calendar (read-only)
   - Specific Docs/Sheets (as needed)
6. Test in isolated container:
   ```bash
   docker run -v $(pwd)/service-account-key.json:/etc/gws/credentials.json:ro promptengines-agent
   ```
7. Document agent authentication patterns

**Deliverable:** Docker agents can access Google Workspace via service account.

### Phase 3: Skill Development (Week 3)

**Tasks:**
1. Analyze existing `gws` skills structure
2. Create custom skills for PromptEngines workflows:
   - `gws-labnotes-submit` — Submit article to review queue
   - `gws-build-stream-generate` — Generate daily build stream
   - `gws-team-onboard` — Onboard new team member from token
3. Test skills in both local and Docker environments
4. Document skill creation patterns

**Deliverable:** Custom skills extending `gws` for PromptEngines-specific tasks.

### Phase 4: Integration & Automation (Week 4)

**Tasks:**
1. Add `gws` calls to Claude workflows:
   - Calendar context before scheduling
   - Gmail search for information retrieval
   - Drive upload for artifact storage
2. Add `gws` calls to agent automation:
   - Daily build stream generation
   - Weekly report compilation to Drive
   - Team profile synchronization
3. Build monitoring/alerting for token expiration
4. Document operational runbooks

**Deliverable:** Fully integrated Google Workspace automation.

---

## 7. Security & Permissions

### 7.1 OAuth Scopes Required

**Minimum for basic operations:**
- `https://www.googleapis.com/auth/calendar.readonly`
- `https://www.googleapis.com/auth/drive.readonly`
- `https://www.googleapis.com/auth/gmail.readonly`

**For write operations:**
- `https://www.googleapis.com/auth/calendar`
- `https://www.googleapis.com/auth/drive`
- `https://www.googleapis.com/auth/documents`
- `https://www.googleapis.com/auth/spreadsheets`
- `https://www.googleapis.com/auth/gmail.send`
- `https://www.googleapis.com/auth/chat.bot`

### 7.2 Permission Boundaries

| Environment | Access Level | Scope |
|-------------|--------------|-------|
| Local Claude | User's personal data | Full read + limited write |
| Docker Agents | Shared team resources | Read/write specific folders only |

### 7.3 Token Management

- Refresh tokens stored in `~/.config/gws/credentials.json`
- Service account keys mounted read-only in containers
- No hardcoded credentials in code/repos
- Regular rotation (90 days for service accounts)

---

## 8. Error Handling & Monitoring

### 8.1 Common Failure Modes

| Issue | Cause | Resolution |
|-------|-------|------------|
| Token expired | Refresh failed | Re-run `gws auth setup` |
| Rate limited | API quota exceeded | Backoff & retry with jitter |
| Permission denied | OAuth scope insufficient | Re-auth with broader scope |
| Service account invalid | Key revoked | Generate new key in Cloud Console |
| Discovery API fail | Google service issue | Cache last-known schema, retry |

### 8.2 Monitoring

- Log all `gws` invocations (command, duration, success/failure)
- Alert on token expiration (7 days before)
- Track API quota usage
- Monitor service account key age

---

## 9. Open Questions

1. **Same project or separate?** Should local Claude and Docker agents use the same Google Cloud project or separate ones for isolation?

2. **Token storage in Docker?** How to handle service account keys in container orchestration (Kubernetes secrets, Vault, etc.)?

3. **Scope granularity?** Should we request all scopes upfront or implement incremental authorization?

4. **Skill distribution?** How to share custom PromptEngines skills — fork the gws repo, or separate skill registry?

5. **Rate limiting strategy?** gws hits Google API quotas — need backoff strategy for automation scenarios?

6. **Offline fallback?** How should Claude/agents behave when Google APIs are unavailable?

---

## 10. Success Metrics

- **Time to first calendar query:** < 5 minutes from install
- **Agent automation coverage:** 80% of scheduled tasks use gws
- **Token uptime:** < 1 auth failure per month
- **Custom skills created:** 3+ PromptEngines-specific skills
- **Cross-agent coordination:** Shared Drive folder actively used by 2+ agents

---

## 11. Resources

- **Repository:** https://github.com/googleworkspace/cli
- **NPM Package:** `@googleworkspace/cli`
- **Documentation:** https://github.com/googleworkspace/cli#readme
- **Skills Directory:** https://github.com/googleworkspace/cli/tree/main/skills
- **Google Discovery Service:** https://developers.google.com/discovery

---

## 12. Next Steps

1. **Create Google Cloud project** (`promptengines-claude` or similar)
2. **Enable required APIs** (Drive, Gmail, Calendar minimum)
3. **Install gws locally** and complete OAuth flow
4. **Test basic calendar/drive operations**
5. **Document local setup experience** for team distribution
6. **Create service account** for Docker agents
7. **Build test Docker image** with gws + service account
8. **Verify cross-account isolation** (local vs Docker credentials)

---

**This PRD is a living document.** Implementation details will be refined as we explore the gws CLI and identify specific PromptEngines integration points.
