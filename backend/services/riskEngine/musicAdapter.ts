/**
 * Music Behavior Risk Adapter
 *
 * Converts music-derived behavioral traits into risk adjustments for actuarial models.
 *
 * IMPORTANT: This adapter produces SOFT MODIFIERS (±5-10% adjustments), NOT primary pricing.
 * Output is used for:
 * - Campus early-warning (wellness triage, support routing)
 * - Wellness coaching (personalized recommendations)
 * - Research (sandboxed validation)
 *
 * NOT used for direct underwriting/claims without multi-year validation + regulator approval.
 *
 * See MUSIC_SIGNAL_SPEC.md, FAIRNESS_BIAS_TESTING_POLICY.md, AI_GOVERNANCE_PROGRAM.md
 */

import {
  MusicDerivedTraits,
  MusicBehaviorRiskIndicators,
  MusicListeningEvent,
  computeMusicDerivedTraits,
} from '../../intel/musicSignals';
import {
  BehavioralRiskFactors,
  ExtendedRiskFactorVector,
  BaseRiskFactor,
  musicTraitsToBehavioralFactors,
  combineRiskFactors,
  validateUseCaseCompliance,
} from '../../intel/riskFactors';

/**
 * Music-to-Risk Adapter Configuration
 */
export interface MusicAdapterConfig {
  // Ensemble model weights (should sum to 1.0)
  xgboostWeight: number; // Default: 0.40
  logisticWeight: number; // Default: 0.30
  lstmWeight: number; // Default: 0.30

  // Fairness thresholds
  maxDisparateImpactRatio: number; // Default: 1.25 (EEOC 80% rule)
  minDisparateImpactRatio: number; // Default: 0.80

  // Use case constraints
  approvedUseCases: Array<'campus_wellness' | 'wellness_coaching' | 'research' | 'underwriting_sandbox'>;

  // Model version
  modelVersion: string;
}

const DEFAULT_CONFIG: MusicAdapterConfig = {
  xgboostWeight: 0.4,
  logisticWeight: 0.3,
  lstmWeight: 0.3,
  maxDisparateImpactRatio: 1.25,
  minDisparateImpactRatio: 0.8,
  approvedUseCases: ['campus_wellness', 'wellness_coaching', 'research'],
  modelVersion: '1.0.0',
};

/**
 * Convert music listening events into risk indicators
 *
 * This is the main entry point for the music behavior risk engine.
 *
 * @param events Music listening events (typically 90 days of history)
 * @param userId User identifier
 * @param contextData Optional contextual data (exam schedules, etc.)
 * @param config Adapter configuration
 * @returns Music behavior risk indicators with recommendations
 */
export function musicEventsToRiskIndicators(
  events: MusicListeningEvent[],
  userId: string,
  contextData?: {
    stressPeriods?: Array<{ start: Date; end: Date; type: string }>;
  },
  config: MusicAdapterConfig = DEFAULT_CONFIG
): MusicBehaviorRiskIndicators {
  // Step 1: Compute music-derived traits
  const traits = computeMusicDerivedTraits(events, { ...contextData, userId });

  // Step 2: Run ensemble models to get risk score
  const riskScore = runEnsembleRiskModels(traits, config);

  // Step 3: Map score to risk band
  const riskBand = mapScoreToBand(riskScore);

  // Step 4: Identify top risk factors
  const topRiskFactors = identifyTopRiskFactors(traits);

  // Step 5: Identify protective factors
  const protectiveFactors = identifyProtectiveFactors(traits);

  // Step 6: Calculate trend
  // TODO: Implement temporal trend by comparing to previous calculation
  // For now, default to 'stable'
  const trend: 'improving' | 'stable' | 'worsening' = 'stable';
  const trendMagnitude = 0;

  // Step 7: Generate actionable recommendations
  const recommendations = generateRecommendations(traits, riskBand);

  // Step 8: Fairness audit check
  const fairnessAuditPassed = checkFairnessAudit(traits, config);

  return {
    userId,
    calculatedAt: new Date(),
    riskBand,
    riskScore,
    topRiskFactors,
    protectiveFactors,
    trend,
    trendMagnitude,
    recommendations,
    fairnessAuditPassed,
    modelVersion: config.modelVersion,
  };
}

/**
 * Convert music traits into extended risk factor vector
 *
 * This combines music-derived behavioral factors with traditional actuarial base factors.
 *
 * @param traits Music-derived traits
 * @param baseFactors Traditional actuarial factors (claims history, demographics, etc.)
 * @param userId User identifier
 * @param useCase Intended use case (enforces ethical constraints)
 * @param config Adapter configuration
 * @returns Extended risk factor vector
 */
export function musicTraitsToRiskVector(
  traits: MusicDerivedTraits,
  baseFactors: BaseRiskFactor[],
  userId: string,
  useCase: 'campus_wellness' | 'wellness_coaching' | 'research' | 'underwriting_sandbox',
  config: MusicAdapterConfig = DEFAULT_CONFIG
): ExtendedRiskFactorVector {
  // Convert music traits to behavioral risk factors
  const behavioralFactors = musicTraitsToBehavioralFactors(traits);

  // Combine with base factors
  const riskVector = combineRiskFactors(baseFactors, behavioralFactors, userId, 'user', useCase);

  // Validate use case compliance
  validateUseCaseCompliance(riskVector, useCase);

  return riskVector;
}

// ============================================================================
// Ensemble Model Functions
// ============================================================================

/**
 * Run ensemble of 3 models (XGBoost, Logistic, LSTM) and combine predictions
 *
 * Based on MUSIC_SIGNAL_SPEC.md § 5.1 Model Architecture
 *
 * TODO: Implement actual trained models (XGBoost, Logistic Regression, LSTM)
 * For now, use heuristic approximations based on research-backed feature weights
 */
function runEnsembleRiskModels(traits: MusicDerivedTraits, config: MusicAdapterConfig): number {
  // Model 1: XGBoost approximation (gradient boosted trees)
  const xgboostScore = runXGBoostApproximation(traits);

  // Model 2: Logistic Regression approximation (interpretable baseline)
  const logisticScore = runLogisticRegressionApproximation(traits);

  // Model 3: LSTM approximation (temporal sequence model)
  const lstmScore = runLSTMApproximation(traits);

  // Weighted ensemble
  const ensembleScore =
    xgboostScore * config.xgboostWeight +
    logisticScore * config.logisticWeight +
    lstmScore * config.lstmWeight;

  return Math.max(0, Math.min(1, ensembleScore));
}

/**
 * XGBoost approximation using all 12 fairness-filtered features
 *
 * TODO: Replace with actual trained XGBoost model
 */
function runXGBoostApproximation(traits: MusicDerivedTraits): number {
  // Weighted sum of risk indicators (higher = more risk)
  const riskScore =
    traits.volatilityIndex * 0.20 + // Emotional instability
    (traits.socialWithdrawalDetected ? 0.15 : 0) + // Social isolation
    traits.lateNightRatio * 0.10 + // Sleep disruption
    (1 - traits.consistencyScore) * 0.10 + // Lack of routine
    traits.skipRate * 0.08 + // Impulsivity
    (traits.engagementTrend === 'declining' ? 0.10 : 0) + // Disengagement
    (traits.maxGapDays > 7 ? 0.10 : 0); // Extended withdrawal

  // Protective factors (higher = less risk)
  const protectiveScore =
    traits.socialListeningRatio * 0.10 + // Social connectedness
    traits.genreDiversity * 0.05 + // Openness
    (traits.moodRepairPatternDetected ? 0.10 : 0) + // Adaptive coping
    traits.stressListeningRatio * 0.05; // Proactive stress management

  // Net score (risk - protective)
  const netScore = riskScore - protectiveScore;

  return Math.max(0, Math.min(1, netScore));
}

/**
 * Logistic Regression approximation using 5 core features
 *
 * TODO: Replace with actual trained logistic regression model
 */
function runLogisticRegressionApproximation(traits: MusicDerivedTraits): number {
  // Simple weighted sum (core features only)
  const score =
    traits.volatilityIndex * 0.30 +
    (1 - traits.consistencyScore) * 0.25 +
    (traits.socialWithdrawalDetected ? 0.20 : 0) +
    traits.stressListeningRatio * -0.15 + // Negative weight: stress listening is protective (adaptive coping)
    traits.skipRate * 0.10;

  return Math.max(0, Math.min(1, score));
}

/**
 * LSTM approximation using temporal sequence patterns
 *
 * TODO: Replace with actual trained LSTM model
 */
function runLSTMApproximation(traits: MusicDerivedTraits): number {
  // Focus on temporal dynamics (trend, gaps, recovery)
  let score = 0.5; // Start at neutral

  // Trend adjustment
  if (traits.engagementTrend === 'increasing') score -= 0.15;
  if (traits.engagementTrend === 'declining') score += 0.20;

  // Gap penalty
  if (traits.maxGapDays > 14) score += 0.15;

  // Recovery speed (faster recovery = lower risk)
  if (traits.recoverySpeedDays > 0 && traits.recoverySpeedDays < 3) score -= 0.10;

  // Volatility over time
  score += traits.volatilityIndex * 0.25;

  return Math.max(0, Math.min(1, score));
}

// ============================================================================
// Risk Factor Identification
// ============================================================================

function identifyTopRiskFactors(traits: MusicDerivedTraits): Array<{
  factor: string;
  contribution: number;
  interpretation: string;
}> {
  const factors: Array<{ factor: string; contribution: number; interpretation: string }> = [];

  // Volatility
  if (traits.volatilityIndex > 0.6) {
    factors.push({
      factor: 'Listening volatility',
      contribution: traits.volatilityIndex * 100,
      interpretation: 'Your listening patterns vary significantly day-to-day, which may indicate emotional instability.',
    });
  }

  // Social withdrawal
  if (traits.socialWithdrawalDetected) {
    factors.push({
      factor: 'Social withdrawal',
      contribution: 30,
      interpretation: "You've reduced social listening by >50% recently, which may indicate isolation risk.",
    });
  }

  // Late-night listening
  if (traits.lateNightRatio > 0.3) {
    factors.push({
      factor: 'Late-night listening',
      contribution: traits.lateNightRatio * 100,
      interpretation: 'High proportion of listening 11pm-4am may indicate sleep disruption or distress.',
    });
  }

  // Declining engagement
  if (traits.engagementTrend === 'declining') {
    factors.push({
      factor: 'Declining engagement',
      contribution: 25,
      interpretation: 'Your music engagement has been decreasing, which may indicate disengagement or withdrawal.',
    });
  }

  // Low consistency
  if (traits.consistencyScore < 0.4) {
    factors.push({
      factor: 'Low routine consistency',
      contribution: (1 - traits.consistencyScore) * 100,
      interpretation: 'Irregular listening patterns may indicate lack of stable routines.',
    });
  }

  // Sort by contribution and take top 3-5
  factors.sort((a, b) => b.contribution - a.contribution);
  return factors.slice(0, 5);
}

function identifyProtectiveFactors(traits: MusicDerivedTraits): Array<{
  factor: string;
  strength: number;
  interpretation: string;
}> {
  const factors: Array<{ factor: string; strength: number; interpretation: string }> = [];

  // Social connectedness
  if (traits.socialListeningRatio > 0.3) {
    factors.push({
      factor: 'Social listening',
      strength: traits.socialListeningRatio,
      interpretation: 'You engage with music socially, which indicates strong social support networks.',
    });
  }

  // Genre diversity
  if (traits.genreDiversity > 0.6) {
    factors.push({
      factor: 'Genre diversity',
      strength: traits.genreDiversity,
      interpretation: 'You explore diverse genres, which indicates openness and cognitive flexibility.',
    });
  }

  // Mood repair
  if (traits.moodRepairPatternDetected) {
    factors.push({
      factor: 'Adaptive mood regulation',
      strength: 0.8,
      interpretation: 'You use music proactively to manage mood, which is a positive coping strategy.',
    });
  }

  // Stress listening (adaptive coping)
  if (traits.stressListeningRatio > 0.2) {
    factors.push({
      factor: 'Stress-aware listening',
      strength: traits.stressListeningRatio,
      interpretation: 'You use music during stress periods, which indicates proactive stress management.',
    });
  }

  // Consistency (stable routines)
  if (traits.consistencyScore > 0.7) {
    factors.push({
      factor: 'Consistent routines',
      strength: traits.consistencyScore,
      interpretation: 'Your stable listening patterns indicate strong routines and emotional stability.',
    });
  }

  // Sort by strength and return all
  factors.sort((a, b) => b.strength - a.strength);
  return factors;
}

// ============================================================================
// Recommendations Generation
// ============================================================================

function generateRecommendations(
  traits: MusicDerivedTraits,
  riskBand: 'low' | 'moderate' | 'elevated' | 'high'
): Array<{
  category: 'social_engagement' | 'sleep_hygiene' | 'stress_management' | 'routine_building';
  action: string;
  expectedImpact: number;
  timeline: string;
}> {
  const recommendations: Array<{
    category: 'social_engagement' | 'sleep_hygiene' | 'stress_management' | 'routine_building';
    action: string;
    expectedImpact: number;
    timeline: string;
  }> = [];

  // Social engagement recommendations
  if (traits.socialWithdrawalDetected || traits.socialListeningRatio < 0.2) {
    recommendations.push({
      category: 'social_engagement',
      action: 'Re-engage with shared playlists or social listening features. Join 2-3 music-based social groups.',
      expectedImpact: 20,
      timeline: '14 days',
    });
  }

  // Sleep hygiene recommendations
  if (traits.lateNightRatio > 0.3) {
    recommendations.push({
      category: 'sleep_hygiene',
      action: 'Reduce late-night listening (11pm-4am) to <20%. Establish consistent sleep schedule.',
      expectedImpact: 10,
      timeline: '21 days',
    });
  }

  // Stress management recommendations
  if (traits.volatilityIndex > 0.6) {
    recommendations.push({
      category: 'stress_management',
      action: 'Develop consistent listening routines during stress periods. Consider mindfulness or counseling resources.',
      expectedImpact: 25,
      timeline: '30 days',
    });
  }

  // Routine building recommendations
  if (traits.consistencyScore < 0.4) {
    recommendations.push({
      category: 'routine_building',
      action: 'Establish regular daily listening patterns (30min-2hr/day). Build consistent daily routines.',
      expectedImpact: 15,
      timeline: '30 days',
    });
  }

  // Only provide recommendations if risk is moderate or higher
  if (riskBand === 'low') {
    return [];
  }

  return recommendations;
}

// ============================================================================
// Fairness & Compliance
// ============================================================================

function mapScoreToBand(score: number): 'low' | 'moderate' | 'elevated' | 'high' {
  if (score < 0.25) return 'low';
  if (score < 0.5) return 'moderate';
  if (score < 0.75) return 'elevated';
  return 'high';
}

function checkFairnessAudit(traits: MusicDerivedTraits, config: MusicAdapterConfig): boolean {
  // Check that all disparate impact ratios are within acceptable range
  const ratiosPass =
    traits.disparateImpactRatio.race >= config.minDisparateImpactRatio &&
    traits.disparateImpactRatio.race <= config.maxDisparateImpactRatio &&
    traits.disparateImpactRatio.age >= config.minDisparateImpactRatio &&
    traits.disparateImpactRatio.age <= config.maxDisparateImpactRatio &&
    traits.disparateImpactRatio.sesProxy >= config.minDisparateImpactRatio &&
    traits.disparateImpactRatio.sesProxy <= config.maxDisparateImpactRatio;

  // Check that source traits passed fairness audit
  return ratiosPass && traits.fairnessAuditPassed;
}
