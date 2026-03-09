# PromptEngines GWS Agent Docker Image
# ------------------------------------
# Google Workspace CLI agent for automated operations.
# Uses service account credentials mounted at runtime.
#
# Build:
#   docker build -t promptengines-gws-agent ./docker/gws-agent
#
# Run (mount credentials read-only):
#   docker run --rm \
#     -v /path/to/service-account-key.json:/etc/gws/service-account-key.json:ro \
#     -e GWS_SERVICE_ACCOUNT_KEY=/etc/gws/service-account-key.json \
#     -e GCP_PROJECT_ID=promptengines-claude \
#     promptengines-gws-agent
#
# Interactive shell for debugging:
#   docker run --rm -it \
#     -v /path/to/service-account-key.json:/etc/gws/service-account-key.json:ro \
#     -e GWS_SERVICE_ACCOUNT_KEY=/etc/gws/service-account-key.json \
#     promptengines-gws-agent /bin/bash

FROM node:20-slim

LABEL maintainer="PromptEngines <team@promptengines.com>"
LABEL description="GWS CLI agent for Google Workspace automation"

# Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      ca-certificates \
      curl \
      jq \
    && rm -rf /var/lib/apt/lists/*

# Install Google Workspace CLI globally
RUN npm install -g @googleworkspace/cli

# Create credential mount points
RUN mkdir -p /etc/gws && \
    mkdir -p /home/node/.config/gws && \
    chown -R node:node /home/node/.config/gws

# Create working directory for agent output
RUN mkdir -p /workspace && chown -R node:node /workspace

# Copy entrypoint script
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Copy custom skills
COPY skills/ /opt/gws-skills/

# Environment variables (override at runtime)
ENV GWS_SERVICE_ACCOUNT_KEY=/etc/gws/service-account-key.json
ENV GWS_OUTPUT_FORMAT=json
ENV GCP_PROJECT_ID=promptengines-claude
ENV NODE_ENV=production

# Run as non-root user
USER node
WORKDIR /workspace

ENTRYPOINT ["entrypoint.sh"]
CMD ["--help"]
