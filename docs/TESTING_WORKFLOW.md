# WCAG AI Platform - Complete Testing Workflow

## System Status
- ✅ App running on port 5000
- ✅ PostgreSQL database active
- ✅ Keyword discovery working
- ✅ Meta-prompts API functional
- ✅ Agent system ready (disabled by default)

---

## 🎯 WORKFLOW 1: QUICK WIN DEMO (Primary Feature)
**Purpose:** Test the core lead-generation flow
**Time:** 2-3 minutes
**Value:** Demonstrates value proposition to prospects

### Step 1: Open Quick Win Page
```
URL: http://localhost:5000/
Expected: Form with "Website URL" input, company name field
```

### Step 2: Enter Test Prospect
```
Website URL: https://hospital-system.com
Company Name: Regional Medical Center
Contact Email: admin@hospital-system.com
```

### Step 3: Trigger Scan
- Click "Start Quick Win Scan"
- Expected Status Flow:
  - ⏳ "Analyzing website..."
  - 🔍 "Scanning for WCAG violations..."
  - 📊 "Generating report..."
  - ✅ "Report ready!"

### Step 4: Verify Results
- Check scan results show:
  - WCAG Score (0-100)
  - Violations count (accessibility issues found)
  - Legal risk assessment
  - Screenshot with highlighted violations

### Step 5: Download Report (If Scanning Works)
- PDF should include:
  - Company name
  - WCAG compliance score
  - Top 5 violations with severity
  - Before/after screenshots
  - Remediation recommendations

**Expected Outcome:** Consultant can instantly send this report to prospect for discovery call booking

---

## 🎯 WORKFLOW 2: KEYWORD DISCOVERY (Lead Generation)
**Purpose:** Automated prospect discovery by industry
**Time:** 1 minute per industry
**Value:** Find 5-10 high-ICP prospects per search

### Step 1: Navigate to Keyword Discovery
```
URL: http://localhost:5000/discovery
Expected: Search form with keywords, industry, results table
```

### Step 2: Test Finance Sector
```bash
# API Test
curl -X POST http://localhost:5000/api/discovery/keywords \
  -H "Content-Type: application/json" \
  -d '{
    "keywords": ["fintech", "payment gateway", "digital banking"],
    "industry": "Financial Services",
    "limit": 10,
    "useAI": false
  }'
```

**Expected Response:**
```json
{
  "discovered": 5,
  "prospects": [
    {
      "id": "...",
      "company": "FinTech Solutions Inc",
      "website": "https://fintechsolutions.com",
      "icpScore": 85,
      "industry": "Financial Services",
      "legal_risk": "high"
    }
  ]
}
```

### Step 3: Test Healthcare Sector
```bash
curl -X POST http://localhost:5000/api/discovery/keywords \
  -H "Content-Type: application/json" \
  -d '{
    "keywords": ["hospital", "clinic", "telehealth"],
    "industry": "Healthcare",
    "limit": 10,
    "useAI": false
  }'
```

### Step 4: Verify UI Display
- Navigate to http://localhost:5000/discovery
- Enter keywords: "hospital, clinic"
- Click "Discover Prospects"
- Verify results table shows:
  - Company name
  - Website URL
  - ICP Score (65-85)
  - Legal Risk Level (high/medium/low)
  - Action button to trigger scan

**Expected Outcome:** 5-10 prospects per industry, ready for targeted outreach

---

## 🎯 WORKFLOW 3: META-PROMPTS (AI Analysis)
**Purpose:** Generate AI prompts for prospect analysis and outreach
**Time:** 1 minute
**Value:** Personalized sales angles for each prospect

### Step 1: Prospect Analysis Prompt
```bash
curl -X POST http://localhost:5000/api/meta-prompts/prospect-analysis \
  -H "Content-Type: application/json" \
  -d '{
    "company": "FinTech Solutions Inc",
    "website": "https://fintechsolutions.com",
    "industry": "Financial Services",
    "icp": 85,
    "wcagScore": 62,
    "violations": 15
  }'
```

**Expected:** AI prompt asking for:
- Sales readiness score (0-100)
- Legal risk assessment
- Recommended sales angle
- Key messaging points
- Estimated deal size

### Step 2: Outreach Email Prompt
```bash
curl -X POST http://localhost:5000/api/meta-prompts/outreach-sequence \
  -H "Content-Type: application/json" \
  -d '{
    "company": "FinTech Solutions Inc",
    "industry": "Financial Services",
    "icp": 85,
    "legalRisk": "high",
    "readinessScore": 88
  }'
```

**Expected:** 5-email sequence with:
- Email 1: Cold introduction with WCAG score
- Email 2: Legal liability angle
- Email 3: Case study from similar company
- Email 4: Social proof (compliance deadline)
- Email 5: Urgency (ADA lawsuit trends)

### Step 3: Violation Analysis Prompt
```bash
curl -X POST http://localhost:5000/api/meta-prompts/violation-analysis \
  -H "Content-Type: application/json" \
  -d '{
    "violations": [
      {"type": "missing-alt-text", "count": 23, "severity": "critical"},
      {"type": "low-color-contrast", "count": 45, "severity": "serious"},
      {"type": "keyboard-navigation", "count": 12, "severity": "moderate"}
    ],
    "wcagScore": 62
  }'
```

**Expected:** Prioritized violation analysis with ROI for each fix

### Step 4: Remediation Estimate Prompt
```bash
curl -X POST http://localhost:5000/api/meta-prompts/remediation-estimate \
  -H "Content-Type: application/json" \
  -d '{
    "violations": [
      {"type": "missing-alt-text", "count": 23},
      {"type": "low-color-contrast", "count": 45}
    ],
    "company": "FinTech Solutions Inc",
    "industry": "Financial Services"
  }'
```

**Expected:** Cost and timeline estimates for fixing violations

### Step 5: Agent Instructions Prompt
```bash
curl -X POST http://localhost:5000/api/meta-prompts/agent-instructions \
  -H "Content-Type: application/json" \
  -d '{
    "agentType": "planner",
    "industry": "Financial Services",
    "priority": "high"
  }'
```

**Expected:** Detailed agent workflow instructions

---

## 🎯 WORKFLOW 4: INTEGRATIONS (Dashboard)
**Purpose:** View all AI capabilities and API endpoints
**Time:** 30 seconds
**Value:** Self-service documentation

### Step 1: Navigate to Integrations
```
URL: http://localhost:5000/integrations
Expected: 4 integration cards
```

### Step 2: Verify Cards Visible
- ✅ Meta-Prompts Integration
- ✅ OpenAI Integration
- ✅ HubSpot Integration
- ✅ Keyword Discovery Integration

### Step 3: View API Documentation
Click each card to see:
- API endpoint URL
- Request body schema
- Response format
- Example cURL commands

---

## 🎯 WORKFLOW 5: AGENT CONTROL CENTER
**Purpose:** Monitor autonomous agent system
**Time:** 1 minute
**Value:** Track scanning, outreach, health

### Step 1: Navigate to Agent Status
```
URL: http://localhost:5000/agents
Expected: 4 agent status cards
```

### Step 2: Check Agent Status
```
Planner Agent:
  - Status: Ready (disabled by default)
  - Next run: 60 minutes
  - Scheduled scans: 0

Executor Agent:
  - Status: Ready (disabled by default)
  - Active jobs: 0
  - Completed: 0

Outreach Agent:
  - Status: Disabled
  - Emails queued: 0
  - Sent: 0

Monitor Agent:
  - Status: Disabled
  - Health checks: 0
  - System uptime: --
```

### Step 3: Manual Agent Trigger (if enabled)
```bash
# Manually trigger planner
curl -X POST http://localhost:5000/api/agents/planner/run \
  -H "Content-Type: application/json"

# Response
{"status": "completed", "scheduled": 3, "quotaRemaining": 97}
```

### Step 4: Check Agent Logs
```bash
# Get agent execution logs
curl -X GET http://localhost:5000/api/agents/logs?limit=10
```

---

## 🎯 WORKFLOW 6: BACKEND STATUS
**Purpose:** Verify browser scanning infrastructure
**Time:** 30 seconds
**Value:** Understand scanning capabilities

### Step 1: Navigate to Backend Status
```
URL: http://localhost:5000/backends
Expected: Browser backend status dashboard
```

### Step 2: Check Backend Status
```
Puppeteer (Local):
  - Status: Available ⚠️ (System dependencies missing)
  - Concurrent scans: 2
  - Daily limit: Unlimited

Playwright (Multi-Browser):
  - Status: Available ⚠️ (System dependencies missing)
  - Concurrent scans: 1
  - Daily limit: Unlimited

Opera Neon:
  - Status: Disabled (no API key)
  - Concurrent scans: 10
  - Daily limit: 500/day

Comet:
  - Status: Disabled (no API key)
  - Concurrent scans: 20
  - Daily limit: 1000/day

BrowserOS:
  - Status: Disabled (no API key)
  - Concurrent scans: 50
  - Daily limit: 5000/day
```

### Step 3: Test Backend Health Check
```bash
curl -X GET http://localhost:5000/api/backends/health
```

---

## 🎯 WORKFLOW 7: COMPLETE END-TO-END TEST
**Purpose:** Full flow from discovery to outreach
**Time:** 5-10 minutes
**Value:** Validate entire platform workflow

### Step 1: Discover Prospects (Keyword Discovery)
```bash
curl -X POST http://localhost:5000/api/discovery/keywords \
  -H "Content-Type: application/json" \
  -d '{"keywords": ["hospital"], "industry": "Healthcare", "limit": 5}'
```

Expected: 5 healthcare prospects with ICP scores

### Step 2: Analyze Top Prospect (Meta-Prompts)
```bash
curl -X POST http://localhost:5000/api/meta-prompts/prospect-analysis \
  -H "Content-Type: application/json" \
  -d '{
    "company": "FinTech Solutions Inc",
    "website": "https://fintechsolutions.com",
    "industry": "Financial Services",
    "icp": 85,
    "wcagScore": 62,
    "violations": 15
  }'
```

Expected: AI-generated analysis prompt

### Step 3: Generate Outreach Sequence
```bash
curl -X POST http://localhost:5000/api/meta-prompts/outreach-sequence \
  -H "Content-Type: application/json" \
  -d '{
    "company": "FinTech Solutions Inc",
    "industry": "Financial Services",
    "icp": 85,
    "legalRisk": "high",
    "readinessScore": 88
  }'
```

Expected: 5-email outreach sequence

### Step 4: Trigger Scan (if backend available)
```bash
curl -X POST http://localhost:5000/api/scan/quick-win \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://fintechsolutions.com",
    "companyName": "FinTech Solutions Inc"
  }'
```

Expected: Scan job created and queued

### Step 5: Verify Result
Check scan job status:
```bash
curl -X GET http://localhost:5000/api/scan/{scanId}
```

Expected: WCAG score, violations, legal risk assessment

---

## ✅ SUCCESS CRITERIA

### Quick Win Demo ✓
- [ ] Form loads without errors
- [ ] Scan status updates in real-time
- [ ] Results display WCAG score and violations
- [ ] PDF downloads successfully (if backend available)

### Keyword Discovery ✓
- [ ] API returns 5+ prospects per industry
- [ ] ICP scores range 65-85
- [ ] UI displays results in table
- [ ] Works across 10 different industries

### Meta-Prompts ✓
- [ ] All 5 API endpoints functional
- [ ] Return valid AI prompts
- [ ] Prospect analysis includes readiness score
- [ ] Outreach sequence is 5 emails
- [ ] Violation analysis prioritized by ROI
- [ ] Remediation estimates include cost/timeline
- [ ] Agent instructions provide specific workflows

### Integrations ✓
- [ ] 4 cards visible on dashboard
- [ ] Each card shows API endpoint
- [ ] Example cURL commands work
- [ ] Documentation complete

### Agents ✓
- [ ] Status page loads
- [ ] 4 agent cards display
- [ ] Manual triggers work (if enabled)
- [ ] API responses valid
- [ ] Logs available and queryable

### Backend Status ✓
- [ ] 5 backends listed
- [ ] Status indicators accurate
- [ ] Daily limits displayed
- [ ] Concurrent capacity shown
- [ ] Health check endpoint works

---

## 🐛 TROUBLESHOOTING

### Issue: Scan fails with "No violations found"
**Solution:** Scanning uses demo data. Real websites need browser backend setup.

### Issue: Keyword discovery returns same companies
**Solution:** Demo data is consistent. Add BING_SEARCH_API_KEY to discover real companies.

### Issue: Agent status shows "Disabled"
**Solution:** Set `ENABLE_AGENTS=true` environment variable to activate agents.

### Issue: 404 on any page
**Solution:** Make sure using http://localhost:5000 (not https)

### Issue: Database connection error
**Solution:** Check DATABASE_URL environment variable is set correctly

### Issue: Meta-prompts API returns empty response
**Solution:** Ensure OpenAI API key is configured (auto-loaded from integrations)

### Issue: Backend shows all disabled
**Solution:** This is expected in Replit. Add cloud backend API keys (Opera Neon, Comet, BrowserOS) to enable remote scanning

---

## 📊 METRICS TO TRACK

After testing, measure:
- ✅ Keyword discovery success rate (should be 100%)
- ✅ Average ICP score (should be 65-85)
- ✅ Meta-prompt generation time (<1 second)
- ✅ Scan completion rate (depends on backend)
- ✅ Agent execution status (if enabled)
- ✅ Average outreach sequence quality (subjective)

---

## 🚀 TESTING CHECKLIST

### Fast Track (5 minutes)
- [ ] Keyword discovery API test (Finance)
- [ ] Meta-prompts prospect analysis test
- [ ] Integrations dashboard view
- [ ] Agent status check

### Standard Track (15 minutes)
- [ ] Quick Win Demo UI test
- [ ] Keyword discovery across 3 industries
- [ ] All 5 meta-prompts endpoints
- [ ] Agent control center
- [ ] Backend status dashboard

### Complete Track (30 minutes)
- [ ] Full quick win demo (end-to-end)
- [ ] Keyword discovery 10 industries
- [ ] All meta-prompts API tests
- [ ] Manual agent trigger (if enabled)
- [ ] Backend health checks
- [ ] Integration documentation review
- [ ] UI workflow validation

---

## 📝 NOTES

- All tests use demo data when BING_SEARCH_API_KEY is not configured
- Scanning is blocked in Replit environment due to missing system dependencies
- For production scanning, configure Opera Neon, Comet, or BrowserOS backends
- Agents are disabled by default—set ENABLE_AGENTS=true to activate
- Database persists across restarts using PostgreSQL (not in-memory)

