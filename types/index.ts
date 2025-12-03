/**
 * Core domain types for InfinitySol
 * All types are grounded in WCAG 2.2 standards and verifiable data
 */

// WCAG Violation Model
export interface WCAGViolation {
  id: string;
  ruleId: string; // axe-core rule ID (e.g., 'button-name')
  ruleName: string;
  wcagCriteria: string; // e.g., '4.1.2 Name, Role, Value'
  level: 'A' | 'AA' | 'AAA'; // Conformance level
  severity: 'critical' | 'serious' | 'moderate' | 'minor';
  description: string;
  impact: string; // Impact on disabled users
  elements: ViolationElement[];
  remediationSteps: string[];
  estimatedFixTime: {
    min: number; // hours
    max: number;
  };
}

export interface ViolationElement {
  selector: string;
  html: string;
  failureMessage: string;
}

// Audit Model
export interface AccessibilityAudit {
  id: string;
  domain: string;
  url: string;
  timestamp: Date;
  status: 'completed' | 'in-progress' | 'failed';

  // Scan results
  violations: {
    critical: WCAGViolation[];
    serious: WCAGViolation[];
    moderate: WCAGViolation[];
    minor: WCAGViolation[];
  };

  // Tripartite validation
  validation: {
    automated: {
      tool: 'axe-core' | 'pa11y';
      version: string;
      status: 'pass' | 'fail';
    };
    expert?: {
      reviewer: string;
      credentials: string[];
      notes: string;
      confirmedViolations: number;
    };
    blockchain?: {
      txHash: string;
      timestamp: Date;
      immutable: boolean;
    };
  };

  // Statistics
  stats: {
    totalViolations: number;
    criticalCount: number;
    seriousCount: number;
    pagesScanned: number;
    wcagAACompliant: boolean;
    wcagAAACompliant: boolean;
  };
}

// Litigation Data Model (public sources only)
export interface LitigationCase {
  id: string;

  // Case identifiers
  caseNumber: string;
  court: string; // e.g., 'E.D.N.Y.' (from PACER)
  jurisdiction: string; // Circuit or state

  // Parties
  plaintiff: string;
  defendant: string;

  // Violation details
  violationTypes: string[]; // e.g., ['missing-alt-text', 'keyboard-trap']
  wcagCriteriaViolated: string[];

  // Business details
  defendantIndustry: string;
  defendantSize: 'startup' | 'smb' | 'mid-market' | 'enterprise';

  // Outcome
  status: 'settled' | 'judgment' | 'appeal' | 'ongoing';
  settlementAmount?: number;
  legalFeesPaid?: number;
  judgmentAmount?: number;

  // Timeline
  filedDate: Date;
  settledDate?: Date;

  // Evidence
  source: 'PACER' | 'RECAP' | 'Public-Record' | 'News';
  documentUrl?: string;

  // Plaintiff profile (serial plaintiff tracking)
  serialPlaintiffInfo?: {
    name: string;
    casesFiledCount: number;
    successRate: number;
    law_firm: string;
  };
}

// Risk Assessment Model
export interface RiskAssessment {
  auditId: string;
  assessmentDate: Date;

  // Risk scoring
  riskScore: number; // 0-100
  riskLevel: 'critical' | 'high' | 'medium' | 'low';

  // Lawsuit probability based on historical data
  litigationRisk: {
    probability: number; // 0-100, based on similar cases
    estimatedSettlementCost: {
      low: number;
      mid: number;
      high: number;
    };
    estimatedLegalFees: {
      low: number;
      high: number;
    };
    totalExposure: {
      low: number;
      high: number;
    };
  };

  // Comparable cases from litigation database
  comparableCases: {
    case: LitigationCase;
    similarity: number; // 0-100, how similar to this business
  }[];

  // Industry benchmark
  industryBenchmark: {
    industry: string;
    averageViolationCount: number;
    yourViolationCount: number;
    percentile: number; // Where you rank (0-100)
  };

  // Remediation impact
  remediationImpact: {
    criticalFixCount: number;
    estimatedFixTime: number; // hours
    estimatedCost: number;
    riskReductionToLevel: 'medium' | 'low';
  };
}

// Infinity8 Compliance Score (like FICO for accessibility)
export interface Infinity8Score {
  id: string;
  domain: string;

  // The score (0-1000)
  score: number; // Like FICO (300-850) but 0-1000
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';

  // Score components
  factors: {
    wcagCompliance: number; // 0-100
    litigationHistory: number; // 0-100 (lower risk = higher score)
    remediationVelocity: number; // 0-100 (how fast you fix issues)
    industryBenchmark: number; // 0-100 (compared to peers)
    thirdPartyValidation: number; // 0-100 (external audits)
  };

  // Financial impact estimates
  marketImpact: {
    insurancePremiumDelta: number; // % increase/decrease
    rfpWinRateDelta: number; // % impact on winning contracts
    enterprisePartnershipScore: number; // 0-100
    creditScore: 'excellent' | 'good' | 'fair' | 'poor';
  };

  // Trend data
  history: {
    date: Date;
    score: number;
    grade: string;
  }[];

  lastUpdated: Date;
}

// Email Campaign Model
export interface EmailTemplate {
  id: string;
  name: string;
  audience: 'cold-prospect' | 'known-high-risk' | 'non-compliant-competitor' | 'post-audit';

  // Email structure
  subjectLine: string;
  preview: string;
  body: string;

  // Personalization fields
  personalizationFields: string[]; // {{companyName}}, {{violationCount}}, etc.

  // Data-backed claims
  claims: {
    claim: string;
    source: 'litigation-data' | 'wcag-standard' | 'industry-research';
    evidenceUrl?: string;
  }[];

  // Performance metrics
  metrics?: {
    sent: number;
    opened: number;
    clicked: number;
    replied: number;
  };
}

// News Aggregator Model
export interface AccessibilityNews {
  id: string;
  title: string;
  description: string;
  source: string;
  url: string;
  category: 'litigation' | 'regulation' | 'technology' | 'precedent';

  // AI-generated summary
  summary?: string;
  keyTakeaway?: string;

  // Litigation-specific
  litigationData?: {
    case?: LitigationCase;
    settlement?: number;
    industry?: string;
  };

  // Impact assessment
  impactLevel: 'critical' | 'high' | 'medium' | 'low';
  relevantTo?: string[]; // Industries, company types affected

  publishedDate: Date;
  fetchedDate: Date;
}

// Crisis Response Model
export interface CrisisEvent {
  id: string;
  type: 'demand-letter' | 'complaint-filed' | 'settlement-offer' | 'media-alert';
  status: 'detected' | 'acknowledged' | 'in-response' | 'resolved';

  detectedAt: Date;

  // Event details
  details: {
    defendant?: string;
    plaintiff?: string;
    allegations?: string[];
    documentUrl?: string;
  };

  // Response protocol
  responseTeam: {
    legal: string[];
    remediation: string[];
    communications: string[];
  };

  // Timeline
  timeline: {
    action: string;
    completedAt?: Date;
    status: 'completed' | 'in-progress' | 'pending';
  }[];

  // Outcome
  outcome?: {
    settlement?: number;
    remediationDeadline?: Date;
    outcome: string;
  };
}

// API Response Models
export interface ScanRequest {
  domain: string;
  url?: string;
  includeScreenshots: boolean;
  webhookUrl?: string; // For async results
}

export interface ScanResponse {
  auditId: string;
  status: 'queued' | 'in-progress' | 'completed';
  estimatedTimeRemaining?: number; // seconds
  results?: AccessibilityAudit;
  riskAssessment?: RiskAssessment;
}

export interface ComplianceReport {
  audit: AccessibilityAudit;
  riskAssessment: RiskAssessment;
  infinity8Score: Infinity8Score;
  recommendations: string[];
  estimatedRemediationCost: number;
  estimatedRemediationTime: number;
}
