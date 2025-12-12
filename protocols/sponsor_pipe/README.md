# Sponsor Pipe

**MCP Marketplace: Security tools as insurance distribution**

---

## Overview

The **Sponsor Pipe** turns security tools (CrowdStrike, SentinelOne, etc.) into **insurance distribution channels**. 

When a security tool detects good security posture, it offers insurance. When it detects poor posture, it offers remediation + insurance.

---

## How It Works

### 1. Integration (MCP Protocol)
```typescript
// Security tool exposes MCP endpoint
app.post('/mcp/scan-complete', async (req, res) => {
  const scan_results = req.body;
  
  // Call RAWKUS Sponsor Pipe
  const insurance_offer = await rawkus.sponsor_pipe.generate_offer({
    security_posture: scan_results,
    company_id: req.body.company_id
  });
  
  // Display insurance offer in tool UI
  return res.json({ offer: insurance_offer });
});
```

### 2. Offer Generation
```python
# RAWKUS generates personalized offer
offer = {
  "coverage": "$1M cyber liability",
  "premium": "$12K/year",
  "rationale": "Strong security posture (MFA ✓, EDR ✓, backups ✓)",
  "discount": "20% for passing scan",
  "cta": "Get quote in 30 seconds"
}
```

### 3. Revenue Share
```yaml
revenue_split:
  security_tool: 20%   # Sponsor gets 20% of first-year premium
  rawkus: 30%          # RAWKUS gets 30%
  mga: 50%             # MGA gets 50%
```

---

## Participating Tools

### Current Integrations
- CrowdStrike (EDR)
- SentinelOne (EDR)
- 1Password (password management)
- Vanta (compliance automation)

### Future Integrations
- Wiz (cloud security)
- Snyk (code security)
- GitHub Advanced Security
- Datadog (observability)

---

## Benefits

### For Security Tools
- New revenue stream (20% of premium)
- Deeper customer engagement
- Differentiation (only tool offering insurance)

### For RAWKUS
- Distribution channel (millions of scans/year)
- Risk data (security posture signals)
- Network effects (more tools = more data)

### For Policyholders
- Instant quotes (30 seconds)
- Risk-based pricing (good posture = lower premium)
- Integrated workflow (no separate application)

---

## API Reference

```python
from rawkus.protocols import SponsorPipe

# Initialize
pipe = SponsorPipe(api_key="your_key")

# Generate offer
offer = pipe.generate_offer(
    security_posture={
        "mfa_enabled": True,
        "edr_deployed": True,
        "backup_frequency": "daily",
        "patch_cadence": "weekly"
    },
    company_metadata={
        "revenue": 5000000,
        "employee_count": 50,
        "industry": "saas"
    }
)

# Track conversion
pipe.track_conversion(
    offer_id=offer.id,
    status="accepted"
)
```

---

## The Flywheel

1. Security tool scans company
2. RAWKUS generates insurance offer
3. Company buys insurance
4. Security tool earns 20% commission
5. Security tool promotes RAWKUS integration
6. More tools integrate
7. More data flows to IS Fiber
8. Better risk models
9. Better pricing
10. More conversions

**The moat compounds.**

---

**"Security tools become distribution. Distribution becomes data. Data becomes the moat."**
