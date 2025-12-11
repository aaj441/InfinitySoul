import { storage } from "./db-storage";
import { wcagScanner } from "./services/wcag-scanner";
import { pdfGenerator } from "./services/pdf-generator";
import { emailService } from "./services/email-service";
import { screenshotCapturer } from "./services/screenshot-capturer";
import { compositeGenerator } from "./services/composite-generator";
import type { InsertScanJob } from "@shared/schema";

export class ScanOrchestrator {
  async queueAndRunScan(
    url: string,
    companyName?: string,
    prospectEmail?: string
  ) {
    // Create scan job
    const scanJob = await storage.createScanJob({
      url,
      status: "running",
    });

    // Run scan in background
    this.runScanInBackground(scanJob.id, url, companyName, prospectEmail).catch(
      (error) => console.error("Background scan failed:", error)
    );

    return scanJob;
  }

  private async runScanInBackground(
    scanJobId: string,
    url: string,
    companyName?: string,
    prospectEmail?: string
  ) {
    try {
      // 1. Run WCAG scan
      const scanResult = await wcagScanner.scanWebsite(url);

      // 2. Update scan job with results
      await storage.updateScanJob(scanJobId, {
        status: "completed",
        totalViolations: scanResult.totalViolations,
        criticalCount: scanResult.criticalCount,
        seriousCount: scanResult.seriousCount,
        moderateCount: scanResult.moderateCount,
        minorCount: scanResult.minorCount,
        wcagScore: scanResult.wcagScore,
        scanDuration: scanResult.scanDuration,
        originalHtml: scanResult.originalHtml,
        originalCss: scanResult.originalCss,
        completedAt: new Date(),
      });

      // 3. Store scan results
      for (const violation of scanResult.violations) {
        await storage.createScanResult({
          scanJobId,
          ...violation,
        });
      }

      // 4. Generate PDF report
      const topViolations = await storage.getScanResultsByScanJob(scanJobId);
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

      const updatedScanJob = await storage.getScanJob(scanJobId);
      if (updatedScanJob) {
        const pdfUrl = await pdfGenerator.generateQuickWinReport({
          scanJob: updatedScanJob,
          topViolations: sortedViolations,
          companyName,
          website: url,
        });

        // 5. Create audit report record
        await storage.createAuditReport({
          scanJobId,
          reportType: "quick-win",
          title: `Quick Win Analysis - ${companyName || url}`,
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

        // 6. Send email to prospect if provided
        if (prospectEmail && companyName) {
          await emailService.sendReportEmail(
            prospectEmail,
            prospectEmail.split("@")[0], // Use email prefix as name if not provided
            companyName,
            scanResult.wcagScore,
            scanResult.criticalCount,
            pdfUrl
          );
        }
      }
    } catch (error) {
      console.error(`Scan failed for ${url}:`, error);
      await storage.updateScanJob(scanJobId, {
        status: "failed",
        errorMessage:
          error instanceof Error ? error.message : "Unknown error occurred",
        completedAt: new Date(),
      });
    }
  }

  async sendOutreach(prospectEmail: string, companyName: string) {
    return emailService.sendOutreachEmail(prospectEmail, prospectEmail.split("@")[0], companyName);
  }
}

export const scanOrchestrator = new ScanOrchestrator();
