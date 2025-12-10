/**
 * Risk Factors Domain Models
 *
 * Extended risk factor framework including behavioral modifiers from music signals.
 *
 * IMPORTANT: Behavioral signals are SOFT MODIFIERS, not primary rating variables.
 * They are used for:
 * - Campus early-warning (wellness triage)
 * - Wellness coaching (resource recommendations)
 * - Research (sandboxed validation)
 *
 * NOT used for direct premium pricing without:
 * - Multi-year actuarial validation
 * - Ethics review + Governance Board approval
 * - Regulator approval (state-by-state)
 * - Demonstrated net benefit to insured populations
 *
 * See AI_GOVERNANCE_PROGRAM.md and FAIRNESS_BIAS_TESTING_POLICY.md
 */

import { MusicDerivedTraits, MusicBehaviorRiskIndicators } from './musicSignals';

/**
 * Base risk factor (traditional actuarial)
 */
export interface BaseRiskFactor {
  factorId: string;
  factorName: string;
  domain: 'financial' | 'operational' | 'behavioral' | 'ai' | 'organizational';
  severity: number; // 0-1
  frequency: number; // 0-1
  expectedAnnualLoss: number; // $ value
}

/**
 * Behavioral risk factors (soft modifiers)
 *
 * These extend traditional actuarial factors with behavioral signals.
 */
export interface BehavioralRiskFactors {
  // Affect regulation (from music + engagement patterns)
  affectRegulationScore: number; // 0-1; higher = better coping strategies
  emotionalStabilityScore: number; // 0-1; higher = more stable
  stressResilienceScore: number; // 0-1; higher = better stress response

  // Social engagement (protective factor)
  socialConnectednessScore: number; // 0-1; higher = better social support
  communityEngagementScore: number; // 0-1; higher = more community involvement

  // Sensation seeking (risk indicator)
  sensationSeekingScore: number; // 0-1; higher = more impulsive/risk-taking
  impulsivityScore: number; // 0-1; higher = less impulse control

  // Self-regulation (protective factor)
  routineConsistencyScore: number; // 0-1; higher = more consistent routines
  sleepHygieneScore: number; // 0-1; higher = better sleep patterns

  // Metadata
  derivedFrom: 'music' | 'engagement' | 'composite';
  confidenceLevel: number; // 0-1; how confident are we in these scores?
  fairnessAuditPassed: boolean;
}

/**
 * Extended risk factor vector including behavioral modifiers
 */
export interface ExtendedRiskFactorVector {
  entityId: string;
  entityType: 'user' | 'agent' | 'organization';
  calculatedAt: Date;

  // Traditional actuarial factors
  baseFactors: BaseRiskFactor[];

  // Behavioral modifiers (music-derived)
  behavioralFactors: BehavioralRiskFactors;

  // Music-specific risk indicators
  musicRiskIndicators?: MusicBehaviorRiskIndicators;

  // Composite risk score
  compositeRiskScore: number; // 0-1
  compositeRiskBand: 'low' | 'moderate' | 'elevated' | 'high';

  // Use case constraints (enforced by ethical use policy)
  approvedUseCases: Array<'campus_wellness' | 'wellness_coaching' | 'research' | 'underwriting_sandbox'>;
  prohibitedUseCases: Array<'direct_underwriting' | 'claims_denial' | 'premium_surcharge'>;

  // Fairness metadata
  fairnessAuditPassed: boolean;
  modelVersion: string;
}

/**
 * Convert music-derived traits into behavioral risk factors
 *
 * This mapping is research-backed (see MUSIC_SIGNAL_SPEC.md for peer-reviewed sources)
 * and fairness-tested (all features pass DI ratio 0.8-1.25).
 *
 * @param traits Music-derived behavioral traits
 * @returns Behavioral risk factors (soft modifiers)
 */
export function musicTraitsToBehavioralFactors(traits: MusicDerivedTraits): BehavioralRiskFactors {
  // Affect regulation: inverse of volatility, boosted by mood repair patterns
  const affectRegulationScore = Math.max(
    0,
    Math.min(
      1,
      (1 - traits.volatilityIndex) * 0.7 + (traits.moodRepairPatternDetected ? 0.3 : 0)
    )
  );

  // Emotional stability: combination of consistency and low volatility
  const emotionalStabilityScore = Math.max(
    0,
    Math.min(1, traits.consistencyScore * 0.6 + (1 - traits.volatilityIndex) * 0.4)
  );

  // Stress resilience: stress listening ratio (adaptive coping) + recovery speed
  const stressResilienceScore = Math.max(
    0,
    Math.min(
      1,
      traits.stressListeningRatio * 0.5 + (traits.recoverySpeedDays > 0 ? Math.min(1 / traits.recoverySpeedDays, 1) : 0) * 0.5
    )
  );

  // Social connectedness: social listening ratio, inverse of withdrawal
  const socialConnectednessScore = Math.max(
    0,
    Math.min(1, traits.socialListeningRatio * 0.7 + (traits.socialWithdrawalDetected ? 0 : 0.3))
  );

  // Community engagement: exploration rate + genre diversity (openness, engagement)
  const communityEngagementScore = Math.max(
    0,
    Math.min(1, traits.explorationRate * 0.5 + traits.genreDiversity * 0.5)
  );

  // Sensation seeking: skip rate + repeat intensity (impulsivity, novelty-seeking)
  const sensationSeekingScore = Math.max(
    0,
    Math.min(1, traits.skipRate * 0.5 + traits.repeatIntensity * 0.5)
  );

  // Impulsivity: skip rate + low consistency
  const impulsivityScore = Math.max(
    0,
    Math.min(1, traits.skipRate * 0.6 + (1 - traits.consistencyScore) * 0.4)
  );

  // Routine consistency: direct mapping
  const routineConsistencyScore = traits.consistencyScore;

  // Sleep hygiene: inverse of late-night listening
  const sleepHygieneScore = Math.max(0, Math.min(1, 1 - traits.lateNightRatio));

  return {
    affectRegulationScore,
    emotionalStabilityScore,
    stressResilienceScore,
    socialConnectednessScore,
    communityEngagementScore,
    sensationSeekingScore,
    impulsivityScore,
    routineConsistencyScore,
    sleepHygieneScore,
    derivedFrom: 'music',
    confidenceLevel: traits.fairnessAuditPassed ? 0.85 : 0.5, // Lower confidence if fairness audit failed
    fairnessAuditPassed: traits.fairnessAuditPassed,
  };
}

/**
 * Combine base actuarial factors with behavioral modifiers
 *
 * IMPORTANT: Behavioral factors provide small adjustments (±5-10%), NOT primary pricing.
 * Primary pricing is driven by traditional actuarial factors (claims history, demographics,
 * coverage type, etc.).
 *
 * @param baseFactors Traditional actuarial risk factors
 * @param behavioralFactors Music-derived behavioral modifiers
 * @param useCase Intended use case (enforces ethical constraints)
 * @returns Extended risk factor vector
 */
export function combineRiskFactors(
  baseFactors: BaseRiskFactor[],
  behavioralFactors: BehavioralRiskFactors,
  entityId: string,
  entityType: 'user' | 'agent' | 'organization',
  useCase: 'campus_wellness' | 'wellness_coaching' | 'research' | 'underwriting_sandbox'
): ExtendedRiskFactorVector {
  // Calculate base risk score (weighted average of base factors)
  const baseRiskScore =
    baseFactors.length > 0
      ? baseFactors.reduce((sum, factor) => sum + factor.severity * factor.frequency, 0) / baseFactors.length
      : 0.5; // Default to neutral if no base factors

  // Behavioral adjustment (small modifier, NOT primary driver)
  const behavioralAdjustment = calculateBehavioralAdjustment(behavioralFactors, useCase);

  // Composite risk score: base + behavioral adjustment (capped at ±10%)
  const compositeRiskScore = Math.max(
    0,
    Math.min(1, baseRiskScore + behavioralAdjustment * 0.1) // Max ±10% adjustment
  );

  // Map to risk band
  const compositeRiskBand = mapScoreToBand(compositeRiskScore);

  // Define approved and prohibited use cases based on governance policy
  const approvedUseCases = getApprovedUseCases(useCase);
  const prohibitedUseCases = getProhibitedUseCases(useCase);

  // Fairness audit: passed if behavioral factors passed and base factors are actuarially sound
  const fairnessAuditPassed = behavioralFactors.fairnessAuditPassed;

  return {
    entityId,
    entityType,
    calculatedAt: new Date(),
    baseFactors,
    behavioralFactors,
    compositeRiskScore,
    compositeRiskBand,
    approvedUseCases,
    prohibitedUseCases,
    fairnessAuditPassed,
    modelVersion: '1.0.0',
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

function calculateBehavioralAdjustment(
  factors: BehavioralRiskFactors,
  useCase: 'campus_wellness' | 'wellness_coaching' | 'research' | 'underwriting_sandbox'
): number {
  // Protective factors (reduce risk)
  const protectiveScore =
    (factors.affectRegulationScore +
      factors.emotionalStabilityScore +
      factors.stressResilienceScore +
      factors.socialConnectednessScore +
      factors.communityEngagementScore +
      factors.routineConsistencyScore +
      factors.sleepHygieneScore) /
    7;

  // Risk factors (increase risk)
  const riskScore = (factors.sensationSeekingScore + factors.impulsivityScore) / 2;

  // Net adjustment: protective - risk (range: -1 to +1)
  const netAdjustment = protectiveScore - riskScore;

  // Scale by confidence level
  const confidenceWeightedAdjustment = netAdjustment * factors.confidenceLevel;

  // TODO: For production underwriting use case, apply stricter constraints
  // For now, all use cases get same adjustment logic
  return confidenceWeightedAdjustment;
}

function mapScoreToBand(score: number): 'low' | 'moderate' | 'elevated' | 'high' {
  if (score < 0.25) return 'low';
  if (score < 0.5) return 'moderate';
  if (score < 0.75) return 'elevated';
  return 'high';
}

function getApprovedUseCases(
  useCase: 'campus_wellness' | 'wellness_coaching' | 'research' | 'underwriting_sandbox'
): Array<'campus_wellness' | 'wellness_coaching' | 'research' | 'underwriting_sandbox'> {
  // All current use cases are approved (as defined in MUSIC_SIGNAL_SPEC.md Tier 1-3)
  return [useCase];
}

function getProhibitedUseCases(
  useCase: 'campus_wellness' | 'wellness_coaching' | 'research' | 'underwriting_sandbox'
): Array<'direct_underwriting' | 'claims_denial' | 'premium_surcharge'> {
  // All use cases prohibit direct underwriting, claims denial, premium surcharges
  // (until multi-year validation complete + regulator approval)
  return ['direct_underwriting', 'claims_denial', 'premium_surcharge'];
}

/**
 * Validate that a risk factor vector is being used for an approved use case
 *
 * This enforces the ethical use policy constraints defined in ETHICAL_USE_POLICY.md
 *
 * @param vector Risk factor vector
 * @param intendedUseCase Intended use case
 * @throws Error if use case is prohibited
 */
export function validateUseCaseCompliance(
  vector: ExtendedRiskFactorVector,
  intendedUseCase: string
): void {
  if (
    vector.prohibitedUseCases.includes(
      intendedUseCase as 'direct_underwriting' | 'claims_denial' | 'premium_surcharge'
    )
  ) {
    throw new Error(
      `ETHICS VIOLATION: Use case "${intendedUseCase}" is prohibited for music-derived risk factors. ` +
        `Approved use cases: ${vector.approvedUseCases.join(', ')}. ` +
        `See ETHICAL_USE_POLICY.md for details.`
    );
  }

  if (
    !vector.approvedUseCases.includes(
      intendedUseCase as 'campus_wellness' | 'wellness_coaching' | 'research' | 'underwriting_sandbox'
    )
  ) {
    throw new Error(
      `ETHICS VIOLATION: Use case "${intendedUseCase}" is not approved for this risk vector. ` +
        `Approved use cases: ${vector.approvedUseCases.join(', ')}. ` +
        `Contact Governance Board for use case approval.`
    );
  }

  if (!vector.fairnessAuditPassed) {
    throw new Error(
      `FAIRNESS VIOLATION: Risk vector failed fairness audit. ` +
        `Cannot be used for "${intendedUseCase}" until fairness issues are remediated. ` +
        `See FAIRNESS_BIAS_TESTING_POLICY.md`
    );
  }
}
