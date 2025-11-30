/**
 * Risk Assessment Service
 * Purely quantitative risk calculation based on public data
 * No legal conclusions - just facts and comparable cases
 */

import { RiskAssessment, AccessibilityAudit, Infinity8Score } from '../types/index';
import * as litigationDB from './litigationDatabase';
import { v4 as uuidv4 } from 'uuid';

/**
 * Calculate litigation risk based on:
 * 1. Violation patterns from public cases
 * 2. Industry-specific settlement averages
 * 3. Comparable case outcomes
 *
 * This is purely statistical analysis - not legal advice
 */
export function assessRisk(audit: AccessibilityAudit, industry: string): RiskAssessment {
  const assessmentDate = new Date();

  // Extract violation types from audit
  const violationTypes = extractViolationTypes(audit);

  // Get litigation probability from public data
  const litigationProbability = litigationDB.calculateLitigationProbability(violationTypes, industry);

  // Get comparable cases
  const comparableCases = litigationDB.getComparableCases(violationTypes, industry, 5);

  // Calculate exposure estimates based on comparable cases
  const exposureEstimates = calculateExposure(comparableCases, violationTypes, industry);

  // Industry benchmarking
  const industryBenchmark = litigationDB.getIndustryBenchmark(industry, audit.stats.totalViolations);

  // Remediation impact
  const remediationImpact = calculateRemediationImpact(audit);

  // Determine risk level
  const riskScore = calculateRiskScore(
    litigationProbability,
    audit.stats.criticalCount,
    audit.stats.totalViolations
  );

  const riskLevel: 'critical' | 'high' | 'medium' | 'low' = riskScore >= 75 ? 'critical' : riskScore >= 50 ? 'high' : riskScore >= 25 ? 'medium' : 'low';

  return {
    auditId: audit.id,
    assessmentDate,
    riskScore,
    riskLevel,

    litigationRisk: {
      probability: litigationProbability,
      estimatedSettlementCost: {
        low: exposureEstimates.settlementLow,
        mid: exposureEstimates.settlementMid,
        high: exposureEstimates.settlementHigh,
      },
      estimatedLegalFees: {
        low: exposureEstimates.legalFeesLow,
        high: exposureEstimates.legalFeesHigh,
      },
      totalExposure: {
        low: exposureEstimates.settlementLow + exposureEstimates.legalFeesLow,
        high: exposureEstimates.settlementHigh + exposureEstimates.legalFeesHigh,
      },
    },

    comparableCases: comparableCases,

    industryBenchmark,

    remediationImpact,
  };
}

/**
 * Extract violation types from audit results
 */
function extractViolationTypes(audit: AccessibilityAudit): string[] {
  const types = new Set<string>();

  for (const severity of ['critical', 'serious', 'moderate', 'minor'] as const) {
    audit.violations[severity].forEach((v) => {
      types.add(v.ruleId);
    });
  }

  return Array.from(types);
}

/**
 * Calculate litigation probability score (0-100)
 * Based on:
 * - How often this violation appears in lawsuits
 * - Number of critical violations
 * - Comparable case outcomes
 */
function calculateRiskScore(litigationProbability: number, criticalCount: number, totalCount: number): number {
  // Base score from litigation probability
  let score = litigationProbability;

  // Amplify if critical violations present
  if (criticalCount > 0) {
    score += criticalCount * 5; // Each critical violation adds risk
  }

  // Normalize by total violations
  if (totalCount > 0) {
    const violationIntensity = criticalCount / totalCount;
    score = score * (0.7 + violationIntensity * 0.3); // Weight by severity distribution
  }

  return Math.min(Math.round(score), 100);
}

/**
 * Calculate exposure (settlement + legal fees) based on comparable cases
 */
function calculateExposure(
  comparableCases: { case: any; similarity: number }[],
  violationTypes: string[],
  industry: string
): {
  settlementLow: number;
  settlementMid: number;
  settlementHigh: number;
  legalFeesLow: number;
  legalFeesHigh: number;
} {
  if (comparableCases.length === 0) {
    // Default estimate if no comparable cases
    return {
      settlementLow: 25000,
      settlementMid: 50000,
      settlementHigh: 100000,
      legalFeesLow: 15000,
      legalFeesHigh: 50000,
    };
  }

  // Calculate based on comparable cases
  const settlements = comparableCases
    .map((c) => c.case.settlementAmount || 0)
    .filter((s) => s > 0);

  const legalFees = comparableCases
    .map((c) => c.case.legalFeesPaid || 0)
    .filter((f) => f > 0);

  const avgSettlement = settlements.length > 0 ? settlements.reduce((a, b) => a + b, 0) / settlements.length : 50000;

  const avgLegalFees = legalFees.length > 0 ? legalFees.reduce((a, b) => a + b, 0) / legalFees.length : 30000;

  return {
    settlementLow: Math.round(avgSettlement * 0.5),
    settlementMid: Math.round(avgSettlement),
    settlementHigh: Math.round(avgSettlement * 1.5),
    legalFeesLow: Math.round(avgLegalFees * 0.5),
    legalFeesHigh: Math.round(avgLegalFees * 1.5),
  };
}

/**
 * Calculate remediation impact on risk level
 */
function calculateRemediationImpact(audit: AccessibilityAudit): {
  criticalFixCount: number;
  estimatedFixTime: number;
  estimatedCost: number;
  riskReductionToLevel: 'medium' | 'low';
} {
  const criticalFixCount = audit.violations.critical.length;

  // Estimate total fix time
  let totalFixTime = 0;
  for (const severity of ['critical', 'serious'] as const) {
    audit.violations[severity].forEach((v) => {
      totalFixTime += (v.estimatedFixTime.min + v.estimatedFixTime.max) / 2;
    });
  }

  // Estimate cost (assume $100-150/hour for senior developer)
  const estimatedCost = Math.round(totalFixTime * 125);

  // Risk reduction estimate
  const riskReductionToLevel =
    criticalFixCount <= 5 && totalFixTime <= 40 ? ('low' as const) : ('medium' as const);

  return {
    criticalFixCount,
    estimatedFixTime: Math.round(totalFixTime),
    estimatedCost,
    riskReductionToLevel,
  };
}

/**
 * Get risk assessment explanation in plain language
 * (For report generation - no legal conclusions, just data interpretation)
 */
export function explainRisk(assessment: RiskAssessment, industry: string): string {
  const benchmark = assessment.industryBenchmark;

  const lines: string[] = [];

  // Risk level explanation
  lines.push(`## Risk Assessment Summary`);
  lines.push(``);
  lines.push(`**Risk Score:** ${assessment.riskScore}/100 (${assessment.riskLevel.toUpperCase()})`);
  lines.push(``);

  // Litigation probability explanation
  lines.push(`**Litigation Risk:** Based on public data from ${assessment.comparableCases.length} comparable cases,`);
  lines.push(`sites with similar violation patterns have a ${assessment.litigationRisk.probability}% rate of being named in legal action.`);
  lines.push(``);

  // Exposure explanation
  lines.push(`**Potential Exposure:** Comparable cases in your industry have resulted in`);
  lines.push(`settlement amounts ranging from $${assessment.litigationRisk.estimatedSettlementCost.low.toLocaleString()} to $${assessment.litigationRisk.estimatedSettlementCost.high.toLocaleString()},`);
  lines.push(`plus legal fees from $${assessment.litigationRisk.estimatedLegalFees.low.toLocaleString()} to $${assessment.litigationRisk.estimatedLegalFees.high.toLocaleString()}.`);
  lines.push(``);

  // Industry benchmark explanation
  lines.push(`**Industry Position:** Your site ranks in the ${100 - benchmark.percentile}th percentile for accessibility`);
  lines.push(`in your industry (${benchmark.industry}). ${benchmark.averageViolationCount} violations is typical;`);
  lines.push(`you have ${benchmark.yourViolationCount} identified violations.`);
  lines.push(``);

  // Remediation impact
  lines.push(`**Remediation Impact:** Fixing your ${assessment.remediationImpact.criticalFixCount} critical violations`);
  lines.push(`would take approximately ${assessment.remediationImpact.estimatedFixTime} hours ($${assessment.remediationImpact.estimatedCost.toLocaleString()} at typical rates)`);
  lines.push(`and would reduce risk to ${assessment.remediationImpact.riskReductionToLevel.toUpperCase()} levels.`);
  lines.push(``);

  lines.push(`---`);
  lines.push(``);
  lines.push(`**IMPORTANT DISCLAIMER:** This assessment is a technical analysis based on public litigation data and WCAG standards.`);
  lines.push(`It is not legal advice. For legal opinions regarding liability or remediation strategy, consult an attorney.`);
  lines.push(``);
  lines.push(`**Data Sources:**`);
  lines.push(`- PACER (Public Access to Court Electronic Records)`);
  lines.push(`- WCAG 2.2 Technical Standards`);
  lines.push(`- Public industry benchmarking data`);

  return lines.join(`\n`);
}

export default {
  assessRisk,
  explainRisk,
};
