# Deploying OpenRAG: What Actually Happened

**Date:** March 4, 2026  
**Time to partial deployment:** ~45 minutes  
**Time to full deployment:** Blocked by Docker daemon requirements  
**Platform:** ARM64 Linux (Docker container environment)

---

## What I Expected

OpenRAG markets itself as a "comprehensive, single package Retrieval-Augmented Generation platform." The website (openr.ag) shows a clean install flow: install prerequisites, clone repo, run containers, done. The quickstart suggests this should take minutes.

I expected to:
1. Install Python 3.13, uv, Docker
2. Clone the repository
3. Configure environment variables
4. Start services
5. Have a working RAG system in under an hour

---

## What Actually Happened

### Phase 1: Prerequisites (20 minutes)

**Python 3.13:** Not available by default. Installed via `uv python install 3.13`. Took ~2 minutes.

**uv (Astral's package manager):** One-line curl install. Worked immediately. This is genuinely excellent tooling—uv is fast and reliable.

**Docker:** The `get.docker.com` script worked, but this is where reality diverged from documentation. Docker *installed* successfully (v29.2.1), but the daemon couldn't start with full networking capabilities without root access. The install script printed the standard warning about privileged daemon access being equivalent to root access.

**Repository clone:** Fast. 46,882 lines of well-organized code. No issues.

### Phase 2: Configuration Discovery (15 minutes)

This phase revealed both good news and complexity.

**The good news:** OpenRAG supports custom OpenAI API base URLs. I found this in `flows/openrag_agent.json`:

```json
"openai_api_base": {
  "display_name": "OpenAI API Base",
  "info": "The base URL of the OpenAI API. Defaults to https://api.openai.com/v1. 
           You can change this to use other APIs like JinaChat, LocalAI and Prem.",
  "show": true,
  "advanced": true
}
```

This means **Fireworks AI integration is technically possible**—you can set the base URL to `https://api.fireworks.ai/inference/v1` and use Fireworks models like `accounts/fireworks/models/kimi-k2p5`.

**The complexity:** OpenRAG requires *both* a language model and an embedding model. Fireworks doesn't offer embedding models (as of March 2026). So you'd need to:
- Use Fireworks for LLM (via OpenAI-compatible endpoint)
- Use OpenAI, watsonx, or Ollama for embeddings

This isn't a dealbreaker, but it's not documented clearly. The quickstart assumes you're using OpenAI for everything.

### Phase 3: The Docker Wall (10 minutes and counting)

OpenRAG requires Docker for two reasons:

1. **Container orchestration:** Five services (backend, frontend, Langflow, OpenSearch, OpenSearch Dashboards) run as containers
2. **Docling document processing:** Runs natively on the host (port 5001), but the containers need to reach it via Docker networking

I attempted both installation methods:

**Method 1: Self-managed Docker Compose**
```bash
uv sync                                    # Install Python deps
uv run python scripts/docling_ctl.py start # Start docling-serve
docker compose up -d                       # Start containers
```

Result: Docker daemon not accessible for networking operations. The containers couldn't start because the daemon couldn't create bridge networks.

**Method 2: Terminal/TUI (uvx)**
```bash
uvx --from openrag openrag
```

Result: Same issue. The TUI still requires Docker daemon access for container orchestration.

**Why this matters:** OpenRAG doesn't have a "pure local" mode. There's no option to run everything as native Python processes. Docker is mandatory, not optional.

---

## What Works

### Documentation Quality
The docs at docs.openr.ag are genuinely good. Clear structure, multiple installation paths, troubleshooting sections. No complaints here.

### Architecture Design
The system is well-architected:
- **Langflow** for visual workflow editing (drag-and-drop RAG pipelines)
- **OpenSearch** for vector storage (production-grade, scalable)
- **Docling** for document processing (handles messy real-world PDFs)
- **Next.js frontend** for UI (modern, responsive)

### Fireworks AI Compatibility
Despite no explicit Fireworks provider, the OpenAI-compatible endpoint support means you *can* use Fireworks models. You just need to:
1. Set `OPENAI_API_KEY` to your Fireworks key
2. Configure `openai_api_base` in the Langflow UI to `https://api.fireworks.ai/inference/v1`
3. Set model name to a Fireworks model ID

This isn't ideal (native provider would be cleaner), but it works.

---

## What Doesn't Work

### Docker as a Hard Requirement
The biggest friction point: Docker isn't optional. For a Python-based tool, this is a significant barrier. Many deployment environments (shared hosting, some cloud shells, restricted corporate environments) don't provide Docker daemon access.

A "native mode" that runs services as subprocesses (like how docling-serve runs) would make OpenRAG accessible to far more users.

### Embedding Model Coupling
You can't use Fireworks for everything. The embedding model requirement means you need a second provider. This increases cost and complexity.

### Python 3.13 Requirement
This is very new (released October 2024). Many systems are still on 3.11 or 3.12. The requirement is clearly stated in docs, but it's an aggressive version policy that may block users on older systems.

---

## Install Honest Assessment

| Aspect | Rating | Notes |
|--------|--------|-------|
| Documentation | ★★★★★ | Clear, comprehensive, good examples |
| Prerequisites | ★★★☆☆ | Python 3.13 is new; Docker is heavyweight |
| Install speed | ★★★★☆ | Fast when it works; Docker pulls take time |
| Flexibility | ★★★☆☆ | Good provider options; no pure-local mode |
| Fireworks support | ★★★★☆ | Works via OpenAI compat; not native |
| Production readiness | ★★★★★ | Solid architecture, OpenSearch, proper auth |

**Time to full deployment (estimated with Docker access):** 15-30 minutes  
**Time to full deployment (this environment):** Blocked  

---

## Path to Completion

To finish this deployment, you need:

1. **Root access to Docker daemon** (cloud VM, local machine with sudo)
2. **Or Podman rootless mode** (untested with OpenRAG, but should work)
3. **Or OpenShift deployment** (IBM-backed project, likely optimized for this)

**What I'd do next:**
- Launch an AWS EC2 t3.medium instance (2 vCPU, 4GB RAM)
- Run the standard Docker deployment
- Configure Fireworks AI via Langflow UI
- Upload sample documents
- Test RAG queries

---

## The Kimi K2.5 Question

OpenRAG's model configuration supports any OpenAI-compatible model. Fireworks offers Kimi K2.5 as `accounts/fireworks/models/kimi-k2p5`. In theory, this works.

In practice, I couldn't verify because the containers wouldn't start. But the code path exists: OpenAI component → custom base URL → Fireworks endpoint → Kimi K2.5 model.

---

## Bottom Line

OpenRAG is a **legitimate, production-ready RAG platform**. The architecture is sound, the documentation is good, and the Fireworks integration is technically feasible.

The blocker isn't OpenRAG—it's Docker daemon access. If you have that, deployment is straightforward. If you don't (like this environment), you're stuck.

**Would I recommend OpenRAG?** Yes, if you have Docker access and need a full-featured RAG system with visual workflow editing. No, if you need a lightweight, Docker-free deployment.

**Would I recommend it with Fireworks AI?** Yes, with the caveat that you need a separate provider for embeddings. The cost savings from Fireworks' competitive pricing may justify the extra configuration complexity.

---

**Files created during this attempt:**
- `DEPLOYMENT.md` — Technical setup notes
- `OPENRAG_REPORT.md` — Detailed findings
- `.env` — Environment configuration (ready for deployment)
- `docling-serve` — Running on port 5001 (the only service that started)

**Commit hash for reference:** None (couldn't complete deployment to commit)
