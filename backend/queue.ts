/**
 * BullMQ Background Job Queue
 * Prevents scanner from hanging by processing scans asynchronously
 *
 * TIER 1: Uses Browserless.io instead of local Playwright for production scaling
 */

import { Queue, Worker, Job } from 'bullmq';
import redis from './redisConfig';
import { v4 as uuidv4 } from 'uuid';
import { browserlessService } from './browserless-service';

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

/**
 * Perform scan using Browserless.io service
 * This offloads browser memory requirements from Vercel
 */
async function performScan(url: string) {
  try {
    // Validate URL
    const parsedUrl = new URL(url);
    const fullUrl = parsedUrl.toString();

    console.log(`🌐 [SCAN] Starting Browserless scan: ${fullUrl}`);

    // Call Browserless service (no local browser needed!)
    const result = await browserlessService.performScan({
      url: fullUrl,
      timeout: 30000,
      waitUntil: 'networkidle'
    });

    // Recalculate risk scores using our metrics
    const riskScore = calculateRiskScore(result.violations.total, result.violations.critical);
    const estimatedLawsuitCost = estimateLitigationCost(result.violations.total);

    return {
      violations: result.violations,
      riskScore,
      estimatedLawsuitCost,
      topViolations: result.topViolations
    };
  } catch (error) {
    console.error(`❌ [SCAN] Browserless scan failed for ${url}:`, error);
    throw error;
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
