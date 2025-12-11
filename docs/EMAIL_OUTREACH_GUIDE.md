# 📧 Email Outreach System - AIDA Framework

## Overview

Three integrated components create a seamless workflow:
1. **Polished UI** - Keyword-first interface with clear CTAs and progress indicators
2. **Email Generator** - Auto-draft cold emails using 20+ years of sales best practices (AIDA framework)
3. **PDF Auto-Attachment** - Automatically attach PDF report to email when scan completes

**Workflow:** Keywords → Prospects → Scan → Generate Report + Email Draft with PDF attached ✨

---

## 1️⃣ Polished UI - Keyword-First Interface

### What It Shows
- **Step-by-step flow:** Keywords → Discover → Queue → Scan
- **Progress indicators:** Companies found, queued, ready-to-scan %
- **Prospect cards:** ICP score, industry, risk level, action buttons
- **Clear CTAs:** "Discover Prospects" → "Queue All" → "Scan Now" → "Download Report"

### Key Features
- Large, prominent buttons with emojis (⚡, 🔍, ✓)
- Color-coded badges (green=low risk, yellow=medium, red=high)
- Real-time progress bars showing scan status
- One-click queue/scan actions
- Responsive layout for mobile

### Example UI Flow
```
HOMEPAGE
├─ "🔍 Prospect Discovery" (H1)
├─ Progress: "30 Companies Found | 20 Queued | 67% Ready"
│
├─ Step 1: Search Criteria
│  ├─ Keywords: [fintech, payment gateway]
│  ├─ Industry: [Finance]
│  └─ [🚀 Discover Prospects]
│
├─ Step 2: Review Prospects
│  ├─ Prospect Card 1: FinTech Solutions Inc (85 ICP)
│  │  ├─ Industry: Finance | High Risk
│  │  └─ [⚡ Scan Now] [→ Details]
│  │
│  ├─ Prospect Card 2: PaymentGateway Corp (78 ICP)
│  │  ├─ Industry: Finance | Medium Risk
│  │  └─ [⚡ Scan Now] [→ Details]
│  │
│  └─ [⚡ Queue All for Scanning (30)]
│
└─ Scan Results
   ├─ WCAG Score: 65/100
   ├─ Critical Issues: 8
   ├─ [📄 Download Report]
   ├─ [📧 Generate Email + PDF]
   └─ [📧 Send to Prospect]
```

---

## 2️⃣ Email Generator - AIDA Framework

**File:** `server/services/email-generator.ts`

### What It Does
Generates professional cold email outreach using the AIDA framework:
- **A - Attention:** Hook with specific problem + data
- **I - Interest:** Build interest with evidence + social proof
- **D - Desire:** Create urgency + paint picture of fixed state
- **A - Action:** Clear, easy next step (low friction)

### Features
- **Personalization:** Company name, recipient name, sender details
- **Social Proof:** Recent settlements, court rulings, case studies
- **Urgency:** Legal risk levels (high/medium/low)
- **Clear CTA:** 15-min call, specific action
- **Follow-up:** Automatically generated for day 3 if no response

### Example Email (Generated)
```
Subject: [Urgent] FinTech Solutions WCAG Audit: 8 Critical Issues Detected

Hi Jane,

I just completed a WCAG accessibility audit of FinTech Solutions' 
website and found something important.

⚠️ **URGENT:** Your site has 8 critical accessibility violations. 
This creates significant legal exposure—similar cases have resulted 
in $50K-$450K settlements.

**Why This Matters:**
✓ Accessibility isn't optional—it's legally required (ADA, WCAG 2.1)
✓ Recent settlements in similar cases: $50K-$450K (your site has similar exposure)
✓ Better accessibility = better SEO ranking & 20% more traffic (on average)
✓ Fix-to-launch timeline: 2-8 weeks (not months like most think)

**The Good News:**
We've helped companies like yours fix similar issues in 4-6 weeks.
Most improvements show immediate ROI through better search rankings 
and user retention.

**Next Step:**
I'd love to discuss a quick remediation plan—no obligations, just 
insights. Are you free for a brief 15-minute call this week? 
(I'll bring the detailed audit report)

Best regards,
[Your Name]
[Your Title]
```

### Risk Levels & Tone
```
HIGH RISK (8+ critical issues):
└─ ⚠️ URGENT, $50K-$450K settlement mention, legal focus

MEDIUM RISK (1-7 critical issues):
└─ 📊 Professional, improvement opportunity, ROI focus

LOW RISK (0 critical issues):
└─ ✅ Positive, WCAG AA compliance achievement, optimization focus
```

### Usage Example
```bash
curl -X POST http://localhost:5000/api/email/generate-draft/scan-123 \
  -H "Content-Type: application/json" \
  -d '{
    "prospectCompany": "FinTech Solutions Inc",
    "prospectWebsite": "https://fintechsolutions.com",
    "senderName": "Jane Smith",
    "senderTitle": "Accessibility Consultant",
    "recipientName": "John CEO",
    "personalNote": "I noticed you're in the fintech space—this is critical for your compliance"
  }'
```

### Response
```json
{
  "scanJobId": "scan-123",
  "email": {
    "subject": "[Urgent] FinTech Solutions WCAG Audit: 8 Critical Issues Detected",
    "preheader": "65/100 WCAG Score - 8 critical issues detected",
    "body": "Hi John,\n\n[Full email body with AIDA framework]...",
    "callToAction": "Schedule 15-Min Accessibility Audit Review (This Week)",
    "followUpDays": 3
  },
  "summary": "Email Draft for FinTech Solutions Inc...",
}
```

---

## 3️⃣ PDF Auto-Attachment System

**File:** Integrated into `server/routes.ts`

### What It Does
When scan completes, automatically:
1. Generate compact PDF report (<500KB)
2. Draft personalized email
3. Bundle PDF + email together
4. Mark as "ready-to-send"

### Features
- **Automatic:** Triggered on scan completion
- **Pre-filled:** Prospect name, company, website, WCAG score
- **Personalization:** Sender name, title, custom note
- **Ready-to-send:** Copy/paste email, attach PDF, send

### Workflow Endpoints

#### 1. Generate Email Draft Only
```bash
POST /api/email/generate-draft/:scanJobId
{
  "prospectCompany": "FinTech Solutions Inc",
  "prospectWebsite": "https://fintechsolutions.com",
  "senderName": "Jane Smith",
  "senderTitle": "Consultant",
  "recipientName": "John",
  "personalNote": "[Optional]"
}
```

**Response:** Email draft with subject, preheader, body, CTA

---

#### 2. Generate Email + PDF Bundle (Main Endpoint)
```bash
POST /api/email/with-pdf/:scanJobId
{
  "prospectCompany": "FinTech Solutions Inc",
  "prospectWebsite": "https://fintechsolutions.com",
  "senderName": "Jane Smith",
  "senderTitle": "Consultant",
  "recipientName": "John",
  "personalNote": "[Optional]"
}
```

**Response:**
```json
{
  "scanJobId": "scan-123",
  "email": {
    "subject": "[Urgent] FinTech Solutions WCAG Audit...",
    "body": "Hi John,\n\n[Full email]...",
    "callToAction": "Schedule 15-Min Call"
  },
  "pdf": {
    "url": "/attached_assets/reports/report-scan-123-compact.pdf",
    "filename": "audit-report-fintech-solutions-inc.pdf"
  },
  "status": "ready-to-send",
  "template": "cold-email-with-audit-report"
}
```

---

#### 3. Get Email Template (Pre-fill)
```bash
GET /api/email/template/scan-complete/:scanJobId
```

**Response:** Template with pre-filled website URL, ready for user to add prospect details

---

## Complete Workflow Example

### Step 1: User Discovers Prospects
```bash
POST /api/tasks/discover-prospects
{
  "keywords": ["fintech", "payment gateway"],
  "industry": "Finance"
}
→ Returns: 30 prospects with ICP scores
```

### Step 2: User Queues for Scanning
```bash
POST /api/tasks/queue-prospects
{
  "prospectIds": ["prospect-1", "prospect-2", ...]
}
→ Agents pick up and start scanning
```

### Step 3: Scan Completes
```
Executor Agent runs WCAG audit
→ Generates compact PDF
→ Logs scan complete with scanJobId
```

### Step 4: User Generates Email + PDF Bundle
```bash
POST /api/email/with-pdf/scan-123
{
  "prospectCompany": "FinTech Solutions",
  "prospectWebsite": "https://fintechsolutions.com",
  "senderName": "Jane Smith",
  "senderTitle": "Accessibility Consultant",
  "recipientName": "John CEO",
  "personalNote": "I noticed your site has accessibility gaps that could expose you to legal risk"
}

→ Returns:
{
  "email": { subject, body, CTA },
  "pdf": { url, filename },
  "status": "ready-to-send"
}
```

### Step 5: User Copies Email + Downloads PDF
- Copy email from response
- Download PDF from URL
- Paste into Gmail/Outlook
- Attach PDF
- Send

**Total time:** 2-3 minutes per prospect vs. 30 minutes manually

---

## Best Practices

### Email Tips
1. **Personalize:** Always add recipient name and sender title
2. **Be specific:** Reference actual WCAG scores and violations (builds credibility)
3. **Follow up:** Day 3 = second email, Day 7 = phone call
4. **A/B test:** Try different subject lines for high-risk vs. low-risk prospects
5. **Legal proof:** For high-risk: emphasize settlements; For low-risk: emphasize SEO/UX

### PDF Tips
1. **Compact format:** <500KB = faster load, more professional
2. **Include CTA:** "Schedule 15-minute review"
3. **Share link:** `https://platform/results/{uuid}` for public access
4. **Follow-up:** "Are you available Thursday for a quick call?"

### Timing
- **Send:** Tuesday-Thursday, 9 AM - 3 PM (highest open rates)
- **Follow-up:** 3 days later if no response
- **Phone call:** 7 days after first email

---

## Data Efficiency (Free Tier)

- **Email generation:** 2KB per email (no API calls)
- **PDF attachment:** <500KB per report (compact format)
- **Total per prospect:** <502KB (bandwidth)
- **Batch:** Process 100 prospects = ~50MB total

**No additional API calls needed—everything runs locally!**

---

## Seamless Integration Example

```javascript
// Frontend flow
const prospects = await discover(keywords); // 30 companies
await queue(prospects.map(p => p.id));      // Queue all
// Wait 2-4 hours for agents to scan...
await generateEmailBundle(scanJobId, {      // When complete:
  prospectCompany: "FinTech Solutions",     // • Draft email
  senderName: "Jane Smith"                   // • Attach PDF
});                                         // • Mark ready-to-send
// Copy email + download PDF + send
```

---

## API Reference

### Email Endpoints
```
POST   /api/email/generate-draft/:scanJobId        → Email only
POST   /api/email/with-pdf/:scanJobId              → Email + PDF bundle
GET    /api/email/template/scan-complete/:scanJobId → Pre-filled template
```

### Monitoring
All email generation tracked in `/api/monitor/data-usage`

---

## Next Steps

1. ✅ Email Generator - Ready to use
2. ✅ PDF Auto-Attachment - Integrated
3. ✅ UI Components - Prospect cards updated
4. ⬜ Email sending (optional) - Can integrate with SendGrid/Mailgun later
5. ⬜ Email templates (optional) - Add A/B test variations

**The system is 100% ready for manual email send (copy-paste) or automated via email API integration.**

---

**Goal:** Turn WCAG scans into sales conversations with zero friction. ✨
