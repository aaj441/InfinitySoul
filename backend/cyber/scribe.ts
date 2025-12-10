/**
 * Scribe: Generate human-readable reports
 * See: docs/STREET_CYBER_SCAN.md
 * 
 * Responsibility: Format analysis into Markdown reports for non-technical audiences
 * Does NOT: collect data, analyze, or persist files
 */

import { CyberRiskAnalysis, Severity } from "./types";

/**
 * Render a Markdown report from the analysis
 * Uses plain language suitable for small business owners
 */
export function renderMarkdownReport(analysis: CyberRiskAnalysis): string {
  const { domain, scannedAt, overallSeverity, issues, summary } = analysis;

  const date = scannedAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const time = scannedAt.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  let report = `# Security Report: ${domain}\n\n`;
  report += `**Scan Date:** ${date} at ${time}\n\n`;
  report += `**Overall Risk Level:** ${formatSeverity(overallSeverity)}\n\n`;
  report += `---\n\n`;

  // Summary section
  report += `## Summary\n\n`;
  report += `${summary}\n\n`;
  report += `---\n\n`;

  // Findings section
  if (issues.length > 0) {
    report += `## Findings\n\n`;
    report += `We found ${issues.length} security concern${issues.length === 1 ? '' : 's'} that ${issues.length === 1 ? 'needs' : 'need'} your attention:\n\n`;

    // Group by severity
    const highIssues = issues.filter((i) => i.severity === "high");
    const mediumIssues = issues.filter((i) => i.severity === "medium");
    const lowIssues = issues.filter((i) => i.severity === "low");

    // High severity issues
    if (highIssues.length > 0) {
      report += `### 🔴 Critical Issues (Immediate Action Required)\n\n`;
      highIssues.forEach((issue, index) => {
        report += formatIssue(issue, index + 1);
      });
      report += `\n`;
    }

    // Medium severity issues
    if (mediumIssues.length > 0) {
      report += `### 🟡 Moderate Issues (Address Soon)\n\n`;
      mediumIssues.forEach((issue, index) => {
        report += formatIssue(issue, index + 1);
      });
      report += `\n`;
    }

    // Low severity issues
    if (lowIssues.length > 0) {
      report += `### 🟢 Minor Issues (Recommended Improvements)\n\n`;
      lowIssues.forEach((issue, index) => {
        report += formatIssue(issue, index + 1);
      });
      report += `\n`;
    }

    report += `---\n\n`;
  }

  // Next steps section
  report += `## What You Can Do Next\n\n`;

  if (overallSeverity === "high") {
    report += `Your website has **critical security issues** that need immediate attention. We recommend:\n\n`;
    report += `1. **Contact your web developer or hosting provider** to address the critical issues listed above\n`;
    report += `2. **Consider a professional security audit** to identify and fix all vulnerabilities\n`;
    report += `3. **Implement the recommended security improvements** as soon as possible\n`;
    report += `4. **Set up monitoring** to detect future security issues before they become problems\n\n`;
  } else if (overallSeverity === "medium") {
    report += `Your website has **moderate security concerns** that should be addressed in the near future. We recommend:\n\n`;
    report += `1. **Review the findings** with your web developer or IT team\n`;
    report += `2. **Prioritize implementing the security improvements** listed above\n`;
    report += `3. **Consider regular security scans** to catch issues early\n\n`;
  } else {
    report += `Your website has a relatively good security posture. To maintain and improve it:\n\n`;
    report += `1. **Address the minor issues** listed above when convenient\n`;
    report += `2. **Keep your website and all software up to date** with the latest security patches\n`;
    report += `3. **Run regular security scans** to catch new issues as they arise\n\n`;
  }

  report += `---\n\n`;
  report += `## Need Help?\n\n`;
  report += `If you need assistance addressing any of these issues, we can connect you with trusted security professionals who specialize in small business cybersecurity.\n\n`;
  report += `This scan is provided as a courtesy to help protect your business. For questions or to schedule a follow-up consultation, please reach out.\n\n`;

  return report;
}

/**
 * Format a severity level for display
 */
function formatSeverity(severity: Severity): string {
  switch (severity) {
    case "high":
      return "🔴 **HIGH RISK** - Immediate action recommended";
    case "medium":
      return "🟡 **MEDIUM RISK** - Should be addressed soon";
    case "low":
      return "🟢 **LOW RISK** - Minor improvements suggested";
  }
}

/**
 * Format a single issue for the report
 */
function formatIssue(issue: { title: string; description: string; category: string }, index: number): string {
  let output = `#### ${index}. ${issue.title}\n\n`;
  output += `${issue.description}\n\n`;
  output += `*Category: ${formatCategory(issue.category)}*\n\n`;
  return output;
}

/**
 * Format a category for display
 */
function formatCategory(category: string): string {
  const categoryMap: Record<string, string> = {
    exposure: "Network Exposure",
    configuration: "Configuration",
    encryption: "Encryption & HTTPS",
    hygiene: "Security Headers",
    other: "General",
  };
  return categoryMap[category] || category;
}
