/**
 * Numbers Audit System - Quantitative Governance Infrastructure
 *
 * Numbers operationalize accountability. Without metrics:
 * - Accountability is unverifiable
 * - Progress is unmeasurable
 * - Failures are undetectable
 *
 * But numbers without the other registers become Goodhart's Law victims.
 * This system pairs quantitative metrics with qualitative oversight.
 */

import {
  MetricDefinition,
  MetricValue,
  MetricAlert,
  MetricTier,
  AuditSchedule,
  AuditFinding,
  Audit,
  Certification,
  CertificationStatus,
  CertificationRequirement,
  Severity,
  Incident,
  IncidentStatus
} from './types';

// ============================================================================
// STORAGE
// ============================================================================

const metricDefinitions: Map<string, MetricDefinition> = new Map();
const metricValues: Map<string, MetricValue[]> = new Map(); // metricId -> values
const alerts: Map<string, MetricAlert> = new Map();
const auditSchedules: Map<string, AuditSchedule> = new Map();
const audits: Map<string, Audit> = new Map();
const certifications: Map<string, Certification> = new Map();
const incidents: Map<string, Incident> = new Map();

// ============================================================================
// CANONICAL METRICS - The Governance Measurement Framework
// ============================================================================

export const CanonicalMetrics: Record<string, Omit<MetricDefinition, 'id' | 'lastReviewed'>> = {

  // TIER 1: CONSTITUTIONAL METRICS
  DISPARATE_IMPACT_RATIO: {
    name: 'Disparate Impact Ratio',
    tier: MetricTier.CONSTITUTIONAL,
    description: 'Ratio of outcome rates between protected class and reference class. Values > 1.0 indicate potential discrimination.',
    formula: 'outcome_rate_protected_class / outcome_rate_reference_class',
    dataSource: 'Model output analysis by demographic',
    collectionFrequency: 'daily',
    target: 1.0,
    warningThreshold: 1.1,
    criticalThreshold: 1.2,
    owner: 'Chief Compliance Officer',
    antiGamingMeasures: [
      'Multiple demographic breakdowns required',
      'Statistical significance testing',
      'External audit verification quarterly'
    ],
    pairedQualitativeReview: 'Fairness board review of flagged cases'
  },

  EXPLANATION_COVERAGE: {
    name: 'Explanation Coverage',
    tier: MetricTier.CONSTITUTIONAL,
    description: 'Percentage of decisions with auditable explanations available',
    formula: 'decisions_with_explanations / total_decisions * 100',
    dataSource: 'Decision audit log',
    collectionFrequency: 'daily',
    target: 100,
    warningThreshold: 99,
    criticalThreshold: 95,
    owner: 'Chief AI Officer',
    antiGamingMeasures: [
      'Explanation quality sampling',
      'User comprehension testing',
      'External explainability audit'
    ],
    pairedQualitativeReview: 'Monthly explanation quality review'
  },

  APPEAL_RESOLUTION_RATE: {
    name: 'Appeal Resolution Rate',
    tier: MetricTier.CONSTITUTIONAL,
    description: 'Percentage of appeals resolved within SLA',
    formula: 'appeals_resolved_in_sla / total_appeals * 100',
    dataSource: 'Appeals tracking system',
    collectionFrequency: 'weekly',
    target: 95,
    warningThreshold: 90,
    criticalThreshold: 80,
    owner: 'Chief Compliance Officer',
    antiGamingMeasures: [
      'Appeal outcome quality review',
      'Appellant satisfaction surveys',
      'Resolution reversal tracking'
    ],
    pairedQualitativeReview: 'Quarterly appeals quality audit'
  },

  HUMAN_REVIEW_RATE: {
    name: 'Human Review Rate',
    tier: MetricTier.CONSTITUTIONAL,
    description: 'Percentage of high-risk decisions with human review',
    formula: 'high_risk_decisions_human_reviewed / total_high_risk_decisions * 100',
    dataSource: 'Decision workflow logs',
    collectionFrequency: 'daily',
    target: 100,
    warningThreshold: 100, // No warning - must be 100%
    criticalThreshold: 99,
    owner: 'Chief Compliance Officer',
    antiGamingMeasures: [
      'Review timestamp verification',
      'Reviewer attention metrics',
      'Random review audit sampling'
    ],
    pairedQualitativeReview: 'Weekly review quality assessment'
  },

  // TIER 2: OPERATIONAL METRICS
  AUDIT_COMPLETION_RATE: {
    name: 'Audit Completion Rate',
    tier: MetricTier.OPERATIONAL,
    description: 'Percentage of scheduled audits completed on time',
    formula: 'audits_completed_on_time / audits_scheduled * 100',
    dataSource: 'Audit management system',
    collectionFrequency: 'monthly',
    target: 100,
    warningThreshold: 95,
    criticalThreshold: 90,
    owner: 'Internal Audit Director',
    antiGamingMeasures: [
      'Audit scope verification',
      'Finding resolution tracking',
      'External audit validation'
    ]
  },

  CERTIFICATION_RENEWAL_RATE: {
    name: 'Certification Renewal Rate',
    tier: MetricTier.OPERATIONAL,
    description: 'Percentage of certified entities maintaining active certification',
    formula: 'renewed_certifications / expiring_certifications * 100',
    dataSource: 'Certification registry',
    collectionFrequency: 'monthly',
    target: 90,
    warningThreshold: 85,
    criticalThreshold: 75,
    owner: 'Certification Program Director',
    antiGamingMeasures: [
      'Renewal audit requirements',
      'Defection reason tracking',
      'Re-certification standards maintenance'
    ]
  },

  INCIDENT_RESPONSE_TIME_P1: {
    name: 'P1 Incident Response Time',
    tier: MetricTier.OPERATIONAL,
    description: 'Time from detection to containment for P1 incidents (hours)',
    formula: 'containment_timestamp - detection_timestamp',
    dataSource: 'Incident management system',
    collectionFrequency: 'real_time',
    target: 4,
    warningThreshold: 6,
    criticalThreshold: 8,
    owner: 'Incident Response Lead',
    antiGamingMeasures: [
      'Incident severity audit',
      'Containment verification',
      'Resolution quality review'
    ]
  },

  DRIFT_DETECTION_RATE: {
    name: 'Drift Detection Rate',
    tier: MetricTier.OPERATIONAL,
    description: 'Percentage of drift events detected before user impact',
    formula: 'drift_events_detected_early / total_drift_events * 100',
    dataSource: 'Model monitoring system',
    collectionFrequency: 'weekly',
    target: 95,
    warningThreshold: 90,
    criticalThreshold: 80,
    owner: 'MLOps Lead',
    antiGamingMeasures: [
      'Drift threshold calibration audits',
      'False positive/negative tracking',
      'User impact correlation'
    ]
  },

  // TIER 3: FORMATION METRICS
  FABLE_RECOGNITION_SCORE: {
    name: 'Fable Recognition Score',
    tier: MetricTier.FORMATION,
    description: 'Average accuracy on pattern-matching assessments',
    formula: 'sum(correct_pattern_identifications) / total_scenarios * 100',
    dataSource: 'Formation assessment platform',
    collectionFrequency: 'quarterly',
    target: 85,
    warningThreshold: 80,
    criticalThreshold: 70,
    owner: 'Formation Program Director',
    antiGamingMeasures: [
      'Scenario rotation',
      'Novel scenario injection',
      'Real-world application tracking'
    ]
  },

  PLACEMENT_RATE: {
    name: 'Governance Placement Rate',
    tier: MetricTier.FORMATION,
    description: 'Percentage of graduates in governance roles within 12 months',
    formula: 'graduates_in_governance_roles / total_graduates * 100',
    dataSource: 'Alumni tracking system',
    collectionFrequency: 'annual',
    target: 80,
    warningThreshold: 70,
    criticalThreshold: 60,
    owner: 'Career Services Director',
    antiGamingMeasures: [
      'Role classification audit',
      'Long-term tracking (3-year)',
      'Employer feedback integration'
    ]
  },

  // TIER 4: LEGITIMACY METRICS
  REGULATORY_ADOPTION_RATE: {
    name: 'Regulatory Adoption Rate',
    tier: MetricTier.LEGITIMACY,
    description: 'Percentage of institutional standards adopted by regulatory bodies',
    formula: 'standards_adopted / standards_proposed * 100',
    dataSource: 'Regulatory tracking database',
    collectionFrequency: 'quarterly',
    target: 50,
    warningThreshold: 40,
    criticalThreshold: 25,
    owner: 'Government Relations Director',
    antiGamingMeasures: [
      'Adoption quality assessment',
      'Implementation tracking',
      'Competitor standard comparison'
    ]
  },

  PUBLIC_TRUST_SCORE: {
    name: 'Public Trust Score',
    tier: MetricTier.LEGITIMACY,
    description: 'Survey-based trust measurement (0-100)',
    formula: 'weighted_average(trust_survey_responses)',
    dataSource: 'Public opinion surveys',
    collectionFrequency: 'quarterly',
    target: 70,
    warningThreshold: 60,
    criticalThreshold: 40,
    owner: 'Communications Director',
    antiGamingMeasures: [
      'Survey methodology audit',
      'Sample representativeness check',
      'Trend correlation analysis'
    ]
  },

  DEFECTION_RATE: {
    name: 'Certification Defection Rate',
    tier: MetricTier.LEGITIMACY,
    description: 'Percentage of certified entities leaving for competitors annually',
    formula: 'entities_defected / total_certified_entities * 100',
    dataSource: 'Certification registry',
    collectionFrequency: 'quarterly',
    target: 5,
    warningThreshold: 10,
    criticalThreshold: 25,
    owner: 'Certification Program Director',
    antiGamingMeasures: [
      'Exit interview requirements',
      'Competitor analysis',
      'Value proposition assessment'
    ]
  }
};

// ============================================================================
// METRIC MANAGEMENT
// ============================================================================

export function initializeCanonicalMetrics(): void {
  Object.entries(CanonicalMetrics).forEach(([key, metricData]) => {
    const id = `metric_${key.toLowerCase()}`;
    const metric: MetricDefinition = {
      ...metricData,
      id,
      lastReviewed: new Date()
    };
    metricDefinitions.set(id, metric);
  });
}

export function getMetric(id: string): MetricDefinition | undefined {
  return metricDefinitions.get(id);
}

export function getMetricsByTier(tier: MetricTier): MetricDefinition[] {
  return Array.from(metricDefinitions.values()).filter(m => m.tier === tier);
}

export function getAllMetrics(): MetricDefinition[] {
  return Array.from(metricDefinitions.values());
}

// ============================================================================
// METRIC VALUE RECORDING
// ============================================================================

export function recordMetricValue(
  metricId: string,
  value: number,
  periodStart: Date,
  periodEnd: Date,
  rawDataReference: string,
  calculationLog: string,
  notes?: string
): MetricValue {
  const metric = metricDefinitions.get(metricId);
  if (!metric) {
    throw new Error(`Metric not found: ${metricId}`);
  }

  const metricValue: MetricValue = {
    metricId,
    value,
    calculatedAt: new Date(),
    rawDataReference,
    calculationLog,
    periodStart,
    periodEnd,
    notes
  };

  // Store value
  const values = metricValues.get(metricId) || [];
  values.push(metricValue);
  metricValues.set(metricId, values.slice(-1000)); // Keep last 1000

  // Check thresholds and create alerts
  checkThresholds(metric, metricValue);

  return metricValue;
}

export function getMetricHistory(
  metricId: string,
  limit: number = 100
): MetricValue[] {
  const values = metricValues.get(metricId) || [];
  return values.slice(-limit);
}

export function getLatestMetricValue(metricId: string): MetricValue | undefined {
  const values = metricValues.get(metricId);
  return values ? values[values.length - 1] : undefined;
}

// ============================================================================
// THRESHOLD MONITORING & ALERTS
// ============================================================================

function checkThresholds(metric: MetricDefinition, value: MetricValue): void {
  // Determine if value is above or below thresholds based on metric type
  // For most metrics, higher is better. For some (like response time), lower is better.
  const lowerIsBetter = metric.name.toLowerCase().includes('time') ||
                        metric.name.toLowerCase().includes('defection') ||
                        metric.name.toLowerCase().includes('ratio');

  let alertType: 'warning' | 'critical' | null = null;
  let threshold = 0;

  if (lowerIsBetter) {
    if (metric.criticalThreshold && value.value >= metric.criticalThreshold) {
      alertType = 'critical';
      threshold = metric.criticalThreshold;
    } else if (metric.warningThreshold && value.value >= metric.warningThreshold) {
      alertType = 'warning';
      threshold = metric.warningThreshold;
    }
  } else {
    if (metric.criticalThreshold && value.value <= metric.criticalThreshold) {
      alertType = 'critical';
      threshold = metric.criticalThreshold;
    } else if (metric.warningThreshold && value.value <= metric.warningThreshold) {
      alertType = 'warning';
      threshold = metric.warningThreshold;
    }
  }

  if (alertType) {
    createAlert(metric.id, value, alertType, threshold);
  }
}

function createAlert(
  metricId: string,
  metricValue: MetricValue,
  alertType: 'warning' | 'critical',
  threshold: number
): MetricAlert {
  const id = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const alert: MetricAlert = {
    id,
    metricId,
    metricValue,
    alertType,
    threshold,
    actualValue: metricValue.value,
    triggeredAt: new Date()
  };

  alerts.set(id, alert);
  return alert;
}

export function acknowledgeAlert(alertId: string, acknowledgedBy: string): MetricAlert | undefined {
  const alert = alerts.get(alertId);
  if (!alert) return undefined;

  alert.acknowledgedAt = new Date();
  alert.acknowledgedBy = acknowledgedBy;
  alerts.set(alertId, alert);
  return alert;
}

export function resolveAlert(alertId: string, resolutionNotes: string): MetricAlert | undefined {
  const alert = alerts.get(alertId);
  if (!alert) return undefined;

  alert.resolvedAt = new Date();
  alert.resolutionNotes = resolutionNotes;
  alerts.set(alertId, alert);
  return alert;
}

export function getActiveAlerts(): MetricAlert[] {
  return Array.from(alerts.values()).filter(a => !a.resolvedAt);
}

export function getAlertsByMetric(metricId: string): MetricAlert[] {
  return Array.from(alerts.values()).filter(a => a.metricId === metricId);
}

// ============================================================================
// AUDIT MANAGEMENT
// ============================================================================

export function createAuditSchedule(input: {
  entityId: string;
  entityType: 'institution' | 'model' | 'process';
  auditType: 'governance' | 'technical' | 'fairness' | 'comprehensive';
  frequency: 'quarterly' | 'semi_annual' | 'annual';
}): AuditSchedule {
  const id = `audit_sched_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const frequencyDays = {
    quarterly: 90,
    semi_annual: 180,
    annual: 365
  };

  const schedule: AuditSchedule = {
    id,
    ...input,
    nextScheduled: new Date(Date.now() + frequencyDays[input.frequency] * 24 * 60 * 60 * 1000)
  };

  auditSchedules.set(id, schedule);
  return schedule;
}

export function startAudit(scheduleId: string, auditor: string): Audit {
  const schedule = auditSchedules.get(scheduleId);
  if (!schedule) {
    throw new Error(`Audit schedule not found: ${scheduleId}`);
  }

  const id = `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const audit: Audit = {
    id,
    scheduleId,
    entityId: schedule.entityId,
    auditType: schedule.auditType,
    auditor,
    startDate: new Date(),
    status: 'in_progress',
    findings: []
  };

  audits.set(id, audit);
  return audit;
}

export function addAuditFinding(auditId: string, finding: Omit<AuditFinding, 'id'>): Audit | undefined {
  const audit = audits.get(auditId);
  if (!audit) return undefined;

  const findingId = `finding_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  audit.findings.push({
    ...finding,
    id: findingId
  });

  audits.set(auditId, audit);
  return audit;
}

export function completeAudit(
  auditId: string,
  overallAssessment: 'pass' | 'pass_with_findings' | 'fail',
  executiveSummary: string,
  reviewedBy: string
): Audit | undefined {
  const audit = audits.get(auditId);
  if (!audit) return undefined;

  audit.endDate = new Date();
  audit.status = 'completed';
  audit.overallAssessment = overallAssessment;
  audit.executiveSummary = executiveSummary;
  audit.reviewedBy = reviewedBy;
  audit.approvedAt = new Date();

  audits.set(auditId, audit);

  // Update schedule
  const schedule = auditSchedules.get(audit.scheduleId);
  if (schedule) {
    schedule.lastCompleted = audit.endDate;

    const frequencyDays = {
      quarterly: 90,
      semi_annual: 180,
      annual: 365
    };

    schedule.nextScheduled = new Date(
      audit.endDate.getTime() + frequencyDays[schedule.frequency] * 24 * 60 * 60 * 1000
    );

    auditSchedules.set(schedule.id, schedule);
  }

  return audit;
}

export function getAudit(id: string): Audit | undefined {
  return audits.get(id);
}

export function getAuditsByEntity(entityId: string): Audit[] {
  return Array.from(audits.values()).filter(a => a.entityId === entityId);
}

export function getPendingAudits(): AuditSchedule[] {
  const now = new Date();
  return Array.from(auditSchedules.values()).filter(s => s.nextScheduled <= now);
}

// ============================================================================
// CERTIFICATION MANAGEMENT
// ============================================================================

export function createCertification(input: {
  entityId: string;
  entityName: string;
  entityType: 'institution' | 'individual' | 'model';
  requirements: CertificationRequirement[];
}): Certification {
  const id = `cert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const requirementsMet = new Map<string, boolean>();
  input.requirements.forEach(r => requirementsMet.set(r.id, false));

  const certification: Certification = {
    id,
    entityId: input.entityId,
    entityName: input.entityName,
    entityType: input.entityType,
    status: CertificationStatus.PENDING,
    requirements: input.requirements,
    requirementsMet,
    audits: [],
    violations: []
  };

  certifications.set(id, certification);
  return certification;
}

export function updateRequirementStatus(
  certId: string,
  requirementId: string,
  met: boolean
): Certification | undefined {
  const cert = certifications.get(certId);
  if (!cert) return undefined;

  cert.requirementsMet.set(requirementId, met);
  certifications.set(certId, cert);
  return cert;
}

export function grantCertification(
  certId: string,
  validityPeriod: number = 365 // days
): Certification | undefined {
  const cert = certifications.get(certId);
  if (!cert) return undefined;

  // Check all requirements are met
  const allMet = Array.from(cert.requirementsMet.values()).every(v => v);
  if (!allMet) {
    throw new Error('Cannot grant certification: not all requirements met');
  }

  cert.status = CertificationStatus.ACTIVE;
  cert.grantedAt = new Date();
  cert.expiresAt = new Date(Date.now() + validityPeriod * 24 * 60 * 60 * 1000);

  certifications.set(certId, cert);
  return cert;
}

export function suspendCertification(
  certId: string,
  reason: string
): Certification | undefined {
  const cert = certifications.get(certId);
  if (!cert) return undefined;

  cert.status = CertificationStatus.SUSPENDED;
  cert.suspendedAt = new Date();
  cert.violations.push({
    date: new Date(),
    description: reason,
    severity: Severity.HIGH,
    resolved: false
  });

  certifications.set(certId, cert);
  return cert;
}

export function revokeCertification(
  certId: string,
  reason: string
): Certification | undefined {
  const cert = certifications.get(certId);
  if (!cert) return undefined;

  cert.status = CertificationStatus.REVOKED;
  cert.revokedAt = new Date();
  cert.violations.push({
    date: new Date(),
    description: reason,
    severity: Severity.CRITICAL,
    resolved: false
  });

  certifications.set(certId, cert);
  return cert;
}

export function getCertification(id: string): Certification | undefined {
  return certifications.get(id);
}

export function getCertificationsByEntity(entityId: string): Certification[] {
  return Array.from(certifications.values()).filter(c => c.entityId === entityId);
}

export function getActiveCertifications(): Certification[] {
  return Array.from(certifications.values()).filter(c => c.status === CertificationStatus.ACTIVE);
}

export function getExpiringCertifications(daysAhead: number = 30): Certification[] {
  const cutoff = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000);
  return Array.from(certifications.values()).filter(
    c => c.status === CertificationStatus.ACTIVE && c.expiresAt && c.expiresAt <= cutoff
  );
}

// ============================================================================
// INCIDENT MANAGEMENT
// ============================================================================

export function createIncident(input: {
  title: string;
  description: string;
  severity: Severity;
  type: 'fairness' | 'security' | 'performance' | 'compliance' | 'other';
  affectedEntities: string[];
  affectedPartyCount?: number;
}): Incident {
  const id = `incident_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const incident: Incident = {
    id,
    title: input.title,
    description: input.description,
    severity: input.severity,
    status: IncidentStatus.DETECTED,
    type: input.type,
    affectedEntities: input.affectedEntities,
    affectedPartyCount: input.affectedPartyCount,
    detectedAt: new Date(),
    assignedTo: '',
    containmentActions: [],
    remediationActions: [],
    fableApplications: [],
    metricsImpacted: []
  };

  incidents.set(id, incident);
  return incident;
}

export function triageIncident(
  incidentId: string,
  assignedTo: string,
  updatedSeverity?: Severity
): Incident | undefined {
  const incident = incidents.get(incidentId);
  if (!incident) return undefined;

  incident.status = IncidentStatus.TRIAGED;
  incident.triagedAt = new Date();
  incident.assignedTo = assignedTo;
  if (updatedSeverity) {
    incident.severity = updatedSeverity;
  }

  incidents.set(incidentId, incident);
  return incident;
}

export function containIncident(
  incidentId: string,
  containmentActions: string[]
): Incident | undefined {
  const incident = incidents.get(incidentId);
  if (!incident) return undefined;

  incident.status = IncidentStatus.CONTAINED;
  incident.containedAt = new Date();
  incident.containmentActions = containmentActions;

  incidents.set(incidentId, incident);
  return incident;
}

export function resolveIncident(
  incidentId: string,
  remediationActions: string[],
  rootCause: string,
  lessonsLearned: string,
  preventionMeasures: string[]
): Incident | undefined {
  const incident = incidents.get(incidentId);
  if (!incident) return undefined;

  incident.status = IncidentStatus.RESOLVED;
  incident.resolvedAt = new Date();
  incident.remediationActions = remediationActions;
  incident.rootCause = rootCause;
  incident.lessonsLearned = lessonsLearned;
  incident.preventionMeasures = preventionMeasures;

  incidents.set(incidentId, incident);
  return incident;
}

export function getIncident(id: string): Incident | undefined {
  return incidents.get(id);
}

export function getActiveIncidents(): Incident[] {
  return Array.from(incidents.values()).filter(
    i => i.status !== IncidentStatus.CLOSED && i.status !== IncidentStatus.RESOLVED
  );
}

export function getIncidentsBySeverity(severity: Severity): Incident[] {
  return Array.from(incidents.values()).filter(i => i.severity === severity);
}

// ============================================================================
// DASHBOARD DATA
// ============================================================================

export interface DashboardData {
  executive: {
    legitimacyIndex: number;
    constitutionalCompliance: boolean;
    activeIncidents: number;
    formationPipeline: number;
  };
  operational: {
    certifications: {
      active: number;
      pending: number;
      expiringSoon: number;
      revoked: number;
    };
    audits: {
      scheduledThisMonth: number;
      completedThisMonth: number;
      overdue: number;
      findingsOpen: number;
    };
    incidents: {
      open: number;
      bySeverity: Record<string, number>;
      avgResolutionTime: number;
    };
    metrics: {
      constitutional: {
        passing: number;
        warning: number;
        failing: number;
      };
      operational: {
        passing: number;
        warning: number;
        failing: number;
      };
    };
  };
  alerts: MetricAlert[];
}

export function generateDashboard(): DashboardData {
  const allCerts = Array.from(certifications.values());
  const allAudits = Array.from(audits.values());
  const allIncidents = Array.from(incidents.values());
  const allAlerts = getActiveAlerts();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // Executive metrics
  const constitutionalMetrics = getMetricsByTier(MetricTier.CONSTITUTIONAL);
  const constitutionalCompliance = constitutionalMetrics.every(m => {
    const latest = getLatestMetricValue(m.id);
    if (!latest || !m.criticalThreshold) return true;
    const lowerIsBetter = m.name.toLowerCase().includes('time') ||
                          m.name.toLowerCase().includes('ratio');
    return lowerIsBetter ? latest.value < m.criticalThreshold : latest.value > m.criticalThreshold;
  });

  // Operational metrics status
  const getMetricStatus = (tier: MetricTier) => {
    const metrics = getMetricsByTier(tier);
    let passing = 0, warning = 0, failing = 0;

    metrics.forEach(m => {
      const latest = getLatestMetricValue(m.id);
      if (!latest) { warning++; return; }

      const lowerIsBetter = m.name.toLowerCase().includes('time') ||
                            m.name.toLowerCase().includes('ratio');

      if (m.criticalThreshold) {
        const critical = lowerIsBetter
          ? latest.value >= m.criticalThreshold
          : latest.value <= m.criticalThreshold;
        if (critical) { failing++; return; }
      }

      if (m.warningThreshold) {
        const warn = lowerIsBetter
          ? latest.value >= m.warningThreshold
          : latest.value <= m.warningThreshold;
        if (warn) { warning++; return; }
      }

      passing++;
    });

    return { passing, warning, failing };
  };

  // Calculate average resolution time
  const resolvedIncidents = allIncidents.filter(i => i.resolvedAt && i.detectedAt);
  const avgResolutionTime = resolvedIncidents.length > 0
    ? resolvedIncidents.reduce((sum, i) =>
        sum + (i.resolvedAt!.getTime() - i.detectedAt.getTime()), 0
      ) / resolvedIncidents.length / (1000 * 60 * 60) // hours
    : 0;

  return {
    executive: {
      legitimacyIndex: 0.75, // Would come from myths module
      constitutionalCompliance,
      activeIncidents: getActiveIncidents().length,
      formationPipeline: 150 // Would come from formation tracking
    },
    operational: {
      certifications: {
        active: allCerts.filter(c => c.status === CertificationStatus.ACTIVE).length,
        pending: allCerts.filter(c => c.status === CertificationStatus.PENDING).length,
        expiringSoon: getExpiringCertifications(30).length,
        revoked: allCerts.filter(c => c.status === CertificationStatus.REVOKED).length
      },
      audits: {
        scheduledThisMonth: Array.from(auditSchedules.values())
          .filter(s => s.nextScheduled >= monthStart && s.nextScheduled <= now).length,
        completedThisMonth: allAudits
          .filter(a => a.endDate && a.endDate >= monthStart).length,
        overdue: getPendingAudits().length,
        findingsOpen: allAudits
          .flatMap(a => a.findings)
          .filter(f => f.remediationStatus !== 'completed').length
      },
      incidents: {
        open: getActiveIncidents().length,
        bySeverity: {
          [Severity.CRITICAL]: getIncidentsBySeverity(Severity.CRITICAL).filter(i => i.status !== IncidentStatus.CLOSED).length,
          [Severity.HIGH]: getIncidentsBySeverity(Severity.HIGH).filter(i => i.status !== IncidentStatus.CLOSED).length,
          [Severity.MEDIUM]: getIncidentsBySeverity(Severity.MEDIUM).filter(i => i.status !== IncidentStatus.CLOSED).length,
          [Severity.LOW]: getIncidentsBySeverity(Severity.LOW).filter(i => i.status !== IncidentStatus.CLOSED).length
        },
        avgResolutionTime
      },
      metrics: {
        constitutional: getMetricStatus(MetricTier.CONSTITUTIONAL),
        operational: getMetricStatus(MetricTier.OPERATIONAL)
      }
    },
    alerts: allAlerts.slice(0, 10) // Top 10 alerts
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export const NumbersAuditSystem = {
  // Initialization
  initializeCanonicalMetrics,

  // Metrics
  getMetric,
  getMetricsByTier,
  getAllMetrics,
  recordMetricValue,
  getMetricHistory,
  getLatestMetricValue,

  // Alerts
  acknowledgeAlert,
  resolveAlert,
  getActiveAlerts,
  getAlertsByMetric,

  // Audits
  createAuditSchedule,
  startAudit,
  addAuditFinding,
  completeAudit,
  getAudit,
  getAuditsByEntity,
  getPendingAudits,

  // Certifications
  createCertification,
  updateRequirementStatus,
  grantCertification,
  suspendCertification,
  revokeCertification,
  getCertification,
  getCertificationsByEntity,
  getActiveCertifications,
  getExpiringCertifications,

  // Incidents
  createIncident,
  triageIncident,
  containIncident,
  resolveIncident,
  getIncident,
  getActiveIncidents,
  getIncidentsBySeverity,

  // Dashboard
  generateDashboard,

  // Constants
  CanonicalMetrics
};

// Initialize on module load
initializeCanonicalMetrics();

export default NumbersAuditSystem;
