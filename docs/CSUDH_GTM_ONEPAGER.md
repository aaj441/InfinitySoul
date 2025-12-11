# CSUDH Campus Early-Warning Pilot: Go-to-Market Strategy

## One-Page Executive Summary

**Problem:** CSUDH loses 15-20% of students to mental health crises, burnout, and isolation each year—often 4-6 months before campus systems detect it.

**Solution:** InfinitySoul's **Soul Fingerprint** early-warning engine + opt-in campus pilot = non-invasive, support-first behavioral signal system.

**Outcome (Year 1):** Identify 100+ at-risk students 4-6 months early; route counseling/advising support; document 5-10% improvement in retention (proving foundation for CSU system scale-up).

**GTM Timeline:** 12 weeks (Phase 1: Build consent + data agreements; Phase 2: Pilot launch; Phase 3: Outcomes measurement + publication)

**Revenue:** $75K/year pilot fee (CSUDH) + future licensing to CSU system ($500K+/year across 23 campuses)

---

## Phase 1: Foundation & Stakeholder Alignment (Weeks 1-4)

### Week 1: Stakeholder Interviews & Consent Design

**Key players:**
- **Counseling & Psychological Services** (CAPS): Early warning use case validation
- **Student Affairs/Success**: Advising integration, at-risk student protocols
- **Institutional Research**: Data governance, FERPA compliance
- **Disability Services**: Accessibility needs, universal design
- **Faculty advisor** (Behavioral Science/Psychology): Academic credibility

**Deliverables:**
- [ ] Consent form (IRB-ready; Right to Know, Right to Delete, Opt-Out)
- [ ] Data governance agreement (who accesses what, retention policy, de-identification)
- [ ] Pilot cohort definition (3-4 classes / ~400-500 students, representative of campus)

**Meetings needed:**
- CAPS director: 30 min (early warning validation)
- Student Affairs VP: 30 min (advising protocol integration)
- Institutional Research: 60 min (FERPA, data handling)
- Faculty advisor: 30 min (research framing, publication plan)

**Outcome:** Signed agreements; confirmed cohort size; launch date set.

---

### Week 2-3: Technical Setup & Integration

**Infrastructure:**
- [ ] Last.fm API keys provisioned (student credentials only; CSUDH doesn't see individual tokens)
- [ ] PostgreSQL database for anonymized cohort data (on-campus or CSUDH-approved cloud)
- [ ] Weekly reporting dashboard (visible to CAPS, Student Affairs only; no individual IDs)
- [ ] Secure API gateway (HTTPS, rate-limiting, audit logs)

**Data Privacy Safeguards:**
- [ ] Student data hashed (SHA-256) for internal references
- [ ] No raw listening data stored; only aggregated risk factors (Volatility, Resilience, Engagement, Impulsivity indices)
- [ ] All research outputs de-identified (gender/race/class aggregated at cohort level)
- [ ] Automatic data retention purge (delete after 3 years or upon graduation/opt-out)

**Deliverables:**
- [ ] Integration documentation (how students authorize data sharing)
- [ ] Weekly dashboard mockup (sample report with anonymized data)
- [ ] Data governance runbook (retention policy, access logs, deletion procedures)

**Outcome:** Production-ready infrastructure; ready for student onboarding.

---

### Week 4: Pilot Cohort Recruitment & Informed Consent

**Recruitment channels:**
- Faculty-led in-class sign-ups (Behavioral Science, Psychology, Education courses)
- Student Affairs wellness events
- Email outreach to first-year cohort (optional; highest early-warning value)

**Enrollment process:**
1. Information session: 15-min video explaining Soul Fingerprint, data privacy, how results are used
2. Consent form: Digital signature (DocuSign)
3. Last.fm/Spotify authorization: Students grant read-only access to 21-year history
4. Baseline survey: Demographics (self-identified; optional), current stressors, counseling access

**Success target:** 400-500 students enrolled by Week 4 end.

**Outcome:** Pilot cohort live; data ingestion begins; Week 1-2 baseline risk profiles generated.

---

## Phase 2: Pilot Execution & Monitoring (Weeks 5-10)

### Week 5-8: Weekly Reporting Cycle

**Every Monday morning:**

1. **Ingest:** Pull Last.fm/Spotify data for past 7 days
2. **Calculate:** Volatility, Resilience, Engagement, Impulsivity indices for each student
3. **Aggregate:** Cohort-level bands + demographic breakdowns
4. **Alert:** Flag students with 🚨 high-risk patterns (high volatility + low resilience + social withdrawal)

**Sample weekly alert (for CAPS director only):**
```
CSUDH Soul Fingerprint Weekly Report - Week of Oct 21, 2024

COHORT SUMMARY:
• Total enrolled: 456 students
• Data quality: 92% have 21+ years history; 8% <1 year (excluded from individual scoring)
• Volatility trend: +8 pts (elevated; expected pre-midterms)
• Resilience trend: -5 pts (slight decline; monitor)
• Engagement stability: Stable

🚨 HIGH-RISK ALERTS (recommend outreach):
[ANONYMIZED - shown to CAPS only]
• 17 students with COMBINED HIGH-RISK PATTERN:
  - Volatility 75+ (emotional instability)
  - Resilience <40 (poor post-stress recovery)
  - Engagement stability <50 (social withdrawal)
  - Impulsivity band 20-30 (impulse control concern)

RECOMMENDED OUTREACH (low-touch):
→ Counseling: Proactive check-in outreach (email + phone; may mention "early warning wellness initiative")
→ Advising: Offer coffee chat about balancing courseload
→ Student Affairs: Invite to low-pressure social events (not mentioning data)

DEMOGRAPHIC BREAKDOWN (equity audit):
✅ No disparities detected; risk patterns distributed proportionally across race, gender, first-gen status
✅ Disability services students slightly over-represented in high-engagement group (positive signal: community participation)
```

**Counselor workflow integration:**
- CAPS receives anonymized flag list (student ID codes only; CAPS staff match to names in internal system)
- CAPS initiates **standard outreach protocol** (not revealing data source)
  - Example: "We noticed you haven't visited counseling in a while; here's a reminder we're here"
  - NOT: "Your music data shows you're at risk"
- CAPS logs outcomes: Did student respond? Attend session? (For impact measurement)

### Week 6: Mid-Pilot Check-in

**Stakeholder debrief:**
- CAPS: How many alerts turning into actual counseling sessions? (Target: 30-40% conversion)
- Student Affairs: Enrollment in suggested programs? Advising follow-up rate?
- Institutional Research: Data quality holding? Privacy concerns?
- Faculty advisor: Publication timeline for Year 1 results?

**Adjustments:**
- If alerts are too noisy (high false positive): Adjust thresholds
- If alerts are too conservative (missing true risks): Increase sensitivity
- If privacy concerns arising: Add additional de-identification layers

**Outcome:** Course-correct if needed; solidify reporting cadence.

### Week 7-10: Continue Weekly Reports + Qualitative Follow-up

**Parallel track:** Conduct 20-30 confidential student interviews (opt-in, compensated)

**Interview script:**
- Did you notice the wellness initiative outreach?
- Was it helpful? Stigmatizing? Ignored?
- Would you recommend it to friends?
- Any privacy concerns?
- Data to collect: Whether student disclosed to others, perceived stigma, trust in campus

---

## Phase 3: Outcomes Measurement & Publication (Weeks 11-12)

### Week 11: Data Analysis & Report Generation

**Metrics:**
1. **Accuracy:** Of 17 weekly alerts, how many matched CAPS outcomes? (Target: >60% precision)
2. **Reach:** % of flagged students who engaged with support services
3. **Impact:** Retention rate of pilot cohort vs. control cohort (if available)
4. **Equity:** Were outcomes proportional across demographics?

**Data:** Anonymized outcomes linked to CAPS (students matched by ID code)

**Sample findings:**
```
YEAR 1 OUTCOMES: CSUDH Soul Fingerprint Pilot

Primary Outcome:
✅ 67% of students flagged with combined high-risk pattern (volatility 75+, resilience <40) 
   sought counseling support within 4 weeks of alert
✅ Control cohort (no alert): 23% sought counseling in same 4-week period
✅ Difference: 44 percentage point increase in counseling engagement

Secondary Outcomes:
✅ Retention: Pilot cohort = 94%; university baseline = 86% (8-point improvement)
   → Caveat: Other interventions happening simultaneously; not purely attributable to alerts
   
⚠️ Demographic parity: Black students over-represented in high-volatility group by 8%
   → Action taken: Adjusted algorithm thresholds for resilience factor (music-specific recovery patterns vary by cultural context)
   
⚠️ Engagement timing: Alerts sent Monday; best response rate Tuesday-Wednesday (pilot showed 56% vs 34% Monday)
   → Action for Year 2: Adjust send time to optimize response

Limitations:
• Small cohort (456 students); cannot generalize to all CSU campuses without validation
• Hawthorne effect: students knowing they're monitored may change listening patterns
• Confounding: campus also launched new mental health awareness campaign same semester
```

### Week 12: Publication & CSU System Pitch

**Academic publication (target: JEEPAL, *Journal of Educational Evaluation and Policy Analysis*):**
- Methods: Soul Fingerprint algorithm, consent protocol, risk thresholds
- Results: Retention outcomes, CAPS engagement metrics, equity analysis
- Discussion: Implications for universal behavioral early warning; ethical constraints; future research needs

**CSU System pitch deck (to Chancellor's office + 10 campus presidents):**

```
INFINITYSOUL CSUDH PILOT: YEAR 1 RESULTS

Problem:
→ CSU system loses 12-15% enrollment annually to mental health crises
→ Cost: $50M+ per year in lost FTE funding across 23 campuses

Solution Proven:
→ CSUDH pilot (456 students): 8-point retention improvement
→ 67% of high-risk students accepted support when proactively contacted
→ 0 privacy complaints; 0 stigma concerns in post-pilot surveys

Scaling Opportunity:
→ Roll out to 5-10 additional CSU campuses (Year 2)
→ Shared data infrastructure (Statewide Analytics Hub)
→ Estimated cost: $75K pilot → $500K/year at scale across 23 campuses
→ Estimated ROI: Each 1% retention improvement = $5M system-wide revenue recovery

Timeline:
→ Q1 2025: CSUDH Year 2 expansion + 2 new campus pilots
→ Q2 2025: Publication of Year 1 outcomes
→ Q3 2025: CSU System-wide rollout decision
```

**Outcome:** Peer-reviewed publication; CSU system contract signed for Year 2 expansion.

---

## Revenue & Scaling Model

### Year 1: CSUDH Pilot
- **Fee structure:** Fixed $75K/year (covers platform, weekly reporting, 1 FTE support)
- **Duration:** 12 months (Sept 2024 – Aug 2025)
- **Renewal option:** Automatic renewal unless either party opts out 60 days prior

### Year 2-3: CSU System Expansion
- **Model:** Hub-and-spoke (CSUDH = regional hub; 5-10 campus satellites share infrastructure)
- **Fee per campus:** $50K/year (bulk discount for shared platform)
- **System coordination:** $100K/year (statewide data governance, ethics review, publication)
- **Total Year 2 revenue:** ($50K × 7 campuses) + $100K = $450K

### Year 4+: Full CSU System (All 23 Campuses)
- **Fee per campus:** $40K/year (maximum scale efficiency)
- **System coordination:** $150K/year (expanded research infrastructure, fairness auditing)
- **Total Year 4 revenue:** ($40K × 23) + $150K = **$1.07M/year**

### Adjacent Revenue (Medium-Term)
1. **Disability Services licensing:** Per-campus accessibility auditing ($25K/campus/year)
2. **Faculty research partnerships:** Licensing algorithm for education research ($20-50K/grant)
3. **Student wellness app:** White-label Soul Fingerprint to other university systems ($10K/month SaaS)

---

## Critical Success Factors

### 1. Institutional Trust
- [ ] Faculty advisor as scientific credibility anchor (published researcher, CSUDH-affiliated)
- [ ] IRB expedited review (low-risk, opt-in, consent-based)
- [ ] Monthly stakeholder briefings (transparency, course-correct as needed)

### 2. Data Privacy & Transparency
- [ ] No individual-level data stored; only aggregated risk indices
- [ ] Students can request/delete their data anytime
- [ ] Annual independent audit (external researcher validates fairness)
- [ ] Published data governance documentation (open-source template for other universities)

### 3. Support-First Framing
- [ ] All outreach routed through existing campus systems (CAPS, advising)
- [ ] Never use term "risk score" with students—use "wellness check"
- [ ] Proactive communication: "We noticed patterns; here's support" (not "You're at risk")
- [ ] Emphasize: Music data is **signal of existing struggle**, not predictor of future behavior

### 4. Equitable Algorithm Design
- [ ] Monthly demographic parity analysis (any group over/under-flagged?)
- [ ] Fairness validation: Are high-risk patterns correlated with immutable characteristics? (If yes: drop that feature)
- [ ] Document all threshold decisions (why volatility >75 = high-risk? Evidence-based or arbitrary?)
- [ ] External fairness audit (annual, published)

### 5. Meaningful Outcomes
- [ ] Clear success metrics defined upfront (retention? counseling engagement? student satisfaction?)
- [ ] Baseline collected (What's counseling engagement rate pre-pilot?)
- [ ] Control cohort if possible (comparison campus, or historical data)
- [ ] Publish results (even if negative) → builds credibility for CSU system scale-up

---

## Pilot Steering Committee

**Role assignment:**
| Role | Name | Affiliation | Responsibility |
|------|------|-------------|---|
| **Executive Sponsor** | (VP Student Affairs/CSUDH) | CSUDH | Remove blockers, secure resources |
| **Scientific Lead** | (Behavioral Science faculty) | CSUDH | IRB liaison, publication lead, credibility anchor |
| **Data Lead** | (Institutional Research) | CSUDH | Data governance, privacy compliance, audit trails |
| **Ops Lead** | (CAPS Director) | CSUDH | Weekly report review, counselor workflow integration |
| **Product Lead** | (InfinitySoul CTO) | InfinitySoul | Platform reliability, data pipeline, weekly reporting |
| **Communications** | (Student Affairs comms) | CSUDH | Student recruitment, informed consent, marketing |

**Meeting cadence:**
- Weekly (Weeks 1-10): 30-min sync on data quality, alerts, adjustments
- Bi-weekly (Weeks 11-12): Deep-dive on outcomes, publication draft review

---

## Risk Mitigations

| Risk | Mitigation |
|------|-----------|
| **Students uninterested in opt-in** | Pre-pilot messaging: "Help us understand early-warning for mental health" (pro-social framing) |
| **CAPS overwhelmed by alerts** | Start conservative with thresholds; gradually increase sensitivity as CAPS confident in tool |
| **Algorithm over-flags minority students** | Monthly fairness audits; immediate feature removal if disparities detected |
| **Privacy breach / data leak** | On-premise data storage; no third-party cloud; encrypted backups; annual security audit |
| **Publication blocked by CSUDH** | Data governance agreement guarantees 90-day publication review (not indefinite suppression) |
| **No measurable impact on retention** | Still publishable as "negative result"; repositions tool as research instrument, not magic bullet |

---

## Next Steps (Start This Week)

1. **Schedule stakeholder interviews** (Week 1) – confirm exec sponsor, faculty advisor, CAPS director
2. **Draft consent form** (Week 1-2) – IRB-ready template from CSUDH legal
3. **Provision technical infrastructure** (Week 2-3) – database, API keys, dashboard mockup
4. **Recruit pilot cohort** (Week 4) – target 400-500 students
5. **Launch reporting cycle** (Week 5) – begin weekly alerts to CAPS

**Timeline to first outcomes:** 12 weeks to CSU system pitch deck + peer-reviewed publication.

**Contact:** InfinitySoul GTM Lead | CSUDH Partnership Manager

*Prepared: Dec 2024 | Target launch: Jan 2025 | Year 1 close: Dec 2025*
