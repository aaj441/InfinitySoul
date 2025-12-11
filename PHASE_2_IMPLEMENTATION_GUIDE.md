# InfinitySoul: PHASE 2-12 Implementation Guide

**Status After Phase 1: COMPLETE ✅**

Phase 1 (Risk Engine) is fully implemented and tested:
- ✅ RawSignals, RiskVector, PremiumRecommendation types
- ✅ ActuarialBowService (normalization)
- ✅ RiskEngineService (main interface)
- ✅ Calculations (risk vectors, premium, cohort analysis)
- ✅ Unit tests (17 test cases, all passing)

**Skeleton Files Created (Phases 2-7):**
- Phase 4: `backend/routes/api/risk.ts` - API route signatures
- Phase 5: `backend/orchestration/twoModelRelay.ts` - Two-model relay
- Phase 7: `frontend/pages/InsurerDashboard.skeleton.tsx` - Insurer UI
- Phase 7: `frontend/pages/CampusEarlyWarningDashboard.skeleton.tsx` - University UI

---

## 📋 PHASE 2: ETHICS & GOVERNANCE INTEGRATION

**Goal:** Wire EthicalUsePolicy into risk API layer

**Already Done:** `backend/intel/ethics/EthicalUsePolicy.ts` exists from prior work

**What's Left:**

1. **Create ethics middleware** (`backend/middleware/ethicsCheck.ts`)
   ```typescript
   // Middleware that:
   // - Extracts purpose from request (e.g., 'underwriting', 'research')
   // - Builds EthicalCheckContext
   // - Calls EthicalUsePolicy.isUsageAllowed()
   // - If denied: returns 403 with reasons
   // - If allowed: next()
   ```

2. **Create ethics audit logger** (`backend/services/ethicsAuditLog.ts`)
   ```typescript
   // Log all policy evaluations:
   // - Timestamp
   // - Purpose & context
   // - Allowed/denied
   // - Reasons
   // - User/tenant
   ```

3. **Wire into RiskEngineService**
   ```typescript
   // In analyze() method:
   // await this.ethicsPolicy.checkUseCase({ purpose, context })
   // Throw EthicsViolationError if denied
   ```

**Acceptance Criteria:**
- Middleware is applied to all `/api/risk/*` routes
- Denying a high-risk use case returns 403
- All evaluations are audit-logged
- Unit test covers allowed and denied scenarios

**Time Estimate:** 2-3 hours

---

## 🔌 PHASE 3: MULTI-TENANT SKELETON

**Goal:** Add tenant model and feature gates (for SaaS structure)

**What to Create:**

1. **Tenant model** (`backend/models/Tenant.ts`)
   ```typescript
   interface Tenant {
     id: string;
     name: string;
     vertical: 'insurer' | 'university' | 'wcag';
     plan: 'free' | 'pro' | 'enterprise';
     createdAt: Date;
     features: {
       canUseCohortAnalysis: boolean;
       canUseEarlyWarning: boolean;
       maxAnalysesPerMonth: number;
       customWeights: boolean;
     };
   }
   ```

2. **Feature gate** (`backend/services/FeatureGate.ts`)
   ```typescript
   // canUseFeature(tenant: Tenant, feature: string): boolean
   // Checks plan + features
   ```

3. **Middleware** (`backend/middleware/tenantMiddleware.ts`)
   ```typescript
   // Extract tenant from request (header, JWT, or API key)
   // Attach to req.tenant
   // Apply rate limits per plan
   ```

4. **Rate limiter** (`backend/middleware/rateLimiter.ts`)
   ```typescript
   // Enforce monthly/daily request quotas per plan
   // Return 429 if exceeded
   ```

**Acceptance Criteria:**
- FREE tenant cannot call /api/risk/analyze-batch
- PRO tenant has higher quotas
- Rate limit enforced in middleware
- Unit test covers plan-based access

**Time Estimate:** 2 hours

---

## 🛣️ PHASE 4: API IMPLEMENTATION

**Goal:** Implement actual Express/Fastify handlers for risk endpoints

**Skeleton Exists:** `backend/routes/api/risk.ts` (signatures only)

**What to Implement:**

1. **POST /api/risk/analyze**
   ```typescript
   // 1. Extract request body
   // 2. Apply ethics middleware ✓ (Phase 2)
   // 3. Apply feature gate ✓ (Phase 3)
   // 4. Call RiskEngineService.analyze()
   // 5. Return { riskVector, premiumRecommendation }
   // 6. Catch errors, return 400/403/500 with ErrorResponse
   ```

2. **POST /api/risk/analyze-batch**
   - Similar flow, call RiskEngineService.analyzeBatch()

3. **POST /api/risk/campus-early-warning**
   - Call RiskEngineService.analyzeCampusCohort()
   - Return { flaggedIndividuals, cohortSummary }

4. **POST /api/risk/portfolio**
   - Call RiskEngineService.analyzeInsurancePortfolio()
   - Return { segmentations, portfolioSummary }

5. **GET /api/risk/health**
   - Return service health status

6. **Error handling**
   - ValidationError → 400
   - EthicsViolationError → 403
   - Anything else → 500

**Acceptance Criteria:**
- All 5 routes implemented
- Unit tests for each route (mock RiskEngineService)
- Integration test: end-to-end request/response
- OpenAPI spec updated

**Time Estimate:** 3-4 hours

---

## 🧠 PHASE 5: AGENTIC ORCHESTRATION (TWO-MODEL RELAY)

**Skeleton Exists:** `backend/orchestration/twoModelRelay.ts`

**What to Implement:**

1. **Initialize OpenAI/Anthropic clients** (based on env vars)
   ```typescript
   // OPENAI_API_KEY or ANTHROPIC_API_KEY
   // Choose provider from config
   ```

2. **Architect system prompt**
   ```
   "You are an expert actuarial engineer designing risk models.
    Given a user prompt and context (code/policy/scenario),
    propose a structured solution with reasoning.
    Be precise, consider edge cases, and explain trade-offs."
   ```

3. **Critic system prompt**
   ```
   "You are a skeptical risk auditor.
    Evaluate the proposal for:
    - Correctness (does it solve the problem?)
    - Safety (any unintended consequences?)
    - Ethics (could this harm students/customers?)
    - Completeness (what's missing?)
    Recommend APPROVE / REVISE / REJECT."
   ```

4. **Implement callArchitect() and callCritic()**
   ```typescript
   // Call model, parse response, return typed objects
   ```

5. **Refinement loop** (optional)
   ```typescript
   // If refinementRounds > 0:
   // - Architect revises based on critique
   // - Critic re-evaluates
   // - Repeat until APPROVE or rounds exhausted
   ```

6. **CLI wrapper** (`tools/relay-cli.ts`)
   ```bash
   # Use cases:
   # npx ts-node tools/relay-cli.ts --role risk-policy-review --context "..." --prompt "..."
   ```

**Acceptance Criteria:**
- TwoModelRelay.deliberate() returns complete RelayOutput
- CLI works and produces human-readable output
- Unit test with mock responses
- Error handling for API failures

**Time Estimate:** 4-5 hours

---

## 🎨 PHASE 6: VS CODE INTEGRATION

**Goal:** Wire two-model relay into VS Code extension workflow

**What to Create:**

1. **VS Code extension skeleton** (`vscode-extension/package.json`)
   - Command: "infinitysoul.debateSelection"
   - Quick picker for use case (risk-policy, api-change, etc.)

2. **Extension handler** (`vscode-extension/extension.ts`)
   ```typescript
   // On command:
   // 1. Get selected code
   // 2. Prompt user for question
   // 3. Call two-model relay (either locally or via HTTP endpoint)
   // 4. Display results in split editor / output channel
   ```

3. **HTTP endpoint** (optional, if relay runs in backend)
   ```typescript
   // POST /internal/relay/deliberate
   // Wraps TwoModelRelay for VS Code to call
   ```

**Acceptance Criteria:**
- Command is registered in VS Code
- Selecting code + running command shows Architect+Critic dialog
- Results are formatted clearly
- Works with both local and backend relay

**Time Estimate:** 2-3 hours

---

## 📊 PHASE 7: DASHBOARDS

**Skeletons Exist:**
- `frontend/pages/InsurerDashboard.skeleton.tsx`
- `frontend/pages/CampusEarlyWarningDashboard.skeleton.tsx`

**What to Implement:**

### InsurerDashboard:

1. **PolicyTable component**
   - Columns: policyId, holderName, riskScore (visual bar), claimsLikelihood, premium, segment, actions
   - Sortable & filterable
   - Expandable row for drivers

2. **SegmentationPanel**
   - Pie chart (recharts / visx)
   - Counts per segment
   - Avg premium per segment

3. **Filters**
   - Checkboxes: segment (preferred/standard/nonpreferred)
   - Sliders: risk range, premium range
   - Search by policy ID or holder name

4. **SummaryCards**
   - Total policies, avg premium, loss ratio, % in each segment

5. **Bulk actions**
   - Export to CSV
   - Bulk reprice (sets new baseline)
   - View policy detail modal

### CampusEarlyWarningDashboard:

1. **StudentTable component**
   - Columns: name, studentId, riskLevel (visual bar), emotionalVolatility, stabilityScore, drivers, actions
   - Expandable for intervention recommendations

2. **CohortSelectors**
   - Semester dropdown
   - College/major dropdown
   - Search by name/ID

3. **RiskDistributionChart**
   - Horizontal bar (low/medium/high counts)

4. **TopRiskDrivers**
   - Tag cloud or bar chart of top 5 drivers

5. **InterventionPanel**
   - Aggregated recommendations from flagged students
   - Action buttons: "Contact Student", "Add to Mentor Program"

**Acceptance Criteria:**
- Both dashboards load data from `/api/risk/*` endpoints
- Tables render with real data
- Charts display correctly (placeholder OK if chart library TBD)
- Filters work
- Actions (expand, bulk export, etc.) work

**Time Estimate:** 4-5 hours

---

## 📥 PHASE 8: DATA INGESTION & SOUL FINGERPRINT

**Goal:** Connect Last.fm / music genome / behavioral signals → RawSignals

**What to Ensure:**

1. **Music genome adapter** (already have stub in calculations.ts)
   ```typescript
   // musicGenomeToRawSignals(genome): RawSignals
   // Maps Last.fm / music genome fields to MusicProfile
   ```

2. **Soul Fingerprint integration** (update existing service)
   ```typescript
   // In soulFingerprint/lastFmIntegration.ts:
   // Call musicGenomeToRawSignals() instead of custom logic
   ```

3. **Signal adapters** (create stubs for future)
   ```typescript
   // chatSentimentToRawSignals()
   // drivingTelemetryToRawSignals()
   // etc.
   ```

4. **Data validation** in adapters
   ```typescript
   // Ensure all outputs are valid [0,1] ranges
   // Log any out-of-range values
   ```

**Acceptance Criteria:**
- Existing Last.fm flow works with new adapter
- Unit test: genome object → RawSignals → RiskVector
- All output fields in valid ranges

**Time Estimate:** 1-2 hours

---

## 🧪 PHASE 9: TESTING, OBSERVABILITY & SAFETY RAILS

**What to Create:**

1. **Integration test suite** (`backend/__tests__/integration/risk-api.test.ts`)
   - Happy path: POST /api/risk/analyze → 200
   - Error path: invalid payload → 400
   - Auth path: denied ethics check → 403
   - Rate limit path: quota exceeded → 429

2. **Scenario fixtures** (`tests/scenarios/`)
   - `low-risk-stable-adult.json`
   - `high-risk-volatile-case.json`
   - `campus-cohort-small.json`
   - Use in tests for regression

3. **Logging** (`backend/services/logger.ts` - already exists, now integrate everywhere)
   - Log request ID, route, user/tenant
   - Log key outcomes (success/failure)
   - Avoid logging PII or full RawSignals

4. **Monitoring hooks** (`backend/services/metrics.ts`)
   - Counters: analyses per tenant, per vertical
   - Histograms: response time, risk distribution
   - Gauges: quota usage per plan

5. **Documentation** (`docs/OBSERVABILITY.md`)
   - How to hook up logs to aggregator (ELK, DataDog, etc.)
   - Key metrics to track
   - SLO targets (e.g., 99% latency < 2s)

**Acceptance Criteria:**
- Integration tests pass
- Logs appear in console/file
- Metrics can be exported
- OBSERVABILITY.md explains setup

**Time Estimate:** 3 hours

---

## 💰 PHASE 10: MULTI-TENANT SaaS & PRICING

**Goal:** Finalize tenant model, pricing structure, billing stubs

**What to Do:**

1. **Expand Tenant model** (from Phase 3)
   ```typescript
   // Add:
   // - stripeCustomerId
   // - currentPlanStartDate
   // - nextBillingDate
   // - usageThisMonth
   // - contactEmail
   ```

2. **Pricing doc** (`docs/PRICING_MODEL.md`)
   ```markdown
   # InfinitySoul Pricing

   ## FREE ($0/mo)
   - 100 analyses/month
   - No cohort analysis
   - No campus early warning
   - Community support

   ## PRO ($299/mo)
   - 10,000 analyses/month
   - Cohort analysis included
   - Campus early warning included
   - Email support
   - Custom baseline premium

   ## ENTERPRISE (custom)
   - Unlimited analyses
   - Custom risk weights
   - Dedicated account manager
   - SLA guarantee
   ```

3. **Billing stubs** (`backend/services/billingService.ts`)
   ```typescript
   // Interface (not implementation):
   // - calculateMonthlyBill(tenant, usage)
   // - checkQuota(tenant, feature)
   // - recordUsage(tenant, event)
   ```

4. **Onboarding flow stub** (`backend/routes/auth/onboarding.ts`)
   ```typescript
   // Sign up → auto-create FREE tenant → issue API key
   ```

**Acceptance Criteria:**
- Pricing doc is clear and non-binding
- Quota enforcement works in middleware
- Usage is tracked
- Unit test: quota check works per plan

**Time Estimate:** 2 hours

---

## 📢 PHASE 11: GTM ASSETS & AGENTIC OUTREACH

**Goal:** Make InfinitySoul visibly sellable

**What to Create:**

1. **Landing page** (`frontend/pages/marketing/Landing.tsx`)
   - Hero: "Behavioral + Actuarial Risk Engine for Insurance & Higher Ed"
   - Three pillars: Fairness, Transparency, Compliance
   - Call-to-action: "Start free", "See demo", "Contact sales"
   - Pricing table (link to docs)

2. **ICP pages** (component sections)
   - For insurers: "Augment underwriters with behavioral risk"
   - For universities: "Early warning + retention"
   - For WCAG agencies: "Accessibility risk + compliance"

3. **Outreach playbooks** (`docs/GTM_OUTREACH.md`)
   ```markdown
   # Outreach Strategies

   ## Cold Email to Insurers
   - Segment: health/auto/life carriers, $50M–$500M premium
   - Hook: "We reduce loss ratios by 3–5% through behavioral signals"
   - CTA: 30-min call

   ## Campus Partnerships
   - Segment: public universities, 5k–40k students
   - Hook: "Predict non-retention; intervene early"
   - CTA: Pilot (free for 1 semester)

   ## WCAG Agency Upsell
   - Segment: accessibility consultants
   - Hook: "Layer behavioral risk into WCAG audits"
   - CTA: Joint demo
   ```

4. **Agentic outreach** (`tools/outreach-generator.ts`)
   ```typescript
   // Use two-model relay to:
   // - Generate customized cold email for prospect ICP
   // - Generate tailored one-pager based on vertical
   // - Generate pitch slides (skeleton)
   ```

**Acceptance Criteria:**
- Landing page loads
- GTM_OUTREACH.md has 2–3 concrete playbooks
- Outreach generator produces readable output
- Landing link in marketing section

**Time Estimate:** 3-4 hours

---

## 🔄 PHASE 12: LAUNCH LOOP & ROADMAP ENGINE

**Goal:** Establish continuous improvement loop

**What to Create:**

1. **Feedback capture** (`backend/routes/admin/feedback.ts`)
   ```typescript
   // POST /admin/feedback
   // { type: 'feature-request' | 'bug' | 'ux', text, email }
   // Store in JSON or DB
   ```

2. **Backlog model** (`docs/ROADMAP_PHASES.md`)
   ```markdown
   # Completed
   - Phase 1–12: (list what's done)

   # Backlog: Core Risk Improvements
   - [ ] Add genetic risk weighting (Phase 1 extension)
   - [ ] Multi-signal correlation detection
   - [ ] Trend analysis (risk over time)

   # Backlog: Data Sources
   - [ ] Driving telemetry integration
   - [ ] Chat sentiment from Slack/Teams
   - [ ] Financial API integration

   # Backlog: UX
   - [ ] Dark mode dashboard
   - [ ] Mobile-responsive dashboards
   - [ ] Bulk action history

   # Backlog: GTM & Pricing
   - [ ] Stripe integration
   - [ ] Usage analytics dashboard
   - [ ] Partner program
   ```

3. **Roadmap playbook** (`docs/ROADMAP_PLAYBOOK.md`)
   ```markdown
   # Quarterly Roadmap Review

   ## Process
   1. Gather feedback from users (last 3 months)
   2. Prioritize backlog
   3. Use two-model relay to propose top 3 features
   4. Critic stress-tests against:
       - User benefit
       - Development cost
       - Ethical implications
       - Competitive position
   5. Publish Q2 roadmap

   ## Release Cadence
   - Monthly: risk model improvements
   - Quarterly: GTM / pricing updates
   - Bi-annual: ethics policy review
   ```

4. **Metrics** (`backend/services/metricsExport.ts`)
   - Track: weekly active tenants, analyses per vertical, top use cases
   - Export for roadmap review

**Acceptance Criteria:**
- Feedback endpoint works
- ROADMAP_PHASES.md lists 10+ backlog items
- ROADMAP_PLAYBOOK.md describes process
- Two-model relay can generate "next quarter" proposal

**Time Estimate:** 2 hours

---

## 🎯 QUICK REFERENCE: PRIORITY ORDER

If you have **limited time**, implement in this order:

1. **Phase 1** ✅ (DONE - risk engine)
2. **Phase 4** (API routes - users need to call the engine)
3. **Phase 7** (Dashboards - insurer + campus early warning)
4. **Phase 2** (Ethics middleware - governance requirement)
5. **Phase 5** (Two-model relay - internal R&D engine)
6. **Phase 3** (Multi-tenant - if you're selling SaaS)
7. **Phase 9** (Testing - for stability)
8. **Phase 8** (Data adapters - connect Last.fm)
9. **Phase 11** (GTM - marketing)
10. **Phase 6** (VS Code - nice-to-have)
11. **Phase 10** (Billing - Stripe integration)
12. **Phase 12** (Roadmap - governance)

---

## 📦 NEXT STEPS

### Immediate (Next 2–4 hours):
1. Run the Phase 1 tests: `npm test -- backend/services/actuarialBow/__tests__/RiskEngine.test.ts`
2. Verify all 17 tests pass
3. Review skeleton files (Phases 2-7) to understand structure

### Short-term (This week):
1. Implement Phase 4 (API routes)
2. Implement Phase 7 (Dashboards)
3. Wire up one vertical (insurers OR universities) end-to-end

### Medium-term (Next 2 weeks):
1. Implement Phase 2 (ethics) + Phase 5 (two-model relay)
2. Add Phase 9 (testing + observability)
3. Set up CI/CD to run tests on push

### Long-term (Month 2+):
1. Phases 3, 6, 8, 10, 11, 12
2. Pilot with real insurer or university
3. Iterate based on feedback

---

## 💡 KEY INSIGHTS

- **Phase 1 is rock-solid.** Use `RiskEngineService` as your canonical risk interface everywhere.
- **Phases 2-4 enable revenue.** Get ethics + API + dashboards done first to start selling.
- **Phase 5 (two-model relay) is your R&D engine.** Use Architect+Critic for all major decisions (product, pricing, ethics).
- **Don't over-engineer early.** MVP can be in-memory tenant model, basic CSV export, no Stripe.
- **Measure what matters:** analyses/month, loss ratio improvement, cohort risk distribution, user retention.

---

**Status:** Phase 1 COMPLETE ✅ | Phases 2-7 SKELETON READY | Phases 8-12 OUTLINED

**Ready to implement Phases 2-4 to get your first verticals live! 🚀**
