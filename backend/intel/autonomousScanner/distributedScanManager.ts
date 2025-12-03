/**
 * Distributed Scan Manager
 *
 * Orchestrates distributed scanning across multiple nodes with load balancing,
 * fault tolerance, and intelligent scheduling.
 */

import { logger } from '../../../utils/logger';
import { CrawlNode, CrawlResult, createCrawlNode } from './crawlNode';
import { proxyPool } from './proxyPool';
import { generateFingerprint } from './fingerprinting';
import { gridScheduler, ScanTarget } from './gridScheduler';

export interface ScanCluster {
  nodes: CrawlNode[];
  activeScans: number;
  totalScans: number;
  failedScans: number;
  averageScanTime: number;
}

export interface DistributedScanConfig {
  nodeCount: number;
  maxConcurrentScansPerNode: number;
  retryFailedScans: boolean;
  maxRetries: number;
  useProxies: boolean;
  rotatefingerprints: boolean;
}

export class DistributedScanManager {
  private config: DistributedScanConfig;
  private cluster: ScanCluster;
  private scanResults: Map<string, CrawlResult> = new Map();
  private isInitialized: boolean = false;

  constructor(config: Partial<DistributedScanConfig> = {}) {
    this.config = {
      nodeCount: 3,
      maxConcurrentScansPerNode: 2,
      retryFailedScans: true,
      maxRetries: 3,
      useProxies: false,
      rotatefingerprints: true,
      ...config
    };

    this.cluster = {
      nodes: [],
      activeScans: 0,
      totalScans: 0,
      failedScans: 0,
      averageScanTime: 0
    };
  }

  /**
   * Initialize the scan cluster
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.warn('Scan cluster already initialized');
      return;
    }

    logger.info(`Initializing scan cluster with ${this.config.nodeCount} nodes`);

    // Create crawl nodes
    for (let i = 0; i < this.config.nodeCount; i++) {
      try {
        const node = await createCrawlNode(`node-${i}`);
        this.cluster.nodes.push(node);
        logger.info(`Node ${i} initialized`);
      } catch (error) {
        logger.error(`Failed to initialize node ${i}:`, error);
      }
    }

    if (this.cluster.nodes.length === 0) {
      throw new Error('Failed to initialize any scan nodes');
    }

    this.isInitialized = true;
    logger.info(`Scan cluster initialized with ${this.cluster.nodes.length} nodes`);
  }

  /**
   * Execute a distributed scan across multiple domains
   */
  async executeDis tributedScan(domains: string[]): Promise<Map<string, CrawlResult>> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    logger.info(`Starting distributed scan of ${domains.length} domains`);

    const scanPromises: Promise<void>[] = [];
    const semaphore = this.createSemaphore(
      this.cluster.nodes.length * this.config.maxConcurrentScansPerNode
    );

    for (const domain of domains) {
      const scanPromise = semaphore.acquire().then(async (release) => {
        try {
          await this.scanDomain(domain);
        } finally {
          release();
        }
      });

      scanPromises.push(scanPromise);
    }

    // Wait for all scans to complete
    await Promise.all(scanPromises);

    logger.info(`Distributed scan complete: ${this.scanResults.size} results`);

    return this.scanResults;
  }

  /**
   * Scan a single domain
   */
  private async scanDomain(domain: string, retryCount: number = 0): Promise<void> {
    const startTime = Date.now();

    try {
      // Select a node (round-robin for now)
      const node = this.selectNode();

      // Generate fingerprint if configured
      const fingerprint = this.config.rotatefingerprints
        ? generateFingerprint()
        : undefined;

      // Get proxy if configured
      const proxy = this.config.useProxies
        ? proxyPool.getProxy() || undefined
        : undefined;

      // Execute scan
      this.cluster.activeScans++;
      const result = await node.scanNode({
        url: `https://${domain}`,
        fingerprint,
        proxy,
        timeout: 30000
      });

      // Store result
      this.scanResults.set(domain, result);

      // Update stats
      this.cluster.totalScans++;
      const scanTime = Date.now() - startTime;
      this.updateAverageScanTime(scanTime);

      logger.info(`Scan complete: ${domain} (${scanTime}ms)`);

      // Report proxy success if used
      if (proxy) {
        proxyPool.reportSuccess(proxy);
      }

    } catch (error) {
      logger.error(`Scan failed for ${domain}:`, error);

      this.cluster.failedScans++;

      // Retry if configured
      if (this.config.retryFailedScans && retryCount < this.config.maxRetries) {
        logger.info(`Retrying ${domain} (attempt ${retryCount + 1}/${this.config.maxRetries})`);
        await this.scanDomain(domain, retryCount + 1);
      } else {
        // Store error result
        this.scanResults.set(domain, {
          url: domain,
          statusCode: 0,
          html: '',
          error: error instanceof Error ? error.message : 'Unknown error',
          crawledAt: new Date()
        });
      }

    } finally {
      this.cluster.activeScans--;
    }
  }

  /**
   * Select a node for scanning (simple round-robin)
   */
  private selectNode(): CrawlNode {
    const index = this.cluster.totalScans % this.cluster.nodes.length;
    return this.cluster.nodes[index];
  }

  /**
   * Update average scan time
   */
  private updateAverageScanTime(scanTime: number): void {
    const totalTime = this.cluster.averageScanTime * (this.cluster.totalScans - 1);
    this.cluster.averageScanTime = (totalTime + scanTime) / this.cluster.totalScans;
  }

  /**
   * Create a semaphore for concurrency control
   */
  private createSemaphore(maxConcurrent: number) {
    let currentCount = 0;
    const queue: Array<() => void> = [];

    return {
      acquire: (): Promise<() => void> => {
        return new Promise((resolve) => {
          const tryAcquire = () => {
            if (currentCount < maxConcurrent) {
              currentCount++;
              resolve(() => {
                currentCount--;
                const next = queue.shift();
                if (next) next();
              });
            } else {
              queue.push(tryAcquire);
            }
          };
          tryAcquire();
        });
      }
    };
  }

  /**
   * Get scan results
   */
  getResults(): Map<string, CrawlResult> {
    return this.scanResults;
  }

  /**
   * Get cluster statistics
   */
  getClusterStats() {
    return {
      nodes: this.cluster.nodes.length,
      activeScans: this.cluster.activeScans,
      totalScans: this.cluster.totalScans,
      failedScans: this.cluster.failedScans,
      successRate: this.cluster.totalScans > 0
        ? ((this.cluster.totalScans - this.cluster.failedScans) / this.cluster.totalScans) * 100
        : 0,
      averageScanTime: Math.round(this.cluster.averageScanTime),
      resultsCollected: this.scanResults.size
    };
  }

  /**
   * Shutdown the scan cluster
   */
  async shutdown(): Promise<void> {
    logger.info('Shutting down scan cluster');

    const shutdownPromises = this.cluster.nodes.map(node => node.shutdown());
    await Promise.all(shutdownPromises);

    this.isInitialized = false;
    this.cluster.nodes = [];

    logger.info('Scan cluster shut down');
  }

  /**
   * Clear scan results
   */
  clearResults(): void {
    this.scanResults.clear();
    logger.info('Scan results cleared');
  }
}

/**
 * Singleton instance
 */
export const scanManager = new DistributedScanManager({
  nodeCount: 3,
  maxConcurrentScansPerNode: 2,
  useProxies: false,
  rotatefingerprints: true
});

/**
 * Main export function
 */
export async function executeDist ributedScan(domains: string[]): Promise<Map<string, CrawlResult>> {
  return scanManager.executeDistributedScan(domains);
}
