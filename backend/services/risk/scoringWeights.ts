/**
 * Phase III — Compliance Credit Score (CCS v2.0) Weights
 * Scoring model similar to FICO, but for ADA/WCAG compliance
 * Outputs 0-850 scale
 */

export interface ScoringWeights {
  violationSeverity: number;     // Impact of WCAG violations
  jurisdictionRisk: number;      // Legal risk by jurisdiction
  serialPlaintiffRisk: number;   // Threat from serial litigants
  improvementTrend: number;      // Velocity of fixes (positive factor)
  industryAdjustment: number;    // Comparison to industry peers
}

export interface ViolationWeight {
  critical: number;  // WCAG AA violations
  serious: number;   // WCAG A violations
  moderate: number;
  minor: number;
}

export interface JurisdictionRiskMap {
  [jurisdiction: string]: number; // 0-1.0 risk score
}

export interface IndustryBenchmark {
  [industry: string]: {
    avgViolationCount: number;
    avgScore: number;
    avgLitigationProbability: number;
  };
}

/**
 * Primary scoring weights - these determine the impact of each factor
 */
export const SCORING_WEIGHTS: ScoringWeights = {
  violationSeverity: 0.45,      // 45% of score reduction
  jurisdictionRisk: 0.20,       // 20% of score reduction
  serialPlaintiffRisk: 0.20,    // 20% of score reduction
  improvementTrend: 0.10,       // 10% of score improvement
  industryAdjustment: 0.05,     // 5% adjustment factor
};

/**
 * Violation severity weights - how much each violation type impacts score
 */
export const VIOLATION_WEIGHTS: ViolationWeight = {
  critical: 5.0,   // Most severe (WCAG AA failures)
  serious: 3.0,    // High severity (WCAG A failures)
  moderate: 1.5,   // Medium severity
  minor: 0.5,      // Low severity
};

/**
 * Jurisdiction risk scores - higher risk = higher litigation probability
 * Based on historical ADA litigation density and plaintiff activity
 */
export const JURISDICTION_RISK_MAP: JurisdictionRiskMap = {
  // High-risk jurisdictions (serial plaintiffs, plaintiff-friendly courts)
  'CA': 0.95,      // California - Highest plaintiff activity
  'NY': 0.92,      // New York
  'FL': 0.88,      // Florida
  'IL': 0.85,      // Illinois
  'TX': 0.82,      // Texas
  'PA': 0.80,      // Pennsylvania
  'NJ': 0.79,      // New Jersey
  'OH': 0.75,      // Ohio
  'MI': 0.73,      // Michigan
  'MA': 0.72,      // Massachusetts
  'VA': 0.70,      // Virginia
  'NC': 0.68,      // North Carolina
  'GA': 0.67,      // Georgia
  'AZ': 0.65,      // Arizona
  'WA': 0.63,      // Washington
  'CO': 0.60,      // Colorado
  'MN': 0.58,      // Minnesota
  'WI': 0.55,      // Wisconsin
  'MO': 0.52,      // Missouri
  'IN': 0.50,      // Indiana

  // Medium-risk jurisdictions
  'TN': 0.48,
  'LA': 0.47,
  'OK': 0.46,
  'KY': 0.45,
  'AL': 0.44,
  'MS': 0.42,
  'SC': 0.40,
  'OR': 0.39,
  'NV': 0.38,
  'UT': 0.36,
  'NM': 0.35,
  'AR': 0.33,
  'KS': 0.32,
  'IA': 0.30,
  'NE': 0.28,

  // Lower-risk jurisdictions
  'ME': 0.25,
  'NH': 0.24,
  'VT': 0.23,
  'MT': 0.22,
  'WY': 0.20,
  'SD': 0.19,
  'ND': 0.18,
  'AK': 0.15,
  'HI': 0.12,

  // Default for unknown jurisdictions
  'UNKNOWN': 0.50,
};

/**
 * Industry risk benchmarks for normalization
 * Helps compare a company against industry peers
 */
export const INDUSTRY_BENCHMARKS: IndustryBenchmark = {
  'retail': {
    avgViolationCount: 185,
    avgScore: 520,
    avgLitigationProbability: 0.18,
  },
  'financial': {
    avgViolationCount: 95,
    avgScore: 680,
    avgLitigationProbability: 0.12,
  },
  'healthcare': {
    avgViolationCount: 120,
    avgScore: 620,
    avgLitigationProbability: 0.15,
  },
  'technology': {
    avgViolationCount: 75,
    avgScore: 720,
    avgLitigationProbability: 0.08,
  },
  'education': {
    avgViolationCount: 140,
    avgScore: 580,
    avgLitigationProbability: 0.14,
  },
  'government': {
    avgViolationCount: 110,
    avgScore: 640,
    avgLitigationProbability: 0.13,
  },
  'hospitality': {
    avgViolationCount: 200,
    avgScore: 480,
    avgLitigationProbability: 0.22,
  },
  'ecommerce': {
    avgViolationCount: 150,
    avgScore: 560,
    avgLitigationProbability: 0.16,
  },
  'saas': {
    avgViolationCount: 60,
    avgScore: 760,
    avgLitigationProbability: 0.06,
  },
  'manufacturing': {
    avgViolationCount: 170,
    avgScore: 540,
    avgLitigationProbability: 0.17,
  },
  'other': {
    avgViolationCount: 130,
    avgScore: 600,
    avgLitigationProbability: 0.14,
  },
};

/**
 * Serial plaintiff activity levels - companies targeted by known serial litigants
 * These are patterns from PACER/RECAP data
 */
export const SERIAL_PLAINTIFF_RISK_MULTIPLIER = {
  targetedByActiveSerialPlaintiff: 2.5,  // 250% risk multiplier
  targetedByHistoricalSerialPlaintiff: 1.8,  // 180% risk multiplier
  targetedByMultiplePlaintiffs: 2.0,  // 200% risk multiplier
  noKnownTargeting: 1.0,  // No additional risk
};

/**
 * Media exposure risk - attention increases plaintiff probability
 */
export const MEDIA_EXPOSURE_MULTIPLIER = {
  'high': 1.8,  // 80% additional risk
  'medium': 1.4,  // 40% additional risk
  'low': 1.0,  // No additional risk
};

/**
 * Platform/CMS risk - certain platforms have higher violation counts
 * Helps predict future compliance issues
 */
export const CMS_PLATFORM_RISK = {
  'WordPress': 0.85,    // Higher risk - many outdated plugins
  'Shopify': 0.65,      // Medium-high risk
  'Wix': 0.78,          // High risk - limited accessibility controls
  'Squarespace': 0.72,  // Medium-high risk
  'custom': 0.55,       // Medium risk
  'Drupal': 0.50,       // Medium risk - better accessibility options
  'Magento': 0.70,      // Medium-high risk
  'Joomla': 0.60,       // Medium risk
  'custom-react': 0.45, // Lower risk - better control
  'next.js': 0.40,      // Lower risk - modern framework
  'netlify': 0.35,      // Lower risk - static site
  'other': 0.50,        // Default medium risk
};

/**
 * Grade mapping - convert 0-850 score to letter grade
 */
export function scoreToGrade(score: number): string {
  if (score >= 800) return 'A+';
  if (score >= 750) return 'A';
  if (score >= 700) return 'B';
  if (score >= 600) return 'C';
  if (score >= 450) return 'D';
  return 'F';
}

/**
 * Risk level mapping - for executive reporting
 */
export function scoreToRiskLevel(score: number): 'critical' | 'high' | 'medium' | 'low' {
  if (score <= 300) return 'critical';
  if (score <= 450) return 'high';
  if (score <= 650) return 'medium';
  return 'low';
}

/**
 * Get industry benchmark for comparison
 */
export function getIndustryBenchmark(industry: string) {
  return INDUSTRY_BENCHMARKS[industry.toLowerCase()] || INDUSTRY_BENCHMARKS['other'];
}

/**
 * Get jurisdiction risk score
 */
export function getJurisdictionRisk(jurisdiction: string): number {
  const state = jurisdiction.toUpperCase().substring(0, 2);
  return JURISDICTION_RISK_MAP[state] || JURISDICTION_RISK_MAP['UNKNOWN'];
}

export default {
  SCORING_WEIGHTS,
  VIOLATION_WEIGHTS,
  JURISDICTION_RISK_MAP,
  INDUSTRY_BENCHMARKS,
  SERIAL_PLAINTIFF_RISK_MULTIPLIER,
  MEDIA_EXPOSURE_MULTIPLIER,
  CMS_PLATFORM_RISK,
  scoreToGrade,
  scoreToRiskLevel,
  getIndustryBenchmark,
  getJurisdictionRisk,
};
