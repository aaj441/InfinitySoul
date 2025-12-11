/**
 * Compact PDF Report Generator
 * Minimal file size (< 1MB), optional full details
 * Fast generation, perfect for Free tier
 */

import PDFDocument from "pdfkit";
import type { ScanJob, ScanResult } from "@shared/schema";
import { createWriteStream } from "fs";
import { mkdir } from "fs/promises";
import { join } from "path";
import { suggestionsGenerator } from "./suggestions-generator";

export interface CompactReportOptions {
  scanJob: ScanJob;
  violations: ScanResult[];
  companyName?: string;
  website: string;
  fullDetails?: boolean; // If true, include all violation details
  includeRemediationRoadmap?: boolean;
}

export class CompactPDFGenerator {
  private readonly outputDir = "attached_assets/reports";

  async generateCompactReport(options: CompactReportOptions): Promise<string> {
    await mkdir(this.outputDir, { recursive: true });

    const filename = `report-${options.scanJob.id}-${options.fullDetails ? "full" : "compact"}.pdf`;
    const filepath = join(this.outputDir, filename);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 40, size: "A4", bufferPages: true });
      const stream = createWriteStream(filepath);

      stream.on("finish", () => {
        resolve(`/${this.outputDir}/${filename}`);
      });

      stream.on("error", reject);
      doc.pipe(stream);

      // INFINITY 8 BRANDED HEADER
      // Add burgundy header bar
      doc.rect(0, 0, doc.page.width, 80).fillAndStroke("#5A1A1A", "#5A1A1A");
      
      // Company branding (logo would go here in production - using text for now)
      doc.fillColor("#FFFFFF").fontSize(24).font("Helvetica-Bold");
      doc.text("INFINITY 8", 40, 25, { continued: false });
      doc.fontSize(10).font("Helvetica");
      doc.text("CONSULTING SERVICES", 40, 52);
      
      // Report title on white background
      doc.fillColor("#2A0A0A").fontSize(20).font("Helvetica-Bold");
      doc.text("WCAG Audit Report", 40, 100, { align: "left" });
      doc.moveDown(0.3);

      if (options.companyName) {
        doc.fontSize(14).font("Helvetica-Bold").text(options.companyName);
      }
      doc.fontSize(10).fillColor("#666666").text(options.website);
      doc.moveDown(1);

      // SUMMARY BOX (compact layout)
      const summaryBoxHeight = 60;
      doc.rect(doc.x, doc.y, doc.page.width - 80, summaryBoxHeight).fillAndStroke("#f0f0f0", "#999");
      const summaryY = doc.y + 10;

      doc.fillColor("#000000").fontSize(16).font("Helvetica-Bold");
      doc.text(options.scanJob.wcagScore.toString(), doc.x + 20, summaryY);
      doc.fontSize(9).font("Helvetica").text("Score", doc.x + 20, summaryY + 20);

      // Violations in compact format
      const colX = doc.x + 80;
      doc.fontSize(11).font("Helvetica-Bold").text("Violations", colX, summaryY);
      doc.fontSize(9).font("Helvetica");
      doc.fillColor("#dc3545").text(`${options.scanJob.criticalCount} Critical`, colX, summaryY + 15);
      doc.fillColor("#fd7e14").text(`${options.scanJob.seriousCount} Serious`, colX + 100, summaryY + 15);
      doc.fillColor("#ffc107").text(`${options.scanJob.moderateCount} Moderate`, colX + 200, summaryY + 15);

      doc.fillColor("#000000");
      doc.moveDown(7);

      // SUGGESTIONS (compact)
      doc.fontSize(12).font("Helvetica-Bold").text("Top Recommendations");
      doc.moveDown(0.5);
      doc.fontSize(9).font("Helvetica");

      const suggestions = suggestionsGenerator.generateSuggestions(
        options.violations as any
      );

      for (const suggestion of suggestions.prioritized.slice(0, 3)) {
        doc.text(`• ${suggestion.title}`);
        doc.fontSize(8).fillColor("#666666").text(`  ${suggestion.action}`);
        doc.fontSize(9).fillColor("#000000");
        doc.moveDown(0.3);
      }

      doc.moveDown(0.5);

      // RISK & TIMELINE (compact)
      const riskLevel =
        options.scanJob.criticalCount > 5
          ? "HIGH"
          : options.scanJob.criticalCount > 0
            ? "MEDIUM"
            : "LOW";
      const riskColor =
        riskLevel === "HIGH" ? "#dc3545" : riskLevel === "MEDIUM" ? "#ffc107" : "#28a745";

      doc.fontSize(11).font("Helvetica-Bold");
      doc.fillColor(riskColor).text(`Legal Risk: ${riskLevel}`);
      doc.fontSize(9).fillColor("#000000");

      const estimatedHours = Math.ceil(options.scanJob.totalViolations * 0.5);
      doc.text(`Est. Fix Time: ${estimatedHours}hrs | Cost: $${estimatedHours * 150}`);

      doc.moveDown(1);

      // FULL DETAILS (only if requested)
      if (options.fullDetails && options.violations.length > 0) {
        doc.addPage();
        doc.fontSize(14).font("Helvetica-Bold").text("Detailed Violations", { underline: true });
        doc.moveDown(0.5);

        for (const violation of options.violations.slice(0, 10)) {
          doc.fontSize(10).font("Helvetica-Bold").text(violation.violationType);
          doc.fontSize(8).fillColor("#666666");
          doc.text(`WCAG ${violation.wcagCriterion} • ${violation.impact}`);
          doc.fontSize(8).fillColor("#000000");
          const desc = violation.description.substring(0, 100) + (violation.description.length > 100 ? "..." : "");
          doc.text(desc);
          doc.moveDown(0.5);
        }
      }

      // REMEDIATION ROADMAP (compact, only if requested)
      if (options.includeRemediationRoadmap) {
        doc.addPage();
        doc.fontSize(14).font("Helvetica-Bold").text("30/60/90 Day Plan");
        doc.moveDown(0.5);

        doc.fontSize(10).font("Helvetica-Bold").text("30 Days:");
        doc.fontSize(9).font("Helvetica").text(`Fix ${options.scanJob.criticalCount} critical issues`);
        doc.moveDown(0.3);

        doc.fontSize(10).font("Helvetica-Bold").text("60 Days:");
        doc.fontSize(9).font("Helvetica").text(`Address ${options.scanJob.seriousCount} serious issues`);
        doc.moveDown(0.3);

        doc.fontSize(10).font("Helvetica-Bold").text("90 Days:");
        doc.fontSize(9).font("Helvetica").text(`Resolve remaining issues and implement monitoring`);
      }

      // FOOTER (compact)
      const pageCount = doc.bufferedPageRange().count;
      for (let i = 0; i < pageCount; i++) {
        doc.switchToPage(i);
        doc.fontSize(8).fillColor("#999999");
        doc.text(
          `Page ${i + 1} of ${pageCount}`,
          doc.page.width / 2 - 20,
          doc.page.height - 20,
          { align: "center" }
        );
      }

      doc.end();
    });
  }
}

export const compactPdfGenerator = new CompactPDFGenerator();
