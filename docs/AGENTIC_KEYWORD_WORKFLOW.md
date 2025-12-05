# 🤖 Agentic Keyword Discovery Workflow

## Complete Autonomous Pipeline: Keywords → ICP Scoring → Automated Audits → Reports

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                               │
│  STEP 1: USER INPUT                                                          │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │ Keywords: "fintech, payment gateway"  |  Industry: "Finance"           │  │
│  │ User clicks: "QUEUE FOR AUTOMATED SCANNING"                            │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                      ↓                                        │
│  STEP 2: KEYWORD DISCOVERY SERVICE (Synchronous)                             │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │ • Search web for companies matching keywords + industry                │  │
│  │ • Calculate ICP Score for each prospect (0-100)                        │  │
│  │ • Store prospects in database with status: "discovered"               │  │
│  │ • Returns 10-50 potential clients                                      │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                      ↓                                        │
│  EXAMPLE RESULTS:                                                             │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │ ✓ FinTech Solutions Inc      | ICP Score: 85/100 | Status: discovered │  │
│  │ ✓ PaymentGateway Corp         | ICP Score: 78/100 | Status: queued    │  │
│  │ ✓ Digital Banking Co          | ICP Score: 72/100 | Status: queued    │  │
│  │ ✓ Crypto Trading Platform     | ICP Score: 65/100 | Status: queued    │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                      ↓                                        │
│  STEP 3: PLANNER AGENT (Runs Every 60 Minutes) 🕐                            │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │ • Autonomously checks for prospects with status "queued"               │  │
│  │ • Prioritizes by ICP Score (highest risk first)                        │  │
│  │ • Respects scan window (8 AM - 8 PM)                                   │  │
│  │ • Queues up to 10 scans per day                                        │  │
│  │ • Sets prospect status: "scan_scheduled"                               │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                      ↓                                        │
│  PLANNER DECISION TREE:                                                       │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │ Is it 8 AM - 8 PM?                                                      │  │
│  │ ├─ YES: Continue                                                         │  │
│  │ └─ NO: Skip this cycle, try again in 60 minutes                          │  │
│  │                                                                          │  │
│  │ Found prospects to scan?                                                 │  │
│  │ ├─ YES: Sort by ICP score (highest = most valuable)                     │  │
│  │ └─ NO: Log "no prospects to scan", try again in 60 minutes              │  │
│  │                                                                          │  │
│  │ Daily quota available?                                                   │  │
│  │ ├─ YES (< 10 scans): Queue up to 10 more scans                         │  │
│  │ └─ NO: Skip, quota met for today                                        │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                      ↓                                        │
│  STEP 4: EXECUTOR AGENT (Runs Every 15 Minutes) ⚡                           │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │ • Autonomously processes "scan_scheduled" jobs                          │  │
│  │ • Runs WCAG audit using Puppeteer + Axe-core                           │  │
│  │ • Generates instant PDF report                                          │  │
│  │ • Creates before/after website mockups (OpenAI GPT-5)                   │  │
│  │ • Max 2 concurrent scans (prevents resource exhaustion)                │  │
│  │ • Sets status: "completed" or "failed" with error details              │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                      ↓                                        │
│  SCAN PROCESSING:                                                             │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │ For each scan job:                                                       │  │
│  │ 1. Launch Puppeteer + load website                                       │  │
│  │ 2. Run Axe-core accessibility audit                                      │  │
│  │ 3. Capture original HTML/CSS                                             │  │
│  │ 4. Generate WCAG Score (0-100)                                           │  │
│  │ 5. Store 50+ violations with severity                                    │  │
│  │ 6. Send to OpenAI for accessible version generation                      │  │
│  │ 7. Generate before/after mockups with Sharp                             │  │
│  │ 8. Create PDF report with recommendations                                │  │
│  │ 9. Store all results in database                                         │  │
│  │ 10. Update prospect status: "audited"                                    │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                      ↓                                        │
│  STEP 5: OUTREACH AGENT (Runs Every 120 Minutes) 📧 [OPTIONAL]              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │ • Autonomously sends audit reports to prospects                         │  │
│  │ • Tracks email engagement (open rate, click rate)                       │  │
│  │ • Adapts follow-up cadence based on responses                           │  │
│  │ • Schedules follow-ups and discovery call reminders                     │  │
│  │ • Marks status: "outreach_sent"                                         │  │
│  │ • [Currently Disabled by Default - Set ENABLE_AGENTS=true]              │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                      ↓                                        │
│  STEP 6: MONITOR AGENT (Runs Every 30 Minutes) 📊                            │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │ • Tracks system health and agent status                                 │  │
│  │ • Retries failed scans automatically                                     │  │
│  │ • Escalates persistent issues to admin                                  │  │
│  │ • Provides real-time status dashboard                                   │  │
│  │ • Logs detailed metrics for performance tuning                          │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                      ↓                                        │
│  FINAL RESULT:                                                                │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │ ✅ COMPLETE AUDIT PACKAGE FOR EACH PROSPECT:                            │  │
│  │                                                                          │  │
│  │ • WCAG Score with before/after comparison                               │  │
│  │ • PDF report with 50+ violation details                                 │  │
│  │ • Before/after website mockups (HTML/CSS)                               │  │
│  │ • Downloadable HTML + CSS package (ZIP)                                 │  │
│  │ • Legal risk assessment                                                  │  │
│  │ • Cost & timeline estimates for remediation                             │  │
│  │ • Ready-to-share prospect dashboard link                                │  │
│  │                                                                          │  │
│  │ PROSPECT STATUS FLOW:                                                    │  │
│  │ discovered → queued → scan_scheduled → running → completed              │  │
│  │                                                    ↓                      │  │
│  │                                          outreach_sent → engaged          │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Real-Time Agent Coordination

### Agent Intervals & Responsibilities:

| Agent | Interval | Responsibility | Status |
|-------|----------|-----------------|--------|
| **Planner** | 60 min | Discover prospects, prioritize by ICP, queue scans | ✅ Active |
| **Executor** | 15 min | Run WCAG audits, generate PDFs & mockups | ✅ Active |
| **Outreach** | 120 min | Send reports, track engagement, schedule follow-ups | 🚫 Optional |
| **Monitor** | 30 min | Health checks, retry failures, escalate issues | ✅ Active |

---

## 💡 Key ICP Scoring Factors (0-100)

```javascript
Base Score: 50 points

Keyword Matches:
  + 20 pts: Keyword in company name
  + 10 pts: Keyword in description

Domain Quality:
  + 10 pts: .com or .io domain
  + 5 pts: Not aggregator site (LinkedIn, Crunchbase)

Industry Risk:
  + 15 pts: High-risk industries (Finance, Healthcare, Legal)
  + 10 pts: E-commerce (high user volume)

Example: FinTech Solutions Inc
  50 (base) + 20 (keyword match) + 15 (finance industry) + 10 (.com) = 95/100
```

---

## 🎯 User Journey: Keyword Discovery → Automated Audit Pipeline

```
1. VISIT HOMEPAGE (/)
   └─ See: "Launch Keyword Discovery" (primary button)

2. CLICK → Go to /discovery
   └─ Enter: Keywords "fintech, payment gateway"
   └─ Enter: Industry "Finance"
   └─ Click: "Queue for Automated Scanning"

3. RESULTS APPEAR (2-3 seconds)
   ✓ FinTech Solutions Inc (85/100 ICP) - Status: QUEUED
   ✓ PaymentGateway Corp (78/100 ICP) - Status: QUEUED
   ✓ Digital Banking Co (72/100 ICP) - Status: QUEUED
   ✓ Crypto Trading Platform (65/100 ICP) - Status: QUEUED

4. PLANNER AGENT WAKES UP (in next 60 minutes)
   └─ Sees 4 queued prospects
   └─ Sorts by ICP score (highest first)
   └─ Checks time window (8 AM - 8 PM)
   └─ Queues all 4 for scanning

5. EXECUTOR AGENT WAKES UP (every 15 minutes)
   └─ Sees 4 pending scans
   └─ Processes 2 at once (concurrency limit)
   └─ For each:
      - Runs WCAG audit
      - Generates PDF report
      - Creates before/after mockups
      - Stores in database
   └─ Updates status to "COMPLETED"

6. YOU SEE RESULTS IN DASHBOARD (/prospects)
   ✅ FinTech Solutions Inc - AUDITED - 85 WCAG Score
   ✅ PaymentGateway Corp - AUDITED - 78 WCAG Score
   ✅ Digital Banking Co - AUDITED - 72 WCAG Score
   ✅ Crypto Trading Platform - AUDITED - 65 WCAG Score

7. CLICK ON ANY PROSPECT
   └─ See: Full audit report
   └─ See: Before/after mockups
   └─ Download: PDF + HTML/CSS package
   └─ Share: Prospect dashboard link with discovery call CTA
```

---

## 🚀 Enabling Full Agentic Automation

```bash
# Enable all 4 agents
export ENABLE_AGENTS=true

# Configure agent behavior
export PLANNER_MAX_DAILY_SCANS=10
export EXECUTOR_MAX_CONCURRENT=2
export PLANNER_INTERVAL_MINUTES=60
export EXECUTOR_INTERVAL_MINUTES=15
export MONITOR_INTERVAL_MINUTES=30

# Configure email for outreach (optional)
export EMAIL_FROM="your-email@domain.com"
export SENDGRID_API_KEY="your-sendgrid-key"
export ENABLE_OUTREACH=true
```

---

## 📊 Real-Time Monitoring

**View Agent Status:** Go to `/agents` dashboard
- Planner Agent: Last run time, prospects queued, scans scheduled
- Executor Agent: Active jobs, completion rate, avg scan time
- Outreach Agent: Emails sent, open rate, click rate
- Monitor Agent: System health, error log, retry queue

---

## 🎯 The Power of Agentic Keyword Discovery

1. **You do the high-value work**: Enter keywords once
2. **Agents do the repetitive work**: Discover, audit, report autonomously
3. **10x faster delivery**: 5-minute scans × 100+ prospects = 1 person covering 500+ audits/month
4. **Always running**: Background agents work 24/7 across time zones
5. **Intelligent prioritization**: ICP scoring ensures highest-value prospects get scanned first
6. **Automated sales funnel**: Reports auto-sent, engagement tracked, follow-ups scheduled

---

## 🔐 Security & Reliability

- **UUID-based sharing**: Reports accessible via cryptographically random tokens
- **No authentication required**: Frictionless prospect experience (like Google Forms)
- **Automatic retries**: Failed scans retry up to 3 times
- **Concurrent limits**: Prevents resource exhaustion (max 2 concurrent scans)
- **Time-based scheduling**: Respects operational windows (8 AM - 8 PM)
- **Daily quotas**: Prevents infrastructure overload (max 10 scans/day)

---

## 📈 Next Steps

1. ✅ **Keywords entered** → Prospects discovered with ICP scores
2. 🔄 **Queue for scanning** → Planner Agent picks them up automatically
3. ⚡ **Executor runs audits** → PDF + mockups generated instantly
4. 📧 **Outreach** (optional) → Reports sent, engagement tracked
5. 🎯 **Close the deal** → Prospect dashboard + discovery call booking

This is your **10x force multiplier** – one person can now manage hundreds of audits monthly through agentic automation! 🚀
