/**
 * InfinitySoul Queue Service
 * Redis-backed async scan processing
 * Handles 10K+ concurrent scans without timeouts
 */

import { Queue, Worker, QueueEvents } from 'bullmq';
import IORedis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';

// Redis connection pool
const redisConnection = new IORedis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  enableOfflineQueue: false,
});

// Main scan queue
export const scanQueue = new Queue('scan_jobs', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: { age: 86400 }, // Keep for 24h
    removeOnFail: false, // Keep failed jobs for debugging
  },
});

// Queue events for monitoring
export const queueEvents = new QueueEvents('scan_jobs', {
  connection: redisConnection,
});

// Job data type
export interface ScanJobData {
  url: string;
  email?: string;
  organizationId?: string;
  maxPages?: number;
  priority?: number;
}

export interface ScanJobResult {
  success: boolean;
  violations?: {
    critical: number;
    serious: number;
    moderate: number;
    minor: number;
    total: number;
  };
  riskScore?: number;
  estimatedLawsuitCost?: number;
  completedAt?: string;
  error?: string;
}

/**
 * Queue a new scan job
 */
export async function enqueueScan(data: ScanJobData) {
  try {
    const job = await scanQueue.add('scan', data, {
      priority: data.priority || 5,
      jobId: uuidv4(),
    });

    return {
      jobId: job.id,
      status: 'queued',
      url: data.url,
      message: 'Scan queued for processing',
      estimatedTime: '30-60 seconds',
    };
  } catch (error) {
    console.error('[Queue Error]', error);
    throw error;
  }
}

/**
 * Get job status and results
 */
export async function getJobStatus(jobId: string) {
  try {
    const job = await scanQueue.getJob(jobId);

    if (!job) {
      return {
        jobId,
        status: 'not_found',
        message: 'Job not found in queue',
      };
    }

    const state = await job.getState();
    const progress = job.progress();
    const result = job.returnvalue as ScanJobResult | null;
    const failedReason = job.failedReason;

    return {
      jobId,
      status: state,
      progress: typeof progress === 'number' ? progress : 0,
      url: job.data.url,
      result: state === 'completed' ? result : null,
      error: state === 'failed' ? failedReason : null,
      createdAt: job.createdTimestamp,
      processedAt: job.processedOn,
      completedAt: job.finishedOn,
    };
  } catch (error) {
    console.error('[Status Error]', error);
    throw error;
  }
}

/**
 * Get queue statistics
 */
export async function getQueueStats() {
  try {
    const counts = await scanQueue.getJobCounts('wait', 'active', 'completed', 'failed', 'delayed');
    const activeCount = await scanQueue.getActiveCount();
    const delayedCount = await scanQueue.getDelayedCount();

    return {
      waiting: counts.wait || 0,
      active: activeCount,
      completed: counts.completed || 0,
      failed: counts.failed || 0,
      delayed: delayedCount,
      totalJobs: (counts.wait || 0) + activeCount + (counts.completed || 0),
    };
  } catch (error) {
    console.error('[Stats Error]', error);
    throw error;
  }
}

/**
 * Retry failed jobs
 */
export async function retryFailedJob(jobId: string) {
  try {
    const job = await scanQueue.getJob(jobId);

    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    const state = await job.getState();
    if (state !== 'failed') {
      throw new Error(`Job ${jobId} is not in failed state`);
    }

    await job.retry();

    return {
      jobId,
      status: 'retrying',
      message: 'Job has been requeued',
    };
  } catch (error) {
    console.error('[Retry Error]', error);
    throw error;
  }
}

/**
 * Clear all jobs from queue (caution: production use)
 */
export async function clearQueue() {
  try {
    await scanQueue.drain();
    return {
      status: 'cleared',
      message: 'All jobs removed from queue',
    };
  } catch (error) {
    console.error('[Clear Error]', error);
    throw error;
  }
}

/**
 * Health check
 */
export async function checkQueueHealth() {
  try {
    // Try to ping Redis
    const pingResult = await redisConnection.ping();
    const stats = await getQueueStats();

    return {
      status: 'healthy',
      redis: pingResult === 'PONG' ? 'connected' : 'disconnected',
      queueStats: stats,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('[Health Check Error]', error);
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export default scanQueue;
