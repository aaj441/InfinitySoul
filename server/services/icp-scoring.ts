import { db } from "../db";
import { leadScores, prospects } from "@shared/schema";
import { eq } from "drizzle-orm";
import { getIndustryData } from "./industry-insights";

export interface ICPScoringFactors {
  companySize: number; // 0-100
  verticalFit: number; // 0-100
  engagementVelocity: number; // 0-100
  complianceGap: number; // 0-100
  industryComplianceBoost?: number; // Industry-specific boost (0-20)
}

export async function scoreProspect(
  prospectId: string,
  factors: ICPScoringFactors
): Promise<any> {
  // Get prospect to access industry data
  const prospect = await db
    .select()
    .from(prospects)
    .where(eq(prospects.id, prospectId))
    .limit(1);

  let industryComplianceBoost = factors.industryComplianceBoost || 0;
  if (prospect.length > 0 && prospect[0].industry) {
    const industryData = await getIndustryData(prospect[0].industry);
    // Add industry-specific compliance urgency boost
    industryComplianceBoost = Math.round(
      industryData.complianceUrgencyScore / 10
    ); // 0-10 scale boost
  }

  // Enhanced weighted scoring: 25% size, 30% vertical, 25% engagement, 20% compliance (with industry boost)
  const adjustedComplianceGap = Math.min(
    100,
    factors.complianceGap + industryComplianceBoost
  );
  const overallScore = Math.round(
    factors.companySize * 0.25 +
      factors.verticalFit * 0.3 +
      factors.engagementVelocity * 0.25 +
      adjustedComplianceGap * 0.2
  );

  // Determine tier based on overall score and factors
  let tier = "SMB";
  if (overallScore >= 75 && factors.companySize >= 70) {
    tier = "Enterprise";
  } else if (overallScore >= 60 && factors.companySize >= 50) {
    tier = "Mid-Market";
  }

  // Determine next action (with industry-aware urgency)
  let nextAction = "research";
  if (overallScore >= 80 || (overallScore >= 70 && industryComplianceBoost > 5)) {
    nextAction = "demo";
  } else if (overallScore >= 70 || (overallScore >= 50 && industryComplianceBoost > 3)) {
    nextAction = "outreach";
  } else if (overallScore >= 50) {
    nextAction = "nurture";
  }

  // Upsert lead score
  const existing = await db
    .select()
    .from(leadScores)
    .where(eq(leadScores.prospectId, prospectId))
    .limit(1);

  let result;
  if (existing.length > 0) {
    result = await db
      .update(leadScores)
      .set({
        companySize: factors.companySize,
        verticalFit: factors.verticalFit,
        engagementVelocity: factors.engagementVelocity,
        complianceGap: adjustedComplianceGap,
        overallScore,
        tier,
        nextAction,
      })
      .where(eq(leadScores.prospectId, prospectId))
      .returning();
  } else {
    result = await db
      .insert(leadScores)
      .values({
        prospectId,
        companySize: factors.companySize,
        verticalFit: factors.verticalFit,
        engagementVelocity: factors.engagementVelocity,
        complianceGap: adjustedComplianceGap,
        overallScore,
        tier,
        nextAction,
      })
      .returning();
  }

  // Update prospect ICP score
  await db
    .update(prospects)
    .set({ icpScore: overallScore })
    .where(eq(prospects.id, prospectId));

  return result[0];
}

export async function getProspectScore(prospectId: string): Promise<any> {
  const score = await db
    .select()
    .from(leadScores)
    .where(eq(leadScores.prospectId, prospectId))
    .limit(1);

  return score[0] || null;
}

export async function getTopLeads(limit: number = 10): Promise<any[]> {
  return db
    .select()
    .from(leadScores)
    .orderBy((t) => t.overallScore)
    .limit(limit);
}
