# Complete GitHub + Railway Setup Guide

## 5-Step Setup Process

### Step 1: Initialize Git & Push to GitHub

**✅ COMPLETED:**
- .gitignore created (excludes node_modules, .env, dist, build, etc.)
- .env.example created (documents all required variables, no secrets)
- Railway.json configured (already exists in project)

**YOUR ACTION ITEMS:**

1. **Create GitHub Repository**
   - Go to https://github.com/new
   - Repository name: `WCAG-AI-Platform`
   - Description: "Industry-agnostic accessibility auditing platform with agentic automation"
   - Public or Private (your choice)
   - Click "Create Repository"

2. **Configure Local Git** (Run in Replit terminal)
   ```bash
   # Check if git is initialized
   git status
   
   # If not, initialize
   git init
   
   # Add GitHub remote (replace YOUR_USERNAME)
   git remote add origin https://github.com/YOUR_USERNAME/WCAG-AI-Platform.git
   
   # Verify
   git remote -v
   ```

3. **Create Branches**
   ```bash
   # Create and switch to main branch
   git checkout -b main 2>/dev/null || git checkout main
   
   # Create dev branch
   git checkout -b dev
   
   # Verify branches exist
   git branch -a
   # Should show: main and dev
   ```

4. **Push to GitHub**
   ```bash
   # From dev branch, push code
   git push -u origin dev
   
   # Switch to main and push
   git checkout main
   git push -u origin main
   ```

---

### Step 2: Configure Railway Auto-Deployment

**✅ FILES READY:**
- railway.json (deployment configuration)
- .github/workflows/deploy.yml (GitHub Actions workflow)
- scripts/verify-deployment.sh (post-deployment tests)

**YOUR ACTION ITEMS:**

1. **Create Railway Project**
   - Go to https://railway.app
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Authorize Railway (one-time)
   - Select `WCAG-AI-Platform` repository
   - Select `main` branch
   - Click "Deploy"

2. **Set Environment Variables**
   - In Railway project, go to **Variables**
   - Add required variables:
     ```
     DATABASE_URL=postgresql://user:password@host:port/database
     NODE_ENV=production
     PORT=5000
     SESSION_SECRET=<your-32-char-random-string>
     AI_INTEGRATIONS_ANTHROPIC_API_KEY=sk-ant-...
     ```

3. **Enable Auto-Deploy**
   - Go to **Settings** → **Deployments**
   - Enable "Automatically deploy on push"
   - Select branch: `main`
   - Enable "Deploy preview environments"
   - Save

4. **Configure Health Checks**
   - Go to **Settings** → **Health Checks**
   - Enable health checks
   - Path: `/api/health`
   - Interval: 10 seconds
   - Timeout: 30 seconds

---

### Step 3: Enable Continuous Iteration Workflow

**✅ SETUP GUIDE CREATED:**
- GITHUB_WORKFLOW_SETUP.md (step-by-step instructions)
- RAILWAY_CI_CD_SETUP.md (detailed CI/CD configuration)
- DEPLOYMENT_WORKFLOW_SUMMARY.md (quick reference)

**YOUR BRANCHES:**
```
main branch:
  ├─ Production (Railway auto-deploys)
  ├─ Protected with PR requirement
  └─ Only merged, tested code

dev branch:
  ├─ Your working branch
  ├─ Work here in Replit
  ├─ Frequent commits OK
  └─ Source for PRs to main
```

**BRANCH PROTECTION SETUP:**
1. Go to GitHub repo → **Settings** → **Branches**
2. Add rule for `main` branch
3. Enable:
   - Require pull request reviews (1 review)
   - Require status checks to pass
   - Require branches up to date before merge

---

### Step 4: Create Development Workflow

**✅ WORKFLOW CONFIGURED:**
- Work in dev branch (Replit iterations)
- Test locally before committing
- Push frequently to dev
- Create PRs to main when ready to deploy
- Railway previews changes before merge
- Auto-deploy to production after merge

**DAILY WORKFLOW:**

```bash
# Every day in Replit:

# 1. Start working (dev branch)
git checkout dev
git pull origin dev

# 2. Make changes and test
# Edit files...
npm run dev  # Test locally

# 3. Commit changes
git add .
git commit -m "Feature: Clear description"
git push origin dev

# 4. When ready to deploy:
# Go to GitHub and create PR (dev → main)
# Wait for Railway preview (2-3 minutes)
# Test preview at the provided URL
# Approve and merge

# 5. Railway auto-deploys (2-5 minutes)
# Production updated automatically!
```

---

### Step 5: Create .ENV.EXAMPLE

**✅ COMPLETED:**

File `.env.example` created with all required variables documented:

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=password
PGDATABASE=wcag_platform

# Application
NODE_ENV=production
PORT=5000
SESSION_SECRET=your-super-secure-random-session-secret-here

# AI Integration (via Replit integrations)
AI_INTEGRATIONS_ANTHROPIC_API_KEY=sk-ant-your-anthropic-api-key-here
AI_INTEGRATIONS_ANTHROPIC_BASE_URL=https://api.anthropic.com

# Optional services...
```

**Why .env.example?**
- ✅ Documents what variables are needed
- ✅ Included in GitHub (no secrets exposed)
- ✅ Railway developers can copy and fill in values
- ✅ Safe to commit (no credentials inside)

---

## Complete Setup Checklist

### Part 1: Git & GitHub (15 min)
- [ ] Create GitHub repo (WCAG-AI-Platform)
- [ ] Configure git remote locally
- [ ] Create main and dev branches
- [ ] Push code to both branches
- [ ] Enable branch protection on main

### Part 2: Railway Configuration (15 min)
- [ ] Create Railway project
- [ ] Connect GitHub repository
- [ ] Set environment variables
- [ ] Enable auto-deploy on push
- [ ] Configure health checks

### Part 3: Testing (10 min)
- [ ] Make test change in dev
- [ ] Push to dev branch
- [ ] Create PR (dev → main)
- [ ] Wait for Railway preview
- [ ] Merge PR to main
- [ ] Watch deployment in Railway
- [ ] Verify production endpoint

### Total Setup Time: 40 minutes

---

## Files Created & Configured

| File | Purpose | Status |
|------|---------|--------|
| `.gitignore` | Exclude secrets & build files | ✅ Updated |
| `.env.example` | Document env variables | ✅ Created |
| `railway.json` | Railway deployment config | ✅ Already exists |
| `.github/workflows/deploy.yml` | GitHub Actions CI/CD | ✅ Already exists |
| `scripts/verify-deployment.sh` | Verification tests | ✅ Already exists |
| `GITHUB_WORKFLOW_SETUP.md` | GitHub setup guide | ✅ Created |
| `RAILWAY_CI_CD_SETUP.md` | Railway setup guide | ✅ Created |
| `DEPLOYMENT_WORKFLOW_SUMMARY.md` | Quick reference | ✅ Created |

---

## Your Workflow After Setup

### Development Cycle (Daily)

```
┌─ REPLIT (Dev Environment)
│  1. Make code changes
│  2. Test locally: npm run dev
│  3. Commit: git add . && git commit
│  4. Push: git push origin dev
│
├─ GITHUB (Code Review)
│  5. Create Pull Request (dev → main)
│  6. Review & test
│  7. Merge PR
│
└─ RAILWAY (Production)
   8. Auto-deployment triggered
   9. Health checks pass
   10. Production updated live
```

### Every Change Flows Like This:
```
Replit Code Change
       ↓ (git push)
GitHub Dev Branch
       ↓ (create PR)
GitHub Main Branch (after merge)
       ↓ (webhook)
Railway Auto-Deploy
       ↓ (2-5 min)
Production Live
```

---

## First Deployment Example

### 1. Setup Complete (10:00 AM)
- GitHub repo created ✅
- Railway connected ✅
- Branches configured ✅
- Variables set ✅

### 2. Test Change (10:05 AM)
```bash
# In Replit, make small change
echo "// Test comment" >> server/routes.ts
git add .
git commit -m "Test: Verify deployment workflow"
git push origin dev
```

### 3. Create PR (10:10 AM)
- Go to GitHub repo
- Create PR: dev → main
- Railway creates preview deployment (2-3 min)
- Test works at preview URL ✅

### 4. Merge & Deploy (10:15 AM)
- Merge PR to main
- GitHub webhook triggers Railway
- Deployment starts

### 5. Production Live (10:20 AM)
- Railway deployment complete ✅
- Health checks pass ✅
- Production endpoint responding ✅
- Change live in production!

**Total: 20 minutes from first change to production** 🚀

---

## Quick Reference: Most Common Commands

**In Replit terminal:**
```bash
# Check status
git status

# Switch branch
git checkout dev
git checkout main

# Update from GitHub
git pull origin dev
git pull origin main

# Add and commit
git add .
git commit -m "Feature description"

# Push to GitHub
git push origin dev

# View recent commits
git log --oneline -5

# Delete local branch (after merge)
git branch -d feature-name
```

---

## Troubleshooting

### Setup Issues

**"Repository not found"**
- Verify GitHub repo name matches exactly
- Check git remote: `git remote -v`
- Fix: `git remote set-url origin <correct-url>`

**"Branch not found"**
- Create and push: `git checkout -b dev && git push -u origin dev`

**"Permission denied"**
- Generate SSH key on GitHub
- Or use HTTPS token authentication

### Deployment Issues

**"Preview not showing in PR"**
- Enable in Railway: Settings → Deploy preview environments

**"Production deployment failed"**
- Check Railway logs in Deployments tab
- Verify environment variables are set
- Review .github/workflows/deploy.yml

**"Health check failing"**
- Verify /api/health endpoint works locally
- Check DATABASE_URL in Railway
- Check PORT=5000 is set

---

## Success Criteria

✅ Setup complete when:
1. GitHub repo created with main & dev branches
2. Railway project created & connected to GitHub
3. Environment variables set in Railway
4. Auto-deploy enabled (on main branch push)
5. First PR merged to main triggers deployment
6. Production endpoint responding healthy
7. Can see deployment logs in real-time
8. Can rollback to previous deployment

---

## Next Steps (In Order)

1. **Create GitHub repo** (5 min)
   - Go to github.com/new
   - Name: WCAG-AI-Platform
   - Create repo

2. **Configure git locally** (5 min)
   - Run commands in "Step 1" above
   - Push code to GitHub

3. **Set up Railway** (15 min)
   - Create Railway project
   - Connect GitHub
   - Set environment variables
   - Enable auto-deploy

4. **Verify setup** (5 min)
   - Create test PR
   - Watch deployment
   - Test production endpoint

5. **Start iterating** (ongoing)
   - Work in dev branch in Replit
   - Create PRs to main
   - Auto-deploys to production

---

## Support Documents

For detailed information, refer to:
- **GITHUB_WORKFLOW_SETUP.md** - GitHub setup details
- **RAILWAY_CI_CD_SETUP.md** - Railway configuration details
- **DEPLOYMENT_WORKFLOW_SUMMARY.md** - Workflow quick reference
- **QUICK_START_DEPLOYMENT.md** - Deployment 5-minute guide

---

**Status: 🟢 READY FOR SETUP**

All files prepared. Follow the 5 steps above to complete setup.
Once configured, you'll have:
- ✅ Continuous deployment from main to production
- ✅ Instant preview deployments for PRs
- ✅ Automated health checks
- ✅ Full rollback capability
- ✅ Seamless Replit + GitHub + Railway integration

**Time to complete setup: 40-50 minutes**
**Time to first production deployment: 60 minutes**
