# Agentic PR Merge & Vercel Deployment Guide

## Overview

This guide explains how to automatically merge PRs with conflicts and deploy to Vercel using the **agentic workflow** I just created.

## Quick Start (3 Steps)

### Step 1: Set Up Secrets

Go to **Settings → Secrets and variables → Actions** and add:

```bash
# Vercel Secrets (from https://vercel.com/account/tokens)
VERCEL_TOKEN=your_vercel_token_here
VERCEL_ORG_ID=your_org_id_here
VERCEL_PROJECT_ID=your_project_id_here

# API URL for frontend
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

**Get Vercel IDs:**
```bash
# In your frontend directory:
npx vercel link
cat .vercel/project.json
```

### Step 2: Run the Workflow

1. Go to **Actions** tab
2. Select "Auto Merge & Deploy to Vercel" workflow
3. Click "Run workflow"
4. Enter:
   - **PR number**: 19 (for your first PR)
   - **Strategy**: Choose one:
     - `ours` = Keep PR changes (recommended)
     - `theirs` = Keep main branch changes
     - `manual` = Smart auto-resolve specific files

5. Click "Run workflow"

### Step 3: Watch It Work

The workflow will:
- ✅ Auto-resolve merge conflicts
- ✅ Merge the PR
- ✅ Deploy to Vercel
- ✅ Comment deployment URL on the PR

##  Conflict Resolution Strategies

### Strategy: `ours` (Recommended)
```bash
git merge -X ours
```
- Keeps **all changes from the PR branch**
- Use when: PR has the latest/correct code
- **Best for PR #19** since it has the new InfinitySoul-AIS structure

### Strategy: `theirs`
```bash
git merge -X theirs
```
- Keeps **all changes from main branch**
- Use when: Main has critical fixes you need

### Strategy: `manual`
```bash
# Auto-resolves these specific files:
- package.json → Takes PR version
- backend/intel/riskDistribution/index.ts → Takes PR version
```
- Smart resolution for known conflicts
- **Use this if you want surgical precision**

##  Merge All 9 PRs Agentically

Create a bash script to merge all:

```bash
#!/bin/bash
# save as: merge-all-prs.sh

PRS=(27 26 25 24 23 22 21 20 19)

for pr in "${PRS[@]}"; do
  echo "🤖 Merging PR #$pr..."
  
  gh workflow run auto-merge-deploy.yml \
    -f pr_number=$pr \
    -f strategy=ours
  
  echo "⏳ Waiting 60s for workflow to complete..."
  sleep 60
done

echo "✅ All PRs queued for merge!"
```

Run it:
```bash
chmod +x merge-all-prs.sh
./merge-all-prs.sh
```

##  Trim Bloat for Efficient Vercel Deployment

### Current Issues

1. **Monolithic `page.tsx`** (234 lines)
2. **Hardcoded configs** scattered everywhere
3. **No shared types** between frontend/backend
4. **100k+ words** of docs in repo

### Auto-Cleanup Script

Create `.github/workflows/trim-bloat.yml`:

```yaml
name: Trim Bloat

on:
  workflow_dispatch:

jobs:
  trim:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Remove doc bloat
        run: |
          # Move manifesto to separate repo
          mkdir -p ../infinitysoul-docs
          mv InfinitySoul-AIS/docs/MANIFESTO.md ../infinitysoul-docs/
          mv InfinitySoul-AIS/docs/ARCHITECTURE_JACOBS.md ../infinitysoul-docs/
          
          # Keep only deployment docs
          cd InfinitySoul-AIS/docs
          ls | grep -v "DEPLOYMENT\|API_DOCUMENTATION\|README" | xargs rm -f
      
      - name: Extract shared types
        run: |
          mkdir -p InfinitySoul-AIS/shared/types
          cat > InfinitySoul-AIS/shared/types/audit.ts << 'EOF'
export interface AuditReport {
  url: string;
  timestamp: string;
  modules: Record<string, any>;
  insuranceReadiness: InsuranceReadiness;
  vaultId: string;
}

export interface InsuranceReadiness {
  overall: number;
  riskTier: 'LOW' | 'MEDIUM' | 'HIGH';
  eligibleForCyber: boolean;
  breakdown: Record<string, number>;
}
EOF
      
      - name: Commit changes
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add .
          git commit -m "chore: trim bloat for efficient deployment"
          git push
```

##  Vercel Optimization

### Create `vercel.json` in frontend/

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "env": {
    "NEXT_PUBLIC_API_URL": "@next_public_api_url"
  },
  "build": {
    "env": {
      "NEXT_TELEMETRY_DISABLED": "1"
    }
  },
  "functions": {
    "app/**/*.tsx": {
      "memory": 1024,
      "maxDuration": 10
    }
  },
  "regions": ["iad1"],
  "framework": "nextjs"
}
```

### Optimize `next.config.js`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  },
  output: 'standalone',
  experimental: {
    optimizeCss: true
  }
}

module.exports = nextConfig
```

##  Monitoring Deployments

### Check Status
```bash
# List recent deployments
vercel ls --token $VERCEL_TOKEN

# Get deployment logs
vercel logs <deployment-url> --token $VERCEL_TOKEN
```

### Auto-Rollback on Failure

Add to workflow:
```yaml
- name: Health check
  run: |
    sleep 30
    STATUS=$(curl -o /dev/null -s -w "%{http_code}" https://your-app.vercel.app/api/health)
    if [ $STATUS -ne 200 ]; then
      vercel rollback --token ${{ secrets.VERCEL_TOKEN }}
      exit 1
    fi
```

##  Cost Optimization

### Free Tier Limits
- **Vercel Pro**: $20/month
  - 100GB bandwidth
  - Unlimited builds
  - Custom domains

- **Hobby (Free)**:
  - 100GB bandwidth
  - Fair use builds
  - .vercel.app domain

### Deploy Only Production
```yaml
# In workflow, add condition:
if: github.ref == 'refs/heads/main'
```

##  Troubleshooting

### Workflow fails with "conflicts"
```bash
# Re-run with different strategy:
gh workflow run auto-merge-deploy.yml \
  -f pr_number=19 \
  -f strategy=manual
```

### Build fails on Vercel
```bash
# Check logs:
gh run list --workflow=auto-merge-deploy.yml
gh run view <run_id> --log

# Common fixes:
# 1. Missing env vars → Add to secrets
# 2. Wrong node version → Update workflow
# 3. Missing dependencies → Run npm install locally first
```

### Deployment URL not commented
```bash
# Manually get URL:
vercel ls --token $VERCEL_TOKEN | head -n 1

# Or check Vercel dashboard:
https://vercel.com/dashboard
```

##  Next Steps

1. ✅ **Merge PR #19 first** (has core system)
2. ✅ **Run trim-bloat workflow** to clean up
3. ✅ **Merge remaining PRs** (20-27)
4. ✅ **Deploy to Vercel** automatically
5.  **Monitor** first deployment
6.  **Set up custom domain** on Vercel
7.  **Add health checks** for monitoring

## Pro Tips

- **Always use `ours` strategy** for feature PRs
- **Run locally first**: `npm run build` before pushing
- **Use Vercel preview** deploys for testing
- **Keep secrets in 1Password** or vault
- **Monitor builds** via Vercel dashboard or Slack

---

**Questions?** Open an issue or ping @aaj441

**Kluge would approve**: "The workflow is the moat, not the code."
