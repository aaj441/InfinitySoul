/**
 * Phase V — Lawsuit Monitoring System
 * Real-time tracking of ADA lawsuits from PACER, CourtListener, and legal news sources
 */

export interface LawsuitFiling {
  caseNumber: string;
  court: string; // E.D.N.Y., N.D. Ill., etc.
  jurisdiction: string; // State abbreviation
  plaintiff: string;
  plaintiffAttorney?: string;
  defendant: string;
  violationTypes: string[];
  filedDate: Date;
  status: 'filed' | 'settled' | 'judgment' | 'dismissed';
  settlementAmount?: number;
  source: 'PACER' | 'CourtListener' | 'news';
  sourceUrl?: string;
}

export interface PlaintiffProfile {
  name: string;
  lawFirm?: string;
  attorneyNames: string[];
  totalFilings: number;
  settlementsWon: number;
  winRate: number; // 0-1.0
  averageSettlement?: number;
  preferredJurisdictions: string[];
  preferredIndustries: string[];
  targetCompanySizes: string[];
  targetCMS: string[];
  filingVelocity: number; // Lawsuits per month
  threatLevel: 'critical' | 'high' | 'medium' | 'low';
  lastActivityDate?: Date;
  nextPredictedTarget?: string;
}

export interface IndustryHeatmap {
  industry: string;
  litigationDensity: number; // Lawsuits per 10K companies per year
  recentFilingCount: number; // Past 90 days
  totalFilingsThisYear: number;
  trend: 'rising' | 'falling' | 'stable';
  dominantPlaintiffs: string[];
  commonViolations: string[];
  averageSettlement?: number;
  forecasted30DayFilings: number;
  forecasted90DayFilings: number;
}

/**
 * Fetch ADA lawsuits from PACER (Public Access to Court Electronic Records)
 * Real implementation would use PACER's free access APIs
 */
export async function fetchPACERFeed(): Promise<LawsuitFiling[]> {
  // In production:
  // 1. Connect to PACER API or web scraper
  // 2. Query ADA Title III cases from all federal districts
  // 3. Parse case data (plaintiff, defendant, violations, settlement)
  // 4. Return structured lawsuit data

  // Mock response for development
  const mockFilings: LawsuitFiling[] = [
    {
      caseNumber: '1:24-cv-01234',
      court: 'E.D.N.Y.',
      jurisdiction: 'NY',
      plaintiff: 'Jane Doe',
      plaintiffAttorney: 'Law Firm X, PLLC',
      defendant: 'example-ecommerce.com',
      violationTypes: ['missing-alt-text', 'color-contrast', 'keyboard-trap'],
      filedDate: new Date('2024-11-15'),
      status: 'filed',
      source: 'PACER',
      sourceUrl: 'https://pacer.uscourts.gov/...',
    },
    {
      caseNumber: '3:24-cv-05678',
      court: 'C.D. Cal.',
      jurisdiction: 'CA',
      plaintiff: 'Disability Rights Organization',
      plaintiffAttorney: 'Serial Plaintiff Law',
      defendant: 'retailer-domain.com',
      violationTypes: ['form-labels', 'button-name', 'heading-structure'],
      filedDate: new Date('2024-11-10'),
      status: 'settled',
      settlementAmount: 75000,
      source: 'PACER',
    },
  ];

  return mockFilings;
}

/**
 * Fetch ADA lawsuits from CourtListener (free court data aggregator)
 */
export async function fetchCourtListenerFeed(): Promise<LawsuitFiling[]> {
  // In production:
  // 1. Connect to CourtListener API (free service)
  // 2. Query for "ADA" + "Title III" cases
  // 3. Extract relevant case metadata
  // 4. Enrich with sentiment analysis and keyword extraction

  const mockFilings: LawsuitFiling[] = [
    {
      caseNumber: '2:24-cv-09999',
      court: 'N.D. Ill.',
      jurisdiction: 'IL',
      plaintiff: 'John Smith',
      defendant: 'healthcare-provider.com',
      violationTypes: ['video-caption', 'color-contrast'],
      filedDate: new Date('2024-11-08'),
      status: 'filed',
      source: 'CourtListener',
      sourceUrl: 'https://courtlistener.com/...',
    },
  ];

  return mockFilings;
}

/**
 * Track serial plaintiff activity and build threat profiles
 */
export function buildPlaintiffProfile(
  litigationHistory: LawsuitFiling[]
): Map<string, PlaintiffProfile> {
  const plaintiffMap = new Map<string, PlaintiffProfile>();

  for (const filing of litigationHistory) {
    const plaintiff = filing.plaintiff;

    if (!plaintiffMap.has(plaintiff)) {
      plaintiffMap.set(plaintiff, {
        name: plaintiff,
        lawFirm: filing.plaintiffAttorney?.split(',')[0],
        attorneyNames: filing.plaintiffAttorney ? [filing.plaintiffAttorney] : [],
        totalFilings: 0,
        settlementsWon: 0,
        winRate: 0,
        preferredJurisdictions: [],
        preferredIndustries: [],
        targetCompanySizes: [],
        targetCMS: [],
        filingVelocity: 0,
        threatLevel: 'medium',
      });
    }

    const profile = plaintiffMap.get(plaintiff)!;
    profile.totalFilings += 1;

    if (filing.status === 'settled' && filing.settlementAmount) {
      profile.settlementsWon += 1;
      if (!profile.averageSettlement) {
        profile.averageSettlement = filing.settlementAmount;
      } else {
        profile.averageSettlement =
          (profile.averageSettlement * (profile.settlementsWon - 1) +
            filing.settlementAmount) /
          profile.settlementsWon;
      }
    }

    // Track jurisdiction preferences
    if (!profile.preferredJurisdictions.includes(filing.jurisdiction)) {
      profile.preferredJurisdictions.push(filing.jurisdiction);
    }

    profile.winRate = profile.settlementsWon / profile.totalFilings;
    profile.lastActivityDate = filing.filedDate;

    // Classify threat level
    if (profile.totalFilings >= 20 && profile.winRate >= 0.7) {
      profile.threatLevel = 'critical';
    } else if (profile.totalFilings >= 10 && profile.winRate >= 0.6) {
      profile.threatLevel = 'high';
    } else if (profile.totalFilings >= 5) {
      profile.threatLevel = 'medium';
    } else {
      profile.threatLevel = 'low';
    }
  }

  return plaintiffMap;
}

/**
 * Build industry heatmap from litigation data
 */
export function buildIndustryHeatmap(
  litigationHistory: LawsuitFiling[]
): Map<string, IndustryHeatmap> {
  const industryMap = new Map<string, IndustryHeatmap>();

  // Industry-specific logic: infer from defendant domain patterns
  const inferIndustry = (defendant: string): string => {
    if (defendant.includes('shop') || defendant.includes('store')) {
      return 'retail';
    }
    if (defendant.includes('hotel') || defendant.includes('restaurant')) {
      return 'hospitality';
    }
    if (defendant.includes('bank') || defendant.includes('finance')) {
      return 'financial';
    }
    if (defendant.includes('health') || defendant.includes('medical')) {
      return 'healthcare';
    }
    if (defendant.includes('edu')) {
      return 'education';
    }
    return 'other';
  };

  const now = new Date();
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  for (const filing of litigationHistory) {
    const industry = inferIndustry(filing.defendant);

    if (!industryMap.has(industry)) {
      industryMap.set(industry, {
        industry,
        litigationDensity: 0,
        recentFilingCount: 0,
        totalFilingsThisYear: 0,
        trend: 'stable',
        dominantPlaintiffs: [],
        commonViolations: [],
        forecasted30DayFilings: 0,
        forecasted90DayFilings: 0,
      });
    }

    const heatmap = industryMap.get(industry)!;
    heatmap.totalFilingsThisYear += 1;

    if (filing.filedDate > ninetyDaysAgo) {
      heatmap.recentFilingCount += 1;
    }

    // Track common violations
    for (const violation of filing.violationTypes) {
      if (!heatmap.commonViolations.includes(violation)) {
        heatmap.commonViolations.push(violation);
      }
    }

    // Track dominant plaintiffs
    if (
      !heatmap.dominantPlaintiffs.includes(filing.plaintiff) &&
      heatmap.dominantPlaintiffs.length < 3
    ) {
      heatmap.dominantPlaintiffs.push(filing.plaintiff);
    }

    // Update settlement average
    if (filing.settlementAmount) {
      if (!heatmap.averageSettlement) {
        heatmap.averageSettlement = filing.settlementAmount;
      } else {
        heatmap.averageSettlement =
          (heatmap.averageSettlement + filing.settlementAmount) / 2;
      }
    }
  }

  // Calculate trend direction
  for (const heatmap of industryMap.values()) {
    if (heatmap.recentFilingCount > heatmap.totalFilingsThisYear * 0.4) {
      heatmap.trend = 'rising';
    } else if (heatmap.recentFilingCount < heatmap.totalFilingsThisYear * 0.2) {
      heatmap.trend = 'falling';
    } else {
      heatmap.trend = 'stable';
    }

    // Forecast based on recent velocity
    const dailyRate = heatmap.recentFilingCount / 90;
    heatmap.forecasted30DayFilings = Math.round(dailyRate * 30);
    heatmap.forecasted90DayFilings = Math.round(dailyRate * 90);
  }

  return industryMap;
}

/**
 * Detect jurisdiction-level litigation hotspots
 */
export function detectJurisdictionHotspots(
  litigationHistory: LawsuitFiling[]
): Record<string, { count: number; trend: string; activePlaintiffs: string[] }> {
  const jurisdictionStats: Record<
    string,
    { count: number; dates: Date[]; plaintiffs: Set<string> }
  > = {};

  const now = new Date();
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  for (const filing of litigationHistory) {
    if (!jurisdictionStats[filing.jurisdiction]) {
      jurisdictionStats[filing.jurisdiction] = {
        count: 0,
        dates: [],
        plaintiffs: new Set(),
      };
    }

    const stats = jurisdictionStats[filing.jurisdiction];
    stats.count += 1;
    stats.dates.push(filing.filedDate);
    stats.plaintiffs.add(filing.plaintiff);
  }

  const result: Record<
    string,
    { count: number; trend: string; activePlaintiffs: string[] }
  > = {};

  for (const [jurisdiction, stats] of Object.entries(jurisdictionStats)) {
    const recentCount = stats.dates.filter(
      (date) => date > ninetyDaysAgo
    ).length;

    let trend = 'stable';
    if (recentCount > stats.count * 0.4) {
      trend = 'rising';
    } else if (recentCount < stats.count * 0.2) {
      trend = 'falling';
    }

    result[jurisdiction] = {
      count: stats.count,
      trend,
      activePlaintiffs: Array.from(stats.plaintiffs),
    };
  }

  return result;
}

/**
 * Main lawsuit feed aggregator
 */
export async function aggregateLawsuitFeeds(): Promise<{
  allFilings: LawsuitFiling[];
  plaintiffs: Map<string, PlaintiffProfile>;
  industryHeatmap: Map<string, IndustryHeatmap>;
  jurisdictionHotspots: Record<string, any>;
}> {
  // Fetch from all sources in parallel
  const [pacerFilings, courtListenerFilings] = await Promise.all([
    fetchPACERFeed(),
    fetchCourtListenerFeed(),
  ]);

  const allFilings = [...pacerFilings, ...courtListenerFilings];

  // De-duplicate by case number
  const uniqueFilings = Array.from(
    new Map(allFilings.map((f) => [f.caseNumber, f])).values()
  );

  // Build profiles and heatmaps
  const plaintiffs = buildPlaintiffProfile(uniqueFilings);
  const industryHeatmap = buildIndustryHeatmap(uniqueFilings);
  const jurisdictionHotspots = detectJurisdictionHotspots(uniqueFilings);

  return {
    allFilings: uniqueFilings,
    plaintiffs,
    industryHeatmap,
    jurisdictionHotspots,
  };
}

export default {
  fetchPACERFeed,
  fetchCourtListenerFeed,
  buildPlaintiffProfile,
  buildIndustryHeatmap,
  detectJurisdictionHotspots,
  aggregateLawsuitFeeds,
};
