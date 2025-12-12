/**
 * Qualification Agent
 * Determines if a lead is qualified and identifies the appropriate niche
 */

export interface LeadData {
  industry?: string;
  revenue?: number;
  employee_count?: number;
  [key: string]: any;
}

export interface QualificationResult {
  qualification_status: "qualified" | "unqualified";
  niche: string;
  enriched_lead_data: LeadData;
  disqualification_reason?: string;
}

export class QualificationAgent {
  private minRevenueThreshold: number;

  constructor(minRevenueThreshold: number = 100000) {
    this.minRevenueThreshold = minRevenueThreshold;
  }

  /**
   * Run qualification on lead data
   */
  run(leadData: LeadData): QualificationResult {
    const industry = (leadData.industry || "").toLowerCase();
    const revenue = leadData.revenue || 0;

    // Qualification logic
    let status: "qualified" | "unqualified" = "qualified";
    let disqualificationReason: string | undefined;

    if (revenue < this.minRevenueThreshold) {
      status = "unqualified";
      disqualificationReason = `Revenue ${revenue} below minimum threshold ${this.minRevenueThreshold}`;
    }

    // Determine niche based on industry
    const niche = this.determineNiche(industry);

    // Enrich lead data
    const enrichedLeadData: LeadData = {
      ...leadData,
      normalized_industry: industry,
    };

    return {
      qualification_status: status,
      niche,
      enriched_lead_data: enrichedLeadData,
      ...(disqualificationReason && { disqualification_reason: disqualificationReason }),
    };
  }

  /**
   * Determine appropriate niche based on industry
   */
  private determineNiche(industry: string): string {
    // Healthcare indicators
    if (
      industry.includes("health") ||
      industry.includes("clinic") ||
      industry.includes("medical") ||
      industry.includes("dental") ||
      industry.includes("hospital")
    ) {
      return "healthcare";
    }

    // Law firm indicators
    if (
      industry.includes("law") ||
      industry.includes("attorney") ||
      industry.includes("legal") ||
      industry.includes("firm")
    ) {
      return "law_firm";
    }

    // Nonprofit indicators
    if (
      industry.includes("nonprofit") ||
      industry.includes("non-profit") ||
      industry.includes("charity") ||
      industry.includes("charitable") ||
      industry.includes("foundation")
    ) {
      return "nonprofit";
    }

    // Technology indicators
    if (
      industry.includes("tech") ||
      industry.includes("software") ||
      industry.includes("saas") ||
      industry.includes("it ")
    ) {
      return "technology";
    }

    return "generic";
  }
}
