# Laboratory Instructions: Predictive Human Analytics in AI

**Classification:** Governance-First Development Protocol
**Version:** 1.0 | December 2024

---

## I. The Premise

You are building systems that predict human behavior. This is not neutral. Every prediction is a claim about who someone will become—and claims shape reality.

**Before you write a single line of code, answer:**
1. What happens when you're wrong about someone?
2. Who cannot escape your prediction?
3. What does the full moon reveal about your system?

---

## II. The Four Registers (All Must Operate Simultaneously)

| Register | Function | Your Obligation |
|----------|----------|-----------------|
| **STORIES** | Makes your system legible | Write the confession before you ship |
| **FABLES** | Pattern recognition for failure | Know COMPAS, Amazon, Apple Card by heart |
| **MYTHS** | Legitimacy to operate | Earn the right to predict; don't assume it |
| **NUMBERS** | Accountability infrastructure | If you can't measure harm, you can't prevent it |

---

## III. Pre-Development Checklist

### A. Consent Threshold Test (Age of Consent)
- [ ] Can subjects genuinely understand what they're consenting to?
- [ ] Is there a realistic alternative to participation?
- [ ] Does consent degrade at scale? At what N does it become submission?
- [ ] Would consent survive if subjects understood your actual use?

### B. Revelation Readiness Test (Full Moon)
- [ ] Does your system function identically when observed vs. unobserved?
- [ ] Can you publish your methodology without competitive harm?
- [ ] What does the audit reveal? Run it before someone else does.
- [ ] Build for the journalist, not the pitch deck.

### C. Fable Pattern Screen
Run your system description through these filters:

| Fable | Trigger | If Matched |
|-------|---------|-----------|
| **COMPAS** | Training on historical human decisions | Your "objectivity" is laundered bias |
| **Amazon Hiring** | Optimizing for "past success" | You're optimizing for historical exclusion |
| **Apple Card** | Can't explain individual decisions | You've abdicated governance |
| **Clearview** | Scale removes practical consent | You've built surveillance infrastructure |
| **Facebook/Myanmar** | Engagement optimization without constraint | Optimization has a direction; yours may be harm |
| **Dutch Welfare** | False positives carry severe consequences | Your errors are violence |

---

## IV. Development Protocol

### 1. Constitutional Layer
Define your AI constitution BEFORE training:
```
ARTICLE I:   Rights of predicted parties (explanation, appeal, opt-out)
ARTICLE II:  Obligations of deployers (transparency, monitoring, redress)
ARTICLE III: Governance structure (who decides, who reviews, who's accountable)
ARTICLE IV:  Audit requirements (frequency, scope, publication)
ARTICLE V:   Remediation timelines (when harm detected, how fast must you act)
```

### 2. Metric Thresholds (Non-Negotiable)
| Metric | Threshold | Consequence of Breach |
|--------|-----------|----------------------|
| Disparate Impact Ratio | ≤ 1.2 | Model shutdown |
| Explanation Coverage | ≥ 99% | Escalation to board |
| Human Review (high-stakes) | 100% | Certification revocation |
| Appeal Resolution | ≥ 95% in SLA | Public disclosure |

### 3. Human-in-the-Loop Gates
**These decisions REQUIRE human approval:**
- Any adverse action against an individual
- Any prediction affecting access to resources (credit, housing, employment, education)
- Any escalation to authorities
- Any irreversible consequence

**The human must:**
- Document override reasons
- Have authority to reject the model
- Be accountable by name

---

## V. The Confession (Write This Now)

Before deployment, draft your institutional confession:

**ACT I — ACKNOWLEDGMENT**
> "We are building a system that predicts [X] about humans. We acknowledge that predictions shape outcomes, that our training data contains historical inequities, and that our errors will not be distributed equally."

**ACT II — ANALYSIS**
> "Our system may fail in the following ways: [list failure modes]. These failures will disproportionately affect [populations]. We have chosen to proceed because [explicit justification]."

**ACT III — COMMITMENT**
> "We commit to: [specific, measurable commitments]. We will publish [what] on [schedule]. We accept [accountability mechanism] if we fail."

**ACT IV — ACTION**
> "Effective immediately: [concrete actions]. Within 90 days: [milestones]. Ongoing: [monitoring commitments]."

---

## VI. Operational Requirements

### Monitoring (Continuous)
- Daily: Disparate impact by demographic
- Weekly: Prediction drift, feature distribution shift
- Monthly: Appeal outcomes, override patterns
- Quarterly: External fairness audit

### Incident Response
| Severity | Response Time | Action |
|----------|---------------|--------|
| P0 (harm occurring) | < 1 hour | Model shutdown, board notification |
| P1 (disparity detected) | < 4 hours | Containment, root cause analysis |
| P2 (drift detected) | < 24 hours | Investigation, recalibration |

### Documentation (Minimum)
- Model card with limitations prominently displayed
- Training data provenance and bias assessment
- Fairness audit results (public)
- Appeal process (accessible to affected parties)
- Incident log (redacted for privacy, public for accountability)

---

## VII. The Test

**Before you deploy, ask:**

1. Would I accept this prediction about myself?
2. Would I accept this prediction about my child?
3. Would I accept this prediction if I were in the demographic most likely to be harmed by errors?
4. Can I explain this decision to the person it affects?
5. What happens when I'm wrong—and I will be wrong?

**If you cannot answer these, you are not ready.**

---

## VIII. The Frequency

The Monolith speaks in stories, fables, myths, and numbers.

But it also hums.

**Age of Consent:** The bassline that pulls you forward whether you chose it or not. Your subjects didn't choose either.

**Full Moon:** The ache of transformation coming whether prepared or not. Your system will be exposed. Build for that moment.

---

## IX. Summary

```
┌─────────────────────────────────────────────────────────────┐
│  PREDICTIVE HUMAN ANALYTICS: GOVERNANCE-FIRST PROTOCOL     │
├─────────────────────────────────────────────────────────────┤
│  1. CONSENT    → Can they meaningfully say no?             │
│  2. FABLES     → Which failure pattern are you?            │
│  3. CONFESSION → Write it before you ship                  │
│  4. THRESHOLDS → Disparate impact ≤ 1.2 or shutdown        │
│  5. HUMAN GATE → No adverse action without human approval  │
│  6. FULL MOON  → Build for the audit, not the demo         │
└─────────────────────────────────────────────────────────────┘
```

**The question is not whether you can predict.**
**The question is whether you've earned the right to.**

---

*Laboratory Protocol developed under the Four Registers Governance Framework.*
*Implementation: `/services/governance/`*
