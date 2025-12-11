# 🚀 InfinitySoul Deploy NOW - Step-by-Step Checklist

## Phase 1: Local Verification (15 minutes)

### Step 1.1: Clone & Install Dependencies
```bash
# Navigate to your workspace
cd /path/to/InfinitySoul

# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..

# Expected: "added X packages in Ys"
```

**Verify:**
```bash
# Check Node version
node -v  # Should be 18+

# Check npm
npm -v

# Check key packages installed
npm list express cors playwright bullmq ioredis @prisma/client
```

---

### Step 1.2: Setup Local Environment
```bash
# Create .env file (if not exists)
cat > .env << 'EOF'
NODE_ENV=development
PORT=8000
REDIS_HOST=localhost
REDIS_PORT=6379
DATABASE_URL=postgresql://postgres:password@localhost:5432/infinitysoul
NEXT_PUBLIC_API_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
EOF

# Verify created
cat .env
```

---

### Step 1.3: Start PostgreSQL (Docker)
```bash
# Start PostgreSQL container
docker run -d \
  --name infinitysoul-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=infinitysoul \
  -p 5432:5432 \
  postgres:15-alpine

# Verify running
docker ps | grep infinitysoul-db

# Test connection
psql postgresql://postgres:password@localhost:5432/infinitysoul -c "SELECT version();"
```

**Expected output:** PostgreSQL version info

---

### Step 1.4: Start Redis (Docker)
```bash
# Start Redis container
docker run -d \
  --name infinitysoul-redis \
  -p 6379:6379 \
  redis:7-alpine

# Verify running
docker ps | grep infinitysoul-redis

# Test connection
redis-cli ping
# Expected: PONG
```

---

### Step 1.5: Setup Database
```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed database (optional)
npx prisma db seed 2>/dev/null || true
```

**Expected:** No errors, database ready

---

### Step 1.6: Start Backend Services (Terminal 1)
```bash
# Start background worker
npm run worker

# Expected output:
# ✅ Worker started (concurrency: 3)
# 🎯 Ready to process jobs
```

**Keep this terminal open.**

---

### Step 1.7: Start API Server (Terminal 2)
```bash
# Start API
npm run backend

# Expected output:
# ✅ InfinitySol API running on port 8000
# 📊 Health: http://localhost:8000/health
# 🔍 Scan: POST http://localhost:8000/api/v1/scan
```

**Keep this terminal open.**

---

### Step 1.8: Start Frontend (Terminal 3)
```bash
# Start Next.js dev server
cd frontend
npm run dev

# Expected output:
# ▲ Next.js 14.x.x
# - Local: http://localhost:3000
```

**Keep this terminal open.**

---

### Step 1.9: Health Check
```bash
# Test API health
curl http://localhost:8000/health

# Expected:
# {"status":"healthy","version":"1.0.0","timestamp":"..."}
```

---

### Step 1.10: Test Single Scan
```bash
# Run single lead test
./scripts/test-single-lead.sh https://example.com http://localhost:8000

# Should see:
# 📤 Submitting scan...
# Job ID: job-XXXXX
# ⏳ Waiting for results...
# 📊 Final Result: {...violations, riskScore, etc...}
```

**Verify:**
- ✅ Job created
- ✅ Status updates
- ✅ Results returned
- ✅ Violations shown

---

### Step 1.11: Test Frontend UI
```bash
# Open in browser
open http://localhost:3000

# Or manually:
# 1. Navigate to http://localhost:3000
# 2. Enter URL: https://example.com
# 3. Click "SCAN MY SITE (FREE)"
# 4. Watch status bar appear
# 5. See violations populate with badges
# 6. Test keyboard nav (Tab, Enter)
```

**Verify:**
- ✅ Page loads
- ✅ Form accepts input
- ✅ Submit triggers scan
- ✅ Status updates in real-time
- ✅ Results display with impact badges
- ✅ Keyboard navigation works

---

## Phase 2: Stress Test (10 minutes)

### Step 2.1: Run 25-Industry Blast
```bash
# Make sure services still running in background terminals

# Run stress test
./scripts/stress-test.sh http://localhost:8000

# Expected:
# 🚀 InfinitySoul Stress Test
# API Base: http://localhost:8000
# 📤 Submitting scans... (25 domains)
# ⏳ Polling results...
# ✅ Submitted 25 scans
# Progress: 0/25, 5/25, 10/25, ..., 25/25
```

---

### Step 2.2: Review Results
```bash
# List all results
ls -la test-results-*/

# View summary
ls -1 test-results-*/*_result.json | wc -l
# Should show: 25

# Sample violations
cat test-results-*/*_result.json | head -20

# Extract metrics
grep -h "riskScore\|total" test-results-*/*.json | head -10
```

---

## Phase 3: Production Deployment (20 minutes)

### Step 3.1: Create Railway Project
```bash
# Go to https://railway.app
# Click "New Project" → "Deploy from GitHub"
# Select your InfinitySoul repo
# Click Deploy

# Wait for initial build (~2 min)
```

---

### Step 3.2: Add PostgreSQL Plugin
```bash
# In Railway Dashboard:
# 1. Click "+ New"
# 2. Select "Database" → "PostgreSQL"
# 3. Wait for provisioning

# Verify in services list:
# - postgres (service)
# - Should show connection string
```

---

### Step 3.3: Add Redis Plugin
```bash
# In Railway Dashboard:
# 1. Click "+ New"
# 2. Select "Database" → "Redis"
# 3. Wait for provisioning

# Note down connection details:
# REDIS_HOST: (shown in plugins)
# REDIS_PORT: (shown in plugins)
# REDIS_PASSWORD: (shown in plugins)
```

---

### Step 3.4: Create API Service
```bash
# In Railway Dashboard:
# 1. Click "+ New" → "Service"
# 2. Select your GitHub repo
# 3. Configure:

# Root Directory: (leave empty)
# Build Command:
npm install && npx prisma generate && npm run build:backend

# Start Command:
npm start

# Click "Deploy"
```

---

### Step 3.5: Set API Environment Variables
```bash
# In Railway API Service → Variables:

NODE_ENV=production
PORT=8000
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_HOST=${{Redis.REDIS_HOST}}
REDIS_PORT=${{Redis.REDIS_PORT}}
REDIS_PASSWORD=${{Redis.REDIS_PASSWORD}}
WORKER_CONCURRENCY=3
NEXT_PUBLIC_API_URL=(will update after deployment)
FRONTEND_URL=(will update after Vercel deploy)
```

**Click "Deploy" to apply.**

---

### Step 3.6: Create Worker Service
```bash
# In Railway Dashboard:
# 1. Click "+ New" → "Service"
# 2. Select same GitHub repo
# 3. Configure:

# Root Directory: (leave empty)
# Build Command:
npm install && npx prisma generate && npm run build:backend

# Start Command:
npm run worker:prod

# Click "Deploy"
```

---

### Step 3.7: Set Worker Environment Variables
```bash
# In Railway Worker Service → Variables:
# Copy exact same variables as API service:

NODE_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_HOST=${{Redis.REDIS_HOST}}
REDIS_PORT=${{Redis.REDIS_PORT}}
REDIS_PASSWORD=${{Redis.REDIS_PASSWORD}}
WORKER_CONCURRENCY=3
```

**Click "Deploy".**

---

### Step 3.8: Get API Domain
```bash
# In Railway Dashboard → API Service → Settings:
# Find: Service Domain or Generated Domain

# Copy format: https://infinitysoul-api-prod.up.railway.app

# Save this as $API_DOMAIN for next steps
export API_DOMAIN="https://your-domain.up.railway.app"
```

---

### Step 3.9: Run Database Migration
```bash
# Test connection first
curl "$API_DOMAIN/health"
# Should return: {"status":"healthy",...}

# Run Prisma migrations
# Option A: Via Railway CLI
railway run npx prisma db push

# Option B: Via SSH into service
# Contact Railway support or use dashboard shell

# Verify database created
curl "$API_DOMAIN/api/v1/scan" -X POST \
  -H "Content-Type: application/json" \
  -d '{"url":"https://test.com"}'
# Should return jobId, not error
```

---

### Step 3.10: Deploy Frontend to Vercel
```bash
# Go to https://vercel.com
# Click "Add New..." → "Project"
# Select your GitHub repo
# Configure:

# Framework: Next.js
# Root Directory: frontend
# Build Command: next build
# Output Directory: .next
# Environment Variables:

NEXT_PUBLIC_API_URL=$API_DOMAIN

# Example: https://infinitysoul-api.up.railway.app

# Click "Deploy"
# Wait for deployment (~2-3 min)
```

---

### Step 3.11: Get Vercel Domain
```bash
# In Vercel Dashboard → Project Settings:
# Find: Production Domain

# Copy: https://your-app.vercel.app

# Save as $VERCEL_URL
export VERCEL_URL="https://your-app.vercel.app"
```

---

### Step 3.12: Update Railway Environment Variables
```bash
# Back in Railway → API Service → Variables:
# Update FRONTEND_URL:

FRONTEND_URL=$VERCEL_URL

# Example: https://infinitysoul.vercel.app

# Click "Deploy"
```

---

## Phase 4: Production Verification (10 minutes)

### Step 4.1: Health Check
```bash
curl "$API_DOMAIN/health"

# Expected:
# {"status":"healthy","version":"1.0.0","timestamp":"..."}
```

---

### Step 4.2: Submit Test Scan
```bash
curl -X POST "$API_DOMAIN/api/v1/scan" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}'

# Expected:
# {
#   "jobId": "job-...",
#   "statusUrl": "/api/v1/scan/job-.../status",
#   "timestamp": "..."
# }
```

---

### Step 4.3: Check Worker Logs
```bash
# In Railway Dashboard → Worker Service → Logs
# Should see:
# ✅ Worker started (concurrency: 3)
# 🎯 Processing job ...
# ✅ Scan completed

# If errors, check:
# - Redis connection
# - Database connection
# - Playwright browser availability
```

---

### Step 4.4: Test Frontend
```bash
# Open in browser
open "$VERCEL_URL"

# Or navigate manually:
# 1. Go to https://your-app.vercel.app
# 2. Enter URL: https://example.com
# 3. Click "SCAN MY SITE (FREE)"
# 4. Watch status bar appear
# 5. See results populate

# Verify:
# - Page loads
# - Form works
# - Status updates in real-time
# - Results show with badges
# - Keyboard nav works
```

---

### Step 4.5: Run Production Stress Test
```bash
# Test against deployed Railway API
./scripts/stress-test.sh "$API_DOMAIN"

# Expected:
# Same as local, but from production infrastructure
# 25 scans submitted and processed
```

---

### Step 4.6: Test Real Prospect Domains
```bash
# Replace with actual prospects
./scripts/test-single-lead.sh https://prospect1.com "$API_DOMAIN"
./scripts/test-single-lead.sh https://prospect2.com "$API_DOMAIN"
./scripts/test-single-lead.sh https://prospect3.com "$API_DOMAIN"

# Results should show violations, risk scores, estimated costs
```

---

## Phase 5: Go-Live (5 minutes)

### Step 5.1: Share Demo Link
```bash
# Frontend URL ready for prospects
$VERCEL_URL

# Demo scan link (shareable):
$VERCEL_URL?demo=true

# Or share direct scan URL:
curl -X POST "$API_DOMAIN/api/v1/scan" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://prospect-domain.com"}'
```

---

### Step 5.2: Monitor Initial Traffic
```bash
# Railway Logs
# Check: API Service → Logs
# Check: Worker Service → Logs

# Vercel Analytics
# Check: Dashboard → Analytics

# Watch for:
# ✅ Successful scans
# ❌ Any errors
# ⏳ Response times
```

---

### Step 5.3: Setup Monitoring Alerts
```bash
# Optional: Add Sentry for error tracking
# Optional: Add CloudWatch alarms
# Optional: Monitor queue depth
```

---

## Troubleshooting Quick Reference

| Issue | Solution |
|-------|----------|
| "Connection refused" | Check if services running: `ps aux \| grep node` |
| "Queue connection failed" | Check Redis: `redis-cli ping` |
| "Database error" | Run migration: `npx prisma db push` |
| "Frontend blank" | Check env var: `echo $NEXT_PUBLIC_API_URL` |
| "Worker not processing" | Check Railway worker logs for errors |
| "Slow scans" | Increase `WORKER_CONCURRENCY` or check Playwright |

---

## Final Checklist

- [ ] Phase 1: All 11 local steps passing
- [ ] Phase 2: Stress test: 25/25 scans completed
- [ ] Phase 3: All 12 deployment steps complete
- [ ] Phase 4: All 6 production verification steps passing
- [ ] Phase 5: Demo link live and tested

**Total Time: ~60 minutes**

**Once complete:**
- ✅ Backend on Railway (API + Worker + DB + Redis)
- ✅ Frontend on Vercel
- ✅ End-to-end testing complete
- ✅ Ready for customer demos
- ✅ Production monitoring active

---

**Next command to run:**
```bash
# Start Phase 1
npm install
```
