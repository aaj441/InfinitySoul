/**
 * Four Registers Governance Framework - Type Definitions
 *
 * Stories, Fables, Myths, and Numbers operating as unified governance infrastructure.
 */

// ============================================================================
// CORE ENUMS
// ============================================================================

export enum RegisterType {
  STORIES = 'stories',
  FABLES = 'fables',
  MYTHS = 'myths',
  NUMBERS = 'numbers'
}

export enum Severity {
  CRITICAL = 'critical',  // P0 - Immediate action required
  HIGH = 'high',          // P1 - Action within 4 hours
  MEDIUM = 'medium',      // P2 - Action within 24 hours
  LOW = 'low'             // P3 - Action within 5 business days
}

export enum StoryType {
  ORIGIN = 'origin',           // Why this institution governs AI
  CONFESSION = 'confession',   // How we failed and changed
  PROGRESS = 'progress',       // What we've accomplished
  INCIDENT = 'incident',       // What went wrong, what we learned
  VISION = 'vision'            // Where we're going
}

export enum FablePattern {
  HISTORICAL_BIAS = 'historical_bias',           // COMPAS pattern
  OPTIMIZATION_TARGET = 'optimization_target',    // Amazon hiring pattern
  INEXPLICABLE_DISPARITY = 'inexplicable_disparity', // Apple Card pattern
  SCALE_TRANSFORMATION = 'scale_transformation',  // Clearview AI pattern
  ENGAGEMENT_AMPLIFICATION = 'engagement_amplification', // Facebook/Myanmar pattern
  FALSE_POSITIVE_VIOLENCE = 'false_positive_violence'    // Dutch welfare pattern
}

export enum MythType {
  AUTHORITY = 'authority',       // Why should we listen?
  REFORMATION = 'reformation',   // Capacity for self-correction
  STEWARDSHIP = 'stewardship',   // Fitness to govern
  CONTINUITY = 'continuity',     // Historical precedent
  UNIVERSALISM = 'universalism'  // Represents values beyond itself
}

export enum MetricTier {
  CONSTITUTIONAL = 'constitutional',  // What we promised to uphold
  OPERATIONAL = 'operational',        // How we perform functions
  FORMATION = 'formation',            // How we develop practitioners
  LEGITIMACY = 'legitimacy'           // Whether we maintain authority
}

export enum IncidentStatus {
  DETECTED = 'detected',
  TRIAGED = 'triaged',
  CONTAINED = 'contained',
  INVESTIGATING = 'investigating',
  REMEDIATING = 'remediating',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}

export enum CertificationStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  REVOKED = 'revoked',
  EXPIRED = 'expired'
}

// ============================================================================
// STORIES TYPES
// ============================================================================

export interface Audience {
  id: string;
  name: string;
  type: 'internal' | 'external' | 'regulatory' | 'affected_party' | 'public';
  communicationPreferences: {
    technicalDepth: 'high' | 'medium' | 'low';
    moralFraming: 'explicit' | 'implicit' | 'none';
    proceduralDetail: 'high' | 'medium' | 'low';
  };
}

export interface StoryVersion {
  version: string;
  content: string;
  createdAt: Date;
  createdBy: string;
  changeReason?: string;
}

export interface Story {
  id: string;
  type: StoryType;
  title: string;
  summary: string;
  fullNarrative: string;
  audiences: Audience[];
  audienceAdaptations: Map<string, string>; // audienceId -> adapted narrative
  versions: StoryVersion[];
  currentVersion: string;
  relatedStories: string[]; // Story IDs
  tags: string[];
  coherenceScore?: number; // 0-1, how well it aligns with other stories
  createdAt: Date;
  updatedAt: Date;
  status: 'draft' | 'review' | 'approved' | 'published' | 'archived';
}

export interface ConfessionAct {
  act: 'acknowledgment' | 'analysis' | 'commitment' | 'action';
  content: string;
  evidence?: string[];
  commitments?: string[];
  timeline?: string;
}

export interface Confession {
  id: string;
  institutionId: string;
  acts: ConfessionAct[];
  publicationDate?: Date;
  verificationMechanisms: string[];
  progressReports: {
    date: Date;
    report: string;
    metricsAchieved: string[];
  }[];
  status: 'drafting' | 'review' | 'approved' | 'published' | 'verified';
}

export interface NarrativeCoherenceReport {
  storyId: string;
  checkedAgainst: string[]; // Story IDs
  coherenceScore: number;
  contradictions: {
    withStoryId: string;
    description: string;
    severity: Severity;
  }[];
  recommendations: string[];
  generatedAt: Date;
}

// ============================================================================
// FABLES TYPES
// ============================================================================

export interface FableCharacter {
  role: 'algorithm' | 'affected_party' | 'institution' | 'regulator' | 'other';
  name: string;
  description: string;
}

export interface Fable {
  id: string;
  name: string;
  shortName: string; // e.g., "COMPAS", "Amazon Hiring"
  pattern: FablePattern;

  // Narrative elements
  characters: FableCharacter[];
  narrative: string;
  moral: string;

  // Pattern recognition
  recognitionTriggers: string[];
  warningSignals: string[];
  countermeasures: string[];

  // Metadata
  canonicalStatus: 'canonical' | 'applied' | 'emerging';
  sources: string[];
  relatedFables: string[];

  // Usage tracking
  applicationCount: number;
  lastApplied?: Date;

  createdAt: Date;
  updatedAt: Date;
}

export interface PatternMatch {
  fableId: string;
  fableName: string;
  pattern: FablePattern;
  confidence: number; // 0-1
  matchedTriggers: string[];
  matchedWarnings: string[];
  suggestedCountermeasures: string[];
  analysisNotes: string;
}

export interface FableApplication {
  id: string;
  fableId: string;
  incidentId?: string;
  context: string;
  patternMatch: PatternMatch;
  countermeasuresApplied: string[];
  outcome?: string;
  lessonsLearned?: string;
  contributesToCanon: boolean;
  appliedAt: Date;
  appliedBy: string;
}

// ============================================================================
// MYTHS TYPES
// ============================================================================

export interface MythComponent {
  id: string;
  description: string;
  evidence: string[];
  strength: number; // 0-1
  lastValidated: Date;
}

export interface Myth {
  id: string;
  type: MythType;
  name: string;
  coreNarrative: string;
  components: MythComponent[];

  // Reinforcement mechanisms
  rituals: string[];
  symbols: string[];
  language: string[];
  keyPersonnel: string[];

  // Health tracking
  coherenceWithActions: number; // 0-1
  publicPerception: number; // 0-1
  peerRecognition: number; // 0-1

  // Repair history
  contradictionEvents: {
    date: Date;
    description: string;
    repairAction: string;
    recovered: boolean;
  }[];

  createdAt: Date;
  updatedAt: Date;
}

export interface LegitimacyScore {
  institutionId: string;
  calculatedAt: Date;

  // Component scores (0-1)
  authorityRecognition: number;
  missionAlignment: number;
  stakeholderTrust: number;
  peerLegitimacy: number;
  regulatoryDeference: number;

  // Composite
  overallScore: number;
  trend: 'improving' | 'stable' | 'declining';

  // Analysis
  strengths: string[];
  vulnerabilities: string[];
  recommendations: string[];
}

export interface MythRepairAction {
  id: string;
  mythId: string;
  triggeringEvent: string;
  contradictionDescription: string;
  repairStrategy: string;
  actions: string[];
  timeline: string;
  successCriteria: string[];
  status: 'planned' | 'in_progress' | 'completed' | 'failed';
  outcome?: string;
}

// ============================================================================
// NUMBERS TYPES
// ============================================================================

export interface MetricDefinition {
  id: string;
  name: string;
  tier: MetricTier;
  description: string;

  // Calculation
  formula: string;
  dataSource: string;
  collectionFrequency: 'real_time' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';

  // Thresholds
  target?: number;
  warningThreshold?: number;
  criticalThreshold?: number;

  // Governance
  owner: string;
  lastReviewed: Date;
  antiGamingMeasures: string[];
  pairedQualitativeReview?: string;
}

export interface MetricValue {
  metricId: string;
  value: number;
  calculatedAt: Date;

  // Audit trail
  rawDataReference: string;
  calculationLog: string;
  reviewerSignOff?: string;

  // Context
  periodStart: Date;
  periodEnd: Date;
  notes?: string;
}

export interface MetricAlert {
  id: string;
  metricId: string;
  metricValue: MetricValue;
  alertType: 'warning' | 'critical';
  threshold: number;
  actualValue: number;
  triggeredAt: Date;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
  resolvedAt?: Date;
  resolutionNotes?: string;
}

export interface AuditSchedule {
  id: string;
  entityId: string;
  entityType: 'institution' | 'model' | 'process';
  auditType: 'governance' | 'technical' | 'fairness' | 'comprehensive';
  frequency: 'quarterly' | 'semi_annual' | 'annual';
  lastCompleted?: Date;
  nextScheduled: Date;
  assignedAuditor?: string;
}

export interface AuditFinding {
  id: string;
  auditId: string;
  severity: Severity;
  category: string;
  description: string;
  evidence: string[];
  recommendation: string;
  remediationDeadline: Date;
  remediationStatus: 'pending' | 'in_progress' | 'completed' | 'overdue';
  remediationNotes?: string;
}

export interface Audit {
  id: string;
  scheduleId: string;
  entityId: string;
  auditType: string;
  auditor: string;

  // Execution
  startDate: Date;
  endDate?: Date;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

  // Results
  findings: AuditFinding[];
  overallAssessment?: 'pass' | 'pass_with_findings' | 'fail';
  executiveSummary?: string;

  // Sign-off
  reviewedBy?: string;
  approvedAt?: Date;
}

// ============================================================================
// INCIDENT TYPES
// ============================================================================

export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  status: IncidentStatus;

  // Classification
  type: 'fairness' | 'security' | 'performance' | 'compliance' | 'other';
  affectedEntities: string[];
  affectedPartyCount?: number;

  // Timeline
  detectedAt: Date;
  triagedAt?: Date;
  containedAt?: Date;
  resolvedAt?: Date;
  closedAt?: Date;

  // Response
  assignedTo: string;
  escalatedTo?: string;
  containmentActions: string[];
  remediationActions: string[];

  // Four Registers Integration
  storyId?: string; // Incident story
  fableApplications: FableApplication[];
  mythImpactAssessment?: string;
  metricsImpacted: string[];

  // Post-incident
  rootCause?: string;
  lessonsLearned?: string;
  preventionMeasures?: string[];
}

// ============================================================================
// CERTIFICATION TYPES
// ============================================================================

export interface CertificationRequirement {
  id: string;
  name: string;
  description: string;
  verificationMethod: string;
  evidence: string[];
}

export interface Certification {
  id: string;
  entityId: string;
  entityName: string;
  entityType: 'institution' | 'individual' | 'model';

  // Status
  status: CertificationStatus;
  grantedAt?: Date;
  expiresAt?: Date;
  suspendedAt?: Date;
  revokedAt?: Date;

  // Requirements
  requirements: CertificationRequirement[];
  requirementsMet: Map<string, boolean>;

  // Audit history
  audits: string[]; // Audit IDs
  lastAuditDate?: Date;
  nextAuditDate?: Date;

  // Violations
  violations: {
    date: Date;
    description: string;
    severity: Severity;
    resolved: boolean;
  }[];
}

// ============================================================================
// GOVERNANCE ENGINE TYPES
// ============================================================================

export interface GovernanceAction {
  id: string;
  timestamp: Date;
  actionType: string;
  triggeredBy: string;

  // Four Registers involvement
  registersInvolved: RegisterType[];
  storyActions?: string[];
  fableActions?: string[];
  mythActions?: string[];
  numberActions?: string[];

  // Outcome
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  outcome?: string;
  nextActions?: string[];
}

export interface GovernanceEvent {
  id: string;
  timestamp: Date;
  eventType: string;
  source: RegisterType;

  // Event details
  entityId?: string;
  entityType?: string;
  description: string;
  data: Record<string, unknown>;

  // Propagation
  triggeredActions: string[]; // GovernanceAction IDs
  crossRegisterEffects: {
    register: RegisterType;
    effect: string;
  }[];
}

export interface OrchestratorState {
  healthy: boolean;
  lastHealthCheck: Date;

  registersStatus: {
    [key in RegisterType]: {
      operational: boolean;
      lastActivity: Date;
      pendingActions: number;
      alerts: number;
    };
  };

  activeIncidents: number;
  pendingAudits: number;
  certificationAlerts: number;
  legitimacyScore: number;
}
