import { storage } from "../db-storage";
import { scanOrchestrator } from "../orchestrator";

export interface PlannerConfig {
  maxDailyScans: number;
  prioritizeHighRisk: boolean;
  scanWindowStart: number; // Hour of day (0-23)
  scanWindowEnd: number;
}

export class PlannerAgent {
  private config: PlannerConfig;
  private isRunning = false;

  constructor(config?: Partial<PlannerConfig>) {
    this.config = {
      maxDailyScans: 10,
      prioritizeHighRisk: true,
      scanWindowStart: 8, // 8 AM
      scanWindowEnd: 20, // 8 PM
      ...config,
    };
  }

  async plan(): Promise<void> {
    if (this.isRunning) {
      console.log("Planner Agent: Already running, skipping...");
      return;
    }

    this.isRunning = true;
    try {
      console.log("Planner Agent: Starting planning cycle...");

      // Check if we're in the scan window
      const currentHour = new Date().getHours();
      if (
        currentHour < this.config.scanWindowStart ||
        currentHour >= this.config.scanWindowEnd
      ) {
        console.log(
          `Planner Agent: Outside scan window (${this.config.scanWindowStart}:00 - ${this.config.scanWindowEnd}:00)`
        );
        return;
      }

      // Get prospects that need scanning
      const prospects = await this.getProspectsToScan();
      console.log(
        `Planner Agent: Found ${prospects.length} prospects to scan`
      );

      // Queue scans
      let queuedCount = 0;
      for (const prospect of prospects.slice(0, this.config.maxDailyScans)) {
        try {
          if (prospect.website) {
            await scanOrchestrator.queueAndRunScan(
              prospect.website,
              prospect.company,
              undefined // Don't auto-send email, let outreach agent handle it
            );
            queuedCount++;
          }
        } catch (error) {
          console.error(
            `Planner Agent: Failed to queue scan for ${prospect.company}:`,
            error
          );
        }
      }

      console.log(`Planner Agent: Queued ${queuedCount} scans`);
    } finally {
      this.isRunning = false;
    }
  }

  private async getProspectsToScan() {
    // Get all prospects
    const allProspects = await storage.getProspects();

    // Filter prospects that need scanning
    const needsScanning = allProspects.filter((prospect) => {
      // Has a website
      if (!prospect.website) return false;

      // Not recently scanned (no scan in last 30 days)
      // In a real implementation, we'd check scan history
      return true;
    });

    // Sort by priority if configured
    if (this.config.prioritizeHighRisk) {
      needsScanning.sort((a, b) => {
        const riskOrder = { "high-risk": 0, "medium-risk": 1, "low-risk": 2 };
        return (
          (riskOrder[a.riskLevel as keyof typeof riskOrder] || 3) -
          (riskOrder[b.riskLevel as keyof typeof riskOrder] || 3)
        );
      });
    }

    return needsScanning;
  }

  start(intervalMinutes = 60) {
    console.log(
      `Planner Agent: Starting with ${intervalMinutes} minute interval`
    );
    
    // Run immediately
    this.plan().catch((error) =>
      console.error("Planner Agent: Planning failed:", error)
    );

    // Then run on interval
    const intervalMs = intervalMinutes * 60 * 1000;
    setInterval(() => {
      this.plan().catch((error) =>
        console.error("Planner Agent: Planning failed:", error)
      );
    }, intervalMs);
  }
}

export const plannerAgent = new PlannerAgent();
