/**
 * Analyst: Risk classification and scoring for STREET_CYBER_SCAN
 * See: docs/STREET_CYBER_SCAN.md
 *
 * Transforms raw ScoutResult into structured CyberRiskAnalysis with:
 * - Categorized risk issues
 * - Severity scoring
 * - Overall risk assessment
 */

import { ScoutResult, CyberRiskAnalysis, RiskIssue, Severity, RiskCategory } from "./types";
import { v4 as uuidv4 } from "uuid";
import { CyberScanConfig } from "../../config/cyber";

/**
 * Generate risk issues from scout findings
 */
function generateRiskIssues(result: ScoutResult): RiskIssue[] {
  const issues: RiskIssue[] = [];
  
  // Check 1: HTTPS availability (encryption)
  if (!result.httpsReachable) {
    issues.push({
      id: uuidv4(),
      category: "encryption",
      severity: "high",
      title: "HTTPS Not Available",
      description: "Your website does not support encrypted HTTPS connections, exposing visitor data to interception.",
      evidenceHint: "HTTPS check failed or timed out",
    });
  }
  
  // Check 2: HTTP still exposed (encryption/configuration)
  if (result.httpReachable && result.httpsReachable) {
    // HTTP and HTTPS both work - should redirect HTTP to HTTPS
    const hasHSTS = result.securityHeaders["strict-transport-security"];
    if (!hasHSTS) {
      issues.push({
        id: uuidv4(),
        category: "configuration",
        severity: "medium",
        title: "Insecure HTTP Still Accessible",
        description: "Your site allows unencrypted HTTP connections without forcing upgrade to HTTPS.",
        evidenceHint: "Both HTTP and HTTPS reachable, no HSTS header",
      });
    }
  }
  
  // Check 3: Missing security headers (hygiene/configuration)
  const criticalHeaders = [
    { key: "strict-transport-security", name: "HSTS" },
    { key: "x-frame-options", name: "X-Frame-Options" },
    { key: "x-content-type-options", name: "X-Content-Type-Options" },
    { key: "content-security-policy", name: "Content-Security-Policy" },
  ];
  
  const missingHeaders: string[] = [];
  criticalHeaders.forEach(({ key, name }) => {
    if (!result.securityHeaders[key]) {
      missingHeaders.push(name);
    }
  });
  
  if (missingHeaders.length >= 3) {
    issues.push({
      id: uuidv4(),
      category: "hygiene",
      severity: "medium",
      title: "Missing Security Headers",
      description: `Your server is missing important security headers (${missingHeaders.join(", ")}), leaving you vulnerable to common web attacks.`,
      evidenceHint: `Missing: ${missingHeaders.join(", ")}`,
    });
  } else if (missingHeaders.length > 0) {
    issues.push({
      id: uuidv4(),
      category: "hygiene",
      severity: "low",
      title: "Some Security Headers Missing",
      description: `Your server is missing some security headers (${missingHeaders.join(", ")}) that could improve protection.`,
      evidenceHint: `Missing: ${missingHeaders.join(", ")}`,
    });
  }
  
  // Check 4: Risky open ports (exposure)
  const riskyPorts = [
    { port: 21, name: "FTP", severity: "high" as Severity },
    { port: 23, name: "Telnet", severity: "high" as Severity },
    { port: 3389, name: "RDP", severity: "high" as Severity },
    { port: 5432, name: "PostgreSQL", severity: "medium" as Severity },
    { port: 3306, name: "MySQL", severity: "medium" as Severity },
    { port: 27017, name: "MongoDB", severity: "medium" as Severity },
  ];
  
  riskyPorts.forEach(({ port, name, severity }) => {
    if (result.openPorts.includes(port)) {
      issues.push({
        id: uuidv4(),
        category: "exposure",
        severity,
        title: `${name} Port Exposed (${port})`,
        description: `Port ${port} (${name}) is publicly accessible, which could allow attackers to attempt unauthorized access.`,
        evidenceHint: `Port ${port} is open`,
      });
    }
  });
  
  // Check 5: DNS resolution failure (other)
  if (!result.resolvedIp) {
    issues.push({
      id: uuidv4(),
      category: "other",
      severity: "high",
      title: "Domain Not Resolving",
      description: "Your domain name does not resolve to an IP address, making your website inaccessible.",
      evidenceHint: "DNS lookup failed",
    });
  }
  
  // Check 6: Complete unreachability (exposure/other)
  if (result.resolvedIp && !result.httpReachable && !result.httpsReachable) {
    issues.push({
      id: uuidv4(),
      category: "exposure",
      severity: "medium",
      title: "Website Not Reachable",
      description: "Your domain resolves but no web server responds on standard HTTP/HTTPS ports.",
      evidenceHint: "DNS works but HTTP/HTTPS unreachable",
    });
  }
  
  return issues;
}

/**
 * Compute overall severity from issue list
 * Uses configurable threshold for medium issue escalation
 * 
 * Logic:
 * - Any high severity issue → overall high
 * - N+ medium severity issues → overall high (N from config)
 * - 1 medium severity issue → overall medium
 * - Only low severity issues → overall low
 * - No issues → overall low
 */
function computeOverallSeverity(issues: RiskIssue[]): Severity {
  if (issues.length === 0) {
    return "low";
  }
  
  const highCount = issues.filter((i) => i.severity === "high").length;
  const mediumCount = issues.filter((i) => i.severity === "medium").length;
  
  if (highCount > 0) {
    return "high";
  }
  
  if (mediumCount >= CyberScanConfig.scoring.mediumIssuesForHighSeverity) {
    return "high";
  }
  
  if (mediumCount >= 1) {
    return "medium";
  }
  
  return "low";
}

/**
 * Generate executive summary text
 */
function generateSummary(domain: string, issues: RiskIssue[], severity: Severity): string {
  if (issues.length === 0) {
    return `${domain} has no significant security issues detected. Basic security hygiene appears adequate.`;
  }
  
  const categoryCount = new Set(issues.map((i) => i.category)).size;
  
  if (severity === "high") {
    return `${domain} has ${issues.length} security issue${issues.length > 1 ? "s" : ""} across ${categoryCount} categor${categoryCount > 1 ? "ies" : "y"}, including critical vulnerabilities that should be addressed immediately.`;
  }
  
  if (severity === "medium") {
    return `${domain} has ${issues.length} security issue${issues.length > 1 ? "s" : ""} that should be addressed to improve protection against common threats.`;
  }
  
  return `${domain} has ${issues.length} minor security issue${issues.length > 1 ? "s" : ""} worth addressing as part of ongoing security maintenance.`;
}

/**
 * Main Analyst function: analyze scout results and produce risk analysis
 */
export function analyzeScoutResult(result: ScoutResult): CyberRiskAnalysis {
  const issues = generateRiskIssues(result);
  const overallSeverity = computeOverallSeverity(issues);
  const summary = generateSummary(result.domain, issues, overallSeverity);
  
  return {
    domain: result.domain,
    scannedAt: result.scannedAt,
    overallSeverity,
    issues,
    summary,
  };
}
