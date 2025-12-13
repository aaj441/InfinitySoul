/**
 * Stories Engine - Narrative Infrastructure for Institutional Governance
 *
 * Stories make institutional actions legible. They provide:
 * - Confession frameworks for acknowledging failure
 * - Vision narratives for mobilizing change
 * - Incident explanations for stakeholder communication
 * - Coherence checking across institutional narratives
 */

import {
  Story,
  StoryType,
  StoryVersion,
  Audience,
  Confession,
  ConfessionAct,
  NarrativeCoherenceReport,
  Severity,
  Incident
} from './types';

// ============================================================================
// STORY STORAGE (In production, replace with database)
// ============================================================================

const stories: Map<string, Story> = new Map();
const confessions: Map<string, Confession> = new Map();
const audiences: Map<string, Audience> = new Map();

// ============================================================================
// AUDIENCE MANAGEMENT
// ============================================================================

export function createAudience(audience: Omit<Audience, 'id'>): Audience {
  const id = `aud_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const newAudience: Audience = { ...audience, id };
  audiences.set(id, newAudience);
  return newAudience;
}

export function getAudience(id: string): Audience | undefined {
  return audiences.get(id);
}

// Pre-defined audiences
export const StandardAudiences = {
  PUBLIC: createAudience({
    name: 'General Public',
    type: 'public',
    communicationPreferences: {
      technicalDepth: 'low',
      moralFraming: 'explicit',
      proceduralDetail: 'low'
    }
  }),
  REGULATORS: createAudience({
    name: 'Regulatory Bodies',
    type: 'regulatory',
    communicationPreferences: {
      technicalDepth: 'high',
      moralFraming: 'implicit',
      proceduralDetail: 'high'
    }
  }),
  AFFECTED_PARTIES: createAudience({
    name: 'Affected Parties',
    type: 'affected_party',
    communicationPreferences: {
      technicalDepth: 'low',
      moralFraming: 'explicit',
      proceduralDetail: 'medium'
    }
  }),
  INTERNAL: createAudience({
    name: 'Internal Stakeholders',
    type: 'internal',
    communicationPreferences: {
      technicalDepth: 'high',
      moralFraming: 'implicit',
      proceduralDetail: 'high'
    }
  }),
  ENGINEERS: createAudience({
    name: 'Technical Staff',
    type: 'internal',
    communicationPreferences: {
      technicalDepth: 'high',
      moralFraming: 'none',
      proceduralDetail: 'high'
    }
  })
};

// ============================================================================
// STORY CREATION AND MANAGEMENT
// ============================================================================

export function createStory(input: {
  type: StoryType;
  title: string;
  summary: string;
  fullNarrative: string;
  audiences?: Audience[];
  tags?: string[];
}): Story {
  const id = `story_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date();

  const initialVersion: StoryVersion = {
    version: '1.0.0',
    content: input.fullNarrative,
    createdAt: now,
    createdBy: 'system'
  };

  const story: Story = {
    id,
    type: input.type,
    title: input.title,
    summary: input.summary,
    fullNarrative: input.fullNarrative,
    audiences: input.audiences || [],
    audienceAdaptations: new Map(),
    versions: [initialVersion],
    currentVersion: '1.0.0',
    relatedStories: [],
    tags: input.tags || [],
    createdAt: now,
    updatedAt: now,
    status: 'draft'
  };

  stories.set(id, story);
  return story;
}

export function getStory(id: string): Story | undefined {
  return stories.get(id);
}

export function updateStory(
  id: string,
  updates: Partial<Omit<Story, 'id' | 'createdAt' | 'versions'>>,
  changeReason?: string
): Story | undefined {
  const story = stories.get(id);
  if (!story) return undefined;

  // If narrative changed, create new version
  if (updates.fullNarrative && updates.fullNarrative !== story.fullNarrative) {
    const [major, minor, patch] = story.currentVersion.split('.').map(Number);
    const newVersion = `${major}.${minor + 1}.0`;

    const version: StoryVersion = {
      version: newVersion,
      content: updates.fullNarrative,
      createdAt: new Date(),
      createdBy: 'system',
      changeReason
    };

    story.versions.push(version);
    story.currentVersion = newVersion;
  }

  Object.assign(story, updates, { updatedAt: new Date() });
  stories.set(id, story);
  return story;
}

export function getAllStoriesByType(type: StoryType): Story[] {
  return Array.from(stories.values()).filter(s => s.type === type);
}

// ============================================================================
// AUDIENCE ADAPTATION
// ============================================================================

export function adaptStoryForAudience(
  storyId: string,
  audienceId: string,
  adaptedNarrative: string
): Story | undefined {
  const story = stories.get(storyId);
  if (!story) return undefined;

  story.audienceAdaptations.set(audienceId, adaptedNarrative);
  story.updatedAt = new Date();
  stories.set(storyId, story);
  return story;
}

export function getStoryForAudience(storyId: string, audienceId: string): string | undefined {
  const story = stories.get(storyId);
  if (!story) return undefined;

  // Return adapted version if exists, otherwise full narrative
  return story.audienceAdaptations.get(audienceId) || story.fullNarrative;
}

/**
 * Automatically adapt a story based on audience preferences
 */
export function autoAdaptStory(storyId: string, audienceId: string): string | undefined {
  const story = stories.get(storyId);
  const audience = audiences.get(audienceId);
  if (!story || !audience) return undefined;

  let adapted = story.fullNarrative;
  const prefs = audience.communicationPreferences;

  // These would be more sophisticated in production (e.g., using LLMs)
  if (prefs.technicalDepth === 'low') {
    // Simplify technical language
    adapted = simplifyTechnicalLanguage(adapted);
  }

  if (prefs.moralFraming === 'explicit') {
    // Emphasize moral dimensions
    adapted = emphasizeMoralFraming(adapted);
  }

  if (prefs.proceduralDetail === 'low') {
    // Remove procedural details
    adapted = reduceProceduralDetail(adapted);
  }

  return adapted;
}

// Helper functions for adaptation (simplified - would use LLM in production)
function simplifyTechnicalLanguage(text: string): string {
  return text
    .replace(/algorithm/gi, 'automated system')
    .replace(/machine learning/gi, 'AI')
    .replace(/disparate impact/gi, 'unfair outcomes')
    .replace(/model/gi, 'system');
}

function emphasizeMoralFraming(text: string): string {
  // Add moral context to beginning
  return `This is a matter of fairness and accountability. ${text}`;
}

function reduceProceduralDetail(text: string): string {
  // Remove sentences with procedural keywords
  const procedural = ['pursuant to', 'in accordance with', 'as per regulation', 'compliance with'];
  let result = text;
  procedural.forEach(phrase => {
    const regex = new RegExp(`[^.]*${phrase}[^.]*\\.\\s*`, 'gi');
    result = result.replace(regex, '');
  });
  return result;
}

// ============================================================================
// CONFESSION FRAMEWORK
// ============================================================================

export function createConfession(institutionId: string): Confession {
  const id = `conf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const confession: Confession = {
    id,
    institutionId,
    acts: [],
    verificationMechanisms: [],
    progressReports: [],
    status: 'drafting'
  };

  confessions.set(id, confession);
  return confession;
}

export function addConfessionAct(
  confessionId: string,
  act: ConfessionAct
): Confession | undefined {
  const confession = confessions.get(confessionId);
  if (!confession) return undefined;

  confession.acts.push(act);
  confessions.set(confessionId, confession);
  return confession;
}

export function buildFullConfession(institutionId: string, input: {
  acknowledgments: string[];
  analyses: string[];
  commitments: string[];
  actions: { action: string; timeline: string }[];
  verificationMechanisms: string[];
}): Confession {
  const confession = createConfession(institutionId);

  // Act I: Acknowledgment
  input.acknowledgments.forEach(ack => {
    addConfessionAct(confession.id, {
      act: 'acknowledgment',
      content: ack
    });
  });

  // Act II: Analysis
  input.analyses.forEach(analysis => {
    addConfessionAct(confession.id, {
      act: 'analysis',
      content: analysis
    });
  });

  // Act III: Commitment
  input.commitments.forEach(commitment => {
    addConfessionAct(confession.id, {
      act: 'commitment',
      content: commitment,
      commitments: [commitment]
    });
  });

  // Act IV: Action
  input.actions.forEach(({ action, timeline }) => {
    addConfessionAct(confession.id, {
      act: 'action',
      content: action,
      timeline
    });
  });

  confession.verificationMechanisms = input.verificationMechanisms;

  confessions.set(confession.id, confession);
  return confession;
}

export function generateConfessionNarrative(confessionId: string): string | undefined {
  const confession = confessions.get(confessionId);
  if (!confession) return undefined;

  const sections: string[] = [];

  // Acknowledgment section
  const acknowledgments = confession.acts.filter(a => a.act === 'acknowledgment');
  if (acknowledgments.length > 0) {
    sections.push('## What We Acknowledge\n\n' +
      acknowledgments.map(a => `- ${a.content}`).join('\n'));
  }

  // Analysis section
  const analyses = confession.acts.filter(a => a.act === 'analysis');
  if (analyses.length > 0) {
    sections.push('## How This Happened\n\n' +
      analyses.map(a => a.content).join('\n\n'));
  }

  // Commitment section
  const commitments = confession.acts.filter(a => a.act === 'commitment');
  if (commitments.length > 0) {
    sections.push('## What We Commit To\n\n' +
      commitments.map(a => `- ${a.content}`).join('\n'));
  }

  // Action section
  const actions = confession.acts.filter(a => a.act === 'action');
  if (actions.length > 0) {
    sections.push('## Immediate Actions\n\n' +
      actions.map(a => `- ${a.content}${a.timeline ? ` (${a.timeline})` : ''}`).join('\n'));
  }

  // Verification section
  if (confession.verificationMechanisms.length > 0) {
    sections.push('## How We Will Verify\n\n' +
      confession.verificationMechanisms.map(v => `- ${v}`).join('\n'));
  }

  return sections.join('\n\n');
}

export function addProgressReport(
  confessionId: string,
  report: string,
  metricsAchieved: string[]
): Confession | undefined {
  const confession = confessions.get(confessionId);
  if (!confession) return undefined;

  confession.progressReports.push({
    date: new Date(),
    report,
    metricsAchieved
  });

  confessions.set(confessionId, confession);
  return confession;
}

// ============================================================================
// NARRATIVE COHERENCE
// ============================================================================

export function checkNarrativeCoherence(storyId: string): NarrativeCoherenceReport {
  const story = stories.get(storyId);
  if (!story) {
    throw new Error(`Story not found: ${storyId}`);
  }

  const allStories = Array.from(stories.values()).filter(s => s.id !== storyId);
  const contradictions: NarrativeCoherenceReport['contradictions'] = [];

  // Check for contradictions with other stories
  allStories.forEach(otherStory => {
    const contradiction = findContradiction(story, otherStory);
    if (contradiction) {
      contradictions.push({
        withStoryId: otherStory.id,
        description: contradiction.description,
        severity: contradiction.severity
      });
    }
  });

  // Calculate coherence score
  const coherenceScore = calculateCoherenceScore(story, contradictions);

  // Generate recommendations
  const recommendations = generateCoherenceRecommendations(contradictions);

  return {
    storyId,
    checkedAgainst: allStories.map(s => s.id),
    coherenceScore,
    contradictions,
    recommendations,
    generatedAt: new Date()
  };
}

function findContradiction(
  story1: Story,
  story2: Story
): { description: string; severity: Severity } | null {
  // Simplified contradiction detection
  // In production, would use NLP/LLM for semantic analysis

  const text1 = story1.fullNarrative.toLowerCase();
  const text2 = story2.fullNarrative.toLowerCase();

  // Check for temporal contradictions
  if (text1.includes('always') && text2.includes('never')) {
    return {
      description: 'Potential absolute statement conflict between stories',
      severity: Severity.MEDIUM
    };
  }

  // Check for factual contradictions (simplified)
  const factPatterns = [
    { pattern: /we (have|had) (never|always)/, field: 'institutional_history' },
    { pattern: /our (mission|values) (is|are)/, field: 'mission' },
    { pattern: /(founded|established) in \d{4}/, field: 'founding' }
  ];

  for (const { pattern, field } of factPatterns) {
    const match1 = text1.match(pattern);
    const match2 = text2.match(pattern);
    if (match1 && match2 && match1[0] !== match2[0]) {
      return {
        description: `Conflicting statements about ${field}`,
        severity: Severity.HIGH
      };
    }
  }

  return null;
}

function calculateCoherenceScore(
  story: Story,
  contradictions: NarrativeCoherenceReport['contradictions']
): number {
  if (contradictions.length === 0) return 1.0;

  // Weight contradictions by severity
  const weights = {
    [Severity.CRITICAL]: 0.4,
    [Severity.HIGH]: 0.2,
    [Severity.MEDIUM]: 0.1,
    [Severity.LOW]: 0.05
  };

  const totalDeduction = contradictions.reduce((sum, c) => sum + weights[c.severity], 0);
  return Math.max(0, 1 - totalDeduction);
}

function generateCoherenceRecommendations(
  contradictions: NarrativeCoherenceReport['contradictions']
): string[] {
  const recommendations: string[] = [];

  if (contradictions.length === 0) {
    recommendations.push('No contradictions detected. Story is coherent with institutional narrative.');
    return recommendations;
  }

  const criticalCount = contradictions.filter(c => c.severity === Severity.CRITICAL).length;
  const highCount = contradictions.filter(c => c.severity === Severity.HIGH).length;

  if (criticalCount > 0) {
    recommendations.push('URGENT: Critical contradictions detected. Stories must be reconciled before publication.');
  }

  if (highCount > 0) {
    recommendations.push('Review high-severity contradictions with governance board before proceeding.');
  }

  recommendations.push('Consider creating a unified narrative document that reconciles all versions.');
  recommendations.push('Audit all audience adaptations for consistency with reconciled narrative.');

  return recommendations;
}

// ============================================================================
// INCIDENT STORY GENERATION
// ============================================================================

export function generateIncidentStory(incident: Incident): Story {
  const story = createStory({
    type: StoryType.INCIDENT,
    title: `Incident Report: ${incident.title}`,
    summary: incident.description,
    fullNarrative: buildIncidentNarrative(incident),
    tags: ['incident', incident.type, incident.severity]
  });

  // Auto-generate audience adaptations
  [
    StandardAudiences.PUBLIC,
    StandardAudiences.REGULATORS,
    StandardAudiences.AFFECTED_PARTIES,
    StandardAudiences.INTERNAL
  ].forEach(audience => {
    const adapted = autoAdaptStory(story.id, audience.id);
    if (adapted) {
      adaptStoryForAudience(story.id, audience.id, adapted);
    }
  });

  return story;
}

function buildIncidentNarrative(incident: Incident): string {
  const sections: string[] = [];

  sections.push(`# Incident Report: ${incident.title}`);
  sections.push(`**Severity:** ${incident.severity}`);
  sections.push(`**Status:** ${incident.status}`);
  sections.push(`**Detected:** ${incident.detectedAt.toISOString()}`);

  sections.push('\n## What Happened\n');
  sections.push(incident.description);

  if (incident.affectedPartyCount) {
    sections.push(`\n**Affected Parties:** ${incident.affectedPartyCount}`);
  }

  sections.push('\n## Our Response\n');
  if (incident.containmentActions.length > 0) {
    sections.push('**Containment Actions:**');
    incident.containmentActions.forEach(action => {
      sections.push(`- ${action}`);
    });
  }

  if (incident.remediationActions.length > 0) {
    sections.push('\n**Remediation Actions:**');
    incident.remediationActions.forEach(action => {
      sections.push(`- ${action}`);
    });
  }

  if (incident.rootCause) {
    sections.push('\n## Root Cause Analysis\n');
    sections.push(incident.rootCause);
  }

  if (incident.lessonsLearned) {
    sections.push('\n## Lessons Learned\n');
    sections.push(incident.lessonsLearned);
  }

  if (incident.preventionMeasures && incident.preventionMeasures.length > 0) {
    sections.push('\n## Prevention Measures\n');
    incident.preventionMeasures.forEach(measure => {
      sections.push(`- ${measure}`);
    });
  }

  return sections.join('\n');
}

// ============================================================================
// EXPORTS
// ============================================================================

export const StoriesEngine = {
  // Audience management
  createAudience,
  getAudience,
  StandardAudiences,

  // Story management
  createStory,
  getStory,
  updateStory,
  getAllStoriesByType,

  // Audience adaptation
  adaptStoryForAudience,
  getStoryForAudience,
  autoAdaptStory,

  // Confession framework
  createConfession,
  addConfessionAct,
  buildFullConfession,
  generateConfessionNarrative,
  addProgressReport,

  // Coherence checking
  checkNarrativeCoherence,

  // Incident stories
  generateIncidentStory
};

export default StoriesEngine;
