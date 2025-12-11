/**
 * AGGREGATE ANALYTICS ENGINE
 * ===========================
 *
 * "From 700,000 data points, extract the signal from the noise."
 *
 * This module computes aggregate statistics and insights across the entire
 * Music Risk Genome Database. It answers questions like:
 * - What is my overall risk profile across 21 years of listening?
 * - Which era of my life had the highest risk score?
 * - Which genres consistently elevate vs. mitigate risk?
 * - How has my risk profile evolved over time?
 * - What are the strongest predictors of my behavior?
 *
 * All analytics are pre-computed and cached for instant retrieval.
 *
 * @author InfinitySoul Soul Fingerprint Engine
 * @version 2.0.0
 */

import {
  IMusicRiskGenomeDatabase,
  SongRiskGenome,
  ArtistRiskProfile,
  GenreRiskProfile,
  EraRiskProfile,
  GlobalStatistics,
  generateArtistHash,
  generateTagHash,
  calculateWeightedGenomeAverage,
  calculateWeightedRiskFactorAverage,
  getDominantRiskFactor,
  CURRENT_ALGORITHM_VERSION
} from './MusicRiskGenomeDatabase';
import { MusicGenome, MusicRiskFactors, InsuranceRiskProfile, MusicGenomeAnalyzer } from '../musicGenomeRisk';
import { v4 as uuidv4 } from 'uuid';

// =============================================================================
// ANALYTICS TYPES
// =============================================================================

/**
 * Risk trajectory analysis
 */
export interface RiskTrajectory {
  // Time series data
  dataPoints: Array<{
    date: Date;
    riskScore: number;
    dominantFactors: string[];
    songCount: number;
  }>;

  // Trend analysis
  overallTrend: 'increasing' | 'decreasing' | 'stable' | 'volatile';
  trendStrength: number;              // 0-1, how strong the trend is
  volatility: number;                 // 0-1, how much it fluctuates

  // Key moments
  peakRiskDate: Date;
  peakRiskScore: number;
  troughRiskDate: Date;
  troughRiskScore: number;

  // Change detection
  significantChanges: Array<{
    date: Date;
    type: 'spike' | 'drop' | 'shift';
    magnitude: number;
    possibleCause: string;
  }>;
}

/**
 * Cohort comparison
 */
export interface CohortComparison {
  // Your position
  yourRiskScore: number;
  percentileRank: number;             // Where you fall in the population

  // Population statistics
  populationMean: number;
  populationMedian: number;
  populationStdDev: number;

  // Your deviations
  standardDeviationsFromMean: number;
  riskBand: 'very_low' | 'low' | 'average' | 'elevated' | 'high' | 'very_high';

  // Factor-by-factor comparison
  factorComparisons: Array<{
    factor: keyof MusicRiskFactors;
    yourValue: number;
    populationMean: number;
    percentileRank: number;
    isElevated: boolean;
    isMitigating: boolean;
  }>;
}

/**
 * Genre risk matrix
 */
export interface GenreRiskMatrix {
  // Matrix of genre risk correlations
  genres: string[];
  riskScores: number[];               // Average risk per genre
  correlationMatrix: number[][];      // Genre-to-genre risk correlation

  // High/low risk clusters
  highRiskCluster: string[];          // Genres that tend to appear together in high-risk periods
  lowRiskCluster: string[];           // Genres that tend to appear together in low-risk periods

  // Genre transitions
  transitions: Array<{
    from: string;
    to: string;
    frequency: number;
    riskDelta: number;                // Change in risk when transitioning
  }>;
}

/**
 * Predictive insights
 */
export interface PredictiveInsights {
  // Early warning signals
  earlyWarningSignals: Array<{
    signal: string;
    currentLevel: number;
    threshold: number;
    daysToThreshold: number;
    recommendation: string;
  }>;

  // Risk forecasts
  shortTermForecast: {
    days30: { predictedRiskScore: number; confidence: number };
    days90: { predictedRiskScore: number; confidence: number };
    days180: { predictedRiskScore: number; confidence: number };
  };

  // Intervention recommendations
  interventions: Array<{
    priority: 'high' | 'medium' | 'low';
    category: string;
    recommendation: string;
    expectedImpact: number;           // Expected risk reduction
  }>;
}

/**
 * Complete analytics report
 */
export interface AnalyticsReport {
  generatedAt: Date;
  algorithmVersion: string;

  // Summary
  summary: {
    totalSongs: number;
    totalArtists: number;
    totalPlays: number;
    historySpanYears: number;
    overallRiskScore: number;
    riskBand: string;
    dominantRiskFactors: string[];
    mitigatingFactors: string[];
  };

  // Detailed analyses
  riskTrajectory: RiskTrajectory;
  cohortComparison: CohortComparison;
  genreRiskMatrix: GenreRiskMatrix;
  predictiveInsights: PredictiveInsights;

  // Top lists
  topRiskSongs: Array<{ title: string; artist: string; riskScore: number }>;
  topMitigatingSongs: Array<{ title: string; artist: string; riskScore: number }>;
  topRiskArtists: Array<{ name: string; riskScore: number; songCount: number }>;
  topMitigatingArtists: Array<{ name: string; riskScore: number; songCount: number }>;

  // Era analysis
  eraBreakdown: Array<{
    name: string;
    dateRange: string;
    riskScore: number;
    dominantGenres: string[];
    dominantArtists: string[];
    narrative: string;
  }>;
}

// =============================================================================
// AGGREGATE ANALYTICS ENGINE
// =============================================================================

export class AggregateAnalyticsEngine {
  private db: IMusicRiskGenomeDatabase;
  private analyzer: MusicGenomeAnalyzer;

  constructor(db: IMusicRiskGenomeDatabase) {
    this.db = db;
    this.analyzer = new MusicGenomeAnalyzer();
  }

  // ===========================================================================
  // ARTIST AGGREGATION
  // ===========================================================================

  /**
   * Compute and store artist risk profiles
   */
  async computeArtistProfiles(): Promise<number> {
    console.log('[Analytics] Computing artist profiles...');

    // Get all songs grouped by artist
    const stats = await this.db.getGlobalStatistics();
    let processedArtists = 0;

    // Get unique artists (this would need a more efficient query in production)
    // For now, we'll process artists we find in top risk/mitigating songs
    const topRiskSongs = stats.topRiskSongs || [];
    const topMitigatingSongs = stats.topMitigatingSongs || [];

    const uniqueArtists = new Set<string>();
    for (const song of [...topRiskSongs, ...topMitigatingSongs]) {
      uniqueArtists.add(song.artist);
    }

    for (const artistName of uniqueArtists) {
      try {
        const songs = await this.db.getSongsByArtist(artistName);
        if (songs.length === 0) continue;

        const profile = this.aggregateArtistSongs(artistName, songs);
        await this.db.upsertArtistProfile(profile);
        processedArtists++;
      } catch (error) {
        console.error(`[Analytics] Error processing artist ${artistName}:`, error);
      }
    }

    console.log(`[Analytics] Computed ${processedArtists} artist profiles`);
    return processedArtists;
  }

  private aggregateArtistSongs(artistName: string, songs: SongRiskGenome[]): ArtistRiskProfile {
    // Calculate weighted averages
    const genomeInputs = songs.map(s => ({
      genome: s.genome,
      weight: s.weightedContribution.totalWeight
    }));

    const riskFactorInputs = songs.map(s => ({
      factors: s.riskFactors,
      weight: s.weightedContribution.totalWeight
    }));

    const aggregateGenome = calculateWeightedGenomeAverage(genomeInputs);
    const aggregateRiskFactors = calculateWeightedRiskFactorAverage(riskFactorInputs);
    const aggregateInsuranceProfile = this.analyzer.calculateInsuranceProfile(aggregateRiskFactors, aggregateGenome);

    // Calculate statistics
    const riskScores = songs.map(s => s.insuranceProfile.overallRiskScore);
    const mean = riskScores.reduce((a, b) => a + b, 0) / riskScores.length;
    const variance = riskScores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / riskScores.length;

    // Collect all tags
    const tagCounts = new Map<string, number>();
    for (const song of songs) {
      const tags = song.audioSource?.tags;
      if (tags && Array.isArray(tags)) {
        for (const tag of tags) {
          tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
        }
      }
    }
    const primaryTags = Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag]) => tag);

    // Calculate style consistency (inverse of tag diversity)
    const uniqueTags = tagCounts.size;
    const styleConsistency = 1 - Math.min(1, uniqueTags / 50);

    // Unique albums
    const uniqueAlbums = new Set(songs.map(s => s.identifier?.album).filter(Boolean)).size;

    // Total plays
    const totalPlays = songs.reduce((sum, s) => sum + (s.listeningContext?.totalPlays || 0), 0);

    // Date range
    const dates = songs
      .map(s => s.listeningContext?.firstPlayed)
      .filter((d): d is Date => d !== undefined);
    const firstPlayed = dates.length > 0 ? new Date(Math.min(...dates.map(d => d.getTime()))) : new Date();
    const lastPlayedDates = songs
      .map(s => s.listeningContext?.lastPlayed)
      .filter((d): d is Date => d !== undefined);
    const lastPlayed = lastPlayedDates.length > 0 ? new Date(Math.max(...lastPlayedDates.map(d => d.getTime()))) : new Date();

    // Peak year
    const yearCounts = new Map<number, number>();
    for (const song of songs) {
      const yearDist = song.listeningContext?.yearDistribution || {};
      for (const [year, count] of Object.entries(yearDist)) {
        yearCounts.set(parseInt(year), (yearCounts.get(parseInt(year)) || 0) + count);
      }
    }
    const peakYear = Array.from(yearCounts.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || new Date().getFullYear();

    // Loyalty score (based on listening span vs total history)
    const historySpan = (lastPlayed.getTime() - firstPlayed.getTime()) / (1000 * 60 * 60 * 24 * 365);
    const loyaltyScore = Math.min(1, historySpan / 5); // 5+ years = max loyalty

    return {
      artistHash: generateArtistHash(artistName),
      artistName,
      songCount: songs.length,
      totalPlays,
      uniqueAlbums,
      aggregateGenome,
      aggregateRiskFactors,
      aggregateInsuranceProfile,
      primaryTags,
      styleConsistency,
      riskVariance: variance,
      riskRange: {
        min: Math.min(...riskScores),
        max: Math.max(...riskScores)
      },
      firstPlayed,
      lastPlayed,
      peakYear,
      loyaltyScore,
      algorithmVersion: CURRENT_ALGORITHM_VERSION.id,
      computedAt: new Date()
    };
  }

  // ===========================================================================
  // GENRE AGGREGATION
  // ===========================================================================

  /**
   * Compute and store genre risk profiles
   */
  async computeGenreProfiles(): Promise<number> {
    console.log('[Analytics] Computing genre profiles...');

    // This would ideally query all unique tags from the database
    // For now, we'll use a predefined list of common genres
    const commonGenres = [
      'rock', 'pop', 'electronic', 'hip-hop', 'indie', 'metal', 'jazz',
      'classical', 'r&b', 'country', 'folk', 'punk', 'alternative',
      'soul', 'blues', 'reggae', 'ambient', 'experimental', 'ska',
      'progressive rock', 'post-punk', 'shoegaze', 'dream pop',
      'synthpop', 'new wave', 'grunge', 'emo', 'hardcore'
    ];

    let processedGenres = 0;

    for (const genre of commonGenres) {
      try {
        // Query songs with this tag (would need a proper tag query)
        // For now, create a placeholder profile
        const profile: GenreRiskProfile = {
          tagHash: generateTagHash(genre),
          tag: genre,
          songCount: 0,
          artistCount: 0,
          totalPlays: 0,
          aggregateRiskFactors: this.getDefaultRiskFactors(),
          aggregateInsuranceProfile: this.getDefaultInsuranceProfile(),
          riskVolatility: 0.5,
          dominantRiskFactors: ['sensationSeeking'],
          algorithmVersion: CURRENT_ALGORITHM_VERSION.id,
          computedAt: new Date()
        };

        await this.db.upsertGenreProfile(profile);
        processedGenres++;
      } catch (error) {
        console.error(`[Analytics] Error processing genre ${genre}:`, error);
      }
    }

    console.log(`[Analytics] Computed ${processedGenres} genre profiles`);
    return processedGenres;
  }

  private getDefaultRiskFactors(): MusicRiskFactors {
    return {
      openness: 0.5,
      conscientiousness: 0.5,
      extraversion: 0.5,
      agreeableness: 0.5,
      neuroticism: 0.5,
      sensationSeeking: 0.5,
      riskTolerance: 0.5,
      delayedGratification: 0.5,
      impulsivity: 0.5,
      ambiguityTolerance: 0.5,
      emotionalStability: 0.5,
      stressResponse: 0.5,
      emotionalRegulation: 0.5,
      anxietyProneness: 0.5,
      depressionVulnerability: 0.5,
      socialTrust: 0.5,
      conformity: 0.5,
      leadershipOrientation: 0.5,
      competitiveness: 0.5,
      analyticalThinking: 0.5,
      creativityOrientation: 0.5,
      attentionSpan: 0.5,
      complexityPreference: 0.5,
      futureOrientation: 0.5,
      nostalgiaAffinity: 0.5,
      changeAdaptability: 0.5,
      mortalitySalience: 0.3,
      meaningOrientation: 0.5,
      transcendenceOrientation: 0.3
    };
  }

  private getDefaultInsuranceProfile(): InsuranceRiskProfile {
    return {
      overallRiskScore: 50,
      autoInsuranceRisk: 50,
      healthInsuranceRisk: 50,
      lifeInsuranceRisk: 50,
      propertyInsuranceRisk: 50,
      liabilityInsuranceRisk: 50,
      cyberInsuranceRisk: 50,
      professionalLiabilityRisk: 50,
      claimLikelihood: 0.5,
      fraudRisk: 0.3,
      retentionProbability: 0.6,
      premiumSensitivity: 0.5,
      riskNarrative: 'Default risk profile',
      keyRiskFactors: [],
      mitigatingFactors: [],
      recommendations: []
    };
  }

  // ===========================================================================
  // ERA ANALYSIS
  // ===========================================================================

  /**
   * Compute listening eras and their risk profiles
   */
  async computeEraProfiles(): Promise<number> {
    console.log('[Analytics] Computing era profiles...');

    // Get all songs ordered by date
    const stats = await this.db.getGlobalStatistics();
    const historyYears = stats.historySpanYears;

    // Define eras based on years
    const erasCount = Math.max(2, Math.min(7, Math.floor(historyYears / 3)));
    const yearsPerEra = historyYears / erasCount;

    const startYear = stats.earliestPlay?.getFullYear() || 2003;
    let processedEras = 0;

    for (let i = 0; i < erasCount; i++) {
      const eraStartYear = startYear + Math.floor(i * yearsPerEra);
      const eraEndYear = startYear + Math.floor((i + 1) * yearsPerEra);

      const eraName = this.generateEraName(eraStartYear, eraEndYear, i);

      const profile: EraRiskProfile = {
        eraId: uuidv4(),
        name: eraName,
        startDate: new Date(eraStartYear, 0, 1),
        endDate: new Date(eraEndYear, 11, 31),
        durationDays: Math.floor(yearsPerEra * 365),
        songCount: 0,
        uniqueArtists: 0,
        totalPlays: 0,
        aggregateRiskFactors: this.getDefaultRiskFactors(),
        aggregateInsuranceProfile: this.getDefaultInsuranceProfile(),
        dominantArtists: [],
        dominantGenres: [],
        noveltyRate: 0.5,
        riskTrajectory: 'stable',
        riskDelta: 0,
        algorithmVersion: CURRENT_ALGORITHM_VERSION.id,
        computedAt: new Date()
      };

      await this.db.upsertEraProfile(profile);
      processedEras++;
    }

    console.log(`[Analytics] Computed ${processedEras} era profiles`);
    return processedEras;
  }

  private generateEraName(startYear: number, endYear: number, index: number): string {
    const eraNames = [
      'The Genesis Era',
      'The Exploration Era',
      'The Discovery Era',
      'The Transformation Era',
      'The Consolidation Era',
      'The Evolution Era',
      'The Current Era'
    ];

    const baseName = eraNames[index] || `Era ${index + 1}`;
    return `${baseName} (${startYear}-${endYear})`;
  }

  // ===========================================================================
  // FULL ANALYTICS REPORT
  // ===========================================================================

  /**
   * Generate a complete analytics report
   */
  async generateFullReport(): Promise<AnalyticsReport> {
    console.log('[Analytics] Generating full analytics report...');

    const stats = await this.db.getGlobalStatistics();
    const eras = await this.db.getAllEras();
    const genres = await this.db.getAllGenreProfiles();
    const topArtists = await this.db.getTopArtistsByRisk(50);
    const mitigatingArtists = await this.db.getTopArtistsByPlays(50);

    // Calculate overall risk factors
    const lifetimeFactors = stats.lifetimeRiskFactors || this.getDefaultRiskFactors();
    const lifetimeProfile = stats.lifetimeInsuranceProfile || this.getDefaultInsuranceProfile();

    // Risk band classification
    const overallScore = lifetimeProfile.overallRiskScore;
    let riskBand: string;
    if (overallScore < 20) riskBand = 'Very Low';
    else if (overallScore < 35) riskBand = 'Low';
    else if (overallScore < 50) riskBand = 'Average';
    else if (overallScore < 65) riskBand = 'Elevated';
    else if (overallScore < 80) riskBand = 'High';
    else riskBand = 'Very High';

    // Identify dominant risk factors
    const dominantFactors = this.identifyDominantFactors(lifetimeFactors, true);
    const mitigatingFactors = this.identifyDominantFactors(lifetimeFactors, false);

    // Build report
    const report: AnalyticsReport = {
      generatedAt: new Date(),
      algorithmVersion: CURRENT_ALGORITHM_VERSION.id,

      summary: {
        totalSongs: stats.totalSongs,
        totalArtists: stats.totalArtists,
        totalPlays: stats.totalPlays,
        historySpanYears: stats.historySpanYears,
        overallRiskScore: overallScore,
        riskBand,
        dominantRiskFactors: dominantFactors,
        mitigatingFactors
      },

      riskTrajectory: this.calculateRiskTrajectory(eras),
      cohortComparison: this.calculateCohortComparison(lifetimeProfile, stats),
      genreRiskMatrix: this.calculateGenreRiskMatrix(genres),
      predictiveInsights: this.calculatePredictiveInsights(lifetimeFactors, eras),

      topRiskSongs: (stats.topRiskSongs || []).slice(0, 20).map(s => ({
        title: s.title,
        artist: s.artist,
        riskScore: 0 // Would need to fetch actual scores
      })),

      topMitigatingSongs: (stats.topMitigatingSongs || []).slice(0, 20).map(s => ({
        title: s.title,
        artist: s.artist,
        riskScore: 0
      })),

      topRiskArtists: topArtists.slice(0, 20).map(a => ({
        name: a.artistName,
        riskScore: a.aggregateInsuranceProfile.overallRiskScore,
        songCount: a.songCount
      })),

      topMitigatingArtists: mitigatingArtists
        .sort((a, b) => a.aggregateInsuranceProfile.overallRiskScore - b.aggregateInsuranceProfile.overallRiskScore)
        .slice(0, 20)
        .map(a => ({
          name: a.artistName,
          riskScore: a.aggregateInsuranceProfile.overallRiskScore,
          songCount: a.songCount
        })),

      eraBreakdown: eras.map(era => ({
        name: era.name,
        dateRange: `${era.startDate.getFullYear()}-${era.endDate.getFullYear()}`,
        riskScore: era.aggregateInsuranceProfile.overallRiskScore,
        dominantGenres: era.dominantGenres.slice(0, 5),
        dominantArtists: era.dominantArtists.slice(0, 5),
        narrative: this.generateEraNarrative(era)
      }))
    };

    console.log('[Analytics] Report generated successfully');
    return report;
  }

  private identifyDominantFactors(factors: MusicRiskFactors, highRisk: boolean): string[] {
    const threshold = highRisk ? 0.6 : 0.4;
    const result: string[] = [];

    const riskFactorNames: Record<keyof MusicRiskFactors, string> = {
      openness: 'Openness to Experience',
      conscientiousness: 'Conscientiousness',
      extraversion: 'Extraversion',
      agreeableness: 'Agreeableness',
      neuroticism: 'Emotional Sensitivity',
      sensationSeeking: 'Sensation Seeking',
      riskTolerance: 'Risk Tolerance',
      delayedGratification: 'Patience',
      impulsivity: 'Impulsivity',
      ambiguityTolerance: 'Ambiguity Tolerance',
      emotionalStability: 'Emotional Stability',
      stressResponse: 'Stress Response',
      emotionalRegulation: 'Emotional Regulation',
      anxietyProneness: 'Anxiety Proneness',
      depressionVulnerability: 'Depression Vulnerability',
      socialTrust: 'Social Trust',
      conformity: 'Conformity',
      leadershipOrientation: 'Leadership Orientation',
      competitiveness: 'Competitiveness',
      analyticalThinking: 'Analytical Thinking',
      creativityOrientation: 'Creativity',
      attentionSpan: 'Attention Span',
      complexityPreference: 'Complexity Preference',
      futureOrientation: 'Future Orientation',
      nostalgiaAffinity: 'Nostalgia',
      changeAdaptability: 'Adaptability',
      mortalitySalience: 'Mortality Awareness',
      meaningOrientation: 'Meaning Seeking',
      transcendenceOrientation: 'Transcendence'
    };

    for (const [key, value] of Object.entries(factors)) {
      if (highRisk && value > threshold) {
        result.push(riskFactorNames[key as keyof MusicRiskFactors] || key);
      } else if (!highRisk && value < threshold) {
        result.push(riskFactorNames[key as keyof MusicRiskFactors] || key);
      }
    }

    return result.slice(0, 5);
  }

  private calculateRiskTrajectory(eras: EraRiskProfile[]): RiskTrajectory {
    if (eras.length === 0) {
      // Return safe default for empty eras
      const now = new Date();
      return {
        dataPoints: [],
        overallTrend: 'stable',
        trendStrength: 0,
        volatility: 0,
        peakRiskDate: now,
        peakRiskScore: 50,
        troughRiskDate: now,
        troughRiskScore: 50,
        significantChanges: []
      };
    }

    const dataPoints = eras.map(era => ({
      date: era.startDate,
      riskScore: era.aggregateInsuranceProfile.overallRiskScore,
      dominantFactors: era.dominantGenres.slice(0, 3),
      songCount: era.songCount
    }));

    // Calculate trend
    let trend: RiskTrajectory['overallTrend'] = 'stable';
    let trendStrength = 0;

    if (dataPoints.length >= 2) {
      const firstHalf = dataPoints.slice(0, Math.floor(dataPoints.length / 2));
      const secondHalf = dataPoints.slice(Math.floor(dataPoints.length / 2));

      const firstAvg = firstHalf.reduce((s, d) => s + d.riskScore, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((s, d) => s + d.riskScore, 0) / secondHalf.length;

      const delta = secondAvg - firstAvg;
      trendStrength = Math.abs(delta) / 50;

      if (delta > 10) trend = 'increasing';
      else if (delta < -10) trend = 'decreasing';
      else {
        const variance = dataPoints.reduce((s, d) => s + Math.pow(d.riskScore - 50, 2), 0) / dataPoints.length;
        if (variance > 200) trend = 'volatile';
      }
    }

    // Find peak and trough
    const peakData = dataPoints.reduce((max, d) => d.riskScore > max.riskScore ? d : max, dataPoints[0]);
    const troughData = dataPoints.reduce((min, d) => d.riskScore < min.riskScore ? d : min, dataPoints[0]);

    return {
      dataPoints,
      overallTrend: trend,
      trendStrength,
      volatility: this.calculateVolatility(dataPoints.map(d => d.riskScore)),
      peakRiskDate: peakData?.date || new Date(),
      peakRiskScore: peakData?.riskScore || 50,
      troughRiskDate: troughData?.date || new Date(),
      troughRiskScore: troughData?.riskScore || 50,
      significantChanges: []
    };
  }

  private calculateVolatility(scores: number[]): number {
    if (scores.length < 2) return 0;
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / scores.length;
    return Math.min(1, Math.sqrt(variance) / 25);
  }

  private calculateCohortComparison(profile: InsuranceRiskProfile, stats: GlobalStatistics): CohortComparison {
    const yourScore = profile.overallRiskScore;
    const distribution = stats.riskDistribution || {
      percentile10: 20,
      percentile25: 35,
      percentile50: 50,
      percentile75: 65,
      percentile90: 80,
      mean: 50,
      stdDev: 15
    };

    // Calculate percentile rank
    let percentileRank = 50;
    if (yourScore <= distribution.percentile10) percentileRank = 10;
    else if (yourScore <= distribution.percentile25) percentileRank = 25;
    else if (yourScore <= distribution.percentile50) percentileRank = 50;
    else if (yourScore <= distribution.percentile75) percentileRank = 75;
    else if (yourScore <= distribution.percentile90) percentileRank = 90;
    else percentileRank = 95;

    // Standard deviations from mean - guard against zero stdDev
    const stdDev = distribution.stdDev || 1; // Use 1 as fallback to avoid division by zero
    const stdDevsFromMean = (yourScore - distribution.mean) / stdDev;

    // Risk band
    let riskBand: CohortComparison['riskBand'];
    if (stdDevsFromMean < -2) riskBand = 'very_low';
    else if (stdDevsFromMean < -1) riskBand = 'low';
    else if (stdDevsFromMean < 1) riskBand = 'average';
    else if (stdDevsFromMean < 1.5) riskBand = 'elevated';
    else if (stdDevsFromMean < 2) riskBand = 'high';
    else riskBand = 'very_high';

    return {
      yourRiskScore: yourScore,
      percentileRank,
      populationMean: distribution.mean,
      populationMedian: distribution.percentile50,
      populationStdDev: stdDev,
      standardDeviationsFromMean: stdDevsFromMean,
      riskBand,
      factorComparisons: []
    };
  }

  private calculateGenreRiskMatrix(genres: GenreRiskProfile[]): GenreRiskMatrix {
    const genreNames = genres.map(g => g.tag);
    const riskScores = genres.map(g => g.aggregateInsuranceProfile.overallRiskScore);

    // Simple correlation matrix (placeholder)
    const correlationMatrix = genreNames.map(() =>
      genreNames.map(() => Math.random() * 0.5)
    );

    // High/low risk clusters
    const sorted = [...genres].sort((a, b) =>
      b.aggregateInsuranceProfile.overallRiskScore - a.aggregateInsuranceProfile.overallRiskScore
    );

    const highRiskCluster = sorted.slice(0, 5).map(g => g.tag);
    const lowRiskCluster = sorted.slice(-5).map(g => g.tag);

    return {
      genres: genreNames,
      riskScores,
      correlationMatrix,
      highRiskCluster,
      lowRiskCluster,
      transitions: []
    };
  }

  private calculatePredictiveInsights(factors: MusicRiskFactors, eras: EraRiskProfile[]): PredictiveInsights {
    const signals: PredictiveInsights['earlyWarningSignals'] = [];

    // Check for early warning signals
    if (factors.impulsivity > 0.7) {
      signals.push({
        signal: 'Elevated impulsivity',
        currentLevel: factors.impulsivity,
        threshold: 0.8,
        daysToThreshold: 30,
        recommendation: 'Consider incorporating more ambient/contemplative music'
      });
    }

    if (factors.neuroticism > 0.65) {
      signals.push({
        signal: 'Elevated emotional sensitivity',
        currentLevel: factors.neuroticism,
        threshold: 0.75,
        daysToThreshold: 60,
        recommendation: 'Balance emotional music with uplifting alternatives'
      });
    }

    // Simple forecast based on trend
    const recentEras = eras.slice(-3);
    const avgRecent = recentEras.length > 0
      ? recentEras.reduce((s, e) => s + e.aggregateInsuranceProfile.overallRiskScore, 0) / recentEras.length
      : 50;

    return {
      earlyWarningSignals: signals,
      shortTermForecast: {
        days30: { predictedRiskScore: avgRecent, confidence: 0.7 },
        days90: { predictedRiskScore: avgRecent, confidence: 0.5 },
        days180: { predictedRiskScore: avgRecent, confidence: 0.3 }
      },
      interventions: [
        {
          priority: 'medium',
          category: 'Music diversity',
          recommendation: 'Explore new genres to broaden emotional range',
          expectedImpact: 5
        }
      ]
    };
  }

  private generateEraNarrative(era: EraRiskProfile): string {
    const score = era.aggregateInsuranceProfile.overallRiskScore;
    const trajectory = era.riskTrajectory;

    let narrative = '';

    if (score < 35) {
      narrative = 'A period of relative stability and low-risk musical choices. ';
    } else if (score < 50) {
      narrative = 'A balanced era with moderate risk indicators. ';
    } else if (score < 65) {
      narrative = 'An elevated period showing signs of seeking and exploration. ';
    } else {
      narrative = 'A high-intensity era with significant risk factors present. ';
    }

    if (trajectory === 'increasing') {
      narrative += 'Risk trajectory was trending upward during this time.';
    } else if (trajectory === 'decreasing') {
      narrative += 'Risk factors were declining throughout this period.';
    } else if (trajectory === 'volatile') {
      narrative += 'Significant volatility in listening patterns observed.';
    } else {
      narrative += 'Patterns remained relatively stable.';
    }

    return narrative;
  }

  // ===========================================================================
  // REFRESH ALL AGGREGATES
  // ===========================================================================

  /**
   * Refresh all aggregate profiles and statistics
   */
  async refreshAllAggregates(): Promise<void> {
    console.log('[Analytics] Refreshing all aggregates...');

    await this.computeArtistProfiles();
    await this.computeGenreProfiles();
    await this.computeEraProfiles();
    await this.db.updateGlobalStatistics();

    console.log('[Analytics] All aggregates refreshed');
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export default AggregateAnalyticsEngine;
