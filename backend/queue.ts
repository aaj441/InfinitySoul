/**
 * BullMQ Background Job Queue
 * Prevents scanner from hanging by processing scans asynchronously
 */

import { Queue, Worker, Job } from 'bullmq';
import redis from './redisConfig';
import { chromium } from 'playwright';
import { v4 as uuidv4 } from 'uuid';

// ============ TYPES ============

export interface ScanJob {
  url: string;
  email?: string;
  auditId: string;
}

export interface ScanJobResult {
  auditId: string;
  url: string;
  timestamp: string;
  status: 'success' | 'failed';
  violations?: {
    critical: number;
    serious: number;
    moderate: number;
    minor: number;
    total: number;
  };
  riskScore?: number;
  estimatedLawsuitCost?: number;
  topViolations?: Array<{
    code: string;
    description: string;
    violationCount: number;
  }>;
  error?: string;
}

// ============ QUEUE CREATION ============

export const scanQueue = new Queue<ScanJob>('accessibility-scan', {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    },
    removeOnComplete: true,
    removeOnFail: false
  }
});

// ============ WORKER SETUP ============

export const scanWorker = new Worker<ScanJob, ScanJobResult>(
  'accessibility-scan',
  async (job: Job<ScanJob>): Promise<ScanJobResult> => {
    console.log(`🔍 [WORKER] Processing scan job ${job.id}: ${job.data.url}`);

    try {
      // Run the actual scan
      const result = await performScan(job.data.url);

      // Mark job progress
      job.progress(100);

      return {
        auditId: job.data.auditId,
        url: job.data.url,
        timestamp: new Date().toISOString(),
        status: 'success',
        ...result
      };
    } catch (error) {
      console.error(`❌ [WORKER] Scan failed for ${job.data.url}:`, error);
      throw error; // Will trigger retry or move to failed queue
    }
  },
  {
    connection: redis,
    concurrency: 5, // Process 5 scans in parallel
    limiter: {
      max: 10, // Max 10 jobs per second
      duration: 1000
    },
    maxStalledCount: 2,
    stalledInterval: 30000,
    lockDuration: 30000
  }
);

// ============ WORKER EVENTS ============

scanWorker.on('completed', (job) => {
  console.log(`✅ [WORKER] Completed: ${job.id}`);
});

scanWorker.on('failed', (job, err) => {
  console.error(`❌ [WORKER] Failed: ${job?.id} - ${err.message}`);
});

scanWorker.on('stalled', (jobId) => {
  console.warn(`⚠️ [WORKER] Stalled: ${jobId} - restarting...`);
});

// ============ ACTUAL SCAN LOGIC ============

async function performScan(url: string) {
  let browser;
  try {
    // Validate URL
    const parsedUrl = new URL(url);
    const fullUrl = parsedUrl.toString();

    // Launch browser
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Navigate and wait for load
    await page.goto(fullUrl, { waitUntil: 'networkidle', timeout: 30000 });

    // Inject axe-core
    await page.evaluate(() => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.7.2/axe.min.js';
      script.onload = function () {
        (window as any).axeReady = true;
      };
      document.head.appendChild(script);
    });

    // Wait for axe to load
    await page.waitForFunction(() => (window as any).axeReady, { timeout: 10000 });

    // Run axe scan
    const results = await page.evaluate(() => {
      return new Promise((resolve, reject) => {
        (window as any).axe.run((error: any, results: any) => {
          if (error) reject(error);
          resolve(results);
        });
      });
    });

    // Parse results
    const axeResults: any = results;
    const violations = {
      critical: axeResults.violations.filter((v: any) => v.impact === 'critical').length,
      serious: axeResults.violations.filter((v: any) => v.impact === 'serious').length,
      moderate: axeResults.violations.filter((v: any) => v.impact === 'moderate').length,
      minor: axeResults.violations.filter((v: any) => v.impact === 'minor').length,
      total: axeResults.violations.length
    };

    const topViolations = axeResults.violations
      .slice(0, 5)
      .map((v: any) => ({
        code: v.id,
        description: v.description,
        violationCount: v.nodes.length
      }));

    // Calculate risk
    const riskScore = calculateRiskScore(violations.total, violations.critical);
    const estimatedLawsuitCost = estimateLitigationCost(violations.total);

    return {
      violations,
      riskScore,
      estimatedLawsuitCost,
      topViolations
    };
  } catch (error) {
    throw error;
  } finally {
    // Always close browser, regardless of success or failure
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error('⚠️ [SCAN] Error closing browser:', closeError);
        // Don't throw - browser cleanup failure shouldn't crash the job
      }
    }
  }
}

// ============ RISK CALCULATIONS ============

function calculateRiskScore(violationCount: number, criticalCount: number): number {
  const baseScore = Math.min(violationCount * 1.5, 100);
  const criticalBoost = criticalCount * 5;
  return Math.min(baseScore + criticalBoost, 100);
}

function estimateLitigationCost(violationCount: number): number {
  const baseSettlement = 50000;
  const perViolationCost = 2500;
  return baseSettlement + (violationCount * perViolationCost);
}

// ============ QUEUE METHODS ============

export async function addScanJob(url: string, email?: string) {
  const auditId = uuidv4();

  const job = await scanQueue.add(
    {
      url,
      email,
      auditId
    },
    {
      jobId: auditId,
      priority: email ? 10 : 5, // Authenticated users get priority
    }
  );

  return { jobId: job.id, auditId };
}

export async function getScanJobStatus(auditId: string) {
  try {
    const job = await scanQueue.getJob(auditId);

    if (!job) {
      return null;
    }

    const state = await job.getState();
    const progress = job._progress || 0;

    return {
      auditId,
      state,
      progress,
      isCompleted: state === 'completed',
      isFailed: state === 'failed'
    };
  } catch (error) {
    console.error('Error getting job status:', error);
    return null;
  }
}

export async function getScanResult(auditId: string): Promise<ScanJobResult | null> {
  try {
    const job = await scanQueue.getJob(auditId);

    if (!job) {
      return null;
    }

    if (job.finishedOn) {
      return job.data as any;
    }

    return null;
  } catch (error) {
    console.error('Error getting scan result:', error);
    return null;
  }
}

// ============ GRACEFUL SHUTDOWN ============

export async function closeQueue() {
  try {
    await scanWorker.close();
    await scanQueue.close();
    console.log('✅ Queue closed gracefully');
  } catch (error) {
    console.error('Error closing queue:', error);
    process.exit(1);
  }
}
