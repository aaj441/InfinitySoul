/**
 * Phase III — Risk Underwriting Engine Tests
 * Comprehensive test suite for CCS, risk pricing, and consensus scanning
 */

import {
  computeComplianceScore,
  type ComplianceScoringInput,
} from '../backend/services/risk/complianceScore';
import { estimateLawsuitProbability } from '../backend/services/risk/probabilityModel';
import {
  estimateExposure,
  calculateInsurancePremium,
  calculateRemediationBudget,
} from '../backend/services/risk/exposureModel';
import { computeRiskPricing } from '../backend/services/risk/riskPricingEngine';
import {
  buildConsensus,
  classifyViolations,
  type EngineResults,
} from '../backend/services/risk/consensusEngine';

describe('Phase III — Risk Underwriting Engine', () => {
  describe('Compliance Credit Score (CCS v2.0)', () => {
    test('Should calculate high score for compliant site', () => {
      const input: ComplianceScoringInput = {
        criticalViolations: 0,
        seriousViolations: 0,
        moderateViolations: 2,
        minorViolations: 5,
        jurisdiction: 'CA',
        industry: 'technology',
      };

      const result = computeComplianceScore(input);

      expect(result.score).toBeGreaterThan(700);
      expect(result.grade).toBe('A');
      expect(result.riskLevel).toBe('low');
    });

    test('Should calculate low score for non-compliant site', () => {
      const input: ComplianceScoringInput = {
        criticalViolations: 15,
        seriousViolations: 25,
        moderateViolations: 40,
        minorViolations: 60,
        jurisdiction: 'CA',
        industry: 'retail',
        serialPlaintiffThreat: true,
        publicLawsuits: 2,
      };

      const result = computeComplianceScore(input);

      expect(result.score).toBeLessThan(400);
      expect(result.grade).toBe('F');
      expect(result.riskLevel).toBe('critical');
    });

    test('Should include recommendations in output', () => {
      const input: ComplianceScoringInput = {
        criticalViolations: 5,
        seriousViolations: 10,
        moderateViolations: 0,
        minorViolations: 0,
        jurisdiction: 'CA',
        industry: 'healthcare',
      };

      const result = computeComplianceScore(input);

      expect(result.recommendations).toBeDefined();
      expect(result.recommendations.length).toBeGreaterThan(0);
      expect(result.recommendations[0]).toContain('critical');
    });

    test('Should calculate improvement potential', () => {
      const input: ComplianceScoringInput = {
        criticalViolations: 10,
        seriousViolations: 20,
        moderateViolations: 0,
        minorViolations: 0,
        jurisdiction: 'CA',
        industry: 'retail',
      };

      const result = computeComplianceScore(input);

      expect(result.improvementPotential).toBeGreaterThan(0);
      expect(result.improvementPotential).toBeLessThanOrEqual(100);
    });

    test('Should account for jurisdiction risk', () => {
      const inputCA: ComplianceScoringInput = {
        criticalViolations: 5,
        seriousViolations: 5,
        moderateViolations: 0,
        minorViolations: 0,
        jurisdiction: 'CA',
        industry: 'technology',
      };

      const inputWY: ComplianceScoringInput = {
        ...inputCA,
        jurisdiction: 'WY',
      };

      const resultCA = computeComplianceScore(inputCA);
      const resultWY = computeComplianceScore(inputWY);

      // CA (high risk) should have lower score than WY (low risk)
      expect(resultCA.score).toBeLessThan(resultWY.score);
    });

    test('Score should always be between 0-850', () => {
      const inputs = [
        {
          criticalViolations: 0,
          seriousViolations: 0,
          moderateViolations: 0,
          minorViolations: 0,
          jurisdiction: 'CA',
          industry: 'technology',
        },
        {
          criticalViolations: 100,
          seriousViolations: 100,
          moderateViolations: 100,
          minorViolations: 100,
          jurisdiction: 'CA',
          industry: 'retail',
          serialPlaintiffThreat: true,
          publicLawsuits: 10,
        },
      ];

      inputs.forEach((input) => {
        const result = computeComplianceScore(input as ComplianceScoringInput);
        expect(result.score).toBeGreaterThanOrEqual(0);
        expect(result.score).toBeLessThanOrEqual(850);
      });
    });
  });

  describe('Lawsuit Probability Model', () => {
    test('Should calculate probability between 0 and 1', () => {
      const result = estimateLawsuitProbability({
        violationCount: 50,
        criticalViolations: 5,
        seriousViolations: 10,
        jurisdiction: 'CA',
        industry: 'retail',
      });

      expect(result).toBeGreaterThanOrEqual(0.0);
      expect(result).toBeLessThanOrEqual(1.0);
    });

    test('Should increase probability with violations', () => {
      const lowViolation = estimateLawsuitProbability({
        violationCount: 5,
        criticalViolations: 0,
        seriousViolations: 0,
        jurisdiction: 'CA',
        industry: 'technology',
      });

      const highViolation = estimateLawsuitProbability({
        violationCount: 100,
        criticalViolations: 20,
        seriousViolations: 40,
        jurisdiction: 'CA',
        industry: 'retail',
      });

      expect(highViolation).toBeGreaterThan(lowViolation);
    });

    test('Should increase probability in high-risk jurisdictions', () => {
      const caProb = estimateLawsuitProbability({
        violationCount: 50,
        criticalViolations: 5,
        seriousViolations: 10,
        jurisdiction: 'CA',
        industry: 'retail',
      });

      const wyProb = estimateLawsuitProbability({
        violationCount: 50,
        criticalViolations: 5,
        seriousViolations: 10,
        jurisdiction: 'WY',
        industry: 'retail',
      });

      expect(caProb).toBeGreaterThan(wyProb);
    });

    test('Should account for serial plaintiff activity', () => {
      const withoutSerial = estimateLawsuitProbability({
        violationCount: 50,
        criticalViolations: 5,
        seriousViolations: 10,
        jurisdiction: 'CA',
        industry: 'retail',
        serialPlaintiffActivity: false,
      });

      const withSerial = estimateLawsuitProbability({
        violationCount: 50,
        criticalViolations: 5,
        seriousViolations: 10,
        jurisdiction: 'CA',
        industry: 'retail',
        serialPlaintiffActivity: true,
      });

      expect(withSerial).toBeGreaterThan(withoutSerial);
    });
  });

  describe('Financial Exposure Model', () => {
    test('Should calculate exposure ranges', () => {
      const result = estimateExposure({
        criticalViolations: 5,
        seriousViolations: 10,
        violationCount: 15,
        annualLawsuitProbability: 0.2,
        industry: 'retail',
        jurisdiction: 'CA',
      });

      expect(result.settlementLow).toBeGreaterThan(0);
      expect(result.settlementMid).toBeGreaterThan(result.settlementLow);
      expect(result.settlementHigh).toBeGreaterThan(result.settlementMid);
      expect(result.totalExposureLow).toBeGreaterThan(0);
    });

    test('Should calculate insurance premium', () => {
      const premium = calculateInsurancePremium(50000, 0.2);

      expect(premium).toBeGreaterThan(50000);
      expect(premium).toBeGreaterThan(0);
    });

    test('Should calculate remediation budget', () => {
      const budget = calculateRemediationBudget({
        criticalViolations: 10,
        seriousViolations: 20,
        violationCount: 30,
        annualLawsuitProbability: 0.3,
        industry: 'retail',
        jurisdiction: 'CA',
      });

      expect(budget).toBeGreaterThanOrEqual(5000);
      expect(budget).toBeLessThanOrEqual(500000);
    });

    test('Higher violations should increase budget', () => {
      const lowViolationBudget = calculateRemediationBudget({
        criticalViolations: 1,
        seriousViolations: 2,
        violationCount: 3,
        annualLawsuitProbability: 0.1,
        industry: 'technology',
        jurisdiction: 'CA',
      });

      const highViolationBudget = calculateRemediationBudget({
        criticalViolations: 20,
        seriousViolations: 40,
        violationCount: 60,
        annualLawsuitProbability: 0.3,
        industry: 'retail',
        jurisdiction: 'CA',
      });

      expect(highViolationBudget).toBeGreaterThan(lowViolationBudget);
    });
  });

  describe('Risk Pricing Engine', () => {
    test('Should return complete risk pricing output', () => {
      const result = computeRiskPricing({
        criticalViolations: 5,
        seriousViolations: 10,
        moderateViolations: 20,
        minorViolations: 30,
        jurisdiction: 'CA',
        industry: 'retail',
      });

      expect(result.complianceCreditScore).toBeDefined();
      expect(result.annualLawsuitProbability).toBeDefined();
      expect(result.expectedLawsuitCost).toBeDefined();
      expect(result.recommendedInsurancePremium).toBeDefined();
      expect(result.recommendedRemediationBudget).toBeDefined();
      expect(result.recommendations).toBeInstanceOf(Array);
      expect(result.assessmentDate).toBeInstanceOf(Date);
    });

    test('Should include risk factors breakdown', () => {
      const result = computeRiskPricing({
        criticalViolations: 5,
        seriousViolations: 10,
        moderateViolations: 0,
        minorViolations: 0,
        jurisdiction: 'CA',
        industry: 'technology',
      });

      expect(result.riskFactors).toBeDefined();
      expect(result.riskFactors.industryRisk).toBeDefined();
      expect(result.riskFactors.jurisdictionRisk).toBeDefined();
      expect(result.riskFactors.violationSeverity).toBeDefined();
    });
  });

  describe('Consensus Engine', () => {
    test('Should build consensus from multiple engines', () => {
      const engineResults: EngineResults[] = [
        {
          engine: 'axe',
          status: 'success',
          violations: [
            {
              id: 'axe-1',
              ruleId: 'color-contrast',
              description: 'Insufficient color contrast',
              severity: 'serious',
              elements: ['button.primary'],
            },
            {
              id: 'axe-2',
              ruleId: 'alt-text',
              description: 'Missing alt text',
              severity: 'critical',
              elements: ['img.logo'],
            },
          ],
          executionTime: 1500,
          confidence: 0.9,
        },
        {
          engine: 'pa11y',
          status: 'success',
          violations: [
            {
              id: 'pa11y-1',
              ruleId: 'color-contrast',
              description: 'Low color contrast',
              severity: 'warning',
              elements: ['button.primary'],
            },
          ],
          executionTime: 2000,
          confidence: 0.85,
        },
      ];

      const result = buildConsensus(engineResults);

      expect(result.consensusViolations).toBeDefined();
      expect(result.statistics).toBeDefined();
      expect(result.statistics.totalCount).toBeGreaterThan(0);
    });

    test('Should classify violations by consensus', () => {
      const engineResults: EngineResults[] = [
        {
          engine: 'axe',
          status: 'success',
          violations: [
            {
              id: 'axe-1',
              ruleId: 'alt-text',
              description: 'Missing alt text',
              severity: 'critical',
              elements: ['img.logo'],
            },
          ],
          executionTime: 1500,
          confidence: 0.9,
        },
        {
          engine: 'pa11y',
          status: 'success',
          violations: [
            {
              id: 'pa11y-1',
              ruleId: 'alt-text',
              description: 'Missing alt text',
              severity: 'error',
              elements: ['img.logo'],
            },
          ],
          executionTime: 1600,
          confidence: 0.92,
        },
      ];

      const consensus = buildConsensus(engineResults);
      const classified = classifyViolations(consensus);

      expect(classified.critical.length + classified.major.length + classified.minor.length).toBeGreaterThan(0);
    });

    test('Violations should require 2+ engines for strong consensus', () => {
      const engineResults: EngineResults[] = [
        {
          engine: 'axe',
          status: 'success',
          violations: [
            {
              id: 'axe-1',
              ruleId: 'color-contrast',
              description: 'Low contrast',
              severity: 'serious',
              elements: ['button'],
            },
          ],
          executionTime: 1500,
          confidence: 0.9,
        },
        {
          engine: 'pa11y',
          status: 'success',
          violations: [
            {
              id: 'pa11y-1',
              ruleId: 'color-contrast',
              description: 'Low contrast',
              severity: 'warning',
              elements: ['button'],
            },
          ],
          executionTime: 1600,
          confidence: 0.88,
        },
        {
          engine: 'wave',
          status: 'success',
          violations: [
            {
              id: 'wave-1',
              ruleId: 'color-contrast',
              description: 'Low contrast',
              severity: 'error',
              elements: ['button'],
            },
          ],
          executionTime: 2000,
          confidence: 0.92,
        },
      ];

      const result = buildConsensus(engineResults);
      const strongConsensus = result.consensusViolations.filter(
        (v) => v.consensus === 'strong'
      );

      expect(strongConsensus.length).toBeGreaterThan(0);
    });
  });

  describe('Integration Tests', () => {
    test('Complete workflow: violation → scoring → pricing → insurance', () => {
      const riskPricingResult = computeRiskPricing({
        criticalViolations: 8,
        seriousViolations: 15,
        moderateViolations: 25,
        minorViolations: 40,
        jurisdiction: 'CA',
        industry: 'retail',
        monthlyVisitors: 50000,
        estimatedRevenue: 5000000,
        companySize: 'smb',
      });

      // Verify all metrics are calculated
      expect(riskPricingResult.complianceCreditScore).toBeGreaterThanOrEqual(0);
      expect(riskPricingResult.complianceCreditScore).toBeLessThanOrEqual(850);
      expect(riskPricingResult.annualLawsuitProbability).toBeGreaterThanOrEqual(0);
      expect(riskPricingResult.annualLawsuitProbability).toBeLessThanOrEqual(1);
      expect(riskPricingResult.expectedLawsuitCost).toBeGreaterThan(0);
      expect(riskPricingResult.recommendedInsurancePremium).toBeGreaterThan(0);
      expect(riskPricingResult.recommendedRemediationBudget).toBeGreaterThan(0);

      // Insurance premium should be higher than expected cost
      expect(riskPricingResult.recommendedInsurancePremium).toBeGreaterThan(
        riskPricingResult.expectedLawsuitCost
      );

      // Should have recommendations
      expect(riskPricingResult.recommendations.length).toBeGreaterThan(0);
    });
  });
});
