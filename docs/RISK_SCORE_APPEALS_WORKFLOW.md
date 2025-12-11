# Risk Score Appeals & Correction Workflow

**Purpose:** Provide transparent, fair process for individuals to challenge, correct, and repair their risk scores in alignment with NAIC AI principles and consumer protection requirements.

**Status:** Active | Version 1.0 | December 2024

---

## 1. Consumer Rights Summary

Every individual whose data is processed by InfinitySoul has the right to:

1. **Understand** – Receive clear explanation of risk score and contributing factors
2. **Challenge** – Appeal risk score if believed incorrect or unfair
3. **Correct** – Update underlying data if inaccurate
4. **Repair** – Receive guidance on actions to improve risk profile over time
5. **Escalate** – Request human review of automated decisions

These rights are embedded in InfinitySoul's platform and enforced through this workflow.

---

## 2. Appeal Types

### 2.1 Data Accuracy Appeal

**Trigger:** User believes underlying data is incorrect (wrong music account, incorrect engagement data, etc.)

**Example:**
> "My risk score says I have high listening volatility, but that's because the system linked my roommate's Last.fm account instead of mine."

**Resolution:** Verify data source, correct linkage, re-run score

---

### 2.2 Fairness Appeal

**Trigger:** User believes risk score reflects discriminatory bias or proxy discrimination

**Example:**
> "I'm being flagged as high-risk because I listen to rap music, which feels like racial profiling."

**Resolution:** Fairness audit on user's demographic cohort, investigate if genre (excluded feature) leaked into model, remediate if bias confirmed

---

### 2.3 Context Appeal

**Trigger:** User believes score doesn't account for legitimate context or extenuating circumstances

**Example:**
> "My engagement dropped last semester because I was hospitalized, not because of mental health issues."

**Resolution:** Human review, adjust score or add context flag, route to support resources (not penalty)

---

### 2.4 Repair Pathway Request

**Trigger:** User wants clear guidance on improving risk score

**Example:**
> "My score is 'elevated risk.' What actions can I take to move to 'moderate' or 'low'?"

**Resolution:** Generate personalized repair plan, track progress over time, adjust score as improvements demonstrated

---

## 3. Appeal Submission Channels

Users can submit appeals via:

### 3.1 Self-Service Dashboard
- Log in to InfinitySoul portal
- Navigate to "My Risk Score" → "Appeal or Correct"
- Select appeal type, provide details, attach evidence (optional)
- Submit

**Estimated time:** 5-10 minutes

---

### 3.2 Email
- Send to: appeals@infinitysoul.com
- Include: Name, user ID (if known), appeal reason, supporting details
- Attach: Evidence (screenshots, documents, medical records if relevant and user consents)

**Response time:** Acknowledgment within 2 business days

---

### 3.3 Phone
- Call: 1-888-INFINITY (for accessibility)
- Speak with Appeals Specialist
- Verbal appeal logged, user receives confirmation email

**Availability:** Mon-Fri 8am-6pm PT

---

### 3.4 Campus/Partner Support
- CSUDH students: Contact Student Affairs or Counseling Center
- Insurer partners: Contact customer service (who escalates to InfinitySoul)
- Advocate organizations: Designated liaison for group appeals

---

## 4. Appeals Processing Workflow

### 4.1 Intake & Triage (Day 1-2)

**Step 1: Acknowledgment**
- Automated email to user: "We received your appeal. Reference #: APPEAL-2024-XXXXX"
- Assigned to Appeals Specialist within 24 hours

**Step 2: Initial Review**
- Specialist reviews appeal type, completeness
- Request additional info if needed (user has 10 days to respond)
- Classify priority (P1 = impacts active coverage decision; P2 = general inquiry)

---

### 4.2 Investigation (Day 3-10)

**For Data Accuracy Appeals:**
1. Verify data source (API logs, account linkages)
2. Cross-check with external systems (Last.fm, LMS, etc.)
3. If error confirmed: Correct data, re-run model, generate new score
4. If data accurate: Explain to user why data is correct, offer to show raw data

**For Fairness Appeals:**
1. Pull user's demographic info (with consent)
2. Re-run fairness metrics on user's cohort (disparate impact, calibration)
3. Check if excluded features (genre, platform) leaked into model
4. If bias confirmed: Escalate to Chief Compliance Officer, remediate model, notify affected cohort
5. If no bias: Explain fairness testing methodology, offer independent review

**For Context Appeals:**
1. Human reviewer (trained Appeals Specialist + licensed underwriter if insurance context) examines full context
2. Review supporting evidence (medical records, academic accommodations, etc.)
3. Determine if context warrants score adjustment or annotation
4. If adjustment warranted: Override model, document reason, notify user
5. If context doesn't change risk: Explain rationale, route to support resources

---

### 4.3 Resolution (Day 10-15)

**Possible outcomes:**
1. **Appeal granted** – Score corrected, user notified, impacted decisions (if any) reversed
2. **Appeal partially granted** – Score adjusted, but not to user's requested level; explanation provided
3. **Appeal denied** – Score stands; detailed explanation + user's right to escalate provided
4. **Referred to support** – Risk score accurate, but user routed to wellness resources, financial counseling, etc.

**Communication:**
- Email with outcome, detailed explanation, next steps
- If granted: New score, contributing factors, effective date
- If denied: Reasoning, fairness testing summary, escalation options

---

### 4.4 Escalation (If User Disputes Resolution)

**Level 1: Appeals Manager Review (Day 16-20)**
- User requests escalation via dashboard or email
- Appeals Manager (senior staff) re-reviews case
- May consult: Chief Compliance Officer, Model Owner, external advisors
- Final decision issued

**Level 2: Independent Review (Day 21-30)**
- User requests external review (rare; <1% of cases)
- Case submitted to independent ombudsman or arbitrator
- Binding resolution
- InfinitySoul pays cost of review

---

## 5. Repair Pathways: Improving Risk Scores Over Time

### 5.1 Personalized Repair Plan

When a user requests repair guidance, InfinitySoul generates a custom plan:

**Example Plan (Campus Early-Warning Context):**

```
───────────────────────────────────────────────────────
 Your Current Risk Profile
───────────────────────────────────────────────────────
 Overall Risk Band: ELEVATED
 Top Risk Drivers:
   1. Listening volatility (40% of score)
   2. Social withdrawal (30% of score)
   3. Late-night listening (15% of score)

───────────────────────────────────────────────────────
 Your Repair Pathway to MODERATE Risk
───────────────────────────────────────────────────────

 ACTION 1: Stabilize Listening Patterns (Est. 25% score improvement)
   • Current: Your listening volume varies wildly (0-8 hours/day)
   • Goal: Consistent daily engagement (30min-2hr/day)
   • Timeline: 30 days of consistent listening
   • Why this helps: Emotional stability correlates with routine

 ACTION 2: Re-engage Socially (Est. 20% score improvement)
   • Current: You've stopped using shared playlists
   • Goal: Re-engage with 2-3 shared playlists or social features
   • Timeline: 14 days of social listening activity
   • Why this helps: Social connectedness is protective factor

 ACTION 3: Sleep Hygiene (Est. 10% score improvement)
   • Current: 40% of listening is 11pm-4am
   • Goal: Reduce late-night listening to <20%
   • Timeline: 21 days of improved sleep schedule
   • Why this helps: Sleep disruption correlates with distress

───────────────────────────────────────────────────────
 Support Resources Available
───────────────────────────────────────────────────────
  ✓ CSUDH Counseling Center (free, confidential)
  ✓ Peer support groups (weekly, campus center)
  ✓ Wellness coaching (via Student Affairs)
  ✓ Mental health hotline (24/7, crisis support)

───────────────────────────────────────────────────────
 Progress Tracking
───────────────────────────────────────────────────────
  Your score is recalculated weekly. You can track progress
  in your dashboard. Expected timeline to MODERATE risk:
  45-60 days if you complete Actions 1-3.

  [View Dashboard]  [Contact Wellness Coach]
───────────────────────────────────────────────────────
```

---

### 5.2 Progress Tracking

**Weekly updates:**
- Automated email: "Your risk score update: Still ELEVATED, but volatility improved by 15%!"
- Dashboard visualization: Line chart showing score trend over time
- Milestone celebrations: "You've hit 30 days of consistent listening! Keep it up."

**Re-scoring cadence:**
- Campus: Weekly (responsive to student behavior)
- Insurance (future): Monthly or quarterly (less volatile, longer time horizons)

---

### 5.3 Repair Incentives

**Campus context:**
- Recognition: "Wellness Champion" badge for sustained improvement
- Resources: Priority access to wellness programs, workshop seats
- Social proof: Aggregate stats shared ("85% of students who completed repair plan moved to lower risk band")

**Insurance context (future, if approved):**
- Premium reductions: 5-15% discount for sustained risk improvement
- Deductible credits: $50-250 credit for completing wellness programs
- Coverage expansion: Access to better plans/benefits after 6-12 months of low risk

---

## 6. Transparency & Explainability

### 6.1 Risk Score Explanation (Always Provided)

Every risk score output includes:

1. **Overall score or band**
   - Campus: "Elevated risk" (not numeric score)
   - Insurance (future): "Risk class 4 of 7" + expected premium impact

2. **Top 3-5 contributing factors**
   - "Listening volatility: 40%"
   - "Social withdrawal: 30%"
   - "Late-night listening: 15%"
   - "Engagement consistency: 10%"
   - "Other factors: 5%"

3. **Trend**
   - "Increasing risk (up 12% from last week)"
   - "Stable"
   - "Improving (down 8% from last month)"

4. **Actionable insights**
   - "Consider: Counseling center visit, peer support group, sleep schedule adjustment"

---

### 6.2 Explainability Standards

InfinitySoul commits to:
- **Plain language:** No technical jargon (or jargon explained in tooltips)
- **Local explanations:** Why *this* user got *this* score (not just global feature importance)
- **Counterfactuals:** "If you reduced late-night listening by 50%, your score would drop by ~10%"
- **Visual aids:** Charts, graphs, color-coded risk factors (for accessibility)

**Regulatory alignment:** Meets NAIC AI explainability expectations for adverse action notices

---

## 7. Adverse Action Notices (Insurance Context)

If InfinitySoul scores influence an adverse insurance decision (denied, higher premium, reduced coverage), user receives:

### 7.1 Required Elements (Per FCRA § 615)

1. **Notice of adverse action:**
   - "Your application was declined" or "Your premium is higher than standard rate"

2. **Specific reasons:**
   - "Primary factors: Behavioral volatility (high), social engagement (low), music listening patterns (elevated risk indicators)"

3. **Data sources:**
   - "InfinitySoul Behavioral Risk Score, based on music listening data (Last.fm), campus engagement (CSUDH LMS)"

4. **Right to dispute:**
   - "You have the right to dispute this score. Contact InfinitySoul at appeals@infinitysoul.com or 1-888-INFINITY"

5. **Right to obtain score:**
   - "You can request a copy of your risk score and explanation at no cost"

6. **Contact information:**
   - InfinitySoul Appeals Team, [email], [phone], [web form]

---

### 7.2 InfinitySoul Enhancements (Beyond FCRA Minimum)

- **Repair pathway included:** "Here's how to improve your score and reapply in 3-6 months"
- **Human review offered:** "Request a human underwriter to review your application (no additional fee)"
- **Comparative context:** "Your score: 68/100. Average for your demographic group: 72. Required for approval: 75"
- **Ombudsman option:** "If you believe this decision is unfair, contact our independent ombudsman at [contact]"

---

## 8. Appeals Metrics & Reporting

### 8.1 Internal KPIs

| Metric | Target | Current | Trend |
|--------|--------|---------|-------|
| **Appeals processed within SLA (15 days)** | 95% | 97% | ✅ |
| **Appeals granted (full or partial)** | 20-30% (indicates responsive, not defensive) | 24% | ✅ |
| **User satisfaction (post-resolution survey)** | 80% | 82% | ✅ |
| **Escalations to Level 2 (independent review)** | <5% | 2% | ✅ |
| **Appeals citing fairness concerns** | <10% (indicates model is fair) | 6% | ✅ |
| **Data accuracy corrections** | 10-15% (indicates good data quality) | 12% | ✅ |

---

### 8.2 Quarterly Appeals Report

Published internally (Governance Board) and shared with regulators/partners:

- Total appeals received (by type)
- Resolution outcomes (granted, denied, referred)
- Average processing time
- Trends (are certain risk factors driving disproportionate appeals?)
- Systemic issues identified (e.g., "Music data linkage errors causing 15% of appeals → improved validation logic")
- User feedback themes

**Accountability:** If appeal metrics degrade (SLA misses, low satisfaction), root cause analysis required + remediation plan

---

## 9. Training & Quality Assurance

### 9.1 Appeals Specialist Training

All Appeals Specialists complete:
- **Onboarding:** InfinitySoul model methodology, fairness principles, consumer rights (2-day intensive)
- **Ongoing:** Quarterly refreshers on new models, regulations, best practices
- **Calibration sessions:** Monthly review of sample appeals with peer feedback (ensure consistency)

---

### 9.2 Quality Assurance

**Random sampling:** 10% of appeals audited monthly by Appeals Manager
- Verify correct procedure followed
- Check reasoning quality (clear, fair, well-documented)
- Identify training gaps

**User feedback:** Post-resolution survey (optional)
- "Was the process clear and fair?" (Yes/No + comments)
- "Was the explanation understandable?" (1-5 scale)
- "Would you recommend InfinitySoul to others?" (NPS score)

---

## 10. Continuous Improvement

### 10.1 Root Cause Analysis

For appeals that result in model corrections or policy changes:
- Document root cause (data error, model bug, fairness issue, user education gap)
- Implement fix (code patch, model retrain, documentation update, FAQ addition)
- Notify affected users (if correction changes their outcomes)

**Example:**
> "Appeal #2024-05647 revealed that music data linkage fails when users change Last.fm usernames. We fixed the account linking logic and retroactively corrected scores for 47 affected users."

---

### 10.2 Appeals-Driven Fairness Audits

If >5 appeals in a quarter cite fairness concerns for a specific demographic group:
- Trigger full fairness audit on that model + group
- Re-run disparate impact, calibration, equalized odds tests
- If bias confirmed: Disable model, remediate, notify Governance Board + regulators
- If no bias: Improve explainability (users may not understand why score is fair)

---

## 11. External Accountability

### 11.1 Regulator Access

State insurance departments and NAIC can:
- Request anonymized appeals data (quarterly or on-demand)
- Audit sample of appeal case files (on-site or virtual)
- Interview Appeals Specialists and compliance staff
- Review appeals training materials and QA processes

---

### 11.2 Consumer Advocate Partnerships

InfinitySoul works with consumer advocacy groups to:
- Co-design appeal processes (feedback loops)
- Provide aggregate appeals data (transparency)
- Offer "white glove" support for vulnerable populations (e.g., students with disabilities, non-native English speakers)

---

## Appendices

**Appendix A:** Appeal Form Template
**Appendix B:** Adverse Action Notice Template (FCRA-compliant)
**Appendix C:** Repair Pathway Generator (Technical Spec)
**Appendix D:** Appeals Specialist Training Manual
**Appendix E:** Sample Appeal Case Files (Anonymized)
**Appendix F:** User FAQs on Appeals Process

---

**Document Owner:** Chief Compliance Officer
**Contributors:** Appeals Manager, Privacy Officer, Model Owners
**Review Cycle:** Semi-annual (or after major process changes)
**Next Review:** June 2025
**Version History:**
- v1.0 (Dec 2024): Initial publication
