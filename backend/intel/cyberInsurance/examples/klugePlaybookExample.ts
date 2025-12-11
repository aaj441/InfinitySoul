/**
 * Cyber Insurance MGA Example Usage
 * 
 * Demonstrates the Kluge Playbook implementation
 */

import {
  MGATarget,
  calculateMGAAcquisitionScore,
  filterMGATargets,
  underwriter,
  portfolioEngine,
  RiskAssessmentRequest,
} from '../index';

// ============================================
// Example 1: Evaluate Single MGA Target
// ============================================

console.log('=== Example 1: Evaluate Single MGA Target ===\n');

const cyberShieldMGA: MGATarget = {
  id: 'mga-001',
  name: 'CyberShield MGA',
  
  // Financial Metrics (Distressed)
  annualPremium: 10_000_000,       // $10M premium
  claimsExpense: 3_000_000,        // $3M claims (30% loss ratio - too low, actually)
  operatingExpense: 4_000_000,     // $4M expenses (40% - very high)
  combinedRatio: 120,              // 120% = losing $2M/year
  
  // Pricing (Kluge target: 0.5x book)
  bookValue: 10_000_000,           // $10M book
  targetAcquisitionPrice: 5_000_000, // $5M = 0.5x book ✓
  
  // Structural Assets
  reinsuranceTreaty: {
    provider: 'Lloyd\'s of London',
    capacity: 25_000_000,           // $25M capacity ✓
    terms: 'Quota share 60%',
    expiryDate: new Date('2026-12-31'),
    renewalLikelihood: 'high',     // ✓
  },
  
  // Data Assets
  claimsHistory: {
    yearsOfData: 5,                // 5 years ✓
    recordCount: 2500,             // 2,500 claims ✓
    dataQuality: 'good',           // ✓
    hasVectorization: false,       // We'll vectorize it
  },
  
  // Operational Profile (Can fire underwriters)
  underwriters: {
    count: 5,                      // 5 underwriters
    avgSalary: 85_000,             // $85K each
    canReplace: true,              // ✓ Deploy agents
  },
  
  // Market Position
  jurisdiction: 'CA',              // California (high lawsuit risk)
  niche: ['tech', 'saas'],         // Focused niche ✓
  
  // Distress Signals
  distressScore: 75,               // 75/100 = very distressed
  founderProfile: {
    age: 58,                       // 58 years old ✓
    yearsInBusiness: 12,
    exitIntent: 'high',            // ✓
  },
  
  assessmentDate: new Date(),
};

// Calculate acquisition score
const score = calculateMGAAcquisitionScore(cyberShieldMGA);

console.log('MGA Target:', cyberShieldMGA.name);
console.log('Overall Score:', score.overallScore + '/100');
console.log('Recommendation:', score.recommendation.toUpperCase());
console.log('\nRationale:');
console.log('  ' + score.rationale);
console.log('\nKluge Playbook: "Buy distressed, deploy agents, sell at 5x book"');
