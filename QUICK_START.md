# ⚡ Quick Start Guide - Get InfinitySoul Live in 30 Minutes

The fastest path from code to production.

---

## 🎯 Goal

Get InfinitySoul Phase V deployed and ready for your first construction company demo.

**Total Time: ~30 minutes**

---

## 📝 Before You Start

### **Sign Up for These Services (10 minutes):**

1. **Railway** (Backend hosting)
   - Go to https://railway.app
   - Sign in with GitHub
   - Get $5 free credit
   - **Cost: $10-20/month**

2. **Anthropic** (Claude API for AI analysis)
   - Go to https://console.anthropic.com
   - Create API key
   - **Cost: ~$50/month**

3. **OpenAI** (GPT-4 for code generation)
   - Go to https://platform.openai.com
   - Create API key
   - **Cost: ~$30/month**

4. **CourtListener** (FREE lawsuit data)
   - Go to https://www.courtlistener.com/api/rest/
   - Create account
   - Get API key from profile
   - **Cost: FREE**

5. **Stripe** (Payment processing)
   - Go to https://stripe.com
   - Create account
   - Get test API keys
   - **Cost: Pay-per-transaction**

---

## 🚀 Deployment (20 minutes)

### **Step 1: Deploy Backend to Railway (10 min)**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize Railway project
railway init

# Add databases
railway add --database postgres
railway add --database redis

# Run the automated setup script
./scripts/setup-railway-env.sh

# Deploy!
railway up
```

The script will ask you for all your API keys and set them up automatically.

**Or deploy via Railway Dashboard:**
1. Go to https://railway.app/new
2. Click "Deploy from GitHub repo"
3. Select your InfinitySoul repository
4. Railway auto-detects `railway.json` and deploys
5. Add environment variables manually (use `RAILWAY_DEPLOYMENT.md` as reference)

### **Step 2: Run Database Migrations (2 min)**

```bash
# After deployment, run migrations
railway run npx prisma migrate deploy

# (Optional) Seed with construction test data
railway run npm run seed:construction
```

### **Step 3: Deploy Frontend to Vercel (5 min)**

```bash
# From frontend directory
cd frontend

# Deploy to Vercel
vercel --prod

# Add environment variable in Vercel dashboard:
# NEXT_PUBLIC_API_URL = https://your-railway-app.up.railway.app
```

**Or via Vercel Dashboard:**
1. Go to https://vercel.com
2. Import your GitHub repo
3. Set root directory to `frontend/` if using monorepo
4. Add environment variable: `NEXT_PUBLIC_API_URL`
5. Deploy

### **Step 4: Test Deployment (3 min)**

```bash
# Get your Railway URL
railway domain

# Test health endpoint
curl https://your-app.up.railway.app/health

# Expected output:
# {
#   "status": "healthy",
#   "services": {
#     "database": "connected",
#     "redis": "connected"
#   }
# }

# Test frontend
open https://your-vercel-app.vercel.app
```

---

## ✅ You're Live!

**Backend:** https://your-app.up.railway.app
**Frontend:** https://your-app.vercel.app

---

## 🎬 Next: Run Your First Demo

### **Load Construction Test Data:**

```bash
# Load the 3 construction companies
railway run node -e "
  const data = require('./test-data/construction-test-data.json');
  console.log('Loaded', data.testCompanies.length, 'companies');
"
```

### **Test a Scan:**

```bash
# Scan a test company
curl -X POST https://your-railway-app.up.railway.app/api/scan \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://demo.metroconstruction.test",
    "depth": "full"
  }'
```

### **View Risk Intelligence:**

```bash
# Get industry heatmap
curl https://your-railway-app.up.railway.app/api/intel/industry-heatmap

# Get plaintiff radar
curl https://your-railway-app.up.railway.app/api/intel/plaintiff-map

# Get lawsuit forecast
curl https://your-railway-app.up.railway.app/api/intel/lawsuit-forecast
```

---

## 📱 Post Your LinkedIn Content

Use the content from `LINKEDIN_POST_CONSTRUCTION.md`:

**Option 1 (Recommended):**
```
1,247 construction companies were sued for ADA violations in 2023.
Average cost: $165,000
Most common issue? Inaccessible quote request forms.

I just launched InfinitySoul to solve this.

[Rest of post from LINKEDIN_POST_CONSTRUCTION.md]
```

**Best time to post:** Tuesday-Thursday, 8-10 AM EST

**Include:** #Construction #Contractors #ADACompliance

**CTA:** "DM me for a free scan"

---

## 🎯 Book Your First Demo

### **Outreach Template:**

```
Hi [Name],

I noticed [Company] has an impressive portfolio - particularly
the [specific project] work.

I built InfinitySoul to scan construction company websites for
ADA compliance issues. 78% of contractors have violations they
don't know about.

1,247 lawsuits hit the industry last year. Average cost: $165K.

Would you want a free scan? Takes 2 minutes, I'll send you a
full report with risk score.

No pitch, just data.

[Your name]
```

### **Demo Script (15 minutes):**

Use the detailed workflow in:
`test-data/construction-industry-test-suite.ts`

**Key talking points:**
1. Show their actual violations (2 min)
2. Compare to industry benchmark (2 min)
3. Show lawsuit prediction (2 min)
4. Serial plaintiff intelligence (2 min)
5. Cost breakdown: $225K lawsuit vs $12K fix (2 min)
6. Auto-remediation demo (3 min)
7. Pricing & ROI (2 min)

---

## 💰 Pricing to Offer

**First 10 Customers: 50% off for 3 months**

- Professional: ~~$499~~ **$249/month** (small contractors)
- Business: ~~$999~~ **$499/month** (mid-size)
- Enterprise: ~~$2,500~~ **$1,250/month** (large GCs)

**Pitch:**
> "One prevented lawsuit = 19 years paid for"

---

## 📊 Track Success Metrics

### **Week 1:**
- [ ] LinkedIn post impressions (target: 5,000+)
- [ ] DMs received (target: 20+)
- [ ] Free scans run (target: 10+)
- [ ] Demos booked (target: 5+)

### **Week 2:**
- [ ] Demos completed (target: 5)
- [ ] Follow-up meetings (target: 3)
- [ ] Proposals sent (target: 3)

### **Month 1:**
- [ ] Signed customers (target: 3)
- [ ] MRR (target: $1,500)

---

## 🐛 Common Issues & Fixes

### **Railway Build Fails:**
```bash
# View logs
railway logs

# Common fix: Missing Prisma client
railway run npx prisma generate

# Rebuild
railway up --detach
```

### **Database Connection Error:**
```bash
# Check DATABASE_URL is set
railway variables | grep DATABASE_URL

# Test connection
railway run npx prisma db push
```

### **Frontend Can't Reach Backend:**
```bash
# Check CORS settings in Railway
railway variables set CORS_ORIGINS=https://your-vercel-app.vercel.app

# Check Vercel env var
vercel env ls

# Should see: NEXT_PUBLIC_API_URL = https://your-railway-app.up.railway.app
```

### **Out of Memory on Railway:**
```bash
# Reduce scanner concurrency
railway variables set SCANNER_CONCURRENCY=2

# Or upgrade to Hobby plan ($5/month) with 8GB RAM
```

---

## 📚 Detailed Guides

For deeper dives:

- **Full Railway Deployment:** `RAILWAY_DEPLOYMENT.md`
- **Docker Deployment:** `docker-compose.yml` + `deploy.sh`
- **Go-to-Market Strategy:** `GO_TO_MARKET_STRATEGY.md`
- **Construction Test Suite:** `test-data/construction-industry-test-suite.ts`
- **LinkedIn Content:** `LINKEDIN_POST_CONSTRUCTION.md`

---

## 🆘 Need Help?

**Railway Issues:**
- Railway Discord: https://discord.gg/railway
- Docs: https://docs.railway.app
- CLI help: `railway help`

**Vercel Issues:**
- Vercel Docs: https://vercel.com/docs
- Support: https://vercel.com/support

**General Deployment:**
- Check `RAILWAY_DEPLOYMENT.md` troubleshooting section
- View logs: `railway logs -f`
- Test health: `curl $(railway domain)/health`

---

## 🎉 Congratulations!

You now have:
✅ InfinitySoul Phase V deployed to production
✅ PostgreSQL + Redis databases
✅ Frontend on Vercel
✅ Backend on Railway
✅ Construction industry test data loaded
✅ LinkedIn content ready
✅ Demo script prepared

**You're ready to get your first customer!** 🚀

---

**Next action:** Post your LinkedIn content and DM 10 construction company owners with the free scan offer.

The faster you ship, the faster you learn. Let's go! 🟣
