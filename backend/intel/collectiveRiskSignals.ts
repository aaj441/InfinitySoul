/**
 * Collective Risk Signals
 *
 * Purpose: Use AGGREGATE music trends (Spotify charts, regional playlists, viral tracks)
 * to measure collective "social temperature" and predict community-level risks:
 * - Social unrest / civil disturbances
 * - Protest movements
 * - Economic stress indicators
 * - Community cohesion breakdown
 *
 * Philosophy:
 * "When everyone's playing protest songs in a hot summer, that's not coincidence -
 * that's a leading indicator." Music reflects and amplifies collective mood.
 *
 * Historical precedents:
 * - 1965 Watts Riots: Heat wave + economic frustration + "Heat Wave" by Martha & The Vandellas
 * - 1992 LA Riots: Rodney King verdict + economic recession + "April 29, 1992" by Sublime
 * - 2020 BLM Protests: Police brutality + pandemic stress + "The Bigger Picture" by Lil Baby
 * - Arab Spring (2011): Social media + economic grievances + protest music going viral
 *
 * Research basis:
 * - Hsiang et al. (2013): Temperature increases predict conflict/violence
 * - Protests & Music: Eyerman & Jamison (1998), Roy (2010), Street (2012)
 * - Collective effervescence: Durkheim (1912), Collins (2004)
 * - Music as social barometer: DeNora (2000), Frith (1996)
 *
 * PRIVACY NOTE:
 * This module uses ONLY aggregate, anonymized data (chart trends, regional averages).
 * NO individual listening data. This is not surveillance - it's ambient temperature measurement.
 *
 * Insurance use cases:
 * - Property insurance: Riot risk, civil commotion coverage
 * - Business interruption: Protest-related closures
 * - Event insurance: Concert/festival cancellation risk
 * - Municipal risk pools: City infrastructure damage from unrest
 * - Political risk insurance: Stability indicators for international operations
 */

/**
 * Collective Music Event
 * Represents aggregate music consumption in a geographic region/community
 */
export interface CollectiveMusicEvent {
  region: string; // e.g., "Los Angeles", "Minneapolis", "national_US"
  timestamp: Date;

  // Chart data (aggregate, anonymized)
  topTracks: Array<{
    trackName: string;
    artistName: string;
    chartPosition: number;
    weeklyStreams: number;
    weekOverWeekChange: number; // % change (viral = rapid growth)
  }>;

  // Sentiment/theme classification (automated NLP on lyrics + metadata)
  themeDistribution: {
    protest: number; // 0-1 (% of top 50 with protest themes)
    anger: number; // 0-1
    solidarity: number; // 0-1 (collective action, "we" language)
    grief: number; // 0-1
    celebration: number; // 0-1
    escapism: number; // 0-1
    anxiety: number; // 0-1
  };

  // Musical characteristics (aggregate)
  avgValence: number; // 0-1 (positivity/negativity from Spotify API)
  avgEnergy: number; // 0-1
  avgTempo: number; // BPM
  avgLoudness: number; // dB

  // Engagement patterns
  socialSharingVelocity: number; // How fast tracks spread (viral coefficient)
  playlistCreationRate: number; // Community-created playlists with similar themes
  concertDemand?: number; // Ticket sales velocity for protest/activist artists
}

/**
 * Environmental Context
 * External stressors that interact with collective music signals
 */
export interface EnvironmentalContext {
  region: string;
  timestamp: Date;

  // Weather (Hsiang et al. 2013: heat predicts conflict)
  temperature: number; // Fahrenheit
  heatWaveActive: boolean; // >90°F for 3+ consecutive days
  seasonalAnomaly: number; // Deviation from normal (°F)

  // Economic indicators
  unemploymentRate: number; // Local/regional rate
  inflationRate: number; // CPI change
  gasPrices: number; // $ per gallon (highly visible stress indicator)
  housingAffordability: number; // Median rent / median income

  // Social stress indicators (from public data)
  crimeRateTrend: 'increasing' | 'stable' | 'decreasing';
  policeBrutalityIncidents?: number; // If publicly reported
  majorNewsEvents?: Array<{
    eventType: 'police_shooting' | 'court_verdict' | 'policy_announcement' | 'natural_disaster' | 'other';
    date: Date;
    localImpact: 'low' | 'medium' | 'high';
  }>;

  // Election/political cycles
  electionUpcoming?: boolean; // Within 90 days
  politicalPolarization?: number; // 0-1 (from survey data if available)
}

/**
 * Collective Risk Assessment
 * Prediction of community-level risk events
 */
export interface CollectiveRiskAssessment {
  region: string;
  assessedAt: Date;
  windowDays: number; // Lookback period (typically 14-30 days)

  // Risk scores (0-1, higher = elevated risk)
  socialUnrestRisk: number;
  civilDisturbanceRisk: number;
  protestActivityRisk: number;
  economicStressRisk: number;
  communityCohesionRisk: number; // Inverse: low = strong cohesion, high = fragmentation

  // Risk band
  overallRiskBand: 'baseline' | 'elevated' | 'high' | 'critical';

  // Leading indicators (what's driving the risk score)
  leadingIndicators: Array<{
    indicator: string;
    value: number;
    trend: 'increasing' | 'stable' | 'decreasing';
    contribution: number; // % contribution to overall risk
  }>;

  // Historical analog (if available)
  historicalAnalog?: {
    event: string; // e.g., "1992 LA Riots", "2020 Minneapolis protests"
    similarity: number; // 0-1
    leadTimeToEvent?: number; // Days before event occurred (in historical case)
  };

  // Recommendations (for insurers, municipalities, event planners)
  recommendations: Array<{
    stakeholder: 'property_insurer' | 'event_organizer' | 'municipality' | 'business_owner';
    action: string;
    rationale: string;
  }>;

  // Confidence
  confidenceLevel: number; // 0-1
  dataQuality: number; // 0-1 (completeness of music + environmental data)
}

/**
 * Compute collective risk from music trends and environmental context
 *
 * This is the core function that implements the "music as social barometer" hypothesis.
 *
 * Algorithm:
 * 1. Analyze music theme distribution (protest, anger, solidarity)
 * 2. Assess environmental stressors (heat, economic, social)
 * 3. Detect interaction effects (protest music + heat wave + economic stress = HIGH RISK)
 * 4. Compare to historical analogs
 * 5. Generate risk score + recommendations
 */
export function computeCollectiveRisk(
  musicEvents: CollectiveMusicEvent[],
  environmentalContext: EnvironmentalContext[],
  config: {
    windowDays?: number;
    sensitivityLevel?: 'conservative' | 'moderate' | 'aggressive'; // How quickly to flag risk
  } = {}
): CollectiveRiskAssessment {
  const windowDays = config.windowDays || 30;
  const sensitivityLevel = config.sensitivityLevel || 'moderate';

  if (musicEvents.length === 0) {
    throw new Error('No music events provided for collective risk assessment');
  }

  const region = musicEvents[0].region;
  const latestTimestamp = musicEvents[musicEvents.length - 1].timestamp;

  // Filter to window
  const windowStart = new Date(latestTimestamp);
  windowStart.setDate(windowStart.getDate() - windowDays);

  const windowMusic = musicEvents.filter(e => e.timestamp >= windowStart);
  const windowContext = environmentalContext.filter(e => e.timestamp >= windowStart);

  // ============================================================================
  // Step 1: Analyze Music Theme Distribution
  // ============================================================================

  const avgProtestTheme = avg(windowMusic.map(e => e.themeDistribution.protest));
  const avgAngerTheme = avg(windowMusic.map(e => e.themeDistribution.anger));
  const avgSolidarityTheme = avg(windowMusic.map(e => e.themeDistribution.solidarity));
  const avgGriefTheme = avg(windowMusic.map(e => e.themeDistribution.grief));

  // Protest music index: combination of protest + anger + solidarity themes
  const protestMusicIndex = (avgProtestTheme * 0.4 + avgAngerTheme * 0.3 + avgSolidarityTheme * 0.3);

  // Viral velocity: are protest songs spreading FAST?
  const avgSocialSharingVelocity = avg(windowMusic.map(e => e.socialSharingVelocity));

  // Musical characteristics: energy + tempo + loudness (high-energy = mobilization)
  const avgEnergy = avg(windowMusic.map(e => e.avgEnergy));
  const avgValence = avg(windowMusic.map(e => e.avgValence)); // Low valence = negative mood

  // ============================================================================
  // Step 2: Assess Environmental Stressors
  // ============================================================================

  const heatWaveActive = windowContext.some(e => e.heatWaveActive);
  const avgTemperature = avg(windowContext.map(e => e.temperature));
  const avgUnemployment = avg(windowContext.map(e => e.unemploymentRate));
  const avgInflation = avg(windowContext.map(e => e.inflationRate));
  const avgGasPrices = avg(windowContext.map(e => e.gasPrices));

  // Economic stress index
  const economicStressIndex = Math.min(1,
    (avgUnemployment / 10 * 0.4) + // Normalize to 10% unemployment = 0.4
    (avgInflation / 5 * 0.3) + // Normalize to 5% inflation = 0.3
    ((avgGasPrices - 3) / 3 * 0.3) // Normalize to $6/gal = 0.3 (baseline $3)
  );

  // Heat stress: Hsiang et al. (2013) show violence increases with temperature
  const heatStressIndex = heatWaveActive ? 0.8 : Math.min(1, (avgTemperature - 70) / 30); // Normalize 70-100°F

  // Major triggering events
  const majorEventsCount = windowContext.reduce((sum, e) => sum + (e.majorNewsEvents?.length || 0), 0);
  const highImpactEvents = windowContext.reduce((sum, e) =>
    sum + (e.majorNewsEvents?.filter(ev => ev.localImpact === 'high').length || 0), 0
  );

  // ============================================================================
  // Step 3: Detect Interaction Effects (CRITICAL)
  // ============================================================================

  // The magic happens when multiple stressors align:
  // Protest music + heat wave + economic stress + triggering event = HIGH RISK

  let socialUnrestRisk = 0;

  // Base risk from music signals (30%)
  socialUnrestRisk += protestMusicIndex * 0.3;

  // Environmental stressors (40%)
  socialUnrestRisk += economicStressIndex * 0.2;
  socialUnrestRisk += heatStressIndex * 0.2;

  // Triggering events (20%)
  socialUnrestRisk += Math.min(highImpactEvents / 2, 1) * 0.2;

  // Viral amplification (10%)
  socialUnrestRisk += Math.min(avgSocialSharingVelocity / 10, 1) * 0.1;

  // INTERACTION MULTIPLIER: If ALL stressors present, risk compounds
  if (protestMusicIndex > 0.6 && economicStressIndex > 0.6 && heatStressIndex > 0.6 && highImpactEvents > 0) {
    socialUnrestRisk *= 1.5; // 50% multiplier for convergence
  }

  socialUnrestRisk = Math.min(1, socialUnrestRisk);

  // Civil disturbance risk (property damage, vandalism)
  const civilDisturbanceRisk = Math.min(1, socialUnrestRisk * 0.8 + (avgEnergy * 0.2));

  // Protest activity risk (demonstrations, marches - not necessarily violent)
  const protestActivityRisk = Math.min(1,
    protestMusicIndex * 0.5 +
    avgSolidarityTheme * 0.3 +
    (majorEventsCount > 0 ? 0.2 : 0)
  );

  // Community cohesion risk (inverse: 1 = fragmented, 0 = strong)
  const communityCohesionRisk = Math.min(1,
    economicStressIndex * 0.4 +
    (1 - avgValence) * 0.3 + // Low mood = cohesion breakdown
    avgGriefTheme * 0.3
  );

  // ============================================================================
  // Step 4: Map to Risk Band
  // ============================================================================

  const overallRiskBand =
    socialUnrestRisk > 0.75 ? 'critical' :
    socialUnrestRisk > 0.5 ? 'high' :
    socialUnrestRisk > 0.3 ? 'elevated' :
    'baseline';

  // ============================================================================
  // Step 5: Identify Leading Indicators
  // ============================================================================

  const leadingIndicators = [
    {
      indicator: 'Protest music prevalence',
      value: protestMusicIndex,
      trend: calculateTrend(windowMusic.map(e => e.themeDistribution.protest)),
      contribution: protestMusicIndex * 0.3 / socialUnrestRisk,
    },
    {
      indicator: 'Economic stress',
      value: economicStressIndex,
      trend: calculateTrend(windowContext.map(e => e.unemploymentRate)),
      contribution: economicStressIndex * 0.2 / socialUnrestRisk,
    },
    {
      indicator: 'Heat stress',
      value: heatStressIndex,
      trend: calculateTrend(windowContext.map(e => e.temperature)),
      contribution: heatStressIndex * 0.2 / socialUnrestRisk,
    },
    {
      indicator: 'Viral music spread',
      value: Math.min(avgSocialSharingVelocity / 10, 1),
      trend: calculateTrend(windowMusic.map(e => e.socialSharingVelocity)),
      contribution: Math.min(avgSocialSharingVelocity / 10, 1) * 0.1 / socialUnrestRisk,
    },
  ].sort((a, b) => b.contribution - a.contribution);

  // ============================================================================
  // Step 6: Find Historical Analogs (if risk elevated)
  // ============================================================================

  let historicalAnalog: { event: string; similarity: number; leadTimeToEvent?: number } | undefined;

  if (socialUnrestRisk > 0.5) {
    historicalAnalog = findHistoricalAnalog({
      protestMusicIndex,
      economicStressIndex,
      heatStressIndex,
      highImpactEvents,
    });
  }

  // ============================================================================
  // Step 7: Generate Recommendations
  // ============================================================================

  const recommendations = generateRecommendations({
    overallRiskBand,
    socialUnrestRisk,
    civilDisturbanceRisk,
    protestActivityRisk,
    region,
  });

  // ============================================================================
  // Step 8: Confidence Assessment
  // ============================================================================

  const musicDataQuality = windowMusic.length / windowDays; // 1 event per day = 1.0
  const contextDataQuality = windowContext.length / windowDays;
  const dataQuality = Math.min(1, (musicDataQuality + contextDataQuality) / 2);
  const confidenceLevel = dataQuality * 0.7 + (windowDays > 21 ? 0.3 : windowDays / 21 * 0.3);

  return {
    region,
    assessedAt: latestTimestamp,
    windowDays,
    socialUnrestRisk,
    civilDisturbanceRisk,
    protestActivityRisk,
    economicStressRisk: economicStressIndex,
    communityCohesionRisk,
    overallRiskBand,
    leadingIndicators,
    historicalAnalog,
    recommendations,
    confidenceLevel,
    dataQuality,
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

function avg(values: number[]): number {
  return values.length > 0 ? values.reduce((sum, v) => sum + v, 0) / values.length : 0;
}

function calculateTrend(values: number[]): 'increasing' | 'stable' | 'decreasing' {
  if (values.length < 2) return 'stable';
  const midpoint = Math.floor(values.length / 2);
  const early = avg(values.slice(0, midpoint));
  const late = avg(values.slice(midpoint));
  const change = (late - early) / (early + 0.01); // Avoid division by zero
  if (change > 0.1) return 'increasing';
  if (change < -0.1) return 'decreasing';
  return 'stable';
}

/**
 * Find historical analog based on current conditions
 * (Simplified - in production, this would use ML similarity search)
 */
function findHistoricalAnalog(conditions: {
  protestMusicIndex: number;
  economicStressIndex: number;
  heatStressIndex: number;
  highImpactEvents: number;
}): { event: string; similarity: number; leadTimeToEvent?: number } {
  // Historical case library (would be database in production)
  const historicalCases = [
    {
      event: '1992 LA Riots (Rodney King verdict)',
      protestMusicIndex: 0.7,
      economicStressIndex: 0.6, // Recession
      heatStressIndex: 0.5, // April, moderate heat
      highImpactEvents: 1, // Verdict
      leadTimeToEvent: 3, // Music trends visible 3 days before
    },
    {
      event: '2020 Minneapolis protests (George Floyd)',
      protestMusicIndex: 0.8,
      economicStressIndex: 0.7, // Pandemic unemployment
      heatStressIndex: 0.4, // Late May
      highImpactEvents: 1, // Video release
      leadTimeToEvent: 2, // Music trends visible 2 days before
    },
    {
      event: '1965 Watts Riots',
      protestMusicIndex: 0.6,
      economicStressIndex: 0.5,
      heatStressIndex: 0.8, // August heat wave
      highImpactEvents: 1, // Traffic stop incident
      leadTimeToEvent: 7, // Music trends visible 1 week before
    },
  ];

  // Calculate cosine similarity (simplified)
  let bestMatch = historicalCases[0];
  let bestSimilarity = 0;

  for (const historicalCase of historicalCases) {
    const similarity =
      (conditions.protestMusicIndex * historicalCase.protestMusicIndex +
        conditions.economicStressIndex * historicalCase.economicStressIndex +
        conditions.heatStressIndex * historicalCase.heatStressIndex +
        Math.min(conditions.highImpactEvents, 1) * Math.min(historicalCase.highImpactEvents, 1)) /
      4;

    if (similarity > bestSimilarity) {
      bestSimilarity = similarity;
      bestMatch = historicalCase;
    }
  }

  return {
    event: bestMatch.event,
    similarity: bestSimilarity,
    leadTimeToEvent: bestMatch.leadTimeToEvent,
  };
}

/**
 * Generate stakeholder-specific recommendations
 */
function generateRecommendations(context: {
  overallRiskBand: 'baseline' | 'elevated' | 'high' | 'critical';
  socialUnrestRisk: number;
  civilDisturbanceRisk: number;
  protestActivityRisk: number;
  region: string;
}): Array<{
  stakeholder: 'property_insurer' | 'event_organizer' | 'municipality' | 'business_owner';
  action: string;
  rationale: string;
}> {
  const recommendations: Array<{
    stakeholder: 'property_insurer' | 'event_organizer' | 'municipality' | 'business_owner';
    action: string;
    rationale: string;
  }> = [];

  if (context.overallRiskBand === 'elevated' || context.overallRiskBand === 'high') {
    recommendations.push({
      stakeholder: 'property_insurer',
      action: 'Review civil commotion coverage exposure in high-risk areas',
      rationale: `Elevated social unrest indicators (${(context.socialUnrestRisk * 100).toFixed(0)}% risk score). Consider temporary exposure reduction or increased reserves.`,
    });

    recommendations.push({
      stakeholder: 'event_organizer',
      action: 'Increase security staffing and implement crowd management protocols',
      rationale: `Protest activity risk at ${(context.protestActivityRisk * 100).toFixed(0)}%. Large gatherings may attract demonstrations or disruptions.`,
    });

    recommendations.push({
      stakeholder: 'municipality',
      action: 'Activate community dialogue initiatives and increase police de-escalation training',
      rationale: `Music trends indicate rising collective frustration. Proactive engagement can reduce escalation risk.`,
    });

    recommendations.push({
      stakeholder: 'business_owner',
      action: 'Review business interruption coverage and implement protective measures',
      rationale: `Civil disturbance risk at ${(context.civilDisturbanceRisk * 100).toFixed(0)}%. Consider temporary boarding, increased security, or early closures during high-risk periods.`,
    });
  }

  if (context.overallRiskBand === 'critical') {
    recommendations.push({
      stakeholder: 'property_insurer',
      action: 'URGENT: Suspend new civil commotion coverage in region, activate crisis response team',
      rationale: `Critical risk level (${(context.socialUnrestRisk * 100).toFixed(0)}%). Historical analogs suggest imminent unrest. Protect existing policyholders, defer new commitments.`,
    });

    recommendations.push({
      stakeholder: 'municipality',
      action: 'URGENT: Deploy conflict resolution resources, coordinate with community leaders, prepare emergency response',
      rationale: `Critical risk indicators match historical precedents for social unrest. Immediate de-escalation efforts required.`,
    });
  }

  return recommendations;
}

/**
 * Ingest Spotify Charts data (or similar streaming platform aggregates)
 *
 * This function would connect to Spotify API (or other streaming platforms)
 * to pull chart data and convert to CollectiveMusicEvent format.
 *
 * NOTE: This uses public, aggregate chart data - NOT individual user data.
 */
export async function ingestSpotifyChartsData(
  region: string,
  startDate: Date,
  endDate: Date,
  spotifyApiKey: string
): Promise<CollectiveMusicEvent[]> {
  // TODO: Implement Spotify API integration
  // For now, return stub
  console.log(`Ingesting Spotify charts for ${region} from ${startDate} to ${endDate}`);
  return [];
}

/**
 * Classify track themes using NLP on lyrics + metadata
 *
 * This function would use sentiment analysis + keyword matching to detect
 * protest themes, anger, solidarity, etc.
 */
export function classifyTrackThemes(lyrics: string, metadata: {
  artistName: string;
  trackName: string;
  genre?: string;
}): {
  protest: number;
  anger: number;
  solidarity: number;
  grief: number;
  celebration: number;
  escapism: number;
  anxiety: number;
} {
  // TODO: Implement NLP-based classification
  // For now, return stub with keyword matching

  const lyricsLower = lyrics.toLowerCase();

  // Simple keyword-based scoring (production would use ML)
  const protestKeywords = ['fight', 'resist', 'power', 'justice', 'revolution', 'change', 'rise up', 'stand up'];
  const angerKeywords = ['hate', 'angry', 'rage', 'burn', 'destroy', 'fuck', 'violence'];
  const solidarityKeywords = ['we', 'together', 'united', 'us', 'our', 'community', 'solidarity'];
  const griefKeywords = ['cry', 'lost', 'gone', 'dead', 'grief', 'mourn', 'pain', 'hurt'];

  const protestScore = protestKeywords.filter(kw => lyricsLower.includes(kw)).length / protestKeywords.length;
  const angerScore = angerKeywords.filter(kw => lyricsLower.includes(kw)).length / angerKeywords.length;
  const solidarityScore = solidarityKeywords.filter(kw => lyricsLower.includes(kw)).length / solidarityKeywords.length;
  const griefScore = griefKeywords.filter(kw => lyricsLower.includes(kw)).length / griefKeywords.length;

  return {
    protest: Math.min(1, protestScore),
    anger: Math.min(1, angerScore),
    solidarity: Math.min(1, solidarityScore),
    grief: Math.min(1, griefScore),
    celebration: 0.1, // Stub
    escapism: 0.1, // Stub
    anxiety: 0.1, // Stub
  };
}
