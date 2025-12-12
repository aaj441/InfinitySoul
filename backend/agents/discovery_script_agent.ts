/**
 * Discovery Script Agent
 * Generates customized discovery call scripts using LLM
 */

import { ClientProfile } from "../cyber/risk_models";
import { RiskAssessmentResult } from "../cyber/domain_engine";

export interface DiscoveryScriptOptions {
  niche: string;
  clientProfile: ClientProfile;
  riskReport: RiskAssessmentResult;
}

export class DiscoveryScriptAgent {
  private llmClient: any;

  constructor(llmClient?: any) {
    this.llmClient = llmClient;
  }

  /**
   * Generate discovery call script
   */
  async generate(options: DiscoveryScriptOptions): Promise<string> {
    const { niche, clientProfile, riskReport } = options;

    // If LLM client is available, use it
    if (this.llmClient) {
      return this.generateWithLLM(options);
    }

    // Otherwise, return template-based script
    return this.generateTemplate(options);
  }

  /**
   * Generate script using LLM
   */
  private async generateWithLLM(options: DiscoveryScriptOptions): Promise<string> {
    const prompt = this.buildPrompt(options);
    
    // This would integrate with OpenAI or Anthropic
    // For now, return template
    return this.generateTemplate(options);
  }

  /**
   * Generate template-based script
   */
  private generateTemplate(options: DiscoveryScriptOptions): string {
    const { niche, clientProfile, riskReport } = options;
    const industry = clientProfile.industry || "your industry";
    const revenue = clientProfile.revenue || 0;
    const premium = riskReport.estimated_premium;

    const script = `
# Discovery Call Script - ${niche.replace("_", " ").toUpperCase()}

## Opening (2 minutes)
"Hi [Name], thanks for taking the time to speak with me today. I've reviewed the information you provided, and I'd like to walk through your specific cyber risk profile and how we can protect your ${industry} business."

## Current State Assessment (5 minutes)

**Technology & Infrastructure:**
- "Walk me through your current technology setup..."
${this.getTechQuestions(niche)}

**Security Controls:**
- "Tell me about your current cybersecurity measures..."
${this.getSecurityQuestions(niche)}

**Business Operations:**
- "How would a cyber incident impact your day-to-day operations?"
${this.getOperationsQuestions(niche)}

## Risk Profile Discussion (5 minutes)

"Based on the assessment we ran, I want to share some findings:

- **Risk Level:** ${this.getRiskLevel(riskReport.loss_probability)}
- **Estimated Annual Premium:** $${premium.toLocaleString()}
- **Key Exposures:** ${this.getKeyExposures(niche)}

${this.getNicheSpecificInsights(niche, clientProfile)}

## Coverage Options (5 minutes)

"Let me walk you through the coverage options that make sense for ${industry} businesses:

${this.getCoverageExplanation(niche)}

## Budget & Timeline (3 minutes)

- "What's your current budget allocation for insurance and risk management?"
- "When does your current policy renew, or when would you like coverage to start?"
- "Who else needs to be involved in this decision?"

## Next Steps (2 minutes)

"Here's what I propose:
1. I'll send you a detailed proposal with ${riskReport.recommended_carriers.length} carrier options
2. We'll schedule a 15-minute follow-up to review questions
3. If everything looks good, we can have coverage bound within 48 hours

Does that timeline work for you?"

## Closing

"Any questions before we wrap up? I'm here to make this as simple as possible for you."
`;

    return script.trim();
  }

  private getTechQuestions(niche: string): string {
    const questions: Record<string, string[]> = {
      healthcare: [
        "What EHR/EMR system do you use?",
        "Is it cloud-based or on-premise?",
        "How do you handle patient data backups?",
      ],
      law_firm: [
        "What document management system do you use?",
        "How do you handle client communications (email encryption)?",
        "Where are case files stored?",
      ],
      nonprofit: [
        "What donor management system do you use?",
        "How do you process online donations?",
        "Who has access to donor data?",
      ],
      generic: [
        "What business-critical systems do you rely on?",
        "How is customer data stored and protected?",
        "What happens if your systems go down?",
      ],
    };

    return (questions[niche] || questions.generic).map((q) => `  - "${q}"`).join("\n");
  }

  private getSecurityQuestions(niche: string): string {
    return `  - "Do you use multi-factor authentication (MFA)?"
  - "Do you have endpoint detection and response (EDR) software?"
  - "How often do you backup critical data?"
  - "When was your last security assessment or penetration test?"`;
  }

  private getOperationsQuestions(niche: string): string {
    const questions: Record<string, string[]> = {
      healthcare: [
        "What happens if you can't access patient records for 24 hours?",
        "How long can you operate without your EHR system?",
      ],
      law_firm: [
        "How would a ransomware attack impact active cases?",
        "What's your backup plan if client files are encrypted?",
      ],
      generic: [
        "How long can your business operate without critical systems?",
        "What's the financial impact of 24-48 hours of downtime?",
      ],
    };

    return (questions[niche] || questions.generic).map((q) => `  - "${q}"`).join("\n");
  }

  private getRiskLevel(lossProbability: number): string {
    if (lossProbability < 0.05) return "Low";
    if (lossProbability < 0.10) return "Moderate";
    if (lossProbability < 0.15) return "Elevated";
    return "High";
  }

  private getKeyExposures(niche: string): string {
    const exposures: Record<string, string> = {
      healthcare: "HIPAA violations, patient data exposure, EHR ransomware",
      law_firm: "Client data breaches, wire fraud, privileged communication exposure",
      nonprofit: "Donor data exposure, payment fraud, grant compliance violations",
      generic: "Data breaches, business interruption, ransomware, social engineering",
    };

    return exposures[niche] || exposures.generic;
  }

  private getNicheSpecificInsights(niche: string, profile: ClientProfile): string {
    const insights: Record<string, string> = {
      healthcare: `With ${profile.employee_count || "your"} employees accessing patient data, you're especially vulnerable to insider threats and phishing attacks targeting healthcare credentials.`,
      law_firm: `Law firms are 300% more likely to be targeted for wire fraud. Your client trust accounts and real estate closings are prime targets.`,
      nonprofit: `Nonprofits see 55% of cyber attacks during year-end giving season. Donor trust is irreplaceable once lost to a breach.`,
      generic: `Businesses your size typically face 3-4 cyber incidents per year. Most are preventable with the right controls and coverage.`,
    };

    return insights[niche] || insights.generic;
  }

  private getCoverageExplanation(niche: string): string {
    return `- **First-Party Coverage:** Incident response, forensics, notification, credit monitoring
- **Third-Party Coverage:** Lawsuits, regulatory defense, fines (where insurable)
- **Business Interruption:** Lost income during system downtime
- **Ransomware:** Payment, negotiation, restoration costs`;
  }

  private buildPrompt(options: DiscoveryScriptOptions): string {
    const { niche, clientProfile, riskReport } = options;

    return `Generate a detailed discovery call script for a cyber insurance sales call.

Industry: ${niche}
Client Revenue: $${clientProfile.revenue}
Risk Level: ${this.getRiskLevel(riskReport.loss_probability)}
Estimated Premium: $${riskReport.estimated_premium}

Focus on:
1. Understanding their current cybersecurity posture
2. Identifying gaps and vulnerabilities
3. Explaining coverage options specific to ${niche}
4. Building trust and urgency
5. Clear next steps

Format as a structured script with sections, timing, and sample questions.`;
  }
}
