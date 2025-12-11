# Complete Deployment Workflow - Quick Reference

## Architecture

```
Replit (Dev)          GitHub                Railway (Production)
    ↓                   ↓                         ↓
[dev branch]  ─→  [dev branch]
    ↓                   ↓
[Changes] ────→ [Create PR]
    ↓                   ↓
[Test]        ←────[PR Preview]
    ↓                   ↓
[Ready?]  ────→ [Review & Merge]
    ↓                   ↓
             [main branch] ──→ [Webhook] ──→ [Deploy]
                                              ↓
                                          [Health Check]
                                              ↓
                                          [Production]
```

---

## The 5-Step Deployment Process

### Step 1: Setup (One-time)

```bash
# 1a. Create GitHub repo: WCAG-AI-Platform
# 1b. Configure git locally
git remote add origin https://github.com/YOUR_USERNAME/WCAG-AI-Platform.git
git branch -b main && git branch -b dev

# 1c. Push initial code
git push -u origin main
git push -u origin dev

# 1d. Configure Railway
# - Connect to GitHub repo (main branch)
# - Add environment variables
# - Enable auto-deploy on push
# - Enable health checks
```

**Time:** 15-20 minutes

---

### Step 2: Daily Development (Repeat)

```bash
# 2a. Work in Replit on dev branch
# Edit files, test with: npm run dev

# 2b. Commit changes
git add .
git commit -m "Clear feature description"
git push origin dev

# Time: 5 minutes per iteration
```

---

### Step 3: Create Pull Request (When ready to deploy)

```bash
# 3a. Go to GitHub repo
# 3b. Click "Pull requests" → "New pull request"
# 3c. Base: main, Compare: dev
# 3d. Add title and description
# 3e. Click "Create pull request"

# Railway auto-creates preview deployment
# Click preview URL in PR to test changes
```

**Time:** 2-3 minutes

---

### Step 4: Merge to Main (After review)

```bash
# 4a. Review code in PR
# 4b. Test at preview URL
# 4c. Click "Approve"
# 4d. Click "Merge pull request"
# 4e. Confirm merge
```

**Time:** 1 minute

---

### Step 5: Auto-Deploy to Production (Automatic)

```bash
# When PR is merged to main:
# 1. GitHub webhook triggers Railway
# 2. Railway fetches latest main branch
# 3. Railway runs: npm install
# 4. Railway starts: npm run dev
# 5. Health checks verify: /api/health
# 6. Production updated automatically

# ✅ Production live in 2-5 minutes!
```

**Time:** 2-5 minutes (automatic)

---

## Complete Example: Add New Endpoint

### Initial State
- Your code is in dev branch
- Main branch is in production
- Everything is working

### Step 1: Make Changes in Replit
```bash
# In Replit, edit file: server/routes.ts
# Add new endpoint: GET /api/new-feature

# Test locally:
npm run dev
# Verify at http://localhost:5000/api/new-feature
```

### Step 2: Commit to Dev
```bash
git add .
git commit -m "Feat: Add new endpoint for feature X"
git push origin dev
```

### Step 3: Create PR on GitHub
```
GitHub Web Interface:
1. Click "Pull requests" tab
2. Click "New pull request" button
3. Base: main, Compare: dev
4. Title: "Add new feature X endpoint"
5. Description: "This PR adds GET /api/new-feature
   - Does X
   - Returns Y format"
6. Click "Create pull request"
```

### Step 4: Test Preview
```
In PR comment, Railway posts preview URL
Click: https://pr-preview-xxxxx.railway.app
Test: curl https://pr-preview-xxxxx.railway.app/api/new-feature
Result: ✅ Working as expected
```

### Step 5: Merge PR
```
GitHub Web Interface:
1. Scroll to "Merge pull request" button
2. Click "Merge pull request"
3. Confirm in popup
4. PR merged to main
```

### Step 6: Watch Auto-Deploy
```
Railway Dashboard:
1. Go to Deployments tab
2. See new deployment starting
3. Watch logs in real-time
4. Health check passes ✅
5. Status shows green ✅
```

### Step 7: Verify Production
```bash
# After deployment completes:
curl https://your-railway-url/api/new-feature

# Result: ✅ New endpoint live in production!
```

---

## Git Commands Quick Reference

```bash
# Check current branch
git branch

# Switch branches
git checkout dev
git checkout main

# Update from GitHub
git pull origin dev
git pull origin main

# Make changes and commit
git add .
git commit -m "Feature description"
git push origin dev

# Merge dev into main (use GitHub PR instead!)
# Don't do this locally: git merge dev

# See recent commits
git log --oneline -10

# Undo last commit (if not pushed)
git reset HEAD~1
```

---

## Troubleshooting Quick Fixes

### "My changes aren't showing on production"
→ Check if PR was merged to main  
→ Check Railway deployment status  
→ View deployment logs for errors  

### "Preview deployment not showing in PR"
→ Enable "PR previews" in Railway settings  
→ Check Railway webhook on GitHub  
→ Force refresh the PR page  

### "Health check keeps failing"
→ Check `/api/health` endpoint works locally  
→ Verify database connection in Railway  
→ Check environment variables are set  

### "Need to revert changes"
→ In Railway, click "Redeploy" on previous version  
→ Production reverts in 2-3 minutes  
→ Then fix issue in dev and redeploy  

### "Production is down"
→ Check Railway dashboard for crashes  
→ View logs for error messages  
→ Redeploy previous working version  
→ Fix and redeploy new version  

---

## Performance Expectations

| Action | Time | Notes |
|--------|------|-------|
| Local development | 0s | Works instantly in Replit |
| Commit & push | 10s | Upload to GitHub |
| PR preview deploy | 2-3 min | Railway builds and deploys |
| Production deploy | 2-5 min | Railway builds, deploys, health checks |
| Health check | 30s | Verifies /api/health passing |

---

## Branch Protection Rules

**main branch:**
- ✅ Require 1 approval before merge
- ✅ Require status checks passing
- ✅ Auto-deploy on merge
- ✅ Cannot directly push

**dev branch:**
- ✅ Direct push OK (your working branch)
- ✅ Create PRs from here
- ✅ Frequently updated

---

## Success Metrics

After setup is complete:
- ✅ Changes in dev deploy to production in 5-10 minutes
- ✅ Health checks verify all deployments
- ✅ Can rollback in 1 minute if needed
- ✅ Can see deployment logs in real-time
- ✅ Slack/email notifications on deploy
- ✅ All secrets safely in Railway dashboard
- ✅ No hardcoded credentials in code

---

## Checklist: Before First Production Deploy

- [ ] Git repo created on GitHub
- [ ] Main and dev branches setup
- [ ] .gitignore configured
- [ ] .env.example created (no secrets!)
- [ ] Railway project created
- [ ] GitHub connected to Railway
- [ ] Environment variables set in Railway
- [ ] Auto-deploy enabled on main
- [ ] Health check configured
- [ ] PR previews enabled
- [ ] Branch protection on main
- [ ] First test PR created & merged
- [ ] Production deployment verified ✅

---

**Status: 🟢 READY FOR CONTINUOUS DEPLOYMENT**

Your workflow is configured. Start iterating! 🚀
