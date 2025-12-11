import PDFDocument from "pdfkit";
import type { ScanJob, ScanResult } from "@shared/schema";
import { createWriteStream } from "fs";
import { mkdir } from "fs/promises";
import { join } from "path";

export interface QuickWinReportData {
  scanJob: ScanJob;
  topViolations: ScanResult[];
  companyName?: string;
  website: string;
}

export class PDFReportGenerator {
  private readonly outputDir = "attached_assets/reports";

  async generateQuickWinReport(data: QuickWinReportData): Promise<string> {
    // Ensure output directory exists
    await mkdir(this.outputDir, { recursive: true });

    const filename = `quick-win-${data.scanJob.id}.pdf`;
    const filepath = join(this.outputDir, filename);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const stream = createWriteStream(filepath);

      stream.on("finish", () => {
        resolve(`/${this.outputDir}/${filename}`);
      });

      stream.on("error", reject);
      doc.pipe(stream);

      // Header
      doc.fontSize(24).font("Helvetica-Bold").text("WCAG Accessibility Audit", { align: "center" });
      doc.moveDown(0.5);
      doc.fontSize(14).font("Helvetica").fillColor("#666666").text("Quick Win Analysis", { align: "center" });
      doc.moveDown(2);

      // Company info
      if (data.companyName) {
        doc.fontSize(18).fillColor("#000000").text(data.companyName);
        doc.moveDown(0.3);
      }
      doc.fontSize(12).fillColor("#333333").text(data.website);
      doc.moveDown(1.5);

      // Executive Summary Box
      doc.rect(doc.x, doc.y, 495, 120).fillAndStroke("#f8f9fa", "#dee2e6");
      const summaryY = doc.y + 15;
      doc.fillColor("#000000");
      
      // Score
      doc.fontSize(48).font("Helvetica-Bold").text(data.scanJob.wcagScore.toString(), doc.x + 20, summaryY, {
        width: 100,
        align: "center"
      });
      doc.fontSize(12).font("Helvetica").text("WCAG Score", doc.x + 20, summaryY + 55, {
        width: 100,
        align: "center"
      });

      // Violations summary
      const violationsX = doc.x + 140;
      doc.fontSize(14).font("Helvetica-Bold").text("Violations Found", violationsX, summaryY);
      doc.fontSize(11).font("Helvetica").fillColor("#dc3545");
      doc.text(`${data.scanJob.criticalCount} Critical`, violationsX, summaryY + 25);
      doc.fillColor("#fd7e14");
      doc.text(`${data.scanJob.seriousCount} Serious`, violationsX, summaryY + 42);
      doc.fillColor("#ffc107");
      doc.text(`${data.scanJob.moderateCount} Moderate`, violationsX, summaryY + 59);
      doc.fillColor("#6c757d");
      doc.text(`${data.scanJob.minorCount} Minor`, violationsX, summaryY + 76);

      doc.fillColor("#000000");
      doc.moveDown(10);

      // Legal Risk Assessment
      doc.fontSize(16).font("Helvetica-Bold").text("Legal Risk Assessment");
      doc.moveDown(0.5);
      doc.fontSize(11).font("Helvetica");
      
      const riskLevel = data.scanJob.criticalCount > 5 ? "HIGH" : data.scanJob.criticalCount > 0 ? "MEDIUM" : "LOW";
      const riskColor = riskLevel === "HIGH" ? "#dc3545" : riskLevel === "MEDIUM" ? "#ffc107" : "#28a745";
      
      doc.fillColor(riskColor).fontSize(12).font("Helvetica-Bold").text(`Risk Level: ${riskLevel}`);
      doc.moveDown(0.5);
      doc.fillColor("#000000").fontSize(11).font("Helvetica");
      
      if (riskLevel === "HIGH") {
        doc.text("Your website has critical accessibility violations that could result in legal action under the ADA. Recent settlements in similar cases have ranged from $50,000 to $450,000.");
      } else if (riskLevel === "MEDIUM") {
        doc.text("Your website has accessibility issues that increase legal liability. Proactive remediation is recommended to avoid potential lawsuits.");
      } else {
        doc.text("Your website shows good accessibility practices, but some improvements would enhance compliance and user experience.");
      }
      
      doc.moveDown(2);

      // Top 5 Critical Violations
      doc.fontSize(16).font("Helvetica-Bold").text("Top 5 Critical Violations");
      doc.moveDown(1);

      data.topViolations.slice(0, 5).forEach((violation, index) => {
        // Violation box
        const boxY = doc.y;
        doc.rect(doc.x, boxY, 495, 80).stroke("#dee2e6");
        
        // Number badge
        doc.circle(doc.x + 20, boxY + 20, 12).fillAndStroke(riskColor, "#000000");
        doc.fillColor("#ffffff").fontSize(10).font("Helvetica-Bold");
        doc.text((index + 1).toString(), doc.x + 16, boxY + 15);

        // Violation details
        doc.fillColor("#000000").fontSize(12).font("Helvetica-Bold");
        doc.text(violation.violationType, doc.x + 45, boxY + 12, { width: 430 });
        
        doc.fontSize(9).font("Helvetica").fillColor("#666666");
        doc.text(`WCAG ${violation.wcagCriterion} • Level ${violation.wcagLevel}`, doc.x + 45, boxY + 28);
        
        doc.fontSize(10).fillColor("#333333");
        const description = violation.description.length > 150 
          ? violation.description.substring(0, 150) + "..." 
          : violation.description;
        doc.text(description, doc.x + 45, boxY + 42, { width: 430 });

        doc.moveDown(7);
      });

      // Estimated Remediation
      doc.addPage();
      doc.fontSize(16).font("Helvetica-Bold").text("Estimated Remediation");
      doc.moveDown(1);

      const estimatedHours = Math.ceil(data.scanJob.totalViolations * 0.5);
      const estimatedCost = estimatedHours * 150;

      doc.fontSize(11).font("Helvetica");
      doc.text(`Estimated Time: ${estimatedHours} hours`);
      doc.text(`Estimated Cost: $${estimatedCost.toLocaleString()} - $${(estimatedCost * 1.5).toLocaleString()}`);
      doc.moveDown(2);

      // 30/60/90 Day Roadmap
      doc.fontSize(16).font("Helvetica-Bold").text("Recommended Remediation Roadmap");
      doc.moveDown(1);

      doc.fontSize(12).font("Helvetica-Bold").text("30 Days: Critical Violations");
      doc.fontSize(10).font("Helvetica");
      doc.text(`• Fix all ${data.scanJob.criticalCount} critical violations`);
      doc.text("• Implement keyboard navigation fixes");
      doc.text("• Add missing alt text for images");
      doc.moveDown(1);

      doc.fontSize(12).font("Helvetica-Bold").text("60 Days: High-Priority Issues");
      doc.fontSize(10).font("Helvetica");
      doc.text(`• Address ${data.scanJob.seriousCount} serious violations`);
      doc.text("• Improve color contrast ratios");
      doc.text("• Add ARIA labels where needed");
      doc.moveDown(1);

      doc.fontSize(12).font("Helvetica-Bold").text("90 Days: Comprehensive Compliance");
      doc.fontSize(10).font("Helvetica");
      doc.text(`• Resolve remaining ${data.scanJob.moderateCount + data.scanJob.minorCount} violations`);
      doc.text("• Conduct full manual accessibility audit");
      doc.text("• Implement ongoing monitoring system");
      doc.moveDown(3);

      // Next Steps CTA
      doc.rect(doc.x, doc.y, 495, 100).fillAndStroke("#007bff", "#0056b3");
      const ctaY = doc.y + 20;
      
      doc.fillColor("#ffffff").fontSize(18).font("Helvetica-Bold");
      doc.text("Schedule Your Free Consultation", doc.x + 50, ctaY, {
        width: 395,
        align: "center"
      });
      
      doc.fontSize(11).font("Helvetica");
      doc.text("Let's discuss a customized remediation plan for your website", doc.x + 50, ctaY + 35, {
        width: 395,
        align: "center"
      });

      doc.fontSize(10);
      doc.text("Book a 30-minute strategy session:", doc.x + 50, ctaY + 60, {
        width: 395,
        align: "center"
      });

      // Footer
      doc.fillColor("#666666").fontSize(9).font("Helvetica");
      doc.text("WCAG Accessibility Consulting • Powered by AI", 50, doc.page.height - 50, {
        align: "center",
        width: doc.page.width - 100
      });

      doc.end();
    });
  }
}

export const pdfGenerator = new PDFReportGenerator();
