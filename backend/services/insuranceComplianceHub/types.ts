/**
 * Insurance Compliance Hub - Type Definitions
 *
 * Core types for the "Peace of Mind" insurance platform.
 */

// ============================================================================
// INSURANCE LINE TYPES
// ============================================================================

export type InsuranceLine =
  | 'life'
  | 'health'
  | 'disability'
  | 'property'
  | 'casualty'
  | 'cyber'
  | 'workers_comp'
  | 'umbrella'
  | 'errors_omissions'
  | 'bonds'
  | 'general_liability';

export interface InsuranceLineConfig {
  line: InsuranceLine;
  displayName: string;
  description: string;
  commissionRange: { min: number; max: number };
  typicalPremiumRange: { min: number; max: number };
  keyRiskFactors: string[];
  complianceRequirements: string[];
  leadMagnets: LeadMagnet[];
}

export interface LeadMagnet {
  id: string;
  title: string;
  description: string;
  type: 'checklist' | 'calculator' | 'audit' | 'guide' | 'assessment';
  downloadUrl?: string;
  interactiveComponent?: string;
}

// ============================================================================
// CUSTOMER & LEAD TYPES
// ============================================================================

export type LeadSource =
  | 'organic_seo'
  | 'risk_assessment'
  | 'compliance_audit'
  | 'lead_magnet'
  | 'referral'
  | 'paid_ads'
  | 'direct';

export type LeadStatus =
  | 'new'
  | 'assessment_started'
  | 'assessment_completed'
  | 'nurture_sequence'
  | 'quote_requested'
  | 'consultation_scheduled'
  | 'proposal_sent'
  | 'negotiation'
  | 'closed_won'
  | 'closed_lost'
  | 'renewal_pending';

export interface InsuranceLead {
  id: string;
  email: string;
  companyName?: string;
  contactName?: string;
  phone?: string;
  industry: IndustryVertical;
  employeeCount?: number;
  annualRevenue?: number;
  source: LeadSource;
  status: LeadStatus;
  interestedLines: InsuranceLine[];
  riskAssessmentId?: string;
  complianceAuditId?: string;
  lucyConversationId?: string;
  nurtureTouchpoints: NurtureTouchpoint[];
  createdAt: Date;
  updatedAt: Date;
  closedAt?: Date;
  estimatedValue?: number;
  actualValue?: number;
}

export interface NurtureTouchpoint {
  type: 'email' | 'call' | 'meeting' | 'webinar' | 'content_download';
  timestamp: Date;
  content?: string;
  response?: string;
  sequenceStep?: number;
}

// ============================================================================
// INDUSTRY VERTICALS
// ============================================================================

export type IndustryVertical =
  | 'construction'
  | 'technology'
  | 'healthcare'
  | 'retail'
  | 'manufacturing'
  | 'professional_services'
  | 'hospitality'
  | 'transportation'
  | 'education'
  | 'financial_services'
  | 'real_estate'
  | 'nonprofit'
  | 'other';

export interface IndustryRiskProfile {
  industry: IndustryVertical;
  displayName: string;
  primaryRisks: string[];
  recommendedCoverage: InsuranceLine[];
  averagePremiums: Record<InsuranceLine, number>;
  complianceRequirements: string[];
  litigationFrequency: 'low' | 'medium' | 'high' | 'very_high';
  cyberRiskLevel: 'low' | 'medium' | 'high' | 'critical';
}

// ============================================================================
// RISK ASSESSMENT TYPES
// ============================================================================

export interface RiskAssessmentRequest {
  companyName: string;
  industry: IndustryVertical;
  websiteUrl?: string;
  employeeCount: number;
  annualRevenue: number;
  currentCoverage: CurrentCoverage[];
  operationalDetails: OperationalDetails;
  contactEmail: string;
}

export interface CurrentCoverage {
  line: InsuranceLine;
  carrier?: string;
  premium?: number;
  coverageLimit?: number;
  deductible?: number;
  renewalDate?: Date;
}

export interface OperationalDetails {
  hasRemoteWorkers: boolean;
  handlesCustomerData: boolean;
  acceptsCreditCards: boolean;
  hasContractors: boolean;
  operatesVehicles: boolean;
  ownsProperty: boolean;
  hasInventory: boolean;
  providesServices: boolean;
  hasProfessionalLiability: boolean;
}

export interface MultiLineRiskAssessmentResult {
  id: string;
  leadId: string;
  timestamp: Date;

  // Overall scores
  overallRiskScore: number; // 0-100
  infinity8Score: number; // 0-1000
  complianceGrade: ComplianceGrade;

  // Per-line analysis
  lineAnalyses: InsuranceLineAnalysis[];

  // Gap analysis
  coverageGaps: CoverageGap[];
  overinsuredAreas: OverinsuredArea[];

  // Recommendations
  prioritizedRecommendations: InsuranceRecommendation[];
  estimatedTotalPremium: number;
  estimatedTotalCommission: number;

  // Compliance audit summary
  complianceAuditSummary: ComplianceAuditSummary;

  // Lucy's narrative explanation
  lucyNarrative: string;
}

export type ComplianceGrade = 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';

export interface InsuranceLineAnalysis {
  line: InsuranceLine;
  currentStatus: 'covered' | 'underinsured' | 'overinsured' | 'not_covered';
  riskScore: number;
  recommendedCoverage: number;
  currentCoverage?: number;
  gap?: number;
  estimatedPremium: number;
  estimatedCommission: number;
  urgency: 'critical' | 'high' | 'medium' | 'low';
  rationale: string;
}

export interface CoverageGap {
  line: InsuranceLine;
  description: string;
  riskExposure: number;
  potentialLoss: number;
  urgency: 'critical' | 'high' | 'medium' | 'low';
}

export interface OverinsuredArea {
  line: InsuranceLine;
  description: string;
  currentPremium: number;
  recommendedPremium: number;
  potentialSavings: number;
}

export interface InsuranceRecommendation {
  rank: number;
  line: InsuranceLine;
  action: 'add' | 'increase' | 'decrease' | 'maintain' | 'replace';
  description: string;
  estimatedPremium: number;
  estimatedCommission: number;
  roi: string;
  urgencyScore: number;
}

// ============================================================================
// COMPLIANCE AUDIT TYPES
// ============================================================================

export interface ComplianceAuditSummary {
  wcagCompliance: WCAGComplianceResult;
  cyberReadiness: CyberReadinessResult;
  regulatoryCompliance: RegulatoryComplianceResult;
  overallScore: number;
  grade: ComplianceGrade;
}

export interface WCAGComplianceResult {
  score: number;
  level: 'none' | 'A' | 'AA' | 'AAA';
  criticalViolations: number;
  seriousViolations: number;
  moderateViolations: number;
  minorViolations: number;
  litigationRisk: 'low' | 'medium' | 'high' | 'critical';
  estimatedRemediationCost: number;
  topIssues: string[];
}

export interface CyberReadinessResult {
  score: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  hasSSL: boolean;
  hasSecurityHeaders: boolean;
  hasMFA: boolean;
  hasBackupPolicy: boolean;
  hasIncidentResponse: boolean;
  vulnerabilities: CyberVulnerability[];
  recommendedCyberPremium: number;
}

export interface CyberVulnerability {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  remediation: string;
}

export interface RegulatoryComplianceResult {
  score: number;
  applicableRegulations: string[];
  compliantRegulations: string[];
  nonCompliantRegulations: string[];
  riskExposure: number;
}

// ============================================================================
// LUCY AI ADVISOR TYPES
// ============================================================================

export interface LucyConversation {
  id: string;
  leadId?: string;
  sessionId: string;
  messages: LucyMessage[];
  context: LucyContext;
  createdAt: Date;
  updatedAt: Date;
}

export interface LucyMessage {
  id: string;
  role: 'user' | 'lucy' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    citations?: string[];
    confidenceScore?: number;
    suggestedActions?: string[];
    triggerredAssessment?: boolean;
  };
}

export interface LucyContext {
  leadInfo?: Partial<InsuranceLead>;
  riskAssessment?: MultiLineRiskAssessmentResult;
  complianceAudit?: ComplianceAuditSummary;
  currentTopic?: InsuranceLine | 'general' | 'compliance';
  userIntent?: 'learn' | 'quote' | 'compare' | 'audit' | 'support';
}

export interface LucyResponse {
  message: string;
  citations?: string[];
  suggestedQuestions?: string[];
  callToAction?: {
    type: 'assessment' | 'audit' | 'quote' | 'consultation' | 'download';
    label: string;
    action: string;
  };
  confidenceScore: number;
  disclaimer?: string;
}

// ============================================================================
// EMAIL NURTURE TYPES
// ============================================================================

export interface NurtureSequence {
  id: string;
  name: string;
  insuranceLine: InsuranceLine | 'general';
  emails: NurtureEmail[];
  triggerConditions: TriggerCondition[];
}

export interface NurtureEmail {
  step: number;
  subject: string;
  previewText: string;
  body: string;
  delayDays: number;
  callToAction: {
    text: string;
    url: string;
  };
}

export interface TriggerCondition {
  type: 'lead_magnet_download' | 'assessment_complete' | 'page_visit' | 'time_based';
  value: string;
}

// ============================================================================
// COMMISSION TRACKING TYPES
// ============================================================================

export interface CommissionRecord {
  id: string;
  leadId: string;
  policyNumber: string;
  line: InsuranceLine;
  carrier: string;
  premium: number;
  commissionRate: number;
  commissionAmount: number;
  status: 'pending' | 'paid' | 'renewed';
  effectiveDate: Date;
  renewalDate: Date;
  createdAt: Date;
}

export interface CommissionSummary {
  totalYTD: number;
  totalMTD: number;
  projectedAnnual: number;
  byLine: Record<InsuranceLine, number>;
  byCarrier: Record<string, number>;
  renewalsPending: number;
  averagePerCustomer: number;
  customerCount: number;
}

// ============================================================================
// WEBSITE CONTENT TYPES
// ============================================================================

export interface ContentSection {
  id: string;
  title: string;
  slug: string;
  insuranceLine?: InsuranceLine;
  content: ContentBlock[];
  leadMagnets: LeadMagnet[];
  seoMetadata: SEOMetadata;
}

export interface ContentBlock {
  type: 'hero' | 'guide' | 'faq' | 'cta' | 'trust_badges' | 'testimonial' | 'comparison';
  content: Record<string, unknown>;
}

export interface SEOMetadata {
  title: string;
  description: string;
  keywords: string[];
  canonicalUrl: string;
  ogImage?: string;
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

export interface StartAssessmentRequest {
  email: string;
  companyName?: string;
  industry?: IndustryVertical;
  websiteUrl?: string;
}

export interface StartAssessmentResponse {
  assessmentId: string;
  nextStep: string;
  estimatedTime: string;
  lucyGreeting: string;
}

export interface SubmitAssessmentRequest {
  assessmentId: string;
  data: RiskAssessmentRequest;
}

export interface SubmitAssessmentResponse {
  assessmentId: string;
  status: 'processing' | 'complete';
  statusUrl: string;
  estimatedWait: number;
}

export interface GetAssessmentResultsResponse {
  status: 'processing' | 'complete' | 'error';
  result?: MultiLineRiskAssessmentResult;
  error?: string;
  progress?: number;
}

export interface LucyChatRequest {
  conversationId?: string;
  message: string;
  context?: Partial<LucyContext>;
}

export interface LucyChatResponse {
  conversationId: string;
  response: LucyResponse;
}

export interface RequestQuoteRequest {
  leadId: string;
  lines: InsuranceLine[];
  preferredContact: 'email' | 'phone';
  notes?: string;
}

export interface RequestQuoteResponse {
  quoteRequestId: string;
  estimatedResponseTime: string;
  nextSteps: string[];
}
