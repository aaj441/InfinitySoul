/**
 * Update Plaintiff Map Script
 *
 * Fetches latest lawsuit data and updates plaintiff tracking database.
 * Should be run daily to keep plaintiff intelligence current.
 *
 * Usage:
 *   ts-node scripts/updatePlaintiffMap.ts
 *   ts-node scripts/updatePlaintiffMap.ts --days 30
 */

import { fetchPACERFeed } from '../backend/intel/lawsuitMonitor/pacerFeed';
import { plaintiffTracker } from '../backend/intel/lawsuitMonitor/plaintiffTracker';
import { computeIndustryHeatmap } from '../backend/intel/lawsuitMonitor/industryHeatmapBuilder';
import { logger } from '../utils/logger';
import * as fs from 'fs';
import * as path from 'path';

interface UpdateOptions {
  days: number;
  exportPath?: string;
}

async function updatePlaintiffMap(options: UpdateOptions): Promise<void> {
  logger.info(`Updating plaintiff map with last ${options.days} days of data...`);

  // Fetch PACER filings
  logger.info('Fetching PACER feed...');
  const filings = await fetchPACERFeed(options.days);
  logger.info(`Fetched ${filings.length} filings`);

  if (filings.length === 0) {
    logger.warn('No filings found. Plaintiff map not updated.');
    return;
  }

  // Build plaintiff profiles
  logger.info('Building plaintiff profiles...');
  const profiles = plaintiffTracker.buildPlaintiffProfile(filings);
  logger.info(`Built ${profiles.size} plaintiff profiles`);

  // Get active serial plaintiffs
  const serialPlaintiffs = plaintiffTracker.getActiveSerialPlaintiffs();
  logger.info(`Identified ${serialPlaintiffs.length} active serial plaintiffs`);

  // Generate industry heatmap
  logger.info('Generating industry heatmap...');
  const heatmap = computeIndustryHeatmap(filings);

  // Print summary
  logger.info(`\n${'='.repeat(60)}`);
  logger.info('PLAINTIFF MAP UPDATE COMPLETE');
  logger.info(`${'='.repeat(60)}`);
  logger.info(`Total Plaintiffs: ${profiles.size}`);
  logger.info(`Active Serial Plaintiffs: ${serialPlaintiffs.length}`);
  logger.info(`Industries Affected: ${heatmap.industries.length}`);
  logger.info(`Jurisdictions: ${heatmap.jurisdictions.length}`);

  // Top 10 serial plaintiffs
  logger.info(`\nTop 10 Serial Plaintiffs:`);
  serialPlaintiffs.slice(0, 10).forEach((p, i) => {
    logger.info(
      `${i + 1}. ${p.name} - ${p.totalFilings} filings ` +
      `(${p.filingVelocity.toFixed(1)}/mo) - ${p.riskLevel.toUpperCase()}`
    );
  });

  // High-risk industries
  const highRiskIndustries = heatmap.industries.filter(i => i.riskLevel === 'high' || i.riskLevel === 'critical');
  if (highRiskIndustries.length > 0) {
    logger.info(`\nHigh-Risk Industries:`);
    highRiskIndustries.forEach((ind, i) => {
      logger.info(
        `${i + 1}. ${ind.name} - ${ind.totalFilings} filings ` +
        `(${ind.recentActivity.last30Days} in last 30 days) - ${ind.riskLevel.toUpperCase()}`
      );
    });
  }

  // Export if path provided
  if (options.exportPath) {
    logger.info(`\nExporting data to ${options.exportPath}...`);

    const exportData = {
      timestamp: new Date().toISOString(),
      summary: {
        totalPlaintiffs: profiles.size,
        activeSerialPlaintiffs: serialPlaintiffs.length,
        totalFilings: filings.length,
        daysAnalyzed: options.days
      },
      plaintiffs: Array.from(profiles.values()).map(p => ({
        name: p.name,
        totalFilings: p.totalFilings,
        filingVelocity: p.filingVelocity,
        riskLevel: p.riskLevel,
        jurisdictions: p.jurisdictions.slice(0, 3),
        targetIndustries: p.targetIndustries.slice(0, 3),
        recentActivity: p.recentActivity,
        activeStatus: p.activeStatus
      })),
      heatmap: {
        industries: heatmap.industries,
        jurisdictions: heatmap.jurisdictions,
        globalMetrics: heatmap.globalMetrics
      }
    };

    // Ensure directory exists
    const exportDir = path.dirname(options.exportPath);
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    fs.writeFileSync(options.exportPath, JSON.stringify(exportData, null, 2));
    logger.info(`Data exported successfully`);
  }

  logger.info('\nPlaintiff map update complete!');
}

/**
 * Parse command line arguments
 */
function parseArgs(): UpdateOptions {
  const args = process.argv.slice(2);
  const options: UpdateOptions = {
    days: 90 // Default to 90 days
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--days' && args[i + 1]) {
      options.days = parseInt(args[++i]);
    } else if (arg === '--export' && args[i + 1]) {
      options.exportPath = args[++i];
    } else if (arg === '--help') {
      console.log(`
Usage: ts-node scripts/updatePlaintiffMap.ts [options]

Options:
  --days <number>     Number of days to analyze (default: 90)
  --export <path>     Export results to JSON file
  --help              Show this help message

Examples:
  ts-node scripts/updatePlaintiffMap.ts
  ts-node scripts/updatePlaintiffMap.ts --days 30
  ts-node scripts/updatePlaintiffMap.ts --days 90 --export ./data/plaintiff-map.json
      `);
      process.exit(0);
    }
  }

  return options;
}

/**
 * Main execution
 */
if (require.main === module) {
  const options = parseArgs();

  updatePlaintiffMap(options)
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Plaintiff map update failed:', error);
      process.exit(1);
    });
}

export { updatePlaintiffMap };
