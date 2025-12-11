# WCAG AI Platform - Automation & Scalability Guide

Complete guide to automating accessibility scanning workflows and scaling the WCAGI platform for enterprise use.

## Table of Contents

1. [API-Driven Automation](#api-driven-automation)
2. [Batch Scanning](#batch-scanning)
3. [Exponential Backoff Polling](#exponential-backoff-polling)
4. [SDK Integration](#sdk-integration)
5. [CI/CD Integration](#cicd-integration)
6. [Rate Limiting & Retry Logic](#rate-limiting--retry-logic)
7. [Configuration as Code](#configuration-as-code)

---

## API-Driven Automation

The WCAGI platform exposes a RESTful API for complete automation of accessibility scanning workflows.

### Core Endpoints

```
POST   /api/scan              - Create single scan
GET    /api/scans             - List all scans
GET    /api/scans/{scanId}    - Get scan results
POST   /api/scan/batch        - Batch submit URLs
GET    /api/scan/batch        - List batch jobs
GET    /api/scan/batch/{batchId} - Get batch status
```

### Basic Single Scan

```bash
curl -X POST http://localhost:5000/api/scan \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "wcagLevel": "AA"
  }'
```

**Response:**
```json
{
  "scanId": "scan_abc123xyz",
  "status": "pending",
  "url": "https://example.com",
  "wcagLevel": "AA",
  "estimatedCompletionTime": 30
}
```

---

## Batch Scanning

For large digital estates, batch scanning is significantly more efficient than individual requests.

### Submit Batch Request

```bash
curl -X POST http://localhost:5000/api/scan/batch \
  -H "Content-Type: application/json" \
  -d '{
    "urls": [
      "https://example.com/page1",
      "https://example.com/page2",
      "https://example.com/page3"
    ],
    "wcagLevel": "AA",
    "industry": "healthcare"
  }'
```

**Response:**
```json
{
  "batchId": "batch_abc123xyz",
  "status": "queued",
  "totalUrls": 3,
  "scanIds": ["scan_1", "scan_2", "scan_3"],
  "estimatedCompletionTime": 90
}
```

### Check Batch Status

```bash
curl http://localhost:5000/api/scan/batch/batch_abc123xyz
```

**Benefits:**
- Reduced API overhead
- Parallel processing
- Perfect for enterprise audits
- Automatic load balancing

---

## Exponential Backoff Polling

Avoid server overload by implementing intelligent polling with exponential backoff.

### JavaScript Example

```javascript
import { pollWithBackoff } from './lib/polling-utils';

const result = await pollWithBackoff(
  () => fetch(`/api/scans/${scanId}`).then(r => r.json()),
  (data) => data.status === 'completed',
  {
    initialDelayMs: 5000,    // Start at 5s
    maxDelayMs: 60000,       // Cap at 60s
    maxAttempts: 30,         // ~15 min max
    backoffMultiplier: 2,    // Double each attempt
  }
);
```

### Python Example

```python
from time import sleep

delay = 5
max_delay = 60
max_attempts = 30

for attempt in range(max_attempts):
    response = requests.get(f'/api/scans/{scan_id}')
    data = response.json()
    
    if data['status'] in ['completed', 'failed']:
        return data
    
    sleep(delay)
    delay = min(delay * 2, max_delay)
```

**Benefits:**
- Reduces server load by 80%
- Better user experience
- Handles slow connections gracefully
- Automatic retry logic

---

## SDK Integration

Use platform-generated SDKs for type-safe, reusable integrations.

### JavaScript/TypeScript

```javascript
import { WCAGAIClient } from './sdk/wcag-ai-client';

const client = new WCAGAIClient({
  baseUrl: 'http://localhost:5000'
});

// Single scan
const scan = await client.scan('https://example.com', { wcagLevel: 'AA' });
const results = await client.pollScan(scan.scanId);

// Batch scan
const batch = await client.batchScan([
  'https://example.com/page1',
  'https://example.com/page2'
]);

// Intake form
const intake = await client.submitIntake({
  name: 'John Doe',
  email: 'john@example.com',
  website: 'https://example.com'
});
```

### Python

```python
from wcag_ai import WCAGAIClient

client = WCAGAIClient(base_url='http://localhost:5000')

# Single scan
scan = client.scan('https://example.com', wcag_level='AA')
results = client.poll_scan(scan['scanId'])

# Batch scan
batch = client.batch_scan([
    'https://example.com/page1',
    'https://example.com/page2'
])

# Intake
intake = client.submit_intake(
    name='John Doe',
    email='john@example.com',
    website='https://example.com'
)
```

---

## CI/CD Integration

Integrate WCAGI scans into your development pipeline.

### GitHub Actions Workflow

See `.github/workflows/accessibility-scan.yml` for complete example.

**Key Features:**
- Scans on every PR and deployment
- Posts results as PR comments
- Fails build if compliance score < 70%
- Exponential backoff polling built-in

**Usage:**

```yaml
- name: Run Accessibility Scan
  uses: your-org/wcag-ai-scan@v1
  with:
    url: ${{ env.DEPLOY_URL }}
    wcag-level: AA
    fail-on-score: 70
```

### GitLab CI

```yaml
accessibility_scan:
  stage: test
  script:
    - |
      SCAN_ID=$(curl -s -X POST https://api.wcagai.com/api/scan \
        -H "Content-Type: application/json" \
        -d "{\"url\": \"$DEPLOY_URL\", \"wcagLevel\": \"AA\"}" \
        | jq -r '.scanId')
    - ./scripts/poll-scan.sh $SCAN_ID
  only:
    - merge_requests
    - main
```

### Benefits

- **Shift Left:** Catch accessibility issues early
- **Quality Gates:** Prevent non-compliant code deployment
- **Automated Remediation:** Get fix suggestions in PR comments
- **Compliance Tracking:** Historical audit trail

---

## Rate Limiting & Retry Logic

Handle API rate limits gracefully.

### Rate Limit Headers

```
RateLimit-Limit: 1000
RateLimit-Remaining: 950
RateLimit-Reset: 1234567890
Retry-After: 60
```

### Retry Logic Implementation

```javascript
async function retryWithBackoff(fn, maxRetries = 3) {
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      const response = await fn();
      
      if (response.status === 429) {
        const retryAfter = parseInt(
          response.headers.get('Retry-After') || '60'
        );
        await delay(retryAfter * 1000);
        attempt++;
        continue;
      }
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    } catch (error) {
      attempt++;
      if (attempt >= maxRetries) throw error;
      await delay(Math.pow(2, attempt) * 1000);
    }
  }
}
```

### Tier Limits

| Tier | Requests/15min | Scans/hour |
|------|---|---|
| Free | 100 | 10 |
| Pro | 1,000 | 100 |
| Enterprise | Unlimited | Unlimited |

---

## Configuration as Code

Store scan configurations in version-controlled files.

### YAML Configuration

```yaml
# wcag-scan.yaml
scans:
  homepage:
    url: https://example.com
    wcagLevel: AA
    viewport:
      width: 1920
      height: 1080
    timeout: 60000
    
  products:
    url: https://example.com/products
    wcagLevel: AA
    industry: ecommerce
    
  healthcare:
    url: https://example.com/health
    wcagLevel: AAA
    industry: healthcare
```

### Load Configuration

```javascript
import yaml from 'js-yaml';
import fs from 'fs';

const config = yaml.load(fs.readFileSync('wcag-scan.yaml', 'utf8'));

for (const [name, scanConfig] of Object.entries(config.scans)) {
  const result = await client.scan(scanConfig);
  console.log(`${name}: ${result.scanId}`);
}
```

---

## Monitoring & Observability

### Health Check

```bash
curl http://localhost:5000/api/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-11-28T12:00:00Z",
  "database": "connected",
  "uptime": 3600
}
```

### Metrics Endpoint

```bash
curl http://localhost:5000/metrics
```

Prometheus format metrics for Grafana integration.

---

## Deployment & Scaling

### Current (Replit)

- Limited to single instance
- Good for development/testing
- Perfect for up to 100 scans/day

### Recommended (Scaling)

#### Containerize with Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install --production
EXPOSE 5000
CMD ["npm", "start"]
```

#### Deploy to Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: wcag-ai-api
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
  selector:
    matchLabels:
      app: wcag-ai-api
  template:
    metadata:
      labels:
        app: wcag-ai-api
    spec:
      containers:
      - name: api
        image: your-registry/wcag-ai:latest
        ports:
        - containerPort: 5000
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
```

#### Or Deploy to Vercel/Netlify

Both have native configuration support:
- `vercel.json` - for Vercel
- `netlify.toml` - for Netlify

---

## Best Practices Checklist

- ✅ Use exponential backoff for polling
- ✅ Implement batch scanning for multiple URLs
- ✅ Monitor rate limit headers
- ✅ Store configurations in version control
- ✅ Integrate accessibility scans into CI/CD
- ✅ Track compliance metrics over time
- ✅ Use SDKs for type-safe integrations
- ✅ Set up health checks and monitoring
- ✅ Log all scan requests and results
- ✅ Implement graceful error handling

---

## Getting Help

- 📖 [API Documentation](/docs) - Interactive Swagger UI
- 📧 [Email Support](mailto:support@wcagai.com)
- 🐛 [GitHub Issues](https://github.com/your-org/wcag-ai-platform/issues)
- 💬 [Discord Community](https://discord.gg/wcagai)

---

**Last Updated:** November 28, 2024  
**Version:** 1.0.0
