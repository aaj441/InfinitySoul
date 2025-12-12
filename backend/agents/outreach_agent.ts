/**
 * Outreach Agent
 * Generates personalized email outreach sequences using templates and LLM
 */

import { ClientProfile } from "../cyber/risk_models";
import { RiskAssessmentResult } from "../cyber/domain_engine";

export interface OutreachOptions {
  niche: string;
  clientProfile: ClientProfile;
  riskReport: RiskAssessmentResult;
}

export interface EmailSequence {
  subject: string;
  body: string;
  dayOffset: number;
  type: "initial" | "followup" | "value_add" | "closing";
}

export interface OutreachOutput {
  emails: EmailSequence[];
  cadence: string[];
}

export class OutreachAgent {
  private llmClient: any;

  constructor(llmClient?: any) {
    this.llmClient = llmClient;
  }

  /**
   * Generate outreach sequence
   */
  async generate(options: OutreachOptions): Promise<OutreachOutput> {
    const { niche, clientProfile, riskReport } = options;

    // If LLM client is available, use it
    if (this.llmClient) {
      return this.generateWithLLM(options);
    }

    // Otherwise, return template-based sequence
    return this.generateTemplate(options);
  }

  /**
   * Generate sequence using LLM
   */
  private async generateWithLLM(options: OutreachOptions): Promise<OutreachOutput> {
    // This would integrate with OpenAI or Anthropic
    // For now, return template
    return this.generateTemplate(options);
  }

  /**
   * Generate template-based sequence
   */
  private generateTemplate(options: OutreachOptions): OutreachOutput {
    const { niche, clientProfile, riskReport } = options;
    const industry = clientProfile.industry || "your industry";
    const companyName = clientProfile.company_name || "your organization";

    const emails: EmailSequence[] = [
      // Email 1: Initial outreach
      {
        subject: this.getInitialSubject(niche),
        body: this.getInitialEmail(niche, clientProfile, riskReport),
        dayOffset: 0,
        type: "initial",
      },

      // Email 2: Value-add follow-up (Day 3)
      {
        subject: `Quick question about ${companyName}'s cyber risk`,
        body: this.getFollowupEmail1(niche, clientProfile),
        dayOffset: 3,
        type: "followup",
      },

      // Email 3: Educational value (Day 7)
      {
        subject: this.getEducationalSubject(niche),
        body: this.getEducationalEmail(niche, clientProfile),
        dayOffset: 7,
        type: "value_add",
      },

      // Email 4: Case study (Day 10)
      {
        subject: `How we helped a ${industry} business avoid a $500K breach`,
        body: this.getCaseStudyEmail(niche),
        dayOffset: 10,
        type: "value_add",
      },

      // Email 5: Final follow-up (Day 14)
      {
        subject: "Should I close your file?",
        body: this.getClosingEmail(niche, companyName),
        dayOffset: 14,
        type: "closing",
      },
    ];

    const cadence = [
      "Day 0: Initial outreach with risk assessment",
      "Day 3: Follow-up on assessment",
      "Day 7: Educational content",
      "Day 10: Case study",
      "Day 14: Final check-in",
    ];

    return { emails, cadence };
  }

  private getInitialSubject(niche: string): string {
    const subjects: Record<string, string> = {
      healthcare: "Your practice's HIPAA breach risk score",
      law_firm: "Cyber risk assessment for [Firm Name]",
      nonprofit: "Protecting your donors' trust - Free cyber assessment",
      generic: "Free 60-second cyber risk assessment results",
    };

    return subjects[niche] || subjects.generic;
  }

  private getInitialEmail(
    niche: string,
    profile: ClientProfile,
    risk: RiskAssessmentResult
  ): string {
    const industry = profile.industry || "your industry";
    const premium = risk.estimated_premium;

    return `Hi [Name],

I ran a quick cyber risk assessment for ${profile.company_name || "your business"}, and wanted to share some concerning findings.

**Key findings:**
- Risk level: ${this.getRiskLevel(risk.loss_probability)}
- Estimated breach cost: ${this.getBreachCost(profile)}
- Estimated annual premium: $${premium.toLocaleString()}
- Current exposures: ${this.getTopExposures(niche)}

${this.getNichePainPoint(niche)}

I've helped ${industry} businesses reduce their cyber risk and secure affordable coverage. Can we schedule a 15-minute call to walk through your specific situation?

**Free offer:** Full risk assessment report + personalized recommendations

Book a time here: [Calendar Link]

Best regards,
[Your Name]
[Your Title]

P.S. ${this.getPSLine(niche)}`;
  }

  private getFollowupEmail1(niche: string, profile: ClientProfile): string {
    return `Hi [Name],

Following up on the cyber risk assessment I sent a few days ago.

I know you're busy, so I'll keep this brief: ${this.getQuickWin(niche)}

This alone could reduce your risk by 30-40%.

Want to schedule a quick call to discuss? It'll take 15 minutes max.

[Calendar Link]

Best,
[Your Name]`;
  }

  private getEducationalSubject(niche: string): string {
    const subjects: Record<string, string> = {
      healthcare: "3 HIPAA violations that trigger OCR audits",
      law_firm: "Wire fraud is targeting law firms - here's how to protect yourself",
      nonprofit: "Why nonprofits are prime targets for cybercriminals",
      generic: "The #1 cyber threat facing businesses in 2025",
    };

    return subjects[niche] || subjects.generic;
  }

  private getEducationalEmail(niche: string, profile: ClientProfile): string {
    return `Hi [Name],

I wanted to share something relevant to ${profile.industry || "your industry"} businesses.

${this.getEducationalContent(niche)}

This is exactly what cyber insurance covers - and why it's critical for ${profile.company_name || "businesses like yours"}.

If you're interested in learning more about how to protect yourself, let's schedule a brief call.

[Calendar Link]

Worth a conversation?

Best,
[Your Name]

---
${this.getEducationalResource(niche)}`;
  }

  private getCaseStudyEmail(niche: string): string {
    return `Hi [Name],

Quick story that might resonate:

${this.getCaseStudy(niche)}

The lesson: Cyber insurance isn't just about transferring risk - it's about having resources and expertise when (not if) something happens.

Want to make sure you're protected? Let's talk.

[Calendar Link]

Best,
[Your Name]`;
  }

  private getClosingEmail(niche: string, companyName: string): string {
    return `Hi [Name],

I've reached out a few times about ${companyName}'s cyber risk exposure, but haven't heard back.

That's totally fine - I know priorities shift.

Before I close your file, I wanted to ask: Is this just not a priority right now, or is there something specific holding you back?

If it's the latter, I'd love to address it.

If it's the former, no worries - I'll check back in a few months.

Either way, here's that free risk assessment report: [Link]

Best of luck,
[Your Name]`;
  }

  // Helper methods

  private getRiskLevel(lossProbability: number): string {
    if (lossProbability < 0.05) return "Low";
    if (lossProbability < 0.10) return "Moderate";
    if (lossProbability < 0.15) return "Elevated";
    return "High";
  }

  private getBreachCost(profile: ClientProfile): string {
    const revenue = profile.revenue || 1000000;
    const baseCost = Math.min(revenue * 0.05, 500000);
    return `$${baseCost.toLocaleString()}`;
  }

  private getTopExposures(niche: string): string {
    const exposures: Record<string, string> = {
      healthcare: "HIPAA violations, ransomware, patient data exposure",
      law_firm: "Wire fraud, client data breaches, ransomware",
      nonprofit: "Donor data exposure, payment fraud, ransomware",
      generic: "Ransomware, data breaches, business interruption",
    };

    return exposures[niche] || exposures.generic;
  }

  private getNichePainPoint(niche: string): string {
    const painPoints: Record<string, string> = {
      healthcare:
        "Healthcare practices face an average of $408 per record in breach costs - and that's before HIPAA fines.",
      law_firm:
        "Law firms are 300% more likely to be targeted for wire fraud. One successful attack can cost $500K+.",
      nonprofit:
        "A single donor data breach can destroy years of trust and fundraising momentum.",
      generic:
        "The average cyber incident costs SMBs $200K - many don't survive without insurance.",
    };

    return painPoints[niche] || painPoints.generic;
  }

  private getPSLine(niche: string): string {
    const psLines: Record<string, string> = {
      healthcare: "OCR is ramping up HIPAA audits in 2025. Don't wait until you're on the list.",
      law_firm: "State bar associations are now requiring cybersecurity policies. Get ahead of it.",
      nonprofit: "Grant funders are starting to require cyber coverage. Protect your funding.",
      generic: "Cyber insurance rates are rising 20% annually. Lock in coverage now.",
    };

    return psLines[niche] || psLines.generic;
  }

  private getQuickWin(niche: string): string {
    return "Enable MFA on all email accounts and admin systems";
  }

  private getEducationalContent(niche: string): string {
    const content: Record<string, string> = {
      healthcare: `OCR just announced they're increasing HIPAA audits by 40% in 2025. The top 3 violations they're looking for:

1. Lack of risk assessments
2. Insufficient access controls
3. Missing Business Associate Agreements

Each violation carries fines up to $50,000 per incident.`,
      law_firm: `Wire fraud targeting law firms is up 300% since 2020. Here's the most common attack:

1. Hacker compromises attorney email
2. Monitors real estate closing communications
3. Sends fake wire instructions to client
4. Client wires $200K+ to fraudulent account

The firm is often held liable. Cyber insurance covers this.`,
      generic: `Ransomware attacks are evolving. Attackers now:

1. Steal data before encrypting
2. Threaten to publish if you don't pay
3. Target backups first

Average ransom demand: $200K. Average recovery cost: $2M+.`,
    };

    return content[niche] || content.generic;
  }

  private getEducationalResource(niche: string): string {
    return `📚 Free resource: [Download our ${niche} cyber security checklist]`;
  }

  private getCaseStudy(niche: string): string {
    const cases: Record<string, string> = {
      healthcare: `A dental practice in Texas got hit with ransomware on a Friday afternoon. Their entire patient database was encrypted.

Without cyber insurance:
- $150K ransom payment (Bitcoin)
- $200K in lost revenue (3 weeks downtime)
- $100K in patient notification costs
Total: $450K

With cyber insurance:
- $150K ransom payment (covered)
- $200K business interruption (covered)
- $100K notification costs (covered)
Out-of-pocket: $25K deductible

Their annual premium? $8,500.`,
      generic: `A manufacturing company got phished. Attacker got into their accounting system and changed vendor payment details.

They wired $350K to a fraudulent account before catching it.

Their cyber insurance:
- Covered the $350K loss
- Paid for forensic investigation
- Provided legal counsel
- Handled FBI reporting

Their annual premium? $12,000.`,
    };

    return cases[niche] || cases.generic;
  }
}
