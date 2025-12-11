import { RawSignals, MusicProfile } from '../../intel/riskDistribution/types/RawSignals';
import { RiskVector, PremiumRecommendation } from '../../intel/riskDistribution/types/RiskVector';
import { ActuarialBowService } from './ActuarialBowService';
import {
  computeRiskVector,
  computePremiumRecommendation,
  analyzeCohort,
  RISK_WEIGHTS,
  PREMIUM_CONFIG,
} from './calculations';

/**
 * RiskEngineService: Unified risk scoring and analysis service
 *
 * This service is the canonical interface for all risk analysis in InfinitySoul.
 * It wraps the Actuarial Bow (normalization) and risk calculations into a
 * single, configurable service that can be used by:
 * - REST API handlers
 * - Batch processors
 * - Campus early warning system
 * - Insurer underwriting flows
 *
 * Vertical-specific configurations can be injected via constructor.
 */
export class RiskEngineService {
  /**
   * Configuration for risk engine behavior
   */
  private config: {
    verticalName: string; // 'insurer' | 'university' | 'wcag'
    baselinePremium: number; // $ baseline for premium calculation
    riskWeights: typeof RISK_WEIGHTS; // Can be overridden per vertical
    premiumConfig: typeof PREMIUM_CONFIG;
  };

  constructor(
    verticalName: string = 'insurer',
    baselinePremium: number = 1000,
    customWeights?: Partial<typeof RISK_WEIGHTS>
  ) {
    this.config = {
      verticalName,
      baselinePremium,
      riskWeights: customWeights
        ? { ...RISK_WEIGHTS, ...customWeights }
        : RISK_WEIGHTS,
      premiumConfig: PREMIUM_CONFIG,
    };
  }

  /**
   * Main entry point: analyze a single individual/policy
   *
   * @param payload Raw input (any shape); will be normalized to RawSignals
   * @returns RiskVector + PremiumRecommendation
   * @throws Error if payload validation fails
   */
  async analyze(payload: unknown): Promise<{
    riskVector: RiskVector;
    premiumRecommendation: PremiumRecommendation;
  }> {
    // Step 1: Normalize input
    const signals = ActuarialBowService.normalizePayload(payload);

    // Step 2: Compute risk vector
    const riskVector = computeRiskVector(signals);

    // Step 3: Compute premium recommendation
    const premiumRecommendation = computePremiumRecommendation(
      riskVector,
      this.config.baselinePremium
    );

    return { riskVector, premiumRecommendation };
  }

  /**
   * Batch analyze multiple individuals/policies
   * Useful for campus cohort analysis or insurer portfolio underwriting
   *
   * @param payloads Array of raw payloads
   * @returns Array of analysis results + cohort statistics
   */
  async analyzeBatch(payloads: unknown[]): Promise<{
    analyses: Array<{
      index: number;
      riskVector: RiskVector;
      premiumRecommendation: PremiumRecommendation;
    }>;
    cohortStats: ReturnType<typeof analyzeCohort>;
  }> {
    // Normalize all inputs
    const allSignals = payloads.map(p => ActuarialBowService.normalizePayload(p));

    // Analyze each
    const analyses = allSignals.map((signals, index) => ({
      index,
      riskVector: computeRiskVector(signals),
      premiumRecommendation: computePremiumRecommendation(
        computeRiskVector(signals),
        this.config.baselinePremium
      ),
    }));

    // Cohort statistics
    const cohortStats = analyzeCohort(allSignals);

    return { analyses, cohortStats };
  }

  /**
   * Campus-specific: analyze cohort for early warning signals
   * Returns students/individuals at risk of non-retention
   *
   * @param cohortPayloads Array of student/individual signals
   * @param thresholdRisk Risk threshold to flag (default 0.6)
   * @returns High-risk individuals with intervention recommendations
   */
  async analyzeCampusCohort(
    cohortPayloads: unknown[],
    thresholdRisk: number = 0.6
  ): Promise<{
    flaggedIndividuals: Array<{
      index: number;
      riskVector: RiskVector;
      interventionNeeded: string[];
    }>;
    cohortSummary: ReturnType<typeof analyzeCohort>;
  }> {
    const allSignals = cohortPayloads.map(p => ActuarialBowService.normalizePayload(p));
    const risks = allSignals.map(computeRiskVector);
    const cohortStats = analyzeCohort(allSignals);

    const flaggedIndividuals = risks
      .map((risk, index) => ({ risk, index }))
      .filter(({ risk }) => risk.overallRisk >= thresholdRisk)
      .map(({ risk, index }) => ({
        index,
        riskVector: risk,
        interventionNeeded: this.getInterventionRecommendations(risk),
      }))
      .sort((a, b) => b.riskVector.overallRisk - a.riskVector.overallRisk);

    return { flaggedIndividuals, cohortSummary: cohortStats };
  }

  /**
   * Insurer-specific: analyze portfolio risk and pricing recommendations
   *
   * @param payloads Array of policy payloads
   * @returns Portfolio-level analysis with segmentation recommendations
   */
  async analyzeInsurancePortfolio(payloads: unknown[]): Promise<{
    segmentations: {
      preferred: Array<{ index: number; premium: number }>;
      standard: Array<{ index: number; premium: number }>;
      nonpreferred: Array<{ index: number; premium: number }>;
    };
    portfolioSummary: {
      totalPolicies: number;
      averagePremium: number;
      estimatedMixedLossRatio: number;
      recommendations: string[];
    };
  }> {
    const analyses = await this.analyzeBatch(payloads);

    const segmentations = {
      preferred: analyses.analyses
        .filter(a => a.riskVector.overallRisk < 0.33)
        .map(a => ({ index: a.index, premium: a.premiumRecommendation.adjustedPremium }))
        .sort((a, b) => a.premium - b.premium),

      standard: analyses.analyses
        .filter(a => a.riskVector.overallRisk >= 0.33 && a.riskVector.overallRisk < 0.66)
        .map(a => ({ index: a.index, premium: a.premiumRecommendation.adjustedPremium }))
        .sort((a, b) => a.premium - b.premium),

      nonpreferred: analyses.analyses
        .filter(a => a.riskVector.overallRisk >= 0.66)
        .map(a => ({ index: a.index, premium: a.premiumRecommendation.adjustedPremium }))
        .sort((a, b) => b.premium - a.premium),
    };

    const totalPolicies = analyses.analyses.length;
    const averagePremium =
      analyses.analyses.reduce((sum, a) => sum + a.premiumRecommendation.adjustedPremium, 0) /
      totalPolicies;

    const estimatedMixedLossRatio = 0.65; // Placeholder; would come from loss data

    return {
      segmentations,
      portfolioSummary: {
        totalPolicies,
        averagePremium: Math.round(averagePremium * 100) / 100,
        estimatedMixedLossRatio,
        recommendations: analyses.cohortStats.recommendations,
      },
    };
  }

  /**
   * Get human-readable intervention recommendations for a high-risk individual
   * Used in campus early warning and support context
   *
   * @param risk RiskVector for the individual
   * @returns Array of specific, actionable recommendations
   */
  private getInterventionRecommendations(risk: RiskVector): string[] {
    const recommendations: string[] = [];

    if (risk.emotionalVolatility > 0.6) {
      recommendations.push('Refer to campus mental health services');
      recommendations.push('Schedule regular check-ins with academic advisor');
    }

    if (risk.stabilityScore < 0.4) {
      recommendations.push('Connect with student financial aid office');
      recommendations.push('Explore housing stability resources');
    }

    if (risk.behavioralConsistency < 0.4) {
      recommendations.push('Discuss time management and study skills');
      recommendations.push('Consider peer mentoring program');
    }

    if (risk.overallRisk > 0.8) {
      recommendations.push('Escalate to Dean of Students for comprehensive support plan');
    }

    return recommendations.length > 0
      ? recommendations
      : ['Continue normal support; monitor in future semesters'];
  }

  /**
   * Get configuration details (for transparency in API responses)
   */
  getConfig() {
    return {
      vertical: this.config.verticalName,
      baselinePremium: this.config.baselinePremium,
      riskWeights: this.config.riskWeights,
    };
  }

  /**
   * Set baseline premium (useful for multi-product scenarios)
   */
  setBaselinePremium(premium: number) {
    this.config.baselinePremium = premium;
  }
}

/**
 * Factory: Create vertical-specific risk engines
 */
export const RiskEngineFactory = {
  forInsurer: (baselinePremium: number = 1000) =>
    new RiskEngineService('insurer', baselinePremium),

  forUniversity: () =>
    new RiskEngineService('university', 0), // No premium calculation for universities

  forWCAG: () =>
    new RiskEngineService('wcag', 0),
};
