# 🚂 Railway Deployment Guide for InfinitySoul

Complete step-by-step guide to deploy InfinitySoul Phase V to Railway.

---

## 📋 Prerequisites

Before you start, make sure you have:
- [ ] GitHub account (connected to InfinitySoul repo)
- [ ] Vercel account (you already have this)
- [ ] Credit card (for Railway - $5/month minimum)

---

## 🚀 Step 1: Create Railway Account

1. Go to **https://railway.app**
2. Click "Login" → Sign in with GitHub
3. Authorize Railway to access your repositories
4. You get **$5 free credit** to test everything

---

## 🗄️ Step 2: Set Up Databases (5 minutes)

### **Option A: Railway Dashboard (Recommended)**

1. Go to Railway dashboard: https://railway.app/new
2. Click "New Project"
3. Select "Deploy PostgreSQL"
   - Railway will provision a PostgreSQL database
   - Copy the `DATABASE_URL` (you'll need this later)

4. In the same project, click "+ New"
5. Select "Deploy Redis"
   - Railway will provision a Redis instance
   - Copy the `REDIS_URL` (you'll need this later)

### **Option B: Railway CLI**

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Create new project
railway init

# Add PostgreSQL
railway add --database postgres

# Add Redis
railway add --database redis

# Link to current directory
railway link
```

---

## 🔧 Step 3: Deploy Backend from GitHub

### **Method 1: GitHub Integration (Recommended)**

1. In your Railway project, click "+ New"
2. Select "GitHub Repo"
3. Choose your InfinitySoul repository
4. Railway will detect `railway.json` and `nixpacks.toml`
5. Click "Deploy Now"

Railway will:
✅ Install dependencies
✅ Run Prisma generate
✅ Build TypeScript
✅ Start the API server

### **Method 2: Railway CLI**

```bash
# From project root
railway up

# Or deploy and follow logs
railway up --detach
railway logs
```

---

## 🔐 Step 4: Set Environment Variables

### **In Railway Dashboard:**

1. Go to your project → Click on your service
2. Click "Variables" tab
3. Add all variables from `.env.example`:

#### **Required Variables:**

```bash
# Node Environment
NODE_ENV=production
PORT=3000

# Database (auto-filled by Railway if you added Postgres)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Redis (auto-filled by Railway if you added Redis)
REDIS_URL=${{Redis.REDIS_URL}}

# AI Services (GET THESE API KEYS FIRST)
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
OPENAI_API_KEY=sk-your-key-here

# Legal Data Sources
COURTLISTENER_API_KEY=your-courtlistener-key
PACER_USERNAME=your-pacer-username
PACER_PASSWORD=your-pacer-password

# Security
JWT_SECRET=<generate-with-openssl-rand-base64-32>
SESSION_SECRET=<another-random-secret>

# Stripe
STRIPE_SECRET_KEY=sk_test_your-stripe-test-key
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-test-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# Frontend URL (your Vercel deployment)
FRONTEND_URL=https://infinitysoul.vercel.app
CORS_ORIGINS=https://infinitysoul.vercel.app

# Email (optional for MVP)
SENDGRID_API_KEY=SG.your-key-here
EMAIL_FROM=hello@infinitysoul.com

# Scanner Configuration
SCANNER_CONCURRENCY=5
SCANNER_PROXY_POOL_SIZE=20
SCANNER_USER_AGENT_ROTATION=true
SCANNER_MAX_PAGES_PER_SITE=100
SCANNER_TIMEOUT_MS=30000

# Intel Worker Configuration
PACER_POLL_INTERVAL_HOURS=6
PLAINTIFF_ANALYSIS_INTERVAL_HOURS=24
LAWSUIT_PREDICTION_BATCH_SIZE=100

# Feature Flags
ENABLE_AUTO_REMEDIATION=true
ENABLE_LAWSUIT_PREDICTION=true
ENABLE_RISK_SCORING=true
ENABLE_PORTFOLIO_INTELLIGENCE=true
```

#### **Generate Secrets:**

```bash
# Generate JWT_SECRET
openssl rand -base64 32

# Generate SESSION_SECRET
openssl rand -base64 32
```

### **Using Railway CLI:**

```bash
# Set variables one by one
railway variables set ANTHROPIC_API_KEY=sk-ant-...
railway variables set OPENAI_API_KEY=sk-...
railway variables set JWT_SECRET=$(openssl rand -base64 32)

# Or bulk import from .env file
railway variables set --file .env
```

---

## 🔄 Step 5: Run Database Migrations

After deployment, run Prisma migrations:

### **Via Railway Dashboard:**

1. Go to your service → "Settings" tab
2. Scroll to "Deploy" section
3. Add to "Build Command":
   ```bash
   npm install && npx prisma migrate deploy && npm run build
   ```

### **Via Railway CLI:**

```bash
# Run migration
railway run npx prisma migrate deploy

# Or SSH into the container
railway run bash
npx prisma migrate deploy
npx prisma db seed  # If you have seed data
exit
```

---

## 🎯 Step 6: Deploy Background Workers

Railway allows you to run multiple services in one project.

### **Option A: Separate Services (Recommended for Scale)**

1. In Railway project, click "+ New"
2. Select "Empty Service"
3. Name it "Scanner Worker"
4. Go to Settings → Start Command
5. Set to: `npm run worker:scanner`
6. Copy all environment variables from main API service

Repeat for Intel Worker:
- Service name: "Intel Worker"
- Start command: `npm run worker:intel`

### **Option B: Combined Worker (Cost Effective for MVP)**

1. Create one "Worker" service
2. Start command: `npm run worker:all`
3. This runs both scanner and intel workers in one container

### **Option C: Use Same Service (Simplest)**

In your main service's start command, use:
```bash
npm run start:all
```

This will run API + workers in same container (good for MVP).

---

## 🌐 Step 7: Get Railway URL

1. After deployment, Railway gives you a URL like:
   ```
   https://infinitysoul-production.up.railway.app
   ```

2. Test the health endpoint:
   ```bash
   curl https://your-app.up.railway.app/health
   ```

3. Expected response:
   ```json
   {
     "status": "healthy",
     "timestamp": "2024-12-03T...",
     "services": {
       "database": "connected",
       "redis": "connected"
     }
   }
   ```

---

## 🎨 Step 8: Deploy Frontend to Vercel

### **Connect Backend to Frontend:**

1. Go to Vercel dashboard
2. Select your InfinitySoul project (or import from GitHub)
3. Go to Settings → Environment Variables
4. Add:
   ```bash
   NEXT_PUBLIC_API_URL=https://your-app.up.railway.app
   ```

5. Redeploy frontend:
   ```bash
   vercel --prod
   ```

### **Or via Vercel CLI:**

```bash
cd frontend

# Set environment variable
vercel env add NEXT_PUBLIC_API_URL production
# Enter: https://your-railway-app.up.railway.app

# Deploy
vercel --prod
```

---

## 🔒 Step 9: Set Up Custom Domain (Optional)

### **Railway Custom Domain:**

1. In Railway project → Settings → Networking
2. Click "Generate Domain" (gets you a better URL)
3. Or add custom domain:
   - Add your domain (e.g., api.infinitysoul.com)
   - Add CNAME record in your DNS:
     ```
     api.infinitysoul.com → your-app.up.railway.app
     ```
4. Railway auto-provisions SSL certificate

### **Vercel Custom Domain:**

1. Vercel project → Settings → Domains
2. Add domain: infinitysoul.com
3. Add DNS records as instructed
4. SSL is automatic

---

## ✅ Step 10: Verify Deployment

### **Test API Endpoints:**

```bash
# Health check
curl https://your-railway-app.up.railway.app/health

# Test scan endpoint (replace with your URL)
curl -X POST https://your-railway-app.up.railway.app/api/scan \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'

# Test intel endpoint
curl https://your-railway-app.up.railway.app/api/intel/plaintiff-map
```

### **Check Logs:**

```bash
# Via Railway CLI
railway logs

# Or in Railway dashboard
# Project → Service → Logs tab
```

### **Monitor Services:**

```bash
# View running processes
railway ps

# Check resource usage
# Dashboard → Metrics tab shows CPU, RAM, Network
```

---

## 🐛 Troubleshooting

### **Build Fails:**

```bash
# Check build logs in Railway dashboard
# Common issues:

# 1. Missing Prisma schema
railway run npx prisma generate

# 2. TypeScript errors
railway run npm run type-check

# 3. Missing dependencies
railway run npm install

# Rebuild
railway up --detach
```

### **Database Connection Fails:**

```bash
# Verify DATABASE_URL is set
railway variables

# Test connection
railway run npx prisma db push

# Check Postgres logs
# Dashboard → Postgres service → Logs
```

### **Workers Not Running:**

```bash
# Check if worker service is deployed
railway ps

# View worker logs
railway logs --service scanner-worker

# Restart worker
railway restart --service scanner-worker
```

### **Out of Memory:**

Railway's free tier has 512MB RAM. If you hit limits:

1. Upgrade to Hobby plan ($5/month) → 8GB RAM
2. Or optimize scanner concurrency:
   ```bash
   railway variables set SCANNER_CONCURRENCY=2
   ```

---

## 💰 Cost Management

### **Free Tier:**
- $5 credit (expires after 1 month)
- 512MB RAM, 1GB disk
- Good for testing

### **Hobby Plan ($5/month):**
- 8GB RAM, 100GB disk
- Enough for 5-10 customers
- Shared CPU

### **Pro Plan ($20/month):**
- 32GB RAM, 100GB disk
- Dedicated CPU
- Priority support
- Good for 10+ customers

### **Cost Optimization Tips:**

1. **Use combined worker** instead of separate services
   ```bash
   # One service runs API + workers
   npm run start:all
   ```

2. **Reduce scanner concurrency** for lower memory
   ```bash
   SCANNER_CONCURRENCY=2  # Instead of 5
   ```

3. **Use Railway's sleep feature** for non-critical services
   - Dev/staging environments auto-sleep after 1 hour

4. **Monitor usage** in Dashboard → Metrics
   - Check CPU, RAM, Network usage
   - Optimize based on actual needs

---

## 📊 Monitoring & Maintenance

### **View Logs:**

```bash
# Real-time logs
railway logs --follow

# Filter by service
railway logs --service api
railway logs --service scanner-worker

# Export logs
railway logs > logs-$(date +%Y%m%d).txt
```

### **Database Backups:**

Railway auto-backs up Postgres every 24 hours.

Manual backup:
```bash
# Export database
railway run pg_dump $DATABASE_URL > backup.sql

# Or in Railway dashboard
# Postgres service → Backups → Create Backup
```

### **Health Monitoring:**

Set up external monitoring (free tier):
- **UptimeRobot**: https://uptimerobot.com
  - Monitor `/health` endpoint every 5 minutes
  - Email alerts on downtime

- **Better Uptime**: https://betteruptime.com
  - Slack/Discord/PagerDuty integrations

### **Performance Monitoring:**

Add to your app:
```bash
# Install Sentry for error tracking
npm install @sentry/node

# Set SENTRY_DSN in Railway variables
railway variables set SENTRY_DSN=https://your-sentry-dsn
```

---

## 🚀 Deployment Checklist

### **Pre-Launch:**
- [ ] Railway account created
- [ ] Postgres database provisioned
- [ ] Redis cache provisioned
- [ ] All API keys acquired (Anthropic, OpenAI, CourtListener)
- [ ] Environment variables set in Railway
- [ ] Database migrations run successfully
- [ ] Backend deployed and health check passes
- [ ] Frontend deployed to Vercel
- [ ] Frontend connected to Railway backend
- [ ] Test scan completed successfully
- [ ] Stripe test mode configured

### **Production Launch:**
- [ ] Custom domain configured (optional)
- [ ] SSL certificates active
- [ ] Stripe live mode enabled
- [ ] SendGrid email configured
- [ ] Uptime monitoring active
- [ ] Error tracking (Sentry) configured
- [ ] Analytics (PostHog) configured
- [ ] Database backups verified

---

## 🔗 Useful Links

- **Railway Dashboard**: https://railway.app/dashboard
- **Railway Docs**: https://docs.railway.app
- **Railway CLI Docs**: https://docs.railway.app/develop/cli
- **Nixpacks Docs**: https://nixpacks.com/docs
- **Railway Discord**: https://discord.gg/railway

---

## 🆘 Need Help?

1. **Railway Discord**: Fast community support
2. **Railway Docs**: Comprehensive guides
3. **Check logs first**: `railway logs`
4. **Railway status**: https://railway.statuspage.io

---

## 📝 Quick Commands Reference

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

# View service status
railway status

# Open in browser
railway open

# Connect to database
railway connect postgres
railway connect redis
```

---

**You're ready to deploy!** 🚀

Start with Step 1 and work through each section. The entire process takes about 30-45 minutes.

After deployment, you'll have:
✅ Backend API running on Railway
✅ Frontend running on Vercel
✅ PostgreSQL + Redis databases
✅ Background workers for scanning and intel
✅ Complete InfinitySoul Phase V live in production

Questions? Check the Troubleshooting section or Railway Discord.
