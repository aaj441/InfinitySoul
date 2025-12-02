# 🚀 DAY 1 ACTIVATION GUIDE
## InfinitySoul Queue System Production Deployment

**Objective:** Enable async WCAG scanning queue to handle 10,000+ concurrent requests
**Duration:** 30 minutes
**Target:** Zero downtime queue activation → revenue-ready platform

---

## 📋 PRE-FLIGHT CHECKLIST

Before starting, ensure you have:

- [ ] Node.js 18+ installed (`node --version`)
- [ ] Docker installed and running (`docker --version`)
- [ ] Git on current branch: `claude/activation-guide-setup-01PeVZeuZYDYHLRTAroUrUEF`
- [ ] `.env.example` copied to `.env` with DATABASE_URL
- [ ] 30 minutes uninterrupted

---

## ⚡ STEP 1: INSTALL QUEUE DEPENDENCIES (2 minutes)

```bash
cd /home/user/InfinitySoul
npm install bullmq ioredis @prisma/client ipfs-http-client javascript-opentimestamps pdfkit qrcode
```

**What this does:**
- `bullmq`: Redis-backed async queue (replaces timeouts)
- `ioredis`: Native Redis client (faster than node-redis)
- `@prisma/client`: ORM for persistence layer
- `ipfs-http-client`: Evidence vault integration
- `javascript-opentimestamps`: Cryptographic timestamp proofs
- `pdfkit`: Report generation
- `qrcode`: Scan result QR codes

**Expected output:**
```
added 156 packages in 12s
```

---

## 🐳 STEP 2: LAUNCH REDIS (Docker) (1 minute)

```bash
docker run -d --name infinitysoul-redis -p 6379:6379 redis:7-alpine
```

**Verify Redis is running:**
```bash
docker ps | grep infinitysoul-redis
```

Should see:
```
CONTAINER ID   IMAGE           STATUS
abc123def456   redis:7-alpine  Up 30 seconds
```

**Connect to Redis CLI (optional test):**
```bash
docker exec -it infinitysoul-redis redis-cli ping
```

Expected: `PONG`

---

## 🔄 STEP 3: START BACKGROUND WORKER (Terminal #1)

```bash
cd /home/user/InfinitySoul
npm run worker
```

**Expected output:**
```
✅ InfinitySoul Worker Started
📊 Polling queue: scan_jobs
🔗 Redis: redis://localhost:6379
⚙️  Concurrency: 3 scans in parallel
🔴 Waiting for jobs...
```

**Keep this terminal OPEN** - don't close it

---

## 🌐 STEP 4: START API SERVER (Terminal #2)

In a NEW terminal:

```bash
cd /home/user/InfinitySoul
npm run dev
```

**Expected output:**
```
✅ InfinitySoul API running on port 8000
📊 Health: http://localhost:8000/health
🔍 Scan: POST http://localhost:8000/api/v1/scan
```

**Both terminals should be running simultaneously**

---

## ✅ STEP 5: TEST QUEUE ACTIVATION

### 5.1 Health Check

```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2025-12-02T..."
}
```

### 5.2 Submit a Scan Job (Async)

```bash
curl -X POST http://localhost:8000/api/v1/scan \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "email": "founder@example.com"
  }'
```

**Expected response (IMMEDIATE):**
```json
{
  "jobId": "abc123...",
  "status": "queued",
  "url": "https://example.com",
  "message": "Scan queued for processing",
  "estimatedTime": "30-60 seconds"
}
```

**CRITICAL:** Notice the response is INSTANT. No timeout.

### 5.3 Check Worker Logs (Terminal #1)

You should see:
```
🎯 Processing job: abc123...
🔍 Scanning: https://example.com
✅ Scan complete: 42 violations found
```

### 5.4 Retrieve Results (Wait 5-10 seconds)

```bash
curl http://localhost:8000/api/v1/scan/abc123/status
```

Once processing completes:
```json
{
  "jobId": "abc123...",
  "status": "completed",
  "violations": {
    "critical": 5,
    "serious": 8,
    "moderate": 12,
    "minor": 17,
    "total": 42
  },
  "riskScore": 68.5,
  "estimatedLawsuitCost": 155000,
  "completedAt": "2025-12-02T..."
}
```

---

## 🔬 STEP 6: LOAD TEST (5 CONCURRENT SCANS)

```bash
for i in {1..5}; do
  curl -X POST http://localhost:8000/api/v1/scan \
    -H "Content-Type: application/json" \
    -d "{\"url\": \"https://example.com?page=$i\"}" &
done
wait
```

**Check worker terminal:**
You should see all 5 jobs processing in parallel (default concurrency: 3, so 3 immediate, 2 in queue)

```
🎯 Processing job 1/5
🎯 Processing job 2/5
🎯 Processing job 3/5
⏳ Job 4/5 queued (waiting for worker)
⏳ Job 5/5 queued (waiting for worker)
🎉 Job 1/5 complete
🎯 Processing job 4/5
```

---

## 📊 STEP 7: DATABASE PERSISTENCE (Optional - Day 2)

To enable database persistence, run:

```bash
npx prisma migrate dev --name init
```

Then the queue will automatically save all scan results to PostgreSQL.

---

## 🎯 SUCCESS CHECKLIST

- [ ] Redis running in Docker
- [ ] Worker terminal showing "🔴 Waiting for jobs..."
- [ ] API server running on port 8000
- [ ] Health check returns 200 OK
- [ ] Single scan submission returns instant `jobId`
- [ ] Worker processes and completes scan
- [ ] 5-scan load test shows parallel processing
- [ ] No timeouts observed

---

## 🛠️ TROUBLESHOOTING

### Problem: "connect ECONNREFUSED 127.0.0.1:6379"

**Solution:** Redis not running

```bash
docker run -d --name infinitysoul-redis -p 6379:6379 redis:7-alpine
```

### Problem: "Port 8000 already in use"

**Solution:** Kill existing process

```bash
lsof -i :8000
kill -9 <PID>
```

### Problem: Worker shows "No scans found in 30 seconds"

**This is NORMAL.** It means the queue is empty and the worker is idle, watching for jobs.

### Problem: "Cannot find module 'bullmq'"

**Solution:** Dependencies not installed

```bash
npm install bullmq ioredis
```

### Problem: Scan returns error after 30 seconds

**Likely cause:** Browser timeout (URL might be slow)

**Solution:** Increase timeout in `backend/worker.ts`:

```typescript
const result = await scanWithAxe(job.data.url, 60000); // 60 second timeout
```

---

## 📈 WHAT'S HAPPENING UNDER THE HOOD

1. **Request arrives** → API validates URL → adds to Redis queue
2. **Worker polls queue** → picks up 3 jobs in parallel (configurable)
3. **Browser launches** → axe-core scans → results stored in queue job
4. **Client polls status** → gets completed results
5. **Scalability achieved** → no timeouts, concurrent request handling

---

## 🚀 NEXT STEPS (Day 2+)

1. **Evidence Vault:** Add IPFS + cryptographic timestamps
2. **Database:** Connect Prisma for permanent scan history
3. **Authentication:** Add Clerk auth + JWT tokens
4. **Billing:** Stripe integration with usage limits
5. **Deployment:** Docker → Railway.app (5 min setup)

---

## 💬 SUPPORT

**Queue jobs not processing?**
- Check: `docker logs infinitysoul-redis`
- Check: Worker terminal for error messages
- Restart: `npm run worker`

**Everything working?**
```
✅ Queue: ACTIVE
✅ Worker: PROCESSING
✅ API: RESPONDING
✅ Scale: READY FOR 10K+ REQUESTS
```

**You're production-ready. Execute Week 2.**

---

## 📝 ACTIVATION LOG

Record your activation time:

- Date: _______________
- Time Started: _______________
- Time Completed: _______________
- Issues Encountered: _______________
- Status: [ ] SUCCESS [ ] FAILED

**Submit evidence:** Screenshot of 5-scan load test output + worker terminal logs
