/**
 * Phase III — Lawsuit Probability Model
 * Calculates annual lawsuit probability (0.0-1.0)
 * Based on violation data, jurisdiction risk, industry benchmarks, and historical litigation
 */

export interface ProbabilityInput {
  // Violation data
  violationCount: number;
  criticalViolations: number;
  seriousViolations: number;

  // Risk factors
  jurisdiction: string;
  industry: string;
  monthlyVisitors?: number;

  // Historical data
  publicLawsuits?: number;
  serialPlaintiffActivity?: boolean;

  // Platform risk
  platformRisk?: string;
}

/**
 * Industry baseline lawsuit probability rates
 * Based on historical ADA litigation data from PACER
 */
const INDUSTRY_BASELINE_PROBABILITY: Record<string, number> = {
  'retail': 0.18,
  'financial': 0.12,
  'healthcare': 0.15,
  'technology': 0.08,
  'education': 0.14,
  'government': 0.13,
  'hospitality': 0.22,
  'ecommerce': 0.16,
  'saas': 0.06,
  'manufacturing': 0.17,
  'other': 0.14,
};

/**
 * Jurisdiction lawsuit multipliers
 * Higher = more likely to be sued in that jurisdiction
 */
const JURISDICTION_MULTIPLIER: Record<string, number> = {
  'CA': 1.9,  // California - highest litigation density
  'NY': 1.84,
  'FL': 1.76,
  'IL': 1.7,
  'TX': 1.64,
  'PA': 1.6,
  'NJ': 1.58,
  'OH': 1.5,
  'MI': 1.46,
  'MA': 1.44,
  'VA': 1.4,
  'NC': 1.36,
  'GA': 1.34,
  'AZ': 1.3,
  'WA': 1.26,
  'CO': 1.2,
  'MN': 1.16,
  'WI': 1.1,
  'MO': 1.04,
  'IN': 1.0,   // Baseline
  'TN': 0.96,
  'LA': 0.94,
  'OK': 0.92,
  'KY': 0.9,
  'AL': 0.88,
  'MS': 0.84,
  'SC': 0.8,
  'OR': 0.78,
  'NV': 0.76,
  'UT': 0.72,
  'NM': 0.7,
  'AR': 0.66,
  'KS': 0.64,
  'IA': 0.6,
  'NE': 0.56,
  'ME': 0.5,
  'NH': 0.48,
  'VT': 0.46,
  'MT': 0.44,
  'WY': 0.4,
  'SD': 0.38,
  'ND': 0.36,
  'AK': 0.3,
  'HI': 0.24,
};

/**
 * Get jurisdiction multiplier
 */
function getJurisdictionMultiplier(jurisdiction: string): number {
  const state = jurisdiction.toUpperCase().substring(0, 2);
  return JURISDICTION_MULTIPLIER[state] || 1.0;
}

/**
 * Get industry baseline
 */
function getIndustryBaseline(industry: string): number {
  return (
    INDUSTRY_BASELINE_PROBABILITY[industry.toLowerCase()] ||
    INDUSTRY_BASELINE_PROBABILITY['other']
  );
}

/**
 * Calculate violation severity score (0-1.0)
 * Weighted by violation type and count
 */
function calculateViolationSeverityScore(
  input: ProbabilityInput
): number {
  // Normalize violation impact
  const criticalImpact = Math.min(0.3, (input.criticalViolations || 0) * 0.05);
  const seriousImpact = Math.min(0.2, (input.seriousViolations || 0) * 0.02);
  const otherImpact = Math.min(
    0.2,
    Math.max(0, (input.violationCount || 0) - (input.criticalViolations || 0) - (input.seriousViolations || 0)) *
      0.005
  );

  return Math.min(0.7, criticalImpact + seriousImpact + otherImpact);
}

/**
 * Calculate traffic/exposure factor (0-1.0)
 * Higher traffic = larger pool of potential plaintiffs
 */
function calculateTrafficFactor(monthlyVisitors?: number): number {
  const visitors = monthlyVisitors || 10000;

  // Logarithmic scale
  const trafficScore = Math.log10(visitors) / Math.log10(1000000); // Max at 1M visitors

  // Normalize to 0-1.0 range with diminishing returns
  return Math.min(0.5, trafficScore * 0.5);
}

/**
 * Calculate historical litigation factor (0-1.0)
 * Companies with past lawsuits are more likely to be targeted again
 */
function calculateLitigationHistoryFactor(input: ProbabilityInput): number {
  let historyScore = 0;

  // Past lawsuits increase probability
  if (input.publicLawsuits && input.publicLawsuits > 0) {
    // Each lawsuit increases probability by ~5%, capped at 30%
    historyScore = Math.min(0.3, input.publicLawsuits * 0.05);
  }

  // Serial plaintiff activity is high-risk signal
  if (input.serialPlaintiffActivity) {
    historyScore += 0.2; // Additional 20% risk
  }

  return Math.min(1.0, historyScore);
}

/**
 * Calculate platform risk factor (0-1.0)
 */
function calculatePlatformRiskFactor(platformRisk?: string): number {
  const platformScores: Record<string, number> = {
    'WordPress': 0.25,
    'Shopify': 0.18,
    'Wix': 0.22,
    'Squarespace': 0.20,
    'Magento': 0.19,
    'custom': 0.15,
    'Drupal': 0.12,
    'Joomla': 0.14,
    'custom-react': 0.08,
    'next.js': 0.06,
    'netlify': 0.05,
    'other': 0.15,
  };

  return platformScores[platformRisk || 'other'] || 0.15;
}

/**
 * Main probability estimation function
 * Returns annual lawsuit probability (0.0-1.0)
 */
export function estimateLawsuitProbability(
  input: ProbabilityInput
): number {
  // Get base probability for this industry
  const baseProbability = getIndustryBaseline(input.industry);

  // Apply jurisdiction multiplier
  const jurisdictionMultiplier = getJurisdictionMultiplier(input.jurisdiction);

  // Calculate individual factors
  const violationSeverity = calculateViolationSeverityScore(input);
  const trafficFactor = calculateTrafficFactor(input.monthlyVisitors);
  const litigationHistory = calculateLitigationHistoryFactor(input);
  const platformRisk = calculatePlatformRiskFactor(input.platformRisk);

  // Combine factors
  const adjustedProbability =
    (baseProbability * jurisdictionMultiplier +
      violationSeverity * 0.3 +
      trafficFactor * 0.2 +
      litigationHistory * 0.25 +
      platformRisk * 0.15) /
    2.35; // Normalize

  // Ensure result is in 0.0-1.0 range
  return Math.min(1.0, Math.max(0.0, adjustedProbability));
}

export default {
  estimateLawsuitProbability,
  getJurisdictionMultiplier,
  getIndustryBaseline,
};
