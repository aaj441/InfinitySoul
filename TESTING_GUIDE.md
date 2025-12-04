# 🧪 InfinitySoul Testing Guide

## Quick Start (Local Testing)

### 1. Start Services

**Terminal 1 - Worker:**
```bash
npm run worker
```

**Terminal 2 - API:**
```bash
npm run backend
```

**Terminal 3 - Frontend:**
```bash
cd frontend && npm run dev
```

---

## Test Commands

### Health Check
```bash
curl http://localhost:8000/health
```

Expected: `{"status":"healthy","version":"1.0.0","timestamp":"..."}`

---

### Test Single Lead
```bash
chmod +x scripts/test-single-lead.sh
./scripts/test-single-lead.sh https://example.com
```

Or with your Railway API:
```bash
./scripts/test-single-lead.sh https://example.com https://your-api.up.railway.app
```

---

### Stress Test (25 Industries)
```bash
chmod +x scripts/stress-test.sh
./scripts/stress-test.sh http://localhost:8000
```

Or against Railway:
```bash
./scripts/stress-test.sh https://your-api.up.railway.app
```

Results saved to: `test-results-YYYYMMDD-HHMMSS/`

---

## Manual Testing

### Submit Scan
```bash
curl -X POST http://localhost:8000/api/v1/scan \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com","email":"test@example.com"}'
```

Response:
```json
{
  "jobId": "job-1234567890-abc",
  "statusUrl": "/api/v1/scan/job-1234567890-abc/status",
  "timestamp": "2025-12-03T..."
}
```

### Check Status
```bash
curl http://localhost:8000/api/v1/scan/JOB_ID/status
```

---

## Frontend Testing

### Open UI
```
http://localhost:3000
```

### Test Flow
1. Enter URL: `https://example.com`
2. Click "SCAN MY SITE (FREE)"
3. Watch status bar update
4. See WCAG impact badges appear
5. Click violations to highlight
6. Test keyboard navigation (Tab through items)

### Accessibility Testing
```bash
# Tab through all interactive elements
# Enter key should trigger actions
# Screen reader should announce all changes
# Focus rings should be visible (red, 4px)
```

---

## Production Testing (Railway)

### Set Your API URL
```bash
export API_BASE="https://your-api.up.railway.app"
```

### Health Check
```bash
curl $API_BASE/health
```

### Submit Test Scan
```bash
curl -X POST $API_BASE/api/v1/scan \
  -H "Content-Type: application/json" \
  -d '{"url":"https://yourprospect.com"}'
```

### Check Worker Logs
```
Railway Dashboard → Worker Service → Logs
```

Should see:
```
✅ Worker started (concurrency: 3)
🎯 Processing job ...
✅ Scan completed
```

---

## Lead Testing Workflow

### Test Your Real Prospects
```bash
# Replace with actual prospect domains
./scripts/test-single-lead.sh https://prospect1.com $API_BASE
./scripts/test-single-lead.sh https://prospect2.com $API_BASE
./scripts/test-single-lead.sh https://prospect3.com $API_BASE
```

### Analyze Results
```bash
# View all test results
ls test-results-*/

# View specific result
cat test-results-*/ecommerce_result.json | python3 -m json.tool

# Extract key metrics
grep -h "riskScore\|total\|estimatedLawsuitCost" test-results-*/*.json
```

---

## Verification Checklist

### API Layer
- [ ] Health endpoint returns 200 OK
- [ ] Scan endpoint accepts POST
- [ ] Returns jobId and statusUrl
- [ ] Status endpoint shows progress
- [ ] Completed scans return full results

### Worker Layer
- [ ] Worker starts without errors
- [ ] Processes jobs from queue
- [ ] Logs show scan lifecycle
- [ ] Handles failures gracefully
- [ ] Updates job status

### Frontend Layer
- [ ] Page loads without errors
- [ ] Form accepts URL input
- [ ] Submit triggers scan
- [ ] Status bar appears
- [ ] Results display with badges
- [ ] Keyboard navigation works
- [ ] Screen reader announces changes

### Integration
- [ ] Frontend → API communication works
- [ ] API → Worker job flow works
- [ ] Status polling updates UI
- [ ] Error states display properly
- [ ] All WCAG badges render correctly

---

## Troubleshooting

### "Connection refused"
```bash
# Check if services are running
ps aux | grep node
netstat -an | grep 8000
```

### "Queue connection failed"
```bash
# Check Redis
redis-cli ping
# Should return: PONG

# Or check env vars
echo $REDIS_HOST $REDIS_PORT
```

### "Worker not processing"
```bash
# Check worker logs
npm run worker

# Check queue stats
curl http://localhost:8000/api/queue/stats
```

### "Frontend not connecting"
```bash
# Check env var
echo $NEXT_PUBLIC_API_URL

# Verify in browser console
console.log(process.env.NEXT_PUBLIC_API_URL)
```

---

## Performance Testing

### Concurrent Scans
```bash
# Submit 10 scans simultaneously
for i in {1..10}; do
  curl -X POST $API_BASE/api/v1/scan \
    -H "Content-Type: application/json" \
    -d '{"url":"https://example'$i'.com"}' &
done
wait
```

### Monitor Queue Depth
```bash
watch -n 2 'curl -s http://localhost:8000/api/queue/stats'
```

---

## Next Steps After Testing

1. **Deploy to Railway** if tests pass locally
2. **Update Vercel env** with Railway API URL
3. **Run production smoke test** with real domains
4. **Monitor worker logs** for first 24 hours
5. **Set up alerts** for failures
6. **Document baseline metrics** for your industry

---

## Quick Reference

| Service | Local | Railway |
|---------|-------|---------|
| API | `http://localhost:8000` | `https://<api>.up.railway.app` |
| Frontend | `http://localhost:3000` | `https://<app>.vercel.app` |
| Worker | Background process | Railway worker service |
| Redis | `localhost:6379` | Railway Redis plugin |
| Database | Local PostgreSQL | Railway Postgres plugin |

---

**Ready to test?** Start with:
```bash
./scripts/test-single-lead.sh https://example.com
```
