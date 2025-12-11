# Cyber Audit Integration Guide

This guide shows how to integrate the cyber audit system with the existing InfinitySoul platform.

## Quick Start

### 1. Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 2. Test the Audit Script

```bash
# Test basic scan
python3 automation/cyber_audit.py --domain example.com

# Test JSON output
python3 automation/cyber_audit.py --domain example.com --json
```

### 3. Start the Backend Server

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

### 4. Test the API

```bash
# Run a cyber audit
curl -X POST http://localhost:8000/api/cyber-audit \
  -H "Content-Type: application/json" \
  -d '{"domain": "example.com", "businessName": "Example Corp"}'

# Get audit results
curl http://localhost:8000/api/cyber-audit/:auditId

# Get formatted report
curl http://localhost:8000/api/cyber-audit/report/:auditId

# Generate follow-up email
curl -X POST http://localhost:8000/api/cyber-audit/:auditId/follow-up \
  -H "Content-Type: application/json" \
  -d '{"businessName": "Example Corp", "contactName": "John Doe"}'
```

## API Endpoints

### POST /api/cyber-audit

Run a new cyber security audit.

**Request Body:**
```json
{
  "domain": "example.com",
  "email": "owner@example.com",
  "businessName": "Example Corp",
  "industry": "ecommerce"
}
```

**Response:**
```json
{
  "success": true,
  "auditId": "550e8400-e29b-41d4-a716-446655440000",
  "result": {
    "domain": "example.com",
    "timestamp": "2024-12-10T21:00:00Z",
    "score": 75,
    "risk_level": "MEDIUM",
    "issues": [...],
    "recommendations": [...],
    "insurance_recommendation": "..."
  },
  "reportUrl": "/api/cyber-audit/report/550e8400-..."
}
```

### GET /api/cyber-audit/:auditId

Retrieve audit results by ID.

**Response:**
```json
{
  "success": true,
  "result": {
    "domain": "example.com",
    "score": 75,
    "risk_level": "MEDIUM",
    ...
  }
}
```

### GET /api/cyber-audit/report/:auditId

Get formatted text report for email.

**Response:** Plain text report

### POST /api/cyber-audit/:auditId/follow-up

Generate sales follow-up email content.

**Request Body:**
```json
{
  "businessName": "Example Corp",
  "contactName": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "email": "Subject: Your cyber security scan results...\n\n..."
}
```

## Integration with Existing Systems

### 1. Evidence Vault Integration

Store audit results in the evidence vault:

```typescript
import { runCyberAudit } from './backend/services/cyberAudit';
import { storeEvidence } from './backend/services/evidence';

async function auditAndStore(domain: string) {
  const audit = await runCyberAudit({ domain });
  
  if (audit.status === 'success') {
    await storeEvidence({
      type: 'cyber-audit',
      domain,
      data: audit.result,
      timestamp: new Date()
    });
  }
  
  return audit;
}
```

### 2. Automation Integration

Schedule recurring audits:

```typescript
import { runCyberAudit } from './backend/services/cyberAudit';
import { enqueueScan } from './backend/services/queue';

async function scheduleRecurringAudit(domain: string, frequency: string) {
  // Add to job queue
  await enqueueScan({
    type: 'cyber-audit',
    domain,
    frequency, // 'daily', 'weekly', 'monthly'
    callback: async () => {
      const result = await runCyberAudit({ domain });
      // Email results, trigger alerts, etc.
    }
  });
}
```

### 3. Consultant Site Integration

Add cyber audit to consultant offerings:

```typescript
// In consultant route
app.post('/api/consultant/:id/cyber-audit', async (req, res) => {
  const { id } = req.params;
  const { clientDomain } = req.body;
  
  const audit = await runCyberAudit({ domain: clientDomain });
  
  // Store in consultant's client records
  // Generate report for client
  // Track for billing
  
  res.json(audit);
});
```

### 4. Frontend Dashboard Integration

Example React component:

```typescript
import React, { useState } from 'react';

function CyberAuditForm() {
  const [domain, setDomain] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const runAudit = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/cyber-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain })
      });
      
      const data = await response.json();
      setResult(data.result);
    } catch (error) {
      console.error('Audit failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Cyber Security Audit</h2>
      <input
        type="text"
        placeholder="Enter domain (e.g., example.com)"
        value={domain}
        onChange={(e) => setDomain(e.target.value)}
      />
      <button onClick={runAudit} disabled={loading}>
        {loading ? 'Running audit...' : 'Run Audit'}
      </button>
      
      {result && (
        <div>
          <h3>Results for {result.domain}</h3>
          <p>Score: {result.score}/100</p>
          <p>Risk Level: {result.risk_level}</p>
          
          {result.issues.length > 0 && (
            <div>
              <h4>Issues Found:</h4>
              <ul>
                {result.issues.map((issue, idx) => (
                  <li key={idx}>
                    [{issue.severity}] {issue.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div>
            <h4>Recommendations:</h4>
            <ul>
              {result.recommendations.map((rec, idx) => (
                <li key={idx}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default CyberAuditForm;
```

## Database Integration (Optional)

To track audit history, add to Prisma schema:

```prisma
model CyberAudit {
  id                String   @id @default(uuid())
  domain            String
  businessName      String?
  contactEmail      String?
  score             Int
  riskLevel         String
  issues            Json
  recommendations   Json
  checks            Json
  insuranceEligible Boolean
  estimatedPremium  Float?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  @@index([domain])
  @@index([createdAt])
  @@index([riskLevel])
}

model CyberAuditLead {
  id            String      @id @default(uuid())
  businessName  String
  contactName   String
  contactEmail  String
  contactPhone  String?
  domain        String
  auditId       String
  status        String      // 'new', 'contacted', 'quoted', 'closed', 'lost'
  notes         String?
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  
  audit         CyberAudit  @relation(fields: [auditId], references: [id])
  
  @@index([status])
  @@index([createdAt])
}
```

Then use in service:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function runAndStoreCyberAudit(request: CyberAuditRequest) {
  const audit = await runCyberAudit(request);
  
  if (audit.status === 'success' && audit.result) {
    // Store in database
    await prisma.cyberAudit.create({
      data: {
        id: audit.auditId,
        domain: audit.result.domain,
        businessName: request.businessName,
        contactEmail: request.email,
        score: audit.result.score,
        riskLevel: audit.result.risk_level,
        issues: audit.result.issues,
        recommendations: audit.result.recommendations,
        checks: audit.result.checks,
        insuranceEligible: audit.result.risk_level !== 'CRITICAL',
        estimatedPremium: estimateInsurancePremium(audit.result)
      }
    });
  }
  
  return audit;
}
```

## Email Integration

Send audit reports via email:

```typescript
import { formatAuditForEmail } from './backend/services/cyberAudit';
// Assuming you have an email service

export async function sendAuditReport(auditId: string, recipientEmail: string) {
  const result = await getAuditResult(auditId);
  
  if (!result) {
    throw new Error('Audit not found');
  }
  
  const emailBody = formatAuditForEmail(result);
  
  await sendEmail({
    to: recipientEmail,
    subject: `Cyber Security Audit Results for ${result.domain}`,
    body: emailBody,
    from: 'audits@infinitysoul.com'
  });
}
```

## Sales Workflow Integration

Complete workflow from scan to close:

```typescript
export async function cyberAuditSalesWorkflow(lead: {
  businessName: string;
  contactName: string;
  contactEmail: string;
  domain: string;
}) {
  // 1. Run initial audit
  const audit = await runCyberAudit({
    domain: lead.domain,
    email: lead.contactEmail,
    businessName: lead.businessName
  });
  
  // 2. Send results email
  if (audit.status === 'success' && audit.result) {
    const followUpEmail = generateFollowUpEmail(
      audit.result,
      lead.businessName,
      lead.contactName
    );
    
    await sendEmail({
      to: lead.contactEmail,
      subject: `Your cyber security scan results - ${lead.businessName}`,
      body: followUpEmail
    });
  }
  
  // 3. Create lead in CRM
  await prisma.cyberAuditLead.create({
    data: {
      businessName: lead.businessName,
      contactName: lead.contactName,
      contactEmail: lead.contactEmail,
      domain: lead.domain,
      auditId: audit.auditId,
      status: 'contacted'
    }
  });
  
  // 4. Schedule follow-up
  await scheduleFollowUp(lead.contactEmail, 7); // Follow up in 7 days
  
  return audit;
}
```

## Monitoring & Analytics

Track key metrics:

```typescript
export async function getAuditAnalytics(startDate: Date, endDate: Date) {
  const audits = await prisma.cyberAudit.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    }
  });
  
  return {
    totalAudits: audits.length,
    averageScore: audits.reduce((sum, a) => sum + a.score, 0) / audits.length,
    riskDistribution: {
      LOW: audits.filter(a => a.riskLevel === 'LOW').length,
      MEDIUM: audits.filter(a => a.riskLevel === 'MEDIUM').length,
      HIGH: audits.filter(a => a.riskLevel === 'HIGH').length,
      CRITICAL: audits.filter(a => a.riskLevel === 'CRITICAL').length
    },
    commonIssues: getMostCommonIssues(audits),
    conversionRate: calculateConversionRate(audits)
  };
}
```

## Production Deployment

### Environment Variables

Add to `.env`:

```bash
# Cyber Audit Configuration
CYBER_AUDIT_ENABLED=true
CYBER_AUDIT_TIMEOUT_MS=60000
CYBER_AUDIT_MAX_CONCURRENT=5

# Email settings for sending reports
AUDIT_EMAIL_FROM=audits@infinitysoul.com

# Insurance carrier integration
INSURANCE_API_KEY=your_key_here
INSURANCE_WEBHOOK_URL=https://carrier.com/webhook
```

### Railway Deployment

The cyber audit system works on Railway with the existing deployment:

1. Python 3 is available by default
2. Install requirements: `pip install -r requirements.txt`
3. Backend API routes automatically included
4. Audit results stored in `audit-results/` directory (add to .gitignore)

### Monitoring

Add health check for cyber audit:

```bash
curl http://localhost:8000/api/cyber-audit/health
```

Response:
```json
{
  "success": true,
  "service": "cyber-audit",
  "status": "operational",
  "timestamp": "2024-12-10T21:00:00Z"
}
```

## Security Considerations

### Input Validation

The service includes:
- Domain sanitization to prevent command injection
- UUID validation for audit IDs
- Timeout limits on scans
- Rate limiting (should be added to API)

### Data Privacy

- Audit results stored locally, not in public repos
- No sensitive business data collected without consent
- GDPR-compliant data handling
- Option to delete audit data after time period

### Disclaimers

Always include:
```
This is a technical security assessment only and does not constitute 
legal advice. Consult with a qualified attorney for legal guidance. 
Insurance eligibility is subject to carrier approval and additional 
underwriting requirements may apply.
```

## Support & Troubleshooting

### Common Issues

**Python not found:**
```bash
# Check Python version
python3 --version

# Install if needed (Ubuntu/Debian)
sudo apt-get install python3 python3-pip
```

**DNS resolution failures:**
- Ensure network connectivity
- Check if domain is valid
- Verify DNS servers are accessible

**Timeout errors:**
- Increase timeout in service config
- Check if target domain is online
- Verify firewall rules

### Logs

Enable debug logging:
```typescript
process.env.DEBUG = 'cyber-audit:*';
```

### Testing

Run test suite:
```bash
# Test Python script
python3 -m pytest tests/test_cyber_audit.py

# Test API endpoints
npm test -- backend/routes/cyberAudit.test.ts
```

## Next Steps

1. **Add PDF report generation** - Use reportlab or similar
2. **Build frontend UI** - React dashboard for running audits
3. **Implement database persistence** - Add Prisma models
4. **Create monitoring dashboard** - Track audits, conversions, revenue
5. **Integrate insurance carriers** - API connections for quotes
6. **Add more security checks** - Expand vulnerability detection
7. **Implement continuous monitoring** - Scheduled recurring audits
8. **Build mobile app** - On-the-go audit capabilities

## Resources

- Technical documentation: `CYBER_AUDIT_README.md`
- Sales playbooks: `SALES_SCRIPT.md`
- Main repository: `README.md`
- Python script: `automation/cyber_audit.py`
- Backend service: `backend/services/cyberAudit.ts`
- API routes: `backend/routes/cyberAudit.ts`

---

**Questions?** Check the documentation or reach out to the InfinitySoul team.
