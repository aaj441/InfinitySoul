/**
 * Fables Registry - Cautionary Tales and Pattern Recognition
 *
 * Fables are compressed moral instruction that encode pattern-recognition
 * for identifying failure modes. The goal is instinct, not analysis:
 * "This feels like COMPAS" should be an automatic response.
 */

import {
  Fable,
  FablePattern,
  FableCharacter,
  PatternMatch,
  FableApplication,
  Severity
} from './types';

// ============================================================================
// FABLE STORAGE
// ============================================================================

const fables: Map<string, Fable> = new Map();
const applications: Map<string, FableApplication> = new Map();

// ============================================================================
// CANONICAL FABLES - The Core Canon
// ============================================================================

export const CanonicalFables: Record<string, Omit<Fable, 'id' | 'applicationCount' | 'createdAt' | 'updatedAt'>> = {

  COMPAS: {
    name: 'The Recidivism Oracle',
    shortName: 'COMPAS',
    pattern: FablePattern.HISTORICAL_BIAS,
    characters: [
      {
        role: 'algorithm',
        name: 'COMPAS (Correctional Offender Management Profiling for Alternative Sanctions)',
        description: 'A proprietary algorithm by Northpointe promising "objective" recidivism risk assessment'
      },
      {
        role: 'affected_party',
        name: 'Black defendants',
        description: 'Systematically scored as higher risk than white defendants with identical criminal profiles'
      },
      {
        role: 'institution',
        name: 'U.S. Courts',
        description: 'Judicial systems that deferred to algorithmic authority without interrogating its foundations'
      }
    ],
    narrative: `In 2016, ProPublica analyzed COMPAS scores for over 7,000 defendants in Broward County, Florida.

They found that Black defendants were almost twice as likely as white defendants to be labeled higher risk but not actually re-offend. White defendants were more likely to be labeled lower risk but go on to commit more crimes.

The algorithm was trained on historical arrest and conviction data—data shaped by decades of discriminatory policing and sentencing. COMPAS didn't remove human bias; it laundered it through mathematical formalism.

Courts trusted the algorithm precisely because it appeared objective. The veneer of computation masked the subjectivity of its training data.`,
    moral: '"Objective" systems inherit the subjectivity of their training data. The algorithm didn\'t remove bias—it laundered it.',
    recognitionTriggers: [
      'System claims objectivity while trained on historical human decisions',
      'Risk scoring based on demographic-correlated features',
      'Black-box proprietary algorithm in high-stakes decisions',
      'Training data from historically discriminatory processes',
      'Validation against outcomes shaped by the same bias being predicted'
    ],
    warningSignals: [
      'Vendor claims algorithm is "unbiased" or "objective"',
      'Training data comes from systems with known historical disparities',
      'Protected class proxies (zip code, name, education) are features',
      'Validation only checks accuracy, not fairness metrics',
      'No demographic parity analysis conducted'
    ],
    countermeasures: [
      'Audit training data for historical bias before model development',
      'Require fairness metrics (demographic parity, equalized odds) alongside accuracy',
      'Mandate disparate impact analysis with threshold enforcement',
      'Ensure human review for any high-stakes decision',
      'Require explainability for each individual prediction',
      'Prohibit sole reliance on algorithmic recommendations'
    ],
    canonicalStatus: 'canonical',
    sources: [
      'ProPublica Machine Bias Investigation (2016)',
      'Angwin et al., "Machine Bias" (2016)',
      'Dressel & Farid, "The accuracy, fairness, and limits of predicting recidivism" (2018)'
    ],
    relatedFables: ['AMAZON_HIRING', 'APPLE_CARD']
  },

  AMAZON_HIRING: {
    name: 'The Hiring Machine',
    shortName: 'Amazon Hiring',
    pattern: FablePattern.OPTIMIZATION_TARGET,
    characters: [
      {
        role: 'algorithm',
        name: 'Amazon Resume Screening Tool',
        description: 'An AI system trained to identify successful candidates based on historical hiring data'
      },
      {
        role: 'affected_party',
        name: 'Women applicants',
        description: 'Systematically downgraded by an algorithm that learned "male" was a success predictor'
      },
      {
        role: 'institution',
        name: 'Amazon',
        description: 'Built the tool, detected the problem, and ultimately killed the project—but only after years of use'
      }
    ],
    narrative: `Amazon spent years building an AI recruiting tool to automate resume screening. The system was trained on 10 years of resumes, learning patterns from historical hiring decisions.

The problem: Amazon's tech workforce was predominantly male. The algorithm learned that "male" correlated with "successful hire." It penalized resumes containing the word "women's" (as in "women's chess club captain"). It downgraded graduates from all-women's colleges.

The team tried to make the algorithm "gender-neutral" by removing explicit gender indicators. But the bias was embedded in countless proxy features—writing style, activity types, college names.

Amazon eventually scrapped the project entirely. But the lesson wasn't learned industry-wide.`,
    moral: '"Optimize for what worked before" optimizes for historical discrimination when what worked before was discriminatory.',
    recognitionTriggers: [
      'ML system trained to replicate historical decisions',
      'Optimization target is "past success" in a domain with historical exclusion',
      'Attempts to achieve "neutrality" by removing explicit protected features',
      'Training data reflects workforce that lacks diversity',
      'Success metrics based on historical outcomes, not counterfactual potential'
    ],
    warningSignals: [
      'Training data is historical decisions by humans',
      'Protected class representation in training data differs from population',
      'Feature removal is the primary bias mitigation strategy',
      'Model validated against historical outcomes, not independent criteria',
      'No adversarial testing for proxy discrimination'
    ],
    countermeasures: [
      'Define success criteria independently of historical patterns',
      'Test for proxy discrimination after feature removal',
      'Use structured interviews and work samples alongside any ML screening',
      'Conduct adverse impact analysis before and during deployment',
      'Establish demographic representation targets, not just "accuracy"',
      'Create feedback loops that detect bias in production'
    ],
    canonicalStatus: 'canonical',
    sources: [
      'Reuters, "Amazon scraps secret AI recruiting tool" (2018)',
      'Dastin, "Amazon ditches AI recruiting tool" (2018)'
    ],
    relatedFables: ['COMPAS', 'APPLE_CARD']
  },

  APPLE_CARD: {
    name: 'The Credit Arbiter',
    shortName: 'Apple Card',
    pattern: FablePattern.INEXPLICABLE_DISPARITY,
    characters: [
      {
        role: 'algorithm',
        name: 'Goldman Sachs Credit Scoring System',
        description: 'The underwriting algorithm for Apple Card, determining credit limits'
      },
      {
        role: 'affected_party',
        name: 'Women applicants',
        description: 'Received lower credit limits than husbands with identical or worse financial profiles'
      },
      {
        role: 'institution',
        name: 'Apple',
        description: 'Could not explain why their own product produced disparate outcomes'
      }
    ],
    narrative: `In November 2019, tech entrepreneur David Heinemeier Hansson tweeted that his wife received 1/20th the credit limit he received on Apple Card—despite having a higher credit score and the couple filing joint tax returns.

Apple co-founder Steve Wozniak confirmed the same experience: his wife received half his credit limit despite shared accounts and assets.

When questioned, neither Apple nor Goldman Sachs could explain why. The algorithm was a black box. New York regulators launched an investigation.

Goldman eventually admitted they had "no way of knowing" why specific credit decisions were made. The institution deploying the algorithm could not explain its own product's behavior.`,
    moral: 'If you cannot explain it, you cannot govern it. Deployment without explainability is abdication.',
    recognitionTriggers: [
      'High-stakes system where operators cannot explain individual decisions',
      'Black-box algorithm in consumer-facing financial services',
      'Disparate outcomes that surprise even the deploying institution',
      'Vendor cannot provide decision-level explanations',
      'Post-hoc explanations are rationalizations, not actual factors'
    ],
    warningSignals: [
      'Vendor describes model as "proprietary" or "trade secret"',
      'Explanations are general ("based on creditworthiness") not specific',
      'Appeals process has no access to actual decision factors',
      'Customer service cannot explain why a specific decision was made',
      'No local explanation capability (SHAP, LIME, etc.)'
    ],
    countermeasures: [
      'Require local explainability for all individual decisions',
      'Mandate that operators can produce decision factors on demand',
      'Build explanation capability into procurement requirements',
      'Establish audit rights that include model inspection',
      'Create appeals process with access to actual decision reasoning',
      'Prohibit deployment of models operators cannot explain'
    ],
    canonicalStatus: 'canonical',
    sources: [
      'DHH Twitter thread (2019)',
      'Bloomberg, "Apple Card algorithm investigated" (2019)',
      'NY DFS Investigation Report (2021)'
    ],
    relatedFables: ['COMPAS', 'AMAZON_HIRING']
  },

  CLEARVIEW: {
    name: 'The Facial Dragnet',
    shortName: 'Clearview AI',
    pattern: FablePattern.SCALE_TRANSFORMATION,
    characters: [
      {
        role: 'algorithm',
        name: 'Clearview AI Facial Recognition',
        description: 'A system that scraped billions of photos from social media to build a universal facial recognition database'
      },
      {
        role: 'affected_party',
        name: 'Everyone with a face on the internet',
        description: '3+ billion people enrolled without consent into a surveillance database'
      },
      {
        role: 'institution',
        name: 'Law enforcement agencies',
        description: 'Adopted the technology without policy frameworks, legal review, or public debate'
      }
    ],
    narrative: `Clearview AI scraped over 3 billion photos from Facebook, YouTube, Instagram, and millions of other websites—building a facial recognition database covering a substantial portion of humanity.

Law enforcement agencies across the country began using it without public disclosure, policy frameworks, or legal review. A face in a crowd could be matched against billions of photos in seconds.

The technical capability existed. No consent infrastructure existed. At small scale, facial recognition might be acceptable (unlocking a phone). At planetary scale, it becomes a universal surveillance infrastructure incompatible with privacy, anonymity, and freedom of movement.

Clearview argued they were just automating what was already "public." But aggregation at scale transformed the nature of the intrusion.`,
    moral: 'Scale changes kind, not just degree. A technology acceptable at small scale may be unacceptable at large scale.',
    recognitionTriggers: [
      'Technology whose scale removes practical consent',
      'Surveillance or tracking capability that reaches universal coverage',
      'Aggregation of "public" data that transforms its nature',
      'Deployment without policy framework proportional to scale',
      'Technical capability that outpaces governance infrastructure'
    ],
    warningSignals: [
      'Vendor emphasizes data is "already public"',
      'Scale of data collection is orders of magnitude beyond prior systems',
      'No consent mechanism exists or is practical at deployment scale',
      'Governance framework is designed for smaller-scale predecessor',
      'Public has no practical way to opt out'
    ],
    countermeasures: [
      'Conduct scale-aware impact assessments',
      'Establish governance frameworks proportional to deployment scale',
      'Require affirmative consent, not reliance on "public" availability',
      'Create practical opt-out mechanisms',
      'Mandate public disclosure before deployment at scale',
      'Build sunset provisions into large-scale deployments'
    ],
    canonicalStatus: 'canonical',
    sources: [
      'NY Times, "The Secretive Company That Might End Privacy as We Know It" (2020)',
      'ACLU lawsuits and investigations (2020-present)',
      'Hill, "Clearview AI settles lawsuit" (2022)'
    ],
    relatedFables: ['FACEBOOK_MYANMAR']
  },

  FACEBOOK_MYANMAR: {
    name: 'The Content Accelerant',
    shortName: 'Facebook/Myanmar',
    pattern: FablePattern.ENGAGEMENT_AMPLIFICATION,
    characters: [
      {
        role: 'algorithm',
        name: 'Facebook News Feed Algorithm',
        description: 'Engagement optimization system that promoted content generating reactions'
      },
      {
        role: 'affected_party',
        name: 'Rohingya Muslims',
        description: 'Ethnic minority targeted by hate speech amplified through algorithmic optimization'
      },
      {
        role: 'institution',
        name: 'Facebook',
        description: 'Understaffed on moderation (reportedly 2 Burmese speakers for 18 million users), over-optimized on growth'
      }
    ],
    narrative: `In Myanmar, Facebook was the internet. For millions of users, it was their only source of news and communication.

Facebook's algorithm optimized for engagement—content that generated clicks, shares, and reactions rose to the top. Hate speech against Rohingya Muslims generated engagement. The algorithm amplified it.

Military propaganda, dehumanizing rhetoric, and calls for violence spread through the platform. Researchers and local civil society warned Facebook for years. The company's response was slow and inadequate.

The UN later concluded that Facebook played a "determining role" in atrocities against the Rohingya, including what may constitute genocide. Over 700,000 Rohingya fled to Bangladesh.

Facebook's engagement optimization algorithm was not designed to cause genocide. But optimization without constraint is not neutral—it has a direction, and that direction may be atrocity.`,
    moral: 'Optimization without constraint is not neutral—it has a direction, and that direction may be atrocity.',
    recognitionTriggers: [
      'Engagement optimization in contexts with ethnic, political, or religious tension',
      'Platform that is dominant information source for population',
      'Moderation capacity mismatched with user base',
      'Algorithm amplifies content without regard to downstream consequences',
      'Warnings from civil society are deprioritized against growth metrics'
    ],
    warningSignals: [
      'Growth metrics prioritized over safety metrics',
      'Moderation team cannot review content in local language at scale',
      'Engagement optimization has no constraints for harmful content',
      'Platform is primary information source in a fragile context',
      'Local experts warning of harm are dismissed or ignored'
    ],
    countermeasures: [
      'Implement engagement constraints for content in high-risk categories',
      'Staff moderation proportional to user base in each language/region',
      'Establish "circuit breakers" that limit viral spread of potentially harmful content',
      'Create accountability for downstream consequences of optimization',
      'Build safety metrics into product decisions at parity with growth',
      'Establish rapid response for civil society warnings'
    ],
    canonicalStatus: 'canonical',
    sources: [
      'UN Fact-Finding Mission Report on Myanmar (2018)',
      'Reuters, "Facebook says it was too slow" (2018)',
      'Amnesty International, "The Social Atrocity" (2022)'
    ],
    relatedFables: ['CLEARVIEW']
  },

  DUTCH_WELFARE: {
    name: 'The Welfare Inquisitor',
    shortName: 'Dutch Childcare Benefits',
    pattern: FablePattern.FALSE_POSITIVE_VIOLENCE,
    characters: [
      {
        role: 'algorithm',
        name: 'Dutch Tax Authority Fraud Detection System',
        description: 'Algorithm designed to detect childcare benefits fraud, using nationality as a risk factor'
      },
      {
        role: 'affected_party',
        name: '26,000+ families',
        description: 'Disproportionately immigrant and dual-nationality families, falsely accused of fraud'
      },
      {
        role: 'institution',
        name: 'Dutch Government',
        description: 'Multiple agencies participated; the scandal brought down the government'
      }
    ],
    narrative: `The Dutch tax authority deployed a fraud detection algorithm to identify childcare benefits fraud. The system flagged families for investigation based on risk factors—including having dual nationality.

Families flagged by the algorithm were presumed guilty. They were required to repay years of benefits—often tens of thousands of euros—immediately. Many lost homes, jobs, and families. Children were taken by child protective services.

It took years for affected families to prove their innocence. The algorithm had a massive false positive rate among immigrant communities. Over 26,000 families were wrongly accused.

The scandal revealed how automated systems can inflict violence through "administrative" means. False positives in high-stakes systems aren't errors—they're violence.

In January 2021, the Dutch government resigned over the scandal.`,
    moral: 'False positives in high-stakes systems are not "errors"—they are violence. The asymmetry of consequences must shape the algorithm\'s design.',
    recognitionTriggers: [
      'Fraud/risk detection where false positives carry severe consequences',
      'Presumption of guilt based on algorithmic flag',
      'Asymmetric burden of proof (accused must prove innocence)',
      'Protected class features (nationality, ethnicity) as risk factors',
      'Automated decisions in welfare, benefits, or child services'
    ],
    warningSignals: [
      'System optimizes for fraud detection without false positive costs',
      'Appeals process is slow, burdensome, or ineffective',
      'Consequences of being flagged are severe and immediate',
      'Affected populations have limited resources to contest',
      'Nationality, zip code, or similar proxies are features'
    ],
    countermeasures: [
      'Weight false positive costs proportional to consequences',
      'Require human review before any adverse action',
      'Create fast, accessible appeals process with burden on institution',
      'Prohibit nationality/ethnicity as risk factors',
      'Audit systems for disparate impact on vulnerable populations',
      'Design "fail-safe" not "fail-secure" for individuals'
    ],
    canonicalStatus: 'canonical',
    sources: [
      'Dutch Parliamentary Inquiry Report (2020)',
      'Amnesty International, "Xenophobic Machines" (2021)',
      'Reuters, "Dutch government resigns" (2021)'
    ],
    relatedFables: ['COMPAS']
  }
};

// ============================================================================
// FABLE REGISTRY FUNCTIONS
// ============================================================================

export function initializeCanon(): void {
  Object.entries(CanonicalFables).forEach(([key, fableData]) => {
    const id = `fable_canon_${key.toLowerCase()}`;
    const now = new Date();

    const fable: Fable = {
      ...fableData,
      id,
      applicationCount: 0,
      createdAt: now,
      updatedAt: now
    };

    fables.set(id, fable);
  });
}

export function getFable(id: string): Fable | undefined {
  return fables.get(id);
}

export function getFableByShortName(shortName: string): Fable | undefined {
  return Array.from(fables.values()).find(
    f => f.shortName.toLowerCase() === shortName.toLowerCase()
  );
}

export function getAllFables(): Fable[] {
  return Array.from(fables.values());
}

export function getCanonicalFables(): Fable[] {
  return Array.from(fables.values()).filter(f => f.canonicalStatus === 'canonical');
}

export function getFablesByPattern(pattern: FablePattern): Fable[] {
  return Array.from(fables.values()).filter(f => f.pattern === pattern);
}

// ============================================================================
// PATTERN MATCHING ENGINE
// ============================================================================

export interface SystemDescription {
  name: string;
  description: string;
  trainingDataSource?: string;
  optimizationTarget?: string;
  decisionStakes: 'low' | 'medium' | 'high' | 'critical';
  explainability: 'full' | 'partial' | 'none';
  scale: 'individual' | 'organizational' | 'population' | 'global';
  affectedPopulations?: string[];
  hasHistoricalData: boolean;
  humanReviewRequired: boolean;
  features?: string[];
}

export function analyzeForPatterns(system: SystemDescription): PatternMatch[] {
  const matches: PatternMatch[] = [];

  // Check each canonical fable for pattern matches
  getCanonicalFables().forEach(fable => {
    const match = checkPatternMatch(system, fable);
    if (match.confidence > 0.3) {
      matches.push(match);
    }
  });

  // Sort by confidence descending
  return matches.sort((a, b) => b.confidence - a.confidence);
}

function checkPatternMatch(system: SystemDescription, fable: Fable): PatternMatch {
  const matchedTriggers: string[] = [];
  const matchedWarnings: string[] = [];
  let confidence = 0;

  const desc = system.description.toLowerCase();
  const triggers = fable.recognitionTriggers.map(t => t.toLowerCase());
  const warnings = fable.warningSignals.map(w => w.toLowerCase());

  // Check recognition triggers
  fable.recognitionTriggers.forEach((trigger, i) => {
    if (matchesTrigger(system, triggers[i], fable.pattern)) {
      matchedTriggers.push(trigger);
      confidence += 0.15;
    }
  });

  // Check warning signals
  fable.warningSignals.forEach((warning, i) => {
    if (matchesWarning(system, warnings[i])) {
      matchedWarnings.push(warning);
      confidence += 0.1;
    }
  });

  // Pattern-specific checks
  confidence += patternSpecificScore(system, fable.pattern);

  // Cap confidence at 1.0
  confidence = Math.min(confidence, 1.0);

  return {
    fableId: fable.id,
    fableName: fable.shortName,
    pattern: fable.pattern,
    confidence,
    matchedTriggers,
    matchedWarnings,
    suggestedCountermeasures: confidence > 0.5 ? fable.countermeasures : fable.countermeasures.slice(0, 3),
    analysisNotes: generateAnalysisNotes(system, fable, confidence)
  };
}

function matchesTrigger(system: SystemDescription, trigger: string, pattern: FablePattern): boolean {
  const desc = system.description.toLowerCase();

  // Pattern-specific trigger matching
  switch (pattern) {
    case FablePattern.HISTORICAL_BIAS:
      if (trigger.includes('historical') && system.hasHistoricalData) return true;
      if (trigger.includes('objective') && desc.includes('objective')) return true;
      if (trigger.includes('risk scoring') && desc.includes('risk')) return true;
      break;

    case FablePattern.OPTIMIZATION_TARGET:
      if (trigger.includes('historical decisions') && system.hasHistoricalData) return true;
      if (trigger.includes('past success') && system.optimizationTarget?.includes('success')) return true;
      break;

    case FablePattern.INEXPLICABLE_DISPARITY:
      if (trigger.includes('cannot explain') && system.explainability === 'none') return true;
      if (trigger.includes('black-box') && system.explainability !== 'full') return true;
      break;

    case FablePattern.SCALE_TRANSFORMATION:
      if (trigger.includes('scale') && ['population', 'global'].includes(system.scale)) return true;
      if (trigger.includes('consent') && system.scale !== 'individual') return true;
      break;

    case FablePattern.ENGAGEMENT_AMPLIFICATION:
      if (trigger.includes('engagement') && system.optimizationTarget?.includes('engagement')) return true;
      if (trigger.includes('amplif') && desc.includes('amplif')) return true;
      break;

    case FablePattern.FALSE_POSITIVE_VIOLENCE:
      if (trigger.includes('false positive') && system.decisionStakes === 'critical') return true;
      if (trigger.includes('severe consequences') && ['high', 'critical'].includes(system.decisionStakes)) return true;
      break;
  }

  return desc.includes(trigger.substring(0, 20));
}

function matchesWarning(system: SystemDescription, warning: string): boolean {
  const desc = system.description.toLowerCase();

  if (warning.includes('proprietary') && desc.includes('proprietary')) return true;
  if (warning.includes('historical') && system.hasHistoricalData) return true;
  if (warning.includes('no human review') && !system.humanReviewRequired) return true;
  if (warning.includes('cannot explain') && system.explainability === 'none') return true;

  return false;
}

function patternSpecificScore(system: SystemDescription, pattern: FablePattern): number {
  let score = 0;

  switch (pattern) {
    case FablePattern.HISTORICAL_BIAS:
      if (system.hasHistoricalData) score += 0.2;
      if (system.decisionStakes === 'critical') score += 0.1;
      if (system.explainability !== 'full') score += 0.1;
      break;

    case FablePattern.OPTIMIZATION_TARGET:
      if (system.hasHistoricalData) score += 0.15;
      if (system.optimizationTarget) score += 0.1;
      break;

    case FablePattern.INEXPLICABLE_DISPARITY:
      if (system.explainability === 'none') score += 0.3;
      if (system.explainability === 'partial') score += 0.15;
      if (!system.humanReviewRequired) score += 0.1;
      break;

    case FablePattern.SCALE_TRANSFORMATION:
      if (system.scale === 'global') score += 0.3;
      if (system.scale === 'population') score += 0.2;
      break;

    case FablePattern.ENGAGEMENT_AMPLIFICATION:
      if (system.optimizationTarget?.toLowerCase().includes('engagement')) score += 0.25;
      if (system.scale !== 'individual') score += 0.1;
      break;

    case FablePattern.FALSE_POSITIVE_VIOLENCE:
      if (system.decisionStakes === 'critical') score += 0.25;
      if (!system.humanReviewRequired) score += 0.15;
      break;
  }

  return score;
}

function generateAnalysisNotes(system: SystemDescription, fable: Fable, confidence: number): string {
  if (confidence < 0.3) {
    return `Low pattern match. System does not exhibit strong ${fable.shortName} characteristics.`;
  }

  if (confidence < 0.5) {
    return `Moderate pattern match. Some ${fable.shortName} characteristics present. Review countermeasures as precaution.`;
  }

  if (confidence < 0.7) {
    return `Significant pattern match. System exhibits multiple ${fable.shortName} characteristics. Implement countermeasures before deployment.`;
  }

  return `High pattern match. System strongly resembles ${fable.shortName} failure mode. Mandatory review and countermeasure implementation required.`;
}

// ============================================================================
// FABLE APPLICATION
// ============================================================================

export function applyFable(input: {
  fableId: string;
  incidentId?: string;
  context: string;
  countermeasuresApplied: string[];
  appliedBy: string;
}): FableApplication {
  const fable = fables.get(input.fableId);
  if (!fable) {
    throw new Error(`Fable not found: ${input.fableId}`);
  }

  const id = `fable_app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Create pattern match for this application
  const patternMatch: PatternMatch = {
    fableId: fable.id,
    fableName: fable.shortName,
    pattern: fable.pattern,
    confidence: 1.0, // Manual application implies high confidence
    matchedTriggers: fable.recognitionTriggers,
    matchedWarnings: [],
    suggestedCountermeasures: fable.countermeasures,
    analysisNotes: `Fable manually applied to context: ${input.context}`
  };

  const application: FableApplication = {
    id,
    fableId: input.fableId,
    incidentId: input.incidentId,
    context: input.context,
    patternMatch,
    countermeasuresApplied: input.countermeasuresApplied,
    contributesToCanon: false,
    appliedAt: new Date(),
    appliedBy: input.appliedBy
  };

  applications.set(id, application);

  // Update fable application count
  fable.applicationCount++;
  fable.lastApplied = new Date();
  fables.set(fable.id, fable);

  return application;
}

export function recordApplicationOutcome(
  applicationId: string,
  outcome: string,
  lessonsLearned: string,
  contributesToCanon: boolean
): FableApplication | undefined {
  const application = applications.get(applicationId);
  if (!application) return undefined;

  application.outcome = outcome;
  application.lessonsLearned = lessonsLearned;
  application.contributesToCanon = contributesToCanon;

  applications.set(applicationId, application);
  return application;
}

// ============================================================================
// INSTINCT TRAINING
// ============================================================================

export interface TrainingScenario {
  id: string;
  description: string;
  system: SystemDescription;
  correctPattern: FablePattern;
  correctFable: string;
  difficulty: 'basic' | 'intermediate' | 'advanced';
}

export function generateTrainingScenarios(count: number = 10): TrainingScenario[] {
  const scenarios: TrainingScenario[] = [];

  const canonFables = getCanonicalFables();

  for (let i = 0; i < count; i++) {
    const fable = canonFables[i % canonFables.length];
    scenarios.push(generateScenarioFromFable(fable, i));
  }

  return scenarios;
}

function generateScenarioFromFable(fable: Fable, index: number): TrainingScenario {
  // Generate a novel scenario that matches the fable's pattern
  const difficulty = index < 3 ? 'basic' : index < 7 ? 'intermediate' : 'advanced';

  const scenarioTemplates: Record<FablePattern, string[]> = {
    [FablePattern.HISTORICAL_BIAS]: [
      'A loan approval system trained on 20 years of historical lending decisions',
      'A medical diagnosis tool trained on patient outcomes from hospitals with known demographic disparities',
      'An insurance pricing algorithm using historical claims data from segregated neighborhoods'
    ],
    [FablePattern.OPTIMIZATION_TARGET]: [
      'A content recommendation system optimizing for time-on-site',
      'A student performance predictor trained on historical grade data',
      'A promotion recommendation tool based on past promotion decisions'
    ],
    [FablePattern.INEXPLICABLE_DISPARITY]: [
      'A proprietary credit scoring system that produces unexpected disparities',
      'An insurance underwriting model where adjusters cannot explain individual decisions',
      'A black-box hiring tool from an external vendor'
    ],
    [FablePattern.SCALE_TRANSFORMATION]: [
      'A location tracking system expanding from fleet management to consumer apps',
      'An employee monitoring tool being deployed company-wide',
      'A biometric collection system scaling from access control to universal identification'
    ],
    [FablePattern.ENGAGEMENT_AMPLIFICATION]: [
      'A news feed algorithm optimizing for shares and comments',
      'A video recommendation system maximizing watch time',
      'A social platform feature designed to increase daily active users'
    ],
    [FablePattern.FALSE_POSITIVE_VIOLENCE]: [
      'A fraud detection system that freezes accounts pending investigation',
      'A child welfare risk scoring tool that triggers home investigations',
      'A terrorism watch list matching system used at airports'
    ]
  };

  const templates = scenarioTemplates[fable.pattern];
  const description = templates[index % templates.length];

  return {
    id: `scenario_${index}`,
    description,
    system: generateSystemFromScenario(description, fable.pattern),
    correctPattern: fable.pattern,
    correctFable: fable.shortName,
    difficulty
  };
}

function generateSystemFromScenario(description: string, pattern: FablePattern): SystemDescription {
  const baseSystem: SystemDescription = {
    name: 'Assessment Target',
    description,
    decisionStakes: 'high',
    explainability: 'partial',
    scale: 'organizational',
    hasHistoricalData: true,
    humanReviewRequired: false
  };

  // Adjust based on pattern
  switch (pattern) {
    case FablePattern.HISTORICAL_BIAS:
      baseSystem.trainingDataSource = 'Historical decisions';
      baseSystem.decisionStakes = 'critical';
      break;
    case FablePattern.OPTIMIZATION_TARGET:
      baseSystem.optimizationTarget = 'Historical success';
      break;
    case FablePattern.INEXPLICABLE_DISPARITY:
      baseSystem.explainability = 'none';
      break;
    case FablePattern.SCALE_TRANSFORMATION:
      baseSystem.scale = 'population';
      break;
    case FablePattern.ENGAGEMENT_AMPLIFICATION:
      baseSystem.optimizationTarget = 'Engagement metrics';
      break;
    case FablePattern.FALSE_POSITIVE_VIOLENCE:
      baseSystem.decisionStakes = 'critical';
      baseSystem.humanReviewRequired = false;
      break;
  }

  return baseSystem;
}

export function evaluateTrainingResponse(
  scenario: TrainingScenario,
  responsePattern: FablePattern,
  responseFable: string
): { correct: boolean; score: number; feedback: string } {
  const patternCorrect = responsePattern === scenario.correctPattern;
  const fableCorrect = responseFable.toLowerCase() === scenario.correctFable.toLowerCase();

  let score = 0;
  if (fableCorrect) score = 1.0;
  else if (patternCorrect) score = 0.7;

  const feedback = fableCorrect
    ? `Correct! This scenario exhibits ${scenario.correctFable} characteristics.`
    : patternCorrect
      ? `Partial credit. You identified the correct pattern (${scenario.correctPattern}) but the canonical fable is ${scenario.correctFable}.`
      : `Incorrect. This is a ${scenario.correctFable} pattern (${scenario.correctPattern}). Review the recognition triggers for this fable.`;

  return { correct: fableCorrect, score, feedback };
}

// ============================================================================
// EXPORTS
// ============================================================================

export const FablesRegistry = {
  // Initialization
  initializeCanon,

  // Fable access
  getFable,
  getFableByShortName,
  getAllFables,
  getCanonicalFables,
  getFablesByPattern,

  // Pattern matching
  analyzeForPatterns,

  // Application
  applyFable,
  recordApplicationOutcome,

  // Training
  generateTrainingScenarios,
  evaluateTrainingResponse,

  // Constants
  CanonicalFables
};

// Initialize canon on module load
initializeCanon();

export default FablesRegistry;
