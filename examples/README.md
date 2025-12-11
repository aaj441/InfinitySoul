# InfinitySoul Examples

This directory contains example code demonstrating how to use InfinitySoul's various features.

## Cyber Audit Examples

### cyber-audit-example.ts

Demonstrates how to use the cyber audit system:
- Running a basic audit
- Generating sales follow-up emails
- Batch processing multiple domains
- Risk-based workflow decisions
- Analytics from audit results

**Run it:**
```bash
npx ts-node examples/cyber-audit-example.ts
```

## CLI Examples

### Quick Test of Cyber Audit Script

```bash
# Test on a domain
python3 automation/cyber_audit.py --domain example.com

# Get JSON output
python3 automation/cyber_audit.py --domain example.com --json

# Save to file
python3 automation/cyber_audit.py --domain example.com --json --output results.json
```

### API Examples with curl

```bash
# Run an audit
curl -X POST http://localhost:8000/api/cyber-audit \
  -H "Content-Type: application/json" \
  -d '{"domain": "example.com"}'

# Get results
curl http://localhost:8000/api/cyber-audit/{audit-id}

# Get text report
curl http://localhost:8000/api/cyber-audit/report/{audit-id}

# Generate follow-up email
curl -X POST http://localhost:8000/api/cyber-audit/{audit-id}/follow-up \
  -H "Content-Type: application/json" \
  -d '{"businessName": "Example Corp", "contactName": "John Doe"}'
```

## Integration Examples

### Example 1: Simple Integration in Node.js

```javascript
const { runCyberAudit } = require('./backend/services/cyberAudit');

async function quickAudit(domain) {
  const result = await runCyberAudit({ domain });
  console.log(`Score: ${result.result.score}/100`);
  console.log(`Risk: ${result.result.risk_level}`);
  return result;
}

quickAudit('example.com');
```

### Example 2: Sales Workflow

```javascript
const { runCyberAudit, generateFollowUpEmail } = require('./backend/services/cyberAudit');

async function processLead(lead) {
  // Run audit
  const audit = await runCyberAudit({
    domain: lead.domain,
    email: lead.email,
    businessName: lead.businessName
  });
  
  // Generate follow-up
  if (audit.status === 'success') {
    const email = generateFollowUpEmail(
      audit.result,
      lead.businessName,
      lead.contactName
    );
    
    // Send email (your email service here)
    await sendEmail(lead.email, email);
    
    // Log to CRM
    await logToCRM(lead, audit);
  }
  
  return audit;
}
```

### Example 3: Scheduled Monitoring

```javascript
const cron = require('node-cron');
const { runCyberAudit } = require('./backend/services/cyberAudit');

// Run audit every Monday at 9 AM
cron.schedule('0 9 * * 1', async () => {
  const clients = await getActiveClients();
  
  for (const client of clients) {
    const audit = await runCyberAudit({
      domain: client.domain,
      email: client.email
    });
    
    // Alert if risk increased
    if (audit.result.score < client.lastScore - 10) {
      await sendAlert(client, audit);
    }
  }
});
```

## Testing Examples

### Unit Test Example

```javascript
describe('Cyber Audit Service', () => {
  it('should return valid audit results', async () => {
    const result = await runCyberAudit({ domain: 'example.com' });
    
    expect(result.status).toBe('success');
    expect(result.result.score).toBeGreaterThanOrEqual(0);
    expect(result.result.score).toBeLessThanOrEqual(100);
    expect(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).toContain(result.result.risk_level);
  });
});
```

### Integration Test Example

```javascript
describe('Cyber Audit API', () => {
  it('should run audit via API', async () => {
    const response = await fetch('http://localhost:8000/api/cyber-audit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domain: 'example.com' })
    });
    
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.auditId).toBeDefined();
  });
});
```

## More Examples

For more detailed examples, see:
- `CYBER_AUDIT_README.md` - Technical documentation
- `CYBER_AUDIT_INTEGRATION.md` - Integration guide
- `SALES_SCRIPT.md` - Sales workflow examples
- Backend services in `backend/services/`
- API routes in `backend/routes/`

## Contributing Examples

Have a useful example? Add it to this directory:

1. Create a new file with descriptive name
2. Add clear comments explaining the code
3. Update this README with a brief description
4. Include any required setup or dependencies

---

**Need help?** Check the main documentation or open an issue.
