# 🤖 Agentic Keyword-Focused Workflow Specification

## Overview
This is a fully agentic, task-based workflow where **every step can be triggered by a user OR an agent**. Keywords are the primary entry point, and each stage exposes API endpoints for agent chaining and automation.

---

## Workflow Steps (Task Chain)

### **Step 1: Platform Entry (Agent-Ready)**
**User/Agent Action:** Open homepage  
**Display:** Prominent keyword input  
**API Endpoint:** `POST /api/tasks/keyword-discovery`

```
┌─ Homepage ─────────────────────────┐
│ "Find & Audit Your Prospects"      │
│                                    │
│ 🔍 KEYWORD DISCOVERY (Primary)    │
│ [Enter keywords: fintech, ...]    │
│ [Industry: Finance]               │
│ [Launch Keyword Discovery]         │
│                                    │
│ ─────────────── OR ────────────── │
│                                    │
│ 📄 QUICK WIN by URL (Secondary)   │
│ [Enter website URL]               │
│ [Start Audit]                      │
└────────────────────────────────────┘
```

---

### **Step 2: Keyword Discovery Task**
**Agent Action:** Parse keywords → Search web → Auto-calculate ICP scores  
**Input:** 
```json
{
  "keywords": ["fintech", "payment gateway"],
  "industry": "Finance",
  "limit": 50
}
```

**Output (Automatic):** List of prospects with ICP scores  
**API Endpoint:** `POST /api/tasks/discover-prospects`

```json
{
  "status": "discovered",
  "prospects": [
    {
      "id": "uuid",
      "company": "FinTech Solutions Inc",
      "website": "https://fintechsolutions.com",
      "industry": "Finance",
      "icpScore": 85,
      "status": "discovered"
    },
    {
      "id": "uuid",
      "company": "PaymentGateway Corp",
      "website": "https://paymentgateway.io",
      "industry": "Finance",
      "icpScore": 78,
      "status": "discovered"
    }
  ]
}
```

---

### **Step 3: Prospect Selection & Audit Trigger**
**User/Agent Action:** Select prospects (single, multiple, or all)  
**Display:** Prospect list with ICP scores, "Scan Now" buttons  
**API Endpoint (Single):** `POST /api/tasks/audit-prospect/{prospectId}`  
**API Endpoint (Batch):** `POST /api/tasks/queue-prospects`

```json
{
  "prospectIds": ["uuid1", "uuid2", "uuid3"],
  "triggerNow": false  // If true, start immediately. If false, queue for agent
}
```

---

### **Step 4: Automated WCAG Audit Task**
**Agent Action (Executor Agent):** Run accessibility scan  
**Input:** Prospect ID or Website URL  
**Output:** WCAG violations, scores, recommendations  
**API Endpoint:** `POST /api/tasks/run-audit/{prospectId}`

**Internal Process:**
1. Launch Puppeteer → Load website
2. Run Axe-core accessibility scan
3. Capture original HTML/CSS
4. Generate WCAG score (0-100)
5. Compile violation list (critical, serious, moderate, minor)

**Response:**
```json
{
  "prospectId": "uuid",
  "wcagScore": 65,
  "totalViolations": 47,
  "criticalCount": 8,
  "seriousCount": 12,
  "moderateCount": 18,
  "minorCount": 9,
  "violations": [
    {
      "id": "color-contrast",
      "impact": "critical",
      "description": "Elements must have sufficient color contrast",
      "elementsAffected": 5
    }
  ]
}
```

---

### **Step 5: Automated Output Generation Task**
**Agent Action (Post-Audit):** Generate reports and fix bundles  
**API Endpoint:** `POST /api/tasks/generate-outputs/{prospectId}`

**Outputs Generated:**
1. **PDF Report** - WCAG summary, violations, legal risk, cost estimates
2. **HTML/CSS Package** - Before/after mockups, fix suggestions
3. **Dashboard Link** - Shareable prospect results (UUID-based)

**Response:**
```json
{
  "prospectId": "uuid",
  "outputs": {
    "pdf": {
      "url": "/reports/uuid/audit.pdf",
      "generated": true
    },
    "htmlPackage": {
      "zipUrl": "/mockups/uuid/package.zip",
      "previewUrl": "/mockups/uuid/preview.html"
    },
    "dashboardLink": "https://platform.com/results/uuid"
  }
}
```

---

### **Step 6: Alternative Path - Quick Win by URL**
**User Entry:** Direct URL input (no keywords)  
**Same as Steps 4-5:** Run audit → generate outputs  
**API Endpoint:** `POST /api/tasks/quick-audit`

```json
{
  "url": "https://example.com",
  "companyName": "Example Inc"
}
```

---

## Agentic Loops (Triggered Automatically)

### **Loop 1: Regular Re-Audits**
```
Prospect Status: "audited" 
→ Schedule re-audit every 30 days
→ Compare before/after WCAG scores
→ Alert if score drops
```
**API:** `POST /api/tasks/schedule-reaudit/{prospectId}`

### **Loop 2: Outreach Automation**
```
Prospect Status: "audited" + "has_outputs"
→ Generate personalized email
→ Send report via SendGrid
→ Track email opens/clicks
→ Schedule follow-up
```
**API:** `POST /api/tasks/send-outreach/{prospectId}`

### **Loop 3: ICP Re-Scoring**
```
New data available (employee count, funding, etc.)
→ Re-calculate ICP score
→ Re-prioritize prospect list
```
**API:** `PATCH /api/tasks/recalculate-icp/{prospectId}`

---

## Agent Flow Chart

```
┌─────────────────────────────────────────────────────┐
│ HOMEPAGE: User enters keywords                       │
└────────────────────┬────────────────────────────────┘
                     ↓
        POST /api/tasks/discover-prospects
                     ↓
┌─────────────────────────────────────────────────────┐
│ PROSPECT LIST: 5-50 companies discovered             │
│ Each shows ICP score, "Scan Now" button              │
└────────────────────┬────────────────────────────────┘
                     ↓
        POST /api/tasks/queue-prospects
        (User selects one or more)
                     ↓
┌─────────────────────────────────────────────────────┐
│ PLANNER AGENT (60 min interval):                     │
│ Reads "queued" prospects                             │
│ Sorts by ICP score                                   │
│ Checks time window (8 AM - 8 PM)                     │
│ Updates status → "scan_scheduled"                    │
└────────────────────┬────────────────────────────────┘
                     ↓
        POST /api/tasks/run-audit/{prospectId}
                     ↓
┌─────────────────────────────────────────────────────┐
│ EXECUTOR AGENT (15 min interval):                    │
│ Reads "scan_scheduled" jobs                          │
│ Runs WCAG audit (max 2 concurrent)                   │
│ Captures original HTML/CSS                           │
│ Generates violations report                          │
│ Updates status → "completed"                         │
└────────────────────┬────────────────────────────────┘
                     ↓
        POST /api/tasks/generate-outputs/{prospectId}
                     ↓
┌─────────────────────────────────────────────────────┐
│ OUTPUT GENERATION:                                   │
│ • PDF report                                         │
│ • HTML/CSS mockups (ZIP)                             │
│ • Shareable dashboard link                           │
└────────────────────┬────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────┐
│ MONITOR AGENT (30 min interval):                     │
│ • Tracks completion status                           │
│ • Retries failed audits                              │
│ • Alerts on errors                                   │
└────────────────────┬────────────────────────────────┘
                     ↓
        POST /api/tasks/send-outreach/{prospectId}
                     ↓
┌─────────────────────────────────────────────────────┐
│ OUTREACH AGENT (120 min, optional):                  │
│ • Sends report email                                 │
│ • Tracks engagement                                  │
│ • Schedules follow-ups                               │
└─────────────────────────────────────────────────────┘
```

---

## Complete API Reference (Agent-Ready)

### Task Endpoints

| Method | Endpoint | Purpose | Triggers |
|--------|----------|---------|----------|
| `POST` | `/api/tasks/keyword-discovery` | Start keyword discovery | Discover → Prospect List |
| `POST` | `/api/tasks/discover-prospects` | Search + ICP calculation | Shows prospects |
| `POST` | `/api/tasks/queue-prospects` | Queue for agent scanning | Planner Agent wakes up |
| `POST` | `/api/tasks/run-audit/{id}` | Execute WCAG audit | Executor Agent runs scan |
| `POST` | `/api/tasks/generate-outputs/{id}` | Create reports + mockups | Output bundle ready |
| `POST` | `/api/tasks/quick-audit` | Direct URL audit | Same as run-audit |
| `POST` | `/api/tasks/send-outreach/{id}` | Email automation | Outreach Agent handles |
| `POST` | `/api/tasks/schedule-reaudit/{id}` | Auto re-scan | 30-day interval |
| `PATCH` | `/api/tasks/recalculate-icp/{id}` | Update ICP score | Re-prioritize list |

### Status Tracking Endpoints

| Method | Endpoint | Response |
|--------|----------|----------|
| `GET` | `/api/agents/status` | Real-time agent status |
| `GET` | `/api/prospects` | All prospects + status |
| `GET` | `/api/scan/{jobId}` | Single scan status |

---

## Key Design Principles

✅ **Keyword Discovery = Primary Action**  
✅ **Background Processing & Auto-Triggering**  
✅ **Every Step Exposes API/Action Endpoint**  
✅ **Minimal Manual Input** (Keywords or URL only)  
✅ **Agent-Ready** (All steps callable by agents, not just users)  
✅ **Task-Based Flow** (Clear discrete steps)  
✅ **Chaining Ready** (Each output triggers next task)

---

## Implementation Checklist

- [x] Keyword Discovery endpoint (`POST /api/tasks/discover-prospects`)
- [x] Queue for scanning endpoint (`POST /api/tasks/queue-prospects`)
- [x] Run audit endpoint (`POST /api/tasks/run-audit/{id}`)
- [x] Generate outputs endpoint (PDFs, mockups)
- [x] Planner Agent (processes "queued" → "scan_scheduled")
- [x] Executor Agent (processes "scan_scheduled" → "completed")
- [x] Monitor Agent (health, retries, escalation)
- [x] Outreach Agent (optional, email automation)
- [x] UI flow reflects task-based approach
- [x] All endpoints agent-callable

---

## Example Agent Script (Pseudo-code)

```javascript
// This script could run independently to automate the entire workflow

async function runAgenticWorkflow() {
  // 1. Discover prospects by keywords
  const discovery = await POST('/api/tasks/discover-prospects', {
    keywords: ['fintech', 'payment gateway'],
    industry: 'Finance',
    limit: 50
  });
  
  const prospects = discovery.prospects; // 30 companies found
  
  // 2. Queue all for scanning
  const queued = await POST('/api/tasks/queue-prospects', {
    prospectIds: prospects.map(p => p.id)
  });
  
  // 3. Wait for agents to process (or manually trigger)
  // Planner Agent will pick these up in next 60 minutes
  // Executor Agent will start audits in next 15 minutes
  
  // 4. Monitor progress
  while (true) {
    const status = await GET('/api/agents/status');
    console.log('Scans completed:', status.executedScans);
    
    if (status.executedScans === prospects.length) {
      break; // All done
    }
    
    await sleep(30000); // Check every 30 seconds
  }
  
  // 5. Send outreach for all completed
  for (const prospect of prospects) {
    await POST(`/api/tasks/send-outreach/${prospect.id}`, {});
  }
  
  console.log('Workflow complete!');
}
```

---

## Summary: What Users/Agents Do

**User Entry Points:**
1. Open homepage → Click "Launch Keyword Discovery"
2. Enter keywords → Click "Discover Prospects"
3. See list → Click "Queue All" or "Scan Now"
4. Wait for agents OR manually audit
5. Download reports + share with prospects

**Agent Automation:**
1. Planner wakes up → Prioritizes by ICP → Schedules scans
2. Executor wakes up → Runs audits → Generates outputs
3. Monitor wakes up → Tracks health → Retries failures
4. Outreach wakes up → Sends emails → Tracks engagement

**Zero User Friction After Keywords:**
- All subsequent steps run autonomously
- Users just monitor progress on `/agents` dashboard
- Results ready within 1-4 hours (depending on queue)

