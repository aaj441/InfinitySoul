/**
 * CULTURAL GEOMETRY MODULE
 * =========================
 *
 * "Geography is destiny, but geometry is strategy."
 *
 * This module implements the Cultural Geometry framework for InfinitySoul,
 * enabling paired-city analysis, Black-Asian corridor insights, and
 * culturally-grounded risk and accessibility modeling.
 *
 * The foundational pair is Carson, CA ↔ Malden, MA—two cities on opposite
 * coasts that share structural properties (no racial majority, substantial
 * Black and Asian populations, proximity to major metros and universities)
 * while being different enough to require thoughtful adaptation of insights.
 *
 * @author InfinitySoul Cultural Intelligence
 * @version 1.0.0
 */

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * Anchor city identifiers using ZIP code as unique key
 */
export type AnchorCityId = 'CARSON_CA_90746' | 'MALDEN_MA_02148';

/**
 * Comprehensive anchor city profile
 */
export interface AnchorCity {
  id: AnchorCityId;
  name: string;
  zipCode: string;
  city: string;
  state: string;
  stateAbbrev: string;
  metroArea: string;
  region: 'WEST_COAST' | 'EAST_COAST' | 'MIDWEST' | 'SOUTH' | 'MOUNTAIN';

  // Demographics
  population: number;
  demographicsSummary: string;
  blackShareApprox: string;
  asianShareApprox: string;
  latinoShareApprox: string;
  whiteShareApprox: string;
  hasRacialMajority: boolean;

  // Communities
  keyCommunities: CommunityProfile[];

  // Institutions
  keyInstitutions: InstitutionProfile[];

  // Cultural themes
  themes: string[];

  // Pairing
  pairedWith?: AnchorCityId;
  pairingRationale?: string;

  // Risk and Accessibility Context
  accessibilityContext: AccessibilityContext;
  riskContext: RiskContext;

  // Data sources
  sources: DataSource[];
}

export interface CommunityProfile {
  name: string;
  category: 'BLACK' | 'ASIAN' | 'LATINO' | 'WHITE' | 'MULTIRACIAL' | 'IMMIGRANT' | 'OTHER';
  subgroups?: string[];
  estimatedShare: string;
  notes?: string;
}

export interface InstitutionProfile {
  name: string;
  type: 'UNIVERSITY' | 'COMMUNITY_COLLEGE' | 'K12' | 'LIBRARY' | 'HOSPITAL' | 'CIVIC' | 'CULTURAL' | 'TRANSIT' | 'VENUE';
  isLocal: boolean; // In city vs. nearby
  distanceMinutes?: number;
  accessibilityPriority: 'HIGH' | 'MEDIUM' | 'LOW';
  notes?: string;
}

export interface AccessibilityContext {
  primaryLegalFramework: string[]; // e.g., ['ADA', 'Section 508', 'CA Unruh Act']
  litigationClimate: 'HIGH' | 'MEDIUM' | 'LOW';
  keyPlaintiffLawFirms?: string[];
  communityAccessibilityOrgs?: string[];
  languageAccessNeeds: string[];
}

export interface RiskContext {
  dominantIndustries: string[];
  economicProfile: string;
  disasterRisks: string[]; // Earthquake, flood, etc.
  regulatoryEnvironment: string;
  insuranceMarketNotes?: string;
}

export interface DataSource {
  name: string;
  url: string;
  type: 'CENSUS' | 'ACADEMIC' | 'GOVERNMENT' | 'NEWS' | 'COMMUNITY_ORG';
  accessDate?: string;
}

// =============================================================================
// ANCHOR CITY DATA
// =============================================================================

export const anchorCities: Record<AnchorCityId, AnchorCity> = {
  CARSON_CA_90746: {
    id: 'CARSON_CA_90746',
    name: 'Carson, California 90746',
    zipCode: '90746',
    city: 'Carson',
    state: 'California',
    stateAbbrev: 'CA',
    metroArea: 'Greater Los Angeles',
    region: 'WEST_COAST',

    population: 95000,
    demographicsSummary:
      'Highly diverse city with no racial majority. Large Latino presence (~40%), substantial Asian community (~25%, especially Filipino), and established Black middle-class community (~20%).',
    blackShareApprox: '≈20%',
    asianShareApprox: '≈25%',
    latinoShareApprox: '≈40%',
    whiteShareApprox: '≈10%',
    hasRacialMajority: false,

    keyCommunities: [
      {
        name: 'Black/African American',
        category: 'BLACK',
        estimatedShare: '≈20%',
        notes: 'Long-established, roots in LA Black middle class expansion of 1960s-80s'
      },
      {
        name: 'Filipino',
        category: 'ASIAN',
        subgroups: ['Tagalog speakers', 'Healthcare workers'],
        estimatedShare: '≈12%',
        notes: 'One of largest Filipino concentrations in Southern California'
      },
      {
        name: 'Korean',
        category: 'ASIAN',
        estimatedShare: '≈5%',
        notes: 'Ties to Koreatown, some small business owners'
      },
      {
        name: 'Latino/Hispanic',
        category: 'LATINO',
        subgroups: ['Mexican', 'Central American', 'South American'],
        estimatedShare: '≈40%',
        notes: 'Growing, diverse origin countries'
      },
      {
        name: 'Other Asian',
        category: 'ASIAN',
        subgroups: ['Japanese', 'Chinese', 'Vietnamese', 'Samoan'],
        estimatedShare: '≈8%'
      }
    ],

    keyInstitutions: [
      {
        name: 'Cal State University Dominguez Hills (CSUDH)',
        type: 'UNIVERSITY',
        isLocal: true,
        accessibilityPriority: 'HIGH',
        notes: 'HSI and AANAPISI-eligible, serves ~15,000 students, anchor institution'
      },
      {
        name: 'Cal State University Long Beach (CSULB)',
        type: 'UNIVERSITY',
        isLocal: false,
        distanceMinutes: 15,
        accessibilityPriority: 'HIGH',
        notes: 'Major research university, ~40,000 students'
      },
      {
        name: 'Dignity Health Sports Park',
        type: 'VENUE',
        isLocal: true,
        accessibilityPriority: 'MEDIUM',
        notes: 'LA Galaxy, major events venue'
      },
      {
        name: 'Carson City Hall',
        type: 'CIVIC',
        isLocal: true,
        accessibilityPriority: 'HIGH'
      },
      {
        name: 'Carson Library (LA County)',
        type: 'LIBRARY',
        isLocal: true,
        accessibilityPriority: 'HIGH',
        notes: 'Part of LA County Library system'
      },
      {
        name: 'Metro Blue Line (A Line)',
        type: 'TRANSIT',
        isLocal: true,
        accessibilityPriority: 'HIGH',
        notes: 'Light rail connection to downtown LA'
      }
    ],

    themes: [
      'Black–Asian–Latino corridor with genuine multiracial coexistence',
      'Under-recognized academic hub (CSUDH often overlooked)',
      'Working/middle-class diversity without extreme gentrification',
      'Root node for InfinitySoul actuarial philosophy',
      'Proximity to ports and logistics industry'
    ],

    pairedWith: 'MALDEN_MA_02148',
    pairingRationale:
      'Both cities have no racial majority, substantial Black and Asian populations, sit just outside globally known metros, and have meaningful but under-recognized institutional anchors. Carson is LA-adjacent with CSU anchor; Malden is Boston-adjacent with elite higher-ed proximity. This allows coastal comparison of Black-Asian dynamics.',

    accessibilityContext: {
      primaryLegalFramework: ['ADA', 'Section 508', 'California Unruh Civil Rights Act', 'CCPA'],
      litigationClimate: 'HIGH',
      keyPlaintiffLawFirms: ['Pacific Trial Attorneys', 'Potter Handy LLP'],
      communityAccessibilityOrgs: ['Disability Rights California', 'CSUDH Disability Resource Center'],
      languageAccessNeeds: ['Spanish', 'Tagalog', 'Korean', 'Vietnamese', 'Samoan']
    },

    riskContext: {
      dominantIndustries: ['Logistics/Warehousing', 'Healthcare', 'Retail', 'Education', 'Sports/Entertainment'],
      economicProfile: 'Working and middle class, some industrial legacy',
      disasterRisks: ['Earthquake (high)', 'Wildfire smoke', 'Industrial accidents', 'Heat waves'],
      regulatoryEnvironment: 'California strictest-in-nation for ADA, privacy, emissions',
      insuranceMarketNotes: 'High auto insurance rates, earthquake insurance optional but recommended'
    },

    sources: [
      { name: 'Census Dots - Carson Demographics', url: 'https://www.censusdots.com/race/carson-ca-demographics', type: 'CENSUS' },
      { name: 'Data USA - Carson, CA', url: 'https://datausa.io/profile/geo/carson-ca/', type: 'CENSUS' },
      { name: 'World Population Review - Carson', url: 'https://worldpopulationreview.com/us-cities/california/carson', type: 'CENSUS' }
    ]
  },

  MALDEN_MA_02148: {
    id: 'MALDEN_MA_02148',
    name: 'Malden, Massachusetts 02148',
    zipCode: '02148',
    city: 'Malden',
    state: 'Massachusetts',
    stateAbbrev: 'MA',
    metroArea: 'Greater Boston',
    region: 'EAST_COAST',

    population: 65000,
    demographicsSummary:
      'Rapidly diversified inner-ring city with no racial majority. Large and growing Asian population (~25-30%, especially Chinese), meaningful Black community (~13-16%), and significant immigrant populations from many origins.',
    blackShareApprox: '≈13-16%',
    asianShareApprox: '≈25-30%',
    latinoShareApprox: '≈10-12%',
    whiteShareApprox: '≈40%',
    hasRacialMajority: false,

    keyCommunities: [
      {
        name: 'Chinese',
        category: 'ASIAN',
        subgroups: ['Cantonese speakers', 'Mandarin speakers', 'Recent immigrants'],
        estimatedShare: '≈15-18%',
        notes: 'Largest Asian subgroup, includes spillover from Boston Chinatown'
      },
      {
        name: 'Vietnamese',
        category: 'ASIAN',
        estimatedShare: '≈5-7%',
        notes: 'Established community with businesses on Main Street'
      },
      {
        name: 'Other Asian',
        category: 'ASIAN',
        subgroups: ['Cambodian', 'Indian', 'Filipino'],
        estimatedShare: '≈5-7%'
      },
      {
        name: 'Black/African American',
        category: 'BLACK',
        subgroups: ['African American', 'Caribbean', 'African immigrant'],
        estimatedShare: '≈13-16%',
        notes: 'Diverse origins, growing community'
      },
      {
        name: 'Latino/Hispanic',
        category: 'LATINO',
        subgroups: ['Brazilian', 'Dominican', 'Puerto Rican', 'Central American'],
        estimatedShare: '≈10-12%',
        notes: 'Brazilian population notable'
      },
      {
        name: 'Immigrant Communities (broadly)',
        category: 'IMMIGRANT',
        estimatedShare: '≈35% foreign-born',
        notes: 'One of highest foreign-born percentages in Massachusetts'
      }
    ],

    keyInstitutions: [
      {
        name: 'Greater Malden Asian American Community Coalition (GMAACC)',
        type: 'CULTURAL',
        isLocal: true,
        accessibilityPriority: 'MEDIUM',
        notes: 'Key AAPI civic organization, leads community initiatives'
      },
      {
        name: 'Malden Public Library',
        type: 'LIBRARY',
        isLocal: true,
        accessibilityPriority: 'HIGH',
        notes: 'Historic library with multilingual services'
      },
      {
        name: 'Harvard University',
        type: 'UNIVERSITY',
        isLocal: false,
        distanceMinutes: 20,
        accessibilityPriority: 'HIGH'
      },
      {
        name: 'MIT',
        type: 'UNIVERSITY',
        isLocal: false,
        distanceMinutes: 25,
        accessibilityPriority: 'HIGH'
      },
      {
        name: 'Tufts University',
        type: 'UNIVERSITY',
        isLocal: false,
        distanceMinutes: 15,
        accessibilityPriority: 'HIGH'
      },
      {
        name: 'MBTA Orange Line',
        type: 'TRANSIT',
        isLocal: true,
        accessibilityPriority: 'HIGH',
        notes: 'Direct connection to downtown Boston, Malden Center station'
      },
      {
        name: 'Malden City Hall',
        type: 'CIVIC',
        isLocal: true,
        accessibilityPriority: 'HIGH'
      }
    ],

    themes: [
      'Newly diverse inner-ring city (transformation in one generation)',
      'Asian-led community infrastructure (AAPI orgs as civic leaders)',
      'Adjacent to elite education and biotech ecosystems',
      'Gateway city absorbing immigrants priced out of Boston',
      'Blue-collar roots with increasing professional class'
    ],

    pairedWith: 'CARSON_CA_90746',
    pairingRationale:
      'Mirror to Carson on the East Coast. Both lack racial majority, both have Black-Asian dynamics to study, both sit in shadow of famous metros. Malden offers contrast: older city (1649 vs. 1968), different legal environment (MA vs. CA), proximity to elite privates vs. public CSUs.',

    accessibilityContext: {
      primaryLegalFramework: ['ADA', 'Section 508', 'Massachusetts Architectural Access Board (AAB)'],
      litigationClimate: 'MEDIUM',
      communityAccessibilityOrgs: ['Disability Policy Consortium', 'Massachusetts Office on Disability'],
      languageAccessNeeds: ['Chinese (Cantonese/Mandarin)', 'Vietnamese', 'Portuguese', 'Spanish', 'Haitian Creole']
    },

    riskContext: {
      dominantIndustries: ['Healthcare/Biotech (regional)', 'Education (regional)', 'Retail', 'Professional Services'],
      economicProfile: 'Mixed working/middle/professional class, gentrifying',
      disasterRisks: ['Nor\'easter storms', 'Flooding', 'Extreme cold', 'Aging infrastructure'],
      regulatoryEnvironment: 'Massachusetts strong consumer protection, healthcare regulation',
      insuranceMarketNotes: 'Competitive auto market, flood insurance increasingly relevant'
    },

    sources: [
      { name: 'Data USA - Malden, MA', url: 'https://datausa.io/profile/geo/malden-ma/', type: 'CENSUS' },
      { name: 'Neilsberg - Malden Demographics', url: 'https://www.neilsberg.com/insights/malden-ma-population-by-race/', type: 'CENSUS' },
      { name: 'Census QuickFacts - Malden', url: 'https://www.census.gov/quickfacts/fact/table/maldencitymassachusetts/RHI425221', type: 'GOVERNMENT' },
      { name: 'GMAACC', url: 'https://www.gmaacc.org', type: 'COMMUNITY_ORG' },
      { name: 'Boston Indicators - Changing Faces', url: 'https://www.bostonindicators.org/-/media/indicators/boston-indicators-reports/report-files/changing-faces-2019/changingfaces_8newly-diverse-places.pdf', type: 'ACADEMIC' },
      { name: 'Neighborhood View - Asian American Impact', url: 'https://neighborhoodview.org/2021/05/23/community-spotlight-asian-american-businesses-and-organizations-make-an-impact-in-malden/', type: 'NEWS' }
    ]
  }
};

// =============================================================================
// PAIRED CITY INSIGHTS
// =============================================================================

export interface CulturalPairInsight {
  primary: AnchorCity;
  paired: AnchorCity;
  commentary: string;
  comparisonDimensions: ComparisonDimension[];
  researchQuestions: string[];
  interventionTransferNotes: string;
}

export interface ComparisonDimension {
  dimension: string;
  primaryValue: string;
  pairedValue: string;
  similarity: 'HIGH' | 'MEDIUM' | 'LOW';
  notes?: string;
}

// =============================================================================
// CORE FUNCTIONS
// =============================================================================

/**
 * Get a single anchor city by ID
 */
export function getAnchorCity(id: AnchorCityId): AnchorCity {
  const city = anchorCities[id];
  if (!city) {
    throw new Error(`Unknown anchor city ID: ${id}`);
  }
  return city;
}

/**
 * Get all anchor cities
 */
export function getAllAnchorCities(): AnchorCity[] {
  return Object.values(anchorCities);
}

/**
 * Get paired city insight with full analysis
 */
export function getPairedCities(id: AnchorCityId): CulturalPairInsight | null {
  const primary = anchorCities[id];
  if (!primary?.pairedWith) return null;

  const paired = anchorCities[primary.pairedWith];
  if (!paired) return null;

  const commentary =
    'Treat these two cities as a comparative Black–Asian corridor pair. ' +
    'When a risk pattern, outreach strategy, or accessibility intervention is designed for one, ' +
    'consider testing a version adapted to the other, accounting for regional law, history, and institutions.';

  const comparisonDimensions: ComparisonDimension[] = [
    {
      dimension: 'Metro Position',
      primaryValue: `Just outside ${primary.metroArea} core`,
      pairedValue: `Just outside ${paired.metroArea} core`,
      similarity: 'HIGH'
    },
    {
      dimension: 'Racial Majority',
      primaryValue: primary.hasRacialMajority ? 'Yes' : 'None',
      pairedValue: paired.hasRacialMajority ? 'Yes' : 'None',
      similarity: 'HIGH'
    },
    {
      dimension: 'Asian Population',
      primaryValue: primary.asianShareApprox,
      pairedValue: paired.asianShareApprox,
      similarity: 'HIGH'
    },
    {
      dimension: 'Black Population',
      primaryValue: primary.blackShareApprox,
      pairedValue: paired.blackShareApprox,
      similarity: 'MEDIUM',
      notes: 'Carson has higher Black share'
    },
    {
      dimension: 'Higher-Ed Proximity',
      primaryValue: 'CSU system (public)',
      pairedValue: 'Harvard/MIT/Tufts (elite private)',
      similarity: 'LOW',
      notes: 'Different institutional cultures and accessibility obligations'
    },
    {
      dimension: 'Litigation Climate',
      primaryValue: primary.accessibilityContext.litigationClimate,
      pairedValue: paired.accessibilityContext.litigationClimate,
      similarity: 'MEDIUM',
      notes: 'California is more litigious for ADA'
    },
    {
      dimension: 'Legal Framework',
      primaryValue: primary.accessibilityContext.primaryLegalFramework.join(', '),
      pairedValue: paired.accessibilityContext.primaryLegalFramework.join(', '),
      similarity: 'MEDIUM'
    }
  ];

  const researchQuestions = [
    'Do accessibility barriers affect Black vs. Asian communities differently in each city?',
    'How do language access needs differ (Spanish/Tagalog in Carson vs. Chinese/Vietnamese in Malden)?',
    'What role do community organizations play in accessibility advocacy?',
    'How does proximity to different university types affect local accessibility standards?',
    'Are there transferable outreach strategies for multiracial, no-majority cities?'
  ];

  const interventionTransferNotes =
    'When adapting interventions from one city to the other: ' +
    '(1) Account for different legal frameworks (CA Unruh Act vs. MA AAB); ' +
    '(2) Adjust language access for local demographics; ' +
    '(3) Identify equivalent community partner organizations; ' +
    '(4) Consider different transit systems and physical accessibility patterns; ' +
    '(5) Recognize different Asian subgroup compositions (Filipino/Korean in Carson vs. Chinese/Vietnamese in Malden).';

  return {
    primary,
    paired,
    commentary,
    comparisonDimensions,
    researchQuestions,
    interventionTransferNotes
  };
}

/**
 * Check if a location matches an anchor city
 */
export function matchesAnchorCity(
  input: { city?: string; state?: string; zipCode?: string }
): AnchorCityId | null {
  for (const [id, city] of Object.entries(anchorCities)) {
    if (input.zipCode && city.zipCode === input.zipCode) {
      return id as AnchorCityId;
    }
    if (input.city && input.state) {
      const cityMatch = city.city.toLowerCase() === input.city.toLowerCase();
      const stateMatch =
        city.state.toLowerCase() === input.state.toLowerCase() ||
        city.stateAbbrev.toLowerCase() === input.state.toLowerCase();
      if (cityMatch && stateMatch) {
        return id as AnchorCityId;
      }
    }
  }
  return null;
}

/**
 * Get accessibility context for a city
 */
export function getAccessibilityContext(id: AnchorCityId): AccessibilityContext {
  return getAnchorCity(id).accessibilityContext;
}

/**
 * Get risk context for a city
 */
export function getRiskContext(id: AnchorCityId): RiskContext {
  return getAnchorCity(id).riskContext;
}

/**
 * Get language access needs for a city
 */
export function getLanguageNeeds(id: AnchorCityId): string[] {
  return getAnchorCity(id).accessibilityContext.languageAccessNeeds;
}

/**
 * Get institutions by type for a city
 */
export function getInstitutionsByType(
  id: AnchorCityId,
  type: InstitutionProfile['type']
): InstitutionProfile[] {
  return getAnchorCity(id).keyInstitutions.filter(inst => inst.type === type);
}

/**
 * Get high-priority accessibility institutions
 */
export function getHighPriorityInstitutions(id: AnchorCityId): InstitutionProfile[] {
  return getAnchorCity(id).keyInstitutions.filter(
    inst => inst.accessibilityPriority === 'HIGH'
  );
}

// =============================================================================
// CROSS-CITY ANALYSIS UTILITIES
// =============================================================================

/**
 * Generate cross-city research prompt
 */
export function generateCrossCityPrompt(
  pattern: string,
  sourceCity: AnchorCityId
): string {
  const pair = getPairedCities(sourceCity);
  if (!pair) return '';

  return `
CROSS-CITY ANALYSIS REQUEST

A pattern has been observed in ${pair.primary.name}:
"${pattern}"

TASK: Investigate whether a parallel pattern exists in ${pair.paired.name}.

Consider:
1. ${pair.interventionTransferNotes}
2. Key differences to account for:
${pair.comparisonDimensions
  .filter(d => d.similarity !== 'HIGH')
  .map(d => `   - ${d.dimension}: ${d.primaryValue} vs. ${d.pairedValue}`)
  .join('\n')}

Research questions to explore:
${pair.researchQuestions.map(q => `- ${q}`).join('\n')}
`.trim();
}

/**
 * Calculate cultural similarity score between two cities
 */
export function calculateCulturalSimilarity(
  id1: AnchorCityId,
  id2: AnchorCityId
): { score: number; factors: string[] } {
  const city1 = getAnchorCity(id1);
  const city2 = getAnchorCity(id2);

  let score = 0;
  const factors: string[] = [];

  // Same racial majority status
  if (city1.hasRacialMajority === city2.hasRacialMajority) {
    score += 20;
    factors.push('Same racial majority status');
  }

  // Similar Asian population
  const asian1 = parseFloat(city1.asianShareApprox.replace(/[≈%]/g, ''));
  const asian2 = parseFloat(city2.asianShareApprox.replace(/[≈%]/g, ''));
  if (Math.abs(asian1 - asian2) < 10) {
    score += 15;
    factors.push('Similar Asian population share');
  }

  // Similar Black population
  const black1 = parseFloat(city1.blackShareApprox.replace(/[≈%]/g, ''));
  const black2 = parseFloat(city2.blackShareApprox.replace(/[≈%]/g, ''));
  if (Math.abs(black1 - black2) < 10) {
    score += 15;
    factors.push('Similar Black population share');
  }

  // Same region
  if (city1.region === city2.region) {
    score += 10;
    factors.push('Same region');
  }

  // Same litigation climate
  if (city1.accessibilityContext.litigationClimate === city2.accessibilityContext.litigationClimate) {
    score += 10;
    factors.push('Same litigation climate');
  }

  // Overlapping language needs
  const langOverlap = city1.accessibilityContext.languageAccessNeeds.filter(
    lang => city2.accessibilityContext.languageAccessNeeds.includes(lang)
  );
  score += langOverlap.length * 5;
  if (langOverlap.length > 0) {
    factors.push(`Shared language needs: ${langOverlap.join(', ')}`);
  }

  // Similar population scale
  const popRatio = Math.min(city1.population, city2.population) / Math.max(city1.population, city2.population);
  if (popRatio > 0.5) {
    score += 10;
    factors.push('Similar population scale');
  }

  return { score: Math.min(100, score), factors };
}

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  anchorCities,
  getAnchorCity,
  getAllAnchorCities,
  getPairedCities,
  matchesAnchorCity,
  getAccessibilityContext,
  getRiskContext,
  getLanguageNeeds,
  getInstitutionsByType,
  getHighPriorityInstitutions,
  generateCrossCityPrompt,
  calculateCulturalSimilarity
};
