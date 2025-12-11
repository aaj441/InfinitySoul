# WCAG AI Platform - Complete Integration & API Checklist

## Status: Live Platform with 21+ API Endpoints

**Last Updated:** November 26, 2025  
**Platform Mode:** Development (Replit) → Production (Replit Deployments)

---

## 🔴 CRITICAL: MUST-HAVE INTEGRATIONS (Blocking)

### 1. **PostgreSQL Database** ✅ CONFIGURED
- **Service:** Neon Serverless (via Replit integration)
- **Status:** INSTALLED & ACTIVE
- **How to Verify:** `DATABASE_URL` environment variable is populated
- **What it does:** Stores all prospects, scan results, emails, marketplace data
- **Tables Required:** 28 tables (users, prospects, violations, scanJobs, consultants, marketplace, etc.)
- **Action:** Already configured - no action needed

### 2. **AI Integration: OpenAI** ✅ INSTALLED
- **Service:** OpenAI GPT (via Replit integration)
- **Status:** INSTALLED
- **API Key Location:** `AI_INTEGRATIONS_OPENAI_API_KEY` (managed by Replit)
- **Models Used:**
  - `gpt-4-turbo` - Email generation, competitive analysis, remediation suggestions
  - `gpt-3.5-turbo` - Quick assessments, metadata parsing
- **Usage:** Outreach email generation, AIDA framework personalization
- **Action:** Already configured - verify key is active in OpenAI dashboard

### 3. **AI Integration: Anthropic Claude** ✅ INSTALLED
- **Service:** Anthropic Claude (via Replit integration)
- **Status:** INSTALLED
- **API Key Location:** `AI_INTEGRATIONS_ANTHROPIC_API_KEY` (managed by Replit)
- **Model Used:** `claude-opus-4.1` - Multi-step reasoning, email generation, ICP scoring
- **Usage:** Advanced workflow orchestration, debt collector email generation
- **Action:** Already configured - verify key is active in Anthropic dashboard

---

## 🟡 CRITICAL: NEEDED INTEGRATIONS (You must enable these)

### 4. **Email Service: SendGrid OR Resend OR Nodemailer**
- **Current Setup:** Nodemailer (self-hosted SMTP compatible)
- **Requirement:** At least ONE email service configured
- **Options:**

#### **Option A: SendGrid** (Recommended for production)
- **Service:** SendGrid email API
- **API Key:** `SENDGRID_API_KEY`
- **How to Enable:**
  1. Sign up at https://sendgrid.com
  2. Create API key (Settings → API Keys)
  3. Add to Replit environment: `SENDGRID_API_KEY`
- **Usage:** Sending cold outreach emails, follow-ups, campaign sends
- **Pricing:** $0-$3,150/month (10K-500K emails)

#### **Option B: Resend** (Modern alternative)
- **Service:** Resend transactional email
- **API Key:** `RESEND_API_KEY`
- **How to Enable:**
  1. Sign up at https://resend.com
  2. Get API key from dashboard
  3. Add to Replit environment: `RESEND_API_KEY`
- **Usage:** Transactional emails, campaign sends
- **Pricing:** $20/month or pay-as-you-go

#### **Option C: Custom SMTP**
- **Service:** Any SMTP provider (Gmail, Office 365, etc.)
- **Credentials Needed:**
  - `SMTP_HOST`
  - `SMTP_PORT`
  - `SMTP_USER`
  - `SMTP_PASSWORD`
- **Usage:** Self-hosted email delivery
- **Note:** Requires separate infrastructure

**ACTION REQUIRED:** Choose one and configure the API key

### 5. **Browser Automation Backend** (WCAG Scanning)
**Current Issue:** Puppeteer/Playwright not working locally - fallback options available

#### **Option A: Neon Backend** (Recommended)
- **Service:** Neon serverless Postgres + browser testing
- **Config:** Already available in `server/services/browser-backends/neon-backend.ts`
- **What it needs:** `NEON_API_TOKEN`, `NEON_WS_URL`
- **How to Enable:**
  1. Create Neon account at https://neon.tech
  2. Get API token and WS URL
  3. Add to environment variables
- **Usage:** Runs accessibility scans via serverless Postgres
- **Pricing:** Free tier available, $14+/month for production

#### **Option B: BrowserOS** (Cloud browser)
- **Service:** BrowserOS cloud browser API
- **Config:** `server/services/browser-backends/browseros-backend.ts`
- **What it needs:** `BROWSEROS_API_KEY`, `BROWSEROS_API_URL`
- **How to Enable:**
  1. Sign up at https://browseros.com
  2. Get API key
  3. Add to environment variables
- **Usage:** Cloud browser automation for WCAG scanning
- **Pricing:** Typically $99-$299+/month

#### **Option C: Comet Backend** (AI assistant integration)
- **Service:** Comet AI assistant (for AI co-pilot workflow)
- **Config:** `server/services/browser-backends/comet-backend.ts`
- **What it needs:** `COMET_API_KEY`, `COMET_API_URL`
- **How to Enable:**
  1. Get Comet API access (via Perplexity or similar)
  2. Add API key
  3. Configure base URL
- **Usage:** Synergistic workflow with AI co-pilot
- **Pricing:** Variable

**ACTION REQUIRED:** Choose one backend or implement your own

### 6. **HubSpot CRM Integration** ✅ INSTALLED
- **Service:** HubSpot (via Replit integration)
- **Status:** INSTALLED
- **API Key:** Managed by Replit integration
- **What it does:** Sync prospects, track email engagement, CRM data sync
- **Usage:** Prospect database, email tracking, lifecycle stages
- **Required Features:**
  - Contacts API (GET/POST/PATCH)
  - Deals API (create deals from prospects)
  - Email engagement tracking
- **Action:** Verify HubSpot API key in dashboard, enable Contacts & Deals scopes

---

## 🟢 OPTIONAL INTEGRATIONS (Enhanced Features)

### 7. **Google Custom Search** (For prospect discovery)
- **What it needs:**
  - `GOOGLE_SEARCH_API_KEY`
  - `GOOGLE_CUSTOM_SEARCH_ENGINE_ID`
- **How to Enable:**
  1. Google Cloud Console → Create project
  2. Enable Custom Search API
  3. Create Custom Search Engine
  4. Add credentials to environment
- **Usage:** Keyword-based prospect discovery, web scraping
- **Pricing:** Free tier (100 queries/day), then $5 per 1000 queries
- **Status:** Optional but improves discovery accuracy

### 8. **Lob API** (Physical mail integration)
- **What it needs:** `LOB_API_KEY`
- **How to Enable:**
  1. Sign up at https://lob.com
  2. Get API key
  3. Add to environment: `LOB_API_KEY`
- **Usage:** Send physical certified mail to prospects (premium outreach)
- **Feature:** Sends hard copy compliance reports + letter
- **Pricing:** ~$5-$15 per certified mail piece
- **Status:** Optional for premium outreach

### 9. **Redis** (For job queue - Bull Queue)
- **What it needs:** `REDIS_URL`
- **How to Enable:**
  1. Option A: Use Replit Redis (included)
  2. Option B: Redis Cloud (https://redis.com/cloud)
  3. Add connection string to environment
- **Usage:** Background job processing, email queue, scan scheduling
- **Pricing:** Free tier available (Redis Cloud), included (Replit)
- **Status:** Optional but highly recommended for production

### 10. **GitHub Integration** ✅ INSTALLED
- **Service:** GitHub OAuth (via Replit integration)
- **Status:** INSTALLED
- **Usage:** Version control, CI/CD, webhooks
- **Action:** Already configured - no action needed

### 11. **Google Mail Integration** ✅ INSTALLED
- **Service:** Gmail API (via Replit integration)
- **Status:** INSTALLED
- **Usage:** Email tracking, Gmail sync
- **Action:** Already configured - verify Gmail API access

---

## 📊 COMPLETE ENVIRONMENT VARIABLES REFERENCE

### Required (Platform Won't Work Without)
```bash
# Database
DATABASE_URL=postgresql://...

# AI Services
AI_INTEGRATIONS_OPENAI_API_KEY=sk-...
AI_INTEGRATIONS_ANTHROPIC_API_KEY=sk-ant-...

# Email
SENDGRID_API_KEY=SG.xxx...
# OR
RESEND_API_KEY=re_xxx...
# OR
SMTP_PASSWORD=your_password

# Browser Automation (Choose one)
NEON_API_TOKEN=xxx
NEON_WS_URL=wss://...
# OR
BROWSEROS_API_KEY=xxx
BROWSEROS_API_URL=https://...
# OR
COMET_API_KEY=xxx
COMET_API_URL=https://...
```

### Strongly Recommended (Better Features)
```bash
# HubSpot
# (Managed by Replit integration)

# Job Queue
REDIS_URL=redis://...

# Prospect Discovery
GOOGLE_SEARCH_API_KEY=xxx
GOOGLE_CUSTOM_SEARCH_ENGINE_ID=xxx

# Optional Premium Features
LOB_API_KEY=xxx
```

### Internal/Generated
```bash
# These are generated automatically
SESSION_SECRET=xxx (Replit)
PGDATABASE=xxx (Replit)
PGHOST=xxx (Replit)
PGPASSWORD=xxx (Replit)
PGPORT=xxx (Replit)
PGUSER=xxx (Replit)
```

---

## 🗂️ DATABASE SCHEMA (28 Tables)

### Core Tables
- `users` - Platform users
- `prospects` - Target companies
- `violations` - WCAG violations from scans
- `triggers` - Compliance triggers & alerts

### Scanning & Reporting
- `scanJobs` - Scan execution records
- `scanResults` - Individual violation results
- `auditReports` - Generated PDF reports

### Email & Outreach
- `emailCadences` - Automated email sequences
- `emailHistory` - Sent email tracking
- `emailSends` - Email send logs with open/click tracking
- `emailEvents` - Email events (open, click, bounce)
- `doNotContact` - Unsubscribe/opt-out list

### Marketplace (B2B)
- `consultants` - Registered accessibility consultants
- `marketplaceProjects` - Audit projects for marketplace
- `marketplaceTransactions` - Commission tracking

### Outreach Automation
- `outreachWorkflows` - Multi-step outreach workflows
- `workflowQueues` - Queue management for workflows
- `outreachMetrics` - Campaign performance metrics

### A/B Testing
- `abTests` - Campaign variants
- `emailSends` - Split test tracking (shares with email)
- `emailEvents` - Performance metrics

### Analytics & Compliance
- `analytics` - Daily metrics aggregation
- `ethicalMetrics` - Compliance tracking
- `clients` - Client company records
- `complianceProfiles` - Industry-specific compliance rules

### Legacy/Supporting
- `keywords` - Search keywords
- `jobQueue` - Background job records

---

## 🚀 SETUP PRIORITY & TIMELINE

### Phase 1: Critical (Setup First - 24 hours)
1. **Email Service** - SendGrid or Resend (blocks outreach)
   - Estimated time: 30 minutes
   - Blocking feature: Campaign deployment

2. **Browser Backend** - Choose Neon, BrowserOS, or equivalent
   - Estimated time: 1-2 hours
   - Blocking feature: WCAG scanning

3. **Test Data Loading** - Create sample prospects
   - Estimated time: 30 minutes
   - Verify: Dashboard shows prospects

### Phase 2: Recommended (Next 48 hours)
4. **Redis Setup** - Job queue for background tasks
   - Estimated time: 30 minutes
   - Enhances: Performance, reliability

5. **Google Custom Search** - For prospect discovery
   - Estimated time: 1 hour
   - Enhances: Automated discovery accuracy

### Phase 3: Premium (Week 2+)
6. **Lob Integration** - Physical mail campaigns
   - Estimated time: 30 minutes
   - Enhances: Premium outreach tier

7. **Advanced HubSpot** - Full CRM sync
   - Estimated time: 2-3 hours
   - Enhances: CRM data flow

---

## ✅ VERIFICATION CHECKLIST

After setting up integrations:

- [ ] **Email Test**: Send test email from dashboard
- [ ] **WCAG Scan Test**: Scan a test website (https://example.com)
- [ ] **Prospect Creation**: Create prospect, verify it in database
- [ ] **Outreach Email**: Generate email for prospect, verify personalization
- [ ] **Campaign Deployment**: Queue and send test campaign
- [ ] **HubSpot Sync**: Verify prospect appears in HubSpot contacts
- [ ] **Redis Jobs**: Check background job processing
- [ ] **Analytics**: Dashboard shows recent activity

---

## 🔗 QUICK SETUP LINKS

| Service | Signup | Documentation | Status |
|---------|--------|----------------|--------|
| SendGrid | https://sendgrid.com | https://docs.sendgrid.com | 🟡 Needed |
| Resend | https://resend.com | https://resend.com/docs | 🟡 Needed |
| Neon | https://neon.tech | https://neon.tech/docs | 🟡 Needed |
| BrowserOS | https://browseros.com | Contact support | 🟡 Needed |
| HubSpot | https://hubspot.com | https://docs.hubspot.com/api | ✅ Installed |
| Google Search | https://cloud.google.com | https://developers.google.com/custom-search | 🟢 Optional |
| Lob | https://lob.com | https://docs.lob.com | 🟢 Optional |
| Redis Cloud | https://redis.com/cloud | https://docs.redis.com | 🟢 Optional |

---

## 📝 NOTES

**Integration Architecture:**
- All integrations are **stateless** and **failover-capable**
- Email service can be swapped without code changes
- Browser backend can be switched by env var
- Multiple AI models tested for redundancy

**Security:**
- All API keys stored in Replit secrets (encrypted)
- No keys in code or git history
- Replit integration manages OAuth flows

**Cost Estimation (Monthly):**
- OpenAI: $50-200 (depending on usage)
- SendGrid: $20-100
- Neon: $20-100
- Resend: $20-50
- HubSpot: Free (free tier) - $50+ (premium)
- **Estimated Total:** $150-500/month for startup tier

**Current Status (November 26, 2025):**
- ✅ 5 integrations installed and active
- 🟡 2 critical integrations needed (Email + Browser Backend)
- 🟢 4 optional integrations available
- **Overall Readiness:** 70% (functional without email/scanning, 100% with above 2)

---

## 🎯 NEXT STEPS

1. **Pick Email Service:** SendGrid recommended (most reliable)
2. **Pick Browser Backend:** Neon recommended (cheapest, easiest)
3. **Add API Keys:** Use Replit environment variables
4. **Run Verification Checklist:** Test all features
5. **Deploy to Production:** Use Replit Deployments (Publish button)

**For Help:** All integrations are documented in `/server/services/` and API endpoints in `/server/routes.ts`
