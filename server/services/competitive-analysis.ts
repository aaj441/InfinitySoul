import { db } from "../db";
import { competitiveReports, prospects, scanJobs } from "@shared/schema";
import { eq } from "drizzle-orm";
import { getIndustryData } from "./industry-insights";

export interface CompetitorData {
  url: string;
  wcagScore: number;
  violationCount: number;
}

export async function generateCompetitiveReport(
  prospectId: string,
  competitorUrls: CompetitorData[]
): Promise<any[]> {
  const prospect = await db
    .select()
    .from(prospects)
    .where(eq(prospects.id, prospectId))
    .limit(1);

  if (!prospect.length) {
    throw new Error("Prospect not found");
  }

  const prospectScore = prospect[0].icpScore || 0;
  const industryData = await getIndustryData(prospect[0].industry || "Generic");
  const results = [];

  for (const competitor of competitorUrls) {
    const benchmarkGap = prospectScore - competitor.wcagScore;
    const competitorDomain = competitor.url.replace(/^https?:\/\//, "");

    // Industry-aware social proof
    const socialProofTemplate = industryData.socialProofTemplates?.[0] || 
      `Industry leaders in ${prospect[0].industry} are prioritizing accessibility compliance`;
    
    const socialProof =
      benchmarkGap > 0
        ? `You outrank ${competitorDomain} in accessibility by ${benchmarkGap} points. ${socialProofTemplate}`
        : `${competitorDomain} leads you by ${Math.abs(benchmarkGap)} points. ${socialProofTemplate}`;

    // Industry-aware email snippet with lawsuit data
    const emailSnippet =
      benchmarkGap > 0
        ? `Your competitors (like ${competitorDomain}) are ${competitor.violationCount} violations behind on accessibility. ${industryData.lawsuitDataPoint} Position yourself as the compliant leader.`
        : `${industryData.lawsuitDataPoint} Industry peers like ${competitorDomain} have already achieved WCAG compliance. Closing this gap protects your business and differentiates your brand.`;

    const report = await db
      .insert(competitiveReports)
      .values({
        prospectId,
        competitorUrl: competitor.url,
        wcagScore: competitor.wcagScore,
        violationCount: competitor.violationCount,
        benchmarkGap,
        socialProof,
        emailSnippet,
      })
      .returning();

    results.push(report[0]);
  }

  return results;
}

export async function getCompetitiveAnalysis(prospectId: string): Promise<any[]> {
  return db
    .select()
    .from(competitiveReports)
    .where(eq(competitiveReports.prospectId, prospectId));
}

export async function generateEmailSnippets(
  prospectId: string
): Promise<string[]> {
  const reports = await getCompetitiveAnalysis(prospectId);
  return reports.map((r) => r.emailSnippet);
}
