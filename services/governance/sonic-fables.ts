/**
 * Cultural Fables - Sonic Artifacts for Governance Pattern Recognition
 *
 * Music operates on registers that rational argument cannot reach.
 * These songs encode governance wisdom through rhythm, melody, and metaphor.
 *
 * "The Monolith speaks in stories, fables, myths, and numbers.
 * But it also hums. The frequency matters."
 */

import { FablePattern, Severity } from './types';

// ============================================================================
// SONIC FABLES - Music as Governance Instruction
// ============================================================================

export interface SonicFable {
  id: string;
  title: string;
  artist: string;
  year: number;
  album: string;

  // Governance interpretation
  governanceTheme: string;
  pattern: FablePattern | 'consent_threshold' | 'cyclical_revelation' | 'transformation_risk';
  institutionalLesson: string;

  // Recognition triggers
  deploymentContexts: string[];
  riskSignals: string[];
  countermeasures: string[];

  // Aesthetic function
  emotionalRegister: string;
  whenToInvoke: string;
}

export const SonicFables: Record<string, SonicFable> = {

  AGE_OF_CONSENT: {
    id: 'sonic_age_of_consent',
    title: 'Age of Consent',
    artist: 'New Order',
    year: 1983,
    album: 'Power, Corruption & Lies',

    governanceTheme: 'The threshold of legitimate authority',

    pattern: 'consent_threshold',

    institutionalLesson: `Consent is not a checkbox. It is a threshold that entities must mature into.

The question is not "did they click agree?" but "were they capable of meaningful consent?"

An algorithm deployed on a population that cannot understand its operation has not received consent—
it has received submission. A governance framework adopted before an institution can implement it
is not adoption—it is performance.

The age of consent is not about age. It is about the capacity for genuine, informed participation
in a system that will affect you. Scale removes consent. Complexity removes consent.
Speed removes consent. The governance question is always: at what point does the
appearance of consent become its opposite?`,

    deploymentContexts: [
      'Deploying AI systems to populations unfamiliar with the technology',
      'Obtaining consent through terms of service nobody reads',
      'Adopting governance frameworks before institutional capacity exists',
      'Scaling systems beyond the scale at which consent was obtained',
      'Introducing complexity that makes informed consent impossible'
    ],

    riskSignals: [
      'Consent rate is suspiciously high (>95%)',
      'Time-to-consent is too fast for genuine review',
      'Consent obtained through dark patterns or defaults',
      'Population has no realistic alternative to consenting',
      'Consent language is incomprehensible to average user'
    ],

    countermeasures: [
      'Test comprehension before accepting consent as valid',
      'Provide meaningful alternatives to consenting',
      'Re-obtain consent when system changes materially',
      'Build capacity before deploying complex systems',
      'Measure understanding, not just agreement'
    ],

    emotionalRegister: 'The urgent, building energy of something that cannot be stopped once started. The bassline that pulls you forward whether you chose it or not.',

    whenToInvoke: 'When institutions claim they have "consent" but the power asymmetry makes genuine consent impossible. When the appearance of voluntary participation masks structural coercion.'
  },

  FULL_MOON: {
    id: 'sonic_full_moon',
    title: 'Full Moon',
    artist: 'Brandy',
    year: 2002,
    album: 'Full Moon',

    governanceTheme: 'Cyclical revelation and transformation risk',

    pattern: 'cyclical_revelation',

    institutionalLesson: `Governance operates in cycles. What is hidden in one phase becomes visible in another.

The full moon reveals what darkness concealed. Every system has its full moon moment—
the audit that exposes, the incident that illuminates, the whistleblower who surfaces
what everyone suspected but no one documented.

The question is not whether the full moon will come. It always comes.
The question is whether the institution has prepared for revelation.

Transformation under exposure can be rebirth or destruction.
The institution that has done the work in darkness can step into light.
The institution that relied on darkness to hide its failures will be consumed by the light.

Build systems that survive the full moon.`,

    deploymentContexts: [
      'Preparing for inevitable audits and exposures',
      'Managing cyclical risk patterns (quarterly earnings, annual reviews)',
      'Building resilience for whistleblower scenarios',
      'Designing systems that function under full transparency',
      'Planning for the moment when hidden debts come due'
    ],

    riskSignals: [
      'System only functions because certain facts are not visible',
      'Institutional behavior differs when observed vs unobserved',
      'Cyclical patterns show stress at revelation points',
      'Culture of concealment rather than transparency',
      'Fear of audits rather than confidence in passing them'
    ],

    countermeasures: [
      'Operate as if always observed (pre-mortem transparency)',
      'Build revelation into normal cycles (voluntary disclosure)',
      'Prepare transformation narratives before exposure forces them',
      'Create institutional muscle memory for crisis response',
      'Use the cycle—let the full moon be scheduled, not surprising'
    ],

    emotionalRegister: 'The ache of anticipation. The pull of something larger than individual will. The recognition that cycles are inescapable and transformation is coming whether prepared or not.',

    whenToInvoke: 'When institutions are hiding from inevitable exposure. When the question is not "if" but "when" the truth surfaces. When preparing for the moment of revelation.'
  }
};

// ============================================================================
// SONIC FABLE FUNCTIONS
// ============================================================================

export function getSonicFable(id: string): SonicFable | undefined {
  return Object.values(SonicFables).find(f => f.id === id);
}

export function getSonicFableByTitle(title: string): SonicFable | undefined {
  return Object.values(SonicFables).find(
    f => f.title.toLowerCase() === title.toLowerCase()
  );
}

export function getAllSonicFables(): SonicFable[] {
  return Object.values(SonicFables);
}

/**
 * Match a governance situation to relevant sonic fables
 */
export function matchSonicFables(situation: {
  involvesConsent?: boolean;
  involvesExposure?: boolean;
  involvesTransformation?: boolean;
  powerAsymmetry?: 'none' | 'moderate' | 'severe';
  cyclicalPattern?: boolean;
}): SonicFable[] {
  const matches: SonicFable[] = [];

  if (situation.involvesConsent || situation.powerAsymmetry === 'severe') {
    const ageOfConsent = SonicFables.AGE_OF_CONSENT;
    if (ageOfConsent) matches.push(ageOfConsent);
  }

  if (situation.involvesExposure || situation.involvesTransformation || situation.cyclicalPattern) {
    const fullMoon = SonicFables.FULL_MOON;
    if (fullMoon) matches.push(fullMoon);
  }

  return matches;
}

/**
 * Generate a risk assessment that includes sonic fable references
 */
export interface SonicRiskAssessment {
  situation: string;
  matchedFables: SonicFable[];
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  institutionalLessons: string[];
  countermeasures: string[];
  emotionalContext: string;
}

export function assessWithSonicFables(
  situation: string,
  characteristics: Parameters<typeof matchSonicFables>[0]
): SonicRiskAssessment {
  const matchedFables = matchSonicFables(characteristics);

  // Aggregate lessons and countermeasures
  const institutionalLessons = matchedFables.map(f => f.institutionalLesson);
  const countermeasures = matchedFables.flatMap(f => f.countermeasures);
  const emotionalContext = matchedFables.map(f => f.emotionalRegister).join(' ');

  // Determine risk level
  let riskLevel: SonicRiskAssessment['riskLevel'] = 'low';
  if (characteristics.powerAsymmetry === 'severe') riskLevel = 'critical';
  else if (characteristics.powerAsymmetry === 'moderate' || characteristics.cyclicalPattern) riskLevel = 'high';
  else if (matchedFables.length > 0) riskLevel = 'moderate';

  return {
    situation,
    matchedFables,
    riskLevel,
    institutionalLessons,
    countermeasures,
    emotionalContext
  };
}

// ============================================================================
// INTEGRATION WITH MAIN FABLES REGISTRY
// ============================================================================

/**
 * Sonic fables complement traditional fables.
 * Traditional fables encode moral instruction through narrative.
 * Sonic fables encode institutional wisdom through aesthetic experience.
 *
 * Use traditional fables for: pattern recognition, diagnosis, countermeasures
 * Use sonic fables for: emotional preparation, institutional mood, cultural anchoring
 *
 * The full moon comes for everyone.
 * The question is whether you've reached the age of consent before it arrives.
 */

export default {
  SonicFables,
  getSonicFable,
  getSonicFableByTitle,
  getAllSonicFables,
  matchSonicFables,
  assessWithSonicFables
};
