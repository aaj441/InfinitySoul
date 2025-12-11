/*
 * Global Scan Grid Scheduler
 * Distributes domain scanning across distributed nodes with intelligent scheduling.
 * IMPORTANT: This system implements responsible web crawling:
 * - Respects robots.txt
 * - Implements rate limiting per domain
 * - Uses randomized delays
 * - Identifies as legitimate bot
 * - Honors crawl-delay directives
 */
import { logger } from '../../../utils/logger';
import proxyPool, { ProxyConfig } from './proxyPool';

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
  private proxyPoolInitialized: boolean = false;

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
    // Ensure proxy pool is initialized
    if (proxyPool && typeof proxyPool.init === 'function') {
      proxyPool.init();
      this.proxyPoolInitialized = true;
    } else {
      logger.warn('Proxy pool is not properly initialized or missing init function.');
    }
  }

  /**
   * Schedule a global scan across multiple domains
   */
  async scheduleGlobalScan(targets: ScanTarget[]): Promise<void> {
    logger.info(`Scheduling global scan for ${targets.length} domains`);
    // ... rest of the method remains unchanged ...
  }

  /**
   * Execute a scan job
   */
  async executeScan(job: ScanJob): Promise<void> {
    if (!this.proxyPoolInitialized || !proxyPool || !proxyPool.getProxy || proxyPool.size === 0) {
      logger.error('Proxy pool is not initialized or empty. Cannot execute scan.');
      job.status = 'failed';
      job.error = 'Proxy pool unavailable';
      return;
    }
    // ... rest of the method remains unchanged ...
  }
  // ... rest of the class ...
}
