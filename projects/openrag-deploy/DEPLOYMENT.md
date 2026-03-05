# OpenRAG Deployment Documentation

**Project:** OpenRAG Deployment with Fireworks AI  
**Date:** March 4, 2026  
**Goal:** Deploy OpenRAG and configure it for RAG search over a sample corpus using Fireworks AI + Kimi K2.5

---

## Prerequisites Check

| Component | Required | Actual | Status |
|-----------|----------|--------|--------|
| Python | 3.13 | 3.13.12 | ✅ Installed via uv |
| uv | Latest | 0.10.8 | ✅ Installed |
| Docker | Latest | 29.2.1 | ✅ Installed |
| Docker Compose | Latest | v2.33.1 | ✅ Installed |

---

## Installation Steps

### Step 1: Install uv (Python Package Manager)
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
export PATH="$HOME/.local/bin:$PATH"
```
**Result:** Installed successfully to `~/.local/bin`

### Step 2: Install Python 3.13
```bash
uv python install 3.13
```
**Result:** Installed cpython-3.13.12-linux-aarch64-gnu in 1.69s

### Step 3: Install Docker
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
```
**Result:** Docker 29.2.1 installed successfully

### Step 4: Clone OpenRAG Repository
```bash
git clone https://github.com/langflow-ai/openrag.git
cd openrag
```
**Result:** Cloned 46882 lines of Makefile, full project structure with:
- `src/` - Backend source code
- `frontend/` - Next.js frontend
- `flows/` - Langflow workflow definitions
- `docker-compose.yml` - Container orchestration

---

## Supported Model Providers Analysis

OpenRAG officially supports these providers:

| Provider | Type | Notes |
|----------|------|-------|
| OpenAI | LLM + Embeddings | Default provider |
| Anthropic | LLM only | No embedding models |
| Ollama | LLM + Embeddings | Self-hosted/local |
| IBM watsonx.ai | LLM + Embeddings | Enterprise |

**Fireworks AI Status:** ⚠️ NOT directly supported

However, Fireworks AI provides an **OpenAI-compatible API**. Potential workarounds:
1. Use Fireworks via their OpenAI-compatible endpoint (set custom base URL)
2. Use Ollama as a proxy to Fireworks
3. Modify OpenRAG source code to add Fireworks provider

---

## Configuration Setup

### .env File Configuration

Based on `.env.example`, we need to set:

```bash
# Required passwords (complexity: 8+ chars, uppercase, lowercase, digit, special)
OPENSEARCH_PASSWORD=OpenRAGDemo2026!

# Langflow auth
LANGFLOW_SECRET_KEY=<generate at https://docs.langflow.org/api-keys-and-authentication#langflow-secret-key>
LANGFLOW_SUPERUSER=admin
LANGFLOW_SUPERUSER_PASSWORD=AdminDemo2026!

# Model provider - Using OpenAI for initial test
# Fireworks AI integration requires investigation of OpenAI-compatible endpoint
OPENAI_API_KEY=<your_key_here>
LLM_PROVIDER=openai
LLM_MODEL=gpt-4o-mini
EMBEDDING_PROVIDER=openai
EMBEDDING_MODEL=text-embedding-3-small
```

---

## Architecture Components

OpenRAG deploys these containers:

| Container | Port | Purpose |
|-----------|------|---------|
| OpenRAG Backend | 8000 | FastAPI server, core functionality |
| OpenRAG Frontend | 3000 | React web interface |
| Langflow | 7860 | AI workflow engine (drag-and-drop) |
| OpenSearch | 9200 | Vector database for knowledge |
| OpenSearch Dashboards | 5601 | DB admin interface |
| Docling Serve | 5001 | Document processing (host native) |

---

## Fireworks AI Integration Investigation

### Fireworks OpenAI-Compatible API
Fireworks supports OpenAI SDK with base URL: `https://api.fireworks.ai/inference/v1`

Models available:
- `accounts/fireworks/models/llama-v3p3-70b-instruct`
- `accounts/fireworks/models/qwen2p5-72b-instruct`
- `accounts/fireworks/models/kimi-k2p5` (Kimi K2.5 - if available)

### Approach Options:

**Option A: OpenAI SDK with Custom Base URL**
- Set `OPENAI_BASE_URL=https://api.fireworks.ai/inference/v1`
- Use `OPENAI_API_KEY=<fireworks_key>`
- Set `LLM_MODEL=accounts/fireworks/models/kimi-k2p5`

**Issue:** OpenRAG may not expose `OPENAI_BASE_URL` in its configuration.

**Option B: Ollama Bridge**
- Run Ollama locally
- Configure Ollama to proxy to Fireworks
- Point OpenRAG to local Ollama endpoint

**Option C: Source Code Modification**
- Fork OpenRAG
- Add Fireworks as a native provider
- Submit PR upstream

---

## Current Status

✅ **Completed:**
- Prerequisites installed (Python 3.13, uv, Docker)
- Repository cloned
- Configuration analyzed
- Architecture understood

🔄 **Next Steps:**
1. Create .env file with proper credentials
2. Start docling-serve service on host
3. Deploy OpenRAG containers
4. Complete application onboarding
5. Test with OpenAI first
6. Investigate Fireworks integration

---

## Install Experience Rating

| Aspect | Rating | Notes |
|--------|--------|-------|
| Documentation | ⭐⭐⭐⭐⭐ | Excellent docs at docs.openr.ag |
| Prerequisites | ⭐⭐⭐⭐☆ | Python 3.13 is very new, uv is modern but not universal |
| Docker Setup | ⭐⭐⭐⭐⭐ | One-script install worked perfectly |
| Clone Speed | ⭐⭐⭐⭐⭐ | Fast, well-organized repo |
| Flexibility | ⭐⭐⭐☆☆ | Limited model providers; no direct Fireworks support |

**Overall:** Good experience for standard OpenAI/Anthropic users. Custom providers require workarounds.

---

## References

- **Website:** https://openr.ag
- **Docs:** https://docs.openr.ag
- **GitHub:** https://github.com/langflow-ai/openrag
- **Fireworks API:** https://docs.fireworks.ai
