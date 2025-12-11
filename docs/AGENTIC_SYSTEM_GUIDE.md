# 🤖 Agentic Automation System - Complete Implementation Guide

## ✅ What Was Built

Your WCAG AI Platform now has a **fully autonomous agent system** that can:
- Schedule scans automatically
- Process audits in the background
- Send outreach emails on autopilot
- Monitor system health and retry failures
- Scale without your intervention

---

## 🏗️ Architecture Overview

### 4 Autonomous Agents

#### 1. **Planner Agent** (Runs every 60 minutes)
**Purpose:** Decides which prospects to scan and when

**What it does:**
- Queries prospects from database
- Prioritizes high-risk prospects first
- Respects scan time windows (8 AM - 8 PM)
- Enforces daily scan quotas (max 10/day)
- Queues scans automatically

**File:** `server/agents/planner-agent.ts`

#### 2. **Executor Agent** (Runs every 15 minutes)
**Purpose:** Processes scan jobs and generates reports

**What it does:**
- Fetches queued scan jobs from database
- Runs WCAG audits using Puppeteer + Axe-core
- Generates PDF reports with legal risk assessment
- Stores violations in database
- Handles failures gracefully

**File:** `server/agents/executor-agent.ts`

#### 3. **Outreach Agent** (Runs every 120 minutes - DISABLED by default)
**Purpose:** Sends audit reports to prospects via email

**What it does:**
- Finds completed scans needing outreach
- Sends HTML emails with PDF attachments
- Tracks email engagement (when configured)
- Respects email rate limits (10/hour)
- Adapts cadence based on responses

**File:** `server/agents/outreach-agent.ts`

**Why disabled:** Prevents accidental spam during development

#### 4. **Monitor Agent** (Runs every 30 minutes)
**Purpose:** System health monitoring and error recovery

**What it does:**
- Tracks job queue status
- Monitors success/failure rates
- Provides agent status metrics
- Retries failed jobs
- Alerts on system issues

**File:** `server/agents/monitor-agent.ts`

---

## 🚀 How to Use

### Option 1: Manual Control (Default)
Agents are **disabled by default** to prevent unexpected behavior.

Access the **Agent Control Center** at `/agents` to:
- View real-time system status
- See job queue (queued, running, failed)
- Manually trigger individual agents
- Monitor system health

### Option 2: Full Automation
Enable autonomous operation:

```bash
export ENABLE_AGENTS=true
npm run dev
```

Then all 4 agents run on their schedules:
- ✅ Planner: Every 60 minutes
- ✅ Executor: Every 15 minutes
- ⚠️ Outreach: Every 120 minutes (still disabled - enable in code)
- ✅ Monitor: Every 30 minutes

---

## 📊 Agent Control Dashboard

Access at: **`http://localhost:5000/agents`**

Features:
- **Real-time metrics:** Scans today, completed, failed, emails sent
- **Job queue status:** Queued, running, failed jobs
- **Manual triggers:** Run any agent on-demand
- **System information:** Platform, scanner, automation status
- **Auto-refresh:** Updates every 30 seconds

---

## 🔧 Supporting Services

### Screenshot Capturer
**File:** `server/services/screenshot-capturer.ts`

- Full-page screenshots
- Element-specific captures
- Violation highlighting with red borders
- Scroll-to-element automation

### Composite Generator
**File:** `server/services/composite-generator.ts`

- Before/after side-by-side images
- Labeled comparisons (Before/After badges)
- Professional layouts for reports

### Email Service
**File:** `server/services/email-service.ts`

- Nodemailer integration
- SendGrid/SMTP support
- HTML email templates
- PDF attachment support
- Report delivery and cold outreach

### Scan Orchestrator
**File:** `server/orchestrator.ts`

- Coordinates entire scan workflow
- Queues jobs
- Runs scans in background
- Generates reports
- Sends emails (optional)

---

## 🌐 API Endpoints

### Agent Control
```http
GET  /api/agents/status         # Get agent system status
POST /api/agents/planner/run    # Manually trigger planner
POST /api/agents/executor/run   # Manually trigger executor
```

### Scans & Reports
```http
POST /api/scan/quick-win        # Start Quick Win scan
GET  /api/scan/:id              # Get scan job status
GET  /api/scan/:id/results      # Get scan violations
GET  /api/scan/:id/report       # Get audit report
POST /api/outreach              # Send outreach email
```

---

## ⚙️ Configuration

### Environment Variables

#### Email Configuration (Optional)
```bash
# SendGrid (recommended)
export SENDGRID_API_KEY="your-key"
export EMAIL_FROM="you@example.com"

# OR Custom SMTP
export SMTP_HOST="smtp.gmail.com"
export SMTP_PORT="587"
export SMTP_USER="you@gmail.com"
export SMTP_PASSWORD="your-password"
export SMTP_SECURE="false"
```

#### Agent Configuration
```bash
# Enable autonomous operation
export ENABLE_AGENTS="true"
```

### Code Configuration

Edit `server/agents/index.ts` to customize:

```typescript
const agentControl = new AgentControl({
  enablePlanner: true,
  enableExecutor: true,
  enableOutreach: false,  // Set true to enable email automation
  enableMonitor: true,
  plannerIntervalMinutes: 60,
  executorIntervalMinutes: 15,
  outreachIntervalMinutes: 120,
  monitorIntervalMinutes: 30,
});
```

---

## 📝 Typical Workflow

### Autonomous Mode (ENABLE_AGENTS=true)

1. **Planner Agent** runs every hour
   - Selects top 10 prospects
   - Queues scan jobs

2. **Executor Agent** runs every 15 minutes
   - Picks up queued jobs
   - Runs WCAG audits
   - Generates PDF reports
   - Stores results in database

3. **Monitor Agent** runs every 30 minutes
   - Checks system health
   - Reports metrics
   - Retries failed jobs

4. **Outreach Agent** (if enabled) runs every 2 hours
   - Sends reports to prospects
   - Tracks engagement

### Manual Mode (Default)

1. Visit `/agents` dashboard
2. Click "Run Now" on Planner
   - Queues scan jobs

3. Click "Run Now" on Executor
   - Processes queued scans

4. Check results at `/reports`

---

## 🎯 Quick Start Examples

### Example 1: Queue a Single Scan
```bash
curl -X POST http://localhost:5000/api/scan/quick-win \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "companyName": "Example Corp"
  }'
```

### Example 2: Enable Full Automation
```bash
# 1. Configure email
export SENDGRID_API_KEY="your-key"
export EMAIL_FROM="you@example.com"

# 2. Enable agents
export ENABLE_AGENTS="true"

# 3. Start server
npm run dev

# Agents now run autonomously!
```

### Example 3: Monitor System
```bash
# Get current status
curl http://localhost:5000/api/agents/status

# Returns:
{
  "scansToday": 5,
  "scansCompleted": 4,
  "scansFailed": 1,
  "emailsSent": 0,
  "queuedJobs": 2,
  "runningJobs": 1,
  "failedJobs": 1,
  "lastActivity": "2025-01-21T17:15:00.000Z"
}
```

---

## 🔍 Troubleshooting

### Agents Not Running
- Check logs for "⚠️ Agents disabled"
- Set `ENABLE_AGENTS=true`
- Restart server

### Scans Failing
- Check Monitor Agent dashboard
- View failed job error messages
- Ensure Puppeteer can access target URLs
- Check for SSL/network issues

### Emails Not Sending
- Verify email configuration
- Check Outreach Agent is enabled
- Test with manual trigger first
- Review email service logs

### High Failure Rate
- Monitor Agent will log warnings
- Check `/agents` dashboard for metrics
- Review failed jobs in database
- May need to scale resources

---

## 📈 Scaling Considerations

### Current Limits
- **Max concurrent scans:** 2
- **Max daily scans:** 10
- **Max emails/hour:** 10

### To Scale Up

1. **Increase concurrency:**
   Edit `server/agents/executor-agent.ts`:
   ```typescript
   private maxConcurrent = 5;  // Increase from 2
   ```

2. **Increase daily quota:**
   Edit `server/agents/planner-agent.ts`:
   ```typescript
   maxDailyScans: 50,  // Increase from 10
   ```

3. **Add more executor instances:**
   - Deploy multiple workers
   - Use job queue (Redis/Upstash QStash)
   - Implement distributed locking

---

## 🚀 Next Steps

### Immediate Enhancements
- [ ] Enable Outreach Agent for production
- [ ] Configure SendGrid/Resend for emails
- [ ] Add Calendly integration for bookings
- [ ] Implement email engagement tracking

### Advanced Features
- [ ] Integrate Upstash QStash for better queuing
- [ ] Add learning agent for optimization
- [ ] Implement A/B testing for emails
- [ ] Build analytics dashboard
- [ ] Add webhook handlers for engagement
- [ ] Integrate CRM (HubSpot/Salesforce)

---

## 📚 Files Reference

### Core Agents
- `server/agents/planner-agent.ts` - Scan scheduling
- `server/agents/executor-agent.ts` - Job processing
- `server/agents/outreach-agent.ts` - Email automation
- `server/agents/monitor-agent.ts` - Health monitoring
- `server/agents/index.ts` - Agent control center

### Services
- `server/services/wcag-scanner.ts` - WCAG auditing
- `server/services/pdf-generator.ts` - Report generation
- `server/services/screenshot-capturer.ts` - Screenshots
- `server/services/composite-generator.ts` - Image composites
- `server/services/email-service.ts` - Email delivery
- `server/orchestrator.ts` - Workflow coordination

### Frontend
- `client/src/pages/agent-status.tsx` - Agent dashboard
- `client/src/pages/quick-win.tsx` - Lead gen flow
- `client/src/pages/scanner.tsx` - Scan tools
- `client/src/pages/reports.tsx` - Report management

### Configuration
- `server/start-agents.ts` - Agent initialization
- `server/app.ts` - Server setup
- `replit.md` - Complete documentation

---

## 💡 Pro Tips

1. **Start with Manual Mode**
   - Test agents individually
   - Verify email configuration
   - Monitor results before enabling automation

2. **Monitor Regularly**
   - Check `/agents` dashboard daily
   - Review failed jobs
   - Adjust intervals based on load

3. **Scale Gradually**
   - Start with low quotas
   - Increase as system stabilizes
   - Monitor performance metrics

4. **Use Webhooks**
   - Add webhook handlers for email clicks
   - Track prospect engagement
   - Trigger follow-up actions

---

## ✅ Verification Checklist

- [x] All 4 agents implemented
- [x] Agent Control dashboard built
- [x] API endpoints configured
- [x] Services integrated (screenshot, composite, email)
- [x] Orchestrator coordination working
- [x] Database schema supports workflow
- [x] Documentation complete
- [ ] Email provider configured
- [ ] Agents enabled in production
- [ ] Monitoring & alerts set up

---

**You now have a fully autonomous WCAG consulting platform!** 🎉

The system can operate hands-free, scheduling scans, processing audits, and (when enabled) sending outreach emails - all while you focus on delivering value to clients.
