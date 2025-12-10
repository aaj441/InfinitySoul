#!/usr/bin/env ts-node
/**
 * MUSIC RISK GENOME DATABASE CLI
 * ================================
 *
 * "Your 700,000 song library. One command at a time."
 *
 * Command-line interface for managing the Music Risk Genome Database.
 *
 * Usage:
 *   npx ts-node cli.ts <command> [options]
 *
 * Commands:
 *   init              Initialize a new database
 *   import <file>     Import listening history from JSON/Last.fm
 *   query <term>      Search for songs, artists, or genres
 *   stats             Show database statistics
 *   report            Generate full analytics report
 *   recompute         Recompute songs with outdated algorithm
 *   export <file>     Export database to JSON
 *   artist <name>     Show artist risk profile
 *   song <query>      Show song risk details
 *   top-risk          Show top risk contributors
 *   top-mitigating    Show top risk mitigators
 *
 * @author InfinitySoul Soul Fingerprint Engine
 * @version 2.0.0
 */

import * as path from 'path';
import * as fs from 'fs';
import { createMusicRiskDatabase, SQLiteRiskGenomeRepository } from './SQLiteRiskGenomeRepository';
import { BatchProcessingEngine, DEFAULT_BATCH_CONFIG } from './BatchProcessingEngine';
import { AggregateAnalyticsEngine, AnalyticsReport } from './AggregateAnalytics';
import { CURRENT_ALGORITHM_VERSION, GlobalStatistics } from './MusicRiskGenomeDatabase';

// =============================================================================
// CLI HELPERS
// =============================================================================

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgBlue: '\x1b[44m',
};

function log(message: string, color: string = COLORS.reset): void {
  console.log(`${color}${message}${COLORS.reset}`);
}

function logHeader(title: string): void {
  console.log('');
  console.log(`${COLORS.bgBlue}${COLORS.white}${COLORS.bright} ${title} ${COLORS.reset}`);
  console.log('');
}

function logSection(title: string): void {
  console.log(`${COLORS.cyan}${COLORS.bright}═══ ${title} ═══${COLORS.reset}`);
}

function logKeyValue(key: string, value: any): void {
  console.log(`  ${COLORS.dim}${key}:${COLORS.reset} ${COLORS.white}${value}${COLORS.reset}`);
}

function logProgress(current: number, total: number, message: string): void {
  const percent = Math.round((current / total) * 100);
  const bar = '█'.repeat(Math.floor(percent / 5)) + '░'.repeat(20 - Math.floor(percent / 5));
  process.stdout.write(`\r${COLORS.cyan}[${bar}] ${percent}%${COLORS.reset} ${message}    `);
}

function formatNumber(num: number): string {
  return num.toLocaleString();
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function formatRiskScore(score: number): string {
  let color = COLORS.green;
  if (score >= 70) color = COLORS.red;
  else if (score >= 50) color = COLORS.yellow;
  return `${color}${score.toFixed(1)}${COLORS.reset}`;
}

// =============================================================================
// COMMANDS
// =============================================================================

async function cmdInit(dbPath?: string): Promise<void> {
  logHeader('INITIALIZING MUSIC RISK GENOME DATABASE');

  const db = createMusicRiskDatabase(dbPath);
  await db.initialize();

  const stats = await db.getGlobalStatistics();

  log(`✓ Database initialized at: ${dbPath || 'data/music_risk_genome.db'}`, COLORS.green);
  logKeyValue('Algorithm Version', CURRENT_ALGORITHM_VERSION.id);
  logKeyValue('Algorithm Name', CURRENT_ALGORITHM_VERSION.name);
  logKeyValue('Total Songs', stats.totalSongs);

  await db.close();
}

async function cmdStats(dbPath?: string): Promise<void> {
  logHeader('DATABASE STATISTICS');

  const db = createMusicRiskDatabase(dbPath);
  await db.initialize();

  const stats = await db.getGlobalStatistics();

  logSection('Overview');
  logKeyValue('Total Songs', formatNumber(stats.totalSongs));
  logKeyValue('Total Artists', formatNumber(stats.totalArtists));
  logKeyValue('Total Plays', formatNumber(stats.totalPlays));
  logKeyValue('Total Genres', formatNumber(stats.totalGenres));
  logKeyValue('Total Eras', formatNumber(stats.totalEras));

  console.log('');
  logSection('History');
  logKeyValue('Earliest Play', stats.earliestPlay ? formatDate(stats.earliestPlay) : 'N/A');
  logKeyValue('Latest Play', stats.latestPlay ? formatDate(stats.latestPlay) : 'N/A');
  logKeyValue('History Span', `${stats.historySpanYears.toFixed(1)} years`);

  console.log('');
  logSection('Risk Distribution');
  if (stats.riskDistribution) {
    logKeyValue('10th Percentile', formatRiskScore(stats.riskDistribution.percentile10));
    logKeyValue('25th Percentile', formatRiskScore(stats.riskDistribution.percentile25));
    logKeyValue('50th Percentile (Median)', formatRiskScore(stats.riskDistribution.percentile50));
    logKeyValue('75th Percentile', formatRiskScore(stats.riskDistribution.percentile75));
    logKeyValue('90th Percentile', formatRiskScore(stats.riskDistribution.percentile90));
    logKeyValue('Mean', formatRiskScore(stats.riskDistribution.mean));
    logKeyValue('Std Dev', stats.riskDistribution.stdDev.toFixed(2));
  } else {
    log('  No risk distribution data available', COLORS.dim);
  }

  console.log('');
  logSection('Algorithm');
  logKeyValue('Current Version', stats.currentAlgorithmVersion || CURRENT_ALGORITHM_VERSION.id);
  logKeyValue('Last Full Recompute', stats.lastFullRecompute ? formatDate(stats.lastFullRecompute) : 'Never');
  logKeyValue('Songs Needing Recompute', formatNumber(stats.songsNeedingRecompute));

  await db.close();
}

async function cmdQuery(query: string, dbPath?: string): Promise<void> {
  logHeader(`SEARCH: "${query}"`);

  const db = createMusicRiskDatabase(dbPath);
  await db.initialize();

  const songs = await db.searchSongs(query, 20);

  if (songs.length === 0) {
    log('No results found.', COLORS.yellow);
  } else {
    logSection(`Found ${songs.length} songs`);
    console.log('');

    for (const song of songs) {
      console.log(`  ${COLORS.white}${song.identifier.title}${COLORS.reset}`);
      console.log(`    ${COLORS.dim}by${COLORS.reset} ${song.identifier.artist} ${COLORS.dim}on${COLORS.reset} ${song.identifier.album}`);
      console.log(`    Risk Score: ${formatRiskScore(song.insuranceProfile.overallRiskScore)}  |  Plays: ${song.listeningContext?.totalPlays || 0}`);
      console.log('');
    }
  }

  await db.close();
}

async function cmdArtist(artistName: string, dbPath?: string): Promise<void> {
  logHeader(`ARTIST PROFILE: ${artistName}`);

  const db = createMusicRiskDatabase(dbPath);
  await db.initialize();

  const profile = await db.getArtistProfile(artistName);

  if (!profile) {
    log(`Artist "${artistName}" not found.`, COLORS.yellow);

    // Try to find similar artists
    const songs = await db.searchSongs(artistName, 5);
    if (songs.length > 0) {
      console.log('');
      log('Did you mean:', COLORS.dim);
      const uniqueArtists = [...new Set(songs.map(s => s.identifier.artist))];
      for (const artist of uniqueArtists) {
        console.log(`  - ${artist}`);
      }
    }
  } else {
    logSection('Overview');
    logKeyValue('Name', profile.artistName);
    logKeyValue('Songs', formatNumber(profile.songCount));
    logKeyValue('Albums', formatNumber(profile.uniqueAlbums));
    logKeyValue('Total Plays', formatNumber(profile.totalPlays));

    console.log('');
    logSection('Listening History');
    logKeyValue('First Played', formatDate(profile.firstPlayed));
    logKeyValue('Last Played', formatDate(profile.lastPlayed));
    logKeyValue('Peak Year', profile.peakYear);
    logKeyValue('Loyalty Score', (profile.loyaltyScore * 100).toFixed(0) + '%');

    console.log('');
    logSection('Risk Profile');
    logKeyValue('Overall Risk Score', formatRiskScore(profile.aggregateInsuranceProfile.overallRiskScore));
    logKeyValue('Risk Range', `${formatRiskScore(profile.riskRange.min)} - ${formatRiskScore(profile.riskRange.max)}`);
    logKeyValue('Risk Variance', profile.riskVariance.toFixed(2));
    logKeyValue('Style Consistency', (profile.styleConsistency * 100).toFixed(0) + '%');

    console.log('');
    logSection('Tags');
    console.log(`  ${profile.primaryTags.join(', ')}`);

    console.log('');
    logSection('Insurance Risk Breakdown');
    logKeyValue('Auto Insurance', formatRiskScore(profile.aggregateInsuranceProfile.autoInsuranceRisk));
    logKeyValue('Health Insurance', formatRiskScore(profile.aggregateInsuranceProfile.healthInsuranceRisk));
    logKeyValue('Life Insurance', formatRiskScore(profile.aggregateInsuranceProfile.lifeInsuranceRisk));
    logKeyValue('Property Insurance', formatRiskScore(profile.aggregateInsuranceProfile.propertyInsuranceRisk));
    logKeyValue('Liability Insurance', formatRiskScore(profile.aggregateInsuranceProfile.liabilityInsuranceRisk));
    logKeyValue('Cyber Insurance', formatRiskScore(profile.aggregateInsuranceProfile.cyberInsuranceRisk));
    logKeyValue('Professional Liability', formatRiskScore(profile.aggregateInsuranceProfile.professionalLiabilityRisk));
  }

  await db.close();
}

async function cmdSong(query: string, dbPath?: string): Promise<void> {
  logHeader(`SONG DETAILS: "${query}"`);

  const db = createMusicRiskDatabase(dbPath);
  await db.initialize();

  const songs = await db.searchSongs(query, 1);

  if (songs.length === 0) {
    log('Song not found.', COLORS.yellow);
  } else {
    const song = songs[0];

    logSection('Identification');
    logKeyValue('Title', song.identifier.title);
    logKeyValue('Artist', song.identifier.artist);
    logKeyValue('Album', song.identifier.album);
    logKeyValue('Song Hash', song.identifier.songHash.substring(0, 16) + '...');

    console.log('');
    logSection('Listening Context');
    if (song.listeningContext) {
      logKeyValue('Total Plays', formatNumber(song.listeningContext.totalPlays));
      logKeyValue('First Played', formatDate(song.listeningContext.firstPlayed));
      logKeyValue('Last Played', formatDate(song.listeningContext.lastPlayed));
    } else {
      log('  No listening context available', COLORS.dim);
    }

    console.log('');
    logSection('Music Genome (Key Attributes)');
    logKeyValue('Tempo', `${song.genome.tempo.toFixed(0)} BPM`);
    logKeyValue('Energy', (song.genome.overallEnergy * 100).toFixed(0) + '%');
    logKeyValue('Valence', (song.genome.valence * 100).toFixed(0) + '%');
    logKeyValue('Complexity', (song.genome.harmonicComplexity * 100).toFixed(0) + '%');
    logKeyValue('Experimentalism', (song.genome.experimentalism * 100).toFixed(0) + '%');

    console.log('');
    logSection('Risk Factors (Key)');
    logKeyValue('Impulsivity', (song.riskFactors.impulsivity * 100).toFixed(0) + '%');
    logKeyValue('Sensation Seeking', (song.riskFactors.sensationSeeking * 100).toFixed(0) + '%');
    logKeyValue('Risk Tolerance', (song.riskFactors.riskTolerance * 100).toFixed(0) + '%');
    logKeyValue('Neuroticism', (song.riskFactors.neuroticism * 100).toFixed(0) + '%');
    logKeyValue('Conscientiousness', (song.riskFactors.conscientiousness * 100).toFixed(0) + '%');

    console.log('');
    logSection('Insurance Profile');
    logKeyValue('Overall Risk Score', formatRiskScore(song.insuranceProfile.overallRiskScore));
    logKeyValue('Auto Insurance', formatRiskScore(song.insuranceProfile.autoInsuranceRisk));
    logKeyValue('Health Insurance', formatRiskScore(song.insuranceProfile.healthInsuranceRisk));
    logKeyValue('Life Insurance', formatRiskScore(song.insuranceProfile.lifeInsuranceRisk));

    console.log('');
    logSection('Risk Narrative');
    console.log(`  ${COLORS.dim}${song.insuranceProfile.riskNarrative}${COLORS.reset}`);

    if (song.insuranceProfile.keyRiskFactors.length > 0) {
      console.log('');
      log('  Key Risk Factors:', COLORS.yellow);
      for (const factor of song.insuranceProfile.keyRiskFactors) {
        console.log(`    - ${factor}`);
      }
    }

    if (song.insuranceProfile.mitigatingFactors.length > 0) {
      console.log('');
      log('  Mitigating Factors:', COLORS.green);
      for (const factor of song.insuranceProfile.mitigatingFactors) {
        console.log(`    - ${factor}`);
      }
    }

    console.log('');
    logSection('Metadata');
    logKeyValue('Algorithm Version', song.algorithmVersion);
    logKeyValue('Computed At', formatDate(song.computedAt));
    logKeyValue('Genome Confidence', (song.genomeConfidence * 100).toFixed(0) + '%');
  }

  await db.close();
}

async function cmdTopRisk(limit: number = 20, dbPath?: string): Promise<void> {
  logHeader('TOP RISK CONTRIBUTORS');

  const db = createMusicRiskDatabase(dbPath);
  await db.initialize();

  const topArtists = await db.getTopArtistsByRisk(limit);

  if (topArtists.length === 0) {
    log('No artist profiles computed yet.', COLORS.yellow);
    log('Run "report" command first to compute aggregates.', COLORS.dim);
  } else {
    logSection(`Top ${limit} Risk-Elevating Artists`);
    console.log('');

    let rank = 1;
    for (const artist of topArtists) {
      const score = artist.aggregateInsuranceProfile.overallRiskScore;
      console.log(`  ${COLORS.dim}#${rank}${COLORS.reset} ${COLORS.white}${artist.artistName}${COLORS.reset}`);
      console.log(`       Risk: ${formatRiskScore(score)}  |  Songs: ${artist.songCount}  |  Plays: ${formatNumber(artist.totalPlays)}`);
      rank++;
    }
  }

  await db.close();
}

async function cmdTopMitigating(limit: number = 20, dbPath?: string): Promise<void> {
  logHeader('TOP RISK MITIGATORS');

  const db = createMusicRiskDatabase(dbPath);
  await db.initialize();

  const topArtists = await db.getTopArtistsByPlays(limit);

  // Sort by lowest risk
  const sorted = topArtists.sort((a, b) =>
    a.aggregateInsuranceProfile.overallRiskScore - b.aggregateInsuranceProfile.overallRiskScore
  );

  if (sorted.length === 0) {
    log('No artist profiles computed yet.', COLORS.yellow);
    log('Run "report" command first to compute aggregates.', COLORS.dim);
  } else {
    logSection(`Top ${limit} Risk-Mitigating Artists`);
    console.log('');

    let rank = 1;
    for (const artist of sorted.slice(0, limit)) {
      const score = artist.aggregateInsuranceProfile.overallRiskScore;
      console.log(`  ${COLORS.dim}#${rank}${COLORS.reset} ${COLORS.white}${artist.artistName}${COLORS.reset}`);
      console.log(`       Risk: ${formatRiskScore(score)}  |  Songs: ${artist.songCount}  |  Plays: ${formatNumber(artist.totalPlays)}`);
      rank++;
    }
  }

  await db.close();
}

async function cmdReport(dbPath?: string): Promise<void> {
  logHeader('GENERATING FULL ANALYTICS REPORT');

  const db = createMusicRiskDatabase(dbPath);
  await db.initialize();

  const analytics = new AggregateAnalyticsEngine(db);

  log('Refreshing aggregate profiles...', COLORS.dim);
  await analytics.refreshAllAggregates();

  log('Generating report...', COLORS.dim);
  const report = await analytics.generateFullReport();

  console.log('');
  logSection('Summary');
  logKeyValue('Total Songs', formatNumber(report.summary.totalSongs));
  logKeyValue('Total Artists', formatNumber(report.summary.totalArtists));
  logKeyValue('Total Plays', formatNumber(report.summary.totalPlays));
  logKeyValue('History Span', `${report.summary.historySpanYears.toFixed(1)} years`);
  logKeyValue('Overall Risk Score', formatRiskScore(report.summary.overallRiskScore));
  logKeyValue('Risk Band', report.summary.riskBand);

  console.log('');
  logSection('Dominant Risk Factors');
  for (const factor of report.summary.dominantRiskFactors) {
    console.log(`  ${COLORS.red}▲${COLORS.reset} ${factor}`);
  }

  console.log('');
  logSection('Mitigating Factors');
  for (const factor of report.summary.mitigatingFactors) {
    console.log(`  ${COLORS.green}▼${COLORS.reset} ${factor}`);
  }

  console.log('');
  logSection('Risk Trajectory');
  logKeyValue('Trend', report.riskTrajectory.overallTrend);
  logKeyValue('Trend Strength', (report.riskTrajectory.trendStrength * 100).toFixed(0) + '%');
  logKeyValue('Volatility', (report.riskTrajectory.volatility * 100).toFixed(0) + '%');
  logKeyValue('Peak Risk', `${formatRiskScore(report.riskTrajectory.peakRiskScore)} on ${formatDate(report.riskTrajectory.peakRiskDate)}`);
  logKeyValue('Lowest Risk', `${formatRiskScore(report.riskTrajectory.troughRiskScore)} on ${formatDate(report.riskTrajectory.troughRiskDate)}`);

  console.log('');
  logSection('Cohort Comparison');
  logKeyValue('Your Risk Score', formatRiskScore(report.cohortComparison.yourRiskScore));
  logKeyValue('Percentile Rank', `${report.cohortComparison.percentileRank}th percentile`);
  logKeyValue('Risk Band', report.cohortComparison.riskBand);
  logKeyValue('Std Deviations from Mean', report.cohortComparison.standardDeviationsFromMean.toFixed(2));

  if (report.eraBreakdown.length > 0) {
    console.log('');
    logSection('Era Breakdown');
    for (const era of report.eraBreakdown) {
      console.log(`  ${COLORS.bright}${era.name}${COLORS.reset} (${era.dateRange})`);
      console.log(`    Risk: ${formatRiskScore(era.riskScore)}`);
      console.log(`    ${COLORS.dim}${era.narrative}${COLORS.reset}`);
      console.log('');
    }
  }

  if (report.predictiveInsights.earlyWarningSignals.length > 0) {
    console.log('');
    logSection('Early Warning Signals');
    for (const signal of report.predictiveInsights.earlyWarningSignals) {
      console.log(`  ${COLORS.yellow}⚠${COLORS.reset} ${signal.signal}`);
      console.log(`    ${COLORS.dim}${signal.recommendation}${COLORS.reset}`);
    }
  }

  // Save report to file
  const reportPath = path.join(process.cwd(), 'data', 'analytics_report.json');
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log('');
  log(`Full report saved to: ${reportPath}`, COLORS.green);

  await db.close();
}

async function cmdExport(outputPath: string, dbPath?: string): Promise<void> {
  logHeader('EXPORTING DATABASE');

  const db = createMusicRiskDatabase(dbPath);
  await db.initialize();

  log(`Exporting to: ${outputPath}`, COLORS.dim);
  await db.exportToJson(outputPath);

  log('✓ Export complete!', COLORS.green);
  await db.close();
}

async function cmdImport(inputPath: string, dbPath?: string): Promise<void> {
  logHeader('IMPORTING DATA');

  const db = createMusicRiskDatabase(dbPath);
  await db.initialize();

  log(`Importing from: ${inputPath}`, COLORS.dim);
  const result = await db.importFromJson(inputPath);

  log(`✓ Imported ${formatNumber(result.imported)} songs`, COLORS.green);
  if (result.skipped > 0) {
    log(`  Skipped ${formatNumber(result.skipped)} due to errors`, COLORS.yellow);
  }

  await db.close();
}

async function cmdRecompute(dbPath?: string): Promise<void> {
  logHeader('RECOMPUTING OUTDATED SONGS');

  const db = createMusicRiskDatabase(dbPath);
  await db.initialize();

  const stats = await db.getGlobalStatistics();

  if (stats.songsNeedingRecompute === 0) {
    log('✓ All songs are up to date!', COLORS.green);
    await db.close();
    return;
  }

  log(`Found ${formatNumber(stats.songsNeedingRecompute)} songs needing recompute`, COLORS.yellow);
  log(`Target version: ${CURRENT_ALGORITHM_VERSION.id} (${CURRENT_ALGORITHM_VERSION.name})`, COLORS.dim);
  console.log('');

  const engine = new BatchProcessingEngine(db);

  engine.onProgress((progress) => {
    logProgress(
      progress.processedItems,
      progress.totalItems,
      `ETA: ${Math.round(progress.estimatedSecondsRemaining / 60)}m`
    );
  });

  const jobId = await engine.recomputeOutdatedSongs();

  if (jobId) {
    log('Recomputation started. Job ID: ' + jobId, COLORS.dim);

    // Wait for completion (in a real CLI, this would use a proper event loop)
    while (engine.getProgress()?.status === 'running') {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('');
    log('✓ Recomputation complete!', COLORS.green);
  }

  await db.close();
}

function showHelp(): void {
  logHeader('MUSIC RISK GENOME DATABASE CLI');

  console.log(`${COLORS.bright}Usage:${COLORS.reset}`);
  console.log('  npx ts-node cli.ts <command> [options]');
  console.log('');

  console.log(`${COLORS.bright}Commands:${COLORS.reset}`);
  console.log('  init                    Initialize a new database');
  console.log('  stats                   Show database statistics');
  console.log('  query <term>            Search for songs');
  console.log('  artist <name>           Show artist risk profile');
  console.log('  song <query>            Show song risk details');
  console.log('  top-risk                Show top risk contributors');
  console.log('  top-mitigating          Show top risk mitigators');
  console.log('  report                  Generate full analytics report');
  console.log('  export <file>           Export database to JSON');
  console.log('  import <file>           Import data from JSON');
  console.log('  recompute               Recompute outdated songs');
  console.log('');

  console.log(`${COLORS.bright}Options:${COLORS.reset}`);
  console.log('  --db <path>             Database file path (default: data/music_risk_genome.db)');
  console.log('  --help, -h              Show this help message');
  console.log('');

  console.log(`${COLORS.bright}Examples:${COLORS.reset}`);
  console.log('  npx ts-node cli.ts init');
  console.log('  npx ts-node cli.ts query "radiohead"');
  console.log('  npx ts-node cli.ts artist "Sufjan Stevens"');
  console.log('  npx ts-node cli.ts report');
  console.log('');

  console.log(`${COLORS.dim}Algorithm Version: ${CURRENT_ALGORITHM_VERSION.id} (${CURRENT_ALGORITHM_VERSION.name})${COLORS.reset}`);
}

// =============================================================================
// MAIN
// =============================================================================

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    showHelp();
    return;
  }

  const command = args[0];
  const dbPathIdx = args.indexOf('--db');
  const dbPath = dbPathIdx >= 0 ? args[dbPathIdx + 1] : undefined;

  try {
    switch (command) {
      case 'init':
        await cmdInit(dbPath);
        break;

      case 'stats':
        await cmdStats(dbPath);
        break;

      case 'query':
        if (!args[1]) {
          log('Error: Please provide a search query', COLORS.red);
          return;
        }
        await cmdQuery(args[1], dbPath);
        break;

      case 'artist':
        if (!args[1]) {
          log('Error: Please provide an artist name', COLORS.red);
          return;
        }
        await cmdArtist(args.slice(1).join(' ').replace('--db', '').replace(dbPath || '', '').trim(), dbPath);
        break;

      case 'song':
        if (!args[1]) {
          log('Error: Please provide a song query', COLORS.red);
          return;
        }
        await cmdSong(args.slice(1).join(' ').replace('--db', '').replace(dbPath || '', '').trim(), dbPath);
        break;

      case 'top-risk':
        await cmdTopRisk(20, dbPath);
        break;

      case 'top-mitigating':
        await cmdTopMitigating(20, dbPath);
        break;

      case 'report':
        await cmdReport(dbPath);
        break;

      case 'export':
        if (!args[1]) {
          log('Error: Please provide an output file path', COLORS.red);
          return;
        }
        await cmdExport(args[1], dbPath);
        break;

      case 'import':
        if (!args[1]) {
          log('Error: Please provide an input file path', COLORS.red);
          return;
        }
        await cmdImport(args[1], dbPath);
        break;

      case 'recompute':
        await cmdRecompute(dbPath);
        break;

      default:
        log(`Unknown command: ${command}`, COLORS.red);
        showHelp();
    }
  } catch (error: any) {
    log(`Error: ${error.message}`, COLORS.red);
    console.error(error);
    process.exit(1);
  }
}

main();
