/**
 * Cyber Insurance MGA Types
 * 
 * Core data models for Managing General Agents (MGAs) based on Kluge Playbook
 */

/**
 * MGA Acquisition Target Profile
 * 
 * Represents a potential acquisition target based on:
 * - Financial distress signals (high combined ratio)
 * - Structural assets (reinsurance treaty, claims data)
 * - Operational inefficiency (manual underwriting)
 */
export interface MGATarget {
  id: string;
  name: string;
  
  // Financial Metrics
  annualPremium: number;          // Total premium written (e.g., $10M)
  claimsExpense: number;          // Total claims paid (e.g., $3M)
  operatingExpense: number;       // Operating costs (e.g., $4M)
  combinedRatio: number;          // (claims + expenses) / premium (target: >120% = distressed)
  
  // Book Value & Pricing
  bookValue: number;              // Balance sheet value (e.g., $10M)
  targetAcquisitionPrice: number; // Proposed purchase price (target: 0.5x book)
  
  // Structural Assets
  reinsuranceTreaty: {
    provider: string;
    capacity: number;             // Max coverage limit
    terms: string;
    expiryDate: Date;
    renewalLikelihood: 'high' | 'medium' | 'low';
  };
  
  // Data Assets
  claimsHistory: {
    yearsOfData: number;          // Years of historical claims
    recordCount: number;          // Number of claims records
    dataQuality: 'excellent' | 'good' | 'fair' | 'poor';
    hasVectorization: boolean;    // Already digitized?
  };
  
  // Operational Profile
  underwriters: {
    count: number;                // Number of human underwriters
    avgSalary: number;
    canReplace: boolean;          // Can be replaced by agents?
  };
  
  // Market Position
  jurisdiction: string;           // Primary operating jurisdiction
  niche: string[];                // Specialization (e.g., ['tech', 'healthcare'])
  
  // Distress Signals
  distressScore: number;          // 0-100 (higher = more distressed)
  founderProfile: {
    age: number;
    yearsInBusiness: number;
    exitIntent: 'high' | 'medium' | 'low';
  };
  
  // Acquisition Metadata
  assessmentDate: Date;
  contactInfo?: {
    email?: string;
    phone?: string;
    website?: string;
  };
}

/**
 * MGA Acquisition Score
 * 
 * Scoring model for MGA acquisition attractiveness
 */
export interface MGAAcquisitionScore {
  targetId: string;
  overallScore: number;           // 0-100 (higher = better target)
  
  // Score Breakdown
  breakdown: {
    financialDistress: number;    // Combined ratio, losses
    structuralAssets: number;     // Reinsurance + data quality
    operationalLeverage: number;  // Savings potential from automation
    marketPosition: number;       // Niche, jurisdiction
    acquisitionPrice: number;     // Price relative to book value
  };
  
  // Key Metrics
  projectedSavings: {
    underwriterCostSavings: number;     // Fire underwriters
    expenseReduction: number;           // Operational efficiency
    lossRatioImprovement: number;       // Better risk selection
    totalAnnualSavings: number;
  };
  
  projectedFinancials: {
    year1Ebitda: number;
    year2Ebitda: number;
    year3Ebitda: number;
    irr: number;                  // Internal rate of return
  };
  
  // Risks & Mitigations
  risks: string[];
  mitigations: string[];
  
  // Recommendation
  recommendation: 'acquire' | 'negotiate' | 'pass';
  rationale: string;
  
  assessmentDate: Date;
}

/**
 * MGA Portfolio
 * 
 * Collection of acquired MGAs operating under IS Network
 */
export interface MGAPortfolio {
  portfolioId: string;
  name: string;
  
  // MGAs in Portfolio
  mgas: string[];                 // MGA IDs
  
  // Aggregate Metrics
  totalPremium: number;
  totalEbitda: number;
  avgCombinedRatio: number;
  avgLossRatio: number;
  
  // Network Assets
  claimsGraph: {
    totalRecords: number;
    vectorizationComplete: boolean;
    lastUpdated: Date;
  };
  
  threatIntelFeeds: string[];     // Integrated threat intel sources
  
  // Performance Tracking
  performance: {
    premiumGrowth: number;        // YoY %
    ebitdaMargin: number;         // %
    lossRatioTrend: number;       // Improving/declining
    marketValue: number;          // Portfolio valuation
  };
  
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Reinsurance Treaty
 * 
 * Treaty terms for risk transfer
 */
export interface ReinsuranceTreaty {
  treatyId: string;
  mgaId: string;
  provider: string;
  
  // Coverage Terms
  capacity: number;               // Max coverage
  retentionLimit: number;         // MGA's retention before reinsurance kicks in
  cessionRate: number;            // % of risk ceded to reinsurer
  
  // Pricing
  reinsurancePremium: number;     // Cost of reinsurance
  commissionRate: number;         // % commission from reinsurer
  
  // Terms
  effectiveDate: Date;
  expiryDate: Date;
  renewalStatus: 'active' | 'expiring' | 'terminated';
  
  // Performance
  lossRatio: number;              // Claims / premium on this treaty
  profitShare: number;            // Profit sharing with reinsurer
}

/**
 * Claims Data Record
 * 
 * Individual claim record for vectorization and ML
 */
export interface ClaimRecord {
  claimId: string;
  mgaId: string;
  
  // Claim Details
  policyNumber: string;
  claimDate: Date;
  lossDate: Date;
  
  // Loss Information
  lossAmount: number;
  lossType: string;               // e.g., 'ransomware', 'data_breach'
  
  // Policy Context
  industryType: string;
  companySize: string;
  jurisdiction: string;
  
  // Security Context (if available)
  vulnerabilities?: string[];     // CVEs or vulnerability types
  controls?: string[];            // Security controls in place
  maturityLevel?: string;         // Security maturity (low/medium/high)
  
  // Claim Status
  status: 'open' | 'paid' | 'denied' | 'settled';
  settledAmount?: number;
  
  // ML Features (for underwriting)
  features?: {
    [key: string]: any;           // Extracted features for ML
  };
  
  createdAt: Date;
  updatedAt: Date;
}
