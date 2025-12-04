# InfinitySoul Railway Deployment Guide

## 🎯 Quick Deploy (5 Minutes)

### Step 1: Install Dependencies Locally
```bash
npm install
cd frontend && npm install && cd ..
```

### Step 2: Railway Setup

#### **Create New Project on Railway**
1. Go to [railway.app](https://railway.app)
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your `InfinitySoul` repository

#### **Add Services**

**Service 1: PostgreSQL Database**
- Click **"+ New"** → **"Database"** → **"PostgreSQL"**
- Railway auto-generates `DATABASE_URL` env var

**Service 2: Redis**
- Click **"+ New"** → **"Database"** → **"Redis"**
- Note the connection details (host, port, password)

**Service 3: API Server**
- Click **"+ New"** → **"Service"**
- Select your GitHub repo
- **Build Command**: `npm install && npx prisma generate && npm run build:backend`
- **Start Command**: `npm start`
- **Root Directory**: `/` (leave blank)
- **Add Environment Variables**:
  ```
  NODE_ENV=production
  PORT=8000
  DATABASE_URL=${{Postgres.DATABASE_URL}}
  REDIS_HOST=${{Redis.REDIS_HOST}}
  REDIS_PORT=${{Redis.REDIS_PORT}}
  REDIS_PASSWORD=${{Redis.REDIS_PASSWORD}}
  ```

**Service 4: Worker Process**
- Click **"+ New"** → **"Service"**
- Select same GitHub repo
- **Build Command**: `npm install && npx prisma generate && npm run build:backend`
- **Start Command**: `npm run worker:prod`
- **Add same environment variables as API Server**

#### **Service 5: Frontend (Vercel Alternative)**
**Option A: Deploy to Vercel (Recommended)**
1. Go to [vercel.com](https://vercel.com)
2. Import your repo
3. Set **Root Directory**: `frontend`
4. Add environment variable:
   ```
   NEXT_PUBLIC_API_URL=https://your-railway-api.up.railway.app
   ```

**Option B: Deploy on Railway**
- Click **"+ New"** → **"Service"**
- **Build Command**: `cd frontend && npm install && npm run build`
- **Start Command**: `cd frontend && npm start`
- **Port**: `3000`

### Step 3: Database Migration
```bash
# Run once after deploying
railway run npx prisma db push
```

### Step 4: Verify Deployment
```bash
# Check API health
curl https://your-railway-api.up.railway.app/health

# Expected response:
# {"status":"healthy","version":"1.0.0","timestamp":"..."}
```

---

## 📋 Environment Variables (Railway)

### Required (Auto-Injected by Railway Plugins)
- `DATABASE_URL` - From PostgreSQL plugin
- `REDIS_HOST` - From Redis plugin
- `REDIS_PORT` - From Redis plugin
- `REDIS_PASSWORD` - From Redis plugin

### Manual Configuration
```env
NODE_ENV=production
PORT=8000
WORKER_CONCURRENCY=3
NEXT_PUBLIC_API_URL=https://your-api.railway.app
FRONTEND_URL=https://your-frontend.vercel.app
```

### Optional (Add Later)
```env
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
STRIPE_SECRET_KEY=sk_live_...
```

---

## 🔥 Quick Test After Deploy

### 1. Test Health Endpoint
```bash
curl https://your-api.railway.app/health
```

### 2. Test Scan Endpoint
```bash
curl -X POST https://your-api.railway.app/api/v1/scan \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}'
```

Expected response:
```json
{
  "jobId": "job-...",
  "statusUrl": "/api/v1/scan/job-.../status",
  "timestamp": "2024-12-03T..."
}
```

### 3. Check Worker Logs
In Railway dashboard → **Worker Service** → **Logs**

Should see:
```
✅ Worker started (concurrency: 3)
🎯 Processing job ...
✅ Scan completed
```

---

## 🚀 Production Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] PostgreSQL plugin added to Railway
- [ ] Redis plugin added to Railway
- [ ] API service deployed with correct env vars
- [ ] Worker service deployed with same env vars
- [ ] Prisma migrations run (`railway run npx prisma db push`)
- [ ] Frontend deployed to Vercel with `NEXT_PUBLIC_API_URL` set
- [ ] Health check returns 200 OK
- [ ] Test scan completes successfully
- [ ] Worker logs show job processing

---

## 📞 Troubleshooting

### "Cannot find module 'express'"
**Fix**: Run `npm install` locally and push, or verify Railway build command includes `npm install`

### "Prisma Client not generated"
**Fix**: Add `npx prisma generate` to build command

### "Worker not processing jobs"
**Fix**: Ensure Redis env vars are identical between API and Worker services

### "CORS errors on frontend"
**Fix**: Set `FRONTEND_URL` env var on Railway API service to match your Vercel URL

---

## 🎯 Next Steps After Launch

1. **Add Authentication**: Integrate Clerk or Auth0
2. **Enable Stripe Billing**: Add payment processing
3. **Configure AI Services**: Add Anthropic/OpenAI API keys
4. **Setup Monitoring**: Add Sentry error tracking
5. **Custom Domain**: Point your domain to Railway + Vercel
