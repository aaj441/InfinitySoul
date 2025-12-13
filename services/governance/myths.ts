/**
 * Myths Infrastructure - Legitimacy and Authority for Institutional Governance
 *
 * Myths are the legitimacy infrastructure that allows an institution to exercise
 * authority. Without myth, power appears as mere force and compliance is only coerced.
 *
 * Myth is not falsehood. Myth is the shared narrative that makes collective action possible.
 */

import {
  Myth,
  MythType,
  MythComponent,
  LegitimacyScore,
  MythRepairAction,
  Severity,
  GovernanceEvent
} from './types';

// ============================================================================
// MYTH STORAGE
// ============================================================================

const myths: Map<string, Myth> = new Map();
const repairActions: Map<string, MythRepairAction> = new Map();
const legitimacyHistory: Map<string, LegitimacyScore[]> = new Map();

// ============================================================================
// FOUNDATIONAL MYTHS - The Harvard Monolith Core Narratives
// ============================================================================

export const FoundationalMyths: Record<string, Omit<Myth, 'id' | 'createdAt' | 'updatedAt'>> = {

  AUTHORITY: {
    type: MythType.AUTHORITY,
    name: 'The Knowledge Steward',
    coreNarrative: `For four centuries, this institution has governed knowledge production.
The transition from print to digital, from classroom to global, from human to artificial intelligence—
each shift has required stewarding new forms of knowing. AI governance is not a departure from our mission;
it is its natural continuation. We have always been where knowledge meets accountability.`,
    components: [
      {
        id: 'auth_hist',
        description: 'Historical precedent as oldest continuously operating institution of higher learning',
        evidence: ['Founded 1636', 'Continuous operation through multiple technological revolutions'],
        strength: 0.95,
        lastValidated: new Date()
      },
      {
        id: 'auth_steward',
        description: 'Demonstrated stewardship of knowledge production and dissemination',
        evidence: ['Library system', 'Press operations', 'Research output', 'Graduate placement'],
        strength: 0.9,
        lastValidated: new Date()
      },
      {
        id: 'auth_cert',
        description: 'Credentialing authority recognized globally',
        evidence: ['Degree recognition', 'Alumni network influence', 'Employer preferences'],
        strength: 0.85,
        lastValidated: new Date()
      },
      {
        id: 'auth_network',
        description: 'Network centrality across sectors and institutions',
        evidence: ['Board placements', 'Government advisory roles', 'Industry partnerships'],
        strength: 0.88,
        lastValidated: new Date()
      }
    ],
    rituals: [
      'Convocation ceremonies',
      'Certification presentations',
      'Annual governance reports',
      'Public lectures and symposia'
    ],
    symbols: [
      'Institutional seal',
      'Academic regalia',
      'Campus architecture',
      'Publication imprimatur'
    ],
    language: [
      'Veritas (Truth)',
      'In the public interest',
      'Knowledge in service of society',
      'Scholarly rigor'
    ],
    keyPersonnel: [
      'President/Chancellor',
      'Provost',
      'Governance Board Chair',
      'Public-facing faculty'
    ],
    coherenceWithActions: 0.85,
    publicPerception: 0.75,
    peerRecognition: 0.9,
    contradictionEvents: []
  },

  REFORMATION: {
    type: MythType.REFORMATION,
    name: 'The Self-Correcting Institution',
    coreNarrative: `We have been wrong before, and we have reformed. The admission of women,
the diversification of faculty, the expansion beyond classical curriculum—each represented a
recognition that our practices contradicted our principles. The current pivot to AI governance
is another such recognition. We trained engineers to build without accountability structures.
We acknowledge this failure not despite our commitment to truth, but because of it.`,
    components: [
      {
        id: 'reform_hist',
        description: 'Historical record of institutional self-correction',
        evidence: ['Coeducation adoption', 'Curriculum reforms', 'Governance restructuring'],
        strength: 0.8,
        lastValidated: new Date()
      },
      {
        id: 'reform_mech',
        description: 'Functioning mechanisms for internal critique',
        evidence: ['Faculty governance', 'Review committees', 'Ombudsman offices'],
        strength: 0.75,
        lastValidated: new Date()
      },
      {
        id: 'reform_public',
        description: 'Willingness to acknowledge failures publicly',
        evidence: ['Public statements', 'Report publications', 'Policy changes'],
        strength: 0.7,
        lastValidated: new Date()
      }
    ],
    rituals: [
      'Annual self-assessment reports',
      'External review cycles',
      'Public acknowledgment ceremonies',
      'Progress reporting'
    ],
    symbols: [
      'Before/after documentation',
      'Reform milestone markers',
      'Acknowledgment plaques'
    ],
    language: [
      'We acknowledge',
      'We have learned',
      'Our commitment to improvement',
      'Continuous refinement'
    ],
    keyPersonnel: [
      'Chief Compliance Officer',
      'Ethics Board members',
      'Reform initiative leads'
    ],
    coherenceWithActions: 0.7,
    publicPerception: 0.65,
    peerRecognition: 0.75,
    contradictionEvents: []
  },

  STEWARDSHIP: {
    type: MythType.STEWARDSHIP,
    name: 'The Independent Guardian',
    coreNarrative: `Someone must govern AI. Not the companies that profit from its deployment.
Not the governments that may weaponize it. Not the individuals who cannot comprehend its scale.
We have the independence that endowment provides, the mission that transcends profit,
the stakeholder breadth that prevents capture, and the time horizon that survives political cycles.
We govern not because we are perfect, but because the alternatives are capture.`,
    components: [
      {
        id: 'steward_indep',
        description: 'Financial independence through endowment',
        evidence: ['Endowment size', 'Operating independence', 'Donor diversification'],
        strength: 0.9,
        lastValidated: new Date()
      },
      {
        id: 'steward_mission',
        description: 'Mission alignment with truth-seeking over profit',
        evidence: ['Charter language', 'Operational priorities', 'Resource allocation'],
        strength: 0.85,
        lastValidated: new Date()
      },
      {
        id: 'steward_stake',
        description: 'Broad stakeholder accountability',
        evidence: ['Governance structure', 'Public reporting', 'Community engagement'],
        strength: 0.8,
        lastValidated: new Date()
      },
      {
        id: 'steward_horizon',
        description: 'Long-term orientation (centuries, not quarters)',
        evidence: ['Strategic planning horizons', 'Infrastructure investments', 'Endowment management'],
        strength: 0.88,
        lastValidated: new Date()
      }
    ],
    rituals: [
      'Independence affirmations',
      'Stakeholder assemblies',
      'Long-term planning cycles',
      'Public interest declarations'
    ],
    symbols: [
      'Endowment reports',
      'Mission statements',
      'Independence charters'
    ],
    language: [
      'In trust for future generations',
      'Beyond partisan interest',
      'Serving the public good',
      'Independent judgment'
    ],
    keyPersonnel: [
      'Board of Trustees',
      'Investment committee',
      'Public interest officers'
    ],
    coherenceWithActions: 0.8,
    publicPerception: 0.7,
    peerRecognition: 0.85,
    contradictionEvents: []
  },

  CONTINUITY: {
    type: MythType.CONTINUITY,
    name: 'The Unbroken Thread',
    coreNarrative: `The institution you see today is continuous with the institution founded centuries ago.
Not unchanged—we have evolved profoundly. But unbroken in purpose: the pursuit and transmission of knowledge.
The scholars who founded us would recognize our mission, even as they would marvel at our methods.
AI governance is the newest chapter in an ancient story.`,
    components: [
      {
        id: 'cont_chain',
        description: 'Unbroken chain of leadership and governance',
        evidence: ['Leadership succession records', 'Charter continuity', 'Institutional memory'],
        strength: 0.95,
        lastValidated: new Date()
      },
      {
        id: 'cont_mission',
        description: 'Consistent core mission across transformations',
        evidence: ['Historical mission statements', 'Founding documents', 'Contemporary alignment'],
        strength: 0.9,
        lastValidated: new Date()
      },
      {
        id: 'cont_adapt',
        description: 'Pattern of adaptation without rupture',
        evidence: ['Technology adoptions', 'Curriculum evolutions', 'Structural changes'],
        strength: 0.85,
        lastValidated: new Date()
      }
    ],
    rituals: [
      'Founding commemorations',
      'Historical lectures',
      'Archive exhibitions',
      'Legacy naming'
    ],
    symbols: [
      'Original charter',
      'Historical artifacts',
      'Continuous records',
      'Founder portraits'
    ],
    language: [
      'Since our founding',
      'In the tradition of',
      'Continuing the work of',
      'Building on centuries of'
    ],
    keyPersonnel: [
      'Historian/Archivist',
      'Emeritus faculty',
      'Legacy officers'
    ],
    coherenceWithActions: 0.9,
    publicPerception: 0.8,
    peerRecognition: 0.92,
    contradictionEvents: []
  },

  UNIVERSALISM: {
    type: MythType.UNIVERSALISM,
    name: 'The Human Commons',
    coreNarrative: `We do not govern AI for ourselves. We govern it for humanity.
The principles we establish, the standards we set, the practitioners we form—these serve
not one institution but the global commons. Our legitimacy derives not from power but from
the universality of the values we uphold: fairness, accountability, transparency, human dignity.
We are trustees of principles that belong to everyone.`,
    components: [
      {
        id: 'univ_values',
        description: 'Commitment to universal human values',
        evidence: ['Constitutional AI principles', 'Rights-based frameworks', 'Global ethics alignment'],
        strength: 0.85,
        lastValidated: new Date()
      },
      {
        id: 'univ_access',
        description: 'Making governance accessible beyond institutional boundaries',
        evidence: ['Open publications', 'Free resources', 'Global partnerships'],
        strength: 0.75,
        lastValidated: new Date()
      },
      {
        id: 'univ_represent',
        description: 'Representing diverse stakeholders in governance',
        evidence: ['Governance body composition', 'Consultation processes', 'Feedback mechanisms'],
        strength: 0.7,
        lastValidated: new Date()
      }
    ],
    rituals: [
      'Global stakeholder consultations',
      'Public principle affirmations',
      'Cross-cultural dialogues',
      'Open access publications'
    ],
    symbols: [
      'Universal declaration references',
      'Global partnership logos',
      'Multilingual publications'
    ],
    language: [
      'For all humanity',
      'Universal principles',
      'The global commons',
      'Beyond borders'
    ],
    keyPersonnel: [
      'International advisory board',
      'Global outreach directors',
      'Cross-cultural liaisons'
    ],
    coherenceWithActions: 0.75,
    publicPerception: 0.65,
    peerRecognition: 0.8,
    contradictionEvents: []
  }
};

// ============================================================================
// MYTH MANAGEMENT
// ============================================================================

export function initializeFoundationalMyths(): void {
  Object.entries(FoundationalMyths).forEach(([key, mythData]) => {
    const id = `myth_${key.toLowerCase()}`;
    const now = new Date();

    const myth: Myth = {
      ...mythData,
      id,
      createdAt: now,
      updatedAt: now
    };

    myths.set(id, myth);
  });
}

export function getMyth(id: string): Myth | undefined {
  return myths.get(id);
}

export function getMythByType(type: MythType): Myth | undefined {
  return Array.from(myths.values()).find(m => m.type === type);
}

export function getAllMyths(): Myth[] {
  return Array.from(myths.values());
}

export function updateMythComponent(
  mythId: string,
  componentId: string,
  updates: Partial<MythComponent>
): Myth | undefined {
  const myth = myths.get(mythId);
  if (!myth) return undefined;

  const componentIndex = myth.components.findIndex(c => c.id === componentId);
  if (componentIndex === -1) return undefined;

  myth.components[componentIndex] = {
    ...myth.components[componentIndex],
    ...updates,
    lastValidated: new Date()
  };

  myth.updatedAt = new Date();
  myths.set(mythId, myth);
  return myth;
}

// ============================================================================
// LEGITIMACY SCORING
// ============================================================================

export function calculateLegitimacyScore(institutionId: string): LegitimacyScore {
  const allMyths = getAllMyths();

  // Calculate component scores
  const authorityMyth = getMythByType(MythType.AUTHORITY);
  const stewardshipMyth = getMythByType(MythType.STEWARDSHIP);
  const reformationMyth = getMythByType(MythType.REFORMATION);

  const authorityRecognition = authorityMyth
    ? calculateMythStrength(authorityMyth) * authorityMyth.peerRecognition
    : 0.5;

  const missionAlignment = stewardshipMyth
    ? calculateMythStrength(stewardshipMyth) * stewardshipMyth.coherenceWithActions
    : 0.5;

  const stakeholderTrust = allMyths.reduce((sum, m) => sum + m.publicPerception, 0) / allMyths.length;

  const peerLegitimacy = allMyths.reduce((sum, m) => sum + m.peerRecognition, 0) / allMyths.length;

  const regulatoryDeference = calculateRegulatoryDeference(allMyths);

  // Calculate overall score (weighted average)
  const weights = {
    authorityRecognition: 0.25,
    missionAlignment: 0.2,
    stakeholderTrust: 0.25,
    peerLegitimacy: 0.15,
    regulatoryDeference: 0.15
  };

  const overallScore =
    weights.authorityRecognition * authorityRecognition +
    weights.missionAlignment * missionAlignment +
    weights.stakeholderTrust * stakeholderTrust +
    weights.peerLegitimacy * peerLegitimacy +
    weights.regulatoryDeference * regulatoryDeference;

  // Determine trend
  const history = legitimacyHistory.get(institutionId) || [];
  const trend = determineTrend(history, overallScore);

  // Generate analysis
  const { strengths, vulnerabilities, recommendations } = analyzeLegitimacy(
    authorityRecognition,
    missionAlignment,
    stakeholderTrust,
    peerLegitimacy,
    regulatoryDeference
  );

  const score: LegitimacyScore = {
    institutionId,
    calculatedAt: new Date(),
    authorityRecognition,
    missionAlignment,
    stakeholderTrust,
    peerLegitimacy,
    regulatoryDeference,
    overallScore,
    trend,
    strengths,
    vulnerabilities,
    recommendations
  };

  // Store in history
  history.push(score);
  legitimacyHistory.set(institutionId, history.slice(-100)); // Keep last 100

  return score;
}

function calculateMythStrength(myth: Myth): number {
  if (myth.components.length === 0) return 0.5;
  return myth.components.reduce((sum, c) => sum + c.strength, 0) / myth.components.length;
}

function calculateRegulatoryDeference(myths: Myth[]): number {
  // Based on authority and stewardship myth coherence
  const authority = myths.find(m => m.type === MythType.AUTHORITY);
  const stewardship = myths.find(m => m.type === MythType.STEWARDSHIP);

  if (!authority || !stewardship) return 0.5;

  return (authority.coherenceWithActions + stewardship.coherenceWithActions) / 2;
}

function determineTrend(
  history: LegitimacyScore[],
  currentScore: number
): 'improving' | 'stable' | 'declining' {
  if (history.length < 3) return 'stable';

  const recentScores = history.slice(-3).map(s => s.overallScore);
  const avgRecent = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;

  const diff = currentScore - avgRecent;

  if (diff > 0.05) return 'improving';
  if (diff < -0.05) return 'declining';
  return 'stable';
}

function analyzeLegitimacy(
  authorityRecognition: number,
  missionAlignment: number,
  stakeholderTrust: number,
  peerLegitimacy: number,
  regulatoryDeference: number
): { strengths: string[]; vulnerabilities: string[]; recommendations: string[] } {
  const strengths: string[] = [];
  const vulnerabilities: string[] = [];
  const recommendations: string[] = [];

  // Authority recognition
  if (authorityRecognition > 0.8) {
    strengths.push('Strong authority recognition from external parties');
  } else if (authorityRecognition < 0.6) {
    vulnerabilities.push('Authority recognition below threshold');
    recommendations.push('Increase visibility of governance expertise and track record');
  }

  // Mission alignment
  if (missionAlignment > 0.8) {
    strengths.push('Actions strongly aligned with stated mission');
  } else if (missionAlignment < 0.6) {
    vulnerabilities.push('Gap between stated mission and operational reality');
    recommendations.push('Conduct mission alignment audit and address contradictions');
  }

  // Stakeholder trust
  if (stakeholderTrust > 0.75) {
    strengths.push('High stakeholder trust levels');
  } else if (stakeholderTrust < 0.5) {
    vulnerabilities.push('Critical trust deficit with stakeholders');
    recommendations.push('Implement transparency initiatives and stakeholder engagement program');
  }

  // Peer legitimacy
  if (peerLegitimacy > 0.85) {
    strengths.push('Strong recognition from peer institutions');
  } else if (peerLegitimacy < 0.7) {
    vulnerabilities.push('Limited peer institution recognition');
    recommendations.push('Increase collaboration and knowledge sharing with peer institutions');
  }

  // Regulatory deference
  if (regulatoryDeference > 0.75) {
    strengths.push('Regulatory bodies defer to institutional standards');
  } else if (regulatoryDeference < 0.5) {
    vulnerabilities.push('Limited regulatory recognition');
    recommendations.push('Proactive engagement with regulatory bodies and standard-setting');
  }

  return { strengths, vulnerabilities, recommendations };
}

// ============================================================================
// MYTH HEALTH MONITORING
// ============================================================================

export interface MythHealthReport {
  mythId: string;
  mythName: string;
  overallHealth: number;
  componentHealth: {
    componentId: string;
    description: string;
    strength: number;
    status: 'healthy' | 'warning' | 'critical';
  }[];
  coherenceStatus: 'aligned' | 'drifting' | 'contradicted';
  recentContradictions: number;
  recommendations: string[];
}

export function assessMythHealth(mythId: string): MythHealthReport {
  const myth = myths.get(mythId);
  if (!myth) {
    throw new Error(`Myth not found: ${mythId}`);
  }

  const componentHealth = myth.components.map(c => ({
    componentId: c.id,
    description: c.description,
    strength: c.strength,
    status: c.strength > 0.7 ? 'healthy' as const :
            c.strength > 0.5 ? 'warning' as const : 'critical' as const
  }));

  const overallHealth = calculateMythStrength(myth);

  const coherenceStatus =
    myth.coherenceWithActions > 0.8 ? 'aligned' :
    myth.coherenceWithActions > 0.6 ? 'drifting' : 'contradicted';

  const recentContradictions = myth.contradictionEvents.filter(
    e => e.date > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // Last 90 days
  ).length;

  const recommendations = generateMythRecommendations(myth, componentHealth, coherenceStatus);

  return {
    mythId: myth.id,
    mythName: myth.name,
    overallHealth,
    componentHealth,
    coherenceStatus,
    recentContradictions,
    recommendations
  };
}

function generateMythRecommendations(
  myth: Myth,
  componentHealth: MythHealthReport['componentHealth'],
  coherenceStatus: string
): string[] {
  const recommendations: string[] = [];

  // Check for critical components
  const criticalComponents = componentHealth.filter(c => c.status === 'critical');
  if (criticalComponents.length > 0) {
    recommendations.push(
      `URGENT: ${criticalComponents.length} myth component(s) in critical state. ` +
      `Address: ${criticalComponents.map(c => c.description).join(', ')}`
    );
  }

  // Check coherence
  if (coherenceStatus === 'contradicted') {
    recommendations.push(
      'Myth-action contradiction detected. Initiate myth repair protocol or adjust institutional actions.'
    );
  } else if (coherenceStatus === 'drifting') {
    recommendations.push(
      'Myth coherence drifting. Review recent actions for alignment with myth narrative.'
    );
  }

  // Check public perception
  if (myth.publicPerception < 0.6) {
    recommendations.push(
      'Public perception below threshold. Consider transparency initiatives and public engagement.'
    );
  }

  // Check peer recognition
  if (myth.peerRecognition < 0.7) {
    recommendations.push(
      'Peer recognition declining. Increase collaboration and visibility in peer communities.'
    );
  }

  // General maintenance
  if (recommendations.length === 0) {
    recommendations.push('Myth health is stable. Continue regular reinforcement rituals.');
  }

  return recommendations;
}

// ============================================================================
// MYTH REPAIR
// ============================================================================

export function recordContradiction(
  mythId: string,
  event: {
    description: string;
    severity: Severity;
  }
): Myth | undefined {
  const myth = myths.get(mythId);
  if (!myth) return undefined;

  myth.contradictionEvents.push({
    date: new Date(),
    description: event.description,
    repairAction: '',
    recovered: false
  });

  // Reduce coherence based on severity
  const severityImpact = {
    [Severity.CRITICAL]: 0.2,
    [Severity.HIGH]: 0.1,
    [Severity.MEDIUM]: 0.05,
    [Severity.LOW]: 0.02
  };

  myth.coherenceWithActions = Math.max(0, myth.coherenceWithActions - severityImpact[event.severity]);
  myth.updatedAt = new Date();

  myths.set(mythId, myth);
  return myth;
}

export function createRepairAction(input: {
  mythId: string;
  triggeringEvent: string;
  contradictionDescription: string;
  repairStrategy: string;
  actions: string[];
  timeline: string;
  successCriteria: string[];
}): MythRepairAction {
  const id = `repair_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const repair: MythRepairAction = {
    id,
    mythId: input.mythId,
    triggeringEvent: input.triggeringEvent,
    contradictionDescription: input.contradictionDescription,
    repairStrategy: input.repairStrategy,
    actions: input.actions,
    timeline: input.timeline,
    successCriteria: input.successCriteria,
    status: 'planned'
  };

  repairActions.set(id, repair);
  return repair;
}

export function updateRepairStatus(
  repairId: string,
  status: MythRepairAction['status'],
  outcome?: string
): MythRepairAction | undefined {
  const repair = repairActions.get(repairId);
  if (!repair) return undefined;

  repair.status = status;
  if (outcome) repair.outcome = outcome;

  repairActions.set(repairId, repair);

  // If completed successfully, update myth
  if (status === 'completed') {
    const myth = myths.get(repair.mythId);
    if (myth) {
      // Mark most recent contradiction as recovered
      const lastContradiction = myth.contradictionEvents
        .filter(e => e.description === repair.contradictionDescription)
        .pop();

      if (lastContradiction) {
        lastContradiction.repairAction = repair.repairStrategy;
        lastContradiction.recovered = true;
      }

      // Restore some coherence
      myth.coherenceWithActions = Math.min(1, myth.coherenceWithActions + 0.1);
      myths.set(myth.id, myth);
    }
  }

  return repair;
}

export function getActiveRepairActions(mythId?: string): MythRepairAction[] {
  const all = Array.from(repairActions.values());
  const active = all.filter(r => r.status === 'planned' || r.status === 'in_progress');

  if (mythId) {
    return active.filter(r => r.mythId === mythId);
  }

  return active;
}

// ============================================================================
// MYTH REINFORCEMENT
// ============================================================================

export interface ReinforcementActivity {
  type: 'ritual' | 'symbol' | 'language' | 'personnel';
  mythId: string;
  activity: string;
  scheduledDate?: Date;
  completedDate?: Date;
  impactAssessment?: string;
}

const reinforcements: ReinforcementActivity[] = [];

export function scheduleReinforcement(activity: Omit<ReinforcementActivity, 'completedDate' | 'impactAssessment'>): void {
  reinforcements.push({
    ...activity,
    scheduledDate: activity.scheduledDate || new Date()
  });
}

export function recordReinforcementCompletion(
  index: number,
  impactAssessment: string
): void {
  if (reinforcements[index]) {
    reinforcements[index].completedDate = new Date();
    reinforcements[index].impactAssessment = impactAssessment;

    // Boost myth metrics slightly
    const myth = myths.get(reinforcements[index].mythId);
    if (myth) {
      myth.publicPerception = Math.min(1, myth.publicPerception + 0.01);
      myth.coherenceWithActions = Math.min(1, myth.coherenceWithActions + 0.005);
      myths.set(myth.id, myth);
    }
  }
}

export function generateReinforcementPlan(mythId: string): ReinforcementActivity[] {
  const myth = myths.get(mythId);
  if (!myth) return [];

  const plan: ReinforcementActivity[] = [];
  const now = new Date();

  // Schedule rituals
  myth.rituals.forEach((ritual, i) => {
    plan.push({
      type: 'ritual',
      mythId,
      activity: ritual,
      scheduledDate: new Date(now.getTime() + (i + 1) * 30 * 24 * 60 * 60 * 1000) // Monthly
    });
  });

  // Schedule symbol reinforcements
  myth.symbols.slice(0, 2).forEach((symbol, i) => {
    plan.push({
      type: 'symbol',
      mythId,
      activity: `Display/reference: ${symbol}`,
      scheduledDate: new Date(now.getTime() + (i + 1) * 7 * 24 * 60 * 60 * 1000) // Weekly
    });
  });

  // Schedule language reinforcements
  plan.push({
    type: 'language',
    mythId,
    activity: `Incorporate key phrases in communications: ${myth.language.slice(0, 3).join(', ')}`,
    scheduledDate: new Date(now.getTime() + 24 * 60 * 60 * 1000) // Daily opportunity
  });

  return plan;
}

// ============================================================================
// EVENT INTEGRATION
// ============================================================================

export function processGovernanceEvent(event: GovernanceEvent): void {
  // Check if event contradicts any myths
  const eventDesc = event.description.toLowerCase();

  getAllMyths().forEach(myth => {
    // Check for potential contradictions based on event type
    if (eventDesc.includes('incident') || eventDesc.includes('failure') || eventDesc.includes('violation')) {
      // Assess impact on relevant myths
      if (myth.type === MythType.AUTHORITY && eventDesc.includes('governance')) {
        recordContradiction(myth.id, {
          description: `Governance incident: ${event.description}`,
          severity: Severity.MEDIUM
        });
      }

      if (myth.type === MythType.REFORMATION && eventDesc.includes('repeated')) {
        recordContradiction(myth.id, {
          description: `Repeated failure pattern: ${event.description}`,
          severity: Severity.HIGH
        });
      }
    }
  });
}

// ============================================================================
// EXPORTS
// ============================================================================

export const MythsInfrastructure = {
  // Initialization
  initializeFoundationalMyths,

  // Myth management
  getMyth,
  getMythByType,
  getAllMyths,
  updateMythComponent,

  // Legitimacy
  calculateLegitimacyScore,

  // Health monitoring
  assessMythHealth,

  // Repair
  recordContradiction,
  createRepairAction,
  updateRepairStatus,
  getActiveRepairActions,

  // Reinforcement
  scheduleReinforcement,
  recordReinforcementCompletion,
  generateReinforcementPlan,

  // Event integration
  processGovernanceEvent,

  // Constants
  FoundationalMyths
};

// Initialize on module load
initializeFoundationalMyths();

export default MythsInfrastructure;
