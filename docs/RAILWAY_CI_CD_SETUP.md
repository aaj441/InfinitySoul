# Railway CI/CD & Auto-Deployment Setup

## Overview

This guide sets up continuous deployment from GitHub main branch to Railway production environment with the following features:

✅ Auto-deploy on push to main  
✅ PR preview deployments  
✅ Environment variable management  
✅ Health checks & monitoring  
✅ Automated rollback capabilities  

---

## Prerequisites

- GitHub account with `WCAG-AI-Platform` repository
- Railway account (https://railway.app)
- Main branch protection enabled on GitHub
- All environment variables documented in `.env.example`

---

## Step 1: Connect Railway to GitHub

### 1.1 Create Railway Project

1. Go to https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Authorize Railway app on GitHub (if not already done)
5. Select `WCAG-AI-Platform` repository
6. Select `main` branch for production

### 1.2 Configure Service

Railway should auto-detect this is a Node.js app:
- **Service name:** `wcag-platform` (or auto-generated)
- **Start command:** `npm run dev` (from package.json scripts)
- **Build command:** `npm install` (auto-detected)

---

## Step 2: Environment Variables

### 2.1 Add Variables in Railway Dashboard

Go to **Project Settings** → **Variables**:

**Required Variables:**
```
DATABASE_URL=postgresql://user:password@host:port/database
NODE_ENV=production
PORT=5000
SESSION_SECRET=<generate-random-32-char-string>
AI_INTEGRATIONS_ANTHROPIC_API_KEY=sk-ant-...
```

**Optional Variables:**
```
LOB_API_KEY=test_...
OPENAI_API_KEY=sk-...
HUBSPOT_API_KEY=pat-...
GITHUB_TOKEN=ghp_...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

### 2.2 Getting Your Database URL

**Option A: Use Replit PostgreSQL**
- In Replit, click "Tools" → "Database" → Copy connection string
- Format: `postgresql://user:password@host:port/database`

**Option B: Use Railway PostgreSQL**
1. In Railway, create new service: PostgreSQL
2. Copy `DATABASE_URL` from environment variables
3. Add to Railway variables (from Step 2.1)

**Option C: Use Neon PostgreSQL** (Recommended for production)
1. Go to https://neon.tech
2. Create project and copy connection string
3. Add to Railway variables

### 2.3 Generate Strong SESSION_SECRET

```bash
# On your computer or in Replit shell:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Copy output and paste into Railway variables
```

---

## Step 3: Configure Auto-Deployment

### 3.1 Enable Auto-Deploy

In Railway project:
1. Go to **Deployments**
2. Click **Settings** (gear icon)
3. Enable "Automatically deploy on push"
4. Select branch: `main`
5. Save

### 3.2 Health Checks

1. Go to **Settings** → **Health Checks**
2. Enable health checks
3. URL path: `/api/health`
4. Timeout: 30 seconds
5. Interval: 10 seconds

Railway will restart service if health check fails.

### 3.3 Deployment Notifications

1. Go to **Project Settings** → **Integrations**
2. Add notification service (Slack, Discord, email)
3. Configure alerts:
   - Deployment started
   - Deployment succeeded
   - Deployment failed
   - Service crashed

---

## Step 4: Configure PR Preview Deployments (Optional)

### 4.1 Enable Preview Deployments

1. In Railway project settings
2. Enable "Deploy preview environments for pull requests"
3. Select `main` as production branch
4. Save

### 4.2 How It Works

When you create a PR from `dev` to `main`:
1. Railway creates temporary preview deployment
2. Preview URL appears in PR comments
3. You can test changes before merging
4. Preview auto-deleted when PR closed

---

## Step 5: Configure GitHub Branch Protection

### 5.1 Protect Main Branch

On GitHub:
1. Go to **Settings** → **Branches**
2. Click **Add rule**
3. Branch name pattern: `main`
4. Enable:
   - ✅ "Require pull request reviews before merging"
   - ✅ "Require code reviews" (number: 1)
   - ✅ "Require branches to be up to date before merging"
   - ✅ "Require status checks to pass before merging"
5. Save

### 5.2 Add Status Checks

If using GitHub Actions (optional CI):
1. Add required status checks
2. Example: `lint` / `test` / `build`
3. Railway auto-adds deployment check

---

## Step 6: GitHub Actions Workflow (Optional)

### 6.1 Use Existing Workflow

Your `.github/workflows/deploy.yml` already exists:

```yaml
name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm install
      - run: npm run test 2>/dev/null || echo "Tests passed"
```

This workflow runs on every push to main before Railway deployment.

### 6.2 Customize Workflow (Optional)

Edit `.github/workflows/deploy.yml` to add:
- Linting: `npm run lint`
- Type checking: `npm run type-check`
- Custom tests: `npm run test:integration`

---

## Step 7: Verify Deployment

### 7.1 First Deployment

1. Make small change to code in dev branch
2. Commit and push to dev: `git push origin dev`
3. Create PR: dev → main
4. Get approval
5. Merge PR
6. GitHub should notify Railway
7. Watch Railway deployments start

### 7.2 Check Deployment Status

In Railway:
1. Click **Deployments** tab
2. See latest deployment in progress
3. View logs in real-time
4. Check when "Status" shows green ✅

### 7.3 Test Production Endpoint

Once deployed:
```bash
# Replace with your Railway URL
curl https://your-railway-url/api/health

# Should return:
# {"status":"healthy","database":"connected","uptime":123.45}
```

---

## Continuous Deployment Workflow

### Daily Development Loop

```
1. Work in Replit on dev branch
   ├─ Edit files locally
   ├─ Test with: npm run dev
   └─ Verify changes work

2. Commit to GitHub
   ├─ git add .
   ├─ git commit -m "Clear description"
   └─ git push origin dev

3. Create Pull Request (GitHub web)
   ├─ Go to repository
   ├─ Click "Pull requests"
   ├─ Click "New pull request"
   ├─ Base: main, Compare: dev
   ├─ Add description
   └─ Click "Create pull request"

4. Review & Test
   ├─ Railway creates preview deployment
   ├─ Test at preview URL (shown in PR)
   ├─ Verify changes work
   └─ If issues, push more commits to dev

5. Merge to Main
   ├─ Approve PR
   ├─ Click "Merge pull request"
   ├─ GitHub confirms merge
   └─ PR closed

6. Auto-Deploy (Railway)
   ├─ GitHub webhook triggers Railway
   ├─ New deployment starts
   ├─ Health checks run
   ├─ Old version replaced
   └─ ✅ Production updated (2-5 min)

7. Verify Production
   ├─ Check logs in Railway dashboard
   ├─ Test production endpoint
   ├─ Monitor for 10 minutes
   └─ All good - continue working
```

---

## Monitoring & Troubleshooting

### View Logs

**In Railway:**
1. Click **Deployments** → Click deployment
2. View real-time logs in "Logs" tab
3. Search logs for errors or warnings
4. Download logs for analysis

**Common Log Lines:**
```
Starting service...
npm run dev
> dev
> tsx --watch server/index.ts
✨ Server running on http://localhost:5000
✅ Database connected
✅ All 8 industries loaded
🚀 Ready for requests
```

### Rollback Deployment

If production breaks:

1. In Railway, go to **Deployments**
2. Find the working deployment (before the broken one)
3. Click **Redeploy** button
4. Railway rolls back to that version
5. Investigate and fix issue in dev branch
6. Create new PR when ready

### Health Check Failures

If health checks keep failing:

1. Check database connection
2. Verify environment variables
3. Review deployment logs
4. Check if port 5000 is correct
5. Manual restart in Railway settings

### Database Connection Issues

```bash
# Test connection manually
# In Railway shell:
psql $DATABASE_URL -c "SELECT 1;"

# Should return: 1
# If not, verify DATABASE_URL format
```

---

## Performance & Scaling

### Monitor Response Times

1. In Railway, view **Metrics**
2. Monitor CPU, memory, and network
3. Check response time trends
4. Scale if CPU > 80% consistently

### Scale Railway

If experiencing high traffic:
1. Go to **Settings** → **Scaling**
2. Increase instance size (Small → Medium → Large)
3. Or add auto-scaling rules
4. Deploy again to activate

### Database Optimization

For Neon PostgreSQL:
- Use read replicas for analytics queries
- Enable connection pooling
- Monitor query performance

---

## Security Checklist

✅ Branch protection on main  
✅ All secrets in Railway (not GitHub)  
✅ GitHub 2FA enabled  
✅ Railway IP whitelisting (if needed)  
✅ Database backups enabled  
✅ Monitoring/alerting configured  
✅ Audit logs reviewed regularly  

---

## Example Deployment Timeline

### 10:00 AM - Start Work
```
Make changes in Replit (dev branch)
Test locally: npm run dev ✅
git push origin dev
```

### 10:15 AM - Create PR
```
GitHub: Create PR (dev → main)
Title: "Feature: Add new vertical insights endpoint"
Railway: Preview deployment starts (2 min)
```

### 10:20 AM - Test Preview
```
Railway: Preview URL ready: https://pr-preview-12345.railway.app
Test: curl https://pr-preview-12345.railway.app/api/vertical-insights ✅
All looks good!
```

### 10:25 AM - Merge & Deploy
```
GitHub: Approve and merge PR
GitHub: Push trigger sent to Railway
Railway: Deployment starts (automatic)
```

### 10:30 AM - Production Live
```
Railway: Deployment complete ✅
Status: Healthy with 0 errors
Production: curl https://wcag-platform.railway.app/api/health ✅
```

### 10:35 AM - Monitor
```
Railway Logs: No errors ✅
Response times: ~150ms average ✅
Health check: Passing ✅
Production verified!
```

---

## Revert Deployment (If Needed)

### Quick Revert
1. Open Railway Deployments
2. Find previous successful deployment
3. Click "Redeploy" on that deployment
4. Confirm revert
5. Production immediately reverted to stable version

### Full Revert (with code fix)
1. Find issue in dev branch
2. Fix code
3. `git push origin dev`
4. Create new PR with fix
5. Merge when ready
6. Auto-deploy fixed version

---

## Success Criteria

✅ Code pushed to main auto-triggers deployment  
✅ Railway deployment starts within 1 minute  
✅ Health checks pass after deployment  
✅ Production endpoint responding  
✅ Logs showing no errors  
✅ PR preview deployments working  
✅ Can rollback if needed  

---

## Next Steps

1. **Follow GitHub Workflow Setup** (GITHUB_WORKFLOW_SETUP.md)
2. **Connect Railway to GitHub** (Steps 1-2 above)
3. **Configure environment variables** (Step 2)
4. **Enable auto-deployment** (Step 3)
5. **Test with first PR** (Step 7)
6. **Monitor first deployment** (Troubleshooting section)

---

**Your continuous deployment pipeline is ready!** 🚀

Every push to `main` branch automatically deploys to production within 5 minutes.
