/**
 * Phase III — Compliance Credit Score v2.0 Engine
 * Calculates 0-850 compliance scores similar to FICO
 * Insurance-grade scoring for ADA/WCAG compliance
 */

import {
  SCORING_WEIGHTS,
  VIOLATION_WEIGHTS,
  INDUSTRY_BENCHMARKS,
  SERIAL_PLAINTIFF_RISK_MULTIPLIER,
  MEDIA_EXPOSURE_MULTIPLIER,
  CMS_PLATFORM_RISK,
  scoreToGrade,
  scoreToRiskLevel,
  getJurisdictionRisk,
  getIndustryBenchmark,
} from './scoringWeights';

export interface ComplianceScoringInput {
  // Violation data
  criticalViolations: number;
  seriousViolations: number;
  moderateViolations: number;
  minorViolations: number;

  // Risk factors
  jurisdiction: string;
  industry: string;
  publicLawsuits?: number;
  serialPlaintiffThreat?: boolean;
  platformRisk?: string; // CMS platform

  // Positive factors
  previousScore?: number; // Score from 30 days ago
  daysSincePreviousScan?: number;

  // Traffic & revenue
  monthlyVisitors?: number;
  annualRevenue?: number;

  // Additional factors
  mediaExposureRisk?: 'high' | 'medium' | 'low';
}

export interface ComplianceScoreOutput {
  score: number;
  grade: string;
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  scoreBreakdown: {
    baseScore: number;
    violationDeduction: number;
    jurisdictionDeduction: number;
    serialPlaintiffDeduction: number;
    improvementBonus: number;
    industryAdjustment: number;
    finalScore: number;
  };
  factors: {
    technicalDebtScore: number;     // 0-100
    jurisdictionRisk: number;       // 0-100
    serialPlaintiffRisk: number;    // 0-100
    improvementTrend: number;       // 0-100
    industryAdjustment: number;     // 0-100
  };
  recommendations: string[];
  improvementPotential: number; // 0-100 possible score improvement
}

/**
 * Calculate total violation weight
 */
function calculateViolationWeight(input: ComplianceScoringInput): number {
  const criticalWeight = (input.criticalViolations || 0) * VIOLATION_WEIGHTS.critical;
  const seriousWeight = (input.seriousViolations || 0) * VIOLATION_WEIGHTS.serious;
  const moderateWeight = (input.moderateViolations || 0) * VIOLATION_WEIGHTS.moderate;
  const minorWeight = (input.minorViolations || 0) * VIOLATION_WEIGHTS.minor;

  return criticalWeight + seriousWeight + moderateWeight + minorWeight;
}

/**
 * Calculate technical debt score (0-100)
 * Based on violation count and severity
 */
function calculateTechnicalDebtScore(input: ComplianceScoringInput): number {
  const totalViolations =
    (input.criticalViolations || 0) +
    (input.seriousViolations || 0) +
    (input.moderateViolations || 0) +
    (input.minorViolations || 0);

  const violationWeight = calculateViolationWeight(input);

  // Higher violations = lower technical debt score
  // Max deduction when violations exceed 500 (normalized)
  const violationScore = Math.max(0, 100 - (violationWeight / 2));

  // Apply platform risk if provided
  let platformFactor = 1.0;
  if (input.platformRisk) {
    platformFactor =
      CMS_PLATFORM_RISK[input.platformRisk as keyof typeof CMS_PLATFORM_RISK] ||
      CMS_PLATFORM_RISK['other'];
  }

  return Math.round(violationScore * platformFactor);
}

/**
 * Calculate jurisdiction risk score (0-100)
 * Higher = more litigation risk in that jurisdiction
 */
function calculateJurisdictionRisk(input: ComplianceScoringInput): number {
  const jurisdictionRisk = getJurisdictionRisk(input.jurisdiction);
  // Convert 0-1.0 to 0-100 scale
  return Math.round(jurisdictionRisk * 100);
}

/**
 * Calculate serial plaintiff threat (0-100)
 * Based on historical lawsuit data and known serial litigants
 */
function calculateSerialPlaintiffRisk(input: ComplianceScoringInput): number {
  let baseRisk = 0;

  // Public lawsuit history increases risk
  if (input.publicLawsuits && input.publicLawsuits > 0) {
    baseRisk += Math.min(40, input.publicLawsuits * 10);
  }

  // Serial plaintiff targeting
  if (input.serialPlaintiffThreat) {
    baseRisk += 60; // Significant increase for serial plaintiff targeting
  }

  return Math.min(100, baseRisk);
}

/**
 * Calculate improvement trend (0-100)
 * Positive factor - higher score for improving compliance
 */
function calculateImprovementTrend(input: ComplianceScoringInput): number {
  if (!input.previousScore || !input.daysSincePreviousScan) {
    return 0; // No previous data
  }

  const currentScore = 850; // Placeholder, will be calculated
  const scoreDifference = currentScore - input.previousScore;
  const daysDifference = input.daysSincePreviousScan;

  // Velocity: score improvement per day
  const dailyImprovement = scoreDifference / daysDifference;

  // Higher daily improvement = higher trend score
  // +1 point/day = 50 trend score, +3 points/day = 100 trend score
  return Math.min(100, Math.max(0, dailyImprovement * 20 + 50));
}

/**
 * Calculate industry adjustment (0-100)
 * Compare performance against industry peers
 */
function calculateIndustryAdjustment(input: ComplianceScoringInput): number {
  const benchmark = getIndustryBenchmark(input.industry);
  const totalViolations =
    (input.criticalViolations || 0) +
    (input.seriousViolations || 0) +
    (input.moderateViolations || 0) +
    (input.minorViolations || 0);

  // If better than industry average
  if (totalViolations < benchmark.avgViolationCount) {
    const percentBetter =
      ((benchmark.avgViolationCount - totalViolations) /
        benchmark.avgViolationCount) *
      100;
    return Math.min(100, 50 + percentBetter / 2);
  }

  // If worse than industry average
  const percentWorse =
    ((totalViolations - benchmark.avgViolationCount) /
      benchmark.avgViolationCount) *
    100;
  return Math.max(0, 50 - percentWorse / 2);
}

/**
 * Calculate traffic multiplier (revenue risk factor)
 * Higher traffic = higher litigation exposure
 */
function calculateTrafficMultiplier(input: ComplianceScoringInput): number {
  const monthlyVisitors = input.monthlyVisitors || 10000;

  // Logarithmic scale for traffic impact
  if (monthlyVisitors < 1000) return 0.5; // Low traffic = lower risk
  if (monthlyVisitors < 10000) return 0.8;
  if (monthlyVisitors < 100000) return 1.0;
  if (monthlyVisitors < 1000000) return 1.3;
  return 1.6; // Very high traffic = significant multiplier
}

/**
 * Calculate media exposure adjustment
 */
function calculateMediaExposureAdjustment(
  input: ComplianceScoringInput
): number {
  if (!input.mediaExposureRisk) return 0;

  const multiplier =
    MEDIA_EXPOSURE_MULTIPLIER[
      input.mediaExposureRisk as keyof typeof MEDIA_EXPOSURE_MULTIPLIER
    ];
  // Convert multiplier to 0-30 point deduction
  return Math.round((multiplier - 1.0) * 30);
}

/**
 * Main scoring function
 * Calculates 0-850 compliance credit score
 */
export function computeComplianceScore(
  input: ComplianceScoringInput
): ComplianceScoreOutput {
  // Calculate individual factor scores (0-100)
  const technicalDebtScore = calculateTechnicalDebtScore(input);
  const jurisdictionRisk = calculateJurisdictionRisk(input);
  const serialPlaintiffRisk = calculateSerialPlaintiffRisk(input);
  const improvementTrend = calculateImprovementTrend(input);
  const industryAdjustment = calculateIndustryAdjustment(input);

  // Base score
  const baseScore = 850;

  // Calculate deductions (scaled to contribute to final score)
  const violationDeduction =
    (100 - technicalDebtScore) * (SCORING_WEIGHTS.violationSeverity * 5);
  const jurisdictionDeduction =
    jurisdictionRisk * (SCORING_WEIGHTS.jurisdictionRisk * 5);
  const serialPlaintiffDeduction =
    serialPlaintiffRisk * (SCORING_WEIGHTS.serialPlaintiffRisk * 5);
  const improvementBonus =
    improvementTrend * (SCORING_WEIGHTS.improvementTrend * 5);
  const industryAdjustmentBonus =
    (industryAdjustment - 50) * (SCORING_WEIGHTS.industryAdjustment * 1);

  // Calculate final score
  let finalScore =
    baseScore -
    violationDeduction -
    jurisdictionDeduction -
    serialPlaintiffDeduction +
    improvementBonus +
    industryAdjustmentBonus;

  // Apply traffic multiplier (higher traffic = more deduction)
  const trafficMultiplier = calculateTrafficMultiplier(input);
  finalScore = finalScore / trafficMultiplier;

  // Apply media exposure adjustment
  const mediaAdjustment = calculateMediaExposureAdjustment(input);
  finalScore -= mediaAdjustment;

  // Ensure score stays in 0-850 range
  finalScore = Math.max(0, Math.min(850, Math.round(finalScore)));

  // Calculate improvement potential
  const totalViolations =
    (input.criticalViolations || 0) +
    (input.seriousViolations || 0) +
    (input.moderateViolations || 0) +
    (input.minorViolations || 0);

  // Potential score improvement by fixing critical/serious violations
  const potentialImprovement =
    ((input.criticalViolations || 0) * 15 +
      (input.seriousViolations || 0) * 8) /
    (totalViolations + 1);

  // Generate recommendations
  const recommendations: string[] = [];

  if (input.criticalViolations && input.criticalViolations > 0) {
    recommendations.push(
      `Fix ${input.criticalViolations} critical WCAG AA violations (would improve score by ~${Math.round(input.criticalViolations * 15)} points)`
    );
  }

  if (
    input.seriousViolations &&
    input.seriousViolations > 0 &&
    recommendations.length < 3
  ) {
    recommendations.push(
      `Address ${input.seriousViolations} serious WCAG A violations (would improve score by ~${Math.round(input.seriousViolations * 8)} points)`
    );
  }

  if (
    input.serialPlaintiffThreat &&
    recommendations.length < 3
  ) {
    recommendations.push(
      'Priority: Known serial plaintiff activity in your space - accelerate remediation'
    );
  }

  if (
    jurisdictionRisk > 80 &&
    recommendations.length < 3
  ) {
    recommendations.push(
      `Your jurisdiction (${input.jurisdiction}) has high litigation risk - prioritize compliance`
    );
  }

  if (recommendations.length === 0) {
    recommendations.push('Continue current accessibility practices and monitor for new violations');
  }

  return {
    score: finalScore,
    grade: scoreToGrade(finalScore),
    riskLevel: scoreToRiskLevel(finalScore),
    scoreBreakdown: {
      baseScore,
      violationDeduction: Math.round(violationDeduction),
      jurisdictionDeduction: Math.round(jurisdictionDeduction),
      serialPlaintiffDeduction: Math.round(serialPlaintiffDeduction),
      improvementBonus: Math.round(improvementBonus),
      industryAdjustment: Math.round(industryAdjustmentBonus),
      finalScore,
    },
    factors: {
      technicalDebtScore,
      jurisdictionRisk,
      serialPlaintiffRisk,
      improvementTrend,
      industryAdjustment,
    },
    recommendations,
    improvementPotential: Math.min(100, Math.round(potentialImprovement)),
  };
}

export default {
  computeComplianceScore,
};
