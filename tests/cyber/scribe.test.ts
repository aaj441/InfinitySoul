/**
 * Tests for Scribe module
 * Verifies Markdown report generation
 */

import { renderMarkdownReport } from "../../backend/cyber/scribe";
import { CyberRiskAnalysis, RiskIssue } from "../../backend/cyber/types";

describe("Scribe - renderMarkdownReport", () => {
  const baseAnalysis: CyberRiskAnalysis = {
    domain: "example.com",
    scannedAt: new Date("2024-01-15T10:00:00Z"),
    overallSeverity: "medium",
    issues: [
      {
        id: "issue-1",
        category: "encryption",
        severity: "medium",
        title: "HTTPS Not Configured",
        description: "Your website does not support encrypted connections.",
        evidenceHint: "HTTPS check failed",
      },
    ],
    summary: "example.com has 1 security issue that should be addressed.",
  };

  test("should include domain in report", () => {
    const markdown = renderMarkdownReport(baseAnalysis);

    expect(markdown).toContain("example.com");
  });

  test("should include overall severity", () => {
    const markdown = renderMarkdownReport(baseAnalysis);

    expect(markdown).toContain("Medium Risk");
  });

  test("should list all issues", () => {
    const markdown = renderMarkdownReport(baseAnalysis);

    expect(markdown).toContain("HTTPS Not Configured");
    expect(markdown).toContain("encrypted connections");
  });

  test("should include summary", () => {
    const markdown = renderMarkdownReport(baseAnalysis);

    expect(markdown).toContain(baseAnalysis.summary);
  });

  test("should include Next Steps section", () => {
    const markdown = renderMarkdownReport(baseAnalysis);

    expect(markdown).toContain("What You Should Do Next");
  });

  test("should format high severity appropriately", () => {
    const highSevAnalysis: CyberRiskAnalysis = {
      ...baseAnalysis,
      overallSeverity: "high",
    };

    const markdown = renderMarkdownReport(highSevAnalysis);

    expect(markdown).toContain("High Risk");
    expect(markdown).toContain("immediate");
  });

  test("should format low severity appropriately", () => {
    const lowSevAnalysis: CyberRiskAnalysis = {
      ...baseAnalysis,
      overallSeverity: "low",
      issues: [],
      summary: "example.com has no significant security issues detected.",
    };

    const markdown = renderMarkdownReport(lowSevAnalysis);

    expect(markdown).toContain("Low Risk");
    expect(markdown).toContain("no significant security issues");
  });

  test("should include technical evidence hints", () => {
    const markdown = renderMarkdownReport(baseAnalysis);

    expect(markdown).toContain("HTTPS check failed");
  });

  test("should include About This Scan section", () => {
    const markdown = renderMarkdownReport(baseAnalysis);

    expect(markdown).toContain("About This Scan");
    expect(markdown).toContain("non-intrusive");
  });

  test("should include scan timestamp", () => {
    const markdown = renderMarkdownReport(baseAnalysis);

    expect(markdown).toContain("January 15, 2024");
  });

  test("should handle multiple issues", () => {
    const multiIssueAnalysis: CyberRiskAnalysis = {
      ...baseAnalysis,
      issues: [
        {
          id: "issue-1",
          category: "encryption",
          severity: "high",
          title: "HTTPS Not Available",
          description: "No encrypted connections.",
        },
        {
          id: "issue-2",
          category: "exposure",
          severity: "high",
          title: "RDP Port Exposed",
          description: "Port 3389 is publicly accessible.",
        },
        {
          id: "issue-3",
          category: "hygiene",
          severity: "low",
          title: "Missing Security Header",
          description: "X-Frame-Options is not set.",
        },
      ],
    };

    const markdown = renderMarkdownReport(multiIssueAnalysis);

    expect(markdown).toContain("HTTPS Not Available");
    expect(markdown).toContain("RDP Port Exposed");
    expect(markdown).toContain("Missing Security Header");
    expect(markdown).toMatch(/###\s+1\./); // Numbered issues
    expect(markdown).toMatch(/###\s+2\./);
    expect(markdown).toMatch(/###\s+3\./);
  });

  test("should be valid Markdown", () => {
    const markdown = renderMarkdownReport(baseAnalysis);

    // Check for Markdown structure
    expect(markdown).toMatch(/^#\s+/m); // Has headers
    expect(markdown).toMatch(/\*\*/); // Has bold text
    expect(markdown).toMatch(/---/); // Has horizontal rules
  });

  test("should not contain jargon in main sections", () => {
    const markdown = renderMarkdownReport(baseAnalysis);

    // Main sections should be plain language
    const mainSections = markdown.split("---")[0];

    // Should use plain language
    expect(mainSections).not.toMatch(/TCP|UDP|ICMP/i);
    expect(mainSections).not.toMatch(/CVE-\d+/);
  });
});
