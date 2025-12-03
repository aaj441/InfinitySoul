/**
 * Phase III — Financial Exposure Model
 * Calculates expected lawsuit costs and insurance pricing
 * Based on violation severity, industry, jurisdiction, and company size
 */

export interface ExposureInput {
  // Violation data
  criticalViolations: number;
  seriousViolations: number;
  violationCount: number;

  // Lawsuit probability
  annualLawsuitProbability: number; // 0.0-1.0

  // Business factors
  industry: string;
  jurisdiction: string;
  estimatedRevenue?: number;
  monthlyVisitors?: number;
  companySize?: 'startup' | 'smb' | 'mid-market' | 'enterprise';
}

/**
 * Settlement amount ranges by company size
 * Based on PACER/RECAP historical data
 */
const SETTLEMENT_RANGES_BY_SIZE: Record<
  string,
  { low: number; mid: number; high: number }
> = {
  'startup': {
    low: 15000,
    mid: 35000,
    high: 75000,
  },
  'smb': {
    low: 25000,
    mid: 50000,
    high: 125000,
  },
  'mid-market': {
    low: 50000,
    mid: 100000,
    high: 250000,
  },
  'enterprise': {
    low: 100000,
    mid: 250000,
    high: 500000,
  },
};

/**
 * Jurisdiction settlement multipliers
 * Some jurisdictions have higher average settlements
 */
const JURISDICTION_SETTLEMENT_MULTIPLIER: Record<string, number> = {
  'CA': 1.8,  // California - highest settlement amounts
  'NY': 1.75,
  'FL': 1.6,
  'IL': 1.55,
  'TX': 1.5,
  'PA': 1.45,
  'NJ': 1.4,
  'MA': 1.35,
  'VA': 1.3,
  'other': 1.0,
};

/**
 * Legal fee multipliers by violation severity
 * More complex cases (critical violations) have higher legal fees
 */
const LEGAL_FEE_MULTIPLIER: Record<string, number> = {
  'low': 0.3,    // Minor violations only
  'medium': 0.5,  // Some serious violations
  'high': 0.8,   // Multiple serious violations
  'critical': 1.2, // Critical violations present
};

/**
 * Estimate settlement range based on company size
 */
function getSettlementRange(
  companySize: string = 'smb',
  multiplier: number = 1.0
): { low: number; mid: number; high: number } {
  const range = SETTLEMENT_RANGES_BY_SIZE[companySize] || SETTLEMENT_RANGES_BY_SIZE['smb'];

  return {
    low: Math.round(range.low * multiplier),
    mid: Math.round(range.mid * multiplier),
    high: Math.round(range.high * multiplier),
  };
}

/**
 * Calculate legal fees based on violation severity
 */
function calculateLegalFees(
  input: ExposureInput
): { low: number; high: number } {
  // Determine severity level
  let severityLevel = 'low';
  if (input.criticalViolations > 0) {
    severityLevel = 'critical';
  } else if (input.seriousViolations > 3) {
    severityLevel = 'high';
  } else if (input.seriousViolations > 0 || input.violationCount > 20) {
    severityLevel = 'medium';
  }

  const multiplier = LEGAL_FEE_MULTIPLIER[severityLevel];

  // Base legal fees
  const baseLow = 20000;
  const baseHigh = 50000;

  return {
    low: Math.round(baseLow * multiplier),
    high: Math.round(baseHigh * multiplier),
  };
}

/**
 * Calculate jurisdiction settlement multiplier
 */
function getJurisdictionMultiplier(jurisdiction: string): number {
  const state = jurisdiction.toUpperCase().substring(0, 2);
  return JURISDICTION_SETTLEMENT_MULTIPLIER[state] || JURISDICTION_SETTLEMENT_MULTIPLIER['other'];
}

/**
 * Estimate violation severity-based settlement multiplier
 */
function getViolationSeverityMultiplier(
  input: ExposureInput
): number {
  // Weighted violation impact
  const criticalImpact = (input.criticalViolations || 0) * 0.3;
  const seriousImpact = (input.seriousViolations || 0) * 0.15;
  const otherImpact =
    Math.max(
      0,
      (input.violationCount || 0) -
        (input.criticalViolations || 0) -
        (input.seriousViolations || 0)
    ) * 0.02;

  // Normalize to multiplier (1.0 = baseline, higher = more expensive)
  return Math.max(0.8, Math.min(2.5, 1.0 + criticalImpact + seriousImpact + otherImpact));
}

/**
 * Estimate company size from revenue
 */
function estimateCompanySize(
  revenue?: number,
  visitors?: number
): 'startup' | 'smb' | 'mid-market' | 'enterprise' {
  // Use revenue if available
  if (revenue) {
    if (revenue < 1000000) return 'startup';
    if (revenue < 10000000) return 'smb';
    if (revenue < 100000000) return 'mid-market';
    return 'enterprise';
  }

  // Fall back to visitors
  const v = visitors || 10000;
  if (v < 50000) return 'startup';
  if (v < 500000) return 'smb';
  if (v < 5000000) return 'mid-market';
  return 'enterprise';
}

/**
 * Main exposure estimation function
 * Returns expected lawsuit costs broken down by settlement and legal fees
 */
export function estimateExposure(
  input: ExposureInput
): {
  settlementLow: number;
  settlementMid: number;
  settlementHigh: number;
  legalFeesLow: number;
  legalFeesHigh: number;
  totalExposureLow: number;
  totalExposureMid: number;
  totalExposureHigh: number;
  expectedExposure: number; // Probability * mid estimate
} {
  // Estimate company size if not provided
  const companySize = input.companySize ||
    estimateCompanySize(input.estimatedRevenue, input.monthlyVisitors);

  // Get settlement multipliers
  const jurisdictionMultiplier = getJurisdictionMultiplier(input.jurisdiction);
  const violationMultiplier = getViolationSeverityMultiplier(input);
  const combinedMultiplier = jurisdictionMultiplier * violationMultiplier;

  // Calculate settlement range
  const settlementRange = getSettlementRange(companySize, combinedMultiplier);

  // Calculate legal fees
  const legalFees = calculateLegalFees(input);

  // Total exposure
  const totalExposureLow = settlementRange.low + legalFees.low;
  const totalExposureMid = settlementRange.mid + (legalFees.low + legalFees.high) / 2;
  const totalExposureHigh = settlementRange.high + legalFees.high;

  // Expected exposure = probability * average cost
  const expectedExposure =
    input.annualLawsuitProbability * totalExposureMid;

  return {
    settlementLow: settlementRange.low,
    settlementMid: settlementRange.mid,
    settlementHigh: settlementRange.high,
    legalFeesLow: legalFees.low,
    legalFeesHigh: legalFees.high,
    totalExposureLow: Math.round(totalExposureLow),
    totalExposureMid: Math.round(totalExposureMid),
    totalExposureHigh: Math.round(totalExposureHigh),
    expectedExposure: Math.round(expectedExposure),
  };
}

/**
 * Calculate insurance premium recommendation
 * Insurance companies typically charge 1.25x-1.5x expected exposure
 * Plus loading for admin costs and profit
 */
export function calculateInsurancePremium(
  expectedExposure: number,
  probability: number
): number {
  // Base multiplier: 1.5x expected exposure
  let multiplier = 1.5;

  // Additional loading based on probability (higher risk = higher multiplier)
  if (probability > 0.25) {
    multiplier += 0.3; // High risk premium
  } else if (probability > 0.15) {
    multiplier += 0.15; // Medium risk premium
  }

  return Math.round(expectedExposure * multiplier);
}

/**
 * Calculate recommended remediation budget
 * Estimated cost to fix identified violations
 */
export function calculateRemediationBudget(
  input: ExposureInput
): number {
  // Average cost per violation fix
  const fixCostByType: Record<string, number> = {
    'critical': 500,  // Most expensive
    'serious': 300,
    'moderate': 150,
    'minor': 50,
  };

  // Weighted calculation
  const criticalCost = (input.criticalViolations || 0) * fixCostByType.critical;
  const seriousCost = (input.seriousViolations || 0) * fixCostByType.serious;

  // Estimate moderate/minor from total
  const otherViolations = Math.max(
    0,
    (input.violationCount || 0) -
      (input.criticalViolations || 0) -
      (input.seriousViolations || 0)
  );
  const otherCost = otherViolations * fixCostByType.moderate;

  // Add 20% for testing and validation
  const totalBudget = (criticalCost + seriousCost + otherCost) * 1.2;

  // Minimum budget $5k, maximum $500k
  return Math.max(5000, Math.min(500000, Math.round(totalBudget)));
}

export default {
  estimateExposure,
  calculateInsurancePremium,
  calculateRemediationBudget,
  estimateCompanySize,
};
