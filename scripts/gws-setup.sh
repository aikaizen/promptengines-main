#!/usr/bin/env bash
# PromptEngines — Local GWS CLI Setup
# ------------------------------------
# Checks prerequisites, installs the gws CLI, guides through OAuth,
# and verifies basic operations.
#
# Usage:
#   chmod +x scripts/gws-setup.sh
#   ./scripts/gws-setup.sh

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

PASS=0
FAIL=0

log_step()    { echo -e "\n${CYAN}${BOLD}[$1]${NC} $2"; }
log_ok()      { echo -e "  ${GREEN}OK${NC} $*"; PASS=$((PASS + 1)); }
log_fail()    { echo -e "  ${RED}FAIL${NC} $*"; FAIL=$((FAIL + 1)); }
log_warn()    { echo -e "  ${YELLOW}WARN${NC} $*"; }
log_info()    { echo -e "  $*"; }

echo -e "${BOLD}PromptEngines — GWS CLI Setup${NC}"
echo "=============================="

# -------------------------------------------------------------------
# 1. Check Node.js
# -------------------------------------------------------------------
log_step "1/6" "Checking Node.js"

if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    log_ok "Node.js $NODE_VERSION"
else
    log_fail "Node.js not found. Install Node.js 18+ from https://nodejs.org"
    echo "  Cannot continue without Node.js."
    exit 1
fi

# -------------------------------------------------------------------
# 2. Check / Install gws CLI
# -------------------------------------------------------------------
log_step "2/6" "Checking gws CLI"

if command -v gws &> /dev/null; then
    GWS_VERSION=$(gws --version 2>/dev/null || echo "unknown")
    log_ok "gws CLI installed ($GWS_VERSION)"
else
    log_warn "gws CLI not found. Installing..."
    if npm install -g @googleworkspace/cli; then
        GWS_VERSION=$(gws --version 2>/dev/null || echo "unknown")
        log_ok "gws CLI installed ($GWS_VERSION)"
    else
        log_fail "Failed to install gws CLI"
        echo "  Try manually: npm install -g @googleworkspace/cli"
        exit 1
    fi
fi

# -------------------------------------------------------------------
# 3. Check Google Cloud project setup
# -------------------------------------------------------------------
log_step "3/6" "Checking Google Cloud project"

if command -v gcloud &> /dev/null; then
    CURRENT_PROJECT=$(gcloud config get-value project 2>/dev/null || echo "")
    if [ -n "$CURRENT_PROJECT" ]; then
        log_ok "gcloud project: $CURRENT_PROJECT"
    else
        log_warn "No gcloud project set. Run: gcloud config set project <PROJECT_ID>"
    fi
else
    log_warn "gcloud CLI not installed (optional but recommended)"
    log_info "Install from: https://cloud.google.com/sdk/docs/install"
    log_info "You can still use gws with manual OAuth setup."
fi

# -------------------------------------------------------------------
# 4. Check for existing credentials
# -------------------------------------------------------------------
log_step "4/6" "Checking credentials"

GWS_CONFIG_DIR="${HOME}/.config/gws"
CRED_FILE="${GWS_CONFIG_DIR}/credentials.json"
CLIENT_SECRET_FILE="${GWS_CONFIG_DIR}/client_secret.json"

if [ -f "$CRED_FILE" ]; then
    log_ok "Credentials found at $CRED_FILE"
elif [ -f "$CLIENT_SECRET_FILE" ]; then
    log_warn "Client secret found but no credentials yet."
    log_info "Run the OAuth flow to generate credentials (next step)."
else
    log_warn "No credentials found at $GWS_CONFIG_DIR"
    echo ""
    echo "  To set up credentials:"
    echo "  1. Go to https://console.cloud.google.com/apis/credentials"
    echo "  2. Create OAuth 2.0 Client ID (Desktop Application)"
    echo "  3. Download the JSON file"
    echo "  4. Save it to: $CLIENT_SECRET_FILE"
    echo ""
    read -rp "  Have you placed client_secret.json? (y/n) " answer
    if [ "$answer" != "y" ]; then
        log_info "Skipping OAuth flow. Re-run this script after placing the file."
    fi
fi

# -------------------------------------------------------------------
# 5. OAuth flow
# -------------------------------------------------------------------
log_step "5/6" "OAuth authentication"

if [ -f "$CRED_FILE" ]; then
    log_ok "Already authenticated"
elif [ -f "$CLIENT_SECRET_FILE" ]; then
    echo "  Starting OAuth flow — a browser window will open."
    echo "  Grant the requested permissions and return here."
    echo ""
    if gws auth setup 2>/dev/null; then
        log_ok "OAuth flow completed"
    else
        log_fail "OAuth flow failed. Check your client_secret.json and try again."
    fi
else
    log_warn "Skipping OAuth — no client_secret.json found"
fi

# -------------------------------------------------------------------
# 6. Test basic operations
# -------------------------------------------------------------------
log_step "6/6" "Testing basic operations"

if [ -f "$CRED_FILE" ]; then
    # Test calendar access
    echo "  Testing calendar list..."
    if gws calendar list --max-results=1 > /dev/null 2>&1; then
        log_ok "Calendar API working"
    else
        log_fail "Calendar API failed (API may not be enabled)"
    fi

    # Test drive access
    echo "  Testing drive list..."
    if gws drive list --max-results=1 > /dev/null 2>&1; then
        log_ok "Drive API working"
    else
        log_fail "Drive API failed (API may not be enabled)"
    fi
else
    log_warn "Skipping API tests — not authenticated"
fi

# -------------------------------------------------------------------
# Summary
# -------------------------------------------------------------------
echo ""
echo "=============================="
echo -e "${BOLD}Setup Summary${NC}"
echo "=============================="
echo -e "  ${GREEN}Passed:${NC} $PASS"
echo -e "  ${RED}Failed:${NC} $FAIL"
echo ""

if [ "$FAIL" -eq 0 ]; then
    echo -e "  ${GREEN}${BOLD}All checks passed.${NC} GWS CLI is ready to use."
else
    echo -e "  ${YELLOW}${BOLD}Some checks failed.${NC} Review the output above and re-run."
fi

echo ""
echo "  Next steps:"
echo "  - Test commands:  gws calendar list"
echo "  - Full docs:      docs/gws-setup-guide.md"
echo "  - PRD:            docs/prds/gws-google-workspace-cli-integration.md"
echo ""
