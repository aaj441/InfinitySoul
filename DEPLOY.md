# Deployment Guide: Zero-Dollar Stack

> "Build $2B on $10M cash. Start with $0." — Kluge Principle

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    PRODUCTION STACK ($0/month)               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌─────────────┐         ┌─────────────────────────────┐   │
│   │   VERCEL    │         │         RAILWAY             │   │
│   │  (Frontend) │  ──────▶│        (Backend)            │   │
│   │    FREE     │         │      $5 credit/mo           │   │
│   └─────────────┘         └─────────────────────────────┘   │
│         │                            │                       │
│         │                            │                       │
│         ▼                            ▼                       │
│   ┌─────────────┐         ┌─────────────────────────────┐   │
│   │  SUPABASE   │         │         UPSTASH             │   │
│   │  (Database) │         │         (Redis)             │   │
│   │    FREE     │         │          FREE               │   │
│   └─────────────┘         └─────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Step 1: Deploy Frontend (Vercel)

### Option A: One-Click Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/InfinitySoul&project-name=infinitysoul&root-directory=frontend)

### Option B: CLI Deploy
```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to frontend
cd frontend

# Deploy (first time)
vercel

# Deploy to production
vercel --prod
```

### Environment Variables (Vercel Dashboard)
```
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
BACKEND_URL=https://your-backend.railway.app
```

---

## Step 2: Deploy Backend (Railway)

### Quick Setup
1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub"
3. Select your repo, set root directory to `backend`
4. Add environment variables (see below)

### Environment Variables (Railway Dashboard)
```
PORT=8000
NODE_ENV=production
REDIS_URL=${{Redis.REDIS_URL}}  # Railway auto-injects this
```

### railway.json (auto-detected)
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/health",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

---

## Step 3: Database (Supabase)

### Setup
1. Go to [supabase.com](https://supabase.com)
2. Create new project (free tier: 500MB)
3. Copy connection string

### Add to Railway
```
DATABASE_URL=postgresql://postgres:password@db.xxx.supabase.co:5432/postgres
```

---

## Step 4: Redis Queue (Upstash)

### Setup
1. Go to [upstash.com](https://upstash.com)
2. Create Redis database (free: 10K commands/day)
3. Copy connection URL

### Add to Railway
```
REDIS_URL=rediss://default:xxx@xxx.upstash.io:6379
```

---

## Cost Breakdown

| Service | Free Tier | When You'll Pay |
|---------|-----------|-----------------|
| **Vercel** | 100GB bandwidth, unlimited deploys | >100GB/mo bandwidth |
| **Railway** | $5 credit/month | Heavy compute usage |
| **Supabase** | 500MB storage, 2GB transfer | >500MB database |
| **Upstash** | 10K commands/day | >10K Redis ops/day |
| **TOTAL** | **$0/month** | **After product-market fit** |

---

## Quick Start (Local Development)

```bash
# Terminal 1: Backend
cd backend
npm install
npm run dev

# Terminal 2: Frontend
cd frontend
npm install
npm run dev

# Open http://localhost:3000
```

---

## Production Checklist

### Before Launch
- [ ] Set all environment variables in Vercel
- [ ] Set all environment variables in Railway
- [ ] Test /health endpoint
- [ ] Test /api/v1/scan endpoint
- [ ] Verify CORS is configured for your domain

### Post-Launch
- [ ] Set up Vercel Analytics (free)
- [ ] Monitor Railway usage ($5 credit)
- [ ] Add custom domain (optional)
- [ ] Set up error alerting (Sentry free tier)

---

## Custom Domain (Optional)

### Vercel (Frontend)
1. Go to Project Settings → Domains
2. Add your domain (e.g., `infinitysoul.io`)
3. Update DNS: CNAME → `cname.vercel-dns.com`

### Railway (Backend)
1. Go to Service Settings → Domains
2. Add subdomain (e.g., `api.infinitysoul.io`)
3. Update DNS: CNAME → `your-service.railway.app`

---

## Scaling Path

### Phase 0: Bootstrap ($0/month)
- Current stack, free tiers only
- SQLite/Supabase for data
- Single-region deployment

### Phase 1: Traction ($50-100/month)
- Upgrade Railway for more compute
- Add monitoring (Sentry, LogRocket)
- Multi-region CDN via Vercel

### Phase 2: Growth ($500+/month)
- Dedicated database (RDS/PlanetScale)
- Redis cluster for queues
- API rate limiting

---

## Troubleshooting

### "Connection refused" errors
- Check NEXT_PUBLIC_API_URL is set correctly
- Ensure backend is deployed and /health returns 200
- Verify CORS allows your frontend domain

### "Build failed" on Vercel
- Check Node.js version matches (18.x)
- Run `npm run build` locally first
- Check for TypeScript errors

### Railway deploy fails
- Check for missing environment variables
- Verify start script in package.json
- Check build logs for errors

---

## Support

- GitHub Issues: [link]
- Discord: [link]
- Email: support@infinitysoul.io (when you have revenue)

---

*"The rails are forever. Start with $0."*
