/**
 * Analyst: Categorize and score security findings
 * See: docs/STREET_CYBER_SCAN.md
 * 
 * Responsibility: Convert raw scout data into categorized risk issues
 * Does NOT: collect data, format reports, or persist anything
 */

import { ScoutResult, CyberRiskAnalysis, RiskIssue, Severity } from "./types";
import { v4 as uuidv4 } from "uuid";

/**
 * Analyze scout results and produce a risk assessment
 */
export function analyzeScoutResult(result: ScoutResult): CyberRiskAnalysis {
  console.log(`[Analyst] Analyzing scan results for ${result.domain}`);
  
  const issues: RiskIssue[] = [];

  // Check HTTPS availability
  if (!result.httpsReachable) {
    issues.push({
      id: uuidv4(),
      category: "encryption",
      severity: "high",
      title: "HTTPS Not Available",
      description: "The website does not support HTTPS (secure) connections. This means data sent between visitors and your site is not encrypted and could be intercepted.",
      evidenceHint: "HTTPS check failed or returned error",
    });
  } else if (result.httpReachable && result.httpsReachable) {
    // HTTP still enabled - suggest redirect
    issues.push({
      id: uuidv4(),
      category: "configuration",
      severity: "medium",
      title: "HTTP Still Enabled",
      description: "Your site supports both HTTP and HTTPS. You should redirect all HTTP traffic to HTTPS to ensure all connections are secure.",
      evidenceHint: "Both HTTP and HTTPS are reachable",
    });
  }

  // Check security headers
  if (result.httpsReachable) {
    // HSTS (HTTP Strict Transport Security)
    if (!result.securityHeaders['strict-transport-security']) {
      issues.push({
        id: uuidv4(),
        category: "hygiene",
        severity: "medium",
        title: "Missing HSTS Header",
        description: "Strict-Transport-Security header is not set. This header tells browsers to only connect via HTTPS, protecting against downgrade attacks.",
        evidenceHint: "strict-transport-security header missing",
      });
    }

    // X-Frame-Options
    if (!result.securityHeaders['x-frame-options']) {
      issues.push({
        id: uuidv4(),
        category: "hygiene",
        severity: "low",
        title: "Missing X-Frame-Options Header",
        description: "X-Frame-Options header is not set. This makes your site potentially vulnerable to clickjacking attacks.",
        evidenceHint: "x-frame-options header missing",
      });
    }

    // X-Content-Type-Options
    if (!result.securityHeaders['x-content-type-options']) {
      issues.push({
        id: uuidv4(),
        category: "hygiene",
        severity: "low",
        title: "Missing X-Content-Type-Options Header",
        description: "X-Content-Type-Options header is not set. This could allow browsers to misinterpret file types, potentially leading to security issues.",
        evidenceHint: "x-content-type-options header missing",
      });
    }

    // Content Security Policy
    if (!result.securityHeaders['content-security-policy']) {
      issues.push({
        id: uuidv4(),
        category: "configuration",
        severity: "low",
        title: "Missing Content Security Policy",
        description: "Content-Security-Policy header is not set. This policy helps prevent cross-site scripting and other code injection attacks.",
        evidenceHint: "content-security-policy header missing",
      });
    }
  }

  // Check for concerning open ports
  const dangerousPorts = [
    { port: 3389, name: "RDP", severity: "high" as Severity },
    { port: 22, name: "SSH", severity: "medium" as Severity },
    { port: 21, name: "FTP", severity: "medium" as Severity },
    { port: 3306, name: "MySQL", severity: "high" as Severity },
    { port: 5432, name: "PostgreSQL", severity: "high" as Severity },
    { port: 27017, name: "MongoDB", severity: "high" as Severity },
    { port: 25, name: "SMTP", severity: "low" as Severity },
  ];

  dangerousPorts.forEach(({ port, name, severity }) => {
    if (result.openPorts.includes(port)) {
      issues.push({
        id: uuidv4(),
        category: "exposure",
        severity,
        title: `${name} Port Exposed (${port})`,
        description: `Port ${port} (${name}) is publicly accessible. This service should typically not be exposed directly to the internet and should be behind a firewall or VPN.`,
        evidenceHint: `Port ${port} is open`,
      });
    }
  });

  // If no DNS resolution, add critical issue
  if (!result.resolvedIp) {
    issues.push({
      id: uuidv4(),
      category: "other",
      severity: "high",
      title: "DNS Resolution Failed",
      description: "Unable to resolve the domain name to an IP address. This could indicate DNS misconfiguration or the domain may not be properly set up.",
      evidenceHint: "DNS resolution returned no results",
    });
  }

  // Compute overall severity
  const overallSeverity = computeOverallSeverity(issues);

  // Generate summary
  const summary = generateSummary(result.domain, issues, overallSeverity);

  console.log(`[Analyst] Analysis complete: ${issues.length} issues found, overall severity: ${overallSeverity}`);

  return {
    domain: result.domain,
    scannedAt: result.scannedAt,
    overallSeverity,
    issues,
    summary,
  };
}

/**
 * Compute overall severity from individual issues
 * Rules:
 * - Any high severity issue -> overall high
 * - 3+ medium issues -> overall high
 * - Any medium issue -> overall medium
 * - Only low issues -> overall low
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

  if (mediumCount >= 3) {
    return "high";
  }

  if (mediumCount > 0) {
    return "medium";
  }

  return "low";
}

/**
 * Generate a plain-language summary
 */
function generateSummary(domain: string, issues: RiskIssue[], severity: Severity): string {
  if (issues.length === 0) {
    return `${domain} has a clean security profile with no major issues detected.`;
  }

  const highIssues = issues.filter((i) => i.severity === "high").length;
  const mediumIssues = issues.filter((i) => i.severity === "medium").length;
  const lowIssues = issues.filter((i) => i.severity === "low").length;

  let summary = `Security scan of ${domain} found ${issues.length} issue${issues.length === 1 ? '' : 's'}.`;

  if (highIssues > 0) {
    summary += ` ${highIssues} critical issue${highIssues === 1 ? '' : 's'} require immediate attention.`;
  }
  
  if (mediumIssues > 0) {
    summary += ` ${mediumIssues} moderate issue${mediumIssues === 1 ? '' : 's'} should be addressed soon.`;
  }

  if (lowIssues > 0) {
    summary += ` ${lowIssues} minor issue${lowIssues === 1 ? '' : 's'} ${lowIssues === 1 ? 'is' : 'are'} recommended for improvement.`;
  }

  return summary;
}
