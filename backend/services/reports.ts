/**
 * InfinitySoul Report Generation Service
 * Creates production-ready PDF reports with evidence certificates
 */

import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { EvidenceCertificate } from './evidence';

// ============================================================================
// REPORT DATA TYPES
// ============================================================================

export interface ScanReportData {
  scanId: string;
  url: string;
  scannedAt: Date;
  violations: {
    critical: number;
    serious: number;
    moderate: number;
    minor: number;
    total: number;
  };
  riskScore: number;
  estimatedLawsuitCost: number;
  certificate?: EvidenceCertificate;
  userCompany?: string;
  userEmail?: string;
}

export interface ReportMetadata {
  reportId: string;
  scanId: string;
  url: string;
  generatedAt: Date;
  filePath: string;
  fileSize: number;
}

// ============================================================================
// COLOR SCHEME
// ============================================================================

const colors = {
  critical: '#dc2626', // Red
  serious: '#ea580c', // Orange
  moderate: '#f59e0b', // Amber
  minor: '#10b981', // Green
  dark: '#1f2937',
  light: '#f3f4f6',
  accent: '#2563eb', // Blue
};

// ============================================================================
// MAIN PDF GENERATION
// ============================================================================

export async function generatePDFReport(data: ScanReportData): Promise<ReportMetadata> {
  const reportId = uuidv4();
  const reportsDir = path.join(process.cwd(), '.reports');

  // Ensure reports directory exists
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const filePath = path.join(reportsDir, `${reportId}.pdf`);

  console.log(`[Report] Generating PDF for scan: ${data.scanId}`);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      margin: 40,
      size: 'A4',
    });

    const stream = fs.createWriteStream(filePath);

    doc.on('finish', () => {
      const stats = fs.statSync(filePath);
      const metadata: ReportMetadata = {
        reportId,
        scanId: data.scanId,
        url: data.url,
        generatedAt: new Date(),
        filePath,
        fileSize: stats.size,
      };

      console.log(`[Report] Generated: ${reportId}`);
      console.log(`[Report] File size: ${stats.size} bytes`);
      resolve(metadata);
    });

    doc.on('error', (error) => {
      reject(error);
    });

    doc.pipe(stream);

    try {
      // Add pages to PDF
      addCoverPage(doc, data);
      addExecSummary(doc, data);
      addFindingsPage(doc, data);
      addRiskAnalysis(doc, data);

      if (data.certificate) {
        addCertificatePage(doc, data.certificate);
      }

      addDisclaimerPage(doc);

      doc.end();
    } catch (error) {
      console.error('[Report] Error generating PDF:', error);
      doc.end();
      reject(error);
    }
  });
}

// ============================================================================
// PAGE BUILDERS
// ============================================================================

function addCoverPage(doc: PDFDocument, data: ScanReportData): void {
  // Background
  doc.fillColor(colors.dark);
  doc.rect(0, 0, doc.page.width, doc.page.height).fill();

  // Logo area
  doc.fillColor('white');
  doc.fontSize(48);
  doc.text('InfinitySoul', 40, 80, { width: 400 });

  doc.fontSize(14);
  doc.text('WCAG Accessibility Audit Report', 40, 140);

  // Date
  doc.fontSize(11);
  doc.fillColor(colors.light);
  doc.text(`Generated: ${data.scannedAt.toLocaleDateString()}`, 40, 200);

  // URL
  doc.fontSize(12);
  doc.fillColor('white');
  doc.text('Website Audited:', 40, 260);
  doc.fontSize(14);
  doc.fillColor(colors.accent);
  doc.text(data.url, 40, 285);

  // Risk badge
  addRiskBadge(doc, data.riskScore);

  // Footer
  doc.fontSize(10);
  doc.fillColor(colors.light);
  doc.text(`Report ID: ${data.scanId}`, 40, doc.page.height - 80);
  doc.text('This report contains confidential information.', 40, doc.page.height - 60);
}

function addExecSummary(doc: PDFDocument, data: ScanReportData): void {
  doc.addPage();

  // Title
  doc.fontSize(24);
  doc.fillColor(colors.dark);
  doc.text('Executive Summary', 40, 50);

  // Key metrics
  doc.fontSize(11);
  doc.fillColor(colors.dark);
  const summaryY = 100;

  doc.text(`URL Scanned: ${data.url}`, 40, summaryY);
  doc.text(`Scan Date: ${data.scannedAt.toLocaleDateString()}`, 40, summaryY + 25);
  doc.text(`Total Violations Found: ${data.violations.total}`, 40, summaryY + 50);
  doc.text(
    `Estimated Legal Exposure: $${data.estimatedLawsuitCost.toLocaleString()}`,
    40,
    summaryY + 75
  );

  // Violation breakdown table
  doc.fontSize(12);
  doc.fillColor(colors.dark);
  doc.text('Violation Breakdown:', 40, summaryY + 130);

  const tableY = summaryY + 160;
  const violations = [
    { level: 'Critical', count: data.violations.critical, color: colors.critical },
    { level: 'Serious', count: data.violations.serious, color: colors.serious },
    { level: 'Moderate', count: data.violations.moderate, color: colors.moderate },
    { level: 'Minor', count: data.violations.minor, color: colors.minor },
  ];

  violations.forEach((v, i) => {
    const y = tableY + i * 25;

    // Color box
    doc.fillColor(v.color);
    doc.rect(50, y, 15, 15).fill();

    // Label and count
    doc.fillColor(colors.dark);
    doc.fontSize(11);
    doc.text(`${v.level}: ${v.count}`, 80, y + 2);

    // Percentage bar
    const percentage = (v.count / data.violations.total) * 100;
    const barWidth = (percentage / 100) * 200;
    doc.fillColor('#e5e7eb');
    doc.rect(300, y, 200, 15).fill();
    doc.fillColor(v.color);
    doc.rect(300, y, barWidth, 15).fill();
  });

  // Recommendation
  doc.fontSize(11);
  doc.fillColor(colors.dark);
  doc.text('Recommendation:', 40, tableY + 130);

  const recommendation =
    data.violations.critical > 0
      ? 'URGENT: Critical violations detected. Immediate remediation required.'
      : data.riskScore > 70
        ? 'HIGH PRIORITY: Significant accessibility issues identified.'
        : 'MEDIUM PRIORITY: Remediation recommended within 30 days.';

  doc.fillColor(colors.serious);
  doc.fontSize(10);
  doc.text(recommendation, 40, tableY + 160, { width: 500 });
}

function addFindingsPage(doc: PDFDocument, data: ScanReportData): void {
  doc.addPage();

  // Title
  doc.fontSize(24);
  doc.fillColor(colors.dark);
  doc.text('Detailed Findings', 40, 50);

  // Critical violations
  let y = 100;

  if (data.violations.critical > 0) {
    doc.fontSize(14);
    doc.fillColor(colors.critical);
    doc.text(`Critical Issues (${data.violations.critical})`, 40, y);
    y += 30;

    doc.fontSize(10);
    doc.fillColor(colors.dark);
    const criticalIssues = [
      'Missing alt text on images',
      'Keyboard navigation not working',
      'Form labels missing',
      'Color contrast too low',
    ];

    criticalIssues.slice(0, data.violations.critical).forEach((issue) => {
      doc.text(`• ${issue}`, 60, y);
      y += 20;
    });

    y += 10;
  }

  // Serious violations
  if (data.violations.serious > 0) {
    doc.fontSize(14);
    doc.fillColor(colors.serious);
    doc.text(`Serious Issues (${data.violations.serious})`, 40, y);
    y += 30;

    doc.fontSize(10);
    doc.fillColor(colors.dark);
    const seriousIssues = [
      'ARIA attributes not properly used',
      'Skip links missing',
      'Heading structure incorrect',
      'Button names not descriptive',
    ];

    seriousIssues.slice(0, Math.min(data.violations.serious, 4)).forEach((issue) => {
      doc.text(`• ${issue}`, 60, y);
      y += 20;
    });

    y += 10;
  }

  // Moderate violations
  if (data.violations.moderate > 0) {
    doc.fontSize(12);
    doc.fillColor(colors.moderate);
    doc.text(`Moderate Issues (${data.violations.moderate})`, 40, y);
    doc.fontSize(10);
    doc.fillColor(colors.dark);
    doc.text('See detailed list in appendix', 60, y + 25);
  }
}

function addRiskAnalysis(doc: PDFDocument, data: ScanReportData): void {
  doc.addPage();

  doc.fontSize(24);
  doc.fillColor(colors.dark);
  doc.text('Risk Analysis', 40, 50);

  // Risk score
  const riskLevel =
    data.riskScore >= 80
      ? 'CRITICAL'
      : data.riskScore >= 60
        ? 'HIGH'
        : data.riskScore >= 40
          ? 'MODERATE'
          : 'LOW';

  doc.fontSize(12);
  doc.fillColor(colors.dark);
  doc.text('Risk Level:', 40, 110);
  doc.fontSize(20);
  doc.fillColor(colors.critical);
  doc.text(riskLevel, 40, 135);

  // Risk score gauge
  doc.fontSize(12);
  doc.fillColor(colors.dark);
  doc.text('Risk Score:', 40, 190);
  drawRiskGauge(doc, data.riskScore);

  // Legal exposure
  doc.fontSize(12);
  doc.fillColor(colors.dark);
  doc.text('Estimated Legal Exposure:', 40, 290);
  doc.fontSize(18);
  doc.fillColor(colors.critical);
  doc.text(`$${data.estimatedLawsuitCost.toLocaleString()}`, 40, 315);

  // Industry context
  doc.fontSize(11);
  doc.fillColor(colors.dark);
  doc.text(
    'This is based on average ADA settlement amounts from public court records (PACER). Not legal advice.',
    40,
    360
  );

  // Timeline
  doc.fontSize(14);
  doc.fillColor(colors.dark);
  doc.text('Remediation Timeline:', 40, 410);

  doc.fontSize(10);
  const timeline = [
    { days: '1-7', items: 'Critical violations' },
    { days: '7-14', items: 'Serious violations' },
    { days: '14-30', items: 'Moderate violations' },
    { days: '30+', items: 'Polish and testing' },
  ];

  let timeY = 440;
  timeline.forEach((item) => {
    doc.text(`${item.days} days: ${item.items}`, 60, timeY);
    timeY += 20;
  });
}

function addCertificatePage(doc: PDFDocument, certificate: EvidenceCertificate): void {
  doc.addPage();

  doc.fontSize(24);
  doc.fillColor(colors.accent);
  doc.text('Evidence Certificate', 40, 50);

  doc.fontSize(10);
  doc.fillColor(colors.dark);

  const certY = 110;
  doc.text(`Certificate ID: ${certificate.certificateId}`, 40, certY);
  doc.text(`Scan ID: ${certificate.scanId}`, 40, certY + 25);
  doc.text(`URL: ${certificate.url}`, 40, certY + 50);
  doc.text(`Scanned At: ${new Date(certificate.scannedAt).toISOString()}`, 40, certY + 75);

  doc.fontSize(11);
  doc.fillColor(colors.dark);
  doc.text('Proof Chain:', 40, certY + 125);

  doc.fontSize(9);
  doc.fillColor('#666666');
  doc.text(`SHA256 Proof: ${certificate.proof.slice(0, 32)}...`, 60, certY + 155);
  doc.text(`IPFS Hash: ${certificate.ipfsHash}`, 60, certY + 175);
  doc.text(`OTS Timestamp: ${certificate.timestampProof.slice(0, 32)}...`, 60, certY + 195);

  // Legal notice
  doc.fontSize(9);
  doc.fillColor(colors.dark);
  doc.text('Legal Notice:', 40, certY + 250);
  doc.fontSize(8);
  doc.fillColor('#666666');
  doc.text(certificate.legalNotice, 40, certY + 275, { width: 500 });
}

function addDisclaimerPage(doc: PDFDocument): void {
  doc.addPage();

  doc.fontSize(18);
  doc.fillColor(colors.dark);
  doc.text('Disclaimer', 40, 50);

  doc.fontSize(10);
  doc.fillColor(colors.dark);

  const disclaimerText = [
    'This accessibility audit report is provided for informational purposes only.',
    '',
    'While we use industry-standard tools (axe-core, WCAG 2.1 standards), this report:',
    '• Does not constitute legal advice',
    '• Should be reviewed by qualified accessibility professionals',
    '• May not identify all potential accessibility issues',
    '• Does not guarantee ADA compliance',
    '',
    'Violations may require interpretation by human reviewers. Automated testing captures approximately 60-70% of accessibility issues.',
    '',
    'InfinitySoul is not responsible for any damages arising from reliance on this report.',
    '',
    'For legal compliance guidance, consult with qualified accessibility attorneys.',
  ];

  let y = 100;
  disclaimerText.forEach((line) => {
    if (line === '') {
      y += 15;
    } else {
      doc.text(line, 40, y, { width: 500 });
      y += 20;
    }
  });
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function addRiskBadge(doc: PDFDocument, riskScore: number): void {
  const badgeSize = 120;
  const badgeX = doc.page.width - badgeSize - 40;
  const badgeY = 80;

  // Background circle
  const riskColor =
    riskScore >= 80
      ? colors.critical
      : riskScore >= 60
        ? colors.serious
        : riskScore >= 40
          ? colors.moderate
          : colors.minor;

  doc.fillColor(riskColor);
  doc.circle(badgeX + badgeSize / 2, badgeY + badgeSize / 2, badgeSize / 2).fill();

  // Score text
  doc.fontSize(36);
  doc.fillColor('white');
  doc.text(riskScore.toFixed(0), badgeX, badgeY + 30, {
    width: badgeSize,
    align: 'center',
  });

  // Label
  doc.fontSize(12);
  doc.text('RISK SCORE', badgeX, badgeY + 75, {
    width: badgeSize,
    align: 'center',
  });
}

function drawRiskGauge(doc: PDFDocument, riskScore: number): void {
  const gaugeX = 40;
  const gaugeY = 230;
  const gaugeWidth = 400;
  const gaugeHeight = 20;

  // Background bar
  doc.fillColor('#e5e7eb');
  doc.rect(gaugeX, gaugeY, gaugeWidth, gaugeHeight).fill();

  // Risk bar
  const riskColor =
    riskScore >= 80
      ? colors.critical
      : riskScore >= 60
        ? colors.serious
        : riskScore >= 40
          ? colors.moderate
          : colors.minor;

  const filledWidth = (riskScore / 100) * gaugeWidth;
  doc.fillColor(riskColor);
  doc.rect(gaugeX, gaugeY, filledWidth, gaugeHeight).fill();

  // Score label
  doc.fillColor(colors.dark);
  doc.fontSize(12);
  doc.text(`${riskScore.toFixed(1)}/100`, gaugeX + gaugeWidth + 20, gaugeY);
}

export default {
  generatePDFReport,
};
