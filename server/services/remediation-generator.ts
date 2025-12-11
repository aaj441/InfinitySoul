import { db } from "../db";
import { remediations, scanResults, prospects } from "@shared/schema";
import { eq } from "drizzle-orm";
import { Anthropic } from "@anthropic-ai/sdk";
import { getIndustryData } from "./industry-insights";

const client = new Anthropic({
  apiKey: process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL,
});

export interface RemediationRequest {
  scanJobId: string;
  prospectId: string;
  violations: Array<{
    violationId: string;
    type: string;
    description: string;
    element?: string;
  }>;
}

export async function generateRemediations(
  req: RemediationRequest
): Promise<any[]> {
  const results = [];

  // Get prospect industry data for context
  const prospect = await db
    .select()
    .from(prospects)
    .where(eq(prospects.id, req.prospectId))
    .limit(1);

  const industryContext = prospect.length > 0 
    ? await getIndustryData(prospect[0].industry || "Generic")
    : null;

  for (const violation of req.violations) {
    try {
      // Industry-aware remediation context
      const industryHint = industryContext
        ? `\n\nIndustry context (${industryContext.industryName}): ${industryContext.remediationContextHints}`
        : "";

      // Call Claude for remediation suggestion with industry context
      const message = await client.messages.create({
        model: "claude-opus-4-1",
        max_tokens: 500,
        messages: [
          {
            role: "user",
            content: `You are a ${industryContext?.industryName || "generic"} accessibility expert. Provide a concise fix for this WCAG violation:
Type: ${violation.type}
Description: ${violation.description}
Element: ${violation.element || "unknown"}${industryHint}

Respond in JSON format:
{
  "fixSuggestion": "specific fix instructions",
  "effortHours": number (1-40),
  "priority": "critical|high|medium|low"
}`,
          },
        ],
      });

      const content = message.content[0];
      if (content.type !== "text") {
        throw new Error("Unexpected response type");
      }

      const parsed = JSON.parse(content.text);
      const effortHours = Math.min(Math.max(parsed.effortHours || 5, 1), 40);
      const estimatedCost = Math.round(effortHours * 150); // $150/hour rate

      // Trigger upsell if effort > 20 hours
      const upsellTriggered = effortHours > 20;

      const remediation = await db
        .insert(remediations)
        .values({
          scanJobId: req.scanJobId,
          prospectId: req.prospectId,
          violationId: violation.violationId,
          fixSuggestion: parsed.fixSuggestion || "Professional consultation required",
          effortHours,
          priority: parsed.priority || "medium",
          estimatedCost,
          upsellTriggered,
        })
        .returning();

      results.push(remediation[0]);
    } catch (error) {
      console.error(`Failed to generate remediation for ${violation.violationId}:`, error);
      // Create fallback remediation
      const remediation = await db
        .insert(remediations)
        .values({
          scanJobId: req.scanJobId,
          prospectId: req.prospectId,
          violationId: violation.violationId,
          fixSuggestion: "Professional remediation required for this violation",
          effortHours: 10,
          priority: "medium",
          estimatedCost: 1500,
          upsellTriggered: false,
        })
        .returning();

      results.push(remediation[0]);
    }
  }

  return results;
}

export async function getRemediations(scanJobId: string): Promise<any[]> {
  return db.select().from(remediations).where(eq(remediations.scanJobId, scanJobId));
}

export async function getUpsellRemediations(prospectId: string): Promise<any[]> {
  return db
    .select()
    .from(remediations)
    .where(eq(remediations.prospectId, prospectId))
    .then(results => results.filter(r => r.upsellTriggered));
}
