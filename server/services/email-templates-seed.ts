/**
 * Email Templates Seed Data
 * Cold email templates for EAA 2025 compliance outreach
 */

export const emailTemplatesSeed = [
  {
    name: "Fintech EAA 2025 Urgency",
    category: "cold-outreach",
    industry: "fintech",
    subjectLine: "⚠️ EAA 2025: Your fintech platform faces €50K fines in [DAYS] days",
    bodyTemplate: `Hi [Name],

I noticed you're the [Title] at [Company] - congratulations on your work in the fintech space.

I'm reaching out because TestDevLab's 2025 study shows only 69% of fintech platforms are WCAG compliant, and with the European Accessibility Act deadline of June 28, 2025 approaching, you're likely in the high-risk category for regulatory action.

The consequences are significant:
• €50,000 fines per non-compliant website
• Potential blocking of EU market access
• Damage to customer trust and brand reputation

[Company Name]'s platform serves [estimated user count] users, making compliance particularly critical.

We've built WCAGAI 4.0 specifically for fintech companies like yours:
• **2-minute compliance scan** (HIPAA-safe, GDPR-compliant)
• **AI-powered fixes** at €0.50 per issue (98% margin)
• **Continuous monitoring** for ongoing compliance
• **ROI of €90 per €1 invested** in accessibility

Would you be open to a 15-minute call this week to see your current compliance score and understand your risk exposure? We can run a preliminary scan and show you exactly where you stand.

Best regards,
[Your Name]
WCAGAI Compliance Specialist`,
    estimatedOpenRate: 32,
    estimatedReplyRate: 8,
    difficulty: "medium",
  },
  {
    name: "Healthcare Patient Access Focus",
    category: "cold-outreach",
    industry: "healthcare",
    subjectLine: "202M patient visits at risk: EAA 2025 compliance for [Company Name]",
    bodyTemplate: `Hi [Name],

I'm reaching out about a critical accessibility issue affecting [Company Name]'s digital presence.

With 202 million monthly visits to healthcare websites like yours and only 26% WCAG compliance in the healthcare sector, you're likely putting patient access at risk while facing €50,000 fines under the European Accessibility Act.

The June 28, 2025 deadline is approaching fast, and non-compliance means:
• Blocked access for patients with disabilities
• Regulatory fines and legal action
• Loss of Medicare/Medicaid eligibility (US markets)
• Damage to your reputation as a patient-first organization

WCAGAI 4.0 is designed specifically for healthcare organizations:
• **HIPAA-compliant AI scanning** (no patient data ever leaves your environment)
• **GDPR-safe remediation** with 98% accuracy
• **Healthcare-specific compliance reports** for regulators
• **Patient access optimization** for all disabilities

We can scan your entire platform in 2 minutes and provide a detailed compliance roadmap.

Would you be available for a 20-minute demonstration next week to see your current compliance score and how we can protect patient access while avoiding regulatory penalties?

Best regards,
[Your Name]
Healthcare Compliance Specialist
WCAGAI`,
    estimatedOpenRate: 38,
    estimatedReplyRate: 11,
    difficulty: "hard",
  },
  {
    name: "E-Commerce Revenue Focus",
    category: "cold-outreach",
    industry: "ecommerce",
    subjectLine: "EAA 2025: Is your e-commerce platform losing sales to accessibility issues?",
    bodyTemplate: `Hi [Name],

I hope this email finds you well. I'm reaching out because [Company Name]'s e-commerce platform is likely losing revenue due to accessibility issues - and with the European Accessibility Act deadline of June 28, 2025, these issues will soon result in €50,000 fines.

Here's what's at stake:
• **15% of global population** has disabilities that affect online shopping
• **€69 billion** in lost EU e-commerce revenue annually due to poor accessibility
• **Legal action** under EAA 2025 starting June 28
• **Brand damage** from accessibility discrimination claims

WCAGAI 4.0 helps e-commerce leaders like you:
• **Identify revenue-blocking accessibility issues** in 2 minutes
• **AI-powered fixes** at €0.50 per issue (vs. €150+ developer hours)
• **Continuous monitoring** to catch new issues before they impact sales
• **Conversion optimization** for shoppers with disabilities

We've helped companies increase accessible revenue by 23% on average.

Could we schedule 30 minutes next week to run a compliance scan and show you the specific accessibility barriers affecting your conversion rate?

Best regards,
[Your Name]
Revenue Optimization Specialist
WCAGAI`,
    estimatedOpenRate: 29,
    estimatedReplyRate: 6,
    difficulty: "easy",
  },
  {
    name: "SaaS Scale Focus",
    category: "cold-outreach",
    industry: "saas",
    subjectLine: "EAA 2025 compliance: Scale safely without accessibility roadblocks",
    bodyTemplate: `Hi [Name],

As [Company Name] scales across the EU market, I wanted to flag an urgent compliance issue that could derail your growth trajectory.

With 80 million websites facing €50,000 fines under the European Accessibility Act (deadline: June 28, 2025), SaaS platforms are particularly vulnerable due to their complex user interfaces and multi-tenant architectures.

The growth risks are significant:
• **€50K fines** per non-compliant application
• **EU market access blocked** for non-compliant software
• **Enterprise customers** requiring compliance as a procurement condition
• **Competitive disadvantage** vs. accessibility-first competitors

WCAGAI 4.0 is built for scaling SaaS companies:
• **Multi-site scanning** across all your customer environments
• **AI remediation** that scales with your user base
• **White-label compliance reports** for your enterprise customers
• **API access** for integrating compliance into your dev workflow

We help SaaS companies turn compliance into a competitive advantage rather than a growth blocker.

Would you be open to a 25-minute call to discuss how we can secure your EU expansion while keeping development costs low?

Best regards,
[Your Name]
SaaS Growth Specialist
WCAGAI`,
    estimatedOpenRate: 34,
    estimatedReplyRate: 7,
    difficulty: "medium",
  },
  {
    name: "Government Compliance Focus",
    category: "cold-outreach",
    industry: "government",
    subjectLine: "EAA 2025: [Organization] citizen services compliance deadline approaching",
    bodyTemplate: `Hi [Name],

I'm writing to you about an urgent compliance matter affecting [Organization]'s digital citizen services.

The European Accessibility Act requires all public sector websites and applications to be WCAG 2.1 AA compliant by June 28, 2025. With only [DAYS] remaining, non-compliance will result in:

• **Legal action** from disability rights organizations
• **Citizen complaints** and negative media coverage
• **Fines and penalties** under EAA enforcement
• **Exclusion** of citizens with disabilities from essential services

[Organization] serves [citizen count] citizens through [number] digital services, making immediate action critical.

WCAGAI 4.0 is designed specifically for public sector organizations:
• **Comprehensive scanning** of all government digital properties
• **Budget-friendly AI remediation** at 98% lower cost than manual fixes
• **Regulatory compliance reports** for auditors and oversight bodies
• **Citizen access optimization** for all disabilities

We can assess your entire digital estate in days, not months, and provide a complete compliance roadmap.

Would you be available for a consultation next week to discuss how we can ensure full EAA 2025 compliance for all your citizen services?

Best regards,
[Your Name]
Public Sector Compliance Specialist
WCAGAI`,
    estimatedOpenRate: 42,
    estimatedReplyRate: 9,
    difficulty: "hard",
  },
];

export const followUpTemplatesSeed = [
  {
    name: "Follow-Up 1: Urgency Reminder (3 days)",
    category: "follow-up",
    sequencePosition: 1,
    subjectLine: "Re: [Original Subject]",
    bodyTemplate: `Hi [Name],

Following up on my email about the EAA 2025 deadline approaching.

With only [DAYS] days until June 28, 2025, I wanted to emphasize that [Company Name] is in a critical window for compliance planning. Companies that wait until the last minute typically face:

• **3x higher remediation costs** due to rush pricing
• **Developer resource shortages** as everyone scrambles to comply
• **Potential business disruption** during emergency fixes

Our AI-powered approach can get you compliant quickly and cost-effectively.

Are you available for a brief 15-minute call this week to see your current compliance score?

Best regards,
[Your Name]`,
    estimatedOpenRate: 38,
    estimatedReplyRate: 5,
  },
  {
    name: "Follow-Up 2: Value Add (7 days)",
    category: "follow-up",
    sequencePosition: 2,
    subjectLine: "EAA 2025 compliance: Free compliance report for [Company Name]",
    bodyTemplate: `Hi [Name],

I wanted to share something valuable with you - we've created a complimentary EAA 2025 Risk Assessment for companies in your industry.

The report shows:
• **Industry benchmark data** (fintech: 69% compliance, healthcare: 26%)
• **Fine calculation worksheet** based on your website traffic
• **ROI calculator** for accessibility investments
• **Compliance timeline** for meeting the June 28 deadline

I can run a quick scan of [Company Name]'s platform and populate this report with your specific data - no cost or obligation.

Would you be interested in seeing your personalized compliance risk assessment?

Best regards,
[Your Name]`,
    estimatedOpenRate: 35,
    estimatedReplyRate: 8,
  },
];
