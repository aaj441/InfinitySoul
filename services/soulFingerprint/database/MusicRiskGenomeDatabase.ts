/**
 * MUSIC RISK GENOME DATABASE
 * ===========================
 *
 * "The Human Genome Project took 13 years and $3 billion to map 3 billion base pairs.
 *  We map 700,000 songs to their risk DNA - the behavioral genome of a soul."
 *
 * This is the master database architecture for pre-computed risk assessments.
 * Instead of calculating risk on every query, we store the complete risk genome
 * for every song ever listened to - creating an immutable record of behavioral
 * fingerprints derived from 21+ years of music consumption.
 *
 * Architecture Philosophy:
 * ------------------------
 * 1. PRE-COMPUTATION OVER RUNTIME: Calculate once, query infinitely
 * 2. VERSION CONTROL: Track algorithm evolution, enable re-computation
 * 3. HIERARCHICAL STORAGE: Song → Genome → RiskFactors → InsuranceProfile
 * 4. INDEXED LOOKUPS: Fast retrieval by any dimension (artist, genre, risk score)
 * 5. AGGREGATE STATISTICS: Pre-computed cohort analytics
 * 6. PORTABLE FORMAT: SQLite for single-file portability + JSON for complex data
 *
 * Storage Estimates for 700,000 songs:
 * ------------------------------------
 * - Core metadata: ~50 bytes/song = 35 MB
 * - Genome (50 attributes): ~400 bytes/song = 280 MB
 * - Risk factors (27 dimensions): ~220 bytes/song = 154 MB
 * - Insurance profile (15 fields): ~120 bytes/song = 84 MB
 * - Indexes and overhead: ~200 MB
 * - Total estimated: ~750 MB - 1 GB (manageable single file)
 *
 * @author InfinitySoul Soul Fingerprint Engine
 * @version 2.0.0 - The Bible
 */

import { MusicGenome, MusicRiskFactors, InsuranceRiskProfile, MusicGenomeAnalyzer } from '../musicGenomeRisk';

// =============================================================================
// DATABASE SCHEMA TYPES
// =============================================================================

/**
 * Algorithm version tracking - enables re-computation when formulas change
 */
export interface AlgorithmVersion {
  id: string;                          // Semantic version: "1.0.0", "1.1.0", etc.
  name: string;                        // Human readable: "Genesis", "Exodus", etc.
  description: string;                 // Changelog for this version
  genomeVersion: string;               // Version of genome attribute set
  riskMappingVersion: string;          // Version of genome-to-risk mappings
  insuranceFormulaVersion: string;     // Version of insurance calculations
  createdAt: Date;
  isActive: boolean;                   // Currently active version

  // Hash of the algorithm code for integrity verification
  algorithmHash: string;
}

/**
 * The canonical song identifier - hash of (artist + title + album)
 * This ensures deduplication across different sources
 */
export interface SongIdentifier {
  songHash: string;                    // SHA-256 of normalized (artist|title|album)
  artist: string;
  title: string;
  album: string;

  // Alternative identifiers for cross-referencing
  mbid?: string;                       // MusicBrainz ID
  spotifyId?: string;                  // Spotify track ID
  lastFmUrl?: string;                  // Last.fm URL
  isrc?: string;                       // International Standard Recording Code
}

/**
 * Audio source data - raw inputs used to compute genome
 */
export interface AudioSourceData {
  // Spotify Audio Features (if available)
  spotifyFeatures?: {
    tempo: number;
    key: number;
    mode: number;
    timeSignature: number;
    danceability: number;
    energy: number;
    valence: number;
    acousticness: number;
    instrumentalness: number;
    speechiness: number;
    liveness: number;
    loudness: number;
    duration_ms: number;
  };

  // Curated/manual attributes
  curatedAttributes?: Partial<MusicGenome>;

  // Genre tags from various sources
  tags: string[];

  // Source metadata
  sources: Array<{
    name: 'spotify' | 'lastfm' | 'musicbrainz' | 'manual' | 'inferred';
    fetchedAt: Date;
    confidence: number;                // 0-1
  }>;
}

/**
 * Listening context - how/when this song was listened to
 */
export interface ListeningContext {
  totalPlays: number;                  // Lifetime plays
  firstPlayed: Date;
  lastPlayed: Date;

  // Temporal distribution
  hourDistribution: number[];          // 24 elements, plays per hour
  dayDistribution: number[];           // 7 elements, plays per day
  monthDistribution: number[];         // 12 elements, plays per month
  yearDistribution: Record<number, number>; // Plays per year

  // Session patterns
  averageSessionPosition: number;      // 0-1, where in listening session
  followedBy: string[];                // Song hashes that typically follow
  precededBy: string[];                // Song hashes that typically precede

  // Era analysis
  listeningEras: string[];             // Era IDs where this was popular
  peakEra?: string;                    // Era with most plays
}

/**
 * Complete risk genome record for a single song
 */
export interface SongRiskGenome {
  // === IDENTIFICATION ===
  id: string;                          // UUID for this record
  identifier: SongIdentifier;

  // === RAW DATA ===
  audioSource: AudioSourceData;
  listeningContext?: ListeningContext;

  // === COMPUTED GENOME ===
  genome: MusicGenome;
  genomeConfidence: number;            // 0-1, based on data quality

  // === COMPUTED RISK FACTORS ===
  riskFactors: MusicRiskFactors;

  // === COMPUTED INSURANCE PROFILE ===
  insuranceProfile: InsuranceRiskProfile;

  // === METADATA ===
  algorithmVersion: string;            // Version used for computation
  computedAt: Date;
  lastUpdatedAt: Date;

  // === VALIDATION ===
  isValidated: boolean;                // Manually reviewed?
  validationNotes?: string;

  // === AGGREGATE CONTRIBUTION ===
  // How much this song contributes to overall risk profile
  weightedContribution: {
    totalWeight: number;               // Based on play count, recency
    riskContribution: number;          // Contribution to overall risk score
    dominantRiskFactor: keyof MusicRiskFactors;
  };
}

/**
 * Artist-level aggregated risk profile
 */
export interface ArtistRiskProfile {
  artistName: string;
  artistHash: string;                  // SHA-256 of normalized name

  // Song statistics
  songCount: number;
  totalPlays: number;
  uniqueAlbums: number;

  // Aggregated genome (weighted average)
  aggregateGenome: MusicGenome;

  // Aggregated risk factors
  aggregateRiskFactors: MusicRiskFactors;

  // Insurance profile
  aggregateInsuranceProfile: InsuranceRiskProfile;

  // Genre/style fingerprint
  primaryTags: string[];
  styleConsistency: number;            // 0-1, how consistent their style is

  // Risk volatility across their catalog
  riskVariance: number;                // Variance in risk scores across songs
  riskRange: { min: number; max: number };

  // Temporal relationship
  firstPlayed: Date;
  lastPlayed: Date;
  peakYear: number;
  loyaltyScore: number;                // 0-1, consistency of listening over time

  algorithmVersion: string;
  computedAt: Date;
}

/**
 * Genre/tag risk profile
 */
export interface GenreRiskProfile {
  tag: string;
  tagHash: string;

  // Statistics
  songCount: number;
  artistCount: number;
  totalPlays: number;

  // Aggregated risk profile
  aggregateRiskFactors: MusicRiskFactors;
  aggregateInsuranceProfile: InsuranceRiskProfile;

  // Risk characteristics
  riskVolatility: number;              // Variance within genre
  dominantRiskFactors: Array<keyof MusicRiskFactors>;

  algorithmVersion: string;
  computedAt: Date;
}

/**
 * Era risk profile - risk characteristics of a listening phase
 */
export interface EraRiskProfile {
  eraId: string;
  name: string;                        // e.g., "College Years", "Post-Grad Depression"

  startDate: Date;
  endDate: Date;
  durationDays: number;

  // Statistics
  songCount: number;
  uniqueArtists: number;
  totalPlays: number;

  // Aggregated profiles
  aggregateRiskFactors: MusicRiskFactors;
  aggregateInsuranceProfile: InsuranceRiskProfile;

  // Era characteristics
  dominantArtists: string[];
  dominantGenres: string[];
  noveltyRate: number;                 // Rate of new artist discovery
  riskTrajectory: 'increasing' | 'decreasing' | 'stable' | 'volatile';

  // Comparison to other eras
  riskDelta: number;                   // Change from previous era

  algorithmVersion: string;
  computedAt: Date;
}

/**
 * Global statistics and aggregates
 */
export interface GlobalStatistics {
  // Database metadata
  totalSongs: number;
  totalArtists: number;
  totalPlays: number;
  totalGenres: number;
  totalEras: number;

  // Date ranges
  earliestPlay: Date;
  latestPlay: Date;
  historySpanYears: number;

  // Overall risk profile
  lifetimeRiskFactors: MusicRiskFactors;
  lifetimeInsuranceProfile: InsuranceRiskProfile;

  // Risk distribution
  riskDistribution: {
    percentile10: number;
    percentile25: number;
    percentile50: number;
    percentile75: number;
    percentile90: number;
    mean: number;
    stdDev: number;
  };

  // Top risk contributors
  topRiskSongs: SongIdentifier[];      // Top 100 highest risk songs
  topMitigatingSongs: SongIdentifier[]; // Top 100 lowest risk songs

  // Algorithm info
  currentAlgorithmVersion: string;
  lastFullRecompute: Date;
  songsNeedingRecompute: number;       // Songs with old algorithm version

  computedAt: Date;
}

/**
 * Batch processing job tracking
 */
export interface BatchJob {
  id: string;
  type: 'initial_import' | 'incremental_update' | 'full_recompute' | 'algorithm_upgrade';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';

  // Progress
  totalItems: number;
  processedItems: number;
  failedItems: number;
  progress: number;                    // 0-100

  // Timing
  startedAt?: Date;
  completedAt?: Date;
  estimatedTimeRemaining?: number;     // seconds

  // Checkpointing
  lastCheckpoint?: {
    timestamp: Date;
    lastProcessedId: string;
    itemsProcessed: number;
  };

  // Error tracking
  errors: Array<{
    itemId: string;
    error: string;
    timestamp: Date;
  }>;

  // Configuration
  config: {
    batchSize: number;
    concurrency: number;
    algorithmVersion: string;
    retryOnFailure: boolean;
  };
}

// =============================================================================
// DATABASE INTERFACE
// =============================================================================

/**
 * Abstract interface for the Music Risk Genome Database
 * Can be implemented with SQLite, PostgreSQL, or any other storage
 */
export interface IMusicRiskGenomeDatabase {
  // === LIFECYCLE ===
  initialize(): Promise<void>;
  close(): Promise<void>;

  // === SONG OPERATIONS ===
  upsertSong(genome: SongRiskGenome): Promise<void>;
  upsertSongBatch(genomes: SongRiskGenome[]): Promise<{ success: number; failed: number }>;
  getSongByHash(songHash: string): Promise<SongRiskGenome | null>;
  getSongsByArtist(artist: string): Promise<SongRiskGenome[]>;
  getSongsByAlbum(artist: string, album: string): Promise<SongRiskGenome[]>;
  searchSongs(query: string, limit?: number): Promise<SongRiskGenome[]>;

  // === ARTIST OPERATIONS ===
  upsertArtistProfile(profile: ArtistRiskProfile): Promise<void>;
  getArtistProfile(artistName: string): Promise<ArtistRiskProfile | null>;
  getTopArtistsByRisk(limit?: number): Promise<ArtistRiskProfile[]>;
  getTopArtistsByPlays(limit?: number): Promise<ArtistRiskProfile[]>;

  // === GENRE OPERATIONS ===
  upsertGenreProfile(profile: GenreRiskProfile): Promise<void>;
  getGenreProfile(tag: string): Promise<GenreRiskProfile | null>;
  getAllGenreProfiles(): Promise<GenreRiskProfile[]>;

  // === ERA OPERATIONS ===
  upsertEraProfile(profile: EraRiskProfile): Promise<void>;
  getEraProfile(eraId: string): Promise<EraRiskProfile | null>;
  getAllEras(): Promise<EraRiskProfile[]>;

  // === STATISTICS ===
  getGlobalStatistics(): Promise<GlobalStatistics>;
  updateGlobalStatistics(): Promise<void>;

  // === ALGORITHM VERSION ===
  getCurrentAlgorithmVersion(): Promise<AlgorithmVersion>;
  registerAlgorithmVersion(version: AlgorithmVersion): Promise<void>;
  getSongsNeedingRecompute(targetVersion: string, limit?: number): Promise<SongRiskGenome[]>;

  // === BATCH OPERATIONS ===
  createBatchJob(job: Omit<BatchJob, 'id'>): Promise<string>;
  updateBatchJob(jobId: string, updates: Partial<BatchJob>): Promise<void>;
  getBatchJob(jobId: string): Promise<BatchJob | null>;
  getActiveBatchJobs(): Promise<BatchJob[]>;

  // === QUERYING ===
  queryByRiskScore(minScore: number, maxScore: number): Promise<SongRiskGenome[]>;
  queryByRiskFactor(factor: keyof MusicRiskFactors, minValue: number, maxValue: number): Promise<SongRiskGenome[]>;
  queryByDateRange(startDate: Date, endDate: Date): Promise<SongRiskGenome[]>;
  queryByGenome(attribute: keyof MusicGenome, minValue: number, maxValue: number): Promise<SongRiskGenome[]>;

  // === EXPORT/IMPORT ===
  exportToJson(filepath: string): Promise<void>;
  importFromJson(filepath: string): Promise<{ imported: number; skipped: number }>;
  exportStatistics(filepath: string): Promise<void>;
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

import * as crypto from 'crypto';

/**
 * Generate a canonical hash for a song
 */
export function generateSongHash(artist: string, title: string, album: string): string {
  const normalized = [
    artist.toLowerCase().trim(),
    title.toLowerCase().trim(),
    album.toLowerCase().trim()
  ].join('|');

  return crypto.createHash('sha256').update(normalized).digest('hex');
}

/**
 * Generate a hash for an artist
 */
export function generateArtistHash(artist: string): string {
  const normalized = artist.toLowerCase().trim();
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

/**
 * Generate a hash for a tag/genre
 */
export function generateTagHash(tag: string): string {
  const normalized = tag.toLowerCase().trim();
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

/**
 * Generate a hash of the algorithm code for version tracking
 */
export function generateAlgorithmHash(): string {
  // This would hash the actual algorithm code in production
  // For now, return a placeholder based on current date
  const code = JSON.stringify({
    genomeAttributes: 50,
    riskFactors: 27,
    insuranceCategories: 7,
    mappingRules: 14 // Number of GENOME_TO_RISK_MAPPINGS
  });

  return crypto.createHash('sha256').update(code).digest('hex').substring(0, 16);
}

/**
 * Calculate weighted average of genomes
 */
export function calculateWeightedGenomeAverage(
  genomes: Array<{ genome: MusicGenome; weight: number }>
): MusicGenome {
  const totalWeight = genomes.reduce((sum, g) => sum + g.weight, 0);
  if (totalWeight === 0) {
    throw new Error('Total weight cannot be zero');
  }

  const result: Partial<MusicGenome> = {};

  // Get all numeric keys from the first genome
  const sampleGenome = genomes[0].genome;
  const numericKeys = Object.keys(sampleGenome).filter(
    key => typeof sampleGenome[key as keyof MusicGenome] === 'number'
  ) as Array<keyof MusicGenome>;

  for (const key of numericKeys) {
    let weightedSum = 0;
    for (const { genome, weight } of genomes) {
      weightedSum += (genome[key] as number) * weight;
    }
    (result as any)[key] = weightedSum / totalWeight;
  }

  // Handle non-numeric fields with mode
  result.key = genomes[0].genome.key;
  result.mode = genomes[0].genome.mode;
  result.melodicContour = genomes[0].genome.melodicContour;
  result.vocalStyle = genomes[0].genome.vocalStyle;
  result.productionEra = genomes[0].genome.productionEra;

  return result as MusicGenome;
}

/**
 * Calculate weighted average of risk factors
 */
export function calculateWeightedRiskFactorAverage(
  factors: Array<{ factors: MusicRiskFactors; weight: number }>
): MusicRiskFactors {
  const totalWeight = factors.reduce((sum, f) => sum + f.weight, 0);
  if (totalWeight === 0) {
    throw new Error('Total weight cannot be zero');
  }

  const result: Partial<MusicRiskFactors> = {};
  const sampleFactors = factors[0].factors;

  for (const key of Object.keys(sampleFactors) as Array<keyof MusicRiskFactors>) {
    let weightedSum = 0;
    for (const { factors: f, weight } of factors) {
      weightedSum += f[key] * weight;
    }
    result[key] = weightedSum / totalWeight;
  }

  return result as MusicRiskFactors;
}

/**
 * Calculate risk score from insurance profile
 */
export function calculateOverallRiskScore(profile: InsuranceRiskProfile): number {
  return profile.overallRiskScore;
}

/**
 * Determine dominant risk factor
 */
export function getDominantRiskFactor(factors: MusicRiskFactors): keyof MusicRiskFactors {
  let maxFactor: keyof MusicRiskFactors = 'impulsivity';
  let maxValue = 0;

  const riskRelevantFactors: Array<keyof MusicRiskFactors> = [
    'impulsivity', 'sensationSeeking', 'riskTolerance', 'neuroticism',
    'anxietyProneness', 'depressionVulnerability'
  ];

  for (const factor of riskRelevantFactors) {
    if (factors[factor] > maxValue) {
      maxValue = factors[factor];
      maxFactor = factor;
    }
  }

  return maxFactor;
}

// =============================================================================
// ALGORITHM VERSION REGISTRY
// =============================================================================

export const ALGORITHM_VERSIONS: AlgorithmVersion[] = [
  {
    id: '1.0.0',
    name: 'Genesis',
    description: 'Initial release - 50 genome attributes, 27 risk factors, 7 insurance categories',
    genomeVersion: '1.0.0',
    riskMappingVersion: '1.0.0',
    insuranceFormulaVersion: '1.0.0',
    createdAt: new Date('2024-01-01'),
    isActive: false,
    algorithmHash: generateAlgorithmHash()
  },
  {
    id: '2.0.0',
    name: 'Exodus',
    description: 'Major update - Mortality salience paradox, transcendence orientation refinement',
    genomeVersion: '2.0.0',
    riskMappingVersion: '2.0.0',
    insuranceFormulaVersion: '1.1.0',
    createdAt: new Date('2024-06-01'),
    isActive: false,
    algorithmHash: generateAlgorithmHash()
  },
  {
    id: '2.1.0',
    name: 'Leviticus',
    description: 'Refinements - Nostalgia affinity calibration, production era weighting',
    genomeVersion: '2.0.0',
    riskMappingVersion: '2.1.0',
    insuranceFormulaVersion: '1.1.0',
    createdAt: new Date('2024-09-01'),
    isActive: true,
    algorithmHash: generateAlgorithmHash()
  }
];

export const CURRENT_ALGORITHM_VERSION = ALGORITHM_VERSIONS.find(v => v.isActive) || ALGORITHM_VERSIONS[ALGORITHM_VERSIONS.length - 1];

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  generateSongHash,
  generateArtistHash,
  generateTagHash,
  generateAlgorithmHash,
  calculateWeightedGenomeAverage,
  calculateWeightedRiskFactorAverage,
  calculateOverallRiskScore,
  getDominantRiskFactor,
  ALGORITHM_VERSIONS,
  CURRENT_ALGORITHM_VERSION
};
