import { RiskEngineService, RiskEngineFactory } from '../RiskEngineService';
import { ActuarialBowService } from '../ActuarialBowService';
import { computeRiskVector, computePremiumRecommendation, analyzeCohort } from '../calculations';

describe('RiskEngineService', () => {
  let engine: RiskEngineService;

  beforeEach(() => {
    engine = new RiskEngineService('insurer', 1000);
  });

  describe('analyze() - Single individual', () => {
    it('should analyze low-risk individual', async () => {
      const payload = {
        musicProfile: {
          calmIndex: 0.8,
          volatilityIndex: 0.2,
          lateNightListening: 0.1,
        },
        sentimentProfile: {
          positivity: 0.8,
          negativity: 0.1,
          volatility: 0.2,
        },
        householdStability: {
          movesLast3Years: 0,
          missedPaymentsLast12Months: 0,
          dependentsCount: 2,
        },
      };

      const result = await engine.analyze(payload);

      expect(result.riskVector.overallRisk).toBeLessThan(0.4);
      expect(result.riskVector.claimsLikelihood).toBeLessThan(0.4);
      expect(result.premiumRecommendation.adjustedPremium).toBeLessThan(1000);
      expect(result.riskVector.drivers).toContain('Standard risk profile');
    });

    it('should analyze high-risk individual', async () => {
      const payload = {
        musicProfile: {
          calmIndex: 0.2,
          volatilityIndex: 0.9,
          lateNightListening: 0.8,
        },
        sentimentProfile: {
          positivity: 0.2,
          negativity: 0.8,
          volatility: 0.9,
        },
        drivingProfile: {
          hardBrakesPer100km: 15,
          harshAccelerationPer100km: 12,
          avgNightDrivingHoursPerWeek: 30,
          speedingIncidentsPerMonth: 5,
        },
        householdStability: {
          movesLast3Years: 3,
          missedPaymentsLast12Months: 4,
          dependentsCount: 1,
        },
      };

      const result = await engine.analyze(payload);

      expect(result.riskVector.overallRisk).toBeGreaterThan(0.6);
      expect(result.riskVector.claimsLikelihood).toBeGreaterThan(0.6);
      expect(result.premiumRecommendation.adjustedPremium).toBeGreaterThan(1500);
      expect(result.riskVector.drivers.length).toBeGreaterThan(0);
    });

    it('should validate input and clamp values to [0,1]', async () => {
      const payload = {
        musicProfile: {
          calmIndex: 1.5, // Out of range
          volatilityIndex: -0.2, // Out of range
          lateNightListening: 0.5,
        },
      };

      const result = await engine.analyze(payload);

      // Should not throw and should clamp values
      expect(result.riskVector.overallRisk).toBeGreaterThanOrEqual(0);
      expect(result.riskVector.overallRisk).toBeLessThanOrEqual(1);
    });

    it('should handle empty/partial payloads', async () => {
      const payload = {};

      const result = await engine.analyze(payload);

      expect(result.riskVector).toBeDefined();
      expect(result.riskVector.overallRisk).toBe(0); // No signals = no risk
      expect(result.riskVector.drivers).toContain('Standard risk profile');
    });

    it('should compute premium recommendations with confidence intervals', async () => {
      const payload = {
        sentimentProfile: { positivity: 0.5, negativity: 0.5, volatility: 0.5 },
      };

      const result = await engine.analyze(payload);
      const prem = result.premiumRecommendation;

      expect(prem.baselinePremium).toBe(1000);
      expect(prem.adjustedPremium).toBeGreaterThan(0);
      expect(prem.confidenceInterval.lower).toBeLessThan(prem.adjustedPremium);
      expect(prem.confidenceInterval.upper).toBeGreaterThan(prem.adjustedPremium);
    });
  });

  describe('analyzeBatch() - Multiple individuals', () => {
    it('should analyze cohort of 3 individuals', async () => {
      const payloads = [
        { sentimentProfile: { positivity: 0.8, negativity: 0.1, volatility: 0.2 } },
        { sentimentProfile: { positivity: 0.5, negativity: 0.5, volatility: 0.5 } },
        { sentimentProfile: { positivity: 0.2, negativity: 0.8, volatility: 0.8 } },
      ];

      const result = await engine.analyzeBatch(payloads);

      expect(result.analyses).toHaveLength(3);
      expect(result.analyses[0].riskVector.overallRisk).toBeLessThan(
        result.analyses[2].riskVector.overallRisk
      );
      expect(result.cohortStats.count).toBe(3);
      expect(result.cohortStats.averageRisk).toBeGreaterThan(0);
    });

    it('should compute cohort statistics correctly', async () => {
      const payloads = [
        { sentimentProfile: { positivity: 0.9, negativity: 0.1, volatility: 0.1 } }, // Low risk
        { sentimentProfile: { positivity: 0.9, negativity: 0.1, volatility: 0.1 } }, // Low risk
        { sentimentProfile: { positivity: 0.1, negativity: 0.9, volatility: 0.9 } }, // High risk
      ];

      const result = await engine.analyzeBatch(payloads);
      const stats = result.cohortStats;

      expect(stats.riskDistribution.low).toBe(2);
      expect(stats.riskDistribution.high).toBe(1);
      expect(stats.topRiskDrivers.length).toBeGreaterThan(0);
      expect(stats.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('analyzeCampusCohort()', () => {
    it('should flag individuals above risk threshold', async () => {
      const payloads = [
        { sentimentProfile: { positivity: 0.8, negativity: 0.1, volatility: 0.1 } }, // Low
        { sentimentProfile: { positivity: 0.1, negativity: 0.9, volatility: 0.9 } }, // High
      ];

      const result = await engine.analyzeCampusCohort(payloads, 0.5);

      expect(result.flaggedIndividuals.length).toBe(1);
      expect(result.flaggedIndividuals[0].index).toBe(1);
      expect(result.flaggedIndividuals[0].interventionNeeded.length).toBeGreaterThan(0);
    });

    it('should recommend mental health support for emotional volatility', async () => {
      const payloads = [
        {
          sentimentProfile: { positivity: 0.2, negativity: 0.8, volatility: 0.9 },
          householdStability: { movesLast3Years: 0, missedPaymentsLast12Months: 0, dependentsCount: 1 },
        },
      ];

      const result = await engine.analyzeCampusCohort(payloads, 0.5);

      expect(result.flaggedIndividuals[0].interventionNeeded).toContain(
        'Refer to campus mental health services'
      );
    });
  });

  describe('analyzeInsurancePortfolio()', () => {
    it('should segment portfolio into risk tiers', async () => {
      const payloads = [
        { sentimentProfile: { positivity: 0.8, negativity: 0.1, volatility: 0.1 } }, // Preferred
        { sentimentProfile: { positivity: 0.5, negativity: 0.5, volatility: 0.5 } }, // Standard
        { sentimentProfile: { positivity: 0.1, negativity: 0.9, volatility: 0.9 } }, // Nonpreferred
      ];

      const result = await engine.analyzeInsurancePortfolio(payloads);

      expect(result.segmentations.preferred.length).toBe(1);
      expect(result.segmentations.standard.length).toBe(1);
      expect(result.segmentations.nonpreferred.length).toBe(1);
    });

    it('should compute portfolio summary metrics', async () => {
      const payloads = [
        { sentimentProfile: { positivity: 0.8, negativity: 0.1, volatility: 0.1 } },
        { sentimentProfile: { positivity: 0.5, negativity: 0.5, volatility: 0.5 } },
      ];

      const result = await engine.analyzeInsurancePortfolio(payloads);

      expect(result.portfolioSummary.totalPolicies).toBe(2);
      expect(result.portfolioSummary.averagePremium).toBeGreaterThan(0);
      expect(result.portfolioSummary.estimatedMixedLossRatio).toBeGreaterThan(0);
    });
  });

  describe('Factory pattern', () => {
    it('should create insurer-specific engine', () => {
      const insurerEngine = RiskEngineFactory.forInsurer(2000);
      const config = insurerEngine.getConfig();

      expect(config.vertical).toBe('insurer');
      expect(config.baselinePremium).toBe(2000);
    });

    it('should create university-specific engine', () => {
      const universityEngine = RiskEngineFactory.forUniversity();
      const config = universityEngine.getConfig();

      expect(config.vertical).toBe('university');
      expect(config.baselinePremium).toBe(0);
    });
  });

  describe('Data integrity', () => {
    it('all RiskVector fields should be in valid ranges', async () => {
      const payload = {
        musicProfile: { calmIndex: 0.5, volatilityIndex: 0.5, lateNightListening: 0.5 },
        sentimentProfile: { positivity: 0.5, negativity: 0.5, volatility: 0.5 },
        drivingProfile: {
          hardBrakesPer100km: 5,
          harshAccelerationPer100km: 5,
          avgNightDrivingHoursPerWeek: 10,
          speedingIncidentsPerMonth: 1,
        },
      };

      const result = await engine.analyze(payload);
      const rv = result.riskVector;

      expect(rv.stabilityScore).toBeGreaterThanOrEqual(0);
      expect(rv.stabilityScore).toBeLessThanOrEqual(1);
      expect(rv.emotionalVolatility).toBeGreaterThanOrEqual(0);
      expect(rv.emotionalVolatility).toBeLessThanOrEqual(1);
      expect(rv.behavioralConsistency).toBeGreaterThanOrEqual(0);
      expect(rv.behavioralConsistency).toBeLessThanOrEqual(1);
      expect(rv.overallRisk).toBeGreaterThanOrEqual(0);
      expect(rv.overallRisk).toBeLessThanOrEqual(1);
      expect(rv.claimsLikelihood).toBeGreaterThanOrEqual(0);
      expect(rv.claimsLikelihood).toBeLessThanOrEqual(1);
      expect(rv.confidence).toBeGreaterThanOrEqual(0);
      expect(rv.confidence).toBeLessThanOrEqual(1);
    });
  });
});
