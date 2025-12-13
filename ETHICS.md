# InfinitySoul Research Ethics Framework

> "The mission of the Keck School of Medicine of USC is to improve the quality of life for
> individuals and society by promoting health, preventing and curing disease, advancing
> biomedical research and educating tomorrow's physicians and scientists."
>
> — USC Keck School of Medicine Mission

> "Research is formalized curiosity. It is poking and prying with a purpose."
>
> — Zora Neale Hurston

---

## Core Principle: Knowledge Is a Human Right

Paywalled research is a public health crisis. When evidence is locked behind $35/article
fees, only wealthy institutions can make evidence-based decisions. This creates:

- **Health inequity**: Poor communities can't access the research that affects their lives
- **Regulatory capture**: Only corporations can afford the data to challenge regulations
- **Algorithmic injustice**: Risk models are "proprietary" so victims can't challenge them
- **Innovation stagnation**: Researchers can't build on work they can't read

**InfinitySoul rejects this model entirely.**

---

## The InfinitySoul Research Commitment

### 1. Open Methodology

Every model we deploy will be documented with:

- **Full methodology** published publicly (not "proprietary")
- **Training data characteristics** (sample size, demographics, time period)
- **Known limitations** explicitly stated
- **Failure modes** documented before deployment
- **Version history** so changes are traceable

**Why**: If a model affects someone's life, they have the right to understand how.

### 2. Peer Review Before Deployment

No intervention or risk model goes live without:

- **Pre-registration** of hypotheses (no p-hacking)
- **Independent replication** by at least one external party
- **Statistical review** by qualified methodologist
- **Ethics review** equivalent to IRB standards
- **Public comment period** before production deployment

**Why**: "Move fast and break things" is fine for social media. Not for health outcomes.

### 3. Fairness Audits

Every model undergoes bias testing across:

- **Race/ethnicity**
- **Gender**
- **Age**
- **Socioeconomic status**
- **Geographic location**
- **Disability status**

If a model shows disparate impact >10% across any protected class, it does not deploy
until the disparity is understood and addressed.

**Why**: "The algorithm did it" is not an excuse. We are responsible for our models' impacts.

### 4. User Data Sovereignty

- Users **own** their data
- Users can **export** all data at any time (machine-readable format)
- Users can **delete** all data permanently
- Users can **see** exactly how their data influenced their recommendations
- Users **consent** to each use case separately (no blanket permissions)

**Why**: Your behavioral genome is yours. We're custodians, not owners.

### 5. Open Access to Findings

All research produced using InfinitySoul data will be:

- **Published open-access** (no paywalls)
- **Written in plain language** (not just academic jargon)
- **Accompanied by lay summaries** for non-experts
- **Available in multiple languages** where feasible
- **Citable by anyone** under Creative Commons

**Why**: Research funded by user data belongs to the public.

---

## Research Standards

### Study Design Requirements

| Requirement | Minimum Standard |
|-------------|------------------|
| Sample size | Power analysis required; minimum n=100 for pilot studies |
| Control group | Required for causal claims |
| Randomization | Required for intervention studies |
| Blinding | Where feasible |
| Pre-registration | Required on OSF or equivalent before data collection |
| Effect size | Must report Cohen's d or equivalent (not just p-values) |
| Confidence intervals | Required for all estimates |
| Replication | At least one independent replication before production |

### Prohibited Practices

- **P-hacking**: Running multiple analyses until significance is found
- **HARKing**: Hypothesizing After Results are Known
- **Cherry-picking**: Reporting only favorable results
- **Proxy discrimination**: Using "neutral" variables that correlate with protected classes
- **Outcome switching**: Changing primary endpoints after seeing data
- **Undisclosed conflicts**: Financial or other interests must be declared

### Required Disclosures

Every model must include a "Model Card" documenting:

```
MODEL CARD: [Model Name]
Version: X.Y.Z
Last Updated: YYYY-MM-DD

PURPOSE
What this model does and doesn't do.

TRAINING DATA
- Source: [where data came from]
- Size: [n=X]
- Time period: [dates]
- Demographics: [breakdown]
- Known gaps: [what's missing]

PERFORMANCE
- Primary metric: [e.g., AUC = 0.82]
- Confidence interval: [0.79 - 0.85]
- Performance by subgroup: [table]

LIMITATIONS
- Does not work well for: [populations/contexts]
- Should not be used for: [prohibited uses]
- Known failure modes: [when it breaks]

FAIRNESS AUDIT
- Disparate impact analysis: [results]
- Mitigation steps taken: [what we did]
- Remaining concerns: [what we couldn't fix]

ETHICAL REVIEW
- Reviewed by: [names/institutions]
- Date: [when]
- Concerns raised: [what they said]
- How addressed: [what we did]
```

---

## Governance Structure

### Research Ethics Board

An independent board reviews all research involving user data:

- **Composition**: Majority external members, including:
  - Academic researcher (public health or related field)
  - Ethicist
  - Community representative (user advocate)
  - Legal expert (privacy/civil rights)
  - Industry practitioner (but not from InfinitySoul)

- **Authority**: Can block deployment of any model that fails ethical review

- **Transparency**: Meeting minutes and decisions published publicly

### User Advisory Council

A rotating group of actual users who:

- Review proposed features before development
- Provide feedback on data use policies
- Flag concerns from the user community
- Have direct access to leadership

### Algorithmic Auditor

An independent third party (rotated annually) who:

- Has full access to model code and training data
- Publishes annual audit report
- Can issue public warnings if concerns are unaddressed

---

## Accountability

### When We're Wrong

If a model causes harm:

1. **Immediate disclosure** to affected users
2. **Model suspension** until root cause identified
3. **Public incident report** within 30 days
4. **Remediation plan** with timeline
5. **Compensation** where appropriate
6. **Post-mortem** published for industry learning

### Whistleblower Protection

Any employee or contractor who reports:

- Ethical violations
- Data misuse
- Fairness concerns
- Safety issues

Is protected from retaliation and can report anonymously.

---

## The USC Public Health Legacy

This framework is built on the principles taught at the USC Keck School of Medicine
and Dornsife School of Public Health:

1. **Population-level thinking**: Individual health is inseparable from community health
2. **Health equity**: Disparities are not natural; they're created and can be eliminated
3. **Evidence-based practice**: Interventions must be proven, not assumed
4. **Prevention over treatment**: Reducing risk beats treating disease
5. **Community engagement**: Those affected must be involved in decisions

InfinitySoul exists to **reduce risk, not predict it**. We succeed when people are
healthier, not when we correctly guess who will get sick.

---

## Commitment

This framework is not marketing. It's a binding commitment.

If InfinitySoul ever:

- Deploys a model without peer review
- Hides methodology behind "proprietary" claims
- Ignores fairness audit failures
- Sells user data without explicit consent
- Paywalls research produced from user data

Then we have failed our mission and should be held accountable.

Signed into the codebase: {DATE}

---

*"Of all the forms of inequality, injustice in health is the most shocking and inhuman."*
*— Dr. Martin Luther King Jr.*
