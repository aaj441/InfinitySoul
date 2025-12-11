import { storage } from "../db-storage";
import { emailService } from "../services/email-service";

export interface OutreachTask {
  scanJobId: string;
  prospectId?: string;
  prospectEmail: string;
  companyName: string;
  wcagScore: number;
  criticalCount: number;
  pdfUrl: string;
}

export class OutreachAgent {
  private isRunning = false;
  private maxEmailsPerHour = 10;

  async sendOutreach(): Promise<void> {
    if (this.isRunning) {
      console.log("Outreach Agent: Already running, skipping...");
      return;
    }

    this.isRunning = true;
    try {
      console.log("Outreach Agent: Starting outreach cycle...");

      // Get completed scans that need outreach
      const tasks = await this.getPendingOutreach();
      console.log(`Outreach Agent: Found ${tasks.length} pending outreach tasks`);

      if (tasks.length === 0) {
        return;
      }

      // Send emails (limit per hour)
      let sentCount = 0;
      for (const task of tasks.slice(0, this.maxEmailsPerHour)) {
        try {
          const success = await emailService.sendReportEmail(
            task.prospectEmail,
            task.prospectEmail.split("@")[0],
            task.companyName,
            task.wcagScore,
            task.criticalCount,
            task.pdfUrl
          );

          if (success) {
            // Mark as sent (would track this in a real implementation)
            sentCount++;
            console.log(
              `Outreach Agent: Sent report to ${task.prospectEmail}`
            );
          }
        } catch (error) {
          console.error(
            `Outreach Agent: Failed to send to ${task.prospectEmail}:`,
            error
          );
        }
      }

      console.log(`Outreach Agent: Sent ${sentCount} emails`);
    } finally {
      this.isRunning = false;
    }
  }

  private async getPendingOutreach(): Promise<OutreachTask[]> {
    // Get all scan jobs
    const allJobs = await storage.getScanJobs();

    // Filter completed jobs
    const completedJobs = allJobs.filter((job) => job.status === "completed");

    // Get associated prospects and reports
    const tasks: OutreachTask[] = [];
    for (const job of completedJobs) {
      // Get prospect if associated
      if (job.prospectId) {
        const prospect = await storage.getProspect(job.prospectId);
        if (!prospect) continue;

        // Get report
        const reports = await storage.getAuditReports();
        const report = reports.find((r) => r.scanJobId === job.id);
        if (!report || !report.pdfUrl) continue;

        // In real implementation, check if email already sent
        // For now, we'll skip adding to avoid duplicate sends
        // tasks.push({
        //   scanJobId: job.id,
        //   prospectId: prospect.id,
        //   prospectEmail: prospect.hubspotContactId || "prospect@example.com",
        //   companyName: prospect.company,
        //   wcagScore: job.wcagScore,
        //   criticalCount: job.criticalCount,
        //   pdfUrl: report.pdfUrl,
        // });
      }
    }

    return tasks;
  }

  async sendColdOutreach(prospectEmail: string, companyName: string) {
    try {
      const success = await emailService.sendOutreachEmail(
        prospectEmail,
        prospectEmail.split("@")[0],
        companyName
      );
      
      if (success) {
        console.log(`Outreach Agent: Sent cold outreach to ${prospectEmail}`);
      }
      
      return success;
    } catch (error) {
      console.error(
        `Outreach Agent: Failed to send cold outreach to ${prospectEmail}:`,
        error
      );
      return false;
    }
  }

  start(intervalMinutes = 60) {
    console.log(
      `Outreach Agent: Starting with ${intervalMinutes} minute interval`
    );
    
    // Run immediately
    this.sendOutreach().catch((error) =>
      console.error("Outreach Agent: Outreach failed:", error)
    );

    // Then run on interval
    const intervalMs = intervalMinutes * 60 * 1000;
    setInterval(() => {
      this.sendOutreach().catch((error) =>
        console.error("Outreach Agent: Outreach failed:", error)
      );
    }, intervalMs);
  }
}

export const outreachAgent = new OutreachAgent();
