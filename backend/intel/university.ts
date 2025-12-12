/**
 * University Domain Models
 *
 * Types for the University AI Risk & Insurance Pilot vertical.
 *
 * This module defines the core entities for campus partnerships, risk event tracking,
 * student risk profiles, and AI pilot configurations.
 *
 * See docs/UNIVERSITY_VERTICAL.md for the full pilot strategy.
 */

import { MusicDerivedTraits } from './musicSignals';

/**
 * Campus (University Partner)
 */
export interface Campus {
  id: string;
  name: string;
  region: string; // e.g., "California", "CSU System"
  riskContactEmail: string; // Campus Risk Officer or IT Security contact
  enrollmentSize?: number;
  partneredAt: Date;
  status: 'active' | 'pilot' | 'inactive';
}

/**
 * Campus Unit (Department, Building, Program)
 */
export interface CampusUnit {
  id: string;
  campusId: string;
  name: string;
  type: 'academic' | 'housing' | 'student_affairs' | 'it' | 'athletics' | 'library' | 'other';
  headEmail?: string;
  buildingCode?: string;
}

/**
 * Campus Risk Event
 *
 * Incidents, violations, or risk signals detected on campus.
 * Used to populate campus risk dashboards for Risk Officers and Insurers.
 */
export interface CampusRiskEvent {
  id: string;
  campusId: string;
  unitId?: string; // Optional: Which unit/department
  category: 'safety' | 'cyber' | 'conduct' | 'accessibility' | 'academic_integrity' | 'health' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  occurredAt: Date;
  reportedAt: Date;
  resolvedAt?: Date;
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  metadata: Record<string, unknown>; // Flexible JSON for event-specific data
}

/**
 * Student Risk Profile
 *
 * Opt-in student risk assessment for wellness coaching and early-warning.
 * NEVER used for disciplinary action or direct premium pricing without multi-year validation + regulator approval.
 */
export interface StudentRiskProfile {
  studentId: string; // Anonymous ID (not student record number)
  campusId: string;
  optInDate: Date;
  consentValid: boolean; // Can withdraw consent at any time

  // Risk assessment
  riskScore: number; // 0-1
  riskBand: 'low' | 'moderate' | 'elevated' | 'high';
  riskDrivers: string[]; // Top 3-5 contributing factors
  protectiveFactors: string[]; // Positive signals

  // Repair pathway
  repairSuggestions: string[]; // Actionable steps to improve wellness
  lastCoachingPlanDate?: Date;
  nextCheckInDate?: Date;

  // Music-derived traits (if opted in to music pilot)
  musicTraits?: MusicDerivedTraits;
  musicDataSource?: 'lastfm' | 'spotify' | 'self_reported';

  // Engagement data (from LMS, library, etc.)
  engagementScore?: number; // 0-1
  lastEngagementUpdate?: Date;

  // Metadata
  calculatedAt: Date;
  modelVersion: string;
}

/**
 * AI Pilot Configuration
 *
 * Controls which features are enabled for each campus partner.
 */
export interface AIPilotConfig {
  campusId: string;
  enabledFeatures: {
    campusDashboard: boolean; // Risk dashboard for Campus Risk Officer + Insurer
    studentPassport: boolean; // Risk & Repair Passport for students (opt-in)
    aiAssurance: boolean; // AI risk monitoring for university-run AI systems
    musicPilot: boolean; // Music behavior risk pilot (requires separate consent)
  };
  pilotStartDate: Date;
  pilotEndDate?: Date;
  status: 'pending' | 'active' | 'paused' | 'completed';
  notesForInsurer?: string;
  notesForRegulator?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Campus Risk Summary (for dashboards)
 */
export interface CampusRiskSummary {
  campusId: string;
  generatedAt: Date;
  timeWindow: '7d' | '30d' | '90d' | '1y';

  // Event statistics
  totalEvents: number;
  eventsByCategory: Record<string, number>;
  eventsBySeverity: Record<string, number>;
  eventsResolved: number;
  eventsOpen: number;

  // Trends
  trendVsPreviousPeriod: number; // % change (positive = more events)
  topRiskCategories: Array<{ category: string; count: number; severity: string }>;

  // Student wellness (aggregate only, no individual data)
  studentPilotEnrollment?: number;
  studentWellnessDistribution?: {
    low: number;
    moderate: number;
    elevated: number;
    high: number;
  };
}

/**
 * Insurer Report (for carrier partners)
 */
export interface InsurerReport {
  campusId: string;
  reportPeriod: { start: Date; end: Date };
  generatedAt: Date;

  // Campus risk profile
  overallRiskScore: number; // 0-1 (aggregate campus risk)
  riskTrend: 'improving' | 'stable' | 'worsening';
  topRiskDrivers: string[];

  // Loss indicators (actuarial metrics)
  estimatedAnnualLoss: number; // $ value
  riskPoolEligibility: 'low' | 'standard' | 'high';

  // Student wellness program impact (if pilot active)
  studentPilotMetrics?: {
    enrolled: number;
    improved: number; // Students who moved to lower risk band
    stable: number;
    declined: number; // Students who moved to higher risk band
  };

  // Recommendations for insurer
  recommendations: string[];
  flagsForUnderwriting: string[];
}

/**
 * Regulator Briefing (for state DOIs, NAIC)
 */
export interface RegulatorBriefing {
  campusId: string;
  generatedAt: Date;

  // Compliance status
  naicAIPrinciplesCompliance: {
    fairness: 'compliant' | 'warnings' | 'violations';
    accountability: 'compliant' | 'warnings' | 'violations';
    transparency: 'compliant' | 'warnings' | 'violations';
    privacy: 'compliant' | 'warnings' | 'violations';
    safety: 'compliant' | 'warnings' | 'violations';
  };

  // Pilot details
  pilotStatus: string;
  studentOptInRate: number; // % of eligible students who opted in
  consentWithdrawalRate: number; // % who withdrew consent
  appealsReceived: number;
  appealsResolved: number;

  // Fairness metrics
  fairnessAuditResults: {
    disparateImpactRatio: { race: number; age: number; sesProxy: number };
    calibrationByGroup: string; // Summary of calibration testing
    biasTestingFrequency: string; // "Quarterly"
  };

  // Model governance
  modelsInUse: Array<{
    modelId: string;
    modelType: string;
    lastValidationDate: Date;
    fairnessAuditPassed: boolean;
  }>;

  // Consumer protection
  adverseActionNotices: number;
  explainabilityProvided: number; // % of risk scores with explanations
  repairPathwaysOffered: number; // % of students with personalized plans

  // Summary for regulator
  executiveSummary: string;
  complianceConcerns: string[];
  remediationActions: string[];
}
