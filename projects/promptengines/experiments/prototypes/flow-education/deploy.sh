#!/bin/bash
# deploy.sh — Deploy Flow Education site to promptengines.com

# Configuration
REMOTE_USER="your-username"
REMOTE_HOST="promptengines.com"
REMOTE_DIR="/var/www/floweducation"
LOCAL_DIR="projects/promptengines/experiments/flow-education"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Deploying Flow Education site...${NC}"

# Check if local directory exists
if [ ! -d "$LOCAL_DIR" ]; then
    echo "Error: $LOCAL_DIR not found"
    exit 1
fi

# Deploy via SCP (requires SSH key setup)
echo "Copying files to $REMOTE_HOST..."

# Create remote directory if needed
ssh $REMOTE_USER@$REMOTE_HOST "mkdir -p $REMOTE_DIR"

# Copy HTML files
scp $LOCAL_DIR/*.html $REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR/

# Copy markdown docs
scp $LOCAL_DIR/*.md $REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR/

# Copy subdirectories
scp -r $LOCAL_DIR/lessons $REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR/
scp -r $LOCAL_DIR/tools $REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR/
scp -r $LOCAL_DIR/docs $REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR/

echo -e "${GREEN}✓ Deployment complete!${NC}"
echo ""
echo "Site available at: https://promptengines.com/floweducation"
