# GitHub & Railway Continuous Deployment Setup

## 📋 Step-by-Step Setup Instructions

### Step 1: Create GitHub Repository

1. **Go to GitHub** → Create new repository
2. **Name:** `WCAG-AI-Platform` or `WCAGAIPlatform`
3. **Description:** "Industry-agnostic accessibility auditing platform with agentic automation"
4. **Public** (for visibility) or Private (for security)
5. **Don't initialize** (we'll push existing repo)
6. **Click Create Repository**

### Step 2: Configure Local Git Repository

```bash
# Navigate to your project
cd /path/to/project

# Check git status (should already be initialized)
git status

# Check current branch
git branch -a

# If not initialized, initialize:
git init

# Add remote (replace YOUR_USERNAME and REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/WCAG-AI-Platform.git

# Verify remote added
git remote -v
# Should show:
# origin  https://github.com/YOUR_USERNAME/WCAG-AI-Platform.git (fetch)
# origin  https://github.com/YOUR_USERNAME/WCAG-AI-Platform.git (push)
```

### Step 3: Create Dev & Main Branches

```bash
# Ensure you're on main branch
git checkout -b main

# Create dev branch for Replit iterations
git checkout -b dev

# Switch back to dev (where you'll work in Replit)
git checkout dev

# Verify branches
git branch -a
# Should show:
# * dev
#   main
#   remotes/origin/HEAD -> origin/main
```

### Step 4: Add Files & Create Initial Commit

```bash
# Check what's untracked/modified
git status

# Add all files (respects .gitignore)
git add .

# Create initial commit
git commit -m "Production-ready WCAG AI Platform with industry-agnostic intelligence

- Industry-intelligent ICP scoring (+5-10 point boosts per vertical)
- 8 pre-configured industries (Healthcare, Finance, E-commerce, Education, Government, SaaS, Real Estate, Manufacturing)
- AI remediations with industry context
- USPS certified mail integration
- Competitive analysis with lawsuit data
- Production deployment ready (Railway, Vercel, Docker)
- GitHub Actions auto-deployment workflow
- Comprehensive documentation"

# Verify commit
git log --oneline -5
```

### Step 5: Push to GitHub

```bash
# Push dev branch to GitHub
git push -u origin dev

# Push main branch to GitHub
git checkout main
git push -u origin main

# Set main as default branch (optional, in GitHub settings)
# Go to: Repository Settings → Branches → Default branch → Select "main"
```

### Step 6: Set Up Railway Auto-Deployment

1. **Go to Railway** → Create New Project
2. **Connect to GitHub** → Authorize Railway
3. **Select Repository** → `WCAG-AI-Platform`
4. **Select Branch** → `main` (production auto-deploys from main)
5. **Configure Environment:**
   - Add environment variables (see step below)
   - Enable auto-deploy on push
   - Set up PR previews (optional but recommended)

### Step 7: Add Environment Variables to Railway

In Railway dashboard, add these variables:

**Required:**
```
DATABASE_URL=postgresql://...  (Replit provides this)
NODE_ENV=production
SESSION_SECRET=<strong-random-secret>
AI_INTEGRATIONS_ANTHROPIC_API_KEY=sk-ant-...
```

**Optional:**
```
LOB_API_KEY=test_...
OPENAI_API_KEY=sk-...
HUBSPOT_API_KEY=pat-...
```

### Step 8: Enable PR Previews (Optional)

1. In Railway project settings
2. Enable "Deploy on every commit"
3. Enable "PR preview deployments"
4. This creates temporary preview URLs for PRs before merging to main

---

## 🔄 Continuous Iteration Workflow

### Daily Development Flow

```
┌─────────────────────────────────────────────────────────┐
│ 1. Work in Replit (on dev branch)                       │
│    └─ Make changes locally                              │
│    └─ Test in Replit (npm run dev)                      │
│                                                         │
│ 2. Commit to dev branch                                 │
│    └─ git add .                                         │
│    └─ git commit -m "Descriptive message"               │
│    └─ git push origin dev                               │
│                                                         │
│ 3. When ready to deploy:                                │
│    └─ Create Pull Request: dev → main                   │
│    └─ Review changes                                    │
│    └─ Merge PR                                          │
│                                                         │
│ 4. Railway Auto-Deploys (main branch)                   │
│    └─ GitHub webhook triggers Railway                   │
│    └─ Railway deploys to production                     │
│    └─ Health checks verify deployment                   │
│    └─ Production updated in 2-3 minutes                 │
└─────────────────────────────────────────────────────────┘
```

### Git Commands Cheat Sheet

**Replit Development:**
```bash
# Check status
git status

# Add changes
git add .

# Commit with message
git commit -m "Feature: Add new endpoint"

# Push to dev branch
git push origin dev

# Pull latest changes
git pull origin dev
```

**Creating Pull Request (GitHub web):**
1. Go to repository
2. Click "Pull requests"
3. Click "New pull request"
4. Base: `main`, Compare: `dev`
5. Add title and description
6. Click "Create pull request"
7. After review, click "Merge pull request"

**After Merge (update local repo):**
```bash
# Switch to main
git checkout main

# Pull merged changes
git pull origin main

# Switch back to dev
git checkout dev

# Update dev with latest main
git merge main
```

---

## 🚀 Complete Deployment Flow Example

### Scenario: Deploy New Feature

**Step 1: Work in Replit**
```bash
# Make changes to files...
# Test locally: npm run dev
# Verify everything works
```

**Step 2: Commit to Dev**
```bash
git add .
git commit -m "Feature: Add industry-specific email templates"
git push origin dev
```

**Step 3: Create PR (on GitHub)**
- Go to GitHub repo
- Click "Compare & pull request"
- Add description: "Add industry-specific email templates for 8 verticals"
- Click "Create pull request"

**Step 4: Review & Merge**
- Review code changes
- Run verification script in dev branch
- Click "Merge pull request"

**Step 5: Auto-Deploy (Railway)**
- Railway webhook triggered
- New deployment started
- Health checks running
- Production updated
- Email notification sent
- View deployment at your production URL

---

## 📊 Branch Strategy

```
GitHub Branches:
┌──────────────┐
│   main       │  ← Production (Railway auto-deploys)
│   (prod)     │  ← One commit = One production deployment
└──────────────┘
       ↑
   (PR/Merge)
       ↑
┌──────────────┐
│   dev        │  ← Development (Your working branch)
│   (staging)  │  ← Work here in Replit
└──────────────┘
       ↑
   (Your commits)
       ↑
┌──────────────┐
│  feature/*   │  ← Optional: Feature branches
│ (local)      │  ← Branch off dev for major features
└──────────────┘
```

**Branch Rules:**
- `main`: Only merge tested, production-ready code
- `dev`: Your daily work branch, frequent commits
- `feature/*`: Optional, for major features (branch off dev)

---

## 🔐 Security Best Practices

### DO
✅ Use `.env.example` for documentation  
✅ Add secrets in Railway dashboard only  
✅ Use strong SESSION_SECRET (32+ chars)  
✅ Enable 2FA on GitHub  
✅ Review PRs before merging  
✅ Keep dependencies updated  

### DON'T
❌ Commit `.env` files  
❌ Commit secrets in code  
❌ Use test secrets in production  
❌ Push directly to main branch  
❌ Disable branch protection  

---

## 🆘 Troubleshooting

### "Git remote already exists"
```bash
# List remotes
git remote -v

# Remove old remote
git remote remove origin

# Add correct remote
git remote add origin https://github.com/YOUR_USERNAME/WCAG-AI-Platform.git
```

### "Merge conflicts when syncing dev with main"
```bash
# Abort merge
git merge --abort

# Update main first
git checkout main
git pull origin main

# Go back to dev
git checkout dev

# Try merge again
git merge main
# Resolve conflicts manually, then:
git add .
git commit -m "Merge main into dev"
```

### "Railway deployment failed"
1. Check logs: Railway dashboard → Deployment logs
2. Verify environment variables are set correctly
3. Check database connection: Health endpoint
4. Review GitHub Actions workflow errors

### "Local changes conflict with GitHub"
```bash
# Stash local changes
git stash

# Pull latest
git pull origin dev

# Apply stashed changes
git stash pop

# Resolve conflicts and commit
git add .
git commit -m "Resolved conflicts"
git push origin dev
```

---

## 📈 Monitoring Deployments

### In Railway Dashboard
- Click "Deployments" tab
- See all deployment history
- Click deployment to view logs
- Check "Health" status
- View metrics

### Setting Up Alerts
1. Go to Railway project settings
2. Add notification integrations (Slack, email, etc.)
3. Configure alert rules
4. Get notified on deployment failures

---

## ✅ Setup Checklist

- [ ] GitHub repository created
- [ ] Local git remote configured
- [ ] Dev and main branches created
- [ ] Initial commit pushed to both branches
- [ ] Railway project created
- [ ] Repository connected to Railway
- [ ] Environment variables configured in Railway
- [ ] Auto-deployment enabled on main branch
- [ ] First deployment verified
- [ ] Health check passing
- [ ] Ready for continuous iteration!

---

## 🎯 Next Steps

1. **Follow steps 1-7 above** to set up GitHub and Railway
2. **Verify first deployment** by accessing your production URL
3. **Test workflow** by making small change in dev branch and merging to main
4. **Start iterating** - work in dev, deploy via main
5. **Monitor deployments** - check logs and health endpoints

---

**Status: Ready for GitHub & Railway Setup**

Your code is production-ready. Now set it up for continuous deployment! 🚀
