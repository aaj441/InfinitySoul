# WCAG AI Platform - API Documentation

## Overview

The WCAG AI Platform provides a comprehensive REST API for consultant enablement, prospect management, and agentic automation. All endpoints use JSON and support task-based workflows for autonomous agent orchestration.

**Base URL**: `http://localhost:5000` (development) or deployed URL

## Authentication

Currently, the API is public and supports UUID-based access tokens for secure report sharing.

### Token-based Access (Reports)
```
GET /api/scan/{id}/report?token={accessToken}
```

---

## Core Endpoints by Category

### 1. Health & Status

#### GET /api/health
Health check endpoint. Returns server status, uptime, and database connection.

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-24T01:00:00Z",
  "uptime": 3600,
  "environment": "production",
  "database": "connected"
}
```

---

### 2. Prospect Management

#### GET /api/prospects
List all prospects with their details and scan history.

**Query Parameters**:
- `status` (optional): `pending`, `in-progress`, `completed`, `failed`
- `icpScore` (optional): Filter by ICP score (0-100)
- `limit` (optional): Results per page (default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Response**:
```json
[
  {
    "id": "uuid",
    "name": "Stripe",
    "domain": "stripe.com",
    "icpScore": 95,
    "industry": "fintech",
    "status": "completed",
    "lastScanned": "2025-11-24T01:00:00Z",
    "riskScore": 42,
    "violationCount": 23
  }
]
```

#### POST /api/prospects
Create a new prospect.

**Request Body**:
```json
{
  "name": "Company Name",
  "domain": "example.com",
  "industry": "finance",
  "icpScore": 85
}
```

#### GET /api/prospects/{id}
Get detailed prospect information.

**Response**: Prospect object with full scan history and violation details

#### PATCH /api/prospects/{id}
Update prospect information.

**Request Body**: Any prospect fields to update

#### DELETE /api/prospects/{id}
Delete a prospect.

---

### 3. Violation & Scan Management

#### GET /api/prospects/{prospectId}/violations
Get all WCAG violations for a prospect.

**Response**:
```json
[
  {
    "id": "uuid",
    "type": "critical",
    "code": "wcag-2.1-level-aa",
    "description": "Contrast ratio insufficient",
    "impact": "critical",
    "element": "<button>",
    "fix": "Increase contrast to 4.5:1"
  }
]
```

#### POST /api/violations
Create a violation record.

---

### 4. Scan Operations

#### POST /api/scan/quick-win
Run a quick WCAG scan for lead generation (rate-limited to 5 per hour).

**Request Body**:
```json
{
  "url": "https://example.com",
  "prospectId": "uuid" (optional)
}
```

**Response**:
```json
{
  "scanId": "uuid",
  "url": "https://example.com",
  "status": "completed",
  "wcagScore": 78,
  "riskLevel": "high",
  "violationCount": 23,
  "criticalCount": 5,
  "reportUrl": "/api/scan/{scanId}/report"
}
```

#### GET /api/scan/{id}
Get scan status and details.

**Response**: Complete scan object with violation summary

#### GET /api/scan/{id}/results
Get detailed scan results with violations.

#### GET /api/scan/{id}/report
Get generated PDF report (auto-generates if needed).

**Query Parameters**:
- `token` (optional): Access token for secure sharing
- `format` (optional): `pdf` (default) or `json`

#### POST /api/scan/{id}/regenerate
Regenerate PDF report or mockups.

---

### 5. Mockups & Visual Demonstrations

#### GET /api/scan/{id}/mockup/html
Get before/after HTML with accessibility fixes applied.

#### GET /api/scan/{id}/mockup/download
Download ZIP with before/after composites and HTML.

**Response**: ZIP file containing:
- `before.png` - Original screenshot
- `after.png` - Fixed version screenshot
- `comparison.png` - Side-by-side composite
- `fixed.html` - Accessible version

#### GET /mockups/{id}
View mockup gallery for a scan.

---

### 6. Keyword Discovery

#### POST /api/discovery/keywords
Discover prospects by keywords (batch supported).

**Request Body**:
```json
{
  "keywords": ["fintech", "payments", "accessibility"],
  "limit": 15
}
```

**Response**:
```json
{
  "keywords": ["fintech"],
  "prospects": [
    {
      "name": "Stripe",
      "domain": "stripe.com",
      "icpScore": 95,
      "industry": "fintech"
    }
  ],
  "cacheHit": false,
  "apiCallsSaved": 0
}
```

#### POST /api/discovery/queue-for-scanning
Queue discovered prospects for automated scanning.

**Request Body**:
```json
{
  "prospectIds": ["uuid1", "uuid2"]
}
```

---

### 7. Agentic Automation Tasks

These endpoints are designed for agent orchestration and workflow automation.

#### POST /api/tasks/discover-prospects
Task: Discover prospects by keywords.

**Request Body**:
```json
{
  "keywords": ["fintech"],
  "limit": 15
}
```

#### POST /api/tasks/queue-prospects
Task: Queue prospects for scanning with priority.

**Request Body**:
```json
{
  "prospectIds": ["uuid1", "uuid2"],
  "priority": "high"
}
```

#### POST /api/tasks/run-audit/{prospectId}
Task: Run WCAG audit on prospect website.

**Response**: Scan job with status and progress

#### POST /api/tasks/quick-audit
Task: Quick audit without prospect record.

#### POST /api/tasks/generate-outputs/{scanJobId}
Task: Generate PDF report and mockups.

**Request Body**:
```json
{
  "includeFixedVersion": true,
  "includeComposites": true
}
```

#### POST /api/tasks/send-outreach/{prospectId}
Task: Send audit report via email with compliance checks.

**Request Body**:
```json
{
  "email": "contact@company.com",
  "subject": "Your Accessibility Audit Report",
  "customMessage": "Optional message"
}
```

**Compliance Features**:
- ✅ Do-not-contact list check
- ✅ 1-email-per-week enforcement
- ✅ Unsubscribe tracking
- ✅ Ethical override for breach situations

#### POST /api/tasks/schedule-reaudit/{prospectId}
Schedule follow-up audit (e.g., 90 days post-remediation).

#### PATCH /api/tasks/recalculate-icp/{prospectId}
Recalculate ICP (Ideal Client Profile) score based on latest data.

---

### 8. Meta-Prompts (AI Analysis)

Meta-prompts provide AI-powered analysis and recommendations.

#### POST /api/meta-prompts/prospect-analysis
Analyze prospect profile and generate outreach strategy.

#### POST /api/meta-prompts/outreach
Generate 10+ variant email subject lines with compliance hooks.

**Response**:
```json
{
  "variants": [
    {
      "subject": "CFPB & ADA Risk in Your Payment Flow",
      "category": "compliance",
      "riskLevel": "high",
      "personalization": "{companyName}"
    }
  ]
}
```

#### POST /api/meta-prompts/violation-analysis
Generate fix recommendations for specific violations.

#### GET /api/meta-prompts/agent-instructions/{agentType}
Get system prompts for agent (planner, executor, outreach, monitor).

---

### 9. Email & Outreach

#### POST /api/email/generate-draft/{scanJobId}
Generate email draft with scan findings.

#### POST /api/email/with-pdf/{scanJobId}
Generate email with attached PDF report.

#### GET /api/email/template/scan-complete/{scanJobId}
Get HTML email template for scan completion.

#### GET /unsubscribe/{prospectId}
Unsubscribe link for compliance.

---

### 10. Ethical Compliance

#### GET /api/ethical/metrics
Get compliance dashboard metrics.

**Response**:
```json
{
  "totalProspectsReached": 150,
  "dncListSize": 23,
  "emailsThisWeek": 12,
  "averageEmailsPerProspect": 0.8,
  "complianceScore": 98,
  "unsubscribeRate": 2.1
}
```

#### GET /api/ethical/do-not-contact
Get do-not-contact list.

#### POST /api/ethical/do-not-contact
Add prospect to DNC list.

**Request Body**:
```json
{
  "prospectId": "uuid",
  "reason": "unsubscribed|complained|invalid"
}
```

---

### 11. Client Management

#### GET /api/clients
List all clients.

#### POST /api/clients
Create new client (for white-label reports).

#### PATCH /api/clients/{id}
Update client branding.

---

### 12. Monitoring & Analytics

#### GET /api/dashboard/metrics
Get real-time dashboard metrics.

**Response**:
```json
{
  "prospectsCounts": { "total": 150, "pending": 30, "completed": 95 },
  "scansThisWeek": 45,
  "avgScanTime": 22,
  "avgRiskScore": 48,
  "complianceScore": 98,
  "topViolations": [
    { "code": "image-alt", "count": 45 }
  ]
}
```

#### GET /api/agents/status
Get real-time agent status.

**Response**:
```json
{
  "planner": { "status": "active", "tasksProcessed": 50, "uptime": "2h 30m" },
  "executor": { "status": "active", "jobsRunning": 3, "jobsCompleted": 48 },
  "outreach": { "status": "active", "emailsSent": 45, "bounces": 2 },
  "monitor": { "status": "active", "healthChecks": "passing", "alerts": 0 }
}
```

#### GET /api/backends/stats
Get browser backend statistics.

#### POST /api/agents/planner/run
Manually trigger planner agent.

#### POST /api/agents/executor/run
Manually trigger executor agent.

---

### 13. Data Optimization

#### GET /api/monitor/data-usage
Full efficiency dashboard with API savings.

**Response**:
```json
{
  "metrics": {
    "cacheHitRate": 68,
    "apiCallsSaved": 150,
    "costReduction": "95%",
    "memory": "98MB"
  }
}
```

#### GET /api/monitor/stats
Quick stats (cache hits, API calls, memory).

#### POST /api/monitor/health-check
Single URL health check (cached 6 hours).

#### POST /api/monitor/health-batch
Batch health check for 10+ URLs.

#### POST /api/monitor/suggestions
Generate improvement suggestions from violations.

#### POST /api/monitor/reset
Reset daily metrics (admin only).

---

## Error Handling

All errors follow this format:

```json
{
  "error": "Error message",
  "code": "error_code",
  "details": { "field": "error details" }
}
```

### Common Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request |
| 404 | Not Found |
| 429 | Rate Limited |
| 500 | Server Error |
| 503 | Service Unavailable |

---

## Rate Limiting

- **Quick-win scans**: 5 per hour per IP
- **Agent triggers**: 10 per hour
- **Discovery**: 20 per hour
- **Email send**: 100 per day per prospect

---

## Webhook Support (Future)

Planned webhook events:
- `scan.completed`
- `violation.critical`
- `prospect.added`
- `email.bounced`
- `agent.error`

---

## Code Examples

### JavaScript/TypeScript

```typescript
// Discover prospects
const response = await fetch('/api/discovery/keywords', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    keywords: ['fintech', 'payments'],
    limit: 15
  })
});

const { prospects } = await response.json();

// Run audit
const scanResponse = await fetch('/api/tasks/run-audit/prospect-id', {
  method: 'POST'
});

const { scanId } = await scanResponse.json();

// Get report
const reportUrl = `/api/scan/${scanId}/report`;
```

### cURL

```bash
# Discover prospects
curl -X POST http://localhost:5000/api/discovery/keywords \
  -H "Content-Type: application/json" \
  -d '{
    "keywords": ["fintech"],
    "limit": 15
  }'

# Run quick audit
curl -X POST http://localhost:5000/api/scan/quick-win \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

---

## Integration Guide

### Integrating with External Systems

1. **HubSpot CRM**: Use prospect endpoints to sync data
2. **Slack**: Post scan results to channels
3. **Salesforce**: Sync audit reports to deals
4. **Custom Tools**: Use task endpoints for workflow automation

---

## Changelog

### v1.0.0 (Current)
- 58 endpoints
- Agentic automation support
- Masonic ethical compliance
- Real-time agent status
- Data optimization & caching
- Meta-prompt powered AI analysis

---

## Support

For issues or questions:
- Check logs: `logs/app.log`
- Run health check: `GET /api/health`
- View agent status: `GET /api/agents/status`
- Contact: Support or open GitHub issue

---

**Last Updated**: November 24, 2025
