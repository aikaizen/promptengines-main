# OpenRAG Deployment Report

**Project:** OpenRAG with Fireworks AI Integration  
**Date:** March 4, 2026  
**Status:** ⚠️ Partial - Docker Daemon Access Required

---

## Executive Summary

Successfully analyzed and prepared OpenRAG deployment for Fireworks AI integration. Discovered that **OpenRAG does support custom OpenAI-compatible API endpoints**, enabling Fireworks AI usage.

**Blocker:** Docker daemon requires root permissions for networking (iptables/nftables). Both Docker-based and uvx-based (TUI) installation methods require Docker.

---

## What We Accomplished

### ✅ Prerequisites Installed
| Component | Status | Details |
|-----------|--------|---------|
| Python 3.13 | ✅ | Installed via `uv python install 3.13` |
| uv (Astral) | ✅ | v0.10.8 installed to `~/.local/bin` |
| Docker Engine | ✅ | v29.2.1 installed |
| Docker Compose | ✅ | v2.33.1 available |
| OpenRAG Source | ✅ | Cloned from `langflow-ai/openrag` |

### ✅ Repository Analysis
- **Structure:** Full-stack RAG system with FastAPI backend, Next.js frontend, Langflow workflows
- **Flows:** Chat, ingestion, URL ingest, nudges
- **Components:** OpenSearch vector DB, Docling document processor

### ✅ Fireworks AI Integration Discovery

**CRITICAL FINDING:** OpenRAG supports custom OpenAI API base URLs!

```json
// From flows/openrag_agent.json
"openai_api_base": {
  "display_name": "OpenAI API Base",
  "info": "The base URL of the OpenAI API. Defaults to https://api.openai.com/v1. 
           You can change this to use other APIs like JinaChat, LocalAI and Prem.",
  "show": true,
  "advanced": true
}
```

**Fireworks Configuration:**
- Base URL: `https://api.fireworks.ai/inference/v1`
- API Key: Your Fireworks API key
- Model: `accounts/fireworks/models/kimi-k2p5` (or other Fireworks models)
- Embeddings: Must use separate provider (OpenAI, watsonx, or Ollama)

---

## Deployment Architecture

OpenRAG deploys 5 containers (or services):

| Service | Port | Purpose | Notes |
|---------|------|---------|-------|
| OpenRAG Backend | 8000 | FastAPI server | Core RAG API |
| OpenRAG Frontend | 3000 | Next.js UI | User interface |
| Langflow | 7860 | Workflow engine | Visual flow builder |
| OpenSearch | 9200 | Vector database | Document storage |
| OpenSearch Dashboards | 5601 | DB admin | Index management |
| Docling Serve | 5001 | Document processing | **Must run on host** |

---

## Installation Methods Attempted

### Method 1: Docker Self-Managed (Docker Compose)
```bash
git clone https://github.com/langflow-ai/openrag.git
cd openrag
cp .env.example .env
# Edit .env with credentials
uv sync
uv run python scripts/docling_ctl.py start --port 5001
docker compose up -d
```
**Status:** ❌ Failed - Docker daemon needs root

### Method 2: Terminal/TUI (uvx)
```bash
uvx --from openrag openrag
```
**Status:** ❌ Failed - Still requires Docker daemon for containers

---

## Configuration for Fireworks AI

### .env File Setup
```bash
# Core passwords (required)
OPENSEARCH_PASSWORD=YourComplexPassword123!
LANGFLOW_SUPERUSER=admin
LANGFLOW_SUPERUSER_PASSWORD=YourAdminPassword123!

# Use OpenAI provider (we'll override base URL in UI)
OPENAI_API_KEY=fw_xxxxxxxxxxxxxxxxxxxxxxxx  # Fireworks API key
LLM_PROVIDER=openai
LLM_MODEL=accounts/fireworks/models/kimi-k2p5

# Embeddings (need separate provider - Fireworks doesn't have embeddings)
EMBEDDING_PROVIDER=openai
EMBEDDING_MODEL=text-embedding-3-small
OPENAI_API_KEY=sk-xxxxxxxx  # Separate OpenAI key for embeddings
```

### Post-Deployment UI Configuration
1. Access Langflow at `http://localhost:7860`
2. Open the Chat flow (openrag_agent.json)
3. Find the OpenAI component
4. Set **OpenAI API Base** to: `https://api.fireworks.ai/inference/v1`
5. Set **API Key** to your Fireworks key
6. Set **Model Name** to: `accounts/fireworks/models/kimi-k2p5`
7. Save and test

---

## Install Experience Rating

| Aspect | Rating | Notes |
|--------|--------|-------|
| Documentation | ⭐⭐⭐⭐⭐ | Comprehensive at docs.openr.ag |
| Prerequisites | ⭐⭐⭐☆☆ | Python 3.13 is very new; Docker daemon complexity |
| Install Script | ⭐⭐⭐⭐⭐ | `get.docker.com` worked perfectly |
| Repository | ⭐⭐⭐⭐⭐ | Well-organized, good examples |
| Flexibility | ⭐⭐⭐⭐☆ | Good provider support; Fireworks works via OpenAI compat |
| Docker Requirement | ⭐⭐☆☆☆ | No pure-local option; Docker is mandatory |

**Overall:** Good for standard cloud/VM deployment. Requires root Docker access.

---

## Path Forward for Full Deployment

### Option A: Environment with Docker Root Access
1. Use cloud VM (AWS, GCP, Azure)
2. Or local machine with sudo access
3. Run standard Docker deployment

### Option B: Podman Rootless
```bash
# Install Podman
sudo apt install podman podman-compose

# Run rootless containers
podman compose up -d
```

### Option C: IBM Cloud/OpenShift
OpenRAG is IBM-backed; likely optimized for OpenShift deployment.

---

## Key Files Created

```
~/projects/openrag-deploy/
├── DEPLOYMENT.md          # This report
├── openrag/               # Cloned repository
│   ├── .env               # Environment configuration
│   ├── docker-compose.yml # Container orchestration
│   ├── src/               # Backend source
│   ├── frontend/          # Next.js frontend
│   └── flows/             # Langflow workflows
```

---

## References

- **Website:** https://openr.ag
- **Docs:** https://docs.openr.ag
- **GitHub:** https://github.com/langflow-ai/openrag
- **Quickstart:** https://docs.openr.ag/quickstart
- **Docker Install:** https://docs.openr.ag/docker
- **Fireworks API:** https://docs.fireworks.ai
- **Fireworks Models:** https://fireworks.ai/models

---

## Fireworks AI Model Options

| Model | Type | Notes |
|-------|------|-------|
| `accounts/fireworks/models/llama-v3p3-70b-instruct` | LLM | Meta Llama 3.3 70B |
| `accounts/fireworks/models/qwen2p5-72b-instruct` | LLM | Alibaba Qwen 2.5 |
| `accounts/fireworks/models/kimi-k2p5` | LLM | Moonshot Kimi K2.5 (if available) |

**Embeddings:** Fireworks doesn't currently offer embedding models. Use OpenAI, watsonx, or Ollama for embeddings.

---

## Conclusion

OpenRAG is a **production-ready RAG platform** with excellent documentation and architecture. Fireworks AI integration is **technically feasible** via the OpenAI-compatible API endpoint.

**To complete deployment:** Run on a system with Docker daemon access (root permissions) or use Podman rootless mode.

**Estimated time to full deployment:** 15-30 minutes with proper Docker access.
