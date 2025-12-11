import { storage } from "../db-storage";
import { wcagScanner } from "../services/wcag-scanner";
import { pdfGenerator } from "../services/pdf-generator";

export class ExecutorAgent {
  private isRunning = false;
  private maxConcurrent = 2;

  async execute(): Promise<void> {
    if (this.isRunning) {
      console.log("Executor Agent: Already running, skipping...");
      return;
    }

    this.isRunning = true;
    try {
      console.log("Executor Agent: Starting execution cycle...");

      // Get pending/running scan jobs
      const allJobs = await storage.getScanJobs();
      const pendingJobs = allJobs.filter(
        (job) => job.status === "pending" || job.status === "running"
      );

      if (pendingJobs.length === 0) {
        console.log("Executor Agent: No pending jobs");
        return;
      }

      console.log(
        `Executor Agent: Processing ${Math.min(pendingJobs.length, this.maxConcurrent)} jobs`
      );

      // Process jobs (limit concurrency)
      const jobsToProcess = pendingJobs.slice(0, this.maxConcurrent);
      await Promise.allSettled(
        jobsToProcess.map((job) => this.processJob(job.id))
      );
    } finally {
      this.isRunning = false;
    }
  }

  private async processJob(jobId: string): Promise<void> {
    try {
      const job = await storage.getScanJob(jobId);
      if (!job) {
        console.error(`Executor Agent: Job ${jobId} not found`);
        return;
      }

      // Skip if already completed or failed
      if (job.status === "completed" || job.status === "failed") {
        return;
      }

      console.log(`Executor Agent: Processing job ${jobId} for ${job.url}`);

      // Mark as running
      await storage.updateScanJob(jobId, {
        status: "running",
        startedAt: new Date(),
      });

      // Run scan - try cloud backends first, fallback to local
      let backendUsed = "unknown";
      let scanResult;
      
      try {
        // Prefer cloud backends for agent scans
        scanResult = await wcagScanner.scanWebsite(job.url);
        backendUsed = "auto-selected";

        // Update job with results
        await storage.updateScanJob(jobId, {
          status: "completed",
          totalViolations: scanResult.totalViolations,
          criticalCount: scanResult.criticalCount,
          seriousCount: scanResult.seriousCount,
          moderateCount: scanResult.moderateCount,
          minorCount: scanResult.minorCount,
          wcagScore: scanResult.wcagScore,
          scanDuration: scanResult.scanDuration,
          completedAt: new Date(),
        });
        
        // Store violations
        for (const violation of scanResult.violations) {
          await storage.createScanResult({
            scanJobId: jobId,
            ...violation,
          });
        }

        // Generate PDF report
        const topViolations = await storage.getScanResultsByScanJob(jobId);
        const sortedViolations = topViolations.sort((a, b) => {
          const severityOrder = {
            critical: 0,
            serious: 1,
            moderate: 2,
            minor: 3,
          };
          return (
            (severityOrder[a.impact as keyof typeof severityOrder] || 4) -
            (severityOrder[b.impact as keyof typeof severityOrder] || 4)
          );
        });

        const updatedJob = await storage.getScanJob(jobId);
        if (updatedJob) {
          const pdfUrl = await pdfGenerator.generateQuickWinReport({
            scanJob: updatedJob,
            topViolations: sortedViolations,
            website: job.url,
          });

          await storage.createAuditReport({
            scanJobId: jobId,
            reportType: "quick-win",
            title: `Accessibility Audit - ${job.url}`,
            executiveSummary: `Found ${scanResult.totalViolations} accessibility violations. WCAG Score: ${scanResult.wcagScore}/100`,
            legalRiskAssessment:
              scanResult.criticalCount > 5
                ? "HIGH"
                : scanResult.criticalCount > 0
                  ? "MEDIUM"
                  : "LOW",
            estimatedCost: `$${((scanResult.totalViolations * 0.5 * 150) / 1000).toFixed(1)}k - $${((scanResult.totalViolations * 0.5 * 150 * 1.5) / 1000).toFixed(1)}k`,
            estimatedTimeline: `${Math.ceil(scanResult.totalViolations * 0.5)} hours`,
            pdfUrl,
          });
        }

        console.log(
          `Executor Agent: Completed job ${jobId} - Score: ${scanResult.wcagScore}`
        );
      } catch (error) {
        console.error(`Executor Agent: Job ${jobId} failed:`, error);
        await storage.updateScanJob(jobId, {
          status: "failed",
          errorMessage:
            error instanceof Error ? error.message : "Unknown error",
          completedAt: new Date(),
        });
      }
    } catch (error) {
      console.error(`Executor Agent: Failed to process job ${jobId}:`, error);
    }
  }

  start(intervalMinutes = 15) {
    console.log(
      `Executor Agent: Starting with ${intervalMinutes} minute interval`
    );
    
    // Run immediately
    this.execute().catch((error) =>
      console.error("Executor Agent: Execution failed:", error)
    );

    // Then run on interval
    const intervalMs = intervalMinutes * 60 * 1000;
    setInterval(() => {
      this.execute().catch((error) =>
        console.error("Executor Agent: Execution failed:", error)
      );
    }, intervalMs);
  }
}

export const executorAgent = new ExecutorAgent();
