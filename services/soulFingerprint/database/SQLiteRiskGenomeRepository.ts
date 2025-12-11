/**
 * SQLITE RISK GENOME REPOSITORY
 * ==============================
 *
 * "A 700,000-song Bible, portable in a single file."
 *
 * This is the SQLite implementation of the Music Risk Genome Database.
 * SQLite was chosen for:
 * - Portability: Single file, no server needed
 * - Performance: Excellent for read-heavy workloads
 * - ACID compliance: Data integrity guaranteed
 * - Size handling: Can handle databases up to 281 TB
 *
 * For 700,000 songs, expect ~750MB-1GB database file.
 *
 * @author InfinitySoul Soul Fingerprint Engine
 * @version 2.0.0
 */

import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';
import {
  IMusicRiskGenomeDatabase,
  SongRiskGenome,
  ArtistRiskProfile,
  GenreRiskProfile,
  EraRiskProfile,
  GlobalStatistics,
  AlgorithmVersion,
  BatchJob,
  SongIdentifier,
  CURRENT_ALGORITHM_VERSION,
  ALGORITHM_VERSIONS,
  generateSongHash,
  generateArtistHash,
  generateTagHash,
  calculateOverallRiskScore,
  getDominantRiskFactor
} from './MusicRiskGenomeDatabase';
import { MusicGenome, MusicRiskFactors, InsuranceRiskProfile } from '../musicGenomeRisk';

// =============================================================================
// SQLITE IMPLEMENTATION
// =============================================================================

export class SQLiteRiskGenomeRepository implements IMusicRiskGenomeDatabase {
  private db: Database.Database | null = null;
  private dbPath: string;
  private isInitialized = false;

  constructor(dbPath: string) {
    this.dbPath = dbPath;
  }

  // ===========================================================================
  // LIFECYCLE
  // ===========================================================================

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Ensure directory exists
    const dir = path.dirname(this.dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Open database with WAL mode for better concurrent performance
    this.db = new Database(this.dbPath);
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('synchronous = NORMAL');
    this.db.pragma('foreign_keys = ON');

    // Create schema
    this.createSchema();

    // Seed algorithm versions
    this.seedAlgorithmVersions();

    this.isInitialized = true;
    console.log(`[MusicRiskDB] Initialized at ${this.dbPath}`);
  }

  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.isInitialized = false;
    }
  }

  private ensureDb(): Database.Database {
    if (!this.db) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return this.db;
  }

  // ===========================================================================
  // SCHEMA CREATION
  // ===========================================================================

  private createSchema(): void {
    const db = this.ensureDb();

    // Algorithm versions table
    db.exec(`
      CREATE TABLE IF NOT EXISTS algorithm_versions (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        genome_version TEXT NOT NULL,
        risk_mapping_version TEXT NOT NULL,
        insurance_formula_version TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        is_active INTEGER NOT NULL DEFAULT 0,
        algorithm_hash TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_algo_active ON algorithm_versions(is_active);
    `);

    // Songs table - the core of the Bible
    db.exec(`
      CREATE TABLE IF NOT EXISTS songs (
        id TEXT PRIMARY KEY,
        song_hash TEXT UNIQUE NOT NULL,
        artist TEXT NOT NULL,
        title TEXT NOT NULL,
        album TEXT NOT NULL,

        -- Alternative identifiers
        mbid TEXT,
        spotify_id TEXT,
        lastfm_url TEXT,
        isrc TEXT,

        -- Audio source data (JSON)
        audio_source TEXT NOT NULL,

        -- Listening context (JSON, optional)
        listening_context TEXT,

        -- Computed genome (JSON)
        genome TEXT NOT NULL,
        genome_confidence REAL NOT NULL DEFAULT 0.5,

        -- Computed risk factors (JSON)
        risk_factors TEXT NOT NULL,

        -- Computed insurance profile (JSON)
        insurance_profile TEXT NOT NULL,

        -- Metadata
        algorithm_version TEXT NOT NULL,
        computed_at INTEGER NOT NULL,
        last_updated_at INTEGER NOT NULL,

        -- Validation
        is_validated INTEGER NOT NULL DEFAULT 0,
        validation_notes TEXT,

        -- Aggregate contribution (JSON)
        weighted_contribution TEXT NOT NULL,

        -- Denormalized for indexing
        overall_risk_score REAL NOT NULL,
        total_plays INTEGER NOT NULL DEFAULT 0,

        FOREIGN KEY (algorithm_version) REFERENCES algorithm_versions(id)
      );

      -- Indexes for fast lookups
      CREATE INDEX IF NOT EXISTS idx_songs_hash ON songs(song_hash);
      CREATE INDEX IF NOT EXISTS idx_songs_artist ON songs(artist COLLATE NOCASE);
      CREATE INDEX IF NOT EXISTS idx_songs_title ON songs(title COLLATE NOCASE);
      CREATE INDEX IF NOT EXISTS idx_songs_album ON songs(album COLLATE NOCASE);
      CREATE INDEX IF NOT EXISTS idx_songs_risk_score ON songs(overall_risk_score);
      CREATE INDEX IF NOT EXISTS idx_songs_plays ON songs(total_plays DESC);
      CREATE INDEX IF NOT EXISTS idx_songs_algorithm ON songs(algorithm_version);
      CREATE INDEX IF NOT EXISTS idx_songs_computed ON songs(computed_at);
      CREATE INDEX IF NOT EXISTS idx_songs_spotify ON songs(spotify_id);
      CREATE INDEX IF NOT EXISTS idx_songs_mbid ON songs(mbid);

      -- Full-text search for songs
      CREATE VIRTUAL TABLE IF NOT EXISTS songs_fts USING fts5(
        artist, title, album,
        content='songs',
        content_rowid='rowid'
      );

      -- Triggers to keep FTS in sync
      CREATE TRIGGER IF NOT EXISTS songs_ai AFTER INSERT ON songs BEGIN
        INSERT INTO songs_fts(rowid, artist, title, album)
        VALUES (NEW.rowid, NEW.artist, NEW.title, NEW.album);
      END;

      CREATE TRIGGER IF NOT EXISTS songs_ad AFTER DELETE ON songs BEGIN
        INSERT INTO songs_fts(songs_fts, rowid, artist, title, album)
        VALUES ('delete', OLD.rowid, OLD.artist, OLD.title, OLD.album);
      END;

      CREATE TRIGGER IF NOT EXISTS songs_au AFTER UPDATE ON songs BEGIN
        INSERT INTO songs_fts(songs_fts, rowid, artist, title, album)
        VALUES ('delete', OLD.rowid, OLD.artist, OLD.title, OLD.album);
        INSERT INTO songs_fts(rowid, artist, title, album)
        VALUES (NEW.rowid, NEW.artist, NEW.title, NEW.album);
      END;
    `);

    // Artists table
    db.exec(`
      CREATE TABLE IF NOT EXISTS artists (
        artist_hash TEXT PRIMARY KEY,
        artist_name TEXT NOT NULL,

        -- Statistics
        song_count INTEGER NOT NULL DEFAULT 0,
        total_plays INTEGER NOT NULL DEFAULT 0,
        unique_albums INTEGER NOT NULL DEFAULT 0,

        -- Aggregates (JSON)
        aggregate_genome TEXT NOT NULL,
        aggregate_risk_factors TEXT NOT NULL,
        aggregate_insurance_profile TEXT NOT NULL,

        -- Genre fingerprint (JSON)
        primary_tags TEXT NOT NULL,
        style_consistency REAL NOT NULL DEFAULT 0.5,

        -- Risk metrics
        risk_variance REAL NOT NULL DEFAULT 0,
        risk_min REAL NOT NULL DEFAULT 0,
        risk_max REAL NOT NULL DEFAULT 100,
        overall_risk_score REAL NOT NULL DEFAULT 50,

        -- Temporal
        first_played INTEGER,
        last_played INTEGER,
        peak_year INTEGER,
        loyalty_score REAL NOT NULL DEFAULT 0.5,

        -- Metadata
        algorithm_version TEXT NOT NULL,
        computed_at INTEGER NOT NULL,

        FOREIGN KEY (algorithm_version) REFERENCES algorithm_versions(id)
      );

      CREATE INDEX IF NOT EXISTS idx_artists_name ON artists(artist_name COLLATE NOCASE);
      CREATE INDEX IF NOT EXISTS idx_artists_risk ON artists(overall_risk_score);
      CREATE INDEX IF NOT EXISTS idx_artists_plays ON artists(total_plays DESC);
    `);

    // Genres/Tags table
    db.exec(`
      CREATE TABLE IF NOT EXISTS genres (
        tag_hash TEXT PRIMARY KEY,
        tag TEXT NOT NULL,

        -- Statistics
        song_count INTEGER NOT NULL DEFAULT 0,
        artist_count INTEGER NOT NULL DEFAULT 0,
        total_plays INTEGER NOT NULL DEFAULT 0,

        -- Aggregates (JSON)
        aggregate_risk_factors TEXT NOT NULL,
        aggregate_insurance_profile TEXT NOT NULL,

        -- Risk characteristics
        risk_volatility REAL NOT NULL DEFAULT 0,
        dominant_risk_factors TEXT NOT NULL,
        overall_risk_score REAL NOT NULL DEFAULT 50,

        -- Metadata
        algorithm_version TEXT NOT NULL,
        computed_at INTEGER NOT NULL,

        FOREIGN KEY (algorithm_version) REFERENCES algorithm_versions(id)
      );

      CREATE INDEX IF NOT EXISTS idx_genres_tag ON genres(tag COLLATE NOCASE);
      CREATE INDEX IF NOT EXISTS idx_genres_risk ON genres(overall_risk_score);
    `);

    // Eras table
    db.exec(`
      CREATE TABLE IF NOT EXISTS eras (
        era_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,

        -- Temporal bounds
        start_date INTEGER NOT NULL,
        end_date INTEGER NOT NULL,
        duration_days INTEGER NOT NULL,

        -- Statistics
        song_count INTEGER NOT NULL DEFAULT 0,
        unique_artists INTEGER NOT NULL DEFAULT 0,
        total_plays INTEGER NOT NULL DEFAULT 0,

        -- Aggregates (JSON)
        aggregate_risk_factors TEXT NOT NULL,
        aggregate_insurance_profile TEXT NOT NULL,

        -- Characteristics (JSON)
        dominant_artists TEXT NOT NULL,
        dominant_genres TEXT NOT NULL,
        novelty_rate REAL NOT NULL DEFAULT 0.5,
        risk_trajectory TEXT NOT NULL DEFAULT 'stable',
        risk_delta REAL NOT NULL DEFAULT 0,
        overall_risk_score REAL NOT NULL DEFAULT 50,

        -- Metadata
        algorithm_version TEXT NOT NULL,
        computed_at INTEGER NOT NULL,

        FOREIGN KEY (algorithm_version) REFERENCES algorithm_versions(id)
      );

      CREATE INDEX IF NOT EXISTS idx_eras_date ON eras(start_date);
      CREATE INDEX IF NOT EXISTS idx_eras_risk ON eras(overall_risk_score);
    `);

    // Global statistics table (singleton)
    db.exec(`
      CREATE TABLE IF NOT EXISTS global_statistics (
        id INTEGER PRIMARY KEY CHECK (id = 1),

        -- Counts
        total_songs INTEGER NOT NULL DEFAULT 0,
        total_artists INTEGER NOT NULL DEFAULT 0,
        total_plays INTEGER NOT NULL DEFAULT 0,
        total_genres INTEGER NOT NULL DEFAULT 0,
        total_eras INTEGER NOT NULL DEFAULT 0,

        -- Date range
        earliest_play INTEGER,
        latest_play INTEGER,
        history_span_years REAL NOT NULL DEFAULT 0,

        -- Aggregates (JSON)
        lifetime_risk_factors TEXT,
        lifetime_insurance_profile TEXT,

        -- Distribution (JSON)
        risk_distribution TEXT,

        -- Top contributors (JSON)
        top_risk_songs TEXT,
        top_mitigating_songs TEXT,

        -- Algorithm info
        current_algorithm_version TEXT,
        last_full_recompute INTEGER,
        songs_needing_recompute INTEGER NOT NULL DEFAULT 0,

        computed_at INTEGER NOT NULL
      );

      -- Ensure only one row exists
      INSERT OR IGNORE INTO global_statistics (id, computed_at)
      VALUES (1, ${Date.now()});
    `);

    // Batch jobs table
    db.exec(`
      CREATE TABLE IF NOT EXISTS batch_jobs (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',

        -- Progress
        total_items INTEGER NOT NULL DEFAULT 0,
        processed_items INTEGER NOT NULL DEFAULT 0,
        failed_items INTEGER NOT NULL DEFAULT 0,

        -- Timing
        started_at INTEGER,
        completed_at INTEGER,

        -- Checkpoint (JSON)
        last_checkpoint TEXT,

        -- Errors (JSON)
        errors TEXT,

        -- Config (JSON)
        config TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_jobs_status ON batch_jobs(status);
      CREATE INDEX IF NOT EXISTS idx_jobs_type ON batch_jobs(type);
    `);

    // Song-Tag junction table for many-to-many
    db.exec(`
      CREATE TABLE IF NOT EXISTS song_tags (
        song_hash TEXT NOT NULL,
        tag_hash TEXT NOT NULL,
        confidence REAL NOT NULL DEFAULT 1.0,
        PRIMARY KEY (song_hash, tag_hash),
        FOREIGN KEY (song_hash) REFERENCES songs(song_hash),
        FOREIGN KEY (tag_hash) REFERENCES genres(tag_hash)
      );

      CREATE INDEX IF NOT EXISTS idx_song_tags_song ON song_tags(song_hash);
      CREATE INDEX IF NOT EXISTS idx_song_tags_tag ON song_tags(tag_hash);
    `);

    console.log('[MusicRiskDB] Schema created successfully');
  }

  private seedAlgorithmVersions(): void {
    const db = this.ensureDb();
    const stmt = db.prepare(`
      INSERT OR IGNORE INTO algorithm_versions
      (id, name, description, genome_version, risk_mapping_version, insurance_formula_version, created_at, is_active, algorithm_hash)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const version of ALGORITHM_VERSIONS) {
      stmt.run(
        version.id,
        version.name,
        version.description,
        version.genomeVersion,
        version.riskMappingVersion,
        version.insuranceFormulaVersion,
        version.createdAt.getTime(),
        version.isActive ? 1 : 0,
        version.algorithmHash
      );
    }
  }

  // ===========================================================================
  // SONG OPERATIONS
  // ===========================================================================

  async upsertSong(genome: SongRiskGenome): Promise<void> {
    const db = this.ensureDb();

    const stmt = db.prepare(`
      INSERT INTO songs (
        id, song_hash, artist, title, album,
        mbid, spotify_id, lastfm_url, isrc,
        audio_source, listening_context,
        genome, genome_confidence,
        risk_factors, insurance_profile,
        algorithm_version, computed_at, last_updated_at,
        is_validated, validation_notes,
        weighted_contribution, overall_risk_score, total_plays
      ) VALUES (
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?,
        ?, ?,
        ?, ?,
        ?, ?, ?,
        ?, ?,
        ?, ?, ?
      )
      ON CONFLICT(song_hash) DO UPDATE SET
        audio_source = excluded.audio_source,
        listening_context = excluded.listening_context,
        genome = excluded.genome,
        genome_confidence = excluded.genome_confidence,
        risk_factors = excluded.risk_factors,
        insurance_profile = excluded.insurance_profile,
        algorithm_version = excluded.algorithm_version,
        last_updated_at = excluded.last_updated_at,
        weighted_contribution = excluded.weighted_contribution,
        overall_risk_score = excluded.overall_risk_score,
        total_plays = excluded.total_plays
    `);

    stmt.run(
      genome.id,
      genome.identifier.songHash,
      genome.identifier.artist,
      genome.identifier.title,
      genome.identifier.album,
      genome.identifier.mbid || null,
      genome.identifier.spotifyId || null,
      genome.identifier.lastFmUrl || null,
      genome.identifier.isrc || null,
      JSON.stringify(genome.audioSource),
      genome.listeningContext ? JSON.stringify(genome.listeningContext) : null,
      JSON.stringify(genome.genome),
      genome.genomeConfidence,
      JSON.stringify(genome.riskFactors),
      JSON.stringify(genome.insuranceProfile),
      genome.algorithmVersion,
      genome.computedAt.getTime(),
      genome.lastUpdatedAt.getTime(),
      genome.isValidated ? 1 : 0,
      genome.validationNotes || null,
      JSON.stringify(genome.weightedContribution),
      genome.insuranceProfile.overallRiskScore,
      genome.listeningContext?.totalPlays || 0
    );
  }

  async upsertSongBatch(genomes: SongRiskGenome[]): Promise<{ success: number; failed: number }> {
    const db = this.ensureDb();
    let success = 0;
    let failed = 0;

    const transaction = db.transaction((items: SongRiskGenome[]) => {
      for (const genome of items) {
        try {
          const stmt = db.prepare(`
            INSERT INTO songs (
              id, song_hash, artist, title, album,
              mbid, spotify_id, lastfm_url, isrc,
              audio_source, listening_context,
              genome, genome_confidence,
              risk_factors, insurance_profile,
              algorithm_version, computed_at, last_updated_at,
              is_validated, validation_notes,
              weighted_contribution, overall_risk_score, total_plays
            ) VALUES (
              ?, ?, ?, ?, ?,
              ?, ?, ?, ?,
              ?, ?,
              ?, ?,
              ?, ?,
              ?, ?, ?,
              ?, ?,
              ?, ?, ?
            )
            ON CONFLICT(song_hash) DO UPDATE SET
              audio_source = excluded.audio_source,
              listening_context = excluded.listening_context,
              genome = excluded.genome,
              genome_confidence = excluded.genome_confidence,
              risk_factors = excluded.risk_factors,
              insurance_profile = excluded.insurance_profile,
              algorithm_version = excluded.algorithm_version,
              last_updated_at = excluded.last_updated_at,
              weighted_contribution = excluded.weighted_contribution,
              overall_risk_score = excluded.overall_risk_score,
              total_plays = excluded.total_plays
          `);

          stmt.run(
            genome.id,
            genome.identifier.songHash,
            genome.identifier.artist,
            genome.identifier.title,
            genome.identifier.album,
            genome.identifier.mbid || null,
            genome.identifier.spotifyId || null,
            genome.identifier.lastFmUrl || null,
            genome.identifier.isrc || null,
            JSON.stringify(genome.audioSource),
            genome.listeningContext ? JSON.stringify(genome.listeningContext) : null,
            JSON.stringify(genome.genome),
            genome.genomeConfidence,
            JSON.stringify(genome.riskFactors),
            JSON.stringify(genome.insuranceProfile),
            genome.algorithmVersion,
            genome.computedAt.getTime(),
            genome.lastUpdatedAt.getTime(),
            genome.isValidated ? 1 : 0,
            genome.validationNotes || null,
            JSON.stringify(genome.weightedContribution),
            genome.insuranceProfile.overallRiskScore,
            genome.listeningContext?.totalPlays || 0
          );
          success++;
        } catch (error) {
          console.error(`Failed to insert song: ${genome.identifier.title}`, error);
          failed++;
        }
      }
    });

    transaction(genomes);
    return { success, failed };
  }

  async getSongByHash(songHash: string): Promise<SongRiskGenome | null> {
    const db = this.ensureDb();
    const row = db.prepare('SELECT * FROM songs WHERE song_hash = ?').get(songHash) as any;

    if (!row) return null;
    return this.rowToSongGenome(row);
  }

  async getSongsByArtist(artist: string): Promise<SongRiskGenome[]> {
    const db = this.ensureDb();
    const rows = db.prepare('SELECT * FROM songs WHERE artist = ? COLLATE NOCASE ORDER BY total_plays DESC').all(artist) as any[];
    return rows.map(row => this.rowToSongGenome(row));
  }

  async getSongsByAlbum(artist: string, album: string): Promise<SongRiskGenome[]> {
    const db = this.ensureDb();
    const rows = db.prepare('SELECT * FROM songs WHERE artist = ? COLLATE NOCASE AND album = ? COLLATE NOCASE ORDER BY total_plays DESC').all(artist, album) as any[];
    return rows.map(row => this.rowToSongGenome(row));
  }

  async searchSongs(query: string, limit: number = 100): Promise<SongRiskGenome[]> {
    const db = this.ensureDb();
    const rows = db.prepare(`
      SELECT songs.* FROM songs
      JOIN songs_fts ON songs.rowid = songs_fts.rowid
      WHERE songs_fts MATCH ?
      ORDER BY rank
      LIMIT ?
    `).all(query, limit) as any[];

    return rows.map(row => this.rowToSongGenome(row));
  }

  private rowToSongGenome(row: any): SongRiskGenome {
    return {
      id: row.id,
      identifier: {
        songHash: row.song_hash,
        artist: row.artist,
        title: row.title,
        album: row.album,
        mbid: row.mbid || undefined,
        spotifyId: row.spotify_id || undefined,
        lastFmUrl: row.lastfm_url || undefined,
        isrc: row.isrc || undefined
      },
      audioSource: JSON.parse(row.audio_source),
      listeningContext: row.listening_context ? JSON.parse(row.listening_context) : undefined,
      genome: JSON.parse(row.genome),
      genomeConfidence: row.genome_confidence,
      riskFactors: JSON.parse(row.risk_factors),
      insuranceProfile: JSON.parse(row.insurance_profile),
      algorithmVersion: row.algorithm_version,
      computedAt: new Date(row.computed_at),
      lastUpdatedAt: new Date(row.last_updated_at),
      isValidated: row.is_validated === 1,
      validationNotes: row.validation_notes || undefined,
      weightedContribution: JSON.parse(row.weighted_contribution)
    };
  }

  // ===========================================================================
  // ARTIST OPERATIONS
  // ===========================================================================

  async upsertArtistProfile(profile: ArtistRiskProfile): Promise<void> {
    const db = this.ensureDb();

    const stmt = db.prepare(`
      INSERT INTO artists (
        artist_hash, artist_name,
        song_count, total_plays, unique_albums,
        aggregate_genome, aggregate_risk_factors, aggregate_insurance_profile,
        primary_tags, style_consistency,
        risk_variance, risk_min, risk_max, overall_risk_score,
        first_played, last_played, peak_year, loyalty_score,
        algorithm_version, computed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(artist_hash) DO UPDATE SET
        song_count = excluded.song_count,
        total_plays = excluded.total_plays,
        unique_albums = excluded.unique_albums,
        aggregate_genome = excluded.aggregate_genome,
        aggregate_risk_factors = excluded.aggregate_risk_factors,
        aggregate_insurance_profile = excluded.aggregate_insurance_profile,
        primary_tags = excluded.primary_tags,
        style_consistency = excluded.style_consistency,
        risk_variance = excluded.risk_variance,
        risk_min = excluded.risk_min,
        risk_max = excluded.risk_max,
        overall_risk_score = excluded.overall_risk_score,
        first_played = excluded.first_played,
        last_played = excluded.last_played,
        peak_year = excluded.peak_year,
        loyalty_score = excluded.loyalty_score,
        algorithm_version = excluded.algorithm_version,
        computed_at = excluded.computed_at
    `);

    stmt.run(
      profile.artistHash,
      profile.artistName,
      profile.songCount,
      profile.totalPlays,
      profile.uniqueAlbums,
      JSON.stringify(profile.aggregateGenome),
      JSON.stringify(profile.aggregateRiskFactors),
      JSON.stringify(profile.aggregateInsuranceProfile),
      JSON.stringify(profile.primaryTags),
      profile.styleConsistency,
      profile.riskVariance,
      profile.riskRange.min,
      profile.riskRange.max,
      profile.aggregateInsuranceProfile.overallRiskScore,
      profile.firstPlayed.getTime(),
      profile.lastPlayed.getTime(),
      profile.peakYear,
      profile.loyaltyScore,
      profile.algorithmVersion,
      profile.computedAt.getTime()
    );
  }

  async getArtistProfile(artistName: string): Promise<ArtistRiskProfile | null> {
    const db = this.ensureDb();
    const row = db.prepare('SELECT * FROM artists WHERE artist_name = ? COLLATE NOCASE').get(artistName) as any;

    if (!row) return null;
    return this.rowToArtistProfile(row);
  }

  async getTopArtistsByRisk(limit: number = 50): Promise<ArtistRiskProfile[]> {
    const db = this.ensureDb();
    const rows = db.prepare('SELECT * FROM artists ORDER BY overall_risk_score DESC LIMIT ?').all(limit) as any[];
    return rows.map(row => this.rowToArtistProfile(row));
  }

  async getTopArtistsByPlays(limit: number = 50): Promise<ArtistRiskProfile[]> {
    const db = this.ensureDb();
    const rows = db.prepare('SELECT * FROM artists ORDER BY total_plays DESC LIMIT ?').all(limit) as any[];
    return rows.map(row => this.rowToArtistProfile(row));
  }

  private rowToArtistProfile(row: any): ArtistRiskProfile {
    return {
      artistHash: row.artist_hash,
      artistName: row.artist_name,
      songCount: row.song_count,
      totalPlays: row.total_plays,
      uniqueAlbums: row.unique_albums,
      aggregateGenome: JSON.parse(row.aggregate_genome),
      aggregateRiskFactors: JSON.parse(row.aggregate_risk_factors),
      aggregateInsuranceProfile: JSON.parse(row.aggregate_insurance_profile),
      primaryTags: JSON.parse(row.primary_tags),
      styleConsistency: row.style_consistency,
      riskVariance: row.risk_variance,
      riskRange: { min: row.risk_min, max: row.risk_max },
      firstPlayed: new Date(row.first_played),
      lastPlayed: new Date(row.last_played),
      peakYear: row.peak_year,
      loyaltyScore: row.loyalty_score,
      algorithmVersion: row.algorithm_version,
      computedAt: new Date(row.computed_at)
    };
  }

  // ===========================================================================
  // GENRE OPERATIONS
  // ===========================================================================

  async upsertGenreProfile(profile: GenreRiskProfile): Promise<void> {
    const db = this.ensureDb();

    const stmt = db.prepare(`
      INSERT INTO genres (
        tag_hash, tag,
        song_count, artist_count, total_plays,
        aggregate_risk_factors, aggregate_insurance_profile,
        risk_volatility, dominant_risk_factors, overall_risk_score,
        algorithm_version, computed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(tag_hash) DO UPDATE SET
        song_count = excluded.song_count,
        artist_count = excluded.artist_count,
        total_plays = excluded.total_plays,
        aggregate_risk_factors = excluded.aggregate_risk_factors,
        aggregate_insurance_profile = excluded.aggregate_insurance_profile,
        risk_volatility = excluded.risk_volatility,
        dominant_risk_factors = excluded.dominant_risk_factors,
        overall_risk_score = excluded.overall_risk_score,
        algorithm_version = excluded.algorithm_version,
        computed_at = excluded.computed_at
    `);

    stmt.run(
      profile.tagHash,
      profile.tag,
      profile.songCount,
      profile.artistCount,
      profile.totalPlays,
      JSON.stringify(profile.aggregateRiskFactors),
      JSON.stringify(profile.aggregateInsuranceProfile),
      profile.riskVolatility,
      JSON.stringify(profile.dominantRiskFactors),
      profile.aggregateInsuranceProfile.overallRiskScore,
      profile.algorithmVersion,
      profile.computedAt.getTime()
    );
  }

  async getGenreProfile(tag: string): Promise<GenreRiskProfile | null> {
    const db = this.ensureDb();
    const row = db.prepare('SELECT * FROM genres WHERE tag = ? COLLATE NOCASE').get(tag) as any;

    if (!row) return null;
    return this.rowToGenreProfile(row);
  }

  async getAllGenreProfiles(): Promise<GenreRiskProfile[]> {
    const db = this.ensureDb();
    const rows = db.prepare('SELECT * FROM genres ORDER BY total_plays DESC').all() as any[];
    return rows.map(row => this.rowToGenreProfile(row));
  }

  private rowToGenreProfile(row: any): GenreRiskProfile {
    return {
      tagHash: row.tag_hash,
      tag: row.tag,
      songCount: row.song_count,
      artistCount: row.artist_count,
      totalPlays: row.total_plays,
      aggregateRiskFactors: JSON.parse(row.aggregate_risk_factors),
      aggregateInsuranceProfile: JSON.parse(row.aggregate_insurance_profile),
      riskVolatility: row.risk_volatility,
      dominantRiskFactors: JSON.parse(row.dominant_risk_factors),
      algorithmVersion: row.algorithm_version,
      computedAt: new Date(row.computed_at)
    };
  }

  // ===========================================================================
  // ERA OPERATIONS
  // ===========================================================================

  async upsertEraProfile(profile: EraRiskProfile): Promise<void> {
    const db = this.ensureDb();

    const stmt = db.prepare(`
      INSERT INTO eras (
        era_id, name,
        start_date, end_date, duration_days,
        song_count, unique_artists, total_plays,
        aggregate_risk_factors, aggregate_insurance_profile,
        dominant_artists, dominant_genres, novelty_rate, risk_trajectory, risk_delta, overall_risk_score,
        algorithm_version, computed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(era_id) DO UPDATE SET
        name = excluded.name,
        start_date = excluded.start_date,
        end_date = excluded.end_date,
        duration_days = excluded.duration_days,
        song_count = excluded.song_count,
        unique_artists = excluded.unique_artists,
        total_plays = excluded.total_plays,
        aggregate_risk_factors = excluded.aggregate_risk_factors,
        aggregate_insurance_profile = excluded.aggregate_insurance_profile,
        dominant_artists = excluded.dominant_artists,
        dominant_genres = excluded.dominant_genres,
        novelty_rate = excluded.novelty_rate,
        risk_trajectory = excluded.risk_trajectory,
        risk_delta = excluded.risk_delta,
        overall_risk_score = excluded.overall_risk_score,
        algorithm_version = excluded.algorithm_version,
        computed_at = excluded.computed_at
    `);

    stmt.run(
      profile.eraId,
      profile.name,
      profile.startDate.getTime(),
      profile.endDate.getTime(),
      profile.durationDays,
      profile.songCount,
      profile.uniqueArtists,
      profile.totalPlays,
      JSON.stringify(profile.aggregateRiskFactors),
      JSON.stringify(profile.aggregateInsuranceProfile),
      JSON.stringify(profile.dominantArtists),
      JSON.stringify(profile.dominantGenres),
      profile.noveltyRate,
      profile.riskTrajectory,
      profile.riskDelta,
      profile.aggregateInsuranceProfile.overallRiskScore,
      profile.algorithmVersion,
      profile.computedAt.getTime()
    );
  }

  async getEraProfile(eraId: string): Promise<EraRiskProfile | null> {
    const db = this.ensureDb();
    const row = db.prepare('SELECT * FROM eras WHERE era_id = ?').get(eraId) as any;

    if (!row) return null;
    return this.rowToEraProfile(row);
  }

  async getAllEras(): Promise<EraRiskProfile[]> {
    const db = this.ensureDb();
    const rows = db.prepare('SELECT * FROM eras ORDER BY start_date ASC').all() as any[];
    return rows.map(row => this.rowToEraProfile(row));
  }

  private rowToEraProfile(row: any): EraRiskProfile {
    return {
      eraId: row.era_id,
      name: row.name,
      startDate: new Date(row.start_date),
      endDate: new Date(row.end_date),
      durationDays: row.duration_days,
      songCount: row.song_count,
      uniqueArtists: row.unique_artists,
      totalPlays: row.total_plays,
      aggregateRiskFactors: JSON.parse(row.aggregate_risk_factors),
      aggregateInsuranceProfile: JSON.parse(row.aggregate_insurance_profile),
      dominantArtists: JSON.parse(row.dominant_artists),
      dominantGenres: JSON.parse(row.dominant_genres),
      noveltyRate: row.novelty_rate,
      riskTrajectory: row.risk_trajectory as EraRiskProfile['riskTrajectory'],
      riskDelta: row.risk_delta,
      algorithmVersion: row.algorithm_version,
      computedAt: new Date(row.computed_at)
    };
  }

  // ===========================================================================
  // STATISTICS
  // ===========================================================================

  async getGlobalStatistics(): Promise<GlobalStatistics> {
    const db = this.ensureDb();
    const row = db.prepare('SELECT * FROM global_statistics WHERE id = 1').get() as any;

    return {
      totalSongs: row.total_songs,
      totalArtists: row.total_artists,
      totalPlays: row.total_plays,
      totalGenres: row.total_genres,
      totalEras: row.total_eras,
      earliestPlay: row.earliest_play ? new Date(row.earliest_play) : new Date(),
      latestPlay: row.latest_play ? new Date(row.latest_play) : new Date(),
      historySpanYears: row.history_span_years,
      lifetimeRiskFactors: row.lifetime_risk_factors ? JSON.parse(row.lifetime_risk_factors) : null,
      lifetimeInsuranceProfile: row.lifetime_insurance_profile ? JSON.parse(row.lifetime_insurance_profile) : null,
      riskDistribution: row.risk_distribution ? JSON.parse(row.risk_distribution) : null,
      topRiskSongs: row.top_risk_songs ? JSON.parse(row.top_risk_songs) : [],
      topMitigatingSongs: row.top_mitigating_songs ? JSON.parse(row.top_mitigating_songs) : [],
      currentAlgorithmVersion: row.current_algorithm_version || CURRENT_ALGORITHM_VERSION.id,
      lastFullRecompute: row.last_full_recompute ? new Date(row.last_full_recompute) : new Date(),
      songsNeedingRecompute: row.songs_needing_recompute,
      computedAt: new Date(row.computed_at)
    };
  }

  async updateGlobalStatistics(): Promise<void> {
    const db = this.ensureDb();

    // Count aggregates
    const songCount = (db.prepare('SELECT COUNT(*) as count FROM songs').get() as any).count;
    const artistCount = (db.prepare('SELECT COUNT(*) as count FROM artists').get() as any).count;
    const genreCount = (db.prepare('SELECT COUNT(*) as count FROM genres').get() as any).count;
    const eraCount = (db.prepare('SELECT COUNT(*) as count FROM eras').get() as any).count;
    const totalPlays = (db.prepare('SELECT SUM(total_plays) as sum FROM songs').get() as any).sum || 0;

    // Date range
    const dateRange = db.prepare(`
      SELECT MIN(computed_at) as earliest, MAX(computed_at) as latest FROM songs
    `).get() as any;

    // Risk distribution
    const riskScores = db.prepare('SELECT overall_risk_score FROM songs ORDER BY overall_risk_score').all() as any[];
    const sortedScores = riskScores.map(r => r.overall_risk_score);

    const percentile = (arr: number[], p: number) => {
      const idx = Math.floor(arr.length * p);
      return arr[idx] || 0;
    };

    const mean = sortedScores.reduce((a, b) => a + b, 0) / (sortedScores.length || 1);
    const variance = sortedScores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / (sortedScores.length || 1);
    const stdDev = Math.sqrt(variance);

    const riskDistribution = {
      percentile10: percentile(sortedScores, 0.1),
      percentile25: percentile(sortedScores, 0.25),
      percentile50: percentile(sortedScores, 0.5),
      percentile75: percentile(sortedScores, 0.75),
      percentile90: percentile(sortedScores, 0.9),
      mean,
      stdDev
    };

    // Top risk songs
    const topRiskRows = db.prepare(`
      SELECT song_hash, artist, title, album FROM songs ORDER BY overall_risk_score DESC LIMIT 100
    `).all() as any[];

    const topRiskSongs = topRiskRows.map(r => ({
      songHash: r.song_hash,
      artist: r.artist,
      title: r.title,
      album: r.album
    }));

    // Top mitigating songs (lowest risk)
    const topMitigatingRows = db.prepare(`
      SELECT song_hash, artist, title, album FROM songs ORDER BY overall_risk_score ASC LIMIT 100
    `).all() as any[];

    const topMitigatingSongs = topMitigatingRows.map(r => ({
      songHash: r.song_hash,
      artist: r.artist,
      title: r.title,
      album: r.album
    }));

    // Songs needing recompute
    const songsNeedingRecompute = (db.prepare(`
      SELECT COUNT(*) as count FROM songs WHERE algorithm_version != ?
    `).get(CURRENT_ALGORITHM_VERSION.id) as any).count;

    // History span
    const historySpanYears = dateRange.earliest && dateRange.latest
      ? (dateRange.latest - dateRange.earliest) / (1000 * 60 * 60 * 24 * 365)
      : 0;

    // Update
    db.prepare(`
      UPDATE global_statistics SET
        total_songs = ?,
        total_artists = ?,
        total_plays = ?,
        total_genres = ?,
        total_eras = ?,
        earliest_play = ?,
        latest_play = ?,
        history_span_years = ?,
        risk_distribution = ?,
        top_risk_songs = ?,
        top_mitigating_songs = ?,
        current_algorithm_version = ?,
        songs_needing_recompute = ?,
        computed_at = ?
      WHERE id = 1
    `).run(
      songCount,
      artistCount,
      totalPlays,
      genreCount,
      eraCount,
      dateRange.earliest,
      dateRange.latest,
      historySpanYears,
      JSON.stringify(riskDistribution),
      JSON.stringify(topRiskSongs),
      JSON.stringify(topMitigatingSongs),
      CURRENT_ALGORITHM_VERSION.id,
      songsNeedingRecompute,
      Date.now()
    );
  }

  // ===========================================================================
  // ALGORITHM VERSION
  // ===========================================================================

  async getCurrentAlgorithmVersion(): Promise<AlgorithmVersion> {
    const db = this.ensureDb();
    const row = db.prepare('SELECT * FROM algorithm_versions WHERE is_active = 1').get() as any;

    if (!row) {
      return CURRENT_ALGORITHM_VERSION;
    }

    return {
      id: row.id,
      name: row.name,
      description: row.description,
      genomeVersion: row.genome_version,
      riskMappingVersion: row.risk_mapping_version,
      insuranceFormulaVersion: row.insurance_formula_version,
      createdAt: new Date(row.created_at),
      isActive: row.is_active === 1,
      algorithmHash: row.algorithm_hash
    };
  }

  async registerAlgorithmVersion(version: AlgorithmVersion): Promise<void> {
    const db = this.ensureDb();

    // Deactivate all existing versions if this is active
    if (version.isActive) {
      db.prepare('UPDATE algorithm_versions SET is_active = 0').run();
    }

    db.prepare(`
      INSERT INTO algorithm_versions
      (id, name, description, genome_version, risk_mapping_version, insurance_formula_version, created_at, is_active, algorithm_hash)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        description = excluded.description,
        is_active = excluded.is_active,
        algorithm_hash = excluded.algorithm_hash
    `).run(
      version.id,
      version.name,
      version.description,
      version.genomeVersion,
      version.riskMappingVersion,
      version.insuranceFormulaVersion,
      version.createdAt.getTime(),
      version.isActive ? 1 : 0,
      version.algorithmHash
    );
  }

  async getSongsNeedingRecompute(targetVersion: string, limit: number = 1000): Promise<SongRiskGenome[]> {
    const db = this.ensureDb();
    const rows = db.prepare(`
      SELECT * FROM songs WHERE algorithm_version != ? LIMIT ?
    `).all(targetVersion, limit) as any[];

    return rows.map(row => this.rowToSongGenome(row));
  }

  // ===========================================================================
  // BATCH OPERATIONS
  // ===========================================================================

  async createBatchJob(job: Omit<BatchJob, 'id'>): Promise<string> {
    const db = this.ensureDb();
    const id = crypto.randomUUID();

    db.prepare(`
      INSERT INTO batch_jobs (id, type, status, total_items, processed_items, failed_items, config)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      job.type,
      job.status,
      job.totalItems,
      job.processedItems,
      job.failedItems,
      JSON.stringify(job.config)
    );

    return id;
  }

  async updateBatchJob(jobId: string, updates: Partial<BatchJob>): Promise<void> {
    const db = this.ensureDb();

    const setClauses: string[] = [];
    const values: any[] = [];

    if (updates.status !== undefined) {
      setClauses.push('status = ?');
      values.push(updates.status);
    }
    if (updates.processedItems !== undefined) {
      setClauses.push('processed_items = ?');
      values.push(updates.processedItems);
    }
    if (updates.failedItems !== undefined) {
      setClauses.push('failed_items = ?');
      values.push(updates.failedItems);
    }
    if (updates.startedAt !== undefined) {
      setClauses.push('started_at = ?');
      values.push(updates.startedAt.getTime());
    }
    if (updates.completedAt !== undefined) {
      setClauses.push('completed_at = ?');
      values.push(updates.completedAt.getTime());
    }
    if (updates.lastCheckpoint !== undefined) {
      setClauses.push('last_checkpoint = ?');
      values.push(JSON.stringify(updates.lastCheckpoint));
    }
    if (updates.errors !== undefined) {
      setClauses.push('errors = ?');
      values.push(JSON.stringify(updates.errors));
    }

    if (setClauses.length > 0) {
      values.push(jobId);
      db.prepare(`UPDATE batch_jobs SET ${setClauses.join(', ')} WHERE id = ?`).run(...values);
    }
  }

  async getBatchJob(jobId: string): Promise<BatchJob | null> {
    const db = this.ensureDb();
    const row = db.prepare('SELECT * FROM batch_jobs WHERE id = ?').get(jobId) as any;

    if (!row) return null;

    return {
      id: row.id,
      type: row.type,
      status: row.status,
      totalItems: row.total_items,
      processedItems: row.processed_items,
      failedItems: row.failed_items,
      progress: row.total_items > 0 ? (row.processed_items / row.total_items) * 100 : 0,
      startedAt: row.started_at ? new Date(row.started_at) : undefined,
      completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
      lastCheckpoint: row.last_checkpoint ? JSON.parse(row.last_checkpoint) : undefined,
      errors: row.errors ? JSON.parse(row.errors) : [],
      config: JSON.parse(row.config)
    };
  }

  async getActiveBatchJobs(): Promise<BatchJob[]> {
    const db = this.ensureDb();
    const rows = db.prepare(`SELECT * FROM batch_jobs WHERE status IN ('pending', 'running', 'paused')`).all() as any[];

    return rows.map(row => ({
      id: row.id,
      type: row.type,
      status: row.status,
      totalItems: row.total_items,
      processedItems: row.processed_items,
      failedItems: row.failed_items,
      progress: row.total_items > 0 ? (row.processed_items / row.total_items) * 100 : 0,
      startedAt: row.started_at ? new Date(row.started_at) : undefined,
      completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
      lastCheckpoint: row.last_checkpoint ? JSON.parse(row.last_checkpoint) : undefined,
      errors: row.errors ? JSON.parse(row.errors) : [],
      config: JSON.parse(row.config)
    }));
  }

  // ===========================================================================
  // QUERYING
  // ===========================================================================

  async queryByRiskScore(minScore: number, maxScore: number): Promise<SongRiskGenome[]> {
    const db = this.ensureDb();
    const rows = db.prepare(`
      SELECT * FROM songs
      WHERE overall_risk_score BETWEEN ? AND ?
      ORDER BY overall_risk_score DESC
    `).all(minScore, maxScore) as any[];

    return rows.map(row => this.rowToSongGenome(row));
  }

  async queryByRiskFactor(factor: keyof MusicRiskFactors, minValue: number, maxValue: number): Promise<SongRiskGenome[]> {
    const db = this.ensureDb();
    // Query with JSON extraction (SQLite JSON1 extension)
    const rows = db.prepare(`
      SELECT * FROM songs
      WHERE json_extract(risk_factors, '$.${factor}') BETWEEN ? AND ?
      ORDER BY json_extract(risk_factors, '$.${factor}') DESC
    `).all(minValue, maxValue) as any[];

    return rows.map(row => this.rowToSongGenome(row));
  }

  async queryByDateRange(startDate: Date, endDate: Date): Promise<SongRiskGenome[]> {
    const db = this.ensureDb();
    const rows = db.prepare(`
      SELECT * FROM songs
      WHERE computed_at BETWEEN ? AND ?
      ORDER BY computed_at DESC
    `).all(startDate.getTime(), endDate.getTime()) as any[];

    return rows.map(row => this.rowToSongGenome(row));
  }

  async queryByGenome(attribute: keyof MusicGenome, minValue: number, maxValue: number): Promise<SongRiskGenome[]> {
    const db = this.ensureDb();
    const rows = db.prepare(`
      SELECT * FROM songs
      WHERE json_extract(genome, '$.${attribute}') BETWEEN ? AND ?
      ORDER BY json_extract(genome, '$.${attribute}') DESC
    `).all(minValue, maxValue) as any[];

    return rows.map(row => this.rowToSongGenome(row));
  }

  // ===========================================================================
  // EXPORT/IMPORT
  // ===========================================================================

  async exportToJson(filepath: string): Promise<void> {
    const db = this.ensureDb();

    const songs = db.prepare('SELECT * FROM songs').all() as any[];
    const artists = db.prepare('SELECT * FROM artists').all() as any[];
    const genres = db.prepare('SELECT * FROM genres').all() as any[];
    const eras = db.prepare('SELECT * FROM eras').all() as any[];
    const stats = await this.getGlobalStatistics();

    const exportData = {
      exportedAt: new Date().toISOString(),
      algorithmVersion: CURRENT_ALGORITHM_VERSION.id,
      statistics: stats,
      songs: songs.map(row => this.rowToSongGenome(row)),
      artists: artists.map(row => this.rowToArtistProfile(row)),
      genres: genres.map(row => this.rowToGenreProfile(row)),
      eras: eras.map(row => this.rowToEraProfile(row))
    };

    fs.writeFileSync(filepath, JSON.stringify(exportData, null, 2));
    console.log(`[MusicRiskDB] Exported ${songs.length} songs to ${filepath}`);
  }

  async importFromJson(filepath: string): Promise<{ imported: number; skipped: number }> {
    const data = JSON.parse(fs.readFileSync(filepath, 'utf-8'));

    let imported = 0;
    let skipped = 0;

    if (data.songs && Array.isArray(data.songs)) {
      const result = await this.upsertSongBatch(data.songs);
      imported = result.success;
      skipped = result.failed;
    }

    // Import artists, genres, eras too
    if (data.artists) {
      for (const artist of data.artists) {
        await this.upsertArtistProfile(artist);
      }
    }

    if (data.genres) {
      for (const genre of data.genres) {
        await this.upsertGenreProfile(genre);
      }
    }

    if (data.eras) {
      for (const era of data.eras) {
        await this.upsertEraProfile(era);
      }
    }

    // Update statistics
    await this.updateGlobalStatistics();

    console.log(`[MusicRiskDB] Imported ${imported} songs, skipped ${skipped}`);
    return { imported, skipped };
  }

  async exportStatistics(filepath: string): Promise<void> {
    const stats = await this.getGlobalStatistics();
    fs.writeFileSync(filepath, JSON.stringify(stats, null, 2));
  }
}

// =============================================================================
// FACTORY
// =============================================================================

import * as crypto from 'crypto';

/**
 * Create a new Music Risk Genome Database instance
 */
export function createMusicRiskDatabase(dbPath?: string): SQLiteRiskGenomeRepository {
  const defaultPath = path.join(process.cwd(), 'data', 'music_risk_genome.db');
  return new SQLiteRiskGenomeRepository(dbPath || defaultPath);
}

export default SQLiteRiskGenomeRepository;
