/**
 * Run Global Scan Script
 *
 * Executes a distributed scan across a list of domains.
 * Used for batch scanning and scheduled jobs.
 *
 * Usage:
 *   ts-node scripts/runGlobalScan.ts --domains domains.txt
 *   ts-node scripts/runGlobalScan.ts --count 100 --industry retail
 */

import { scanManager } from '../backend/intel/autonomousScanner/distributedScanManager';
import { logger } from '../utils/logger';
import * as fs from 'fs';
import * as path from 'path';

interface ScanOptions {
  domainsFile?: string;
  domains?: string[];
  count?: number;
  industry?: string;
}

async function runGlobalScan(options: ScanOptions): Promise<void> {
  logger.info('Starting global scan...');

  let domains: string[] = [];

  // Load domains from file
  if (options.domainsFile) {
    const filePath = path.resolve(options.domainsFile);

    if (!fs.existsSync(filePath)) {
      throw new Error(`Domains file not found: ${filePath}`);
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    domains = content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#'));

    logger.info(`Loaded ${domains.length} domains from ${filePath}`);
  }

  // Use provided domains
  if (options.domains) {
    domains = [...domains, ...options.domains];
  }

  // Generate sample domains if count specified
  if (options.count) {
    const sampleDomains = generateSampleDomains(options.count, options.industry);
    domains = [...domains, ...sampleDomains];
  }

  if (domains.length === 0) {
    throw new Error('No domains to scan. Provide --domains, --domains-file, or --count');
  }

  logger.info(`Scanning ${domains.length} domains...`);

  // Initialize scan manager
  await scanManager.initialize();

  // Execute scan
  const startTime = Date.now();
  const results = await scanManager.executeDistributedScan(domains);
  const duration = Date.now() - startTime;

  // Print results
  logger.info(`\n${'='.repeat(60)}`);
  logger.info('SCAN COMPLETE');
  logger.info(`${'='.repeat(60)}`);
  logger.info(`Total Domains: ${domains.length}`);
  logger.info(`Results Collected: ${results.size}`);
  logger.info(`Duration: ${(duration / 1000).toFixed(2)}s`);
  logger.info(`Average: ${(duration / domains.length).toFixed(0)}ms per domain`);

  // Stats
  const stats = scanManager.getClusterStats();
  logger.info(`\nCluster Stats:`);
  logger.info(`- Nodes: ${stats.nodes}`);
  logger.info(`- Total Scans: ${stats.totalScans}`);
  logger.info(`- Failed Scans: ${stats.failedScans}`);
  logger.info(`- Success Rate: ${stats.successRate.toFixed(1)}%`);
  logger.info(`- Avg Scan Time: ${stats.averageScanTime}ms`);

  // Save results
  const resultsFile = `scan-results-${Date.now()}.json`;
  const resultsPath = path.join(__dirname, '..', 'results', resultsFile);

  // Ensure results directory exists
  const resultsDir = path.dirname(resultsPath);
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }

  // Convert Map to object for JSON serialization
  const resultsObject: any = {};
  for (const [domain, result] of results.entries()) {
    resultsObject[domain] = {
      url: result.url,
      statusCode: result.statusCode,
      violationCount: result.violations?.length || 0,
      error: result.error,
      crawledAt: result.crawledAt
    };
  }

  fs.writeFileSync(resultsPath, JSON.stringify(resultsObject, null, 2));
  logger.info(`\nResults saved to: ${resultsPath}`);

  // Shutdown
  await scanManager.shutdown();

  logger.info('\nGlobal scan complete!');
}

/**
 * Generate sample domains for testing
 */
function generateSampleDomains(count: number, industry?: string): string[] {
  const domains: string[] = [];
  const industries = industry ? [industry] : ['retail', 'food', 'healthcare', 'finance'];

  for (let i = 0; i < count; i++) {
    const ind = industries[i % industries.length];
    domains.push(`example-${ind}-${i}.com`);
  }

  return domains;
}

/**
 * Parse command line arguments
 */
function parseArgs(): ScanOptions {
  const args = process.argv.slice(2);
  const options: ScanOptions = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--domains-file' && args[i + 1]) {
      options.domainsFile = args[++i];
    } else if (arg === '--domains' && args[i + 1]) {
      options.domains = args[++i].split(',');
    } else if (arg === '--count' && args[i + 1]) {
      options.count = parseInt(args[++i]);
    } else if (arg === '--industry' && args[i + 1]) {
      options.industry = args[++i];
    } else if (arg === '--help') {
      console.log(`
Usage: ts-node scripts/runGlobalScan.ts [options]

Options:
  --domains-file <path>   Path to file with domains (one per line)
  --domains <list>        Comma-separated list of domains
  --count <number>        Generate N sample domains for testing
  --industry <name>       Filter by industry (for sample domains)
  --help                  Show this help message

Examples:
  ts-node scripts/runGlobalScan.ts --domains-file domains.txt
  ts-node scripts/runGlobalScan.ts --domains "example.com,test.com"
  ts-node scripts/runGlobalScan.ts --count 10 --industry retail
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

  runGlobalScan(options)
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Global scan failed:', error);
      process.exit(1);
    });
}

export { runGlobalScan };
