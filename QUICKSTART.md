# 🚀 InfinitySol Launch - Quickstart (< 1 Hour)

**Goal:** Get a working, live scanner deployed in < 1 hour

---

## Phase 1: Local Setup (15 minutes)

### 1. Install Dependencies

```bash
cd /path/to/InfinitySol

# Backend dependencies
npm install express cors dotenv uuid axios playwright

# Frontend dependencies (if deploying locally)
cd frontend
npm install
cd ..
```

### 2. Create .env

```bash
cp .env.example .env

# For local development, you can leave defaults:
# PORT=8000
# NODE_ENV=development
```

### 3. Start Backend

```bash
npm run backend
# You should see: ✅ InfinitySol API running on port 8000
```

### 4. Test Scanner (in another terminal)

```bash
curl -X POST http://localhost:8000/api/v1/scan \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "email": "test@example.com"}'

# You should get back:
# {
#   "auditId": "...",
#   "violations": {...},
#   "riskScore": 45,
#   "estimatedLawsuitCost": 125000
# }
```

✅ **If you got a response, the backend works.**

---

## Phase 2: Deploy Backend to Railway (10 minutes)

### 1. Create Railway Account

```bash
# Go to: https://railway.app
# Sign up with GitHub
# Create new project
```

### 2. Deploy Backend

```bash
# Install Railway CLI
npm install -g @railway/cli

# Log in
railway login

# Create railway.json in repo root:
cat > railway.json <<'EOF'
{
  "build": {
    "builder": "nixpacks"
  },
  "deploy": {
    "restartPolicyCondition": "on-failure",
    "restartPolicyMaxRetries": 5
  }
}
EOF

# Deploy
railway up

# You'll get a public URL like:
# https://infinitysol-production-abc123.up.railway.app
```

### 3. Test Live Endpoint

```bash
curl -X POST https://infinitysol-production-abc123.up.railway.app/api/v1/scan \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'

# Should work!
```

✅ **Save your Railway URL - you'll need it for the frontend**

---

## Phase 3: Deploy Frontend to Vercel (10 minutes)

### 1. Update API URL

In `frontend/pages/index.tsx`, find:
```typescript
const response = await fetch(
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
```

Update `.env.local` in frontend:
```
NEXT_PUBLIC_API_URL=https://infinitysol-production-abc123.up.railway.app
```

### 2. Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy frontend
cd frontend
vercel --prod

# You'll get a URL like:
# https://infinitysol.vercel.app
```

### 3. Test Live Scanner

```
Open: https://infinitysol.vercel.app
Paste: https://example.com
Click: SCAN MY SITE
```

✅ **If you see results, you're live!**

---

## Phase 4: Custom Domain (5 minutes)

### Point Domain to Vercel

```bash
# In your domain registrar DNS:
CNAME: www.infinitesol.com -> cname.vercel.com
A Record: infinitesol.com -> 76.76.19.132
```

---

## Phase 5: Payment Integration (Optional, can add later)

To accept payments:

1. Sign up for Stripe: https://stripe.com
2. Get API keys from dashboard
3. Add to .env:
   ```
   STRIPE_PUBLIC_KEY=pk_...
   STRIPE_SECRET_KEY=sk_...
   ```

---

## You're Live! 🎉

**Your scanner is now:**
- ✅ Running on your custom domain
- ✅ Scanning websites for accessibility violations
- ✅ Calculating risk scores
- ✅ Legal disclaimers included
- ✅ Ready to accept customers

---

## What's Next?

1. **Email campaigns** - Start with 10 warm leads
2. **Payment processing** - Set up Stripe checkout
3. **Analytics** - Track signups and conversions
4. **Content** - Post lawsuits to your news feed
5. **Refinements** - Improve accuracy based on feedback

---

## Troubleshooting

### "Backend not responding"
```bash
# Check Railway logs:
railway logs

# Or run locally:
npm run backend
```

### "Playwright timeout"
- Some sites block headless browsers
- Add User-Agent header to requests
- Increase timeout in backend/server.ts

### "Vercel deployment fails"
```bash
# Check build logs in Vercel dashboard
# Make sure Node version is 18+
# Verify .env variables are set
```

---

**You're deploying TODAY. Questions?**
- Backend issues: Check `npm run backend` console
- Frontend issues: Check Vercel build logs
- Legal issues: See LEGAL.md
- Payment issues: See Stripe docs

**Go live. Now.**
