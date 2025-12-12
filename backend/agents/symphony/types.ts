/**
 * Infinity Soul Symphony - Agent Types
 * 
 * Core type definitions for the 10-agent system that coordinates
 * financial assets (MGAs), personal optimization (biometrics, relationships),
 * and governance (House Committee).
 */

// ============================================================================
// Base Agent Types
// ============================================================================

export interface AgentConfig {
  enabled: boolean;
  awsRegion?: string;
  freeTrierMode?: boolean;
}

export interface AgentReport {
  agentName: string;
  timestamp: Date;
  status: 'success' | 'warning' | 'error';
  summary: string;
  metrics?: Record<string, number>;
  actions?: AgentAction[];
}

export interface AgentAction {
  actionType: string;
  description: string;
  requiresApproval: boolean;
  data?: any;
}

// ============================================================================
// Financial Agent Types
// ============================================================================

export interface MGATarget {
  id: string;
  name: string;
  premium: number;
  combinedRatio: number;
  founderAge: number;
  dataYears: number;
  discordMembers: number;
  distressScore: number; // 0-100, higher = more distressed
}

export interface MGAOffer {
  targetId: string;
  cashAtClose: number;
  revsharePercent: number;
  soulTokens: number;
  offerSentAt: Date;
  expiresAt: Date;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
}

export interface UnderwritingQuote {
  submissionId: string;
  company: string;
  premium: number;
  lossProbability: number;
  riskFactors: string[];
  quotedAt: Date;
}

export interface ClaimInvestigation {
  claimId: string;
  claimant: string;
  amount: number;
  investigationSummary: string;
  payoutRecommendation: number;
  controlImprovements: string[];
  cost: number;
}

// ============================================================================
// Personal Agent Types
// ============================================================================

export interface BiometricData {
  hrv: number; // Heart Rate Variability (ms)
  testosterone: number; // ng/dL
  sleepLatency: number; // minutes
  timestamp: Date;
}

export interface BiometricOptimization {
  currentMetrics: BiometricData;
  recommendations: string[];
  adjustments: {
    diet?: string;
    training?: string;
    sleep?: string;
    supplements?: string;
  };
}

export interface Deal {
  id: string;
  type: 'partnership' | 'ma' | 'talent';
  description: string;
  value: number;
  priority: number; // 1-10
  source: string;
  surfacedAt: Date;
}

export interface Relationship {
  id: string;
  name: string;
  lastContact: Date;
  priority: 'high' | 'medium' | 'low';
  notes: string;
}

export interface RelationshipPing {
  relationshipId: string;
  type: 'birthday' | 'congratulations' | 'checkin' | 'wine_send';
  draftMessage: string;
  requiresApproval: boolean;
}

export interface Paper {
  id: string;
  title: string;
  source: 'arxiv' | 'pubmed' | 'forum';
  summary: string;
  actionItems: string[];
  ingestedAt: Date;
}

export interface ContentPiece {
  platform: 'twitter' | 'linkedin' | 'blog' | 'podcast';
  content: string;
  scheduledFor: Date;
  status: 'draft' | 'approved' | 'published';
}

export interface NegotiationPrep {
  callWith: string;
  callAt: Date;
  painPoints: string[];
  leverage: string[];
  openingLine: string;
  walkAwayPoint: string;
  predictedWinRate: number; // 0-1
}

export interface GovernanceProposal {
  id: string;
  type: 'acquire_asset' | 'cut_relationship' | 'move_city' | 'hire_fire' | 'capital_deploy';
  title: string;
  description: string;
  proposedBy: string;
  proposedAt: Date;
  votingEndsAt: Date;
  votes: {
    voter: string;
    weight: number;
    vote: 'yes' | 'no' | 'abstain';
  }[];
  status: 'voting' | 'passed' | 'rejected';
}

// ============================================================================
// Metrics Types
// ============================================================================

export interface FinancialKPIs {
  dailyQuotes: number;
  dailyBinds: number;
  lossRatio: number;
  combinedRatio: number;
  protocolRevenue: number;
  sponsorRevenue: number;
}

export interface PersonalKPIs {
  hrv: number;
  testosterone: number;
  deepWorkHours: number;
  activeRelationships: number;
  dealsSourced: number;
  papersIngested: number;
  followers: number;
  netWorth: number;
}

export interface DailyReport {
  date: Date;
  financial: FinancialKPIs;
  personal: PersonalKPIs;
  agentReports: AgentReport[];
  status: 'on_track' | 'warning' | 'emergency';
}
