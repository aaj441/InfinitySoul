/**
 * Serial Plaintiff Tracking System
 *
 * Builds profiles of serial ADA plaintiffs based on public court records.
 * Tracks filing patterns, target industries, and litigation strategies.
 */

import { PACERFiling } from './pacerFeed';
import { logger } from '../../../utils/logger';

export interface PlaintiffProfile {
  name: string;
  totalFilings: number;
  filingVelocity: number; // filings per month
  jurisdictions: Array<{
    court: string;
    filingCount: number;
    percentage: number;
  }>;
  targetIndustries: Array<{
    industry: string;
    naicsCode?: string;
    filingCount: number;
    percentage: number;
  }>;
  attorneyNetwork: Array<{
    name: string;
    firm: string;
    casesHandled: number;
  }>;
  settlementPatterns: {
    averageSettlement?: number;
    averageDaysToSettlement?: number;
    settlementRate: number; // percentage of cases settled vs dismissed
  };
  recentActivity: {
    last30Days: number;
    last90Days: number;
    last365Days: number;
  };
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  targetCharacteristics: {
    commonViolations: string[];
    websiteTypes: string[]; // e.g., 'e-commerce', 'service', 'government'
    companySize: string[]; // e.g., 'small', 'medium', 'enterprise'
  };
  firstFilingDate: Date;
  lastFilingDate: Date;
  activeStatus: 'active' | 'inactive' | 'dormant';
}

export interface PlaintiffProximityScore {
  plaintiff: string;
  score: number; // 0-100, how likely this plaintiff is to target this company
  factors: {
    industryMatch: number;
    jurisdictionMatch: number;
    violationMatch: number;
    companySizeMatch: number;
  };
  recommendation: string;
}

export class PlaintiffTracker {
  private plaintiffDatabase: Map<string, PlaintiffProfile> = new Map();

  /**
   * Build plaintiff profile from filing history
   */
  buildPlaintiffProfile(filings: PACERFiling[]): Map<string, PlaintiffProfile> {
    const profiles = new Map<string, PlaintiffProfile>();

    // Group filings by plaintiff
    const filingsByPlaintiff = new Map<string, PACERFiling[]>();

    for (const filing of filings) {
      const existing = filingsByPlaintiff.get(filing.plaintiff) || [];
      existing.push(filing);
      filingsByPlaintiff.set(filing.plaintiff, existing);
    }

    // Build profile for each plaintiff
    for (const [plaintiff, plaintiffFilings] of filingsByPlaintiff.entries()) {
      const profile = this.analyizePlaintiffFilings(plaintiff, plaintiffFilings);
      profiles.set(plaintiff, profile);
    }

    // Update internal database
    this.plaintiffDatabase = profiles;

    logger.info(`Built ${profiles.size} plaintiff profiles from ${filings.length} filings`);
    return profiles;
  }

  /**
   * Analyze individual plaintiff's filing pattern
   */
  private analyizePlaintiffFilings(plaintiff: string, filings: PACERFiling[]): PlaintiffProfile {
    // Sort filings by date
    const sortedFilings = [...filings].sort((a, b) =>
      a.filingDate.getTime() - b.filingDate.getTime()
    );

    const firstFiling = sortedFilings[0];
    const lastFiling = sortedFilings[sortedFilings.length - 1];

    // Calculate filing velocity
    const daysActive = Math.max(
      (lastFiling.filingDate.getTime() - firstFiling.filingDate.getTime()) / (1000 * 60 * 60 * 24),
      1
    );
    const filingVelocity = (filings.length / daysActive) * 30; // per month

    // Analyze jurisdictions
    const jurisdictionMap = new Map<string, number>();
    for (const filing of filings) {
      jurisdictionMap.set(filing.courtCode, (jurisdictionMap.get(filing.courtCode) || 0) + 1);
    }
    const jurisdictions = Array.from(jurisdictionMap.entries())
      .map(([court, count]) => ({
        court,
        filingCount: count,
        percentage: (count / filings.length) * 100
      }))
      .sort((a, b) => b.filingCount - a.filingCount);

    // Analyze industries (would require additional data enrichment)
    const targetIndustries = this.inferIndustries(filings);

    // Analyze attorney network
    const attorneyMap = new Map<string, { firm: string; count: number }>();
    for (const filing of filings) {
      for (const attorney of filing.attorneys.filter(a => a.role === 'plaintiff')) {
        const key = attorney.name;
        const existing = attorneyMap.get(key) || { firm: attorney.firm, count: 0 };
        existing.count++;
        attorneyMap.set(key, existing);
      }
    }
    const attorneyNetwork = Array.from(attorneyMap.entries())
      .map(([name, data]) => ({
        name,
        firm: data.firm,
        casesHandled: data.count
      }))
      .sort((a, b) => b.casesHandled - a.casesHandled);

    // Analyze settlement patterns
    const settledCases = filings.filter(f => f.status === 'settled');
    const settlementPatterns = {
      averageSettlement: this.calculateAverageSettlement(settledCases),
      averageDaysToSettlement: this.calculateAverageDaysToSettlement(settledCases),
      settlementRate: (settledCases.length / filings.length) * 100
    };

    // Calculate recent activity
    const now = new Date();
    const last30Days = filings.filter(f =>
      (now.getTime() - f.filingDate.getTime()) <= 30 * 24 * 60 * 60 * 1000
    ).length;
    const last90Days = filings.filter(f =>
      (now.getTime() - f.filingDate.getTime()) <= 90 * 24 * 60 * 60 * 1000
    ).length;
    const last365Days = filings.filter(f =>
      (now.getTime() - f.filingDate.getTime()) <= 365 * 24 * 60 * 60 * 1000
    ).length;

    // Determine risk level
    const riskLevel = this.calculateRiskLevel(filingVelocity, last30Days, filings.length);

    // Determine active status
    const daysSinceLastFiling = (now.getTime() - lastFiling.filingDate.getTime()) / (1000 * 60 * 60 * 24);
    const activeStatus = daysSinceLastFiling <= 30 ? 'active' :
                        daysSinceLastFiling <= 180 ? 'dormant' : 'inactive';

    return {
      name: plaintiff,
      totalFilings: filings.length,
      filingVelocity,
      jurisdictions,
      targetIndustries,
      attorneyNetwork,
      settlementPatterns,
      recentActivity: {
        last30Days,
        last90Days,
        last365Days
      },
      riskLevel,
      targetCharacteristics: this.inferTargetCharacteristics(filings),
      firstFilingDate: firstFiling.filingDate,
      lastFilingDate: lastFiling.filingDate,
      activeStatus
    };
  }

  /**
   * Infer target industries from defendant names
   */
  private inferIndustries(filings: PACERFiling[]): Array<{industry: string; filingCount: number; percentage: number}> {
    // Industry keywords
    const industryKeywords = {
      'Retail': ['store', 'shop', 'retail', 'mall', 'boutique'],
      'E-Commerce': ['online', '.com', 'digital', 'marketplace'],
      'Food Service': ['restaurant', 'cafe', 'food', 'dining', 'pizza', 'burger'],
      'Healthcare': ['medical', 'health', 'clinic', 'hospital', 'dental'],
      'Hospitality': ['hotel', 'inn', 'resort', 'lodging'],
      'Financial': ['bank', 'credit', 'financial', 'insurance'],
      'Professional Services': ['law', 'consulting', 'accounting', 'agency']
    };

    const industryMap = new Map<string, number>();

    for (const filing of filings) {
      const defendantName = filing.defendant.toLowerCase();

      for (const [industry, keywords] of Object.entries(industryKeywords)) {
        if (keywords.some(keyword => defendantName.includes(keyword))) {
          industryMap.set(industry, (industryMap.get(industry) || 0) + 1);
          break; // Only count each filing once
        }
      }
    }

    return Array.from(industryMap.entries())
      .map(([industry, count]) => ({
        industry,
        filingCount: count,
        percentage: (count / filings.length) * 100
      }))
      .sort((a, b) => b.filingCount - a.filingCount);
  }

  /**
   * Calculate average settlement amount
   */
  private calculateAverageSettlement(settledCases: PACERFiling[]): number | undefined {
    const amounts = settledCases
      .map(c => c.demandAmount)
      .filter((amount): amount is number => amount !== undefined);

    if (amounts.length === 0) return undefined;

    const sum = amounts.reduce((acc, val) => acc + val, 0);
    return sum / amounts.length;
  }

  /**
   * Calculate average days to settlement
   */
  private calculateAverageDaysToSettlement(settledCases: PACERFiling[]): number | undefined {
    // This would require case termination dates
    // For now, return undefined - can be enhanced with full case tracking
    return undefined;
  }

  /**
   * Calculate plaintiff risk level
   */
  private calculateRiskLevel(
    filingVelocity: number,
    last30Days: number,
    totalFilings: number
  ): 'low' | 'medium' | 'high' | 'critical' {
    if (filingVelocity >= 10 || last30Days >= 5) return 'critical';
    if (filingVelocity >= 5 || last30Days >= 3) return 'high';
    if (filingVelocity >= 2 || totalFilings >= 10) return 'medium';
    return 'low';
  }

  /**
   * Infer target characteristics
   */
  private inferTargetCharacteristics(filings: PACERFiling[]): {
    commonViolations: string[];
    websiteTypes: string[];
    companySize: string[];
  } {
    // This would be enhanced with actual violation data
    return {
      commonViolations: ['color-contrast', 'missing-alt-text', 'keyboard-navigation'],
      websiteTypes: ['e-commerce', 'service'],
      companySize: ['small', 'medium']
    };
  }

  /**
   * Calculate plaintiff proximity score for a company
   */
  calculateProximityScore(
    companyProfile: {
      industry: string;
      jurisdiction: string;
      violations: string[];
      size: string;
    },
    plaintiffName: string
  ): PlaintiffProximityScore {
    const plaintiff = this.plaintiffDatabase.get(plaintiffName);

    if (!plaintiff) {
      return {
        plaintiff: plaintiffName,
        score: 0,
        factors: {
          industryMatch: 0,
          jurisdictionMatch: 0,
          violationMatch: 0,
          companySizeMatch: 0
        },
        recommendation: 'No data available for this plaintiff'
      };
    }

    // Calculate industry match
    const industryMatch = plaintiff.targetIndustries.some(
      ind => ind.industry.toLowerCase() === companyProfile.industry.toLowerCase()
    ) ? 100 : 0;

    // Calculate jurisdiction match
    const jurisdictionMatch = plaintiff.jurisdictions.some(
      jur => jur.court === companyProfile.jurisdiction
    ) ? 100 : 0;

    // Calculate violation match
    const violationMatches = companyProfile.violations.filter(v =>
      plaintiff.targetCharacteristics.commonViolations.includes(v)
    ).length;
    const violationMatch = (violationMatches / Math.max(companyProfile.violations.length, 1)) * 100;

    // Calculate company size match
    const companySizeMatch = plaintiff.targetCharacteristics.companySize.includes(companyProfile.size) ? 100 : 0;

    // Weighted score
    const score = (
      industryMatch * 0.35 +
      jurisdictionMatch * 0.25 +
      violationMatch * 0.30 +
      companySizeMatch * 0.10
    );

    // Generate recommendation
    let recommendation = '';
    if (score >= 75) {
      recommendation = `CRITICAL: High probability target for ${plaintiffName}. Immediate remediation recommended.`;
    } else if (score >= 50) {
      recommendation = `HIGH: Matches ${plaintiffName}'s typical targets. Prioritize compliance.`;
    } else if (score >= 25) {
      recommendation = `MEDIUM: Some characteristics match ${plaintiffName}'s pattern. Monitor closely.`;
    } else {
      recommendation = `LOW: Does not match ${plaintiffName}'s typical target profile.`;
    }

    return {
      plaintiff: plaintiffName,
      score,
      factors: {
        industryMatch,
        jurisdictionMatch,
        violationMatch,
        companySizeMatch
      },
      recommendation
    };
  }

  /**
   * Get all plaintiff profiles
   */
  getAllProfiles(): PlaintiffProfile[] {
    return Array.from(this.plaintiffDatabase.values())
      .sort((a, b) => b.riskLevel.localeCompare(a.riskLevel) || b.filingVelocity - a.filingVelocity);
  }

  /**
   * Get active serial plaintiffs (high-risk)
   */
  getActiveSerialPlaintiffs(): PlaintiffProfile[] {
    return Array.from(this.plaintiffDatabase.values())
      .filter(p => p.activeStatus === 'active' && p.riskLevel in ['high', 'critical'])
      .sort((a, b) => b.filingVelocity - a.filingVelocity);
  }

  /**
   * Get plaintiff profile by name
   */
  getProfile(plaintiffName: string): PlaintiffProfile | undefined {
    return this.plaintiffDatabase.get(plaintiffName);
  }
}

/**
 * Singleton instance
 */
export const plaintiffTracker = new PlaintiffTracker();
