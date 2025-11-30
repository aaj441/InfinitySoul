# Unauthorized Practice of Law (UPL) Compliance Guide

**This document is mandatory reading for all InfinitySol team members.**

---

## What Is UPL?

Unauthorized Practice of Law occurs when a non-attorney:
- Provides legal advice or legal opinions
- Represents themselves as an attorney
- Acts in a legal representative capacity
- Gives advice that requires legal analysis

**Penalties:**
- Civil: Consumers can sue for damages
- Criminal: Up to 5 years imprisonment + fines (varies by state)
- Professional: Permanent business shutdown, personal liability

**InfinitySol operates in a gray zone. We MUST stay on the right side of this line.**

---

## The Bright Line Rule

### ❌ THIS IS UPL (NEVER SAY)

```
"You are violating the Americans with Disabilities Act."
"Your company is liable for $50,000."
"You must remediate these issues to comply with the law."
"The plaintiff has a strong case against you."
"You should settle immediately."
"This violation will result in a lawsuit."
"ADA Title III requires you to..."
"Your site violates federal law."
```

### ✅ THIS IS NOT UPL (ALWAYS SAY)

```
"Your site has 23 WCAG 2.2 AA violations."
"Similar violations have appeared in federal litigation 347 times."
"The average settlement for this type of violation is $65,000."
"Comparable cases in your industry have resulted in..."
"We've documented [X] instances of non-compliance with WCAG 2.2."
"Here's the public court record of a similar case."
"Companies with this profile appear in litigation at a 78% rate (based on public data)."
"The WCAG 2.2 standard from W3C requires..."
```

### The Distinction

**UPL = Legal Conclusion**
```
"You will be sued."           ← Legal prediction
"You are liable."             ← Legal determination
"You must comply."            ← Legal directive
```

**NOT UPL = Technical Fact**
```
"Litigation similar to yours has happened 347 times."  ← Public data
"Settlements averaged $65K."                            ← Statistic
"WCAG 2.2 AA requires [X]."                             ← Technical standard
```

---

## The Three-Part Test (Use This for Every Statement)

Before sending ANY external communication, ask:

**1. Is it a legal conclusion?**
- Does it interpret law?
- Does it predict legal outcomes?
- Does it advise on legal strategy?

**If YES: DON'T SAY IT**

**2. Can I cite a public source?**
- Is there a court decision supporting this?
- Is there a public document proving this?
- Can I point to a statute or regulation?

**If NO: REPHRASE or DON'T SAY IT**

**3. Am I acting like an attorney?**
- Am I representing the client in legal matters?
- Am I interpreting complex legal doctrine?
- Am I advising on client's legal obligations?

**If YES: REFERENCE COUNSEL INSTEAD**

---

## Specific Compliance Rules

### Rule #1: Always Cite Public Sources

✅ GOOD:
```
"According to the federal case Gil v. Winn-Dixie (11th Cir., 2020),
website accessibility is required under ADA Title III. The court found
that online checkout flow violations caused discrimination against
blind users."
[Link to CourtListener]
```

❌ BAD:
```
"The law requires your site to be accessible."
```

---

### Rule #2: Use Data, Not Predictions

✅ GOOD:
```
"We analyzed 347 public ADA Title III cases over the last 5 years.
In cases involving keyboard navigation failures:
- 89% resulted in settlement
- Average settlement: $72,000
- Average remediation time: 120 days"
[Link to analysis]
```

❌ BAD:
```
"You will definitely be sued because of this violation."
```

---

### Rule #3: Never Use "Must," "Will," or "Should" (Legal Language)

✅ GOOD:
```
"WCAG 2.2 AA specifies that form inputs must have associated labels.
Your site has 14 inputs without labels.
Companies that remediated this type of violation moved from 23%
compliance to 97% compliance."
```

❌ BAD:
```
"You must add form labels immediately or you'll be sued."
```

---

### Rule #4: Offer Technical Options, Not Legal Advice

✅ GOOD:
```
"To remediate WCAG 2.1.1 (Keyboard), you can:
1. Implement tabindex management
2. Add escape key event handlers
3. Use ARIA focus management

Option 2 is used by [X% of companies] and takes ~4 hours to implement."
```

❌ BAD:
```
"You should use option 2 because it's the legally safe approach."
```

---

### Rule #5: Reference Client's Counsel, Don't Replace Them

✅ GOOD:
```
"These are technical findings. For guidance on legal implications
and litigation risk, we recommend discussing with your attorney.
We're happy to brief your counsel on our methodology."
```

❌ BAD:
```
"Based on the law, here's what you should do..."
```

---

### Rule #6: Be Transparent About What You're NOT Doing

✅ Include in Every Report:
```
"LEGAL DISCLAIMER

InfinitySol is not a law firm. This audit is a technical analysis of
your website against WCAG 2.2 standards. It is NOT:
- A legal opinion
- A guarantee of non-liability
- A substitute for legal counsel
- A prediction of litigation

For legal advice, consult your attorney.
For technical remediation that will survive their review, engage InfinitySol."
```

---

## Email Template Compliance

### Cold Prospect Email (Compliant)

```
Hi [Name],

On [DATE], we scanned [DOMAIN]. Here's what we found in your public code:

FINDINGS (Technical)
- 47 WCAG 2.2 AA violations detected
- 12 critical (WCAG Level A failures)
- 23 serious issues
- 12 minor issues

COMPARABLE CASES (Public Data)
We reviewed federal litigation from PACER (Public Access to Court
Electronic Records). Companies in your industry with similar profiles:

- Winn-Dixie (11th Cir., 2020): Settled for $250K [Link]
- Target (N.D. IL., 2018): Settled for $3.75M [Link]
- Domino's (9th Cir., 2019): Appealed, then settled [Link]

WHAT THIS MEANS (No Prediction)
Your site has technical gaps that match patterns in public litigation.
We're not predicting what happens next—that depends on factors beyond
our analysis. But here's the public record of what's happened to others.

NEXT STEP
- Review your [DOMAIN] audit report (attached)
- Discuss with your legal counsel
- If you want technical remediation, let's talk

Questions about the technical findings? Call us.
Questions about legal implications? Call your attorney.

---
InfinitySol
"We document liability so you can fix it before it's yours."

DISCLAIMER: This is technical analysis only. Not legal advice.
Consult an attorney for legal guidance.
```

### High-Risk Prospect Email (Compliant)

```
Hi [Name],

Pattern match detected.

PLAINTIFF ACTIVITY (Public Data)
[PLAINTIFF NAME] has filed 47 accessibility lawsuits in [JURISDICTION]
over the last 24 months. Average settlement: $52K. Success rate: 89%.

Their recent targets:
- [Company A]: Similar profile to yours, settled for $75K [Link]
- [Company B]: Same industry, settled for $52K [Link]
- [Company C]: Same violation types, settled for $68K [Link]

YOUR PROFILE (Factual)
Your site has:
- 34 WCAG violations (vs. 12 for industry average)
- 3 critical issues matching their typical targets
- Your industry = their preferred focus

WHAT THIS MEANS (Data-Driven)
We're not predicting lawsuits. We're showing you what's happening to
similar companies in your industry, filed by people actively pursuing
this strategy.

YOUR CHOICE
- Stay as-is (and hope you're not their next target)
- Remediate (preventive, on your terms)
- Call your attorney (we'll brief them)

We can have you compliant in 30 days if you want.

---
InfinitySol
DISCLAIMER: This is pattern analysis, not legal advice.
For legal guidance, consult your attorney.
```

---

## Internal Checkpoints

**Use this checklist for every piece of external communication:**

- [ ] No legal conclusions ("you are liable," "you will be sued")
- [ ] All claims cited to public sources
- [ ] No predictions about individual outcomes
- [ ] No "must" or "will" (unless technical/mathematical)
- [ ] Data-backed ("78% of cases like yours" not "you're likely")
- [ ] Recommends counsel, doesn't replace counsel
- [ ] Legal disclaimer included
- [ ] Facts, not opinions
- [ ] Public data sources only
- [ ] No representation as attorney

**If ANY of these fail: Revise before sending.**

---

## What to Do If Asked for Legal Advice

**Scenario:** Client asks, "What should I tell my insurance company?"

**WRONG RESPONSE:**
```
"Tell them you're fully compliant now. This will reduce your premiums."
```

**RIGHT RESPONSE:**
```
"We've documented your technical remediation with blockchain verification.
Your insurance counsel can review our report to determine how to
characterize this to your insurer. We're happy to brief them on methodology."
```

---

**Scenario:** Client asks, "Are we in legal danger?"

**WRONG RESPONSE:**
```
"Yes, you have moderate-to-high litigation risk."
```

**RIGHT RESPONSE:**
```
"That's a legal question for your attorney. What I can tell you is:
- Companies with similar violation patterns appear in litigation at X% rate
- Settlements for comparable violations average $X
- We've documented your current state, and here's the remediation roadmap"
```

---

## State-Specific UPL Rules

**Different states have different definitions. Consult your state bar:**

- **Florida**: UPL = Any act requiring legal knowledge. Very strict.
- **California**: UPL = Explicit legal advice. More permissive.
- **New York**: UPL = Holding yourself out as attorney. Moderate.
- **Texas**: UPL = Any legal advice. Very strict.

**If InfinitySol operates in multiple states, follow the STRICTEST rule.**

---

## Training & Certification

**All InfinitySol team members must:**

1. Read this guide (required)
2. Attend UPL training session (quarterly)
3. Sign attestation of compliance (annually)
4. Submit all external comms for review (first 30 days)
5. Pass UPL quiz (annual, 80% passing score)

**Violation consequences:**
- First: Written warning + retraining
- Second: Suspension from client-facing role
- Third: Termination (personal liability to company)

---

## Record Keeping

**Keep this documentation:**
- All UPL training certificates
- Signed attestations from all team members
- Email review logs (who reviewed, when, approved/rejected)
- Any corrections made post-publication
- Legal counsel review memos

**Retention: 7 years minimum**

---

## Emergency UPL Hotline

**If you're unsure whether something is UPL:**
1. Stop. Don't send it.
2. Contact legal counsel (email: legal@infinitesol.com)
3. Include: The communication, intended recipient, context
4. Wait for approval before sending
5. Document the inquiry and response

**Better safe than sued.**

---

**Version:** 2.0
**Last Updated:** 2024
**Author:** InfinitySol Legal Compliance
**Reviewed By:** {{LEGAL_COUNSEL_NAME}}, {{BAR_NUMBER}}

---

**ATTESTATION**

I have read and understand the InfinitySol Unauthorized Practice of Law Compliance Guide. I understand that violations can result in civil liability, criminal prosecution, and termination. I commit to following these guidelines in all client communications.

Name: _________________________
Date: _________________________
Signature: _________________________
