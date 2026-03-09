#!/usr/bin/env bash
# PromptEngines GWS Agent Entrypoint
# -----------------------------------
# Validates credentials and environment before executing gws commands.

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info()  { echo -e "${GREEN}[gws-agent]${NC} $*"; }
log_warn()  { echo -e "${YELLOW}[gws-agent]${NC} $*"; }
log_error() { echo -e "${RED}[gws-agent]${NC} $*" >&2; }

# --- Credential Validation ---

if [ ! -f "$GWS_SERVICE_ACCOUNT_KEY" ]; then
    log_error "Service account key not found at $GWS_SERVICE_ACCOUNT_KEY"
    log_error "Mount your key file with: -v /path/to/key.json:$GWS_SERVICE_ACCOUNT_KEY:ro"
    exit 1
fi

# Verify the key file is valid JSON with required fields
if ! jq -e '.client_email' "$GWS_SERVICE_ACCOUNT_KEY" > /dev/null 2>&1; then
    log_error "Invalid service account key: missing client_email field"
    exit 1
fi

SA_EMAIL=$(jq -r '.client_email' "$GWS_SERVICE_ACCOUNT_KEY")
log_info "Service account: $SA_EMAIL"
log_info "Project: $GCP_PROJECT_ID"

# --- GWS CLI Verification ---

if ! command -v gws &> /dev/null; then
    log_error "gws CLI not found. Image may be corrupted."
    exit 1
fi

GWS_VERSION=$(gws --version 2>/dev/null || echo "unknown")
log_info "gws CLI version: $GWS_VERSION"

# --- Execute Command ---

if [ "$#" -eq 0 ] || [ "$1" = "--help" ]; then
    echo ""
    log_info "PromptEngines GWS Agent"
    echo "  Usage: docker run [options] promptengines-gws-agent <gws-command> [args...]"
    echo ""
    echo "  Examples:"
    echo "    docker run ... promptengines-gws-agent calendar list"
    echo "    docker run ... promptengines-gws-agent drive list --max-results=10"
    echo "    docker run ... promptengines-gws-agent gmail list --max-results=5"
    echo ""
    echo "  Environment Variables:"
    echo "    GWS_SERVICE_ACCOUNT_KEY  Path to service account JSON key (default: /etc/gws/service-account-key.json)"
    echo "    GWS_OUTPUT_FORMAT        Output format: json, table, csv (default: json)"
    echo "    GCP_PROJECT_ID           Google Cloud project ID (default: promptengines-claude)"
    echo ""
    exit 0
fi

log_info "Executing: gws $*"
exec gws "$@"
