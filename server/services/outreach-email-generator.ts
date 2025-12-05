import { logger } from "../logger";
import Anthropic from "@anthropic-ai/sdk";

export interface OutreachEmailContext {
  companyName: string;
  contactName?: string;
  industry: string;
  violations: {
    count: number;
    critical: number;
    serious: number;
    moderate: number;
  };
  riskLevel: "high-risk" | "medium-risk" | "low-risk";
  wcagScore: number;
  fineEstimate?: number;
}

export interface GeneratedOutreachEmail {
  subject: string;
  body: string;
  cta: string;
  followUpDays: number[];
}

export class OutreachEmailGenerator {
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic();
  }

  async generateDebtCollectorOutreach(context: OutreachEmailContext): Promise<GeneratedOutreachEmail> {
    const prompt = `Generate a professional, cold outreach email for a debt collection company with accessibility compliance issues.

Context:
- Company: ${context.companyName}
- Industry: ${context.industry}
- WCAG Violations: ${context.violations.count} total (${context.violations.critical} critical, ${context.violations.serious} serious)
- Risk Level: ${context.riskLevel}
- WCAG Score: ${context.wcagScore}%
- Estimated Fine Exposure: $${context.fineEstimate?.toLocaleString() || "50,000-450,000"}

Requirements:
1. Use AIDA framework (Attention, Interest, Desire, Action)
2. Lead with the legal risk and real compliance issue
3. Mention specific violation counts and ADA exposure
4. Be concise (under 150 words)
5. Include a low-friction CTA for a 15-minute call
6. Provide subject line (max 60 chars)
7. Include suggested follow-up timing

Format your response as JSON with: { "subject": "...", "body": "...", "cta": "...", "followUpDays": [3, 7] }`;

    try {
      const response = await this.client.messages.create({
        model: "claude-opus-4-1-20250805",
        max_tokens: 500,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const content = response.content[0];
      if (content.type !== "text") {
        throw new Error("Unexpected response type");
      }

      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Could not parse JSON from response");
      }

      const parsed = JSON.parse(jsonMatch[0]);

      logger.info(`Generated outreach email for ${context.companyName}`);

      return {
        subject: parsed.subject || "Urgent: Accessibility Compliance Alert",
        body: parsed.body || "",
        cta: parsed.cta || "Let's chat about solutions",
        followUpDays: parsed.followUpDays || [3, 7],
      };
    } catch (error) {
      logger.error("Failed to generate outreach email", error as Error);
      throw error;
    }
  }

  async generateFollowUpEmail(
    context: OutreachEmailContext,
    dayNumber: number
  ): Promise<GeneratedOutreachEmail> {
    const prompt = `Generate a follow-up email (day ${dayNumber}) for a debt collection company regarding accessibility compliance.

Context:
- Company: ${context.companyName}
- Previous violations: ${context.violations.count} accessibility issues
- Risk level: ${context.riskLevel}

Requirements:
1. Reference the initial outreach
2. Add urgency (especially if day > 5)
3. Provide specific next steps
4. Keep it brief (under 100 words)
5. Include a calendar link suggestion

Format: { "subject": "...", "body": "...", "cta": "...", "followUpDays": [] }`;

    try {
      const response = await this.client.messages.create({
        model: "claude-opus-4-1-20250805",
        max_tokens: 400,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const content = response.content[0];
      if (content.type !== "text") {
        throw new Error("Unexpected response type");
      }

      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Could not parse JSON from response");
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return {
        subject: parsed.subject || `Follow-up: ${context.companyName} Accessibility Alert`,
        body: parsed.body || "",
        cta: parsed.cta || "Let's schedule a time to discuss",
        followUpDays: parsed.followUpDays || [],
      };
    } catch (error) {
      logger.error("Failed to generate follow-up email", error as Error);
      throw error;
    }
  }
}

export const outreachEmailGenerator = new OutreachEmailGenerator();
