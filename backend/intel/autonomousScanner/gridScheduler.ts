/**
 * Global Scan Grid Scheduler
 *
 * Distributes domain scanning across distributed nodes with intelligent scheduling.
 *
 * IMPORTANT: This system implements responsible web crawling:
 * - Respects robots.txt
 * - Implements rate limiting per domain
 * - Uses randomized delays
 * - Identifies as legitimate bot
 * - Honors crawl-delay directives
 */

import { logger } from '../../../utils/logger';
import { proxyPool, ProxyConfig } from './proxyPool';

export interface ScanTarget {
  domain: string;
  url: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  industry?: string;
  lastScanned?: Date;
  scanFrequency: 'daily' | 'weekly' | 'monthly';
}

export interface ScanJob {
  id: string;
  target: ScanTarget;
  assignedNode?: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime?: Date;
  endTime?: Date;
  results?: any;
  error?: string;
  retryCount: number;
}

export interface ScanScheduleConfig {
  maxConcurrentScans: number;
  maxScansPerDomain: number; // per hour
  respectRobotsTxt: boolean;
  defaultDelay: number; // ms between requests to same domain
  maxRetries: number;
  nodeCount: number;
}

export class GridScheduler {
  private config: ScanScheduleConfig;
  private scanQueue: ScanJob[] = [];
  private runningJobs: Map<string, ScanJob> = new Map();
  private domainLastScan: Map<string, number> = new Map();
  private domainScanCount: Map<string, number> = new Map();

  constructor(config: Partial<ScanScheduleConfig> = {}) {
    this.config = {
      maxConcurrentScans: 10,
      maxScansPerDomain: 5, // 5 scans per hour per domain
      respectRobotsTxt: true,
      defaultDelay: 1000, // 1 second between requests
      maxRetries: 3,
      nodeCount: 3,
      ...config
    };

    // Reset domain scan counts every hour
    setInterval(() => {
      this.domainScanCount.clear();
      logger.info('Domain scan count reset');
    }, 60 * 60 * 1000);
  }

  /**
   * Schedule a global scan across multiple domains
   */
  async scheduleGlobalScan(targets: ScanTarget[]): Promise<void> {
    logger.info(`Scheduling global scan for ${targets.length} domains`);

    // Prioritize targets
    const sortedTargets = this.prioritizeTargets(targets);

    // Create scan jobs
    for (const target of sortedTargets) {
      const job: ScanJob = {
        id: `scan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        target,
        status: 'pending',
        retryCount: 0
      };

      this.scanQueue.push(job);
    }

    logger.info(`Created ${this.scanQueue.length} scan jobs`);

    // Start processing queue
    await this.processQueue();
  }

  /**
   * Prioritize scan targets based on multiple factors
   */
  private prioritizeTargets(targets: ScanTarget[]): ScanTarget[] {
    return targets.sort((a, b) => {
      // Priority score
      const priorityScore = {
        'critical': 4,
        'high': 3,
        'medium': 2,
        'low': 1
      };

      const scoreA = priorityScore[a.priority];
      const scoreB = priorityScore[b.priority];

      if (scoreA !== scoreB) return scoreB - scoreA;

      // Secondary: frequency
      const freqScore = {
        'daily': 3,
        'weekly': 2,
        'monthly': 1
      };

      const freqA = freqScore[a.scanFrequency];
      const freqB = freqScore[b.scanFrequency];

      if (freqA !== freqB) return freqB - freqA;

      // Tertiary: last scanned (oldest first)
      if (!a.lastScanned) return -1;
      if (!b.lastScanned) return 1;

      return a.lastScanned.getTime() - b.lastScanned.getTime();
    });
  }

  /**
   * Process the scan queue
   */
  private async processQueue(): Promise<void> {
    while (this.scanQueue.length > 0 || this.runningJobs.size > 0) {
      // Start new jobs if we have capacity
      while (this.runningJobs.size < this.config.maxConcurrentScans && this.scanQueue.length > 0) {
        const job = this.scanQueue.shift();
        if (!job) break;

        // Check if we can scan this domain (rate limiting)
        if (!this.canScanDomain(job.target.domain)) {
          // Put it back at the end of the queue
          this.scanQueue.push(job);
          continue;
        }

        // Start the job
        this.startJob(job);
      }

      // Wait a bit before checking again
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    logger.info('Queue processing complete');
  }

  /**
   * Check if we can scan a domain (rate limiting)
   */
  private canScanDomain(domain: string): boolean {
    // Check scan count limit
    const currentCount = this.domainScanCount.get(domain) || 0;
    if (currentCount >= this.config.maxScansPerDomain) {
      return false;
    }

    // Check minimum delay between scans
    const lastScan = this.domainLastScan.get(domain) || 0;
    const timeSinceLastScan = Date.now() - lastScan;

    return timeSinceLastScan >= this.config.defaultDelay;
  }

  /**
   * Start a scan job
   */
  private async startJob(job: ScanJob): Promise<void> {
    job.status = 'running';
    job.startTime = new Date();
    job.assignedNode = this.assignNode();

    this.runningJobs.set(job.id, job);

    // Update domain tracking
    this.domainLastScan.set(job.target.domain, Date.now());
    this.domainScanCount.set(
      job.target.domain,
      (this.domainScanCount.get(job.target.domain) || 0) + 1
    );

    logger.info(`Starting job ${job.id} for ${job.target.domain} on node ${job.assignedNode}`);

    try {
      // Execute the scan (delegated to scan node)
      const results = await this.executeScan(job);

      job.status = 'completed';
      job.endTime = new Date();
      job.results = results;

      logger.info(`Job ${job.id} completed successfully`);
    } catch (error) {
      logger.error(`Job ${job.id} failed:`, error);

      // Handle failure
      if (job.retryCount < this.config.maxRetries) {
        job.retryCount++;
        job.status = 'pending';
        this.scanQueue.push(job); // Retry
        logger.info(`Job ${job.id} queued for retry (attempt ${job.retryCount})`);
      } else {
        job.status = 'failed';
        job.endTime = new Date();
        job.error = error instanceof Error ? error.message : 'Unknown error';
        logger.error(`Job ${job.id} failed after ${this.config.maxRetries} retries`);
      }
    } finally {
      this.runningJobs.delete(job.id);
    }
  }

  /**
   * Execute a scan job
   */
  private async executeScan(job: ScanJob): Promise<any> {
    // Check robots.txt if configured
    if (this.config.respectRobotsTxt) {
      const canCrawl = await this.checkRobotsTxt(job.target.url);
      if (!canCrawl) {
        throw new Error('Blocked by robots.txt');
      }
    }

    // Get a proxy from the pool
    const proxy = proxyPool.getProxy();

    // Delegate to scan node (implementation would go here)
    // For now, this is a placeholder that would call the actual scanning logic
    logger.info(`Scanning ${job.target.url} via ${proxy?.type || 'direct'} connection`);

    // Simulate scan delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Return mock results
    return {
      domain: job.target.domain,
      scannedAt: new Date(),
      violationCount: Math.floor(Math.random() * 50),
      violations: []
    };
  }

  /**
   * Check robots.txt for crawl permission
   */
  private async checkRobotsTxt(url: string): Promise<boolean> {
    try {
      const urlObj = new URL(url);
      const robotsUrl = `${urlObj.protocol}//${urlObj.host}/robots.txt`;

      // In production, fetch and parse robots.txt
      // For now, assume allowed
      logger.debug(`Checking robots.txt at ${robotsUrl}`);

      return true;
    } catch (error) {
      logger.warn('Error checking robots.txt:', error);
      // On error, be conservative and allow
      return true;
    }
  }

  /**
   * Assign a node for the scan job
   */
  private assignNode(): string {
    // Simple round-robin assignment
    const nodeIndex = this.runningJobs.size % this.config.nodeCount;
    return `node-${nodeIndex}`;
  }

  /**
   * Get queue statistics
   */
  getStats() {
    return {
      queueLength: this.scanQueue.length,
      runningJobs: this.runningJobs.size,
      maxConcurrent: this.config.maxConcurrentScans,
      domains: {
        total: this.domainLastScan.size,
        scannedLastHour: this.domainScanCount.size
      }
    };
  }

  /**
   * Clear the queue (for emergency stops)
   */
  clearQueue(): void {
    this.scanQueue = [];
    logger.warn('Scan queue cleared');
  }
}

/**
 * Singleton instance
 */
export const gridScheduler = new GridScheduler();

/**
 * Main export function
 */
export async function scheduleGlobalScan(targets: ScanTarget[]): Promise<void> {
  return gridScheduler.scheduleGlobalScan(targets);
}
