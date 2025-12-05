# 🚀 Infinity Soul - Complete Deployment Guide

**InfinitySoul, LLC** | Your all-in-one accessibility platform deployment resource

Mobile-ready · Production-tested · Ship in minutes

---

## 📱 Quick Navigation

**Choose your path:**
- [🏃 5-Minute Quick Deploy](#5-minute-quick-deploy) → Get live FAST
- [⚡ 30-Minute Full Deploy](#30-minute-production-deployment) → Production-ready
- [💻 Local Development](#local-development-setup) → Test locally first
- [🔧 Advanced Setup](#advanced-configuration) → Deep dive

---

## 🏃 5-Minute Quick Deploy

**Goal:** Get Infinity Soul live on Railway + Vercel in 5 minutes.

### Step 1: Install Dependencies (1 min)

```bash
npm install
cd frontend && npm install && cd ..
```

### Step 2: Deploy to Railway (2 min)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Add databases
railway add --database postgres
railway add --database redis

# Deploy!
railway up
```

### Step 3: Deploy Frontend to Vercel (2 min)

```bash
cd frontend
vercel --prod

# Add your Railway API URL in Vercel dashboard:
# NEXT_PUBLIC_API_URL=https://your-app.up.railway.app
```

### ✅ You're Live!

Test it:
```bash
curl https://your-app.up.railway.app/health
```

**Next:** [Configure environment variables](#environment-variables)

---

## ⚡ 30-Minute Production Deployment

**Goal:** Full production setup with databases, workers, and monitoring.

### Prerequisites (10 minutes)

Sign up for these services:

1. **Railway** (Backend) - https://railway.app
   - Sign in with GitHub
   - Get $5 free credit
   - Cost: $10-20/month

2. **Anthropic** (AI Analysis) - https://console.anthropic.com
   - Create API key
   - Cost: ~$50/month

3. **OpenAI** (Code Gen) - https://platform.openai.com
   - Create API key
   - Cost: ~$30/month

4. **Stripe** (Payments) - https://stripe.com
   - Get test API keys
   - Cost: Pay-per-transaction

### Railway Deployment (10 minutes)

#### Option A: GitHub Integration (Recommended)

1. Go to https://railway.app/new
2. Click "Deploy from GitHub repo"
3. Select your `InfinitySoul` repository
4. Railway auto-detects `railway.json`
5. Click "Deploy Now"

#### Option B: Railway CLI

```bash
# From project root
railway link
railway up --detach

# View logs
railway logs -f
```

### Database Setup (5 minutes)

**In Railway Dashboard:**

1. Click "+ New" → "Database" → "PostgreSQL"
   - Copy `DATABASE_URL` (auto-generated)

2. Click "+ New" → "Database" → "Redis"
   - Note connection details

3. Run migrations:
```bash
railway run npx prisma migrate deploy
```

### Environment Variables (5 minutes)

**In Railway Dashboard → Variables:**

```bash
# Core
NODE_ENV=production
PORT=8000

# Database (auto-filled by Railway)
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}

# AI Services
ANTHROPIC_API_KEY=sk-ant-your-key
OPENAI_API_KEY=sk-your-key

# Security (generate these)
JWT_SECRET=<run: openssl rand -base64 32>
SESSION_SECRET=<run: openssl rand -base64 32>

# Stripe
STRIPE_SECRET_KEY=sk_test_your-key
STRIPE_PUBLISHABLE_KEY=pk_test_your-key

# Frontend
FRONTEND_URL=https://infinity-soul.vercel.app
CORS_ORIGINS=https://infinity-soul.vercel.app
```

### Frontend Deployment (3 minutes)

```bash
cd frontend

# Deploy to Vercel
vercel --prod

# Or via Vercel Dashboard:
# 1. Import GitHub repo
# 2. Set root directory: `frontend/`
# 3. Add env var: NEXT_PUBLIC_API_URL
```

### Verification (2 minutes)

```bash
# Health check
curl https://your-app.up.railway.app/health

# Test scan
curl -X POST https://your-app.up.railway.app/api/scan \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}'
```

---

## 💻 Local Development Setup

**Goal:** Get a working scanner running locally in < 1 hour.

### 1. Install Dependencies (5 min)

```bash
cd /path/to/InfinitySoul

# Backend dependencies
npm install express cors dotenv uuid axios playwright

# Frontend dependencies (if deploying locally)
cd frontend
npm install
cd ..
```

### 2. Create .env (2 min)

```bash
cp .env.example .env

# For local development, defaults work:
# PORT=8000
# NODE_ENV=development
```

### 3. Start Backend (2 min)

```bash
npm run backend

# You should see:
# ✅ Infinity Soul API running on port 8000
```

### 4. Test Scanner (1 min)

```bash
curl -X POST http://localhost:8000/api/v1/scan \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "email": "test@example.com"}'

# Expected output:
# {
#   "auditId": "...",
#   "violations": {...},
#   "riskScore": 45
# }
```

✅ **Backend works!**

### 5. Run Frontend Locally (5 min)

```bash
cd frontend
npm run dev

# Open: http://localhost:3000
```

---

## 🔧 Advanced Configuration

### Background Workers

Run scanner and intel workers separately for better performance:

**Option A: Separate Services (Scale)**
```bash
# In Railway, create 3 services:

# Service 1: API
Start command: npm start

# Service 2: Scanner Worker
Start command: npm run worker:scanner

# Service 3: Intel Worker
Start command: npm run worker:intel
```

**Option B: Combined Worker (MVP)**
```bash
# Single worker service
Start command: npm run worker:all
```

**Option C: All-in-One (Simple)**
```bash
# Same service runs API + workers
Start command: npm run start:all
```

### Custom Domain Setup

**Railway:**
1. Project → Settings → Networking
2. Generate domain or add custom:
   - Add: `api.infinity-soul.com`
   - CNAME: `your-app.up.railway.app`

**Vercel:**
1. Project → Settings → Domains
2. Add: `infinity-soul.com`
3. Follow DNS instructions
4. SSL is automatic

### Database Backups

Railway auto-backs up Postgres daily.

Manual backup:
```bash
railway run pg_dump $DATABASE_URL > backup.sql
```

### Monitoring

**Health Monitoring (Free):**
- UptimeRobot: https://uptimerobot.com
- Monitor `/health` every 5 minutes

**Error Tracking:**
```bash
npm install @sentry/node

# Set in Railway:
railway variables set SENTRY_DSN=your-dsn
```

---

## 🌐 Environment Variables Reference

### Required

```bash
NODE_ENV=production
PORT=8000
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=<generate>
SESSION_SECRET=<generate>
```

### AI Services

```bash
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
```

### Payments

```bash
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Scanner Configuration

```bash
SCANNER_CONCURRENCY=5
SCANNER_MAX_PAGES_PER_SITE=100
SCANNER_TIMEOUT_MS=30000
```

### Feature Flags

```bash
ENABLE_AUTO_REMEDIATION=true
ENABLE_LAWSUIT_PREDICTION=true
ENABLE_RISK_SCORING=true
```

---

## 🐛 Troubleshooting

### Build Fails

```bash
# Check logs
railway logs

# Common fixes:
railway run npx prisma generate
railway run npm install
railway up --detach
```

### Database Connection Error

```bash
# Verify DATABASE_URL
railway variables | grep DATABASE_URL

# Test connection
railway run npx prisma db push
```

### Frontend Can't Reach Backend

```bash
# Check CORS in Railway
railway variables set CORS_ORIGINS=https://your-vercel-app.vercel.app

# Verify Vercel env
vercel env ls
# Should see: NEXT_PUBLIC_API_URL
```

### Out of Memory

```bash
# Reduce concurrency
railway variables set SCANNER_CONCURRENCY=2

# Or upgrade to Hobby ($5/month) with 8GB RAM
```

### Workers Not Running

```bash
# Check status
railway ps

# View worker logs
railway logs --service scanner-worker

# Restart
railway restart --service scanner-worker
```

---

## 💰 Cost Management

### Free Tier
- $5 credit (1 month)
- 512MB RAM
- Good for testing

### Hobby Plan ($5/month)
- 8GB RAM
- 100GB disk
- Good for 5-10 customers

### Pro Plan ($20/month)
- 32GB RAM
- Dedicated CPU
- 10+ customers

### Optimization Tips

1. Use combined worker (saves $5/month)
```bash
npm run start:all
```

2. Reduce scanner concurrency
```bash
SCANNER_CONCURRENCY=2
```

3. Enable sleep for dev/staging
- Auto-sleep after 1 hour idle

---

## 📊 Post-Deployment Checklist

### Pre-Launch
- [ ] Railway account created
- [ ] Postgres + Redis provisioned
- [ ] API keys acquired
- [ ] Environment variables set
- [ ] Migrations run successfully
- [ ] Backend health check passes
- [ ] Frontend deployed
- [ ] Test scan completed
- [ ] Stripe test mode configured

### Production Launch
- [ ] Custom domain configured
- [ ] SSL certificates active
- [ ] Stripe live mode enabled
- [ ] Email configured
- [ ] Uptime monitoring active
- [ ] Error tracking configured
- [ ] Database backups verified

---

## 🆘 Quick Commands Reference

```bash
# Deploy
railway up

# View logs
railway logs -f

# Run commands
railway run <command>

# SSH into container
railway run bash

# Set variables
railway variables set KEY=value

# Restart service
railway restart

# View status
railway status

# Connect to database
railway connect postgres
railway connect redis
```

---

## 🔗 Useful Resources

- **Railway Dashboard**: https://railway.app/dashboard
- **Railway Docs**: https://docs.railway.app
- **Railway Discord**: https://discord.gg/railway
- **Vercel Docs**: https://vercel.com/docs
- **Infinity Soul Repo**: https://github.com/aaj441/InfinitySoul

---

## 🎉 You're Live!

After completing this guide, you have:

✅ Infinity Soul deployed to production
✅ Backend API on Railway
✅ Frontend on Vercel
✅ PostgreSQL + Redis databases
✅ Background workers running
✅ Complete InfinitySoul, LLC platform live

**Next Steps:**
1. Post LinkedIn content
2. DM 10 potential customers
3. Book your first demo
4. Get first paid customer!

---

**🚀 Ready to deploy? Start with [5-Minute Quick Deploy](#5-minute-quick-deploy)**

Questions? Check [Troubleshooting](#troubleshooting) or reach out on Railway Discord.

---

*Built with ❤️ by InfinitySoul, LLC*
*Last updated: December 2025*
