/**
 * MUSIC RISK GENOME DATABASE
 * ===========================
 *
 * "The Human Genome Project for behavioral risk assessment."
 *
 * This is the master index for the Music Risk Genome Database system.
 * 700,000 songs. 21 years of listening history. Pre-computed risk DNA.
 *
 * Architecture:
 * -------------
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │                    MUSIC RISK GENOME DATABASE                       │
 * ├─────────────────────────────────────────────────────────────────────┤
 * │                                                                     │
 * │  ┌─────────────┐    ┌──────────────────┐    ┌───────────────────┐  │
 * │  │   Last.fm   │───▶│  Batch Processor │───▶│  SQLite Database  │  │
 * │  │   Spotify   │    │  (700K songs)    │    │  (Pre-computed)   │  │
 * │  └─────────────┘    └──────────────────┘    └───────────────────┘  │
 * │                                                       │            │
 * │                                                       ▼            │
 * │                                            ┌───────────────────┐  │
 * │                                            │  Analytics Engine │  │
 * │                                            │  (Aggregates)     │  │
 * │                                            └───────────────────┘  │
 * │                                                       │            │
 * │                                                       ▼            │
 * │  ┌─────────────┐    ┌──────────────────┐    ┌───────────────────┐  │
 * │  │   CLI/API   │◀───│  Query Interface │◀───│  Risk Profiles    │  │
 * │  └─────────────┘    └──────────────────┘    └───────────────────┘  │
 * │                                                                     │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * Quick Start:
 * ------------
 * ```typescript
 * import { createMusicRiskDatabase, BatchProcessingEngine, AggregateAnalyticsEngine } from './database';
 *
 * // Initialize database
 * const db = createMusicRiskDatabase('./my-music-genome.db');
 * await db.initialize();
 *
 * // Process listening history
 * const processor = new BatchProcessingEngine(db);
 * await processor.processListeningHistory(history);
 *
 * // Generate analytics
 * const analytics = new AggregateAnalyticsEngine(db);
 * const report = await analytics.generateFullReport();
 *
 * // Query specific songs
 * const song = await db.getSongByHash(songHash);
 * console.log(song.insuranceProfile.overallRiskScore);
 * ```
 *
 * Storage Format:
 * ---------------
 * - SQLite database (single portable file)
 * - JSON blobs for complex nested data
 * - Full-text search for song queries
 * - Indexed by artist, album, risk score, algorithm version
 *
 * Estimated Size for 700K songs: ~750MB - 1GB
 *
 * @author InfinitySoul Soul Fingerprint Engine
 * @version 2.0.0 - The Bible
 */

// =============================================================================
// DATABASE TYPES AND INTERFACES
// =============================================================================

export {
  // Core types
  AlgorithmVersion,
  SongIdentifier,
  AudioSourceData,
  ListeningContext,
  SongRiskGenome,
  ArtistRiskProfile,
  GenreRiskProfile,
  EraRiskProfile,
  GlobalStatistics,
  BatchJob,

  // Database interface
  IMusicRiskGenomeDatabase,

  // Utility functions
  generateSongHash,
  generateArtistHash,
  generateTagHash,
  generateAlgorithmHash,
  calculateWeightedGenomeAverage,
  calculateWeightedRiskFactorAverage,
  calculateOverallRiskScore,
  getDominantRiskFactor,

  // Algorithm versioning
  ALGORITHM_VERSIONS,
  CURRENT_ALGORITHM_VERSION
} from './MusicRiskGenomeDatabase';

// =============================================================================
// DATABASE IMPLEMENTATION
// =============================================================================

export {
  SQLiteRiskGenomeRepository,
  createMusicRiskDatabase
} from './SQLiteRiskGenomeRepository';

// =============================================================================
// BATCH PROCESSING
// =============================================================================

export {
  BatchProcessingEngine,
  BatchConfig,
  DEFAULT_BATCH_CONFIG,
  ProcessingProgress
} from './BatchProcessingEngine';

// =============================================================================
// ANALYTICS
// =============================================================================

export {
  AggregateAnalyticsEngine,
  AnalyticsReport,
  RiskTrajectory,
  CohortComparison,
  GenreRiskMatrix,
  PredictiveInsights
} from './AggregateAnalytics';

// =============================================================================
// RE-EXPORT CORE TYPES
// =============================================================================

export {
  MusicGenome,
  MusicRiskFactors,
  InsuranceRiskProfile,
  MusicGenomeAnalyzer,
  GENOME_TO_RISK_MAPPINGS
} from '../musicGenomeRisk';

export {
  LastFmClient,
  LastFmDataProcessor,
  ListeningHistory,
  ProcessedScrobble,
  ArtistProfile,
  TemporalPattern,
  ListeningEra
} from '../lastFmIntegration';

// =============================================================================
// CONVENIENCE FACTORY
// =============================================================================

import { createMusicRiskDatabase } from './SQLiteRiskGenomeRepository';
import { BatchProcessingEngine, BatchConfig, DEFAULT_BATCH_CONFIG } from './BatchProcessingEngine';
import { AggregateAnalyticsEngine } from './AggregateAnalytics';
import { CURRENT_ALGORITHM_VERSION } from './MusicRiskGenomeDatabase';

/**
 * Create a complete Music Risk Genome system with database, processor, and analytics
 */
export async function createMusicRiskGenomeSystem(config: {
  dbPath?: string;
  batchConfig?: Partial<BatchConfig>;
} = {}) {
  const db = createMusicRiskDatabase(config.dbPath);
  await db.initialize();

  const processor = new BatchProcessingEngine(db, config.batchConfig);
  const analytics = new AggregateAnalyticsEngine(db);

  return {
    db,
    processor,
    analytics,
    algorithmVersion: CURRENT_ALGORITHM_VERSION,

    /**
     * Process a complete listening history
     */
    async processHistory(history: import('../lastFmIntegration').ListeningHistory) {
      return processor.processListeningHistory(history);
    },

    /**
     * Generate a full analytics report
     */
    async generateReport() {
      return analytics.generateFullReport();
    },

    /**
     * Get database statistics
     */
    async getStats() {
      return db.getGlobalStatistics();
    },

    /**
     * Search for songs
     */
    async searchSongs(query: string, limit?: number) {
      return db.searchSongs(query, limit);
    },

    /**
     * Get artist risk profile
     */
    async getArtist(name: string) {
      return db.getArtistProfile(name);
    },

    /**
     * Close the database connection
     */
    async close() {
      return db.close();
    }
  };
}

// =============================================================================
// DEFAULT EXPORT
// =============================================================================

export default {
  createMusicRiskDatabase,
  createMusicRiskGenomeSystem,
  BatchProcessingEngine,
  AggregateAnalyticsEngine,
  CURRENT_ALGORITHM_VERSION,
  DEFAULT_BATCH_CONFIG
};
