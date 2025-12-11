import Queue from "bull";
import Redis from "redis";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

// Job queue configuration
export const scanQueue = new Queue("scans", redisUrl);
export const competitiveQueue = new Queue("competitive", redisUrl);
export const remediationQueue = new Queue("remediations", redisUrl);
export const analyticsQueue = new Queue("analytics", redisUrl);

// Exponential backoff retry strategy
const backoffStrategy = {
  type: "exponential",
  delay: 2000, // Start with 2 seconds
};

// Configure queue options
scanQueue.defaultJobOptions = {
  attempts: 3,
  backoff: backoffStrategy,
  removeOnComplete: true,
  removeOnFail: false,
};

competitiveQueue.defaultJobOptions = {
  attempts: 2,
  backoff: backoffStrategy,
  removeOnComplete: true,
};

remediationQueue.defaultJobOptions = {
  attempts: 2,
  backoff: backoffStrategy,
  removeOnComplete: true,
};

analyticsQueue.defaultJobOptions = {
  attempts: 1,
  removeOnComplete: true,
};

// Queue event handlers
scanQueue.on("failed", (job, err) => {
  console.error(`Scan job ${job.id} failed:`, err.message);
});

scanQueue.on("completed", (job) => {
  console.log(`Scan job ${job.id} completed`);
});

competitiveQueue.on("failed", (job, err) => {
  console.error(`Competitive analysis job ${job.id} failed:`, err.message);
});

remediationQueue.on("failed", (job, err) => {
  console.error(`Remediation job ${job.id} failed:`, err.message);
});

// Helper to add job to queue
export async function addScanJob(data: any) {
  return scanQueue.add(data, { jobId: `scan-${Date.now()}` });
}

export async function addCompetitiveJob(data: any) {
  return competitiveQueue.add(data, { jobId: `comp-${Date.now()}` });
}

export async function addRemediationJob(data: any) {
  return remediationQueue.add(data, { jobId: `remed-${Date.now()}` });
}

export async function addAnalyticsJob(data: any) {
  return analyticsQueue.add(data, { jobId: `analytics-${Date.now()}` });
}

// Get job status
export async function getJobStatus(jobId: string, queueName: string) {
  const queue =
    queueName === "scans"
      ? scanQueue
      : queueName === "competitive"
        ? competitiveQueue
        : queueName === "remediations"
          ? remediationQueue
          : analyticsQueue;

  const job = await queue.getJob(jobId);
  if (!job) return null;

  return {
    id: job.id,
    status: await job.getState(),
    progress: job.progress(),
    data: job.data,
    result: job.returnvalue,
    failedReason: job.failedReason,
    attempts: job.attemptsMade,
    maxAttempts: job.opts.attempts,
  };
}

// Process scan jobs
export function processScanJobs(callback: (job: any) => Promise<any>) {
  scanQueue.process(callback);
}

// Process competitive jobs
export function processCompetitiveJobs(callback: (job: any) => Promise<any>) {
  competitiveQueue.process(callback);
}

// Process remediation jobs
export function processRemediationJobs(callback: (job: any) => Promise<any>) {
  remediationQueue.process(callback);
}

// Process analytics jobs
export function processAnalyticsJobs(callback: (job: any) => Promise<any>) {
  analyticsQueue.process(callback);
}

// Cleanup
export async function closeQueues() {
  await Promise.all([
    scanQueue.close(),
    competitiveQueue.close(),
    remediationQueue.close(),
    analyticsQueue.close(),
  ]);
}
