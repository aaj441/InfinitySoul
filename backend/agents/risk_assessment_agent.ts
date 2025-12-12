/**
 * Cyber Risk Assessment Agent
 * Performs comprehensive cyber risk assessment using the CyberDomainEngine
 */

import { CyberDomainEngine, RiskAssessmentResult } from "../cyber/domain_engine";
import { ClientProfile } from "../cyber/risk_models";

export interface CoverageMap {
  recommended_limits: string;
  coverages: string[];
}

export interface RiskAssessmentOutput {
  risk_report: RiskAssessmentResult;
  coverage_map: CoverageMap;
  recommended_carriers: any[];
}

export class CyberRiskAssessmentAgent {
  private engine: CyberDomainEngine;

  constructor(domainEngine: CyberDomainEngine) {
    this.engine = domainEngine;
  }

  /**
   * Run cyber risk assessment for a client
   */
  run(enrichedLeadData: ClientProfile, niche: string): RiskAssessmentOutput {
    // Set the appropriate niche context
    this.engine.setNiche(niche);

    // Run the risk assessment
    const riskBundle = this.engine.assessRisk(enrichedLeadData);

    // Generate coverage map based on niche
    const coverageMap = this.generateCoverageMap(niche, riskBundle);

    return {
      risk_report: riskBundle,
      coverage_map: coverageMap,
      recommended_carriers: riskBundle.recommended_carriers,
    };
  }

  /**
   * Generate coverage map based on niche and risk profile
   */
  private generateCoverageMap(
    niche: string,
    riskBundle: RiskAssessmentResult
  ): CoverageMap {
    const baseLimit = riskBundle.client_profile.revenue || 1000000;
    const recommendedLimit = Math.min(baseLimit, 5000000);

    // Determine recommended limits as a string
    const limits = `${this.formatCurrency(
      recommendedLimit
    )}/${this.formatCurrency(recommendedLimit * 2)}`;

    // Get coverages based on niche
    const coverages = this.getCoveragesByNiche(niche);

    return {
      recommended_limits: limits,
      coverages,
    };
  }

  /**
   * Get coverage priorities by niche
   */
  private getCoveragesByNiche(niche: string): string[] {
    const coverageMap: Record<string, string[]> = {
      healthcare: [
        "HIPAA breach notification and response",
        "Protected Health Information (PHI) exposure",
        "Regulatory defense (OCR investigations)",
        "Business interruption (EHR downtime)",
        "Ransomware & extortion",
        "Crisis management",
      ],
      law_firm: [
        "Client data breach notification",
        "Professional liability (cyber E&O)",
        "Social engineering fraud (wire transfer fraud)",
        "Ransomware & extortion",
        "Business interruption",
        "Regulatory defense",
      ],
      nonprofit: [
        "Donor data breach notification",
        "Payment card data exposure (PCI-DSS)",
        "Funds transfer fraud",
        "Ransomware & extortion",
        "Business interruption",
        "Crisis management",
      ],
      technology: [
        "Data breach response",
        "Business interruption",
        "Ransomware & extortion",
        "Network security liability",
        "Media liability",
        "Regulatory defense",
      ],
      generic: [
        "Data breach response",
        "Regulatory defense & fines (where insurable)",
        "Business interruption",
        "Ransomware & extortion",
        "Social engineering fraud",
        "Network security liability",
      ],
    };

    return coverageMap[niche] || coverageMap["generic"];
  }

  /**
   * Format currency for display
   */
  private formatCurrency(amount: number): string {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K`;
    }
    return amount.toString();
  }
}
