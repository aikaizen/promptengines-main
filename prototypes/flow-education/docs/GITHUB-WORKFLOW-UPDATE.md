# GitHub Actions Workflow Update Required

## Problem
The current workflow doesn't build the React app before deploying. It just runs `vercel --prod` which won't include the built `dist/` folder.

## Required Change

Update `.github/workflows/vercel-deploy.yml` to include build steps:

```yaml
name: Deploy to Vercel Production

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies (Flow Education App)
        working-directory: ./prototypes/flow-education/app
        run: npm ci

      - name: Build Flow Education App
        working-directory: ./prototypes/flow-education/app
        run: npm run build

      - name: Deploy to Vercel
        run: npx vercel --prod --token=${{ secrets.VERCEL_TOKEN }} --yes
        env:
          VERCEL_ORG_ID: team_yag4e6cXLy2cgjEjcZUkAnAK
          VERCEL_PROJECT_ID: prj_GHmqLUmKqTHoXyik1acT4GbGeoiZ
```

## How to Apply This Fix

### Option 1: Via GitHub Web Interface (Easiest)
1. Go to https://github.com/aikaizen/promptengines-main
2. Navigate to `.github/workflows/vercel-deploy.yml`
3. Click Edit (pencil icon)
4. Replace content with above
5. Commit directly to main

### Option 2: Via New PAT with Workflow Scope
1. Generate new PAT at https://github.com/settings/tokens
2. Select scopes: `repo` AND `workflow`
3. Store securely (don't share in chat)
4. Update your local git config or re-authenticate
5. Apply the workflow changes via git push

### Option 3: Manual Vercel Build Settings
Configure Vercel to build the React app during deployment:
1. Go to https://vercel.com/dashboard
2. Select `promptengines` project
3. Go to Settings → Build & Development Settings
4. Set:
   - Build Command: `cd prototypes/flow-education/app && npm ci && npm run build`
   - Output Directory: `prototypes/flow-education/app/dist`
   - Install Command: (leave default)

## Current Status
✅ App code is production-ready and pushed  
✅ dist/ folder is in the repo (works for static deployment)  
⏳ GitHub Actions workflow needs update for automatic builds

## Alternative: Current dist/ Works Now
Since the `dist/` folder is already committed, the app is currently deployable. The workflow update is only needed if you want automatic builds on every push (rather than committing dist/ each time).

**Recommendation:** Committing `dist/` is fine for MVP. Update workflow later for cleaner CI/CD.
