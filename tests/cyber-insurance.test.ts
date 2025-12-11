/**
 * Cyber Insurance MGA Module Tests
 * 
 * Basic tests for the Kluge Playbook implementation
 */

import {
  MGATarget,
  calculateMGAAcquisitionScore,
  filterMGATargets,
  KLUGE_FILTER_CRITERIA,
} from '../backend/intel/cyberInsurance';

describe('Cyber Insurance MGA Module', () => {
  
  describe('MGA Acquisition Filter', () => {
    
    const mockMGA: MGATarget = {
      id: 'test-mga-001',
      name: 'Test Cyber MGA',
      annualPremium: 10_000_000,
      claimsExpense: 3_000_000,
      operatingExpense: 4_000_000,
      combinedRatio: 120,
      bookValue: 10_000_000,
      targetAcquisitionPrice: 5_000_000,
      reinsuranceTreaty: {
        provider: 'Test Reinsurer',
        capacity: 25_000_000,
        terms: 'Quota share 60%',
        expiryDate: new Date('2026-12-31'),
        renewalLikelihood: 'high',
      },
      claimsHistory: {
        yearsOfData: 5,
        recordCount: 2500,
        dataQuality: 'good',
        hasVectorization: false,
      },
      underwriters: {
        count: 5,
        avgSalary: 85_000,
        canReplace: true,
      },
      jurisdiction: 'CA',
      niche: ['tech'],
      distressScore: 75,
      founderProfile: {
        age: 58,
        yearsInBusiness: 12,
        exitIntent: 'high',
      },
      assessmentDate: new Date(),
    };
    
    test('should calculate acquisition score for MGA target', () => {
      const score = calculateMGAAcquisitionScore(mockMGA);
      
      expect(score).toBeDefined();
      expect(score.targetId).toBe(mockMGA.id);
      expect(score.overallScore).toBeGreaterThan(0);
      expect(score.overallScore).toBeLessThanOrEqual(100);
      expect(score.recommendation).toMatch(/acquire|negotiate|pass/);
    });
    
    test('should generate projected savings', () => {
      const score = calculateMGAAcquisitionScore(mockMGA);
      
      expect(score.projectedSavings).toBeDefined();
      expect(score.projectedSavings.totalAnnualSavings).toBeGreaterThan(0);
      expect(score.projectedSavings.underwriterCostSavings).toBeGreaterThan(0);
    });
    
    test('should calculate IRR', () => {
      const score = calculateMGAAcquisitionScore(mockMGA);
      
      expect(score.projectedFinancials).toBeDefined();
      expect(score.projectedFinancials.irr).toBeGreaterThan(0);
      expect(score.projectedFinancials.year3Ebitda).toBeGreaterThan(score.projectedFinancials.year1Ebitda);
    });
    
    test('should recommend "acquire" for highly distressed MGA', () => {
      const score = calculateMGAAcquisitionScore(mockMGA);
      
      // This MGA meets all Kluge criteria
      expect(score.recommendation).toBe('acquire');
      expect(score.overallScore).toBeGreaterThan(60);
    });
    
    test('should filter multiple MGAs', () => {
      const targets = [
        mockMGA,
        { ...mockMGA, id: 'test-mga-002', combinedRatio: 110 }, // Not distressed enough
        { ...mockMGA, id: 'test-mga-003', combinedRatio: 125 }, // Good target
      ];
      
      const result = filterMGATargets(targets);
      
      expect(result.summary.totalEvaluated).toBe(3);
      expect(result.qualified.length).toBeGreaterThan(0);
    });
  });
  
  describe('Kluge Filter Criteria', () => {
    
    test('should have correct minimum combined ratio', () => {
      expect(KLUGE_FILTER_CRITERIA.minCombinedRatio).toBe(115);
    });
    
    test('should target 0.5x book value', () => {
      expect(KLUGE_FILTER_CRITERIA.targetBookValueMultiple).toBe(0.5);
    });
    
    test('should target 82% IRR', () => {
      expect(KLUGE_FILTER_CRITERIA.targetIRR).toBe(82);
    });
  });
  
  describe('MGA Types', () => {
    
    test('should validate MGA target structure', () => {
      const mockMGA: MGATarget = {
        id: 'test-001',
        name: 'Test MGA',
        annualPremium: 10_000_000,
        claimsExpense: 3_000_000,
        operatingExpense: 4_000_000,
        combinedRatio: 120,
        bookValue: 10_000_000,
        targetAcquisitionPrice: 5_000_000,
        reinsuranceTreaty: {
          provider: 'Test',
          capacity: 25_000_000,
          terms: 'Test',
          expiryDate: new Date(),
          renewalLikelihood: 'high',
        },
        claimsHistory: {
          yearsOfData: 5,
          recordCount: 2500,
          dataQuality: 'good',
          hasVectorization: false,
        },
        underwriters: {
          count: 5,
          avgSalary: 85_000,
          canReplace: true,
        },
        jurisdiction: 'CA',
        niche: ['tech'],
        distressScore: 75,
        founderProfile: {
          age: 58,
          yearsInBusiness: 12,
          exitIntent: 'high',
        },
        assessmentDate: new Date(),
      };
      
      expect(mockMGA.id).toBeTruthy();
      expect(mockMGA.combinedRatio).toBeGreaterThan(100);
      expect(mockMGA.targetAcquisitionPrice / mockMGA.bookValue).toBeLessThanOrEqual(0.6);
    });
  });
});
