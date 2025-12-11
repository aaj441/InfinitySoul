import { storage } from "../db-storage";
import { wcagScanner } from "../services/wcag-scanner";

export interface AgentStatus {
  scansToday: number;
  scansCompleted: number;
  scansFailed: number;
  emailsSent: number;
  lastActivity: Date;
  queuedJobs: number;
  runningJobs: number;
  failedJobs: number;
}

export class MonitorAgent {
  private isRunning = false;
  private maxRetries = 3;

  async monitor(): Promise<void> {
    if (this.isRunning) {
      console.log("Monitor Agent: Already running, skipping...");
      return;
    }

    this.isRunning = true;
    try {
      console.log("Monitor Agent: Starting monitoring cycle...");

      // Get failed jobs
      const allJobs = await storage.getScanJobs();
      const failedJobs = allJobs.filter((job) => job.status === "failed");

      console.log(`Monitor Agent: Found ${failedJobs.length} failed jobs`);

      // Retry failed jobs (with backoff)
      let retriedCount = 0;
      for (const job of failedJobs) {
        // In real implementation, track retry count
        // For now, just log
        console.log(
          `Monitor Agent: Failed job ${job.id} - ${job.errorMessage}`
        );
        
        // Could implement retry logic here
        // await this.retryJob(job.id);
        // retriedCount++;
      }

      // Get and log status
      const status = await this.getAgentStatus();
      console.log("Monitor Agent: System Status", {
        queued: status.queuedJobs,
        running: status.runningJobs,
        failed: status.failedJobs,
        completed: status.scansCompleted,
      });

      // Check for system health issues
      if (status.failedJobs > 10) {
        console.warn(
          "Monitor Agent: HIGH FAILURE RATE - Manual intervention may be required"
        );
      }

      if (status.runningJobs > 5) {
        console.warn(
          "Monitor Agent: HIGH CONCURRENT JOBS - May need to scale"
        );
      }
    } finally {
      this.isRunning = false;
    }
  }

  async getAgentStatus(): Promise<AgentStatus> {
    const allJobs = await storage.getScanJobs();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const scansToday = allJobs.filter(
      (job) => new Date(job.createdAt) >= today
    ).length;

    const scansCompleted = allJobs.filter(
      (job) => job.status === "completed"
    ).length;

    const scansFailed = allJobs.filter((job) => job.status === "failed").length;

    const queuedJobs = allJobs.filter((job) => job.status === "pending").length;

    const runningJobs = allJobs.filter(
      (job) => job.status === "running"
    ).length;

    const failedJobs = scansFailed;

    // Get most recent job timestamp
    const lastActivity =
      allJobs.length > 0
        ? new Date(
            Math.max(...allJobs.map((j) => new Date(j.createdAt).getTime()))
          )
        : new Date();

    return {
      scansToday,
      scansCompleted,
      scansFailed,
      emailsSent: 0, // Would track in real implementation
      lastActivity,
      queuedJobs,
      runningJobs,
      failedJobs,
    };
  }

  private async retryJob(jobId: string): Promise<void> {
    try {
      console.log(`Monitor Agent: Retrying job ${jobId}`);
      
      // Reset job status
      await storage.updateScanJob(jobId, {
        status: "pending",
        errorMessage: null,
      });
    } catch (error) {
      console.error(`Monitor Agent: Failed to retry job ${jobId}:`, error);
    }
  }

  start(intervalMinutes = 30) {
    console.log(
      `Monitor Agent: Starting with ${intervalMinutes} minute interval`
    );
    
    // Run immediately
    this.monitor().catch((error) =>
      console.error("Monitor Agent: Monitoring failed:", error)
    );

    // Then run on interval
    const intervalMs = intervalMinutes * 60 * 1000;
    setInterval(() => {
      this.monitor().catch((error) =>
        console.error("Monitor Agent: Monitoring failed:", error)
      );
    }, intervalMs);
  }
}

export const monitorAgent = new MonitorAgent();
