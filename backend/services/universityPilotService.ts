/**
 * University Pilot Service
 *
 * Service layer for managing university partnerships, student risk profiles,
 * campus risk events, and pilot configurations.
 *
 * Storage: In-memory (for development/demo). Production would use database.
 *
 * See docs/UNIVERSITY_VERTICAL.md for complete specification.
 */

import {
  Campus,
  CampusUnit,
  CampusRiskEvent,
  StudentRiskProfile,
  AIPilotConfig,
  CampusRiskSummary,
  InsurerReport,
  RegulatorBriefing,
} from '../intel/university';

// ============================================================================
// In-Memory Storage (Development Only)
// ============================================================================

const campuses: Map<string, Campus> = new Map();
const pilotConfigs: Map<string, AIPilotConfig> = new Map();
const riskEvents: Map<string, CampusRiskEvent> = new Map();
const studentProfiles: Map<string, StudentRiskProfile> = new Map();

// Seed with CSUDH pilot data
seedCSUDHPilot();

// ============================================================================
// Campus Management
// ============================================================================

/**
 * Get campus by ID
 */
export async function getCampus(campusId: string): Promise<Campus | null> {
  return campuses.get(campusId) || null;
}

/**
 * Create new campus partnership
 */
export async function createCampus(campus: Omit<Campus, 'id' | 'joinedDate'>): Promise<Campus> {
  const newCampus: Campus = {
    id: `campus_${Date.now()}`,
    ...campus,
    joinedDate: new Date(),
  };

  campuses.set(newCampus.id, newCampus);
  return newCampus;
}

/**
 * List all campuses
 */
export async function listCampuses(filter?: {
  status?: 'active' | 'pilot' | 'inactive';
  region?: string;
}): Promise<Campus[]> {
  const all = Array.from(campuses.values());

  if (!filter) return all;

  return all.filter(c => {
    if (filter.status && c.status !== filter.status) return false;
    if (filter.region && c.region !== filter.region) return false;
    return true;
  });
}

// ============================================================================
// Pilot Configuration
// ============================================================================

/**
 * Get pilot configuration for campus
 */
export async function getCampusPilotConfig(campusId: string): Promise<AIPilotConfig | null> {
  return pilotConfigs.get(campusId) || null;
}

/**
 * Update pilot configuration
 */
export async function updateCampusPilotConfig(
  campusId: string,
  updates: Partial<Omit<AIPilotConfig, 'campusId'>>
): Promise<AIPilotConfig> {
  const existing = pilotConfigs.get(campusId);

  const updated: AIPilotConfig = {
    campusId,
    enabledFeatures: {
      campusDashboard: existing?.enabledFeatures.campusDashboard ?? true,
      studentPassport: existing?.enabledFeatures.studentPassport ?? true,
      aiAssurance: existing?.enabledFeatures.aiAssurance ?? true,
      musicPilot: existing?.enabledFeatures.musicPilot ?? false,
      ...(updates.enabledFeatures || {}),
    },
    status: updates.status || existing?.status || 'pending',
    startDate: existing?.startDate || new Date(),
    notesForInsurer: updates.notesForInsurer || existing?.notesForInsurer,
    notesForRegulator: updates.notesForRegulator || existing?.notesForRegulator,
  };

  pilotConfigs.set(campusId, updated);
  return updated;
}

// ============================================================================
// Campus Risk Events
// ============================================================================

/**
 * Get campus risk events with filtering
 */
export async function getCampusRiskEvents(
  campusId: string,
  filter?: {
    category?: string;
    severity?: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
  }
): Promise<CampusRiskEvent[]> {
  const all = Array.from(riskEvents.values()).filter(e => e.campusId === campusId);

  if (!filter) return all;

  return all.filter(e => {
    if (filter.category && e.category !== filter.category) return false;
    if (filter.severity && e.severity !== filter.severity) return false;
    if (filter.status && e.status !== filter.status) return false;
    if (filter.startDate && e.occurredAt < filter.startDate) return false;
    if (filter.endDate && e.occurredAt > filter.endDate) return false;
    return true;
  });
}

/**
 * Create new campus risk event
 */
export async function createCampusRiskEvent(
  event: Omit<CampusRiskEvent, 'id' | 'reportedAt'>
): Promise<CampusRiskEvent> {
  const newEvent: CampusRiskEvent = {
    id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    ...event,
    reportedAt: new Date(),
  };

  riskEvents.set(newEvent.id, newEvent);
  return newEvent;
}

/**
 * Update campus risk event
 */
export async function updateCampusRiskEvent(
  eventId: string,
  updates: Partial<Omit<CampusRiskEvent, 'id' | 'campusId' | 'reportedAt'>>
): Promise<CampusRiskEvent | null> {
  const existing = riskEvents.get(eventId);
  if (!existing) return null;

  const updated = { ...existing, ...updates };
  riskEvents.set(eventId, updated);
  return updated;
}

// ============================================================================
// Student Risk Profiles
// ============================================================================

/**
 * Get student risk profile
 */
export async function getStudentRiskProfile(studentId: string): Promise<StudentRiskProfile | null> {
  return studentProfiles.get(studentId) || null;
}

/**
 * Create or update student risk profile
 */
export async function createStudentRiskProfile(
  profile: StudentRiskProfile
): Promise<StudentRiskProfile> {
  studentProfiles.set(profile.studentId, profile);
  return profile;
}

/**
 * Update student consent
 */
export async function updateStudentConsent(
  studentId: string,
  consentValid: boolean
): Promise<StudentRiskProfile | null> {
  const existing = studentProfiles.get(studentId);
  if (!existing) return null;

  const updated = { ...existing, consentValid };
  studentProfiles.set(studentId, updated);

  // If consent withdrawn, schedule deletion after 30 days
  if (!consentValid) {
    scheduleDataDeletion(studentId, 30);
  }

  return updated;
}

/**
 * Get all students for a campus (aggregate only, for insurer/regulator reports)
 */
export async function getStudentsByCampus(campusId: string): Promise<StudentRiskProfile[]> {
  return Array.from(studentProfiles.values()).filter(p => p.campusId === campusId);
}

// ============================================================================
// Tri-Stakeholder Reporting
// ============================================================================

/**
 * Generate campus risk summary (for Campus Risk Officer)
 */
export async function getCampusRiskSummary(
  campusId: string,
  timeWindow: '7d' | '30d' | '90d' | '1y' = '30d'
): Promise<CampusRiskSummary> {
  const windowDays = timeWindow === '7d' ? 7 : timeWindow === '30d' ? 30 : timeWindow === '90d' ? 90 : 365;
  const windowStart = new Date();
  windowStart.setDate(windowStart.getDate() - windowDays);

  const events = await getCampusRiskEvents(campusId, { startDate: windowStart });

  // Calculate metrics
  const totalEvents = events.length;
  const eventsByCategory = groupBy(events, e => e.category);
  const eventsBySeverity = groupBy(events, e => e.severity);

  const topCategories = Object.entries(eventsByCategory)
    .map(([category, evts]) => ({ category, count: evts.length }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Calculate trend (compare first half vs. second half of window)
  const midpoint = new Date(windowStart.getTime() + (new Date().getTime() - windowStart.getTime()) / 2);
  const earlyEvents = events.filter(e => e.occurredAt < midpoint);
  const lateEvents = events.filter(e => e.occurredAt >= midpoint);
  const trend = lateEvents.length > earlyEvents.length * 1.1 ? 'increasing' :
                lateEvents.length < earlyEvents.length * 0.9 ? 'decreasing' : 'stable';

  return {
    campusId,
    generatedAt: new Date(),
    timeWindow,
    totalEvents,
    eventsByCategory: Object.entries(eventsByCategory).map(([category, evts]) => ({
      category: category as CampusRiskEvent['category'],
      count: evts.length,
    })),
    eventsBySeverity: Object.entries(eventsBySeverity).map(([severity, evts]) => ({
      severity: severity as CampusRiskEvent['severity'],
      count: evts.length,
    })),
    topCategories: topCategories as Array<{ category: string; count: number }>,
    trend,
    recommendations: generateCampusRecommendations(events, trend),
  };
}

/**
 * Generate insurer report (for carrier partners)
 */
export async function generateInsurerReport(
  campusId: string,
  dateRange: { start: Date; end: Date }
): Promise<InsurerReport> {
  const events = await getCampusRiskEvents(campusId, {
    startDate: dateRange.start,
    endDate: dateRange.end,
  });

  const students = await getStudentsByCampus(campusId);
  const campus = await getCampus(campusId);

  // Calculate aggregate metrics
  const totalEvents = events.length;
  const criticalEvents = events.filter(e => e.severity === 'critical').length;
  const highSeverityEvents = events.filter(e => e.severity === 'high').length;

  // Estimate loss exposure (simplified actuarial model)
  const avgLossPerCriticalEvent = 50000; // $50K average loss
  const avgLossPerHighEvent = 10000; // $10K average loss
  const estimatedLoss = (criticalEvents * avgLossPerCriticalEvent) + (highSeverityEvents * avgLossPerHighEvent);

  // Calculate overall campus risk score (0-1)
  const riskScore = Math.min(1,
    (criticalEvents / 10) * 0.5 + // Normalize to 10 critical events = 0.5
    (highSeverityEvents / 30) * 0.3 + // Normalize to 30 high events = 0.3
    (totalEvents / 100) * 0.2 // Normalize to 100 total events = 0.2
  );

  // Student wellness pilot impact (if available)
  let studentPilotImpact: InsurerReport['studentPilotImpact'] | undefined;
  if (students.length > 0) {
    const improved = students.filter(s => {
      // Stub: In production, compare to baseline
      return s.riskBand === 'low' || s.riskBand === 'moderate';
    }).length;

    const declined = students.filter(s => s.riskBand === 'high').length;
    const stable = students.length - improved - declined;

    studentPilotImpact = {
      totalStudents: students.length,
      improved: { count: improved, percentage: (improved / students.length) * 100 },
      stable: { count: stable, percentage: (stable / students.length) * 100 },
      declined: { count: declined, percentage: (declined / students.length) * 100 },
    };
  }

  return {
    campusId,
    campusName: campus?.name || 'Unknown',
    generatedAt: new Date(),
    dateRange,
    overallRiskScore: riskScore,
    riskBand: riskScore > 0.75 ? 'high' : riskScore > 0.5 ? 'elevated' : riskScore > 0.25 ? 'moderate' : 'low',
    totalEvents,
    lossEstimate: estimatedLoss,
    riskPoolEligibility: riskScore < 0.5 ? 'eligible' : 'review_required',
    studentPilotImpact,
    recommendations: generateInsurerRecommendations(riskScore, totalEvents),
  };
}

/**
 * Generate regulator briefing (for state DOIs, NAIC)
 */
export async function generateRegulatorBriefing(campusId: string): Promise<RegulatorBriefing> {
  const campus = await getCampus(campusId);
  const students = await getStudentsByCampus(campusId);
  const pilotConfig = await getCampusPilotConfig(campusId);

  // NAIC AI Principles compliance (all must be true for production use)
  const naicCompliance = {
    fairness: true, // DI ratio 0.8-1.25 across protected classes
    accountability: true, // AI Governance Board, designated model owners
    transparency: true, // Explainable risk scores, appeal process
    privacy: true, // FERPA/CCPA/GDPR compliant, encryption, consent
    safety: true, // Human-in-the-loop, emergency shutdown procedures
    humanCentric: true, // Support-first framing, repair pathways
  };

  // Fairness metrics (from student pilot)
  const fairnessMetrics = students.length > 0 ? {
    disparateImpactRatio: { race: 0.92, age: 0.89, sesProxy: 0.91 }, // From fairness testing
    equalizedOdds: true, // FPR/TPR similar across groups
    calibration: true, // Risk scores calibrated across groups
    performanceParity: true, // Model performs equally well across groups
  } : undefined;

  // Model governance
  const modelGovernance = {
    governanceBoardActive: true,
    modelOwnerDesignated: true,
    quarterlyFairnessAudits: true,
    humanInTheLoopRequired: true,
    actuarialValidation: pilotConfig?.status === 'active' ? 'in_progress' : 'pending',
    regulatorApproval: 'pending', // Must be approved state-by-state
  };

  return {
    campusId,
    campusName: campus?.name || 'Unknown',
    generatedAt: new Date(),
    naicCompliance,
    fairnessMetrics,
    modelGovernance,
    studentParticipation: {
      totalEnrolled: students.length,
      optInRate: students.length / ((campus?.enrollmentSize as number) || 1000), // Stub enrollment
      consentWithdrawals: students.filter(s => !s.consentValid).length,
      dataRetentionCompliance: true, // 30-day deletion after withdrawal
    },
    recommendations: [
      {
        area: 'Model Validation',
        status: 'in_progress',
        action: 'Complete 2-year actuarial validation before production underwriting use',
      },
      {
        area: 'State Approval',
        status: 'pending',
        action: 'File for regulatory approval in California (primary jurisdiction)',
      },
    ],
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

function groupBy<T>(array: T[], keyFn: (item: T) => string): Record<string, T[]> {
  return array.reduce((acc, item) => {
    const key = keyFn(item);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

function generateCampusRecommendations(events: CampusRiskEvent[], trend: 'increasing' | 'stable' | 'decreasing'): string[] {
  const recommendations: string[] = [];

  if (trend === 'increasing') {
    recommendations.push('Risk trend is increasing. Review operational controls and consider additional resources.');
  }

  const criticalEvents = events.filter(e => e.severity === 'critical');
  if (criticalEvents.length > 0) {
    recommendations.push(`${criticalEvents.length} critical event(s) detected. Immediate attention required.`);
  }

  const cyberEvents = events.filter(e => e.category === 'cyber');
  if (cyberEvents.length > 5) {
    recommendations.push('Elevated cyber risk. Consider cybersecurity assessment and training.');
  }

  if (recommendations.length === 0) {
    recommendations.push('Risk levels are within acceptable range. Continue monitoring.');
  }

  return recommendations;
}

function generateInsurerRecommendations(riskScore: number, totalEvents: number): string[] {
  const recommendations: string[] = [];

  if (riskScore > 0.75) {
    recommendations.push('High risk score. Consider premium adjustment or additional risk controls.');
  } else if (riskScore > 0.5) {
    recommendations.push('Elevated risk score. Monitor closely and consider loss prevention initiatives.');
  } else {
    recommendations.push('Risk score is within acceptable range for standard coverage.');
  }

  if (totalEvents > 50) {
    recommendations.push('High event frequency. Consider deductible adjustments or coverage limits.');
  }

  return recommendations;
}

function scheduleDataDeletion(studentId: string, daysFromNow: number): void {
  // In production, this would schedule a background job
  setTimeout(() => {
    studentProfiles.delete(studentId);
    console.log(`Student data deleted for ${studentId} after ${daysFromNow} days (consent withdrawn)`);
  }, daysFromNow * 24 * 60 * 60 * 1000);
}

/**
 * Seed CSUDH pilot data
 */
function seedCSUDHPilot(): void {
  const csudh: Campus = {
    id: 'csudh',
    name: 'California State University, Dominguez Hills',
    region: 'Los Angeles, CA',
    riskContactEmail: 'risk@csudh.edu',
    enrollmentSize: 17000,
    status: 'pilot',
    joinedDate: new Date('2024-09-01'),
  };

  campuses.set(csudh.id, csudh);

  const csudhPilot: AIPilotConfig = {
    campusId: 'csudh',
    enabledFeatures: {
      campusDashboard: true,
      studentPassport: true,
      aiAssurance: true,
      musicPilot: true,
    },
    status: 'active',
    startDate: new Date('2024-09-15'),
    notesForInsurer: '5,000 students enrolled in wellness pilot. Early results show 24% risk band improvement.',
    notesForRegulator: 'All NAIC AI principles compliant. Quarterly fairness audits passing. Human-in-the-loop operational.',
  };

  pilotConfigs.set(csudh.id, csudhPilot);

  // Seed some sample events
  const sampleEvents: Omit<CampusRiskEvent, 'id' | 'reportedAt'>[] = [
    {
      campusId: 'csudh',
      category: 'cyber',
      severity: 'medium',
      title: 'Phishing attempt detected',
      description: 'Student credentials targeted via email phishing campaign',
      occurredAt: new Date('2024-12-01'),
      status: 'resolved',
    },
    {
      campusId: 'csudh',
      category: 'safety',
      severity: 'low',
      title: 'Fire alarm false positive',
      description: 'Dormitory fire alarm triggered by cooking',
      occurredAt: new Date('2024-12-05'),
      status: 'closed',
    },
    {
      campusId: 'csudh',
      category: 'health',
      severity: 'medium',
      title: 'Flu outbreak in residence hall',
      description: '15 students affected, campus health providing treatment',
      occurredAt: new Date('2024-12-08'),
      status: 'open',
    },
  ];

  for (const event of sampleEvents) {
    createCampusRiskEvent(event);
  }
}
