/**
 * Phase III — Risk Pricing Engine
 * Insurance-grade underwriting API
 * Combines probability, exposure, and pricing models
 */

import { estimateLawsuitProbability } from './probabilityModel';
import {
  estimateExposure,
  calculateInsurancePremium,
  calculateRemediationBudget,
} from './exposureModel';
import { computeComplianceScore } from './complianceScore';
import type { ComplianceScoringInput } from './complianceScore';

export interface RiskPricingInput extends ComplianceScoringInput {
  // Additional business data
  companySize?: 'startup' | 'smb' | 'mid-market' | 'enterprise';
  estimatedRevenue?: number;
}

export interface RiskPricingOutput {
  // Primary underwriting metrics
  annualLawsuitProbability: number; // 0.0-1.0 (0%-100%)
  annualLawsuitProbabilityPercent: string; // For display

  // Financial exposure
  estimatedSettlementLow: number;
  estimatedSettlementMid: number;
  estimatedSettlementHigh: number;
  estimatedLegalFeesLow: number;
  estimatedLegalFeesHigh: number;
  expectedLawsuitCost: number; // Probability * mid estimate
  totalExposureLow: number;
  totalExposureMid: number;
  totalExposureHigh: number;

  // Insurance pricing
  recommendedInsurancePremium: number; // Annual premium
  recommendedRemediationBudget: number; // Cost to fix issues

  // Compliance scoring
  complianceCreditScore: number; // 0-850
  complianceGrade: string;
  complianceRiskLevel: string;

  // Risk breakdown
  riskFactors: {
    industryRisk: string;
    jurisdictionRisk: string;
    violationSeverity: string;
    plaintiffHistory: string;
  };

  // Recommendations
  recommendations: string[];

  // Metadata
  assessmentDate: Date;
  assessmentConfidence: number; // 0.0-1.0
  dataSource: string;
}

/**
 * Main risk pricing engine
 * Calculates insurance-grade pricing and probability
 */
export function computeRiskPricing(input: RiskPricingInput): RiskPricingOutput {
  // Step 1: Calculate compliance credit score
  const complianceResult = computeComplianceScore(input);

  // Step 2: Estimate lawsuit probability
  const lawsuitProbability = estimateLawsuitProbability({
    violationCount:
      (input.criticalViolations || 0) +
      (input.seriousViolations || 0) +
      (input.moderateViolations || 0) +
      (input.minorViolations || 0),
    criticalViolations: input.criticalViolations || 0,
    seriousViolations: input.seriousViolations || 0,
    jurisdiction: input.jurisdiction,
    industry: input.industry,
    monthlyVisitors: input.monthlyVisitors,
    publicLawsuits: undefined,
    serialPlaintiffActivity: input.serialPlaintiffThreat,
    platformRisk: input.platformRisk,
  });

  // Step 3: Estimate financial exposure
  const exposureResult = estimateExposure({
    criticalViolations: input.criticalViolations || 0,
    seriousViolations: input.seriousViolations || 0,
    violationCount:
      (input.criticalViolations || 0) +
      (input.seriousViolations || 0) +
      (input.moderateViolations || 0) +
      (input.minorViolations || 0),
    annualLawsuitProbability: lawsuitProbability,
    industry: input.industry,
    jurisdiction: input.jurisdiction,
    estimatedRevenue: input.estimatedRevenue,
    monthlyVisitors: input.monthlyVisitors,
    companySize: input.companySize,
  });

  // Step 4: Calculate insurance premium
  const insurancePremium = calculateInsurancePremium(
    exposureResult.expectedExposure,
    lawsuitProbability
  );

  // Step 5: Calculate remediation budget
  const remediationBudget = calculateRemediationBudget({
    criticalViolations: input.criticalViolations || 0,
    seriousViolations: input.seriousViolations || 0,
    violationCount:
      (input.criticalViolations || 0) +
      (input.seriousViolations || 0) +
      (input.moderateViolations || 0) +
      (input.minorViolations || 0),
    annualLawsuitProbability: lawsuitProbability,
    industry: input.industry,
    jurisdiction: input.jurisdiction,
    monthlyVisitors: input.monthlyVisitors,
    companySize: input.companySize,
  });

  // Step 6: Classify risk factors for readability
  function classifyRiskFactor(value: number): string {
    if (value >= 80) return 'Critical';
    if (value >= 60) return 'High';
    if (value >= 40) return 'Medium';
    if (value >= 20) return 'Low';
    return 'Very Low';
  }

  // Step 7: Generate targeted recommendations
  const recommendations: string[] = [];

  // Probability-based recommendations
  if (lawsuitProbability > 0.3) {
    recommendations.push(
      `⚠️ HIGH LAWSUIT RISK: ${Math.round(lawsuitProbability * 100)}% annual probability. Recommend insurance policy immediately.`
    );
  } else if (lawsuitProbability > 0.15) {
    recommendations.push(
      `MEDIUM LAWSUIT RISK: ${Math.round(lawsuitProbability * 100)}% annual probability. Consider insurance coverage.`
    );
  }

  // Compliance score recommendations
  if (complianceResult.score < 400) {
    recommendations.push(
      `URGENT: CCS Score ${complianceResult.score} (${complianceResult.grade}). Critical violations require immediate remediation.`
    );
  } else if (complianceResult.score < 550) {
    recommendations.push(
      `CCS Score ${complianceResult.score} (${complianceResult.grade}). Prioritize fixing ${input.criticalViolations} critical violations.`
    );
  }

  // Financial exposure recommendations
  if (exposureResult.expectedExposure > 100000) {
    recommendations.push(
      `⚠️ EXPOSURE: Expected lawsuit cost is $${exposureResult.expectedExposure.toLocaleString()}. Recommend insurance premium: $${insurancePremium.toLocaleString()}/year.`
    );
  }

  // Jurisdiction recommendations
  if (input.jurisdiction.toUpperCase() === 'CA' || input.jurisdiction.toUpperCase() === 'NY') {
    recommendations.push(
      `${input.jurisdiction} has high litigation activity. Accelerate remediation timeline.`
    );
  }

  // Serial plaintiff recommendations
  if (input.serialPlaintiffThreat) {
    recommendations.push(
      `Known serial plaintiff activity detected. Prioritize accessibility fixes to reduce targeting risk.`
    );
  }

  return {
    // Primary metrics
    annualLawsuitProbability: lawsuitProbability,
    annualLawsuitProbabilityPercent: `${(lawsuitProbability * 100).toFixed(1)}%`,

    // Financial exposure
    estimatedSettlementLow: exposureResult.settlementLow,
    estimatedSettlementMid: exposureResult.settlementMid,
    estimatedSettlementHigh: exposureResult.settlementHigh,
    estimatedLegalFeesLow: exposureResult.legalFeesLow,
    estimatedLegalFeesHigh: exposureResult.legalFeesHigh,
    expectedLawsuitCost: exposureResult.expectedExposure,
    totalExposureLow: exposureResult.totalExposureLow,
    totalExposureMid: exposureResult.totalExposureMid,
    totalExposureHigh: exposureResult.totalExposureHigh,

    // Insurance pricing
    recommendedInsurancePremium: insurancePremium,
    recommendedRemediationBudget: remediationBudget,

    // Compliance scoring
    complianceCreditScore: complianceResult.score,
    complianceGrade: complianceResult.grade,
    complianceRiskLevel: complianceResult.riskLevel,

    // Risk breakdown
    riskFactors: {
      industryRisk: classifyRiskFactor(complianceResult.factors.industryAdjustment),
      jurisdictionRisk: classifyRiskFactor(complianceResult.factors.jurisdictionRisk),
      violationSeverity: classifyRiskFactor(complianceResult.factors.technicalDebtScore),
      plaintiffHistory: classifyRiskFactor(complianceResult.factors.serialPlaintiffRisk),
    },

    // Recommendations
    recommendations:
      recommendations.length > 0
        ? recommendations
        : ['No critical risks identified. Continue regular monitoring.'],

    // Metadata
    assessmentDate: new Date(),
    assessmentConfidence: 0.85, // Typical confidence level
    dataSource: 'InfinitySoul Phase III Risk Underwriting Engine',
  };
}

/**
 * Batch risk pricing for multiple domains
 */
export function computeRiskPricingBatch(
  inputs: RiskPricingInput[]
): RiskPricingOutput[] {
  return inputs.map((input) => computeRiskPricing(input));
}

/**
 * Calculate insurance pool statistics
 * For agencies/insurers managing multiple clients
 */
export function calculatePoolStatistics(outputs: RiskPricingOutput[]) {
  if (outputs.length === 0) {
    return {
      totalPremiums: 0,
      averagePremium: 0,
      averageProbability: 0,
      highRiskCount: 0,
      mediumRiskCount: 0,
      lowRiskCount: 0,
      poolExposure: 0,
    };
  }

  const totalPremiums = outputs.reduce(
    (sum, out) => sum + out.recommendedInsurancePremium,
    0
  );
  const averagePremium = totalPremiums / outputs.length;
  const averageProbability =
    outputs.reduce((sum, out) => sum + out.annualLawsuitProbability, 0) /
    outputs.length;
  const poolExposure = outputs.reduce(
    (sum, out) => sum + out.expectedLawsuitCost,
    0
  );

  const highRiskCount = outputs.filter(
    (out) => out.annualLawsuitProbability > 0.25
  ).length;
  const mediumRiskCount = outputs.filter(
    (out) =>
      out.annualLawsuitProbability > 0.15 &&
      out.annualLawsuitProbability <= 0.25
  ).length;
  const lowRiskCount = outputs.filter(
    (out) => out.annualLawsuitProbability <= 0.15
  ).length;

  return {
    totalPremiums: Math.round(totalPremiums),
    averagePremium: Math.round(averagePremium),
    averageProbability: (averageProbability * 100).toFixed(1) + '%',
    highRiskCount,
    mediumRiskCount,
    lowRiskCount,
    poolExposure: Math.round(poolExposure),
  };
}

export default {
  computeRiskPricing,
  computeRiskPricingBatch,
  calculatePoolStatistics,
};
