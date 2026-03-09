# GWS CLI Setup Guide

Google Workspace CLI integration for PromptEngines. Two deployment targets: local Claude instances (personal OAuth) and Docker agents (service account).

---

## Local Setup (Claude on your machine)

### Prerequisites

- Node.js 18+
- A Google account with Workspace access
- Access to [Google Cloud Console](https://console.cloud.google.com)

### 1. Create a Google Cloud Project

1. Go to [console.cloud.google.com/projectcreate](https://console.cloud.google.com/projectcreate)
2. Project name: `promptengines-claude` (or your preference)
3. Click **Create**

### 2. Enable APIs

In the [API Library](https://console.cloud.google.com/apis/library), enable:

- Google Calendar API
- Google Drive API
- Gmail API
- Google Docs API
- Google Sheets API

### 3. Create OAuth Credentials

1. Go to [APIs & Services > Credentials](https://console.cloud.google.com/apis/credentials)
2. Click **Create Credentials > OAuth client ID**
3. Application type: **Desktop app**
4. Name: `promptengines-local`
5. Click **Create**
6. Download the JSON file
7. Save it to `~/.config/gws/client_secret.json`

### 4. Install and Authenticate

```bash
# Install gws CLI
npm install -g @googleworkspace/cli

# Or use the setup script (handles install + validation)
chmod +x scripts/gws-setup.sh
./scripts/gws-setup.sh
```

If running manually:

```bash
# Start OAuth flow (opens browser)
gws auth setup

# Verify
gws calendar list --max-results=5
gws drive list --max-results=5
```

### 5. File Permissions

Credentials are stored at `~/.config/gws/credentials.json`. Lock them down:

```bash
chmod 600 ~/.config/gws/credentials.json
chmod 600 ~/.config/gws/client_secret.json
```

---

## Docker Agent Setup (Service Account)

### 1. Create a Service Account

1. In [Google Cloud Console > IAM & Admin > Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts)
2. Click **Create Service Account**
3. Name: `promptengines-agent`
4. Email will be: `promptengines-agent@<project>.iam.gserviceaccount.com`
5. Skip role assignment (we share resources directly)
6. Click **Done**

### 2. Generate a Key

1. Click the service account you created
2. Go to **Keys** tab
3. **Add Key > Create new key > JSON**
4. Download and save as `docker/credentials/service-account-key.json`

### 3. Share Resources with the Service Account

Share only what the agent needs:

- **Drive folder:** Share a folder with the service account email (Editor or Viewer)
- **Calendar:** Add the service account email to specific calendars
- **Sheets/Docs:** Share individual files as needed

### 4. Build and Run

```bash
# Create credentials directory (gitignored)
mkdir -p docker/credentials

# Place your key file
cp ~/Downloads/service-account-key.json docker/credentials/

# Build the image
docker build -t promptengines-gws-agent ./docker/gws-agent

# Test
docker run --rm \
  -v $(pwd)/docker/credentials/service-account-key.json:/etc/gws/service-account-key.json:ro \
  promptengines-gws-agent calendar list

# Or use docker compose
cp docker/.env.example docker/.env
docker compose -f docker/docker-compose.yml run gws-agent calendar list
```

---

## Troubleshooting

### "Token expired" or "Invalid credentials"

```bash
# Local: re-authenticate
gws auth setup

# Docker: generate a new service account key in Cloud Console
```

### "API not enabled"

Go to [API Library](https://console.cloud.google.com/apis/library) and enable the specific API (Calendar, Drive, Gmail, etc.) for your project.

### "Permission denied" on a specific resource

The authenticated identity (user or service account) needs explicit access to the resource. Share the Drive folder, Calendar, or Document with the correct email.

### "Rate limit exceeded"

Google API quotas apply. For automation, add retry logic with exponential backoff. Default quotas:
- Calendar API: 1,000,000 queries/day
- Drive API: 1,000,000,000 queries/day
- Gmail API: 250 quota units/second/user

### Docker container fails to start

1. Check that `docker/credentials/service-account-key.json` exists
2. Verify it contains valid JSON with a `client_email` field
3. Confirm the file is readable by the container user

---

## Security Best Practices

1. **Never commit credentials.** The `docker/credentials/` directory is gitignored. Verify with `git status` before pushing.
2. **Use read-only mounts.** Always mount key files with `:ro` in Docker.
3. **Principle of least privilege.** Share only the specific resources each agent needs.
4. **Rotate service account keys** every 90 days. Set a calendar reminder.
5. **Revoke unused tokens.** If a local machine is decommissioned, revoke its OAuth tokens at [myaccount.google.com/permissions](https://myaccount.google.com/permissions).
6. **Separate projects for isolation.** Consider using a dedicated GCP project for agent service accounts, separate from personal OAuth.

---

## Reference

- PRD: `docs/prds/gws-google-workspace-cli-integration.md`
- Setup script: `scripts/gws-setup.sh`
- Docker image: `docker/gws-agent/Dockerfile`
- Docker compose: `docker/docker-compose.yml`
- gws CLI repo: https://github.com/googleworkspace/cli
- gws skills: https://github.com/googleworkspace/cli/tree/main/skills
