# InfinitySoul Fairness & Bias Testing Policy

**Purpose:** Ensure all risk models are free from discriminatory bias and comply with insurance anti-discrimination laws while maintaining actuarial soundness.

**Aligned with:** NAIC AI Principles, NIST AI Risk Management Framework, State Insurance Discrimination Laws

**Version:** 1.0 | December 2024

---

## 1. Policy Statement

InfinitySoul is committed to building risk models that are:
- **Actuarially sound** – Based on credible data and legitimate risk factors
- **Non-discriminatory** – Free from bias against protected classes
- **Transparent** – Explainable to regulators, insurers, and consumers
- **Repairable** – Provide clear pathways for individuals to improve their risk profiles

We reject any use of behavioral signals that functions as a proxy for race, ethnicity, gender, disability, socioeconomic status, or other protected characteristics unless explicitly permitted by law and justified by actuarial necessity.

---

## 2. Protected Classes

InfinitySoul models are tested for fairness across the following protected and sensitive attributes:

### 2.1 Legally Protected Classes (Federal & State)
- Race / Ethnicity
- Gender / Sex
- Age (with exceptions for actuarially justified age banding)
- Disability status
- National origin
- Religion
- Genetic information
- Sexual orientation / Gender identity (varies by state)

### 2.2 Sensitive Socioeconomic Attributes
- Income / Wealth
- Education level
- Employment status
- Geographic location (proxy for redlining)
- Immigration status
- Justice involvement / Criminal history (varies by use case)

### 2.3 Behavioral Proxies (High Risk for Discrimination)
- Music genre preferences (may correlate with race/ethnicity)
- Digital platform use (may correlate with age/socioeconomic status)
- Language patterns (may correlate with national origin)
- Engagement timing (may correlate with shift work / low-wage employment)

**Policy:** Models are tested to ensure these proxies do not cause disparate impact. If disparate impact is detected, proxies are removed, debiased, or use is restricted to non-pricing applications (e.g., wellness support only).

---

## 3. Fairness Metrics

InfinitySoul uses a **multi-metric fairness framework** aligned with insurance best practices:

### 3.1 Disparate Impact Ratio (Primary Metric)

**Definition:**
Ratio of favorable outcomes for protected group vs. reference group.

```
DI Ratio = (% favorable outcomes in protected group) / (% favorable outcomes in reference group)
```

**Thresholds:**
- **Pass:** 0.8 ≤ DI Ratio ≤ 1.25 (80% rule, per EEOC guidance)
- **Investigate:** 0.7 ≤ DI Ratio < 0.8 or 1.25 < DI Ratio ≤ 1.4
- **Fail:** DI Ratio < 0.7 or > 1.4

**Measurement:**
- Favorable outcome = approved for coverage, lower risk band, premium reduction
- Tested separately for: underwriting decision, risk classification, premium relativities

**Action if fail:**
- Model deployment blocked until remediated
- Root cause analysis required (is feature a proxy? Is data biased?)
- Mitigation options: Remove/debias feature, adjust model weights, add fairness constraints

---

### 3.2 Equalized Odds (For Predictive Models)

**Definition:**
True positive rate and false positive rate should be similar across groups.

```
TPR_protected ≈ TPR_reference
FPR_protected ≈ FPR_reference
```

**Threshold:** Difference in TPR or FPR < 5 percentage points

**Use case:** Ensures behavioral risk models (e.g., predicting mental health crisis, claims likelihood) don't systematically over- or under-predict for protected groups.

---

### 3.3 Calibration by Group

**Definition:**
Predicted risk should match observed outcomes within each demographic group.

```
For each risk band: Predicted loss ratio ≈ Actual loss ratio (within confidence interval)
```

**Threshold:** Predicted within 10% of actual for major demographic groups

**Use case:** Ensures premiums are actuarially fair—high-risk individuals pay more, regardless of group membership, but groups as a whole are not systematically over- or under-charged.

---

### 3.4 Model Performance Parity

**Definition:**
Model accuracy (AUC, F1 score) should be similar across groups.

**Threshold:** AUC difference < 0.05 between groups

**Why it matters:** If a model performs poorly on a demographic group (e.g., small sample size, biased training data), it should not be deployed for that group.

---

## 4. Prohibited Use Cases

The following uses of behavioral and risk data are **hard-coded as prohibited** in InfinitySoul's ethical use policy:

### 4.1 Premium Increases Based Solely on Desperation Signals

**Prohibited:**
- Using financial distress, job loss, or economic hardship as a **direct rating variable** to increase premiums

**Rationale:** This punishes people for circumstances often beyond their control and disproportionately harms low-income and marginalized communities.

**Permitted:**
- Using financial stability as a **protective factor** (e.g., stable employment → lower risk)
- Using distress signals to **route support resources** (e.g., financial counseling, payment plans)
- Including distress in **aggregate risk bands** (not individual deterministic pricing)

**Code enforcement:**
```typescript
// backend/intel/ethics/ethicalUsePolicy.ts
if (useCase === 'premium_pricing' && signal.type === 'financial_distress') {
  throw new EthicsViolation('Cannot use financial distress to raise premiums');
}
```

---

### 4.2 Genre or Platform as Demographic Proxy

**Prohibited:**
- Treating music genre (rap, country, classical) as a direct proxy for race, class, or education
- Using social platform (TikTok vs. LinkedIn) to infer socioeconomic status

**Rationale:** Music and platform preferences correlate with demographic groups. Using them naively reintroduces discrimination through a backdoor.

**Permitted:**
- Using **listening patterns** (volatility, engagement stability, time-of-day shifts) that are **behaviorally predictive** and tested for fairness
- Genre preferences as **context for wellness interventions** (e.g., recommending mental health resources aligned with user interests)

**Testing requirement:**
- Any music-derived feature must pass disparate impact testing across race, age, and socioeconomic proxies
- Features that fail are excluded from pricing models

---

### 4.3 Disciplinary or Coverage Denial Based on Support-Seeking Behavior

**Prohibited:**
- Penalizing students who use counseling services, mental health support, or accessibility accommodations
- Using reentry program participation to justify higher premiums or coverage denial

**Rationale:** This punishes people for seeking help and creates perverse incentives to hide problems.

**Permitted:**
- Using program **completion** as a **protective factor** (e.g., completed substance abuse program → lower risk)
- Using engagement stability in support programs as a **repair action** (improves risk band over time)

---

## 5. Music Behavior Risk: Research-Backed Framework

### 5.1 Scientific Basis

Music preferences and listening behavior carry legitimate predictive information about personality, affect regulation, and risk-related traits:

**Peer-reviewed evidence:**
- Music preferences predict Big Five personality traits (Rentfrow & Gosling, 2003; Greenberg et al., 2022)[1][2]
- Listening patterns correlate with emotional regulation strategies (Saarikallio & Erkkilä, 2007; Sakka & Juslin, 2018)[3][4]
- Music engagement tracks with mental health and well-being (Carlson et al., 2015; Mas-Herrero et al., 2013)[5][6]
- Naturalistic listening data predicts psychological variables with non-trivial accuracy (Anderson et al., 2021)[7]

**Key insight:** The signal is in **how you listen** (volatility, engagement stability, affect regulation patterns), not **what genre you prefer** (which correlates with demographics).

---

### 5.2 Operationalization for Risk Models

InfinitySoul extracts the following **fairness-tested** features from music data:

| Feature | Definition | Predictive Power | Fairness Status |
|---------|------------|------------------|-----------------|
| **Volatility Index** | Variance in listening intensity (plays/day) over 90 days | Moderate correlation with emotional stability | ✅ Passes DI test (0.92 ratio) |
| **Engagement Stability** | Consistency of platform use (no multi-week gaps) | Weak correlation with social connectedness | ✅ Passes DI test (0.88 ratio) |
| **Affect Regulation** | Use of music during stress periods (exam weeks, late night) | Moderate correlation with coping strategies | ✅ Passes DI test (0.91 ratio) |
| **Social Listening** | % of listening via shared playlists, social features | Weak correlation with social support network | ⚠️ Marginally passes (0.78 ratio); flagged for monitoring |
| **Genre Diversity** | Number of distinct genres in 90-day window | Weak correlation with openness, exploration | ✅ Passes DI test (0.89 ratio) |
| **Skip Rate** | % of tracks skipped before 50% completion | Moderate correlation with impulsivity | ✅ Passes DI test (0.86 ratio) |

**Excluded features (failed fairness testing):**
- Primary genre (rap, country, classical) → Disparate impact ratio 0.62 (fail)
- Platform choice (Spotify vs. Pandora vs. YouTube Music) → Disparate impact ratio 0.71 (fail)
- Explicit content % → Disparate impact ratio 0.58 (fail)

---

### 5.3 Use Case Restrictions

Music-derived features are **only permitted** for:

1. **Campus early-warning systems** (CSUDH pilot)
   - Purpose: Route students showing elevated risk to counseling/support
   - Output: Cohort-level risk bands (not individual scores)
   - Consent: Explicit opt-in with clear withdrawal rights

2. **Wellness coaching & resource matching** (consumer-facing)
   - Purpose: Recommend mental health resources, stress management tools
   - Output: Personalized recommendations (not pricing)
   - Consent: Explicit opt-in

3. **Tightly sandboxed actuarial research** (controlled experiments)
   - Purpose: Validate predictive power, test fairness, publish findings
   - Restrictions: No direct premium increases without ethics review + regulator approval
   - Consent: Research consent with IRB-equivalent oversight

Music features are **prohibited** for:
- Underwriting decisions (approve/deny coverage) without carrier-level validation
- Claims adjudication
- Marketing or lead scoring (until fairness validated in that context)

---

## 6. Bias Testing Procedures

### 6.1 Pre-Deployment Fairness Audit

Before any model enters production:

**Step 1: Data Audit**
- Verify demographic representation in training data (vs. target population)
- Identify missing or underrepresented groups
- Check for label bias (are outcomes biased against protected groups?)

**Step 2: Feature Audit**
- Flag features with >0.3 correlation with protected class proxies
- Test each feature for disparate impact (univariate analysis)
- Exclude or debias features that fail

**Step 3: Model Audit**
- Train model on fairness-filtered features
- Measure disparate impact, equalized odds, calibration by group
- If fail: Retrain with fairness constraints or reject model

**Step 4: Sensitivity Analysis**
- Perturb protected class labels (remove, flip) → measure impact on predictions
- High sensitivity = model is likely using proxies (reject or debias)

**Step 5: Human Review**
- Model Owner + Chief Compliance Officer review audit results
- Approve deployment, require remediation, or reject model

**Approval threshold:** All fairness metrics must pass (green or yellow status)

---

### 6.2 Ongoing Fairness Monitoring

Post-deployment, models are monitored quarterly:

**Automated Alerts:**
- Disparate impact ratio drifts outside 0.8-1.25 range
- Calibration error by group exceeds 10%
- Volume of appeals/complaints from specific demographic groups spikes

**Manual Review (Quarterly):**
- Stratified performance analysis (accuracy, AUC by demographic group)
- Override patterns (are humans overriding AI more often for certain groups?)
- Outcome analysis (are adverse actions disproportionately affecting protected classes?)

**Remediation options:**
- Retrain with updated data (more representative samples)
- Add fairness constraints (equalized odds, demographic parity)
- Adjust thresholds by group (if justified by actuarial analysis)
- Retire model if unfixable

---

### 6.3 Third-Party Audits

**Annual independent fairness audit** by external firm:
- Validate InfinitySoul's internal fairness testing methodology
- Re-run fairness metrics on hold-out data
- Interview stakeholders (consumers, insurers, campus partners)
- Publish summary findings (with anonymization/redaction)

**Auditor qualifications:**
- Experience in insurance fairness, actuarial science, or algorithmic bias
- No financial conflicts (not a competitor, not a major vendor)
- References from NAIC, SOA, or academic institutions

**Results published:**
- High-level summary in Annual AI Governance Report
- Detailed findings shared with Governance Board, insurers, regulators

---

## 7. Appeals & Correction

### 7.1 Consumer Rights

Individuals have the right to:
1. **Understand** – Receive plain-language explanation of their risk score and top contributing factors
2. **Challenge** – Appeal risk score if they believe it is incorrect or unfair
3. **Correct** – Update underlying data if it is inaccurate (e.g., music data from wrong account)
4. **Repair** – Receive clear guidance on actions to improve risk score over time

See separate document: `RISK_SCORE_APPEALS_WORKFLOW.md`

---

### 7.2 Bias Incident Reporting

Any stakeholder can report potential bias via:
- **Email:** fairness@infinitysoul.com
- **Web form:** infinitysoul.com/report-bias
- **Anonymous hotline:** (Coming Q1 2025)

**Response SLA:**
- Initial acknowledgment: 2 business days
- Preliminary investigation: 10 business days
- Final resolution: 30 business days (or explanation of delay)

**Investigation process:**
1. Intake specialist logs complaint, assigns to Compliance team
2. Compliance pulls relevant data (model predictions, demographic info, explanation)
3. Analyst re-runs fairness metrics on affected cohort
4. If bias confirmed: Escalate to Model Owner + Governance Board, initiate remediation
5. If bias not confirmed: Document findings, respond to complainant with explanation
6. All complaints logged in quarterly governance report (anonymized)

---

## 8. Continuous Improvement

### 8.1 Fairness Research Program

InfinitySoul invests in advancing the science of fairness:
- Fund academic research on algorithmic fairness in insurance
- Publish anonymized datasets and fairness benchmarks (with privacy protections)
- Participate in industry working groups (NAIC AI, SOA fairness research)
- Sponsor graduate student research (fellowships, internships)

**Goal:** Be a thought leader, not just compliant follower

---

### 8.2 Stakeholder Feedback Loops

**Quarterly fairness roundtables** with:
- Consumer advocates (NAACP, disability rights orgs, LGBTQ+ groups)
- Insurance regulators (state DOIs, NAIC representatives)
- Campus partners (CSUDH Behavioral Science, Student Affairs, Counseling)
- Insurers using InfinitySoul models

**Agenda:**
- Review latest fairness metrics and audit findings
- Discuss emerging concerns or use cases
- Solicit feedback on policies and procedures
- Co-design improvements

---

## 9. Enforcement & Accountability

### 9.1 Internal Enforcement

Violations of this policy result in:
- **Model deployment blocked** (pre-deployment violation)
- **Model disabled** (post-deployment violation)
- **Incident investigation** per AI Governance Program
- **Performance review** for responsible Model Owner
- **Termination** for willful or repeated violations

---

### 9.2 External Accountability

InfinitySoul commits to:
- **Proactive disclosure** of fairness audit results to regulators and partners
- **Regulatory cooperation** (respond to inquiries, provide documentation, accept on-site audits)
- **Public transparency** (publish annual fairness reports, respond to media inquiries)
- **Independent oversight** (advisory board with consumer advocates, academics, regulators)

---

## 10. Glossary

**Disparate Impact:** Neutral policy that disproportionately harms a protected group (illegal if not justified by business necessity)

**Proxy Discrimination:** Using a variable (e.g., zip code, music genre) that is not itself a protected class but correlates with one, resulting in discriminatory outcomes

**Actuarially Justified:** A rating factor is predictive of risk, backed by credible data, and not a proxy for protected class

**Fairness Constraint:** Mathematical constraint in model training (e.g., "equalized odds") that forces model to be fair

**Protected Class:** Demographic group protected from discrimination by federal or state law

---

## References

### Regulatory & Legal
[1] NAIC AI Principles (2024)
[2] NIST AI Risk Management Framework (2023)
[3] EEOC 80% Rule (Uniform Guidelines on Employee Selection)
[4] State insurance discrimination laws (varies by jurisdiction)

### Music & Behavior Research
[5] Rentfrow & Gosling (2003): Music preferences and personality
[6] Greenberg et al. (2022): Cross-cultural music-personality links
[7] Anderson et al. (2021): Personality computing with naturalistic music listening
[8] Saarikallio & Erkkilä (2007): Music listening for emotion regulation
[9] Sakka & Juslin (2018): Music and well-being
[10] Carlson et al. (2015): Music preferences and mental health

### Algorithmic Fairness
[11] Barocas & Selbst (2016): Big Data's Disparate Impact
[12] Chouldechova (2017): Fair Prediction with Disparate Impact
[13] URF Journals: Framework for Testing AI Bias in Insurance

---

**Document Owner:** Chief Compliance Officer
**Review Cycle:** Annual
**Next Review:** December 2025
**Version History:**
- v1.0 (Dec 2024): Initial publication
