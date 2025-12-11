# Infinity Soul Cyber Audit

**One-click cyber risk audit for small businesses.**

## What it does

Scans a business domain for:
- **Open RDP ports** (huge ransomware risk)
- **Missing DMARC/SPF records** (phishing risk)
- **Outdated SSL certificates** (breach risk)
- **Exposed database ports** (data breach risk)
- **Other vulnerable services** (FTP, Telnet, SMB, etc.)

## Why it matters

Small businesses can't afford $10K pentests. This gives them a risk score in 60 seconds for $500.

## Installation

### 1. Install Python Dependencies

```bash
pip install -r requirements.txt
```

Required packages:
- `dnspython` - For DNS/email security checks

### 2. Verify Installation

```bash
python3 automation/cyber_audit.py --domain google.com
```

## How to use

### Basic Usage

```bash
python3 automation/cyber_audit.py --domain example.com
```

### JSON Output

```bash
python3 automation/cyber_audit.py --domain example.com --json
```

### Save Results to File

```bash
python3 automation/cyber_audit.py --domain example.com --json --output results.json
```

## Output

The audit provides:
- **Risk score** (0-100)
- **Risk level** (LOW, MEDIUM, HIGH, CRITICAL)
- **Detailed findings** with severity ratings
- **Actionable recommendations**
- **Insurance eligibility assessment**

### Example Output

```
======================================================================
🏢 CYBER SECURITY AUDIT REPORT
======================================================================

Domain: example.com
Timestamp: 2024-12-10T21:00:00Z

📊 Risk Score: 75/100
🚦 Risk Level: MEDIUM

🔍 Issues Found (2):
   ⚠️ [HIGH] No SPF record found (phishing risk)
   ⚠️ [HIGH] No DMARC record found (spoofing risk)

💡 Recommendations (2):
   1. Add SPF record to DNS to prevent email spoofing
   2. Add DMARC record to DNS to protect against email spoofing

🛡️  Insurance Recommendation:
   Recommend security improvements before applying for cyber insurance

======================================================================
```

## Integration with InfinitySoul Backend

The audit script can be called from Node.js/TypeScript:

```typescript
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function runCyberAudit(domain: string) {
  const { stdout } = await execAsync(
    `python3 automation/cyber_audit.py --domain ${domain} --json`
  );
  return JSON.parse(stdout);
}
```

## Sales Script Template

### Cold Email Template

**Subject:** Free cyber risk scan for [Business Name]

```
Hi [Owner Name],

I'm a licensed insurance professional who's built a tool that scans businesses 
for cyber vulnerabilities in 60 seconds.

The scan checks for:
- Exposed RDP ports (ransomware risk)
- Email security (phishing risk)
- SSL certificates (breach risk)
- Database exposures (data breach risk)

**I'm offering free scans this week to 5 businesses in [city].** No catch. 
If I find issues, I'll help you fix them. If you want, I can also get you 
a cyber insurance quote.

Are you free for a 10-minute call this week?

Best,
[Your Name]
Owner, Infinity Soul LLC
[Your phone]
```

### Follow-Up After Scan

**Subject:** Your cyber security scan results - [Business Name]

```
Hi [Owner Name],

I ran the cyber security scan on [domain]. Here's what I found:

📊 Risk Score: [score]/100
🚦 Risk Level: [level]

Key Issues:
[List top 3 issues]

Good News:
- These are all fixable
- I can help you implement the fixes
- Once fixed, you'll qualify for better insurance rates

Next Steps:
1. 15-minute call to review findings
2. I'll connect you with vendors to fix issues (or help DIY)
3. Get you a cyber insurance quote

When works for you this week?

Best,
[Your Name]
```

## Business Model

### Pricing Structure

1. **Free Scan** (Lead Generation)
   - Run audit for free
   - Build trust and demonstrate value
   - Identify issues to create urgency

2. **Remediation Services** ($500-2,000)
   - Help implement fixes
   - Configure DNS records
   - Set up proper security
   - Document compliance

3. **Insurance Referral** ($500-1,500 commission)
   - Refer qualified businesses to carriers
   - Earn commission on policies sold
   - Recurring revenue on renewals

4. **Ongoing Monitoring** ($100-300/month)
   - Monthly security scans
   - Alert on new vulnerabilities
   - Continuous compliance reporting

### Target Market

**Ideal Customers:**
- Small businesses (5-50 employees)
- E-commerce stores
- Local service businesses
- Healthcare practices
- Financial advisors
- Law firms

**Where to Find Them:**
- Local business networking groups
- Chamber of Commerce
- Industry associations
- LinkedIn local business groups
- Hackerspaces and tech communities

## Hackerspace Go-To-Market Strategy

### Week 1: Build & Validate

1. **Monday:** Run audit on 10 members' domains
2. **Tuesday:** Present findings at meetup: "8 of you have exposed RDP"
3. **Wednesday:** 3 members ask for full audits
4. **Thursday:** Charge them $500 each (pre-launch discount)
5. **Friday:** $1,500 revenue + 3 case studies

### Week 2: Refine & Position

1. **Monday:** Ask cyber expert members for additional checks
2. **Tuesday:** Add 5 more security checks
3. **Wednesday:** Pitch: "I can get you cyber insurance if you pass"
4. **Thursday:** 2 members say yes → insurance referrals
5. **Friday:** $1,000 commission + $500 audit = $1,500

### Week 3: Scale Within Space

1. **Monday:** Email all members: "Free cyber audit (first 10)"
2. **Tuesday:** 10 sign-ups, run audits
3. **Wednesday:** 7 have critical issues → $500 fixes each
4. **Thursday:** 3 want insurance = $1,500 commission
5. **Friday:** $5,000 revenue

### Week 4: Expand Beyond

1. **Monday:** Use case studies for local business outreach
2. **Tuesday:** "Hackerspace-approved cyber audit" = credibility
3. **Wednesday:** 5 local businesses @ $500 each
4. **Thursday:** 2 get insurance = $1,000 commission
5. **Friday:** $3,500 revenue

**Total Month 1:** $11,500 revenue. Zero ad spend.

## Legal & Compliance

### What This Tool Does

✅ **Technical security assessment** (allowed)
✅ **Risk scoring based on public information** (allowed)
✅ **Recommendations for remediation** (allowed)
✅ **Insurance eligibility assessment** (allowed)

### What This Tool Does NOT Do

❌ **Provide legal advice** (would require law license)
❌ **Guarantee insurance approval** (carrier decision)
❌ **Conduct penetration testing** (requires authorization)
❌ **Access private/internal systems** (illegal without permission)

### Disclaimers

All scan reports should include:

```
This is a technical security assessment only and does not constitute 
legal advice. Consult with a qualified attorney for legal guidance. 
Insurance eligibility is subject to carrier approval and additional 
underwriting requirements may apply.
```

## Technical Details

### What Gets Scanned

1. **RDP (Port 3389)**
   - Checks if Remote Desktop is publicly exposed
   - Major ransomware attack vector

2. **Email Security**
   - SPF record presence
   - DMARC record presence
   - Protects against phishing and spoofing

3. **SSL Certificate**
   - Validity status
   - Expiration date
   - Configuration errors

4. **Database Ports**
   - MySQL (3306)
   - PostgreSQL (5432)
   - MongoDB (27017)
   - Redis (6379)

5. **Other Vulnerable Services**
   - FTP (21)
   - Telnet (23)
   - SSH (22)
   - SMB (445)

### Risk Scoring Algorithm

Starting score: 100

Deductions:
- RDP exposed: -40 points (CRITICAL)
- No SPF: -15 points (HIGH)
- No DMARC: -15 points (HIGH)
- SSL expired: -30 points (CRITICAL)
- SSL expiring (<30 days): -10 points (MEDIUM)
- SSL invalid: -20 points (HIGH)
- Critical port exposed (FTP/Telnet/SMB): -25 points each
- High-risk port exposed (databases): -15 points each

Risk Levels:
- **80-100:** LOW - Standard insurance eligible
- **60-79:** MEDIUM - Improvements recommended
- **40-59:** HIGH - Must fix before insurance
- **0-39:** CRITICAL - Significant vulnerabilities

## Future Enhancements

### Planned Features

1. **PDF Report Generation**
   - Professional branded reports
   - Charts and visualizations
   - Executive summary

2. **Advanced Port Scanning**
   - More comprehensive port checks
   - Service version detection
   - Known vulnerability matching

3. **Web Application Testing**
   - Common web vulnerabilities
   - OWASP Top 10 checks
   - CMS-specific tests

4. **Compliance Checks**
   - PCI-DSS requirements
   - HIPAA security rules
   - GDPR technical requirements

5. **Continuous Monitoring**
   - Scheduled periodic scans
   - Email alerts on new issues
   - Trend analysis

6. **API Integration**
   - RESTful API for audits
   - Webhook notifications
   - Third-party integrations

## Support

For questions or issues:
- GitHub Issues: [repository]/issues
- Email: support@infinitysoul.com
- Documentation: [repository]/docs

## License

See LICENSE file for details.

---

**Built with ❤️ by Infinity Soul**

*Protecting small businesses, one audit at a time.*
